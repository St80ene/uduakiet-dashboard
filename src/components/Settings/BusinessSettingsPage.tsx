import React, { useState, useMemo } from 'react';
import {
  Save,
  Building2,
  Globe,
  MapPin,
  Sliders,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Mail,
  FileText,
  Store,
  RotateCcw,
  Receipt,
  Coins,
  Clock,
  Palette,
  Info,
  CheckCircle2,
  RefreshCw,
  Printer,
} from 'lucide-react';

// Business Interfaces
export interface IBusinessSettings {
  themeColor: string;
  enableNotifications: boolean;
  enableMultiBranch: boolean;
  lowStockThreshold: number;
  enableReceiptQR: boolean;
  receiptFooterText: string;
  defaultTaxRate: number;
}

export interface IBusiness {
  id: string;
  legal_name: string;
  display_name: string;
  slug: string;
  registration_number: string;
  tax_identification_number: string;
  business_type: string;
  email: string;
  phone_number: string;
  website: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  currency: string;
  timezone: string;
  locale: string;
  settings: IBusinessSettings;
}

// Default initial state
const DEFAULT_BUSINESS: IBusiness = {
  id: 'biz_uduakiet_019283',
  legal_name: 'UduaKiet Commerce Nigeria Limited',
  display_name: 'UduaKiet Superstore & Wholesale Hub',
  slug: 'uduakiet-superstore',
  registration_number: 'RC-1928301',
  tax_identification_number: 'TIN-20938475-001',
  business_type: 'Supermarket / Retail Chain',
  email: 'operations@uduakiet.com',
  phone_number: '+234 803 123 4567',
  website: 'https://www.uduakiet.com',
  address_line_1: 'Plot 14, Commercial Avenue, Uyo Metropolis',
  address_line_2: 'Suite 204, Plaza Block B',
  city: 'Uyo',
  state: 'Akwa Ibom State',
  country: 'Nigeria',
  postal_code: '520211',
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  locale: 'en-NG',
  settings: {
    themeColor: '#06b6d4',
    enableNotifications: true,
    enableMultiBranch: true,
    lowStockThreshold: 10,
    enableReceiptQR: true,
    receiptFooterText:
      'Thank you for shopping at UduaKiet! One Market, Unlimited Possibilities.',
    defaultTaxRate: 7.5,
  },
};

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
        type === 'success'
          ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
          : type === 'error'
            ? 'bg-red-950/90 text-red-200 border-red-500/40'
            : 'bg-cyan-950/90 text-cyan-200 border-cyan-500/40'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
      )}
      <span className="text-xs font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
};

const GeneralInfoTab: React.FC<{
  formData: IBusiness;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
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
            value={formData.display_name}
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
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
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
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
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
        <div className="space-y-1.5">
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
        </div>
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
              value={formData.website}
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

const AddressTab: React.FC<{
  formData: IBusiness;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Physical Location & Outlet Address
            </h3>
            <p className="text-xs text-slate-400">
              Primary store address for dispatch, receipts, and localized tax
              rules.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">
            Street Address Line 1
          </label>
          <input
            type="text"
            name="address_line_1"
            value={formData.address_line_1}
            onChange={handleChange}
            placeholder="e.g. Plot 14 Commercial Avenue"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400">
            Address Line 2 (Suite, Floor, Building)
          </label>
          <input
            type="text"
            name="address_line_2"
            value={formData.address_line_2}
            onChange={handleChange}
            placeholder="e.g. Suite 204 Plaza Block B"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              City / Metropolis
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Uyo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              State / Region
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Akwa Ibom State"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            >
              <option value="Nigeria">Nigeria 🇳🇬</option>
              <option value="Ghana">Ghana 🇬🇭</option>
              <option value="Kenya">Kenya 🇰🇪</option>
              <option value="United Kingdom">United Kingdom 🇬🇧</option>
              <option value="United States">United States 🇺🇸</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">
              Postal Code / Zip
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="520211"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LocalizationTab: React.FC<{
  formData: IBusiness;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
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

const AdvancedTab: React.FC<{
  formData: IBusiness;
  handleNestedChange: (key: string, value: unknown) => void;
}> = ({ formData, handleNestedChange }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              System Automation & Branding Settings
            </h3>
            <p className="text-xs text-slate-400">
              Customize POS theme colors, stock threshold triggers, and receipt
              footers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Brand Theme Accent Picker */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Palette size={14} className="text-cyan-400" /> UI Brand Theme Color
          </label>
          <div className="flex items-center gap-3">
            {[
              { label: 'Cyan', hex: '#06b6d4' },
              { label: 'Emerald', hex: '#10b981' },
              { label: 'Indigo', hex: '#6366f1' },
              { label: 'Amber', hex: '#f59e0b' },
              { label: 'Rose', hex: '#f43f5e' },
            ].map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleNestedChange('themeColor', color.hex)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  formData.settings.themeColor === color.hex
                    ? 'ring-2 ring-white scale-110 shadow-lg'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {formData.settings.themeColor === color.hex && (
                  <Check size={16} className="text-slate-950 stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Branch Inventory Sync Toggle */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-white flex items-center gap-2">
              <Store size={14} className="text-cyan-400" /> Multi-Branch Live
              Syncing
            </p>
            <p className="text-[11px] text-slate-400">
              Automatically synchronize stock levels across central market
              warehouses and local store branches.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleNestedChange(
                'enableMultiBranch',
                !formData.settings.enableMultiBranch,
              )
            }
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              formData.settings.enableMultiBranch
                ? 'bg-cyan-500'
                : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                formData.settings.enableMultiBranch
                  ? 'translate-x-6'
                  : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Low Stock Alert Threshold */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400" /> Default Low
              Stock Threshold
            </label>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {formData.settings.lowStockThreshold} Units
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={formData.settings.lowStockThreshold}
            onChange={(e) =>
              handleNestedChange(
                'lowStockThreshold',
                parseInt(e.target.value, 10),
              )
            }
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            Triggers reorder notifications when item stock drops below this
            count.
          </p>
        </div>

        {/* Receipt Footer Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Receipt size={13} className="text-cyan-400" /> Customer POS Receipt
            Message
          </label>
          <input
            type="text"
            value={formData.settings.receiptFooterText}
            onChange={(e) =>
              handleNestedChange('receiptFooterText', e.target.value)
            }
            placeholder="Thank you for shopping with us!"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export const BusinessSettingsPage: React.FC<{
  initialBusiness?: IBusiness;
}> = ({ initialBusiness }) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'address' | 'localization' | 'advanced'
  >('general');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  // Initialize form state
  const [formData, setFormData] = useState<IBusiness>(
    initialBusiness || DEFAULT_BUSINESS,
  );
  const [initialDataState, setInitialDataState] = useState<IBusiness>(
    initialBusiness || DEFAULT_BUSINESS,
  );

  // Detect dirty state
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialDataState);
  }, [formData, initialDataState]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: `Copied ${label} to clipboard!`, type: 'info' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    setFormData(initialDataState);
    setToast({
      message: 'Reverted unsaved changes to original values.',
      type: 'info',
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate API response delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setInitialDataState(formData);
      setIsSaving(false);
      setToast({
        message: 'Business settings updated successfully!',
        type: 'success',
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.log('Error saving business settings:', err);
      setIsSaving(false);
      setToast({
        message: 'Failed to save business settings. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification Banner */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
              <span>UduaKiet Engine</span>
              <span>/</span>
              <span>Organization Config</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Business Profile Settings
              {isDirty && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your store identity, legal CAC registration, VAT details,
              regional currency, and POS defaults.
            </p>
          </div>

          {/* Save Action Controls */}
          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <RotateCcw size={14} /> Revert
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSaving || !isDirty}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                isSaving
                  ? 'bg-cyan-500/50 text-slate-950 cursor-wait'
                  : isDirty
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving
                  Changes...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Business Profile
                </>
              )}
            </button>
          </div>
        </header>

        {/* MAIN SETTINGS LAYOUT (TABS + POS RECEIPT PREVIEW CARD) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT CONTENT COLUMN (TABS & FORM) */}
          <div className="lg:col-span-2 space-y-6">
            {/* TAB NAVIGATION PILLS */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
              {[
                { id: 'general', label: 'General Info', icon: Building2 },
                { id: 'address', label: 'Store Address', icon: MapPin },
                { id: 'localization', label: 'Currency & Time', icon: Globe },
                { id: 'advanced', label: 'Branding & POS', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* FORM BODY CONTAINER */}
            <form
              onSubmit={handleSubmit}
              className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 shadow-xl"
            >
              {activeTab === 'general' && (
                <GeneralInfoTab
                  formData={formData}
                  handleChange={handleChange}
                  copyToClipboard={copyToClipboard}
                />
              )}
              {activeTab === 'address' && (
                <AddressTab formData={formData} handleChange={handleChange} />
              )}
              {activeTab === 'localization' && (
                <LocalizationTab
                  formData={formData}
                  handleChange={handleChange}
                />
              )}
              {activeTab === 'advanced' && (
                <AdvancedTab
                  formData={formData}
                  handleNestedChange={handleNestedChange}
                />
              )}
            </form>
          </div>

          {}
          {/* RIGHT SIDEBAR: LIVE RECEIPT / INVOICE PREVIEW CARD */}
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
                    U
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
                    <span>VAT ({formData.settings.defaultTaxRate}%)</span>
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
                    "{formData.settings.receiptFooterText}"
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
                  Edits made in the General, Location, and Branding tabs
                  immediately update customer POS invoices.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsPage;
