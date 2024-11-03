import React from 'react';

import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import Layout from '../../../../components/common/layout';
import CallJobsView from '../../../../components/call-center/call-schedule/call-jobs/CallJobsView';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';

const ViewCallJobs = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.READ,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallJobsView />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ViewCallJobs;
