/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styles from '../index.module.scss';
import TopBar from '../../common/topbar/index';
import SelectDropdown from '../../common/selectDropdown';
import BuildScheduleTableList from './BuildScheduleTableList';
import { BuildSchduleBreadCrumbData } from './BuildScheduleBreadCrumbData';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../routes/path';
import { useNavigate } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import Pagination from '../../common/pagination';
import StaffingPermissions from '../../../enums/StaffingPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import { fetchData, makeAuthorizedApiRequest } from '../../../helpers/Api';
import { toast } from 'react-toastify';
import ArchiveModal from '../../common/ArchiveModal';
import SuccessPopUpModal from '../../common/successModal';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import ConfirmModal from '../../common/confirmModal';
import ConfirmationIcon from '../../../assets/images/confirmation-image.png';
import { upperCase } from 'lodash';

const BuildSchedule = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [searchText, setSearchText] = useState('');
  const [userData, setUserData] = useState();
  const [statusText, setStatusText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [archiveId, setArchiveId] = useState();
  const [flaggedValue, setflaggedValue] = useState(null);
  const [collectionOperationValue, setCollectionOperationValue] = useState([]);
  const [collectionOperationOptions, setCollectionOperations] = useState([]);
  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [dateValue, setDateValue] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [publishId, setPublishId] = useState();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPublishSuccessMessage, setShowPublishSuccessMessage] =
    useState(false);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'businessUnit_name',
      label: 'Collection Operations',
      width: '20%',
      sortable: true,
      checked: true,
    },
    {
      name: 'schedule_start_date',
      label: 'Start Date',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'schedule_end_date',
      label: 'End Date',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'totalOperations',
      label: 'Operations',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'fullyStaffed',
      label: 'Fully Staffed',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'schedule_schedule_status',
      label: 'Status',
      width: '10%',
      sortable: true,
      icon: false,
      checked: true,
    },
  ]);
  let inputTimer = null;

  const navigateWithQueryParam = (data, disableEdit = false) => {
    const queryParams = {
      schedule_id: data.schedule.schedule_id,
      schedule_status: data.schedule.schedule_schedule_status,
      collection_operation_id: data.schedule.businessUnit_id,
      disableEdit: disableEdit,
    };
    navigate({
      pathname: STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT, // Specify your path
      search: new URLSearchParams(queryParams).toString(),
    });
  };

  // Filter the Data based on the values
  const filteredResults = async (collectionOperationIds) => {
    const prepareColletionOperationIds = (data) => {
      return data.map((id) => 'collectionOperation=' + id).join('&');
    };

    const val = await fetchData(
      `/staffing-management/schedules?page=${currentPage}&limit=${limit}${
        flaggedValue !== null && flaggedValue.label !== 'All'
          ? flaggedValue.value !== null
            ? '&flagged=' + flaggedValue.value
            : setflaggedValue(null)
          : ''
      }${statusText !== null ? '&status=' + statusText.value : ''}${
        startDate !== null ? '&startDate=' + startDate : ''
      }${
        collectionOperationValue?.length !== 0
          ? '&' + prepareColletionOperationIds(collectionOperationIds)
          : []
      }${searchText !== null ? '&keyword=' + searchText : ''}${
        sortBy !== null ? '&sortBy=' + sortBy : ''
      }${sortOrder !== null ? '&sortOrder=' + sortOrder : ''}`
    );
    return val;
  };

  const editSchedule = async (rowData) => {
    try {
      const edited = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/staffing-management/schedules/${rowData?.schedule.schedule_id}/${userData?.id}`
      );
      return edited.json();
    } catch (error) {
      toast.error(`Failed to Edit Schedule: ${response?.statusText}`, {
        autoClose: 3000,
      });
    }
  };

  // Handles changes in Search Bar
  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

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

  const optionsForLockedSchedule = [
    {
      label: 'View',
      action: (rowData) => {
        navigateWithQueryParam(rowData, true);
      },
    },
    {
      label: 'Edit',
      action: async (rowData) => {
        let edited = editSchedule(rowData);
        edited
          .then((val) => {
            if (val.value !== 4) {
              navigateWithQueryParam(rowData);
            } else {
              toast.error(val.msg, {
                autoClose: 3000,
              });
            }
          })
          .catch((error) => {
            toast.error(error, {
              autoClose: 3000,
            });
          });
      },
    },
  ];

  const optionsForDraftStatus = [
    {
      label: 'Publish',
      action: (rowData) => {
        setShowPublishModal(true);
        setPublishId(rowData.schedule.schedule_id);
      },
    },
    {
      label: 'Edit',
      action: (rowData) => {
        let edited = editSchedule(rowData);
        edited
          .then((val) => {
            if (val.value !== 4) {
              navigateWithQueryParam(rowData);
            } else {
              toast.error(val.msg, {
                autoClose: 3000,
              });
            }
          })
          .catch((error) => {
            toast.error(error, {
              autoClose: 3000,
            });
          });
      },
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setShowArchiveModal(true);
        setArchiveId(rowData.schedule.schedule_id);
      },
    },
  ];

  const optionsForFlaggedDraftStatus = [
    {
      label: 'Edit',
      action: (rowData) => {
        let edited = editSchedule(rowData);
        edited
          .then((val) => {
            if (val.value !== 4) {
              navigateWithQueryParam(rowData);
            } else {
              toast.error(val.msg, {
                autoClose: 3000,
              });
            }
          })
          .catch((error) => {
            toast.error(error, {
              autoClose: 3000,
            });
          });
      },
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setShowArchiveModal(true);
        setArchiveId(rowData.schedule.schedule_id);
      },
    },
  ];

  const optionsForPublishedStatus = [
    {
      label: 'Edit',
      action: (rowData) => {
        let edited = editSchedule(rowData);
        edited
          .then((val) => {
            if (val.value !== 4) {
              navigateWithQueryParam(rowData);
            } else {
              toast.error(val.msg, {
                autoClose: 3000,
              });
            }
          })
          .catch((error) => {
            toast.error(error, {
              autoClose: 3000,
            });
          });
      },
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setShowArchiveModal(true);
        setArchiveId(rowData.schedule.schedule_id);
      },
    },
  ];

  const onArchiveCancel = () => {
    setShowArchiveModal(false);
  };

  const handleConfirmationResultArchive = async (confirmed) => {
    setShowArchiveModal(false);
    if (confirmed) {
      try {
        const response = await makeAuthorizedApiRequest(
          'PATCH',
          `${BASE_URL}/staffing-management/schedules/archive/${userData?.id}/${archiveId}`
        );
        if (response?.status === 200) {
          const data = filteredResults();
          data
            .then((val) => {
              setRows(val.data);
              setTotalRecords(val?.count);
              setIsLoading(false);
            })
            .catch((error) => setIsLoading(false));
          setShowSuccessMessage(true);
        } else {
          toast.error(`Failed to Archive Schedule: ${response?.statusText}`, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`Failed to Archive Schedule: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setStartDate(new Date(date.setDate(date.getDate() + 1)).toISOString());
      setDateValue(
        new Date(new Date(date.setDate(date.getDate() - 1)).toISOString())
      );
    } else {
      setStartDate(null);
      setDateValue(null);
    }
  };

  const handleCollectionOperationChange = (data) => {
    setCollectionOperationValue((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  const handlePublish = async () => {
    // Publish schedule
    try {
      const response = await fetchData(
        `/staffing-management/schedules/publish/schedule/${publishId}`,
        'PATCH',
        {
          // operations: operations,
        }
      );
      if (response?.status_code === 200) {
        const data = filteredResults();
        data
          .then((val) => {
            setRows(val.data);
            setTotalRecords(val?.count);
            setIsLoading(false);
          })
          .catch((error) => setIsLoading(false));
        setShowPublishModal(false);
        setShowPublishSuccessMessage(true);
      } else {
        toast.error(`Failed to Publish Schedule: ${response?.statusText}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to Publish Schedule: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  // Get Collection Operations from DB
  useEffect(() => {
    const getUser = async () => {
      try {
        const accessToken = localStorage.getItem('token');
        const userName = localStorage.getItem('user_name');
        const result = await fetchData(`/tenant-users?keyword=${userName}`);
        if (result?.data) {
          setUserData({
            id: result?.data[0].id,
            name: `${result?.data[0].first_name} ${result?.data[0].last_name}`,
          });
        }
      } catch (error) {
        toast.error(`Error fetching assignee users: ${error}`, {
          autoClose: 3000,
        });
      }
    };
    const getCollectionOperation = async () => {
      try {
        const units = await fetchData(`/business_units`);
        if (units?.data) {
          setCollectionOperations(units.data);
        }
      } catch (error) {
        toast.error(`Failed to fetch Collection Operations: ${error}`, {
          autoClose: 3000,
        });
      }
    };

    const data = filteredResults();
    data
      .then((val) => {
        setRows(val.data);
        setTotalRecords(val?.count);
        setIsLoading(false);
      })
      .catch((error) => setIsLoading(false));

    getUser();
    getCollectionOperation();
  }, [BASE_URL]);

  // Fetches data from server
  useEffect(() => {
    clearTimeout(inputTimer);
    if (searchText.length >= 2 || searchText === '') {
      setIsLoading(true);
      const collectionOperationIds = collectionOperationValue.map(
        (option) => option.id
      );
      const data = filteredResults(collectionOperationIds);
      data
        .then((val) => {
          setRows(val.data);
          setTotalRecords(val?.count);
          setIsLoading(false);
        })
        .catch((error) => setIsLoading(false));
    }
  }, [
    flaggedValue,
    collectionOperationValue,
    statusText,
    startDate,
    currentPage,
    limit,
    searchText,
    sortBy,
    sortOrder,
  ]);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BuildSchduleBreadCrumbData}
        BreadCrumbsTitle={'Build Schedules'}
        SearchPlaceholder="Search"
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filter">
            <form className="d-flex justify-content-end flex-wrap">
              <div className="dropdown mt-2 mb-2">
                <SelectDropdown
                  label="Flagged"
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                    { label: 'All', value: null },
                  ]}
                  selectedValue={flaggedValue}
                  onChange={(val) => {
                    setflaggedValue(val);
                  }}
                  removeDivider
                  showLabel
                  placeholder="Flagged"
                />
              </div>
              <div className="dropdown mt-2 mb-2">
                <GlobalMultiSelect
                  label="Collection Operation"
                  data={
                    collectionOperationOptions?.length
                      ? collectionOperationOptions.map((item) => ({
                          name: item?.name,
                          id: item?.id,
                        }))
                      : []
                  }
                  selectedOptions={collectionOperationValue}
                  onChange={(val) => {
                    handleCollectionOperationChange(val);
                  }}
                  onSelectAll={(data) => setCollectionOperationValue(data)}
                />
              </div>
              <div className="dropdown mt-2 mb-2">
                <SelectDropdown
                  label="Status"
                  options={[
                    { label: 'Draft', value: 'Draft' },
                    { label: 'Published', value: 'Published' },
                  ]}
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
                  dateFormat="MM/dd/yyyy"
                  className={`custom-datepicker ${styles.datepicker}`}
                  placeholderText="Start Date*"
                  selected={dateValue}
                  isClearable={true}
                  onChange={(date) => {
                    handleDateChange(date);
                  }}
                  clearButtonClassName={styles.datePickerCloseIconStyles}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <div className="button-icon">
          <div className="buttons">
            <div className="buttons">
              <button
                style={{
                  minHeight: '0px',
                  padding: '12px 32px 12px 32px',
                }}
                className="btn btn-primary"
                onClick={() =>
                  navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.CREATE)
                }
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
        <BuildScheduleTableList
          isLoading={isLoading}
          userData={userData}
          data={rows}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          optionsForLockedSchedule={optionsForLockedSchedule}
          optionsForDraftStatus={optionsForDraftStatus}
          optionsForFlaggedDraftStatus={optionsForFlaggedDraftStatus}
          optionsForPublishedStatus={optionsForPublishedStatus}
          setTableHeaders={setTableHeaders}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        <ArchiveModal
          showConfirmation={showArchiveModal}
          onCancel={() => onArchiveCancel()}
          onConfirm={() => handleConfirmationResultArchive(true)}
          heading={'Confirmation'}
          description={'Are you sure you want to Archive?'}
          cancelBtnText="No"
          confirmBtnText="Yes"
          disabled={false}
        />
        <SuccessPopUpModal
          title="Success!"
          message={'Schedule Archived.'}
          modalPopUp={showSuccessMessage}
          showActionBtns={true}
          isArchived={false}
          setModalPopUp={setShowSuccessMessage}
          isNavigate={false}
        />
        <ConfirmModal
          showConfirmation={showPublishModal}
          onCancel={() => setShowPublishModal(false)}
          onConfirm={() => handlePublish()}
          icon={ConfirmationIcon}
          heading={'Confirmation'}
          description={'Are you sure want to publish this Draft?'}
        />
        <SuccessPopUpModal
          title="Success!"
          message={'Schedule Published.'}
          modalPopUp={showPublishSuccessMessage}
          showActionBtns={true}
          isArchived={false}
          setModalPopUp={setShowPublishSuccessMessage}
          isNavigate={false}
        />
      </div>
    </div>
  );
};
export default BuildSchedule;
