import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import styles from './index.module.scss';
import SvgComponent from '../SvgComponent';
import {
  CALL_CENTER,
  CALL_CENTER_CALL_SCHEDULE_CALL_JOBS,
  CALL_CENTER_DIALING_CENTER,
  CALL_CENTER_MANAGE_SCRIPTS,
  CALL_CENTER_MANAGE_SEGMENTS,
} from '../../../routes/path';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';

export default function CallCenterLeftNav() {
  const location = useLocation();
  const menuData = localStorage.getItem('menuItems');

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [openItems, setOpenItems] = useState([1]);
  const [activeItem, setActiveItem] = useState(null);
  useEffect(() => {
    if (menuData) {
      if (!openItems.includes(menuData)) {
        setOpenItems(JSON.parse(menuData));
      } else {
        const filteredOpenItems = openItems.filter((item) => item === menuData);
        setOpenItems(filteredOpenItems);
      }
    }
  }, [menuData]);

  const [isActive, setIsActive] = useState(false);

  const toggleClass = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const activeRoute = menuItems.find((item) =>
      location.pathname.includes(item.link)
    );

    if (activeRoute) {
      /* Doing below if statement to highlight accounts when
         user click on dashboard as it is not designed yet 
         Later this should be removed!
        */
      if (activeRoute.link === '/call-center/scripts') {
        setActiveItem(3);
        return;
      }
      setActiveItem(activeRoute.id);
    }
  }, [location.pathname]);

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    {
      id: 1,
      hasChild: false,
      name: 'Dashboard',
      iconName: 'DashboardIcon',
      link: CALL_CENTER.DASHBOARD,
      permission: [CallCenterPermissions.CALLCENTER.DASHBOARD.MODULE_CODE],
      child: {},
      abbrevation: 'DA',
    },
    {
      id: 2,
      hasChild: false,
      name: 'Call Schedule',
      iconName: 'TenetOnboardingIconSec',
      link: CALL_CENTER_CALL_SCHEDULE_CALL_JOBS.LIST,
      permission: [CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.MODULE_CODE],
      child: {},
      abbrevation: 'AC',
    },
    {
      id: 3,
      hasChild: false,
      iconName: 'CRMLocationIcon',
      name: 'Manage Scripts',
      link: CALL_CENTER_MANAGE_SCRIPTS.LIST,
      permission: [CrmPermissions.CRM.LOCATIONS.MODULE_CODE],
      child: {},
      abbrevation: 'LO',
    },
    {
      id: 4,
      hasChild: false,
      iconName: 'CRMDonorIcon',
      name: 'Manage Segments',
      link: CALL_CENTER_MANAGE_SEGMENTS.LIST,
      permission: [
        CallCenterPermissions.CALLCENTER.MANAGE_SEGMENTS.MODULE_CODE,
      ],
      child: {},
      abbrevation: 'DC',
    },
    {
      id: 5,
      hasChild: false,
      iconName: 'CRMNonCollectionsIcon',
      name: 'Dialing Center',
      link: CALL_CENTER_DIALING_CENTER.LIST,
      permission: [CallCenterPermissions.CALLCENTER.DIALING_CENTER.MODULE_CODE],
      child: {},
      abbrevation: 'DC',
    },
  ];

  const toggleChild = (itemId) => {
    if (openItems.includes(itemId)) {
      setOpenItems(openItems.filter((id) => id !== itemId));
      localStorage.setItem(
        'menuItems',
        JSON.stringify(openItems.filter((id) => id !== itemId))
      );
    } else {
      setOpenItems([...openItems, itemId]);
      localStorage.setItem('menuItems', JSON.stringify([...openItems, itemId]));
    }
  };

  useEffect(() => {
    if (window.innerWidth < 1100) {
      setIsMenuOpen(false);
    }
  }, []);

  const handleDivClick = (event) => {
    toggleMenu();
    toggleClass();
  };

  return (
    <>
      <div className={`${styles.mobileIcon}`} onClick={handleDivClick}>
        <SvgComponent name={`${isMenuOpen ? 'MenuCross' : 'NewHamburger'}`} />
      </div>
      <div
        className={`${styles.sidebarMain} ${isMenuOpen ? '' : styles.closed} ${
          isActive ? styles.active : ''
        }`}
        onClick={toggleClass}
      >
        <div className={styles.sidebarTop}>
          {isMenuOpen ? (
            <div className={`${styles.sidebarHeader}`}>
              <div className={`${styles.icon}`} onClick={toggleMenu}>
                <SvgComponent name={'Hamburger'} />
              </div>
              <h3>Call Center</h3>
            </div>
          ) : (
            <OverlayTrigger
              placement="right"
              overlay={(props) => <Tooltip {...props}>Call Center</Tooltip>}
            >
              <div
                className={`${styles.sidebarHeader} ${styles.sidebarIconPadding}`}
              >
                <div className={`${styles.icon} me-0`} onClick={toggleMenu}>
                  <SvgComponent name={'Hamburger'} />
                </div>
              </div>
            </OverlayTrigger>
          )}
          <div className={styles.sidebarBody}>
            <ul>
              {isMenuOpen
                ? menuItems.map((item) => {
                    const hasPermission = CheckPermission(
                      null,
                      item?.permission
                    );
                    if (hasPermission) {
                      return (
                        <li
                          className={`${styles?.menuItem}  ${
                            styles.openSideBar
                          } ${item?.hasChild ? styles.hasChildMain : ''} ${
                            activeItem === item?.id ? styles.active : ''
                          }
                      ${
                        item?.relevantLinks?.some((link) =>
                          window?.location?.pathname?.includes(link)
                        )
                          ? styles.active
                          : ''
                      } ${
                        openItems?.includes(item.id)
                          ? styles.open
                          : styles.close
                      }`}
                          id={`menuItem-${item?.id}`}
                          key={item?.id}
                          onClick={() => handleMenuClick(item?.id)}
                        >
                          {item?.hasChild ? (
                            <>
                              <Link
                                to={item.link}
                                onClick={() => toggleChild(item.id)}
                                className={
                                  item?.relevantLinks?.some((link) =>
                                    window?.location?.pathname?.includes(link)
                                  )
                                    ? `${styles.active}`
                                    : ''
                                }
                              >
                                <SvgComponent name={item.iconName} />
                                {item.name}
                              </Link>
                              <ul
                                className={`${styles.hasChild} ${
                                  openItems.includes(item.id)
                                    ? styles.open
                                    : styles.close
                                }`}
                              >
                                {item?.child?.map((childItem) => (
                                  <li
                                    key={childItem.id}
                                    className={`menuItem ${
                                      location?.pathname?.includes('goal') &&
                                      childItem?.link?.includes('goal')
                                        ? styles.active
                                        : ''
                                    }`}
                                    id={`menuItem-${childItem.id}`}
                                  >
                                    <NavLink
                                      to={childItem.link}
                                      className={({ isActive }) => {
                                        if (
                                          childItem.name === 'Classifications'
                                        ) {
                                          if (
                                            location?.pathname?.includes(
                                              'classifications/settings/list'
                                            ) ||
                                            location?.pathname?.includes(
                                              'classifications/list'
                                            )
                                          ) {
                                            return styles.active;
                                          }
                                        } else if (isActive) {
                                          return `${styles.active}`;
                                        } else {
                                          return '';
                                        }
                                      }}
                                    >
                                      {childItem.name}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <NavLink
                              to={item.link}
                              activeClassName={styles.active} // Apply the active class for the active link
                            >
                              <SvgComponent name={item.iconName} />
                              {item.name}
                            </NavLink>
                          )}
                        </li>
                      );
                    }
                  })
                : menuItems.map((item, key) => (
                    <OverlayTrigger
                      key={key}
                      // show={true}
                      placement="right"
                      overlay={(props) => (
                        <Tooltip {...props}>{item.name}</Tooltip>
                      )}
                    >
                      <li className={styles.menuItem} key={item.id}>
                        <Link to="#">
                          <SvgComponent name={item.iconName} />
                          {/* {item.abbrevation} */}
                        </Link>
                      </li>
                    </OverlayTrigger>
                  ))}
            </ul>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <span>
            {isMenuOpen ? (
              <>Content copyright &copy; 2024 Degree37 Platform</>
            ) : (
              <>Degree37</>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
