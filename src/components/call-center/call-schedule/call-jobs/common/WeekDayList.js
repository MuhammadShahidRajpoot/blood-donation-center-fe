import React, { useState, useEffect } from 'react';
import styles from './../call-jobs.module.scss';

const WeekDayList = ({ recurringDays, setData }) => {
  const [days, setDays] = useState([
    { key: '1', label: 'M', value: 'Monday', checked: false },
    { key: '2', label: 'T', value: 'Tuesday', checked: false },
    { key: '3', label: 'W', value: 'Wednesday', checked: false },
    { key: '4', label: 'T', value: 'Thursday', checked: false },
    { key: '5', label: 'F', value: 'Friday', checked: false },
    { key: '6', label: 'S', value: 'Saturday', checked: false },
    { key: '7', label: 'S', value: 'Sunday', checked: false },
  ]);

  useEffect(() => {
    if (recurringDays) {
      const recurringDaysArray = recurringDays.split(',');
      const updatedDays = days.map((day) => ({
        ...day,
        checked: recurringDaysArray.includes(day.value),
      }));
      setDays(updatedDays);
    }
  }, [recurringDays]);

  const handleDayClick = (index, checked) => {
    const updatedDays = [...days]; // Create a copy of the state array
    updatedDays[index].checked = checked; // Update the copy
    setDays(updatedDays); // Update the state with the new array
    setData(
      updatedDays
        .filter((day) => day.checked)
        .map((day) => day.value)
        .join(',')
    );
  };

  return (
    <div className={styles.weekContainter}>
      {days.map((item, index) => (
        <span
          onClick={() => handleDayClick(index, !item.checked)}
          className={`${styles.dayBox} 
          ${item.checked ? styles.dayBoxChecked : ''}`}
          key={index}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
};
export default WeekDayList;
