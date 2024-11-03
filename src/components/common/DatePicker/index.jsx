import React from 'react';
import ReactDatePicker from 'react-datepicker';
import styles from './index.module.scss';

export default function DatePicker({
  selected,
  onChange,
  startDate = null,
  endDate = null,
  minDate = null,
  maxDate = null,
  isClearable = true,
  selectsRange = false,
  placeholderText,
  className,
  style,
  dateFormat = 'MM/dd/yyyy',
  showLabel = false,
  ...rest
}) {
  return (
    <>
      <ReactDatePicker
        dateFormat={dateFormat}
        className={`custom-datepicker ${styles.dateRangePicker} ${className}`}
        style={{ minWidth: '18rem', ...style }}
        selected={selected}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        selectsRange={selectsRange}
        isClearable={isClearable}
        placeholderText={placeholderText}
        clearButtonClassName={`${styles.dateRangePickerCloseIcon}`}
        {...rest}
      />

      {/* To display label ensure your wrapping div has position relative */}

      {showLabel &&
      ((startDate !== null && endDate !== null) ||
        (startDate !== null && endDate === null) ||
        selected) ? (
        <label className={`text-secondary ${styles.label} ml-1 mt-1 pb-2`}>
          {placeholderText}
        </label>
      ) : null}
    </>
  );
}
