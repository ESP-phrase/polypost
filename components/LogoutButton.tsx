"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className="text-[11px] text-[var(--color-muted-2)] hover:text-[var(--color-text)] transition-colors"
    >
      Sign out
    </button>
  );
}
