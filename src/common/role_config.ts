import { UserRole } from '@/enum/role';
import {
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  UserCheck,
} from 'lucide-react';

export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ElementType;
  }
> = {
  [UserRole.SUPER_ADMIN]: {
    label: 'Super Admin',
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/30',
    icon: ShieldAlert,
  },
  [UserRole.ADMIN]: {
    label: 'Administrator',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/30',
    icon: ShieldCheck,
  },
  [UserRole.MANAGER]: {
    label: 'Operations Manager',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/30',
    icon: UserCheck,
  },
  [UserRole.STOREMAN]: {
    label: 'Inventory Storeman',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/30',
    icon: PackageCheck,
  },
  [UserRole.CASHIER]: {
    label: 'POS Cashier',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/30',
    icon: ShoppingCart,
  },
};
