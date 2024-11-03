import React from 'react';
import Layout from '../../../../components/common/layout';
import ProspectsCreate from '../../../../components/operations-center/prospects/ProspectsCreate';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OcPermissions from '../../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../../not-found/NotFoundPage';

const CreateProspects = () => {
  return CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.WRITE]) ? (
    <Layout>
      <ProspectsCreate />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default CreateProspects;
