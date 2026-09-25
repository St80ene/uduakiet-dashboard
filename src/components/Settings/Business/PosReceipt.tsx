import { UduaKietLogo } from '@/common/AppLogo';
import type { IBusiness } from '@/interfaces/business.interface';
import { Printer, Sparkles } from 'lucide-react';
import type { FC } from 'react';

const PosReceipt: FC<{ formData: Partial<IBusiness> }> = ({ formData }) => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 sticky top-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Printer size={15} className="text-cyan-400" /> Live Customer
            Receipt Preview
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            REALTIME
          </span>
        </div>

        {/* SIMULATED THERMAL POS RECEIPT */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs space-y-4 shadow-inner">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-base">
              <UduaKietLogo />
            </div>
            <p className="font-bold text-white text-sm tracking-wide">
              {formData.display_name || 'Store Name'}
            </p>
            <p className="text-[10px] text-slate-400">
              {formData.address_line_1 || 'Address Line 1'},{' '}
              {formData.city || 'City'}
            </p>
            <p className="text-[10px] text-slate-400">
              {formData.phone_number || 'Phone Number'}
            </p>
            <p className="text-[10px] text-slate-500">
              TIN: {formData.tax_identification_number || 'TIN-0000000'}
            </p>
          </div>

          <div className="border-b border-dashed border-slate-800" />

          {/* Sample Cart Items */}
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>1x Premium Rice 50kg</span>
              <span>{formData.currency === 'NGN' ? '₦' : '$'}45,000</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>2x Refined Vegetable Oil</span>
              <span>{formData.currency === 'NGN' ? '₦' : '$'}12,000</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-800" />

          {/* Calculations */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formData.currency === 'NGN' ? '₦' : '$'}57,000</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>VAT ({formData.settings?.defaultTaxRate}%)</span>
              <span>{formData.currency === 'NGN' ? '₦' : '$'}4,275</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1 text-xs">
              <span>TOTAL</span>
              <span className="text-cyan-400">
                {formData.currency === 'NGN' ? '₦' : '$'}61,275
              </span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-800" />

          {/* Footer Message */}
          <div className="text-center pt-1 space-y-1">
            <p className="text-[10px] text-slate-400 italic">
              "{formData.settings?.receiptFooterText}"
            </p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest pt-1">
              Powered by UduaKiet One Market Engine
            </p>
          </div>
        </div>
        {/* QUICK HINT */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2 text-[11px] text-cyan-300">
          <Sparkles size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Edits made in the General, Location, and Branding tabs immediately
            update customer POS invoices.
          </span>
        </div>
      </div>
    </div>
  );
};

export default PosReceipt;
