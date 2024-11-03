import React, { useEffect, useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from 'react-bootstrap/Spinner';
import { debounce } from 'lodash';
import jwt from 'jwt-decode';
import { toast } from 'react-toastify';
import SvgComponent from '../../../../../common/SvgComponent';
import TopBar from '../../../../../common/topbar/index';
import Pagination from '../../../../../common/pagination';
import ResourceNavigationTabs from '../navigationTabs';
import { FACILITIES_PATH } from '../../../../../../routes/path';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import ConfirmArchiveIcon from '../../../../../../assets/images/ConfirmArchiveIcon.png';
import SuccessPopUpModal from '../../../../../common/successModal';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils';

const FacilitiesList = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [Facilities, setFacilities] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [status, setStatus] = useState({ label: 'Active', value: 'true' });
  const [collection_operation, setCollection_operation] = useState([]);
  const [archivePopup, setArchivePopup] = useState(false);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [facilitityId, setFacilitityId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [toggleZindex, setToggleZindex] = useState(-1);
  const [columnList, setColumnList] = useState([
    'collection_operation',
    'staging_site',
    'donor_center',
  ]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  const [userId, setUserId] = useState(null);

  const fetchCollectionOperations = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/business_units/collection_operations/list?isFilter=true`
      );
      let data;
      if (result) {
        data = await result.json();
      }
      if (data?.response === 'success') {
        data = data?.data;
        data = data.filter(
          (item) => item?.organizational_level_id.is_collection_operation
        );
        setCollectionOperationData(data);
      } else {
        toast.error('Error Fetching Collection Operations', {
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchCollectionOperations();
  }, []);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setUserId(decodeToken?.id);
      }
    }
  }, [userId]);

  const debounceFetch = debounce((value) => {
    filterFacility(value);
  });

  const searchFieldChange = (e) => {
    setCurrentPage(1);
    setSearchText(e.target.value);
  };
  useEffect(() => {
    debounceFetch(searchText);
  }, [
    searchText,
    limit,
    currentPage,
    sortBy,
    sortOrder,
    collection_operation,
    status,
  ]);

  const handleArcheive = async () => {
    try {
      const bearerToken = localStorage.getItem('token');
      const _URL = `${BASE_URL}/system-configuration/facilities/archive/${facilitityId}`;
      const response = await fetch(_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const result = await response.json();
      if (result?.status === 'success') {
        filterFacility('');
        setArchivePopup(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
      } else if (response?.status === 400) {
        toast.error(`${result?.message?.[0] ?? result?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${result?.message?.[0] ?? result?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleAddClick = () => {
    navigate(FACILITIES_PATH.CREATE);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  const sortedFacilities = Facilities;

  const filterFacility = async (searchvalue, signal = null) => {
    setIsLoading(true);
    let collectionOperationValues = '';
    if (collection_operation?.length > 0)
      collectionOperationValues = collection_operation
        ?.map((op) => op?.id)
        .join(',');
    const bearerToken = localStorage.getItem('token');
    try {
      let q = '';
      if (status) {
        q += `&status=${status?.value ?? ''}`;
      }
      if (collection_operation) {
        q += `&collection_operation=${collectionOperationValues}`;
      }
      if (searchvalue) {
        q += `&search=${searchvalue}`;
      }
      if (sortBy) {
        q += `&sortName=${sortBy}`;
      }
      if (sortOrder) {
        q += `&sortOrder=${sortOrder}`;
      }
      const result = await fetch(
        `${BASE_URL}/system-configuration/facilities?limit=${limit}&page=${currentPage}${q}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        },
        { signal }
      );
      const data = await result.json();
      setFacilities(data.data);
      setTotalRecords(data.total_records);
    } catch (error) {
      console.error('Error filtering data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionOperation = (data) => {
    setCollection_operation((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    filterFacility('', signal);
    return () => {
      abortController.abort();
    };
  }, [status, collection_operation, currentPage, limit, BASE_URL]);

  const BreadCrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: 'Facilities',
      class: 'active-label',
      link: FACILITIES_PATH.LIST,
    },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'code', label: 'BECS Code', defaultHidden: false },
    {
      name: 'name',
      label: 'Name',
      defaultHidden: true,
    },
    { name: 'city', label: 'City', defaultHidden: true },
    {
      name: 'state',
      label: 'State',
      defaultHidden: true,
    },
    {
      name: 'donor_center',
      label: 'Donor Center',
      defaultHidden: true,
    },
    {
      name: 'staging_site',
      label: 'Staging Site',
      defaultHidden: true,
    },
    {
      name: 'collection_operation',
      label: 'Collection Operation',
      defaultHidden: true,
    },
    {
      name: 'status',
      label: 'Status',
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
        BreadCrumbsData={BreadCrumbsData}
        BreadCrumbsTitle={'Facilities'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <ResourceNavigationTabs />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 w-100`}>
              <GlobalMultiSelect
                label="Collection Operation"
                data={collectionOperationData.map((item) => {
                  return {
                    name: item.name,
                    id: item.id,
                  };
                })}
                selectedOptions={collection_operation}
                onChange={handleCollectionOperation}
                onSelectAll={(data) => setCollection_operation(data)}
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={status}
                selectedValue={status}
                removeDivider
                showLabel
                onChange={(value) => {
                  setCurrentPage(1);
                  setStatus(value);
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
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.RESOURCES.FACILITIES.WRITE,
        ]) && (
          <div className="buttons gap-2">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Facility
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
                    BECS Code
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('code')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Name
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                  >
                    City
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('city')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                  >
                    State
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('state')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                  >
                    {'Donor Center'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('donor_center')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
                    }`}
                  >
                    {'Staging Site'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('staging_site')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                  >
                    {'Collection Operation'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('collection_operation.name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[7]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Status
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('status')}
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
                ) : sortedFacilities != undefined ? (
                  sortedFacilities?.length ? (
                    sortedFacilities?.map((facility, index) => (
                      <Fragment key={facility.id}>
                        <tr>
                          <td
                            className={`${
                              columnList.includes(headers?.[0]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.code}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[1]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {truncateTo50(facility?.name)}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[2]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.address?.city}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[3]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.address?.state}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[4]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.donor_center ? 'True' : 'False'}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[5]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.staging_site ? 'True' : 'False'}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[6]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.collection_operation?.name}
                          </td>
                          <td
                            className={`${
                              columnList.includes(headers?.[7]?.name)
                                ? 'd-none'
                                : ''
                            }`}
                          >
                            {facility?.status ? (
                              <span className="badge active">Active</span>
                            ) : (
                              <span className="badge inactive">InActive</span>
                            )}
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
                              <ul className="dropdown-menu ">
                                {CheckPermission([
                                  Permissions.ORGANIZATIONAL_ADMINISTRATION
                                    .RESOURCES.FACILITIES.READ,
                                ]) && (
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      to={`/system-configuration/resource-management/facilities/view/${facility.id}`}
                                    >
                                      View
                                    </Link>
                                  </li>
                                )}
                                {CheckPermission([
                                  Permissions.ORGANIZATIONAL_ADMINISTRATION
                                    .RESOURCES.FACILITIES.WRITE,
                                ]) && (
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      to={`/system-configuration/resource-management/facilities/${facility.id}`}
                                    >
                                      Edit
                                    </Link>
                                  </li>
                                )}
                                {CheckPermission([
                                  Permissions.ORGANIZATIONAL_ADMINISTRATION
                                    .RESOURCES.FACILITIES.ARCHIVE,
                                ]) && (
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      onClick={() => {
                                        setFacilitityId(facility.id);
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
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        style={{ width: '100vw', height: '100vh' }}
                        className="d-flex justify-content-center align-items-center"
                      >
                        <Spinner
                          animation="border"
                          role="status"
                          variant="primary"
                          size="lg"
                        />
                      </td>
                    </tr>
                  )
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
        <SuccessPopUpModal
          title="Success!"
          message="Facility is archived."
          modalPopUp={archivedStatus}
          isNavigate={true}
          setModalPopUp={setArchivedStatus}
          showActionBtns={true}
          redirectPath={'/system-configuration/resource-management/facilities'}
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
              <p>Are you sure want to archive?</p>
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
                  className="btn btn-primary"
                  onClick={() => handleArcheive()}
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

export default FacilitiesList;
