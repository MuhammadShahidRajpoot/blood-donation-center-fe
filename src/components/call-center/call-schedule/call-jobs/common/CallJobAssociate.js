import styles from './index.module.scss';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import TableList from '../../../../common/tableListing';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import SelectDropdown from '../../../../common/selectDropdown';
import { toast } from 'react-toastify';
import Pagination from '../../../../common/pagination';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';
import DateRangeSelector from '../../../DateRangePicker/DateRangeSelector';
// import Permissions from '../../../../enums/PermissionsEnum';
//let inputTimer = null;

const CallJobAssociate = ({
  associateType = '',
  searchText = '',
  setAssociateType,
  selectedData,
  setSelectedData,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [promotion, setPromotion] = useState([]);
  const [recruiter, setRecruiter] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [promotionData, setPromotionData] = useState([]);
  const [recruiterData, setRecruiterData] = useState([]);
  const [isActive, setIsActive] = useState(null);
  const [selectedAssociated, setSelectedAssociated] = useState([]);

  const [checkedAssociated, setCheckedAssociated] = useState([]);

  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {}, [selectedAssociated]);

  const tableHeaders = [
    {
      name: 'date',
      label: 'Date',
      width: '15%',
      sortable: true,
    },

    {
      name: 'account_name',
      label: 'Account Name',
      width: '25%',
      sortable: true,
    },
    {
      name: 'location',
      label: 'Location',
      width: '15%',
      sortable: true,
    },

    {
      name: 'hours',
      label: 'Hours',
      width: '10%',
      sortable: true,
    },
    {
      name: 'recruiter',
      label: 'Recruiter',
      width: '30%',
      maxWidth: '200px',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Status',
      width: '10%',
      sortable: true,
    },
  ];
  useEffect(() => {
    fetchAssociateData();
    fetchCollectionOperations();
    fetchPromotionData();
    fetchRecruiterData();
  }, []);

  const handleFilters = () => {
    fetchAssociateData();
  };

  useEffect(() => {
    fetchAssociateData();
    fetchCollectionOperations();
  }, [sortOrder, sortBy, currentPage, limit]);

  const fetchAssociateData = async () => {
    if (associateType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText.length > 0 ? `&keyword=${searchText}` : ''
        } ${
          promotion && promotion.length > 0
            ? `&promotion=${JSON.stringify(promotion)}`
            : ''
        }${
          recruiter && recruiter.length > 0
            ? `&recruiter=${JSON.stringify(recruiter)}`
            : ''
        }
        ${
          collectionOperation && collectionOperation.length > 0
            ? `&collectionOperation=${JSON.stringify(collectionOperation)}`
            : ''
        }
        ${startDate ? `&startDate=${startDate}` : ''}${
          endDate ? `&endDate=${endDate}` : ''
        }${isActive?.value ? `&is_active=${isActive?.value.toString()}` : ''}`
      );
      const data = await response.json();

      let rows = data?.data?.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.account_name,
          location: row.locations_name,
          hours: `${formatDateWithTZ(
            row.start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(row.end_time, 'hh:mm a')}`,
          recruiter: row.cp_name,
          status: 'InProgress',
        };
      });
      setRows(rows);

      setTotalRecords(data?.count);
    } else if (associateType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations/sessions/list?sortOrder=${sortOrder}&sortName=${sortBy}&page=${currentPage}&limit=${limit}&keyword=${searchText}`
      );
      const data = await response.json();
      console.log(data?.data);

      let rows = data?.data?.records.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.donor_center,
          location: 'Location test',
          hours: `${formatDateWithTZ(
            row.start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(row.end_time, 'hh:mm a')}`,
          recruiter: 'Recruiter test',
          status: row.status,
        };
      });
      setRows(rows);

      setTotalRecords(data?.count);
    } else {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations/non-collection-events?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}&keyword=${searchText}`
      );
      const data = await response.json();
      console.log(data?.data);

      let rows = data?.data?.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.event_name,
          location: row.location_id.name,
          hours: `${formatDateWithTZ(
            row.shifts[0].start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(row.shifts[0].end_time, 'hh:mm a')}`,
          recruiter: row.owner_id.first_name + ' ' + row.owner_id.last_name,
          status: row.status_id.name,
        };
      });
      setRows(rows);

      setTotalRecords(data?.count);
    }
  };

  const fetchCollectionOperations = async () => {
    const result = await fetch(
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`,
      {
        headers: {
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      let formatCollectionOperations = data?.map((operation) => ({
        name: operation?.name,
        id: operation?.id,
      }));
      setCollectionOperationData([...formatCollectionOperations]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };
  const fetchPromotionData = async () => {
    const result = await fetch(`${BASE_URL}/marketing-equipment/promotions`, {
      headers: {
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      let promotionDropDownValues = data?.map((operation) => ({
        name: operation?.name,
        id: operation?.id,
      }));
      setPromotionData([...promotionDropDownValues]);
    } else {
      toast.error('Error Fetching promotions', { autoClose: 3000 });
    }
  };

  const fetchRecruiterData = async () => {
    const result = await fetch(`${BASE_URL}/user/recruiters`, {
      headers: {
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      let recruiterDropDownValues = data?.map((operation) => ({
        name: operation?.first_name + ' ' + operation?.last_name,
        id: operation?.id,
      }));
      setRecruiterData([...recruiterDropDownValues]);
    } else {
      toast.error('Error Fetching recruiter', { autoClose: 3000 });
    }
  };

  const handleSort = (columnName) => {
    if (associateType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      if (columnName === 'account_name') {
        columnName = 'account';
      }
      if (columnName === 'location') {
        columnName = 'crm_locations';
      }
    } else if (associateType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      if (columnName === 'location') {
        return;
      }
      if (columnName === 'hours') {
        return;
      }
      if (columnName === 'recruiter') {
        return;
      }
      if (columnName === 'account_name') {
        columnName = 'donor_center';
      }
    } else {
      if (columnName === 'hours') {
        return;
      }
      if (columnName === 'recruiter') {
        columnName = 'owner_id';
      }
      if (columnName === 'account_name') {
        columnName = 'event_name';
      }
      if (columnName === 'location') {
        columnName = 'location_id';
      }
    }
    setCurrentPage(1);
    setSortBy(columnName);
    setSortOrder((prevSortOrder) => (prevSortOrder === 'ASC' ? 'DESC' : 'ASC'));
  };

  const handleCollectionOperation = (data) => {
    setCollectionOperation((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  const handlePromotion = (data) => {
    setPromotion((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };
  const handleRecruiter = (data) => {
    setRecruiter((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  const onSelectDate = (date) => {
    if (date && date.endDate) {
      setStartDate(moment(date.startDate).format('MM-DD-YYYY'));
      setEndDate(moment(date.endDate).format('MM-DD-YYYY'));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const selectAssociated = (selected) => {
    setCheckedAssociated(selected);

    setSelectedAssociated(
      rows.filter((row) => row.id.toString() === selected.toString())
    );
  };

  const addOperation = () => {
    setSelectedData(selectedAssociated);
    setAssociateType('');
  };

  return (
    <div className="mainContent">
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className={`filter`}>
            <form className="d-flex gap-3">
              <div className="d-flex flex-column ">
                <div className="d-flex gap-3 p-3 flex-wrap flex-row-reverse">
                  <div style={{ width: '270px' }}>
                    <DateRangeSelector
                      onSelectDate={onSelectDate}
                      dateValues={{
                        startDate: startDate,
                        endDate: endDate,
                      }}
                    />
                  </div>
                  <div style={{ width: '270px' }}>
                    <GlobalMultiSelect
                      label="Recruiter"
                      data={recruiterData}
                      selectedOptions={recruiter}
                      onChange={(data) => handleRecruiter(data)}
                      onSelectAll={(data) => setRecruiter(data)}
                    />
                  </div>
                  <div style={{ width: '270px' }}>
                    <GlobalMultiSelect
                      label="Promotion"
                      data={promotionData}
                      selectedOptions={promotion}
                      onChange={(data) => handlePromotion(data)}
                      onSelectAll={(data) => setPromotion(data)}
                    />
                  </div>
                  <div style={{ width: '270px' }}>
                    <GlobalMultiSelect
                      label="Collection Operation"
                      data={collectionOperationData}
                      selectedOptions={collectionOperation}
                      onChange={(data) => handleCollectionOperation(data)}
                      onSelectAll={(data) => setCollectionOperation(data)}
                    />
                  </div>

                  <div style={{ width: '270px' }}>
                    <SelectDropdown
                      placeholder={'Status'}
                      defaultValue={isActive}
                      selectedValue={isActive}
                      removeDivider
                      showLabel
                      onChange={(val) => setIsActive(val)}
                      options={[
                        { label: 'Active', value: 'true' },
                        { label: 'Inactive', value: 'false' },
                      ]}
                      id={'scheduleElementID'} //needs to add
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <TableList
          isLoading={false}
          data={rows}
          headers={tableHeaders}
          checkboxValues={checkedAssociated}
          handleCheckboxValue={(row) => row.id}
          handleCheckbox={selectAssociated}
          handleSort={handleSort}
          // sortName={sortName}
          // sortOrder={sortOrder}
          selectSingle={true}
          showAllCheckBoxListing={false}
          showAllRadioButtonListing={true}
          // statusClassMapping={statusClassMapping}
          // colorLables={colorLables}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />

        <div className="form-footer">
          <p
            className="btn simple-text"
            onClick={() => {
              setAssociateType('');
            }}
          >
            Cancel
          </p>
          <button
            type="button"
            className={`${styles.btnSearch}`}
            onClick={handleFilters}
          >
            Search
          </button>
          <button
            type="button"
            className={`btn btn-md btn-primary`}
            onClick={addOperation}
          >
            Add Operation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallJobAssociate;
