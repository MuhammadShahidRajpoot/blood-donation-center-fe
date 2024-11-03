import React from 'react';
import Layout from '../../../../../components/common/layout/index';
import EditTenantUserRoles from '../../../../../components/system-configuration/users-administration/user-roles/EditTenantUserRoles';
import { useLocation, useParams } from 'react-router-dom';
import NotAuthorizedPage from '../../../../not-authorized/NotAuthorizedPage.jsx';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../enums/PermissionsEnum.js';

const TenantUserRolesEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const duplicate = location.pathname.includes('duplicate');
  return CheckPermission([
    Permissions.USER_ADMINISTRATIONS.USER_ROLES.WRITE,
  ]) ? (
    <Layout>
      <EditTenantUserRoles roleId={id} duplicate={duplicate} />
    </Layout>
  ) : (
    <NotAuthorizedPage />
  );
};

export default TenantUserRolesEdit;
