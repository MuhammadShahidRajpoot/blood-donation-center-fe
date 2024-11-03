import React from 'react';
import Layout from '../../../../../components/common/layout/index.js';
import CallOutcomesList from '../../../../../components/system-configuration/tenants-administration/call-center-administration/call-outcomes/CallOutcomesList.js';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import NotAuthorizedPage from '../../../../not-authorized/NotAuthorizedPage';
import Permissions from '../../../../../enums/PermissionsEnum.js';

const ListCallOutcomes = () => {
  return CheckPermission(null, [
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.MODULE_CODE,
  ]) ? (
    <Layout>
      <CallOutcomesList />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default ListCallOutcomes;
