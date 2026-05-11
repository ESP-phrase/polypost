import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Composer } from "@/components/dashboard/Composer";
import { PageHeader } from "@/components/PageHeader";
import { LinkButton } from "@/components/Button";
import { EmptyState, Accent } from "@/components/EmptyState";
import { PlugIcon, GlobeIcon, BoltIcon, ShieldIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ComposePage() {
  const user = await requireUser();

  const accounts = await db.socialAccount.findMany({
    where: { userId: user.id, status: "CONNECTED" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
      <PageHeader
        title="Compose"
        subtitle="Write once. Pick where it goes. Schedule or ship now."
        right={
          accounts.length === 0 ? (
            <LinkButton href="/app/connections" variant="secondary" size="sm">
              + Connect an account
            </LinkButton>
          ) : null
        }
      />

      {accounts.length === 0 ? (
        <>
          <EmptyState
            icon={PlugIcon}
            title="You’re almost there!"
            lines={[
              <>
                Connect <Accent>a network</Accent> to start sharing your content.
              </>,
              <>
                <Accent>Polypost</Accent> ships your post to wherever you say.
              </>,
              <>
                It only takes <Accent>60 seconds</Accent> to get started.
              </>,
            ]}
            ctaHref="/app/connections"
            ctaLabel="Connect an account"
            benefitsTitle="Why connect a network?"
            benefits={[
              {
                icon: GlobeIcon,
                title: "Post anywhere",
                body: "Connect your favorite networks to publish your content.",
              },
              {
                icon: BoltIcon,
                title: "Save time",
                body: "Write once and publish everywhere.",
              },
              {
                icon: ShieldIcon,
                title: "Stay secure",
                body: "We never post without your permission.",
              },
            ]}
          />
          <div className="text-center mt-6 text-[var(--color-muted-2)] text-xs">
            <span aria-hidden className="mr-1">?</span>
            Need help?{" "}
            <a href="#" className="text-[var(--color-accent)] hover:underline">
              View our guide ↗
            </a>
          </div>
        </>
      ) : (
        <Composer
          accounts={accounts.map((a) => ({
            id: a.id,
            provider: a.provider,
            displayName: a.displayName,
            handle: a.handle,
          }))}
        />
      )}
    </div>
  );
}
