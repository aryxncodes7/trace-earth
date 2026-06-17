import { useState } from 'react';
import { Search, ShieldAlert, CheckCircle } from 'lucide-react';
import { LeaderboardUser } from '../store/useStore.js';

interface LeaderboardTableProps {
  leaderboard: LeaderboardUser[];
  currentUserEmail: string;
  onToggleAnonymous: (isAnon: boolean) => Promise<boolean>;
  currentIsAnonymous: boolean;
}

export default function LeaderboardTable({
  leaderboard,
  currentUserEmail,
  onToggleAnonymous,
  currentIsAnonymous,
}: LeaderboardTableProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingAnon, setIsUpdatingAnon] = useState(false);

  // Filter leaderboard based on searchQuery (filters by city or country)
  const filteredLeaderboard = leaderboard.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (item.city && item.city.toLowerCase().includes(query)) ||
      (item.country && item.country.toLowerCase().includes(query))
    );
  });

  // Toggle anonymous function
  const handleToggleAnon = async () => {
    setIsUpdatingAnon(true);
    await onToggleAnonymous(!currentIsAnonymous);
    setIsUpdatingAnon(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input, Time Filter and Anonymous Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search Map Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-1.5 pl-9 pr-4 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
          />
        </div>

        {/* Time filters */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto">
          {(['week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`rounded-lg py-1 px-3 text-xs font-medium border transition-all ${
                timeFilter === filter
                  ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Option Toggle for Anonymous Leaderboards */}
      <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 p-3 text-xs text-slate-600 dark:text-zinc-350">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <span>
            {currentIsAnonymous
              ? 'You are currently appearing as an Anonymous Eco-Partner on the leaderboard.'
              : 'Your full name and location are visible. You can hide them anytime.'}
          </span>
        </div>
        <button
          onClick={handleToggleAnon}
          disabled={isUpdatingAnon}
          className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
            currentIsAnonymous
              ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              : 'border-green-600 bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isUpdatingAnon ? 'Saving...' : currentIsAnonymous ? 'Go Public' : 'Go Anonymous'}
        </button>
      </div>

      {/* Ranks Table mapping */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-zinc-300">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Rank</th>
              <th className="py-3 px-4">Partner Name</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 w-28 text-center">Daily Average</th>
              <th className="py-3 px-4 w-24 text-center">Logs Saved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {filteredLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                  No partners found matching your search.
                </td>
              </tr>
            ) : (
              filteredLeaderboard.map((item, index) => {
                const isCurrentUser = item.email === currentUserEmail;
                const rank = index + 1;

                return (
                  <tr
                    key={item.id}
                    className={`transition-all ${
                      isCurrentUser
                        ? 'bg-green-50/30 dark:bg-green-950/20 font-medium text-slate-900 dark:text-zinc-100 border-l-2 border-l-green-600'
                        : 'hover:bg-slate-50/40 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Rank Row */}
                    <td className="py-3 px-4 text-center font-mono font-medium tabular-nums text-slate-500 dark:text-zinc-400">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </td>

                    {/* Member Name */}
                    <td className="py-3 px-4 flex items-center space-x-2 text-slate-800 dark:text-zinc-100 font-sans">
                      <span>{item.name}</span>
                      {isCurrentUser && (
                        <span className="inline-flex rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 px-1.5 py-0.2 text-[9px] font-normal tracking-wide">
                          You
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 font-sans text-slate-500 dark:text-zinc-400 text-xs">
                      {item.city}, {item.country}
                    </td>

                    {/* Daily Average (Lower is better!) */}
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono text-xs font-semibold tabular-nums ${
                        item.avgEmission < 8.0
                          ? 'text-green-600 dark:text-green-400'
                          : item.avgEmission <= 13.0
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}>
                        {item.avgEmission.toFixed(1)} <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">kg</span>
                      </span>
                    </td>

                    {/* Record Count */}
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-400 dark:text-zinc-500">
                      {item.logsLogged}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
