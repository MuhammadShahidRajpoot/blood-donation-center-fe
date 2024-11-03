import React from 'react';
import Layout from '../../../../components/common/layout';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';
import ProspectList from '../../../../components/crm/contacts/prospect/ProspectList';

const ListProspect = () => {
  const hasPermission = CheckPermission(null, [
    CrmPermissions.CRM.CONTACTS.PROSPECT.MODULE_CODE,
  ]);
  if (!hasPermission) {
    return (
      <Layout>
        <ProspectList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ListProspect;
