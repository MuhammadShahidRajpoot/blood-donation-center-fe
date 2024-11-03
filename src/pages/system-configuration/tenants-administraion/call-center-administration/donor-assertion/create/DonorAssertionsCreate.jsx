import React from 'react';
import Layout from '../../../../../../components/common/layout/index';
import AddDonorAssertions from '../../../../../../components/system-configuration/tenants-administration/call-center-administration/donor-assertion/DonorAssertionsAdd.js';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../../enums/PermissionsEnum.js';
import NotAuthorizedPage from '../../../../../not-authorized/NotAuthorizedPage.jsx';

const CreateDonorAssertions = () => {
  return CheckPermission([
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
  ]) ? (
    <Layout>
      <AddDonorAssertions />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default CreateDonorAssertions;
