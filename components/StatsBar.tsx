interface StatsBarProps {
  today: number;
  week: number;
  total: number;
  showing: number;
  isLoading?: boolean;
}

export function StatsBar({
  today,
  week,
  total,
  showing,
  isLoading = false,
}: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      <StatItem
        label="今日新增"
        value={today}
        icon="🆕"
        isLoading={isLoading}
      />
      <div className="w-px h-8 bg-blue-200" />
      <StatItem
        label="本周新增"
        value={week}
        icon="📅"
        isLoading={isLoading}
      />
      <div className="w-px h-8 bg-blue-200" />
      <StatItem
        label="总收录"
        value={total}
        icon="📚"
        isLoading={isLoading}
      />
      <div className="w-px h-8 bg-blue-200 hidden sm:block" />
      <StatItem
        label="当前显示"
        value={showing}
        icon="👁️"
        isLoading={false}
      />
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: number;
  icon: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        {isLoading ? (
          <div className="h-5 w-8 bg-blue-200 rounded animate-pulse" />
        ) : (
          <div className="text-lg font-bold text-gray-800 leading-tight">
            {value.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
