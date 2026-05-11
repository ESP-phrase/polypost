import type { SocialAccount } from "@prisma/client";
import { ProviderError, type PlatformProvider } from "./types";

// Meta uses Facebook Login + Instagram Graph API. The user signs in with FB,
// grants permissions on a Page, and we discover the linked IG Business account.
const AUTH_URL = "https://www.facebook.com/v21.0/dialog/oauth";
const TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";
const ME_PAGES_URL = "https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}";
const SCOPES = [
  "instagram_basic",
  "instagram_content_publish",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
];

export const instagramProvider: PlatformProvider = {
  id: "instagram",

  isConfigured() {
    return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  },

  async startOAuth({ state, redirectUri }) {
    const url = new URL(AUTH_URL);
    url.searchParams.set("client_id", process.env.META_APP_ID ?? "");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", SCOPES.join(","));
    url.searchParams.set("response_type", "code");
    return { url: url.toString(), state };
  },

  async handleCallback({ code, redirectUri }) {
    const tokenUrl = new URL(TOKEN_URL);
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID ?? "");
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET ?? "");
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl);
    if (!tokenRes.ok) {
      throw new ProviderError("instagram", `Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
    }
    const tokens = (await tokenRes.json()) as { access_token: string; expires_in?: number };

    // Discover Pages the user manages and the IG Business account linked to each.
    const pagesRes = await fetch(ME_PAGES_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!pagesRes.ok) {
      throw new ProviderError("instagram", `Page discovery failed: ${pagesRes.status} ${await pagesRes.text()}`);
    }
    const pages = (await pagesRes.json()) as {
      data: Array<{
        id: string;
        name: string;
        access_token: string;
        instagram_business_account?: {
          id: string;
          username: string;
          name?: string;
          profile_picture_url?: string;
        };
      }>;
    };
    const linked = pages.data.find((p) => p.instagram_business_account);
    if (!linked || !linked.instagram_business_account) {
      throw new ProviderError(
        "instagram",
        "No Instagram Business account is linked to your Facebook Page. Connect one in Meta Business Suite first.",
      );
    }
    const ig = linked.instagram_business_account;
    return {
      providerAccountId: ig.id,
      displayName: ig.name ?? ig.username,
      handle: `@${ig.username}`,
      avatarUrl: ig.profile_picture_url ?? null,
      // Page tokens are long-lived (~60 days) and used for IG publishing.
      accessToken: linked.access_token,
      refreshToken: null,
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    };
  },

  async publish(account, { body, mediaUrls }) {
    if (!account.accessToken) throw new ProviderError("instagram", "Account is not authorized");
    if (mediaUrls.length === 0) {
      throw new ProviderError(
        "instagram",
        "Instagram requires at least one image or video. Text-only posts are not supported by the API.",
      );
    }
    if (body.length > 2200) {
      throw new ProviderError("instagram", `Caption is ${body.length} chars; IG limit is 2,200`);
    }

    // 1. Create media container
    const isVideo = /\.(mp4|mov|webm)$/i.test(mediaUrls[0]!);
    const containerUrl = `https://graph.facebook.com/v21.0/${account.providerAccountId}/media`;
    const containerParams = new URLSearchParams({
      caption: body,
      access_token: account.accessToken,
      ...(isVideo
        ? { media_type: "REELS", video_url: mediaUrls[0]! }
        : { image_url: mediaUrls[0]! }),
    });
    const containerRes = await fetch(`${containerUrl}?${containerParams}`, { method: "POST" });
    if (!containerRes.ok) {
      throw new ProviderError("instagram", `Container create failed: ${containerRes.status} ${await containerRes.text()}`);
    }
    const container = (await containerRes.json()) as { id: string };

    // 2. Poll until container is FINISHED (videos take time)
    if (isVideo) {
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        const statusRes = await fetch(
          `https://graph.facebook.com/v21.0/${container.id}?fields=status_code&access_token=${account.accessToken}`,
        );
        const statusJson = (await statusRes.json()) as { status_code?: string };
        if (statusJson.status_code === "FINISHED") break;
        if (statusJson.status_code === "ERROR") {
          throw new ProviderError("instagram", `Media processing failed: ${JSON.stringify(statusJson)}`);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // 3. Publish container
    const publishUrl = `https://graph.facebook.com/v21.0/${account.providerAccountId}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: container.id,
      access_token: account.accessToken,
    });
    const publishRes = await fetch(`${publishUrl}?${publishParams}`, { method: "POST" });
    if (!publishRes.ok) {
      throw new ProviderError("instagram", `Publish failed: ${publishRes.status} ${await publishRes.text()}`);
    }
    const published = (await publishRes.json()) as { id: string };

    return {
      externalPostId: published.id,
      externalUrl: account.handle ? `https://www.instagram.com/${account.handle.replace(/^@/, "")}/` : null,
    };
  },
};
