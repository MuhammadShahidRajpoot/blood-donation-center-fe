import React from 'react';
import Layout from '../../../components/common/layout';
import CheckPermission from '../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import ScriptsUpsert from '../../../components/call-center/manage-scripts/ScriptsUpsert';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';

const CreateScript = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.MANAGE_SCRIPTS.READ,
    CallCenterPermissions.CALLCENTER.MANAGE_SCRIPTS.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <ScriptsUpsert />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default CreateScript;
