import React from 'react';
import Layout from '../../../components/common/layout';
//import CheckPermission from '../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import ScriptsList from '../../../components/call-center/manage-scripts/ScriptsList';
//import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';

const ListScripts = () => {
  const hasPermission = true; //discard after
  if (hasPermission) {
    return (
      <Layout>
        <ScriptsList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ListScripts;
