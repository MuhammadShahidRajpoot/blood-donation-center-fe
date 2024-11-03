import React from 'react';
import './nameDetailComponent.scss';

export const NameDetailComponent = ({ firstName, lastName, reason }) => {
  return (
    <div className="nameDetailWrapper">
      <div className="nameContainer">
        {firstName} {lastName}
      </div>
      {reason && <div className="reasonContainer">{reason}</div>}
    </div>
  );
};
