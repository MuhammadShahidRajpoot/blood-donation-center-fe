import React from 'react';
import './hourDetailComponent.scss';

export const HourDetailComponent = ({ text, reason }) => {
  return (
    <div className="nameDetailWrapper">
      <div className="nameContainer">{text}</div>
      {reason && (
        <div className="reasonContainer2" title={reason}>
          {reason}
        </div>
      )}
    </div>
  );
};
