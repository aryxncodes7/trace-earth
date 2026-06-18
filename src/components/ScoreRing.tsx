import { motion } from 'motion/react';

interface ScoreRingProps {
  score: number;
  target: number;
}

export default function ScoreRing({ score, target }: ScoreRingProps) {
  const maxCap = 20.0;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(score / maxCap, 1) * 100;
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  let statusColor = 'text-green-600';
  let strokeColor = '#16a34a';
  let statusLabel = 'Pretty good';
  let statusDesc = 'Below target levels - exceptional climate control!';

  if (score >= 8.0 && score <= 13.0) {
    statusColor = 'text-amber-500';
    strokeColor = '#f59e0b';
    statusLabel = 'Moderate footprint';
    statusDesc = 'Close to benchmarks. Look for small optimization areas.';
  } else if (score > 13.0) {
    statusColor = 'text-red-500';
    strokeColor = '#ef4444';
    statusLabel = 'High impact day';
    statusDesc = 'Above global averages. Review category spikes to optimize.';
  }

  const pct = Math.round(fillPercentage);

  return (
    <div className="flex flex-col items-center" role="region" aria-label="Today's carbon footprint score">
      <div className="relative flex items-center justify-center">
        <svg
          className="h-52 w-52 transform -rotate-90"
          role="img"
          aria-label={`Carbon footprint ring showing ${score.toFixed(1)} kg CO₂, status: ${statusLabel}`}
        >
          <title>{`Today's footprint: ${score.toFixed(1)} kg CO₂ — ${statusLabel}`}</title>
          <circle
            cx="104" cy="104" r={radius}
            stroke="#f3f4f6"
            className="stroke-slate-100 dark:stroke-zinc-800"
            strokeWidth="10"
            fill="transparent"
            aria-hidden="true"
          />
          <motion.circle
            cx="104" cy="104" r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            aria-hidden="true"
          />
        </svg>

        {/* Hidden progress for screen readers */}
        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={maxCap}
          aria-valuetext={`${score.toFixed(1)} kg CO₂ today, ${pct}% of max tracked range`}
          className="sr-only"
        />

        <div className="absolute flex flex-col items-center justify-center text-center" aria-hidden="true">
          <span className="font-sans text-xs tracking-wider uppercase text-slate-400 dark:text-zinc-550">Today</span>
          <span className="font-sans text-4xl font-semibold text-slate-800 dark:text-zinc-100 tabular-nums">
            {score.toFixed(1)}
          </span>
          <span className="font-sans text-xs font-medium text-slate-500 dark:text-zinc-400">kg CO₂</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-normal tracking-wide bg-slate-50 border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800 ${statusColor}`}
          aria-label={`Status: ${statusLabel}`}
        >
          {statusLabel}
        </span>
        <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300 px-4 max-w-sm">
          {statusDesc}
        </p>
        <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-slate-400 dark:text-zinc-500 border-t border-slate-100 dark:border-zinc-800 pt-3">
          <div>
            <span className="block text-slate-600 dark:text-zinc-300 font-medium tabular-nums">{target.toFixed(1)} kg</span>
            <span>Personal Goal</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" aria-hidden="true" />
          <div>
            <span className="block text-slate-600 dark:text-zinc-300 font-medium tabular-nums">13.7 kg</span>
            <span>Global Avg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
