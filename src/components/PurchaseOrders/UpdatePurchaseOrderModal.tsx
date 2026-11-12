import React, { useEffect, useState } from 'react';
import { FileText, X, Plus, Trash2, Loader2, Boxes } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IProduct } from '@/interfaces/products';
import { PurchaseOrderStatus } from '@/enum/purchase_order.enum';
import {
  getPurchaseOrderByID,
  updatePurchaseOrder,
} from '@/services/purchase_orders.service.api';

interface PoItemFormState {
  product_id: string;
  quantity_requested: number;
}

interface UpdatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId: string;
  products: IProduct[];
}

export const UpdatePurchaseOrderModal: React.FC<
  UpdatePurchaseOrderModalProps
> = ({ isOpen, onClose, purchaseOrderId, products }) => {
  const queryClient = useQueryClient();

  const [items, setItems] = useState<PoItemFormState[]>([]);

  const {
    data: purchaseOrder,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['purchase_order', purchaseOrderId],
    queryFn: () => getPurchaseOrderByID(purchaseOrderId),
    enabled: Boolean(purchaseOrderId) && isOpen,
  });

  // Populate the form when the purchase order is fetched.
  useEffect(() => {
    function populateForm() {
      if (purchaseOrder && isOpen) {
        console.log(
          'Populating form with purchase order items:',
          purchaseOrder.items,
        );
        setItems(
          purchaseOrder.items.map((item) => ({
            product_id: item.product_id,
            quantity_requested: item.quantity_requested,
          })),
        );
      }
    }

    populateForm();
  }, [purchaseOrder, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (payload: { items: PoItemFormState[] }) =>
      updatePurchaseOrder(purchaseOrderId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({
        queryKey: ['purchase_order', purchaseOrderId],
      });
      onClose();
    },
  });

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_id: '', quantity_requested: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PoItemFormState,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productIds = items.map((item) => item.product_id);

    if (
      items.length === 0 ||
      items.some(
        (item) =>
          !item.product_id ||
          !Number.isInteger(Number(item.quantity_requested)) ||
          Number(item.quantity_requested) < 1,
      )
    ) {
      return;
    }

    if (new Set(productIds).size !== productIds.length) {
      return;
    }

    updateMutation.mutate({
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity_requested: Number(item.quantity_requested),
      })),
    });
  };

  if (!isOpen) return null;

  const isDraft = purchaseOrder?.status === PurchaseOrderStatus.DRAFT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText size={16} className="text-cyan-600" />
            Edit Purchase Order
            {purchaseOrder && ` (${purchaseOrder.po_number})`}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 size={24} className="animate-spin text-cyan-600" />
            <p className="text-xs text-slate-500 font-medium">
              Loading purchase order...
            </p>
          </div>
        ) : isError || !purchaseOrder ? (
          <div className="text-center py-12 text-red-500 text-xs">
            Failed to load purchase order details. Please try again.
          </div>
        ) : !isDraft ? (
          <div className="text-center py-12 px-5">
            <p className="text-sm font-semibold text-slate-800">
              This purchase order cannot be edited.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Only draft purchase orders can be modified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Boxes size={14} className="text-cyan-600" />
                Purchase Order Items
              </h3>

              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 bg-cyan-50 hover:bg-cyan-100/60 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                No items added. Click "Add Item" to get started.
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg"
                  >
                    <div className="flex-1 w-full">
                      <select
                        required
                        value={item.product_id}
                        onChange={(e) =>
                          handleItemChange(index, 'product_id', e.target.value)
                        }
                        className="w-full cursor-pointer bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500"
                      >
                        <option value="">Select Product...</option>

                        {products.map((product: IProduct) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-32">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        placeholder="Quantity"
                        value={item.quantity_requested}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'quantity_requested',
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer self-end sm:self-center"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {updateMutation.isError && (
              <p className="text-xs text-red-500">
                Failed to update purchase order. Please try again.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 cursor-pointer text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updateMutation.isPending || items.length === 0}
                className="flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50 shadow-2xs"
              >
                {updateMutation.isPending && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdatePurchaseOrderModal;
