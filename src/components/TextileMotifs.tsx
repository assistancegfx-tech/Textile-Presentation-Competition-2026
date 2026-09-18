import React from 'react';

export const TextileGridBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.045] overflow-hidden -z-10">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="textileGrid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#0A192F" strokeWidth="1" />
          <circle cx="16" cy="16" r="1" fill="#16A34A" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#textileGrid)" />
    </svg>
  </div>
);

export const WeaveDecorativeAccent: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`h-5 w-auto ${className}`}>
    <path d="M2 12C14 2 26 22 38 12C50 2 62 22 74 12C86 2 98 22 110 12C122 2 134 22 146 12C152 7 158 15 158 12" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
    <path d="M2 12C14 22 26 2 38 12C50 22 62 2 74 12C86 22 98 2 110 12C122 22 134 2 146 12" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
  </svg>
);
