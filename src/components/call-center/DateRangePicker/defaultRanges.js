import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  startOfYear,
} from 'date-fns';

const defineds = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
  lastSixMonths: startOfMonth(addMonths(new Date(), -6)),
  lastYear: startOfMonth(addMonths(new Date(), -12)),
  thisYear: startOfYear(new Date()),
  nextsixMonths: startOfMonth(addMonths(new Date(), 6)),
};

const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
};

export function createStaticRanges(ranges) {
  return ranges.map((range) => ({ ...staticRangeHandler, ...range }));
}

export const defaultStaticRanges = [
  {
    label: 'Today',
    range: {
      startDate: defineds.startOfToday,
      endDate: defineds.endOfToday,
    },
  },
  {
    label: 'Yesterday',
    range: {
      startDate: defineds.startOfYesterday,
      endDate: defineds.endOfYesterday,
    },
  },

  {
    label: 'This Week',
    range: {
      startDate: defineds.startOfWeek,
      endDate: defineds.endOfWeek,
    },
  },
  {
    label: 'Next Week',
    range: {
      startDate: defineds.endOfWeek,
      endDate: addDays(defineds.endOfWeek, 7),
    },
  },
  {
    label: 'Last Week',
    range: {
      startDate: defineds.startOfLastWeek,
      endDate: defineds.endOfLastWeek,
    },
  },
  {
    label: 'Next 30 Days',
    range: {
      startDate: defineds.startOfToday,
      endDate: addDays(defineds.startOfToday, 30),
    },
  },
  {
    label: 'Last 30 Days',
    range: {
      startDate: addDays(defineds.startOfToday, -30),
      endDate: defineds.startOfToday,
    },
  },

  {
    label: 'Next 6 Months',
    range: {
      startDate: defineds.startOfToday,
      endDate: defineds.nextsixMonths,
    },
  },
  {
    label: 'Last 6 Months',
    range: {
      startDate: defineds.lastSixMonths,
      endDate: defineds.startOfToday,
    },
  },
  {
    label: 'This Year',
    range: {
      startDate: defineds.thisYear,
      endDate: defineds.startOfToday,
    },
  },
  {
    label: 'Last Year',
    range: {
      startDate: defineds.lastYear,
      endDate: defineds.startOfToday,
    },
  },
];

export const defaultInputRanges = [];
