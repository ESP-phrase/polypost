import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Wordmark } from "@/components/Wordmark";

export const metadata = { title: "Privacy — PolyPost" };

export default function PrivacyPage() {
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

      <main className="max-w-[720px] mx-auto px-6 py-16 prose-invert">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[var(--color-muted)] text-sm mb-10">Last updated 2026-05-14</p>

        <div className="space-y-6 text-[var(--color-text)]/90 leading-relaxed">
          <Section title="What we collect">
            <p>
              Your email address (used to sign you in), the OAuth access tokens
              for each social network you connect, and the posts you compose,
              schedule, and publish through PolyPost.
            </p>
          </Section>

          <Section title="What we do with it">
            <p>
              We publish your posts to the networks you authorize, on the
              schedule you set, and store a history so you can audit what went
              where. We don&rsquo;t train AI models on your content. We
              don&rsquo;t sell your data.
            </p>
          </Section>

          <Section title="Tokens & access">
            <p>
              When you connect a network, the platform gives us an access token
              scoped to posting on your behalf. You can disconnect any account
              at any time from{" "}
              <Link href="/app/connections" className="text-[var(--color-accent)] hover:underline">
                /app/connections
              </Link>
              ; the token is revoked the same moment.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use one cookie: a session identifier so you stay signed in.
              That&rsquo;s it — no third-party trackers, no ad pixels.
            </p>
          </Section>

          <Section title="Deletion">
            <p>
              Email{" "}
              <a href="mailto:hello@polypost.dev" className="text-[var(--color-accent)] hover:underline">
                hello@polypost.dev
              </a>{" "}
              and we&rsquo;ll delete your account and all associated data within
              7 days.
            </p>
          </Section>
        </div>

        <div className="mt-16 pt-8 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
          <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-text)] no-underline">
            ← Back home
          </Link>
          <Link href="/terms" className="text-[var(--color-muted)] hover:text-[var(--color-text)] no-underline">
            Terms →
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
