import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination';
import { toast } from 'react-toastify';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import {
  BUSINESS_UNIT_PATH,
  SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../../routes/path';
import SuccessPopUpModal from '../../../../../common/successModal';
import SelectDropdown from '../../../../../common/selectDropdown';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';

const ListBusinessUnits = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const currentLocation = location.pathname;
  const [businessUnits, setBusinessUnits] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [parentLevels, setParentLevels] = useState(null);
  const [parentLevelData, setParentLevelData] = useState([]);
  const [organizationalLevels, setOrganizationalLevels] = useState([]);
  const [selectedOrganizationalLevels, setSelectedOrganizationalLevels] =
    useState(null);
  const [status, setStatus] = useState({ label: 'Active', value: 'true' });
  const bearerToken = localStorage.getItem('token');
  const navigate = useNavigate();
  const [archiveSuccessModal, setArchiveSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const fetchBusinessUnits = async () => {
    try {
      setIsLoading(true);
      let url = `${BASE_URL}/business_units?limit=${limit}&page=${currentPage}`;

      if (searchText.length > 1) {
        url += `&keyword=${searchText}`;
      }

      if (parentLevels) {
        url += `&parent_level_id=${parentLevels?.value}`;
      }

      if (selectedOrganizationalLevels) {
        url += `&organizational_level_id=${selectedOrganizationalLevels?.value}`;
      }

      if (status !== '') {
        url += `&status=${status?.value ?? ''}`;
      }
      if (sortBy !== '') {
        url += `&sortBy=${sortBy}`;
      }
      if (sortOrder !== '') {
        url += `&sortOrder=${sortOrder}`;
      }
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      };
      const result = await axios.get(url, { headers });
      const data = await result.data;
      setBusinessUnits(data?.data || []);
      setTotalRecords(data?.total_records);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to fetch Business Units.', { autoClose: 3000 });
    }
  };

  const getBusinessUnits = async () => {
    const response = await axios.get(`${BASE_URL}/business_units`, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });

    const data = response.data;

    const filteredArray = data?.data
      ?.filter(
        (item) =>
          item?.parent_level &&
          item?.parent_level?.is_archived === false &&
          item?.parent_level?.is_active === true
      )
      ?.map((item) => ({
        id: item?.parent_level?.id,
        name: item?.parent_level?.name,
      }))
      ?.reduce((uniqueItems, currentItem) => {
        // Check if the item's id already exists in uniqueItems
        const existingItem = uniqueItems.find(
          (item) => item.id === currentItem.id
        );

        // If the item doesn't exist in uniqueItems, add it
        if (!existingItem) {
          uniqueItems.push(currentItem);
        }

        return uniqueItems;
      }, []);
    setParentLevelData(filteredArray);
  };

  const getOrganizationLevels = async () => {
    try {
      let url = `${BASE_URL}/organizational_levels`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });

      const data = response.data;
      setOrganizationalLevels(data?.data);
    } catch (error) {
      toast.error('Failed to fetch Organizational Levels', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchBusinessUnits();
    getOrganizationLevels();
  }, [
    currentPage,
    limit,
    searchText,
    parentLevels,
    selectedOrganizationalLevels,
    status,
    sortBy,
    sortOrder,
  ]);

  /*   useEffect(() => {
    getBusinessUnits();
  }, []); */

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else {
        setSortOrder('ASC');
      }
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };
  const [levelToArchive, setLevelToArchive] = useState(null);
  const [modalPopUp, setModalPopUp] = useState(false);

  const handleOpenConfirmation = async (id) => {
    try {
      const url = `${BASE_URL}/business_units?parent_level_id=${id}`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });

      const { data } = response.data;
      if (!data.length) {
        setLevelToArchive(id);
        setModalPopUp(true);
      } else {
        toast.error(
          'Impossible to archive this business unit because it is referenced. Please remove all its references.',
          {
            autoClose: 3000,
          }
        );
      }
    } catch (error) {
      toast.error('Failed to archive business unit.', {
        autoClose: 3000,
      });
    }
  };

  const handleConfirmArchive = async () => {
    if (levelToArchive) {
      const body = {
        is_archived: true,
      };
      const response = await axios.put(
        `${BASE_URL}/business_units/archive/${levelToArchive}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const data = response.data;
      setModalPopUp(false);
      if (data?.status === 'success') {
        setArchiveSuccessModal(true);
        getBusinessUnits();
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    }
    fetchBusinessUnits();
  };
  const sortedBusinessUnits = businessUnits;

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
      label: 'Business Units',
      class: 'active-label',
      link: '/system-configuration/hierarchy/business-units',
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
      name: 'parent_level_id',
      label: 'Parent',
      defaultHidden: true,
    },
    {
      name: 'organizational_level_id',
      label: 'Organizational Level',
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
        BreadCrumbsTitle={'Business Units'}
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
                  Business Unit
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
                placeholder={'Organizational Level'}
                defaultValue={selectedOrganizationalLevels}
                selectedValue={selectedOrganizationalLevels}
                removeDivider
                showLabel
                onChange={(val) => {
                  setCurrentPage(1);
                  setSelectedOrganizationalLevels(val ?? null);
                }}
                options={organizationalLevels.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
              <SelectDropdown
                placeholder={'Parent'}
                defaultValue={parentLevels}
                selectedValue={parentLevels}
                removeDivider
                showLabel
                onChange={(val) => {
                  setCurrentPage(1);
                  setParentLevels(val ?? null);
                }}
                options={parentLevelData.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
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
          Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY.BUSINESS_UNITS
            .WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate(BUSINESS_UNIT_PATH.CREATE)}
            >
              Create Business Unit
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
                    // width="15%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Parent</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('parent_level_id')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                    // width="25%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Organizational Level</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('organizational_level_id')}
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
                      <span className="title">Status</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('is_active')}
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
                ) : sortedBusinessUnits?.length ? (
                  sortedBusinessUnits?.map((level, index) => {
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
                          {level.parent_level?.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.organizational_level_id?.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
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
                                  .HIERARCHY.BUSINESS_UNITS.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${BUSINESS_UNIT_PATH.VIEW.replace(
                                      ':id',
                                      level.id
                                    )}`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .HIERARCHY.BUSINESS_UNITS.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`${BUSINESS_UNIT_PATH.EDIT.replace(
                                      ':id',
                                      level.id
                                    )}`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .HIERARCHY.BUSINESS_UNITS.ARCHIVE,
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
          message={'Business unit is archived.'}
          modalPopUp={archiveSuccessModal}
          isNavigate={true}
          setModalPopUp={setArchiveSuccessModal}
          showActionBtns={true}
          redirectPath={'/system-configuration/hierarchy/business-units'}
        />
      </div>
    </div>
  );
};

export default ListBusinessUnits;
