import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const staffSetup = {
  getStaffSetupForBlueprint: async (params) => {
    let url = BASE_URL + `/staffing-admin/staff-setup/blueprint/donor_center`;
    url += '?' + new URLSearchParams(params).toString();
    return await axios.get(url);
  },
  getStaffSetupForSessions: async (params) => {
    let url = BASE_URL + `/staffing-admin/staff-setup/sessions`;
    url += '?' + new URLSearchParams(params).toString();
    return await axios.get(url);
  },
  getStaffSetupUtilizationForDrives: async (params) => {
    let url = BASE_URL + `/staffing-admin/staff-setup/drive/utilized`;
    url += '?' + new URLSearchParams(params).toString();
    return await axios.get(url);
  },
  getStaffSetupUtilizationForSessions: async (params) => {
    let url = BASE_URL + `/staffing-admin/staff-setup/sessions/utilized`;
    url += '?' + new URLSearchParams(params).toString();
    return await axios.get(url);
  },
};
