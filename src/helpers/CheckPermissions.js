import jwt from 'jwt-decode';
import {
  AGENT_PERMISSIONS,
  LEAD_PERMISSIONS,
  MANAGER_PERMISSIONS,
} from './constants';

const CheckPermission = (
  permissionsArray = null,
  modulePermission = null,
  applicationPermission = null
) => {
  const jwtToken = localStorage.getItem('token');
  let decodeToken = null;
  if (jwtToken) {
    decodeToken = jwt(jwtToken);
  }
  const token = decodeToken;

  if (permissionsArray) {
    const isPermission = permissionsArray?.some((perm) =>
      token?.permissions?.includes(perm)
    );
    if (isPermission) {
      return true;
    } else {
      return false;
    }
  }
  if (modulePermission) {
    const isPermission = modulePermission?.some((perm) =>
      token?.modules?.includes(perm)
    );
    if (isPermission) {
      return true;
    } else {
      return false;
    }
  }
  if (applicationPermission) {
    const isPermission = applicationPermission?.some((perm) =>
      token?.applications?.includes(perm)
    );
    if (isPermission) {
      return true;
    } else {
      return false;
    }
  }
};
export const CheckDisabledPermission = (code, role) => {
  if (role === 'manager') {
    return MANAGER_PERMISSIONS.includes(code);
  } else if (role === 'lead') {
    return LEAD_PERMISSIONS.includes(code);
  } else if (role === 'agent') {
    return AGENT_PERMISSIONS.includes(code);
  }
};

export default CheckPermission;

export function filterSystemConfiguration(
  systemConfigurationNewRoutes,
  modules
) {
  const filteredConfig = {};

  for (const key in systemConfigurationNewRoutes) {
    if (
      Object.prototype.hasOwnProperty.call(systemConfigurationNewRoutes, key)
    ) {
      const moduleObj = systemConfigurationNewRoutes[key];
      filteredConfig[key] = [];

      for (const moduleKey in moduleObj) {
        if (Object.prototype.hasOwnProperty.call(moduleObj, moduleKey)) {
          const module = moduleObj[moduleKey];
          if (modules.includes(module.code)) {
            filteredConfig[key].push(module);
          }
        }
      }
    }
  }
  return filteredConfig;
}
