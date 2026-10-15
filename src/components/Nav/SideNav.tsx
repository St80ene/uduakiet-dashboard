import React, { useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Megaphone, Plus, Search } from 'lucide-react';

import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserRole } from '@/enum/role';
import { UserPermission } from '@/enum/user_permission.enum'; // Updated import

import { NAV_SECTIONS, type NavItem, type NavSection } from './NavItems';
import { UduaKietLogo } from '@/common/AppLogo';
import { NavSections } from './NavSections';
import { useNotice } from '@/services/auth/context/NoticeContext';

export const SideNav: React.FC = () => {
  const { user } = useAuth();
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
      new Set<UserPermission>(
        user?.role?.rolePermissions?.map(
          (role_permission) =>
            role_permission.permission.name as UserPermission,
        ) ?? [],
      ),
    [user?.role?.rolePermissions],
  );

  const hasPermission = useCallback(
    (permission: UserPermission): boolean => {
      if (isSuperAdmin) return true;
      return userPermissions.has(permission);
    },
    [isSuperAdmin, userPermissions],
  );

  const canAccessNavItem = useCallback(
    (item: NavItem): boolean => {
      if (!item.permissions || item.permissions.length === 0) return true;
      if (item.permissionMode === 'any') {
        return item.permissions.some(hasPermission);
      }
      return item.permissions.every(hasPermission);
    },
    [hasPermission],
  );

  const visibleSections: NavSection[] = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(canAccessNavItem),
      })).filter((section) => section.items.length > 0),
    [canAccessNavItem],
  );

  return (
    <aside
      aria-label="Main Navigation"
      className="
        flex h-full w-64 shrink-0
        select-none flex-col justify-between
        border-r border-slate-200/70
        bg-[#F7F6F0]
        text-slate-700
        px-3 py-4 overflow-hidden
      "
    >
      {/* ================= TOP SECTION: BRAND & NAVIGATION ================= */}
      <div className="space-y-4">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lime-400 shadow-sm">
            <UduaKietLogo className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-slate-900 text-base">
              UduaKiet
            </span>
            <p className="text-[10px] text-slate-500 font-medium">
              Inventory System
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative px-1">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all shadow-2xs"
          />
        </div>

        {/* COLLAPSIBLE PAGE CATEGORIES */}
        <NavSections visibleSections={visibleSections} />
      </div>

      {/* ================= BOTTOM SECTION: ANNOUNCEMENTS & USER ================= */}
      <div className="pt-2 border-t border-slate-200/60 space-y-1 px-1">
        {/* NOTICE BOARD FULL FEED LINK */}
        <Link
          to="/notices/feeds"
          className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
            location.pathname.startsWith('/notices')
              ? 'bg-[#EBEBE2] text-slate-900'
              : 'text-slate-600 hover:bg-[#EBEBE2]/70 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-3.5 h-3.5 text-slate-500" />
            <span>Notice Board</span>
          </div>
          {pendingNoticeCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingNoticeCount}
            </span>
          )}
        </Link>

        {/* PUBLISH ANNOUNCEMENT ACTION (Super Admin or Authorized) */}
        {isSuperAdmin && (
          <Link
            to="/notices/publish"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors text-[11px] font-medium ${
              location.pathname === '/notices/publish'
                ? 'bg-[#EBEBE2] text-slate-900 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-[#EBEBE2]/40'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Publish Announcement</span>
          </Link>
        )}

        {/* USER PROFILE INFO */}
        <div className="pt-2 mt-1 border-t border-slate-200/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {user?.first_name ?? 'U'}
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.first_name ?? 'Account'}
            </p>
            <p className="text-[10px] text-slate-500 capitalize truncate">
              {currentRole.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
