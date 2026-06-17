import { Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface AIInsightCardProps {
  tip: string;
  onRefresh?: () => Promise<void>;
}

export default function AIInsightCard({ tip, onRefresh }: AIInsightCardProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // Convert markdown-like bullets or long paragraphs into standard beautiful layouts
  const preprocessTip = (text: string) => {
    if (!text) return { title: '', bullets: [] };
    
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      const firstLine = lines[0].replace(/^[#*-:]\s*/, '');
      const rest = lines.slice(1).map(l => l.replace(/^[#*-:]\s*/, ''));
      return { title: firstLine, bullets: rest };
    }
    
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 1) {
      return { title: sentences[0], bullets: sentences.slice(1) };
    }
    return { title: text, bullets: [] };
  };

  const { title, bullets } = preprocessTip(tip);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 space-y-4 select-none">
      {/* Header section */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-sans text-sm font-semibold text-slate-800 dark:text-zinc-100">AI Climate Coach</h3>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 rounded hover:bg-slate-50 dark:hover:bg-zinc-805 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer transition-colors active:scale-90 disabled:opacity-50"
            title="Refresh coach tip"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Suggestion body content */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {refreshing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2 py-1"
            >
              <div className="h-3.5 w-11/12 rounded bg-slate-100 dark:bg-zinc-900 animate-pulse" />
              <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-zinc-900 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <p className="font-sans text-xs font-semibold text-slate-700 dark:text-zinc-200 leading-relaxed">
                {title || 'Suggestions are being generated... complete logs to display tips.'}
              </p>

              {bullets.length > 0 && (
                <ul className="space-y-2 border-l-2 border-emerald-500/20 dark:border-emerald-400/20 pl-3.5 py-0.5">
                  {bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-500 dark:text-zinc-400 leading-normal">
                      <span className="text-emerald-500 dark:text-emerald-400 font-bold">&#8250;</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simple footer without any models */}
      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-medium font-sans uppercase tracking-wider">
        <span>Daily Action Plan</span>
        <span>Goal: Est. -2.4 kg CO₂</span>
      </div>
    </div>
  );
}
