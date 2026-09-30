import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  X,
  PackagePlus,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { type ICreateStockPayload } from '@/interfaces/stock.interface';
import { getAllProducts } from '@/services/products.service.api';
import type { IProduct } from '@/interfaces/products';
import { formatCurrency } from '@/common/utils';
import {
  StockMovementDirection,
  StockMovementType,
} from '@/enum/stock_movement.enum';

export const CreateStockModal = ({
  onClose,
  onSubmit,
  isPending,
  error,
}: {
  onClose: () => void;
  onSubmit: (data: ICreateStockPayload) => void;
  isPending: boolean;
  error: unknown;
}) => {
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => getAllProducts({ page: 1, limit: 100 }),
  });

  const products = useMemo(() => productsData?.products || [], [productsData]);

  const { register, handleSubmit, control, setValue } =
    useForm<ICreateStockPayload>({
      defaultValues: {
        product_id: '',
        movement_type: StockMovementType.RECEIPT,
        direction: StockMovementDirection.IN,
        initial_quantity: 0,
        unit_cost_price: 0,
        unit_selling_price: 0,
        reason: '',
      },
    });

  // Watch fields for dynamic updates and preview values
  const selectedProductId = useWatch({ control, name: 'product_id' });
  const unitCostPrice = useWatch({ control, name: 'unit_cost_price' });
  const unitSellingPrice = useWatch({ control, name: 'unit_selling_price' });

  useEffect(() => {
    const selectedProduct = products.find(
      (product) => String(product.id) === selectedProductId,
    );

    if (selectedProduct) {
      setValue('unit_cost_price', Number(selectedProduct.cost_price) || 0);
      setValue(
        'unit_selling_price',
        Number(selectedProduct.selling_price) || 0,
      );
    } else {
      setValue('unit_cost_price', 0);
      setValue('unit_selling_price', 0);
    }
  }, [selectedProductId, products, setValue]);

  // Extract error message safely from Axios error response structure
  const errorMessage = (error as AxiosError<{ message: string | string[] }>)
    ?.response?.data?.message;

  // Safe submit wrapper ensuring numbers are cleanly parsed without throwing UI errors
  const handleFormSubmit = (data: ICreateStockPayload) => {
    onSubmit({
      ...data,
      initial_quantity: Number(data.initial_quantity) || 0,
      unit_cost_price: Number(data.unit_cost_price) || 0,
      unit_selling_price: Number(data.unit_selling_price) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Initialize New Stock
              </h2>
              <p className="text-xs text-slate-500">
                Record a new inventory batch entry or adjustment.
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

          {/* Product Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              {...register('product_id', { required: true })}
              disabled={isLoadingProducts}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
            >
              <option value="">
                {isLoadingProducts
                  ? 'Loading products...'
                  : '-- Choose a product --'}
              </option>
              {products.map((product: IProduct) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-populated Price Preview Badge */}
          {selectedProductId && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block font-medium">
                  Auto Cost Price
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  ₦{formatCurrency(unitCostPrice || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">
                  Auto Selling Price
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  ₦{formatCurrency(unitSellingPrice || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Movement & Direction Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Movement Type
              </label>
              <div className="relative">
                <select
                  {...register('movement_type')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs appearance-none"
                >
                  {Object.values(StockMovementType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <ArrowUpRight className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Direction
              </label>
              <div className="relative">
                <select
                  {...register('direction')}
                  className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs appearance-none"
                >
                  {Object.values(StockMovementDirection).map((direction) => (
                    <option key={direction} value={direction}>
                      {direction.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <ArrowDownRight className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Initial Quantity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Initial Quantity <span className="text-red-500">*</span>
            </label>
            <input
              {...register('initial_quantity')}
              type="number"
              step="0.01"
              required
              onFocus={(e) => {
                if (e.target.value === '0') {
                  setValue('initial_quantity', '' as unknown as number);
                }
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setValue('initial_quantity', 0);
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Reason{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register('reason')}
              rows={2}
              placeholder="e.g. Initial stock count, Restocking shipment..."
              className="w-full px-3.5 py-2.5 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs resize-none placeholder:text-slate-400"
            />
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
              {isPending ? 'Saving stock...' : 'Save Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
