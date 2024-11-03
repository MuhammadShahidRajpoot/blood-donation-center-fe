import React from 'react';
import Layout from '../../../../components/common/layout';
import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../../enums/StaffingPermissionsEnum';
import ViewDepartSchedule from '../../../../components/staffing-management/view-schedule/depart-schedule/ViewDepartSchedule';
const DepartScheduleView = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.STAFF_LIST.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <ViewDepartSchedule />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default DepartScheduleView;
