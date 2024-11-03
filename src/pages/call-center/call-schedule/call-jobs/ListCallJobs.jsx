import React from 'react';

import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import Layout from '../../../../components/common/layout';
import CallJobsList from '../../../../components/call-center/call-schedule/call-jobs/CallJobsList';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';
import CheckPermission from '../../../../helpers/CheckPermissions';

const ListCallJobs = () => {
  const hasPermission = CheckPermission(null, [
    CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallJobsList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ListCallJobs;
