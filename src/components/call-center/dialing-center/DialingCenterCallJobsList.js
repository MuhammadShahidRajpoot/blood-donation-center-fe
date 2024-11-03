import React, { useEffect, useState, useRef } from 'react';
//import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SelectDropdown from '../../common/selectDropdown';
import TableList from '../../common/tableListing';
import Pagination from '../../common/pagination';
import CheckPermission from '../../../helpers/CheckPermissions';
import { makeAuthorizedApiRequestAxios } from '../../../helpers/Api';
import SvgComponent from '../../common/SvgComponent';
import TopBar from '../../common/topbar/index';
import { DialingCenterCrumbsData } from './DialingCenterCrumbsData';
import DateRangeSelector from '../DateRangePicker/DateRangeSelector';
import moment from 'moment';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';
import jwt from 'jwt-decode';

const DialingCenterCallJobsList = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [callJobs, setCallJobs] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callJobStatus, setCallJobStatus] = useState(null);
  const [agentsOptions, setAgentsOptions] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [isReadOnlyAssignedToFilter, setIsReadOnlyAssignedToFilter] =
    useState(false);
  const [dates, setDates] = useState({
    start_date: null,
    end_date: null,
  });

  const statusClassMapping = {
    'in-progress': 'Blue',
    'in-complete': 'Lavender',
    complete: 'Gray',
    cancelled: 'inactive',
    scheduled: 'Green',
  };

  const colorLables = {
    'in-progress': 'In Progress',
    'in-complete': 'Incomplete',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
    complete: 'Completed',
  };

  const isFirstRender = useRef(true);

  const handleCallJobStatus = (value) => {
    setCallJobStatus(value);
  };

  const handleSelectedAgent = (value) => {
    setSelectedAgent(value);
  };

  const getCallJobs = async (path) => {
    let formatedStartDate = '';
    let formatedEndDate = '';
    if (dates.start_date != null && dates.end_date != null) {
      formatedStartDate = moment(dates.start_date).format('YYYY-MM-DD');
      formatedEndDate = moment(dates.end_date).format('YYYY-MM-DD');
    }

    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/dialing-center/${path}?limit=${limit}&page=${currentPage}${
          sortBy ? `&sortBy=${sortBy}` : ''
        }${sortOrder ? `&sortOrder=${sortOrder}` : ''}${
          callJobStatus ? `&status=${callJobStatus?.value}` : ''
        }${searchText ? `&name=${searchText}` : ''}${
          formatedStartDate ? `&start_date=${formatedStartDate}` : ''
        }${formatedEndDate ? `&end_date=${formatedEndDate}` : ''}${
          selectedAgent ? `&user_id=${selectedAgent?.value}` : ''
        }`
      );

      let resultData = result?.data.data;
      setCallJobs(resultData);
      setTotalRecords(result?.data?.call_jobs_count);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to fetch Call Jobs', {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  const getCallCenterAgents = async () => {
    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/agents`
      );
      const data = result.data;
      const agentsData = data.data || [];
      const agentsOptions = agentsData.map((agent) => ({
        label: agent.name,
        value: agent.user_id.toString(),
      }));
      setAgentsOptions(agentsOptions);
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to fetch Call Center Agents', {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      setLoggedUser(decodeToken);
    }
  }, []);

  useEffect(() => {
    getCallCenterAgents();
  }, []);

  useEffect(() => {
    if (agentsOptions && loggedUser) {
      if (loggedUser?.roles?.cc_role_name == 'agent') {
        const selectedAgentOption = agentsOptions.find(
          (option) => option.value === loggedUser.id
        );
        setSelectedAgent(selectedAgentOption);
        setIsReadOnlyAssignedToFilter(true);
      } else {
        setIsReadOnlyAssignedToFilter(false);
      }
    }
  }, [agentsOptions, loggedUser]);

  const fetchData = async () => {
    if (!loggedUser) return;
    if (selectedAgent) {
      if (loggedUser?.roles?.cc_role_name == 'agent') {
        getCallJobs('call-jobs/agent');
      } else {
        getCallJobs('call-jobs');
      }
    } else if (
      loggedUser?.roles?.cc_role_name == null ||
      loggedUser?.roles?.cc_role_name != 'agent'
    ) {
      getCallJobs('call-jobs');
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    limit,
    currentPage,
    callJobStatus,
    dates,
    sortBy,
    sortOrder,
    selectedAgent,
    loggedUser,
  ]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!searchText || searchText.length > 1) {
      fetchData();
    }
  }, [searchText]);

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

  const tableHeaders = [
    {
      name: 'job_start_date',
      label: 'Start Date',
      width: '7%',
      sortable: true,
    },
    {
      name: 'operationable_type',
      label: 'Job Type',
      width: '7%',
      sortable: true,
    },
    {
      name: 'name',
      label: 'Name',
      width: '15%',
      sortable: true,
    },
    {
      name: 'operation_date',
      label: 'Operation Date',
      width: '7%',
      sortable: true,
    },
    {
      name: 'operation_name',
      label: 'Operation',
      width: '20%',
      sortable: true,
    },
    {
      name: 'assignedto',
      label: 'Assigned To',
      width: '20%',
      sortable: true,
    },
    { name: 'status', label: 'Status', width: '5%', sortable: true },
    {
      name: 'job_progress',
      label: 'Job Progress',
      width: '15%',
      sortable: true,
    },
    {
      name: '',
      label: '',
      width: '20%',
      sortable: false,
    },
  ];

  const onSelectDate = (date) => {
    setDates({
      start_date: date.startDate,
      end_date: date.endDate,
    });
  };
  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const optionsConfig = [
    CheckPermission([CallCenterPermissions.CALLCENTER.DIALING_CENTER.READ]) && {
      label: 'Start Calling',
      path: (rowData) => {
        return `/call-center/dialing-center/call-jobs/${rowData.id}/start`;
      },
      action: (rowData) => {},
    },
  ].filter(Boolean);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={DialingCenterCrumbsData}
        BreadCrumbsTitle={'Dialing Center'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="filterInner pe-3">
          <h2>Filters</h2>

          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 w-100`}>
              <DateRangeSelector
                onSelectDate={onSelectDate}
                dateValues={{
                  startDate: dates?.start_date,
                  endDate: dates?.end_date,
                }}
              />
              <SelectDropdown
                placeholder={'Assigned To'}
                defaultValue={selectedAgent}
                selectedValue={selectedAgent}
                removeDivider
                showLabel
                onChange={(e) => handleSelectedAgent(e)}
                options={agentsOptions}
                disabled={isReadOnlyAssignedToFilter}
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={callJobStatus}
                selectedValue={callJobStatus}
                removeDivider
                showLabel
                onChange={handleCallJobStatus}
                options={[
                  { label: 'Scheduled', value: 'scheduled' },
                  { label: 'In Progress', value: 'in-progress' },
                  { label: 'Incomplete', value: 'in-complete' },
                  { label: 'Completed', value: 'complete' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
              />
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <TableList
          isLoading={isLoading}
          data={callJobs}
          headers={tableHeaders}
          handleSort={handleSort}
          sortOrder={sortOrder}
          listSectionName={callJobs?.length < 1 ? 'Call Jobs Data' : 'Data'}
          statusClassMapping={statusClassMapping}
          showActionsLabel={false}
          optionsConfig={optionsConfig}
          colorLables={colorLables}
        />

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
};

export default DialingCenterCallJobsList;
