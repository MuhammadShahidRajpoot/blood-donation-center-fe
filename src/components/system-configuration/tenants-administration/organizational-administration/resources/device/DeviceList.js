import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../../../../../common/pagination/index';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import ResourceNavigationTabs from '../navigationTabs';
import { truncate } from 'lodash';
import styles from './device.module.scss';
import moment from 'moment';
import SuccessPopUpModal from '../../../../../common/successModal';
import PopUpModal from '../../../../../common/PopUpModal';
import jwt from 'jwt-decode';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';

const DevicesList = () => {
  const bearerToken = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [devices, setDevices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [deviceType, setDeviceType] = useState(null);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [UnSchedulePopUp, setUnSchedulePopUp] = useState(false);
  const [id, setId] = useState('');

  const [totalRecords, setTotalRecords] = useState(0);
  const [deviceTypeData, setDeviceTypeData] = useState([]);
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deviceId, setDeviceId] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [UnScheduleRetirementSuccess, setUnScheduleRetirementSuccess] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [columnList, setColumnList] = useState([
    'short_name',
    'collection_operation',
  ]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);
  const navigate = useNavigate();

  const BreadcrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: 'Devices',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/organization-admin/resources/devices',
    },
  ];

  const getData = async () => {
    setIsLoading(true);
    let collectionOperationValues = '';
    if (collectionOperation?.length > 0)
      collectionOperationValues = collectionOperation
        ?.map((op) => op?.id)
        .join(',');
    const result = await fetch(
      `${BASE_URL}/devices?limit=${limit}&page=${currentPage}&name=${searchText}&status=${
        isActive?.value ?? ''
      }&device_type=${
        deviceType?.value || ''
      }&collection_operation=${collectionOperationValues}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    const data = await result.json();
    setDevices(data?.data);
    setTotalRecords(data?.count);
    setIsLoading(false);
  };

  const fetchDeviceTypes = async () => {
    const result = await fetch(
      `${BASE_URL}/system-configuration/device-type?fetchAll=true&status=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setDeviceTypeData(data);
    } else {
      toast.error('Error Fetching Devices', { autoClose: 3000 });
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
    fetchDeviceTypes();
    getCollectionOperations();
  }, []);
  useEffect(() => {
    getData();
    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    limit,
    BASE_URL,
    isActive,
    deviceType,
    collectionOperation,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (searchText.length > 1 || searchText.length === 0) {
      getData();
    }
  }, [searchText]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/organization-admin/resources/devices/create'
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

  const handleDeviceType = (value) => {
    setCurrentPage(1);
    setDeviceType(value);
  };

  const handleIsActive = (value) => {
    setCurrentPage(1);
    setIsActive(value);
  };
  const sortedDevices = devices;

  function isDateExpired(date) {
    if (!date) {
      return false; // Return false if the date is not provided
    }

    const currentDate = new Date();
    const expireDate = new Date(date);
    expireDate.setHours(0, 0, 0, 0);
    expireDate.setDate(expireDate.getDate() + 1);

    return expireDate < currentDate;
  }

  const archiveDevice = async () => {
    try {
      const bearerToken = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/devices/${deviceId}`, {
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
          setArchiveSuccess(true);
        }, 600);
        await getData();
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
        `${BASE_URL}/devices/${deviceId}/unschedule/retirement`,
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
        await getData();
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

  const handleCollectionOperation = (data) => {
    setCurrentPage(1);
    setCollectionOperation((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
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
      name: 'device_type',
      label: 'Device Type',
      defaultHidden: true,
    },
    {
      name: 'retires_on',
      label: 'Retires On',
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
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Devices'}
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
              <SelectDropdown
                placeholder={'Device Type'}
                defaultValue={deviceType}
                selectedValue={deviceType}
                removeDivider
                showLabel
                onChange={handleDeviceType}
                options={deviceTypeData?.map((item) => {
                  return {
                    value: item.id,
                    label: item.name,
                  };
                })}
              />
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
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.RESOURCES.DEVICES.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Device
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
                  >
                    Short Name
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
                  >
                    Device Type
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('device_type', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Retires On
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('retires_on')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
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
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                    // width="5%"
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
                ) : sortedDevices?.length ? (
                  sortedDevices?.map((item, index) => {
                    return (
                      <tr key={item.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.short_name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncate(item.description, {
                            length: 50,
                          })}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.device_type.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.retire_on ? (
                            <div>
                              {isDateExpired(item?.retire_on) ? (
                                <SvgComponent name={'time_grey'}></SvgComponent>
                              ) : (
                                <SvgComponent name={'time_blue'}></SvgComponent>
                              )}{' '}
                              {moment(item.retire_on).format('MM/DD/YYYY')}
                            </div>
                          ) : null}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[5]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.collection_operation?.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[6]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.status ? (
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
                            <ul className={`dropdown-menu ${styles.drop}`}>
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.DEVICES.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/view`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.DEVICES.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.DEVICES.SHARE_DEVICE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/share`}
                                  >
                                    Share
                                  </Link>
                                </li>
                              )}
                              {item?.retire_on
                                ? CheckPermission([
                                    Permissions.ORGANIZATIONAL_ADMINISTRATION
                                      .RESOURCES.DEVICES.SCHEDULE_RETIREMENT,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        onClick={() => {
                                          setDeviceId(item.id);
                                          setUnSchedulePopUp(true);
                                        }}
                                      >
                                        Unschedule Retirement
                                      </Link>
                                    </li>
                                  )
                                : CheckPermission([
                                    Permissions.ORGANIZATIONAL_ADMINISTRATION
                                      .RESOURCES.DEVICES.SCHEDULE_RETIREMENT,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/schedule-retirement`}
                                      >
                                        Schedule Retirement
                                      </Link>
                                    </li>
                                  )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.DEVICES.SCHEDULE_MAINTENANCE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/schedule-maintenance`}
                                  >
                                    Schedule Maintenance
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .RESOURCES.DEVICES.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setDeviceId(item.id);
                                      setModalPopUp(true);
                                    }}
                                  >
                                    Archive
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                          <ul className="dropdown-menu">
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.READ,
                            ]) && (
                              <li>
                                <Link
                                  className="dropdown-item"
                                  to={`/system-configuration/tenant-admin/organization-admin/resources/devices${item.id}/view`}
                                >
                                  View
                                </Link>
                              </li>
                            )}
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.WRITE,
                            ]) && (
                              <li>
                                <Link
                                  className="dropdown-item"
                                  to={`/system-configuration/tenant-admin/organization-admin/resources/devices/${item.id}/edit`}
                                >
                                  Edit
                                </Link>
                              </li>
                            )}
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.SHARE_DEVICE,
                            ]) && (
                              <li>
                                <Link className="dropdown-item">Share</Link>
                              </li>
                            )}
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.SCHEDULE_RETIREMENT,
                            ]) && (
                              <li>
                                <Link className="dropdown-item">
                                  Schedule Retirement
                                </Link>
                              </li>
                            )}
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.SCHEDULE_MAINTENANCE,
                            ]) && (
                              <li>
                                <Link className="dropdown-item">
                                  Schedule Maintenance
                                </Link>
                              </li>
                            )}
                            {CheckPermission([
                              Permissions.ORGANIZATIONAL_ADMINISTRATION
                                .RESOURCES.DEVICES.ARCHIVE,
                            ]) && (
                              <li>
                                <Link
                                  className="dropdown-item"
                                  onClick={() => {
                                    setDeviceId(item.id);
                                    setModalPopUp(true);
                                  }}
                                >
                                  Archive
                                </Link>
                              </li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
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
          title="Confirmation"
          message={'Are you sure you want to archive?'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={false}
          isArchived={true}
          archived={archiveDevice}
        />
        <PopUpModal
          title="Confirmation"
          message={
            'This action will unschedule retirement for this device. It will be returned to the operations it was scheduled on. Would you like to continue?'
          }
          modalPopUp={UnSchedulePopUp}
          setModalPopUp={setUnSchedulePopUp}
          showActionBtns={true}
          confirmAction={unScheduleRetirement}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Device Retirement unscheduled."
          modalPopUp={UnScheduleRetirementSuccess}
          isNavigate={true}
          setModalPopUp={setUnScheduleRetirementSuccess}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/organization-admin/resources/devices'
          }
        />
        <SuccessPopUpModal
          title="Success!"
          message="Device is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/organization-admin/resources/devices'
          }
        />
      </div>
    </div>
  );
};

export default DevicesList;
