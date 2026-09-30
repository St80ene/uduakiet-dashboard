import { useForm } from 'react-hook-form';
import { X, Truck, Info, Mail, Phone } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ISupplier } from '@/interfaces/supplier';
import { useCreateSupplier } from '@/hooks/useSuppliers.hook';

interface CreateSupplierModalProps {
  onClose: () => void;
}

export const CreateSupplierModal = ({ onClose }: CreateSupplierModalProps) => {
  const { mutate, isPending, error } = useCreateSupplier();
  
  const handleCreateSubmit = (
    data: Omit<
      ISupplier,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'productSourcesCount'
      | 'purchaseOrdersCount'
      | 'business_id'
    >,
  ) => {
    mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone_number: '',
      email: '',
    },
  });

  const errorMessage = (error as AxiosError<{ message: string | string[] }>)
    ?.response?.data?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Add New Supplier
              </h2>
              <p className="text-xs text-slate-500">
                Register a new vendor or procurement channel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg p-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleCreateSubmit)}
          className="p-6 space-y-5"
        >
          {/* API Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs text-red-700 bg-red-50 border border-red-200/60 rounded-xl animate-in slide-in-from-top-1 duration-150">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>
                {Array.isArray(errorMessage)
                  ? errorMessage.join(', ')
                  : errorMessage}
              </span>
            </div>
          )}

          {/* Supplier Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Supplier Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Supplier name is required' })}
              type="text"
              placeholder="e.g. Global Freight & Logistics Ltd"
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('phone_number', {
                  required: 'Phone number is required',
                  maxLength: {
                    value: 20,
                    message: 'Phone number cannot exceed 20 characters',
                  },
                })}
                type="tel"
                placeholder="e.g. +2348012345678"
                className="w-full px-3.5 py-2.5 pl-10 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.phone_number && (
              <p className="text-xs text-red-600 mt-1">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* Contact Email (Nullable) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Contact Email{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="e.g. orders@globalfreight.com"
                className="w-full px-3.5 py-2.5 pl-10 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-medium bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isPending ? 'Saving supplier...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
