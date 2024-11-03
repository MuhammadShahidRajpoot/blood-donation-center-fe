import {
  SC_CALL_OUTCOMES_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../routes/path';

export const CallOutcomesBreadCrumbsData = [
  {
    label: 'System Configurations',
    class: 'disable-label',
    link: SYSTEM_CONFIGURATION_PATH,
  },
  {
    label: 'Call Center Administration',
    class: 'disable-label',
    link: SC_CALL_OUTCOMES_PATH,
  },
  {
    label: 'Call Outcomes',
    class: 'disable-label',
    link: '/system-configuration/tenant-admin/call-center-admin/call-outcomes/list',
  },
];

export const CallOutcomesBreadCrumbsDataCreateEdit = [
  {
    label: 'System Configurations',
    class: 'disable-label',
    link: SYSTEM_CONFIGURATION_PATH,
  },
  {
    label: 'Call Center Administration',
    class: 'disable-label',
    link: SC_CALL_OUTCOMES_PATH,
  },
];
