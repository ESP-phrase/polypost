"use client";

import { useState } from "react";

type Props =
  | { hasCustomer: true; plan?: never; email?: never; name?: never }
  | { hasCustomer?: false; plan: "PRO" | "TEAM"; email: string; name: string };

export function BillingActions(props: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/customer-portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? "Could not open portal");
        return;
      }
      window.location.href = json.url;
    } finally {
      setBusy(false);
    }
  }

  async function startCheckout(plan: "PRO" | "TEAM", email: string, name: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, name }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error ?? "Checkout failed");
        return;
      }
      window.location.href = json.url;
    } finally {
      setBusy(false);
    }
  }

  if ("hasCustomer" in props && props.hasCustomer) {
    return (
      <button
        onClick={openPortal}
        disabled={busy}
        className="px-5 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-3)] text-sm font-bold disabled:opacity-60"
      >
        {busy ? "Opening…" : "Manage in Stripe"}
      </button>
    );
  }

  const { plan, email, name } = props as Extract<Props, { plan: "PRO" | "TEAM" }>;
  return (
    <>
      <button
        onClick={() => startCheckout(plan, email, name)}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg font-bold px-5 py-2.5 text-sm bg-accent-grad text-black glow-accent hover:brightness-110 transition-all active:scale-[0.985] disabled:opacity-60"
      >
        {busy ? "Working…" : `Upgrade to ${plan === "PRO" ? "Pro" : "Team"} →`}
      </button>
      {error && <p className="text-[var(--color-danger)] text-xs mt-2">{error}</p>}
    </>
  );
}
