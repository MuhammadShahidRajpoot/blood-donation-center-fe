import React from 'react';
import EditFacility from '../../../../components/system-configuration/tenants-administration/organizational-administration/resources/facilities-management/EditFacility';

import Layout from '../../../../components/common/layout';
import NotFoundPage from '../../../not-found/NotFoundPage.jsx';
import CheckPermission from '../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../enums/PermissionsEnum.js';

const FacilityEdit = () => {
  return CheckPermission([
    Permissions.ORGANIZATIONAL_ADMINISTRATION.RESOURCES.FACILITIES.WRITE,
  ]) ? (
    <Layout>
      <EditFacility />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};
export default FacilityEdit;
