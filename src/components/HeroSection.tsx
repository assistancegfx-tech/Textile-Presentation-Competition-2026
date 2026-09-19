import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, BookOpen, Users, HelpCircle, Sparkles } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-12 md:py-20 text-center relative"
    >
      {/* Subtle background ambient animated glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.5, 0.35]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none -z-10"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Organizer Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Career Club BTEC</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Barishal Textile Engineering College</span>
        </motion.div>

        {/* Main Title matching the poster */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A192F] tracking-tight leading-[1.08] font-['Outfit']"
          >
            TEXTILE PRESENTATION<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A192F] via-[#103463] to-[#16A34A]">
              COMPETITION 2026
            </span>
          </motion.h1>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex justify-center py-2"
          >
            <WeaveDecorativeAccent className="opacity-80" />
          </motion.div>

          {/* Clean event meta line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600"
          >
            <div className="flex items-center gap-1.5 text-slate-800">
              <Calendar className="w-4 h-4 text-[#16A34A]" />
              <span>4 October 2026</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>BTEC Auditorium</span>
            </div>
          </motion.div>
        </div>

        {/* Compact Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="pt-2 max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
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
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('registration')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-md shadow-[#0A192F]/15 group cursor-pointer"
          >
            <span>Register Your Team</span>
            <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('event')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition cursor-pointer"
          >
            <span>View Event Details</span>
          </motion.button>
        </motion.div>

        {/* 3 Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 max-w-3xl mx-auto text-left">
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('event')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Event Details & Schedule
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              3-member team format, dates, venue & prizes
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.45 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('guidelines')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0A192F]/10 text-[#0A192F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Competition Guidelines
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rules & segments for business presentation
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('contact')}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#16A34A] transition shadow-2xs group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
              Contact & Support
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              WhatsApp, Facebook, Email & BTEC Auditorium
            </p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

