import { twitterProvider } from "./twitter";
import { instagramProvider } from "./instagram";
import { tiktokProvider } from "./tiktok";
import type { PlatformProvider } from "./types";
import type { ProviderId } from "@/lib/providers";

const REAL_PROVIDERS: Partial<Record<ProviderId, PlatformProvider>> = {
  twitter: twitterProvider,
  instagram: instagramProvider,
  tiktok: tiktokProvider,
};

export function getProvider(id: string): PlatformProvider | null {
  return (REAL_PROVIDERS as Record<string, PlatformProvider | undefined>)[id] ?? null;
}

/** Provider exists in REAL_PROVIDERS *and* its env keys are configured. */
export function isProviderLive(id: string): boolean {
  const p = getProvider(id);
  return p ? p.isConfigured() : false;
}

export function redirectUriFor(id: string): string {
  const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3011";
  return `${base}/api/auth/oauth/${id}/callback`;
}
