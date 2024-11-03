import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import GoalsNavigationTabs from '../navigationTabs';
import { DAILY_GOALS_ALLOCATION_PATH } from '../../../../../../routes/path';
import SvgComponent from '../../../../../common/SvgComponent';
import ConfirmArchiveIcon from '../../../../../../assets/images/ConfirmArchiveIcon.png';
import Pagination from '../../../../../common/pagination/index';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { makeAuthorizedApiRequestAxios } from '../../../../../../helpers/Api';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import styles from './index.module.scss';
import SelectDropdown from '../../../../../common/selectDropdown';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { GoalsBreadCrumbsData } from '../GoalsBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils';

const ListDailyGoalsAllocation = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [dailyGoalsAllocation, setDailyGoalsAllocation] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [archivePopup, setArchivePopup] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [collectionOperations, setCollectionOperations] = useState([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [procedureType, setProcedureType] = useState(null);
  const [procedureTypeData, setProcedureTypeData] = useState();
  const [sortBy, setSortBy] = useState('effective_date');
  const [childSortBy, setChildSortBy] = useState('');
  const [userTimezone, setUserTimezone] = useState(''); // State to hold the user's timezone
  const [sortOrder, setSortOrder] = useState('DESC');
  const [goalId, setGoalId] = useState(null);
  const [archiveDisabled, setArchiveDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bearerToken = localStorage.getItem('token');
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const navigate = useNavigate();

  const BreadcrumbsData = [
    ...GoalsBreadCrumbsData,
    {
      label: 'Daily Goals Allocation',
      class: 'active-label',
      link: `${DAILY_GOALS_ALLOCATION_PATH.LIST}`,
    },
  ];

  const handleCollectionOperationChange = (collectionOperation) => {
    setCollectionOperations((prevSelected) =>
      prevSelected.some((item) => item.id === collectionOperation.id)
        ? prevSelected.filter((item) => item.id !== collectionOperation.id)
        : [...prevSelected, collectionOperation]
    );
  };
  const handleCollectionOperationChangeAll = (data) => {
    setCollectionOperations(data);
  };
  const fetchCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`
    );
    let { data } = result.data;
    if (result.ok || result.status === 200) {
      setCollectionOperationData(data);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  const getData = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    collectionOperations.forEach((item) => {
      params.append('collection_operation', parseInt(item.id));
    });
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/daily-goals-allocation?${
        params.size > 0 ? params.toString() : 'collection_operation='
      }&limit=${limit}&page=${currentPage}&procedure_type=${
        procedureType?.value || ''
      }&selected_date=${
        effectiveDate ?? ''
      }&sortBy=${sortBy}&sortOrder=${sortOrder}&childSortBy=${childSortBy}`
    );
    const data = result.data;
    setDailyGoalsAllocation(data?.data);
    setTotalRecords(data?.count);
    setIsLoading(false);
  };

  const fetchProcedureData = async () => {
    try {
      const response = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/procedure_types?fetchAll=true&status=true`
      );
      const data = response.data;
      setProcedureTypeData([
        ...(data?.data
          .filter((item) => item.is_goal_type == true)
          .map((item) => {
            return { value: item.id, label: item.name };
          }) || []),
      ]);
    } catch (error) {
      console.error('Error procedures : ', error);
    }
  };

  useEffect(() => {
    fetchCollectionOperations();
    fetchProcedureData();
  }, []);

  useEffect(() => {
    getData();
  }, [currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
    getData();
  }, [
    limit,
    effectiveDate,
    procedureType,
    collectionOperations,
    sortBy,
    sortOrder,
    childSortBy,
  ]);

  const handleSort = (column, child) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortOrder('ASC');
      } else {
        setSortOrder('ASC');
        setSortBy('');
        setChildSortBy(null);
      }
    } else {
      setSortBy(column);
      child ? setChildSortBy(child) : setChildSortBy(null);
      setSortOrder('ASC');
    }
  };

  const archive = async () => {
    if (archiveDisabled) return;
    setArchiveDisabled(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/daily-goals-allocation/archive/${goalId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let { data, status, response } = res.data;
      if (status === 'success') {
        setArchivePopup(false);
        getData();
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
      setArchiveDisabled(false);
    } catch (error) {
      setArchiveDisabled(false);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    const getTimezone = async () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimezone(timezone);
      } catch (error) {
        console.error('Error getting timezone : ', error);
      }
    };

    getTimezone();
  }, []);

  const handleProcedureType = (item) => {
    setProcedureType(item);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'effective_date', label: 'Effective Date', defaultHidden: false },
    {
      name: 'collection_operation',
      label: 'Collection Operation',
      defaultHidden: false,
    },
    { name: 'procedure_type', label: 'Procedure Type', defaultHidden: false },
    {
      name: 'sunday',
      label: 'Sunday',
      defaultHidden: true,
    },
    {
      name: 'monday',
      label: 'Monday',
      defaultHidden: true,
    },
    { name: 'tuesday', label: 'Tuesday', defaultHidden: true },
    { name: 'wednesday', label: 'Wednesday', defaultHidden: true },
    { name: 'thursday', label: 'Thursday', defaultHidden: true },
    { name: 'friday', label: 'Friday', defaultHidden: true },
    { name: 'saturday', label: 'Saturday', defaultHidden: true },
  ];
  const handleColumnCheckbox = (e, label) => {
    let defaultHidden = columnList;
    if (e.target.checked) {
      defaultHidden = defaultHidden.filter((h) => h !== label);
    } else {
      defaultHidden = [...defaultHidden, label];
    }
    setColumnList(defaultHidden);
  };
  const setDropdown = () => {
    setShowColumnToggle(!showColumnToggle);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Daily Goals Allocation'}
      />
      <div className="filterBar">
        <GoalsNavigationTabs />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form
              className={`d-flex align-items-center gap-3 ${styles.dropdownWidthMenu}`}
            >
              <GlobalMultiSelect
                label="Collection Operation"
                data={collectionOperationData}
                selectedOptions={collectionOperations}
                onChange={handleCollectionOperationChange}
                onSelectAll={handleCollectionOperationChangeAll}
              />
              <SelectDropdown
                styles={{ root: 'w-100' }}
                placeholder={'Procedure Type'}
                defaultValue={procedureType}
                selectedValue={procedureType}
                showLabel
                onChange={handleProcedureType}
                options={procedureTypeData}
                removeDivider
              />
              <div className="form-field w-100">
                <div className={`field position-relative`}>
                  <DatePicker
                    dateFormat="MM/dd/yyyy"
                    className="custom-datepicker effectiveDate"
                    placeholderText="Select Date"
                    selected={effectiveDate}
                    onChange={(date) => {
                      setEffectiveDate(date);
                    }}
                  />
                  {effectiveDate && (
                    <label
                      className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                    >
                      Select Date
                    </label>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS.DAILY_GOALS_ALLOCATION
            .WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate(DAILY_GOALS_ALLOCATION_PATH.CREATE);
              }}
            >
              Create Allocation
            </button>
          </div>
        )}

        <div className="table-listing-main">
          <div className="table-responsive">
            <table className="table table-striped hasOptions">
              <thead>
                <tr>
                  <th
                    className={`${
                      columnList.includes(headers?.[0]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Effective Month
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('effective_date')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Collection Operation
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('collection_operation', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Procedure Type
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('procedure_type', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Sun
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('sunday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Mon
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('monday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Tues
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('tuesday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Wed
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('wednesday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[7]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Thur
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('thursday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[8]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Fri
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('friday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[9]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Sat
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('saturday')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th width="150px" align="center" style={{ zIndex: 11 }}>
                    {showActionsLabel ? (
                      <div className="inliner justify-content-center">
                        <span className="title">Actions</span>
                      </div>
                    ) : null}
                    {enableColumnHide ? (
                      <div className="flex align-items-center justify-content-center">
                        <div className="account-list-header dropdown-center ">
                          <Dropdown
                            show={showColumnToggle}
                            onToggle={setDropdown}
                          >
                            <Dropdown.Toggle
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 'unset',
                                margin: 'unset',
                              }}
                              onClick={setDropdown}
                            >
                              {showColumnToggle ? (
                                <img
                                  src={CheckBoxFilterOpen}
                                  style={{ width: '18px', height: '16px' }}
                                />
                              ) : (
                                <img
                                  src={CheckBoxFilterClosed}
                                  style={{ width: '18px', height: '16px' }}
                                />
                              )}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              style={{ width: '140px' }}
                              align={'end'}
                            >
                              {headers.map((option, index) => (
                                <li key={index}>
                                  <div className="flex align-items-center gap-2 checkboxInput">
                                    <input
                                      type="checkbox"
                                      value={option.name}
                                      checked={
                                        !columnList.includes(option.name)
                                      }
                                      style={{
                                        height: '20px',
                                        width: '20px',
                                        borderRadius: '4px',
                                      }}
                                      id={'columnHideHeader' + index}
                                      onChange={(e) =>
                                        handleColumnCheckbox(e, option.name)
                                      }
                                    />
                                    <label htmlFor={'columnHideHeader' + index}>
                                      {option.label}
                                    </label>
                                  </div>
                                </li>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    ) : null}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="12" className="text-center">
                      Data Loading
                    </td>
                  </tr>
                ) : dailyGoalsAllocation?.length ? (
                  dailyGoalsAllocation?.map((item, index) => {
                    return (
                      <tr key={item.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {format(
                            new Date(
                              new Date(item.effective_date).getTime() +
                                Math.abs(
                                  new Date(
                                    item.effective_date
                                  ).getTimezoneOffset() * 60000
                                )
                            ),
                            'MM-yyyy',
                            {
                              locale: enUS,
                              timeZone: userTimezone,
                            }
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(
                            item.collection_operation
                              ?.map((item) => item.name)
                              .join(',') || ''
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(item.procedure_type.name || '')}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.sunday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.monday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[5]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.tuesday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[6]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.wednesday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[7]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.thursday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[8]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.friday}%
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[9]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.saturday}%
                        </td>
                        <td
                          className="options"
                          style={{ zIndex: toggleZindex === index ? 10 : 1 }}
                        >
                          <div className="dropdown-center">
                            <div
                              className="optionsIcon"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              onClick={() => {
                                setToggleZindex(index);
                              }}
                            >
                              <SvgComponent name={'ThreeDots'} />
                            </div>
                            <ul className="dropdown-menu">
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .DAILY_GOALS_ALLOCATION.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={DAILY_GOALS_ALLOCATION_PATH.VIEW.replace(
                                      ':id',
                                      item.id
                                    )}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .DAILY_GOALS_ALLOCATION.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={DAILY_GOALS_ALLOCATION_PATH.EDIT.replace(
                                      ':id',
                                      item.id
                                    )}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .DAILY_GOALS_ALLOCATION.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setGoalId(item.id);
                                      setArchivePopup(true);
                                    }}
                                  >
                                    Archive
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        <section
          className={`popup full-section ${archivePopup ? 'active' : ''}`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={ConfirmArchiveIcon} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Confirmation</h3>
              <p>Are you sure you want to archive?</p>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setArchivePopup(false);
                  }}
                >
                  No
                </button>
                <button
                  disabled={archiveDisabled}
                  className="btn btn-primary"
                  onClick={() => archive()}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ListDailyGoalsAllocation;
