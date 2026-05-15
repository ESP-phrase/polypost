import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Wordmark } from "@/components/Wordmark";

export const metadata = { title: "Terms — PolyPost" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)]/60 backdrop-blur sticky top-0 z-40 bg-[var(--color-bg)]/85">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <BrandMark size={28} />
            <Wordmark size={17} />
          </Link>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[var(--color-muted)] text-sm mb-10">Last updated 2026-05-14</p>

        <div className="space-y-6 text-[var(--color-text)]/90 leading-relaxed">
          <Section title="What this is">
            <p>
              PolyPost is a tool that publishes your content to social networks
              you connect. You stay the owner of everything you post.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              You&rsquo;re responsible for what gets posted from your connected
              accounts. Don&rsquo;t use PolyPost to spam, harass, or violate any
              connected platform&rsquo;s terms. We&rsquo;ll suspend accounts
              that abuse this.
            </p>
          </Section>

          <Section title="Platform compliance">
            <p>
              Each connected network (X, Instagram, TikTok, etc.) has its own
              rules. By using PolyPost you agree those rules also apply to
              anything posted through us. We can&rsquo;t override platform
              decisions about your content.
            </p>
          </Section>

          <Section title="Service availability">
            <p>
              We try hard to keep PolyPost online but we don&rsquo;t guarantee
              uptime. If a scheduled post fails — because a platform&rsquo;s API
              is down, or your token expired, or any other reason — we&rsquo;ll
              surface the error in your history but won&rsquo;t be liable for
              downstream consequences.
            </p>
          </Section>

          <Section title="Paid plans">
            <p>
              Subscriptions renew monthly unless cancelled. Cancel any time from{" "}
              <Link href="/app/billing" className="text-[var(--color-accent)] hover:underline">
                /app/billing
              </Link>
              ; you keep access through the end of the current period. No
              refunds for partial months.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms. If we do, we&rsquo;ll email everyone
              with an active account at least 14 days before changes take
              effect.
            </p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
          <Link href="/privacy" className="text-[var(--color-muted)] hover:text-[var(--color-text)] no-underline">
            ← Privacy
          </Link>
          <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-text)] no-underline">
            Back home →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-2 text-[var(--color-text)]">{title}</h2>
      {children}
    </section>
  );
}
