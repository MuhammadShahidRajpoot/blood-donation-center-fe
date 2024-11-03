import React, { useState } from 'react';
import DatePicker from '../../../common/DatePicker';
import SelectDropdown from '../../../common/selectDropdown';
import { API } from '../../../../api/api-routes';
import SvgComponent from '../../../common/SvgComponent';

export default function SessionHistoryFilters({ params, handleFilter }) {
  const [dateRange, setDateRange] = React.useState({
    startDate: (params?.start_date && new Date(params?.start_date)) || null,
    endDate: (params?.end_date && new Date(params?.end_date)) || null,
  });
  const [status, setStatus] = React.useState([]);
  const [selectedStatus, setSelectedStatus] = React.useState(null);

  React.useEffect(() => {
    const fetchStatus = async () => {
      const { data } =
        await API.systemConfiguration.operationAdministrations.bookingDrives.operationStatus.getOperationStatus();
      setStatus(
        data?.data?.map((status) => ({
          label: status.name,
          value: status.id,
        })) || []
      );
    };
    fetchStatus();
  }, []);

  React.useEffect(() => {
    if (params?.status) {
      setSelectedStatus(status?.find((item) => item.value === params?.status));
    }
  }, [params?.status, status]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
    handleFilter('date_range', value);
  };

  const handleStatusChange = (option) => {
    setSelectedStatus(option);
    handleFilter('status', option ? option?.value : null);
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
            <DatePicker
              selected={dateRange.startDate}
              onChange={handleDateChange}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              placeholderText="Date Range"
              selectsRange
            />
            <div className="d-flex w-100 gap-3">
              <SelectDropdown
                styles={{ root: 'mb-0' }}
                placeholder="Status"
                options={status}
                selectedValue={selectedStatus}
                onChange={handleStatusChange}
                removeDivider
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
