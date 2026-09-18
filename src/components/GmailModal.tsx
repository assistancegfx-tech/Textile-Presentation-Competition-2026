import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Users,
  Loader2,
  RefreshCw,
  ShieldCheck,
  FileText,
  Inbox,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  getGmailProfile,
  sendGmailMessage,
  listGmailMessages,
  generateRegistrationEmailHtml,
  GmailProfile,
  GmailMessageSummary
} from '../services/gmailService';
import { googleSignIn, getAccessToken, logout } from '../services/googleAuth';
import { RegistrationFormData } from '../types';

interface GmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    recipientEmail?: string;
    registrationId?: string;
    submissionDate?: string;
    formData?: RegistrationFormData;
  };
}

export const GmailModal: React.FC<GmailModalProps> = ({
  isOpen,
  onClose,
  prefillData
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Compose State
  const [templateType, setTemplateType] = useState<'voucher' | 'update' | 'custom'>('voucher');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Mandatory Confirmation Dialog for sending email
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  // History State
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Saved registrations from local storage for quick selection
  const [savedRegistrations, setSavedRegistrations] = useState<any[]>([]);

  // Load existing token & profile on open
  useEffect(() => {
    if (!isOpen) return;

    try {
      const saved = localStorage.getItem('tpc2026_saved_registrations');
      if (saved) {
        setSavedRegistrations(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    const initToken = async () => {
      const token = await getAccessToken() || localStorage.getItem('tpc_google_access_token');
      if (token) {
        setAccessToken(token);
        fetchProfile(token);
      }
    };
    initToken();
  }, [isOpen]);

  // Handle prefill data when opened with specific registration context
  useEffect(() => {
    if (prefillData) {
      if (prefillData.recipientEmail) {
        setToEmail(prefillData.recipientEmail);
      }
      if (prefillData.registrationId && prefillData.formData) {
        setTemplateType('voucher');
        setSubject(`[TPC 2026] Registration Confirmation & Voucher: ${prefillData.registrationId}`);
        setBodyText(
          generateRegistrationEmailHtml({
            registrationId: prefillData.registrationId,
            submissionDate: prefillData.submissionDate || new Date().toLocaleDateString(),
            formData: prefillData.formData,
          })
        );
      }
    }
  }, [prefillData, isOpen]);

  // Set default templates when template changes
  useEffect(() => {
    if (!prefillData?.registrationId) {
      if (templateType === 'voucher') {
        setSubject('[TPC 2026] Official Team Registration Voucher & Details');
        setBodyText(
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Textile Presentation Competition 2026</h2>
  <p>Dear Team,</p>
  <p>Your team registration for the Textile Presentation Competition 2026 has been verified.</p>
  <p><strong>Date:</strong> 4 October 2026 (Sunday • 9:00 AM BST)<br/>
  <strong>Venue:</strong> Barishal Textile Engineering College Auditorium</p>
  <p>Please arrive by 8:30 AM with your presentation slides.</p>
  <p>Career Club BTEC</p>
</div>`
        );
      } else if (templateType === 'update') {
        setSubject('[TPC 2026] Important Competition Update & Schedule Reminder');
        setBodyText(
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Textile Presentation Competition 2026 - Event Update</h2>
  <p>Dear Participants,</p>
  <p>This is a gentle reminder regarding the upcoming Textile Presentation Competition 2026 scheduled for <strong>4 October 2026</strong> at the BTEC Auditorium.</p>
  <p>Please ensure all team members bring their College ID and presentation on a USB drive.</p>
  <p>Warm regards,<br/>Organizing Committee, Career Club BTEC</p>
</div>`
        );
      } else {
        setSubject('[TPC 2026] Announcement from Career Club BTEC');
        setBodyText(
          `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <p>Hello,</p>
  <p>Write your message here...</p>
  <p>Best regards,<br/>Career Club BTEC</p>
</div>`
        );
      }
    }
  }, [templateType]);

  const fetchProfile = async (token: string) => {
    try {
      const p = await getGmailProfile(token);
      setProfile(p);
      setAuthError(null);
    } catch (err: any) {
      console.warn('Profile fetch warning:', err);
      // Token may need renewal
      if (err.message?.includes('401')) {
        setAccessToken(null);
        setProfile(null);
      }
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setAccessToken(result.accessToken);
        await fetchProfile(result.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setAccessToken(null);
    setProfile(null);
  };

  const handleFetchHistory = async () => {
    if (!accessToken) return;
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const msgs = await listGmailMessages(accessToken, 'TPC 2026 OR "Textile Presentation"', 10);
      setMessages(msgs);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to load emails.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && accessToken) {
      handleFetchHistory();
    }
  }, [activeTab, accessToken]);

  const handleTriggerSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    if (!toEmail.trim() || !toEmail.includes('@')) {
      setSendError('Please provide a valid recipient email address.');
      return;
    }
    if (!subject.trim()) {
      setSendError('Please provide an email subject.');
      return;
    }
    if (!bodyText.trim()) {
      setSendError('Please provide email body content.');
      return;
    }

    // Show mandatory user confirmation dialog
    setShowConfirmSend(true);
  };

  const executeSend = async () => {
    setShowConfirmSend(false);
    if (!accessToken) {
      setSendError('You must sign in with Google to send emails.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccess(null);

    try {
      const result = await sendGmailMessage(accessToken, {
        to: toEmail.trim(),
        subject: subject.trim(),
        htmlBody: bodyText,
        fromEmail: profile?.emailAddress,
      });

      setSendSuccess(`Email successfully sent! (Message ID: ${result.id})`);
      if (activeTab === 'history') {
        handleFetchHistory();
      }
    } catch (err: any) {
      setSendError(err.message || 'Failed to send email via Gmail API.');
    } finally {
      setIsSending(false);
    }
  };

  const selectSavedTeam = (item: any) => {
    if (!item.formData) return;
    const email = item.formData.leader?.email || '';
    if (email) setToEmail(email);
    setSubject(`[TPC 2026] Registration Voucher: ${item.registrationId}`);
    setBodyText(
      generateRegistrationEmailHtml({
        registrationId: item.registrationId,
        submissionDate: item.submissionDate || 'Recently',
        formData: item.formData,
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#0A192F] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Gmail Communications
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Send official competition vouchers, announcements, and track email activity
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Bar */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {accessToken && profile ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {profile.emailAddress.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-slate-800">{profile.emailAddress}</span>
                <span className="text-slate-500 text-[11px] ml-1.5">
                  ({profile.messagesTotal.toLocaleString()} messages in inbox)
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Sign in with Google to send and view competition emails.</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {accessToken ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-white transition text-xs"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold shadow-2xs transition disabled:opacity-60"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 sm:px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'compose'
                ? 'border-[#0A192F] text-[#0A192F]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose & Send</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-[#0A192F] text-[#0A192F]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Recent Competition Emails</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: COMPOSE */}
          {activeTab === 'compose' && (
            <form onSubmit={handleTriggerSend} className="space-y-4">
              {/* Quick Template Picker */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Template:
                </span>
                <button
                  type="button"
                  onClick={() => setTemplateType('voucher')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    templateType === 'voucher'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Registration Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateType('update')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    templateType === 'update'
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Event Schedule Update
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateType('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    templateType === 'custom'
                      ? 'bg-purple-50 text-purple-800 border-purple-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Custom Message
                </button>
              </div>

              {/* Quick Team autofill */}
              {savedRegistrations.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Quick Fill from Registered Teams:</span>
                  {savedRegistrations.slice(0, 3).map((r) => (
                    <button
                      key={r.registrationId}
                      type="button"
                      onClick={() => selectSavedTeam(r)}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-bold hover:border-[#16A34A] transition"
                    >
                      {r.registrationId} ({r.formData?.leader?.name || 'Team'})
                    </button>
                  ))}
                </div>
              )}

              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="e.g. participant@example.com or leader@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message Content (HTML Supported) *
                  </label>
                  <span className="text-[10px] text-slate-400">Formatted email layout</span>
                </div>
                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/30 focus:border-rose-500 leading-relaxed"
                  required
                />
              </div>

              {/* Status alerts */}
              {sendError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {sendSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={isSending || !accessToken}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition active:scale-98 shadow-md shadow-rose-600/20 disabled:opacity-60"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending via Gmail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Email via Gmail</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Recent messages sent or received for Textile Presentation Competition 2026.
                </p>
                <button
                  type="button"
                  onClick={handleFetchHistory}
                  disabled={isLoadingHistory || !accessToken}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {!accessToken ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-semibold">
                    Please sign in with your Google Account to view your recent Gmail messages.
                  </p>
                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50"
                  >
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : isLoadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                  <span className="text-xs font-semibold">Reading Gmail messages...</span>
                </div>
              ) : historyError ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{historyError}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No recent competition emails found in your connected inbox.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {m.subject}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {m.date ? new Date(m.date).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>From: {m.from}</span>
                        {m.to && <span>• To: {m.to}</span>}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {m.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MANDATORY CONFIRMATION DIALOG BEFORE SENDING EMAIL */}
      {showConfirmSend && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Confirm Email Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  Permission confirmation required before sending
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-slate-500 font-medium">From account:</span>
                <p className="font-bold text-slate-800">{profile?.emailAddress || 'Connected Gmail account'}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">To recipient:</span>
                <p className="font-bold text-slate-800">{toEmail}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Subject:</span>
                <p className="font-semibold text-slate-700">{subject}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to send this email on behalf of your connected Google account?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSend(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeSend}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition active:scale-98 shadow-md shadow-rose-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
