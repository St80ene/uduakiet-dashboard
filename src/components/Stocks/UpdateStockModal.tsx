import { useForm } from 'react-hook-form';
import { X, RefreshCw, Info } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { IStock, IUpdateStockPayload } from '@/interfaces/stock.interface';
import { getFieldDiffs } from '@/common/utils'; // Adjust import path as needed

interface UpdateStockModalProps {
  stock: IStock;
  onClose: () => void;
  onSubmit: (data: IUpdateStockPayload) => void;
  isPending: boolean;
  error: unknown;
}

export const UpdateStockModal = ({
  stock,
  onClose,
  onSubmit,
  isPending,
  error,
}: UpdateStockModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IUpdateStockPayload>({
    defaultValues: {
      product_id: stock.product_id,
      physical_quantity: stock.current_quantity,
      reason: '',
    },
  });

  const handleFormSubmit = (data: IUpdateStockPayload) => {
    const originalState = {
      physical_quantity: stock.current_quantity,
      reason: '',
    };

    const currentState = {
      physical_quantity: Number(data.physical_quantity) || 0,
      reason: data.reason,
    };

    const changes = getFieldDiffs(originalState, currentState);

    // If nothing changed, close the modal or notify the user
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    onSubmit({
      product_id: stock.product_id,
      ...changes,
    } as IUpdateStockPayload);
  };

  // Safely extract error message from Axios response
  const errorMessage = (error as AxiosError<{ message: string | string[] }>)
    ?.response?.data?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Update Stock Balance
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {stock.product?.name || 'Product Stock Adjustment'}
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
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
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

          {/* Physical Quantity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Physical Quantity (New Total){' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register('physical_quantity', {
                required: 'Physical quantity is required',
                min: { value: 0, message: 'Quantity cannot be negative' },
              })}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  setValue('physical_quantity', '' as unknown as number);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setValue('physical_quantity', 0);
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
            />
            {errors.physical_quantity && (
              <p className="text-xs text-red-600 mt-1">
                {errors.physical_quantity.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Reason for Adjustment <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason', {
                required:
                  'Please specify a reason for this stock count adjustment',
              })}
              rows={3}
              placeholder="e.g. Physical inventory count discrepancy, damage, etc."
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none placeholder:text-slate-400"
            />
            {errors.reason && (
              <p className="text-xs text-red-600 mt-1">
                {errors.reason.message}
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
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isPending && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isPending ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
