import React from 'react';
import Layout from '../../../../../components/common/layout/index.js';
import DonorAssertionsList from '../../../../../components/system-configuration/tenants-administration/call-center-administration/donor-assertion/DonorAssertionList.js';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import NotAuthorizedPage from '../../../../not-authorized/NotAuthorizedPage.jsx';
import Permissions from '../../../../../enums/PermissionsEnum.js';

const ListDonorAssertions = () => {
  return CheckPermission(null, [
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.MODULE_CODE,
  ]) ? (
    <Layout>
      <DonorAssertionsList />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default ListDonorAssertions;
