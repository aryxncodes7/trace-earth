import { useState, useEffect, useRef } from 'react';
import { Globe, Timer, Flame, Leaf, Pause, Play, Info, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function GlobalEmissionsCounter() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0); // in seconds

  // Real-time rates based on the average live rate from https://www.carbonemissionscounter.com/
  // averaging roughly ~1,338,153 kg of CO2 per second globally
  const RATE_KG_PER_SEC = 1338153;
  const RATE_TONNES_PER_MS = (RATE_KG_PER_SEC / 1000) / 1000; // ~0.001338153 tonnes per millisecond * 1000 = 1.338153 tonnes per ms
  const RATE_KG_PER_MS = RATE_KG_PER_SEC / 1000; // ~1338.153 kg per millisecond

  const [emissionsToday, setEmissionsToday] = useState(0);
  const [emissionsYear, setEmissionsYear] = useState(0);
  const [emissionsSession, setEmissionsSession] = useState(0);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Calculate base values when mounted
  const getMidnightTime = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getStartOfYearTime = () => {
    const d = new Date();
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  useEffect(() => {
    lastTimeRef.current = Date.now();
    const midnight = getMidnightTime();
    const yearStart = getStartOfYearTime();

    const updateEmissions = () => {
      const now = Date.now();

      // Today
      const elapsedToday = now - midnight;
      const todayVal = elapsedToday * RATE_TONNES_PER_MS;
      setEmissionsToday(todayVal);

      // Year
      const elapsedYear = now - yearStart;
      const yearVal = elapsedYear * RATE_TONNES_PER_MS;
      setEmissionsYear(yearVal);

      // Session accumulator
      if (isPlaying) {
        const deltaMs = lastTimeRef.current ? (now - lastTimeRef.current) : 0;
        setEmissionsSession((prev) => prev + (deltaMs * RATE_KG_PER_MS));
        setTimeOnPage((prev) => prev + (deltaMs / 1000));
      }
      
      lastTimeRef.current = now;
      requestRef.current = requestAnimationFrame(updateEmissions);
    };

    requestRef.current = requestAnimationFrame(updateEmissions);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
    // Reset lastTimeRef on play so we don't have massive delta jump
    if (!isPlaying) {
      lastTimeRef.current = Date.now();
    }
    toast.info(isPlaying ? 'Odometer paused.' : 'Odometer resumed.');
  };

  // Format Helper
  const formatCompact = (num: number, digits = 0) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(num);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm transition-all">
      {/* Top Header Row of Counter Widget */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-900 pb-3">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-green-600 dark:text-green-500 animate-pulse" />
          <div>
            <h3 className="font-sans text-sm font-semibold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
              Live Global CO₂ Emission Odometer
              <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                LIVE
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-tight">
              Estimated worldwide greenhouse gases entering the biosphere in real-time
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleTogglePlay}
            title={isPlaying ? "Pause odometer" : "Resume odometer"}
            className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-green-600" />}
          </button>
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Docs / Source description panel */}
      <AnimatePresence>
        {showDocs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="my-3 rounded-lg bg-green-50/50 dark:bg-green-950/10 border border-green-100/60 dark:border-green-900/20 p-3.5 text-xs text-slate-600 dark:text-zinc-300 space-y-1.5 leading-relaxed">
              <span className="font-semibold text-green-800 dark:text-green-400">About the Global Emission Counter</span>
              <p>
                Globally, human activities emit approx. <strong>42.2 Billion metric tonnes</strong> of equivalent carbon dioxide (CO₂) each year. 
                This translates to a massive <strong>1,338,153 kg of CO₂</strong> (over 1,338 metric tonnes) every single second!
              </p>
              <p>
                Our server and client calculation aligns directly with reference algorithms like those powering 
                <span className="text-green-600 dark:text-green-400 font-semibold px-1">carbonemissionscounter.com</span>, 
                visualizing the constant weight of greenhouse gases released to keep global energy, production, and transit active.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Three main counter display zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Counter 1: Emitted Today */}
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-900/40 p-4 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            <span>Emitted Today Worldwide</span>
            <Flame className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-sans text-slate-900 dark:text-zinc-100 tracking-tight tabular-nums">
            {formatCompact(emissionsToday)} <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 font-sans">tonnes</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
            Since midnight local timezone
          </div>
        </div>

        {/* Counter 2: Emitted This Year */}
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-900/40 p-4 border border-slate-100 dark:border-zinc-900 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            <span>Emitted This Year Global</span>
            <TrendingUp className="h-3.5 w-3.5 text-red-500" />
          </div>
          <div className="mt-2 text-xl font-bold font-sans text-slate-900 dark:text-zinc-100 tracking-tight tabular-nums">
            {formatCompact(emissionsYear)} <span className="text-xs font-normal text-slate-500 dark:text-zinc-400 font-sans">tonnes</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
            Cumulative total since Jan 1st
          </div>
        </div>

        {/* Counter 3: Emitted since opening page */}
        <div className="rounded-xl bg-green-50/40 dark:bg-green-950/10 p-4 border border-green-100/60 dark:border-green-900/20 flex flex-col justify-between relative overflow-hidden">
          {/* subtle accent light effect */}
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-16 h-16 bg-green-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between text-[11px] text-green-700 dark:text-green-400 font-bold uppercase tracking-wider relative z-10">
            <span>While on this screen</span>
            <Timer className="h-3.5 w-3.5 text-green-600 dark:text-green-400 animate-spin-slow" />
          </div>
          <div className="mt-2 text-xl font-bold font-sans text-green-700 dark:text-green-400 tracking-tight tabular-nums relative z-10">
            {formatCompact(emissionsSession, 1)} <span className="text-xs font-normal text-green-600/80 dark:text-green-400/80 font-sans">kg</span>
          </div>
          <div className="mt-1 text-[10px] text-green-600/80 dark:text-green-400/80 font-semibold relative z-10">
            Logged over {formatCompact(timeOnPage)}s of active focus!
          </div>
        </div>
      </div>

      {/* Comparisons bar block */}
      <div className="mt-4 border-t border-slate-100 dark:border-zinc-900 pt-3.5">
        <div className="flex items-center space-x-1 mb-2">
          <Leaf className="h-3.5 w-3.5 text-green-500" />
          <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            Equivalent Impact (Today's Emissions)
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Required Forest Uplink</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 font-sans">
              ~{formatCompact((emissionsToday * 1000) / 22)} trees
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">Growing for a full year to capture today's CO₂</span>
          </div>

          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Cars Driven Daily</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 font-sans">
              ~{formatCompact((emissionsToday * 1000) / (4600 / 365))} vehicles
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">Average passenger cars running simultaneously</span>
          </div>

          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 p-2.5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase ">Domestic Flights</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 font-sans">
              ~{formatCompact(emissionsToday / 10)} flights
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">Passenger flights from New Delhi to Mumbai (~10 tonnes each)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
