import React from 'react';
import { 
  CheckCircle2, 
  Edit3, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Phone, 
  Share2, 
  CreditCard, 
  AlertTriangle,
  Loader2,
  Check,
  Image as ImageIcon,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { RegistrationFormData, Participant, SubmissionProgressStage } from '../types';

interface ReviewConfirmStepProps {
  formData: RegistrationFormData;
  onEditStep: (stepNumber: number) => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  progressStage?: SubmissionProgressStage;
}

export const ReviewConfirmStep: React.FC<ReviewConfirmStepProps> = ({
  formData,
  onEditStep,
  onConfirmSubmit,
  isSubmitting,
  submitError,
  progressStage = 'idle'
}) => {
  const getStageInfo = () => {
    switch (progressStage) {
      case 'validating':
        return {
          stepIndex: 0,
          percentage: 25,
          title: 'Validating Information',
          description: 'Verifying student roll numbers, phone numbers, and bKash transaction validity...',
          buttonLabel: 'Validating Details…'
        };
      case 'photos':
        return {
          stepIndex: 1,
          percentage: 55,
          title: 'Uploading Photos to Drive',
          description: 'Optimizing and securely uploading 3 participant photos to Google Drive storage...',
          buttonLabel: 'Uploading Photos to Drive…'
        };
      case 'saving_sheets':
        return {
          stepIndex: 2,
          percentage: 80,
          title: 'Saving to Google Sheets',
          description: 'Recording team entry and generating official row in Google Sheets database...',
          buttonLabel: 'Saving to Google Sheets…'
        };
      case 'finalizing':
        return {
          stepIndex: 3,
          percentage: 100,
          title: 'Finalizing Voucher',
          description: 'Generating official Registration ID and preparing downloadable registration voucher...',
          buttonLabel: 'Finalizing Registration…'
        };
      default:
        return {
          stepIndex: 0,
          percentage: 0,
          title: 'Processing',
          description: 'Processing your submission...',
          buttonLabel: 'Submitting Registration…'
        };
    }
  };

  const currentStageInfo = getStageInfo();

  const progressSteps = [
    {
      id: 'validating',
      label: 'Validating Data',
      icon: ShieldCheck,
      desc: 'Roll numbers & transaction'
    },
    {
      id: 'photos',
      label: 'Uploading Photos',
      icon: ImageIcon,
      desc: 'Google Drive photo sync'
    },
    {
      id: 'saving_sheets',
      label: 'Saving to Sheets',
      icon: FileSpreadsheet,
      desc: 'Appending Google Sheet row'
    },
    {
      id: 'finalizing',
      label: 'Generating Voucher',
      icon: Sparkles,
      desc: 'Official ID & PDF pass'
    }
  ];

  const getStepStatus = (index: number) => {
    if (!isSubmitting) return 'idle';
    if (index < currentStageInfo.stepIndex) return 'completed';
    if (index === currentStageInfo.stepIndex) return 'active';
    return 'pending';
  };
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

      {/* Real-Time Submission Progress Card when Submitting */}
      {isSubmitting && (
        <div className="bg-gradient-to-br from-[#0A192F] to-[#162a45] text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/80 animate-in zoom-in-95 duration-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center shrink-0 border border-[#22C55E]/30">
                <Loader2 className="w-5 h-5 animate-spin text-[#22C55E]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Processing Registration</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#22C55E]/20 text-[#4ade80] border border-[#22C55E]/30">
                    {currentStageInfo.percentage}% Complete
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">
                  {currentStageInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-[#22C55E] to-[#4ade80] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentStageInfo.percentage}%` }}
            />
          </div>

          {/* 4 Distinct Stage Milestones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            {progressSteps.map((step, idx) => {
              const status = getStepStatus(idx);
              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-white'
                      : status === 'active'
                      ? 'bg-white/10 border-white/40 text-white ring-1 ring-[#22C55E]/60'
                      : 'bg-white/5 border-white/5 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        status === 'completed'
                          ? 'bg-[#22C55E] text-[#0A192F]'
                          : status === 'active'
                          ? 'bg-white text-[#0A192F]'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {status === 'completed' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : status === 'active' ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#0A192F]" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span className="text-xs font-bold truncate">{step.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-300/80 truncate pl-7">
                    {status === 'completed' ? 'Completed ✓' : status === 'active' ? 'In progress…' : step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agreement & Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
        <button
          type="button"
          onClick={() => onEditStep(0)}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Information</span>
        </button>

        <button
          type="button"
          onClick={onConfirmSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] active:scale-98 transition shadow-lg shadow-[#0A192F]/15 flex items-center justify-center gap-2.5 disabled:opacity-85 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 text-[#22C55E] animate-spin" />
              <span>{currentStageInfo.buttonLabel}</span>
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
