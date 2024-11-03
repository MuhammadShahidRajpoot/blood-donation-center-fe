import React from 'react';
import Layout from '../../../components/common/layout';
import CheckPermission from '../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import ScriptsView from '../../../components/call-center/manage-scripts/ScriptsView';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';

const ViewScript = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.MANAGE_SCRIPTS.READ,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <ScriptsView />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ViewScript;
