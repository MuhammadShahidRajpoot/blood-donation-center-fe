import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const closedDateCalendar = {
  getIsClosedDate: async (params) => {
    const payload = new URLSearchParams(params).toString();
    return await axios.get(BASE_URL + `/close-dates/is_closed?${payload}`);
  },
};
