import React from 'react';
import { motion } from 'motion/react';
import { ArrowUp, Code2 } from 'lucide-react';
import { CareerClubLogo } from './Logos';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenGoogleSheetModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenGoogleSheetModal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A192F] text-white pt-12 pb-10 border-t border-slate-800 relative mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between pb-8 border-b border-slate-800 gap-6 text-center md:text-left">
          {/* Brand & Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('home')}
              className="flex items-center focus:outline-none hover:opacity-90 transition cursor-pointer"
              aria-label="Career Club BTEC Home"
            >
              <CareerClubLogo className="w-14 h-14 shrink-0 drop-shadow-sm" />
            </motion.button>
            <div>
              <h3 className="text-lg font-black tracking-tight font-['Outfit']">
                Textile Presentation Competition 2026
              </h3>
              <p className="text-xs text-[#22C55E] font-bold">
                Organized by Career Club BTEC
              </p>
              <p className="text-xs text-slate-400">
                Barishal Textile Engineering College
              </p>
            </div>
          </div>

          {/* Quick links & Back to Top */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 font-semibold">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('home')}
              className="hover:text-[#22C55E] transition cursor-pointer"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('event')}
              className="hover:text-[#22C55E] transition cursor-pointer"
            >
              Event Details
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('registration')}
              className="hover:text-[#22C55E] transition text-[#22C55E] cursor-pointer"
            >
              Registration
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('guidelines')}
              className="hover:text-[#22C55E] transition cursor-pointer"
            >
              Guidelines
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('contact')}
              className="hover:text-[#22C55E] transition cursor-pointer"
            >
              Contact
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={scrollToTop}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-[#22C55E] hover:text-[#0A192F] flex items-center justify-center transition cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Team Credit & Copyright line */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p>© 2026 Career Club BTEC. All Rights Reserved.</p>
            <p className="text-slate-500 text-[11px]">
              Barishal Textile Engineering College • Department of Textiles, Ministry of Textiles and Jute, Bangladesh
            </p>
          </div>

          {/* IT Wing - CCB Credit Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 shadow-2xs">
            <Code2 className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Developed & Maintained by</span>
            <span className="font-bold text-white tracking-wide bg-gradient-to-r from-[#22C55E] to-emerald-300 bg-clip-text text-transparent">
              IT Wing - CCB
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

