import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Pagination from '../pagination';
import TableList from '../tableListing';
import SuccessPopUpModal from '../successModal';
import SelectDropdown from '../selectDropdown';
import { toast } from 'react-toastify';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import SvgComponent from '../SvgComponent';
import TopBar from '../../common/topbar/index';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

const ListTask = ({
  taskableType = null,
  taskableId = null,
  createTaskUrl,
  customTopBar,
  hideAssociatedWith,
  breadCrumbsData,
  tasksNotGeneric,
  calendarIconShowHeader,
  show = true,
  hideToBar = false,
  searchKeyword,
}) => {
  const [taskListData, setTaskListData] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [getData, setGetData] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [dueDateDataText, setDueDateDataText] = useState(null);
  const [associatedWithDataText, setAssociatedWithDataText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [modalPopUp, setModalPopUp] = useState(false);
  const [archiveID, setArchiveID] = useState('');
  const [dueDateFilterData, setDueDateFilterData] = useState('');
  const [associateWithFilterData, setAssociateWithFilterData] = useState('');
  const [archiveStatus, setArchiveStatus] = useState(false);
  const [status, setStatus] = useState([]);
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const statusData = [
    {
      id: 4,
      status: 'Completed',
      value: '4',
      className: 'badge active',
    },
    {
      id: 5,
      status: 'Cancelled',
      value: '5',
      className: 'badge inactive',
    },
    {
      id: 3,
      status: 'Deferred',
      value: '3',
      className: 'badge Blue',
    },
    {
      id: 2,
      status: 'In Process',
      value: '2',
      className: 'badge Yellow',
    },
    {
      id: 1,
      status: 'Not Started',
      value: '1',
      className: 'badge Grey',
    },
  ];
  const associatedWithOptions = useMemo(() => {
    const associatedWithOptions = [
      { label: 'Account', value: PolymorphicType.CRM_ACCOUNTS },
      {
        label: 'CRM Location',
        value: PolymorphicType.CRM_LOCATIONS,
      },
      { label: 'Staff', value: PolymorphicType.CRM_CONTACTS_STAFF },
      {
        label: 'Volunteer',
        value: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
      },
      { label: 'Donor', value: PolymorphicType.CRM_CONTACTS_DONORS },
      {
        label: 'Donor Center',
        value: PolymorphicType.CRM_DONOR_CENTERS,
      },
      {
        label: 'Non-Collection Profile',
        value: PolymorphicType.CRM_NON_COLLECTION_PROFILES,
      },
      {
        label: 'Session',
        value: PolymorphicType.OC_OPERATIONS_SESSIONS,
      },
      {
        label: 'NCE',
        value: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
      },
      {
        label: 'Drives',
        value: PolymorphicType.OC_OPERATIONS_DRIVES,
      },
    ];
    return associatedWithOptions;
  }, []);

  useEffect(() => {
    setSearch(searchKeyword);
  }, [searchKeyword]);
  useEffect(() => {
    if (search?.length > 1) {
      setSearched(true);
      setCurrentPage(1);
      getDataList();
    }
    if (search?.length <= 1 && searched) {
      setCurrentPage(1);
      getDataList();
      setSearched(false);
    }
  }, [search]);
  const getDataList = async () => {
    setIsLoading(true);
    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const accessToken = localStorage.getItem('token');
      let searchK =
        search?.length > 1
          ? search
          : searchKeyword?.length > 1
          ? searchKeyword
          : '';
      let statusValues = '';
      if (status?.length > 0)
        statusValues = status?.map((op) => op?.value).join(',');

      const result = await fetch(
        `${BASE_URL}/tasks?limit=${limit}&page=${currentPage}${
          sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder}` : ''
        }${statusValues ? `&status=${statusValues}` : ''}${
          associateWithFilterData
            ? `&taskable_type=${associateWithFilterData}`
            : ''
        }${
          taskableType && taskableId
            ? `&taskable_type=${taskableType}&taskable_id=${taskableId}`
            : ''
        }${dueDateFilterData ? `&due_date=${dueDateFilterData}` : ''}${
          searchK ? `&task_name=${searchK}` : ''
        }`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await result.json();
      const updatedTaskListData = data?.data?.map((task) => {
        const statusOptionItem = statusData?.find(
          (option) => option.id === task.status
        );
        const associateWithItem = associatedWithOptions?.find((option) =>
          option.value !== null ? option.value === task.taskable_type : ''
        );
        return {
          ...task,
          status: statusOptionItem ? statusOptionItem?.status : '',
          className: statusOptionItem ? statusOptionItem?.className : '',
          taskable_type: associateWithItem ? associateWithItem?.label : 'N/A',
          taskable_name: task.taskable_name,
        };
      });
      setTaskListData(updatedTaskListData);
      if (!(updatedTaskListData?.length > 0) && currentPage > 1) {
        setCurrentPage(1);
      }
      setTotalRecords(data?.total_records);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDataList();
    return () => {
      setGetData(false);
    };
  }, [
    currentPage,
    limit,
    associateWithFilterData,
    taskableType,
    taskableId,
    dueDateFilterData,
    getData,
    sortBy,
    sortOrder,
    associatedWithOptions,
    status,
  ]);

  const handleArchive = async () => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    if (archiveID) {
      const accessToken = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/tasks/archive/${archiveID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${accessToken}`,
        },
      });
      let data = await response.json();
      if (data.status === 'success') {
        setArchiveStatus(true);
        setGetData(true);
      } else {
        toast.error('Failed to Archive Task.');
      }
      setModalPopUp(false);
    }
  };

  const dueDateOptions = [
    {
      label: 'Due This Week',
      value: '3',
    },
    {
      label: 'Due Next Week',
      value: '4',
    },
    {
      label: 'Past Due',
      value: '2', // Added comma here
    },
  ];

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortBy(columnName);
      setSortOrder('DESC');
    }
  };

  const handleStatus = (data) => {
    setCurrentPage(1);
    setStatus((prevSelected) =>
      prevSelected.some((item) => item.id === data.id)
        ? prevSelected.filter((item) => item.id !== data.id)
        : [...prevSelected, data]
    );
  };

  const handleDueDates = (value) => {
    if (value !== null) {
      setDueDateFilterData(value?.value);
      setDueDateDataText(value);
    } else {
      setDueDateFilterData('');
      setDueDateDataText(value);
    }
  };

  const handleAssociatedWith = (value) => {
    if (value !== null) {
      setAssociatedWithDataText(value);
      setAssociateWithFilterData(value?.value);
    } else {
      setAssociateWithFilterData('');
      setAssociatedWithDataText(value);
    }
  };

  const optionsConfig = [
    {
      label: 'View',
      path: (rowData) => `${location.pathname}/${rowData.id}/view`,
    },
    {
      label: 'Edit',
      path: (rowData) => `${location.pathname}/${rowData.id}/edit`,
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setModalPopUp(true);
        setArchiveID(rowData.id);
      },
    },
  ];

  const tableHeaders = [
    {
      name: 'assigned_to',
      label: 'Assigned To',
      width: '17.5%',
      sortable: true,
    },
    {
      name: 'assigned_by',
      label: 'Assigned By',
      width: '17.5%',
      sortable: true,
    },
    { name: 'task_name', label: 'Task Name', width: '20%', sortable: true },
    {
      name: 'description',
      label: 'Description',
      width: '20%',
      sortable: true,
    },
    {
      name: 'due_date',
      label: 'Due Date',
      width: '10%',
      sortable: true,
      icon: calendarIconShowHeader ? true : false,
    },
    { name: 'status', label: 'Status', width: '10%', sortable: true },
  ];

  const tableHeadersGeneric = [
    { name: 'task_name', label: 'Task Name', width: '15%', sortable: true },
    {
      name: 'description',
      label: 'Description',
      width: '20%',
      sortable: true,
    },
    {
      name: 'taskable_type',
      label: 'Associated With',
      width: '15%',
      sortable: true,
    },
    {
      name: 'taskable_name',
      label: 'Reference',
      width: '10%',
    },
    {
      name: 'assigned_by',
      label: 'Assigned By',
      width: '20%',
      sortable: true,
    },
    {
      name: 'due_date',
      label: 'Due Date',
      width: '10%',
      sortable: true,
      icon: true,
    },
    { name: 'status', label: 'Status', width: '10%', sortable: true },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };
  const searchFieldChange = (e) => {
    setSearch(e.target.value);
  };
  return (
    <div className="mainContent">
      {!hideToBar && (
        <TopBar
          BreadCrumbsData={breadCrumbsData}
          BreadCrumbsTitle={'Task'}
          SearchValue={search}
          SearchOnChange={searchFieldChange}
          SearchPlaceholder={'Search'}
        />
      )}
      {!hideToBar && customTopBar && customTopBar}
      <div className="filterBar">
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
                label="Due Date"
                options={dueDateOptions}
                selectedValue={dueDateDataText}
                onChange={(val) => {
                  handleDueDates(val);
                }}
                removeDivider
                showLabel
                placeholder="Due Date"
              />
              {(taskableId && taskableType) || hideAssociatedWith ? (
                ''
              ) : (
                <SelectDropdown
                  label="Associate With"
                  options={associatedWithOptions}
                  selectedValue={associatedWithDataText}
                  onChange={(val) => {
                    handleAssociatedWith(val);
                  }}
                  removeDivider
                  showLabel
                  placeholder="Associate With"
                />
              )}
              <GlobalMultiSelect
                className="mr-3"
                styles="margin-right: 15px"
                label="Status"
                data={statusData.map((item) => {
                  return {
                    name: item.status,
                    value: item.value,
                    id: item.id,
                  };
                })}
                selectedOptions={status}
                onChange={handleStatus}
                onSelectAll={(data) => setStatus(data)}
              />
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <div className="buttons">
          <button
            style={{
              minHeight: '0px',
              padding: '12px 32px 12px 32px',
            }}
            className="btn btn-primary"
            onClick={() => navigate(createTaskUrl)}
          >
            Add Task
          </button>
        </div>
        <TableList
          isLoading={isLoading}
          data={taskListData}
          hideActionTitle={true}
          headers={
            (taskableType && taskableId) || tasksNotGeneric
              ? tableHeaders
              : tableHeadersGeneric
          }
          // headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure you want to archive?'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Task is archived.'}
        modalPopUp={archiveStatus}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setArchiveStatus}
      />
    </div>
  );
};

export default ListTask;
