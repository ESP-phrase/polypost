import { NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const { email, name, plan } = (await request.json()) as { email?: string; name?: string; plan?: string };

    if (!email || !plan || !["PRO", "TEAM"].includes(plan)) {
      return NextResponse.json({ error: "email and valid plan are required" }, { status: 400 });
    }

    const planConfig = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    if (!planConfig.priceId) {
      return NextResponse.json({ error: `Stripe price ID not configured for ${plan}` }, { status: 500 });
    }

    const user = await ensureUser(email, name);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      ...(process.env.STRIPE_INTRO_COUPON_ID
        ? { discounts: [{ coupon: process.env.STRIPE_INTRO_COUPON_ID }] }
        : {}),
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3010"}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3010"}/app/billing`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
