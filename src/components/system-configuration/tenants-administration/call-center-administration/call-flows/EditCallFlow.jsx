import React from 'react';
import Layout from '../../../../../components/common/layout/index';
import CheckPermission from '../../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../../../pages/not-authorized/NotAuthorizedPage';
import CallFlowEdit from './CallFlowEdit';
import Permissions from '../../../../../enums/PermissionsEnum';
const EditCallFlow = () => {
  const hasPermission = CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallFlowEdit />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default EditCallFlow;
