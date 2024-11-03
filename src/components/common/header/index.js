import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import Notification from '../../../assets/Vector.svg';
import TaskPopUp from '../../../assets/Task-popup.svg';
import Logo from '../../../assets/logo.svg';
import { useNavigate } from 'react-router';
// import { useAuth } from '../../../components/common/context/AuthContext';
import SvgComponent from '../SvgComponent';
import { Link } from 'react-router-dom';
import jwt from 'jwt-decode';
import Permissions from '../../../enums/PermissionsEnum.js';
import CheckPermission from '../../../helpers/CheckPermissions.js';
import CrmPermissions from '../../../enums/CrmPermissionsEnum.js';
import ApplicationPermissions from '../../../enums/ApplicationPermissionsEnum.js';
import MainNotification from '../notifications/MainNotification.js';
import { CRM, OPERATIONS_CENTER } from '../../../routes/path.js';
import { useWebSocket } from '../WebSocketContext/WebSocketContext.js';
const Header = () => {
  const navigate = useNavigate();
  // const { authenticated } = useAuth();
  const [userData, setUserData] = useState({});
  const jwtToken = localStorage.getItem('token');
  const decodeToken = jwt(jwtToken);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLogoutVisible, setLogoutVisible] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(
    localStorage.getItem('notification_count') ?? 0
  );
  const socket = useWebSocket();

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowNotificationPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = (data) => {
        const prevCount = localStorage.getItem('notification_count');
        localStorage.setItem('notification_count', +prevCount + 1);
        setNotificationCount(+prevCount + 1);
      };

      const handleAllReadNotification = (data) => {
        localStorage.setItem('notification_count', 0);
        setNotificationCount(0);
      };

      const handleSingleReadNotification = (data) => {
        const prevCount = localStorage.getItem('notification_count') ?? 0;
        if (prevCount > 0) {
          localStorage.setItem('notification_count', +prevCount - 1);
        }
      };

      socket.on('all_read_notification', handleAllReadNotification);
      socket.on('single_read_notification', handleSingleReadNotification);
      socket.on('notification', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('all_read_notification', handleAllReadNotification);
        socket.off('single_read_notification', handleSingleReadNotification);
      };
    }
  }, [socket]);

  const path = window.location.pathname;
  const numberOfSlashes = (path.match(/\//g) || []).length;

  const toggleLogout = () => {
    setLogoutVisible(!isLogoutVisible);
  };

  const [showNavbar, setShowNavbar] = React.useState(false);

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setLogoutVisible(false);
      }
    }

    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  useEffect(() => {
    const getData = async (id) => {
      try {
        if (id) {
          const result = await fetch(`${BASE_URL}/user/${id}`, {
            headers: { authorization: `Bearer ${jwtToken}` },
          });

          if (result?.status === 200) {
            let { data } = await result.json();
            localStorage.setItem(
              'userFullName',
              data?.first_name + ' ' + data?.last_name
            );
            setUserData({ ...data, role: data?.role?.name });
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (decodeToken?.id) {
      getData(decodeToken?.id);
    }
  }, []);

  const getInitials = () => {
    const firstNameInitial = userData?.first_name ? userData.first_name[0] : '';
    const lastName = userData?.last_name || '';
    const lastNameInitial = lastName.split(' ').pop()[0];
    return `${firstNameInitial}${lastNameInitial}`;
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      localStorage.setItem('isLogout', true);
      navigate('/login');
      // authenticated.logout();
    } catch (e) {
      console.log(e);
    }
  };
  const navigatePath = () => {
    navigate('/system-configuration/tasks');
  };

  const toggleNotification = () => {
    setShowNotificationPopup(!showNotificationPopup);
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <div
          className={`${styles.logo} ${
            numberOfSlashes > 1 ? '' : styles.isDashBoard
          }`}
        >
          <Link to="/tenant-dashboard">
            <img src={Logo} alt="logo" />
          </Link>
        </div>
        <div className="menu-icon" onClick={handleShowNavbar}>
          <SvgComponent name={'DashboardIcon'} />
        </div>
      </div>

      <div className={styles.right}>
        {!decodeToken?.super_admin && (
          <div
            className={`${styles.topMenu} ${
              showNavbar ? 'active' : ''
            } nav-elements`}
          >
            <div>
              {CheckPermission(null, null, [
                CrmPermissions.CRM.APPLICATION_CODE,
              ]) && (
                <Link
                  to={CRM.DASHBOARD}
                  className={path.includes('crm/') ? styles.active : ''}
                >
                  <SvgComponent name={'TopMenuCRMIcon'} />
                  CRM
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [ApplicationPermissions.Flow]) && (
                <Link to="#">
                  <SvgComponent name={'TopMenuFlowIcon'} />
                  Flow
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.CALL_CENTER_MANAGER,
              ]) && (
                <Link
                  to="/call-center/dashboard"
                  className={path.includes('call-center/') ? styles.active : ''}
                >
                  <SvgComponent name={'TopMenuCallCenterIcon'} />
                  Call Center
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.OPERATION_CENTER,
              ]) && (
                <Link
                  to={OPERATIONS_CENTER.DASHBOARD}
                  className={
                    path.includes('operations-center') ? styles.active : ''
                  }
                >
                  <SvgComponent name={'TopMenuOperationCenterIcon'} />
                  Operations Center
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.STAFFING_MANAGEMENT,
              ]) && (
                <Link
                  to="/staffing-management/staff-list"
                  className={
                    path.includes('staffing-management') ? styles.active : ''
                  }
                >
                  <SvgComponent name={'TopMenuStaffingManagementIcon'} />
                  Staffing Management
                </Link>
              )}
            </div>

            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.REPORTS,
              ]) && (
                <Link to="#">
                  <SvgComponent name={'TopMenuReportsIcon'} />
                  Reports
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.DONOR_PORTAL,
              ]) && (
                <Link to="#">
                  <SvgComponent name={'TopMenuOperationCenterIcon'} />
                  Donor Portal
                </Link>
              )}
            </div>
            <div>
              {CheckPermission(null, null, [
                ApplicationPermissions.CHAIRPERSON_PORTAL,
              ]) && (
                <Link to="#">
                  <SvgComponent name={'TopMenuChairpersonPortalIcon'} />
                  Chairperson Portal
                </Link>
              )}
            </div>
            {CheckPermission(null, null, [
              Permissions.SYSTEM_CONFIGURATION.APPLICATION_CODE,
            ]) && (
              <div>
                <Link
                  to="/system-configuration"
                  className={
                    path.includes('system-configuration') ? styles.active : ''
                  }
                >
                  <SvgComponent name={'TopMenuSystemConfigurationIcon'} />
                  System Configurations
                </Link>
              </div>
            )}
          </div>
        )}
        <div
          className="d-flex align-items-center  mob-mr"
          style={{ marginLeft: 'auto' }}
        >
          {!decodeToken?.super_admin && (
            <div
              onClick={navigatePath}
              className={`me-3 ${styles.notification} ${styles.pointer}`}
            >
              <img src={TaskPopUp} className="" alt="notebook" />
            </div>
          )}
          <div className={styles.notification}>
            <div className={`me-3 ${styles.notification} ${styles.pointer}`}>
              {notificationCount > 0 && (
                <div
                  onClick={toggleNotification}
                  className={styles.notificationBadge}
                >
                  {notificationCount}
                </div>
              )}
              <img
                onClick={toggleNotification}
                src={Notification}
                className=""
                alt="notification"
              />
              {showNotificationPopup && (
                <div
                  ref={popupRef}
                  className={styles.listNotificationContainer}
                >
                  <MainNotification
                    notificationAsPopup={true}
                    closePopup={toggleNotification}
                  />
                </div>
              )}
            </div>
          </div>
          <div
            className={styles.optionsDropdown}
            ref={containerRef}
            onClick={toggleLogout}
          >
            {/* <img src={Avatar} alt="profile" />
             */}
            {userData?.first_name && userData?.last_name && (
              <div className={styles.avatar}>{getInitials()}</div>
            )}
            <span>{`${userData?.first_name ? userData.first_name : ''}  ${
              userData?.last_name ? userData.last_name : ''
            }`}</span>
            {isLogoutVisible && (
              <div className={styles.widget} onClick={handleLogout}>
                <SvgComponent name={'Logout'} />
                <p className="mb-0 ms-2">Logout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
