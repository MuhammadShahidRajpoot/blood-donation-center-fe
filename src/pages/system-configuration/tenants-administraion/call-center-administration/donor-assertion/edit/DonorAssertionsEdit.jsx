import React from 'react';
import Layout from '../../../../../../components/common/layout/index.js';
import EditDonorAssertions from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/donor-assertion/EditDonorAssertions.js';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage.jsx';
import Permissions from '../../../../../../enums/PermissionsEnum.js';

const DonorAssertionsEdit = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
  ]) ? (
    <Layout>
      <EditDonorAssertions />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};
export default DonorAssertionsEdit;
