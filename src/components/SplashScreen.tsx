import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [co2Count, setCo2Count] = useState(0);

  useEffect(() => {
    // Correct global emission baseline (~1,338.15 tonnes/s)
    const RATE_KG_PER_SEC = 1338153;
    const RATE_TONNES_PER_MS = (RATE_KG_PER_SEC / 1000) / 1000; // 1.338153 tonnes per ms

    const getStartOfYearTime = () => {
      const d = new Date();
      d.setMonth(0, 1);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const start = Date.now();
    const yearStart = getStartOfYearTime();
    const duration = 2000;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - start;
      const liveYearTotal = (now - yearStart) * RATE_TONNES_PER_MS;

      if (elapsed < duration) {
        // Build-up animation
        const progress = elapsed / duration;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOutProgress * liveYearTotal);
        setCo2Count(currentVal);
      } else {
        // Seamless transition to real-time clock tracking
        setCo2Count(Math.floor(liveYearTotal));
      }
    }, 16);

    // Auto dismiss splash screen after 3.2s
    const dismissTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(timer);
      clearTimeout(dismissTimer);
    };
  }, [onComplete]);

  // Framer motion animation variants
  const containerVariants = {
    exit: {
      scale: 1.08,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: 'easeInOut' as const,
      },
    },
  };

  const globeVariants = {
    hidden: { scale: 0.4, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: 'easeOut' as const,
      },
    },
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };

  return (
    <motion.div
      id="splash-container"
      variants={containerVariants}
      exit="exit"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-white select-none"
    >
      {/* 1. CSS-Only Orbital Globe Sphere */}
      <motion.div
        id="splash-globe-wrapper"
        variants={globeVariants}
        initial="hidden"
        animate="visible"
        className="relative mb-8 flex items-center justify-center"
      >
        {/* Atmospheric glow ring around the Earth: A div behind the earth */}
        <div 
          className="absolute rounded-full pointer-events-none" 
          style={{
            width: '240px',
            height: '240px',
            background: 'transparent',
            boxShadow: '0 0 0 8px rgba(34,197,94,0.08), 0 0 0 20px rgba(34,197,94,0.05)',
            zIndex: 1,
          }}
        />
        
        {/* Upgraded floating Earth sphere */}
        <div id="splash-globe" className="earth" style={{ zIndex: 2 }} />
      </motion.div>

      {/* 2. Brand logo version with exact SVG */}
      <motion.div
        id="splash-brand-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mb-6 flex items-center justify-center"
      >
        <svg width="280" height="72" viewBox="0 0 280 72" xmlns="http://www.w3.org/2000/svg">
          <defs><clipPath id="sc"><circle cx="36" cy="36" r="26"/></clipPath></defs>
          <circle cx="36" cy="36" r="26" fill="#1e3a8a"/>
          <ellipse cx="32" cy="32" rx="8" ry="11" fill="#4ade80" opacity="0.7" clipPath="url(#sc)"/>
          <ellipse cx="44" cy="38" rx="5" ry="7" fill="#4ade80" opacity="0.55" clipPath="url(#sc)"/>
          <ellipse cx="26" cy="44" rx="4" ry="3" fill="#4ade80" opacity="0.45" clipPath="url(#sc)"/>
          <circle cx="36" cy="36" r="26" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
          <ellipse cx="36" cy="36" rx="34" ry="12" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.4"/>
          <circle cx="70" cy="36" r="4" fill="#4ade80"/>
          <circle cx="70" cy="36" r="7" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.3"/>
          <text x="88" y="41" fontFamily="Inter, sans-serif" fontSize="32" fontWeight="500" fill="white">trace<tspan fill="#4ade80" fontWeight="400" fontSize="22" dy="2" dx="2">.earth</tspan></text>
        </svg>
      </motion.div>

      {/* 3. Ticking CO2 Emitters Count */}
      <motion.div
        id="splash-co2-counters"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <span className="font-mono text-xl text-emerald-400 font-medium">
          {formatNumber(co2Count)}
        </span>
        <span className="mt-1 font-sans text-xs text-slate-500 tracking-wider">
          tonnes of CO₂ emitted globally this year
        </span>
      </motion.div>

      {/* Embedded CSS for custom Earth rotation animation */}
      <style>{`
        @keyframes earth-rotate {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </motion.div>
  );
}
