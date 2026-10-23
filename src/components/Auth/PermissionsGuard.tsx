import { UserRole } from '@/enum/role';
import type { UserPermission } from '@/enum/user_permission.enum';
import { useAuth } from '@/services/auth/hooks/useAuth';
import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface PermissionGuardProps {
  /** Single permission or array of permissions required to view the route */
  permissions?: UserPermission | UserPermission[];
  /**
   * 'all': User must have every required permission.
   * 'any': User needs at least one of the required permissions.
   * Default is 'all'.
   */
  mode?: 'all' | 'any';
  /** Path to redirect unauthorized users (defaults to forbidden page) */
  redirectTo?: string;
  children?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  mode = 'all',
  redirectTo = '/403', // Or redirect to '/dashboard'
  children,
}) => {
  const { user } = useAuth();

  const currentRole = user?.role?.name ?? UserRole.CASHIER;
  const isSuperAdmin = currentRole === UserRole.SUPER_ADMIN;

  const userPermissions = useMemo(
    () =>
      new Set<UserPermission>(
        user?.role?.rolePermissions?.map(
          (rp) => rp.permission.name as UserPermission,
        ) ?? [],
      ),
    [user?.role?.rolePermissions],
  );

  const hasAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    if (!permissions) return true;

    const requiredPermissions = Array.isArray(permissions)
      ? permissions
      : [permissions];

    if (requiredPermissions.length === 0) return true;

    if (mode === 'any') {
      return requiredPermissions.some((perm) => userPermissions.has(perm));
    }

    return requiredPermissions.every((perm) => userPermissions.has(perm));
  }, [isSuperAdmin, permissions, mode, userPermissions]);

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
