export type ProviderId =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "tiktok";

export type ProviderMeta = {
  id: ProviderId;
  label: string;
  charLimit?: number;
  supportsMedia: boolean;
  /** Whether this platform requires media (image or video) — text-only is rejected. */
  requiresMedia?: boolean;
  /**
   * True if PolyPost can actually publish to this platform today (real provider
   * implementation + production-tested). Networks set to false are visible on
   * the landing page as "coming soon" and the Connect button shows that state.
   */
  available: boolean;
};

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  twitter:   { id: "twitter",   label: "X",         charLimit: 280,    supportsMedia: true,  available: true  },
  linkedin:  { id: "linkedin",  label: "LinkedIn",  charLimit: 3000,   supportsMedia: true,  available: false },
  instagram: { id: "instagram", label: "Instagram", charLimit: 2200,   supportsMedia: true,  requiresMedia: true, available: false },
  facebook:  { id: "facebook",  label: "Facebook",  charLimit: 63206,  supportsMedia: true,  available: false },
  threads:   { id: "threads",   label: "Threads",   charLimit: 500,    supportsMedia: true,  available: false },
  bluesky:   { id: "bluesky",   label: "Bluesky",   charLimit: 300,    supportsMedia: true,  available: false },
  mastodon:  { id: "mastodon",  label: "Mastodon",  charLimit: 500,    supportsMedia: true,  available: false },
  tiktok:    { id: "tiktok",    label: "TikTok",    charLimit: 2200,   supportsMedia: true,  requiresMedia: true, available: false },
};

export const ALL_PROVIDERS: ProviderId[] = [
  "twitter",
  "linkedin",
  "instagram",
  "facebook",
  "threads",
  "bluesky",
  "mastodon",
  "tiktok",
];

/** Just the platforms PolyPost can actually publish to today. */
export const AVAILABLE_PROVIDERS: ProviderId[] = ALL_PROVIDERS.filter((id) => PROVIDERS[id].available);
