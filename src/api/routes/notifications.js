import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const notificationsApi = {
  getAllNotifications: async (query) => {
    return await axios.get(`${BASE_URL}/notifications?${query}`);
  },

  markAllNotificationsAsRead: async (query) => {
    return await axios.put(`${BASE_URL}/notifications/markAllAsRead`);
  },

  markSingleNotificationAsRead: async (id) => {
    return await axios.put(`${BASE_URL}/notifications/markAllAsRead/${id}`);
  },
};
