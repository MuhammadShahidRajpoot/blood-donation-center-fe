import React from 'react';

const NavigationTopBar = ({ img, data }) => {
  return (
    <div className="imageHeading">
      <img src={img} alt="CancelIcon" />
      <div className="d-flex flex-column">
        <h4>{data?.account?.name || ''}</h4>
        <span>{data?.crm_locations?.name || ''}</span>
      </div>
    </div>
  );
};

export default NavigationTopBar;
