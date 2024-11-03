import React from 'react';
import Layout from '../../../../../../components/common/layout/index';
import AddCallOutcomes from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/call-outcomes/CallOutcomesAdd.js';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../../enums/PermissionsEnum.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage';

const CreateCallOutcomes = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
  ]) ? (
    <Layout>
      <AddCallOutcomes />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default CreateCallOutcomes;
