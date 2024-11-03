import React from 'react';
import moment from 'moment';
import './index.scss';
import styles from './index.scss';
import DateRangeSelector from '../../DateRangePicker/DateRangeSelector';

function SegmentListFilters({ startDate, endDate, setStartDate, setEndDate }) {
  const onSelectDate = (date) => {
    if (date && date.endDate) {
      setStartDate(moment(date.startDate).format('MM-DD-YYYY'));
      setEndDate(moment(date.endDate).format('MM-DD-YYYY'));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="mb-3 filterBar px-0 staffListFilters">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filter">
          <form className="d-flex align-items-center gap-4 ">
            <div className={`${styles.fieldDate}`}>
              <DateRangeSelector
                onSelectDate={onSelectDate}
                dateValues={{
                  startDate: startDate,
                  endDate: endDate,
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SegmentListFilters;
