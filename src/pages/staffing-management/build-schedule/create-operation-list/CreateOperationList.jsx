/* eslint-disable */
import React from 'react';
import Layout from '../../../../components/common/layout';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OperationListCreate from '../../../../components/staffing-management/build-schedule/create-operation-list/OperationListCreate';
const CreateOperationList = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <OperationListCreate />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default CreateOperationList;
