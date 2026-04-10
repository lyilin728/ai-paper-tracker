"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Paper } from "@/lib/arxiv";
import { PaperCard } from "@/components/PaperCard";
import { TeamFilter } from "@/components/TeamFilter";
import { SearchBar } from "@/components/SearchBar";
import { StatsBar } from "@/components/StatsBar";

interface Stats {
  today: number;
  week: number;
  total: number;
}

const DAYS_OPTIONS = [
  { label: "24 小时", value: 1 },
  { label: "7 天", value: 7 },
  { label: "14 天", value: 14 },
  { label: "30 天", value: 30 },
];

export default function HomePage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [days, setDays] = useState(7);

  // Fetch papers from API
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        days: days.toString(),
        limit: "500",
      });

      const [papersRes, statsRes] = await Promise.all([
        fetch(`/api/papers?${params}`),
        fetch(`/api/papers?stats=1`),
      ]);

      if (!papersRes.ok) {
        throw new Error(`Failed to fetch papers: ${papersRes.status}`);
      }

      const { papers: fetchedPapers } = await papersRes.json();
      const fetchedStats = statsRes.ok ? await statsRes.json() : stats;

      setPapers(fetchedPapers || []);
      setStats(fetchedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load papers");
    } finally {
      setLoading(false);
    }
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Client-side filtering
  const filteredPapers = useMemo(() => {
    let result = papers;

    if (selectedTeams.length > 0) {
      result = result.filter((p) => selectedTeams.includes(p.team));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q))
      );
    }

    return result;
  }, [papers, selectedTeams, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Stats bar */}
      <div className="mb-6">
        <StatsBar
          today={stats.today}
          week={stats.week}
          total={stats.total}
          showing={filteredPapers.length}
          isLoading={loading}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: Filters */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-20">
            {/* Search */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Days filter */}
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                时间范围
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDays(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      days === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team filter */}
            <TeamFilter selected={selectedTeams} onChange={setSelectedTeams} />

            {/* Refresh button */}
            <button
              onClick={fetchPapers}
              disabled={loading}
              className="w-full py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg
                         hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  加载中...
                </span>
              ) : (
                "🔄 刷新"
              )}
            </button>
          </div>
        </aside>

        {/* Main content: Paper list */}
        <main className="flex-1 min-w-0">
          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-700">
              <strong>错误：</strong> {error}
              {error.includes("not configured") && (
                <p className="mt-1 text-xs text-red-500">
                  请配置 KV_REST_API_URL 和 KV_REST_API_TOKEN 环境变量，并先运行 /api/cron 抓取论文。
                </p>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredPapers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-5xl mb-4">📭</span>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                暂无论文数据
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {papers.length === 0
                  ? "数据库为空，请先调用 /api/cron（携带 Authorization 头）触发论文抓取。"
                  : "当前筛选条件下没有匹配的论文，请尝试调整筛选条件。"}
              </p>
              {papers.length === 0 && (
                <code className="mt-3 text-xs bg-gray-100 px-3 py-2 rounded-lg block">
                  curl -X POST /api/cron -H &quot;Authorization: Bearer YOUR_SECRET&quot;
                </code>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
                >
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="h-5 w-16 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded mb-3" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paper list */}
          {!loading && filteredPapers.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  共 <strong className="text-gray-700">{filteredPapers.length}</strong> 篇论文
                  {selectedTeams.length > 0 && (
                    <span className="ml-1 text-blue-500">（已筛选）</span>
                  )}
                </p>
              </div>
              <div className="space-y-4">
                {filteredPapers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
