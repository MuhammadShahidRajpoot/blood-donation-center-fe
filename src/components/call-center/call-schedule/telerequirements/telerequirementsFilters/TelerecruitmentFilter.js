import React, { useEffect, useState } from 'react';
import './index.scss';
//import { toast } from 'react-toastify';
import SelectDropdown from '../../../../common/selectDropdown';
//import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import DateRangeSelector from '../../../DateRangePicker/DateRangeSelector';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import { sortByLabel } from '../../../../../helpers/utils';

const TelerecruitmentFilters = ({ setIsLoading, fetchAllFilters }) => {
  const bearerToken = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [filterFormData, setFilterFormData] = useState({});
  const [collectionOperation, setCollectionOperation] = useState([]);

  const [selectedCollectionOperation, setSelectedCollectionOperation] =
    useState([]);

  const driveStatusOptions = [
    {
      label: 'Tentative',
      value: 'tentative',
    },
    {
      label: 'Confirmed',
      value: 'confirmed',
    },
  ];

  const jobStatusOptions = [
    {
      label: 'Pending',
      value: 'pending',
    },
    {
      label: 'Declined',
      value: 'declined',
    },
    {
      label: 'Created',
      value: 'created',
    },
    {
      label: 'Cancelled',
      value: 'cancelled',
    },
  ];

  useEffect(() => {
    getCollectionOperationData();
  }, []);

  const getCollectionOperationData = async () => {
    const result = await fetch(
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    const data = await result.json();

    setCollectionOperation([
      ...(data?.data?.map((item) => {
        return { id: item.id, name: item.name };
      }) || []),
    ]);
  };

  const handleFormChange = (name, data) => {
    setIsLoading(true);
    setFilterFormData({
      ...filterFormData,
      [name]: data,
    });
    fetchAllFilters({
      ...filterFormData,
      [name]: data?.value,
    });
  };

  const handleCollectionOperation = (data) => {
    const selected = selectedCollectionOperation.some(
      (item) => item.id === data.id
    )
      ? selectedCollectionOperation.filter((item) => item.id !== data.id)
      : [...selectedCollectionOperation, data];

    setSelectedCollectionOperation(selected);

    handleFormChange('collection_operation', {
      label: 'Collection Operation',
      value: selected.map((value) => value.id),
    });
  };

  const handleAllCollectionOperation = (data) => {
    setSelectedCollectionOperation(data);
    handleFormChange('collection_operation', {
      label: 'Collection Operation',
      value: data.map((value) => value.id),
    });
  };

  const selectionValue = (filterName) => {
    return filterFormData[filterName];
  };
  const onSelectDate = (date) => {
    setFilterFormData({
      ...filterFormData,
      start_date: date.startDate,
      end_date: date.endDate,
    });
    fetchAllFilters({
      ...filterFormData,
      start_date: date.startDate,
      end_date: date.endDate,
    });
  };
  return (
    <div className="mb-3 filterBar px-0 donors_centersFilters">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filter">
          <form className="d-flex align-items-center gap-4 ">
            <SelectDropdown
              options={driveStatusOptions}
              removeDivider={true}
              selectedValue={selectionValue('drive_status') || ''}
              placeholder={'Drive Status'}
              onChange={(data) => handleFormChange('drive_status', data)}
            />
            <DateRangeSelector
              onSelectDate={onSelectDate}
              dateValues={{
                startDate: filterFormData?.start_date,
                endDate: filterFormData?.end_date,
              }}
              //selectedOptions={selectedOptions}
            />
            <GlobalMultiSelect
              label="Collection Operation"
              data={sortByLabel(
                collectionOperation.map((item) => {
                  return {
                    name: item.name,
                    id: item.id,
                  };
                })
              )}
              selectedOptions={selectedCollectionOperation}
              onChange={handleCollectionOperation}
              onSelectAll={(data) => {
                handleAllCollectionOperation(data);
              }}
            />
            <SelectDropdown
              options={jobStatusOptions}
              removeDivider={true}
              selectedValue={selectionValue('job_status') || ''}
              placeholder={'Job Status'}
              onChange={(data) => handleFormChange('job_status', data)}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default TelerecruitmentFilters;
