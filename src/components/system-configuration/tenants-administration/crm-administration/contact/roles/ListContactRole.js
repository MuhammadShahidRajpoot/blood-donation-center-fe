import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../../../../../common/pagination';
import SuccessPopUpModal from '../../../../../common/successModal';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import jwt from 'jwt-decode';
import ContactNavigation from '../ContactNavigation';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ContactBreadCrumbsData } from '../ContactBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { FunctionTypeEnum } from '../../../../../common/Enums';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';

const ListContactRole = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [archiveId, setArchiveId] = useState();
  const [id, setId] = useState(null);
  const [contactRoleData, setContactRoleData] = useState([]);
  const [getData, setGetData] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('name');
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [isStatus, setIsStatus] = useState({ label: 'Active', value: 'true' });
  const [isFunction, setIsFunction] = useState(null);
  const bearerToken = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [columnList, setColumnList] = useState([
    'function_id',
    'average_hourly_rate',
    'oef_contribution',
    'impacts_oef',
    'staffable',
  ]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const BreadcrumbsData = [
    ...ContactBreadCrumbsData,
    {
      label: 'Roles',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/crm-admin/contacts/roles/list`,
    },
  ];

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
    const getData = async () => {
      setIsLoading(true);
      const deviceTypeUrl = `${BASE_URL}/contact-roles?limit=${limit}&page=${currentPage}${
        searchText ? `&name=${searchText}` : ``
      }${isStatus ? `&status=${isStatus?.value ?? ''}` : ''}${
        isFunction ? `&function_id=${isFunction?.value ?? ''}` : ''
      }${sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''}`;
      const result = await fetch(`${deviceTypeUrl}`, {
        headers: {
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const data = await result.json();
      setContactRoleData(data?.data);
      setTotalRecords(data?.count);
      setIsLoading(false);
    };

    if (!searchText) {
      getData(limit, currentPage);
    }
    if (isStatus === true || isStatus === false) {
      getData(limit, currentPage);
    }

    if (searchText.length > 1) {
      setCurrentPage(1);
      getData(limit, currentPage);
    }
    return () => {
      setGetData(false);
    };
  }, [
    currentPage,
    limit,
    searchText,
    BASE_URL,
    isStatus,
    getData,
    sortBy,
    sortOrder,
    isFunction,
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleArchive = async () => {
    let archiveData = {
      created_by: id, // device type id
      is_archived: true,
    };
    const response = await fetch(`${BASE_URL}/contact-roles/${archiveId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(archiveData),
    });
    let data = await response.json();
    if (data.status === 'success') {
      setModalPopUp(false);
      setTimeout(() => {
        setArchiveSuccess(true);
      }, 600);
    } else if (data?.status === 'currently_in_use') {
      toast.error(`This role can't be archived it is in use for crm account.`, {
        autoClose: 3000,
      });
    } else {
      toast.error('Something went wrong.');
    }
    setGetData(true);
    setModalPopUp(false);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
    }
  };

  const handleIsActive = (value) => {
    setIsStatus(value);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'name', label: 'Name', defaultHidden: false },
    { name: 'short_name', label: 'Short Name', defaultHidden: true },
    { name: 'description', label: 'Description', defaultHidden: true },
    { name: 'function_id', label: 'Function', defaultHidden: true },
    {
      name: 'average_hourly_rate',
      label: 'Average Hourly Rate',
      defaultHidden: true,
    },
    {
      name: 'oef_contribution',
      label: 'Oef Contribution',
      defaultHidden: true,
    },
    { name: 'impacts_oef', label: 'Impacts Oef', defaultHidden: true },
    { name: 'staffable', label: 'Staffable', defaultHidden: true },
    { name: 'status', label: 'Status', defaultHidden: true },
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

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Roles'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <ContactNavigation />
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex gap-3 w-100">
              <SelectDropdown
                placeholder={'Function'}
                defaultValue={isFunction}
                selectedValue={isFunction}
                removeDivider
                showLabel
                onChange={(value) => setIsFunction(value)}
                options={[
                  { label: 'Donor', value: FunctionTypeEnum.DONOR },
                  { label: 'Staff', value: FunctionTypeEnum.STAFF },
                  { label: 'Volunteer', value: FunctionTypeEnum.VOLUNTEER },
                ]}
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={isStatus}
                selectedValue={isStatus}
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
          Permissions.CRM_ADMINISTRATION.CONTACTS.ROLES.WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  '/system-configuration/tenant-admin/crm-admin/contacts/roles/create'
                )
              }
            >
              Create Role
            </button>
          </div>
        )}
        <div className={`table-listing-main ${styles.mains}`}>
          <div className="table-responsive">
            <table className="table table-striped hasOptions">
              <thead>
                <tr>
                  <th
                    // width="11%"
                    align="center"
                    className={`${
                      columnList.includes(headers?.[0]?.name) ? 'd-none' : ''
                    }`}
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
                      <span className="title">
                        {'Short Name'.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />} {word}
                          </React.Fragment>
                        ))}
                      </span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('oef_contribution')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                    // width="14%"
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
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                    // width="11%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Function</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('function_id')}
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
                      <span className="title">
                        {'Average Hourly Rate'.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />} {word}
                          </React.Fragment>
                        ))}
                      </span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('average_hourly_rate')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">
                        {'OEF Contribution(%)'.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />} {word}
                          </React.Fragment>
                        ))}
                      </span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('oef_contribution')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                    // width="11%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">
                        {'Impacts OEF'.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />} {word}
                          </React.Fragment>
                        ))}
                      </span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('impacts_oef')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[7]?.name) ? 'd-none' : ''
                    }`}
                    // width="11%"
                    align="center"
                  >
                    <div className="inliner">
                      <span className="title">Staffable</span>
                      <div
                        className="sort-icon"
                        onClick={() => handleSort('staffable')}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[8]?.name) ? 'd-none' : ''
                    }`}
                    // width="11%"
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
                  {/* <th className={`${
                      columnList.includes(headers?.[0]?.name) ? 'd-none' : ''
                    // }`} width="7%" align="center"></th> */}
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
                ) : contactRoleData?.length ? (
                  contactRoleData?.map((level, index) => {
                    return (
                      <tr key={index}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level?.name}
                          {level?.is_primary_chairperson && (
                            <div style={{ fontSize: '12px' }}>
                              (System Defined)
                            </div>
                          )}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level?.short_name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          <p className={`${styles.ellipse} mb-0`}>
                            {' '}
                            {level?.description}
                          </p>
                        </td>

                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {(
                            Object?.keys(FunctionTypeEnum)?.find(
                              (key) =>
                                FunctionTypeEnum[key] ===
                                parseInt(level?.function_id)
                            ) || ''
                          )
                            .toLowerCase()
                            .replace(/^(.)/, (match) => match.toUpperCase())}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {!level?.staffable && level?.average_hourly_rate == 0
                            ? 'N/A'
                            : level?.average_hourly_rate}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[5]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {!level?.staffable && level?.oef_contribution == 0
                            ? 'N/A'
                            : `${level?.oef_contribution}%`}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[6]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level?.impacts_oef ? 'Yes' : 'No'}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[7]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level?.staffable ? 'Yes' : 'No'}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[8]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {level.status ? (
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
                              className={`optionsIcon`}
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              onClick={() => {
                                setToggleZindex(index);
                              }}
                            >
                              <SvgComponent name={'ThreeDots'} />
                            </div>
                            <ul className="dropdown-menu position">
                              {CheckPermission([
                                Permissions.CRM_ADMINISTRATION.CONTACTS.ROLES
                                  .READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/crm-admin/contacts/roles/${level?.id}/view`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.CRM_ADMINISTRATION.CONTACTS.ROLES
                                  .WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/crm-admin/contacts/roles/${level?.id}`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {!level?.is_primary_chairperson &&
                                CheckPermission([
                                  Permissions.CRM_ADMINISTRATION.CONTACTS.ROLES
                                    .ARCHIVE,
                                ]) && (
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      onClick={() => {
                                        setModalPopUp(true);
                                        setIsArchived(true);
                                        setArchiveId(level?.id);
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
                    <td className="no-data" colSpan={9}>
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
      </div>
      <SuccessPopUpModal
        title={isArchived ? 'Confirmation' : 'Success!'}
        message={
          isArchived
            ? 'Are you sure you want to archive?'
            : 'Device Type updated.'
        }
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message="Role is archived."
        modalPopUp={archiveSuccess}
        isNavigate={true}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
      />
    </div>
  );
};

export default ListContactRole;
