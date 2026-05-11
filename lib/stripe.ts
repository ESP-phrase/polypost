import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  return _stripe;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_t, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PLANS = {
  PRO: {
    name: "Pro",
    price: 1900,
    interval: "month",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Unlimited posts",
      "Up to 8 connected accounts",
      "Schedule up to 90 days out",
      "Image + video uploads",
      "Per-platform tailoring",
      "Analytics & insights",
    ],
  },
  TEAM: {
    name: "Team",
    price: 7900,
    interval: "month",
    priceId: process.env.STRIPE_TEAM_PRICE_ID || "",
    features: [
      "Everything in Pro",
      "Unlimited accounts",
      "Up to 5 team seats",
      "Approval workflows",
      "Drafts shared across team",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;
