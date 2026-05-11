"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Wordmark } from "@/components/Wordmark";
import { LogoutButton } from "@/components/LogoutButton";
import {
  ComposeIcon,
  QueueIcon,
  HistoryIcon,
  ConnectionsIcon,
  BillingIcon,
  SettingsIcon,
} from "@/components/NavIcons";

const NAV: { href: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { href: "/app",             label: "Compose",     Icon: ComposeIcon },
  { href: "/app/queue",       label: "Queue",       Icon: QueueIcon },
  { href: "/app/history",     label: "History",     Icon: HistoryIcon },
  { href: "/app/connections", label: "Connections", Icon: ConnectionsIcon },
  { href: "/app/billing",     label: "Billing",     Icon: BillingIcon },
  { href: "/app/settings",    label: "Settings",    Icon: SettingsIcon },
];

type User = { id: string; name: string; email: string; plan: string };

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // Lock body scroll when drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex">
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[var(--color-bg-2)]/90 backdrop-blur border-b border-[var(--color-border)] flex items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-2">
          <BrandMark size={26} />
          <Wordmark size={16} />
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 grid place-items-center rounded-lg hover:bg-[var(--color-surface)] active:bg-[var(--color-surface-2)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </header>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        className={`
          ${open ? "translate-x-0" : "-translate-x-full"}
          fixed top-0 left-0 z-50 h-screen w-[280px] max-w-[85vw]
          border-r border-[var(--color-border)] bg-[var(--color-bg-2)]
          flex flex-col p-4
          transition-transform duration-200 ease-out
          lg:translate-x-0 lg:w-[240px] lg:sticky lg:z-auto lg:max-w-none
        `}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/app" className="flex items-center gap-2">
            <BrandMark size={28} />
            <Wordmark size={17} />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden w-9 h-9 grid place-items-center rounded-lg hover:bg-[var(--color-surface)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/app" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] font-semibold"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-[var(--color-accent)] grid place-items-center text-sm font-black text-black">
              {user.name[0]?.toUpperCase()}
            </span>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-[var(--color-muted)] truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-accent)]">
              {user.plan} plan
            </span>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
