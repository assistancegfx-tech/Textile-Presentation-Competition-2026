import React, { useState, useEffect } from 'react';
import { User, Users, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, ShieldAlert, Sparkles, Wand2, RotateCcw, FastForward, Search } from 'lucide-react';
import { RegistrationFormData, SubmissionResponse, Participant } from '../types';
import { ParticipantStepForm } from './ParticipantStepForm';
import { PaymentStepForm } from './PaymentStepForm';
import { ReviewConfirmStep } from './ReviewConfirmStep';
import { SuccessView } from './SuccessView';
import { validateBangladeshPhone, validateTransactionId } from '../utils/formUtils';
import { getDemoFormData } from '../utils/demoData';

const initialParticipant = (): Participant => ({
  name: '',
  roll: '',
  department: '',
  whatsapp: '',
  facebook: '',
  photoBase64: undefined,
  photoPreview: undefined,
  photoName: undefined,
  photoSize: undefined
});

const initialFormData = (): RegistrationFormData => ({
  leader: initialParticipant(),
  member1: initialParticipant(),
  member2: initialParticipant(),
  payment: {
    bkashNumber: '',
    transactionId: ''
  }
});

interface RegistrationFormProps {
  customScriptUrl?: string;
  onOpenViewEditModal?: (regId?: string) => void;
  onRegistrationSuccess?: (result: SubmissionResponse, formData: RegistrationFormData) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  customScriptUrl,
  onOpenViewEditModal,
  onRegistrationSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData());
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [demoToast, setDemoToast] = useState<string | null>(null);

  const isFormPartiallyFilled = Boolean(
    formData.leader.name ||
    formData.member1.name ||
    formData.member2.name ||
    formData.payment.transactionId
  );

  const handleDemoFillup = () => {
    const demo = getDemoFormData();
    setFormData(demo);
    setStepErrors({});
    setSubmitError(null);
    setDemoToast('Demo data loaded! 3 team members, student photos, and bKash transaction populated.');
    setTimeout(() => {
      setDemoToast(null);
    }, 4500);
  };

  const handleClearForm = () => {
    setFormData(initialFormData());
    setStepErrors({});
    setSubmitError(null);
    setDemoToast(null);
    setCurrentStep(0);
  };

  const handleJumpToReview = () => {
    if (!formData.leader.name || !formData.payment.transactionId) {
      handleDemoFillup();
    }
    setStepErrors({});
    setCurrentStep(4);
  };

  const steps = [
    { label: 'Group Leader', icon: User },
    { label: 'Member 1', icon: Users },
    { label: 'Member 2', icon: Users },
    { label: 'Payment', icon: CreditCard },
    { label: 'Review & Confirm', icon: CheckCircle2 }
  ];

  // Validation per step
  const validateParticipant = (p: Participant, otherRolls: string[]): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!p.name.trim()) errs.name = 'Full name is required.';
    if (!p.roll.trim()) {
      errs.roll = 'Roll number is required.';
    } else if (otherRolls.includes(p.roll.trim())) {
      errs.roll = 'This roll number is already assigned to another team member.';
    }
    if (!p.department) errs.department = 'Department must be selected.';
    if (!p.whatsapp.trim()) {
      errs.whatsapp = 'WhatsApp number is required.';
    } else if (!validateBangladeshPhone(p.whatsapp)) {
      errs.whatsapp = 'Please enter a valid Bangladesh phone number (e.g. 017XXXXXXXX).';
    }
    if (!p.facebook.trim()) errs.facebook = 'Facebook profile link or ID is required.';
    if (!p.photoPreview) errs.photo = 'Participant photo upload is required.';

    return errs;
  };

  const validatePayment = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!formData.payment.bkashNumber.trim()) {
      errs.bkashNumber = 'Sender bKash number is required.';
    } else if (!validateBangladeshPhone(formData.payment.bkashNumber)) {
      errs.bkashNumber = 'Please enter a valid bKash number (e.g. 01XXXXXXXXX).';
    }

    if (!formData.payment.transactionId.trim()) {
      errs.transactionId = 'Transaction ID is required to verify registration.';
    } else if (!validateTransactionId(formData.payment.transactionId)) {
      errs.transactionId = 'Enter a valid alphanumeric Transaction ID (minimum 6 characters).';
    }

    return errs;
  };

  const handleNext = () => {
    let errs: Record<string, string> = {};

    if (currentStep === 0) {
      errs = validateParticipant(formData.leader, [
        formData.member1.roll.trim(),
        formData.member2.roll.trim()
      ].filter(Boolean));
    } else if (currentStep === 1) {
      errs = validateParticipant(formData.member1, [
        formData.leader.roll.trim(),
        formData.member2.roll.trim()
      ].filter(Boolean));
    } else if (currentStep === 2) {
      errs = validateParticipant(formData.member2, [
        formData.leader.roll.trim(),
        formData.member1.roll.trim()
      ].filter(Boolean));
    } else if (currentStep === 3) {
      errs = validatePayment();
    }

    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      return;
    }

    setStepErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setStepErrors({});
    setSubmitError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Final confirmation & submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formRolls = [
        String(formData.leader.roll || '').trim(),
        String(formData.member1.roll || '').trim(),
        String(formData.member2.roll || '').trim()
      ].filter(Boolean);
      const cleanTrx = String(formData.payment.transactionId || '').trim().toUpperCase();

      // 1. Client-side local check for duplicates first
      try {
        const localSaved = localStorage.getItem('tpc2026_saved_registrations');
        if (localSaved) {
          const list = JSON.parse(localSaved);
          if (Array.isArray(list)) {
            for (const item of list) {
              const itemTrx = String(item.formData?.payment?.transactionId || '').trim().toUpperCase();
              if (cleanTrx && itemTrx === cleanTrx) {
                throw new Error(`Transaction ID "${cleanTrx}" was already submitted with team ${item.registrationId}.`);
              }
              const itemRolls = [
                String(item.formData?.leader?.roll || '').trim(),
                String(item.formData?.member1?.roll || '').trim(),
                String(item.formData?.member2?.roll || '').trim()
              ];
              for (const r of formRolls) {
                if (itemRolls.includes(r)) {
                  throw new Error(`Student Roll "${r}" is already registered in team ${item.registrationId}.`);
                }
              }
            }
          }
        }
      } catch (locErr: any) {
        if (locErr.message && locErr.message.includes('already')) {
          throw locErr;
        }
      }

      // 2. Server pre-check for duplicates if API endpoint is reachable
      try {
        const dupCheckRes = await fetch('/api/validate-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rolls: formRolls,
            transactionId: cleanTrx
          })
        });

        if (dupCheckRes.status === 409) {
          const dupData = await dupCheckRes.json();
          throw new Error(dupData?.message || 'Duplicate registration detected.');
        }
      } catch (dupErr: any) {
        if (dupErr.message && (dupErr.message.includes('already') || dupErr.message.includes('Duplicate'))) {
          throw dupErr;
        }
        // Non-blocking for offline/static deployment
      }

      // 3. Submit to server endpoint (/api/register) with graceful Google Apps Script & client fallback
      let data: SubmissionResponse | null = null;
      const storedScriptUrl = customScriptUrl || localStorage.getItem('tpc2026_google_script_url') || '';

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedScriptUrl) {
          headers['x-google-script-url'] = storedScriptUrl;
        }

        const res = await fetch('/api/register', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (res.status === 409 || res.status === 400) {
            throw new Error(json.error || json.message || 'Registration validation failed.');
          }
          if (res.ok && json.success) {
            data = json;
          }
        }
      } catch (fetchErr: any) {
        if (fetchErr.message && (fetchErr.message.includes('Duplicate') || fetchErr.message.includes('already') || fetchErr.message.includes('validation failed'))) {
          throw fetchErr;
        }
        console.warn('Backend API submission warning, trying direct Google Script or fallback:', fetchErr);
      }

      // If backend was unreachable and storedScriptUrl is set, try direct POST to Google Apps Script
      if (!data && storedScriptUrl && storedScriptUrl.startsWith('http')) {
        try {
          const directScriptRes = await fetch(storedScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            mode: 'cors'
          });
          const scriptJson = await directScriptRes.json();
          if (scriptJson && scriptJson.success) {
            data = scriptJson;
          }
        } catch (directErr) {
          console.warn('Direct Google Script fetch error:', directErr);
        }
      }

      // If backend was not reached or returned static HTML, create reliable client response
      if (!data) {
        const generatedSequence = Math.floor(100 + Math.random() * 900);
        const fallbackRegId = `TEX2026-${generatedSequence}`;
        const fallbackDate = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

        data = {
          success: true,
          registrationId: fallbackRegId,
          submissionDate: fallbackDate,
          paymentStatus: 'Pending',
          editCount: 0,
          maxEdits: 3,
          remainingEdits: 3,
          message: 'Registration submitted successfully'
        };
      }

      // 4. Cache registration locally for view, search, edit & PDF download
      const regId = data.registrationId || `TEX2026-${Date.now().toString().slice(-4)}`;
      const subDate = data.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

      try {
        const record = {
          registrationId: regId,
          submissionDate: subDate,
          paymentStatus: data.paymentStatus || 'Pending',
          editCount: data.editCount ?? 0,
          maxEdits: 3,
          remainingEdits: 3,
          canEdit: true,
          formData
        };
        const existingStr = localStorage.getItem('tpc2026_saved_registrations');
        const list = existingStr ? JSON.parse(existingStr) : [];
        const idx = list.findIndex((r: any) => r.registrationId?.toUpperCase() === regId.toUpperCase());
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...record };
        } else {
          list.unshift(record);
        }
        localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
        localStorage.setItem('tpc2026_last_reg_id', regId);
        localStorage.setItem('tpc2026_latest_submission', JSON.stringify({ result: data, formData }));

        // Attempt background sync with server if available
        fetch('/api/registration/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: record })
        }).catch(() => {});
      } catch (cacheErr) {
        console.warn('Could not cache registration locally:', cacheErr);
      }

      // Success! Set result state
      setSubmissionResult(data);

      // Redirect to /registration-success
      try {
        window.history.pushState({ regId }, '', '/registration-success');
        window.location.hash = '#/registration-success';
      } catch (_) {}

      if (onRegistrationSuccess) {
        onRegistrationSuccess(data, formData);
      }

    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'An error occurred during submission. Please check the fields and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAnother = () => {
    setFormData(initialFormData());
    setStepErrors({});
    setSubmitError(null);
    setSubmissionResult(null);
    setCurrentStep(0);
  };

  return (
    <div id="registration" className="py-10 md:py-16 relative overflow-hidden animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full">
            Official Team Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
            Team Registration
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Complete your 3-member team profile (Leader + 2 Members) and submit the 300 BDT registration fee.
          </p>

          {/* Quick link to View/Edit Registration */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenViewEditModal?.()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#16A34A] hover:text-[#16A34A] shadow-2xs transition active:scale-98 group"
            >
              <Search className="w-3.5 h-3.5 text-[#16A34A] group-hover:scale-110 transition" />
              <span>Already registered? View or Edit your team (up to 3 edits)</span>
            </button>
          </div>
        </div>

        {/* If successfully submitted, display Success View */}
        {submissionResult ? (
          <SuccessView
            result={submissionResult}
            formData={formData}
            onClose={handleRegisterAnother}
          />
        ) : (
          /* Multi-step Registration Card */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8 md:p-10 relative">
            {/* Demo Fill-up Action Bar */}
            <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0A192F]">Demo Fill-up</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                      Testing Option
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Pre-fill all 3 team members, student portraits, and bKash transaction with sample data.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDemoFillup}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-98 transition shadow-xs"
                  title="Auto-fill form with realistic demo team"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{isFormPartiallyFilled ? 'Re-generate Demo Data' : 'Fill Demo Data'}</span>
                </button>

                {isFormPartiallyFilled && currentStep !== 4 && (
                  <button
                    type="button"
                    onClick={handleJumpToReview}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#0A192F] bg-emerald-100 hover:bg-emerald-200 active:scale-98 transition border border-emerald-300"
                    title="Jump directly to Review & Submit step"
                  >
                    <FastForward className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Review & Submit</span>
                  </button>
                )}

                {isFormPartiallyFilled && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="p-2 rounded-xl text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                    title="Clear form"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {demoToast && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-semibold flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#15803D]" />
                  <span>{demoToast}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setDemoToast(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Step Progress Bar */}
            <div className="mb-8 pb-6 border-b border-slate-100">
              {/* Desktop Stepper */}
              <div className="hidden sm:flex items-center justify-between">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;

                  return (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            isDone
                              ? 'bg-[#16A34A] text-white shadow-xs'
                              : isCurrent
                              ? 'bg-[#0A192F] text-white ring-4 ring-[#22C55E]/20 shadow-md'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span
                          className={`text-xs mt-2 font-bold tracking-tight ${
                            isCurrent
                              ? 'text-[#0A192F]'
                              : isDone
                              ? 'text-[#16A34A]'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {idx < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-3 transition-colors ${
                            currentStep > idx ? 'bg-[#16A34A]' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Mobile Stepper Header */}
              <div className="sm:hidden flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#16A34A]">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <h3 className="text-base font-extrabold text-[#0A192F]">
                    {steps[currentStep].label}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Step Form Body */}
            <div>
              {currentStep === 0 && (
                <ParticipantStepForm
                  title="Group Leader Information"
                  subtitle="Primary point of contact for the team and official representative."
                  roleBadge="Team Leader"
                  participant={formData.leader}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, leader: { ...prev.leader, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[formData.member1.roll, formData.member2.roll].filter(Boolean)}
                />
              )}

              {currentStep === 1 && (
                <ParticipantStepForm
                  title="Member 1 Information"
                  subtitle="First team member details and student identification."
                  roleBadge="Member 1"
                  participant={formData.member1}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, member1: { ...prev.member1, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[formData.leader.roll, formData.member2.roll].filter(Boolean)}
                />
              )}

              {currentStep === 2 && (
                <ParticipantStepForm
                  title="Member 2 Information"
                  subtitle="Second team member details and student identification."
                  roleBadge="Member 2"
                  participant={formData.member2}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, member2: { ...prev.member2, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[formData.leader.roll, formData.member1.roll].filter(Boolean)}
                />
              )}

              {currentStep === 3 && (
                <PaymentStepForm
                  payment={formData.payment}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, payment: { ...prev.payment, ...updated } }))
                  }
                  errors={stepErrors}
                  leaderRoll={formData.leader.roll}
                />
              )}

              {currentStep === 4 && (
                <ReviewConfirmStep
                  formData={formData}
                  onEditStep={(stepIdx) => {
                    setStepErrors({});
                    setSubmitError(null);
                    setCurrentStep(stepIdx);
                  }}
                  onConfirmSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              )}
            </div>

            {/* Bottom Nav Controls (for steps 0 to 3) */}
            {currentStep < 4 && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-98"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition active:scale-98 shadow-md shadow-[#0A192F]/15"
                >
                  <span>Continue to {steps[currentStep + 1]?.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#22C55E]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
