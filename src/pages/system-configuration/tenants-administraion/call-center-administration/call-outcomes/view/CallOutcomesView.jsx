import React from 'react';
import Layout from '../../../../../../components/common/layout/index.js';
import ViewCallOutcomes from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/call-outcomes/CallOutcomesView.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage';
import Permissions from '../../../../../../enums/PermissionsEnum.js';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';

const CallOutcomesView = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.READ,
  ]) ? (
    <Layout>
      <ViewCallOutcomes />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default CallOutcomesView;
