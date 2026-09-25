import { Edit2, Trash2, Tag, Layers } from 'lucide-react';
import type {
  IGetCategoryColumnsProps,
  ICategory,
} from '@/interfaces/category.interface';
import type { IDataTableColumn } from '@/interfaces/data_table';

export const getCategoryColumns = ({
  onEdit,
  onDelete,
}: IGetCategoryColumnsProps): IDataTableColumn<ICategory>[] => [
  {
    key: 'name',
    header: 'Category Name',
    width: '30%',
    render: (category) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-slate-800 line-clamp-1">
            {category.name}
          </div>
          {category.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {category.description}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    key: 'productsCount',
    header: 'Products',
    width: '20%',
    render: (category) => {
      const count = category.products?.length ?? 0;
      return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {count} {count === 1 ? 'Product' : 'Products'}
          </span>
        </div>
      );
    },
  },
  {
    key: 'created_at',
    header: 'Created Date',
    width: '20%',
    render: (category) => {
      const date = new Date(category.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return <span className="text-xs text-slate-500">{date}</span>;
    },
  },
  {
    key: 'updated_at',
    header: 'Last Updated',
    width: '20%',
    render: (category) => {
      const date = new Date(category.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return <span className="text-xs text-slate-500">{date}</span>;
    },
  },
  {
    key: 'actions',
    header: <span className="sr-only">Actions</span>,
    width: '10%',
    headerClassName: 'text-right',
    cellClassName: 'text-right',
    render: (category) => (
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()} // Prevent triggering table row clicks
      >
        <button
          type="button"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name} category`}
          className="p-1.5 cursor-pointer text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(category)}
          aria-label={`Delete ${category.name} category`}
          className="p-1.5 cursor-pointer text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];
