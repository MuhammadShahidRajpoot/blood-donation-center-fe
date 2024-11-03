import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../../common/successModal';
import {
  BUSINESS_UNIT_PATH,
  SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../../routes/path';
import SelectDropdown from '../../../../../common/selectDropdown';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
// import { sortByLabel } from '../../../../../../helpers/utils';

const ListOrganizationalLevels = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocation = location.pathname;
  const [organizationalLevels, setOrganizationalLevels] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [parentLevels, setParentLevels] = useState([]);
  const [selectedParentLevel, setSelectedParentLevel] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({
    label: 'Active',
    value: 'true',
  });
  const [modalPopUp, setModalPopUp] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [levelToArchive, setLevelToArchive] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const bearerToken = localStorage.getItem('token');

  const handleOpenConfirmation = async (id) => {
    try {
      let url = `${BASE_URL}/organizational_levels?parent_level_id=${id}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const olData = response.data;
      url = `${BASE_URL}/business_units?organizational_level_id=${id}`;
      const result = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const buData = result.data;
      if (!olData?.data?.length && !buData?.data?.length) {
        setLevelToArchive(id);
        setModalPopUp(true);
      } else {
        toast.error(
          'Impossible to archive this organization level because it is referenced. Please remove all its references.',
          {
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      toast.error('Failed to archive organizational level.', {
        autoClose: 3000,
      });
    }
  };

  const handleConfirmArchive = async () => {
    if (levelToArchive) {
      const body = {
        is_archived: true,
      };
      const response = await axios.patch(
        `${BASE_URL}/organizational_levels/archive/${levelToArchive}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const data = response.data;
      if (data?.status === 'success') {
        setModalPopUp(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
        organizationalLevels?.length === 1 && currentPage > 1
          ? setCurrentPage(currentPage - 1)
          : fetchOrganizationalLevels();
        fetchParentLevels();
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    }
    setModalPopUp(false);
  };

  useEffect(() => {
    fetchOrganizationalLevels();
    if (parentLevels?.length === 0) {
      fetchParentLevels();
    }
  }, [
    currentPage,
    limit,
    searchText,
    selectedParentLevel,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const fetchOrganizationalLevels = async () => {
    try {
      setIsLoading(true);
      let url = `${BASE_URL}/organizational_levels?limit=${limit}&page=${currentPage}`;

      if (searchText) {
        url += `&keyword=${searchText}`;
      }

      if (selectedParentLevel) {
        url += `&parent_level_id=${selectedParentLevel?.value}`;
      }

      if (selectedStatus !== '') {
        url += `&status=${selectedStatus?.value ?? ''}`;
      }

      if (sortBy !== '') {
        url += `&sortBy=${sortBy}`;
      }
      if (sortOrder !== '') {
        url += `&sortOrder=${sortOrder}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });

      const data = response.data;
      const levels = data?.data.map((data) => {
        return {
          ...data,
          parent_level_name: data.parent_level?.name,
          status: data.is_active ? 'Active' : 'Inactive',
        };
      });
      setOrganizationalLevels(levels);
      setTotalRecords(data?.total_records);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to fetch organizational levels.', {
        autoClose: 3000,
      });
    }
  };

  const fetchParentLevels = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/organizational_levels`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const data = await response.data;
      const filteredParentLevels = (data?.data || [])
        .map((item) => item?.parent_level)
        .filter(
          (parentLevel) => parentLevel !== null && parentLevel !== undefined
        );
      setParentLevels(filteredParentLevels);
    } catch (error) {
      toast.error('Failed to fetch parent levels.', { autoClose: 3000 });
    }
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

  const sortedOrganizationalLevels = organizationalLevels;

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const BreadcrumbsData = [
    {
      label: 'System Configurations',
      class: 'disable-label',
      link: SYSTEM_CONFIGURATION_PATH,
    },
    {
      label: 'Organizational Administration',
      class: 'disable-label',
      link: SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
    },
    {
      label: 'Hierarchy',
      class: 'disable-label',
      link: '/system-configuration/organizational-levels',
    },
    {
      label: 'Organizational Levels',
      class: 'active-label',
      link: '/system-configuration/organizational-levels',
    },
  ];

  const [filterOpen, setFilterOpen] = useState(false);

  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'name', label: 'Name', defaultHidden: false },
    {
      name: 'description',
      label: 'Description',
      defaultHidden: true,
    },
    { name: 'short_label', label: 'Short Label', defaultHidden: true },
    {
      name: 'parent_level_name',
      label: 'Parent Level',
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
        BreadCrumbsTitle={'Organizational Levels'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="tabs">
          <ul>
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY
                .ORGANIZATIONAL_LEVELS.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={'/system-configuration/organizational-levels'}
                  className={
                    currentLocation ===
                    '/system-configuration/organizational-levels'
                      ? 'active'
                      : ''
                  }
                >
                  Organizational Levels
                </Link>
              </li>
            )}
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY.BUSINESS_UNITS
                .MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={BUSINESS_UNIT_PATH.LIST}
                  className={
                    currentLocation === BUSINESS_UNIT_PATH.LIST ? 'active' : ''
                  }
                >
                  Business Units
                </Link>
              </li>
            )}
          </ul>
        </div>
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
                placeholder={'Parent Level'}
                defaultValue={selectedParentLevel}
                selectedValue={selectedParentLevel}
                removeDivider
                showLabel
                onChange={(val) => {
                  setCurrentPage(1);
                  setSelectedParentLevel(val ?? null);
                }}
                options={parentLevels.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={selectedStatus}
                selectedValue={selectedStatus}
                removeDivider
                showLabel
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedStatus(value);
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
        <div className="buttons">
          {CheckPermission([
            Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY
              .ORGANIZATIONAL_LEVELS.WRITE,
          ]) && (
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate('/system-configuration/organizational-levels/create');
              }}
            >
              Create Organizational Level
            </button>
          )}
        </div>
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
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Name</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('name')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                    // width="25%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Description</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('description')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Short Label</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('short_label')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Parent Level</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('parent_level_name')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Status</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('status')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
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
                        <div className="account-list-header dropdown-center">
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
                              align={'center'}
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
                ) : sortedOrganizationalLevels?.length ? (
                  sortedOrganizationalLevels?.map((level, index) => {
                    return (
                      <tr key={level.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.description?.length > 50
                            ? `${level.description.substring(0, 50)}...`
                            : level.description}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.short_label}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.parent_level_name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.is_active ? (
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
                                  .HIERARCHY.ORGANIZATIONAL_LEVELS.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/organizational-levels/${level.id}`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .HIERARCHY.ORGANIZATIONAL_LEVELS.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/organizational-levels/${level.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {level?.is_collection_operation === false &&
                                CheckPermission([
                                  Permissions.ORGANIZATIONAL_ADMINISTRATION
                                    .HIERARCHY.ORGANIZATIONAL_LEVELS.ARCHIVE,
                                ]) && (
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      to={`#`}
                                      onClick={() =>
                                        handleOpenConfirmation(level.id)
                                      }
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
          archived={handleConfirmArchive}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Organizational Level is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
        />
      </div>
    </div>
  );
};

export default ListOrganizationalLevels;
