import Link from "next/link";
import { LinkButton } from "@/components/Button";
import { BrandMark } from "@/components/BrandMark";
import { Wordmark } from "@/components/Wordmark";
import { HeroMockup } from "@/components/landing/HeroMockup";
import { PROVIDERS, ALL_PROVIDERS } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Nav */}
      <header className="border-b border-[var(--color-border)]/60 backdrop-blur sticky top-0 z-40 bg-[var(--color-bg)]/85">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <BrandMark size={32} />
            <Wordmark size={20} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 ml-6 text-sm text-[var(--color-muted)]">
            <a href="#features" className="hover:text-[var(--color-text)]">Features</a>
            <a href="#platforms" className="hover:text-[var(--color-text)]">Platforms</a>
            <a href="#pricing" className="hover:text-[var(--color-text)]">Pricing</a>
            <a href="#faq" className="hover:text-[var(--color-text)]">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">Sign in</Link>
            <LinkButton href="/login">Start Free</LinkButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 md:pt-12 pb-16 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-1.5 bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)] rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-wider font-bold">
            ✦ Eight arms. One inbox.
          </div>
          <h1 className="text-[2.75rem] sm:text-5xl md:text-[4rem] font-extrabold tracking-tight leading-[1.05] mt-5">
            Write once.
            <br />
            <span className="text-[var(--color-accent)]">Post everywhere.</span>
          </h1>
          <p className="text-[var(--color-muted)] text-base sm:text-lg mt-5 max-w-md">
            Compose a single post, tailor it per network if you want, and ship to X,
            LinkedIn, Instagram, Threads, Bluesky and more — on your schedule.
          </p>
          <div className="flex gap-3 mt-7 flex-wrap">
            <LinkButton href="/login" size="lg">Start free →</LinkButton>
            <LinkButton href="#platforms" variant="secondary" size="lg">See platforms</LinkButton>
          </div>
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-2">
              {["#bef848", "#fbbf24", "#60a5fa", "#a78bfa"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[var(--color-bg)] grid place-items-center text-xs font-black text-black" style={{ background: c }}>
                  {["A", "M", "J", "K"][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 text-[var(--color-warning)] text-sm" aria-label="5 stars">★ ★ ★ ★ ★</div>
              <div className="text-[var(--color-muted)] text-xs">4.9/5 from 600+ creators</div>
            </div>
          </div>
        </div>
        {/* Mockup hides on small screens — its inner sidebar can't shrink below ~700px */}
        <div className="hidden md:block lg:col-span-7 relative">
          <HeroMockup />
        </div>
      </section>

      {/* Platform strip */}
      <section id="platforms" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
        <div className="text-center mb-10">
          <div className="text-[var(--color-accent)] text-[0.7rem] uppercase tracking-wider font-bold mb-2">
            Available today
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Start with X. More networks rolling out weekly.
          </h2>
        </div>

        {/* Available now */}
        <div className="grid grid-cols-1 max-w-md mx-auto mb-10">
          {ALL_PROVIDERS.filter((id) => PROVIDERS[id].available).map((id) => {
            const p = PROVIDERS[id];
            return (
              <div
                key={id}
                className="bg-[var(--color-bg-2)] border-2 border-[var(--color-accent-border)] rounded-xl p-5 flex items-center gap-4 hover:border-[var(--color-accent)] transition-colors"
              >
                <SocialLogo provider={id} size={48} variant="chip" rounded={12} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold flex items-center gap-2">
                    {p.label}
                    <span className="text-[0.55rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
                      Live
                    </span>
                  </div>
                  <div className="text-[var(--color-muted)] text-xs mt-0.5">
                    {p.charLimit?.toLocaleString()} chars · OAuth-authorized · scheduled or instant
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming soon */}
        <div className="text-center mb-5">
          <div className="text-[var(--color-muted-2)] text-[0.7rem] uppercase tracking-wider font-bold">
            Rolling out soon
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 opacity-70">
          {ALL_PROVIDERS.filter((id) => !PROVIDERS[id].available).map((id) => {
            const p = PROVIDERS[id];
            return (
              <div
                key={id}
                className="bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center gap-2.5"
              >
                <SocialLogo provider={id} size={32} variant="chip" rounded={9} />
                <div className="font-semibold text-xs">{p.label}</div>
                <div className="text-[var(--color-muted-2)] text-[0.55rem] uppercase tracking-wider font-bold">
                  Soon
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature band */}
      <section id="features" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-20">
        <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            icon="✍️"
            title="One composer"
            body="Write a post once. Tweak per platform if you need to. Ship in one click."
          />
          <Feature
            icon="📅"
            title="Schedule everything"
            body="Queue posts hours, days, or weeks ahead. Time zones handled automatically."
          />
          <Feature
            icon="🐙"
            title="Eight networks"
            body="X, LinkedIn, Instagram, Facebook, Threads, Bluesky, Mastodon, more soon."
          />
          <Feature
            icon="📊"
            title="Real metrics"
            body="See impressions, engagement, and follower growth in one unified dashboard."
          />
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border)] rounded-2xl overflow-hidden border border-[var(--color-border)]">
          {[
            { v: "2.1M", l: "Posts published" },
            { v: "8", l: "Networks supported" },
            { v: "60s", l: "Setup time" },
            { v: "99.98%", l: "Uptime" },
          ].map((m) => (
            <div key={m.l} className="bg-[var(--color-bg-2)] p-8 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-[var(--color-accent)] tracking-tight">{m.v}</div>
              <div className="text-[var(--color-muted)] text-xs mt-2 uppercase tracking-wider font-semibold">{m.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="text-center mb-12">
          <div className="text-[var(--color-accent)] text-[0.7rem] uppercase tracking-wider font-bold mb-3">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Start free. Scale when you&rsquo;re ready.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
          {[
            { name: "Free",  price: "$0",   cad: "forever",  blurb: "Try it on a single account.",
              features: ["1 connected account", "10 posts / month", "Basic analytics"], cta: "Start Free", featured: false, plan: "FREE" },
            { name: "Pro",   price: "$19",  cad: "/ month",  blurb: "For solo creators and operators.",
              features: ["Up to 8 accounts", "Unlimited posts", "Schedule 90 days out", "Per-platform tailoring", "Image + video uploads"], cta: "Start Pro", featured: true, plan: "PRO" },
            { name: "Team",  price: "$79",  cad: "/ month",  blurb: "Approval flows and shared drafts.",
              features: ["Everything in Pro", "Unlimited accounts", "5 team seats", "Approval workflows", "Priority support"], cta: "Start Team", featured: false, plan: "TEAM" },
          ].map((p) => (
            <div key={p.name} className={`relative rounded-2xl p-7 ${p.featured ? "bg-card-grad border-2 border-[var(--color-accent)] glow-accent" : "bg-card-grad border border-[var(--color-border)]"}`}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-black text-[0.6rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="font-bold text-lg">{p.name}</div>
              <div className="text-[var(--color-muted)] text-sm mt-1">{p.blurb}</div>
              <div className="flex items-end gap-1.5 mt-5">
                <div className="text-4xl font-extrabold tracking-tight">{p.price}</div>
                <div className="text-[var(--color-muted)] text-sm pb-1.5">{p.cad}</div>
              </div>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full bg-[var(--color-accent-dim)] grid place-items-center shrink-0 text-[var(--color-accent)] text-[0.6rem]">✓</span>
                    <span className="text-[var(--color-text)]/90">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <LinkButton href="/login" variant={p.featured ? "primary" : "secondary"} full>
                  {p.cta}
                </LinkButton>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-[900px] mx-auto px-6 md:px-10 pb-28">
        <div className="text-center mb-10">
          <div className="text-[var(--color-accent)] text-[0.7rem] uppercase tracking-wider font-bold mb-3">FAQ</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Common questions</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "Which platforms are supported?", a: "X (Twitter), LinkedIn, Instagram, Facebook, Threads, Bluesky, and Mastodon. More coming." },
            { q: "Can I tailor a post per platform?", a: "Yes. Write your base post, then override per network — different copy, different media, different hashtags." },
            { q: "How does scheduling work?", a: "Pick any time up to 90 days out. Posts ship at the exact minute, in your local time zone." },
            { q: "Is there a free plan?", a: "Yes — one connected account, ten posts a month, no credit card required." },
            { q: "What happens if a post fails?", a: "You'll get notified, see the exact error in the queue, and can retry per platform without re-posting where it succeeded." },
          ].map((f, i) => (
            <details key={i} className="bg-card-grad border border-[var(--color-border)] rounded-xl px-5 py-4 group">
              <summary className="font-bold cursor-pointer flex justify-between items-center list-none">
                {f.q}
                <span className="text-[var(--color-accent)] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-[var(--color-muted)] mt-3 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-accent-border)] bg-card-grad p-10 md:p-16 text-center">
          <div aria-hidden className="absolute inset-0 -z-0" style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(190,248,72,0.15), transparent 70%)" }} />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Stop juggling tabs.
              <br />
              <span className="text-[var(--color-accent)]">Ship your post.</span>
            </h2>
            <p className="text-[var(--color-muted)] text-lg mt-5 max-w-md mx-auto">
              Free to start. No card. Connect your first account in under 60 seconds.
            </p>
            <div className="flex gap-3 mt-8 justify-center flex-wrap">
              <LinkButton href="/login" size="lg">Start Free →</LinkButton>
              <LinkButton href="#pricing" variant="secondary" size="lg">See pricing</LinkButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-6 text-sm text-[var(--color-muted)]">
          <div className="flex items-center gap-2">
            <BrandMark size={24} />
            <Wordmark size={14} />
            <span className="text-[var(--color-muted-2)] ml-2">© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--color-text)] no-underline">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-text)] no-underline">Terms</Link>
            <a href="mailto:hello@polypost.dev" className="hover:text-[var(--color-text)]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-dim)] grid place-items-center shrink-0 text-2xl">
        {icon}
      </div>
      <div>
        <div className="font-bold text-base mb-1">{title}</div>
        <div className="text-[var(--color-muted)] text-sm leading-snug">{body}</div>
      </div>
    </div>
  );
}
