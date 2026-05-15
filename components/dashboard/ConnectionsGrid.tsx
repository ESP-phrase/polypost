"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ALL_PROVIDERS, PROVIDERS, type ProviderId } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";

type Account = {
  id: string;
  provider: string;
  displayName: string;
  handle: string | null;
  status: string;
};

export function ConnectionsGrid({
  accounts,
  liveProviders,
}: {
  accounts: Account[];
  liveProviders: Record<string, boolean>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const byProvider = accounts.reduce<Record<string, Account[]>>((acc, a) => {
    (acc[a.provider] ??= []).push(a);
    return acc;
  }, {});

  function connectLive(provider: ProviderId) {
    // Real OAuth: full-page navigation to the provider's authorization URL.
    window.location.href = `/api/auth/oauth/${provider}/start`;
  }

  async function connectSandbox(provider: ProviderId) {
    setBusy(provider);
    try {
      const res = await fetch(`/api/connections/connect/${provider}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Could not connect");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(id: string) {
    if (!confirm("Disconnect this account?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/connections/disconnect/${id}`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Could not disconnect");
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ALL_PROVIDERS.map((id) => {
        const meta = PROVIDERS[id];
        const linked = byProvider[id] ?? [];
        const isLive = liveProviders[id] ?? false;
        const isAvailable = meta.available;
        return (
          <div
            key={id}
            className={`bg-[var(--color-bg-2)] border border-[var(--color-border)] rounded-xl p-5 transition-colors ${
              isAvailable ? "hover:border-[var(--color-border-strong)]" : "opacity-60"
            }`}
          >
            <div className="flex items-start gap-3">
              <SocialLogo provider={id} size={44} variant="chip" rounded={10} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center gap-2 flex-wrap">
                  {meta.label}
                  {!isAvailable ? (
                    <span className="text-[0.55rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]">
                      Coming soon
                    </span>
                  ) : (
                    <span
                      className={`text-[0.55rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        isLive
                          ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)]"
                          : "bg-[var(--color-surface-2)] text-[var(--color-muted-2)] border border-[var(--color-border)]"
                      }`}
                    >
                      {isLive ? "Live" : "Sandbox"}
                    </span>
                  )}
                </div>
                <div className="text-[var(--color-muted)] text-xs">
                  {meta.charLimit?.toLocaleString() ?? "Any length"} chars · media supported
                </div>
              </div>
              {isAvailable ? (
                <button
                  onClick={() => (isLive ? connectLive(id) : connectSandbox(id))}
                  disabled={busy === id || isPending}
                  className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent-border)] hover:bg-[var(--color-accent)] hover:text-black transition-colors disabled:opacity-60"
                >
                  {busy === id ? "Connecting…" : "+ Connect"}
                </button>
              ) : (
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-[var(--color-muted-2)] border border-[var(--color-border)] cursor-not-allowed"
                  title="Publishing to this network is coming soon"
                >
                  Soon
                </span>
              )}
            </div>

            {linked.length > 0 && (
              <div className="mt-4 space-y-2">
                {linked.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]"
                  >
                    <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] glow-accent shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">
                        {a.displayName}
                      </span>
                      {a.handle && (
                        <span className="block text-[var(--color-muted)] text-xs truncate">
                          {a.handle}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => disconnect(a.id)}
                      disabled={busy === a.id || isPending}
                      className="text-[var(--color-muted)] hover:text-[var(--color-danger)] text-xs disabled:opacity-60"
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
