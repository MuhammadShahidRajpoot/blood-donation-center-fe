import React, { useState } from 'react';
import { LocationType, opertaionType } from '../data';
import SelectDropdown from '../../../../../common/selectDropdown';
import SvgComponent from '../../../../../common/SvgComponent';

const Fliters = ({ setQueryParams, queryParams, clearFilter }) => {
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
          <form className="d-flex gap-3">
            <SelectDropdown
              placeholder={'Operation Type'}
              defaultValue={queryParams?.operationType}
              selectedValue={queryParams?.operationType}
              removeDivider
              showLabel
              onChange={(value) => {
                setQueryParams((prev) => ({
                  ...prev,
                  operationType: value,
                }));
              }}
              options={opertaionType}
            />

            <SelectDropdown
              placeholder={'Location Type'}
              defaultValue={queryParams?.locationType}
              selectedValue={queryParams?.locationType}
              removeDivider
              showLabel
              onChange={(value) => {
                setQueryParams((prev) => ({
                  ...prev,
                  locationType: value,
                }));
              }}
              options={LocationType}
            />
            <SelectDropdown
              placeholder={'Status'}
              defaultValue={queryParams?.status}
              selectedValue={queryParams?.status}
              removeDivider
              showLabel
              onChange={(value) => {
                setQueryParams((prev) => ({
                  ...prev,
                  status: value,
                }));
              }}
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' },
              ]}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Fliters;
