import React from 'react';
import Layout from '../../../components/common/layout';
import CheckPermission from '../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../not-authorized/NotAuthorizedPage';
import SegmentList from '../../../components/call-center/manage-segments/segmentsList';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';

const ListSegments = () => {
  const hasPermission = CheckPermission([
    CallCenterPermissions.CALLCENTER.MANAGE_SEGMENTS.READ,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <SegmentList />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default ListSegments;
