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
import { ViewEditRegistrationModal } from './components/ViewEditRegistrationModal';
import { GoogleSheetSettingsModal } from './components/GoogleSheetSettingsModal';
import { SuccessView } from './components/SuccessView';
import { TextileGridBackground } from './components/TextileMotifs';
import { RegistrationTicker } from './components/RegistrationTicker';
import { PageId } from './types';
import { FileText, ArrowLeft } from 'lucide-react';

function parseHashToPage(): PageId {
  const path = window.location.pathname.toLowerCase().replace(/^\/+/, '');
  if (path === 'registration-success' || path === 'success') return 'registration-success';
  if (path === 'event') return 'event';
  if (path === 'registration' || path === 'register') return 'registration';
  if (path === 'guidelines' || path === 'rules') return 'guidelines';
  if (path === 'contact' || path === 'support') return 'contact';

  // If path is a voucher or registration lookup link, stay on home and trigger modal
  if (
    path === 'download-voucher' ||
    path === 'download-entry-voucher' ||
    path === 'download-your-entry-voucher' ||
    path === 'entry-voucher' ||
    path === 'voucher' ||
    path === 'view-registration' ||
    path === 'view-your-registration'
  ) {
    return 'home';
  }

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
  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [viewEditRegId, setViewEditRegId] = useState('');
  const [viewEditRoll, setViewEditRoll] = useState('');
  const [viewEditMobile, setViewEditMobile] = useState('');
  const [viewEditAutoSearch, setViewEditAutoSearch] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);

  const handleOpenViewEdit = (regId?: string, roll?: string, mobile?: string, autoSearch = false) => {
    setViewEditRegId(regId || '');
    setViewEditRoll(roll || '');
    setViewEditMobile(mobile || '');
    setViewEditAutoSearch(autoSearch);
    setIsViewEditModalOpen(true);
  };

  const handleCloseViewEdit = () => {
    setIsViewEditModalOpen(false);
    setViewEditAutoSearch(false);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('action') || url.searchParams.has('regId') || url.searchParams.has('roll') || url.searchParams.has('mobile')) {
        url.searchParams.delete('action');
        url.searchParams.delete('regId');
        url.searchParams.delete('roll');
        url.searchParams.delete('mobile');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
    } catch (_) {}
  };

  const handleOpenGoogleSheet = () => {
    setIsGoogleSheetModalOpen(true);
  };

  // Sync with browser back/forward, popstate, URL hash, and email action links
  useEffect(() => {
    const handleUrlChange = () => {
      const newPage = parseHashToPage();
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const checkUrlParams = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashStr = window.location.hash || '';
        const hashParams = hashStr.includes('?') ? new URLSearchParams(hashStr.split('?')[1]) : null;
        const rawPath = window.location.pathname.toLowerCase().replace(/^\/+/, '');

        const action = (searchParams.get('action') || hashParams?.get('action') || '').toLowerCase();
        const paramRegId = searchParams.get('regId') || searchParams.get('reg') || hashParams?.get('regId') || hashParams?.get('reg');
        const paramRoll = searchParams.get('roll') || searchParams.get('leaderRoll') || hashParams?.get('roll');
        const paramMobile = searchParams.get('mobile') || searchParams.get('phone') || searchParams.get('leaderMobile') || hashParams?.get('mobile');

        const isViewAction = 
          action === 'view-registration' || 
          action === 'view-your-registration' ||
          action === 'download-voucher' || 
          action === 'download-entry-voucher' || 
          action === 'download-your-entry-voucher' || 
          action === 'entry-voucher' ||
          action === 'voucher' || 
          action === 'download' || 
          action === 'view' ||
          rawPath === 'view-registration' ||
          rawPath === 'view-your-registration' ||
          rawPath === 'download-voucher' ||
          rawPath === 'download-entry-voucher' ||
          rawPath === 'download-your-entry-voucher' ||
          rawPath === 'entry-voucher' ||
          rawPath === 'voucher';

        if (isViewAction || paramRegId || paramRoll) {
          handleOpenViewEdit(paramRegId || '', paramRoll || '', paramMobile || '', Boolean(paramRegId || paramRoll));
        }
      } catch (err) {
        console.warn('Error reading URL parameters:', err);
      }
    };

    checkUrlParams();

    const handleRegistrationUpdated = (e: any) => {
      const updated = e.detail;
      if (updated && updated.registrationId) {
        setLatestRegistration(prev => {
          if (!prev || prev.result?.registrationId?.toUpperCase() === updated.registrationId.toUpperCase()) {
            return {
              result: {
                ...(prev?.result || {}),
                success: true,
                registrationId: updated.registrationId,
                submissionDate: updated.submissionDate,
                paymentStatus: updated.paymentStatus,
                editCount: updated.editCount,
                remainingEdits: updated.remainingEdits
              },
              formData: updated.formData
            };
          }
          return prev;
        });
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('tpc2026_registration_updated', handleRegistrationUpdated);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('tpc2026_registration_updated', handleRegistrationUpdated);
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#0A192F] relative selection:bg-[#22C55E]/25 selection:text-[#0A192F]">
      {/* Background Textile Weave Pattern */}
      <TextileGridBackground />

      {/* Sticky Header Navigation with Page Tabs */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateToPage}
        onOpenViewEditModal={handleOpenViewEdit}
        onOpenGoogleSheetModal={handleOpenGoogleSheet}
      />

      {/* Infinite Scrolling Registration Counter Marquee Ticker (Displayed exclusively on Home Page) */}
      {currentPage === 'home' && (
        <RegistrationTicker onNavigate={navigateToPage} />
      )}

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
              <HeroSection
                onNavigate={navigateToPage}
                onOpenViewEditModal={handleOpenViewEdit}
              />
            )}

            {currentPage === 'event' && (
              <EventInfoSection onNavigate={navigateToPage} />
            )}

            {currentPage === 'registration' && (
              <RegistrationForm
                onOpenViewEditModal={handleOpenViewEdit}
                onOpenGoogleSheetModal={handleOpenGoogleSheet}
                onRegistrationSuccess={(result, formData) => {
                  setLatestRegistration({ result, formData });
                  try {
                    window.dispatchEvent(new CustomEvent('tpc_registration_success'));
                  } catch (_) {}
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
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center shadow-sm max-w-lg mx-auto my-12">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#22C55E]">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0A192F] mb-2 font-display">No Active Registration Found</h2>
                    <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                      You haven't submitted a registration in this session yet, or the session was reset. Register your team to receive your official Registration ID and verification entry pass.
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
      <Footer
        onNavigate={navigateToPage}
        onOpenGoogleSheetModal={handleOpenGoogleSheet}
      />

      {/* Find & Edit Registration Modal (up to 3 edits allowed) */}
      <ViewEditRegistrationModal
        isOpen={isViewEditModalOpen}
        onClose={handleCloseViewEdit}
        initialRegId={viewEditRegId}
        initialRoll={viewEditRoll}
        initialMobile={viewEditMobile}
        autoSearch={viewEditAutoSearch}
        onUpdated={(updated) => {
          setLatestRegistration(prev => {
            if (!prev || prev.result?.registrationId?.toUpperCase() === updated.registrationId.toUpperCase()) {
              return {
                result: {
                  ...(prev?.result || {}),
                  success: true,
                  registrationId: updated.registrationId,
                  submissionDate: updated.submissionDate,
                  paymentStatus: updated.paymentStatus,
                  editCount: updated.editCount,
                  remainingEdits: updated.remainingEdits
                },
                formData: updated.formData
              };
            }
            return prev;
          });
        }}
      />

      {/* Google Sheet Live Sync Setup Modal (25 Columns) */}
      <GoogleSheetSettingsModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
      />
    </div>
  );
}
