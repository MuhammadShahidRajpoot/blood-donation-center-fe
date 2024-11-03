import React from 'react';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import StaffView from '../../../../components/crm/contacts/staffs/StaffView';
import NotAuthorizedPage from '../../../not-authorized/NotAuthorizedPage';

const ViewDonor = () => {
  const hasPermission = CheckPermission([
    CrmPermissions.CRM.CONTACTS.STAFF.WRITE,
    CrmPermissions.CRM.CONTACTS.STAFF.READ,
  ]);
  if (hasPermission) {
    return <StaffView />;
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ViewDonor;
