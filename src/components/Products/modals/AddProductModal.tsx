import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import { UomBaseName, UomDisplayName, UomType } from '@/enum/product';
import { categoryService } from '@/services/categories.service.api';
import type { ICategory } from '@/interfaces/category.interface';
import BaseModal from '@/common/BaseModal';
import type {
  IAddProductModalProps,
  ICreateProductFormData,
} from '@/interfaces/products';

const MAX_IMAGES = 5;

const UOM_CONFIG: Record<
  UomType,
  {
    defaultBase: UomBaseName;
    allowedDisplay: UomDisplayName[];
  }
> = {
  [UomType.UNIT]: {
    defaultBase: UomBaseName.PCS,
    allowedDisplay: [UomDisplayName.PCS],
  },

  [UomType.WEIGHT]: {
    defaultBase: UomBaseName.G,
    allowedDisplay: [UomDisplayName.G, UomDisplayName.KG],
  },

  [UomType.VOLUME]: {
    defaultBase: UomBaseName.ML,
    allowedDisplay: [UomDisplayName.ML, UomDisplayName.L],
  },
};

export default function AddProductModal({
  isSubmitting,
  setIsModalOpen,
  onSubmit,
}: IAddProductModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () =>
      categoryService.getAllCategories({
        page: 1,
        limit: 100,
      }),
  });

  const categories = categoriesData?.categories || [];

  const [formData, setFormData] = useState<ICreateProductFormData>({
    name: '',
    description: '',
    category_id: '',
    cost_price: '0.00',
    selling_price: '0.00',
    uom_type: UomType.UNIT,
    uom_base_name: UomBaseName.PCS,
    uom_display_name: UomDisplayName.PCS,
    images: [],
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const previews = useMemo(() => {
    return formData.images.map((file) => URL.createObjectURL(file));
  }, [formData.images]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    if (name === 'uom_type') {
      const newUomType = value as UomType;
      const config = UOM_CONFIG[newUomType];

      setFormData((prev) => ({
        ...prev,
        uom_type: newUomType,
        uom_base_name: config.defaultBase,
        uom_display_name: config.allowedDisplay[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);
    const availableSlots = MAX_IMAGES - formData.images.length;

    if (availableSlots <= 0) return;

    const filesToAdd = selectedFiles.slice(0, availableSlots);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...filesToAdd],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.selling_price || Number(formData.selling_price) <= 0) {
      errors.selling_price = 'Valid selling price required';
    }

    if (formData.cost_price && Number(formData.cost_price) < 0) {
      errors.cost_price = 'Cost price cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const submitPayload = new FormData();

    submitPayload.append('name', formData.name.trim());

    if (formData.description.trim()) {
      submitPayload.append('description', formData.description.trim());
    }

    if (formData.category_id) {
      submitPayload.append('category_id', formData.category_id);
    }

    submitPayload.append('cost_price', formData.cost_price);

    submitPayload.append('selling_price', formData.selling_price);

    submitPayload.append('uom_type', formData.uom_type);

    submitPayload.append('uom_base_name', formData.uom_base_name);

    submitPayload.append('uom_display_name', formData.uom_display_name);

    formData.images.forEach((file) => {
      submitPayload.append('images', file);
    });

    onSubmit(submitPayload);
  };

  return (
    <BaseModal
      title="Add Product"
      subtitle="Register a new product for your business."
      error={error}
      isSubmitting={isSubmitting}
      submitLabel="Create Product"
      submittingLabel="Creating Product..."
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
    >
      {/* Product Name & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Product Name <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            name="name"
            maxLength={150}
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Premium Coffee Beans"
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category{' '}
            <span className="text-slate-400 font-normal">(Optional)</span>
          </label>

          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            disabled={isLoadingCategories || isSubmitting}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="">Select a Category...</option>

            {categories.map((category: ICategory) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Description{' '}
          <span className="text-slate-400 font-normal">(Optional)</span>
        </label>

        <textarea
          name="description"
          rows={2}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Brief product notes or specification..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all resize-none"
        />
      </div>

      {/* Product Images */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Product Images
          </label>

          <span className="text-[10px] text-slate-400">
            {formData.images.length}/{MAX_IMAGES}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          disabled={isSubmitting || formData.images.length >= MAX_IMAGES}
          className="hidden"
        />

        <button
          type="button"
          disabled={isSubmitting || formData.images.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="text-xl mb-1">📷</div>

          <p className="text-xs font-medium text-slate-700">
            Click to upload images
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            JPG, PNG or WebP · Max 5MB each
          </p>
        </button>

        {previews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {previews.map((preview, index) => (
              <div
                key={`${preview}-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
              >
                <img
                  src={preview}
                  alt={`Product preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={isSubmitting}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit of Measure */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            UOM Type
          </label>

          <select
            name="uom_type"
            value={formData.uom_type}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value={UomType.UNIT}>UNIT</option>

            <option value={UomType.WEIGHT}>WEIGHT</option>

            <option value={UomType.VOLUME}>VOLUME</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Base Unit
          </label>

          <input
            type="text"
            readOnly
            value={formData.uom_base_name.toLocaleUpperCase()}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 cursor-not-allowed font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Display Unit
          </label>

          <input
            type="text"
            readOnly
            value={formData.uom_display_name.toLocaleUpperCase()}
            className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 cursor-not-allowed font-mono"
          />
        </div>
      </div>

      {/* Cost & Selling Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Cost Price (₦)
          </label>

          <input
            type="number"
            name="cost_price"
            step="0.01"
            min="0"
            value={formData.cost_price}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden transition-all ${
              fieldErrors.cost_price
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:bg-white'
            }`}
          />

          {fieldErrors.cost_price && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">
              {fieldErrors.cost_price}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Selling Price (₦) <span className="text-rose-500">*</span>
          </label>

          <input
            type="number"
            name="selling_price"
            step="0.01"
            min="0"
            value={formData.selling_price}
            onChange={handleInputChange}
            placeholder="0.00"
            className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden transition-all ${
              fieldErrors.selling_price
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                : 'border-slate-200 focus:border-blue-500 focus:bg-white'
            }`}
          />

          {fieldErrors.selling_price && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">
              {fieldErrors.selling_price}
            </p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
