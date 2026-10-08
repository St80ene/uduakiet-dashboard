import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Megaphone } from 'lucide-react';

import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserRole } from '@/enum/role';

import { NAV_SECTIONS, type NavItem } from './NavItems';
import type { ViewPermission } from '@/enum/view_permission.enum';
import { UduaKietLogo } from '@/common/AppLogo';
import { NavFooter } from './NavFooter';
import { NavSections, type NavSectionsProps } from './NavSections';
import { useNotice } from '@/services/auth/context/NoticeContext';

export const SideNav: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { notices, currentUserId } = useNotice();
  const location = useLocation();

  const currentRole = user?.role?.name ?? UserRole.CASHIER;
  const isSuperAdmin = currentRole === UserRole.SUPER_ADMIN;

  const pendingNoticeCount = notices.filter(
    (n) =>
      n.requiresAcknowledgment &&
      !n.acknowledgedUserIds.includes(currentUserId),
  ).length;

  const userPermissions = useMemo(
    () =>
      new Set(
        user?.role?.rolePermissions?.map(
          (role_permission) => role_permission.permission.name,
        ) ?? [],
      ),
    [user?.role?.rolePermissions],
  );

  const hasViewPermission = useCallback(
    (permission: ViewPermission): boolean => {
      if (isSuperAdmin) return true;

      return userPermissions.has(permission);
    },
    [isSuperAdmin, userPermissions],
  );

  const canAccessNavItem = useCallback(
    (item: NavItem): boolean => {
      if (!item.permissions || item.permissions.length === 0) return true;
      if (item.permissionMode === 'any')
        return item.permissions.some(hasViewPermission);
      return item.permissions.every(hasViewPermission);
    },
    [hasViewPermission],
  );

  const visibleSections: NavSectionsProps[] = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(canAccessNavItem),
      })).filter((section) => section.items.length > 0),
    [canAccessNavItem],
  );

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
        <NavSections visibleSections={visibleSections} />

        {/* =====================================================
            NOTICE BOARD QUICK LINK SECTION
        ====================================================== */}
        <div className="px-3 py-3 mt-2 border-t border-slate-900/80">
          <Link
            to="/notices/feeds"
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group ${
              location.pathname.startsWith('/notices')
                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300'
                : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Notice Board</span>
            </div>
            {pendingNoticeCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {pendingNoticeCount}
              </span>
            )}
          </Link>
          {/* NEW: Publish Notice Button */}
          <Link
            to="/notices/publish"
            className={`flex items-center gap-2.5 px-3 py-3 mt-3 rounded-lg transition-colors text-xs font-medium ${
              location.pathname === '/notices/publish'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Publish Announcement</span>
          </Link>
        </div>
      </div>

      {/* =====================================================
          BOTTOM SECTION
      ====================================================== */}
      <NavFooter handleLogout={handleLogout} isLoggingOut={isLoggingOut} />
    </aside>
  );
};
