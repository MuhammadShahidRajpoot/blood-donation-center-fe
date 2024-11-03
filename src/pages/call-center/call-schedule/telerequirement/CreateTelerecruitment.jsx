import React from 'react';
import Layout from '../../../../components/common/layout';
import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import TelerecruitmentBulkCreate from '../../../../components/call-center/call-schedule/telerequirements/TelerecruitmentBulkCreate';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';

const CreateTelerecuirement = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <TelerecruitmentBulkCreate />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default CreateTelerecuirement;
