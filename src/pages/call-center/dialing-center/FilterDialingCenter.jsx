import React from 'react';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage.jsx';
import Layout from '../../../components/common/layout/index.js';
//import CheckPermission from '../../../helpers/CheckPermissions.js';
//import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum.js';
import DialingCenterFilter from '../../../components/call-center/dialing-center/DialingCenterFilter.js';

const FilterDialingCenter = () => {
  const hasPermission = true;

  // = CheckPermission([
  //   CallCenterPermissions.CALLCENTER.DIALING_CENTER.READ,
  // ]);
  if (hasPermission) {
    return <Layout>{<DialingCenterFilter />}</Layout>;
  } else {
    return <NotAuthorizedPage />;
  }
};
export default FilterDialingCenter;
