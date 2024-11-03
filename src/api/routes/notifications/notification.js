import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const Notification = {
  send: async (body) => {
    return await axios.post(`${BASE_URL}/notifications`, body);
  },
};
