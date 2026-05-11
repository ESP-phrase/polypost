import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:   "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-2)]",
  secondary: "bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-3)]",
  ghost:     "text-[var(--color-muted)] hover:text-[var(--color-text)]",
  danger:    "bg-[var(--color-danger)] text-white hover:brightness-110",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

function classes(variant: Variant, size: Size, full?: boolean): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all active:scale-[0.985] no-underline ${VARIANT[variant]} ${SIZE[size]} ${full ? "w-full" : ""}`;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  full,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <button {...rest} className={`${classes(variant, size, full)} ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  full,
  className = "",
  target,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={`${classes(variant, size, full)} ${className}`}
    >
      {children}
    </Link>
  );
}
