import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  getAll,
  getUnreadCount,
  markAllAsRead,
  markOneAsRead,
} from '@/services/notifications.service';

import type { INotification } from '@/interfaces/notifications.interface';

const NOTIFICATIONS_KEY = ['notifications'] as const;

interface NotificationsPage {
  notifications: INotification[];
}

type NotificationsInfiniteData = InfiniteData<NotificationsPage>;

export const notificationKeys = {
  all: NOTIFICATIONS_KEY,
  lists: () => [...NOTIFICATIONS_KEY, 'list'] as const,
  list: (isRead?: boolean) =>
    [...NOTIFICATIONS_KEY, 'list', { isRead }] as const,
  unreadCount: () => [...NOTIFICATIONS_KEY, 'unread-count'] as const,
};

// 1. Replaced useQuery with useInfiniteQuery for infinite scrolling
export function useInfiniteNotifications(isRead?: boolean, limit = 20) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(isRead),
    queryFn: ({ pageParam }) =>
      getAll({
        cursor: pageParam as string | undefined,
        limit,
        isRead,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage
        ? (lastPage.meta.nextCursor ?? undefined)
        : undefined,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await getUnreadCount();
      return response.data?.unreadCount ?? 0;
    },
    enabled, // Only runs the query if enabled is true
    retry: 1,
    refetchInterval: 30_000, // poll every 30s
    refetchIntervalInBackground: false,
  });
}

// 2. Updated mutation to handle infinite query cache structure (pages array)
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markOneAsRead(id),

    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: notificationKeys.lists(),
        }),
        queryClient.cancelQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);

      const previousLists = queryClient.getQueriesData({
        queryKey: notificationKeys.lists(),
      });

      const previousUnreadCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount(),
      );

      let wasUnread = false;

      // Update infinite query data structure across all list keys (e.g. unread vs all tabs)
      queryClient.setQueriesData<NotificationsInfiniteData>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page) => {
              const notification = page.notifications.find(
                (item: INotification) => item.id === id,
              );

              if (notification && !notification.is_read) {
                wasUnread = true;
              }

              return {
                ...page,
                notifications: page.notifications.map((item: INotification) =>
                  item.id === id ? { ...item, is_read: true } : item,
                ),
              };
            }),
          };
        },
      );

      if (wasUnread && previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          Math.max(0, previousUnreadCount - 1),
        );
      }

      return { previousLists, previousUnreadCount };
    },

    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousUnreadCount,
        );
      }
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),

    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: notificationKeys.lists(),
        }),
        queryClient.cancelQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);

      const previousLists = queryClient.getQueriesData({
        queryKey: notificationKeys.lists(),
      });

      const previousUnreadCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount(),
      );

      queryClient.setQueriesData<NotificationsInfiniteData>(
        { queryKey: notificationKeys.lists() },
        (old) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              notifications: page.notifications.map((item: INotification) => ({
                ...item,
                is_read: true,
              })),
            })),
          };
        },
      );

      queryClient.setQueryData(notificationKeys.unreadCount(), 0);

      return { previousLists, previousUnreadCount };
    },

    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });

      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousUnreadCount,
        );
      }
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: notificationKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}
