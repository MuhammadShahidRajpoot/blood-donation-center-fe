import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const dailyCapacities = {
  getDailyCapacities: async (id, date) => {
    return await axios.get(
      BASE_URL +
        `/booking-drive/daily-capacity/byCollectionOperation/${id}?driveDate=${date}`
    );
  },
};
