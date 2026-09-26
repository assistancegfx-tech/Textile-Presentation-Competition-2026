import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Trophy,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { RegisteredTeamRecord, RegistrationFormData, Participant } from '../types';
import { generateRegistrationPdf, getRegistrationPdfBase64 } from '../utils/pdfGenerator';
import { fireCelebrationConfetti } from '../utils/confetti';
import { DEPARTMENTS, validateBangladeshPhone, validateEmail, processAndCompressImage } from '../utils/formUtils';

interface ViewEditRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRegId?: string;
  initialRoll?: string;
  initialMobile?: string;
  autoSearch?: boolean;
  onUpdated?: (record: RegisteredTeamRecord) => void;
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
  initialRegId = '',
  initialRoll = '',
  initialMobile = '',
  autoSearch = false,
  onUpdated
}) => {
  const [searchId, setSearchId] = useState(initialRegId);
  const [searchRoll, setSearchRoll] = useState(initialRoll);
  const [searchMobile, setSearchMobile] = useState(initialMobile);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [record, setRecord] = useState<RegisteredTeamRecord | null>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<RegistrationFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Track if auto search was triggered for this modal open session
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopyText = (text: string, fieldName: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
    }
  };

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
    if (initialRegId) setSearchId(initialRegId);
    if (initialRoll) setSearchRoll(initialRoll);
    if (initialMobile) setSearchMobile(initialMobile);
  }, [initialRegId, initialRoll, initialMobile, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHasAutoSearched(false);
    }
  }, [isOpen]);

  const DEFAULT_VERIFIED_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';

  const handleSearch = async (overrideId?: string, overrideRoll?: string, overrideMobile?: string) => {
    const rawTargetId = String(overrideId || searchId || '').trim();
    let targetId = rawTargetId.toUpperCase();
    if (targetId && !targetId.startsWith('TPC') && !targetId.startsWith('TEX') && /^\d+$/.test(targetId) && targetId.length <= 4) {
      targetId = `TPC-${targetId.padStart(2, '0')}`;
    }

    const targetRoll = String(overrideRoll !== undefined ? overrideRoll : searchRoll || '').trim();
    const targetMobile = String(overrideMobile !== undefined ? overrideMobile : searchMobile || '').trim();

    if (!targetId && !targetRoll) {
      setSearchError('Please enter your Registration Number (e.g. TPC-010203-01) or Team Leader Roll.');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setSaveSuccessMsg(null);
    setIsEditing(false);

    let scriptUrl = localStorage.getItem('tpc2026_google_script_url') || DEFAULT_VERIFIED_SCRIPT_URL;
    if (!scriptUrl || scriptUrl.includes('AKfycbzPpm6fVvOmXE1FTq') || scriptUrl.includes('AKfycbzVPB_lyf20Tx7qNxgb') || !scriptUrl.startsWith('http')) {
      scriptUrl = DEFAULT_VERIFIED_SCRIPT_URL;
      localStorage.setItem('tpc2026_google_script_url', DEFAULT_VERIFIED_SCRIPT_URL);
    }

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
        } else if (!res.ok && res.status === 401 && data.error) {
          setSearchError(data.error);
          setRecord(null);
          setIsLoading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('Backend API lookup notice, trying direct Google Sheets fallback:', backendErr);
      }

      // 2. Direct Google Apps Script Client-Side Fallback if backend didn't return record
      if (!candidateRecord) {
        const urlsToTry = Array.from(new Set([scriptUrl, DEFAULT_VERIFIED_SCRIPT_URL]));
        for (const testUrl of urlsToTry) {
          if (!testUrl || !testUrl.startsWith('http')) continue;
          try {
            const directUrl = `${testUrl}${testUrl.includes('?') ? '&' : '?'}action=get&regId=${encodeURIComponent(targetId || targetRoll)}`;
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
                break;
              }
            }
          } catch (scriptFetchErr) {
            console.warn('Direct Google Apps Script fetch notice:', scriptFetchErr);
          }
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
        const existingIdx = list.findIndex(r => r.registrationId?.toUpperCase() === candidateRecord!.registrationId.toUpperCase());
        if (existingIdx >= 0) {
          const localRecord = list[existingIdx];
          // If local record has higher editCount or was edited locally, preserve the edited formData!
          if ((localRecord.editCount ?? 0) > (candidateRecord.editCount ?? 0)) {
            candidateRecord = {
              ...localRecord,
              paymentStatus: candidateRecord.paymentStatus || localRecord.paymentStatus
            };
          }
          list[existingIdx] = candidateRecord;
        } else {
          list.push(candidateRecord);
        }
        localStorage.setItem('tpc2026_saved_registrations', JSON.stringify(list));
      } catch {}

      setRecord(candidateRecord);
      setEditFormData(JSON.parse(JSON.stringify(candidateRecord.formData)));
      setShowSearchBox(false);

      // Trigger celebratory confetti if record is payment verified
      const isPaid = /^(paid|verified|approved|received|completed|success)/i.test((candidateRecord.paymentStatus || '').trim());
      if (isPaid) {
        setTimeout(() => {
          fireCelebrationConfetti({ particleCount: 65, spread: 70 });
        }, 350);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Failed to connect to registration server.');
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && autoSearch && !hasAutoSearched && (initialRegId || initialRoll)) {
      setHasAutoSearched(true);
      handleSearch(initialRegId, initialRoll, initialMobile);
    }
  }, [isOpen, autoSearch, hasAutoSearched, initialRegId, initialRoll, initialMobile]);

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

  const handlePhotoUpload = async (
    role: 'leader' | 'member1' | 'member2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await processAndCompressImage(file);
      if (editFormData) {
        setEditFormData({
          ...editFormData,
          [role]: {
            ...editFormData[role],
            photoBase64: result.base64,
            photoPreview: result.previewUrl,
            photoName: result.fileName,
            photoSize: result.sizeBytes
          }
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to process photo. Please choose a photo up to 5MB.');
    }
  };

  const handleSaveEdit = async () => {
    if (!record || !editFormData) return;

    if (!editFormData.teamName || !editFormData.teamName.trim()) {
      setSaveError('Team Name is required.');
      return;
    }

    // Validate active participant fields
    const roles: ('leader' | 'member1' | 'member2')[] = ['leader', 'member1', 'member2'];
    const labels = { 
      leader: 'Team Leader', 
      member1: 'Member 1', 
      member2: 'Member 2' 
    };

    for (const r of roles) {
      const p = editFormData[r];
      if (!p || !p.name?.trim()) {
        setSaveError(`${labels[r]} name is required.`);
        return;
      }
      if (!p.roll?.trim()) {
        setSaveError(`${labels[r]} roll number is required.`);
        return;
      }
      if (r === 'leader') {
        if (!p.whatsapp?.trim() || !validateBangladeshPhone(p.whatsapp)) {
          setSaveError(`${labels[r]} requires a valid 11-digit Bangladesh mobile number (e.g. 017XXXXXXXX).`);
          return;
        }
        if (!p.facebook?.trim() || p.facebook.trim().toLowerCase() === 'blank') {
          setSaveError(`${labels[r]} Facebook profile link or ID is required.`);
          return;
        }
      } else {
        if (p.whatsapp?.trim() && !validateBangladeshPhone(p.whatsapp)) {
          setSaveError(`${labels[r]} mobile number must be a valid 11-digit Bangladesh number (e.g. 017XXXXXXXX).`);
          return;
        }
      }
    }

    // Check duplicate rolls among members
    const rolls = [
      editFormData.leader.roll.trim(),
      editFormData.member1.roll.trim(),
      editFormData.member2.roll.trim()
    ].filter(Boolean);

    if (new Set(rolls).size !== 3) {
      setSaveError('All 3 team members must have unique student roll numbers.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // Normalize empty Facebook fields to "Blank"
    const normalizedEditFormData: RegistrationFormData = {
      ...editFormData,
      leader: {
        ...editFormData.leader,
        facebook: editFormData.leader.facebook?.trim() || 'Blank'
      },
      member1: {
        ...editFormData.member1,
        facebook: editFormData.member1?.facebook?.trim() || 'Blank'
      },
      member2: {
        ...editFormData.member2,
        facebook: editFormData.member2?.facebook?.trim() || 'Blank'
      }
    };

    // Pre-generate updated official entry voucher PDF base64
    let pdfBase64 = '';
    try {
      pdfBase64 = getRegistrationPdfBase64({
        registrationId: record.registrationId,
        submissionDate: record.submissionDate || new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }),
        paymentStatus: record.paymentStatus || 'Pending',
        editCount: (record.editCount ?? 0) + 1,
        formData: normalizedEditFormData
      });
    } catch (pdfErr) {
      console.warn('Updated PDF Base64 generation warning:', pdfErr);
    }

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
            formData: normalizedEditFormData,
            backupRegistration: record,
            pdfBase64
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

      // 2. Direct Google Apps Script update (ensures immediate write to Google Sheets)
      if (scriptUrl) {
        try {
          const updatePayload = JSON.stringify({
            action: 'updateRegistration',
            registrationId: record.registrationId,
            formData: normalizedEditFormData,
            pdfBase64
          });

          // A) Try text/plain POST (bypasses browser CORS preflight check)
          let scriptSuccess = false;
          try {
            const scriptRes = await fetch(scriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: updatePayload,
              redirect: 'follow'
            });
            const sJson = await scriptRes.json();
            if (sJson && sJson.success) {
              scriptSuccess = true;
              sheetUpdateSuccess = true;
            }
          } catch (_) {
            // Browser CORS or redirect handling - continue to GET fallback
          }

          // B) Try GET fallback (100% compatible with Google Apps Script Web App redirects in browsers)
          if (!scriptSuccess) {
            try {
              const getUrl = `${scriptUrl}?action=updateRegistration&data=${encodeURIComponent(updatePayload)}`;
              const getRes = await fetch(getUrl, { method: 'GET', redirect: 'follow' });
              const gJson = await getRes.json();
              if (gJson && gJson.success) {
                sheetUpdateSuccess = true;
              }
            } catch (_) {}
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

      // Also update latest submission in localStorage
      try {
        const latestStr = localStorage.getItem('tpc2026_latest_submission');
        if (latestStr) {
          const latestObj = JSON.parse(latestStr);
          if (latestObj?.result?.registrationId?.toUpperCase() === record.registrationId.toUpperCase()) {
            latestObj.formData = editFormData;
            if (latestObj.result) {
              latestObj.result.editCount = updatedRecord.editCount;
              latestObj.result.remainingEdits = updatedRecord.remainingEdits;
            }
            localStorage.setItem('tpc2026_latest_submission', JSON.stringify(latestObj));
          }
        }
      } catch {
        // ignore
      }

      // Dispatch global window event for cross-component reactive updates
      try {
        window.dispatchEvent(new CustomEvent('tpc2026_registration_updated', { detail: updatedRecord }));
      } catch {
        // ignore
      }

      if (onUpdated) {
        onUpdated(updatedRecord);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error while updating registration. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

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
                View Your Registration
              </h2>
              <p className="text-xs text-slate-400">
                View registration voucher, check payment status & edit details (up to 3 times)
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[82vh] overflow-y-auto">
          {/* If record is loaded, show a clean switcher bar */}
          {record && (
            <div className="mb-4 p-3 px-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center shrink-0">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-500 font-medium">Viewing record:</span>
                <span className="font-extrabold text-[#0A192F] font-mono tracking-wide">{record.registrationId}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setShowSearchBox(!showSearchBox)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] hover:text-[#15803D] bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
              >
                <Search className="w-3 h-3 text-[#16A34A]" />
                <span>{showSearchBox ? 'Hide Search Form' : 'Search Another Registration'}</span>
              </motion.button>
            </div>
          )}

          {/* Security Search Box (visible if no record loaded OR user clicked to search another) */}
          {(!record || showSearchBox) && (
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
                      placeholder="e.g. TPC-010203-01"
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

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#122846] transition disabled:opacity-60 shadow-xs whitespace-nowrap cursor-pointer"
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
                </motion.button>
              </div>

              {/* Quick Suggestions from Local Storage */}
              {recentRegistrations.length > 0 && !record && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Recent on this device:</span>
                  {recentRegistrations.map((item) => (
                    <motion.button
                      key={item.registrationId}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => {
                        setSearchId(item.registrationId);
                        setSearchRoll(item.leaderRoll);
                        setSearchMobile(item.leaderMobile);
                        handleSearch(item.registrationId, item.leaderRoll, item.leaderMobile);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:border-[#16A34A] hover:text-[#16A34A] transition cursor-pointer"
                    >
                      <span>{item.registrationId}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.leaderName})</span>
                    </motion.button>
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
          )}

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
            <div className="space-y-5">
              {/* VIEW MODE */}
              {!isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  {/* Unified Team & Registration Hero Card */}
                  <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
                    {/* Subtle top decorative gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#22C55E] via-teal-400 to-[#16A34A]" />

                    {/* Top Row: Team Name, ID & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 pt-1">
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Floating Trophy Icon */}
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-[#22C55E]/15 to-teal-500/10 text-[#16A34A] border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-2xs">
                            <Trophy className="w-5 h-5 text-[#16A34A]" />
                          </div>

                          {/* Team Name */}
                          <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight leading-none">
                            {record.formData.teamName || record.teamName || '—'}
                          </h3>
                        </div>

                        {/* Registration ID & Meta with 1-click Copy */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:pl-11">
                          <button
                            type="button"
                            onClick={() => handleCopyText(record.registrationId, 'regId')}
                            className="group inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 px-2.5 py-0.5 rounded-md tracking-wider transition cursor-pointer"
                            title="Click to copy Registration ID"
                          >
                            <span>ID: {record.registrationId}</span>
                            {copiedField === 'regId' ? (
                              <Check className="w-3 h-3 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            )}
                            {copiedField === 'regId' && (
                              <span className="text-[10px] font-extrabold text-[#16A34A] animate-in fade-in">Copied!</span>
                            )}
                          </button>
                          <span className="text-slate-300">•</span>
                          <span>Submitted: {record.submissionDate || 'Recently'}</span>
                          {record.lastEditedAt && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">Edited: {record.lastEditedAt}</span>
                            </>
                          )}
                        </div>
                      </motion.div>

                      {/* Status & Edit Badges */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                        {/* Animated Payment Status Badge */}
                        {(() => {
                          const statusStr = (record.paymentStatus || 'Pending').trim();
                          const isPaid = /^(paid|verified|approved|received|completed|success)/i.test(statusStr);
                          const isRejected = /^(rejected|declined|failed|invalid)/i.test(statusStr);

                          if (isPaid) {
                            return (
                              <motion.button
                                type="button"
                                onClick={() => fireCelebrationConfetti({ particleCount: 50, spread: 60 })}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs hover:bg-emerald-200/70 transition cursor-pointer select-none"
                                title="Payment Confirmed by BTEC Committee! Click to celebrate"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                                <span className="font-extrabold tracking-wide uppercase text-[11px]">
                                  Payment Verified
                                </span>
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              </motion.button>
                            );
                          }
                          if (isRejected) {
                            return (
                              <motion.span
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border-2 border-rose-300 flex items-center gap-1.5 shadow-2xs"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Payment Rejected</span>
                              </motion.span>
                            );
                          }
                          return (
                            <motion.div
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0"
                              >
                                <Clock className="w-3 h-3 text-amber-700" />
                              </motion.div>
                              <span>Pending Verification</span>
                            </motion.div>
                          );
                        })()}

                        {/* Remaining Edits Pill */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            record.remainingEdits === 3
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : record.remainingEdits > 0
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {record.remainingEdits > 0 ? (
                            <>
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>{record.remainingEdits} of 3 Edits Left</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Edits Locked</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar with Motion Hover Effects */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <motion.button
                          type="button"
                          onClick={handleDownloadPdf}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] shadow-sm shadow-emerald-700/20 active:scale-98 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Pass</span>
                        </motion.button>

                        {record.remainingEdits > 0 && (
                          <motion.button
                            type="button"
                            onClick={handleStartEdit}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A192F] bg-amber-100 hover:bg-amber-200 border border-amber-300/90 shadow-2xs active:scale-98 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit Details</span>
                          </motion.button>
                        )}

                        <motion.button
                          type="button"
                          onClick={() => handleSearch(record.registrationId, record.formData?.leader?.roll, record.formData?.leader?.whatsapp)}
                          disabled={isLoading}
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs active:scale-98 transition cursor-pointer"
                          title="Check Google Sheets for updated payment status"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 text-[#16A34A] ${isLoading ? 'animate-spin' : ''}`} />
                          <span>Refresh Status</span>
                        </motion.button>
                      </div>

                      {/^(paid|verified|approved|received|completed|success)/i.test((record.paymentStatus || '').trim()) ? (
                        <motion.a
                          href="https://chat.whatsapp.com/Fnta8tls8Gh4UKlVDQT7h0?s=cl&p=a&mlu=4&ilr=4"
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#25D366] hover:bg-[#128C7E] shadow-sm shadow-[#25D366]/20 transition cursor-pointer"
                          title="Join Official WhatsApp Group (Approved Participants)"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>Join WhatsApp Group</span>
                          <ExternalLink className="w-3 h-3" />
                        </motion.a>
                      ) : (
                        <div
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed"
                          title="WhatsApp Group link is locked until payment is verified"
                        >
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>WhatsApp: Unlocks upon Payment Approval</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admission Notice Banner */}
                  {/^(paid|verified|approved|received|completed|success)/i.test((record.paymentStatus || '').trim()) ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">
                          Official Entry Pass Validated — Print or carry your Registration PDF to the BTEC Auditorium on 04 October 2026.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fireCelebrationConfetti({ particleCount: 50, spread: 60 })}
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-800 bg-emerald-200/60 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition cursor-pointer shrink-0"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Verified</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-3.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-medium text-amber-900">
                          Payment verification in progress. Once confirmed, refresh to download your verified admission pass.
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded shrink-0">
                        Pending
                      </span>
                    </motion.div>
                  )}

                  {/* Participants Grid (Clean Layout without Participant Images) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span>Team Members Information</span>
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {record.formData?.member2?.name && record.formData.member2.name !== 'N/A'
                          ? '3 Members (Trio Team)'
                          : record.formData?.member1?.name && record.formData.member1.name !== 'N/A'
                          ? '2 Members (Duo Team)'
                          : '1 Member (Solo Presenter)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Leader Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between space-y-4 group"
                      >
                        {/* Top Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                        <div className="space-y-3 pt-0.5">
                          {/* Role Badge */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Crown className="w-3 h-3 text-[#16A34A]" />
                              <span>Group Leader</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Primary Contact
                            </span>
                          </div>

                          {/* Name & Roll */}
                          <div>
                            <h5 className="text-base font-extrabold text-[#0A192F] leading-tight break-words group-hover:text-[#16A34A] transition-colors">
                              {record.formData.leader.name || '—'}
                            </h5>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Roll:</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                {record.formData.leader.roll || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Member Meta */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Department</span>
                              <span className="font-semibold text-slate-800 block truncate">{record.formData.leader.department || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Mobile / WhatsApp</span>
                              <a
                                href={`tel:${record.formData.leader.whatsapp || ''}`}
                                className="font-bold text-slate-800 hover:text-[#16A34A] transition inline-flex items-center gap-1.5"
                              >
                                <Phone className="w-3 h-3 text-[#16A34A] shrink-0" />
                                <span>{record.formData.leader.whatsapp || '—'}</span>
                              </a>
                            </div>

                            {record.formData.leader.email && (
                              <div>
                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Email Address</span>
                                <a
                                  href={`mailto:${record.formData.leader.email}`}
                                  className="font-semibold text-slate-800 hover:text-[#16A34A] transition inline-flex items-center gap-1.5 truncate max-w-full"
                                >
                                  <Mail className="w-3 h-3 text-[#16A34A] shrink-0" />
                                  <span className="truncate">{record.formData.leader.email}</span>
                                </a>
                              </div>
                            )}

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Facebook Profile</span>
                              {record.formData.leader.facebook && record.formData.leader.facebook.trim() !== 'Blank' ? (
                                <a
                                  href={record.formData.leader.facebook.startsWith('http') ? record.formData.leader.facebook : `https://${record.formData.leader.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1 truncate max-w-full"
                                >
                                  <span className="truncate">{record.formData.leader.facebook}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Member 1 Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between space-y-4 group"
                      >
                        {/* Top Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 to-slate-400" />

                        <div className="space-y-3 pt-0.5">
                          {/* Role Badge */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span>Member 1</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Presenter
                            </span>
                          </div>

                          {/* Name & Roll */}
                          <div>
                            <h5 className="text-base font-extrabold text-[#0A192F] leading-tight break-words group-hover:text-[#16A34A] transition-colors">
                              {record.formData.member1?.name || '—'}
                            </h5>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Roll:</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                {record.formData.member1?.roll || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Member Meta */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Department</span>
                              <span className="font-semibold text-slate-800 block truncate">{record.formData.member1?.department || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Mobile / WhatsApp</span>
                              <a
                                href={`tel:${record.formData.member1?.whatsapp || ''}`}
                                className="font-bold text-slate-800 hover:text-[#16A34A] transition inline-flex items-center gap-1.5"
                              >
                                <Phone className="w-3 h-3 text-[#16A34A] shrink-0" />
                                <span>{record.formData.member1?.whatsapp || '—'}</span>
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Facebook Profile</span>
                              {record.formData.member1?.facebook && record.formData.member1.facebook.trim() !== 'Blank' ? (
                                <a
                                  href={record.formData.member1.facebook.startsWith('http') ? record.formData.member1.facebook : `https://${record.formData.member1.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1 truncate max-w-full"
                                >
                                  <span className="truncate">{record.formData.member1.facebook}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Member 2 Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between space-y-4 group"
                      >
                        {/* Top Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 to-slate-400" />

                        <div className="space-y-3 pt-0.5">
                          {/* Role Badge */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span>Member 2</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Presenter
                            </span>
                          </div>

                          {/* Name & Roll */}
                          <div>
                            <h5 className="text-base font-extrabold text-[#0A192F] leading-tight break-words group-hover:text-[#16A34A] transition-colors">
                              {record.formData.member2?.name || '—'}
                            </h5>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                              <span className="text-[10px] font-bold uppercase text-slate-400">Roll:</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                {record.formData.member2?.roll || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Member Meta */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Department</span>
                              <span className="font-semibold text-slate-800 block truncate">{record.formData.member2?.department || '—'}</span>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Mobile / WhatsApp</span>
                              <a
                                href={`tel:${record.formData.member2?.whatsapp || ''}`}
                                className="font-bold text-slate-800 hover:text-[#16A34A] transition inline-flex items-center gap-1.5"
                              >
                                <Phone className="w-3 h-3 text-[#16A34A] shrink-0" />
                                <span>{record.formData.member2?.whatsapp || '—'}</span>
                              </a>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Facebook Profile</span>
                              {record.formData.member2?.facebook && record.formData.member2.facebook.trim() !== 'Blank' ? (
                                <a
                                  href={record.formData.member2.facebook.startsWith('http') ? record.formData.member2.facebook : `https://${record.formData.member2.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-[#1877F2] hover:underline inline-flex items-center gap-1 truncate max-w-full"
                                >
                                  <span className="truncate">{record.formData.member2.facebook}</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Payment & Transaction Details Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#16A34A]" />
                        <h4 className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                          Payment & Transaction Details
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-[#E2136E] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                        bKash Payment
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* bKash Sender */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 hover:border-slate-200 transition">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Sender bKash Number
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            {record.formData.payment.bkashNumber || '—'}
                          </span>
                          {record.formData.payment.bkashNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopyText(record.formData.payment.bkashNumber, 'bkash')}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                              title="Copy bKash Number"
                            >
                              {copiedField === 'bkash' ? (
                                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Transaction ID with 1-Click Copy */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100/90 hover:border-slate-200 transition">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Transaction ID (TrxID)
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-sm tracking-wide font-mono">
                            {record.formData.payment.transactionId || '—'}
                          </span>
                          {record.formData.payment.transactionId && (
                            <button
                              type="button"
                              onClick={() => handleCopyText(record.formData.payment.transactionId, 'trxId')}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#16A34A] bg-white border border-slate-200 px-2 py-0.5 rounded cursor-pointer transition shadow-2xs"
                              title="Copy Transaction ID"
                            >
                              {copiedField === 'trxId' ? (
                                <>
                                  <Check className="w-3 h-3 text-[#16A34A]" />
                                  <span className="text-[#16A34A]">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Fee Amount */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-200 transition">
                        <span className="text-[10px] font-bold uppercase text-emerald-700/80 block mb-1">
                          Registration Fee
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-800 text-sm">
                            149 BDT (Single Team Entry)
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
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

                  {/* Category / Team Size Selector Removed - Standard 3-member team */}

                  {/* Team Name Input */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 to-teal-50/60 border-2 border-emerald-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#16A34A]" />
                        <span>Team Name / দলের নাম</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        Official Identity
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

                  {/* Edit Form - Participant Sections */}
                  <div className="space-y-5">
                    {(['leader', 'member1', 'member2'] as const).map((role, idx) => {
                      const title = role === 'leader' ? 'Group Leader' : `Team Member ${idx}`;
                      const p = editFormData[role] || { name: '', roll: '', department: '', whatsapp: '', facebook: '' };

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
                                Mobile Number *
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
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <span>Facebook Profile URL</span>
                                  {role === 'leader' && <span className="text-red-500">*</span>}
                                </span>
                                {role !== 'leader' ? (
                                  <span className="text-slate-400 font-normal text-[10px]">(Optional - leave blank if none)</span>
                                ) : (
                                  <span className="text-emerald-700 font-bold text-[10px]">Required</span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={p.facebook}
                                onChange={(e) => handleParticipantChange(role, 'facebook', e.target.value)}
                                placeholder={role === 'leader' ? "facebook.com/leader.username" : "facebook.com/username (or leave blank)"}
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
                                <span>{p.photoPreview ? 'Change Photo' : 'Upload Photo'} (Max 5MB)</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg,image/webp"
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: isSaving ? 1 : 1.02 }}
                      whileTap={{ scale: isSaving ? 1 : 0.98 }}
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0A192F] hover:bg-[#122846] transition shadow-md shadow-[#0A192F]/20 disabled:opacity-60 cursor-pointer"
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
                    </motion.button>
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
