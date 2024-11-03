/* eslint-disable */

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { BuildScheduleStaffAndDepartBreadCrumbData } from '../BuildScheduleBreadCrumbData';
import TopBar from '../../../common/topbar/index';
import { useLocation } from 'react-router-dom';
import NavTabs from '../../../common/navTabs';
import SvgComponent from '../../../common/SvgComponent';
import Styles from '../../index.module.scss';
import SummaryComponent from './Summary';
import ScheduleTable from '../../view-schedule/staff-schedule/ScheduleTable';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import {
  extractTimeFromString,
  formatDateWithTZ,
} from '../../../../helpers/convertDateTimeToTimezone';

const BuildScheduleStaffSchedule = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const schedule_id = searchParams.get('schedule_id');
  const operation_id = searchParams.get('operation_id');
  const operation_name = searchParams.get('name')?.replace('+', ' ');
  const operation_date = searchParams.get('date');
  const schedule_status = searchParams.get('schedule_status');
  const isCreated = searchParams.get('isCreated');
  const collection_operation_id = searchParams.get('collection_operation_id');
  const disableEdit = searchParams.get('disableEdit');
  const shift_id = searchParams.get('shift_id');

  const queryParams = {
    operation_id: operation_id,
    operation_type: operation_type,
    schedule_id: schedule_id,
    date: operation_date,
    name: operation_name,
    schedule_status: schedule_status,
    isCreated: isCreated,
    collection_operation_id: collection_operation_id,
    disableEdit: disableEdit,
    shift_id: shift_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();

  const [isLoading, setIsLoading] = useState(true);
  const [isAccount, setIsAccount] = useState(false);
  const [isDonorCenter, setIsDonorCenter] = useState(false);
  const [isNCE, setIsNCE] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [summaryContent, setSummaryContent] = useState();
  const [sortName, setSortName] = useState('staff_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [link, setLink] = useState();
  const limit = 25;
  const [dataLength, setDataLength] = useState(0);

  const topDivRef = useRef(null);
  const bottomDivRef = useRef(null);

  const currentLocation = location.pathname;
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = new Date(operation_date).getDay();
  const dayName = daysOfWeek[dayOfWeek];
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = new Date(operation_date).toLocaleDateString(
    'en-US',
    options
  );

  const Tabs = [
    {
      label: 'Details',
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS.concat('?').concat(
        new URLSearchParams({
          operation_id: operation_id,
          operation_type: operation_type,
          schedule_id: schedule_id,
          schedule_status: schedule_status,
          isCreated: isCreated,
          collection_operation_id: collection_operation_id,
          disableEdit: disableEdit,
          shift_id: shift_id,
        }).toString()
      ),
    },
    {
      label: 'Staff Schedule',
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.STAFF_SCHEDULE.concat(
        '?'
      ).concat(appendToLink),
    },
    {
      label: 'Depart Schedule',
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.DEPART_DETAILS.concat(
        '?'
      ).concat(appendToLink),
    },
  ];

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
  useEffect(() => {
    const topDiv = topDivRef.current;
    const bottomDiv = bottomDivRef.current;
    if (!topDiv || !bottomDiv) return;
    function adjustBottomDivHeight() {
      const topDivHeight = topDiv.getBoundingClientRect().height;
      bottomDiv.style.marginTop = `${topDivHeight}px`;
    }
    adjustBottomDivHeight(); // Adjust on initial load
    const handleResize = () => {
      adjustBottomDivHeight(); // Adjust on resize
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [topDivRef, bottomDivRef]);

  useEffect(() => {
    checkOperationType();
    setIsLoading(false);
    fetchStaffScheduleSummary();
    if (tableHeaders.length <= 2) {
      setupDates(operation_date);
    }
  }, []);

  useEffect(() => {
    fetchTableData();
  }, [currentPage, sortName, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortName, sortOrder]);

  const fetchStaffScheduleSummary = async () => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('schedule_id', schedule_id);
      urlParams.append(
        'is_published',
        schedule_status === 'Draft' ? false : true
      );
      let url = `${BASE_URL}/view-schedules/staff-schedules/summary?${urlParams.toString()}`;

      const result = await makeAuthorizedApiRequest('GET', url);
      let { data } = await result.json();
      setSummaryContent(data);

      setIsLoading(false);
    } catch (error) {
      toast.error(`Failed to fetch summary data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchTableData = async () => {
    // check length of previously fetched data - if it's less than limit, there is no more records to fetch
    if (currentPage !== 1 && dataLength < limit) {
      return;
    }
    if (currentPage === 1) {
      // only on initial fetch
      setIsLoading(true);
    }
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('page', currentPage);
      urlParams.append('limit', limit);
      urlParams.append('sortName', sortName);
      urlParams.append('sortOrder', sortOrder);
      urlParams.append(
        'is_published',
        schedule_status === 'Draft' ? false : true
      );

      urlParams.append('operation_id', operation_id);
      urlParams.append('operation_type', operation_type);

      let url = `${BASE_URL}/view-schedules/staff-schedules/search?${urlParams.toString()}`;
      const result = await makeAuthorizedApiRequest('GET', url);
      let { data } = await result.json();
      if (data) {
        setDataLength(data.length);
        const formattedResponse = formatResponse(
          data,
          new Date(operation_date)
        );
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
  };

  const formatResponse = (data, currentDate = new Date()) => {
    const formattedData = [];
    // 1. Map trough the entire response, get all staff ids without duplicates
    const uniqueStaffIds = Array.from(
      new Set(data?.map((obj) => obj.staff_id))
    );
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
            account_name: element.account_name,
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

  const setupDates = (setupDate) => {
    const startDate = new Date(setupDate);
    const dayOfWeek = startDate.getDay();
    const diff =
      startDate.getDate() -
      dayOfWeek +
      (dayOfWeek === 0 ? -6 : dayOfWeek === 1 ? 0 : 1);
    const mondayDate = new Date(startDate.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(mondayDate);
      date.setDate(mondayDate.getDate() + i);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      });
      const weekdayName = date.toLocaleDateString('en-US', {
        weekday: 'long',
      }); // Getting the weekday name
      tableHeaders[i + 2] = {
        id: i + 3, // i = 0, at start there are 2 headers, so (i + 1 + 2) = i + 3
        name: weekdayName,
        date: formattedDate,
        label: weekdayName + ' ' + formattedDate,
        splitlabel: true,
      };
    }
  };

  function formatDate(date) {
    if (!date) return null;
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

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
  const checkOperationType = () => {
    switch (operation_type) {
      case PolymorphicType.OC_OPERATIONS_DRIVES:
        setIsAccount(true);
        setLink(
          `/operations-center/operations/drives/${operation_id}/view/about`
        );
        break;
      case PolymorphicType.OC_OPERATIONS_SESSIONS:
        setIsDonorCenter(true);
        setLink(
          `/operations-center/operations/sessions/${operation_id}/view/about`
        );
        break;
      case PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS:
        setIsNCE(true);
        setLink(
          `/operations-center/operations/non-collection-event/${operation_id}/view/about`
        );
        break;
    }
  };

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

  return (
    <div className={Styles.mainContent}>
      <div ref={topDivRef} className={Styles.nonScrollContainer}>
        <TopBar
          BreadCrumbsData={[
            ...BuildScheduleStaffAndDepartBreadCrumbData,
            {
              label:
                isCreated === true ? 'Operation List' : 'Edit Operation List',
              class: 'disable-label',
              link:
                isCreated === true
                  ? `${STAFFING_MANAGEMENT_BUILD_SCHEDULE.OPERATION_LIST}/${schedule_id}`
                  : `${STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT}?schedule_id=${schedule_id}&schedule_status=${schedule_status}&collection_operation_id=${collection_operation_id}&disableEdit=${disableEdit}`,
            },
            {
              label: 'Staff Schedule',
              class: 'active-label',
              link: currentLocation.concat('?').concat(appendToLink),
            },
          ]}
          BreadCrumbsTitle={'Staff Schedule'}
        />
        <div className={Styles.buildScheduleDetails}>
          <div className={`me-4 ${Styles.buildScheduleDetailsContent}`}>
            {isAccount && (
              <div>
                <SvgComponent name={'OrganizationIcon'} />
              </div>
            )}
            {isDonorCenter && (
              <div>
                <SvgComponent name={'CRMDonorIcon'} />
              </div>
            )}
            {isNCE && (
              <div>
                <SvgComponent name={'CRMNonCollectionsIcon'} />
              </div>
            )}

            <h4 className={Styles.headerTitle}>
              Scheduling Progress - {operation_name ? operation_name : ''}
              <br />
              <a
                className={Styles.headerSubTitle}
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                {dayName}, {formattedDate}
              </a>
            </h4>
          </div>
        </div>
        <div
          className="filterBar px-30 py-0"
          style={{ backgroundColor: '#ffffff' }}
        >
          <NavTabs
            tabs={Tabs}
            currentLocation={currentLocation.concat('?').concat(appendToLink)}
          />
        </div>
      </div>
      <div ref={bottomDivRef} className={Styles.scrollContainer}>
        <SummaryComponent
          data={summaryContent}
          scheduleId={schedule_id}
          isPublished={schedule_status}
        />
        <ScheduleTable
          isLoading={isLoading}
          data={rows}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BuildScheduleStaffSchedule;
