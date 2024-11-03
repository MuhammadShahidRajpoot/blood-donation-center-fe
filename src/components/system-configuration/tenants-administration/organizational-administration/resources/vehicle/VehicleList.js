import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination/index';
import { toast } from 'react-toastify';
import ArchivePopUpModal from '../../../../../common/successModal';
import { groupBy } from 'lodash';
import ResourceNavigationTabs from '../navigationTabs';
import CalendarCheck from '../../../../../../assets/calendar-check.svg';
import CalendarCheckAlt from '../../../../../../assets/calendar-check-alt.svg';
import moment from 'moment';
import SuccessPopUpModal from '../../../../../common/successModal';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import PopUpModal from '../../../../../common/PopUpModal';
import jwt from 'jwt-decode';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils';

const VehicleList = () => {
  const bearerToken = localStorage.getItem('token');
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [vehicleId, setVehicleId] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleCertifications, setVehicleCertifications] = useState({});
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [vehicleType, setVehicleType] = useState(null);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [UnSchedulePopUp, setUnSchedulePopUp] = useState(false);
  const [id, setId] = useState('');
  const [toggleZindex, setToggleZindex] = useState(-1);
  const [UnScheduleRetirementSuccess, setUnScheduleRetirementSuccess] =
    useState(false);
  const [columnList, setColumnList] = useState([
    'collection_vehicle',
    'collection_operation_id',
    'is_active',
    'certifications',
  ]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const BreadcrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: 'Vehicles',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/organization-admin/resources/vehicles',
    },
  ];

  const getVehiclesData = async () => {
    try {
      setIsLoading(true);
      let collectionOperationValues = '';
      if (collectionOperation?.length > 0)
        collectionOperationValues = collectionOperation
          ?.map((op) => op?.id)
          .join(',');
      const result = await fetch(
        `${BASE_URL}/vehicles?limit=${limit}&page=${currentPage}&name=${searchText}&status=${
          isActive?.value ?? ''
        }&vehicle_type=${
          vehicleType?.value || ''
        }&collection_operation=${collectionOperationValues}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();

      setVehicles(data?.data?.vehicles);
      setTotalRecords(data?.count);
      setVehicleCertifications(
        groupBy(
          data?.data?.certifications,
          (certification) => certification.vehicle_id
        )
      );
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getVehicleTypesData = async () => {
    const result = await fetch(`${BASE_URL}/vehicle-types?fetchAll=true`, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    const data = await result.json();
    setVehicleTypes(data?.data);
  };

  const getCollectionOperations = async () => {
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

    if (result.ok || result.status === 200) {
      setCollectionOperationData(data?.data);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setId(decodeToken?.id);
      }
    }
  }, []);
  useEffect(() => {
    getVehiclesData();
    if (searchText?.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    limit,
    searchText,
    BASE_URL,
    isActive,
    vehicleType,
    collectionOperation,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    getVehicleTypesData();
    getCollectionOperations();
  }, []);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/organization-admin/resources/vehicles/create'
    );
  };

  const handleSort = (column, child) => {
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

  const handleCollectionOperation = (data) => {
    setCurrentPage(1);
    setCollectionOperation((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  const handleVehicleType = (value) => {
    setCurrentPage(1);
    setVehicleType(value);
  };

  const handleIsActive = (value) => {
    setCurrentPage(1);
    setIsActive(value);
  };

  const sortedVehicles = vehicles;

  const archiveVehicle = async () => {
    try {
      const bearerToken = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/vehicles/${vehicleId}`, {
        method: 'Delete',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      let { data, status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        setModalPopUp(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
        await getVehiclesData();
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
    }
  };

  const unScheduleRetirement = async () => {
    try {
      const body = {
        created_by: +id,
      };
      const res = await fetch(
        `${BASE_URL}/vehicles/${vehicleId}/unschedule/retirement`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(body),
        }
      );
      let { status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        setUnSchedulePopUp((prev) => !prev);
        setUnScheduleRetirementSuccess(true);
        await getVehiclesData();
      } else if (response?.status === 400) {
        toast.error('Failed to unschedule retirement.', { autoClose: 3000 });
        // Handle bad request
      } else {
        toast.error('Failed to unschedule retirement.', { autoClose: 3000 });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'name', label: 'Name', defaultHidden: false },
    {
      name: 'short_name',
      label: 'Short Name',
      defaultHidden: true,
    },
    { name: 'description', label: 'Description', defaultHidden: true },
    {
      name: 'vehicle_type_id',
      label: 'Vehicle Type',
      defaultHidden: true,
    },
    {
      name: 'collection_vehicle',
      label: 'Collection Vehicle',
      defaultHidden: true,
    },
    {
      name: 'certifications',
      label: 'Certifications',
      defaultHidden: true,
    },
    {
      name: 'retire_on',
      label: 'Retire On',
      defaultHidden: true,
    },
    {
      name: 'collection_operation_id',
      label: 'Collection Operation',
      defaultHidden: true,
    },
    {
      name: 'is_active',
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
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Vehicles'}
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
              <div className="dropdown">
                <SelectDropdown
                  placeholder={'Vehicle Type'}
                  defaultValue={vehicleType}
                  selectedValue={vehicleType}
                  removeDivider
                  showLabel
                  onChange={handleVehicleType}
                  options={vehicleTypes.map((item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                />
              </div>
              <div className="dropdown">
                <GlobalMultiSelect
                  label="Collection Operation"
                  data={collectionOperationData.map((item) => {
                    return {
                      name: item.name,
                      id: item.id,
                    };
                  })}
                  selectedOptions={collectionOperation}
                  onChange={handleCollectionOperation}
                  onSelectAll={(data) => setCollectionOperation(data)}
                />
                {/* <SelectDropdown
                  styles={{ root: 'me-3' }}
                  placeholder={'Collection Operation'}
                  defaultValue={collectionOperation}
                  selectedValue={collectionOperation}
                  removeDivider
                  showLabel
                  onChange={handleCollectionOperation}
                  options={collectionOperationData.map((item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                /> */}
              </div>
              <div className="dropdown">
                <SelectDropdown
                  placeholder={'Status'}
                  defaultValue={isActive}
                  selectedValue={isActive}
                  removeDivider
                  showLabel
                  onChange={handleIsActive}
                  options={[
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                  ]}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.RESOURCES.VEHICLES.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Vehicle
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
                    // width="10%"
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
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                    // width="10%"
                  >
                    {'Short Name'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('short_name')}
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
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                    // width="12%"
                  >
                    {'Vehicle Type'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('vehicle_type_id', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                    // width="12%"
                  >
                    {'Collection Vehicle'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('collection_vehicle')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
                    }`}
                    // width="12%"
                  >
                    Certifications
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('certifications')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                    // width="10%"
                  >
                    {'Retire On'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('retire_on')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[7]?.name) ? 'd-none' : ''
                    }`}
                    // width="10%"
                  >
                    {'Collection Operation'.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />} {word}
                      </React.Fragment>
                    ))}
                    <div
                      className="sort-icon"
                      onClick={() =>
                        handleSort('collection_operation_id', 'name')
                      }
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[8]?.name) ? 'd-none' : ''
                    }`}
                    // width="5%"
                  >
                    Status
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('is_active')}
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
                ) : sortedVehicles?.length ? (
                  sortedVehicles?.map((vehicle, index) => {
                    return (
                      <tr key={vehicle.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.short_name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(vehicle.description)}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.vehicle_type_id.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.vehicle_type_id.collection_vehicle == true
                            ? 'Yes'
                            : 'No'}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[5]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(
                            vehicleCertifications[vehicle.id]
                              ?.map(
                                (certification) =>
                                  `${certification.certification.name}`
                              )
                              .join(', ')
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[6]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.retire_on ? (
                            <div
                              className="d-flex"
                              style={{ whiteSpace: 'nowrap' }}
                            >
                              <img
                                className="me-2"
                                src={
                                  moment(
                                    vehicle.retire_on,
                                    'YYYY-MM-DD'
                                  ).isBefore(moment().startOf('day'))
                                    ? CalendarCheckAlt
                                    : CalendarCheck
                                }
                                alt=""
                              />
                              {moment(vehicle.retire_on).format('MM-DD-YYYY')}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[7]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle?.collection_operation_id?.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[8]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {vehicle.is_active ? (
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

                            <ul className="dropdown-menu">
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.VEHICLES.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${vehicle.id}/view`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.VEHICLES.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${vehicle.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.VEHICLES.SHARE_VEHICLE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${vehicle.id}/share`}
                                  >
                                    Share
                                  </Link>
                                </li>
                              )}
                              {vehicle.retire_on
                                ? CheckPermission([
                                    Permissions.ORGANIZATIONAL_ADMINISTRATION
                                      .RESOURCES.VEHICLES.SCHEDULE_RETIREMENT,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        onClick={() => {
                                          setVehicleId(vehicle.id);
                                          setUnSchedulePopUp(true);
                                        }}
                                      >
                                        Unschedule Retirement
                                      </Link>
                                    </li>
                                  )
                                : CheckPermission([
                                    Permissions.ORGANIZATIONAL_ADMINISTRATION
                                      .RESOURCES.VEHICLES.SCHEDULE_RETIREMENT,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        to={`${vehicle.id}/schedule-retirement`}
                                      >
                                        Schedule Retirement
                                      </Link>
                                    </li>
                                  )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.VEHICLES.SCHEDULE_MAINTENANCE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${vehicle.id}/schedule-maintenance`}
                                  >
                                    Schedule Maintenance
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.VEHICLES.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setVehicleId(vehicle.id);
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
        <PopUpModal
          title="Confirmation"
          message={
            'This action will unschedule retirement for this vehicle. It will be returned to the operations it was scheduled on. Would you like to continue?'
          }
          modalPopUp={UnSchedulePopUp}
          setModalPopUp={setUnSchedulePopUp}
          showActionBtns={true}
          confirmAction={unScheduleRetirement}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Vehicle Retirement unscheduled."
          modalPopUp={UnScheduleRetirementSuccess}
          isNavigate={true}
          setModalPopUp={setUnScheduleRetirementSuccess}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/organization-admin/resources/vehicles'
          }
        />
        <ArchivePopUpModal
          title={'Confirmation'}
          message={'Are you sure you want to archive?'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={false}
          isArchived={modalPopUp}
          archived={archiveVehicle}
          isNavigate={false}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Vehicle is archived."
          modalPopUp={archivedStatus}
          isNavigate={true}
          setModalPopUp={setArchivedStatus}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/organization-admin/resources/vehicles'
          }
        />
      </div>
    </div>
  );
};

export default VehicleList;
