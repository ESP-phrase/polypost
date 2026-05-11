import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";
import { EmptyState, Accent } from "@/components/EmptyState";
import { HistoryIcon, GlobeIcon, BoltIcon, ShieldIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();

  const posts = await db.post.findMany({
    where: {
      userId: user.id,
      status: { in: ["PUBLISHED", "FAILED"] },
    },
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: { targets: { include: { socialAccount: true } } },
  });

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
      <PageHeader
        title="History"
        subtitle="Posts you've shipped. Click any target to see it on its network."
        right={<LinkButton href="/app">+ New post</LinkButton>}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Nothing here yet."
          lines={[
            <>
              Your <Accent>shipped posts</Accent> show up here once you publish.
            </>,
            <>
              Click any target to jump to the live post on its network.
            </>,
          ]}
          ctaHref="/app"
          ctaLabel="Ship your first post"
          benefitsTitle="What history gives you"
          benefits={[
            { icon: GlobeIcon, title: "One archive", body: "Every post you've shipped, across every network, in one feed." },
            { icon: BoltIcon, title: "Quick links", body: "Jump straight to the live post on any platform." },
            { icon: ShieldIcon, title: "Audit trail", body: "Failed targets stay on record so nothing falls through the cracks." },
          ]}
        />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-card-grad border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs mb-3">
                <span
                  className={`rounded px-2 py-0.5 font-bold uppercase tracking-wider border ${
                    p.status === "PUBLISHED"
                      ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent-border)]"
                      : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/30"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-[var(--color-muted)]">
                  {p.publishedAt
                    ? new Date(p.publishedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap mb-4">
                {p.body}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.targets.map((t) => {
                  const meta = PROVIDERS[t.socialAccount.provider as ProviderId];
                  const failed = t.status === "FAILED";
                  return (
                    <a
                      key={t.id}
                      href={t.externalUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 text-xs pl-1 pr-2.5 py-1 rounded-full border ${
                        failed
                          ? "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)]"
                          : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
                      }`}
                      title={t.errorMessage ?? ""}
                    >
                      <SocialLogo provider={t.socialAccount.provider as ProviderId} size={18} variant="chip" rounded={9} />
                      <span>{meta?.label}</span>
                      <span className="text-[var(--color-muted-2)]">·</span>
                      <span>{failed ? "failed" : "live"}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
