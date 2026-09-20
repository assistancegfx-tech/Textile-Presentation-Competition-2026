import React, { useState } from 'react';
import { Copy, Check, Smartphone, Hash, Phone, Info } from 'lucide-react';
import { PaymentDetails } from '../types';

interface PaymentStepFormProps {
  payment: PaymentDetails;
  onChange: (updated: Partial<PaymentDetails>) => void;
  errors: Record<string, string>;
  leaderRoll?: string;
}

export const PaymentStepForm: React.FC<PaymentStepFormProps> = ({
  payment,
  onChange,
  errors
}) => {
  const [copied, setCopied] = useState(false);
  const officialBkashNumber = '01798246810';
  const registrationFee = '149 BDT';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(officialBkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pink-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#0A192F]">Registration Payment</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#E2136E] text-white shadow-xs">
              bKash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Send the team registration fee via bKash and provide transaction verification details.
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#E2136E] bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-full w-fit shadow-2xs">
          Fee: <strong className="text-sm font-black">{registrationFee}</strong> / Team
        </span>
      </div>

      {/* bKash Payment Instruction Card - Styled in authentic bKash Pink Theme */}
      <div className="bg-gradient-to-br from-pink-50/90 via-white to-rose-50/40 rounded-2xl border-2 border-pink-300/80 p-5 space-y-4 shadow-sm shadow-pink-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-pink-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#E2136E] bg-pink-100/90 px-2 py-0.5 rounded-md">
                bKash Personal (Send Money)
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-['Space_Grotesk'] tracking-wider">
                {officialBkashNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-pink-300 text-[#E2136E] hover:bg-pink-50 transition active:scale-95 shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#E2136E]" />
                    <span className="text-[#E2136E] font-black">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#E2136E]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs bg-white p-3 sm:px-4 rounded-xl border border-pink-200 shadow-2xs sm:text-right">
            <span className="font-bold text-slate-500 block text-[11px] uppercase tracking-wider">Amount to Send</span>
            <span className="text-base sm:text-lg font-black text-[#E2136E]">149 BDT</span>
          </div>
        </div>

        {/* Concise bKash steps with pink bullet indicators */}
        <div className="space-y-2 text-xs text-slate-700 font-medium">
          <p className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E2136E] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs">1</span>
            <span>Send <strong className="text-[#E2136E] font-black">149 BDT</strong> via bKash app or *247# using <strong>Send Money</strong> to <strong className="text-slate-900">{officialBkashNumber}</strong></span>
          </p>
          <p className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#E2136E] text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs">2</span>
            <span>Enter your <strong>Sender bKash Number</strong> and <strong>Transaction ID (TrxID)</strong> below</span>
          </p>
        </div>
      </div>

      {/* Verification Input Fields - Pink Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sender bKash Number */}
        <div className="bg-white p-4 rounded-xl border border-pink-200/90 shadow-2xs space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#E2136E]" />
            <span>Sender bKash Number</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={payment.bkashNumber}
            onChange={(e) => onChange({ bkashNumber: e.target.value })}
            placeholder="e.g. 017XXXXXXXX"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 bg-slate-50/50 transition focus:bg-white focus:outline-none focus:ring-2 ${
              errors.bkashNumber
                ? 'border-red-400 focus:ring-red-100'
                : 'border-pink-200 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
            }`}
          />
          {errors.bkashNumber ? (
            <p className="text-xs text-red-600 mt-1">{errors.bkashNumber}</p>
          ) : (
            <p className="text-[11px] text-slate-400">The 11-digit mobile number you sent money from.</p>
          )}
        </div>

        {/* Transaction ID */}
        <div className="bg-white p-4 rounded-xl border border-pink-200/90 shadow-2xs space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#E2136E]" />
            <span>Transaction ID (TrxID)</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={payment.transactionId}
            onChange={(e) => onChange({ transactionId: e.target.value.toUpperCase() })}
            placeholder="e.g. BL92A87X3"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase font-bold text-slate-900 placeholder-slate-400 bg-slate-50/50 transition focus:bg-white focus:outline-none focus:ring-2 ${
              errors.transactionId
                ? 'border-red-400 focus:ring-red-100'
                : 'border-pink-200 focus:border-[#E2136E] focus:ring-[#E2136E]/20'
            }`}
          />
          {errors.transactionId ? (
            <p className="text-xs text-red-600 mt-1">{errors.transactionId}</p>
          ) : (
            <p className="text-[11px] text-slate-400">Found in your bKash SMS or statement receipt.</p>
          )}
        </div>
      </div>
    </div>
  );
};
