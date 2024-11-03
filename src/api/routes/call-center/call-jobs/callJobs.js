import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const callJobs = {
  createCallJob: async (body) => {
    return await axios.post(`${BASE_URL}/call-center/call-jobs`, body);
  },
  updateCallJob: async (body, id) => {
    return await axios.put(`${BASE_URL}/call-center/call-jobs/${id}`, body);
  },
  fetchAssignedCallJobAgents: async (callJobId) => {
    return await axios.get(
      `${BASE_URL}/call-center/call-jobs/assign-agents/${callJobId}`
    );
  },
  createNote: async (body) => {
    return await axios.post(
      `${BASE_URL}/call-center/dialing-center/notes`,
      body
    );
  },
  getDonorDetails: async (donor_id) => {
    return await axios.get(
      `${BASE_URL}/call-center/dialing-center/donor/${donor_id}`
    );
  },
  getNotes: async (donor_id) => {
    return await axios.get(
      `${BASE_URL}/call-center/dialing-center/notes/${donor_id}`
    );
  },
  getOperationsDetails: async (operation_id) => {
    return await axios.get(
      `${BASE_URL}/call-center/dialing-center/operation-detail/${operation_id}`
    );
  },
  assignAgents: async (body, callJobId) => {
    return await axios.post(
      `${BASE_URL}/call-center/call-jobs/assign-agents/${callJobId}`,
      body
    );
  },
  unAssignAgents: async (body, callJobId, AgentId) => {
    return await axios.put(
      `${BASE_URL}/call-center/call-jobs/unassign/${callJobId}/${AgentId}`,
      body
    );
  },

  removeSegments: async (body, callJobId, CallSegmentId) => {
    return await axios.put(
      `${BASE_URL}/call-center/call-jobs/remove-segment/${callJobId}/${CallSegmentId}`,
      body
    );
  },

  addSegments: async (body, callJobId) => {
    return await axios.post(
      `${BASE_URL}/call-center/call-jobs/add-segments/${callJobId}`,
      body
    );
  },

  deactivateCallJob: async (callJobId) => {
    return await axios.put(
      `${BASE_URL}/call-center/call-jobs/call-schedule/deactivate/${callJobId}`
    );
  },
  fetchCallJob: async (id) => {
    return await axios.get(`${BASE_URL}/call-center/call-jobs/${id}`);
  },
};
