import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await ctx.params;

  const account = await db.socialAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.socialAccount.delete({ where: { id: account.id } });
  return NextResponse.json({ ok: true });
}
