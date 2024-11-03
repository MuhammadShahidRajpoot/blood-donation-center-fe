/* eslint-disable */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../common/topbar/index';
import ScheduleTable from './staff-schedule/ScheduleTable';
import { ViewScheduleBreadCrumbsData } from './ViewScheduleBreadCrumbsData';
import ViewScheduleFilters from './viewScheduleFilters/viewScheduleFilters';
import NavTabs from '../../common/navTabs';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import JsPDF from 'jspdf';
import exportImage from '../../../assets/images/exportImage.svg';
import styles from './viewScheduleFilters/index.scss';
import { Link } from 'react-router-dom';
import SvgComponent from '../../common/SvgComponent';
import { CSVLink } from 'react-csv';
import moment from 'moment';
import autoTable from 'jspdf-autotable';
import {
  extractTimeFromString,
  formatDateWithTZ,
} from '../../../helpers/convertDateTimeToTimezone';

let inputTimer = null;

function ViewSchedule() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortName, setSortName] = useState('staff_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState();
  const [filtersApplied, setFiltersApplied] = useState({});
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [downloadType, setDownloadType] = useState('PDF');
  const [exportType, setExportType] = useState('filtered');
  const [dataLength, setDataLength] = useState(0);
  const [csvFileName, setCsvFileName] = useState('');
  const [forceUpdateTimestamp, setForceUpdateTimestamp] = useState(Date.now());
  const limit = 25;
  let [tableHeaders] = useState([
    {
      id: 1,
      name: 'staff_name',
      label: 'Name',
      sortable: true,
      splitlabel: false,
    },
    {
      id: 2,
      name: 'total_hours',
      label: 'Total Hours',
      sortable: true,
      splitlabel: false,
    },
  ]);

  const Tabs = [
    {
      label: 'Staff Schedule',
      link: '/staffing-management/view-schedules/staff-schedule',
    },
    {
      label: 'Depart Schedule',
      link: '/staffing-management/view-schedules/depart-schedule',
    },
  ];
  const location = useLocation();
  const currentLocation = location.pathname;

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    clearTimeout(inputTimer);
    if (searchText.length >= 2 || searchText === '') {
      inputTimer = setTimeout(async () => {
        fetchAllData(filtersApplied);
      }, 500);
    }
  }, [searchText, sortName, sortOrder, currentPage]);

  useEffect(() => {
    if (tableHeaders.length <= 2) {
      setupDates(new Date());
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortName, sortOrder]);

  const setupDates = (setupDate) => {
    const startDate = new Date(setupDate);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - ((dayOfWeek + 6) % 7);
    const mondayDate = new Date(startDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      });
      const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // Getting the weekday name
      tableHeaders[i + 2] = {
        id: i + 3, // i = 0, at start there are 2 headers, so (i + 1 + 2) = i + 3
        name: weekdayName,
        date: formattedDate,
        label: weekdayName + ' ' + formattedDate,
        splitlabel: true,
      };
    }
  };

  const formatResponse = (data, currentDate) => {
    const formattedData = [];
    // 1. Map trough the entire response, get all staff ids without duplicates
    const uniqueStaffIds = Array.from(new Set(data.map((obj) => obj.staff_id)));
    // 2. For every unique staff_id, find all schedules and push to schedules array
    uniqueStaffIds.forEach((staff_id) => {
      const schedules = data.filter(
        (schedule) => schedule.staff_id === staff_id
      );
      const schedulesArr = [];
      /* 3. Loop trough schedules, and create a new JSON object 
      with fields which are different for every schedule of the same staff */
      schedules.forEach((element) => {
        let shiftDate = element?.date ? new Date(element?.date) : null;

        if (areInSameWeek(shiftDate, currentDate)) {
          schedulesArr.push({
            date: new Date(element?.date),
            role_name: element.role_name,
            operation_id: element.operation_id,
            operation_type: element.operation_type,
            shift_start_time: extractTimeFromString(
              formatDateWithTZ(element.shift_start_time)
            ),
            shift_end_time: extractTimeFromString(
              formatDateWithTZ(element.shift_end_time)
            ),
            depart_time: formatDate(element.depart_time),
            return_time: formatDate(element.return_time),
            account_name:
              element?.account_name?.length < 15
                ? element?.account_name
                : element?.account_name?.substring(0, 15) + '...',
            location_address:
              element?.location_address?.length < 15
                ? element?.location_address
                : element?.location_address?.substring(0, 15) + '...',
            vehicle_name: element.vehicle_name,
            is_on_leave: element.is_on_leave,
            created_at: element.created_at,
            created_by: element.created_by,
          });
        }
      });
      /* formattedData objects contain fields which are equal for every schedule of the same staff,
      plus the newly created schedules array, containing all schedules for that one staff.
      */
      if (schedulesArr.length === 0) return null;
      formattedData.push({
        id: staff_id,
        staff_name: schedules?.[0].staff_name,
        total_hours: schedules?.[0].total_hours,
        schedules: schedulesArr,
      });
    });
    return formattedData;
  };

  const fetchAllData = async (filters) => {
    // check length of previously fetched data - if it's less than limit, there is no more records to fetch
    if (currentPage !== 1 && dataLength < limit) {
      return;
    }
    if (currentPage === 1) {
      // only on initial fetch
      setIsLoading(true);
    }
    try {
      setFiltersApplied(filters);
      const params = {
        keyword: searchText || null,
        page: currentPage || null,
        limit: limit || null,
        staff_id: filters?.staff_ids || null,
        team_id: filters?.team_ids || null,
        collection_operation_id: filters?.collection_operation_ids || null,
        schedule_start_date:
          filters?.schedule_start_date != null &&
          filters?.schedule_start_date != ''
            ? moment(filters?.schedule_start_date).format('YYYY-MM-DD')
            : null,
        donor_id: Number(filters?.donor_center_ids) || null,
        schedule_status_id: filters?.status - 1, // 1 should be 0, and 2 should be 1. Check ScheduleStatusEnum
      };

      const urlParams = new URLSearchParams();
      urlParams.append('page', currentPage);
      urlParams.append('limit', limit);
      urlParams.append('sortName', sortName);
      urlParams.append('sortOrder', sortOrder);
      if (params.keyword !== null && params.keyword !== '') {
        urlParams.append('keyword', params.keyword);
      }
      if (params.staff_id !== null && params.staff_id !== undefined) {
        urlParams.append('staff_id', params.staff_id);
      }
      if (params.team_id !== null && params.team_id !== undefined) {
        urlParams.append('team_id', params.team_id);
      }
      if (
        params.collection_operation_id !== null &&
        params.collection_operation_id !== undefined
      ) {
        urlParams.append(
          'collection_operation_id',
          params.collection_operation_id
        );
      }
      if (
        params.schedule_start_date !== null &&
        params.schedule_start_date !== ''
      ) {
        urlParams.append('schedule_start_date', params.schedule_start_date);
      }
      if (params.donor_id !== null && params.donor_id !== undefined) {
        urlParams.append('donor_id', params.donor_id);
      }
      if (
        !isNaN(params.schedule_status_id) &&
        params.schedule_status_id >= 0 &&
        params.schedule_status_id !== null &&
        params.schedule_status_id !== undefined
      ) {
        urlParams.append('schedule_status_id', params.schedule_status_id);
      }

      let url = `${BASE_URL}/view-schedules/staff-schedules/search?${urlParams.toString()}`;

      const result = await makeAuthorizedApiRequest('GET', url);
      let { data } = await result.json();
      if (data) {
        setDataLength(data.length);
        const formattedResponse = formatResponse(
          data,
          filters?.schedule_start_date
            ? new Date(filters.schedule_start_date)
            : new Date()
        );

        if (filters?.schedule_start_date) {
          setupDates(new Date(filters?.schedule_start_date));
        } else if (filters?.schedule_start_date === '') {
          setupDates(new Date());
        }
        if (currentPage === 1 && limit === 25) {
          // initial fetch
          setRows(formattedResponse);
        } else {
          setRows((prevRows) => [...prevRows, ...formattedResponse]);
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    } finally {
      if (currentPage === 1) {
        setIsLoading(false);
      }
    }
    setFiltersApplied(filters);
  };

  function areInSameWeek(date1, date2) {
    if (date1 === null || date2 === null) return false;
    // Get the first day of the week for each date (adjust based on your desired week start)
    const firstDayOfWeek1 = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate() - (date1.getDay() ? date1.getDay() - 1 : 6)
    );
    const firstDayOfWeek2 = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate() - (date2.getDay() ? date2.getDay() - 1 : 6)
    );

    // Compare the first days of the week to determine if they fall within the same week
    return firstDayOfWeek1.getTime() === firstDayOfWeek2.getTime();
  }

  const handleSort = (column) => {
    if (column === 'staff_name') {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else {
        setSortOrder('ASC');
      }
    } else if (column === 'total_hours') {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else {
        setSortOrder('ASC');
      }
    }
    setSortName(column);
  };

  const generatePDF = async (csvPDFData) => {
    // Initialize jsPDF
    const doc = new JsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [400, 210],
    });

    const tableData = csvPDFData.map((row) => row.split(','));
    // Add content to the PDF
    doc.text('Staff Schedule', 10, 10);

    // Calculate the maximum column width for each column
    autoTable(doc, {
      head: [tableData[0]],
      body: tableData.slice(1),
      styles: {
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      margin: { left: 1, right: 1 },
      cellStyles: {
        valign: 'middle',
        halign: 'center',
      },
      columnStyles: { columnWidth: 'auto' },
      startY: 20,
    });

    let filename;

    const isEmpty = Object.keys(filtersApplied).length === 0;

    const firstKeyName = isEmpty ? null : Object.keys(filtersApplied)[0];
    if (!isEmpty) {
      filename = `${firstKeyName}_${getTimestampForFileName()}.pdf`;
    } else {
      filename = `Staff_Schedule_${getTimestampForFileName()}.pdf`;
    }

    // Save the PDF
    doc.save(filename);
  };

  function getTimestampForFileName() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return `${month}-${day}-${year}-${hours}-${minutes}-${seconds}`;
  }

  const removeComas = (prop) => {
    return prop !== null ? prop.replace(',', ';').replace(/\n/g, '') : prop;
  };

  const [csvData, setCsvData] = useState([]);
  const handleDownload = async () => {
    const csvPDFData = [
      'Staff Id,Name,Role,Total Hours,Date,Location,Shift Start Time, Shift End Time, Return Time, Depart Time, On Leave,Account Name, Vehicle Name',
    ];

    if (exportType === 'filtered' && downloadType === 'PDF') {
      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].schedules.length; j++) {
          let item = rows[i].schedules[j];
          csvPDFData.push(
            `${rows[i]?.id},${rows[i]?.staff_name},${item?.role_name || ''},${
              rows[i]?.total_hours || ''
            },${formatDateSingle(item?.date) || ''}, ${
              removeComas(item.location_address) || ''
            },${item.shift_start_time || ''},${item.shift_end_time || ''},${
              item.return_time || ''
            },${item.depart_time || ''},${
              item?.is_on_leave == null ? '' : item.is_on_leave
            },${item?.account_name || ''},${item.vehicle_name || ''}`
          );
        }
      }
      generatePDF(csvPDFData);
    }

    if (exportType === 'all' && downloadType === 'PDF') {
      const results = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/view-schedules/staff-schedules`
      );
      const data = await results.json();
      for (let i = 0; i < data?.data.length; i++) {
        const item = data?.data[i];
        csvPDFData.push(
          `${item?.staff_id},${item?.staff_name},${item?.role_name || ''},${
            item?.total_hours || ''
          },${formatDateSingle(item?.date) || ''}, ${
            removeComas(item.location_address) || ''
          },${formatDate(item.shift_start_time) || ''},${
            formatDate(item.shift_end_time) || ''
          },${formatDate(item.return_time) || ''},${
            formatDate(item.depart_time) || ''
          },${item?.is_on_leave == null ? '' : item.is_on_leave},${
            item?.account_name || ''
          },${item.vehicle_name || ''}`
        );
      }
      generatePDF(csvPDFData);
    }

    setShowExportDialogue(false);
  };

  useEffect(() => {
    setCsvData([]);
    setCsvFileName(`Staff_Schedule_${getTimestampForFileName()}.csv`);
    if (exportType === 'filtered' && downloadType === 'CSV') {
      const isEmpty = Object.keys(filtersApplied).length === 0;

      const firstKeyName = isEmpty ? null : Object.keys(filtersApplied)[0];
      if (!isEmpty && filtersApplied[firstKeyName] !== '') {
        setCsvFileName(`${firstKeyName}_${getTimestampForFileName()}.csv`);
      }
      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].schedules.length; j++) {
          let item = rows[i].schedules[j];
          setCsvData((prev) => [
            ...prev,
            {
              staff_id: rows[i]?.id,
              staff_name: rows[i]?.staff_name,
              role_name: item.role_name,
              total_hours: rows[i]?.total_hours,
              date: formatDateSingle(item.date),
              location: item.location_address,
              shift_start_time: item.shift_start_time,
              shift_end_time: item.shift_end_time,
              return_time: item.return_time,
              depart_time: item.depart_time,
              is_on_leave: item.is_on_leave,
              account_name: item.account_name,
              vehicle_name: item.vehicle_name,
            },
          ]);
        }
      }
    }

    if (exportType === 'all' && downloadType === 'CSV') {
      setAllCSVData();
    }
  }, [exportType, downloadType, forceUpdateTimestamp]);

  const setAllCSVData = async () => {
    setCsvData([]);

    let url = `${BASE_URL}/view-schedules/staff-schedules`;
    const results = await makeAuthorizedApiRequest('GET', url);
    const data = await results.json();
    data?.data?.map((item) => {
      setCsvData((prev) => [...prev, FormatItem(item)]);
    });
  };
  const headers = [
    { label: 'Staff Id', key: 'staff_id' },
    { label: 'Name', key: 'staff_name' },
    { label: 'Role', key: 'role_name' },
    { label: 'Total Hours', key: 'total_hours' },
    { label: 'Date', key: 'date' },
    { label: 'Location', key: 'location' },
    { label: 'Shift Start Time', key: 'shift_start_time' },
    { label: 'Shift End Time', key: 'shift_end_time' },
    { label: 'Return Time', key: 'return_time' },
    { label: 'Depart Time', key: 'depart_time' },
    { label: 'On Leave', key: 'is_on_leave' },
    { label: 'Account Name', key: 'account_name' },
    { label: 'Vehicle Name', key: 'vehicle_name' },
  ];

  function FormatItem(item) {
    return {
      staff_id: item.staff_id,
      staff_name: item.staff_name,
      role_name: item.role_name,
      total_hours: item.total_hours,
      date: formatDateSingle(item.date),
      location: item.location_address,
      shift_start_time: formatDate(
        extractTimeFromString(formatDateWithTZ(item.shift_start_time))
      ),
      shift_end_time: formatDate(
        extractTimeFromString(formatDateWithTZ(item.shift_end_time))
      ),
      return_time: formatDate(item.return_time),
      depart_time: formatDate(item.depart_time),
      is_on_leave: item.is_on_leave,
      account_name: item.account_name,
      vehicle_name: item.vehicle_name,
    };
  }

  function formatDateSingle(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={ViewScheduleBreadCrumbsData}
        BreadCrumbsTitle={'View Schedule'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="mainContentInner">
        <ViewScheduleFilters
          fetchAllFilters={fetchAllData}
          setIsLoading={setIsLoading}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          setCurrentPage={setCurrentPage}
          setFiltersApplied={setFiltersApplied}
        />
        <div className="filterBar px-0 py-0" style={{ position: 'relative' }}>
          <NavTabs tabs={Tabs} currentLocation={currentLocation} />
          <div
            className="dropdown-center"
            style={{ position: 'absolute', right: '8px', top: '8px' }}
          >
            <div
              className={`optionsIcon ${styles.pointer}`}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <SvgComponent name={'DownloadIcon'} /> Export Data
            </div>
            <ul className="dropdown-menu">
              <li>
                <Link
                  onClick={() => {
                    setShowExportDialogue(true);
                    setDownloadType('PDF');
                    setForceUpdateTimestamp(Date.now());
                  }}
                  className="dropdown-item"
                >
                  PDF
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowExportDialogue(true);
                    setDownloadType('CSV');
                    setForceUpdateTimestamp(Date.now());
                  }}
                >
                  CSV
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <ScheduleTable
          isLoading={isLoading}
          data={rows}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortName}
          sortOrder={sortOrder}
          setCurrentPage={setCurrentPage}
        />

        <section
          className={`exportData popup full-section ${
            showExportDialogue ? 'active' : ''
          }`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={exportImage} className="bg-white" alt="CancelIcon" />
            </div>
            <div className="content" style={{ overflow: 'hidden' }}>
              <h3>Export Data</h3>
              <p>
                Select one of the following options to download the{' '}
                {downloadType}
              </p>
              <div className="content-inner">
                <div className="radioChecks form-check">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'filtered'}
                    value={'filtered'}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                    className="form-check-input"
                  />
                  <label className="form-check-label">
                    <span className={styles.radio}>Filtered Results</span>
                  </label>
                </div>
                <div className="radioChecks form-check">
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === 'all'}
                    value={'all'}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                    className="form-check-input"
                  />
                  <label className="form-check-label">
                    <span className={styles.radio}>All Data</span>
                  </label>
                </div>
              </div>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExportDialogue(false)}
                >
                  Cancel
                </button>
                {downloadType === 'PDF' && (
                  <button className="btn btn-primary" onClick={handleDownload}>
                    Download
                  </button>
                )}

                {downloadType === 'CSV' && (
                  <CSVLink
                    className="btn btn-primary"
                    filename={csvFileName}
                    data={csvData}
                    headers={headers}
                    onClick={() => setShowExportDialogue(false)}
                  >
                    Download
                  </CSVLink>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ViewSchedule;
