import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination/index';
import { toast } from 'react-toastify';
import ArchivePopUpModal from '../../../../../common/successModal';
import CalendarNavigationTabs from '../navigationTabs';
import moment from 'moment';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import SuccessPopUpModal from '../../../../../common/successModal';
import SelectDropdown from '../../../../../common/selectDropdown';
import { CalendarBreadCrumbsData } from '../CalendarBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils';

const CloseDateList = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeDateId, setCloseDateId] = useState(null);
  const [closeDates, setCloseDates] = useState([]);
  const [closeDatesFilter, setCloseDatesFilter] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortCollectionOperation, setSortCollectionOperation] = useState('ASC');
  const [columnList, setColumnList] = useState(['collection_operation']);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const BreadcrumbsData = [
    ...CalendarBreadCrumbsData,
    {
      label: 'Close Dates',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/operations-admin/calendar/close-dates',
    },
  ];

  const getCloseDatesData = async () => {
    setIsLoading(true);
    let collectionOperationValues = '';
    if (collectionOperation?.length > 0)
      collectionOperationValues = collectionOperation
        ?.map((op) => op?.id)
        .join(',');

    let sortParams = '';
    if (sortBy) {
      sortParams = `&sortBy=${sortBy}&sortOrder=${sortOrder.toUpperCase()}`;
    }
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/close-dates?limit=${limit}&page=${currentPage}&title=${searchText}&collection_operation_sort=${sortCollectionOperation}&collection_operation=${collectionOperationValues}&closed_dates=${
        closeDatesFilter?.value ?? ''
      }` + sortParams
    );
    const data = await result.json();
    const closeDatesData = data?.data;

    for (const closeDateData of closeDatesData) {
      closeDateData.collection_operations = closeDateData?.collectionOperations
        ?.map((bco) => bco?.collection_operation_id?.name)
        .join(', ');
    }
    setCloseDates(closeDatesData);
    setTotalRecords(data?.count);
    setIsLoading(false);
  };

  function compareNames(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  const getCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      const sortedData = data.sort(compareNames);
      let formatCollectionOperations = sortedData?.map((operation) => ({
        name: operation?.name,
        id: operation?.id,
      }));
      setCollectionOperationData([...formatCollectionOperations]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    getCloseDatesData();
    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    limit,
    searchText,
    BASE_URL,
    collectionOperation,
    closeDatesFilter,
    sortBy,
    sortOrder,
    sortCollectionOperation,
  ]);

  useEffect(() => {
    getCollectionOperations();
  }, []);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/operations-admin/calendar/close-dates/create'
    );
  };

  const handleSort = (column) => {
    if (column === 'collection_operation') {
      setSortCollectionOperation((pre) => (pre === 'ASC' ? 'DESC' : 'ASC'));
      return;
    }
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
      } else {
        setSortOrder('asc');
        setSortBy('');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const sortedCloseDates = closeDates;

  const archiveCloseDate = async () => {
    try {
      const res = await makeAuthorizedApiRequest(
        'DELETE',
        `${BASE_URL}/close-dates/${closeDateId}`
      );
      let { data, status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        setModalPopUp(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
        await getCloseDatesData();
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        // Handle bad request
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    } finally {
      setModalPopUp(false);
    }
  };

  const handleCollectionOperationChange = (collectionOperation) => {
    setCollectionOperation((prevSelected) =>
      prevSelected.some((item) => item.id === collectionOperation.id)
        ? prevSelected.filter((item) => item.id !== collectionOperation.id)
        : [...prevSelected, collectionOperation]
    );
  };

  const handleCollectionOperationChangeAll = (data) => {
    setCollectionOperation(data);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'title', label: 'Title', defaultHidden: false },
    { name: 'description', label: 'Description', defaultHidden: true },
    { name: 'start_date', label: 'Start Date', defaultHidden: true },
    {
      name: 'end_date',
      label: 'End Date',
      defaultHidden: true,
    },
    {
      name: 'collection_operation',
      label: 'Collection Operation',
      defaultHidden: true,
    },
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
        BreadCrumbsTitle={'Close Dates'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <CalendarNavigationTabs />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex gap-3 w-100">
              <div className="form-field">
                <SelectDropdown
                  placeholder={'Closed Dates'}
                  defaultValue={closeDatesFilter}
                  selectedValue={closeDatesFilter}
                  onChange={setCloseDatesFilter}
                  removeDivider
                  showLabel
                  options={[
                    { label: 'Current', value: 'current' },
                    { label: 'Past', value: 'past' },
                  ]}
                />
              </div>
              <div className="form-field">
                <GlobalMultiSelect
                  label="Collection Operation"
                  data={collectionOperationData}
                  selectedOptions={collectionOperation}
                  onChange={handleCollectionOperationChange}
                  onSelectAll={handleCollectionOperationChangeAll}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.OPERATIONS_ADMINISTRATION.CALENDAR.CLOSE_DATES.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Close Date
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
                    // width="15%"
                  >
                    Title
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('title')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                    // width="30%"
                  >
                    Description
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('description')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                  >
                    Start Date
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('start_date')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                  >
                    End Date
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('end_date')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                    // width="30%"
                  >
                    Collection Operation
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('collection_operation')}
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
                    <td className="no-data" colSpan="10">
                      Data Loading
                    </td>
                  </tr>
                ) : sortedCloseDates?.length ? (
                  sortedCloseDates?.map((closeDate, index) => {
                    return (
                      <tr key={closeDate.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {closeDate.title}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                          data-toggle="tooltip"
                          data-placement="right"
                          title={closeDate.description}
                        >
                          {truncateTo50(closeDate.description)}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {moment(closeDate.start_date, 'YYYY-MM-DD').format(
                            'MM-DD-YYYY'
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {moment(closeDate.end_date, 'YYYY-MM-DD').format(
                            'MM-DD-YYYY'
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(closeDate.collection_operations)}
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
                                Permissions.OPERATIONS_ADMINISTRATION.CALENDAR
                                  .CLOSE_DATES.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${closeDate.id}/view`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.OPERATIONS_ADMINISTRATION.CALENDAR
                                  .CLOSE_DATES.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${closeDate.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.OPERATIONS_ADMINISTRATION.CALENDAR
                                  .CLOSE_DATES.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setCloseDateId(closeDate.id);
                                      setModalPopUp(true);
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
                    <td className="no-data" colSpan="10">
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

        <ArchivePopUpModal
          title={'Confirmation'}
          message={'Are you sure you want to archive?'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={false}
          isArchived={true}
          archived={archiveCloseDate}
          isNavigate={false}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Close Date is archived."
          modalPopUp={archivedStatus}
          isNavigate={true}
          setModalPopUp={setArchivedStatus}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/operations-admin/calendar/close-dates'
          }
        />
      </div>
    </div>
  );
};

export default CloseDateList;
