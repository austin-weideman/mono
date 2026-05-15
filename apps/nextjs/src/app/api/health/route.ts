import { sql } from "@mono/db";
import { db } from "@mono/db/client";

import { env } from "~/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const sha = env.VERCEL_GIT_COMMIT_SHA ?? null;

  try {
    await db.execute(sql`SELECT 1`);
  } catch (error) {
    return Response.json(
      {
        sha,
        db: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  return Response.json({ sha, db: "ok" });
}
