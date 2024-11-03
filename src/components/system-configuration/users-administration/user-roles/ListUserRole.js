import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import { USER_ROLES } from '../../../../routes/path';
import SvgComponent from '../../../common/SvgComponent';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import Pagination from '../../../common/pagination';
import { makeAuthorizedApiRequestAxios } from '../../../../helpers/Api';
import SelectDropdown from '../../../common/selectDropdown';
import SuccessPopUpModal from '../../../common/successModal';
import { UsersBreadCrumbsData } from '../../tenants-administration/user-administration/UsersBreadCrumbsData';
import CheckPermission from '../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../enums/PermissionsEnum.js';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../assets/images/checkbox-filter-open.png';
import { truncate } from 'lodash';

const ListUserRole = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [userRoles, setUserRoles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [archivePopup, setArchivePopup] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [roleId, setRoleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const BreadcrumbsData = [
    ...UsersBreadCrumbsData,
    {
      label: 'User Roles',
      class: 'disable-label',
      link: USER_ROLES.LIST,
    },
  ];

  const getData = async () => {
    setIsLoading(true);
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/roles/tenant/list?search=${searchText}&page=${currentPage}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&isActive=${
        isActive?.value ?? ''
      }`
    );
    const data = result.data;
    const modifiedData = data?.data?.map((entry) => ({
      ...entry,
      role: {
        ...entry.role,
        name: entry.role.is_auto_created
          ? `${entry.role.name} (System Defined)`
          : entry.role.name,
      },
    }));
    setUserRoles(modifiedData);
    setIsLoading(false);
    setTotalRecords(data?.count);
  };

  useEffect(() => {
    getData();
  }, [currentPage, limit, BASE_URL, isActive, sortBy, sortOrder]);

  useEffect(() => {
    if (searchText.length >= 2 || searchText.length === 0) {
      setCurrentPage(1);
      getData();
    }
  }, [searchText]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSort = (column) => {
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

  const archive = async () => {
    try {
      const res = await makeAuthorizedApiRequestAxios(
        'PATCH',
        `${BASE_URL}/roles/archive/${roleId}`,
        JSON.stringify({ is_archived: true })
      );
      let { data, status, response } = res.data;
      if (status === 'success') {
        setArchivePopup(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
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
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleIsActive = (item) => {
    setIsActive(item);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    {
      name: 'name',
      label: 'Name',
      defaultHidden: true,
    },
    { name: 'description', label: 'Role Details', defaultHidden: true },
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
        BreadCrumbsTitle={'User Roles'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex">
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
          Permissions.USER_ADMINISTRATIONS.USER_ROLES.WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate(USER_ROLES.CREATE);
              }}
            >
              Create User Role
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
                    Role Name
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
                    // style={{ width: '60%' }}
                  >
                    Role Details
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
                ) : userRoles?.length > 0 ? (
                  userRoles?.map((item, index) => {
                    return (
                      <tr key={item.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.role.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncate(item.role.description, { length: 100 })}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.role.is_active ? (
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
                                Permissions.USER_ADMINISTRATIONS.USER_ROLES
                                  .READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={USER_ROLES.VIEW.replace(
                                      ':id',
                                      item.role.id
                                    )}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {
                                <>
                                  {CheckPermission([
                                    Permissions.USER_ADMINISTRATIONS.USER_ROLES
                                      .WRITE,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        to={USER_ROLES.EDIT.replace(
                                          ':id',
                                          item.role.id
                                        )}
                                      >
                                        Edit
                                      </Link>
                                    </li>
                                  )}
                                  {CheckPermission([
                                    Permissions.USER_ADMINISTRATIONS.USER_ROLES
                                      .WRITE,
                                  ]) && (
                                    <li>
                                      <Link
                                        className="dropdown-item"
                                        to={USER_ROLES.DUPLICATE.replace(
                                          ':id',
                                          item.role.id
                                        )}
                                      >
                                        Duplicate Role
                                      </Link>
                                    </li>
                                  )}
                                  {CheckPermission([
                                    Permissions.USER_ADMINISTRATIONS.USER_ROLES
                                      .ARCHIVE,
                                  ]) &&
                                    !item?.role?.cc_role_name && (
                                      <li>
                                        <Link
                                          className="dropdown-item"
                                          onClick={() => {
                                            setRoleId(item.role.id);
                                            setArchivePopup(true);
                                          }}
                                        >
                                          Archive
                                        </Link>
                                      </li>
                                    )}
                                </>
                              }
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
        <SuccessPopUpModal
          title="Success!"
          message="Role is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
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
                <button className="btn btn-primary" onClick={() => archive()}>
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

export default ListUserRole;
