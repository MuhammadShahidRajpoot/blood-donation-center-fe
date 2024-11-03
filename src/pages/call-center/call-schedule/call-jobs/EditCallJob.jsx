import React from 'react';
import Layout from '../../../../components/common/layout';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import CheckPermission from '../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import CallJobUpsert from '../../../../components/call-center/call-schedule/call-jobs/CallJobUpsert';

const EditCallJob = () => {
  const hasPermission = CheckPermission([CrmPermissions.CRM.ACCOUNTS.WRITE]);
  if (hasPermission) {
    return (
      <Layout>
        <CallJobUpsert />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default EditCallJob;
