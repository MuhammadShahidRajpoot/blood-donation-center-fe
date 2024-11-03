import React from 'react';
import Layout from '../../../../../components/common/layout/index';
import CheckPermission from '../../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../../../pages/not-authorized/NotAuthorizedPage';
import CallFlowCreate from './CallFlowCreate';
import Permissions from '../../../../../enums/PermissionsEnum';
const CreateCallFlow = () => {
  const hasPermission = CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallFlowCreate />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default CreateCallFlow;
