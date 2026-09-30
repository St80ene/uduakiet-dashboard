import { useState, useEffect } from 'react';
import { getAuditLogColumns } from '@/components/AuditLogs/audit_logs_columns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  Edit,
  MoreVertical,
  History,
  Building2,
} from 'lucide-react';
import { productService } from '../../../services/products.service.api';
import AuditLogDetailsModal from '../../AuditLogs/AuditLogModal';
import type { IAuditLog } from '@/interfaces/auditlog';
import type { IPaginationMeta } from '@/interfaces';
import type { IProduct } from '@/interfaces/products';
import LoadingScreen from '@/common/Error/LoadingScreen';
import type { ISupplier } from '@/interfaces/supplier';
import { getAllSuppliers } from '@/services/suppliers.service.api';
import {
  createProductSource,
  updateProductSource,
} from '@/services/product_source.service.api';
import EditProductModal from '../modals/EditProduct';
import ProductLedger from './Tabs/ProductLedger';
import ProductRelationships from './Tabs/ProductRelationships';
import Metrics from './Metrics';
import ProductOverview from './Tabs/ProductOverview';

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

      <Metrics
        product={product}
        profitMargin={profitMargin}
        marginPercentage={marginPercentage}
      />

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
        {activeTab === 'overview' && <ProductOverview product={product} />}

        {activeTab === 'relationships' && (
          <ProductRelationships
            purchase_orders={product.purchase_orders ?? []}
            assignOrUpdateSupplierMutation={assignOrUpdateSupplierMutation}
            assignedSupplier={assignedSupplier ?? null}
            isChangingSupplier={isChangingSupplier}
            setIsChangingSupplier={setIsChangingSupplier}
            selectedSupplierId={selectedSupplierId}
            setSelectedSupplierId={setSelectedSupplierId}
            suppliers={suppliers}
            isLoadingSuppliers={isLoadingSuppliers}
            handleAssignSupplier={handleAssignSupplier}
          />
        )}

        {activeTab === 'ledger' && (
          <ProductLedger
            auditLogColumns={auditLogColumns}
            auditLogs={productLedger?.auditLogs ?? []}
            meta={productLedger?.meta}
            handleAuditPageChange={handleAuditPageChange}
            handleAuditPageSizeChange={handleAuditPageSizeChange}
          />
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
