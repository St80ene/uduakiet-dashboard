import React, { useState, useMemo, type FC } from 'react';
import {
  Save,
  Building2,
  Globe,
  MapPin,
  Sliders,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import AdvancedTab from './AdvancedTab';
import type { IBusiness } from '@/interfaces/business.interface';
import Toast from '../../../common/Toast';
import GeneralInfoTab from './GeneralInfoTab';
import AddressTab from './AddressTab';
import LocalizationTab from './LocalizationTab';
import PosReceipt from './PosReceipt';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '@/services/business.service.api';
import { useAuth } from '@/services/auth/hooks/useAuth';
import { getFieldDiffs } from '@/common/utils';

// Default initial state
const DEFAULT_BUSINESS: IBusiness = {
  legal_name: '',
  display_name: '',
  registration_number: '',
  tax_identification_number: '',
  business_type: '',
  email: '',
  phone_number: '',
  website: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  currency: '',
  timezone: '',
  locale: '',
  settings: {
    themeColor: '',
    enableNotifications: false,
    enableMultiBranch: false,
    lowStockThreshold: 10,
    enableReceiptQR: true,
    receiptFooterText: '',
    defaultTaxRate: 7.5,
  },
};

export const Settings: FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'general' | 'address' | 'localization' | 'advanced'
  >('general');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const { getBusinessByID, updateBusiness } = businessService;

  const { data } = useQuery<IBusiness>({
    queryKey: ['business'],
    queryFn: () => getBusinessByID(user?.business_id ?? ''),
    placeholderData: (previousData) => previousData,
  });

  // Initialize form state
  const [initialDataState, setInitialDataState] = useState<IBusiness>(
    data || DEFAULT_BUSINESS,
  );
  const [formData, setFormData] = useState<IBusiness>(data || DEFAULT_BUSINESS);

  // Detect differences in state
  const isDifferent = useMemo(() => {
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
      if (user && user.business_id) {
        // get differences
        const diff = getFieldDiffs(initialDataState, formData);

        // const payload = new FormData();

        const response = await updateBusiness(user.business_id, diff);
        setInitialDataState(response.data);
        setFormData(response.data);
        setIsSaving(false);
        setToast({
          message: 'Business settings updated successfully!',
          type: 'success',
        });
        setTimeout(() => setToast(null), 3500);
      } else {
        setToast({
          message: 'Failed to save business settings. Please try again.',
          type: 'error',
        });
      }
    } catch (err) {
      console.log('Error saving business settings:', err);
      setIsSaving(false);
      setToast({
        message: 'Failed to save business settings. Please try again.',
        type: 'error',
      });
    }
  };

  const settingTabOptions = useMemo(() => {
    return [
      { id: 'general', label: 'General Info', icon: Building2 },
      { id: 'address', label: 'Store Address', icon: MapPin },
      { id: 'localization', label: 'Currency & Time', icon: Globe },
      { id: 'advanced', label: 'Branding & POS', icon: Sliders },
    ];
  }, []);

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
              {isDifferent && (
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
            {isDifferent && (
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
              disabled={isSaving || !isDifferent}
              className={`px-5 py-2.5 cursor-pointer rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                isSaving
                  ? 'bg-cyan-500/50 text-slate-950 cursor-wait'
                  : isDifferent
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
              {settingTabOptions.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 cursor-pointer min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
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
          <PosReceipt formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
