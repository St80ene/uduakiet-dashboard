import BaseModal from '@/common/BaseModal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  title?: string;
  itemName: string;
  warningText?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteConfirmModal({
  title = 'Delete Category',
  itemName,
  warningText = 'Products linked to this category may become unassigned.',
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm();
  };

  return (
    <BaseModal
      title={title}
      subtitle=""
      isSubmitting={isDeleting}
      submitLabel="Delete"
      submittingLabel="Deleting..."
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="flex items-start gap-3.5 pt-1 pb-2">
        <div className="p-2.5 rounded-full bg-rose-50 text-rose-600 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-800">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">"{itemName}"</span>?
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {warningText} This action cannot be undone.
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
