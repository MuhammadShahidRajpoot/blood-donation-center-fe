import React from 'react';
import './transferExtension.scss';

const dialerCounter = [
  {
    dial: 1,
    id: 1,
  },
  {
    dial: 2,
    id: 2,
  },
  {
    dial: 3,
    id: 3,
  },
  {
    dial: 4,
    id: 4,
  },
  {
    dial: 5,
    id: 5,
  },
  {
    dial: 6,
    id: 6,
  },
  {
    dial: 7,
    id: 7,
  },
  {
    dial: 8,
    id: 8,
  },
  {
    dial: 9,
    id: 9,
  },
  {
    dial: 0,
    id: 0,
  },
];

const TransferExtension = ({ dialer, setDialer }) => {
  const handleDialer = (dial) => {
    if (dialer.length === 4) {
      return;
    }
    setDialer(`${dialer}${dial}`);
  };

  return (
    <div className="dialer_wraper">
      <div className="dialer_header">
        <h3>Transfer to extension</h3>
      </div>
      <div
        className={`${dialer ? 'after_counter' : 'before_counter'} font_style`}
      >
        {dialer ? dialer : '0000'}
      </div>

      <div className="dialer">
        <ul>
          {dialerCounter.map((item, index) => {
            return (
              <li
                key={item.id}
                className={`${index === 9 ? 'last_dialer' : ''}`}
                onClick={() => handleDialer(item.dial)}
              >
                {item.dial}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
export default TransferExtension;
