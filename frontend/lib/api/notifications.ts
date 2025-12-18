import { axiosInstance } from '../axios';
import { Notification } from '@/domain/notifications/type';

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get('/api/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get('/api/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.put(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.put('/api/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/notifications/${id}`);
  },
};
