import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, ArrowRight, Search, Database } from 'lucide-react';
import { BrandHeaderCombo } from './Logos';
import { PageId } from '../types';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenViewEditModal?: (regId?: string) => void;
  onOpenGoogleSheetModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenViewEditModal,
  onOpenGoogleSheetModal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'event', label: 'Event Details' },
    { id: 'registration', label: 'Registration' },
    { id: 'guidelines', label: 'Guidelines' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (page: PageId) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5'
          : 'bg-[#F8FAF9]/95 backdrop-blur-sm border-b border-slate-200/50 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & College */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleNavClick('home')}
            className="group flex items-center focus:outline-none text-left cursor-pointer"
          >
            <BrandHeaderCombo />
          </motion.button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-semibold text-slate-700 bg-white/70 p-1.5 rounded-full border border-slate-200/70 shadow-2xs">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 rounded-full transition text-xs font-bold cursor-pointer ${
                    isActive
                      ? 'bg-[#0A192F] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0A192F] hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            {/* View Your Registration CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onOpenViewEditModal?.()}
              title="View and Edit registration details (up to 3 times)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#0A192F] transition shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>View Your Registration</span>
            </motion.button>

            {/* Primary CTA button to Registration page */}
            {currentPage !== 'registration' && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleNavClick('registration')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-xs border border-[#0A192F] cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
              </motion.button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {currentPage !== 'registration' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => handleNavClick('registration')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0A192F]"
              >
                Register
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 font-medium text-slate-800 text-sm">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-2.5 px-3 rounded-xl transition text-xs font-bold flex items-center justify-between ${
                    isActive
                      ? 'bg-[#0A192F] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />}
                </motion.button>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenViewEditModal?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-800 shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#16A34A]" />
              <span>View Your Registration</span>
            </motion.button>
          </div>
        </div>
      )}
    </header>
  );
};
