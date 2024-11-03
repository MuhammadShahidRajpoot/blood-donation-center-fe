import React from 'react';
import Layout from '../../../components/common/layout';
import CreateResourceSharing from '../../../components/operations-center/resource-sharing/CreateResourceSharing';
import NotFoundPage from '../../not-found/NotFoundPage';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';

const ResourceSharingCreate = () => {
  return CheckPermission([
    OcPermissions.OPERATIONS_CENTER.RESOURCE_SHARING.WRITE,
  ]) ? (
    <Layout>
      <CreateResourceSharing />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default ResourceSharingCreate;
