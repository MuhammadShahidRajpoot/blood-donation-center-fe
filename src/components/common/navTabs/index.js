import React from 'react';
import { Link } from 'react-router-dom';
import SvgComponent from '../SvgComponent';

const NavTabs = ({
  tabs,
  currentLocation,
  editLink,
  editLinkName,
  buttonRight,
  marginBtmZero,
  classLinkName,
  alignItemsBottom = false,
  tabsClass,
  isEditDisabled,
}) => {
  return (
    <div
      className={`tabs ${marginBtmZero ? 'mb-0' : ''} ${
        tabsClass && tabsClass
      }`}
    >
      <div
        className={`d-flex justify-content-between ${
          alignItemsBottom ? 'align-items-end' : ''
        }`}
      >
        <ul>
          {tabs?.map((tab, index) =>
            tab ? (
              <li key={index}>
                <Link
                  to={tab.link}
                  className={`${
                    currentLocation === tab.link ||
                    tab?.relevantLinks?.some((link) =>
                      window.location.pathname.includes(link)
                    )
                      ? 'active'
                      : ''
                  } ${tab.className || ''}`}
                  onClick={(e) => {
                    if (!tab.link) {
                      e.preventDefault();
                    }
                  }}
                >
                  {tab.label}
                </Link>
              </li>
            ) : (
              ''
            )
          )}
        </ul>
        {editLink && (
          <div className={`buttons `}>
            <Link className={`${classLinkName}`} to={editLink}>
              <span className={`icon`}>
                {isEditDisabled ? (
                  <SvgComponent name="EditIconDisabled" />
                ) : (
                  <SvgComponent name="EditIcon" />
                )}
              </span>
              <span className={`text ${classLinkName} `}>{editLinkName}</span>
            </Link>
          </div>
        )}
        {buttonRight && buttonRight}
      </div>
    </div>
  );
};

export default NavTabs;
