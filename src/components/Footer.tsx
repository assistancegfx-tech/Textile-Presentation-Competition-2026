import React from 'react';
import { ArrowUp } from 'lucide-react';
import { BtecLogo, CareerClubLogo } from './Logos';
import { PageId } from '../types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A192F] text-white pt-12 pb-10 border-t border-slate-800 relative mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between pb-8 border-b border-slate-800 gap-6 text-center md:text-left">
          {/* Brand & Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center focus:outline-none hover:opacity-90 transition"
              aria-label="Career Club BTEC Home"
            >
              <CareerClubLogo className="w-14 h-14 shrink-0 drop-shadow-sm" />
            </button>
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
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-[#22C55E] transition"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('event')}
              className="hover:text-[#22C55E] transition"
            >
              Event Details
            </button>
            <button
              onClick={() => onNavigate('registration')}
              className="hover:text-[#22C55E] transition text-[#22C55E]"
            >
              Registration
            </button>
            <button
              onClick={() => onNavigate('guidelines')}
              className="hover:text-[#22C55E] transition"
            >
              Guidelines
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-[#22C55E] transition"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={scrollToTop}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-[#22C55E] hover:text-[#0A192F] flex items-center justify-center transition"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
          <p>© 2026 Career Club BTEC. All Rights Reserved.</p>
          <p className="text-slate-500 text-[11px]">
            Barishal Textile Engineering College • Department of Textiles, Ministry of Textiles and Jute, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
};
