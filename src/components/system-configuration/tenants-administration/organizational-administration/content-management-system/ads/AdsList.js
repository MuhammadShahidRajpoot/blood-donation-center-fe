import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SuccessPopUpModal from '../../../../../common/successModal';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination';
import styles from './index.module.scss';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ContentManagementSystemBreadCrumbsData } from '../ContentManagementSystemBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../../enums/PermissionsEnum.js';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils.js';

const AdsList = () => {
  const location = useLocation();
  const currentLocation = location.pathname;
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [adsData, setAdsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('image_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [getData, setGetData] = useState(false);
  // const [adType, setAdType] = useState("");
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  // const [isStatus, setIsStatus] = useState("");
  const [archiveId, setArchiveId] = useState();
  const bearerToken = localStorage.getItem('token');
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [adTypeText, setAdTypeText] = useState(null);
  const [archiveStatus, setArchiveStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  useEffect(() => {
    const getAdsData = async () => {
      setIsLoading(true);
      const deviceTypeUrl = `${BASE_URL}/ad?limit=${limit}&page=${currentPage}${
        isActive ? `&is_active=${isActive?.value === 'true' ? 1 : 0}` : ''
      } ${
        searchText && searchText.length > 1 ? `&image_name=${searchText}` : ``
      }${adTypeText !== null ? `&ad_type=${adTypeText.value || ''}` : ''}${
        sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''
      }`;
      const result = await fetch(`${deviceTypeUrl}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const data = await result.json();
      setAdsData(data?.data);
      setTotalRecords(data?.total_records);
      setIsLoading(false);
    };
    if (!searchText) {
      getAdsData();
    }

    if (searchText.length > 1) {
      getAdsData();
    }

    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    limit,
    currentPage,
    isActive,
    searchText,
    adTypeText,
    sortBy,
    sortOrder,
    getData,
    BASE_URL,
    bearerToken,
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const archieveHandle = async () => {
    const bearerToken = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/ad/archive/${archiveId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    let data = await response.json();
    if (data.status === 'success') {
      setModalPopUp(false);
      setTimeout(() => {
        setArchiveStatus(true);
      }, 600);
      setGetData(!getData);
    }
    setModalPopUp(false);
  };

  const handleIsAdType = (value) => {
    setAdTypeText(value);
  };
  const BreadcrumbsData = [
    ...ContentManagementSystemBreadCrumbsData,
    {
      label: 'Ads',
      class: 'disable-label',
      link: '/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/list',
    },
  ];

  const handleAddClick = () => {
    navigate(
      `/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/create`
    );
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortOrder('ASC');
      } else {
        setSortOrder('ASC');
      }
    } else {
      setSortBy(column);
    }
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'image_url', label: 'Image', defaultHidden: false },
    { name: 'name', label: 'Name', defaultHidden: true },
    { name: 'description', label: 'Redirect URL', defaultHidden: true },
    { name: 'start_date', label: 'Type', defaultHidden: true },
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
        BreadCrumbsTitle={'Ads'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="tabs">
          <ul>
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION
                .CONTENT_MANAGEMENT_SYSTEM.ADS.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={
                    '/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/list'
                  }
                  className={
                    currentLocation ===
                    '/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/list'
                      ? 'active'
                      : ''
                  }
                >
                  Ads
                </Link>
              </li>
            )}
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION
                .CONTENT_MANAGEMENT_SYSTEM.EMAIL_TEMPLATES.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={'/system-configuration/platform-admin/email-template'}
                  className={
                    currentLocation ==
                    '/system-configuration/platform-admin/email-template'
                      ? `${styles.bg_blue}`
                      : ''
                  }
                >
                  Email Templates
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
            <form className={`d-flex gap-3 w-100`}>
              <SelectDropdown
                placeholder={'Ad Type'}
                defaultValue={adTypeText}
                selectedValue={adTypeText}
                removeDivider
                showLabel
                onChange={handleIsAdType}
                options={[
                  { value: 'Large Ad', label: 'Large Ad' },
                  { value: 'Medium Ad', label: 'Medium Ad' },
                  { value: 'Small Ad', label: 'Small Ad' },
                ]}
              />

              <SelectDropdown
                placeholder={'Status'}
                defaultValue={isActive}
                selectedValue={isActive}
                removeDivider
                showLabel
                onChange={(value) => {
                  setIsActive(value);
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
            Permissions.ORGANIZATIONAL_ADMINISTRATION.CONTENT_MANAGEMENT_SYSTEM
              .ADS.WRITE,
          ]) && (
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Ad
            </button>
          )}
        </div>
        <div className="table-listing-main">
          <div className="table-responsive">
            <table
              className={` ${styles.tablewidth} table table-striped hasOptions`}
            >
              <thead>
                <tr className={styles.tr}>
                  <th
                    className={`${
                      columnList.includes(headers?.[0]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Image
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Name
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('image_name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Redirect URL
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Type
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('ad_type')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
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
                                  <div className="flex align-items-center gap-2 checkboxInput py-0 px-3">
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
                ) : adsData && adsData.length > 0 ? (
                  adsData.map((item, index) => {
                    return (
                      <tr key={index} className={styles.tr}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          <img
                            width={82}
                            height={50}
                            className={styles.imgtable}
                            alt=""
                            src={item?.image_url}
                          />
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(item?.image_name)}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          <p className={`mb-0 ${styles.elipses}`}>
                            <a
                              href={item?.redirect_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item?.redirect_url}
                            </a>
                          </p>
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item?.ad_type}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.is_active ? (
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
                              className={`optionsIcon ${styles.cusrsor}`}
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
                                  .CONTENT_MANAGEMENT_SYSTEM.ADS.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/${item?.id}/view`}
                                    style={{
                                      borderBottom: '1px solid #e5e5e5',
                                    }}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .CONTENT_MANAGEMENT_SYSTEM.ADS.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/${item?.id}/edit`}
                                    style={{
                                      borderBottom: '1px solid #e5e5e5',
                                    }}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION
                                  .CONTENT_MANAGEMENT_SYSTEM.ADS.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setModalPopUp(true);
                                      setIsArchived(true);
                                      setArchiveId(item?.id);
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
          componentName={'Ads'}
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
        archived={archieveHandle}
      />
      <SuccessPopUpModal
        title={'Success!'}
        message={'Ad is archived.'}
        modalPopUp={archiveStatus}
        setModalPopUp={setArchiveStatus}
        showActionBtns={true}
        isNavigate={true}
        redirectPath={
          '/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/list'
        }
      />
    </div>
  );
};

export default AdsList;
