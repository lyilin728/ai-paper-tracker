import { Redis } from "@upstash/redis";
import { Paper } from "./arxiv";

// Lazy-initialize Redis client so the module can be imported without env vars
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Redis not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables."
      );
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

const PAPER_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const NOTIFIED_SET_KEY = "notified_paper_ids";
const PAPERS_INDEX_KEY = "papers_index"; // sorted set: score=timestamp, member=paper_id

// ── Write ────────────────────────────────────────────────────────────────────

export async function storePaper(paper: Paper): Promise<void> {
  const redis = getRedis();
  const key = `paper:${paper.id}`;

  await redis.set(key, JSON.stringify(paper), { ex: PAPER_TTL_SECONDS });

  // Add to sorted index (score = unix ms)
  const score = new Date(paper.publishedAt).getTime();
  await redis.zadd(PAPERS_INDEX_KEY, { score, member: paper.id });
}

export async function storePapers(papers: Paper[]): Promise<void> {
  await Promise.all(papers.map(storePaper));
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getPaperById(id: string): Promise<Paper | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`paper:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as Paper);
}

export interface GetPapersOptions {
  team?: string; // filter by team key
  days?: number; // look back N days (default 7)
  limit?: number; // max results (default 200)
  search?: string; // keyword filter
}

export async function getPapers(opts: GetPapersOptions = {}): Promise<Paper[]> {
  const redis = getRedis();
  const { team, days = 7, limit = 200, search } = opts;

  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  // Get IDs from sorted set within time window, most recent first
  // @upstash/redis uses zrange with byScore option (Redis 6.2+ ZRANGE BYSCORE)
  const ids = await redis.zrange(
    PAPERS_INDEX_KEY,
    since,
    "+inf",
    { byScore: true }
  ) as string[];

  // Fetch papers in parallel (up to limit * 2 to allow for filtering)
  const fetchIds = ids.slice(-(limit * 2)).reverse(); // newest first
  const papers = await Promise.all(fetchIds.map(getPaperById));

  let result = papers.filter((p): p is Paper => p !== null);

  // Apply filters
  if (team) {
    result = result.filter((p) => p.team === team);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q))
    );
  }

  return result.slice(0, limit);
}

// ── Notification tracking ────────────────────────────────────────────────────

export async function markAsNotified(paperIds: string[]): Promise<void> {
  if (!paperIds.length) return;
  const redis = getRedis();
  await redis.sadd(NOTIFIED_SET_KEY, ...paperIds as [string, ...string[]]);
}

export async function filterUnnotified(paperIds: string[]): Promise<string[]> {
  if (!paperIds.length) return [];
  const redis = getRedis();

  const results = await Promise.all(
    paperIds.map((id) => redis.sismember(NOTIFIED_SET_KEY, id))
  );

  return paperIds.filter((_, i) => !results[i]);
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<{
  today: number;
  week: number;
  total: number;
}> {
  const redis = getRedis();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [today, week, total] = await Promise.all([
    redis.zcount(PAPERS_INDEX_KEY, todayStart.getTime(), "+inf"),
    redis.zcount(PAPERS_INDEX_KEY, weekStart, "+inf"),
    redis.zcard(PAPERS_INDEX_KEY),
  ]);

  return { today, week, total };
}
