/* eslint-disable */

import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import * as moment from 'moment-timezone';
// import jwt from 'jwt-decode';
import {
  TimeZoneCities,
  getUtcOffsetFromNotation,
} from '../components/operations-center/operations/drives/timeZones';

export const formatDateWithTZ = (
  date,
  dateFormat = 'MM-dd-yyyy hh:mm a',
  timeZone
) => {
  // console.log({ date });
  if (!date) return 'N/A';
  if (!timeZone || timeZone == '') {
    // const jwtToken = localStorage.getItem('token');
    timeZone = localStorage?.getItem('timeZone');
    // if (jwtToken) {
    //   // const decodedData = jwt(jwtToken);
    //   timeZone = decodedData?.tenantTimeZone?.code;
    // }
  }

  // console.log({ timeZone });
  const dateWithoutZone = date.includes('Z')
    ? new Date(date)
    : new Date(date + 'Z');

  // console.log({ dateWithoutZone });
  // Convert UTC date to the specified time zone
  let zonedDate = utcToZonedTime(dateWithoutZone, TimeZoneCities[timeZone]);
  if (isDateInDST(date, TimeZoneCities[timeZone])) {
    zonedDate = getDstTime(zonedDate, TimeZoneCities[timeZone]);
  }
  // console.log('Zoned Date:', zonedDate);

  // Format the zoned date using the provided format
  const formattedDate = format(zonedDate, dateFormat, { timeZone });
  // console.log('Formatted Date:', formattedDate);

  return formattedDate;
};

export const covertDatetoTZDate = (date, timeZone) => {
  if (!date) return 'N/A';
  if (!timeZone || timeZone == '') {
    timeZone = localStorage?.getItem('timeZone');
    // const jwtToken = localStorage.getItem('token');
    // if (jwtToken) {
    //   const decodedData = jwt(jwtToken);
    //   // console.log({ decodedData });
    //   timeZone = decodedData?.tenantTimeZone?.code;
    // }
  }
  // console.log('-------covertDatetoTZDate--------------');
  // console.log('timeZone', timeZone);
  // console.log('TimeZoneCities', TimeZoneCities[timeZone]);

  // console.log({ timeZone });
  const dateWithoutZone = date.includes('Z')
    ? new Date(date)
    : new Date(date + 'Z');

  // console.log('dateWithoutZone:', dateWithoutZone);
  // Convert UTC date to the specified time zone
  let zonedDate = utcToZonedTime(dateWithoutZone, TimeZoneCities[timeZone]);
  // console.log('Zoned Date:', zonedDate);
  if (isDateInDST(zonedDate, TimeZoneCities[timeZone])) {
    zonedDate = moment(zonedDate).subtract(1, 'hours').toDate();
  }
  // console.log('----------covertDatetoTZDate-----------');
  return zonedDate;
};

export const covertToTimeZone = (date, targetTimezone) => {
  // console.log('-------covertToTimeZone--------------');

  if (!targetTimezone || targetTimezone == '') {
    targetTimezone = localStorage?.getItem('timeZone');
    // const jwtToken = localStorage.getItem('token');
    // if (jwtToken) {
    //   const decodedData = jwt(jwtToken);
    //   // console.log({ decodedData });
    //   targetTimezone = decodedData?.tenantTimeZone?.code;
    // }
  }
  // console.log({ targetTimezone });
  const timeZoneOffset = -(getUtcOffsetFromNotation(targetTimezone) / 60);
  // console.log({ timeZoneOffset });
  const convertedDate = moment(
    date.format('ddd MMM DD YYYY HH:mm:ss') + ` UTC${timeZoneOffset}`
  );
  // console.log('Date', date.format());
  // console.log('timeZoneOffset', timeZoneOffset);
  // console.log('convertedDate', convertedDate.format());
  // console.log('-------covertToTimeZone--------------');
  return convertedDate;
};

export const convertToMoment = (date, timeZone) => {
  return moment(covertDatetoTZDate(date, timeZone));
};
/**
 * The function removes the time zone from a given date and returns the modified date.
 * @param {Date} date - The `date` parameter is a string representing a date and time in any valid format that
 * can be parsed by the `moment` library.
 * @returns a moment object that represents the input date with the time zone removed.
 */
export const removeTZ = (date) => {
  // covert date object to moment object
  const parsedDate = moment(date);
  // covert moment object date into utc
  return moment(parsedDate).utc().add(parsedDate.utcOffset(), 'm');
};

export const extractTimeFromString = (dateString) => {
  const parts = dateString.split(' ');
  const timePart = parts[1] + ' ' + parts[2];
  return timePart;
};

export const isDateInDST = (date, timezone) => {
  // Use moment-timezone to set the date in the specified timezone
  const m = moment.tz(date, timezone);

  // Check if the date is in daylight saving time
  console.log(`DST Observed : ${m.isDST()}`);
  return m.isDST();
};

export const getDstTime = (dateTime, timeZone) => {
  const dt = moment(dateTime).tz(timeZone);
  return dt.toDate();
};
