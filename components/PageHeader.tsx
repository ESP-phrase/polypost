export function PageHeader({
  title,
  subtitle,
  right,
  sparkle = true,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  sparkle?: boolean;
}) {
  return (
    <header className="flex items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          {title}
          {sparkle && (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="text-[var(--color-accent)] -mt-1"
            >
              <path
                d="M12 3.5l1.6 4.4 4.4 1.6-4.4 1.6L12 15.5l-1.6-4.4-4.4-1.6 4.4-1.6L12 3.5z"
                fill="currentColor"
              />
              <circle cx="19" cy="5" r="0.9" fill="currentColor" />
              <circle cx="5.5" cy="18" r="0.7" fill="currentColor" />
            </svg>
          )}
        </h1>
        {subtitle && <p className="text-[var(--color-muted)] text-sm mt-1.5">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
