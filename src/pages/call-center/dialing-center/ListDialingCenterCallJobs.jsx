import React from 'react';
//import { SC_CALL_CENTER_ADMINISTRATION_CALL_FLOWS } from '../../../routes/path.js';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage.jsx';
//import CheckPermission from '../../../helpers/CheckPermissions.js';
import Layout from '../../../components/common/layout/index.js';
import DialingCenterCallJobsList from '../../../components/call-center/dialing-center/DialingCenterCallJobsList.js';
import CheckPermission from '../../../helpers/CheckPermissions.js';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum.js';

const ListDialingCenterCallJobs = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.DIALING_CENTER.READ,
  ]);
  if (hasPermission) {
    return <Layout>{<DialingCenterCallJobsList />}</Layout>;
  } else {
    return <NotAuthorizedPage />;
  }
};
export default ListDialingCenterCallJobs;
