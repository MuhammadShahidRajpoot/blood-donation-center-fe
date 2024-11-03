import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SelectDropdown from '../../common/selectDropdown';
import TableList from '../../common/tableListing';
import Pagination from '../../common/pagination';
import { CALL_CENTER_DIALING_CENTER } from '../../../routes/path';
import moment from 'moment';
import { fetchData } from '../../../helpers/Api';
import DatePicker from '../../common/DatePicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TimePicker from 'rc-time-picker';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import SvgComponent from '../../common/SvgComponent';
import { formatDateWithTZ } from '../../../helpers/convertDateTimeToTimezone';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

const initialDate = {
  startDate: null,
  endDate: null,
};

const DialingCenterFilter = ({ donorId }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT || 25);
  const [currentPage, setCurrentPage] = useState(1);
  const [donorCreateAppointments, setDonorCreateAppointments] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [radius, setRadius] = useState('');
  const [donationTypeData, setDonationTypeData] = useState([]);
  const bearerToken = localStorage.getItem('token');
  const [account, setAccount] = useState(null);
  const [accountsData, setAccountsData] = useState([]);
  const [donorCenterData, setDonorCenterData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(initialDate);
  const [donationType, setDonationType] = useState(null);
  const [donorCenter, setDonorCenter] = useState(null);
  const [earlierThan, setEarlierThan] = useState();
  const [laterThan, setLaterThan] = useState();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkCondition =
    !donationType &&
    !donorCenter &&
    !account &&
    !dateRange?.endDate &&
    !earlierThan &&
    !laterThan &&
    !radius;

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
  };

  const getWithStatus = async () => {
    try {
      setIsLoading(true);
      const result = await fetchData(
        `/contact-donors/donor-appointments/create-listing/${donorId}?limit=${limit}&page=${currentPage}&sortBy=${sortBy}&sortOrder=${sortOrder}&procedureType=${
          donationType?.value || ''
        }&accountType=${account?.value || ''}&donorCenter=${
          donorCenter?.value || ''
        }&earlierThan=${earlierThan ? earlierThan : ''}&laterThan=${
          laterThan ? laterThan : ''
        }&dateRange=${
          dateRange?.startDate && dateRange?.endDate
            ? moment(dateRange?.startDate).format('YYYY-MM-DD') +
              ' ' +
              moment(dateRange?.endDate).format('YYYY-MM-DD')
            : ''
        }&radius=${radius}`
      );
      const { data, status, count } = result;

      if (status === 200) {
        setDonorCreateAppointments(
          data.map((singleData) => {
            return {
              ...singleData,
              date: singleData?.date,
              location: singleData?.location,
              promotions: singleData?.promotions,
              appointmentTime:
                singleData?.later_than && singleData?.later_than
                  ? `${formatDateWithTZ(
                      singleData?.later_than,
                      'hh:mm a'
                    )} - ${formatDateWithTZ(
                      singleData?.earlier_than,
                      'hh:mm a'
                    )}`
                  : '',
            };
          })
        );
        setTotalRecords(count);
        if (!(data?.length > 0) && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(false);
    if (checkCondition) return;
  }, [
    sortBy,
    sortOrder,
    currentPage,
    limit,
    donationType,
    donorCenter,
    account,
    earlierThan,
    laterThan,
    radius,
  ]);

  const getFilters = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/contact-donors/donor-appointments/filters/${donorId}`,
        {
          method: 'GET',
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      );
      const data = await result.json();
      if (data?.status === 200) {
        setDonationTypeData(data.data?.procedureTypes);
        setAccountsData(data.data?.accounts);
        setDonorCenterData(data.data?.donorCenters);
        if (
          searchParams.get('don-acc') &&
          searchParams.get('type') &&
          searchParams.get('donation-type')
        ) {
          setDonationType(
            data?.data?.procedureTypes?.filter(
              (procTypes) =>
                procTypes.value === searchParams.get('donation-type')
            )?.[0]
          );
          if (
            searchParams.get('type') === PolymorphicType.OC_OPERATIONS_DRIVES
          ) {
            setAccount(
              data?.data?.accounts?.filter(
                (acc) => acc.value === searchParams.get('don-acc')
              )?.[0]
            );
          } else {
            setDonorCenter(
              data?.data?.donorCenters?.filter(
                (dc) => dc.value === searchParams.get('don-acc')
              )?.[0]
            );
          }
        }
      } else toast.error('Error fetching filter data:');
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    getFilters();
  }, []);

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortBy('');
        setSortOrder('');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (
      (dateRange?.startDate && dateRange?.endDate) ||
      (!dateRange?.startDate && !dateRange?.endDate)
    ) {
      if (checkCondition) return;
    }
  }, [dateRange.startDate, dateRange.endDate]);

  const handleSearch = () => {
    getWithStatus();
  };
  const tableHeaders = [
    { name: 'date', label: 'Date', sortable: true },
    { name: 'location', label: 'Location', sortable: true },
    { name: 'appointmentTime', label: 'Appointment Time', sortable: true },
    { name: 'promotions', label: 'Promotion', sortable: true },
    {
      type: 'custom-component',
      component: (data) => {
        return (
          <Link
            className={`btn btn-secondary px-2 py-1`}
            type="button"
            to={`${CALL_CENTER_DIALING_CENTER.CREATE.replace(
              ':donorId',
              donorId
            )
              .replace(':typeId', data?.id)
              .replace(':type', data?.type)}`}
          >
            Schedule
          </Link>
        );
      },
    },
    {},
  ];

  const handleChange = (e) => {
    let inputValue = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      inputValue = inputValue?.substring(0, inputValue.length - 1);
    }
    setRadius(inputValue);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <div className="filterBar">
        <div className="filterInner two-rows">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 w-100`}>
              <SelectDropdown
                placeholder={'Donation Type'}
                defaultValue={donationType}
                selectedValue={donationType}
                onChange={setDonationType}
                removeDivider
                showLabel
                options={donationTypeData}
              />
              <SelectDropdown
                placeholder={'Account'}
                defaultValue={account}
                selectedValue={account}
                showLabel
                removeDivider
                onChange={setAccount}
                options={accountsData}
              />
              <SelectDropdown
                placeholder={'Donor Center'}
                defaultValue={donorCenter}
                selectedValue={donorCenter}
                showLabel
                removeDivider
                onChange={setDonorCenter}
                options={donorCenterData}
              />
              <div className={`form-field`}>
                <DatePicker
                  showLabel={true}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  isClearable={true}
                  selected={dateRange.startDate}
                  selectsRange
                  placeholderText="Date Range"
                />
              </div>
              <TimePickerCust
                value={laterThan}
                label={'Later Than'}
                onChange={setLaterThan}
              />
              <TimePickerCust
                value={earlierThan}
                label={'Earlier Than'}
                onChange={setEarlierThan}
              />
              <div className="form-field w-100 m-0">
                <div className="field">
                  <input
                    type="text"
                    className="form-control"
                    placeholder=""
                    value={radius ? `${radius} miles` : ''}
                    required
                    onChange={handleChange}
                  />
                  {<label>{'Radius'}</label>}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <>
          <TableList
            isLoading={isLoading}
            data={!checkCondition ? donorCreateAppointments : []}
            headers={tableHeaders}
            handleSort={handleSort}
            sortOrder={sortOrder}
          />

          <Pagination
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalRecords={totalRecords}
          />
        </>
      </div>
      <div className="form-footer">
        <button className="btn simple-text" onClick={handleCancel}>
          Cancel
        </button>

        <button
          type="button"
          disabled={isLoading}
          className={` ${`btn btn-md btn-primary`}`}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
};
export default DialingCenterFilter;

const TimePickerCust = ({ label, value, onChange }) => {
  return (
    <div className="form-field d-flex w-100">
      <div
        className={`field schedule-filter-donor custom-class w-100 position-relative`}
      >
        <TimePicker
          disabled={false}
          value={value}
          className="w-100"
          onChange={onChange}
          showSecond={false}
          allowEmpty
          use12Hours
          placeholder={label}
          clearIcon={<FontAwesomeIcon icon={faTimes} role="button" />}
          inputIcon={<SvgComponent name={'TimeClock'} />}
        />
        {value && (
          <label className={`text-secondary ml-1 mt-1 pb-2 mb-2`}>
            {label}
          </label>
        )}
      </div>
    </div>
  );
};
