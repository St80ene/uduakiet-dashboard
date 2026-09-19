import React, { useState } from 'react';
import type { ProductsResponse } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/products.service.api';
import useDebouncedValue from '../../hooks/debounceHook';
import AddProductModal from './modals/AddProductModal';
import { useNavigate } from 'react-router-dom';
import ProductTable from './ProductsTable';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import ItemsSearch from '@/common/ItemsSearch';

export const Products: React.FC = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsSubmitting(true);
      try {
        const response = await productService.createProduct(data);
        return response;
      } finally {
        setIsSubmitting(false);
        setIsModalOpen(false);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });

      setIsModalOpen(false);
    },

    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useQuery<ProductsResponse>({
    queryKey: ['products', { page, limit, search: debouncedSearch }],
    queryFn: () =>
      productService.getAllProducts({
        page,
        limit,
        sortBy: 'created_at',
        search: debouncedSearch,
      }),
    placeholderData: (previousData) => previousData,
  });

  // 1. Loading state (triggers on initial mount when no cached/placeholder data exists)
  if (isLoading) {
    return <LoadingScreen label="Fetching product catalogue..." />;
  }

  // 2. Error state
  if (isError) {
    return (
      <ErrorPage
        title="Failed to load products"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching the product list. Please check your network connection.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header View Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Products Management
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs self-start sm:self-center"
        >
          Add New Product
        </button>
      </div>

      <ItemsSearch
        value={search}
        onChange={handleSearchChange}
        isFetching={isFetching}
      />

      {/* Catalogue View */}

      <ProductTable
        products={data?.products || []}
        meta={data?.meta}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        onSelectProduct={(product) => navigate(`/products/${product.id}`)}
      />

      {/* Modal View Block */}
      {isModalOpen && (
        <AddProductModal
          isSubmitting={isSubmitting}
          setIsModalOpen={setIsModalOpen}
          onSubmit={async (data) => {
            await createProductMutation.mutateAsync(data);
          }}
        />
      )}
    </div>
  );
};
