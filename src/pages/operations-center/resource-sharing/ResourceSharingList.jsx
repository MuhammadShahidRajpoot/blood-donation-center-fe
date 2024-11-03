import React from 'react';
import Layout from '../../../components/common/layout';
import ListResourceSharing from '../../../components/operations-center/resource-sharing/ListResourceSharing';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../not-found/NotFoundPage';

const ResourceSharingList = () => {
  return CheckPermission(null, [
    OcPermissions.OPERATIONS_CENTER.RESOURCE_SHARING.MODULE_CODE,
  ]) ? (
    <Layout>
      <ListResourceSharing />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default ResourceSharingList;
