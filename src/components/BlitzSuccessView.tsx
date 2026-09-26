import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  PenTool,
  Copy,
  Check,
  User,
  Hash,
  BookOpen,
  Phone,
  Mail,
  CreditCard,
  RotateCcw,
  Calendar,
  Sparkles,
  ShieldCheck,
  Download,
  FileText
} from 'lucide-react';
import { BlitzSubmissionResponse, BlitzRegistrationFormData } from '../types';
import { generateBlitzPdf } from '../utils/pdfGenerator';

interface BlitzSuccessViewProps {
  result: BlitzSubmissionResponse;
  formData: BlitzRegistrationFormData;
  onRegisterAnother: () => void;
}

export const BlitzSuccessView: React.FC<BlitzSuccessViewProps> = ({
  result,
  formData,
  onRegisterAnother
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const regId = result.registrationId || 'TBW-CONFIRMED';
  const submissionDate = result.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });

  const handleCopyId = () => {
    navigator.clipboard.writeText(regId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      generateBlitzPdf({
        registrationId: regId,
        submissionDate,
        paymentStatus: result.paymentStatus || 'Pending',
        editCount: result.editCount || 0,
        fullName: formData.fullName,
        batch: formData.batch,
        department: formData.department,
        studentId: formData.studentId,
        whatsapp: formData.whatsapp,
        email: formData.email,
        senderBkash: formData.senderBkash,
        transactionId: formData.transactionId
      });
    } catch (err) {
      console.error('Error generating Blitz PDF:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Success Notification Banner with Dodger Blue Gradient */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-[#1E90FF] via-[#0284C7] to-[#0A192F] text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
          <CheckCircle2 className="w-9 h-9 text-emerald-300" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sky-100 text-xs font-bold uppercase tracking-wider mb-2">
          <PenTool className="w-3.5 h-3.5" />
          <span>Textile Blitz Writing 2026</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
          Registration Submitted!
        </h2>
        <p className="text-xs sm:text-sm text-sky-100 max-w-md mx-auto mt-2 leading-relaxed">
          Your Textile Blitz Writing registration has been recorded successfully. Please save your Registration ID and download your Entry Pass.
        </p>

        {/* Highlighted Registration ID Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] text-sky-200 uppercase font-extrabold tracking-wider block">Registration ID</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wider">{regId}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#0066CC] hover:bg-sky-50 transition text-xs font-extrabold shadow-sm cursor-pointer"
          >
            {copiedId ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Email Dispatched Alert */}
      {formData.email && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-sky-950"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-[#1E90FF] shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold block text-sky-950">Confirmation Email &amp; Entry Pass Sent</span>
            <span className="text-sky-800">
              A copy of your registration details and voucher was dispatched to <strong>{formData.email}</strong>.
            </span>
          </div>
        </motion.div>
      )}

      {/* Registration Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#0A192F] font-display">Registration Summary</h3>
            <span className="text-xs text-slate-400">Submitted on {submissionDate}</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Payment: Pending Verification</span>
          </span>
        </div>

        {/* Participant Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Participant Full Name</span>
            <span className="font-extrabold text-slate-900 text-sm block">{formData.fullName}</span>
            <span className="text-[11px] text-slate-500">According to certificate</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID / Roll</span>
            <span className="font-extrabold text-slate-900 text-sm block font-mono">{formData.studentId}</span>
            <span className="text-[11px] text-slate-500">Batch {formData.batch}th • Dept: {formData.department}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Number</span>
            <span className="font-extrabold text-slate-900 text-sm block font-mono">{formData.whatsapp}</span>
            <span className="text-[11px] text-slate-500">Official contact</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
            <span className="font-extrabold text-slate-900 text-sm block truncate">{formData.email || 'N/A'}</span>
            <span className="text-[11px] text-slate-500">Entry pass recipient</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">bKash Payment Info</span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-slate-900 text-sm font-mono">
                TrxID: {formData.transactionId}
              </span>
              <span className="text-[11px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                Sender: {formData.senderBkash} (49 BDT)
              </span>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <span className="font-bold block text-emerald-950">Important Event Entry Note</span>
            The organizing team will verify your bKash payment (49 BDT). Download your entry pass below now; once approved by the admins, you can re-download your validated pass anytime from the <strong>"View Registration"</strong> portal.
          </div>
        </div>

        {/* Download PDF & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#0066CC] hover:from-[#187bcd] hover:to-[#0055b3] text-white font-extrabold text-xs shadow-md shadow-[#1E90FF]/25 hover:shadow-lg hover:shadow-[#1E90FF]/35 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Entry Pass (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={onRegisterAnother}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Register Another Participant</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
