import React from 'react';
import viewimage from '../../../../assets/images/contact-about.png';

const Volunteer = (props) => {
  return (
    <div className="imageHeading">
      <img src={viewimage} className="bg-white heroIconImg" alt="CancelIcon" />
      <div className="d-flex flex-column">
        <h4>
          {`${props?.volunteer?.first_name ? props?.volunteer.first_name : ''} 
          ${props?.volunteer?.last_name ? props?.volunteer.last_name : ''}`}
        </h4>
        <span>{props?.volunteer?.title || ''}</span>
      </div>
    </div>
  );
};

export default React.memo(Volunteer);
