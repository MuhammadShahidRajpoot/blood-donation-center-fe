import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import { ViewScheduleBreadCrumbsData } from '../ViewScheduleBreadCrumbsData';
import ViewScheduleFilters from '../viewScheduleFilters/viewScheduleFilters';
import NavTabs from '../../../common/navTabs';
import DepartScheduleTable from './DepartScheduleTable';
import SvgComponent from '../../../common/SvgComponent';
import styles from '../../index.module.scss';
import exportImage from '../../../../assets/images/exportImage.svg';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import moment from 'moment';
import autoTable from 'jspdf-autotable';

let inputTimer = null;

function ViewDepartSchedule() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [currentPage, setCurrentPage] = useState(1);
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

  const [headers] = useState([]);

  const csvHeaders = [
    { label: 'Depart Id', key: 'DepartId' },
    { label: 'Account Name', key: 'AccountName' },
    { label: 'Location Name', key: 'LocationName' },
    { label: 'Location Address', key: 'LocationAddress' },
    { label: 'Procedure Shifts', key: 'ProcedureShifts' },
    { label: 'Product Shifts', key: 'ProductShifts' },
    { label: 'Date', key: 'Date' },
    { label: 'Shift Start Time', key: 'ShiftStartTime' },
    { label: 'Shift End Time', key: 'ShiftEndTime' },
    { label: 'Vehicles', key: 'Vehicles' },
    { label: 'Depart Time', key: 'DepartTime' },
    { label: 'Return Time', key: 'ReturnTime' },
    { label: 'Staff Required', key: 'StaffRequired' },
    { label: 'Staff Available', key: 'StaffAvailable' },
    { label: 'OEF', key: 'OEF' },
    { label: 'Staff With Roles', key: 'StaffWithRoles' },
  ];

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
    if (searchText.length >= 2) {
      inputTimer = setTimeout(async () => {
        fetchAllData(filtersApplied);
      }, 500);
    } else if (searchText === '') {
      inputTimer = setTimeout(async () => {
        fetchAllData(filtersApplied);
      }, 500);
    }
  }, [searchText, currentPage]);

  const fetchAllData = async (filters) => {
    // check length of previously fetched data - if it's less than limit, there is no more records to fetch
    if (currentPage !== 1 && dataLength < limit) {
      return;
    }
    if (currentPage === 1) {
      // only on initial fetch
      setIsLoading(true);
    }
    getFormattedDates(
      filters?.schedule_start_date
        ? new Date(filters.schedule_start_date)
        : new Date()
    );
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
            ? moment(filters?.schedule_start_date).format('MM-DD-YYYY')
            : null,
        donor_id: Number(filters?.donor_center_ids) || null,
        schedule_status_id: filters?.status - 1, // 1 should be 0, and 2 should be 1. Check ScheduleStatusEnum
      };

      const urlParams = new URLSearchParams();
      urlParams.append('page', currentPage);
      urlParams.append('limit', limit);
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
      urlParams.append('export_all_data', 'false');
      let url = `${BASE_URL}/view-schedules/departure-schedules/search?${urlParams.toString()}`;

      const result = await makeAuthorizedApiRequest('GET', url);

      const { data } = await result.json();
      if (data) {
        setDataLength(data.length);

        if (currentPage === 1 && limit === 25) {
          // initial fetch
          setRows(data);
        } else {
          setRows((prevRows) => [...prevRows, ...data]);
        }
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    } finally {
      if (currentPage === 1) {
        setIsLoading(false);
      }
    }
  };

  const generatePDF = async (csvPDFData) => {
    // Initialize jsPDF

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [400, 210],
    });

    const tableData = csvPDFData.map((row) => row.split(','));
    // Add content to the PDF
    doc.text('Depart Schedule', 10, 10);
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
      filename = `Depart_Schedule_${getTimestampForFileName()}.pdf`;
    }

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
    return prop !== null ? prop.replace(',', ';').replace(/\n/g, '') : '';
  };

  const handleDownload = async () => {
    const csvPDFData = [
      'Depart Id,Account Name,Location Name,Location Address,Procedure Shifts,Product Shifts,Date,Shift Start Time,Shift End Time,Vehicles,Depart Time,Return Time,Staff Required,' +
        'Staff Available,OEF,Staff With Roles',
    ];
    if (exportType === 'filtered' && downloadType === 'PDF') {
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        csvPDFData.push(
          `${item.id},${item.account_name},${item.location_name},${removeComas(
            item.location_address
          )},${item.sum_of_procedure_shifts || ''},${
            item.sum_of_product_shifts || ''
          },${item.date},${item.shift_start_time},${removeComas(
            item.shift_end_time
          )},${removeComas(item.vehicles)},${item.depart_time},${
            item.return_time
          },${item.staff_requested},${item.staff_assigned},${
            item.oef || ''
          },${removeComas(item.staff_with_roles)}`
        );
      }
      generatePDF(csvPDFData);
    }

    if (exportType === 'all' && downloadType === 'PDF') {
      const results = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/view-schedules/departure-schedules/search?export_all_data=true`
      );
      const data = await results.json();
      for (let i = 0; i < data.data.length; i++) {
        let item = data.data[i];
        csvPDFData.push(
          `${item.id},${item.account_name},${item.location_name},${removeComas(
            item.location_address
          )},${item.sum_of_procedure_shifts || ''},${
            item.sum_of_product_shifts || ''
          },${item.date},${item.shift_start_time},${removeComas(
            item.shift_end_time
          )},${removeComas(item.vehicles)},${item.depart_time},${
            item.return_time
          },${item.staff_requested},${item.staff_assigned},${
            item.oef || ''
          },${removeComas(item.staff_with_roles)}`
        );
      }
      generatePDF(csvPDFData);
    }

    setShowExportDialogue(false);
  };

  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    setCsvData([]);
    setCsvFileName(`Depart_Schedule_${getTimestampForFileName()}.csv`);
    if (exportType === 'filtered' && downloadType === 'CSV') {
      const isEmpty = Object.keys(filtersApplied).length === 0;

      const firstKeyName = isEmpty ? null : Object.keys(filtersApplied)[0];
      if (!isEmpty && filtersApplied[firstKeyName] !== '') {
        setCsvFileName(`${firstKeyName}_${getTimestampForFileName()}.csv`);
      }
      rows.map((item) => {
        setCsvData((prev) => [
          ...prev,
          {
            DepartId: item.id,
            AccountName: item.account_name,
            LocationName: item.location_name,
            LocationAddress: removeComas(item.location_address),
            ProcedureShifts: item.sum_of_procedure_shifts,
            ProductShifts: item.sum_of_product_shifts,
            Date: item.date,
            ShiftStartTime: item.shift_start_time,
            ShiftEndTime: item.shift_end_time,
            Vehicles: item.vehicles,
            DepartTime: item.depart_time,
            ReturnTime: item.return_time,
            StaffRequired: item.staff_requested,
            StaffAvailable: item.staff_assigned,
            OEF: item.oef,
            StaffWithRoles: item.staff_with_roles,
          },
        ]);
      });
    }
    if (exportType === 'all' && downloadType === 'CSV') {
      setAllCSVData();
    }
  }, [exportType, downloadType, forceUpdateTimestamp]);

  const setAllCSVData = async () => {
    setCsvData([]);
    const results = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/view-schedules/departure-schedules/search?export_all_data=true`
    );
    const data = await results.json();
    data?.data.map((item) => {
      setCsvData((prev) => [
        ...prev,
        {
          DepartId: item.id,
          AccountName: item.account_name,
          LocationName: item.location_name,
          LocationAddress: removeComas(item.location_address),
          ProcedureShifts: item.sum_of_procedure_shifts,
          ProductShifts: item.sum_of_product_shifts,
          Date: item.date,
          ShiftStartTime: item.shift_start_time,
          ShiftEndTime: item.shift_end_time,
          Vehicles: item.vehicles,
          DepartTime: item.depart_time,
          ReturnTime: item.return_time,
          StaffRequired: item.staff_requested,
          StaffAvailable: item.staff_assigned,
          OEF: item.oef,
          StaffWithRoles: item.staff_with_roles,
        },
      ]);
    });
  };

  function getFormattedDates(selectedDate) {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const today = selectedDate;
    const currentDayOfWeek = today.getDay();
    const daysUntilMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Calculate the start date (Monday of the current week)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysUntilMonday);

    function formatDate(date) {
      const dayOfWeek = daysOfWeek[date.getDay()];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear() % 100;

      const formattedMonth = month < 10 ? `0${month}` : `${month}`;
      const formattedDay = day < 10 ? `0${day}` : `${day}`;

      return `${dayOfWeek} ${formattedMonth}/${formattedDay}/${year}`;
    }

    Array.from({ length: 7 }, (_, index) => {
      const nextDay = new Date(startDate);
      nextDay.setDate(startDate.getDate() + index);
      headers[index] = formatDate(nextDay);
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
        <div
          className="filterBar px-0 py-0"
          style={{
            position: 'relative',
          }}
        >
          <NavTabs tabs={Tabs} currentLocation={currentLocation} />
          <div style={{ position: 'absolute', right: '8px', top: '8px' }}>
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

        <DepartScheduleTable
          isLoading={isLoading}
          departData={rows}
          headers={headers}
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
            <div className="content">
              <h3>Export Data</h3>
              <p>
                Select one of the following option to download the{' '}
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
                    headers={csvHeaders}
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

export default ViewDepartSchedule;
