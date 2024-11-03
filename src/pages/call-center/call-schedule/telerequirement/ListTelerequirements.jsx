import React from 'react';

import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import Layout from '../../../../components/common/layout';
import TelerequirementsList from '../../../../components/call-center/call-schedule/telerequirements/TelerequirementsList';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';

const ListTelerequirements = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.READ,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <TelerequirementsList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ListTelerequirements;
