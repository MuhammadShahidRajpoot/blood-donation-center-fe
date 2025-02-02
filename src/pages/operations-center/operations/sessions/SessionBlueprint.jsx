import React from 'react';
import Layout from '../../../../components/common/layout';
import SessionUpsert from '../../../../components/operations-center/operations/sessions/SessionUpsert';
import CheckPermission from '../../../../helpers/CheckPermissions';
import Permissions from '../../../../enums/OcPermissionsEnum';
import NotFoundPage from '../../../not-found/NotFoundPage';

const SessionBlueprint = () => {
  return CheckPermission([
    Permissions.OPERATIONS_CENTER.OPERATIONS.SESSIONS.WRITE,
  ]) ? (
    <Layout>
      <SessionUpsert isBlueprint={true} />
    </Layout>
  ) : (
    <NotFoundPage />
  );
};

export default SessionBlueprint;
