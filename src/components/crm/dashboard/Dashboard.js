import React from 'react';
import { CRM } from '../../../routes/path';
import Styles from './styles.module.scss';
import TopBar from '../../common/topbar/index';
import PersonalizedGreeting from '../../common/dashboards/PersonalizedGreeting';
// import PieChart from '../../common/dashboards/pie-chart/PieChart';
import DonorRetentionRate from './DonorRetentionRate';
import DonorsByStatus from './DonorsByStatus';
import ContactsByRole from './ContactsByRole';
import DonorFrequency from './DonorFrequency';

const Dashboard = () => {
  return (
    <div>
      <TopBar
        BreadCrumbsData={[
          {
            label: 'CRM',
            class: 'disable-label',
            link: CRM.DASHBOARD,
          },
          {
            label: 'Dashboard',
            class: 'active-label',
            link: CRM.DASHBOARD,
          },
        ]}
        BreadCrumbsTitle={'Dashboard'}
      />
      <div className={Styles.dashboardPage}>
        <PersonalizedGreeting showOrgLevelFilter={false} />
        <div className={Styles.flexbox}>
          <div className={Styles.column}>
            <DonorRetentionRate
              title={'New Donor Retention Rate YoY'}
              dataToDisplay={'new'}
            />
            <DonorsByStatus />
          </div>
          <div className={Styles.column}>
            <DonorFrequency />
            <DonorRetentionRate
              title={'Repeat Donor Retention Rate YoY'}
              dataToDisplay={'repeat'}
            />
          </div>
        </div>

        <ContactsByRole />
      </div>
    </div>
  );
};

export default Dashboard;
