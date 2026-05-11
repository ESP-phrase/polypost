import type { SocialAccount } from "@prisma/client";
import { ProviderError, type PlatformProvider } from "./types";

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name";
const POST_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";
const POST_STATUS_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

const SCOPES = ["user.info.basic", "video.publish", "video.upload"];

export const tiktokProvider: PlatformProvider = {
  id: "tiktok",

  isConfigured() {
    return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
  },

  async startOAuth({ state, redirectUri }) {
    const url = new URL(AUTH_URL);
    url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY ?? "");
    url.searchParams.set("scope", SCOPES.join(","));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    return { url: url.toString(), state };
  },

  async handleCallback({ code, redirectUri }) {
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    if (!tokenRes.ok) {
      throw new ProviderError("tiktok", `Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
    }
    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      open_id?: string;
    };

    const meRes = await fetch(USER_INFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!meRes.ok) {
      throw new ProviderError("tiktok", `Identity lookup failed: ${meRes.status} ${await meRes.text()}`);
    }
    const me = (await meRes.json()) as {
      data: { user: { open_id: string; display_name: string; avatar_url?: string } };
    };
    const u = me.data.user;

    return {
      providerAccountId: u.open_id,
      displayName: u.display_name,
      handle: null,
      avatarUrl: u.avatar_url ?? null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    };
  },

  async refreshToken(account) {
    if (!account.refreshToken) return null;
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
        client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
      }),
    });
    if (!res.ok) throw new ProviderError("tiktok", `Refresh failed: ${res.status} ${await res.text()}`);
    const tokens = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? account.refreshToken,
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    };
  },

  async publish(account, { body, mediaUrls }) {
    if (!account.accessToken) throw new ProviderError("tiktok", "Account is not authorized");
    if (mediaUrls.length === 0) {
      throw new ProviderError(
        "tiktok",
        "TikTok publishing requires a video. Add media to your post before sending to TikTok.",
      );
    }
    const videoUrl = mediaUrls[0]!;
    if (!/\.(mp4|mov|webm)$/i.test(videoUrl)) {
      throw new ProviderError("tiktok", "TikTok accepts video files only (.mp4 / .mov / .webm).");
    }

    // Init upload via PULL_FROM_URL
    const initRes = await fetch(POST_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: body.slice(0, 150),
          privacy_level: "SELF_ONLY", // sandbox default — production needs TikTok review
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl,
        },
      }),
    });
    if (!initRes.ok) {
      throw new ProviderError("tiktok", `Post init failed: ${initRes.status} ${await initRes.text()}`);
    }
    const init = (await initRes.json()) as { data: { publish_id: string } };

    // Poll status (up to 60s)
    const deadline = Date.now() + 60_000;
    let lastStatus = "PROCESSING";
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(POST_STATUS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publish_id: init.data.publish_id }),
      });
      const statusJson = (await statusRes.json()) as { data?: { status?: string; publicaly_available_post_id?: string[]; fail_reason?: string } };
      lastStatus = statusJson.data?.status ?? lastStatus;
      if (lastStatus === "PUBLISH_COMPLETE") {
        return {
          externalPostId: statusJson.data?.publicaly_available_post_id?.[0] ?? init.data.publish_id,
          externalUrl: null,
        };
      }
      if (lastStatus === "FAILED") {
        throw new ProviderError("tiktok", `Publish failed: ${statusJson.data?.fail_reason ?? "unknown"}`);
      }
    }
    throw new ProviderError("tiktok", `Publish timed out (last status: ${lastStatus})`);
  },
};
