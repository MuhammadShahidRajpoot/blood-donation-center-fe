import { CALL_CENTER, CALL_CENTER_MANAGE_SEGMENTS } from '../../../routes/path';

export const SegmentsBreadcrumbsData = [
  {
    label: 'Call Center',
    class: 'disable-label',
    link: CALL_CENTER.DASHBOARD,
  },
  {
    label: 'Manage Segments',
    class: 'disable-label',
    link: CALL_CENTER_MANAGE_SEGMENTS.LIST,
  },
];
