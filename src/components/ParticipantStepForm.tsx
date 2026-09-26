import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, X, AlertCircle, Phone, User, Hash, BookOpen, Share2, Mail, Trophy, Users } from 'lucide-react';
import { Participant } from '../types';
import { DEPARTMENTS, processAndCompressImage } from '../utils/formUtils';

interface ParticipantStepFormProps {
  title: string;
  subtitle: string;
  roleBadge: string;
  participant: Participant;
  onChange: (updated: Partial<Participant>) => void;
  errors: Record<string, string>;
  otherRolls: string[];
  showEmail?: boolean;
  showTeamName?: boolean;
  teamName?: string;
  onTeamNameChange?: (name: string) => void;
  teamNameError?: string;
}

export const ParticipantStepForm: React.FC<ParticipantStepFormProps> = ({
  title,
  subtitle,
  roleBadge,
  participant,
  onChange,
  errors,
  otherRolls,
  showEmail = false,
  showTeamName = false,
  teamName = '',
  onTeamNameChange,
  teamNameError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isLeader = Boolean(showEmail || roleBadge.toLowerCase().includes('leader'));

  const processSelectedFile = async (file: File) => {
    setPhotoError(null);
    setIsProcessingPhoto(true);

    try {
      const result = await processAndCompressImage(file);
      onChange({
        photoBase64: result.base64,
        photoPreview: result.previewUrl,
        photoName: result.fileName,
        photoSize: result.sizeBytes
      });
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to process image');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const removePhoto = () => {
    onChange({
      photoBase64: undefined,
      photoPreview: undefined,
      photoName: undefined,
      photoSize: undefined
    });
    setPhotoError(null);
  };

  const isRollDuplicateInTeam = Boolean(
    participant.roll && otherRolls.includes(participant.roll.trim())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Role Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-200/80 gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-[#0A192F]">{title}</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#22C55E]/15 text-[#15803D]">
            {roleBadge}
          </span>
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-4">
          {/* Optional/Required Team Name (Shown in Leader Step) - Compact & Clean */}
          {showTeamName && (
            <div className="bg-emerald-50/50 p-3 sm:p-3.5 rounded-xl border border-emerald-300/80 space-y-1.5 mb-1.5">
              <div className="flex items-center justify-between gap-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#0A192F] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Team Name / দলের নাম</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  Team Identity
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={teamName || ''}
                  onChange={(e) => onTeamNameChange?.(e.target.value)}
                  placeholder="Enter your team name (e.g. Apex Weavers)"
                  className={`w-full px-3.5 py-2 rounded-lg border text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                    teamNameError
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                  }`}
                />
              </div>

              {teamNameError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{teamNameError}</span>
                </p>
              )}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Full Name</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={participant.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Full name"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Roll Number & Department Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Roll Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Roll Number</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={participant.roll}
                onChange={(e) => onChange({ roll: e.target.value.trim() })}
                placeholder="Student Roll"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.roll || isRollDuplicateInTeam
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                }`}
              />
              {(errors.roll || isRollDuplicateInTeam) && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{isRollDuplicateInTeam ? 'Roll number already used in another member slot.' : errors.roll}</span>
                </p>
              )}
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Department</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                value={participant.department}
                onChange={(e) => onChange({ department: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.department
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                }`}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.department}</span>
                </p>
              )}
            </div>
          </div>

          {/* Mobile & Facebook Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Mobile Number</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={participant.whatsapp}
                onChange={(e) => onChange({ whatsapp: e.target.value })}
                placeholder="017XXXXXXXX"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.whatsapp
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                }`}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.whatsapp}</span>
                </p>
              )}
            </div>

            {/* Facebook Profile / ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Facebook ID / Link</span>
                  {isLeader && <span className="text-red-500">*</span>}
                </span>
                {!isLeader ? (
                  <span className="text-slate-400 font-normal normal-case text-[11px]">
                    (Optional - leave blank if none)
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold normal-case text-[11px]">
                    Required
                  </span>
                )}
              </label>
              <input
                type="text"
                value={participant.facebook}
                onChange={(e) => onChange({ facebook: e.target.value })}
                placeholder={isLeader ? "facebook.com/leader.username" : "facebook.com/username (or leave blank)"}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.facebook
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                }`}
              />
              {errors.facebook && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.facebook}</span>
                </p>
              )}
            </div>
          </div>

          {/* Email Address (Leader / Enabled) */}
          {showEmail && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Leader Email Address</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={participant.email || ''}
                onChange={(e) => onChange({ email: e.target.value.trim() })}
                placeholder="leader@gmail.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
                }`}
              />
              {errors.email ? (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Registration entry pass & official event notifications will be sent to this email address.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Photo Upload */}
        <div className="lg:col-span-4 flex flex-col">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Participant Photo <span className="text-red-500">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {participant.photoPreview ? (
            /* Uploaded Image Preview */
            <div className="relative rounded-2xl border border-[#22C55E]/50 bg-[#FAFBF9] p-3 text-center space-y-2.5">
              <div className="relative w-32 h-40 mx-auto rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
                <img
                  src={participant.photoPreview}
                  alt={participant.name || 'Participant'}
                  className="w-full h-full object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 transition cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="space-y-1">
                {participant.photoSize && (
                  <p className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded-md inline-block border border-emerald-200">
                    Original Quality • {(participant.photoSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  Change Photo
                </motion.button>
              </div>
            </div>
          ) : (
            /* Upload Box */
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[200px] flex-1 ${
                isDragging
                  ? 'border-[#16A34A] bg-[#22C55E]/10 scale-[1.01]'
                  : errors.photo || photoError
                    ? 'border-red-300 bg-red-50/40 hover:bg-red-50/70'
                    : 'border-slate-300 bg-[#FAFBF9] hover:border-[#16A34A] hover:bg-[#22C55E]/5'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mb-2.5 text-slate-500">
                {isProcessingPhoto ? (
                  <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-[#16A34A]" />
                )}
              </div>

              <p className="text-xs font-bold text-slate-700 mb-0.5">
                {isProcessingPhoto ? 'Loading Photo...' : isDragging ? 'Drop Photo Here' : 'Upload Photo'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Click or drag & drop
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                JPG, PNG, WEBP • Max 5MB • Same Quality
              </p>
            </motion.div>
          )}

          {(errors.photo || photoError) && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{photoError || errors.photo}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
