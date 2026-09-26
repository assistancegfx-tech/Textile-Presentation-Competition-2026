import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit3,
  Save,
  RotateCcw,
  Copy,
  Check,
  User,
  Hash,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
  Loader2,
  Lock,
  ArrowLeft,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { RegisteredBlitzRecord, BlitzRegistrationFormData } from '../types';
import { generateBlitzPdf, getBlitzPdfBase64 } from '../utils/pdfGenerator';
import { validateBangladeshPhone, validateEmail } from '../utils/formUtils';

interface ViewEditBlitzSectionProps {
  initialSearchQuery?: string;
  initialStudentId?: string;
  autoVerify?: boolean;
  onCloseModal?: () => void;
}

export const ViewEditBlitzSection: React.FC<ViewEditBlitzSectionProps> = ({
  initialSearchQuery = '',
  initialStudentId = '',
  autoVerify = false,
  onCloseModal
}) => {
  // Verification states: strictly 2 boxes (Registration No & Student ID)
  const [searchRegNo, setSearchRegNo] = useState(initialSearchQuery);
  const [searchStudentId, setSearchStudentId] = useState(initialStudentId);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [record, setRecord] = useState<RegisteredBlitzRecord | null>(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<BlitzRegistrationFormData | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // UI state
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Load recent local submissions for 1-click fill
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tbw2026_submissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSubmissions(parsed.slice(0, 4));
        }
      }
    } catch (_) {}
  }, []);

  // Sync initial query & student id, auto-verify if both are present
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchRegNo(initialSearchQuery.trim());
    }
    if (initialStudentId && initialStudentId.trim()) {
      setSearchStudentId(initialStudentId.trim());
    }
    if (autoVerify && initialSearchQuery && initialStudentId) {
      handleVerify(initialSearchQuery.trim(), initialStudentId.trim());
    }
  }, [initialSearchQuery, initialStudentId, autoVerify]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleVerify = async (overrideRegNo?: string, overrideStudentId?: string) => {
    const regNo = (overrideRegNo !== undefined ? overrideRegNo : searchRegNo).trim();
    const studentId = (overrideStudentId !== undefined ? overrideStudentId : searchStudentId).trim();

    if (!regNo || !studentId) {
      setSearchError('Both Registration No and Student ID are required for verification.');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setSaveSuccessMsg(null);
    setIsEditing(false);

    try {
      // 1. Try server verification endpoint
      const res = await fetch('/api/blitz/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regNo,
          studentId: studentId
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.registration) {
        throw new Error(data.error || 'Verification failed. Please check both your Registration No and Student ID.');
      }

      setRecord(data.registration);
      setShowSearchBox(false);
    } catch (err: any) {
      // Fallback check in local storage if offline/server cache restarted
      let localMatch: any = null;
      try {
        const localList = JSON.parse(localStorage.getItem('tbw2026_submissions') || '[]');
        localMatch = localList.find((item: any) => {
          const matchReg = item.result?.registrationId?.toUpperCase() === regNo.toUpperCase() ||
                           item.formData?.transactionId?.toUpperCase() === regNo.toUpperCase();
          const matchStudent = item.formData?.studentId?.toUpperCase() === studentId.toUpperCase();
          return matchReg && matchStudent;
        });
      } catch (_) {}

      if (localMatch && localMatch.result && localMatch.formData) {
        setRecord({
          registrationId: localMatch.result.registrationId,
          submissionDate: localMatch.result.submissionDate,
          paymentStatus: localMatch.result.paymentStatus || 'Pending',
          editCount: localMatch.result.editCount || 0,
          maxEdits: localMatch.result.maxEdits || 3,
          remainingEdits: localMatch.result.remainingEdits || 3,
          formData: localMatch.formData
        });
        setShowSearchBox(false);
      } else {
        setSearchError(err.message || 'Unable to verify registration. Please check your Registration No and Student ID.');
        setRecord(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEditing = () => {
    if (!record) return;
    setEditFormData({ ...record.formData });
    setEditErrors({});
    setSaveError(null);
    setSaveSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditFormData(null);
    setEditErrors({});
    setSaveError(null);
  };

  const handleEditChange = (field: keyof BlitzRegistrationFormData, value: string) => {
    if (!editFormData) return;
    setEditFormData(prev => prev ? { ...prev, [field]: value } : null);
    if (editErrors[field]) {
      setEditErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateEditForm = (): boolean => {
    if (!editFormData) return false;
    const errors: Record<string, string> = {};

    if (!editFormData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!editFormData.batch) {
      errors.batch = 'Please select batch.';
    }
    if (!editFormData.department) {
      errors.department = 'Please select department.';
    }
    if (!editFormData.studentId.trim()) {
      errors.studentId = 'Student ID is required.';
    }
    if (!validateBangladeshPhone(editFormData.whatsapp)) {
      errors.whatsapp = 'Valid 11-digit WhatsApp number required.';
    }
    if (!editFormData.email.trim() || !validateEmail(editFormData.email.trim())) {
      errors.email = 'Valid email address is required.';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!record || !editFormData) return;
    if (!validateEditForm()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const cleanData: BlitzRegistrationFormData = {
        fullName: editFormData.fullName.trim(),
        batch: editFormData.batch,
        department: editFormData.department,
        studentId: editFormData.studentId.trim(),
        whatsapp: editFormData.whatsapp.trim(),
        email: editFormData.email.trim(),
        senderBkash: record.formData.senderBkash,
        transactionId: record.formData.transactionId
      };

      // Pre-generate updated PDF
      let pdfBase64 = '';
      try {
        pdfBase64 = getBlitzPdfBase64({
          registrationId: record.registrationId,
          submissionDate: record.submissionDate,
          paymentStatus: record.paymentStatus,
          editCount: record.editCount + 1,
          fullName: cleanData.fullName,
          batch: cleanData.batch,
          department: cleanData.department,
          studentId: cleanData.studentId,
          whatsapp: cleanData.whatsapp,
          email: cleanData.email,
          senderBkash: cleanData.senderBkash,
          transactionId: cleanData.transactionId
        });
      } catch (_) {}

      const res = await fetch(`/api/blitz/${encodeURIComponent(record.registrationId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: cleanData,
          pdfBase64
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.registration) {
        throw new Error(json.error || 'Failed to update registration.');
      }

      setRecord(json.registration);
      setIsEditing(false);
      setSaveSuccessMsg(`Registration updated successfully! You have ${json.registration.remainingEdits} edits remaining.`);

      // Update local storage record
      try {
        const stored = JSON.parse(localStorage.getItem('tbw2026_submissions') || '[]');
        const updatedList = stored.map((item: any) => {
          if (item.result?.registrationId === record.registrationId) {
            return {
              ...item,
              formData: cleanData,
              result: { ...item.result, ...json.registration }
            };
          }
          return item;
        });
        localStorage.setItem('tbw2026_submissions', JSON.stringify(updatedList));
      } catch (_) {}
    } catch (err: any) {
      setSaveError(err.message || 'Error occurred while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!record) return;
    setIsDownloading(true);
    try {
      generateBlitzPdf({
        registrationId: record.registrationId,
        submissionDate: record.submissionDate,
        paymentStatus: record.paymentStatus,
        editCount: record.editCount,
        fullName: record.formData.fullName,
        batch: record.formData.batch,
        department: record.formData.department,
        studentId: record.formData.studentId,
        whatsapp: record.formData.whatsapp,
        email: record.formData.email,
        senderBkash: record.formData.senderBkash,
        transactionId: record.formData.transactionId
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const isApproved = record && /^(paid|verified|approved)/i.test(record.paymentStatus);

  return (
    <div className="space-y-6">
      {/* Switcher bar if record loaded */}
      {record && (
        <div className="p-3 px-4 rounded-xl bg-sky-50 border border-sky-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1E90FF]/15 text-[#1E90FF] flex items-center justify-center shrink-0">
              <PenTool className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-500 font-medium">Viewing Blitz Registration:</span>
            <span className="font-extrabold text-[#0066CC] font-mono tracking-wide">{record.registrationId}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E90FF] hover:text-[#0066CC] bg-white hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition cursor-pointer shadow-2xs"
          >
            <Search className="w-3 h-3 text-[#1E90FF]" />
            <span>{showSearchBox ? 'Hide Search Form' : 'Verify Another Registration'}</span>
          </button>
        </div>
      )}

      {/* Verification Box: STRICTLY ONLY 2 BOXES (Registration No & Student ID) */}
      {(!record || showSearchBox) && (
        <div className="relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-md space-y-4 overflow-hidden">
          {/* Top Dodger Blue Accent Line with Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E90FF] via-[#38BDF8] to-[#0066CC]" />

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1E90FF]/10 text-[#1E90FF] flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#0A192F] uppercase tracking-wider">
                Blitz Writing Verification
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#1E90FF] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              2-Box Security Verification
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Please enter your official Registration No and your Student ID to verify and view your Blitz Writing entry pass.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            {/* EXACTLY TWO BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1: Registration No */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#1E90FF]" />
                  <span>Registration No <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. TBW-14-01"
                    value={searchRegNo}
                    onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/25 focus:border-[#1E90FF] transition placeholder:font-normal placeholder:font-sans placeholder:text-slate-400 uppercase"
                  />
                </div>
              </div>

              {/* Box 2: Student ID */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#1E90FF]" />
                  <span>Student ID <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 202114001 or Roll"
                    value={searchStudentId}
                    onChange={(e) => setSearchStudentId(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/25 focus:border-[#1E90FF] transition placeholder:font-normal placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{searchError}</span>
              </motion.div>
            )}

            {/* Verification Button with Dodger Blue Gradient */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Both fields must match the submitted registration record.
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#0066CC] hover:from-[#187bcd] hover:to-[#0055b3] text-white font-extrabold text-xs transition-all shadow-md shadow-[#1E90FF]/25 hover:shadow-lg hover:shadow-[#1E90FF]/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Details...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-sky-200" />
                    <span>Verify &amp; View Registration</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Chips for Recent Submissions on this Device */}
            {recentSubmissions.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Recent Blitz Submissions from this device:
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentSubmissions.map((item, idx) => {
                    const rId = item.result?.registrationId || 'TBW';
                    const sId = item.formData?.studentId || '';
                    const name = item.formData?.fullName || 'Participant';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchRegNo(rId);
                          if (sId) setSearchStudentId(sId);
                          handleVerify(rId, sId);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50/70 hover:bg-sky-100 border border-sky-200 text-slate-700 hover:text-[#0066CC] text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <PenTool className="w-3 h-3 text-[#1E90FF]" />
                        <span className="font-mono font-bold text-[#0066CC]">{rId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-mono">{sId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="truncate max-w-[100px] text-slate-600">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Record Content View / Edit */}
      {record && (
        <div className="space-y-6">
          {/* Top Info Banner - Dodger Blue Gradient */}
          <div className="bg-gradient-to-br from-[#0A192F] via-[#0B2545] to-[#1E3A8A] text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
            {/* Glowing Dodger Blue Accent Sphere */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#1E90FF]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#1E90FF]/20 border border-[#1E90FF]/35 text-sky-200 text-xs font-bold uppercase tracking-wider mb-2">
                  <PenTool className="w-3.5 h-3.5 text-[#1E90FF]" />
                  <span>Textile Blitz Writing 2026</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
                  <span>{record.registrationId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(record.registrationId)}
                    className="p-1 hover:bg-white/10 rounded-md transition text-slate-300 hover:text-white cursor-pointer"
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-200" />}
                  </button>
                </h3>
                <span className="text-xs text-sky-200/80 mt-1 block">
                  Submitted: {record.submissionDate}
                </span>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}
                  />
                  <span>
                    {isApproved ? 'PAYMENT APPROVED (ENTRY VALID)' : 'PENDING VERIFICATION'}
                  </span>
                </span>

                <span className="text-[11px] text-sky-200 font-medium">
                  Edits: {record.editCount}/3 ({record.remainingEdits} remaining)
                </span>
              </div>
            </div>
          </div>

          {/* Success / Error Messages */}
          {saveSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </motion.div>
          )}

          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </motion.div>
          )}

          {/* EDIT MODE FORM */}
          {isEditing && editFormData ? (
            <div className="bg-white border-2 border-[#1E90FF]/30 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-black text-[#0A192F]">
                  <Edit3 className="w-4 h-4 text-[#1E90FF]" />
                  <span>Edit Participant Information</span>
                </div>
                <span className="text-xs text-slate-400 font-semibold">
                  {record.remainingEdits} edits left
                </span>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (As per certificate) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => handleEditChange('fullName', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF]"
                  />
                  {editErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{editErrors.fullName}</p>
                  )}
                </div>

                {/* Batch & Department Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Batch <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['13', '14', '15', '16'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleEditChange('batch', b)}
                          disabled={isSaving}
                          className={`py-2 text-center rounded-xl text-xs font-bold transition border cursor-pointer ${
                            editFormData.batch === b
                              ? 'bg-[#1E90FF] text-white border-[#1E90FF] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {b}th
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['YE', 'FE', 'WPE', 'AE'] as const).map((dept) => (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => handleEditChange('department', dept)}
                          disabled={isSaving}
                          className={`py-2 text-center rounded-xl text-xs font-bold transition border cursor-pointer ${
                            editFormData.department === dept
                              ? 'bg-[#1E90FF] text-white border-[#1E90FF] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Student ID & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.studentId}
                      onChange={(e) => handleEditChange('studentId', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF]"
                    />
                    {editErrors.studentId && (
                      <p className="text-[11px] text-rose-600 mt-1">{editErrors.studentId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={editFormData.whatsapp}
                      onChange={(e) => handleEditChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                      disabled={isSaving}
                      maxLength={11}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF]"
                    />
                    {editErrors.whatsapp && (
                      <p className="text-[11px] text-rose-600 mt-1">{editErrors.whatsapp}</p>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (For Entry Pass delivery) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#1E90FF]/20 focus:border-[#1E90FF]"
                  />
                  {editErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{editErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Edit Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#0066CC] hover:from-[#187bcd] hover:to-[#0055b3] text-white font-extrabold text-xs transition shadow-md shadow-[#1E90FF]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE DETAILS */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1E90FF]" />
                  <span>Participant Details</span>
                </h4>

                {record.remainingEdits > 0 ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#1E90FF] hover:text-[#0066CC] text-xs font-bold transition border border-sky-200 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Info ({record.remainingEdits} left)</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Max edits reached (3/3)
                  </span>
                )}
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">{record.formData.fullName}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student ID / Roll</span>
                  <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">{record.formData.studentId}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch &amp; Department</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5">
                    {record.formData.batch}th Batch • {record.formData.department}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Number</span>
                  <span className="text-sm font-bold text-slate-800 font-mono block mt-0.5">{record.formData.whatsapp}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <span className="text-sm font-bold text-slate-800 block mt-0.5 truncate">{record.formData.email || 'N/A'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">bKash Payment Verification</span>
                  <span className="text-sm font-mono font-bold text-pink-700 block mt-0.5">
                    TrxID: {record.formData.transactionId}
                  </span>
                  <span className="text-[11px] text-slate-500 block">Sender: {record.formData.senderBkash} (49 BDT)</span>
                </div>
              </div>

              {/* Event Entry Rule Notice */}
              <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1E90FF] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[#0A192F]">Event Day Instructions:</span>
                  Download your official Entry Pass PDF below. Once payment is verified as approved, this pass grants access to the writing competition at BTEC Campus on 10 Oct 2026.
                </div>
              </div>

              {/* Download Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#0066CC] hover:from-[#187bcd] hover:to-[#0055b3] text-white font-black text-xs shadow-md shadow-[#1E90FF]/25 hover:shadow-lg hover:shadow-[#1E90FF]/35 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download Entry Pass (PDF)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSearchBox(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Verify Other Registration</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
