import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const planByPriceId: Record<string, "PRO" | "TEAM"> = {};
  if (process.env.STRIPE_PRO_PRICE_ID)  planByPriceId[process.env.STRIPE_PRO_PRICE_ID]  = "PRO";
  if (process.env.STRIPE_TEAM_PRICE_ID) planByPriceId[process.env.STRIPE_TEAM_PRICE_ID] = "TEAM";

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;

        const priceId = sub.items.data[0]?.price.id ?? "";
        const plan = planByPriceId[priceId] ?? user.plan;

        const statusMap: Record<string, string> = {
          trialing: "TRIALING",
          active: "ACTIVE",
          past_due: "PAST_DUE",
          canceled: "CANCELED",
          unpaid: "UNPAID",
          incomplete: "INACTIVE",
          incomplete_expired: "INACTIVE",
        };

        await db.user.update({
          where: { id: user.id },
          data: {
            plan: event.type === "customer.subscription.created" ? plan : user.plan,
            subscriptionStatus: statusMap[sub.status] ?? "INACTIVE",
            subscriptionId: sub.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;
        await db.user.update({
          where: { id: user.id },
          data: { plan: "FREE", subscriptionStatus: "INACTIVE", subscriptionId: null },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;
        await db.user.update({ where: { id: user.id }, data: { subscriptionStatus: "ACTIVE" } });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
        if (!user) break;
        await db.user.update({ where: { id: user.id }, data: { subscriptionStatus: "PAST_DUE" } });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
