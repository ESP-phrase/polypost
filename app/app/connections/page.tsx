import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { ConnectionsGrid } from "@/components/dashboard/ConnectionsGrid";
import { ALL_PROVIDERS } from "@/lib/providers";
import { isProviderLive } from "@/lib/providers/registry";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ oauth_error?: string; connected?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const accounts = await db.socialAccount.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const liveProviders: Record<string, boolean> = {};
  for (const id of ALL_PROVIDERS) liveProviders[id] = isProviderLive(id);

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
      <PageHeader
        title="Connections"
        subtitle="Connect each network you want to post to. We never see your password."
      />

      {params.connected && (
        <div className="mb-5 bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] rounded-lg px-4 py-3 text-[var(--color-accent)] text-sm font-semibold">
          ✓ {params.connected} connected
        </div>
      )}
      {params.oauth_error && (
        <div className="mb-5 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-4 py-3 text-[var(--color-danger)] text-sm">
          OAuth failed: {params.oauth_error}
        </div>
      )}

      <ConnectionsGrid
        accounts={accounts.map((a) => ({
          id: a.id,
          provider: a.provider,
          displayName: a.displayName,
          handle: a.handle,
          status: a.status,
        }))}
        liveProviders={liveProviders}
      />

      <div className="text-[var(--color-muted)] text-xs mt-6 max-w-xl space-y-1">
        <p>
          <span className="text-[var(--color-accent)] font-bold">Live:</span> redirects to the platform&rsquo;s real OAuth.
          {" "}<span className="text-[var(--color-muted-2)]">Sandbox:</span> creates a test account so you can try the flow without registering an app.
        </p>
        <p className="text-[var(--color-muted-2)]">
          Set env vars and restart the dev server to flip a platform from sandbox to live. See <code className="text-[var(--color-text)]">.env.example</code>.
        </p>
      </div>
    </div>
  );
}
