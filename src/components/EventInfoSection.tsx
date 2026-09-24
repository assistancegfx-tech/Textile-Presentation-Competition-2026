import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Building2, Presentation, Users, ArrowRight, CheckCircle2, Clock, Lock } from 'lucide-react';
import { PageId } from '../types';
import {
  isRegistrationClosed,
  REGISTRATION_DEADLINE_SHORT,
  REGISTRATION_DEADLINE_LABEL,
  EVENT_DATE_SHORT,
  EVENT_VENUE
} from '../utils/deadline';

interface EventInfoSectionProps {
  onNavigate?: (page: PageId) => void;
}

export const EventInfoSection: React.FC<EventInfoSectionProps> = ({ onNavigate }) => {
  const isClosed = isRegistrationClosed();

  const cards = [
    {
      label: 'Registration Deadline',
      value: REGISTRATION_DEADLINE_SHORT,
      subtext: 'Wednesday • Closes at 11:59 PM BST',
      icon: Clock,
      iconColor: isClosed ? 'text-rose-600' : 'text-amber-600',
      iconBg: isClosed ? 'bg-rose-100' : 'bg-amber-100'
    },
    {
      label: 'Event Date',
      value: EVENT_DATE_SHORT,
      subtext: 'Sunday • Commencing at 9:00 AM BST',
      icon: Calendar,
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#22C55E]/15'
    },
    {
      label: 'Venue',
      value: EVENT_VENUE,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10"
    >
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
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + idx * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#16A34A]/50 transition cursor-default"
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
            </motion.div>
          );
        })}
      </div>

      {/* Team Composition Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-2xs space-y-5 max-w-3xl mx-auto w-full"
      >
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0A192F]">Team Composition</h3>
            <p className="text-xs text-slate-500">Strictly 3 members per registered team</p>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFBF9] border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span><strong>1 Group Leader</strong>: Primary contact person and coordinator for the team.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFBF9] border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span><strong>2 Team Members</strong>: Active co-presenters on stage during the jury round.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFBF9] border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span>Cross-batch and cross-departmental teams are welcome.</span>
          </li>
          <li className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAFBF9] border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <span>Each student can only register in one team.</span>
          </li>
        </ul>
      </motion.div>

      {/* Action CTA Banner */}
      {onNavigate && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-[#FAFBF9] rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs"
        >
          <div>
            <h4 className="text-base font-extrabold text-[#0A192F]">
              {isClosed ? 'Registration has ended' : 'Ready to participate?'}
            </h4>
            <p className="text-xs text-slate-500">
              {isClosed
                ? `Registration deadline closed on ${REGISTRATION_DEADLINE_LABEL}. Registered teams can view status and vouchers.`
                : 'Registration fee is 149 BDT per team. Secure your auditorium presentation slot before 30 September.'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('registration')}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-md whitespace-nowrap cursor-pointer group ${
              isClosed
                ? 'text-slate-800 bg-white hover:bg-slate-50 border border-slate-300'
                : 'text-white bg-[#0A192F] hover:bg-[#16A34A] border border-[#0A192F] hover:border-[#16A34A]'
            }`}
          >
            {isClosed ? (
              <>
                <Lock className="w-4 h-4 text-rose-600" />
                <span>View Registration Portal</span>
              </>
            ) : (
              <>
                <span>Go to Registration Form</span>
                <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:text-white group-hover:translate-x-1 transition-all" />
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

