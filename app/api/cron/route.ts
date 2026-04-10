import { NextRequest, NextResponse } from "next/server";
import { fetchAllPapers } from "@/lib/arxiv";
import { storePapers, filterUnnotified, markAsNotified } from "@/lib/storage";
import { notifyNewPapers } from "@/lib/notify";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

const CRON_SECRET = process.env.CRON_SECRET || "";

function isAuthorized(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.warn("[cron] CRON_SECRET not set — endpoint is unprotected!");
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;

  // Also support query param for simple testing
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret === CRON_SECRET) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  console.log("[cron] Starting paper fetch...");

  try {
    // 1. Fetch papers from arXiv for all teams
    const papers = await fetchAllPapers();
    console.log(`[cron] Fetched ${papers.length} papers from arXiv`);

    // 2. Store all papers (upsert)
    await storePapers(papers);
    console.log(`[cron] Stored ${papers.length} papers`);

    // 3. Find papers that haven't been notified yet
    const allIds = papers.map((p) => p.id);
    const unnotifiedIds = await filterUnnotified(allIds);
    const unnotifiedPapers = papers.filter((p) =>
      unnotifiedIds.includes(p.id)
    );
    console.log(`[cron] ${unnotifiedPapers.length} new papers to notify`);

    // 4. Send WeChat notifications for new papers
    if (unnotifiedPapers.length > 0) {
      await notifyNewPapers(unnotifiedPapers);
      await markAsNotified(unnotifiedIds);
      console.log(`[cron] Notified ${unnotifiedPapers.length} papers`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    return NextResponse.json({
      success: true,
      fetched: papers.length,
      newPapers: unnotifiedPapers.length,
      elapsed: `${elapsed}s`,
    });
  } catch (error) {
    console.error("[cron] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Allow GET for easy manual trigger from browser (still requires auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
