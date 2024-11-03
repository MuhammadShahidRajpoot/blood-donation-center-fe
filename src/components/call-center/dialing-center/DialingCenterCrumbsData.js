import { CALL_CENTER, CALL_CENTER_DIALING_CENTER } from '../../../routes/path';

export const DialingCenterCrumbsData = [
  {
    label: 'Call Center',
    class: 'disable-label',
    link: CALL_CENTER.DASHBOARD,
  },
  {
    label: 'Dialing Center',
    class: 'disable-label',
    link: CALL_CENTER_DIALING_CENTER.LIST,
  },
  {
    label: 'Call Jobs',
    class: 'disable-label',
    link: CALL_CENTER_DIALING_CENTER.LIST,
  },
];
export const DialingCenterCreateAppointmentCrumbsData = [
  {
    label: 'Call Center',
    class: 'disable-label',
    link: CALL_CENTER.DASHBOARD,
  },
  {
    label: 'Dialing Center',
    class: 'disable-label',
    link: CALL_CENTER_DIALING_CENTER.LIST,
  },
  {
    label: 'Call Jobs',
    class: 'disable-label',
    link: CALL_CENTER_DIALING_CENTER.CREATE,
  },
];
