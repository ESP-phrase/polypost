/**
 * "polypost" wordmark with a lime period accent.
 * Tight letter-spacing, lowercase, single accent — reads as a brand, not as
 * default Inter from a starter template.
 */
export function Wordmark({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline font-extrabold tracking-tight leading-none ${className}`}
      style={{ fontSize: size, letterSpacing: "-0.035em" }}
    >
      <span>polypost</span>
      <span className="text-[var(--color-accent)]" style={{ marginLeft: "0.04em" }}>.</span>
    </span>
  );
}
