import React from 'react';
import SvgComponent from '../../../../../../common/SvgComponent';
import './extraHeaderComponent.scss';

export const ExtraHeaderComponent = ({ title }) => {
  return (
    <div className="extraHeaderWrapper">
      <SvgComponent name={'ToolTipIcon'} color={'#005375'} />
      <div className="extraHeaderTitle">{title}</div>
    </div>
  );
};
