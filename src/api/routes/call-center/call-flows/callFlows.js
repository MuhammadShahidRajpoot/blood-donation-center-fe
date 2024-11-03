import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const callFlows = {
  getCallFlows: async (query) => {
    return await axios.get(`${BASE_URL}/call-center/call-flows?${query}`);
  },
};
