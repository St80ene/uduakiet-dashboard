import type { IBusiness } from '@/interfaces/business.interface';
import { Globe, Coins, Clock } from 'lucide-react';
import type { FC, ChangeEvent } from 'react';

const LocalizationTab: FC<{
  formData: IBusiness;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Regional Currency & Time Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Configure store currency formatting, timezone offsets, and default
              taxation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Base Currency */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Coins size={13} className="text-cyan-400" /> Primary Store Currency
          </label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          >
            <option value="NGN">NGN (₦) - Nigerian Naira</option>
            <option value="USD">USD ($) - US Dollar</option>
            <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
            <option value="KES">KES (KSh) - Kenyan Shilling</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="EUR">EUR (€) - Euro</option>
          </select>
          <p className="text-[10px] text-slate-500">
            All inventory valuations and daily ledger sales sync in this
            currency.
          </p>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Clock size={13} className="text-cyan-400" /> Store Timezone
          </label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          >
            <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
            <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
            <option value="Europe/London">Europe/London (BST, UTC+1)</option>
            <option value="America/New_York">
              America/New_York (EST, UTC-5)
            </option>
          </select>
          <p className="text-[10px] text-slate-500">
            Used for automated daily sales summaries and stock logs.
          </p>
        </div>

        {/* Language & Locale */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe size={13} className="text-cyan-400" /> System Language Locale
          </label>
          <select
            name="locale"
            value={formData.locale}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          >
            <option value="en-NG">English (Nigeria)</option>
            <option value="en-US">English (United States)</option>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="fr-FR">French (Francophone)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocalizationTab;
