import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const manageScripts = {
  createCallScript: async (body) => {
    console.log({ body });
    return await axios.post(`${BASE_URL}/call-center/scripts`, body);
  },
  updateCallScript: async (body, script_id) => {
    console.log({ body });
    return await axios.put(
      `${BASE_URL}/call-center/scripts/${script_id}`,
      body
    );
  },
  getCallScripts: async (query) => {
    return await axios.get(`${BASE_URL}/call-center/scripts?${query}`);
  },
  getScript: async (scriptId) => {
    return await axios.get(`${BASE_URL}/call-center/scripts/${scriptId}`);
  },
  archiveCallScript: async (callScriptId) => {
    return await axios.patch(`${BASE_URL}/call-center/scripts/${callScriptId}`);
  },
};
