import React from 'react';
import { Circle } from './Circle';

export const HintTextAndValue = ({ text, value, circleColor }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      {circleColor && <Circle color={circleColor} />}
      <p style={{ margin: '0px', fontSize: '12px', color: '#bababa' }}>
        {text}
      </p>
      <p style={{ color: 'black', margin: '0px', fontSize: '12px' }}>{value}</p>
    </div>
  );
};
