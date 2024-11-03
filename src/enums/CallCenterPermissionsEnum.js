const CallCenterPermissions = {
  CALLCENTER: {
    APPLICATION_CODE: 'CallCenter',
    DASHBOARD: {
      READ: '070201',
      WRITE: '070202',
      MODULE_CODE: 'dashboard',
    },
    CALL_SCHEDULE: {
      READ: '070301',
      WRITE: '070302',
      MODULE_CODE: 'call_schedule',
    },
    MANAGE_SCRIPTS: {
      READ: '070101',
      WRITE: '070102',
      ARCHIVE: '070103',
      MODULE_CODE: 'manage_scripts',
    },
    MANAGE_SEGMENTS: {
      READ: '070401',
      WRITE: '070402',
      MODULE_CODE: 'manage_segments',
    },
    DIALING_CENTER: {
      READ: '070501',
      MODULE_CODE: 'dialing_center',
    },
  },
};
export default CallCenterPermissions;
