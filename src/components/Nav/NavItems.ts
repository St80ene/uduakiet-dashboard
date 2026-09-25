import type { LucideIcon } from 'lucide-react';
import { ViewPermission } from '@/enum/view_permission.enum';
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  Link,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  UserCircle,
  Users,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  permissions?: ViewPermission[];
  permissionMode?: 'all' | 'any';
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  /**
   * OVERVIEW & ANALYTICS
   */
  {
    label: 'Overview',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        permissions: [ViewPermission.DASHBOARD_VIEW],
      },
      {
        to: '/reports',
        label: 'Reports',
        icon: BarChart3,
        permissions: [ViewPermission.REPORTS_VIEW],
      },
    ],
  },

  /**
   * INVENTORY & STOCKS
   */
  {
    label: 'Inventory',
    items: [
      {
        to: '/products',
        label: 'Products',
        icon: Package,
        permissions: [ViewPermission.PRODUCTS_VIEW],
      },
      {
        to: '/stocks',
        label: 'Stocks',
        icon: Boxes,
        permissions: [ViewPermission.STOCKS_VIEW],
      },
      {
        to: '/categories',
        label: 'Categories',
        icon: Tags,
        permissions: [ViewPermission.CATEGORIES_VIEW],
      },
      {
        to: '/stock-movements',
        label: 'Stock Movements',
        icon: ArrowLeftRight,
        permissions: [ViewPermission.STOCK_MOVEMENTS_VIEW],
      },
    ],
  },

  /**
   * PROCUREMENT
   */
  {
    label: 'Procurement',
    items: [
      {
        to: '/purchase-orders',
        label: 'Purchase Orders',
        icon: ShoppingCart,
        permissions: [ViewPermission.PURCHASE_ORDERS_VIEW],
      },
      {
        to: '/suppliers',
        label: 'Suppliers',
        icon: Truck,
        permissions: [ViewPermission.SUPPLIERS_VIEW],
      },
      {
        to: '/product-sources',
        label: 'Product Sources',
        icon: Link,
        permissions: [ViewPermission.PRODUCT_SOURCES_VIEW],
      },
    ],
  },

  /**
   * ADMINISTRATION & AUDITS
   */
  {
    label: 'Administration',
    items: [
      {
        to: '/stores',
        label: 'Stores',
        icon: Store,
        permissions: [ViewPermission.STORES_VIEW],
      },
      {
        to: '/users',
        label: 'Users',
        icon: Users,
        permissions: [ViewPermission.USERS_VIEW],
      },
      {
        to: '/audit-logs',
        label: 'Audit Logs',
        icon: FileText,
        permissions: [ViewPermission.AUDIT_LOGS_VIEW],
      },
    ],
  },

  /**
   * SETTINGS
   */
  {
    label: 'Settings',
    items: [
      {
        to: '/settings/business',
        label: 'Business',
        icon: Settings,
        permissions: [ViewPermission.BUSINESS_VIEW],
      },
      {
        to: '/settings/profile',
        label: 'Profile',
        icon: UserCircle,
        permissions: [ViewPermission.PROFILE_VIEW],
      },
    ],
  },
];
