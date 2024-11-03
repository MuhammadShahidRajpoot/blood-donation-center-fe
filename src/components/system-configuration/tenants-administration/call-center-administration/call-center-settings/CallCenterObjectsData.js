export const BreadcrumbsData = [
  {
    label: `System Configurations`,
    class: 'disable-label',
    link: `/system-configuration`,
  },
  {
    label: `Call Center Administration`,
    class: 'disable-label',
    link: `/system-configuration/tenant-admin/call-center-admin/call-center-setting`,
  },
  {
    label: `Call Center Settings`,
    class: 'active-label',
    link: `/system-configuration/tenant-admin/call-center-admin/call-center-setting`,
  },
];

export const formFieldConfig = [
  {
    sectionCode: 'agent_standards',
    sectionName: 'Agent Standards',
    fields: [
      {
        name: 'calls_per_hour',
        type: 'number',
        min: 0,
        maxLength: 5,
        displayName: 'Calls Per Hour',
        required: true,
      },
      {
        name: 'appointments_per_hour',
        type: 'number',
        min: 0,
        maxLength: 5,
        displayName: 'Appointments Per Hour',
        required: true,
      },
      {
        name: 'donors_per_hour',
        type: 'number',
        min: 0,
        maxLength: 5,
        displayName: 'Donors Per Hour',
        required: true,
      },
    ],
  },
  {
    sectionCode: 'call_settings',
    sectionName: 'Call Settings',
    fields: [
      {
        name: 'caller_id_name',
        type: 'text',
        maxLength: 50,
        displayName: 'Caller ID Name',
        required: true,
      },
      {
        name: 'caller_id_number',
        type: 'text',
        maxLength: 15,
        displayName: 'Caller ID Number',
        required: true,
        variant: 'phone',
      },
      {
        name: 'callback_number',
        type: 'text',
        maxLength: 15,
        displayName: 'Caller Back Number',
        required: true,
        variant: 'phone',
      },
      {
        name: 'max_calls_per_rolling_30_days',
        type: 'number',
        displayName: 'Max Calls per Rolling 30 days',
        maxLength: 5,
        tooltip: 'Times donor can appear on call within rolling 30 days.',
        required: true,
      },
    ],
  },
  {
    sectionCode: 'no_answer_call_treatment',
    sectionName: 'No Answer Call Treatment',
    fields: [
      {
        name: 'busy_call_outcome',
        type: 'string',
        displayName: 'Busy Call Outcome',
        options: true,
        required: true,
        showLabel: true,
      },
      {
        name: 'no_answer_call_outcome',
        type: 'string',
        displayName: 'No Answer Call Outcome',
        options: true,
        required: true,
        showLabel: true,
      },
      {
        name: 'max_no_of_rings',
        type: 'number',
        displayName: 'Max Number of Rings',
        maxLength: 5,
        required: true,
      },
      {
        name: 'max_retries',
        type: 'number',
        displayName: 'Max Retries for Call Session',
        maxLength: 5,
        tooltip: 'Max retires prior to removal from list.',
        required: true,
      },
    ],
  },
];
