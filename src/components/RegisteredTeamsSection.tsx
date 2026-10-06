import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

const REGISTERED_TEAMS = [
  'Nemesis',
  'Think Tankers',
  'Grean Weavers',
  'TRIWEAR',
  'Sugar Gliders',
  'Eco Warriors',
  'TITAN',
];

const ROTATION_INTERVAL = 4500;

export const RegisteredTeamsSection: React.FC = () => {
  const [teams, setTeams] = useState<string[]>(REGISTERED_TEAMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through registered teams
  useEffect(() => {
    if (isPaused || teams.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % teams.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, teams.length]);

  // Fetch live team names if available from server
  useEffect(() => {
    const fetchLiveTeams = async () => {
      try {
        const res = await fetch('/api/registrations/teams');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.teams) && data.teams.length > 0) {
            const names = data.teams
              .map((t: any) => t.teamName || t.name)
              .filter(Boolean);
            if (names.length > 0) {
              setTeams(names);
            }
          }
        }
      } catch (_) {}
    };
    fetchLiveTeams();
  }, []);

  const currentTeamName = teams[currentIndex] || teams[0];

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 max-w-3xl mx-auto select-none">
      {/* High-End Professional Tournament Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0B1528] via-[#081220] to-[#060D18] border border-slate-800/90 shadow-2xl transition-all duration-300 hover:border-slate-700/80"
      >
        {/* Top Micro-Accent Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent" />

        {/* High-Tech Blueprint/Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '18px 18px',
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main Content Area */}
        <div className="relative z-10 px-5 py-4 sm:px-8 sm:py-5">
          {/* Top Metadata Row: Status Badge & Counter */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
            {/* Left: Verified Official Badge */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Officially Registered Team
              </span>
            </div>

            {/* Right: Team Index Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-300 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider">
              <span className="text-emerald-400 font-bold">
                #{String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">
                {String(teams.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Centerpiece: Clean, Ultra-Sharp Team Name */}
          <div className="py-3 sm:py-4 min-h-[56px] sm:min-h-[68px] md:min-h-[76px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTeamName}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center justify-center gap-3 sm:gap-5 w-full"
              >
                {/* Left Subtle Divider Line */}
                <div className="hidden sm:block flex-1 max-w-[48px] h-[1px] bg-gradient-to-r from-transparent to-slate-700" />

                {/* Team Name */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.06em] font-['Bebas_Neue',sans-serif] bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent select-none leading-none whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] px-2">
                  {currentTeamName}
                </h2>

                {/* Right Subtle Divider Line */}
                <div className="hidden sm:block flex-1 max-w-[48px] h-[1px] bg-gradient-to-l from-transparent to-slate-700" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Subtitle Row: Event Verification Note & Sleek Indicator Bars */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-slate-400 text-[10px] sm:text-[11px]">
            <span className="tracking-wide text-slate-400 font-medium">
              Textile Presentation Competition 2026 • BTEC
            </span>

            {/* Segment Progress Bars */}
            <div className="flex items-center gap-1">
              {teams.map((t, idx) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`View ${t}`}
                  title={t}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Active Rotation Timer Progress Bar at Bottom Edge */}
        <div className="relative h-[2px] w-full bg-slate-800/80 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? '100%' : '100%' }}
            transition={{
              duration: isPaused ? 0 : ROTATION_INTERVAL / 1000,
              ease: 'linear',
            }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
          />
        </div>
      </div>
    </section>
  );
};
