import React from 'react';
import SvgComponent from '../../../../../../common/SvgComponent';

export const Add = ({ onClick, selectedRow }) => {
  return (
    <div
      style={
        { cursor: 'pointer' } && selectedRow !== undefined
          ? { backgroundColor: 'unset' }
          : {}
      }
      className="addWrapper"
      onClick={onClick}
    >
      <SvgComponent name={'PlusIconSilver'} />
    </div>
  );
};
