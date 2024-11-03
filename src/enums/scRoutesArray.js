import { MONTHLY_GOALS_PATH } from '../routes/path';

export const systemConfigurationNewRoutes = {
  hierarchy: {
    organizationalLevels: {
      code: 'organizational_levels',
      link: '/system-configuration/organizational-levels',
    },
    businessUnits: {
      code: 'business_units',
      link: '/system-configuration/hierarchy/business-units',
    },
  },
  goals: {
    monthlyGoals: {
      code: 'monthly_goals',
      link: MONTHLY_GOALS_PATH.LIST,
    },
    dailyGoalsAllocation: {
      code: 'daily_goals_allocation',
      link: '/system-configuration/tenant-administration/organizational-administration/goals/daily-goals-allocation',
    },
    dailyGoalsCalendar: {
      code: 'daily_goals_calendar',
      link: '/system-configuration/tenant-administration/organizational-administration/goals/daily-goals-calendar/view',
    },
    performanceRules: {
      code: 'performance_rules',
      link: '/system-configuration/tenant-administration/organizational-administration/goals/performance-rules/view',
    },
  },
  productsAndProcedures: {
    products: {
      code: 'products',
      link: '/system-configuration/tenant-admin/organization-admin/products',
    },
    procedures: {
      code: 'procedures',
      link: '/system-configuration/tenant-admin/organization-admin/procedures',
    },
    procedureTypes: {
      code: 'procedure_types',
      link: '/system-configuration/tenant-admin/organization-admin/procedures-types',
    },
  },
  resources: {
    devices: {
      code: 'devices',
      link: '/system-configuration/tenant-admin/organization-admin/resources/devices',
    },
    deviceType: {
      code: 'device_type',
      link: '/system-configuration/tenant-admin/organization-admin/resource/device-type',
    },
    vehicles: {
      code: 'vehicles',
      link: '/system-configuration/tenant-admin/organization-admin/resources/vehicles',
    },
    vehicleType: {
      code: 'vehicle_type',
      link: '/system-configuration/tenant-admin/organization-admin/resources/vehicle-types',
    },
    facilities: {
      code: 'facilities',
      link: '/system-configuration/resource-management/facilities',
    },
  },
  contentManagementSystem: {
    ads: {
      code: 'ads',
      link: '/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/list',
    },
    emailTemplates: {
      code: 'email_templates',
      link: '/system-configuration/platform-admin/email-template',
    },
  },
  //   customFields: {
  //     code: 'custom_fields',
  //     link: 'dlfkjslkdfjls',
  //   },

  //   geoAdministration: {
  //     code: 'territory_management',
  //     link: 'dlfkjslkdfjls',
  //   },
  //   callOutcomes: {
  //     code: 'call_outcomes',
  //     link: 'dlfkjslkdfjls',
  //   },
  //   callCenterSettings: {
  //     code: 'call_center_settings',
  //     link: 'dlfkjslkdfjls',
  //   },
  //   callFlows: {
  //     code: 'call_flows',
  //     link: 'dlfkjslkdfjls',
  //   },

  accounts: {
    affiliation: {
      code: 'crm_accounts_affiliation',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/affiliations',
    },
    sources: {
      code: 'crm_accounts_sources',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/sources',
    },
    stages: {
      code: 'crm_accounts_stages',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/stages',
    },
    industryCategory: {
      code: 'crm_accounts_industry-categories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/industry-categories',
    },
    industrySubcategory: {
      code: 'crm_accounts_industry-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/industry-subcategories',
    },
    attachmentsCategory: {
      code: 'crm_accounts_attachments-categories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/attachment-categories',
    },
    attachmentsSubcategory: {
      code: 'crm_accounts_attachments-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/attachment-subcategories',
    },
    notesCategory: {
      code: 'crm_accounts_notes-categories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/note-categories/list',
    },
    notesSubcategory: {
      code: 'crm_accounts_notes-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/note-subcategories/list',
    },
  },
  contacts: {
    roles: {
      code: 'crm_contacts_roles',
      link: '/system-configuration/tenant-admin/crm-admin/contacts/roles/list',
    },
    attachmentsCategory: {
      code: 'crm_contacts_attachments-categories',
      link: '/system-configuration/tenant-admin/crm-admin/contacts/attachment-categories',
    },
    attachmentsSubcategory: {
      code: 'crm_contacts_attachments-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/contacts/attachment-subcategories',
    },
    notesCategory: {
      code: 'crm_contacts_notes-categories',
      link: '/system-configuration/tenant-admin/crm-admin/contacts/note-categories/list',
    },
    notesSubcategory: {
      code: 'crm_contacts_notes-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/contacts/note-subcategories/list',
    },
  },
  locations: {
    roomSizes: {
      code: 'crm_locations_roomSize',
      link: '/system-configuration/tenant-admin/crm-admin/locations/room-size',
    },
    attachmentsCategory: {
      code: 'crm_locations_attachments-categories',
      link: '/system-configuration/tenant-admin/crm-admin/locations/attachment-categories',
    },
    attachmentsSubcategory: {
      code: 'crm_locations_attachments-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/locations/attachment-subcategories',
    },
    notesCategory: {
      code: 'crm_locations_notes-categories',
      link: '/system-configuration/tenant-admin/crm-admin/locations/note-categories',
    },
    notesSubcategory: {
      code: 'crm_locations_notes-subcategories',
      link: '/system-configuration/tenant-admin/crm-admin/locations/note-subcategories/list',
    },
  },
  bookingDrives: {
    bookingRule: {
      code: 'booking_rule',
      link: '/system-configuration/operations-admin/booking-drives/booking-rule',
    },
    dailyCapacity: {
      code: 'daily_capacity',
      link: '/system-configuration/operations-admin/booking-drives/daily-capacities',
    },
    dailyHours: {
      code: 'daily_hours',
      link: '/system-configuration/operations-admin/booking-drives/daily-hours',
    },
    operationStatus: {
      code: 'operation_status',
      link: '/system-configuration/operations-admin/booking-drives/operation-status',
    },
    taskManagement: {
      code: 'task_management',
      link: '/system-configuration/tenant-admin/operations-admin/booking-drives/task-management/list',
    },
  },
  calendar: {
    banner: {
      code: 'calendar_banner',
      link: '/system-configuration/tenant-admin/operations-admin/calendar/banners',
    },
    lockDates: {
      code: 'calendar_lock_dates',
      link: '/system-configuration/tenant-admin/operations-admin/calendar/lock-dates',
    },
    closeDates: {
      code: 'calendar_close_dates',
      link: '/system-configuration/tenant-admin/operations-admin/calendar/close-dates',
    },
    goalVariance: {
      code: 'goal_variance',
      link: '/system-configuration/tenant-admin/operations-admin/calendar/goal-variance',
    },
  },
  marketingEquipments: {
    promotions: {
      code: 'marketing_equipments_promotions',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotions',
    },
    promotionalItems: {
      code: 'marketing_equipments_promotional_items',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items',
    },
    marketingMaterial: {
      code: 'marketing_equipments_marketing_material',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/list',
    },
    approvals: {
      code: 'marketing_equipments_approvals',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/approvals',
    },
    equipments: {
      code: 'marketing_equipments_equipments',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/equipments/list',
    },
  },
  notesAndAttachments: {
    attachmentsCategory: {
      code: 'operation_administration_attachments-categories',
      link: '/system-configuration/tenant-admin/operations-admin/notes-attachments/attachment-categories',
    },
    attachmentsSubcategory: {
      code: 'operation_administration_attachments-subcategories',
      link: '/system-configuration/tenant-admin/operations-admin/notes-attachments/attachment-subcategories',
    },
    notesCategory: {
      code: 'operation_administration_notes-categories',
      link: '/system-configuration/tenant-admin/operations-admin/notes-attachments/note-categories/list',
    },
    notesSubcategory: {
      code: 'operation_administration_notes-subcategories',
      link: '/system-configuration/tenant-admin/operations-admin/notes-attachments/note-subcategories/list',
    },
  },
  nonCollectionEvents: {
    nceCategory: {
      code: 'operation_administration_nce-categories',
      link: '/system-configuration/tenant-admin/operations-admin/nce-categories/list',
    },
    nceSubcategory: {
      code: 'operation_administration_nce-subcategories',
      link: '/system-configuration/tenant-admin/operations-admin/nce-subcategories/list',
    },
  },

  //   staffSetups: {
  //     code: 'staff_administration_staff_setups',
  //     link: 'dlfkjslkdfjls',
  //   },
  classifications: {
    classifications: {
      code: 'staff_administration_classification',
      link: '/system-configuration/tenant-admin/staffing-admin/classifications/list',
    },
    settings: {
      code: 'staff_administration_settings',
      link: '/system-configuration/tenant-admin/staffing-admin/classifications/settings/list',
    },
  },
  //   leaveTypes: {
  //     code: 'staff_administration_leave_types',
  //     link: 'dlfkjslkdfjls',
  //   },
  certifications: {
    certifications: {
      code: 'staff_administration_certification',
      link: '/system-configuration/tenant-admin/staffing-admin/certifications',
    },
    assignedCertification: {
      code: 'staff_administration_assigned_certifications',
      link: '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification',
    },
  },
  teams: {
    teams: {
      code: 'staff_administration_teams',
      link: '/system-configuration/staffing-admin/teams',
    },
    assignedMember: {
      code: 'staff_administration_assigned_members',
      link: '/system-configuration/staffing-admin/teams/members',
    },
  },
  //   userRoles: {
  //     code: 'users_roles',
  //     link: 'dlfkjslkdfjls',
  //   },
  //   users: {
  //     code: 'users',
  //     link: 'dlfkjslkdfjls',
  //   },
};
