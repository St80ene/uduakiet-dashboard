import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Trash2,
  Loader2,
  X,
  Package,
  ShoppingCart,
  FileText,
  AlertCircle,
} from 'lucide-react';
import type { IProductsWithMeta } from '@/interfaces/products';
import type {
  CreatePoItemDto,
  ICreatePurchaseOrderFormData,
} from '@/interfaces/purchase_order.interface';

import { getAllProducts } from '@/services/products.service.api';

interface IPurchaseOrderModalProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: (data: ICreatePurchaseOrderFormData) => void;
  isSubmitting: boolean;
}

interface IItemDraft {
  product_id: string;
  quantity_requested: string;
}

const PRODUCT_PAGE_SIZE = 15;

const INITIAL_ITEM_DRAFT: IItemDraft = {
  product_id: '',
  quantity_requested: '',
};

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50';

const labelClass =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500';

export default function AddPurchaseOrderModal({
  setIsModalOpen,
  isSubmitting,
  onSubmit,
}: IPurchaseOrderModalProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [itemDraft, setItemDraft] = useState<IItemDraft>(INITIAL_ITEM_DRAFT);
  const [itemError, setItemError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Map());

  // Debounce product catalog search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ICreatePurchaseOrderFormData>({
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({
    control,
    name: 'items',
  });

  // Fetch paginated & filtered products from backend API
  const {
    data: productResponse,
    isLoading: isLoadingProducts,
    isFetching: isFetchingProducts,
    isError: isProductError,
  } = useQuery<IProductsWithMeta>({
    queryKey: ['products_list', debouncedSearch, page],
    queryFn: () =>
      getAllProducts({
        search: debouncedSearch,
        page,
        limit: PRODUCT_PAGE_SIZE,
      }),
  });

  const products = productResponse?.products ?? [];
  const pagination = productResponse?.meta;

  const addedProductIds = useMemo(
    () => new Set(fields.map((item) => item.product_id)),
    [fields],
  );

  const availableProducts = products.filter(
    (product) => !addedProductIds.has(product.id),
  );

  const selectedProduct = products.find(
    (product) => product.id === itemDraft.product_id,
  );

  const quantity = Number(itemDraft.quantity_requested);

  const handleAddItem = () => {
    setItemError('');

    if (!itemDraft.product_id) {
      setItemError('Please select a product from your catalog.');
      return;
    }

    if (addedProductIds.has(itemDraft.product_id)) {
      setItemError('This product is already included in the purchase order.');
      return;
    }

    if (!selectedProduct) {
      setItemError('Selected product record could not be resolved.');
      return;
    }

    if (
      !itemDraft.quantity_requested ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setItemError('Specify a valid quantity greater than zero.');
      return;
    }

    setSelectedProducts((previous) => {
      const updated = new Map(previous);
      updated.set(selectedProduct.id, selectedProduct);
      return updated;
    });

    append({
      product_id: selectedProduct.id,
      quantity_requested: quantity,
    } as CreatePoItemDto);

    setItemDraft(INITIAL_ITEM_DRAFT);
  };

  const handleRemoveItem = (index: number) => {
    const productId = fields[index].product_id;
    remove(index);
    setSelectedProducts((previous) => {
      const updated = new Map(previous);
      updated.delete(productId);
      return updated;
    });
  };

  const handleFormSubmit = async (data: ICreatePurchaseOrderFormData) => {
    if (!data.items.length) {
      setItemError(
        'Add at least one line item to generate the purchase order.',
      );
      return;
    }

    await onSubmit(data);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    if (isSubmitting) {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-order-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2
                id="purchase-order-title"
                className="text-base font-bold text-gray-900"
              >
                New Purchase Order
              </h2>
              <p className="text-xs text-gray-500">
                Draft procurement requirements. Unit costs will be calculated
                upon submission.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-200/60 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* Product Catalog Search & Builder */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Select Products
                  </h3>
                  <p className="text-xs text-gray-500">
                    Search catalog inventory to attach items to this order.
                  </p>
                </div>
                {isFetchingProducts && !isLoadingProducts && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <Loader2 size={12} className="animate-spin" /> Updating
                    search...
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setItemDraft((prev) => ({ ...prev, product_id: '' }));
                  }}
                  placeholder="Search catalog by product name or SKU..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              {/* Product Selector & Quantity Row */}
              <div className="grid gap-4 sm:grid-cols-12 items-end">
                <div className="sm:col-span-8">
                  <label className={labelClass}>
                    Product Catalog <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={itemDraft.product_id}
                    onChange={(e) => {
                      setItemDraft((prev) => ({
                        ...prev,
                        product_id: e.target.value,
                      }));
                      setItemError('');
                    }}
                    disabled={isLoadingProducts || isProductError}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="">
                      {isLoadingProducts
                        ? 'Loading inventory...'
                        : '-- Choose product item --'}
                    </option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku}) —{' '}
                        {product.uom_display_name || 'Units'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className={labelClass}>
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={itemDraft.quantity_requested}
                    onChange={(e) =>
                      setItemDraft((prev) => ({
                        ...prev,
                        quantity_requested: e.target.value,
                      }))
                    }
                    placeholder="Enter qty"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    title="Add item"
                    className="flex h-[42px] w-full items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 cursor-pointer"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Catalog Error Feedback */}
              {isProductError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-100">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <span>
                    Unable to retrieve product inventory. Please verify your
                    connection or search query.
                  </span>
                </div>
              )}

              {/* Selected Product Live Preview Card */}
              {selectedProduct && (
                <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-100 px-3.5 py-2.5 text-xs text-blue-900">
                  <div className="flex items-center gap-2 font-medium">
                    <Package size={15} className="text-blue-600" />
                    <span>{selectedProduct.name}</span>
                    <span className="text-blue-500 font-mono">
                      SKU: {selectedProduct.sku}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    Unit: {selectedProduct.uom_display_name}
                  </span>
                </div>
              )}

              {/* Validation Feedback */}
              {itemError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-100">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <span>{itemError}</span>
                </div>
              )}

              {/* Catalog Pagination Controller */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span>
                    Page {page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || isFetchingProducts}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={
                        page >= pagination.totalPages || isFetchingProducts
                      }
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Attached Order Items Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-1">
                Attached Line Items ({fields.length})
              </h3>

              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 mb-3">
                    <FileText size={22} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    No items added to order yet
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Search and select items above to build your order.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-semibold">
                          Product Name & SKU
                        </th>
                        <th className="px-4 py-3 font-semibold">
                          Quantity Requested
                        </th>
                        <th className="px-4 py-3 font-semibold text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {fields.map((field, index) => {
                        const product = selectedProducts.get(field.product_id);
                        const item = watchedItems?.[index];
                        const qty = Number(item?.quantity_requested ?? 0);

                        return (
                          <tr
                            key={field.id}
                            className="transition hover:bg-blue-50/20"
                          >
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-800">
                                {product?.name ?? 'Catalog Item'}
                              </p>
                              <span className="text-xs text-gray-400 font-mono">
                                SKU: {product?.sku ?? 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {qty}{' '}
                              <span className="text-xs text-gray-400 font-normal">
                                {product?.uom_display_name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                aria-label="Remove item"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {errors.items && (
              <p className="text-xs font-semibold text-red-600 px-1">
                {errors.items.message ||
                  'Please ensure at least one valid item is attached.'}
              </p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-4">
            <span className="text-xs text-gray-500 font-medium">
              Pricing calculated securely on backend server.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || fields.length === 0}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Creating Order...' : 'Create Purchase Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
