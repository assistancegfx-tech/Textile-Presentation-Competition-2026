import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PenTool,
  User,
  Hash,
  BookOpen,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { BlitzRegistrationFormData, BlitzSubmissionResponse } from '../types';
import { validateBangladeshPhone, validateTransactionId, validateEmail } from '../utils/formUtils';
import { isRegistrationClosed, REGISTRATION_DEADLINE_LABEL } from '../utils/deadline';
import { getBlitzPdfBase64 } from '../utils/pdfGenerator';

const BKASH_PERSONAL_NUMBER = '01319521982';
const REGISTRATION_FEE_BDT = 49;

interface BlitzWritingFormProps {
  customScriptUrl?: string;
  onBackToSelector: () => void;
  onSuccess: (result: BlitzSubmissionResponse, data: BlitzRegistrationFormData) => void;
}

export const BlitzWritingForm: React.FC<BlitzWritingFormProps> = ({
  customScriptUrl,
  onBackToSelector,
  onSuccess
}) => {
  const isClosed = isRegistrationClosed();

  const [formData, setFormData] = useState<BlitzRegistrationFormData>({
    fullName: '',
    batch: '',
    department: '',
    studentId: '',
    whatsapp: '',
    email: '',
    senderBkash: '',
    transactionId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedBkash, setCopiedBkash] = useState(false);

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(BKASH_PERSONAL_NUMBER);
    setCopiedBkash(true);
    setTimeout(() => setCopiedBkash(false), 2000);
  };

  const handleChange = (field: keyof BlitzRegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required (as per your certificate).';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.batch) {
      newErrors.batch = 'Please select your batch.';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department.';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required.';
    }

    if (!validateBangladeshPhone(formData.whatsapp)) {
      newErrors.whatsapp = 'Valid 11-digit WhatsApp number is required (e.g. 01XXXXXXXXX).';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for entry pass delivery.';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@gmail.com).';
    }

    if (!validateBangladeshPhone(formData.senderBkash)) {
      newErrors.senderBkash = 'Valid 11-digit sender bKash number is required (e.g. 01XXXXXXXXX).';
    }

    if (!validateTransactionId(formData.transactionId)) {
      newErrors.transactionId = 'Valid bKash Transaction ID is required (e.g. 8-10 alphanumeric characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (isClosed) {
      setSubmitError(`Registration is closed. The deadline was ${REGISTRATION_DEADLINE_LABEL}.`);
      return;
    }

    if (!validateForm()) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanData: BlitzRegistrationFormData = {
        fullName: formData.fullName.trim(),
        batch: formData.batch,
        department: formData.department,
        studentId: formData.studentId.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        senderBkash: formData.senderBkash.trim(),
        transactionId: formData.transactionId.trim().toUpperCase()
      };

      // Generate PDF base64 for email attachment
      let pdfBase64 = '';
      try {
        pdfBase64 = getBlitzPdfBase64({
          registrationId: 'TBW-PENDING',
          submissionDate: new Date().toLocaleDateString('en-GB'),
          paymentStatus: 'Pending',
          fullName: cleanData.fullName,
          batch: cleanData.batch,
          department: cleanData.department,
          studentId: cleanData.studentId,
          whatsapp: cleanData.whatsapp,
          email: cleanData.email,
          senderBkash: cleanData.senderBkash,
          transactionId: cleanData.transactionId
        });
      } catch (pdfErr) {
        console.warn('Could not generate client-side Blitz PDF base64:', pdfErr);
      }

      const payload = {
        action: 'blitz_registration',
        registrationType: 'blitz',
        ...cleanData,
        pdfBase64,
        scriptUrl: customScriptUrl
      };

      const res = await fetch('/api/register-blitz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customScriptUrl ? { 'x-google-script-url': customScriptUrl } : {})
        },
        body: JSON.stringify(payload)
      });

      const json: BlitzSubmissionResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Registration failed. Please check your details and try again.');
      }

      // Save locally
      try {
        const blitzSubmissions = JSON.parse(localStorage.getItem('tbw2026_submissions') || '[]');
        blitzSubmissions.unshift({
          result: json,
          formData: cleanData,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem('tbw2026_submissions', JSON.stringify(blitzSubmissions));
        localStorage.setItem('tbw2026_latest_submission', JSON.stringify({ result: json, formData: cleanData }));
      } catch (_) {}

      onSuccess(json, cleanData);
    } catch (err: any) {
      console.error('Blitz registration submission error:', err);
      setSubmitError(err.message || 'An unexpected error occurred during submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Top Back Nav & Category Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBackToSelector}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#0A192F] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Registration Option</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full bg-sky-50 text-[#0066CC] border border-sky-200">
          <PenTool className="w-3.5 h-3.5 text-[#1E90FF]" />
          <span>Blitz Writing</span>
        </span>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Card Header with Dodger Blue Gradient */}
        <div className="bg-gradient-to-br from-[#0A192F] via-[#0B2545] to-[#1E3A8A] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#1E90FF]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1E90FF]/20 border border-[#1E90FF]/35 text-sky-200 text-xs font-bold tracking-wide uppercase mb-2">
                <PenTool className="w-3.5 h-3.5 text-[#1E90FF]" />
                <span>Textile Blitz Writing 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                Participant Registration
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-1">
                Fill in your academic and payment details to register for the creative writing competition.
              </p>
            </div>

            <div className="shrink-0 bg-white/10 backdrop-blur-xs border border-white/15 px-4 py-2.5 rounded-2xl text-center sm:text-right">
              <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Entry Fee</span>
              <span className="text-xl font-black text-amber-300">49 BDT</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs sm:text-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Submission Error:</span>
                <span>{submitError}</span>
              </div>
            </motion.div>
          )}

          {/* Section 1: Academic & Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-[#1E90FF]" />
              <span>1. Participant Information</span>
            </h3>

            {/* Full Name */}
            <div data-error={Boolean(errors.fullName)}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Md. Tanvir Hasan"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  disabled={isSubmitting || isClosed}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                According to your Certificate
              </p>
              {errors.fullName && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Batch & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batch */}
              <div data-error={Boolean(errors.batch)}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Batch <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['13', '14', '15', '16'] as const).map((b) => {
                    const isSelected = formData.batch === b;
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleChange('batch', b)}
                        disabled={isSubmitting || isClosed}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-black transition border cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E90FF] text-white border-[#1E90FF] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {b}th
                      </button>
                    );
                  })}
                </div>
                {errors.batch && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.batch}
                  </p>
                )}
              </div>

              {/* Department */}
              <div data-error={Boolean(errors.department)}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['YE', 'FE', 'WPE', 'AE'] as const).map((dept) => {
                    const isSelected = formData.department === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => handleChange('department', dept)}
                        disabled={isSubmitting || isClosed}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-black transition border cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E90FF] text-white border-[#1E90FF] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
                {errors.department && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Student ID & WhatsApp Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student ID */}
              <div data-error={Boolean(errors.studentId)}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 230404... or AE-04"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    disabled={isSubmitting || isClosed}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                      errors.studentId
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  e.g. 230404... or AE-04
                </p>
                {errors.studentId && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.studentId}
                  </p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div data-error={Boolean(errors.whatsapp)}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmitting || isClosed}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                      errors.whatsapp
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20'
                    }`}
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.whatsapp}
                  </p>
                )}
              </div>
            </div>

            {/* Email Address (for Entry Pass PDF & Confirmation Dispatch) */}
            <div data-error={Boolean(errors.email)}>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isSubmitting || isClosed}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-[#1E90FF] focus:ring-[#1E90FF]/20'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#1E90FF] shrink-0" />
                <span>Your official digital Entry Pass PDF will be emailed to this address.</span>
              </p>
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Payment Rules & Verification */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-[#E2136E]" />
              <span>2. Payment Rules &amp; Verification</span>
            </h3>

            {/* bKash Payment Instructions Card */}
            <div className="bg-[#FFF5F8] border-2 border-[#E2136E]/25 rounded-2xl p-4 sm:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-pink-200/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#E2136E] text-white text-xs font-black flex items-center justify-center">৳</span>
                  <span className="text-xs font-black text-[#0A192F] uppercase tracking-wider">
                    Registration Fee: {REGISTRATION_FEE_BDT} BDT
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold text-slate-800 shadow-2xs">
                  <span className="text-[11px] text-slate-500">bKash Personal:</span>
                  <code className="text-[#E2136E] font-black text-xs font-mono">{BKASH_PERSONAL_NUMBER}</code>
                  <button
                    type="button"
                    onClick={handleCopyBkash}
                    className="ml-1 text-slate-400 hover:text-[#E2136E] transition cursor-pointer"
                    title="Copy bKash Number"
                  >
                    {copiedBkash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Payment Rules Ordered Steps */}
              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900 mb-1">Payment Rules (Registration Fee: {REGISTRATION_FEE_BDT} BDT):</p>
                <ol className="list-decimal list-inside space-y-1 font-medium pl-1 text-[12.5px] leading-relaxed">
                  <li>Go to your bKash App or dial <strong>*247#</strong>.</li>
                  <li>Select <strong>“Send Money”</strong>.</li>
                  <li>
                    Enter bKash Personal Number: <strong className="text-[#E2136E] font-mono">{BKASH_PERSONAL_NUMBER}</strong>
                  </li>
                  <li>Enter Amount: <strong>{REGISTRATION_FEE_BDT} BDT</strong>.</li>
                  <li>Use your <strong>Roll</strong> or <strong>Name</strong> as reference.</li>
                  <li>Enter the bKash number you sent the money from below.</li>
                </ol>
              </div>
            </div>

            {/* Payment Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender bKash Account Number */}
              <div data-error={Boolean(errors.senderBkash)}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender bKash Account Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={formData.senderBkash}
                    onChange={(e) => handleChange('senderBkash', e.target.value.replace(/\D/g, ''))}
                    disabled={isSubmitting || isClosed}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                      errors.senderBkash
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
                    }`}
                  />
                </div>
                {errors.senderBkash && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.senderBkash}
                  </p>
                )}
              </div>

              {/* Transaction ID (TrxID) */}
              <div data-error={Boolean(errors.transactionId)}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction ID (TrxID) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. BL9A4K89PQ"
                    value={formData.transactionId}
                    onChange={(e) => handleChange('transactionId', e.target.value.toUpperCase())}
                    disabled={isSubmitting || isClosed}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wider transition focus:outline-none focus:ring-2 ${
                      errors.transactionId
                        ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
                    }`}
                  />
                </div>
                {errors.transactionId && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.transactionId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct verification &amp; Google Sheet database sync</span>
            </div>

            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              type="submit"
              disabled={isSubmitting || isClosed}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                isClosed
                  ? 'bg-slate-400 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-[#0066CC] cursor-wait'
                  : 'bg-gradient-to-r from-[#1E90FF] to-[#0066CC] hover:from-[#187bcd] hover:to-[#0055b3] shadow-md shadow-[#1E90FF]/25 hover:shadow-lg hover:shadow-[#1E90FF]/35'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Registration...</span>
                </>
              ) : isClosed ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Registration Closed</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Submit Blitz Registration</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};
