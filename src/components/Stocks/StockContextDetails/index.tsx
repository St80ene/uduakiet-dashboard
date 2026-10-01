import { useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IStock } from '@/interfaces/stock.interface';
import { StockHeader } from './StockHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { getStockByID } from '@/services/stocks.service.api';
import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserRole } from '@/enum/role';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { StockDetailTabs } from './StockDetailsTab';

export const StockDetailPage: FC = () => {
  const { stockId } = useParams<{ stockId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const onBack = () => window.history.back();
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [, setIsTransferModalOpen] = useState(false);

  const {
    data: stock,
    isLoading,
    isError,
    error,
  } = useQuery<IStock>({
    queryKey: ['stock', stockId],
    queryFn: () => getStockByID(stockId!),
    enabled: Boolean(stockId),
  });

  const userRole = user?.role?.name ?? UserRole.STOREMAN; // Default to STORE_KEEPER if user role is undefined

  if (isError || !stock) {
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
          onClick={() => navigate('/stocks')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>
    );
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-slate-100/60 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Hero Header */}
        <StockHeader
          stock={stock}
          userRole={userRole}
          onAdjustStock={() => setIsAdjustmentModalOpen(true)}
          onTransferStock={() => setIsTransferModalOpen(true)}
          onBack={onBack}
        />

        {/* Main Two-Column Content Grid */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <StockContextDetails stock={stock} />
          <StockMetadataCard stock={stock} />
        </div> */}
        <StockDetailTabs stock={stock} />
      </div>

      {/* Modals placeholders can be integrated here */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Adjust Stock Count
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Update the physical quantity for item {stock.id.slice(0, 8)}.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
