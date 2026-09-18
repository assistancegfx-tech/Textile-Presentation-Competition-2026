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
import { ViewEditRegistrationModal } from './components/ViewEditRegistrationModal';
import { GmailModal } from './components/GmailModal';
import { SuccessView } from './components/SuccessView';
import { TextileGridBackground } from './components/TextileMotifs';
import { PageId } from './types';
import { FileText, ArrowLeft } from 'lucide-react';

function parseHashToPage(): PageId {
  const path = window.location.pathname.toLowerCase().replace(/^\/+/, '');
  if (path === 'registration-success' || path === 'success') return 'registration-success';
  if (path === 'event') return 'event';
  if (path === 'registration' || path === 'register') return 'registration';
  if (path === 'guidelines' || path === 'rules') return 'guidelines';
  if (path === 'contact' || path === 'support') return 'contact';

  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
  if (hash === 'registration-success' || hash === 'success') return 'registration-success';
  if (hash === 'event') return 'event';
  if (hash === 'registration' || hash === 'register') return 'registration';
  if (hash === 'guidelines' || hash === 'rules') return 'guidelines';
  if (hash === 'contact' || hash === 'support') return 'contact';
  return 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>(() => parseHashToPage());
  const [latestRegistration, setLatestRegistration] = useState<{
    result: any;
    formData: any;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('tpc2026_latest_submission');
      if (saved) return JSON.parse(saved);
      const listStr = localStorage.getItem('tpc2026_saved_registrations');
      if (listStr) {
        const list = JSON.parse(listStr);
        if (list.length > 0) {
          return {
            result: {
              success: true,
              registrationId: list[0].registrationId,
              submissionDate: list[0].submissionDate,
              paymentStatus: list[0].paymentStatus,
              editCount: list[0].editCount,
              remainingEdits: list[0].remainingEdits
            },
            formData: list[0].formData
          };
        }
      }
    } catch (_) {}
    return null;
  });
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [viewEditRegId, setViewEditRegId] = useState('');
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [gmailPrefillData, setGmailPrefillData] = useState<any>(null);
  const [customScriptUrl, setCustomScriptUrl] = useState<string>(() => {
    return localStorage.getItem('tpc2026_google_script_url') || '';
  });
  const [isEnvConfigured, setIsEnvConfigured] = useState(false);
  const [hasOAuthSheet, setHasOAuthSheet] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('tpc2026_active_spreadsheet_id'));
  });

  const handleOpenViewEdit = (regId?: string) => {
    setViewEditRegId(regId || '');
    setIsViewEditModalOpen(true);
  };

  const handleOpenGmail = (prefill?: any) => {
    setGmailPrefillData(prefill || null);
    setIsGmailModalOpen(true);
  };

  // Sync with browser back/forward, popstate, and URL hash
  useEffect(() => {
    const handleUrlChange = () => {
      const newPage = parseHashToPage();
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateToPage = (page: PageId) => {
    setCurrentPage(page);
    if (page === 'registration-success') {
      try {
        window.history.pushState({}, '', '/registration-success');
      } catch (_) {}
      window.location.hash = '#/registration-success';
    } else {
      try {
        window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
      } catch (_) {}
      window.location.hash = `#/${page}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Check backend configuration safely
    fetch('/api/config')
      .then(async (res) => {
        const raw = await res.text();
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .then((data) => {
        if (data?.hasGoogleScript) {
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
        onOpenViewEditModal={handleOpenViewEdit}
        onOpenGmailModal={handleOpenGmail}
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
              <RegistrationForm
                customScriptUrl={customScriptUrl}
                onOpenViewEditModal={handleOpenViewEdit}
                onOpenGmailModal={handleOpenGmail}
                onRegistrationSuccess={(result, formData) => {
                  setLatestRegistration({ result, formData });
                  navigateToPage('registration-success');
                }}
              />
            )}

            {currentPage === 'registration-success' && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                {latestRegistration ? (
                  <SuccessView
                    result={latestRegistration.result}
                    formData={latestRegistration.formData}
                    onClose={() => navigateToPage('home')}
                    onRegisterAnother={() => navigateToPage('registration')}
                    onOpenGmailModal={handleOpenGmail}
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center shadow-sm max-w-lg mx-auto my-12">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#22C55E]">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0A192F] mb-2 font-display">No Active Registration Found</h2>
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                      You haven't submitted a registration in this session yet, or the session was reset. Register your team to receive your official Registration ID and verification voucher.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => navigateToPage('registration')}
                        className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-slate-900 font-semibold rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        Go to Registration Form
                      </button>
                      <button
                        onClick={() => navigateToPage('home')}
                        className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Find & Edit Registration Modal (up to 3 edits allowed) */}
      <ViewEditRegistrationModal
        isOpen={isViewEditModalOpen}
        onClose={() => setIsViewEditModalOpen(false)}
        initialRegId={viewEditRegId}
        onOpenGmailModal={handleOpenGmail}
      />

      {/* Gmail Communications & Notification Hub */}
      <GmailModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        prefillData={gmailPrefillData}
      />

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
