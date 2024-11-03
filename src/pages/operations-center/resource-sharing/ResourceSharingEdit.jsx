import React from 'react';
import Layout from '../../../components/common/layout';
import EditResourceSharing from '../../../components/operations-center/resource-sharing/EditResourceSharing';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import NotFoundPage from '../../not-found/NotFoundPage';

const ResourceSharingEdit = () => {
  return CheckPermission([
    OcPermissions.OPERATIONS_CENTER.RESOURCE_SHARING.WRITE,
  ]) ? (
    <Layout>
      <EditResourceSharing />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default ResourceSharingEdit;
