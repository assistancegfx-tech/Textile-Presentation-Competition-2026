import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowRight, BookOpen, Users, HelpCircle } from 'lucide-react';
import { WeaveDecorativeAccent } from './TextileMotifs';
import { PageId } from '../types';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HeroSectionProps {
  onNavigate: (page: PageId) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Target: 4 October 2026, 09:00 AM (Bangladesh Time UTC+6)
    const targetDate = new Date('2026-10-04T09:00:00+06:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 md:py-20 text-center animate-in fade-in duration-200">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Organizer Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Career Club BTEC</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Barishal Textile Engineering College</span>
        </div>

        {/* Main Title matching the poster */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A192F] tracking-tight leading-[1.08] font-['Outfit']">
            TEXTILE PRESENTATION<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A192F] via-[#103463] to-[#16A34A]">
              COMPETITION 2026
            </span>
          </h1>

          <div className="flex justify-center py-2">
            <WeaveDecorativeAccent className="opacity-80" />
          </div>

          {/* Clean event meta line */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Calendar className="w-4 h-4 text-[#16A34A]" />
              <span>4 October 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>BTEC Auditorium</span>
            </div>
          </div>
        </div>

        {/* Compact Countdown Timer */}
        <div className="pt-2 max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mins</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#16A34A] font-['Space_Grotesk']">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('registration')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] active:scale-98 transition shadow-md shadow-[#0A192F]/15 group"
          >
            <span>Register Your Team</span>
            <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onNavigate('event')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition"
          >
            <span>View Event Details</span>
          </button>
        </div>

        {/* 3 Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-3xl mx-auto text-left">
          <button
            onClick={() => onNavigate('event')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Event Details & Schedule
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              3-member team format, dates, venue & prizes
            </p>
          </button>

          <button
            onClick={() => onNavigate('guidelines')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0A192F]/10 text-[#0A192F] flex items-center justify-center mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Competition Guidelines
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Time limits, rules & 100-point judging rubric
            </p>
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Contact & Support
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              WhatsApp, Facebook, Email & BTEC Auditorium
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
