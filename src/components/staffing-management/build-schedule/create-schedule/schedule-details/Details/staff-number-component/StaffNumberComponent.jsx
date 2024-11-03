import React from 'react';
import './staffNumberComponent.scss';

export const StaffNumberComponent = ({ number }) => {
  return (
    <div className="numberWrapper">
      <div className="numberContainer">{number}</div>
    </div>
  );
};
