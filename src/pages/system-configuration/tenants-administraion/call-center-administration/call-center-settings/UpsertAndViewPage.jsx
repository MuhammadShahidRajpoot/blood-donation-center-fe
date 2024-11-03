import React from 'react';
import Layout from '../../../../../components/common/layout/index';
import CallCenterSetting from '../../../../../components/system-configuration/tenants-administration/call-center-administration/call-center-settings/ViewAndUpsert';
import CheckPermission from '../../../../../helpers/CheckPermissions';
import NotAuthorizedPage from '../../../../not-authorized/NotAuthorizedPage';
import Permissions from '../../../../../enums/PermissionsEnum';

const CallCenterSettingPage = () => {
  const hasPermission = CheckPermission(null, [
    Permissions.CALL_CENTER_ADMINISTRATION.CALL_CENTER_SETTINGS.MODULE_CODE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <CallCenterSetting />
      </Layout>
    );
  } else {
    return <NotAuthorizedPage />;
  }
};

export default CallCenterSettingPage;
