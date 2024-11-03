/* eslint-disable*/
import React, { useEffect, useState } from 'react';
import styles from '../../index.module.scss';
import './operationlist.edit.scss';
import TopBar from '../../../common/topbar/index';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import Pagination from '../../../common/pagination/index';
import NavTabs from '../../../common/navTabs';
import ReactDatePicker from 'react-datepicker';
import SelectDropdown from '../../../common/selectDropdown';
import SvgComponent from '../../../common/SvgComponent';
import OperationListEditTable from './OperationListEditTable';
import {
  STAFFING_MANAGEMENT_BUILD_SCHEDULE,
  STAFFING_MANAGEMENT_STAFF_LIST,
} from '../../../../routes/path';
import ConfirmModal from '../../../common/confirmModal';
import ConfirmDialogIcon from '../../../../assets/images/confirmation-image.png';
import { toast } from 'react-toastify';
const OperationListEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const schedule_ID = searchParams.get('schedule_id');
  const schedule_status = searchParams.get('schedule_status');
  const collection_operation_id = searchParams.get('collection_operation_id');
  const disableEdit = searchParams.get('disableEdit'); // manages if user clicked on 'View' of a schedule which was locked atm
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const currentLocation = location.pathname;
  const [selectedRow, setselectedRow] = useState();
  const [searchText, setSearchText] = useState(null);
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [flaggedOperations, setFlaggedOperations] = useState(null);
  const [inSyncOperations, setInSyncOperations] = useState(null);
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState();
  const [limit, setLimit] = useState(25);
  const [pausedAtOperation, setPausedAtOperation] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'date',
      label: 'Date',
      sortable: true,
      checked: true,
    },
    {
      name: 'name',
      label: 'Name',
      sortable: true,
      checked: true,
    },
    {
      name: 'start_time',
      label: 'Hours',
      sortable: false,
      checked: true,
    },
    {
      name: 'projections',
      label: 'Projection',
      sortable: true,
      checked: true,
    },
    {
      name: 'staffSetup',
      label: 'Staffing (Assigned/Requested)',
      sortable: true,
      splitLabel: true,
      checked: true,
    },
    {
      name: 'vehicles',
      label: 'Vehicles (Assigned/Requested)',
      sortable: true,
      splitLabel: true,
      checked: true,
    },
    {
      name: 'devices',
      label: 'Devices (Assigned/Requested)',
      sortable: true,
      splitLabel: true,
      checked: true,
    },
    {
      name: 'operation_status',
      label: 'Status',
      sortable: false,
      icon: false,
      checked: true,
    },
  ]);
  const [statusText, setStatusText] = useState(null);
  const [notifiedValue, setNotifiedValue] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [dateValue, setDateValue] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [notifyStaffDisable, setNotifyStaffDisable] = useState(false);

  const queryParams = {
    schedule_id: schedule_ID,
    schedule_status: schedule_status,
    collection_operation_id: collection_operation_id,
    disableEdit: disableEdit,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();

  const navigateWithQueryParam = (path, data = null) => {
    const queryParams =
      data !== null
        ? {
            isCreated: false,
            schedule_id: schedule_ID,
            operation_id: data?.id,
            operation_type: data?.operation_type,
            schedule_status: schedule_status,
            collection_operation_id: collection_operation_id,
            disableEdit: disableEdit,
            shift_id: data?.shifts[0].id,
          }
        : {
            isCreated: false,
            schedule_id: schedule_ID,
            operation_id: rows[0]?.id,
            operation_type: rows[0].operation_type,
            schedule_status: schedule_status,
            collection_operation_id: collection_operation_id,
            disableEdit: disableEdit,
          };
    if (currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED) {
      queryParams['resolve'] = data ? '1' : 'all';
    }

    navigate({
      pathname: path, // Specify your path
      search: new URLSearchParams(queryParams).toString(),
    });
  };

  const confirmNotify = async () => {
    const operations = rows
      .map((row) => {
        if (row.checked)
          return {
            operation_id: row.id,
            operation_type: row.operation_type,
          };
      })
      .filter((row) => row);

    if (operations) {
      try {
        const response = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/staffing-management/schedules/operations/notify/staff`,
          JSON.stringify({
            subject: 'Your Schedule has changed',
            content: `Your hours have changed for the schedule beginning {Schedule Start Date}. Please click <a href="${window.location.href}" target="_blank">here</a> to review the schedule`,
            schedule_id: schedule_ID,
            operations: operations,
          })
        );
        const data = await response.json();
        if (data?.status_code === 200) {
          setShowConfirmationDialog(false);
          fetchOperations();
          rows?.forEach((row) => {
            row.checked = false;
          });
        } else {
          toast.error(`Failed to Notify Staff`, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`Failed to Notify Staff: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const checkDisability = () => {
    setNotifyStaffDisable(true);
    rows?.forEach((row) => {
      if (row.checked) {
        setNotifyStaffDisable(false);
      }
    });
  };

  // Handles changes in Search Bar
  const searchFieldChange = (e) => {
    if (e.target.value.length > 2) {
      setSearchText(e.target.value);
    } else {
      setSearchText(null);
    }
  };
  const handleInputBlur = () => {};

  // Handles Sorting
  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortBy(columnName);
      setSortOrder('ASC');
    }
  };

  const statusDropDownlist = () => {
    const array = rows.map((row) => {
      return {
        label: row.operation_status,
        value: row.operation_status_id,
      };
    });
    const uniqueArray = array.filter(
      (obj, index, self) =>
        index === self.findIndex((o) => o.value === obj.value)
    );
    return uniqueArray;
  };

  const getInSyncOperations = async () => {
    setIsLoading(true);
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-management/schedules/operation-list/${schedule_ID}?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${
          statusText !== null ? '&status=' + statusText.value : ''
        }${searchText !== null ? '&keyword=' + searchText : ''}${
          startDate !== null ? '&startDate=' + startDate : ''
        }${
          notifiedValue !== null ? '&notify=' + notifiedValue.value : ''
        }&in_sync=true`
      );
      setIsLoading(false);
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  const getFlaggedOperations = async () => {
    setIsLoading(true);
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-management/schedules/operation-list/${schedule_ID}?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${
          statusText !== null ? '&status=' + statusText.value : ''
        }${searchText !== null ? '&keyword=' + searchText : ''}${
          startDate !== null ? '&startDate=' + startDate : ''
        }&in_sync=false`
      );
      setIsLoading(false);
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  const unassignAllAssignments = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'DELETE',
        `${BASE_URL}/staffing-management/schedules/operations/${selectedRow.id}/unassign-all-assignments?operation_type=${selectedRow.operation_type}`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Unassign all Staff: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [
    currentPage,
    limit,
    sortOrder,
    sortBy,
    notifiedValue,
    statusText,
    startDate,
    searchText,
    currentLocation,
  ]);

  const fetchOperations = () => {
    if (currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED) {
      const flagged = getFlaggedOperations();
      flagged
        .then((val) => {
          setFlaggedOperations(val.items);
          setRows(val.items);
          setTotalRecords(val.items.length);
        })
        .catch((error) => {
          toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
            autoClose: 3000,
          });
        });
    } else if (currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT) {
      if (flaggedOperations === null) {
        // fetch flagged operations on in sync tab but only initially, we need the number of total Flagged operations for UI
        const flagged = getFlaggedOperations();
        flagged
          .then((val) => {
            // do not call setRows here because we are at In Sync page
            setFlaggedOperations(val.items);
            setTotalRecords(val.items.length);
          })
          .catch((error) => {
            toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
              autoClose: 3000,
            });
          });
      }
      const inSync = getInSyncOperations();
      inSync
        .then((val) => {
          setInSyncOperations(val.items);
          setRows(val.items);
          setTotalRecords(val.items.length);
          const pausedAt = rows.filter(
            (item) => val.pausedAtOperation.operation_id == item.id
          );
          setPausedAtOperation(pausedAt);
        })
        .catch((error) => {
          toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
            autoClose: 3000,
          });
        });
    }
  };

  const optionsConfig = [
    {
      label: 'Edit',
      action: (rowData) => {
        navigateWithQueryParam(
          STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS,
          rowData
        );
      },
    },
    {
      label: 'Resolve',
      action: (rowData) => {
        navigateWithQueryParam(
          STAFFING_MANAGEMENT_BUILD_SCHEDULE.CHANGE_SUMMARY,
          rowData
        );
      },
    },
    {
      label: 'Unassign',
      action: (rowData) => {
        setselectedRow(rowData);
        setIsUnassigned(true);
        setShowConfirmationDialog(true);
      },
    },
  ];
  const Tabs = [
    {
      label: 'In Sync',
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT.concat('?').concat(
        appendToLink
      ),
    },
    {
      label: `Flagged (${flaggedOperations?.length})`,
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED.concat('?').concat(
        appendToLink
      ),
    },
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={
          currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT
            ? [
                {
                  label: 'Staffing Management',
                  class: 'disable-label',
                  link: STAFFING_MANAGEMENT_STAFF_LIST,
                },
                {
                  label: 'Build Schedules',
                  class: 'disable-label',
                  link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST,
                },
                {
                  label: 'Edit Schedule',
                  class: 'disable-label',
                  link: `${currentLocation}?schedule_id=${schedule_ID}&schedule_status=${schedule_status}&collection_operation_id=${collection_operation_id}&disableEdit=${disableEdit}`,
                },
                {
                  label: 'Operation List',
                  class: 'active-label',
                  link: `${currentLocation}?schedule_id=${schedule_ID}&schedule_status=${schedule_status}&collection_operation_id=${collection_operation_id}&disableEdit=${disableEdit}`,
                },
              ]
            : currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED
            ? [
                {
                  label: 'Staffing Management',
                  class: 'disable-label',
                  link: STAFFING_MANAGEMENT_STAFF_LIST,
                },
                {
                  label: 'Build Schedules',
                  class: 'disable-label',
                  link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST,
                },
                {
                  label: 'Edit Schedule',
                  class: 'disable-label',
                  link: `${currentLocation}?schedule_id=${schedule_ID}&schedule_status=${schedule_status}&collection_operation_id=${collection_operation_id}&disableEdit=${disableEdit}`,
                },
                {
                  label: 'Operation List',
                  class: 'active-label',
                  link: `${currentLocation}?schedule_id=${schedule_ID}&schedule_status=${schedule_status}&collection_operation_id=${collection_operation_id}&disableEdit=${disableEdit}`,
                },
              ]
            : null
        }
        BreadCrumbsTitle={'Operation List'}
        SearchPlaceholder="Search"
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filter">
            <form className="d-flex justify-content-end flex-wrap">
              {currentLocation !==
                STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED && (
                <div className="dropdown mt-2 mb-2">
                  <SelectDropdown
                    label="Notified"
                    options={[
                      { label: 'No', value: false },
                      { label: 'Yes', value: true },
                      { label: 'All', value: null },
                    ]}
                    selectedValue={notifiedValue}
                    onChange={(val) => {
                      setNotifiedValue(val);
                    }}
                    removeDivider
                    placeholder="Notified"
                  />
                </div>
              )}
              <div className="dropdown mt-2 mb-2">
                <SelectDropdown
                  label="Status"
                  options={statusDropDownlist()}
                  selectedValue={statusText}
                  onChange={(val) => {
                    setStatusText(val);
                  }}
                  removeDivider
                  placeholder="Status"
                />
              </div>
              <div className="dropdown mt-2 mb-2">
                <ReactDatePicker
                  wrapperClassName={styles.secondDate}
                  clearButtonClassName={styles.datePickerCloseIconStyles}
                  isClearable={dateValue}
                  dateFormat="MM/dd/yyyy"
                  className={`custom-datepicker ${styles.datepicker}`}
                  placeholderText="Start Date"
                  selected={dateValue}
                  onChange={(date) => {
                    if (date) {
                      setStartDate(
                        new Date(date.setDate(date.getDate() + 1)).toISOString()
                      );
                      setDateValue(
                        new Date(
                          new Date(
                            date.setDate(date.getDate() - 1)
                          ).toISOString()
                        )
                      );
                    } else {
                      setStartDate(null);
                      setDateValue(null);
                    }
                  }}
                  onBlur={(date) => {
                    handleInputBlur({
                      target: { value: date, name: 'start_date' },
                    });
                  }}
                  onKeyDown={(e) => {
                    e.preventDefault();
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="alert-container">
        <div
          className={`alert d-flex align-items-center gap-3 alert-component ${
            schedule_status === 'Draft' ? 'warn' : 'success'
          } `}
          role="alert"
        >
          <SvgComponent
            name={schedule_status === 'Draft' ? 'DraftIcon' : 'PreliminaryIcon'}
          />
          {schedule_status === 'Draft' ? (
            <span className="alert-title">Schedule in Draft</span>
          ) : (
            <span className="alert-title">Schedule Published</span>
          )}
        </div>
      </div>
      <div className="mainContentInner">
        <div className="button-icon">
          <div className="buttons">
            <div className="buttons">
              {currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT && (
                <div className="d-flex gap-3">
                  {schedule_status !== 'Draft' && (
                    <button
                      style={{
                        minHeight: '0px',
                        padding: '12px 20px 12px 20px',
                        marginBottom: '-30px',
                        backgroundColor: 'transparent',
                        color: '#387DE5',
                        border: 'none',
                      }}
                      className="btn btn-primary"
                      onClick={() => setShowConfirmationDialog(true)}
                      disabled={
                        rows &&
                        rows.length > 0 &&
                        !notifyStaffDisable &&
                        disableEdit === 'false'
                          ? false
                          : true
                      }
                    >
                      <div className="me-1">
                        <SvgComponent name="BellIcon" />
                      </div>
                      Notify Staff
                    </button>
                  )}
                  <button
                    style={{
                      minHeight: '0px',
                      padding: '12px 32px 12px 32px',
                      marginBottom: '-30px',
                    }}
                    className="btn btn-primary"
                    onClick={() =>
                      rows.length > 0
                        ? navigateWithQueryParam(
                            STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS,
                            {
                              schedule_id: schedule_ID,
                              id:
                                pausedAtOperation.length > 0
                                  ? pausedAtOperation[0].id
                                  : rows[0]?.id,
                              operation_type:
                                pausedAtOperation.length > 0
                                  ? pausedAtOperation[0].operation_type
                                  : rows[0].operation_type,
                              schedule_status: schedule_status,
                              shifts:
                                pausedAtOperation.length > 0
                                  ? pausedAtOperation[0].shifts[0].id
                                  : rows[0].shifts,
                            }
                          )
                        : null
                    }
                    disabled={
                      rows && rows.length > 0 && disableEdit === 'false'
                        ? false
                        : true
                    }
                  >
                    Edit Schedule
                  </button>
                </div>
              )}
              {currentLocation ===
                STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED && (
                <div className="d-flex">
                  <button
                    style={{
                      minHeight: '0px',
                      padding: '12px 32px 12px 32px',
                      marginBottom: '-30px',
                    }}
                    className="btn btn-primary"
                    onClick={() =>
                      rows.length > 0
                        ? navigateWithQueryParam(
                            STAFFING_MANAGEMENT_BUILD_SCHEDULE.CHANGE_SUMMARY
                          )
                        : null
                    }
                    disabled={
                      disableEdit === 'false' && rows && rows.length > 0
                        ? false
                        : true
                    }
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="filterBar px-0 py-0">
          <NavTabs
            tabs={Tabs}
            currentLocation={currentLocation.concat('?').concat(appendToLink)}
          />
        </div>
        <OperationListEditTable
          isLoading={isLoading}
          data={rows}
          headers={tableHeaders}
          handleSort={handleSort}
          sortable={false}
          optionsConfig={optionsConfig}
          setTableHeaders={setTableHeaders}
          onCheckboxClick={checkDisability}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
      <ConfirmModal
        showConfirmation={showConfirmationDialog}
        onCancel={() => {
          setShowConfirmationDialog(false);
        }}
        onConfirm={() => {
          if (isUnassigned) {
            unassignAllAssignments().then((data) => {
              if (data.status_code === 200) {
                setShowConfirmationDialog(false);
              }
              fetchOperations();
            });
          } else {
            confirmNotify();
          }
        }}
        icon={ConfirmDialogIcon}
        heading={'Confirmation'}
        description={`${
          isUnassigned
            ? 'Are you sure, you want to Unassign all staff?'
            : 'Are you sure, you want to Notify all staff about the update?'
        }`}
        confirmBtnText={`${isUnassigned ? 'Unassign' : 'Notify'}`}
      />
    </div>
  );
};
export default OperationListEdit;
