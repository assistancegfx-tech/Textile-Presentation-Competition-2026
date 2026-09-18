import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShieldAlert,
  Loader2,
  Lock,
  User,
  Users,
  CreditCard,
  Upload,
  ArrowLeft,
  Calendar,
  Save,
  Info,
  Mail
} from 'lucide-react';
import { RegisteredTeamRecord, RegistrationFormData, Participant } from '../types';
import { generateRegistrationPdf } from '../utils/pdfGenerator';
import { validateBangladeshPhone } from '../utils/formUtils';

interface ViewEditRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRegId?: string;
  onOpenGmailModal?: (prefill?: any) => void;
}

export const ViewEditRegistrationModal: React.FC<ViewEditRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialRegId = '',
  onOpenGmailModal
}) => {
  const [searchId, setSearchId] = useState(initialRegId);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [record, setRecord] = useState<RegisteredTeamRecord | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<RegistrationFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Recent local registrations
  const [recentRegistrations, setRecentRegistrations] = useState<{ registrationId: string; leaderName: string }[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tpc2026_saved_registrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentRegistrations(
            parsed.slice(0, 4).map((item: any) => ({
              registrationId: item.registrationId,
              leaderName: item.formData?.leader?.name || 'Team'
            }))
          );
        }
      }
    } catch (e) {
      // Ignore
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialRegId) {
      setSearchId(initialRegId);
      handleSearch(initialRegId);
    }
  }, [initialRegId, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (idToSearch?: string) => {
    const targetId = (idToSearch || searchId).trim().toUpperCase();
    if (!targetId) {
      setSearchError('Please enter a Registration Number.');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setSaveSuccessMsg(null);
    setIsEditing(false);

    try {
      const res = await fetch(`/api/registration/${encodeURIComponent(targetId)}`);
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Non-JSON response from /api/registration:', rawText);
      }

      if (res.ok && data.success && data.registration) {
        setRecord(data.registration);
        setEditFormData(JSON.parse(JSON.stringify(data.registration.formData)));
      } else {
        // Check if cached in localStorage
        const localSaved = localStorage.getItem('tpc2026_saved_registrations');
        if (localSaved) {
          const list = JSON.parse(localSaved);
          const found = list.find((item: any) => item.registrationId?.toUpperCase() === targetId);
          if (found) {
            // Restore to server
            try {
              await fetch('/api/registration/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registration: found })
              });
            } catch {
              // Ignore
            }
            setRecord(found);
            setEditFormData(JSON.parse(JSON.stringify(found.formData)));
            return;
          }
        }
        setSearchError(data.error || `No registration found for "${targetId}".`);
        setRecord(null);
      }
    } catch (err: any) {
      // Check local storage backup
      const localSaved = localStorage.getItem('tpc2026_saved_registrations');
      if (localSaved) {
        const list = JSON.parse(localSaved);
        const found = list.find((item: any) => item.registrationId?.toUpperCase() === targetId);
        if (found) {
          setRecord(found);
          setEditFormData(JSON.parse(JSON.stringify(found.formData)));
          return;
        }
      }
      setSearchError(err.message || 'Failed to connect to registration server.');
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!record) return;
    generateRegistrationPdf({
      registrationId: record.registrationId,
      submissionDate: record.submissionDate,
      paymentStatus: record.paymentStatus || 'Pending Verification',
      editCount: record.editCount,
      formData: record.formData
    });
  };

  const handleStartEdit = () => {
    if (!record || record.remainingEdits <= 0) return;
    setEditFormData(JSON.parse(JSON.stringify(record.formData)));
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    if (record) {
      setEditFormData(JSON.parse(JSON.stringify(record.formData)));
    }
  };

  const handleParticipantChange = (
    role: 'leader' | 'member1' | 'member2',
    field: keyof Participant,
    value: any
  ) => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      [role]: {
        ...editFormData[role],
        [field]: value
      }
    });
  };

  const handlePhotoUpload = (
    role: 'leader' | 'member1' | 'member2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size exceeds 2MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (editFormData) {
        setEditFormData({
          ...editFormData,
          [role]: {
            ...editFormData[role],
            photoBase64: base64,
            photoPreview: base64,
            photoName: file.name,
            photoSize: file.size
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!record || !editFormData) return;

    // Validate fields
    const roles: ('leader' | 'member1' | 'member2')[] = ['leader', 'member1', 'member2'];
    const labels = { leader: 'Team Leader', member1: 'Member 1', member2: 'Member 2' };

    for (const r of roles) {
      const p = editFormData[r];
      if (!p.name.trim()) {
        setSaveError(`${labels[r]} name is required.`);
        return;
      }
      if (!p.roll.trim()) {
        setSaveError(`${labels[r]} roll number is required.`);
        return;
      }
      if (!p.whatsapp.trim() || !validateBangladeshPhone(p.whatsapp)) {
        setSaveError(`${labels[r]} requires a valid 11-digit Bangladesh WhatsApp number (e.g. 017XXXXXXXX).`);
        return;
      }
    }

    // Check duplicate rolls among the 3 members
    const rolls = [
      editFormData.leader.roll.trim(),
      editFormData.member1.roll.trim(),
      editFormData.member2.roll.trim()
    ];
    if (new Set(rolls).size !== rolls.length) {
      setSaveError('All 3 team members must have unique student roll numbers.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const res = await fetch(`/api/registration/${encodeURIComponent(record.registrationId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: editFormData,
          backupRegistration: record
        })
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Non-JSON response from PUT /api/registration:', rawText);
        throw new Error(`Server returned non-JSON response (${res.status}).`);
      }

      if (res.ok && data.success && data.registration) {
        setRecord(data.registration);
        setEditFormData(JSON.parse(JSON.stringify(data.registration.formData)));
        setIsEditing(false);
        setSaveSuccessMsg(data.message || 'Registration updated successfully.');

        // Update local storage
        try {
          const existingStr = localStorage.getItem('tpc2026_saved_registrations');
          const list = existingStr ? JSON.parse(existingStr) : [];
          const idx = list.findIndex((r: any) => r.registrationId?.toUpperCase() === record.registrationId.toUpperCase());
          if (idx >= 0) {
            list[idx] = data.registration;
          } else {
            list.unshift(data.registration);
          }
          localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
        } catch {
          // ignore
        }
      } else {
        setSaveError(data.error || 'Failed to save edits.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Network error while updating registration.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-[#0A192F] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Find & Edit Registration
              </h2>
              <p className="text-xs text-slate-400">
                View team details & edit up to 3 times with your Registration No
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[82vh] overflow-y-auto">
          {/* Search Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Registration Number
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. TEX2026-001"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#16A34A] tracking-wider uppercase placeholder:normal-case placeholder:font-normal"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#122846] active:scale-98 transition disabled:opacity-60 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#22C55E]" />
                    <span>Find Registration</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Suggestions from Local Storage */}
            {recentRegistrations.length > 0 && !record && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Recent on this device:</span>
                {recentRegistrations.map((item) => (
                  <button
                    key={item.registrationId}
                    type="button"
                    onClick={() => {
                      setSearchId(item.registrationId);
                      handleSearch(item.registrationId);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:border-[#16A34A] hover:text-[#16A34A] transition"
                  >
                    <span>{item.registrationId}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({item.leaderName})</span>
                  </button>
                ))}
              </div>
            )}

            {searchError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Success message banner if updated */}
          {saveSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMsg(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Registration Record Loaded */}
          {record && (
            <div className="space-y-6">
              {/* Record Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0A192F]/5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Registration ID:
                    </span>
                    <span className="text-base font-black text-[#0A192F] tracking-wide">
                      {record.registrationId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      {record.paymentStatus || 'Pending Verification'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submitted: {record.submissionDate || 'Recently'}</span>
                    {record.lastEditedAt && (
                      <span className="text-slate-400">• Last edited: {record.lastEditedAt}</span>
                    )}
                  </p>
                </div>

                {/* Edit Allowance Pill */}
                <div className="flex flex-col sm:items-end">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                      record.remainingEdits === 3
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : record.remainingEdits > 0
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {record.remainingEdits > 0 ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{record.remainingEdits} of 3 Edits Remaining</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>0 of 3 Edits Remaining (Locked)</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {record.remainingEdits > 0
                      ? 'You can modify team details anytime'
                      : 'Maximum edit limit reached'}
                  </span>
                </div>
              </div>

              {/* VIEW MODE */}
              {!isEditing && (
                <div className="space-y-5">
                  {/* Top Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-[#0A192F] uppercase tracking-wider">
                      Registered Team Information
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-98 shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Registration Info PDF</span>
                      </button>

                      {onOpenGmailModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenGmailModal({
                              recipientEmail: record.formData.leader?.email || '',
                              registrationId: record.registrationId,
                              submissionDate: record.submissionDate,
                              formData: record.formData,
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-98 shadow-2xs transition"
                        >
                          <Mail className="w-3.5 h-3.5 text-rose-600" />
                          <span>Email via Gmail</span>
                        </button>
                      )}

                      {record.remainingEdits > 0 ? (
                        <button
                          type="button"
                          onClick={handleStartEdit}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-[#0A192F] bg-amber-100 hover:bg-amber-200 border border-amber-300 active:scale-98 shadow-xs transition"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit Registration</span>
                        </button>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-not-allowed border border-slate-200"
                          title="This registration has reached the maximum allowance of 3 edits."
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Edits Locked (Max 3)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3 Members Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Leader */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black uppercase text-[#16A34A] tracking-wider">
                          Group Leader
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                          Primary
                        </span>
                      </div>
                      {record.formData.leader.photoPreview && (
                        <img
                          src={record.formData.leader.photoPreview}
                          alt="Leader"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Name</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.leader.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Roll Number</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.leader.roll || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Department</p>
                        <p className="text-xs font-semibold text-slate-700">{record.formData.leader.department || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">WhatsApp</p>
                        <p className="text-xs font-bold text-slate-800">{record.formData.leader.whatsapp || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Facebook</p>
                        <p className="text-xs text-slate-600 truncate">{record.formData.leader.facebook || '—'}</p>
                      </div>
                    </div>

                    {/* Member 1 */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                          Member 1
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          Presenter
                        </span>
                      </div>
                      {record.formData.member1.photoPreview && (
                        <img
                          src={record.formData.member1.photoPreview}
                          alt="Member 1"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Name</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.member1.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Roll Number</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.member1.roll || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Department</p>
                        <p className="text-xs font-semibold text-slate-700">{record.formData.member1.department || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">WhatsApp</p>
                        <p className="text-xs font-bold text-slate-800">{record.formData.member1.whatsapp || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Facebook</p>
                        <p className="text-xs text-slate-600 truncate">{record.formData.member1.facebook || '—'}</p>
                      </div>
                    </div>

                    {/* Member 2 */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                          Member 2
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          Presenter
                        </span>
                      </div>
                      {record.formData.member2.photoPreview && (
                        <img
                          src={record.formData.member2.photoPreview}
                          alt="Member 2"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Name</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.member2.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Roll Number</p>
                        <p className="text-sm font-bold text-slate-900">{record.formData.member2.roll || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Department</p>
                        <p className="text-xs font-semibold text-slate-700">{record.formData.member2.department || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">WhatsApp</p>
                        <p className="text-xs font-bold text-slate-800">{record.formData.member2.whatsapp || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Facebook</p>
                        <p className="text-xs text-slate-600 truncate">{record.formData.member2.facebook || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Verification Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Payment Verification:</span>
                      <div className="flex flex-wrap items-center gap-3 mt-1 font-bold text-slate-800">
                        <span>bKash: {record.formData.payment.bkashNumber || '—'}</span>
                        <span>•</span>
                        <span>TrxID: {record.formData.payment.transactionId || '—'}</span>
                        <span>•</span>
                        <span className="text-[#16A34A]">300 BDT Paid</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 w-fit">
                      Verification in Progress
                    </span>
                  </div>
                </div>
              )}

              {/* EDIT MODE */}
              {isEditing && editFormData && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Warning Notice */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black">
                        Editing Registration {record.registrationId} ({record.remainingEdits} edit(s) remaining)
                      </p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Saving changes will consume 1 of your 3 allowable edits. Once 3 edits are used, this record will be locked.
                      </p>
                    </div>
                  </div>

                  {saveError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  {/* Edit Form - 3 Participant Sections */}
                  <div className="space-y-5">
                    {(['leader', 'member1', 'member2'] as const).map((role, idx) => {
                      const title = role === 'leader' ? 'Group Leader' : `Team Member ${idx}`;
                      const p = editFormData[role];

                      return (
                        <div key={role} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-black uppercase text-[#0A192F]">
                              {idx + 1}. {title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {role === 'leader' ? 'Primary Contact' : 'Presenter'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) => handleParticipantChange(role, 'name', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Student Roll *
                              </label>
                              <input
                                type="text"
                                value={p.roll}
                                onChange={(e) => handleParticipantChange(role, 'roll', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Department *
                              </label>
                              <input
                                type="text"
                                value={p.department}
                                onChange={(e) => handleParticipantChange(role, 'department', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                WhatsApp Number *
                              </label>
                              <input
                                type="text"
                                value={p.whatsapp}
                                onChange={(e) => handleParticipantChange(role, 'whatsapp', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Facebook Profile URL
                              </label>
                              <input
                                type="text"
                                value={p.facebook}
                                onChange={(e) => handleParticipantChange(role, 'facebook', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                              />
                            </div>

                            {/* Optional Photo update */}
                            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                              {p.photoPreview && (
                                <img
                                  src={p.photoPreview}
                                  alt="Preview"
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                                />
                              )}
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                                <Upload className="w-3.5 h-3.5 text-[#16A34A]" />
                                <span>{p.photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(role, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Edit Actions Bottom Bar */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-98"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition active:scale-98 shadow-md shadow-[#0A192F]/20 disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-[#22C55E]" />
                          <span>Save Changes (Use 1 Edit)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
