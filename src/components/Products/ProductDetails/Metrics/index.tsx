import type { IProduct } from '@/interfaces/products';
import { motion } from 'framer-motion';
import { Box, DollarSign, Tag, TrendingUp } from 'lucide-react';

function Metrics({
  product,
  profitMargin,
  marginPercentage,
}: {
  product: Partial<IProduct>;
  profitMargin: number;
  marginPercentage: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
      >
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Stock Quantity</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">
            <span className="text-xs text-slate-400 font-normal">
              {product.stocks?.reduce(
                (acc, stock) => acc + stock.current_quantity,
                0,
              ) ?? 0}{' '}
              {product.uom_display_name}
            </span>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
      >
        <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Cost Price</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">
            ${Number(product.cost_price).toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Base procurement cost</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
      >
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Tag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Selling Price</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">
            ${Number(product.selling_price).toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Retail unit price</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
      >
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Gross Margin</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">
            ${profitMargin.toFixed(2)}{' '}
            <span className="text-xs text-emerald-700 font-medium">
              ({marginPercentage}%)
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Unit profit yield</p>
        </div>
      </motion.div>
    </div>
  );
}

export default Metrics;
