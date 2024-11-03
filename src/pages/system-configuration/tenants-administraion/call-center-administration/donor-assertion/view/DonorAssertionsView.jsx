import React from 'react';
import Layout from '../../../../../../components/common/layout/index';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../../enums/PermissionsEnum.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage.jsx';
import ViewDonorAssertion from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/donor-assertion/ViewDonorAssertion.js';

const DonorAssertionsView = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
  ]) ? (
    <Layout>
      <ViewDonorAssertion />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default DonorAssertionsView;
