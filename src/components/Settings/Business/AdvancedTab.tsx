import type { IBusiness } from '@/interfaces/business.interface';
import {
  AlertCircle,
  Check,
  Palette,
  Receipt,
  Sliders,
  Store,
} from 'lucide-react';
import type { FC } from 'react';

const color_palette = [
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Rose', hex: '#f43f5e' },
];

const AdvancedTab: FC<{
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
            {color_palette.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => handleNestedChange('themeColor', color.hex)}
                className={`w-9 h-9 cursor-pointer rounded-xl flex items-center justify-center transition-all ${
                  formData.settings?.themeColor === color.hex
                    ? 'ring-2 ring-white scale-110 shadow-lg'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {formData.settings?.themeColor === color.hex && (
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
                !formData?.settings?.enableMultiBranch,
              )
            }
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              formData?.settings?.enableMultiBranch
                ? 'bg-cyan-500'
                : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${
                formData.settings?.enableMultiBranch
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
              {formData.settings?.lowStockThreshold} Units
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={formData.settings?.lowStockThreshold}
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
            value={formData.settings?.receiptFooterText}
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

export default AdvancedTab;
