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
  <div className={`relative inline-flex items-center justify-center overflow-visible ${className}`}>
    <svg viewBox="0 0 240 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-60 sm:w-80 md:w-96 overflow-visible animate-weave-sway">
      <defs>
        <linearGradient id="weaveGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="25%" stopColor="#22C55E" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="75%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="weaveGradientGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#84CC16" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#84CC16" />
        </linearGradient>
        <filter id="softWeaveGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Static background warp guidelines */}
      <path
        d="M6 14C20 3 34 25 48 14C62 3 76 25 90 14C104 3 118 25 132 14C146 3 160 25 174 14C188 3 202 25 216 14C224 8 232 18 234 14"
        stroke="#22C55E"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.18"
      />
      <path
        d="M6 14C20 25 34 3 48 14C62 25 76 3 90 14C104 25 118 3 132 14C146 25 160 3 174 14C188 25 202 3 216 14C224 20 232 10 234 14"
        stroke="#0EA5E9"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.16"
      />

      {/* Animated primary weaving yarn (forward traveling dash wave) */}
      <path
        d="M6 14C20 3 34 25 48 14C62 3 76 25 90 14C104 3 118 25 132 14C146 3 160 25 174 14C188 3 202 25 216 14C224 8 232 18 234 14"
        stroke="url(#weaveGradientGreen)"
        strokeWidth="3.2"
        strokeLinecap="round"
        filter="url(#softWeaveGlow)"
        className="animate-weave-yarn-1"
      />

      {/* Animated counter-interlocking thread (reverse continuous loop) */}
      <path
        d="M6 14C20 25 34 3 48 14C62 25 76 3 90 14C104 25 118 3 132 14C146 25 160 3 174 14C188 25 202 3 216 14C224 20 232 10 234 14"
        stroke="url(#weaveGradientGold)"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="animate-weave-yarn-2 opacity-95"
      />

      {/* Weft crossing nodes / fabric intersections */}
      <circle cx="48" cy="14" r="2" fill="#22C55E" opacity="0.8" />
      <circle cx="90" cy="14" r="2" fill="#0EA5E9" opacity="0.8" />
      <circle cx="132" cy="14" r="2" fill="#22C55E" opacity="0.8" />
      <circle cx="174" cy="14" r="2" fill="#F59E0B" opacity="0.8" />
      <circle cx="216" cy="14" r="2" fill="#22C55E" opacity="0.8" />
    </svg>
  </div>
);
