import { Car, Home, Salad, ShoppingBag } from 'lucide-react';
import { CategoryBreakdown as BreakdownType } from '../store/useStore.js';

interface CategoryBreakdownProps {
  breakdown: BreakdownType;
}

export default function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  const { transport, energy, diet, shopping } = breakdown;
  const total = transport + energy + diet + shopping;
  
  const getPercentage = (val: number) => {
    if (total === 0) return 0;
    return Number(((val / total) * 100).toFixed(0));
  };

  const categories = [
    {
      name: 'Transport',
      val: transport,
      pct: getPercentage(transport),
      icon: Car,
      color: 'bg-blue-500',
      textColor: 'text-blue-500 dark:text-blue-400',
      trackColor: 'bg-blue-50 dark:bg-blue-950/30',
      badgeDesc: 'Vehicles, flights & public transit',
    },
    {
      name: 'Home Energy',
      val: energy,
      pct: getPercentage(energy),
      icon: Home,
      color: 'bg-amber-500',
      textColor: 'text-amber-500 dark:text-amber-400',
      trackColor: 'bg-amber-50 dark:bg-amber-950/30',
      badgeDesc: 'Electricity & heating utilities',
    },
    {
      name: 'Dietary habits',
      val: diet,
      pct: getPercentage(diet),
      icon: Salad,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      trackColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      badgeDesc: 'Meal choices & food wastage',
    },
    {
      name: 'Shopping & Leisure',
      val: shopping,
      pct: getPercentage(shopping),
      icon: ShoppingBag,
      color: 'bg-pink-500',
      textColor: 'text-pink-500 dark:text-pink-400',
      trackColor: 'bg-pink-50 dark:bg-pink-950/30',
      badgeDesc: 'Orders, apparel & streaming load',
    },
  ].sort((a, b) => b.val - a.val); // Sort by highest footprint first to establish hierarchy

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-sans text-sm font-medium text-slate-800 dark:text-zinc-100">Impact by Category</h4>
        <span className="font-sans text-xs text-slate-400 dark:text-zinc-400 tabular-nums">
          total: {total.toFixed(1)} kg CO₂
        </span>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.name} className="flex flex-col space-y-1.5">
              {/* Stats Labels */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-slate-700">
                  <div className={`p-1.5 rounded-md ${cat.trackColor} ${cat.textColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-sans text-slate-800 dark:text-zinc-100 font-medium">{cat.name}</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-sans text-xs font-semibold text-slate-800 dark:text-zinc-100 tabular-nums">
                    {cat.val.toFixed(1)} <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-400">kg</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-400 font-medium tabular-nums">
                    {cat.pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar container */}
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
              
              <span className="text-[11px] text-slate-400 dark:text-zinc-400 pl-8 leading-none">
                {cat.badgeDesc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
