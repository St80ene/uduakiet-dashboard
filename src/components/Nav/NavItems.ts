import type { LucideIcon } from 'lucide-react';
import { UserPermission } from '@/enum/user_permission.enum';
import {
  ArrowLeftRight,
  BarChart3,
  Boxes,
  FileText,
  LayoutDashboard,
  Link as LinkIcon,
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
  permissions?: UserPermission[]; // Updated type
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
        permissions: [UserPermission.DASHBOARD_VIEW],
      },
      {
        to: '/reports',
        label: 'Reports',
        icon: BarChart3,
        permissions: [UserPermission.REPORT_VIEW],
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
        permissions: [UserPermission.PRODUCT_READ],
      },
      {
        to: '/stocks',
        label: 'Stocks',
        icon: Boxes,
        permissions: [UserPermission.STOCK_READ],
      },
      {
        to: '/categories',
        label: 'Categories',
        icon: Tags,
        permissions: [UserPermission.CATEGORY_READ],
      },
      {
        to: '/stock-movements',
        label: 'Stock Movements',
        icon: ArrowLeftRight,
        permissions: [UserPermission.STOCK_MOVEMENT_READ],
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
        permissions: [UserPermission.PURCHASE_READ],
      },
      {
        to: '/suppliers',
        label: 'Suppliers',
        icon: Truck,
        permissions: [UserPermission.SUPPLIER_READ],
      },
      {
        to: '/product-sources',
        label: 'Product Sources',
        icon: LinkIcon,
        permissions: [UserPermission.PRODUCT_SOURCE_READ],
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
        permissions: [UserPermission.STORE_READ],
      },
      {
        to: '/users',
        label: 'Users',
        icon: Users,
        permissions: [UserPermission.USER_READ, UserPermission.ROLE_READ],
        permissionMode: 'any',
      },
      {
        to: '/audit-logs',
        label: 'Audit Logs',
        icon: FileText,
        permissions: [UserPermission.AUDIT_LOG_READ],
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
        permissions: [UserPermission.BUSINESS_SETTINGS_READ],
      },
      {
        to: '/settings/profile',
        label: 'Profile',
        icon: UserCircle,
        // No permission required for personal profile view
      },
    ],
  },
];
