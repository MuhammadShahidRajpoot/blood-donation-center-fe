import React from 'react';
import Layout from '../../../components/common/layout';
import ViewResourceSharing from '../../../components/operations-center/resource-sharing/ViewResourceSharing';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../not-found/NotFoundPage';

const ResourceSharingView = () => {
  return CheckPermission([
    OcPermissions.OPERATIONS_CENTER.RESOURCE_SHARING.READ,
  ]) ? (
    <Layout>
      <ViewResourceSharing />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default ResourceSharingView;
