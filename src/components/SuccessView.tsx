import React, { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, Download, Calendar, MapPin, Building2, ShieldAlert, Award, QrCode, X, Trophy, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { fireCelebrationConfetti } from '../utils/confetti';
import { SubmissionResponse, RegistrationFormData } from '../types';
import { BtecLogo, CareerClubLogo } from './Logos';
import { generateRegistrationPdf } from '../utils/pdfGenerator';

interface SuccessViewProps {
  result: SubmissionResponse;
  formData: RegistrationFormData;
  onClose: () => void;
  onRegisterAnother?: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  result,
  formData,
  onClose,
  onRegisterAnother
}) => {
  const [copied, setCopied] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const regId = result.registrationId || 'TEX2026-001';
  const displayTeamName = formData.teamName || result.teamName || '';
  const recipientEmail = formData.leader.email || result.emailRecipient || '';
  const submissionDateStr = result.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
  const paymentStatusStr = result.paymentStatus || 'Pending';

  // Save to local registry so participant can search and edit it up to 3 times
  useEffect(() => {
    try {
      const existingStr = localStorage.getItem('tpc2026_saved_registrations');
      const list = existingStr ? JSON.parse(existingStr) : [];
      const record = {
        registrationId: regId,
        submissionDate: result.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        paymentStatus: result.paymentStatus || 'Pending',
        teamName: displayTeamName,
        editCount: result.editCount ?? 0,
        maxEdits: 3,
        remainingEdits: 3,
        canEdit: true,
        formData
      };
      const idx = list.findIndex((r: any) => r.registrationId?.toUpperCase() === regId.toUpperCase());
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...record };
      } else {
        list.unshift(record);
      }
      localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
      localStorage.setItem('tpc2026_last_reg_id', regId);
    } catch (e) {
      console.warn('Could not cache registration locally:', e);
    }
  }, [regId, result, formData]);

  useEffect(() => {
    // Launch festive confetti celebration safely
    try {
      const cleanup = fireCelebrationConfetti({
        particleCount: 85,
        origin: { x: 0.5, y: 0.6 },
        colors: ['#22C55E', '#0A192F', '#84CC16', '#F59E0B', '#38BDF8']
      });
      return cleanup;
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(regId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    generateRegistrationPdf({
      registrationId: regId,
      submissionDate: result.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
      paymentStatus: result.paymentStatus || 'Pending Verification',
      editCount: result.editCount ?? 0,
      formData
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">

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

        {/* Prominent Registration ID & Team Display Card */}
        <div className="bg-[#FAFBF9] rounded-2xl border-2 border-slate-200/90 p-5 text-center space-y-3 my-4">
          {displayTeamName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-[#15803D] text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Team: {displayTeamName}</span>
            </div>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
              Official Registration ID
            </span>
            <div className="flex items-center justify-center gap-3 mt-1">
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

        {/* Payment Verification Status Banner */}
        {(() => {
          const statusStr = (result.paymentStatus || 'Pending').trim();
          const isPaid = /^(paid|verified|approved|received|completed|success)/i.test(statusStr);

          if (isPaid) {
            return (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900 mb-6">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-950">
                    Status: Payment Verified (Paid)
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    bKash Transaction ID <strong>{formData.payment.transactionId}</strong> has been verified and approved.
                    Your slot for Textile Presentation Competition 2026 is confirmed!
                  </p>
                </div>
              </div>
            );
          }

          return (
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
          );
        })()}

        {/* Automatic Registration Confirmation Email Notice */}
        {recipientEmail && (
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/90 text-xs text-blue-950 mb-6 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-blue-950 text-sm">
                      Automatic Confirmation Email Dispatched
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Sent
                    </span>
                  </div>
                  <p className="text-blue-800 text-xs leading-relaxed">
                    A confirmation email has been automatically sent to Group Leader: <strong className="text-blue-950 underline underline-offset-2">{recipientEmail}</strong>
                  </p>
                  <p className="text-[11px] text-blue-700 font-medium font-mono">
                    Subject: Registration Confirmation – Textile Presentation Competition 2026 | {regId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-800 border border-blue-200 hover:bg-blue-50 transition shadow-xs shrink-0"
              >
                <span>{showEmailPreview ? 'Hide Email' : 'View Email Copy'}</span>
                {showEmailPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Dynamic Email Body Preview */}
            {showEmailPreview && (
              <div className="mt-4 pt-4 border-t border-blue-200/80 space-y-3">
                <div className="p-4 rounded-xl bg-white border border-blue-100 text-slate-800 font-sans text-xs leading-relaxed shadow-xs space-y-3">
                  <div className="border-b border-slate-200 pb-2.5 text-[11px] text-slate-600 space-y-0.5">
                    <div><span className="font-bold text-slate-700">To:</span> {recipientEmail}</div>
                    <div><span className="font-bold text-slate-700">Subject:</span> Registration Confirmation – Textile Presentation Competition 2026 | {regId}</div>
                  </div>

                  <p className="font-semibold text-slate-900">Dear {formData.leader.name},</p>
                  <p className="text-slate-700">
                    We are pleased to inform you that your registration for the Textile Presentation Competition 2026 has been successfully received and recorded.
                  </p>
                  
                  <p className="font-extrabold text-slate-900">Registration Details</p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                    <div>Registration ID: <span className="font-bold text-[#16A34A]">{regId}</span></div>
                    <div>Team Name: <span className="font-bold text-slate-900">{displayTeamName || 'N/A'}</span></div>
                    <div>Group Leader: <span className="font-bold text-slate-900">{formData.leader.name}</span></div>
                    <div>Roll No.: <span className="font-bold text-slate-900">{formData.leader.roll}</span></div>
                    <div>Department: <span className="font-bold text-slate-900">{formData.leader.department}</span></div>
                    <div>Mobile No.: <span className="font-bold text-slate-900">{formData.leader.whatsapp}</span></div>
                    <div>Payment Status: <span className="font-bold text-amber-700">{paymentStatusStr}</span></div>
                    <div>Submission Date: <span className="font-bold text-slate-900">{submissionDateStr}</span></div>
                  </div>

                  <p className="font-extrabold text-slate-900">Registration Verification</p>
                  <p className="text-slate-700">
                    You may check and verify your registration information through our official website using:
                  </p>
                  <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2.5 rounded-lg text-center font-bold text-xs">
                    Registration ID + Mobile No. + Roll No.
                  </div>

                  <p className="text-slate-600">
                    Please keep these details safe and readily available for future reference, verification, or any registration-related communication.
                  </p>
                  <p className="text-slate-600">
                    Thank you for your participation. We sincerely appreciate your interest in the Textile Presentation Competition 2026 and look forward to your participation.
                  </p>

                  <div className="border-t border-slate-100 pt-2 text-slate-700 font-medium">
                    <p>Sincerely,</p>
                    <p className="font-extrabold text-[#0A192F]">Organizing Committee</p>
                    <p className="font-bold text-[#16A34A]">Career Club BTEC</p>
                    <p className="text-slate-500">Barishal Textile Engineering College (BTEC)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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

      {/* Action Buttons: Download Registration Info PDF and Close */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 print:hidden">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-98 shadow-md shadow-[#16A34A]/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Registration Info PDF</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs active:scale-98 transition"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
};
