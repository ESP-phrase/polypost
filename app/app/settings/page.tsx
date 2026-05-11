import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="max-w-[700px] mx-auto px-6 md:px-10 py-10">
      <PageHeader title="Settings" subtitle="Your profile and notification preferences." />

      <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-6 mb-6">
        <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)] mb-4">
          Profile
        </div>
        <ProfileForm initialName={user.name} email={user.email} />
      </div>

      <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-6">
        <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)] mb-3">
          Danger zone
        </div>
        <p className="text-[var(--color-muted)] text-sm mb-4">
          Delete your account and everything in it. This cannot be undone.
        </p>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] text-sm font-bold hover:bg-[var(--color-danger)]/20 transition-colors"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
