import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/providers/registry";
import { ensureFreshToken } from "@/lib/providers/refresh";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel: allow up to 60s per cron run

/**
 * Picks up SCHEDULED posts whose `scheduledAt` has passed and publishes them
 * via the same provider pipeline as immediate posts.
 *
 * Auth: Vercel Cron adds `x-vercel-cron: 1` header automatically. For local
 * dev or manual triggers, accept a `?secret=` matching `CRON_SECRET` env.
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const duePosts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    include: { targets: { include: { socialAccount: true } } },
    take: 25, // cap per run so we don't time out
  });

  if (duePosts.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  // Mark in-flight first so a second cron tick doesn't double-publish
  await db.post.updateMany({
    where: { id: { in: duePosts.map((p) => p.id) } },
    data: { status: "PUBLISHING" },
  });

  let succeeded = 0;
  let failed = 0;

  await Promise.all(
    duePosts.map(async (post) => {
      let anyOk = false;
      let anyFail = false;

      await Promise.all(
        post.targets.map(async (target) => {
          let account = target.socialAccount;
          const provider = getProvider(account.provider);
          const isReal = provider && provider.isConfigured();

          try {
            if (isReal) {
              account = await ensureFreshToken(account);
              const result = await provider.publish(account, { body: post.body, mediaUrls: [] });
              await db.postTarget.update({
                where: { id: target.id },
                data: {
                  status: "PUBLISHED",
                  externalPostId: result.externalPostId,
                  externalUrl: result.externalUrl,
                  publishedAt: new Date(),
                },
              });
              anyOk = true;
            } else {
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
              anyOk = true;
            }
          } catch (err) {
            anyFail = true;
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[cron publish ${account.provider}/${account.id}]`, message);
            await db.postTarget.update({
              where: { id: target.id },
              data: { status: "FAILED", errorMessage: message },
            });
          }
        }),
      );

      await db.post.update({
        where: { id: post.id },
        data: {
          status: anyFail && !anyOk ? "FAILED" : "PUBLISHED",
          publishedAt: new Date(),
        },
      });
      if (anyOk) succeeded++;
      if (anyFail && !anyOk) failed++;
    }),
  );

  return NextResponse.json({ ok: true, processed: duePosts.length, succeeded, failed });
}

function authorize(req: Request): boolean {
  const header = req.headers.get("x-vercel-cron");
  if (header) return true;
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;
  return Boolean(expected && secret === expected);
}
