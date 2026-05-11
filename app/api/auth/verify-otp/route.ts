import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, code } = (await req.json()) as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    const token = await db.otpToken.findFirst({
      where: { email: emailLower, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json({ error: "Code expired or not found. Request a new one." }, { status: 401 });
    }
    if (token.code !== trimmedCode) {
      return NextResponse.json({ error: "Incorrect code." }, { status: 401 });
    }

    await db.otpToken.update({ where: { id: token.id }, data: { used: true } });

    let user = await db.user.findUnique({ where: { email: emailLower } });
    const isNew = !user;
    if (!user) {
      const name = emailLower.split("@")[0];
      user = await db.user.create({ data: { email: emailLower, name } });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      isNew,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
