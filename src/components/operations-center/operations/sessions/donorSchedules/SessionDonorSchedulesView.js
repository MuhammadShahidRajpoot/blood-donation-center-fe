import React, { useState } from 'react';
// import NavigationTopBar from '../../../../common/NavigationTopBar';
// import viewimage from '../../../../../assets/images/viewimage.png';
import TopBar from '../../../../common/topbar/index';
import { useParams } from 'react-router-dom';
// import DriveViewNavigationTabs from '../navigationTabs';
// import { toast } from 'react-toastify';
// import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_SESSIONS_PATH,
  OPERATIONS_CENTER_SESSIONS_PATH_DONOR_SCHEDULE,
} from '../../../../../routes/path';
import OperationCenterDonorSchedules from './OperationCenterDonorSchedules';
import SessionsNavigationTabs from '../navigationTabs';
import Session from '../Session';

export default function SessionDonorSchedulesView() {
  const [sessionDataOne, setSessionDataOne] = useState(null);
  const { id } = useParams();
  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Operations',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: 'Sessions',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: 'View Session',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH_DONOR_SCHEDULE.LIST.replace(
        ':id',
        id
      ),
    },
    {
      label: 'Donor Schedule',
      class: 'active-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH_DONOR_SCHEDULE.LIST.replace(
        ':id',
        id
      ),
    },
  ];

  return (
    <div>
      <div className="mainContent ">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Donor Schedule'}
          SearchValue={null}
          SearchOnChange={null}
          SearchPlaceholder={null}
        />
        <div className="imageContentMain">
          <Session data={sessionDataOne} />
          <div className="tabsnLink">
            <SessionsNavigationTabs />
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <OperationCenterDonorSchedules setSessionDataOne={setSessionDataOne} />
      </div>
    </div>
  );
}
