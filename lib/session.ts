import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

const COOKIE_NAME = "pp_session";
const COOKIE_MAX_AGE_DAYS = 30;

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, token, expiresAt } });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  jar.delete(COOKIE_NAME);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    // Use a redirect rather than throwing — throwing renders a 500 error page
    // in production. `redirect()` short-circuits the render cleanly.
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user;
}
