import { randomBytes, createHash } from "node:crypto";
import type { SocialAccount } from "@prisma/client";
import { ProviderError, type PlatformProvider } from "./types";

const AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const USERS_ME_URL = "https://api.x.com/2/users/me?user.fields=username,name,profile_image_url";
const TWEETS_URL = "https://api.x.com/2/tweets";
const SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access"];

function pkce(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

function basicAuth(): string {
  const id = process.env.X_CLIENT_ID ?? "";
  const secret = process.env.X_CLIENT_SECRET ?? "";
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

export const twitterProvider: PlatformProvider = {
  id: "twitter",

  isConfigured() {
    return Boolean(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET);
  },

  async startOAuth({ state, redirectUri }) {
    const { codeVerifier, codeChallenge } = pkce();
    const url = new URL(AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", process.env.X_CLIENT_ID ?? "");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", SCOPES.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
    return { url: url.toString(), state, codeVerifier };
  },

  async handleCallback({ code, redirectUri, codeVerifier }) {
    if (!codeVerifier) throw new ProviderError("twitter", "Missing PKCE verifier on callback");

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_id: process.env.X_CLIENT_ID ?? "",
      }),
    });
    if (!tokenRes.ok) {
      throw new ProviderError("twitter", `Token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
    }
    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    const meRes = await fetch(USERS_ME_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!meRes.ok) {
      throw new ProviderError("twitter", `Identity lookup failed: ${meRes.status} ${await meRes.text()}`);
    }
    const me = (await meRes.json()) as {
      data: { id: string; username: string; name: string; profile_image_url?: string };
    };

    return {
      providerAccountId: me.data.id,
      displayName: me.data.name,
      handle: `@${me.data.username}`,
      avatarUrl: me.data.profile_image_url ?? null,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    };
  },

  async refreshToken(account) {
    if (!account.refreshToken) return null;
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuth(),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
        client_id: process.env.X_CLIENT_ID ?? "",
      }),
    });
    if (!res.ok) {
      throw new ProviderError("twitter", `Token refresh failed: ${res.status} ${await res.text()}`);
    }
    const tokens = (await res.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? account.refreshToken,
      tokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    };
  },

  async publish(account, { body }) {
    if (!account.accessToken) throw new ProviderError("twitter", "Account is not authorized");
    if (body.length > 280) throw new ProviderError("twitter", `Body is ${body.length} chars; X limit is 280`);

    const res = await fetch(TWEETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: body }),
    });

    if (!res.ok) {
      throw new ProviderError("twitter", `Tweet failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as { data: { id: string; text: string } };
    const username = (account.handle ?? "").replace(/^@/, "") || "i";
    return {
      externalPostId: json.data.id,
      externalUrl: `https://twitter.com/${username}/status/${json.data.id}`,
    };
  },
};
