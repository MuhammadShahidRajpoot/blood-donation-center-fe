import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import GoalsNavigationTabs from '../navigationTabs';
import { MONTHLY_GOALS_PATH } from '../../../../../../routes/path';
import SvgComponent from '../../../../../common/SvgComponent';
import ConfirmArchiveIcon from '../../../../../../assets/images/ConfirmArchiveIcon.png';
import Pagination from '../../../../../common/pagination/index';
import styles from './index.module.scss';
import SelectDropdown from '../../../../../common/selectDropdown';
import { makeAuthorizedApiRequestAxios } from '../../../../../../helpers/Api';
import { isEmpty } from 'lodash';
import { GoalsBreadCrumbsData } from '../GoalsBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import OrganizationalDropDown from '../../../../../common/Organization/DropDown';
import OrganizationalPopup from '../../../../../common/Organization/Popup';
import { truncateTo50 } from '../../../../../../helpers/utils';

const ListMonthlyGoals = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [monthlyGoals, setMonthlyGoals] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [archivePopup, setArchivePopup] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [procedureType, setProcedureType] = useState(null);
  const [procedureTypeData, setProcedureTypeData] = useState();
  const currentYear = new Date().getFullYear();
  const [isLoading, setIsLoading] = useState(false);
  const [year, setYear] = useState(null);
  const years = Array.from({ length: 51 }, (_, index) => {
    return {
      label: (currentYear + index).toString(),
      value: (currentYear + index).toString(),
    };
  });
  const [sortBy, setSortBy] = useState('year');
  const [childSortBy, setChildSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [goalId, setGoalId] = useState(null);
  const bearerToken = localStorage.getItem('token');
  const [archiveDisabled, setArchiveDisabled] = useState(false);
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [organizationalLevelFilter, setOrganizationalLevelFilter] =
    useState('');
  const [isPopupVisible, setPopupVisible] = useState();
  const [toggleZindex, setToggleZindex] = useState(-1);
  const [OLLabels, setOLLabels] = useState([]);

  const navigate = useNavigate();

  const handleOrganizationalLevel = (payload) => {
    setPopupVisible(false);
    setOrganizationalLevelFilter(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  };

  const BreadcrumbsData = [
    ...GoalsBreadCrumbsData,
    {
      label: 'Monthly Goals',
      class: 'active-label',
      link: `${MONTHLY_GOALS_PATH.LIST}`,
    },
  ];

  const getData = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('limit', limit);
    params.append('page', currentPage);
    params.append('procedureType', procedureType?.value || '');
    params.append('year', year?.value || '');
    params.append('sortBy', sortBy);
    params.append('childSortBy', childSortBy);
    params.append('sortOrder', sortOrder);
    params.append('organizational_levels', organizationalLevelFilter);
    const response = await axios.get(
      `${BASE_URL}/monthly_goals?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );

    const data = response.data;
    setMonthlyGoals(data?.data);
    setTotalRecords(data?.count);
    setIsLoading(false);
  };

  const fetchProcedureData = async () => {
    try {
      const response = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/procedure_types?fetchAll=true&status=true`
      );
      const data = response.data;
      setProcedureTypeData([
        ...(data?.data
          .filter((item) => item.is_goal_type == true)
          .map((item) => {
            return { value: item.id, label: item.name };
          }) || []),
      ]);
    } catch (error) {
      console.error('Error procedures:', error);
    }
  };

  useEffect(() => {
    fetchProcedureData();
  }, []);

  useEffect(() => {
    getData();
    setCurrentPage(1);
  }, [
    limit,
    BASE_URL,
    procedureType,
    year,
    sortBy,
    childSortBy,
    sortOrder,
    organizationalLevelFilter,
  ]);

  useEffect(() => {
    getData();
  }, [currentPage]);

  useEffect(() => {
    getData();
  }, [currentPage]);

  const handleSort = (column, child) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortOrder('ASC');
      } else {
        setSortOrder('ASC');
        setSortBy('');
        setChildSortBy(null);
      }
    } else {
      setSortBy(column);
      child ? setChildSortBy(child) : setChildSortBy(null);
      setSortOrder('ASC');
    }
  };

  const archive = async () => {
    if (archiveDisabled) return;
    setArchiveDisabled(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/monthly_goals/${goalId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const { data, status } = response;
      if (status === 200) {
        setArchivePopup(false);
        setArchiveDisabled(false);
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
      setArchiveDisabled(false);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleProcedureType = (item) => {
    setProcedureType(item);
  };

  const handleYear = (item) => {
    setYear(item);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  let enableColumnHide = true;
  let showActionsLabel = false;

  const headers = [
    { name: 'year', label: 'Year', defaultHidden: false },
    {
      name: 'collection_operation',
      label: 'Collection Operation',
      defaultHidden: true,
    },
    { name: 'procedure_type', label: 'Procedure Type', defaultHidden: true },
    {
      name: 'owner',
      label: 'Owner',
      defaultHidden: true,
    },
    {
      name: 'total_goal',
      label: 'Total Goal',
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
        BreadCrumbsTitle={'Monthly Goals'}
      />
      <div className="filterBar">
        <GoalsNavigationTabs />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 ${styles.dropdownWidthMenu}`}>
              <OrganizationalDropDown
                labels={OLLabels}
                handleClick={() => setPopupVisible(true)}
                handleClear={() => {
                  handleOrganizationalLevel('');
                  setOLLabels('');
                }}
              />
              <SelectDropdown
                placeholder={'Procedure Type'}
                showLabel
                selectedValue={procedureType}
                removeDivider
                onChange={handleProcedureType}
                options={procedureTypeData}
              />
              <SelectDropdown
                placeholder={'Year'}
                showLabel={!isEmpty(year)}
                selectedValue={year}
                onChange={handleYear}
                options={years}
                removeDivider
              />
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS.MONTHLY_GOALS.WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate(MONTHLY_GOALS_PATH.CREATE);
              }}
            >
              Create Monthly Goal
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
                    Year
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('year')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[1]?.name) ? 'd-none' : ''
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
                      columnList.includes(headers?.[2]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Procedure Type
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('procedure_type', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[3]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Owner
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('owner', 'name')}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </th>
                  <th
                    className={`${
                      columnList.includes(headers?.[4]?.name) ? 'd-none' : ''
                    }`}
                  >
                    Goal
                    <div
                      className="sort-icon"
                      onClick={() => handleSort('total_goal')}
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
                ) : monthlyGoals?.length ? (
                  monthlyGoals?.map((item, index) => {
                    return (
                      <tr key={item.id}>
                        <td
                          className={`${
                            columnList.includes(headers?.[0]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item?.year}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[1]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {item.collection_operation
                            .map((item) => item.name)
                            .join(',') || ''}
                        </td>{' '}
                        <td
                          className={`${
                            columnList.includes(headers?.[2]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(item?.procedure_type?.name) || ''}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[3]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(item?.donor_center?.name) ||
                            truncateTo50(
                              `${item?.recruiter?.first_name || ''} ${
                                item?.recruiter?.last_name || ''
                              }`
                            )}{' '}
                        </td>
                        <td
                          className={`${
                            columnList.includes(headers?.[4]?.name)
                              ? 'd-none'
                              : ''
                          }`}
                        >
                          {truncateTo50(item.total_goal)}
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
                            <ul className="dropdown-menu popper">
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .MONTHLY_GOALS.READ,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={MONTHLY_GOALS_PATH.VIEW.replace(
                                      ':id',
                                      item.id
                                    )}
                                  >
                                    View
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .MONTHLY_GOALS.WRITE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    to={MONTHLY_GOALS_PATH.EDIT.replace(
                                      ':id',
                                      item.id
                                    )}
                                  >
                                    Edit
                                  </Link>
                                </li>
                              )}
                              {CheckPermission([
                                Permissions.ORGANIZATIONAL_ADMINISTRATION.GOALS
                                  .MONTHLY_GOALS.ARCHIVE,
                              ]) && (
                                <li>
                                  <Link
                                    className="dropdown-item"
                                    onClick={() => {
                                      setGoalId(item.id);
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
                <button
                  disabled={archiveDisabled}
                  className="btn btn-primary"
                  onClick={() => archive()}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <OrganizationalPopup
        value={organizationalLevelFilter}
        showConfirmation={isPopupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        showRecruiters
        showDonorCenters
      />
    </div>
  );
};

export default ListMonthlyGoals;
