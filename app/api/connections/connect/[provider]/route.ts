import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { ALL_PROVIDERS, PROVIDERS, type ProviderId } from "@/lib/providers";

const SAMPLE_NAMES = ["Aubrey N.", "PolyPost Demo", "Studio Account", "Personal Brand"];

export async function POST(_req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { provider } = await ctx.params;
  if (!ALL_PROVIDERS.includes(provider as ProviderId)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const meta = PROVIDERS[provider as ProviderId];
  const handleSlug = user.email.split("@")[0]?.replace(/[^a-z0-9]/gi, "") ?? "user";
  const handleByProvider: Record<string, string> = {
    twitter: `@${handleSlug}`,
    bluesky: `@${handleSlug}.bsky.social`,
    mastodon: `@${handleSlug}@mastodon.social`,
    threads: `@${handleSlug}`,
    instagram: `@${handleSlug}`,
    linkedin: `linkedin.com/in/${handleSlug}`,
    facebook: `facebook.com/${handleSlug}`,
  };

  const providerAccountId = `sandbox_${provider}_${Math.random().toString(36).slice(2, 10)}`;

  const account = await db.socialAccount.create({
    data: {
      userId: user.id,
      provider,
      providerAccountId,
      displayName: SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)] ?? user.name,
      handle: handleByProvider[provider] ?? null,
      accessToken: `sandbox_token_${providerAccountId}`,
      status: "CONNECTED",
    },
  });

  return NextResponse.json({
    ok: true,
    accountId: account.id,
    note: `Sandbox connection for ${meta.label}. Swap in real OAuth in production.`,
  });
}
