"use client";

import { Paper } from "@/lib/arxiv";
import { getTeamByKey } from "@/lib/teams";
import { useState } from "react";

interface PaperCardProps {
  paper: Paper;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function PaperCard({ paper }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);
  const team = getTeamByKey(paper.team);
  const authorsDisplay =
    paper.authors.slice(0, 4).join(", ") +
    (paper.authors.length > 4 ? ` +${paper.authors.length - 4} more` : "");
  const abstractPreview = paper.abstract.slice(0, 250);
  const needsExpand = paper.abstract.length > 250;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {team && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${team.color}`}
            >
              {team.nameZh}
            </span>
          )}
          {paper.categories.slice(0, 2).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-600"
            >
              {cat}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDate(paper.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1.5">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {paper.title}
        </a>
      </h3>

      {/* Authors */}
      <p className="text-sm text-gray-500 mb-2">{authorsDisplay}</p>

      {/* Abstract */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <span>
          {expanded || !needsExpand ? paper.abstract : abstractPreview + "..."}
        </span>
        {needsExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-blue-500 hover:text-blue-700 font-medium text-xs"
          >
            {expanded ? "收起" : "展开"}
          </button>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-3 mt-3">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          arXiv
        </a>
        <a
          href={paper.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </a>
      </div>
    </div>
  );
}
