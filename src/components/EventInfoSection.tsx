import React from 'react';
import { Calendar, MapPin, Building2, Presentation, Users, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { PageId } from '../types';

interface EventInfoSectionProps {
  onNavigate?: (page: PageId) => void;
}

export const EventInfoSection: React.FC<EventInfoSectionProps> = ({ onNavigate }) => {
  const cards = [
    {
      label: 'Event Name',
      value: 'Textile Presentation Competition 2026',
      subtext: 'Flagship academic engineering presentation event',
      icon: Presentation,
      iconColor: 'text-[#22C55E]',
      iconBg: 'bg-[#0A192F]'
    },
    {
      label: 'Event Date',
      value: '4 October 2026',
      subtext: 'Sunday • Commencing at 9:00 AM BST',
      icon: Calendar,
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#22C55E]/15'
    },
    {
      label: 'Venue',
      value: 'BTEC Auditorium',
      subtext: 'Barishal Textile Engineering College Campus',
      icon: MapPin,
      iconColor: 'text-[#0A192F]',
      iconBg: 'bg-slate-100'
    },
    {
      label: 'Organized by',
      value: 'Career Club BTEC',
      subtext: 'Department of Textiles, Ministry of Textiles and Jute',
      icon: Building2,
      iconColor: 'text-[#4D7C0F]',
      iconBg: 'bg-[#84CC16]/20'
    }
  ];

  const tracks = [
    'Smart Textiles & Nanotechnology',
    'Sustainable Wet Processing & Effluent Reduction',
    'Yarn & Spinning Process Optimization',
    'Technical Apparel Manufacturing & Automation',
    'Circular Economy & Recycled Fibers',
    'Supply Chain Digitization & Quality Systems'
  ];

  return (
    <div className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full">
          Event Overview
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
          Event Details & Format
        </h1>
        <p className="text-slate-600 text-sm">
          Everything you need to know about the Textile Presentation Competition 2026.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#16A34A]/50 transition"
            >
              <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-3.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block mb-1">
                {item.label}
              </span>
              <h3 className="text-sm font-extrabold text-[#0A192F] mb-1">
                {item.value}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Team Structure + Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Model Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0A192F]">Team Composition</h3>
              <p className="text-xs text-slate-500">Strictly 3 members per registered team</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>1 Group Leader</strong>: Primary contact person and coordinator for the team.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span><strong>2 Team Members</strong>: Active co-presenters on stage during the jury round.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>Cross-batch and cross-departmental teams are welcome.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>Each student can only register in one team.</span>
            </li>
          </ul>
        </div>

        {/* Suggested Presentation Themes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#0A192F]/10 text-[#0A192F] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0A192F]">Suggested Presentation Tracks</h3>
              <p className="text-xs text-slate-500">Original research, innovation or case studies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {tracks.map((track, tIdx) => (
              <div key={tIdx} className="flex items-center gap-2 p-2 rounded-lg bg-[#FAFBF9] border border-slate-200/60 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                <span className="font-semibold">{track}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA Banner */}
      {onNavigate && (
        <div className="bg-[#FAFBF9] rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div>
            <h4 className="text-base font-extrabold text-[#0A192F]">Ready to participate?</h4>
            <p className="text-xs text-slate-500">
              Registration fee is 300 BDT per team. Secure your auditorium presentation slot.
            </p>
          </div>

          <button
            onClick={() => onNavigate('registration')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-xs whitespace-nowrap"
          >
            <span>Go to Registration Form</span>
            <ArrowRight className="w-4 h-4 text-[#22C55E]" />
          </button>
        </div>
      )}
    </div>
  );
};
