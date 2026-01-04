import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Notification } from '../types';

export const notificationService = {
  /**
   * Get all notifications
   */
  getAll: () =>
    apiClient.get<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST),

  /**
   * Mark notification as read
   */
  markAsRead: (id: string) =>
    apiClient.post<Notification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    apiClient.post<void>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
};
