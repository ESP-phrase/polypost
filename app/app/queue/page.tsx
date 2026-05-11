import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";
import { EmptyState, Accent } from "@/components/EmptyState";
import { CalendarIcon, ClockIcon, PencilIcon, BoltIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const user = await requireUser();

  const posts = await db.post.findMany({
    where: { userId: user.id, status: "SCHEDULED" },
    orderBy: { scheduledAt: "asc" },
    include: { targets: { include: { socialAccount: true } } },
  });

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
      <PageHeader
        title="Queue"
        subtitle={`${posts.length} post${posts.length === 1 ? "" : "s"} scheduled.`}
        right={<LinkButton href="/app">+ New post</LinkButton>}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Nothing scheduled yet"
          lines={[
            <>
              Write a post and pick <Accent>Schedule</Accent> to drop it here.
            </>,
            <>
              Polypost will ship it at the time you set — even while you&rsquo;re asleep.
            </>,
          ]}
          ctaHref="/app"
          ctaLabel="Compose a post"
          benefitsTitle="What scheduling unlocks"
          benefits={[
            { icon: ClockIcon, title: "Pick your moment", body: "Ship at the time your audience is online, not when you wrote it." },
            { icon: PencilIcon, title: "Batch your writing", body: "Draft a week of posts in one sitting; send them on a drip." },
            { icon: BoltIcon, title: "Hands-off delivery", body: "We publish on schedule. No reminders. No babysitting." },
          ]}
        />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-card-grad border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)] rounded px-2 py-0.5 font-bold uppercase tracking-wider">
                      Scheduled
                    </span>
                    <span className="text-[var(--color-muted)]">
                      {p.scheduledAt && formatWhen(p.scheduledAt)}
                    </span>
                  </div>
                  <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {p.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex -space-x-1.5">
                    {p.targets.map((t) => {
                      const meta = PROVIDERS[t.socialAccount.provider as ProviderId];
                      return (
                        <span
                          key={t.id}
                          title={`${meta?.label} · ${t.socialAccount.displayName}`}
                          className="border-2 border-[var(--color-bg-2)] rounded-md inline-flex"
                        >
                          <SocialLogo provider={t.socialAccount.provider as ProviderId} size={26} variant="chip" rounded={6} />
                        </span>
                      );
                    })}
                  </div>
                  <Link href="#" className="text-[var(--color-muted)] hover:text-[var(--color-text)] text-xs">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatWhen(d: Date): string {
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `in ${mins}m · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h · ${d.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
