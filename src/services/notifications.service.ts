import type { IApiResponse } from '@/interfaces';
import apiClient from './api';
import type { INotification } from '@/interfaces/notifications.interface';

const NOTIFICATIONS_RESOURCE = '/notifications';

export interface NotificationsResponse {
  notifications: INotification[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}

export interface INotificationPaginationParams {
  cursor?: string; // ID of the last item from the previous page
  limit?: number; // Number of items per batch (default 20)
  isRead?: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationsService = {
  /**
   * Fetch paginated notifications for the current authenticated user
   */
  getAll: async (
    params: INotificationPaginationParams = {},
  ): Promise<NotificationsResponse> => {
    const response = await apiClient.get(NOTIFICATIONS_RESOURCE, {
      params: {
        cursor: params.cursor, // Sent only if defined
        limit: params.limit ?? 20,
        isRead: params.isRead,
      },
    });

    return response.data.data;
  },

  /**
   * Get total unread count for current user
   */
  getUnreadCount: async (): Promise<IApiResponse<UnreadCountResponse>> => {
    const response = await apiClient.get<IApiResponse<UnreadCountResponse>>(
      `${NOTIFICATIONS_RESOURCE}/unread-count`,
    );

    return response.data;
  },

  /**
   * Mark all notifications as read for current user
   */
  markAllAsRead: async (): Promise<IApiResponse<null>> => {
    const response = await apiClient.patch<IApiResponse<null>>(
      `${NOTIFICATIONS_RESOURCE}/read-all`,
    );

    return response.data;
  },

  /**
   * Mark a single notification as read by ID
   */
  markOneAsRead: async (id: string): Promise<IApiResponse<INotification>> => {
    const response = await apiClient.patch<IApiResponse<INotification>>(
      `${NOTIFICATIONS_RESOURCE}/${id}/read`,
    );

    return response.data;
  },
};

export const { getAll, getUnreadCount, markAllAsRead, markOneAsRead } =
  notificationsService;
