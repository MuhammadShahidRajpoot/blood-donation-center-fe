import React, { useState } from 'react';
import PersonalizedGreeting from '../../common/dashboards/PersonalizedGreeting';
import KeyPerformanceIndicators from './KeyPerformanceIndicators';
import { SchedulingForecast } from './SchedulingForecast';
import { DriveSchedule } from './DriveSchedule';
import { UpcomingPromotions } from './UpcomingPromotions';
import { OPERATIONS_CENTER } from '../../../routes/path';
import TopBar from '../../common/topbar/index';
import Styles from './styles.module.scss';

const Dashboard = () => {
  const [organizationalLevels, setOrganizationalLevels] = useState();

  return (
    <div>
      <TopBar
        BreadCrumbsData={[
          {
            label: 'Operations Center',
            class: 'disable-label',
            link: OPERATIONS_CENTER.DASHBOARD,
          },
          {
            label: 'Dashboard',
            class: 'active-label',
            link: OPERATIONS_CENTER.DASHBOARD,
          },
        ]}
        BreadCrumbsTitle={'Dashboard'}
      />
      <div className={Styles.dashboardPage}>
        <PersonalizedGreeting setOrgLevels={setOrganizationalLevels} />
        <KeyPerformanceIndicators orgLevels={organizationalLevels} />
        <div
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1 }}>
            <DriveSchedule orgLevels={organizationalLevels} />
          </div>
          <div style={{ flex: 1 }}>
            <UpcomingPromotions />
          </div>
        </div>
        <SchedulingForecast />
      </div>
    </div>
  );
};

export default Dashboard;
