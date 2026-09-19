import type { ReactNode } from 'react';
import type { IPaginationMeta } from '.';

export interface IDataTableColumn<T> {
  /**
   * Unique key for the column.
   */
  key: string;

  /**
   * Column header content.
   */
  header: ReactNode;

  /**
   * Renders the cell content for a record.
   */
  render: (record: T, index: number) => ReactNode;

  /**
   * Optional fixed column width.
   */
  width?: string;

  /**
   * Optional custom table cell class.
   */
  cellClassName?: string;

  /**
   * Optional custom table header class.
   */
  headerClassName?: string;
}

export interface IDataTableProps<T> {
  /**
   * Records to display.
   */
  records: T[];

  /**
   * Column definitions.
   */
  columns: IDataTableColumn<T>[];

  /**
   * Backend pagination metadata.
   */
  meta?: IPaginationMeta;

  /**
   * Called when the user changes page.
   */
  onPageChange?: (newPage: number) => void;

  /**
   * Called when the user changes the number of rows per page.
   */
  onPageSizeChange?: (newPageSize: number) => void;

  /**
   * Available rows-per-page options.
   */
  pageSizeOptions?: number[];

  /**
   * Called when a row is selected.
   */
  onSelectRecord?: (record: T) => void;

  /**
   * Fades the table while fetching placeholder data.
   */
  isPlaceholderData?: boolean;

  /**
   * Displays skeleton rows while loading.
   */
  isLoading?: boolean;

  /**
   * Custom empty state.
   */
  emptyState?: {
    icon?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
  };

  /**
   * Stable key for each row.
   */
  getRowKey?: (record: T, index: number) => string | number;

  /**
   * Allows consumers to customize row classes.
   */
  getRowClassName?: (record: T) => string;

  /**
   * Optional content rendered above the table.
   */
  header?: ReactNode;

  /**
   * Enables horizontal scrolling on smaller screens.
   */
  horizontalScroll?: boolean;
}

export interface IDataTablePaginationProps {
  meta: IPaginationMeta;
  startItem: number;
  endItem: number;
  onPageChange?: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions: number[];
}

export interface IDataTableEmptyStateProps {
  columnCount: number;
  icon: ReactNode;
  title: ReactNode;
  description: ReactNode;
}
