import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getProvider } from "@/lib/providers/registry";
import { ensureFreshToken } from "@/lib/providers/refresh";

const Body = z.object({
  body: z.string().trim().min(1).max(63206),
  accountIds: z.array(z.string()).min(1),
  mode: z.enum(["now", "schedule"]),
  scheduledAt: z.string().datetime().nullable().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { body, accountIds, mode, scheduledAt } = parsed.data;

  const accounts = await db.socialAccount.findMany({
    where: { id: { in: accountIds }, userId: user.id, status: "CONNECTED" },
  });
  if (accounts.length === 0) {
    return NextResponse.json({ error: "No valid accounts selected." }, { status: 400 });
  }

  if (mode === "schedule") {
    if (!scheduledAt) return NextResponse.json({ error: "Schedule time required." }, { status: 400 });
    const when = new Date(scheduledAt);
    if (when.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Schedule time must be in the future." }, { status: 400 });
    }
  }

  const post = await db.post.create({
    data: {
      userId: user.id,
      body,
      status: mode === "schedule" ? "SCHEDULED" : "PUBLISHING",
      scheduledAt: mode === "schedule" ? new Date(scheduledAt!) : null,
      targets: {
        create: accounts.map((a) => ({
          socialAccountId: a.id,
          status: mode === "schedule" ? "PENDING" : "PUBLISHING",
        })),
      },
    },
    include: { targets: { include: { socialAccount: true } } },
  });

  if (mode === "now") {
    const mediaUrls: string[] = []; // TODO: composer doesn't upload yet
    let anyFailed = false;
    let anySucceeded = false;

    await Promise.all(
      post.targets.map(async (target) => {
        let account = target.socialAccount;
        const provider = getProvider(account.provider);
        const isReal = provider && provider.isConfigured();

        try {
          if (isReal) {
            account = await ensureFreshToken(account);
            const result = await provider.publish(account, { body, mediaUrls });
            await db.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: result.externalPostId,
                externalUrl: result.externalUrl,
                publishedAt: new Date(),
              },
            });
            anySucceeded = true;
          } else {
            // Sandbox stub — same behavior as before
            const externalPostId = `mock_${target.id.slice(0, 8)}_${Date.now()}`;
            await db.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId,
                externalUrl: `https://example.com/p/${externalPostId}`,
                publishedAt: new Date(),
              },
            });
            anySucceeded = true;
          }
        } catch (err) {
          anyFailed = true;
          const message = err instanceof Error ? err.message : String(err);
          console.error(`[publish ${account.provider}/${account.id}]`, message);
          await db.postTarget.update({
            where: { id: target.id },
            data: { status: "FAILED", errorMessage: message },
          });
        }
      }),
    );

    const finalStatus = anyFailed && !anySucceeded ? "FAILED" : "PUBLISHED";
    await db.post.update({
      where: { id: post.id },
      data: { status: finalStatus, publishedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, postId: post.id });
}
