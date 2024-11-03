import React from 'react';
import Layout from '../../../components/common/layout';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import ModifyRoleTimeDetails from '../../../components/staffing-management/build-schedule/build-schedule-details/modify-rtd/ModifyRoleTimeDetails';

const ModifyRTD = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <ModifyRoleTimeDetails />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ModifyRTD;
