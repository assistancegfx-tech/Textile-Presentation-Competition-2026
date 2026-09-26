import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Trophy, Calendar, Users, ShieldCheck } from 'lucide-react';

interface RegistrationTickerProps {
  onNavigate?: (page: 'registration' | 'event' | 'guidelines') => void;
}

export const RegistrationTicker: React.FC<RegistrationTickerProps> = ({ onNavigate }) => {
  // Database team count + 3 offset (e.g. 2 registered in DB => shows 5)
  const [displayedCount, setDisplayedCount] = useState<number>(() => {
    try {
      const savedCount = localStorage.getItem('tpc2026_displayed_count');
      if (savedCount) return parseInt(savedCount, 10);
      const localListStr = localStorage.getItem('tpc2026_saved_registrations');
      if (localListStr) {
        const list = JSON.parse(localListStr);
        if (Array.isArray(list)) return list.length + 3;
      }
    } catch (_) {}
    return 5; // Default (2 in DB + 3 offset = 5)
  });

  const [actualCount, setActualCount] = useState<number>(2);

  const fetchLiveCount = async () => {
    try {
      // 1. Calculate from local storage count as fallback base
      let localRegsCount = 0;
      try {
        const localListStr = localStorage.getItem('tpc2026_saved_registrations');
        if (localListStr) {
          const list = JSON.parse(localListStr);
          if (Array.isArray(list)) localRegsCount = list.length;
        }
      } catch (_) {}

      // 2. Fetch pure live count from backend database API
      const res = await fetch('/api/registrations/count', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.displayedCount === 'number') {
          setDisplayedCount(data.displayedCount);
          setActualCount(data.actualCount || Math.max(0, data.displayedCount - 3));
          try {
            localStorage.setItem('tpc2026_displayed_count', String(data.displayedCount));
          } catch (_) {}
          return;
        }
      }

      // Fallback calculation: local DB submissions + 3 offset
      const calcActual = localRegsCount;
      const calcDisplayed = calcActual + 3;
      setActualCount(calcActual);
      setDisplayedCount(calcDisplayed);
    } catch (_) {
      // If offline/fallback
      setDisplayedCount((prev) => Math.max(prev, 5));
    }
  };

  useEffect(() => {
    fetchLiveCount();

    // Poll periodically every 15 seconds for live updates
    const interval = setInterval(fetchLiveCount, 15000);

    // Listen to custom registration submission event for immediate live counter bump
    const handleRegistrationSubmitted = () => {
      fetchLiveCount();
    };

    window.addEventListener('tpc_registration_success', handleRegistrationSubmitted);
    window.addEventListener('storage', handleRegistrationSubmitted);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tpc_registration_success', handleRegistrationSubmitted);
      window.removeEventListener('storage', handleRegistrationSubmitted);
    };
  }, []);

  // Items to scroll in the infinite marquee
  const tickerItems = [
    {
      icon: Flame,
      iconColor: 'text-amber-400',
      badge: `🔥 ${displayedCount}+ Teams Registered`,
      badgeStyle: 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 text-amber-300 border-amber-500/40 font-black tracking-wide shadow-xs',
      text: 'Registration Active at BTEC (Barishal Textile Engineering College)',
      actionText: 'Register Now',
      action: () => onNavigate?.('registration')
    },
    {
      icon: Users,
      iconColor: 'text-[#22C55E]',
      badge: 'Solo, Duo & Trio Categories',
      badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold',
      text: 'Participate individually (1 student) or in teams of 2–3 BTEC students',
      actionText: 'Choose Team Size',
      action: () => onNavigate?.('registration')
    },
    {
      icon: Trophy,
      iconColor: 'text-yellow-400',
      badge: 'Exciting Cash Prizes & Awards',
      badgeStyle: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 font-bold',
      text: 'Champion, Runner-up & Finalist awards with official certificates',
      actionText: 'View Details',
      action: () => onNavigate?.('event')
    },
    {
      icon: Calendar,
      iconColor: 'text-cyan-400',
      badge: 'Grand Finale: 04 October 2026',
      badgeStyle: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold',
      text: 'Venue: BTEC Auditorium • Deadline: 30 September 2026',
      actionText: 'Event Info',
      action: () => onNavigate?.('event')
    },
    {
      icon: ShieldCheck,
      iconColor: 'text-[#22C55E]',
      badge: 'Instant Digital PDF Voucher',
      badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold',
      text: 'Automated email confirmation & downloadable entry pass',
      actionText: 'Guidelines',
      action: () => onNavigate?.('guidelines')
    }
  ];

  return (
    <div
      className="relative z-20 w-full overflow-hidden bg-gradient-to-r from-[#071324] via-[#0A192F] to-[#071324] border-y border-slate-800 text-white select-none shadow-inner"
      style={{ minHeight: '38px' }}
      aria-label="Live Registration Announcement Ticker"
    >
      {/* Left side Live Indicator Pill (Fixed on desktop, subtle) */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 z-30 items-center pl-4 pr-3 bg-gradient-to-r from-[#071324] via-[#071324]/95 to-transparent backdrop-blur-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider text-emerald-400 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span>LIVE</span>
        </div>
      </div>

      {/* Smooth Marquee Track */}
      <div className="marquee-container py-2 flex items-center">
        {/* We repeat the array twice to ensure seamless infinite looping without any visual break */}
        <div className="marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap animate-marquee">
          {tickerItems.concat(tickerItems).map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="inline-flex items-center gap-2.5 text-xs text-slate-300 shrink-0 pr-4"
              >
                {/* Badge (Highlights 🔥 127+ Teams Registered) */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${item.badgeStyle}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.iconColor} shrink-0 animate-pulse`} />
                  <span>{item.badge}</span>
                </span>

                {/* Subtitle / Description text */}
                <span className="hidden sm:inline text-slate-300 font-medium">
                  {item.text}
                </span>

                {/* Interactive Action link */}
                {item.actionText && (
                  <button
                    type="button"
                    onClick={item.action}
                    className="inline-flex items-center text-[11px] font-bold text-[#22C55E] hover:text-emerald-300 hover:underline transition ml-1 cursor-pointer"
                  >
                    <span>{item.actionText} →</span>
                  </button>
                )}

                {/* Dot separator between items */}
                <span className="text-slate-600 font-bold ml-4">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle edge fade overlays for smooth scroll aesthetics */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#071324] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#071324] to-transparent z-10" />

      {/* Inline styles for continuous marquee animation */}
      <style>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marqueeScroll 35s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @media (max-width: 640px) {
          .animate-marquee {
            animation-duration: 25s;
          }
        }
      `}</style>
    </div>
  );
};
