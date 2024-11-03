import React from 'react';
import './scheduledDaysTableComponent.scss';

export const ScheduledDaysTableComponent = ({ scheduledDays, selectedRow }) => {
  const daysMap = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div
      className="scheduleWrapper"
      style={selectedRow !== undefined ? { backgroundColor: 'unset' } : {}}
    >
      {daysMap.map((day, index) => {
        return (
          <div
            key={index}
            className={`scheduleDay ${
              scheduledDays.includes(index + 1 > 6 ? 0 : index + 1)
                ? 'unavailable'
                : ''
            }`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
};
