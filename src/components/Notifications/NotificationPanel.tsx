import React, { useMemo, useState, type UIEvent } from 'react';
import {
  CheckCircle2,
  Inbox,
  ArrowUpRight,
  Package,
  ShoppingCart,
  TrendingDown,
  Info,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useInfiniteNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useUnreadCount,
} from '@/hooks/useNotification.hook';
import type { INotification } from '@/interfaces/notifications.interface';

export const NotificationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

  // Determine if we should filter by unread in the API call
  const isReadFilter = activeTab === 'unread' ? false : undefined;

  // 1. Fetch infinite notifications using cursor-based pagination
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications(isReadFilter);

  // 2. Fetch total unread count for badge display
  const { data: unreadCount = 0 } = useUnreadCount();

  // 3. Mutations for marking items as read
  const markOneMutation = useMarkNotificationAsRead();
  const markAllMutation = useMarkAllNotificationsAsRead();

  // Flatten pages array returned by useInfiniteQuery into a single array
  const notifications = useMemo<INotification[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.notifications ?? []);
  }, [data]);

  // Handle scroll event to trigger fetchNextPage when user reaches bottom
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (
      scrollHeight - scrollTop <= clientHeight + 30 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = (id: string) => {
    if (markOneMutation.isPending && markOneMutation.variables === id) {
      return;
    }
    markOneMutation.mutate(id);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    if (markAllMutation.isPending) return;
    markAllMutation.mutate();
  };

  // Resolve badge icon and styling
  const getEventBadge = (type: string) => {
    const lower = (type || '').toLowerCase();

    if (lower.includes('stock') || lower.includes('inventory')) {
      return {
        icon: TrendingDown,
        badgeClass: 'bg-amber-100 text-amber-700',
        label: 'Stock Alert',
      };
    }

    if (lower.includes('order') || lower.includes('purchase')) {
      return {
        icon: ShoppingCart,
        badgeClass: 'bg-blue-100 text-blue-700',
        label: 'Order',
      };
    }

    if (lower.includes('sale') || lower.includes('pos')) {
      return {
        icon: Package,
        badgeClass: 'bg-[#EBEBE2] text-slate-800',
        label: 'Transaction',
      };
    }

    return {
      icon: Info,
      badgeClass: 'bg-slate-100 text-slate-600',
      label: type.replace('_', ' '),
    };
  };

  return (
    <div className="h-full flex flex-col space-y-4 select-none overflow-hidden">
      {/* 1. FILTER TABS & BULK ACTIONS */}
      <div className="space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Activity Stream
          </h4>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllMutation.isPending}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {markAllMutation.isPending ? 'Marking read...' : 'Mark all read'}
            </button>
          )}
        </div>

        <div className="flex bg-[#ECECE3] p-1 rounded-xl gap-1 border border-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({notifications.length})
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE NOTIFICATION FEED WITH INFINITE SCROLL */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-4"
      >
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-600" />
            <p className="text-xs font-medium">Loading notifications...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Couldn't load notifications
            </p>
            <p className="text-[10px] text-slate-400">
              Check your connection and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80 p-4 space-y-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              No {activeTab} notifications
            </p>
            <p className="text-[10px] text-slate-400">
              All inventory alerts and system logs are cleared.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((item) => {
              const badge = getEventBadge(item.type);
              const BadgeIcon = badge.icon;

              const isProcessing =
                markOneMutation.isPending &&
                markOneMutation.variables === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-3.5 rounded-2xl border transition-all ${
                    !item.is_read
                      ? 'border-slate-300 shadow-2xs'
                      : 'border-slate-200/80 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 capitalize ${badge.badgeClass}`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5" />
                      {badge.label}
                    </span>

                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    {item.data?.link ? (
                      <Link
                        to={item.data.link}
                        className="text-[11px] font-bold text-slate-800 hover:text-slate-900 flex items-center gap-1"
                      >
                        <span>View item</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Store: {item.store_id || 'Global'}
                      </span>
                    )}

                    {!item.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        disabled={isProcessing || markAllMutation.isPending}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isProcessing ? 'Saving...' : 'Done'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator at Bottom during Infinite Scroll Fetch */}
            {isFetchingNextPage && (
              <div className="py-3 text-center flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                <span className="text-[11px] font-medium">
                  Loading more activity...
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
