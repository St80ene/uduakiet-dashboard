import type { IBusiness } from '@/interfaces/business.interface';
import {
  Building2,
  ShieldCheck,
  Store,
  FileText,
  Copy,
  Mail,
} from 'lucide-react';
import type { FC, ChangeEvent } from 'react';

const GeneralInfoTab: FC<{
  formData: IBusiness;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  copyToClipboard: (text: string, label: string) => void;
}> = ({ formData, handleChange, copyToClipboard }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Company Identity & Registration
            </h3>
            <p className="text-xs text-slate-400">
              Legal entity name, tax identifiers, and official business details.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
          <ShieldCheck size={12} /> Verified Enterprise
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Store size={13} className="text-cyan-400" /> Trading / Store Name
          </label>
          <input
            type="text"
            name="display_name"
            value={formData?.display_name ?? ''}
            onChange={handleChange}
            placeholder="e.g. UduaKiet Superstore"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
          <p className="text-[10px] text-slate-500">
            Appears on invoices, POS displays, and customer receipts.
          </p>
        </div>

        {/* Legal Registered Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <FileText size={13} className="text-cyan-400" /> Legal Business Name
          </label>
          <input
            type="text"
            name="legal_name"
            value={formData.legal_name}
            onChange={handleChange}
            placeholder="e.g. UduaKiet Commerce Ltd"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
          <p className="text-[10px] text-slate-500">
            Official registered company name for government & tax records.
          </p>
        </div>

        {/* Registration Number (RC/CAC) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-cyan-400" /> Company Reg
              Number (RC / CAC)
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(formData.registration_number, 'Reg Number')
              }
              className="text-[10px] cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Copy size={11} /> Copy
            </button>
          </label>
          <input
            type="text"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            placeholder="RC-123456"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Tax Identification Number (TIN) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText size={13} className="text-cyan-400" /> Tax ID (TIN /
              VAT)
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(formData.tax_identification_number, 'Tax ID')
              }
              className="text-[10px] cursor-pointer text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Copy size={11} /> Copy
            </button>
          </label>
          <input
            type="text"
            name="tax_identification_number"
            value={formData.tax_identification_number}
            onChange={handleChange}
            placeholder="TIN-000000-001"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Business Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Building2 size={13} className="text-cyan-400" /> Business Type &
            Industry
          </label>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
          >
            <option value="Supermarket / Retail Chain">
              Supermarket / Retail Chain
            </option>
            <option value="Wholesale Distributor">Wholesale Distributor</option>
            <option value="Pharmacy & Healthcare">Pharmacy & Healthcare</option>
            <option value="Electronics & Hardware">
              Electronics & Hardware
            </option>
            <option value="Fashion & Apparel">Fashion & Apparel</option>
            <option value="General Merchandise">General Merchandise</option>
          </select>
        </div>

        {/* Business Slug URL */}
        {/* <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe size={13} className="text-cyan-400" /> Store Handle / Slug
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[11px] text-slate-500 font-mono">
              uduakiet.com/
            </span>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full pl-28 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            />
          </div>
        </div> */}
      </div>

      <hr className="border-slate-800" />

      {/* Contact Channels */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Mail size={14} className="text-cyan-400" /> Official Contact Channels
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              Primary Contact Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@business.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              Phone Number / WhatsApp
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              Website URL
            </label>
            <input
              type="url"
              name="website"
              readOnly
              value={formData.website || ''}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
