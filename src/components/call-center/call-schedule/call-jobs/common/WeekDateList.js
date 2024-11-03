import React, { useState, useEffect } from 'react';
import styles from './../call-jobs.module.scss';

const recDays = (dateLabel, recurringDays) => {
  let recurringDaysArr = recurringDays.split(',').map((day) => day.trim());
  const date = new Date(dateLabel);
  const dayOfWeek = date.getDay();
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const day = days[dayOfWeek];

  const matchedDay = recurringDaysArr.find((item) => item === day);

  if (matchedDay) {
    return true;
  } else {
    return false;
  }
};

const WeekDateList = ({
  selectedDate = '',
  setSelectedDate,
  startDate,
  endDate,
  recurringDays,
  recurringEndDate,
}) => {
  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const dateFormatter = new Intl.DateTimeFormat('en-US', options);

  const [currentPage, setCurrentPage] = useState(0);
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }
    endDate = recurringEndDate ? recurringEndDate : endDate;
    const allDays = Array.from(
      {
        length: (endDate - startDate) / (1000 * 60 * 60 * 24) + 1,
      },
      (_, index) => {
        const tempDate = new Date(startDate);
        tempDate.setDate(tempDate.getDate() + index);
        return {
          key: tempDate.getTime(),
          label: dateFormatter.format(tempDate),
          value: tempDate,
        };
      }
    );

    if (!selectedDate) {
      setSelectedDate(allDays[0]);
    }

    if (recurringDays) {
      const filterRecuringDays = allDays
        .map((item) => {
          const result = recDays(item.label, recurringDays);
          if (result) {
            return { key: item.key, label: item.label, value: item.value };
          } else {
            return null;
          }
        })
        .filter((item) => item !== null);
      setDays(filterRecuringDays);
    } else {
      setDays(allDays);
    }
  }, [startDate, endDate, selectedDate]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handlePrevWeek = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextWeek = () => {
    if (days.length > (currentPage + 1) * 7) {
      setCurrentPage(currentPage + 1);
    }
  };
  const getAvailableDaysForPage = (pageNumber) => {
    const startIndex = pageNumber * 7;
    const endIndex = Math.min(startIndex + 7, days.length);
    return days.slice(startIndex, endIndex);
  };
  return (
    <div className={styles.weekContainter}>
      <span
        onClick={handlePrevWeek}
        className={`${styles.arrowBox} ${currentPage === 0 ? 'd-none' : ''}`}
      >
        {'<'}
      </span>

      {getAvailableDaysForPage(currentPage).map((day, index) => (
        <span
          key={day.key}
          onClick={() => handleDayClick(day)}
          className={`${styles.dateBox} 
                    ${
                      day?.label === selectedDate.label
                        ? styles.dateBoxChecked
                        : ''
                    }`}
        >
          {day.label}
        </span>
      ))}

      <span
        onClick={handleNextWeek}
        className={`${styles.arrowBox} mr-0 ${
          days.length <= (currentPage + 1) * 7 ? 'd-none' : ''
        }`}
      >
        {'>'}
      </span>
    </div>
  );
};

export default WeekDateList;
