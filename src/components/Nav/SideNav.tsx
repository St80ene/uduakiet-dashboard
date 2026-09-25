import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Loader2, LogOut } from 'lucide-react';

import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserRole } from '@/enum/role';

import { NAV_SECTIONS, type NavItem } from './NavItems';
import type { ViewPermission } from '@/enum/view_permission.enum';
import { ROLE_CONFIG } from '@/common/role_config';
import { UduaKietLogo } from '@/common/AppLogo';

export const SideNav: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const currentRole = user?.role?.name ?? UserRole.CASHIER;
  const isSuperAdmin = currentRole === UserRole.SUPER_ADMIN;

  const userPermissions = useMemo(
    () =>
      new Set(
        user?.role?.rolePermissions?.map(
          (role_permission) => role_permission.permission.name,
        ) ?? [],
      ),
    [user?.role?.rolePermissions],
  );

  const hasViewPermission = (permission: ViewPermission): boolean => {
    if (isSuperAdmin) return true;
    return userPermissions.has(permission);
  };

  const canAccessNavItem = (item: NavItem): boolean => {
    if (!item.permissions || item.permissions.length === 0) return true;
    if (item.permissionMode === 'any')
      return item.permissions.some(hasViewPermission);
    return item.permissions.every(hasViewPermission);
  };

  const visibleSections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(canAccessNavItem),
      })).filter((section) => section.items.length > 0),
    [userPermissions, isSuperAdmin],
  );

  const roleStyle = ROLE_CONFIG[currentRole] ?? {
    label: 'Admin',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-500/30',
  };

  const RoleIcon = roleStyle.icon;
  const displayName = user?.first_name || 'Account';

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      aria-label="Main Navigation"
      className="
        flex h-full w-64 shrink-0
        select-none flex-col
        justify-between
        border-r border-slate-800
        bg-slate-950
        text-slate-400
      "
    >
      {/* =====================================================
          TOP SECTION
      ====================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-800">
        {/* APP LOGO */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-800 bg-slate-950 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <UduaKietLogo className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold tracking-wide text-white text-sm">
              UduaKiet
            </span>
            <p className="text-[10px] text-slate-500">Inventory System</p>
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <nav aria-label="Sidebar" className="space-y-3.5 p-2.5">
          {visibleSections.map((section) => (
            <div key={section.label}>
              {/* Section heading */}
              <div className="mb-1 px-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {section.label}
                </p>
              </div>

              {/* Navigation items */}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'flex items-center justify-between',
                          'rounded-md',
                          'px-2.5 py-1.5',
                          'text-xs font-medium',
                          'transition-all duration-150',
                          'focus:outline-none focus:ring-1 focus:ring-cyan-500',

                          isActive
                            ? 'border border-cyan-500/30 bg-cyan-950/40 text-cyan-400'
                            : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200',
                        ].join(' ')
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.2 text-[9px] font-bold text-cyan-400">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* =====================================================
          BOTTOM SECTION
      ====================================================== */}
      <div className="space-y-1.5 border-t border-slate-800 p-2.5 bg-slate-950 shrink-0">
        <div className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/30 p-2 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
              <RoleIcon size={14} />
            </div>

            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {roleStyle.label}
              </p>
            </div>
          </div>
        </div>

        {/* SIGN OUT BUTTON */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="
            flex w-full cursor-pointer items-center justify-center gap-2
            rounded-lg border border-red-500/20 bg-red-950/10
            px-2.5 py-1.5 text-xs font-medium text-red-400
            transition-colors hover:bg-red-900/30 hover:text-red-200
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {isLoggingOut ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <LogOut size={13} />
          )}
          <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </div>
    </aside>
  );
};
