"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PROVIDERS, type ProviderId } from "@/lib/providers";
import { SocialLogo } from "@/components/SocialLogo";

type Account = {
  id: string;
  provider: string;
  displayName: string;
  handle: string | null;
};

type Mode = "now" | "schedule";

export function Composer({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(accounts.map((a) => a.id)));
  const [mode, setMode] = useState<Mode>("now");
  const [scheduledAt, setScheduledAt] = useState<string>(defaultScheduleString());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAccounts = useMemo(
    () => accounts.filter((a) => selectedIds.has(a.id)),
    [accounts, selectedIds],
  );

  const charLimit = useMemo(() => {
    const limits = selectedAccounts
      .map((a) => PROVIDERS[a.provider as ProviderId]?.charLimit ?? Infinity)
      .filter((n) => Number.isFinite(n));
    if (limits.length === 0) return null;
    return Math.min(...limits);
  }, [selectedAccounts]);

  const overLimit = charLimit !== null && body.length > charLimit;
  const tightestProvider = useMemo(() => {
    if (charLimit === null) return null;
    return selectedAccounts
      .map((a) => PROVIDERS[a.provider as ProviderId])
      .filter((p) => p?.charLimit === charLimit)[0];
  }, [charLimit, selectedAccounts]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setError(null);
    if (!body.trim()) {
      setError("Write something first.");
      return;
    }
    if (selectedAccounts.length === 0) {
      setError("Pick at least one account.");
      return;
    }
    if (overLimit) {
      setError(`Over the ${charLimit}-char limit for ${tightestProvider?.label}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          accountIds: Array.from(selectedIds),
          mode,
          scheduledAt: mode === "schedule" ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push(mode === "now" ? "/app/history" : "/app/queue");
      router.refresh();
    } catch {
      setError("Could not reach server.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Composer */}
      <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)]">
            Your post
          </div>
          <div
            className={`text-xs font-mono ${
              overLimit
                ? "text-[var(--color-danger)] font-bold"
                : "text-[var(--color-muted)]"
            }`}
          >
            {body.length}
            {charLimit !== null && ` / ${charLimit}`}
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's worth saying today?"
          className="min-h-[200px] text-base !leading-relaxed"
        />
        {tightestProvider && (
          <p className="text-[var(--color-muted)] text-xs mt-2">
            Limit set by {tightestProvider.label}.
          </p>
        )}

        {/* Schedule */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)] mb-3">
            When
          </div>
          <div className="flex gap-2 mb-4">
            <ModeBtn active={mode === "now"} onClick={() => setMode("now")}>
              Post now
            </ModeBtn>
            <ModeBtn active={mode === "schedule"} onClick={() => setMode("schedule")}>
              Schedule
            </ModeBtn>
          </div>
          {mode === "schedule" && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={defaultScheduleString()}
              className="max-w-xs"
            />
          )}
        </div>

        {error && (
          <p className="mt-4 text-[var(--color-danger)] text-sm bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={submitting || overLimit}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-bold px-6 py-3 text-sm bg-accent-grad text-black glow-accent hover:brightness-110 transition-all active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Working…"
              : mode === "now"
                ? "Publish now →"
                : "Schedule →"}
          </button>
        </div>
      </div>

      {/* Account picker */}
      <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-5 h-fit lg:sticky lg:top-6">
        <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)] mb-3">
          Post to ({selectedIds.size}/{accounts.length})
        </div>
        <div className="space-y-2">
          {accounts.map((a) => {
            const provider = PROVIDERS[a.provider as ProviderId];
            const checked = selectedIds.has(a.id);
            return (
              <label
                key={a.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border ${
                  checked
                    ? "bg-[var(--color-accent-dim)] border-[var(--color-accent-border)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(a.id)}
                  className="!w-auto !p-0 accent-[var(--color-accent)]"
                />
                <SocialLogo provider={a.provider as ProviderId} size={28} variant="chip" rounded={6} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold truncate">{a.displayName}</span>
                  <span className="block text-[var(--color-muted)] text-xs truncate">
                    {provider?.label} {a.handle && `· ${a.handle}`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ModeBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
        active
          ? "bg-[var(--color-accent-dim)] border-[var(--color-accent-border)] text-[var(--color-accent)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function defaultScheduleString(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0);
  d.setMilliseconds(0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
