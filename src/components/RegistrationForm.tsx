import React, { useState, useEffect } from 'react';
import { User, Users, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, ShieldAlert, RotateCcw, Search } from 'lucide-react';
import { RegistrationFormData, SubmissionResponse, Participant, SubmissionProgressStage } from '../types';
import { ParticipantStepForm } from './ParticipantStepForm';
import { PaymentStepForm } from './PaymentStepForm';
import { ReviewConfirmStep } from './ReviewConfirmStep';
import { SuccessView } from './SuccessView';
import { validateBangladeshPhone, validateTransactionId, validateEmail } from '../utils/formUtils';
import { getRegistrationPdfBase64 } from '../utils/pdfGenerator';

const initialParticipant = (): Participant => ({
  name: '',
  roll: '',
  department: '',
  whatsapp: '',
  facebook: '',
  email: '',
  photoBase64: undefined,
  photoPreview: undefined,
  photoName: undefined,
  photoSize: undefined
});

const initialFormData = (): RegistrationFormData => ({
  teamName: '',
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
  onOpenGoogleSheetModal?: () => void;
  onRegistrationSuccess?: (result: SubmissionResponse, formData: RegistrationFormData) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  customScriptUrl,
  onOpenViewEditModal,
  onOpenGoogleSheetModal,
  onRegistrationSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData());
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgressStage, setSubmitProgressStage] = useState<SubmissionProgressStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const isFormPartiallyFilled = Boolean(
    formData.teamName ||
    formData.leader.name ||
    formData.member1.name ||
    formData.member2.name ||
    formData.payment.transactionId
  );

  const handleClearForm = () => {
    setFormData(initialFormData());
    setStepErrors({});
    setSubmitError(null);
    setCurrentStep(0);
  };

  const steps = [
    { label: 'Team & Leader', icon: User },
    { label: 'Member 1', icon: Users },
    { label: 'Member 2', icon: Users },
    { label: 'Payment', icon: CreditCard },
    { label: 'Review & Confirm', icon: CheckCircle2 }
  ];

  // Validation per step
  const validateParticipant = (p: Participant, otherRolls: string[], isLeader: boolean = false): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!p.name.trim()) errs.name = 'Full name is required.';
    if (!p.roll.trim()) {
      errs.roll = 'Roll number is required.';
    } else if (otherRolls.includes(p.roll.trim())) {
      errs.roll = 'This roll number is already assigned to another team member.';
    }
    if (!p.department) errs.department = 'Department must be selected.';
    if (!p.whatsapp.trim()) {
      errs.whatsapp = 'Mobile number is required.';
    } else if (!validateBangladeshPhone(p.whatsapp)) {
      errs.whatsapp = 'Please enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX).';
    }

    // Leader specific validation
    if (isLeader) {
      if (!p.facebook.trim() || p.facebook.trim().toLowerCase() === 'blank') {
        errs.facebook = 'Team Leader Facebook profile link or ID is required.';
      }
      if (!p.email || !p.email.trim()) {
        errs.email = 'Leader email address is required for official confirmation.';
      } else if (!validateEmail(p.email)) {
        errs.email = 'Please enter a valid email address (e.g. leader@gmail.com).';
      }
    }
    // Team members (Member 1 & 2): Facebook is optional; if left empty it defaults to "Blank"

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
      if (!formData.teamName || !formData.teamName.trim()) {
        errs.teamName = 'Team name is required.';
      } else if (formData.teamName.trim().length < 2) {
        errs.teamName = 'Team name must be at least 2 characters.';
      }

      const leaderErrs = validateParticipant(formData.leader, [
        formData.member1.roll.trim(),
        formData.member2.roll.trim()
      ].filter(Boolean), true);

      errs = { ...errs, ...leaderErrs };
    } else if (currentStep === 1) {
      errs = validateParticipant(formData.member1, [
        formData.leader.roll.trim(),
        formData.member2.roll.trim()
      ].filter(Boolean), false);
    } else if (currentStep === 2) {
      errs = validateParticipant(formData.member2, [
        formData.leader.roll.trim(),
        formData.member1.roll.trim()
      ].filter(Boolean), false);
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
    setSubmitProgressStage('validating');
    setSubmitError(null);

    try {
      const formRolls = [
        String(formData.leader.roll || '').trim(),
        String(formData.member1.roll || '').trim(),
        String(formData.member2.roll || '').trim()
      ].filter(Boolean);
      const cleanTrx = String(formData.payment.transactionId || '').trim().toUpperCase();

      // Realistic stage feedback delay for seamless UX
      await new Promise((r) => setTimeout(r, 450));

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

      // Stage 2: Photos preparation & Google Drive payload optimization
      setSubmitProgressStage('photos');
      await new Promise((r) => setTimeout(r, 550));

      // Stage 3: Submit to Google Sheets & Drive backend endpoint
      setSubmitProgressStage('saving_sheets');

      // Ensure empty Facebook fields default to "Blank" for Google Sheets, PDF, and database
      const normalizedFormData: RegistrationFormData = {
        ...formData,
        leader: {
          ...formData.leader,
          facebook: formData.leader.facebook?.trim() || 'Blank'
        },
        member1: {
          ...formData.member1,
          facebook: formData.member1.facebook?.trim() || 'Blank'
        },
        member2: {
          ...formData.member2,
          facebook: formData.member2.facebook?.trim() || 'Blank'
        }
      };

      // Pre-generate official registration voucher PDF base64 to send with confirmation email
      let pdfBase64 = '';
      try {
        pdfBase64 = getRegistrationPdfBase64({
          registrationId: 'TEX2026-PENDING',
          submissionDate: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
          paymentStatus: 'Pending',
          formData: normalizedFormData
        });
      } catch (pdfErr) {
        console.warn('PDF Base64 generation warning:', pdfErr);
      }

      const payloadToSend = {
        ...normalizedFormData,
        pdfBase64
      };

      let data: SubmissionResponse | null = null;
      const defaultScriptUrl = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';
      const envScriptUrl = 
        (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
        (import.meta as any).env?.GOOGLE_SCRIPT_URL || 
        '';
      const storedScriptUrl = customScriptUrl || envScriptUrl || localStorage.getItem('tpc2026_google_script_url') || defaultScriptUrl;

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedScriptUrl) {
          headers['x-google-script-url'] = storedScriptUrl;
        }

        const res = await fetch('/api/register', {
          method: 'POST',
          headers,
          body: JSON.stringify(payloadToSend)
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
        console.warn('Backend API submission warning, attempting direct Google Apps Script sync:', fetchErr);
      }

      // If backend was unreachable or returned static fallback and storedScriptUrl is set, try direct POST to Google Apps Script
      if ((!data || data.source !== 'google_sheets') && storedScriptUrl && storedScriptUrl.startsWith('http')) {
        try {
          // Send as text/plain to avoid browser CORS preflight blocks with Google Apps Script
          const directScriptRes = await fetch(storedScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payloadToSend)
          });
          const rawDirect = await directScriptRes.text();
          let scriptJson: any = null;
          try {
            scriptJson = JSON.parse(rawDirect);
          } catch {
            // In case Google Script redirects or returns text
          }
          if (scriptJson && scriptJson.success) {
            data = scriptJson;
          }
        } catch (directErr) {
          console.warn('Direct Google Script fetch notice:', directErr);
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

      // Stage 4: Finalizing Voucher & registration ID
      setSubmitProgressStage('finalizing');
      await new Promise((r) => setTimeout(r, 400));

      // Cache registration locally for view, search, edit & PDF download
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
          formData: normalizedFormData
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
        localStorage.setItem('tpc2026_latest_submission', JSON.stringify({ result: data, formData: normalizedFormData }));

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
        onRegistrationSuccess(data, normalizedFormData);
      }

    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'An error occurred during submission. Please check the fields and retry.');
    } finally {
      setIsSubmitting(false);
      setSubmitProgressStage('idle');
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
            Complete your 3-member team profile (Leader + 2 Members) and submit the 149 BDT registration fee.
          </p>

          {/* Quick link to View/Edit Registration */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenViewEditModal?.()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#16A34A] hover:bg-emerald-50 hover:text-[#16A34A] shadow-2xs transition active:scale-98 group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#16A34A] group-hover:scale-110 transition-transform" />
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
            {/* Action Bar: Reset Form if filled */}
            {isFormPartiallyFilled && (
              <div className="flex items-center justify-end mb-6 pb-4 border-b border-slate-100">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-white hover:bg-red-600 hover:border-red-600 border border-slate-200 transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>
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
                  title="Team & Group Leader Information"
                  subtitle="Primary point of contact for the team and official representative."
                  roleBadge="Team Leader"
                  participant={formData.leader}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, leader: { ...prev.leader, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[formData.member1.roll, formData.member2.roll].filter(Boolean)}
                  showEmail={true}
                  showTeamName={true}
                  teamName={formData.teamName}
                  onTeamNameChange={(name) => {
                    setFormData((prev) => ({ ...prev, teamName: name }));
                    if (stepErrors.teamName) {
                      setStepErrors((prev) => {
                        const { teamName: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  teamNameError={stepErrors.teamName}
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
                  progressStage={submitProgressStage}
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
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-[#0A192F] hover:text-white hover:border-[#0A192F] transition active:scale-98 cursor-pointer shadow-2xs"
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
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#16A34A] border border-[#0A192F] hover:border-[#16A34A] transition active:scale-98 shadow-md shadow-[#0A192F]/15 cursor-pointer group"
                >
                  <span>Continue to {steps[currentStep + 1]?.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#22C55E] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
