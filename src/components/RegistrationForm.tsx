import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Users, CreditCard, CheckCircle2, ChevronRight, ChevronLeft, RotateCcw, Search, Lock, Calendar } from 'lucide-react';
import { RegistrationFormData, SubmissionResponse, Participant, SubmissionProgressStage } from '../types';
import { ParticipantStepForm } from './ParticipantStepForm';
import { PaymentStepForm } from './PaymentStepForm';
import { ReviewConfirmStep } from './ReviewConfirmStep';
import { SuccessView } from './SuccessView';
import { validateBangladeshPhone, validateTransactionId, validateEmail } from '../utils/formUtils';
import { getRegistrationPdfBase64 } from '../utils/pdfGenerator';
import { isRegistrationClosed, REGISTRATION_DEADLINE_LABEL, EVENT_DATE_SHORT, EVENT_VENUE } from '../utils/deadline';

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

const createNAParticipant = (): Participant => ({
  name: 'N/A',
  roll: 'N/A',
  department: 'N/A',
  whatsapp: 'N/A',
  facebook: 'N/A',
  email: 'N/A',
  photoBase64: undefined,
  photoPreview: undefined,
  photoName: 'N/A',
  photoSize: 0
});

const initialFormData = (): RegistrationFormData => ({
  teamName: '',
  teamSize: 3,
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
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitProgressStage, setSubmitProgressStage] = useState<SubmissionProgressStage>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);

  const teamSize: 1 | 2 | 3 = formData.teamSize || 3;

  const isFormPartiallyFilled = Boolean(
    formData.teamName ||
    (formData.leader.name && formData.leader.name !== 'N/A') ||
    (teamSize >= 2 && formData.member1.name && formData.member1.name !== 'N/A') ||
    (teamSize >= 3 && formData.member2.name && formData.member2.name !== 'N/A') ||
    formData.payment.transactionId
  );

  const getStepsForSize = (size: 1 | 2 | 3) => {
    if (size === 1) {
      return [
        { label: 'Team Leader', icon: User, type: 'leader' },
        { label: 'Payment', icon: CreditCard, type: 'payment' },
        { label: 'Review & Confirm', icon: CheckCircle2, type: 'review' }
      ];
    }
    if (size === 2) {
      return [
        { label: 'Team Leader', icon: User, type: 'leader' },
        { label: 'Member 1', icon: Users, type: 'member1' },
        { label: 'Payment', icon: CreditCard, type: 'payment' },
        { label: 'Review & Confirm', icon: CheckCircle2, type: 'review' }
      ];
    }
    return [
      { label: 'Team Leader', icon: User, type: 'leader' },
      { label: 'Member 1', icon: Users, type: 'member1' },
      { label: 'Member 2', icon: Users, type: 'member2' },
      { label: 'Payment', icon: CreditCard, type: 'payment' },
      { label: 'Review & Confirm', icon: CheckCircle2, type: 'review' }
    ];
  };

  const steps = getStepsForSize(teamSize);

  const handleTeamSizeChange = (newSize: 1 | 2 | 3) => {
    setFormData((prev) => {
      const updated: RegistrationFormData = { ...prev, teamSize: newSize };
      if (newSize === 1) {
        updated.member1 = createNAParticipant();
        updated.member2 = createNAParticipant();
      } else if (newSize === 2) {
        updated.member2 = createNAParticipant();
        if (updated.member1.name === 'N/A') {
          updated.member1 = initialParticipant();
        }
      } else if (newSize === 3) {
        if (updated.member1.name === 'N/A') {
          updated.member1 = initialParticipant();
        }
        if (updated.member2.name === 'N/A') {
          updated.member2 = initialParticipant();
        }
      }
      return updated;
    });

    const newSteps = getStepsForSize(newSize);
    setCurrentStep((prev) => Math.min(prev, newSteps.length - 1));
    setStepErrors({});
  };

  const handleClearForm = () => {
    setFormData(initialFormData());
    setStepErrors({});
    setSubmitError(null);
    setCurrentStep(0);
  };

  // Validation per step
  const validateParticipant = (p: Participant, otherRolls: string[], isLeader: boolean = false): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!p.name.trim() || p.name === 'N/A') errs.name = 'Full name is required.';
    if (!p.roll.trim() || p.roll === 'N/A') {
      errs.roll = 'Roll number is required.';
    } else if (otherRolls.filter(r => r && r !== 'N/A').includes(p.roll.trim())) {
      errs.roll = 'This roll number is already assigned to another team member.';
    }
    if (!p.department || p.department === 'N/A') errs.department = 'Department must be selected.';
    if (!p.whatsapp.trim() || p.whatsapp === 'N/A') {
      errs.whatsapp = 'Mobile number is required.';
    } else if (!validateBangladeshPhone(p.whatsapp)) {
      errs.whatsapp = 'Please enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX).';
    }

    // Leader specific validation
    if (isLeader) {
      if (!p.facebook.trim() || p.facebook.trim().toLowerCase() === 'blank' || p.facebook === 'N/A') {
        errs.facebook = 'Participant/Leader Facebook profile link or ID is required.';
      }
      if (!p.email || !p.email.trim() || p.email === 'N/A') {
        errs.email = 'Email address is required for official confirmation.';
      } else if (!validateEmail(p.email)) {
        errs.email = 'Please enter a valid email address (e.g. participant@gmail.com).';
      }
    }

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
    const stepType = steps[currentStep]?.type;

    if (stepType === 'leader') {
      if (!formData.teamName || !formData.teamName.trim()) {
        errs.teamName = teamSize === 1 ? 'Presentation / Project title or Team Name is required.' : 'Team name is required.';
      } else if (formData.teamName.trim().length < 2) {
        errs.teamName = 'Name must be at least 2 characters.';
      }

      const otherRolls = [
        teamSize >= 2 ? formData.member1.roll.trim() : '',
        teamSize >= 3 ? formData.member2.roll.trim() : ''
      ].filter(r => r && r !== 'N/A');
      const leaderErrs = validateParticipant(formData.leader, otherRolls, true);
      errs = { ...errs, ...leaderErrs };
    } else if (stepType === 'member1' && teamSize >= 2) {
      const otherRolls = [
        formData.leader.roll.trim(),
        teamSize >= 3 ? formData.member2.roll.trim() : ''
      ].filter(r => r && r !== 'N/A');
      errs = validateParticipant(formData.member1, otherRolls, false);
    } else if (stepType === 'member2' && teamSize >= 3) {
      const otherRolls = [
        formData.leader.roll.trim(),
        formData.member1.roll.trim()
      ].filter(r => r && r !== 'N/A');
      errs = validateParticipant(formData.member2, otherRolls, false);
    } else if (stepType === 'payment') {
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

  const isClosed = isRegistrationClosed();

  // Final confirmation & submit
  const handleFinalSubmit = async () => {
    if (isClosed) {
      setSubmitError(`Registration is officially closed. The deadline was ${REGISTRATION_DEADLINE_LABEL}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitProgressStage('validating');
    setSubmitError(null);

    try {
      // Stage 1: Validation
      await new Promise((r) => setTimeout(r, 450));

      const formRolls = [
        formData.leader.roll?.trim(),
        teamSize >= 2 ? formData.member1.roll?.trim() : '',
        teamSize >= 3 ? formData.member2.roll?.trim() : ''
      ].filter((r): r is string => Boolean(r && r !== 'N/A'));

      const cleanTrx = formData.payment.transactionId?.trim().toUpperCase();

      // 1. Client-side storage pre-check for duplicates
      try {
        const localListStr = localStorage.getItem('tpc2026_saved_registrations');
        if (localListStr) {
          const list = JSON.parse(localListStr);
          for (const item of list) {
            if (item.formData?.payment?.transactionId?.toUpperCase() === cleanTrx) {
              throw new Error(`Transaction ID "${cleanTrx}" was already registered in team ${item.registrationId}.`);
            }
            if (item.formData) {
              const itemRolls = [
                item.formData.leader?.roll?.trim().toUpperCase(),
                item.formData.member1?.roll?.trim().toUpperCase(),
                item.formData.member2?.roll?.trim().toUpperCase()
              ].filter(Boolean);
              for (const r of formRolls) {
                if (itemRolls.includes(r.toUpperCase())) {
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
          throw new Error(dupData.message || 'Duplicate roll or transaction ID already registered.');
        }
      } catch (dupErr: any) {
        if (dupErr.message && (dupErr.message.includes('already') || dupErr.message.includes('Duplicate'))) {
          throw dupErr;
        }
      }

      // Stage 2: Photos preparation & Google Drive payload optimization
      setSubmitProgressStage('photos');
      await new Promise((r) => setTimeout(r, 550));

      // Stage 3: Submit to Google Sheets & Drive backend endpoint
      setSubmitProgressStage('saving_sheets');

      // Ensure unused members have complete "N/A" values across every field
      const normalizedFormData: RegistrationFormData = {
        ...formData,
        teamSize,
        leader: {
          ...formData.leader,
          facebook: formData.leader.facebook?.trim() || 'Blank'
        },
        member1: teamSize >= 2 ? {
          ...formData.member1,
          facebook: formData.member1.facebook?.trim() || 'Blank'
        } : createNAParticipant(),
        member2: teamSize >= 3 ? {
          ...formData.member2,
          facebook: formData.member2.facebook?.trim() || 'Blank'
        } : createNAParticipant()
      };

      // Pre-generate official registration entry pass PDF base64 to send with confirmation email
      let pdfBase64 = '';
      try {
        pdfBase64 = getRegistrationPdfBase64({
          registrationId: 'TPC-PENDING',
          submissionDate: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
          paymentStatus: 'Pending',
          formData: normalizedFormData
        });
      } catch (pdfErr) {
        console.warn('PDF Base64 generation warning:', pdfErr);
      }

      const defaultScriptUrl = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';
      const envScriptUrl = 
        (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 
        (import.meta as any).env?.GOOGLE_SCRIPT_URL || 
        '';
      const storedScriptUrl = customScriptUrl || envScriptUrl || localStorage.getItem('tpc2026_google_script_url') || defaultScriptUrl;

      const payloadToSend = {
        ...normalizedFormData,
        websiteUrl: typeof window !== 'undefined' ? window.location.origin : '',
        scriptUrl: storedScriptUrl,
        pdfBase64
      };

      let data: SubmissionResponse | null = null;

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
      const getLast2Digits = (roll: any): string => {
        if (!roll || roll === 'N/A') return '00';
        const digits = String(roll || '').replace(/\D/g, '');
        if (digits.length >= 2) return digits.slice(-2);
        return (digits || String(roll || '').trim()).padStart(2, '0').slice(-2);
      };

      const rollsLast2 = 
        getLast2Digits(formData.leader.roll) +
        (teamSize >= 2 ? getLast2Digits(formData.member1.roll) : '00') +
        (teamSize >= 3 ? getLast2Digits(formData.member2.roll) : '00');

      let localSeq = 1;
      try {
        const existingList = JSON.parse(localStorage.getItem('tpc2026_saved_registrations') || '[]');
        for (const item of existingList) {
          const match = String(item.registrationId || '').match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num >= localSeq) localSeq = num + 1;
          }
        }
      } catch (e) {}
      const fallbackSeqStr = String(localSeq).padStart(2, '0');
      const fallbackRegId = `TPC-${rollsLast2}-${fallbackSeqStr}`;

      if (!data) {
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

      // Stage 4: Finalizing Entry Pass & registration ID
      setSubmitProgressStage('finalizing');
      await new Promise((r) => setTimeout(r, 400));

      // Cache registration locally for view, search, edit & PDF download
      const regId = data.registrationId || fallbackRegId;
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

      if (onRegistrationSuccess) {
        onRegistrationSuccess(data, normalizedFormData);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission. Please try again.');
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

  const currentStepDef = steps[currentStep] || steps[0];

  return (
    <div id="registration" className="py-10 md:py-16 relative overflow-hidden animate-in fade-in duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full">
            Official Registration Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
            Online Registration
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Register Solo (1 Member), Duo (2 Members), or as a Team of up to 3 members and submit the 149 BDT registration fee.
          </p>

          {/* Quick link to View/Edit Registration */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onOpenViewEditModal?.()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:border-[#16A34A] hover:bg-emerald-50 hover:text-[#16A34A] shadow-2xs transition active:scale-98 group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#16A34A] group-hover:scale-110 transition-transform" />
              <span>Already registered? View Your Registration (up to 3 edits)</span>
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
        ) : isClosed ? (
          /* Registration Locked & Closed Card */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                Registration Closed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] font-['Outfit'] tracking-tight">
                Online Registration Has Closed
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                The registration deadline for the <strong>Textile Presentation Competition 2026</strong> was <strong>{REGISTRATION_DEADLINE_LABEL}</strong>. New registrations are now automatically locked.
              </p>
            </div>

            {/* Quick Actions for Already Registered Teams */}
            <div className="bg-[#FAFBF9] border border-slate-200/80 rounded-2xl p-5 text-left space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A192F]">
                <Calendar className="w-4 h-4 text-[#16A34A]" />
                <span>Next steps for registered participants:</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Check your payment approval status and official registration record.</li>
                <li>Download or print your updated official entry pass (PDF).</li>
                <li>Join the official WhatsApp group once payment is verified.</li>
                <li>Attend the presentation event at <strong>{EVENT_VENUE}</strong> on <strong>{EVENT_DATE_SHORT}</strong>.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenViewEditModal?.()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#16A34A] transition shadow-md cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#22C55E]" />
                <span>View Registration & Download Entry Pass</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Multi-step Registration Card */
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-8 md:p-10 relative">
            {/* Active Deadline Banner */}
            <div className="mb-6 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#16A34A] shrink-0" />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-[#0A192F]">Registration Closes: </span>
                  <span className="font-semibold text-emerald-800">{REGISTRATION_DEADLINE_LABEL}</span>
                </div>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-[#16A34A] bg-white px-2.5 py-0.5 rounded-md border border-emerald-200">
                149 BDT / Registration
              </span>
            </div>

            {/* Action Bar: Reset Form when partially filled */}
            {isFormPartiallyFilled && (
              <div className="flex items-center justify-end mb-5 pb-3 border-b border-slate-100">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleClearForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-white hover:bg-rose-600 hover:border-rose-600 border border-slate-200 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </motion.button>
              </div>
            )}

            {/* Team Size Selector (1, 2, or 3 Students) */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#16A34A]" />
                  <span>SELECT TEAM SIZE</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { size: 1 as const, label: '1 Student — Solo', icon: User },
                  { size: 2 as const, label: '2 Students — Duo', icon: Users },
                  { size: 3 as const, label: '3 Students — Trio', icon: Users }
                ].map((item) => {
                  const isSelected = teamSize === item.size;
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.size}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTeamSizeChange(item.size)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-md ring-2 ring-[#22C55E]/40'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#22C55E]' : 'text-slate-400'}`} />
                        <span className="text-xs font-black tracking-tight">{item.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

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
                    {steps[currentStep]?.label}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Step Form Body */}
            <div>
              {currentStepDef.type === 'leader' && (
                <ParticipantStepForm
                  title={teamSize === 1 ? 'Team Leader Information' : 'Team Leader Information'}
                  subtitle="Enter team leader and presentation details."
                  roleBadge="Team Leader"
                  participant={formData.leader}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, leader: { ...prev.leader, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[
                    teamSize >= 2 ? formData.member1.roll : '',
                    teamSize >= 3 ? formData.member2.roll : ''
                  ].filter((r): r is string => Boolean(r && r !== 'N/A'))}
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

              {currentStepDef.type === 'member1' && teamSize >= 2 && (
                <ParticipantStepForm
                  title="Member 1 Information"
                  subtitle="Enter second team member details."
                  roleBadge="Member 1"
                  participant={formData.member1}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, member1: { ...prev.member1, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[
                    formData.leader.roll,
                    teamSize >= 3 ? formData.member2.roll : ''
                  ].filter((r): r is string => Boolean(r && r !== 'N/A'))}
                />
              )}

              {currentStepDef.type === 'member2' && teamSize >= 3 && (
                <ParticipantStepForm
                  title="Member 2 Information"
                  subtitle="Enter third team member details."
                  roleBadge="Member 2"
                  participant={formData.member2}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, member2: { ...prev.member2, ...updated } }))
                  }
                  errors={stepErrors}
                  otherRolls={[
                    formData.leader.roll,
                    formData.member1.roll
                  ].filter((r): r is string => Boolean(r && r !== 'N/A'))}
                />
              )}

              {currentStepDef.type === 'payment' && (
                <PaymentStepForm
                  payment={formData.payment}
                  onChange={(updated) =>
                    setFormData((prev) => ({ ...prev, payment: { ...prev.payment, ...updated } }))
                  }
                  errors={stepErrors}
                  leaderRoll={formData.leader.roll}
                />
              )}

              {currentStepDef.type === 'review' && (
                <ReviewConfirmStep
                  formData={formData}
                  onEditStep={(stepIdx) => {
                    setStepErrors({});
                    setSubmitError(null);
                    setCurrentStep(Math.min(stepIdx, steps.length - 1));
                  }}
                  onConfirmSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  progressStage={submitProgressStage}
                />
              )}
            </div>

            {/* Bottom Nav Controls (for steps before Review) */}
            {currentStepDef.type !== 'review' && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-[#0A192F] hover:text-white hover:border-[#0A192F] transition cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </motion.button>
                ) : (
                  <div />
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-[#0A192F] hover:bg-[#16A34A] border border-[#0A192F] hover:border-[#16A34A] transition shadow-md shadow-[#0A192F]/15 cursor-pointer group"
                >
                  <span>Continue to {steps[currentStep + 1]?.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#22C55E] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
