import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  ProductStatus,
  UomBaseName,
  UomDisplayName,
  UomType,
} from '@/enum/product';
import type { ICategory } from '@/interfaces/category.interface';
import { categoryService } from '@/services/categories.service.api';
import type { IProduct } from '@/interfaces/products';
import type { ICloudinaryImage } from '@/interfaces/cloudImage';
import BaseModal from '@/common/BaseModal';

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

interface EditProductModalProps {
  product: IProduct;
  isSubmitting: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}

export default function EditProductModal({
  product,
  isSubmitting,
  setIsModalOpen,
  onSubmit,
}: EditProductModalProps) {
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

  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    category_id: product.category_id || product.category?.id || '',
    cost_price: String(product.cost_price ?? '0.00'),
    selling_price: String(product.selling_price ?? '0.00'),
    uom_type: product.uom_type,
    uom_base_name: product.uom_base_name,
    uom_display_name: product.uom_display_name,
    status: product.status,
  });

  const [existingImages, setExistingImages] = useState<ICloudinaryImage[]>(
    product.images || [],
  );

  const [newImages, setNewImages] = useState<File[]>([]);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const newPreviews = useMemo(() => {
    return newImages.map((file) => URL.createObjectURL(file));
  }, [newImages]);

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const totalImageCount = existingImages.length + newImages.length;

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

    const availableSlots = MAX_IMAGES - totalImageCount;

    if (availableSlots <= 0) return;

    const filesToAdd = selectedFiles.slice(0, availableSlots);

    setNewImages((prev) => [...prev, ...filesToAdd]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
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

    const appendIfChanged = (
      key: string,
      newValue: string,
      originalValue: unknown,
    ) => {
      const trimmedNew = newValue.trim();
      const trimmedOriginal = String(originalValue ?? '').trim();

      if (trimmedNew !== trimmedOriginal) {
        submitPayload.append(key, trimmedNew);
      }
    };

    appendIfChanged('name', formData.name, product.name);

    appendIfChanged('description', formData.description, product.description);

    appendIfChanged(
      'category_id',
      formData.category_id,
      product.category_id || product.category?.id,
    );

    appendIfChanged('cost_price', formData.cost_price, product.cost_price);

    appendIfChanged(
      'selling_price',
      formData.selling_price,
      product.selling_price,
    );

    appendIfChanged('uom_type', formData.uom_type, product.uom_type);

    appendIfChanged(
      'uom_base_name',
      formData.uom_base_name,
      product.uom_base_name,
    );

    appendIfChanged(
      'uom_display_name',
      formData.uom_display_name,
      product.uom_display_name,
    );

    appendIfChanged('status', formData.status, product.status);

    /*
     * New images are uploaded as binary files.
     * Existing images are kept unless removed.
     */
    newImages.forEach((file) => {
      submitPayload.append('images', file);
    });

    /*
     * Send the remaining existing image URLs so
     * the backend can determine which saved images
     * were removed.
     */
    const originalImageUrls = (product.images || []).map((image) => image.url);

    const remainingImageUrls = existingImages.map((image) => image.url);

    const imagesChanged =
      JSON.stringify(remainingImageUrls) !== JSON.stringify(originalImageUrls);

    if (imagesChanged) {
      submitPayload.append(
        'existing_images',
        JSON.stringify(remainingImageUrls),
      );
    }

    onSubmit(submitPayload);
  };

  return (
    <BaseModal
      title={`Edit ${product.name || 'Product'}`}
      subtitle="Update product details, pricing, and images."
      error={error}
      isSubmitting={isSubmitting}
      submitLabel="Update Product"
      submittingLabel="Updating Product..."
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
            {totalImageCount}/{MAX_IMAGES}
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          disabled={isSubmitting || totalImageCount >= MAX_IMAGES}
          className="hidden"
        />

        <button
          type="button"
          disabled={isSubmitting || totalImageCount >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="text-lg mb-0.5">📷</div>

          <p className="text-xs font-medium text-slate-700">
            Click to upload new images
          </p>

          <p className="text-[10px] text-slate-400 mt-0.5">
            JPG, PNG or WebP · Max 5MB each
          </p>
        </button>

        {totalImageCount > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {/* Existing Images */}
            {existingImages.map(({ url }, index) => (
              <div
                key={`existing-${url}-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group"
              >
                <img
                  src={url}
                  alt={`Existing product ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <span className="absolute bottom-1 left-1 bg-slate-900/60 text-white text-[9px] px-1 rounded backdrop-blur-xs">
                  Saved
                </span>

                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  disabled={isSubmitting}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* New Images */}
            {newPreviews.map((preview, index) => (
              <div
                key={`new-${preview}-${index}`}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-blue-400 bg-slate-100"
              >
                <img
                  src={preview}
                  alt={`New upload preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1 rounded font-medium">
                  New
                </span>

                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  disabled={isSubmitting}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white text-[10px] flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
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

      {/* Pricing */}
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

      {/* Product Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Product Status
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          disabled={isSubmitting}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value={ProductStatus.ACTIVE}>ACTIVE</option>

          <option value={ProductStatus.INACTIVE}>INACTIVE</option>

          <option value={ProductStatus.ARCHIVED}>ARCHIVED</option>
        </select>
      </div>
    </BaseModal>
  );
}
