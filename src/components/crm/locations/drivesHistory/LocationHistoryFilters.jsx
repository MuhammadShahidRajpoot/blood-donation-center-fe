import React, { useState } from 'react';
import styles from './index.module.scss';
import SelectDropdown from '../../../common/selectDropdown';
import DatePicker from '../../../common/DatePicker';
import SvgComponent from '../../../common/SvgComponent';

export default function LocationHistoryFilters({
  handleFilter,
  operationStatus,
}) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleStatusChange = (option) => {
    setSelectedStatus(option);
    handleFilter({ status: option ? parseInt(option?.value) : '' });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
    handleFilter({ date_range: value });
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="filterBar">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filterIcon" onClick={filterChange}>
          <SvgComponent
            name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
          />
        </div>
        <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
          <form className={`d-flex gap-3 w-100`}>
            <div className="form-field w-100">
              <div className={`field position-relative ${styles.fieldDate}`}>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={handleDateChange}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  placeholderText="Date Range"
                  selectsRange
                />
                {(dateRange?.startDate !== null &&
                  dateRange?.endDate !== null) ||
                (dateRange?.startDate !== null &&
                  dateRange?.endDate === null) ? (
                  <label
                    className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                  >
                    Date Range
                  </label>
                ) : null}
              </div>
            </div>
            <SelectDropdown
              styles={{ root: '' }}
              placeholder={'Status'}
              showLabel={selectedStatus}
              defaultValue={selectedStatus}
              selectedValue={selectedStatus}
              removeDivider
              onChange={handleStatusChange}
              options={operationStatus}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
