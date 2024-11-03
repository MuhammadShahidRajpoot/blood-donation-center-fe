import React from 'react';
import ProspectsList from '../../../components/operations-center/prospects/ProspectsList';
import Layout from '../../../components/common/layout';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../not-found/NotFoundPage';

const ListProspects = () => {
  return CheckPermission(null, [
    OcPermissions.OPERATIONS_CENTER.PROSPECTS.MODULE_CODE,
  ]) ? (
    <Layout>
      <ProspectsList />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default ListProspects;
