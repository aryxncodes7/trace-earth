import { HistoryItem } from '../store/useStore.js';

interface CalendarHeatmapProps {
  history: HistoryItem[];
}

export default function CalendarHeatmap({ history }: CalendarHeatmapProps) {
  // We want to construct a clean grid representing the last 28-30 logs.
  // Pad the array if history is shorter than 30 logs.
  const totalSlots = 30;
  const paddingLength = Math.max(totalSlots - history.length, 0);
  
  // Sort oldest to newest for calendar-style grids
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Combine padding + actual history logs
  const emptySlots = Array(paddingLength).fill(null);
  const gridCells = [...emptySlots, ...sortedHistory];

  // Helper to resolve cell coloring based on emission weight
  const getCellColor = (item: HistoryItem | null) => {
    if (!item) return 'bg-slate-50 border-slate-100 dark:bg-[#1e293b] dark:border-[#334155] hover:scale-100 cursor-default'; // Empty slot
    
    const value = item.total;
    if (value < 8.0) {
      return 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-850 hover:bg-emerald-205 hover:border-emerald-300';
    } else if (value >= 8.0 && value <= 13.0) {
      return 'bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850 hover:bg-amber-205 hover:border-amber-300';
    } else {
      return 'bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-850 hover:bg-red-205 hover:border-red-300';
    }
  };

  const getCellTitle = (item: HistoryItem | null) => {
    if (!item) return 'No log recorded';
    const d = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${d}: ${item.total.toFixed(1)} kg CO₂`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-sans text-sm font-medium text-slate-800 dark:text-zinc-100">Footprint Diary</h4>
        <span className="text-[11px] text-slate-400 dark:text-zinc-400">Showing last 30 recorded logs</span>
      </div>

      {/* Heatmap Grid layout */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/10">
        <div className="grid grid-cols-10 gap-2.5 p-1 w-full max-w-sm">
          {gridCells.map((cell, idx) => (
            <div
              key={cell?.id || `empty-${idx}`}
              className={`aspect-square w-full rounded border transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer ${getCellColor(
                cell
              )}`}
              title={getCellTitle(cell)}
            />
          ))}
        </div>

        {/* Legend Map */}
        <div className="mt-4 flex items-center space-x-4 text-[10px] text-slate-400 dark:text-zinc-500">
          <span className="font-sans">Legend:</span>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-850" />
            <span>&lt;8kg</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-850" />
            <span>8-13kg</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded bg-red-100 border border-red-200 dark:bg-red-950/40 dark:border-red-850" />
            <span>&gt;13kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
