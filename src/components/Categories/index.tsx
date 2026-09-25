import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  FolderTree,
  Package,
  Layers,
  Filter,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { CategoryFormModal } from './modals/CategoryFormModal';
import { getCategoryColumns } from './CategoriesTableColumns';

import { categoryService } from '@/services/categories.service.api';
import useDebouncedValue from '@/hooks/debounceHook';
import type {
  CategoryFormData,
  ICategory,
  CategorySortField,
} from '@/interfaces/category.interface';
import type { CategoriesResponse } from '@/types';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

export const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<CategorySortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );

  // Queries
  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<CategoriesResponse>({
      queryKey: [
        'categories',
        {
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          sortOrder,
        },
      ],
      queryFn: () =>
        categoryService.getAllCategories({
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          sortOrder,
        }),
      placeholderData: (previousData) => previousData,
    });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CategoryFormData) =>
      categoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CategoryFormData }) =>
      categoryService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.removeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // Action Handlers
  const handleOpenCreateModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: ICategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: ICategory) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    await deleteMutation.mutateAsync(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  const handleFormSubmit = async (formData: CategoryFormData) => {
    if (selectedCategory) {
      await updateMutation.mutateAsync({
        id: selectedCategory.id,
        payload: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Metrics computation
  const totalProductsCount = useMemo(() => {
    return (
      data?.categories?.reduce(
        (acc, category) => acc + (category.products?.length ?? 0),
        0,
      ) ?? 0
    );
  }, [data?.categories]);

  const avgProductsPerCategory = useMemo(() => {
    return Math.round(
      totalProductsCount / (data?.categories?.length ?? 0) || 0,
    );
  }, [totalProductsCount, data?.categories]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return <LoadingScreen label="Fetching inventory categories..." />;
  }

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load categories"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading category records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize products, manage catalog hierarchies, and track product
            distribution.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="
            inline-flex items-center justify-center gap-2
            px-4 py-2.5 text-sm font-semibold text-white
            bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs
            transition-colors duration-150 focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
            cursor-pointer shrink-0
          "
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Categories
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {data?.meta?.totalItems ?? data?.categories?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Linked Products
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {totalProductsCount}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Products / Category
            </p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {avgProductsPerCategory}
            </p>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable<ICategory>
        records={data?.categories || []}
        columns={getCategoryColumns({
          onEdit: handleOpenEditModal,
          onDelete: handleDeleteCategory,
        })}
        meta={data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: ICategory) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <FolderTree className="w-7 h-7 text-slate-400" />,
          title: 'No categories found',
          description:
            'Get started by creating a new category for your inventory catalog.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <label htmlFor="category-search" className="sr-only">
                Search Categories
              </label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="category-search"
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="
                  w-full pl-9 pr-3 py-1.5 text-xs font-normal text-slate-800
                  placeholder:text-slate-400 bg-slate-50/50 border border-slate-200
                  rounded-lg outline-none focus:bg-white focus:ring-2
                  focus:ring-slate-300 focus:border-slate-300 transition-all
                "
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Sort by:
                </span>
                <select
                  aria-label="Select sort field"
                  value={selectedSort}
                  onChange={(e) =>
                    setSelectedSort(e.target.value as CategorySortField)
                  }
                  className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="name">Name</option>
                  <option value="created_at">Date Created</option>
                  <option value="updated_at">Date Updated</option>
                </select>
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  aria-label={`Sort direction ${sortOrder}`}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Conditionally rendered modal resetting state via key */}
      {isModalOpen && (
        <CategoryFormModal
          key={selectedCategory?.id || 'new-category'}
          category={selectedCategory}
          isSubmitting={isSubmitting}
          setIsModalOpen={setIsModalOpen}
          onSubmit={handleFormSubmit}
        />
      )}

      {categoryToDelete && (
        <DeleteConfirmModal
          title="Delete Category"
          itemName={categoryToDelete.name}
          warningText="Products assigned to this category will be unlinked."
          isDeleting={deleteMutation.isPending}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
