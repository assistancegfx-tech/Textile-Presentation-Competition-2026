/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { EventInfoSection } from './components/EventInfoSection';
import { RegistrationForm } from './components/RegistrationForm';
import { GuidelinesSection } from './components/GuidelinesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { TextileGridBackground } from './components/TextileMotifs';
import { PageId } from './types';

function parseHashToPage(): PageId {
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (hash === 'event') return 'event';
  if (hash === 'registration' || hash === 'register') return 'registration';
  if (hash === 'guidelines' || hash === 'rules') return 'guidelines';
  if (hash === 'contact' || hash === 'support') return 'contact';
  return 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => parseHashToPage());
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [customScriptUrl, setCustomScriptUrl] = useState<string>(() => {
    return localStorage.getItem('tpc2026_google_script_url') || '';
  });
  const [isEnvConfigured, setIsEnvConfigured] = useState(false);
  const [hasOAuthSheet, setHasOAuthSheet] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('tpc2026_active_spreadsheet_id'));
  });

  // Sync with browser back/forward and URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = parseHashToPage();
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToPage = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Check backend configuration
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGoogleScript) {
          setIsEnvConfigured(true);
        }
      })
      .catch(() => {
        // Safe silent catch
      });
  }, []);

  const handleSaveScriptUrl = (url: string) => {
    setCustomScriptUrl(url);
    if (url) {
      localStorage.setItem('tpc2026_google_script_url', url);
    } else {
      localStorage.removeItem('tpc2026_google_script_url');
    }
  };

  const isConnected = Boolean(hasOAuthSheet || customScriptUrl || isEnvConfigured);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#0A192F] relative selection:bg-[#22C55E]/25 selection:text-[#0A192F]">
      {/* Background Textile Weave Pattern */}
      <TextileGridBackground />

      {/* Sticky Header Navigation with Page Tabs */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateToPage}
        onOpenGoogleSheetsModal={() => setIsSheetsModalOpen(true)}
        isSheetsConfigured={isConnected}
      />

      {/* Distinct Dedicated Page View with Subtle Fade-in Transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {currentPage === 'home' && (
              <HeroSection onNavigate={navigateToPage} />
            )}

            {currentPage === 'event' && (
              <EventInfoSection onNavigate={navigateToPage} />
            )}

            {currentPage === 'registration' && (
              <RegistrationForm customScriptUrl={customScriptUrl} />
            )}

            {currentPage === 'guidelines' && (
              <GuidelinesSection onNavigate={navigateToPage} />
            )}

            {currentPage === 'contact' && (
              <ContactSection />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Official Footer with Multi-Page Navigation */}
      <Footer onNavigate={navigateToPage} />

      {/* Google Sheets Integration Modal for Organizers */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => {
          setIsSheetsModalOpen(false);
          setHasOAuthSheet(Boolean(localStorage.getItem('tpc2026_active_spreadsheet_id')));
        }}
        scriptUrl={customScriptUrl}
        onSaveScriptUrl={handleSaveScriptUrl}
        isEnvConfigured={isEnvConfigured}
      />
    </div>
  );
}
