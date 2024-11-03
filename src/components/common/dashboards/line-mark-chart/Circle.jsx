import React from 'react';

export const Circle = ({ color }) => {
  return (
    <div
      style={{
        width: '6px',
        height: '6px',
        border: `1px solid ${color}`,
        borderRadius: '50px',
      }}
    ></div>
  );
};
