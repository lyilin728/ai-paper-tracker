export interface Paper {
  id: string; // arXiv ID, e.g. "2404.12345"
  title: string;
  authors: string[];
  abstract: string;
  publishedAt: string; // ISO date string
  updatedAt: string;
  url: string; // https://arxiv.org/abs/...
  pdfUrl: string;
  team: string; // team key from teams.ts
  categories: string[]; // e.g. ["cs.LG", "cs.CL"]
  notified: boolean;
}

import xml2js from "xml2js";
import { TEAMS, Team } from "./teams";

const ARXIV_API = "https://export.arxiv.org/api/query";
const HOURS_BACK = 48; // look back window

function buildQuery(team: Team): string {
  const parts: string[] = [];

  // keyword search in abstract/title
  for (const kw of team.keywords) {
    parts.push(`abs:"${kw}"`);
    parts.push(`ti:"${kw}"`);
  }

  // affiliation search
  for (const aff of team.affiliations) {
    parts.push(`au:"${aff}"`);
  }

  return parts.join(" OR ");
}

function parsePaperEntry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entry: any,
  teamKey: string
): Paper | null {
  try {
    const id: string = entry["id"][0].replace("http://arxiv.org/abs/", "").replace("https://arxiv.org/abs/", "");
    const title: string = entry["title"][0].replace(/\s+/g, " ").trim();
    const abstract: string = entry["summary"][0].replace(/\s+/g, " ").trim();
    const publishedAt: string = entry["published"][0];
    const updatedAt: string = entry["updated"][0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authors: string[] = (entry["author"] || []).map((a: any) =>
      typeof a === "string" ? a : a["name"][0]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categories: string[] = (entry["category"] || []).map((c: any) =>
      typeof c === "string" ? c : c["$"]["term"]
    );

    const url = `https://arxiv.org/abs/${id}`;
    const pdfUrl = `https://arxiv.org/pdf/${id}`;

    return {
      id,
      title,
      authors,
      abstract,
      publishedAt,
      updatedAt,
      url,
      pdfUrl,
      team: teamKey,
      categories,
      notified: false,
    };
  } catch {
    return null;
  }
}

function isWithinWindow(publishedAt: string): boolean {
  const pubDate = new Date(publishedAt);
  const cutoff = new Date(Date.now() - HOURS_BACK * 60 * 60 * 1000);
  return pubDate >= cutoff;
}

export async function fetchPapersForTeam(team: Team): Promise<Paper[]> {
  const query = buildQuery(team);
  const params = new URLSearchParams({
    search_query: query,
    start: "0",
    max_results: "50",
    sortBy: "submittedDate",
    sortOrder: "descending",
  });

  const url = `${ARXIV_API}?${params.toString()}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "AI-Paper-Tracker/1.0 (academic research tool)" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`arXiv API error: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const parsed = await xml2js.parseStringPromise(xml, {
    explicitArray: true,
    ignoreAttrs: false,
  });

  const feed = parsed["feed"];
  if (!feed || !feed["entry"]) {
    return [];
  }

  const papers: Paper[] = [];
  for (const entry of feed["entry"]) {
    const paper = parsePaperEntry(entry, team.key);
    if (paper && isWithinWindow(paper.publishedAt)) {
      papers.push(paper);
    }
  }

  return papers;
}

export async function fetchAllPapers(): Promise<Paper[]> {
  const results = await Promise.allSettled(
    TEAMS.map((team) => fetchPapersForTeam(team))
  );

  const papers: Paper[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const paper of result.value) {
        if (!seenIds.has(paper.id)) {
          seenIds.add(paper.id);
          papers.push(paper);
        }
      }
    }
  }

  // Sort by publishedAt descending
  papers.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return papers;
}
