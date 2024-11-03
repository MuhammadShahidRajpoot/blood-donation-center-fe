import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import { TelerequirementsBreadCrumbsData } from './TelerequirementsBreadCrumbsData';
import NavTabs from '../../../common/navTabs';
import TelerecruitmentFilters from './telerequirementsFilters/TelerecruitmentFilter';
import TableList from '../../../common/tableListing';
import Pagination from '../../../common/pagination';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';

import styles from './telerecruitments.module.scss';

//import { API } from '../../../../api/api-routes';

const TelerequirementsList = () => {
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
      name: 'account_name',
      label: 'Account',
      width: '25%',
      sortable: true,
    },
    {
      name: 'location_name',
      label: 'Location',
      width: '15%',
      sortable: true,
    },
    {
      name: 'date',
      label: 'Drive Date',
      width: '15%',
      sortable: true,
    },

    {
      name: 'shift_hours',
      label: 'Hours',
      width: '10%',
      sortable: true,
    },
    {
      name: 'projection',
      label: 'Projection(s)',
      width: '15%',
      sortable: true,
    },
    {
      name: 'drive_status',
      label: 'Drive Status',
      width: '10%',
      type: 'status',
      sortable: true,
    },
    {
      name: 'job_status',
      label: 'Job Status',
      width: '10%',
      type: 'status',
      sortable: true,
    },
    {
      type: 'custom-component',
      showInHeader: true,
      component: (data) => {
        return (
          <button
            // to={CALL_CENTER_CALL_SCHEDULE_TELLEREQUIREMENT.CREATE}
            className={`${styles.buttonCreate}`}
            type="button"
            onClick={() => createJobs(data)}
            disabled={IsCreateDisabled(data)}
          >
            Create Job
          </button>
        );
      },
    },
    {
      showInHeader: true,
      type: 'custom-component',
      component: (data) => {
        return (
          <button
            onClick={() => acceptOrDecline(data)}
            className={`${
              data && data.job_status === 'declined'
                ? styles.buttonAccept
                : styles.buttonDecline
            }`}
            type="button"
            disabled={isAcceptOrDeclineDisabled(data)}
          >
            {`${data && data.job_status === 'declined' ? 'Accept' : 'Decline'}`}
          </button>
        );
      },
    },
  ];

  const statusClassMapping = {
    //Job statuses
    pending: 'Yellow',
    declined: 'Red',
    created: 'Green',
    cancelled: 'inactive',
    //Job statuses

    //Drive statuses
    confirmed: 'Green',
    tentative: 'Blue',
    //Drive statuses
  };
  const colorLables = {
    //Job statuses
    pending: 'Pending',
    declined: 'Decline',
    created: 'Created',
    cancelled: 'Cancelled',
    //Job statuses

    //Drive statuses
    confirmed: 'Confirmed',
    tentative: 'Tentative',
    //Drive statuses
  };
  const location = useLocation();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const currentLocation = location.pathname;
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [checkedItems, setCheckedItems] = useState([]);
  const [savedFilters, setSavedFilters] = useState({});

  const IsCreateDisabled = (data) => {
    if (data) {
      if (data.job_status === 'created' || data.job_status === 'declined') {
        return true;
      }
    } else {
      if (checkedItems.length === 0) {
        return true;
      } else {
        let disabled = false;
        rows
          .filter((data) => checkedItems.includes(data.id))
          .forEach((data) => {
            if (IsCreateDisabled(data)) {
              disabled = true;
            }
          });
        return disabled;
      }
    }

    return false;
  };

  const isAcceptOrDeclineDisabled = (data) => {
    if (data) {
      if (data.job_status === 'created') {
        return true;
      }
    } else {
      if (checkedItems.length === 0) {
        return true;
      } else {
        let disabled = false;
        rows
          .filter((data) => checkedItems.includes(data.id))
          .forEach((data) => {
            if (
              data.job_status === 'declined' ||
              isAcceptOrDeclineDisabled(data)
            ) {
              disabled = true;
            }
          });
        return disabled;
      }
    }

    return false;
  };

  const createJobs = (data) => {
    if (data) {
      navigate(`create/${data.id}`);
    } else {
      navigate(`create/${checkedItems.join(',')}`);
    }
  };

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
        //status: getValueIfObject(filter?.status) || '',
        search: searchText,
        start_date: filter?.start_date
          ? moment(filter.start_date).format('YYYY-MM-DD')
          : '',
        end_date: filter?.end_date
          ? moment(filter?.end_date).format('YYYY-MM-DD')
          : '',
        collection_operation_id: filter?.collection_operation
          ? filter?.collection_operation.join(',')
          : '',
        drive_status: filter?.drive_status
          ? getValueIfObject(filter?.drive_status)
          : '',
        job_status: filter?.job_status
          ? getValueIfObject(filter?.job_status)
          : '',

        page: currentPage,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const url = `${BASE_URL}/call-center/telerecruitment-requests?${new URLSearchParams(
        queryParams
      )}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const { data, record_count } = response.data;
      const rows = data.map((value) => {
        return {
          ...value,
          date: value.drive_date,
          shift_hours: `${formatDateWithTZ(
            value.start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(value.end_time, 'hh:mm a')}`,
        };
      });

      setRows(rows);
      setIsLoading(false);
      setTotalRecords(record_count);
    } catch (error) {
      toast.error(error);
      setIsLoading(false);
    }
  };

  const acceptOrDecline = async (data) => {
    if (data) {
      const url = `${BASE_URL}/call-center/telerecruitment-requests/${
        data.job_status === 'declined' ? 'accept' : 'decline'
      }/${data.id}`;

      await axios.put(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
    } else {
      rows
        .filter((data) => checkedItems.includes(data.id))
        .forEach((data) => acceptOrDecline(data));
    }

    fetchAllFilters();
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
        BreadCrumbsData={TelerequirementsBreadCrumbsData}
        BreadCrumbsTitle={'Call Schedule'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="filterBar">
        <NavTabs tabs={Tabs} currentLocation={currentLocation} />
      </div>

      <div className="mainContentInner">
        <TelerecruitmentFilters
          setIsLoading={setIsLoading}
          fetchAllFilters={fetchAllFilters}
        />

        <TableList
          isLoading={isLoading}
          data={rows}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          statusClassMapping={statusClassMapping}
          showActionsLabel={false}
          listSectionName="Telerecruitment Data"
          colorLables={colorLables}
          checkboxValues={checkedItems}
          handleCheckboxValue={(row) => row.id}
          handleCheckbox={setCheckedItems}
          showAllCheckBoxListing={true}
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

export default TelerequirementsList;
