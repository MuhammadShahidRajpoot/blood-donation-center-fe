import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const sessions = {
  create: async (payload) => {
    return await axios.post(BASE_URL + `/operations/sessions/create`, payload);
  },
  createMany: async (payloads) => {
    return await axios.post(
      BASE_URL + `/operations/sessions/create-many`,
      payloads
    );
  },
  update: async (id, payload) => {
    return await axios.put(
      BASE_URL + `/operations/sessions/${id}/update`,
      payload
    );
  },
  list: async (params) => {
    let url = BASE_URL + `/operations/sessions/list`;
    url += '?' + new URLSearchParams(params).toString();
    return await axios.get(url);
  },
  delete: async (id) => {
    return await axios.delete(BASE_URL + `/operations/sessions/${id}/delete`);
  },
  find: async (id) => {
    return await axios.get(BASE_URL + `/operations/sessions/${id}/find`);
  },
  copy: async (date, id) => {
    return await axios.get(
      BASE_URL + `/operations/sessions/find?date=${date}&donor_center_id=${id}`
    );
  },
  getShiftDetails: async (id) => {
    let url = BASE_URL + `/operations/sessions/shift/${id}`;
    return await axios.get(url);
  },
  getSessionData: async (id) => {
    let url = BASE_URL + `/operations/sessions/${id}`;
    return await axios.get(url);
  },
  getSessionFindOne: async (id) => {
    let url = BASE_URL + `/operations/sessions/${id}/find`;
    return await axios.get(url);
  },
  getPickup: async () => {
    let url =
      BASE_URL +
      `/operations/sessions/marketing-equipment/equipment?type=PICKUP`;
    return await axios.get(url);
  },
};
