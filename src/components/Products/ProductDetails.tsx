import { useState, useEffect } from 'react';
import type { PurchaseOrder, Supplier } from '@/types';
import { getAuditLogColumns } from '@/components/AuditLogs/audit_logs_columns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  ImageIcon,
  DollarSign,
  TrendingUp,
  Tag,
  Clock,
  Edit,
  MoreVertical,
  History,
  Layers,
  Building2,
  Box,
  Plus,
  ReceiptText,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { productService } from '../../services/products.service.api';
import { LoadingScreen } from '../common/Error/LoadingScreen';
import EditProductModal from './modals/EditProduct';
import DataTable from '../common/DataTable';
import AuditLogDetailsModal from '../AuditLogs/AuditLogModal';
import type { PaginationMeta } from '@/interfaces';
import type { AuditLog } from '@/interfaces/auditlog';
import type { Product } from '@/types';

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { productId } = useParams<{ productId: string }>();

  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null,
  );
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(10);

  const handleAuditPageChange = (page: number) => {
    setAuditPage(page);
  };

  const auditLogColumns = getAuditLogColumns(setSelectedAuditLog);

  const handleAuditPageSizeChange = (limit: number) => {
    setAuditLimit(limit);
    setAuditPage(1);
  };
  const [activeTab, setActiveTab] = useState<
    'overview' | 'relationships' | 'ledger'
  >('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productLedger, setProductLedger] = useState<{
    auditLogs: AuditLog[];
    meta: PaginationMeta;
  }>({
    auditLogs: [],
    meta: {
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      itemCount: 1,
      itemsPerPage: 10,
      totalItems: 1,
      totalPages: 1,
    },
  });
  const { data, isLoading, isError, error } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productService.getProductByID(productId!),
    enabled: Boolean(productId),
  });

  const product = data;

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProduct: FormData) => {
      setIsSubmitting(true);
      try {
        return await productService.updateProduct(productId!, updatedProduct);
      } finally {
        setIsSubmitting(false);
        setIsEditModalOpen(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (activeTab !== 'ledger' || !productId) {
      return;
    }

    async function fetchProductLedger() {
      try {
        const ledger = await productService.getProductAuditLogs(productId!, {
          page: auditPage,
          limit: auditLimit,
        });

        setProductLedger(ledger);
      } catch (error) {
        console.error('Failed to fetch product audit logs:', error);
      }
    }

    fetchProductLedger();
  }, [activeTab, productId, auditPage, auditLimit]);

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | Product Details`;
    } else {
      document.title = 'Product Details';
    }
  }, [product]);

  if (isLoading) return <LoadingScreen />;

  if (isError || !product) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {isError ? 'Error Loading Product' : 'Product Not Found'}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          {error instanceof Error
            ? error.message
            : 'The requested product could not be located or loaded.'}
        </p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>
    );
  }

  const profitMargin = product.selling_price - product.cost_price;
  const marginPercentage =
    product.selling_price > 0
      ? ((profitMargin / product.selling_price) * 100).toFixed(1)
      : '0';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {product.name}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: {product.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Edit className="w-4 h-4 text-slate-500" />
            Edit Product
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            title="More Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
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
            <p className="text-xs text-slate-400 mt-0.5">
              Base procurement cost
            </p>
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

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            {
              id: 'relationships',
              label: 'Relationships & Supply',
              icon: Building2,
            },
            { id: 'ledger', label: 'Product Ledger', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'overview' | 'relationships' | 'ledger',
                  )
                }
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
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
                    {product.images?.map((imgObj, index) => {
                      return (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                        >
                          <img
                            src={imgObj.url} // Updated from '' to url
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })}
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
                    <dd className="font-medium text-slate-900">
                      {product.uom_type}
                    </dd>
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
        )}

        {activeTab === 'relationships' && (
          <motion.div
            key="relationships"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Page Header */}
            <div className="flex flex-col gap-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Supply & Procurement
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  See where this product is sourced from, review supplier
                  information, and monitor procurement activity.
                </p>
              </div>
            </div>

            {/* Supply Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Suppliers */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                    <Building2 className="h-5 w-5 text-slate-600" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Suppliers
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold tracking-tight text-slate-900">
                    {product.suppliers?.length ?? 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {product.suppliers?.length
                      ? 'Suppliers linked to this product'
                      : 'No suppliers linked yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Suppliers */}
              <div className="lg:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Suppliers
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Suppliers currently associated with this product
                    </p>
                  </div>

                  {product.suppliers?.length ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                    >
                      View all
                    </button>
                  ) : null}
                </div>

                {product.suppliers?.length ? (
                  <div className="divide-y divide-slate-100">
                    {product.suppliers.map((supplier: Supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between gap-4 px-6 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                            <Building2 className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {supplier.name}
                              </p>
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {supplier.email}
                              </p>

                              {supplier.is_primary && (
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Preferred
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {supplier.city || 'Location not provided'}
                            </p>
                          </div>
                        </div>

                        <div className="grid shrink-0 grid-cols-3 gap-6 text-right">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Last Cost
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {supplier.last_purchase_price
                                ? `₦${Number(
                                    supplier.last_purchase_price,
                                  ).toLocaleString()}`
                                : '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Lead Time
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {supplier.lead_time_days
                                ? `${supplier.lead_time_days} days`
                                : '—'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                              Status
                            </p>

                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                              {supplier.is_active ? 'Active' : 'Inactive'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>

                    <h4 className="mt-4 text-sm font-semibold text-slate-900">
                      No suppliers linked yet
                    </h4>

                    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                      Supplier information will help you understand where this
                      product is sourced from, compare purchasing options, and
                      monitor supply risk.
                    </p>

                    <button
                      type="button"
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4" />
                      Add Supplier
                    </button>
                  </div>
                )}
              </div>

              {/* Supply Insights */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Supply Insights
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    What management should know about sourcing
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  {/* Supplier Coverage */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                        <Users className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Supplier Coverage
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {product.suppliers?.length
                            ? `${product.suppliers.length} supplier${
                                product.suppliers.length > 1 ? 's are' : ' is'
                              } currently available for this product.`
                            : 'Supplier coverage cannot be assessed until suppliers are linked.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Trend */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Purchase Cost Trend
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          No purchase history is available yet to identify cost
                          changes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Risk */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                        <TriangleAlert className="h-4 w-4 text-slate-500" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Supply Risk
                        </p>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Risk assessment will become available once supplier
                          and purchasing history has been recorded.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Procurement History */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recent Purchases
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Recent procurement activity for this product
                  </p>
                </div>

                {product.purchase_orders?.length ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    View procurement history
                  </button>
                ) : null}
              </div>

              {product.purchase_orders?.length ? (
                <div className="divide-y divide-slate-100">
                  {product.purchase_orders
                    .slice(0, 5)
                    .map((purchase: PurchaseOrder) => (
                      <div
                        key={purchase.id}
                        className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-5"
                      >
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Supplier
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                            {purchase.supplier_name || 'Unknown supplier'}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {purchase.createdAt
                              ? new Date(purchase.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  },
                                )
                              : '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {purchase.items?.[0]?.quantity_requested
                              ? purchase.items[0].quantity_requested.toLocaleString()
                              : '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Unit Cost
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {purchase.items?.[0]?.estimated_unit_cost
                              ? `₦${Number(purchase.items[0].estimated_unit_cost).toLocaleString()}`
                              : '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Status
                          </p>

                          <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {purchase.status || 'Recorded'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                    <ReceiptText className="h-5 w-5 text-slate-400" />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-slate-900">
                    No purchase history yet
                  </h4>

                  <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                    Purchase activity will appear here once this product has
                    been sourced through the procurement process.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'ledger' && (
          <motion.div
            key="ledger"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            {/* Section heading */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />

                  <h4 className="text-sm font-semibold text-slate-900">
                    Stock & Price Audit Logs
                  </h4>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Historical activity for stock adjustments, price changes, and
                  order allocations.
                </p>
              </div>
            </div>

            {/* Audit table */}
            <DataTable<AuditLog>
              records={productLedger?.auditLogs ?? []}
              columns={auditLogColumns}
              meta={productLedger?.meta}
              pageSizeOptions={[10, 25, 50]}
              onPageChange={handleAuditPageChange}
              onPageSizeChange={handleAuditPageSizeChange}
              getRowKey={(log) => log.id}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <EditProductModal
          product={product}
          isSubmitting={isSubmitting}
          setIsModalOpen={setIsEditModalOpen}
          onSubmit={async (updatedProduct) => {
            // Guard clause: do nothing if request is already in-flight
            if (updateProductMutation.isPending) return;

            updateProductMutation.mutate(updatedProduct);
          }}
        />
      )}

      <AuditLogDetailsModal
        isOpen={Boolean(selectedAuditLog)}
        auditLog={selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
      />
    </div>
  );
}
