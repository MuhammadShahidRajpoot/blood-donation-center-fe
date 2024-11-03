import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import { CallJobsBreadCrumbsData } from './CallJobsBreadCrumbsData';
import NavTabs from '../../../common/navTabs';
import CallJobsFilters from './callJobsFilters/CallJobFilter';
import TableList from '../../../common/tableListing';
import Pagination from '../../../common/pagination';
import ConfirmationIcon from '../../../../assets/images/confirmation-image.png';
import AssignAgentsPopUpModal from './assign-agents/AssignAgents';
import { API } from '../../../../api/api-routes';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CallCenterPermissions from '../../../../enums/CallCenterPermissionsEnum';

const CallJobsList = () => {
  const Tabs = [
    {
      label: 'All Call Jobs',
      link: '/call-center/schedule/call-jobs',
    },
    {
      label: 'Call Center Requests',
      link: '/call-center/schedule/call-center-requests',
    },
  ];
  const tableHeaders = [
    {
      name: 'operationable_type',
      label: 'Job Type',
      sortBy: 'cjap.operationable_type',
      width: '10%',
      sortable: true,
    },
    {
      name: 'name',
      label: 'Name',
      width: '25%',
      sortable: true,
    },
    {
      name: 'job_start_date',
      label: 'Job Start Date',
      width: '10%',
      sortBy: 'cj.start_date',
      sortable: true,
    },
    {
      name: 'job_end_date',
      label: 'Job End Date',
      width: '10%',
      sortBy: 'cj.end_date',
      sortable: true,
    },
    {
      name: 'operation_date',
      label: 'Operation Date',
      sortBy: 'operation_date',
      width: '15%',
      sortable: true,
    },
    {
      name: 'job_size',
      label: 'Job Size',
      width: '10%',
      sortable: true,
    },
    {
      name: 'assigned_tos',
      label: 'Assigned To',
      width: '30%',
      maxWidth: '200px',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Status',
      width: '10%',
      sortable: true,
    },
  ];

  const statusClassMapping = {
    inactive: 'inactive',
    'in-progress': 'Blue',
    //'in-complete': 'Lavender',
    pending: 'Yellow',
    complete: 'Gray',
    cancelled: 'inactive',
    assigned: 'Green',
  };
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [callJobs, setCallJobs] = useState([]);
  const currentLocation = location.pathname;
  const [isAssignedModal, setIsAssignedModal] = useState(false);
  const [assignAgentsModalData, setAssignAgentsModalData] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [callJobRowData, setCalljobRowData] = useState({});
  const [savedFilters, setSavedFilters] = useState({});

  const fetchAllFilters = async (filter) => {
    setSavedFilters(filter);
    const getValueIfObject = (value) => {
      if (value && typeof value === 'object') {
        return value?.value;
      }
      return value;
    };

    try {
      setIsLoading(true);
      const queryParams = {
        status: getValueIfObject(filter?.status) || '',
        search: searchText,
        is_assigned: getValueIfObject(filter?.Assignation) || '',
        job_type: getValueIfObject(filter?.job_type) || '',
        start_date: filter?.start_date
          ? moment(filter.start_date).format('YYYY-MM-DD')
          : '',
        end_date: filter?.end_date
          ? moment(filter?.end_date).format('YYYY-MM-DD')
          : '',
        collection_operation_id: filter?.collection_operation
          ? filter?.collection_operation?.map((e) => e)
          : '',
        page: currentPage,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const url = `${BASE_URL}/call-center/call-jobs?${new URLSearchParams(
        queryParams
      )}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const { data, record_count } = response.data;
      setCallJobs(data);
      setIsLoading(false);
      setTotalRecords(record_count);
    } catch (error) {
      toast.error(error);
      setIsLoading(false);
    }
  };

  const handleDeactivatedCallJob = async () => {
    setConfirmationModal(false);
    const callJobId = callJobRowData?.id;
    try {
      const response =
        await API.callCenter.callJobs.deactivateCallJob(callJobId);
      const responseMsg = response.data.response;
      if (response.data.status == 'success') {
        fetchAllFilters();
        toast.success(`${responseMsg}`, {
          position: 'top-right',
        });
      } else if (response.data.status == 'error') {
        toast.error(`${responseMsg}`, {
          position: 'top-right',
        });
      }
    } catch (error) {
      console.log('Error in Call Job List : ', error);
    }
  };

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };
  const handleSort = (name) => {
    if (sortBy === name) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(name);
      setSortOrder('ASC');
    }
  };
  const optionsConfig = [
    CheckPermission([CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.READ]) && {
      label: 'View',
      path: (rowData) => `/call-center/schedule/call-jobs/${rowData.id}/view`,
      action: (rowData) => {},
    },
    CheckPermission([CallCenterPermissions.CALLCENTER.CALL_SCHEDULE.WRITE]) && {
      label: 'Edit',
      path: (rowData) => `/call-center/schedule/call-jobs/${rowData.id}/edit`,
      action: (rowData) => {},
      disabled: (rowData) =>
        rowData.status === 'inactive' || rowData.status === 'cancelled'
          ? true
          : false,
    },
    {
      label: 'Assign',
      action: (rowData) => {
        setAssignAgentsModalData(rowData);
        setIsAssignedModal(true);
      },
      disabled: (rowData) =>
        rowData.status === 'assigned' ||
        rowData.status === 'inactive' ||
        rowData.status === 'cancelled' ||
        rowData.status === 'in-progress',
    },
    {
      label: 'Deactivate',
      action: (rowData) => {
        setCalljobRowData(rowData);
        setConfirmationModal(true);
      },
      disabled: (rowData) =>
        rowData.status === 'inactive' || rowData.status === 'cancelled',
    },
  ].filter(Boolean);
  const colorLables = {
    'in-progress': 'In-Progress',
    //'in-complete': 'Incomplete',
    //scheduled: 'Scheduled',
    assigned: 'Assigned',
    cancelled: 'Cancelled',
    complete: 'Completed',
    pending: 'Pending',
    inactive: 'Inactive',
  };

  useEffect(() => {
    fetchAllFilters(savedFilters);
  }, [currentPage, limit, sortBy, sortOrder]);
  useEffect(() => {
    if (searchText.length >= 2 || searchText.length === 0) {
      fetchAllFilters(savedFilters);
    }
  }, [searchText]);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={CallJobsBreadCrumbsData}
        BreadCrumbsTitle={'Call Schedule'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="filterBar">
        <NavTabs tabs={Tabs} currentLocation={currentLocation} />
      </div>
      <div className="mainContentInner">
        <CallJobsFilters
          setIsLoading={setIsLoading}
          fetchAllFilters={fetchAllFilters}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
        <div className="button-icon">
          <button
            className="btn btn-primary"
            onClick={() => navigate('create')}
          >
            Create Call Job
          </button>
        </div>
        <TableList
          isLoading={isLoading}
          data={callJobs}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          statusClassMapping={statusClassMapping}
          showActionsLabel={false}
          listSectionName="Call Jobs Data"
          colorLables={colorLables}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        {isAssignedModal && (
          <AssignAgentsPopUpModal
            modalData={assignAgentsModalData}
            modalPopUp={isAssignedModal}
            setModalPopUp={setIsAssignedModal}
          />
        )}
      </div>
      <section
        className={`popup full-section ${confirmationModal ? 'active' : ''}`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img
              src={ConfirmationIcon}
              className="bg-white"
              alt="confirmation-image"
            />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>Are you sure you want to deactivate this call job</p>
            <div className="buttons">
              <button
                className="btn btn-md btn-secondary"
                style={{ color: '#387de5' }}
                onClick={() => setConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-primary"
                onClick={() => handleDeactivatedCallJob()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CallJobsList;
