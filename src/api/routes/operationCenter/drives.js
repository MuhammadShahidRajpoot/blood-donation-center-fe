import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const drives = {
  getAccountBlueprints: async (id) => {
    let url = BASE_URL + `/drives/blueprints/account/${id}`;
    return await axios.get(url);
  },
  getAccountDrives: async (id) => {
    let url = BASE_URL + `/drives/list/account/${id}`;
    return await axios.get(url);
  },
  getSingle: async (id) => {
    let url = BASE_URL + `/drives/single/${id}`;
    return await axios.get(url);
  },
  getShiftDetails: async (id) => {
    let url = BASE_URL + `/drives/shift/${id}`;
    return await axios.get(url);
  },
  getDriveData: async (id) => {
    let url = BASE_URL + `/drives/${id}`;
    return await axios.get(url);
  },
  archive: async (id) => {
    return await axios.delete(`${BASE_URL}/drives/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },
  getUserData: async (id) => {
    return await axios.get(`${BASE_URL}/user/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  updateSessionResult: async (body, params, operationable_type) => {
    const { id, shift_id, procedure_type_id } = params;
    return await axios.put(
      `${BASE_URL}/operations/sessions/${id}/results/${shift_id}/projections/${procedure_type_id}?operationable_type=${operationable_type}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },
};
