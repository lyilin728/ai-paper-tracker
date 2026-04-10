import { NextRequest, NextResponse } from "next/server";
import { getPapers, getStats } from "@/lib/storage";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get("team") || undefined;
    const days = parseInt(searchParams.get("days") || "7", 10);
    const limit = parseInt(searchParams.get("limit") || "200", 10);
    const search = searchParams.get("search") || undefined;
    const statsOnly = searchParams.get("stats") === "1";

    if (statsOnly) {
      const stats = await getStats();
      return NextResponse.json(stats);
    }

    const papers = await getPapers({
      team,
      days: Math.min(days, 30), // cap at 30 days
      limit: Math.min(limit, 500),
      search,
    });

    return NextResponse.json({ papers, count: papers.length });
  } catch (error) {
    console.error("[api/papers] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
