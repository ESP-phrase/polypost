import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/session";
import { getProvider, redirectUriFor } from "@/lib/providers/registry";

export async function GET(_req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", _req.url));

  const { provider } = await ctx.params;
  const impl = getProvider(provider);
  if (!impl) return NextResponse.json({ error: `Unknown provider ${provider}` }, { status: 400 });
  if (!impl.isConfigured()) {
    return NextResponse.json(
      { error: `${provider} is not configured. Set the required env vars and restart.` },
      { status: 412 },
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = redirectUriFor(provider);
  const { url, codeVerifier } = await impl.startOAuth({ userId: user.id, state, redirectUri });

  const jar = await cookies();
  jar.set(`pp_oauth_${provider}`, JSON.stringify({ state, codeVerifier: codeVerifier ?? null, userId: user.id }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return NextResponse.redirect(url);
}
