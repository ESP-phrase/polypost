import type { SocialAccount } from "@prisma/client";
import { db } from "@/lib/db";
import { getProvider } from "./registry";

/**
 * If an account's access token is expired (or about to be), call the provider's
 * `refreshToken()` to get a new one, persist it, and return the refreshed
 * account. If the provider doesn't support refresh or the refresh fails, the
 * account is returned as-is — let the publish call surface the error.
 *
 * Buffer of 60 seconds so we don't race the clock with a publish that's about
 * to fire.
 */
export async function ensureFreshToken(account: SocialAccount): Promise<SocialAccount> {
  if (!account.tokenExpiresAt) return account; // no expiry tracked = nothing to refresh
  const bufferMs = 60_000;
  if (account.tokenExpiresAt.getTime() - Date.now() > bufferMs) return account;

  const provider = getProvider(account.provider);
  if (!provider?.refreshToken) return account;

  try {
    const refreshed = await provider.refreshToken(account);
    if (!refreshed?.accessToken) return account;

    const updated = await db.socialAccount.update({
      where: { id: account.id },
      data: {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken ?? account.refreshToken,
        tokenExpiresAt: refreshed.tokenExpiresAt ?? null,
        status: "CONNECTED",
      },
    });
    return updated;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[refresh ${account.provider}/${account.id}]`, msg);
    // Mark as expired so the user knows to reconnect
    await db.socialAccount.update({
      where: { id: account.id },
      data: { status: "EXPIRED" },
    });
    return account;
  }
}
