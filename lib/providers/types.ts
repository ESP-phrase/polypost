import type { SocialAccount } from "@prisma/client";
import type { ProviderId } from "@/lib/providers";

export type OAuthStartResult = {
  url: string;
  state: string;
  codeVerifier?: string;
};

export type OAuthCallbackResult = {
  providerAccountId: string;
  displayName: string;
  handle: string | null;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};

export type PublishInput = {
  body: string;
  mediaUrls: string[];
};

export type PublishResult = {
  externalPostId: string;
  externalUrl: string | null;
};

export type PlatformProvider = {
  id: ProviderId;
  /** True only when env keys are configured. Falsy → fall back to sandbox stub. */
  isConfigured(): boolean;
  /** Build authorization URL + return any verifier we need to remember for callback. */
  startOAuth(opts: { userId: string; state: string; redirectUri: string }): Promise<OAuthStartResult>;
  /** Exchange code → tokens + identity. */
  handleCallback(opts: { code: string; redirectUri: string; codeVerifier?: string }): Promise<OAuthCallbackResult>;
  /** Refresh an expired access token. Optional — return null if not supported. */
  refreshToken?(account: SocialAccount): Promise<Partial<OAuthCallbackResult> | null>;
  /** Publish a post to this account. Throw with a readable message on failure. */
  publish(account: SocialAccount, input: PublishInput): Promise<PublishResult>;
};

export class ProviderError extends Error {
  constructor(
    public readonly providerId: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${providerId}] ${message}`);
    this.name = "ProviderError";
  }
}
