/* eslint-disable */

import React from 'react';
import Layout from '../../../../components/common/layout';
import ScheduleCreate from '../../../../components/staffing-management/build-schedule/create-schedule/ScheduleCreate';
import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../../enums/StaffingPermissionsEnum';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';

const CreateSchedule = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <ScheduleCreate
          formHeading={'Create Schedule'}
          listUrl={STAFFING_MANAGEMENT_BUILD_SCHEDULE.OPERATION_LIST}
          cancelUrl={STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST}
        />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default CreateSchedule;
