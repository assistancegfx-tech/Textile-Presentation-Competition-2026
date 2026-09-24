import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, Clock, Users, Search, Lock, ShieldCheck, BookOpen, HelpCircle } from 'lucide-react';
import { WeaveDecorativeAccent } from './TextileMotifs';
import { PageId } from '../types';
import {
  getTimeUntilRegistrationDeadline,
  isRegistrationClosed,
  REGISTRATION_DEADLINE_LABEL,
  CountdownTimeLeft,
  EVENT_DATE_SHORT,
  EVENT_VENUE
} from '../utils/deadline';

interface HeroSectionProps {
  onNavigate: (page: PageId) => void;
  onOpenViewEditModal?: (regId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onOpenViewEditModal }) => {
  const [countdown, setCountdown] = useState<CountdownTimeLeft>(getTimeUntilRegistrationDeadline());

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilRegistrationDeadline());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isClosed = countdown.isExpired || isRegistrationClosed();

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

        {/* Main Title with always-active continuous cool animations */}
        <div className="space-y-3 relative">
          {/* Continuous ambient behind-title glowing halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-32 bg-gradient-to-r from-[#22C55E]/20 via-[#0EA5E9]/15 to-[#22C55E]/20 rounded-full blur-3xl pointer-events-none animate-glow-pulse -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-visible"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0A192F] tracking-tight leading-[1.08] font-['Outfit'] select-none">
              <span className="inline-block hover:scale-[1.02] transition-transform duration-300">
                <span className="inline-block transition-colors duration-500 hover:text-[#16A34A]">TEXTILE</span>{' '}
                <span className="inline-block transition-colors duration-500 hover:text-[#0A192F]">PRESENTATION</span>
              </span>
              <br />
              <span className="relative inline-block mt-1">
                {/* Continuous Shimmering Vibrant Gradient Headline */}
                <span className="inline-block bg-gradient-to-r from-[#0A192F] via-[#16A34A] via-[#0284C7] to-[#0A192F] bg-clip-text text-transparent animate-title-shimmer drop-shadow-sm font-black tracking-normal">
                  COMPETITION 2026
                </span>
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.38, ease: 'easeOut' }}
            className="flex justify-center py-1.5"
          >
            <div className="relative group">
              <WeaveDecorativeAccent className="opacity-95 drop-shadow-xs" />
            </div>
          </motion.div>

          {/* Clean event meta line */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-600"
          >
            <div className="flex items-center gap-1.5 text-slate-800">
              <Calendar className="w-4 h-4 text-[#16A34A]" />
              <span>Event: {EVENT_DATE_SHORT}</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>{EVENT_VENUE}</span>
            </div>
          </motion.div>
        </div>

        {/* Compact Countdown Timer Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="pt-2 max-w-lg mx-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
            {/* Header label for countdown */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                {isClosed ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-700">Registration Status:</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-[#16A34A] animate-spin-slow" />
                    <span>Registration Closes In:</span>
                  </>
                )}
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isClosed
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isClosed ? 'Locked / Closed' : 'Deadline: 30 Sept (11:59 PM)'}
              </span>
            </div>

            {/* Timer Counter Grid */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hours</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className="block text-2xl sm:text-3xl font-black text-[#0A192F] font-['Space_Grotesk']">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mins</span>
              </div>

              <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-slate-200/70">
                <span className={`block text-2xl sm:text-3xl font-black font-['Space_Grotesk'] ${
                  isClosed ? 'text-slate-400' : 'text-[#16A34A]'
                }`}>
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isClosed ? 'text-slate-400' : 'text-[#16A34A]'
                }`}>Secs</span>
              </div>
            </div>

            {/* Deadline Sub-caption */}
            <p className="text-[11px] text-slate-500 font-medium mt-2.5 text-center">
              {isClosed
                ? 'Registration closed on 30 September 2026 at 11:59 PM BST.'
                : `Final Registration Deadline: ${REGISTRATION_DEADLINE_LABEL}`}
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="pt-2 flex flex-col items-center justify-center gap-3 w-full max-w-lg mx-auto"
        >
          {/* Primary Action Button - Locked when deadline passed */}
          {isClosed ? (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="w-full inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold text-slate-400 bg-slate-100 border border-slate-300 cursor-not-allowed select-none">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Registration Closed (Locked)</span>
              </div>
              <p className="text-[11.5px] text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200/70 font-semibold">
                🔒 Deadline has passed. Registered teams can search and download vouchers below.
              </p>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('registration')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition-all shadow-lg shadow-[#0A192F]/20 group cursor-pointer border border-[#0A192F]"
            >
              <span>Register Your Team</span>
              <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}

          {/* Prominently Set Below Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenViewEditModal?.()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer group ${
                isClosed
                  ? 'text-white bg-[#0A192F] hover:bg-[#122846] border-2 border-[#0A192F]'
                  : 'text-[#0A192F] bg-white hover:bg-emerald-50/80 border-2 border-[#16A34A]/70 hover:border-[#16A34A]'
              }`}
            >
              <Search className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                isClosed ? 'text-[#22C55E]' : 'text-[#16A34A]'
              }`} />
              <span>View Your Registration & Voucher</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('event')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-white/80 hover:bg-slate-50 border border-slate-300 transition-all cursor-pointer"
            >
              <span>View Event Details</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 3 Quick Navigation Cards - Beautifully crafted & balanced */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-7 max-w-3xl mx-auto text-left">
          {/* Card 1: Event Details */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('event')}
            className="group relative p-4.5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-950/5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50/60 to-transparent rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[#16A34A] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#16A34A] group-hover:text-white transition-all">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Event
                </span>
              </div>
              <h3 className="text-xs sm:text-[13px] font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors leading-snug">
                Event Details & Schedule
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                3-member team format, dates, venue & prizes
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#16A34A]">
              <span>Explore timeline</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* Card 2: Competition Guidelines */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.45 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('guidelines')}
            className="group relative p-4.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-400/60 hover:shadow-md hover:shadow-slate-900/5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100/60 to-transparent rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[#0A192F] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#0A192F] group-hover:text-white transition-all">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                  Rules
                </span>
              </div>
              <h3 className="text-xs sm:text-[13px] font-extrabold text-[#0A192F] group-hover:text-[#0A192F] transition-colors leading-snug">
                Competition Guidelines
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Rules & segments for business presentation
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-[#0A192F]">
              <span>Read segments</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* Card 3: Contact & Support */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            onClick={() => onNavigate('contact')}
            className="group relative p-4.5 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500/50 hover:shadow-md hover:shadow-teal-950/5 transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-50/60 to-transparent rounded-bl-full pointer-events-none transition-opacity group-hover:opacity-100" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/70 text-teal-800 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-teal-700 group-hover:text-white transition-all">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-200/60">
                  Help
                </span>
              </div>
              <h3 className="text-xs sm:text-[13px] font-extrabold text-[#0A192F] group-hover:text-teal-800 transition-colors leading-snug">
                Contact & Support
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                WhatsApp, Facebook, Email & BTEC Auditorium
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-teal-700">
              <span>Get in touch</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

