import React from 'react';
import TopBar from '../topbar/index';
import MainNotification from './MainNotification';

const ListNotification = ({
  taskableType = null,
  taskableId = null,
  createTaskUrl,
  customTopBar,
  hideAssociatedWith,
  breadCrumbsData,
  tasksNotGeneric,
  calendarIconShowHeader,
  show = true,
  hideToBar = false,
  searchKeyword,
}) => {
  return (
    <div className="mainContent">
      {!hideToBar && (
        <TopBar
          BreadCrumbsData={breadCrumbsData}
          BreadCrumbsTitle={'Notifications'}
        />
      )}
      {!hideToBar && customTopBar && customTopBar}
      <div className="mainContentInner">
        <MainNotification notificationAsPopup={false} />
      </div>
    </div>
  );
};

export default ListNotification;
