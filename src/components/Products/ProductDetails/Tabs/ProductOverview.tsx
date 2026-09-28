import type { ICloudinaryImage } from '@/interfaces/cloudImage';
import type { IProduct } from '@/interfaces/products';
import { motion } from 'framer-motion';
import { Clock, ImageIcon, Layers } from 'lucide-react';

function ProductOverview({ product }: { product: IProduct }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Product Images
          </h3>
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.images?.map(
                (imgObj: ICloudinaryImage, index: number) => {
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={imgObj.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <div className="h-44 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">No media uploaded</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Product images will appear here
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description ||
              'No detailed description provided for this item.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            Unit & Measurements
          </h3>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Unit Type</dt>
              <dd className="font-medium text-slate-900">{product.uom_type}</dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Base UOM</dt>
              <dd className="font-medium text-slate-900">
                {product.uom_base_name}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Display UOM</dt>
              <dd className="font-medium text-slate-900">
                {product.uom_display_name}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Timestamps
          </h3>
          <dl className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium text-slate-700">
                {new Date(product?.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div className="py-2.5 flex justify-between">
              <dt className="text-slate-500">Last Updated</dt>
              <dd className="font-medium text-slate-700">
                {new Date(product?.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductOverview;
