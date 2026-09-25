import { Eye } from 'lucide-react';
import type { IProduct, IProductTableProps } from '@/interfaces/products';
import { formatCurrency } from '@/common/utils';
import DataTable from '@/common/DataTable';
import type { IDataTableColumn } from '@/interfaces/data_table';

const ProductTable = ({
  products,
  meta,
  isPlaceholderData,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSelectProduct,
}: IProductTableProps) => {
  const productColumns: IDataTableColumn<IProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (product) => {
        const primaryImage = product.images?.[0]?.url;

        return (
          <div className="flex items-center gap-3">
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="
                  w-10 h-10
                  object-cover
                  rounded-lg
                  bg-slate-100
                  border border-slate-200/80
                  shrink-0
                  shadow-2xs
                  group-hover:scale-105
                  transition-transform
                "
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="
                  w-10 h-10
                  rounded-lg
                  bg-slate-100
                  border border-slate-200
                  flex items-center justify-center
                  font-mono text-xs font-bold
                  text-slate-500
                  shrink-0
                "
              >
                {product.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                {product.name}
              </div>

              <div className="mt-0.5">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tight">
                  SKU: {product.id.split('-')[0]}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'cost',
      header: 'Cost',
      cellClassName: 'font-mono text-slate-500 text-xs whitespace-nowrap',
      render: (product) => formatCurrency(Number(product.cost_price)),
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      cellClassName:
        'font-mono font-semibold text-emerald-600 text-xs whitespace-nowrap',
      render: (product) => formatCurrency(Number(product.selling_price)),
    },
    {
      key: 'category',
      header: 'Category',
      cellClassName:
        'font-mono font-semibold text-emerald-600 text-xs whitespace-nowrap',
      render: (product) => {
        console.log('product.category', product.category);
        return product.category ? (
          <span className="font-mono text-slate-500 text-xs whitespace-nowrap">
            {product.category.name}
          </span>
        ) : (
          <span className="font-mono text-slate-400 text-xs whitespace-nowrap">
            N/A
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (product) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelectProduct?.(product);
          }}
          className="
            inline-flex items-center gap-1.5
            px-3 py-1.5
            text-xs font-semibold
            text-slate-700
            bg-white
            border border-slate-200
            rounded-lg
            hover:bg-slate-50
            hover:border-slate-300
            focus:outline-none
            focus:ring-2
            focus:ring-slate-300
            transition-colors
            cursor-pointer
          "
          aria-label={`See more details for ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          See more
        </button>
      ),
    },
  ];

  return (
    <DataTable
      records={products}
      columns={productColumns}
      meta={meta}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={[5, 7, 10, 25, 50]}
      onSelectRecord={onSelectProduct}
      isPlaceholderData={isPlaceholderData}
      isLoading={isLoading}
      getRowKey={(product: IProduct) => product.id}
      emptyState={{
        title: 'No products found',
        description:
          'We couldn’t find any products matching your search or filters.',
      }}
    />
  );
};

export default ProductTable;
