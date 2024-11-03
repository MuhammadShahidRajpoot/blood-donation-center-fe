import { API } from '../../src/api/api-routes.js';

const refreshToken = async () => {
  const userName = localStorage?.getItem('user_name');
  if (userName) {
    const response = await API.auth.refreshToken(userName);
    const data = await response?.data?.data;
    if (data?.token) {
      localStorage.setItem('token', data?.token);
    }
  }
};

const refreshTokenApi = async (lastUpdatedPermissiontimestamp) => {
  let difference = 0;
  const token = localStorage.getItem('token');
  const prevTime = localStorage.getItem('lastPermissionsUpdated');

  if (prevTime) {
    difference = new Date(lastUpdatedPermissiontimestamp) - new Date(prevTime);
  }
  if (token && (!prevTime || difference > 0)) {
    localStorage.setItem(
      'lastPermissionsUpdated',
      lastUpdatedPermissiontimestamp
    );
    await refreshToken();
    window.location.reload();
  }
};

export default refreshTokenApi;
