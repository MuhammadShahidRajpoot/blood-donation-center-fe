/* eslint-disable */

import React from 'react';
import Layout from '../../../components/common/layout';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import BuildScheduleStaffSchedule from '../../../components/staffing-management/build-schedule/build-schedule-staff-schedule/BuildScheduleStaffSchedule';
const buildScheduleStaffSchedule = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <BuildScheduleStaffSchedule />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default buildScheduleStaffSchedule;
