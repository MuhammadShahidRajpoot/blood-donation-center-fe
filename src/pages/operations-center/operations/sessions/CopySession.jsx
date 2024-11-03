import React from 'react';
import Layout from '../../../../components/common/layout';
import SessionUpsert from '../../../../components/operations-center/operations/sessions/SessionUpsert';
import CheckPermission from '../../../../helpers/CheckPermissions';
import Permissions from '../../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../../not-found/NotFoundPage';

const CopySession = () => {
  return CheckPermission([
    Permissions.OPERATIONS_CENTER.OPERATIONS.SESSIONS.WRITE,
  ]) ? (
    <Layout>
      <SessionUpsert isCopy={true} />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default CopySession;
