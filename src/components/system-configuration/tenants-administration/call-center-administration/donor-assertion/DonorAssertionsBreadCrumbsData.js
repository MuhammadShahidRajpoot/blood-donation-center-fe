import {
  SC_CALL_OUTCOMES_PATH,
  SC_DONOR_ASSERTIONS_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../routes/path';

export const DonorAssertionsBreadCrumbsData = [
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
    label: 'Donor Assertion',
    class: 'disable-label',
    link: SC_DONOR_ASSERTIONS_PATH,
  },
];

export const DonorAssertionsBreadCrumbsDataCreateEdit = [
  {
    label: 'System Configurations',
    class: 'disable-label',
    link: '',
  },
  {
    label: 'Call Center Administration',
    class: 'disable-label',
    link: '',
  },
];

export const DonorAssertionsBreadCrumbsDataView = [
  {
    label: 'System Configurations',
    class: 'disable-label',
    link: '',
  },
  {
    label: 'Call Center Administration',
    class: 'disable-label',
    link: '',
  },
  {
    label: 'View Donor Assertion',
    class: 'disable-label',
    link: SC_DONOR_ASSERTIONS_PATH,
  },
];
