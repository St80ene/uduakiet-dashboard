import type { IBusiness } from '@/interfaces/business.interface';
import { MapPin } from 'lucide-react';
import type { FC } from 'react';

const AddressTab: FC<{
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
            value={formData.address_line_1 || ''}
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

export default AddressTab;
