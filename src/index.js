import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './components/common/context/AuthContext';
import axios from 'axios';
import setupAxios from './api/setupAxios.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { OrganizationalLevelsProvider } from './Context/OrganizationalLevels.jsx';

import refreshTokenApi from './helpers/RefreshToken';
import Context from './Context/Context.jsx';
import { WebSocketProvider } from './components/common/WebSocketContext/WebSocketContext.js';
axios.interceptors.response.use(
  async (res) => {
    if (res?.data?.last_permissions_updated) {
      await refreshTokenApi(res.data.last_permissions_updated);
    }
    if (res?.data?.timezone) {
      localStorage.setItem('timeZone', res?.data?.timezone);
    }
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

const { fetch: originalFetch } = window;
window.fetch = async (...args) => {
  let [resource, config] = args;
  let response = await originalFetch(resource, config);

  const clonedResponse = response.clone();
  clonedResponse
    .json()
    .then(async (data) => {
      if (data?.last_permissions_updated) {
        await refreshTokenApi(data.last_permissions_updated);
      }
      if (data?.timezone) {
        localStorage.setItem('timeZone', data?.timezone);
      }
    })
    .catch((error) => {
      console.error('Error parsing response data:', error);
    });

  return response;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
setupAxios(axios);
root.render(
  // <React.StrictMode>
  <WebSocketProvider>
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <OrganizationalLevelsProvider>
          <Context>
            <App />
          </Context>
        </OrganizationalLevelsProvider>
      </LocalizationProvider>
    </AuthProvider>
  </WebSocketProvider>
  // </React.StrictMode>
);
