import * as moment from 'moment-timezone';

export const AllTimeZones = [
  {
    diffrence: -5,
    name: 'Eastern Standard Time (EST)',
    code: 'EST',
  },
  // {
  //   diffrence: -4,
  //   name: 'Eastern Daylight Time (EDT)',
  //   code: 'EDT',
  // },
  {
    diffrence: -6,
    name: 'Central Standard Time (CST)',
    code: 'CST',
  },
  // {
  //   diffrence: -5,
  //   name: 'Central Daylight Time (CDT)',
  //   code: 'CDT',
  // },
  {
    diffrence: -7,
    name: 'Mountain Standard Time (MST)',
    code: 'MST',
  },
  {
    diffrence: -8,
    name: 'Pacific Standard Time (PST)',
    code: 'PST',
  },
  // {
  //   diffrence: -7,
  //   name: 'Pacific Daylight Time (PDT)',
  //   code: 'PDT',
  // },
  {
    //
    diffrence: -9,
    name: 'Alaska Standard Time (AKST)',
    code: 'AKST',
  },
  // {
  //   diffrence: -8,
  //   name: 'Alaska Daylight Time (AKDT)',
  //   code: 'AKDT',
  // },
  {
    diffrence: -10,
    name: 'Hawaii-Aleutian Standard Time (HST)',
    code: 'HST',
  },
  // {
  //   diffrence: -9,
  //   name: 'Hawaii-Aleutian Daylight Time (HDT)',
  //   code: 'HDT',
  // },
  {
    diffrence: -4,
    name: 'Atlantic standard Time (AST)',
    code: 'AST',
  },
];
export const TimeZoneCities = {
  GMT: 'America/Danmarkshavn',
  EAT: 'Africa/Nairobi',
  CET: 'Europe/Madrid',
  WAT: 'Africa/Bangui',
  CAT: 'Africa/Harare',
  EET: 'Asia/Gaza',
  '+01': 'Africa/Casablanca',
  SAST: 'Africa/Johannesburg',
  HST: 'America/Atka',
  AKST: 'US/Alaska',
  AST: 'America/Virgin',
  '-03': 'America/Punta_Arenas',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  '-04': 'America/Boa_Vista',
  '-05': 'America/Bogota',
  MST: 'US/Arizona',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  EDT: 'America/Montreal',
  CDT: 'America/Matamoros',
  MDT: 'America/Shiprock',
  HDT: 'US/Aleutian',
  AKDT: 'America/Sitka',
  '-02': 'America/Nuuk',
  '-01': 'America/Scoresbysund',
  NST: 'America/St_Johns',
  '+08': 'Asia/Singapore',
  '+07': 'Asia/Vientiane',
  '+10': 'Asia/Vladivostok',
  AEDT: 'Australia/Sydney',
  '+05': 'Asia/Samarkand',
  NZDT: 'Pacific/Auckland',
  '+03': 'Asia/Istanbul',
  '+00': 'Antarctica/Troll',
  '+06': 'Asia/Dhaka',
  '+12': 'Asia/Kamchatka',
  '+04': 'Asia/Dubai',
  IST: 'Asia/Jerusalem',
  '+09': 'Asia/Chita',
  '+0530': 'Asia/Colombo',
  HKT: 'Asia/Hong_Kong',
  WIB: 'Asia/Jakarta',
  WIT: 'Asia/Jayapura',
  '+0430': 'Asia/Kabul',
  PKT: 'Asia/Karachi',
  '+0545': 'Asia/Kathmandu',
  '+11': 'Asia/Srednekolymsk',
  WITA: 'Asia/Makassar',
  KST: 'Asia/Pyongyang',
  '+0630': 'Asia/Rangoon',
  '+0330': 'Asia/Tehran',
  JST: 'Asia/Tokyo',
  WET: 'Europe/Lisbon',
  ACDT: 'Australia/Adelaide',
  AEST: 'Australia/Brisbane',
  ACST: 'Australia/Darwin',
  '+0845': 'Australia/Eucla',
  AWST: 'Australia/Perth',
  '-10': 'Pacific/Rarotonga',
  '-11': 'Pacific/Niue',
  '-12': 'Etc/GMT+12',
  '-06': 'Pacific/Galapagos',
  '-07': 'Etc/GMT+7',
  '-08': 'Pacific/Pitcairn',
  '-09': 'Pacific/Gambier',
  '+13': 'Pacific/Tongatapu',
  '+14': 'Pacific/Kiritimati',
  '+02': 'Etc/GMT-2',
  UTC: 'Universal',
  MSK: 'Europe/Moscow',
  MET: 'MET',
  '+1345': 'Pacific/Chatham',
  ChST: 'Pacific/Saipan',
  '-0930': 'Pacific/Marquesas',
  SST: 'Pacific/Midway',
};

export const getUtcOffsetFromNotation = (timezoneNotation) => {
  let zone = moment.tz.zone(timezoneNotation);

  if (!zone) {
    zone = moment.tz.zone(TimeZoneCities[timezoneNotation]);
  }
  if (!zone) {
    throw new Error(`Invalid timezone notation: ${timezoneNotation}`);
  }

  // Get the current date and time in UTC
  const utcNow = moment.utc();

  // Get the UTC offset for the provided timezone notation
  const utcOffset = zone.utcOffset(utcNow);

  return utcOffset;
};
