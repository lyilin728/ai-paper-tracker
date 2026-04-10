"use client";

import { TEAMS } from "@/lib/teams";

interface TeamFilterProps {
  selected: string[];
  onChange: (teams: string[]) => void;
}

export function TeamFilter({ selected, onChange }: TeamFilterProps) {
  const domestic = TEAMS.filter((t) => t.region === "domestic");
  const international = TEAMS.filter((t) => t.region === "international");

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const clearAll = () => onChange([]);

  const isActive = (key: string) =>
    selected.length === 0 || selected.includes(key);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">团队筛选</h2>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            清除筛选
          </button>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">国内</p>
        <div className="flex flex-wrap gap-1.5">
          {domestic.map((team) => (
            <button
              key={team.key}
              onClick={() => toggle(team.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive(team.key)
                  ? team.color + " ring-2 ring-offset-1 ring-current opacity-100"
                  : "bg-gray-100 text-gray-400 opacity-60 hover:opacity-80"
              }`}
            >
              {team.nameZh}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide">国际</p>
        <div className="flex flex-wrap gap-1.5">
          {international.map((team) => (
            <button
              key={team.key}
              onClick={() => toggle(team.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                isActive(team.key)
                  ? team.color + " ring-2 ring-offset-1 ring-current opacity-100"
                  : "bg-gray-100 text-gray-400 opacity-60 hover:opacity-80"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
