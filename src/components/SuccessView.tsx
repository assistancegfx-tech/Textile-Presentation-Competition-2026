import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Check, Printer, Download, PlusCircle, Calendar, MapPin, Building2, ShieldAlert, Award, QrCode, FileSpreadsheet, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubmissionResponse, RegistrationFormData } from '../types';
import { BtecLogo, CareerClubLogo } from './Logos';
import { getAccessToken, googleSignIn } from '../services/googleAuth';
import { findOrCreateSpreadsheet, appendRegistrationToSheet } from '../services/sheetsService';

interface SuccessViewProps {
  result: SubmissionResponse;
  formData: RegistrationFormData;
  onRegisterAnother: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  result,
  formData,
  onRegisterAnother
}) => {
  const [copied, setCopied] = useState(false);
  const regId = result.registrationId || 'TEX2026-001';
  const initialSheetUrl = localStorage.getItem('tpc2026_active_spreadsheet_url') ||
    (localStorage.getItem('tpc2026_active_spreadsheet_id') ? `https://docs.google.com/spreadsheets/d/${localStorage.getItem('tpc2026_active_spreadsheet_id')}/edit` : null);

  const [sheetUrl, setSheetUrl] = useState<string | null>(initialSheetUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleManualSaveToSheet = async () => {
    setIsSaving(true);
    setSyncError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const loginRes = await googleSignIn();
        token = loginRes?.accessToken || null;
      }
      if (!token) throw new Error('Google Sign-In is required to save to Google Sheet.');

      let sheetId = localStorage.getItem('tpc2026_active_spreadsheet_id');
      let targetUrl = localStorage.getItem('tpc2026_active_spreadsheet_url');
      if (!sheetId) {
        const sheetInfo = await findOrCreateSpreadsheet(token);
        sheetId = sheetInfo.id;
        targetUrl = sheetInfo.url;
        localStorage.setItem('tpc2026_active_spreadsheet_id', sheetId);
        localStorage.setItem('tpc2026_active_spreadsheet_url', targetUrl);
      }

      const rowValues = [
        regId,
        result.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        'Pending',
        formData.leader.name,
        formData.leader.roll,
        formData.leader.department,
        formData.leader.whatsapp,
        formData.leader.facebook,
        formData.leader.photoPreview || '',
        formData.member1.name,
        formData.member1.roll,
        formData.member1.department,
        formData.member1.whatsapp,
        formData.member1.facebook,
        formData.member1.photoPreview || '',
        formData.member2.name,
        formData.member2.roll,
        formData.member2.department,
        formData.member2.whatsapp,
        formData.member2.facebook,
        formData.member2.photoPreview || '',
        formData.payment.bkashNumber,
        formData.payment.transactionId
      ];

      await appendRegistrationToSheet(token, sheetId, rowValues);
      setSheetUrl(targetUrl || `https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
    } catch (err: any) {
      console.warn('Manual save to sheet warning:', err);
      setSyncError(err.message || 'Failed to save to Google Sheet.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Launch festive confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#0A192F', '#84CC16', '#F59E0B']
      });
    } catch (e) {
      // safe fallback if canvas-confetti is not loaded
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(regId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDetails = () => {
    const textContent = `=====================================================
TEXTILE PRESENTATION COMPETITION 2026
OFFICIAL REGISTRATION VOUCHER
Organized by: Career Club BTEC
Barishal Textile Engineering College
=====================================================

REGISTRATION ID: ${regId}
STATUS: Payment Verification Pending
SUBMISSION DATE: ${result.submissionDate || new Date().toLocaleString()}

EVENT DETAILS:
- Event: Textile Presentation Competition 2026
- Date: 4 October 2026 (Sunday • 9:00 AM BST)
- Venue: Barishal Textile Engineering College Auditorium
- Organizer: Career Club BTEC

TEAM PARTICIPANTS:
1. GROUP LEADER:
   - Name: ${formData.leader.name}
   - Roll: ${formData.leader.roll}
   - Department: ${formData.leader.department}
   - WhatsApp: ${formData.leader.whatsapp}
   - Facebook: ${formData.leader.facebook}

2. MEMBER 1:
   - Name: ${formData.member1.name}
   - Roll: ${formData.member1.roll}
   - Department: ${formData.member1.department}
   - WhatsApp: ${formData.member1.whatsapp}
   - Facebook: ${formData.member1.facebook}

3. MEMBER 2:
   - Name: ${formData.member2.name}
   - Roll: ${formData.member2.roll}
   - Department: ${formData.member2.department}
   - WhatsApp: ${formData.member2.whatsapp}
   - Facebook: ${formData.member2.facebook}

PAYMENT DETAILS:
- Sender bKash Number: ${formData.payment.bkashNumber}
- Transaction ID (TrxID): ${formData.payment.transactionId}
- Verification: Pending verification by Career Club BTEC finance team

NOTE:
Please preserve this document or registration ID for entrance
verification at the auditorium on 4 October 2026.
=====================================================
© 2026 Career Club BTEC. All Rights Reserved.
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Registration_${regId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
      {/* Google Sheet Sync Alert Banner */}
      {sheetUrl ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F9D58] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                Saved & Synced to Google Sheet!
              </p>
              <p className="text-slate-600 text-xs">
                Registration details have been appended to: <strong>Textile Presentation Competition 2026 - Registrations</strong>
              </p>
            </div>
          </div>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold text-xs transition shadow-xs whitespace-nowrap"
          >
            <span>Open Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                Save this Registration to Google Sheets
              </p>
              <p className="text-slate-600 text-xs">
                Record this team's complete registration data directly into your official Google Sheet.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSaveToSheet}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white font-bold text-xs transition shadow-xs whitespace-nowrap active:scale-98 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Sheet…</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Save to Google Sheet</span>
              </>
            )}
          </button>
        </div>
      )}

      {syncError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900 print:hidden">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{syncError}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Tip: If the popup was blocked by your browser, please allow popups for this site or open the app in a new tab.
            </p>
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="mt-1.5 inline-flex items-center gap-1 font-bold text-amber-900 hover:underline text-[11px]"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Official Voucher Printable Card */}
      <div id="registration-voucher" className="bg-white rounded-3xl border-2 border-[#22C55E]/40 p-6 sm:p-10 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#0A192F] via-[#22C55E] to-[#84CC16]" />

        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <CareerClubLogo className="w-14 h-14 shrink-0 drop-shadow-sm" />
            <div>
              <h3 className="text-base font-extrabold text-[#0A192F] leading-tight font-['Outfit']">
                CAREER CLUB BTEC
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Barishal Textile Engineering College
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#22C55E]/15 text-xs font-extrabold text-[#15803D]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Registration Submitted</span>
          </div>
        </div>

        {/* Big Success Greeting */}
        <div className="text-center py-6 space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 text-[#16A34A] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] font-['Outfit']">
            ✓ Registration Successful!
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your team registration has been recorded. Please save your Registration ID for future reference.
          </p>
        </div>

        {/* Prominent Registration ID Display Card */}
        <div className="bg-[#FAFBF9] rounded-2xl border-2 border-slate-200/90 p-5 text-center space-y-2 my-4">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Official Registration ID
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Space_Grotesk'] tracking-widest">
              {regId}
            </span>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 transition print:hidden"
              title="Copy ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span className="text-[#16A34A]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Please save this ID for future reference and auditorium check-in.
          </p>
        </div>

        {/* Required Event Meta Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Event</span>
            <span className="font-extrabold text-slate-900 text-sm block">
              Textile Presentation Competition 2026
            </span>
            <span className="text-slate-500">Organized by Career Club BTEC</span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Venue</span>
            <span className="font-extrabold text-slate-900 text-sm block">
              4 October 2026
            </span>
            <span className="text-slate-500 truncate block">
              Barishal Textile Engineering College Auditorium
            </span>
          </div>
        </div>

        {/* Payment Verification Status Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Status: Payment Verification Pending
            </p>
            <p className="text-amber-800 leading-relaxed">
              bKash Transaction ID <strong>{formData.payment.transactionId}</strong> has been logged.
              Career Club BTEC organizers will review the ledger and confirm your slot via WhatsApp / SMS.
            </p>
          </div>
        </div>

        {/* Team Members Summary */}
        <div className="border-t border-slate-200 pt-5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
            Registered Team Members (3)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAFBF9] border border-slate-200 space-y-1">
              <span className="text-[10px] text-[#16A34A] font-bold block uppercase">Group Leader</span>
              <p className="font-bold text-slate-900 truncate">{formData.leader.name}</p>
              <p className="text-slate-500">Roll: {formData.leader.roll}</p>
              <p className="text-slate-500 truncate">{formData.leader.department}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF9] border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Member 1</span>
              <p className="font-bold text-slate-900 truncate">{formData.member1.name}</p>
              <p className="text-slate-500">Roll: {formData.member1.roll}</p>
              <p className="text-slate-500 truncate">{formData.member1.department}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF9] border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Member 2</span>
              <p className="font-bold text-slate-900 truncate">{formData.member2.name}</p>
              <p className="text-slate-500">Roll: {formData.member2.roll}</p>
              <p className="text-slate-500 truncate">{formData.member2.department}</p>
            </div>
          </div>
        </div>

        {/* Footer print note */}
        <div className="hidden print:block pt-6 border-t border-slate-300 text-[10px] text-slate-500 text-center">
          © 2026 Career Club BTEC • Barishal Textile Engineering College • Issued electronically
        </div>
      </div>

      {/* Action Buttons: Print, Download, View in Sheet, Register Another */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 print:hidden">
        {sheetUrl && (
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0F9D58] hover:bg-[#0B8043] shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>View in Google Sheet</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition"
        >
          <Printer className="w-4 h-4 text-[#16A34A]" />
          <span>Print Registration</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadDetails}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition"
        >
          <Download className="w-4 h-4 text-[#16A34A]" />
          <span>Download Registration Details</span>
        </button>

        <button
          type="button"
          onClick={onRegisterAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#22C55E]" />
          <span>Register Another Team</span>
        </button>
      </div>
    </div>
  );
};
