import { useState, useEffect } from 'react';
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
import AuditLogDetailsModal from '../AuditLogs/AuditLogModal';
import type { IAuditLog } from '@/interfaces/auditlog';
import type { IPaginationMeta } from '@/interfaces';
import type { IProduct } from '@/interfaces/products';
import LoadingScreen from '@/common/Error/LoadingScreen';
import type { ISupplier } from '@/interfaces/supplier';
import type { IPurchaseOrder } from '@/interfaces/purchase_order.interface';
import { getAllSuppliers } from '@/services/suppliers.service.api';
import {
  createProductSource,
  updateProductSource,
} from '@/services/product_source.service.api';
import DataTable from '@/common/DataTable';
import EditProductModal from './modals/EditProduct';

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { productId } = useParams<{ productId: string }>();

  const [selectedAuditLog, setSelectedAuditLog] = useState<IAuditLog | null>(
    null,
  );
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(10);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [isChangingSupplier, setIsChangingSupplier] = useState(false);

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
    auditLogs: IAuditLog[];
    meta: IPaginationMeta;
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

  const { data, isLoading, isError, error } = useQuery<IProduct>({
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

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () =>
      getAllSuppliers({
        page: 1,
        limit: 100,
      }),
  });

  const suppliers = suppliersData?.suppliers || [];

  const assignedSupplier: ISupplier | undefined =
    product?.source?.supplier || undefined;

  // Mutation to handle assigning (create) or changing (update) the single supplier
  const assignOrUpdateSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      // If a source record already exists, update it
      if (product?.source?.id) {
        return await updateProductSource(product?.source?.id, {
          product_id: productId!,
          supplier_id: supplierId,
        });
      }

      // Otherwise, create a new product source relation
      return await createProductSource({
        product_id: productId!,
        supplier_id: supplierId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setSelectedSupplierId('');
      setIsChangingSupplier(false);
    },
    onError: (error) => {
      console.error('Failed to save supplier assignment:', error);
    },
  });

  const handleAssignSupplier = () => {
    if (!selectedSupplierId) return;
    assignOrUpdateSupplierMutation.mutate(selectedSupplierId);
  };

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
                            src={imgObj.url}
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
            {/* Section Header */}
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Supply & Procurement
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                Manage the supplier for this product and track procurement
                history.
              </p>
            </div>

            {/* Main Grid: Supplier Details & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Supplier Card */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <h4 className="text-sm font-semibold text-slate-900">
                      Assigned Supplier
                    </h4>
                  </div>
                  {assignedSupplier && !isChangingSupplier && (
                    <button
                      type="button"
                      onClick={() => setIsChangingSupplier(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      Change Supplier
                    </button>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center">
                  {assignedSupplier && !isChangingSupplier ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 font-bold">
                          {assignedSupplier.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {assignedSupplier.name}
                          </h5>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {assignedSupplier.email || 'No email provided'}
                          </p>
                          {assignedSupplier.phone_number && (
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">
                              {assignedSupplier.phone_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                        Active Source
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-lg">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                          {assignedSupplier
                            ? 'Select New Supplier'
                            : 'Assign Supplier Vendor'}
                        </label>
                        <select
                          value={selectedSupplierId}
                          onChange={(e) =>
                            setSelectedSupplierId(e.target.value)
                          }
                          disabled={
                            isLoadingSuppliers ||
                            assignOrUpdateSupplierMutation.isPending
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="">
                            Choose a supplier from list...
                          </option>
                          {suppliers.map((sup) => (
                            <option key={sup.id} value={sup.id}>
                              {sup.name} {sup.email ? `(${sup.email})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {isChangingSupplier && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingSupplier(false);
                              setSelectedSupplierId('');
                            }}
                            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAssignSupplier}
                          disabled={
                            !selectedSupplierId ||
                            assignOrUpdateSupplierMutation.isPending
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {assignOrUpdateSupplierMutation.isPending
                            ? 'Saving...'
                            : assignedSupplier
                              ? 'Update Supplier'
                              : 'Link Supplier'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Supply Insights */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Supply Insights
                  </h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Users className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Coverage
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {assignedSupplier
                          ? '1 active primary supplier.'
                          : 'No supplier linked yet.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Cost Trend
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        No purchase history recorded.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <TriangleAlert className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Supply Risk
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Evaluation pending history.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Procurement History Section */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Recent Purchases
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recent procurement transactions for this product
                  </p>
                </div>
                {product.purchase_orders?.length ? (
                  <button
                    type="button"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    View procurement history
                  </button>
                ) : null}{' '}
              </div>

              {product.purchase_orders?.length ? (
                <div className="divide-y divide-slate-100">
                  {product.purchase_orders
                    .slice(0, 5)
                    .map((purchase: IPurchaseOrder) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between px-6 py-3.5 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {purchase.supplier_name || 'Unknown supplier'}
                          </p>
                          <p className="text-slate-400 mt-0.5">
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
                <div className="py-12 text-center text-slate-400">
                  <ReceiptText className="w-8 h-8 mx-auto mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium">
                    No purchase history found
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
            <DataTable<IAuditLog>
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
