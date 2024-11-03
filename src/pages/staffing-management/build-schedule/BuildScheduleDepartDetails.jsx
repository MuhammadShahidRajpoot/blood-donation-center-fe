import React from 'react';
import Layout from '../../../components/common/layout';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import BuildScheduleDepartDetails from '../../../components/staffing-management/build-schedule/build-schedule-depart-schedule/BuildScheduleDepartDetails';
const BuildScheduleDepartDetailsPage = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <BuildScheduleDepartDetails />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default BuildScheduleDepartDetailsPage;
