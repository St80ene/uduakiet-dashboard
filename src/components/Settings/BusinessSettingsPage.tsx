import React, { useState } from 'react';
import { Save, Building2, Globe, MapPin, Sliders } from 'lucide-react';
import { useAuth } from '@/services/auth/hooks/useAuth';
import type { IBusiness } from '@/interfaces/business.interface';

export const BusinessSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'address' | 'localization' | 'advanced'
  >('general');
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();

  const business: IBusiness = user?.business as IBusiness;

  // Mock initial state corresponding to Business entity fields
  const [formData, setFormData] = useState(
    business || {
      id: '',
      legal_name: '',
      display_name: '',
      slug: '',
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
        themeColor: '#06b6d4',
        enableNotifications: true,
      },
    },
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // API call to update Business entity
      await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Failed to update business settings', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-slate-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Settings</h1>
          <p className="text-sm text-slate-400">
            Manage legal identity, localization, and system configurations.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeTab === 'general'
                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Building2 size={16} />
            <span>General & Legal</span>
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeTab === 'address'
                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <MapPin size={16} />
            <span>Address</span>
          </button>
          <button
            onClick={() => setActiveTab('localization')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeTab === 'localization'
                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Globe size={16} />
            <span>Localization</span>
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
              activeTab === 'advanced'
                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Sliders size={16} />
            <span>Advanced Rules</span>
          </button>
        </div>

        {/* Settings Form Content Area */}
        <div className="col-span-9 bg-slate-900/40 border border-slate-800 rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Identity & Legal Parameters
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    name="legal_name"
                    value={formData.legal_name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Registration Number (RC Number)
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Tax Identification Number (TIN)
                  </label>
                  <input
                    type="text"
                    name="tax_identification_number"
                    value={formData.tax_identification_number || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Business Location
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_line_1"
                  value={formData.address_line_1 || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                Currency & Timezone
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Default Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">
                JSON Configuration Properties
              </h2>
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">
                    Enable Real-Time Alerts
                  </p>
                  <p className="text-xs text-slate-500">
                    Push notification tracking via BusinessSettingsEntity.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData?.settings?.enableNotifications}
                  onChange={(e) =>
                    handleNestedChange('enableNotifications', e.target.checked)
                  }
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
