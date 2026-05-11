type IconProps = { size?: number; className?: string };

const baseProps = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true as const,
});

export function ComposeIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M4 20h4l10-10-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
      <path d="M3 22h18" strokeOpacity="0.4" />
    </svg>
  );
}

export function QueueIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4M16 3v4" />
      <circle cx="8" cy="14.5" r="1" fill="currentColor" stroke="none" />
      <path d="M11 14.5h6" strokeOpacity="0.6" />
    </svg>
  );
}

export function HistoryIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function ConnectionsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M9 2v5" />
      <path d="M15 2v5" />
      <path d="M7 7h10v4a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7Z" />
      <path d="M12 16v6" />
    </svg>
  );
}

export function BillingIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" strokeWidth="2.2" />
      <path d="M6 15h4" strokeOpacity="0.7" />
      <rect x="14" y="14" width="4" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}

export function SettingsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}
