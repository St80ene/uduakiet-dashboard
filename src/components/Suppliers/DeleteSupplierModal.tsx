import { useDeleteSupplier } from '@/hooks/useSuppliers.hook';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface DeleteSupplierModalProps {
  supplier: {
    id: string;
    name: string;
    purchaseOrdersCount: number;
  };
  onClose: () => void;
}
export const DeleteSupplierModal = ({
  supplier,
  onClose,
}: DeleteSupplierModalProps) => {
  const { isPending, mutate } = useDeleteSupplier();

  const handleDeleteSubmit = () => {
    mutate(supplier.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Delete Supplier</h3>
          <p className="mt-1 text-sm text-slate-500">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-700">
              {supplier.name}
            </span>
            ? This action cannot be undone.
          </p>
          {supplier.purchaseOrdersCount && supplier.purchaseOrdersCount > 0 ? (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Warning: This supplier is linked to{' '}
                {supplier.purchaseOrdersCount} active purchase order(s).
                Deletion might fail or affect records.
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteSubmit}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition-colors min-w-24"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
