import React from 'react';

const thisMonth = () => {
  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth, 1);

  const endOfMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
    23,
    59,
    59,
    999
  );
  return {
    from: startOfMonth,
    to: endOfMonth,
  };
};

const lastMonth = () => {
  const currentDate = new Date();

  const lastMonth = currentDate.getMonth() - 1;
  const currentYear = currentDate.getFullYear();

  const startOfMonth = new Date(currentYear, lastMonth, 1);

  const endOfMonth = new Date(currentYear, lastMonth + 1, 0, 23, 59, 59, 999);
  return {
    from: startOfMonth,
    to: endOfMonth,
  };
};

const lastSixMonths = () => {
  const currentDate = new Date();

  let startMonth = currentDate.getMonth() - 5;
  let startYear = currentDate.getFullYear();

  if (startMonth < 0) {
    startMonth += 12;
    startYear -= 1;
  }

  const endMonth = currentDate.getMonth();
  const endYear = currentDate.getFullYear();

  const startDate = new Date(startYear, startMonth, 1);
  const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59, 999);

  return {
    from: startDate,
    to: endDate,
  };
};

const thisQuarter = () => {
  const currentDate = new Date();

  const currentQuarter = Math.floor(currentDate.getMonth() / 3);

  const startOfQuarter = new Date(
    currentDate.getFullYear(),
    currentQuarter * 3,
    1
  );
  const endOfQuarter = new Date(
    currentDate.getFullYear(),
    (currentQuarter + 1) * 3,
    0,
    23,
    59,
    59,
    999
  );

  return {
    from: startOfQuarter,
    to: endOfQuarter,
  };
};

const lastQuarter = () => {
  const currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentQuarter = Math.floor(currentDate.getMonth() / 3);
  if (currentQuarter === 0) {
    currentYear -= 1;
    currentQuarter = 3;
  } else {
    currentQuarter -= 1;
  }

  const startOfQuarter = new Date(currentYear, currentQuarter * 3, 1);
  const endOfQuarter = new Date(
    currentYear,
    (currentQuarter + 1) * 3,
    0,
    23,
    59,
    59,
    999
  );

  return {
    from: startOfQuarter,
    to: endOfQuarter,
  };
};

const thisYear = () => {
  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();

  const startOfYear = new Date(currentYear, 0, 1);

  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
  return {
    from: startOfYear,
    to: endOfYear,
  };
};

const lastYear = () => {
  const currentDate = new Date();

  const lastYear = currentDate.getFullYear() - 1;

  const startOfYear = new Date(lastYear, 0, 1);

  const endOfYear = new Date(lastYear, 11, 31, 23, 59, 59, 999);
  return {
    from: startOfYear,
    to: endOfYear,
  };
};

export const Preset = ({ onChange }) => {
  const presets = {
    'This Month': thisMonth,
    'Last Month': lastMonth,
    'Last Six Months': lastSixMonths,
    'This Quarter': thisQuarter,
    'Last Quarter': lastQuarter,
    'This Year': thisYear,
    'Last Year': lastYear,
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '170px',
        height: '347px',
        overflow: 'scroll',
      }}
    >
      {Object.keys(presets).map((preset) => {
        return (
          <button
            key={preset}
            onClick={() => onChange(presets[preset]())}
            style={{
              fontSize: '14px',
              fontFamily: 'Inter',
              lineHeight: '16px',
              padding: '13px 55px 13px 20px',
              backgroundColor: 'unset',
              border: 'unset',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'black',
            }}
          >
            {preset}
          </button>
        );
      })}
    </div>
  );
};
