import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const ocApprovals = {
  singleGet: async (token, id) => {
    return await axios.get(`${BASE_URL}/operations/approvals/${id}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  list: async (token) => {
    return await axios.get(`${BASE_URL}/operations/approvals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  archive: async (token, id) => {
    return await axios.patch(`${BASE_URL}/operations/approvals/archive/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateApprovalDetail: async (token, id, body) => {
    return await axios.put(
      `${BASE_URL}/operations/approvals/${id}/approval-details`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
