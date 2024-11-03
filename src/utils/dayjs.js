import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/fr';

dayjs.extend(utc);
dayjs.extend(timezone);

// dayjs.locale('fr');
// dayjs.tz.setDefault('Europe/Paris');
dayjs.tz.guess();

const timezonedDayjs = (...args) => {
  return dayjs(...args).tz();
};

const timezonedUnix = (value) => {
  return dayjs.unix(value).tz();
};

timezonedDayjs.unix = timezonedUnix;
//@ts-ignore
timezonedDayjs.duration = dayjs.duration;

export const tz = dayjs.tz.guess();
export default timezonedDayjs;
