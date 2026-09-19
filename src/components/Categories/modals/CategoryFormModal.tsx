import React, { useState, type Dispatch, type SetStateAction } from 'react';

import type {
  CategoryFormData,
  ICategory,
} from '@/interfaces/category.interface';
import BaseModal from '@/common/BaseModal';

interface CategoryFormModalProps {
  category?: ICategory | null;
  isSubmitting: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: (formData: CategoryFormData) => void | Promise<void>;
}

export function CategoryFormModal({
  category,
  isSubmitting,
  setIsModalOpen,
  onSubmit,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);

  // Form state initialized directly from props (removes useEffect synchronization)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
  });

  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <BaseModal
      title={
        isEditing ? `Edit ${category?.name || 'Category'}` : 'Create Category'
      }
      subtitle={
        isEditing
          ? 'Update category details and metadata.'
          : 'Add a new category to group inventory products.'
      }
      error={error}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Save Changes' : 'Create Category'}
      submittingLabel={isEditing ? 'Saving Changes...' : 'Creating Category...'}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
    >
      {/* Category Name */}
      <div>
        <label
          htmlFor="cat-name"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Category Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          name="name"
          maxLength={100}
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. Hardware & Machinery"
          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden transition-all ${
            fieldErrors.name
              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
              : 'border-slate-200 focus:border-blue-500 focus:bg-white'
          }`}
        />
        {fieldErrors.name && (
          <p className="text-[11px] text-rose-600 mt-1 font-medium">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="cat-desc"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Description{' '}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="cat-desc"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Optional context about what belongs in this category..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all resize-none"
        />
      </div>
    </BaseModal>
  );
}
