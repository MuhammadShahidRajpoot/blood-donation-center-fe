import React from 'react';
import Layout from '../../../../../../components/common/layout';
import EditCallOutcomes from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/call-outcomes/CallOutcomesEdit.js';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage.jsx';
import Permissions from '../../../../../../enums/PermissionsEnum.js';

const CallOutcomesEdit = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
  ]) ? (
    <Layout>
      <EditCallOutcomes />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};
export default CallOutcomesEdit;
