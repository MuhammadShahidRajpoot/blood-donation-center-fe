import React from 'react';
import Layout from '../../../../../components/common/layout/index';
import CheckPermission from '../../../../../helpers/CheckPermissions';
import CallFlowsList from '../../../../../components/system-configuration/tenants-administration/call-center-administration/call-flows/callFlowsList.js';
import NotAuthorizedPage from '../../../../../pages/not-authorized/NotAuthorizedPage.jsx';
import Permissions from '../../../../../enums/PermissionsEnum';
const CallFlowsPage = () => {
  const hasPermission = CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.READ,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallFlowsList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};
export default CallFlowsPage;
