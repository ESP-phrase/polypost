import Link from "next/link";

type Benefit = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
};

type Props = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  /** Each paragraph rendered as a separate <p>. */
  lines: React.ReactNode[];
  ctaHref: string;
  ctaLabel: string;
  benefits?: Benefit[];
  benefitsTitle?: string;
  footer?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  lines,
  ctaHref,
  ctaLabel,
  benefits,
  benefitsTitle = "Why this matters",
  footer,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-2)]">
      {/* Soft radial backdrop — single moment of atmosphere, not the whole-page gradient soup */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(190, 248, 72, 0.10), transparent 70%)",
        }}
      />
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(190,248,72,1) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative p-8 md:p-14 text-center">
        {/* Glowing icon */}
        <div className="relative inline-block mb-6">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: "rgba(190, 248, 72, 0.35)" }}
          />
          <div className="relative w-20 h-20 rounded-full border border-[var(--color-accent-border)] grid place-items-center bg-[var(--color-bg-2)]">
            <Icon size={34} className="text-[var(--color-accent)]" />
          </div>
          {/* Floating sparkle dots — asymmetric so it doesn't feel auto-generated */}
          <span
            aria-hidden
            className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
          />
          <span
            aria-hidden
            className="absolute bottom-1 -left-3 w-1 h-1 rounded-full bg-[var(--color-accent)]"
          />
          <span
            aria-hidden
            className="absolute -bottom-2 right-2 w-2 h-2 rounded-full bg-[var(--color-accent)]"
            style={{ opacity: 0.5 }}
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">{title}</h2>
        <div className="space-y-1 max-w-md mx-auto mb-8">
          {lines.map((line, i) => (
            <p key={i} className="text-[var(--color-muted)]">
              {line}
            </p>
          ))}
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-lg font-bold bg-[var(--color-accent)] text-black px-6 py-3.5 text-base hover:bg-[var(--color-accent-2)] transition-colors"
        >
          {ctaLabel} <span aria-hidden>→</span>
        </Link>

        {footer && <div className="mt-6 text-[var(--color-muted-2)] text-xs">{footer}</div>}

        {benefits && benefits.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <h3 className="font-bold text-base mb-6 text-[var(--color-text)]">{benefitsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="flex items-start gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-dim)] border border-[var(--color-accent-border)] grid place-items-center shrink-0">
                    <b.icon size={18} className="text-[var(--color-accent)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm mb-1">{b.title}</div>
                    <div className="text-[var(--color-muted)] text-xs leading-relaxed">{b.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Highlight a word inline with the lime accent. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--color-accent)] font-semibold">{children}</span>;
}
