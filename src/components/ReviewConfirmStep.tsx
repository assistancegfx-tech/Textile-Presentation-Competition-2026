import React from 'react';
import { CheckCircle2, Edit3, ArrowRight, ShieldCheck, User, Phone, Share2, Hash, BookOpen, CreditCard, AlertTriangle, FileSpreadsheet, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { RegistrationFormData, Participant } from '../types';

interface ReviewConfirmStepProps {
  formData: RegistrationFormData;
  onEditStep: (stepNumber: number) => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  isGoogleConnected?: boolean;
  onConnectGoogle?: () => void;
  isConnectingGoogle?: boolean;
  googleConnectError?: string | null;
  sheetUrl?: string | null;
}

export const ReviewConfirmStep: React.FC<ReviewConfirmStepProps> = ({
  formData,
  onEditStep,
  onConfirmSubmit,
  isSubmitting,
  submitError,
  isGoogleConnected = false,
  onConnectGoogle,
  isConnectingGoogle = false,
  googleConnectError = null,
  sheetUrl = null
}) => {
  const renderParticipantSummary = (
    p: Participant,
    roleTitle: string,
    roleBadge: string,
    stepIndex: number
  ) => (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative flex flex-col justify-between">
      <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#16A34A] block">
            {roleBadge}
          </span>
          <h4 className="text-base font-extrabold text-[#0A192F]">{roleTitle}</h4>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(stepIndex)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#16A34A] transition py-1 px-2 rounded-lg hover:bg-slate-50"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex gap-4">
        {/* Photo preview thumbnail */}
        <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
          {p.photoPreview ? (
            <img src={p.photoPreview} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No Photo
            </div>
          )}
        </div>

        {/* Details list */}
        <div className="flex-1 min-w-0 space-y-1.5 text-xs text-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Name</span>
            <span className="font-bold text-slate-900 truncate block text-sm">{p.name || '—'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Roll</span>
              <span className="font-semibold text-slate-800">{p.roll || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
              <span className="font-semibold text-slate-800 truncate block">{p.department || '—'}</span>
            </div>
          </div>

          <div className="space-y-0.5 pt-1">
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Phone className="w-3 h-3 text-[#16A34A] shrink-0" />
              <span>{p.whatsapp || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 truncate">
              <Share2 className="w-3 h-3 text-[#16A34A] shrink-0" />
              <span className="truncate">{p.facebook || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#0A192F]">Review & Confirm Registration</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#15803D]">
              Final Step
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Please review all information carefully. Click "Edit" on any section if changes are needed.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total: 3 Members + Payment Verification
        </span>
      </div>

      {/* Submission Error Banner if any */}
      {submitError && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-red-900 animate-shake">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-red-800">Registration Submission Failed</p>
            <p className="text-red-700 leading-relaxed">{submitError}</p>
            <p className="text-[11px] text-red-600 font-medium">
              Please check your information, roll numbers, or connection and click "Confirm Registration" to retry.
            </p>
          </div>
        </div>
      )}

      {/* 3 Members Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderParticipantSummary(formData.leader, 'Group Leader', 'Team Leader', 0)}
        {renderParticipantSummary(formData.member1, 'Member 1', 'Team Member', 1)}
        {renderParticipantSummary(formData.member2, 'Member 2', 'Team Member', 2)}
      </div>

      {/* Payment Information Review Card */}
      <div className="bg-[#FAFBF9] rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E2136E]/10 flex items-center justify-center text-[#E2136E]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#0A192F]">bKash Payment Verification</h4>
              <p className="text-[11px] text-slate-500">Registration fee: 300 BDT</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#16A34A] transition py-1 px-2 rounded-lg hover:bg-white"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Payment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Sender bKash Number
            </span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {formData.payment.bkashNumber || '—'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Transaction ID (TrxID)
            </span>
            <span className="text-sm font-extrabold text-[#0A192F] tracking-wider font-mono">
              {formData.payment.transactionId || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Google Sheets Sync Status / Action */}
      {isGoogleConnected ? (
        <div className="bg-emerald-50/90 rounded-2xl border border-emerald-300 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0F9D58] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900">Google Sheets Connected</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Upon clicking "Confirm Registration", this team's complete registration data will be saved directly into your connected Google Sheet.
              </p>
            </div>
          </div>
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F9D58] hover:underline self-start sm:self-center"
            >
              <span>View Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900">Google Sheets Auto-Sync (Optional)</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Connect your Google account to automatically append this registration into your official Google Sheet upon submission.
              </p>
            </div>
          </div>
          {onConnectGoogle && (
            <button
              type="button"
              onClick={onConnectGoogle}
              disabled={isConnectingGoogle}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition active:scale-98 disabled:opacity-60 shrink-0 self-start sm:self-center"
            >
              {isConnectingGoogle ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  <span>Connecting…</span>
                </>
              ) : (
                <>
                  <div className="w-3.5 h-3.5 shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full block">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  </div>
                  <span>Connect Google</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {googleConnectError && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{googleConnectError}</p>
            <p className="text-[11px] text-amber-700 mt-1">
              Tip: Browsers may block popups inside preview iframes. You can open the app in a new browser tab or proceed with submission and sync afterward.
            </p>
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="mt-2 inline-flex items-center gap-1 font-bold text-amber-900 hover:underline text-[11px]"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Agreement & Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => onEditStep(0)}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Information</span>
        </button>

        <button
          type="button"
          onClick={onConfirmSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] active:scale-98 transition shadow-lg shadow-[#0A192F]/15 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting Registration…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 text-[#22C55E]" />
              <span>Confirm Registration</span>
              <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
