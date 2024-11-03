import React, { useEffect, useState } from 'react';
import './MonthPicker.scss';

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const currentYear = new Date().getFullYear();

const leftYears = Array.from(
  { length: currentYear - 1969 },
  (_, index) => currentYear - index - 1
);

const rightYears = Array.from(
  { length: currentYear - 1969 },
  (_, index) => currentYear - index
);

const getFromDate = (month, year) => {
  return new Date(year, month, 1, 0, 0, 0, 0);
};

const getToDate = (month, year) => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
};

const YearPicker = ({ value, onChange, options }) => {
  return (
    <div className={'rdrCalendarWrapper'} style={{ width: '100%' }}>
      <div className={'rdrMonthAndYearWrapper'}>
        <span className={'rdrMonthAndYearPickers'}>
          <span className={'rdrYearPicker'}>
            <select onChange={onChange} value={value}>
              {options.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </span>
        </span>
      </div>
    </div>
  );
};

export const MonthRangePicker = ({
  value,
  onChange,
  presetComponent,
  onCancel,
  onApply,
}) => {
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [leftYear, setLeftYear] = useState(new Date().getFullYear() - 1);
  const [rightYear, setRightYear] = useState(new Date().getFullYear());

  useEffect(() => {
    value?.startDate && setFrom(value.startDate);
    value?.endDate && setTo(value.endDate);
  }, [value?.startDate, value?.endDate]);

  useEffect(() => {
    onChange && onChange({ from, to });
  }, [from, to]);

  const handleMonthClick = (month, year) => {
    if (!from) {
      setFrom(getFromDate(month, year));
    } else if (from && to) {
      setTo();
      setFrom(getFromDate(month, year));
    } else {
      const toDate = getToDate(month, year);
      if (toDate < from) {
        setTo(getToDate(from.getMonth(), from.getFullYear()));
        setFrom(getFromDate(month, year));
      } else {
        setTo(toDate);
      }
    }
  };

  const calculateLeftYearChange = (year) => {
    if (year >= rightYear) {
      setRightYear(year + 1);
      setLeftYear(year);
    } else {
      setLeftYear(year);
    }
  };

  const calculateRightYearChange = (year) => {
    if (year <= leftYear) {
      setLeftYear(year - 1);
      setRightYear(year);
    } else {
      setRightYear(year);
    }
  };

  const calculateMonthColor = (month, year) => {
    if (
      (from && month === from.getMonth() && year === from.getFullYear()) ||
      (to && month === to.getMonth() && year === to.getFullYear())
    ) {
      return '#387DE5';
    } else if (
      from &&
      to &&
      ((from.getFullYear() === to.getFullYear() &&
        month > from.getMonth() &&
        month < to.getMonth() &&
        year === to.getFullYear()) ||
        (from.getFullYear() !== to.getFullYear() &&
          ((month > from.getMonth() && year === from.getFullYear()) ||
            (month < to.getMonth() && year === to.getFullYear()) ||
            (from.getFullYear() < year && year < to.getFullYear()))))
    ) {
      return '#EDF4FF';
    }
    return 'unset';
  };

  const disableMonth = (month, year) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    return currentYear < year || (currentYear === year && month > currentMonth)
      ? true
      : false;
  };

  const handlePreset = ({ from, to }) => {
    setFrom(from);
    setTo(to);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {presetComponent && (
        <div>
          {React.cloneElement(presetComponent, { onChange: handlePreset })}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flex: 1,
          }}
        >
          <div>
            <YearPicker
              onChange={(e) => calculateLeftYearChange(Number(e.target.value))}
              value={leftYear}
              options={leftYears}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
              }}
            >
              {months.map((month, index) => (
                <button
                  key={month}
                  disabled={disableMonth(index, leftYear)}
                  style={{
                    padding: '16px',
                    borderRadius: '4px',
                    border: '0px',
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontFamily: 'Inter',
                    fontWeight: '400',
                    lineHeight: '19px',
                    color:
                      (from &&
                        from.getMonth() === index &&
                        from.getFullYear() === leftYear) ||
                      (to &&
                        to.getMonth() === index &&
                        to.getFullYear() === leftYear)
                        ? 'white'
                        : disableMonth(index, leftYear)
                        ? '#D9D9D9'
                        : 'black',
                    backgroundColor: calculateMonthColor(index, leftYear),
                  }}
                  onClick={() => handleMonthClick(index, leftYear)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
          <div>
            <YearPicker
              onChange={(e) => calculateRightYearChange(Number(e.target.value))}
              value={rightYear}
              options={rightYears}
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
              }}
            >
              {months.map((month, index) => (
                <button
                  key={month}
                  disabled={disableMonth(index, rightYear)}
                  style={{
                    padding: '16px',
                    borderRadius: '4px',
                    border: '0px',
                    flex: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontFamily: 'Inter',
                    fontWeight: '400',
                    lineHeight: '19px',
                    color:
                      (from &&
                        from.getMonth() === index &&
                        from.getFullYear() === rightYear) ||
                      (to &&
                        to.getMonth() === index &&
                        to.getFullYear() === rightYear)
                        ? 'white'
                        : disableMonth(index, rightYear)
                        ? '#D9D9D9'
                        : 'black',
                    backgroundColor: calculateMonthColor(index, rightYear),
                  }}
                  onClick={() => handleMonthClick(index, rightYear)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div
          className="d-flex justify-content-end  align-items-center"
          style={{
            padding: '20px',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              borderRadius: '6px',
              fontSize: '16px',
              color: '#387DE5',
              backgroundColor: 'unset',
            }}
          >
            Cancel
          </button>
          <button
            style={{
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#387DE5',
            }}
            onClick={() => onApply(from, to)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
