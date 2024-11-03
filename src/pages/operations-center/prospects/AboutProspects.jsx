import React from 'react';

import Layout from '../../../components/common/layout';
import ProspectsAbout from '../../../components/operations-center/prospects/ProspectsAbout';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../not-found/NotFoundPage';

const AboutProspects = () => {
  return CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.READ]) ? (
    <Layout>
      <ProspectsAbout />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default AboutProspects;
