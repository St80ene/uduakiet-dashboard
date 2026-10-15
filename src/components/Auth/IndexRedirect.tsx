import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserPermission } from '@/enum/user_permission.enum';
import { UserRole } from '@/enum/role';

export const IndexRedirect: React.FC = () => {
  const { user } = useAuth();

  const currentRole = user?.role?.name ?? UserRole.CASHIER;
  const isSuperAdmin = currentRole === UserRole.SUPER_ADMIN;

  const permissions = new Set(
    user?.role?.rolePermissions?.map((rp) => rp.permission.name) ?? [],
  );

  const hasPerm = (perm: UserPermission) =>
    isSuperAdmin || permissions.has(perm);

  // Priority order for initial landing page:
  if (hasPerm(UserPermission.DASHBOARD_VIEW))
    return <Navigate to="/dashboard" replace />;
  if (hasPerm(UserPermission.PRODUCT_READ))
    return <Navigate to="/products" replace />;
  if (hasPerm(UserPermission.STOCK_READ))
    return <Navigate to="/stocks" replace />;
  if (hasPerm(UserPermission.PURCHASE_READ))
    return <Navigate to="/purchase-orders" replace />;
  if (hasPerm(UserPermission.SALE_READ))
    return <Navigate to="/sales" replace />;

  // Default fallback for any authenticated user without special view permissions
  return <Navigate to="/settings/profile" replace />;
};
