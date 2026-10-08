import { ROLE_CONFIG } from '@/common/role_config';
import { UserRole } from '@/enum/role';
import { useAuth } from '@/services/auth/hooks/useAuth';
import { Loader2, LogOut } from 'lucide-react';
import type { FC } from 'react';

export const NavFooter: FC<{
  handleLogout: () => void;
  isLoggingOut: boolean;
}> = ({ handleLogout, isLoggingOut }) => {
  const { user } = useAuth();
  const currentRole = user?.role?.name ?? UserRole.CASHIER;
  const roleStyle = ROLE_CONFIG[currentRole] ?? {
    label: 'Admin',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/20',
    border: 'border-cyan-500/30',
  };

  const RoleIcon = roleStyle.icon;
  const displayName = user?.first_name || 'Account';

  return (
    <div className="cursor-pointer space-y-1.5 border-t border-slate-800 p-2.5 bg-slate-950 shrink-0 text-slate-300">
      <div className="group flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900 p-2 text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Profile Picture or Role Icon Fallback */}
          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900 text-cyan-400">
            {user?.profile_picture?.url ? (
              <img
                src={user.profile_picture.url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <RoleIcon size={14} />
            )}
          </div>

          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-300 group-hover:text-white">
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
  );
};
