import React from 'react';
import { Phone, Mail, MessageSquare, Globe, ExternalLink, MapPin, Building2 } from 'lucide-react';
import { BtecLogo, CareerClubLogo } from './Logos';

export const ContactSection: React.FC = () => {
  const contactLinks = [
    {
      label: 'WhatsApp Support',
      value: '+880 1798-246810',
      href: 'https://wa.me/8801798246810',
      description: 'Quick response for registration & payment help',
      icon: MessageSquare,
      color: 'bg-[#22C55E]/10 text-[#15803D]'
    },
    {
      label: 'Facebook Page',
      value: 'facebook.com/careerclub.btec',
      href: 'https://facebook.com/careerclub.btec',
      description: 'Official announcements and notices',
      icon: Globe,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Official Email',
      value: 'careerclubbtec@gmail.com',
      href: 'mailto:careerclubbtec@gmail.com',
      description: 'Slide submissions and formal inquiries',
      icon: Mail,
      color: 'bg-emerald-50 text-emerald-800'
    },
    {
      label: 'Helpline Phone',
      value: '+880 1798-246810',
      href: 'tel:+8801798246810',
      description: 'Available 9:00 AM – 9:00 PM BST daily',
      icon: Phone,
      color: 'bg-slate-100 text-slate-800'
    }
  ];

  return (
    <div className="py-12 md:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
          Contact & Support
        </h1>
        <p className="text-slate-600 text-sm">
          Career Club BTEC • Barishal Textile Engineering College
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 space-y-8">
        {/* Organizer Identity Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100 text-center sm:text-left">
          <CareerClubLogo className="w-16 h-16 shrink-0 drop-shadow-sm" />
          <div>
            <h2 className="text-lg font-black text-[#0A192F] font-['Outfit']">
              Career Club BTEC
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Barishal Textile Engineering College • Department of Textiles, Ministry of Textiles and Jute
            </p>
          </div>
        </div>

        {/* 4 Clickable Contact Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#FAFBF9] hover:bg-white hover:border-[#16A34A] transition shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#16A34A] transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {item.label}
                  </span>
                  <p className="text-sm font-bold text-[#0A192F] group-hover:text-[#16A34A] transition-colors">
                    {item.value}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {item.description}
                </p>
              </a>
            );
          })}
        </div>

        {/* Venue Location Details */}
        <div className="p-4 rounded-2xl bg-[#FAFBF9] border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <MapPin className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-slate-900 font-bold">Auditorium Location:</strong>
            <p>Barishal Textile Engineering College Auditorium</p>
            <p className="text-slate-500">C&B Road, Barishal - 8200, Bangladesh</p>
          </div>
        </div>
      </div>
    </div>
  );
};
