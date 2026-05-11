import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { BillingActions } from "@/components/dashboard/BillingActions";
import { STRIPE_PLANS, type PlanKey } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser();
  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: {
      plan: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
      stripeCustomerId: true,
    },
  });

  const currentPlan = fresh?.plan ?? "FREE";
  const status = fresh?.subscriptionStatus ?? "INACTIVE";
  const renewsAt = fresh?.currentPeriodEnd
    ? new Date(fresh.currentPeriodEnd).toLocaleDateString()
    : null;

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">
      <PageHeader
        title="Billing"
        subtitle="Manage your plan and payment method."
      />

      <div className="bg-card-grad border border-[var(--color-border)] rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-muted)] mb-1">
              Current plan
            </div>
            <div className="text-2xl font-extrabold flex items-center gap-3">
              {currentPlan}
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                  status === "ACTIVE" || status === "TRIALING"
                    ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border-[var(--color-accent-border)]"
                    : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]"
                }`}
              >
                {status}
              </span>
            </div>
            {renewsAt && (
              <div className="text-[var(--color-muted)] text-xs mt-1">
                Renews {renewsAt}
              </div>
            )}
          </div>
          {fresh?.stripeCustomerId && (
            <BillingActions hasCustomer />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(STRIPE_PLANS) as PlanKey[]).map((key) => {
          const plan = STRIPE_PLANS[key];
          const isCurrent = currentPlan === key;
          return (
            <div
              key={key}
              className={`rounded-2xl p-6 ${
                isCurrent
                  ? "bg-card-grad border-2 border-[var(--color-accent)] glow-accent"
                  : "bg-card-grad border border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-bold text-lg">{plan.name}</div>
                {isCurrent && (
                  <span className="bg-[var(--color-accent)] text-black text-[0.6rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-end gap-1.5 mb-5">
                <div className="text-3xl font-extrabold tracking-tight">
                  ${(plan.price / 100).toFixed(0)}
                </div>
                <div className="text-[var(--color-muted)] text-sm pb-1">
                  / {plan.interval}
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-[var(--color-accent)] shrink-0">✓</span>
                    <span className="text-[var(--color-text)]/90">{f}</span>
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <BillingActions plan={key} email={user.email} name={user.name} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
