import React from 'react';
import { motion } from 'motion/react';
import { Users, PenTool, ArrowRight, Sparkles, Trophy, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RegistrationSegment } from '../types';

interface RegistrationSegmentSelectorProps {
  onSelectSegment: (segment: RegistrationSegment) => void;
}

export const RegistrationSegmentSelector: React.FC<RegistrationSegmentSelectorProps> = ({
  onSelectSegment
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-black tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Registration Portal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight font-display">
          Select Your Competition Category
        </h1>
        <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
          Choose between team presentation or individual creative blitz writing to proceed with your registration.
        </p>
      </div>

      {/* Two Clean Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Option 1: Textile Presentation Registration */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectSegment('presentation')}
          className="group relative bg-white rounded-3xl border-2 border-emerald-500/40 hover:border-emerald-500 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Top Decorative Banner Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0A192F] via-[#22C55E] to-[#84CC16]" />

          <div className="space-y-5">
            {/* Header with Icon & Fee Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition-colors duration-300 shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Registration Fee</span>
                <span className="text-xl sm:text-2xl font-black text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
                  149 BDT
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">per team</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200 mb-2">
                <span>Team Competition • 1–3 Members</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] font-display group-hover:text-[#16A34A] transition-colors">
                Textile Presentation Registration
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Form a team of 1 to 3 members and present innovative textile engineering concepts live on stage at BTEC Auditorium.
              </p>
            </div>

            {/* Key Features List */}
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>1 to 3 members team presentation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Instant Digital PDF Entry Pass generated</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Trophy, Certificate &amp; Cash Prize</span>
              </li>
            </ul>
          </div>

          {/* Action CTA Button */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0A192F] group-hover:bg-[#16A34A] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>Register for Textile Presentation</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Option 2: Textile Blitz Writing */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelectSegment('blitz')}
          className="group relative bg-white rounded-3xl border-2 border-[#1E90FF]/40 hover:border-[#1E90FF] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Top Decorative Banner Accent - Dodger Blue Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0066CC] via-[#1E90FF] to-[#38BDF8]" />

          <div className="space-y-5">
            {/* Header with Icon & Fee Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1E90FF] group-hover:bg-[#1E90FF] group-hover:text-white transition-colors duration-300 shadow-xs">
                <PenTool className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">Registration Fee</span>
                <span className="text-xl sm:text-2xl font-black text-[#0A192F] group-hover:text-[#1E90FF] transition-colors">
                  49 BDT
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">per participant</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0066CC] text-[11px] font-extrabold border border-sky-200 mb-2">
                <span>Solo Writing • Individual</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A192F] font-display group-hover:text-[#1E90FF] transition-colors">
                Textile Blitz Writing
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Showcase your creative and technical writing skills on cutting-edge textile developments and industry breakthroughs.
              </p>
            </div>

            {/* Key Features List */}
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E90FF] shrink-0" />
                <span>Solo individual registration (Batches 13–16)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E90FF] shrink-0" />
                <span>Instant Digital PDF Entry Pass generated</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E90FF] shrink-0" />
                <span>Certificate of Excellence &amp; Publication</span>
              </li>
            </ul>
          </div>

          {/* Action CTA Button */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0A192F] group-hover:bg-gradient-to-r group-hover:from-[#1E90FF] group-hover:to-[#0066CC] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg group-hover:shadow-[#1E90FF]/25 cursor-pointer"
            >
              <span>Register for Blitz Writing</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
