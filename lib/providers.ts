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
};

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  twitter:   { id: "twitter",   label: "X",         charLimit: 280,    supportsMedia: true  },
  linkedin:  { id: "linkedin",  label: "LinkedIn",  charLimit: 3000,   supportsMedia: true  },
  instagram: { id: "instagram", label: "Instagram", charLimit: 2200,   supportsMedia: true, requiresMedia: true },
  facebook:  { id: "facebook",  label: "Facebook",  charLimit: 63206,  supportsMedia: true  },
  threads:   { id: "threads",   label: "Threads",   charLimit: 500,    supportsMedia: true  },
  bluesky:   { id: "bluesky",   label: "Bluesky",   charLimit: 300,    supportsMedia: true  },
  mastodon:  { id: "mastodon",  label: "Mastodon",  charLimit: 500,    supportsMedia: true  },
  tiktok:    { id: "tiktok",    label: "TikTok",    charLimit: 2200,   supportsMedia: true, requiresMedia: true },
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
