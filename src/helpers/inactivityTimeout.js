import React, { useEffect } from 'react';
import { useAuth } from '../components/common/context/AuthContext';

const InactivityTimeout = ({ children }) => {
  const sessionTimeOutMins = process.env.REACT_APP_SESSION_TIME_OUT_MINS || 30;
  const inactivityTimeout = 60 * sessionTimeOutMins; // in seconds
  const { authenticated } = useAuth();

  const isUserInactive = () => {
    const lastActivityTime = localStorage.getItem('lastActivityTime');
    if (!lastActivityTime) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - lastActivityTime >= inactivityTimeout;
  };

  const autoLogout = () => {
    if (isUserInactive() && authenticated) {
      localStorage.clear();
      authenticated?.logout();
      localStorage.setItem('isLogout', true);
      window.location.href = '/login';
    }
  };

  const updateLastActivityTime = () => {
    localStorage.setItem('lastActivityTime', Math.floor(Date.now() / 1000));
  };

  useEffect(() => {
    if (authenticated) {
      const activityInterval = setInterval(
        autoLogout,
        (inactivityTimeout / 6) * 1000
      ); // in mili seconds
      return () => clearInterval(activityInterval);
    }
  }, [authenticated]);

  useEffect(() => {
    document.addEventListener('mousemove', updateLastActivityTime);
    document.addEventListener('keydown', updateLastActivityTime);

    return () => {
      document.removeEventListener('mousemove', updateLastActivityTime);
      document.removeEventListener('keydown', updateLastActivityTime);
    };
  }, []);

  return <>{children}</>;
};

export default InactivityTimeout;
