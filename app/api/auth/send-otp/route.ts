import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateCode(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.otpToken.updateMany({
      where: { email: emailLower, used: false },
      data: { used: true },
    });

    await db.otpToken.create({
      data: { email: emailLower, code, expiresAt },
    });

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        const { error } = await resend.emails.send({
          from: "PolyPost <onboarding@resend.dev>",
          to: emailLower,
          subject: `Your PolyPost code: ${code}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#000;color:#fff;border-radius:16px;">
              <h1 style="font-size:22px;font-weight:800;margin:0 0 16px;">Your login code</h1>
              <p style="color:rgba(255,255,255,0.5);margin:0 0 28px;font-size:14px;">Enter this in PolyPost. It expires in 10 minutes.</p>
              <div style="background:rgba(190,248,72,0.08);border:1px solid rgba(190,248,72,0.25);border-radius:12px;padding:24px;text-align:center;">
                <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#bef848;font-family:monospace;">${code}</span>
              </div>
            </div>
          `,
        });
        if (error) console.error("Resend error:", error);
      } catch (err) {
        console.error("Resend send failed:", err);
      }
      return NextResponse.json({ ok: true });
    }

    // Dev mode: no Resend key — return code so the UI can display it
    console.log(`[dev otp] ${emailLower} → ${code}`);
    return NextResponse.json({ ok: true, devCode: code });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("send-otp error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
