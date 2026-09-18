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
  const registrationFee = '300 BDT';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(officialBkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#0A192F]">Registration Payment</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2136E]/10 text-[#E2136E]">
              bKash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Send the team registration fee and provide your transaction details.
          </p>
        </div>
        <span className="text-xs font-extrabold text-[#16A34A] bg-[#22C55E]/10 px-3 py-1 rounded-full w-fit">
          Fee: {registrationFee} / Team
        </span>
      </div>

      {/* Payment Instruction Card */}
      <div className="bg-[#FAFBF9] rounded-2xl border border-slate-200/90 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              bKash Personal (Send Money)
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-black text-[#0A192F] font-['Space_Grotesk'] tracking-wider">
                {officialBkashNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-[#16A34A]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 sm:text-right">
            <span className="font-bold text-[#0A192F] block">Amount to Send</span>
            <span className="text-sm font-black text-[#16A34A]">300 BDT</span>
          </div>
        </div>

        {/* Concise payment steps */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <p className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Send <strong>300 BDT</strong> via bKash <strong>Send Money</strong> to <strong>{officialBkashNumber}</strong></span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-[10px] font-bold">2</span>
            <span>Enter your <strong>Sender bKash Number</strong> and <strong>Transaction ID (TrxID)</strong> below</span>
          </p>
        </div>
      </div>

      {/* Verification Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sender bKash Number */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#E2136E]" />
            <span>Sender bKash Number</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={payment.bkashNumber}
            onChange={(e) => onChange({ bkashNumber: e.target.value })}
            placeholder="e.g. 017XXXXXXXX"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
              errors.bkashNumber
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
            }`}
          />
          {errors.bkashNumber && (
            <p className="text-xs text-red-600 mt-1">{errors.bkashNumber}</p>
          )}
        </div>

        {/* Transaction ID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Transaction ID (TrxID)</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={payment.transactionId}
            onChange={(e) => onChange({ transactionId: e.target.value.toUpperCase() })}
            placeholder="e.g. BL92A87X3"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono uppercase text-slate-800 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-2 ${
              errors.transactionId
                ? 'border-red-400 focus:ring-red-100'
                : 'border-slate-300 focus:border-[#16A34A] focus:ring-[#22C55E]/20'
            }`}
          />
          {errors.transactionId && (
            <p className="text-xs text-red-600 mt-1">{errors.transactionId}</p>
          )}
        </div>
      </div>
    </div>
  );
};
