import React, { useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Megaphone, Plus, Search } from 'lucide-react';

import { useAuth } from '@/services/auth/hooks/useAuth';
import { UserRole } from '@/enum/role';
import { UserPermission } from '@/enum/user_permission.enum';

import { NAV_SECTIONS, type NavItem, type NavSection } from './NavItems';
import { UduaKietLogo } from '@/common/AppLogo';
import { NavSections } from './NavSections';
import { useNotice } from '@/services/auth/context/NoticeContext';

export const SideNav: React.FC = () => {
  const { user } = useAuth();
  const { notices, currentUserId } = useNotice();
  const location = useLocation();

  const currentRole = user?.role?.name ?? UserRole.CASHIER;

  const pendingNoticeCount = notices.filter(
    (notice) =>
      notice.requiresAcknowledgment &&
      !notice.acknowledgedUserIds.includes(currentUserId),
  ).length;

  const userPermissions = useMemo(
    () =>
      new Set<UserPermission>(
        user?.role?.rolePermissions?.map(
          (rolePermission) => rolePermission.permission.name as UserPermission,
        ) ?? [],
      ),
    [user?.role?.rolePermissions],
  );

  const hasPermission = useCallback(
    (permission: UserPermission): boolean => userPermissions.has(permission),
    [userPermissions],
  );

  const canAccessNavItem = useCallback(
    (item: NavItem): boolean => {
      if (!item.permissions?.length) return true;

      return item.permissionMode === 'any'
        ? item.permissions.some(hasPermission)
        : item.permissions.every(hasPermission);
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

  // Announcement publishing currently has no dedicated permission.
  const canPublishNotice = currentRole === UserRole.SUPER_ADMIN;

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
      <div className="space-y-4">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-lime-400 shadow-sm">
            <UduaKietLogo className="h-5 w-5" />
          </div>

          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              UduaKiet
            </span>
            <p className="text-[10px] font-medium text-slate-500">
              Inventory System
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative px-1">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />

          <input
            type="text"
            placeholder="Search inventory..."
            aria-label="Search inventory"
            className="w-full rounded-xl border border-slate-200/80 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        {/* NAVIGATION */}
        <NavSections visibleSections={visibleSections} />
      </div>

      {/* BOTTOM SECTION */}
      <div className="space-y-1 border-t border-slate-200/60 px-1 pt-2">
        {/* NOTICE BOARD */}
        <Link
          to="/notices/feeds"
          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
            location.pathname.startsWith('/notices')
              ? 'bg-[#EBEBE2] text-slate-900'
              : 'text-slate-600 hover:bg-[#EBEBE2]/70 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Megaphone className="h-3.5 w-3.5 text-slate-500" />
            <span>Notice Board</span>
          </span>

          {pendingNoticeCount > 0 && (
            <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pendingNoticeCount}
            </span>
          )}
        </Link>

        {/* PUBLISH ANNOUNCEMENT */}
        {canPublishNotice && (
          <Link
            to="/notices/publish"
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
              location.pathname === '/notices/publish'
                ? 'bg-[#EBEBE2] font-bold text-slate-900'
                : 'text-slate-500 hover:bg-[#EBEBE2]/40 hover:text-slate-900'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-slate-400" />
            <span>Publish Announcement</span>
          </Link>
        )}

        {/* USER PROFILE */}
        <div className="mt-1 flex items-center gap-2.5 border-t border-slate-200/60 pt-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            {user?.first_name?.charAt(0) ?? 'U'}
          </div>

          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-bold text-slate-900">
              {user?.first_name ?? 'Account'}
            </p>

            <p className="truncate text-[10px] capitalize text-slate-500">
              {currentRole.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
