import React, { useState } from 'react';
import { ChevronDown, Users, Clock, Lightbulb, GraduationCap, Calendar, FileText, Award, CreditCard, ArrowRight } from 'lucide-react';
import { PageId } from '../types';

interface GuidelineItem {
  id: string;
  title: string;
  icon: any;
  summary: string;
  points: string[];
}

interface GuidelinesSectionProps {
  onNavigate?: (page: PageId) => void;
}

export const GuidelinesSection: React.FC<GuidelinesSectionProps> = ({ onNavigate }) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'team-req': true,
    'duration': true,
    'judging': true
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const guidelines: GuidelineItem[] = [
    {
      id: 'team-req',
      title: 'Team Requirements',
      icon: Users,
      summary: '3 members per team (1 Group Leader + 2 Members).',
      points: [
        'Each team must consist of exactly three undergraduate students from BTEC.',
        'One member serves as the Group Leader and primary contact.',
        'Cross-departmental and inter-batch teams are allowed and welcomed.',
        'No student can register in more than one team.'
      ]
    },
    {
      id: 'duration',
      title: 'Presentation Duration & Timing',
      icon: Clock,
      summary: '8 minutes presentation + 3 minutes jury defense.',
      points: [
        '8 Minutes: Team presentation on the auditorium stage.',
        '3 Minutes: Q&A session with the faculty and guest jury.',
        'Warning bell sounds at 7 minutes.',
        'All three team members must actively speak during the presentation.'
      ]
    },
    {
      id: 'topic-req',
      title: 'Topic Requirements',
      icon: Lightbulb,
      summary: 'Original textile engineering, technology, or research topic.',
      points: [
        'Topics can cover yarn, fabric, wet process, apparel, smart textiles, or supply chain.',
        'Presentations should highlight innovation and practical industrial applications.',
        'Plagiarism exceeding 15% will result in disqualification.'
      ]
    },
    {
      id: 'eligibility',
      title: 'Eligibility Criteria',
      icon: GraduationCap,
      summary: 'Open to all current undergraduate students of BTEC.',
      points: [
        'Open to all active batches (1st to 4th year).',
        'Valid BTEC student identity card required on event day at registration desk.'
      ]
    },
    {
      id: 'deadline',
      title: 'Registration & Slide Deadlines',
      icon: Calendar,
      summary: 'Online registration closes on 28 September 2026.',
      points: [
        'Online registration deadline: 28 September 2026 at 11:59 PM BST.',
        'PowerPoint / PDF slide submission deadline: 1 October 2026.',
        'Event Date: 4 October 2026 at 9:00 AM.'
      ]
    },
    {
      id: 'rules',
      title: 'Presentation Deck Rules',
      icon: FileText,
      summary: 'Standard 16:9 widescreen format (PPTX / PDF).',
      points: [
        'Slide format: 16:9 widescreen.',
        'Slide count: 10 to 14 slides recommended.',
        'Formal business or smart-formal attire recommended for presenters.'
      ]
    },
    {
      id: 'judging',
      title: 'Judging Criteria (100 Points Total)',
      icon: Award,
      summary: 'Evaluated on Innovation, Presentation Delivery, and Q&A Defense.',
      points: [
        'Innovation & Technical Rigor (30 Points)',
        'Delivery & Stage Presence (25 Points)',
        'Jury Q&A Defense (25 Points)',
        'Slide Design & Visual Structure (20 Points)'
      ]
    },
    {
      id: 'payment-info',
      title: 'Payment Information',
      icon: CreditCard,
      summary: '300 BDT per team via bKash personal Send Money.',
      points: [
        'Fee covers all 3 team members, kits, refreshments, and official certificates.',
        'Pay to 01798246810 (Send Money) and enter the Transaction ID during registration.'
      ]
    }
  ];

  return (
    <div className="py-12 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full">
          Official Rulebook
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
          Competition Guidelines
        </h1>
        <p className="text-slate-600 text-sm">
          Rules, presentation timing, eligibility, and scoring rubric for the Textile Presentation Competition 2026.
        </p>
      </div>

      {/* Clean Accordion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {guidelines.map((item) => {
          const Icon = item.icon;
          const isOpen = Boolean(openItems[item.id]);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-3 focus:outline-none"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAFBF9] border border-slate-200 flex items-center justify-center shrink-0 text-[#16A34A] mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0A192F]">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.summary}</p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 transition-transform ${
                    isOpen ? 'rotate-180 text-[#16A34A]' : ''
                  }`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action CTA Banner */}
      {onNavigate && (
        <div className="bg-[#FAFBF9] rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div>
            <h4 className="text-base font-extrabold text-[#0A192F]">Ready to present your ideas?</h4>
            <p className="text-xs text-slate-500">
              Form your 3-member team and register before the deadline.
            </p>
          </div>

          <button
            onClick={() => onNavigate('registration')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-xs whitespace-nowrap"
          >
            <span>Register Your Team</span>
            <ArrowRight className="w-4 h-4 text-[#22C55E]" />
          </button>
        </div>
      )}
    </div>
  );
};
