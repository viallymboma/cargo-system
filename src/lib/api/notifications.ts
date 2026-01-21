import apiClient, { handleApiError } from "./client";

// Types for notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
  relatedEntity?: string; // shipment ID, invoice ID, etc.
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}

export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * Backend: GET /notifications
   */
  getNotifications: async (filters?: {
    unreadOnly?: boolean;
    type?: 'info' | 'warning' | 'success' | 'error';
    limit?: number;
  }): Promise<Notification[]> => {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.unreadOnly !== undefined) params.unreadOnly = filters.unreadOnly;
      if (filters?.type) params.type = filters.type;
      if (filters?.limit) params.limit = filters.limit;

      const response = await apiClient.get<Notification[]>("/notifications", { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get notification by ID
   * Backend: GET /notifications/:id
   */
  getNotification: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.get<Notification>(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark notification as read
   * Backend: PATCH /notifications/:id/read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark all notifications as read
   * Backend: PATCH /notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete notification
   * Backend: DELETE /notifications/:id
   */
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get notification preferences
   * Backend: GET /notifications/preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.get<NotificationPreferences>("/notifications/preferences");
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update notification preferences
   * Backend: PATCH /notifications/preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    try {
      const response = await apiClient.patch<NotificationPreferences>("/notifications/preferences", preferences);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};