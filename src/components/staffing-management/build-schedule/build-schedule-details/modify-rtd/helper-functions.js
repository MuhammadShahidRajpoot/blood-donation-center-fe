import dayjs from 'dayjs';

export const recalculateClockInForObject = (obj) => {
  // check which field was changed, set new changed value
  const shift_start_time = timeToMinutes(obj.shift_start_time);

  // Calculate total time in minutes
  const totalTimeInMinutes =
    shift_start_time -
    Number(obj.lead_time) -
    Number(obj.setup_time) -
    Number(obj.travel_to_time);

  // Calculate hours and minutes for the final time
  const hoursIn =
    Math.floor(totalTimeInMinutes / 60) > 12
      ? Math.floor(totalTimeInMinutes / 60) - 12
      : Math.floor(totalTimeInMinutes / 60);
  const minutesIn = totalTimeInMinutes % 60;
  // Determine AM/PM for the final time
  const periodIn = totalTimeInMinutes < 720 ? 'AM' : 'PM'; // 720 minutes = 12 PM

  // Format the output time
  const formattedTime = `${hoursIn}:${minutesIn
    .toString()
    .padStart(2, '0')} ${periodIn}`;

  return formattedTime;
};

export const recalculateClockOutForObject = (obj) => {
  // check which field was changed, set new changed value
  const shift_end_time = timeToMinutes(obj.shift_end_time);
  // Calculate total time in minutes
  const totalTimeInMinutes =
    shift_end_time +
    Number(obj.breakdown_time) +
    Number(obj.travel_from_time) +
    Number(obj.wrapup_time);
  // Calculate hours and minutes for the final time
  const hoursOut =
    Math.floor(totalTimeInMinutes / 60) > 12
      ? Math.floor(totalTimeInMinutes / 60) - 12
      : Math.floor(totalTimeInMinutes / 60);
  const minutesOut = totalTimeInMinutes % 60;

  // Determine AM/PM for the final time
  const periodOut = totalTimeInMinutes < 720 ? 'AM' : 'PM'; // 720 minutes = 12 PM

  // Format the output time
  const formattedTime = `${hoursOut}:${minutesOut
    .toString()
    .padStart(2, '0')} ${periodOut}`;

  return formattedTime;
};

export const recalculateTotalHours = (clockInTime, clockOutTime) => {
  const parseTime = (timeString) => {
    const [time = '0:00', period = ''] =
      timeString && timeString !== '' ? timeString.split(' ') : ['0:00', ''];
    let [hours, minutes] = [0, 0];

    if (time.includes(':')) {
      [hours, minutes] = time.split(':').map(Number);
    } else {
      hours = parseInt(time, 10);
    }

    let totalMinutes = hours * 60 + minutes;
    // Add 12 hours for PM times, except for 12 PM
    if (period === 'PM' && hours !== 12) {
      totalMinutes = (hours + 12) * 60 + minutes;
    }
    if (period === 'AM' && hours === 12) {
      // this is midnight so initial minutes should be = 0
      totalMinutes = minutes;
    }
    return totalMinutes;
  };

  if (clockInTime && clockOutTime) {
    const totalInMinutes = parseTime(clockInTime);
    const totalOutMinutes = parseTime(clockOutTime);

    const timeDifferenceInMinutes = totalOutMinutes - totalInMinutes;
    const totalHours = (timeDifferenceInMinutes / 60).toFixed(2);

    return `${totalHours}`;
  }
};

export const timeToMinutes = (timeString) => {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let totalMinutes = hours * 60 + minutes;

  if (period === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60; // Add 12 hours for PM times (except 12 PM)
  } else if (period === 'AM' && hours === 12) {
    totalMinutes -= 12 * 60; // Adjust for 12 AM
  }

  return totalMinutes;
};

export const convertTo12HourFormat = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(0, 0, 0, hours, minutes);

  const formattedHours = date.getHours() % 12 || 12;
  const formattedMinutes = date.getMinutes();

  const period = date.getHours() < 12 ? 'AM' : 'PM';

  const formattedTime = `${formattedHours}:${
    formattedMinutes < 10 ? '0' : ''
  }${formattedMinutes} ${period}`;

  return formattedTime;
};

export const convertTo24HourFormat = (timeString) => {
  if (timeString) {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    // Convert hours to 24-hour format
    hours =
      period === 'PM' ? (parseInt(hours, 10) % 12) + 12 : parseInt(hours, 10);

    // Ensure leading zero for single-digit hours and minutes
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
  }
};

export const setTimeFormat = (timeString) => {
  if (timeString) {
    const correctFormat = convertTo24HourFormat(timeString);
    const [hours, minutes] = correctFormat.split(':').map(Number);
    const timeObj = dayjs().set('hour', hours).set('minute', minutes);
    return timeObj;
  }
};
