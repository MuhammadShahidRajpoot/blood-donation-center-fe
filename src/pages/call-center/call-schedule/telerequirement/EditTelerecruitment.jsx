import React from 'react';
import Layout from '../../../../components/common/layout';
import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import CallJobUpsert from '../../../../components/call-center/call-schedule/call-jobs/CallJobUpsert';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';

const EditCallJob = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallJobUpsert />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default EditCallJob;
