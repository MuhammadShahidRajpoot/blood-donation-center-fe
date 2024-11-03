/* eslint-disable */
import React from 'react';
import Layout from '../../../../components/common/layout';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import StaffingPermissions from '../../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OperationListEdit from '../../../../components/staffing-management/build-schedule/edit-operation-list/OperationListEdit';
const EditOperationList = () => {
  const hasPermission = CheckPermission(null, [
    StaffingPermissions.STAFFING_MANAGEMENT.BUILD_SCHEDULES.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <OperationListEdit />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default EditOperationList;
