type Props = {
  size?: number;
  className?: string;
  /** Override fill color. Default = lime accent. */
  color?: string;
};

/**
 * PolyPost mark: an asymmetric octopus.
 * Drawn deliberately uneven — different tentacle shapes, slight head tilt — so
 * it reads as "drawn", not as a generated logo template.
 *
 * Single color, no background container, no glow. Use it on top of whatever
 * surface it sits on.
 */
export function BrandMark({ size = 36, className = "", color = "#bef848" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      {/* Head — slightly tilted asymmetric blob, not a perfect ellipse */}
      <path
        d="M 32 5
           C 19 5, 10 14, 10 25
           C 10 31, 13 35, 17 37
           L 17 38
           C 22 39, 27 39, 32 39
           C 38 39, 44 39, 49 37
           L 49 36
           C 53 33, 55 29, 55 24
           C 55 13, 46 5, 32 5 Z"
        fill={color}
      />

      {/* Six visible tentacles — varied curves, no symmetry */}
      <g stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none">
        {/* far-left long curl */}
        <path d="M 15 36 C 10 44, 6 47, 4 53" />
        {/* short stub */}
        <path d="M 21 39 C 20 46, 19 51, 16 56" />
        {/* center long S-curve */}
        <path d="M 28 39 C 28 49, 31 55, 26 60" />
        {/* short kink */}
        <path d="M 36 39 C 36 45, 39 49, 36 53" />
        {/* right S-curve outward */}
        <path d="M 43 38 C 47 44, 53 47, 56 43" />
        {/* far-right hook back to body */}
        <path d="M 49 35 C 56 36, 60 31, 58 25" />
      </g>

      {/* Eyes — black with tiny highlight, slightly off-axis */}
      <circle cx="25.5" cy="22" r="2.6" fill="#000" />
      <circle cx="38.5" cy="21.5" r="2.6" fill="#000" />
      <circle cx="26.3" cy="21.1" r="0.85" fill="#fff" />
      <circle cx="39.3" cy="20.6" r="0.85" fill="#fff" />
    </svg>
  );
}
