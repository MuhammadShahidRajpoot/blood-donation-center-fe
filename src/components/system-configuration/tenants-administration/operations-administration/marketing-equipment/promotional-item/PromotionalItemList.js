import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination/index';
import { toast } from 'react-toastify';
import ArchivePopUpModal from '../../../../../common/successModal';
import MarketingEquipmentNavigationTabs from '../Navigation';
import moment from 'moment';
import CalendarCheck from '../../../../../../assets/calendar-check.svg';
import CalendarCheckAlt from '../../../../../../assets/calendar-check-alt.svg';
import {
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import SuccessPopUpModal from '../../../../../common/successModal';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import SelectDropdown from '../../../../../common/selectDropdown';
import { MarketingEquipmentBreadCrumbsData } from '../MarketingEquipmentBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import { truncateTo50 } from '../../../../../../helpers/utils';

const PromotionalItemList = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [promotionId, setPromotionItemId] = useState(null);
  const [promotions, setPromotions] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [isActive, setIsActive] = useState({
    label: 'Active',
    value: true,
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [collectionOperationData, setCollectionOperationData] = useState();
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [sortCollectionOperation, setSortCollectionOperation] = useState('ASC');
  const [columnList, setColumnList] = useState([
    'collection_operation',
    'short_name',
  ]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  const BreadcrumbsData = [
    ...MarketingEquipmentBreadCrumbsData,
    {
      label: 'Promotional Items',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items',
    },
  ];

  const getPromotionsData = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    collectionOperation?.forEach((item) => {
      params.append('collection_operation', parseInt(item.id));
    });
    let result = '';
    if (searchText || isActive || collectionOperation) {
      result = await fetchData(
        `/marketing-equipment/promotional-items?limit=${limit}&page=${currentPage}&collection_operation_sort=${sortCollectionOperation}&${
          params.size > 0 ? params.toString() : 'collection_operation='
        }${searchText ? `&keyword=${searchText}` : ''}${
          isActive ? `&status=${isActive?.value ?? ''}` : ''
        }&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        'GET'
      );
    } else {
      result = await fetchData(
        `/marketing-equipment/promotional-items?limit=${limit}&page=${currentPage}`,
        'GET'
      );
    }
    setIsLoading(false);

    const promotionsData = result?.data ?? [];

    for (const promotionData of promotionsData) {
      promotionData.collection_operations = promotionData?.collectionOperations
        ?.map((bco) => bco?.collection_operation?.name)
        .join(', ');
    }
    setPromotions(promotionsData);
    setTotalRecords(result?.total_promotional_item_count);
  };

  useEffect(() => {
    getPromotionsData();
    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    limit,
    searchText,
    BASE_URL,
    isActive,
    collectionOperation?.length,
    sortBy,
    sortOrder,
    sortCollectionOperation,
  ]);

  useEffect(() => {
    fetchCollectionOperations();
  }, []);
  const fetchCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      const sortedArray = data?.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
      setCollectionOperationData(sortedArray);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/create'
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
  const sortedPromotionsItems = promotions;

  const archivePromotionalItem = async () => {
    try {
      const res = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/marketing-equipment/promotional-items/${promotionId}`
      );
      let { data, status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        setModalPopUp(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
        await getPromotionsData();
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

  const handleCollectionOperationChange = (value) => {
    const exists = collectionOperation?.filter((item) => item.id === value.id);
    if (exists.length > 0) {
      setCollectionOperation(
        collectionOperation?.filter((item) => item.id !== value.id)
      );
    } else {
      setCollectionOperation([...collectionOperation, value]);
    }
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
    { name: 'name', label: 'Name', defaultHidden: false },
    { name: 'short_name', label: 'Short Name', defaultHidden: true },
    { name: 'description', label: 'Description', defaultHidden: true },
    { name: 'promotion', label: 'Promotion', defaultHidden: true },
    {
      name: 'retire_on',
      label: 'Retire On',
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
        BreadCrumbsTitle={'Promotional Items'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <MarketingEquipmentNavigationTabs />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex gap-3 w-100">
              {collectionOperationData && (
                <GlobalMultiSelect
                  label="Collection Operation"
                  data={collectionOperationData}
                  selectedOptions={collectionOperation}
                  onChange={handleCollectionOperationChange}
                  onSelectAll={handleCollectionOperationChangeAll}
                />
              )}

              <SelectDropdown
                placeholder={'Status'}
                selectedValue={isActive}
                onChange={(option) => {
                  setIsActive(option);
                }}
                options={[
                  {
                    label: 'Active',
                    value: true,
                  },
                  {
                    label: 'Inactive',
                    value: false,
                  },
                ]}
                removeDivider
                showLabel
              />
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.OPERATIONS_ADMINISTRATION.MARKETING_EQUIPMENTS
            .PROMOTIONAL_ITEMS.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Promotional Item
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
                    // width="12%"
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
                    // width="20%"
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
                    // width="15%"
                  >
                    Promotion
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('promotion')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                    // width="10%"
                  >
                    Retire On
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('retire_on')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>

                  <th
                    className={`${
                      columnList.includes(headers?.[5]?.name) ? 'd-none' : ''
                    }`}
                    // width="20%"
                  >
                    Collection Operation
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('collection_operation')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[6]?.name) ? 'd-none' : ''
                    }`}
                    // width="15%"
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
                    <td className="no-data" colSpan={12}>
                      Data Loading
                    </td>
                  </tr>
                ) : sortedPromotionsItems?.length ? (
                  sortedPromotionsItems?.map((promotion, index) => {
                    return (
                      <tr key={promotion.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {promotion.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {promotion.short_name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(promotion.description)}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {promotion.promotion_id.name}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          <div className="d-flex gap-2 align-items-center">
                            {promotion.retire_on ? (
                              <div
                                className="d-flex"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                <img
                                  className="me-2"
                                  src={
                                    moment(
                                      promotion.retire_on,
                                      'YYYY-MM-DD'
                                    ).isBefore(moment().startOf('day'))
                                      ? CalendarCheckAlt
                                      : CalendarCheck
                                  }
                                  alt=""
                                />
                                {moment(promotion.retire_on).format(
                                  'MM-DD-YYYY'
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[5]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(promotion.collection_operations)}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[6]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {promotion.status ? (
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
                                Permissions.OPERATIONS_ADMINISTRATION
                                  .MARKETING_EQUIPMENTS.PROMOTIONAL_ITEMS.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${promotion.id}/view`}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.OPERATIONS_ADMINISTRATION
                                  .MARKETING_EQUIPMENTS.PROMOTIONAL_ITEMS.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={`/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${promotion.id}/edit`}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.OPERATIONS_ADMINISTRATION
                                  .MARKETING_EQUIPMENTS.PROMOTIONAL_ITEMS
                                  .ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setPromotionItemId(promotion.id);
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
                      No data found.
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
          message="PromotionalItem is archived."
          modalPopUp={archivedStatus}
          isNavigate={true}
          setModalPopUp={setArchivedStatus}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items'
          }
        />
        <ArchivePopUpModal
          title={'Confirmation'}
          message={'Are you sure you want to archive?'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={false}
          isArchived={true}
          archived={archivePromotionalItem}
          isNavigate={false}
        />
      </div>
    </div>
  );
};

export default PromotionalItemList;
