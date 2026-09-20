import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Users,
  Presentation,
  Clock,
  Laptop,
  Shirt,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Globe,
  Award
} from 'lucide-react';
import { PageId } from '../types';

interface SegmentItem {
  id: string;
  title: string;
  icon: any;
  points: string[];
}

interface GuidelinesSectionProps {
  onNavigate?: (page: PageId) => void;
}

export const GuidelinesSection: React.FC<GuidelinesSectionProps> = ({ onNavigate }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'team-branding': true,
    'slide-structure': true,
    'time-management': true,
    'technical-design': true,
    'logistics-attire': true
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const segments: SegmentItem[] = [
    {
      id: 'team-branding',
      title: 'Team & Branding Segment',
      icon: Users,
      points: [
        'Form a 3-member team with a designated Team Leader to start.',
        'Choose a unique team and brand name.',
        'Name your Textile Brand and design a logo with a MOTTO or Theme.'
      ]
    },
    {
      id: 'slide-structure',
      title: 'Slide Structure Segment (10-12 Slides)',
      icon: Presentation,
      points: [
        'Title, team profile, brand/product intro, background, and product range (fabrics, garments, home/technical textiles).',
        'Target market segmentation, roadmap, financial plan, SWOT analysis, and sustainability/compliance.',
        'Conclusion and Q&A session.'
      ]
    },
    {
      id: 'time-management',
      title: 'Time Management Segment',
      icon: Clock,
      points: [
        '12 minutes for the main presentation.',
        '3-4 minutes per speaker.',
        '5 minutes for contingency and Q&A.'
      ]
    },
    {
      id: 'technical-design',
      title: 'Technical & Design Segment',
      icon: Laptop,
      points: [
        'PowerPoint (PPT) using relevant graphics, charts, animations, and images.',
        "Bring the presentation in a pen drive in PPT format and upload it to the course teacher's shared Google Drive."
      ]
    },
    {
      id: 'logistics-attire',
      title: 'Logistics & Attire Segment',
      icon: Shirt,
      points: [
        'Wear decent and modest professional clothing.',
        'The presentation date and marks will be announced in class.'
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-12 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3.5 py-1.5 rounded-full border border-[#22C55E]/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>CAREER CLUB BTEC</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A192F] font-['Outfit'] tracking-tight"
        >
          Textile Presentation Competition
        </motion.h1>
      </div>

      {/* Project Title Callout Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0A192F] text-[#22C55E] flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0A192F] font-['Outfit']">
            Project Title
          </h2>
        </div>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
          Assume your team is planning to establish a brand-new Textile Manufacturing / Textile Products Company in the USA, UK, France, or Australia. Your objective is to design a compelling business presentation to pitch your plan to leading global investors and secure venture financing.
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>The guidelines for the presentation are as follows:</span>
        </div>
      </motion.div>

      {/* Guidelines Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((item, idx) => {
          const Icon = item.icon;
          const isOpen = Boolean(openItems[item.id]);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + idx * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden ${
                isOpen ? 'border-slate-300 ring-1 ring-slate-200/50' : 'border-slate-200/90'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 focus:outline-none cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-emerald-50 border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center shrink-0 text-[#16A34A] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 text-slate-500"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50">
                      <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                        {item.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0 mt-2" />
                            <span className="leading-relaxed">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* For Any Query Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0A192F]">
              For Any Query
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              For Any Query, you may approach to following person through Class Representative or Email/Whatsapp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#0A192F]">Md. Shahed</p>
              <p className="text-xs text-slate-500 font-medium">President</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0A192F] text-white">
              Md. Shahed — President
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#0A192F]">Fatima Anjum Sujana</p>
              <p className="text-xs text-slate-500 font-medium">General Secretary</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#16A34A] text-white">
              Fatima Anjum Sujana — General Secretary
            </span>
          </div>
        </div>
      </motion.div>

      {/* Slogan and Project Title Footer Callout */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5 }}
        className="bg-gradient-to-r from-[#0A192F] via-[#0D213D] to-[#0A192F] rounded-3xl p-6 sm:p-8 text-center text-white space-y-3 relative overflow-hidden shadow-lg"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#22C55E] backdrop-blur-xs">
          <Award className="w-3.5 h-3.5" />
          <span>Courage • Progress • Excellency</span>
        </div>

        <h4 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-wide">
          Project Title: Career Club BTEC
        </h4>

        {onNavigate && (
          <div className="pt-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('registration')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-[#0A192F] bg-white hover:bg-[#16A34A] hover:text-white transition-all duration-200 shadow-md cursor-pointer group"
            >
              <span>Register 3-Member Team</span>
              <ArrowRight className="w-4 h-4 text-[#16A34A] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
