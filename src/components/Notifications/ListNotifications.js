import React from 'react';
import ListNotification from '../common/notifications/ListNotification';

const ListNotifications = () => {
  const BreadcrumbsData = [
    {
      label: 'Notifications',
      class: 'active-label',
      link: '/system-configuration/notifications',
    },
  ];

  return (
    <ListNotification
      taskableType={null}
      taskableId={null}
      breadCrumbsData={BreadcrumbsData}
    />
  );
};

export default ListNotifications;
