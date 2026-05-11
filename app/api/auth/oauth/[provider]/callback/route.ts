import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getProvider, redirectUriFor } from "@/lib/providers/registry";

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");

  const { provider } = await ctx.params;
  const impl = getProvider(provider);
  if (!impl) return errorRedirect(req, `Unknown provider ${provider}`);

  if (errorParam) {
    return errorRedirect(req, `${errorParam}: ${errorDesc ?? "denied"}`);
  }
  if (!code || !stateParam) {
    return errorRedirect(req, "Missing code or state in callback");
  }

  const jar = await cookies();
  const cookieRaw = jar.get(`pp_oauth_${provider}`)?.value;
  if (!cookieRaw) return errorRedirect(req, "OAuth state cookie missing or expired");

  let stash: { state: string; codeVerifier: string | null; userId: string };
  try {
    stash = JSON.parse(cookieRaw);
  } catch {
    return errorRedirect(req, "OAuth state cookie corrupted");
  }
  if (stash.state !== stateParam) {
    return errorRedirect(req, "State mismatch (possible CSRF)");
  }

  jar.delete(`pp_oauth_${provider}`);

  try {
    const result = await impl.handleCallback({
      code,
      redirectUri: redirectUriFor(provider),
      codeVerifier: stash.codeVerifier ?? undefined,
    });

    await db.socialAccount.upsert({
      where: {
        userId_provider_providerAccountId: {
          userId: stash.userId,
          provider,
          providerAccountId: result.providerAccountId,
        },
      },
      create: {
        userId: stash.userId,
        provider,
        providerAccountId: result.providerAccountId,
        displayName: result.displayName,
        handle: result.handle,
        avatarUrl: result.avatarUrl,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiresAt: result.tokenExpiresAt,
        status: "CONNECTED",
      },
      update: {
        displayName: result.displayName,
        handle: result.handle,
        avatarUrl: result.avatarUrl,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        tokenExpiresAt: result.tokenExpiresAt,
        status: "CONNECTED",
      },
    });

    const dest = new URL("/app/connections", req.url);
    dest.searchParams.set("connected", provider);
    return NextResponse.redirect(dest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[oauth/${provider}/callback]`, msg);
    return errorRedirect(req, msg);
  }
}

function errorRedirect(req: Request, message: string) {
  const dest = new URL("/app/connections", req.url);
  dest.searchParams.set("oauth_error", message);
  return NextResponse.redirect(dest);
}
