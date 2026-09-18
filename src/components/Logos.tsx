import React from 'react';

/**
 * Official Career Club BTEC Emblem
 * Exact vector representation of the official circular logo:
 * - Outer dark blue ring with white geometric typography: "CAREER CLUB BTEC" (top) and "COURAGE PROGRESS EXCELLENCY" (bottom)
 * - Tri-star clusters and triple horizontal green stripes
 * - Inner lime-green field with stylized white figures and eye motif
 */
export const CareerClubLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/Logo.png"
        alt="Career Club BTEC Logo"
        className="w-full h-full object-contain select-none drop-shadow-xs"
        loading="eager"
        onError={(e) => {
          // Fallback to /logo.png if case sensitivity differs
          const target = e.currentTarget;
          if (!target.src.endsWith('/logo.png')) {
            target.src = '/logo.png';
          }
        }}
      />
    </div>
  );
};

// Keep BtecLogo pointing to the single official logo
export const BtecLogo = CareerClubLogo;

export const BrandHeaderCombo: React.FC = () => (
  <div className="flex items-center gap-3">
    <CareerClubLogo className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-sm" />
    <div className="flex flex-col text-left">
      <div className="flex items-center gap-1.5">
        <span className="font-extrabold text-[#0A192F] text-sm sm:text-base tracking-tight leading-none font-['Outfit']">
          CAREER CLUB BTEC
        </span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#98C427]/20 text-[#184A74]">
          Official
        </span>
      </div>
      <span className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
        Barishal Textile Engineering College
      </span>
    </div>
  </div>
);

