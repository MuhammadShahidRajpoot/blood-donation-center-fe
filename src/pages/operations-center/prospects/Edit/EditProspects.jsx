import React from 'react';
import Layout from '../../../../components/common/layout';
import ProspectsEdit from '../../../../components/operations-center/prospects/ProspectsEdit';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OcPermissions from '../../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../../not-found/NotFoundPage';

const EditProspects = () => {
  return CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.WRITE]) ? (
    <Layout>
      <ProspectsEdit />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default EditProspects;
