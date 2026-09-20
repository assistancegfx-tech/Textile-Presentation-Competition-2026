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
  KeyRound,
  Phone,
  Hash,
  RotateCcw,
  Mail,
  Trophy
} from 'lucide-react';
import { RegisteredTeamRecord, RegistrationFormData, Participant } from '../types';
import { generateRegistrationPdf } from '../utils/pdfGenerator';
import { DEPARTMENTS, validateBangladeshPhone, validateEmail } from '../utils/formUtils';

interface ViewEditRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRegId?: string;
}

export const formatBdPhone = (phone: any): string => {
  if (!phone) return '';
  let str = String(phone).trim().replace(/[\s\-()]/g, '');
  if (str.startsWith('+880')) str = str.slice(4);
  else if (str.startsWith('880')) str = str.slice(3);
  else if (str.startsWith('+88')) str = str.slice(3);
  else if (str.startsWith('88')) str = str.slice(2);
  
  if (/^1[3-9]\d{8}$/.test(str)) {
    return '0' + str;
  }
  return str;
};

export const normalizePhoneForCheck = (phone: any): string => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.slice(-10);
};

export const ViewEditRegistrationModal: React.FC<ViewEditRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialRegId = ''
}) => {
  const [searchId, setSearchId] = useState(initialRegId);
  const [searchRoll, setSearchRoll] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
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
  const [recentRegistrations, setRecentRegistrations] = useState<{ registrationId: string; leaderName: string; leaderRoll: string; leaderMobile: string }[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tpc2026_saved_registrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentRegistrations(
            parsed.slice(0, 4).map((item: any) => ({
              registrationId: item.registrationId,
              teamName: item.formData?.teamName || item.teamName || '',
              leaderName: item.formData?.leader?.name || 'Team',
              leaderRoll: item.formData?.leader?.roll || '',
              leaderMobile: formatBdPhone(item.formData?.leader?.whatsapp || '')
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
    }
  }, [initialRegId, isOpen]);

  if (!isOpen) return null;

  const normalizePhoneForCheck = (phone: any) => {
    const cleaned = String(phone || '').trim().replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+88')) return cleaned.slice(3);
    if (cleaned.startsWith('88')) return cleaned.slice(2);
    return cleaned;
  };

  const handleSearch = async (overrideId?: string, overrideRoll?: string, overrideMobile?: string) => {
    const rawTargetId = String(overrideId || searchId || '').trim();
    let targetId = rawTargetId.toUpperCase();
    if (targetId && !targetId.startsWith('TEX') && /^\d+$/.test(targetId) && targetId.length <= 4) {
      targetId = `TEX2026-${targetId.padStart(3, '0')}`;
    }

    const targetRoll = String(overrideRoll !== undefined ? overrideRoll : searchRoll || '').trim();
    const targetMobile = String(overrideMobile !== undefined ? overrideMobile : searchMobile || '').trim();

    if (!targetId && !targetRoll) {
      setSearchError('Please enter your Registration Number (e.g. TEX2026-001) or Team Leader Roll.');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setSaveSuccessMsg(null);
    setIsEditing(false);

    const scriptUrl = localStorage.getItem('tpc2026_google_script_url') || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

    try {
      const queryParams = new URLSearchParams();
      if (targetRoll) queryParams.set('leaderRoll', targetRoll);
      if (targetMobile) queryParams.set('leaderMobile', targetMobile);
      if (scriptUrl) queryParams.set('scriptUrl', scriptUrl);

      let candidateRecord: RegisteredTeamRecord | null = null;

      // 1. Query Backend API
      try {
        const res = await fetch(`/api/registration/${encodeURIComponent(targetId || targetRoll)}?${queryParams.toString()}`, {
          headers: {
            'x-google-script-url': scriptUrl
          }
        });
        const rawText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(rawText);
        } catch {
          // non-json
        }

        if (res.ok && data.success && data.registration) {
          candidateRecord = data.registration;
        }
      } catch (backendErr) {
        console.warn('Backend API lookup notice, trying direct Google Sheets fallback:', backendErr);
      }

      // 2. Direct Google Apps Script Client-Side Fallback if backend didn't return record
      if (!candidateRecord && scriptUrl) {
        try {
          const directUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(targetId || targetRoll)}`;
          const gRes = await fetch(directUrl, { redirect: 'follow' });
          if (gRes.ok) {
            const gData = await gRes.json();
            if (gData && (gData.success || gData.found) && gData.registrationId) {
              candidateRecord = {
                registrationId: String(gData.registrationId || ''),
                submissionDate: String(gData.submissionDate || new Date().toISOString()),
                paymentStatus: String(gData.paymentStatus || 'Pending') as any,
                teamName: String(gData.teamName || ''),
                editCount: 0,
                maxEdits: 3,
                remainingEdits: 3,
                canEdit: true,
                formData: {
                  teamName: String(gData.teamName || ''),
                  leader: {
                    name: String(gData.leaderName || ''),
                    roll: String(gData.leaderRoll || ''),
                    department: String(gData.leaderDepartment || 'Textile Engineering'),
                    whatsapp: formatBdPhone(gData.leaderWhatsApp),
                    facebook: String(gData.leaderFacebook || ''),
                    email: String(gData.leaderEmail || gData.email || ''),
                    photoPreview: gData.leaderPhotoUrl || undefined
                  },
                  member1: {
                    name: String(gData.member1Name || ''),
                    roll: String(gData.member1Roll || ''),
                    department: String(gData.member1Department || 'Textile Engineering'),
                    whatsapp: formatBdPhone(gData.member1WhatsApp),
                    facebook: String(gData.member1Facebook || ''),
                    email: String(gData.member1Email || ''),
                    photoPreview: gData.member1PhotoUrl || undefined
                  },
                  member2: {
                    name: String(gData.member2Name || ''),
                    roll: String(gData.member2Roll || ''),
                    department: String(gData.member2Department || 'Textile Engineering'),
                    whatsapp: formatBdPhone(gData.member2WhatsApp),
                    facebook: String(gData.member2Facebook || ''),
                    email: String(gData.member2Email || ''),
                    photoPreview: gData.member2PhotoUrl || undefined
                  },
                  payment: {
                    bkashNumber: formatBdPhone(gData.bkashNumber),
                    transactionId: String(gData.transactionId || '')
                  }
                }
              };
            }
          }
        } catch (scriptFetchErr) {
          console.warn('Direct Google Apps Script fetch notice:', scriptFetchErr);
        }
      }

      if (!candidateRecord) {
        setSearchError(`No registration record found for "${targetId || targetRoll}". Please verify your Registration ID or Roll Number.`);
        setRecord(null);
        return;
      }

      // Ensure all fields in formData are safe strings
      if (candidateRecord.formData) {
        const fd = candidateRecord.formData;
        fd.teamName = String(fd.teamName || candidateRecord.teamName || '');
        if (fd.leader) {
          fd.leader.name = String(fd.leader.name || '');
          fd.leader.roll = String(fd.leader.roll || '');
          fd.leader.department = String(fd.leader.department || 'Textile Engineering');
          fd.leader.whatsapp = formatBdPhone(fd.leader.whatsapp);
          fd.leader.facebook = String(fd.leader.facebook || '');
          fd.leader.email = String(fd.leader.email || '');
        }
        if (fd.member1) {
          fd.member1.name = String(fd.member1.name || '');
          fd.member1.roll = String(fd.member1.roll || '');
          fd.member1.department = String(fd.member1.department || 'Textile Engineering');
          fd.member1.whatsapp = formatBdPhone(fd.member1.whatsapp);
          fd.member1.facebook = String(fd.member1.facebook || '');
        }
        if (fd.member2) {
          fd.member2.name = String(fd.member2.name || '');
          fd.member2.roll = String(fd.member2.roll || '');
          fd.member2.department = String(fd.member2.department || 'Textile Engineering');
          fd.member2.whatsapp = formatBdPhone(fd.member2.whatsapp);
          fd.member2.facebook = String(fd.member2.facebook || '');
        }
        if (fd.payment) {
          fd.payment.bkashNumber = formatBdPhone(fd.payment.bkashNumber);
          fd.payment.transactionId = String(fd.payment.transactionId || '');
        }
      }

      // If Leader Roll and Mobile are specified in form, verify them flexibly
      const recordLeaderRoll = String(candidateRecord.formData?.leader?.roll || (candidateRecord as any).leaderRoll || '').trim();
      const recordLeaderMobile = String(candidateRecord.formData?.leader?.whatsapp || (candidateRecord as any).leaderWhatsApp || '').trim();

      if (targetRoll && recordLeaderRoll) {
        const rollMatches = recordLeaderRoll.toLowerCase() === targetRoll.toLowerCase() ||
          String(candidateRecord.formData?.member1?.roll || '').toLowerCase() === targetRoll.toLowerCase() ||
          String(candidateRecord.formData?.member2?.roll || '').toLowerCase() === targetRoll.toLowerCase();
        
        if (!rollMatches) {
          setSearchError('Verification notice: The Roll Number entered does not match this team record.');
          setRecord(null);
          return;
        }
      }

      if (targetMobile && recordLeaderMobile) {
        const targetClean = normalizePhoneForCheck(targetMobile);
        const leaderClean = normalizePhoneForCheck(recordLeaderMobile);
        const m1Clean = normalizePhoneForCheck(candidateRecord.formData?.member1?.whatsapp || '');
        const m2Clean = normalizePhoneForCheck(candidateRecord.formData?.member2?.whatsapp || '');

        const mobileMatches = (leaderClean && leaderClean === targetClean) ||
                              (m1Clean && m1Clean === targetClean) ||
                              (m2Clean && m2Clean === targetClean);

        if (!mobileMatches && targetClean.length >= 6) {
          setSearchError('Verification notice: The Mobile Number entered does not match this team record.');
          setRecord(null);
          return;
        }
      }

      // Update local cache with live synced status
      try {
        const localSaved = localStorage.getItem('tpc2026_saved_registrations');
        let list: RegisteredTeamRecord[] = localSaved ? JSON.parse(localSaved) : [];
        if (!Array.isArray(list)) list = [];
        const existingIdx = list.findIndex(r => r.registrationId === candidateRecord!.registrationId);
        if (existingIdx >= 0) {
          list[existingIdx] = candidateRecord;
        } else {
          list.push(candidateRecord);
        }
        localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
      } catch {}

      setRecord(candidateRecord);
      setEditFormData(JSON.parse(JSON.stringify(candidateRecord.formData)));
    } catch (err: any) {
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

    if (!editFormData.teamName || !editFormData.teamName.trim()) {
      setSaveError('Team Name is required.');
      return;
    }

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

    const scriptUrl = localStorage.getItem('tpc2026_google_script_url') || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

    try {
      let updatedRecord: any = null;
      let sheetUpdateSuccess = false;

      // 1. Send update to Backend API
      try {
        const res = await fetch(`/api/registration/${encodeURIComponent(record.registrationId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-google-script-url': scriptUrl
          },
          body: JSON.stringify({
            formData: editFormData,
            backupRegistration: record
          })
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.status === 409 || res.status === 400 || res.status === 403) {
            throw new Error(data.error || 'Failed to save edits.');
          }
          if (res.ok && data.success && data.registration) {
            updatedRecord = data.registration;
            sheetUpdateSuccess = data.sheetUpdated || false;
          }
        }
      } catch (fetchErr: any) {
        if (fetchErr.message && (fetchErr.message.includes('already') || fetchErr.message.includes('limit reached') || fetchErr.message.includes('required'))) {
          throw fetchErr;
        }
        console.warn('API PUT warning, trying direct Google Sheet update:', fetchErr);
      }

      // 2. Direct Google Apps Script update (if backend didn't update sheet or as fallback)
      if (!sheetUpdateSuccess && scriptUrl) {
        try {
          const scriptRes = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'updateRegistration',
              registrationId: record.registrationId,
              formData: editFormData
            }),
            redirect: 'follow'
          });
          const sJson = await scriptRes.json();
          if (sJson && sJson.success) {
            sheetUpdateSuccess = true;
          }
        } catch (sErr) {
          console.warn('Direct Google Sheet update notice:', sErr);
        }
      }

      // If backend was unreachable or returned static HTML, update locally
      if (!updatedRecord) {
        const newEditCount = (record.editCount ?? 0) + 1;
        const maxEdits = record.maxEdits ?? 3;
        const remaining = Math.max(0, maxEdits - newEditCount);
        updatedRecord = {
          ...record,
          editCount: newEditCount,
          maxEdits,
          remainingEdits: remaining,
          canEdit: remaining > 0,
          lastEditedAt: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
          formData: editFormData
        };
      }

      setRecord(updatedRecord);
      setEditFormData(JSON.parse(JSON.stringify(updatedRecord.formData)));
      setIsEditing(false);
      setSaveSuccessMsg(`Registration and Google Sheet row updated successfully! (${updatedRecord.remainingEdits} of 3 edits remaining)`);

      // Update local storage
      try {
        const existingStr = localStorage.getItem('tpc2026_saved_registrations');
        const list = existingStr ? JSON.parse(existingStr) : [];
        const idx = list.findIndex((r: any) => r.registrationId?.toUpperCase() === record.registrationId.toUpperCase());
        if (idx >= 0) {
          list[idx] = updatedRecord;
        } else {
          list.unshift(updatedRecord);
        }
        localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
      } catch {
        // ignore
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error while updating registration. Please retry.');
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
          {/* Security Search Box */}
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center pb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#16A34A]" />
                <span className="text-xs font-black text-[#0A192F] uppercase tracking-wider">
                  Security Verification & Search
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Registration Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#16A34A]" />
                  <span>Registration ID *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. TEX2026-001"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#16A34A] tracking-wider uppercase placeholder:normal-case placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Leader Roll */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#16A34A]" />
                  <span>Leader Roll No *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchRoll}
                    onChange={(e) => setSearchRoll(e.target.value.trim())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. 20220145"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#16A34A] placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Leader Mobile */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#16A34A]" />
                  <span>Leader Mobile No *</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={searchMobile}
                    onChange={(e) => setSearchMobile(e.target.value.trim())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="e.g. 01712345678"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#16A34A] placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 text-center sm:text-left">
                Both Leader Roll & Mobile are verified against your record for authorized access.
              </p>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#122846] active:scale-98 transition disabled:opacity-60 shadow-xs whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#22C55E]" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#22C55E]" />
                    <span>Verify & Find Record</span>
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
                      setSearchRoll(item.leaderRoll);
                      setSearchMobile(item.leaderMobile);
                      handleSearch(item.registrationId, item.leaderRoll, item.leaderMobile);
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
                    {(() => {
                      const statusStr = (record.paymentStatus || 'Pending').trim();
                      const isPaid = /^(paid|verified|approved|received|completed|success)/i.test(statusStr);
                      const isRejected = /^(rejected|declined|failed|invalid)/i.test(statusStr);

                      if (isPaid) {
                        return (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>Payment Verified (Paid)</span>
                          </span>
                        );
                      }
                      if (isRejected) {
                        return (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Payment Rejected</span>
                          </span>
                        );
                      }
                      return (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{record.paymentStatus || 'Pending Verification'}</span>
                        </span>
                      );
                    })()}
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

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSearch(record.registrationId, record.formData?.leader?.roll, record.formData?.leader?.whatsapp)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-98 shadow-2xs transition"
                        title="Check Google Sheets for updated payment status"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 text-[#16A34A] ${isLoading ? 'animate-spin' : ''}`} />
                        <span>Refresh Live Status</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-98 shadow-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Registration Info PDF</span>
                      </button>

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

                  {/* Team Name Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0A192F] via-[#102A43] to-[#0A192F] text-white flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-bold">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                          Official Team Name
                        </span>
                        <span className="text-base font-black text-white">
                          {record.formData.teamName || record.teamName || '—'}
                        </span>
                      </div>
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
                      {record.formData.leader.email && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Email Address</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{record.formData.leader.email}</p>
                        </div>
                      )}
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
                  {(() => {
                    const statusStr = (record.paymentStatus || 'Pending').trim();
                    const isPaid = /^(paid|verified|approved|received|completed|success)/i.test(statusStr);
                    const isRejected = /^(rejected|declined|failed|invalid)/i.test(statusStr);

                    return (
                      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isPaid
                          ? 'bg-emerald-50/80 border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <span className={isPaid ? 'text-emerald-800 font-bold' : isRejected ? 'text-rose-800 font-bold' : 'text-slate-500 font-medium'}>
                            {isPaid ? '✓ Payment Status: Verified' : 'Payment Verification:'}
                          </span>
                          <div className="flex flex-wrap items-center gap-3 mt-1 font-bold text-slate-800">
                            <span>bKash: {record.formData.payment.bkashNumber || '—'}</span>
                            <span>•</span>
                            <span>TrxID: {record.formData.payment.transactionId || '—'}</span>
                            <span>•</span>
                            <span className="text-[#16A34A]">300 BDT Paid</span>
                          </div>
                          {isPaid && (
                            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                              ✓ Your payment has been confirmed by the Career Club BTEC organizing committee.
                            </p>
                          )}
                        </div>

                        {isPaid ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>Paid & Verified</span>
                          </span>
                        ) : isRejected ? (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 w-fit flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Payment Rejected</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300 w-fit flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Verification in Progress</span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
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

                  {/* Team Name Input */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/60 border-2 border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#16A34A]" />
                        <span>Team Name / দলের নাম</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Official Team Identity
                      </span>
                    </div>
                    <input
                      type="text"
                      value={editFormData.teamName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, teamName: e.target.value })}
                      placeholder="e.g. Weaver Dynamics"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                    />
                  </div>

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
                              <select
                                value={p.department}
                                onChange={(e) => handleParticipantChange(role, 'department', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30 cursor-pointer"
                              >
                                <option value="" disabled>Select Department</option>
                                {DEPARTMENTS.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
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

                            {role === 'leader' && (
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-[#16A34A]" />
                                  <span>Leader Email Address *</span>
                                </label>
                                <input
                                  type="email"
                                  value={p.email || ''}
                                  onChange={(e) => handleParticipantChange(role, 'email', e.target.value)}
                                  placeholder="leader@gmail.com"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
                                />
                              </div>
                            )}

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
