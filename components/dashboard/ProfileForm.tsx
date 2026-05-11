"use client";

import { useState } from "react";

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Could not save");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">Email</label>
        <input value={email} disabled className="opacity-60 cursor-not-allowed" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--color-muted)] mb-1.5">Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || name === initialName}
          className="px-5 py-2.5 rounded-lg bg-accent-grad text-black font-bold text-sm glow-accent hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-[var(--color-accent)] text-xs">Saved.</span>}
      </div>
    </form>
  );
}
