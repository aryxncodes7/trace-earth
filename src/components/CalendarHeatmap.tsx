import { HistoryItem } from '../store/useStore.js';

interface CalendarHeatmapProps {
  history: HistoryItem[];
}

export default function CalendarHeatmap({ history }: CalendarHeatmapProps) {
  const totalSlots = 30;
  const paddingLength = Math.max(totalSlots - history.length, 0);
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const emptySlots = Array(paddingLength).fill(null);
  const gridCells = [...emptySlots, ...sortedHistory];

  const getCellColor = (item: HistoryItem | null) => {
    if (!item) return 'bg-slate-50 border-slate-100 dark:bg-[#1e293b] dark:border-[#334155] cursor-default';
    const value = item.total;
    if (value < 8.0) return 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-850 hover:bg-emerald-205 hover:border-emerald-300';
    if (value <= 13.0) return 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850 hover:bg-amber-205 hover:border-amber-300';
    return 'bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-850 hover:bg-red-205 hover:border-red-300';
  };

  const getCellTitle = (item: HistoryItem | null) => {
    if (!item) return 'No log recorded';
    const d = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${d}: ${item.total.toFixed(1)} kg CO₂`;
  };

  const getEmissionLevel = (item: HistoryItem | null) => {
    if (!item) return 'no data';
    if (item.total < 8) return 'low';
    if (item.total <= 13) return 'moderate';
    return 'high';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-sans text-sm font-medium text-slate-800 dark:text-zinc-100" id="heatmap-title">
          Footprint Diary
        </h4>
        <span className="text-[11px] text-slate-400 dark:text-zinc-400">Showing last 30 recorded logs</span>
      </div>

      <div
        className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10"
        role="grid"
        aria-labelledby="heatmap-title"
        aria-label="Carbon footprint calendar heatmap for last 30 days"
      >
        <div className="grid grid-cols-10 gap-2.5 p-1 w-full max-w-sm" role="row">
          {gridCells.map((cell, idx) => (
            <div
              key={cell?.id || `empty-${idx}`}
              role="gridcell"
              className={`aspect-square w-full rounded border transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer ${getCellColor(cell)}`}
              title={getCellTitle(cell)}
              aria-label={getCellTitle(cell)}
              aria-describedby="heatmap-legend"
              tabIndex={cell ? 0 : -1}
              data-emission-level={getEmissionLevel(cell)}
            />
          ))}
        </div>

        <div id="heatmap-legend" className="mt-4 flex items-center space-x-4 text-[10px] text-slate-400 dark:text-zinc-500" role="list" aria-label="Heatmap legend">
          <span className="font-sans">Legend:</span>
          <div className="flex items-center space-x-1.5" role="listitem">
            <div className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-850" aria-hidden="true" />
            <span>&lt;8kg (Good)</span>
          </div>
          <div className="flex items-center space-x-1.5" role="listitem">
            <div className="h-2.5 w-2.5 rounded bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-850" aria-hidden="true" />
            <span>8-13kg (Moderate)</span>
          </div>
          <div className="flex items-center space-x-1.5" role="listitem">
            <div className="h-2.5 w-2.5 rounded bg-red-100 border border-red-200 dark:bg-red-950/40 dark:border-red-850" aria-hidden="true" />
            <span>&gt;13kg (High)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
