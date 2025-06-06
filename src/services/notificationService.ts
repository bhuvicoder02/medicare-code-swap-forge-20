
import { apiRequest } from './api';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export const fetchUserNotifications = async (): Promise<Notification[]> => {
  try {
    console.log('Fetching user notifications');
    const response = await apiRequest('/notifications');
    return response || [];
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    console.log('Marking notification as read:', notificationId);
    const response = await apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    return response;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const createNotification = async (notificationData: {
  title: string;
  message: string;
  userId: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}): Promise<Notification> => {
  try {
    console.log('Creating notification:', notificationData);
    const response = await apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    });
    return response;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};
