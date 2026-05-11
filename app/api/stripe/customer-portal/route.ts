import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const fresh = await db.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!fresh?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription. Subscribe first." },
        { status: 404 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: fresh.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3010"}/app/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Customer portal error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
