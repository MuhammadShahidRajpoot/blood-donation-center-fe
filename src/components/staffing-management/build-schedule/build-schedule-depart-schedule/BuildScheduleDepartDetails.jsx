import React, { useEffect, useState, useRef } from 'react';
import { BuildScheduleStaffAndDepartBreadCrumbData } from '../BuildScheduleBreadCrumbData';
import TopBar from '../../../common/topbar/index';
import { useLocation } from 'react-router-dom';
import NavTabs from '../../../common/navTabs';
import SvgComponent from '../../../common/SvgComponent';
import Styles from '../../index.module.scss';
import DepartScheduleTable from '../../view-schedule/depart-schedule/DepartScheduleTable';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

let inputTimer = null;

const BuildScheduleDepartDetails = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const schedule_id = searchParams.get('schedule_id');
  const name = searchParams.get('name')?.replace('+', ' ');
  const date = decodeURIComponent(searchParams.get('date'));
  const schedule_status = searchParams.get('schedule_status');
  const isCreated = searchParams.get('isCreated');
  const collection_operation_id = searchParams.get('collection_operation_id');
  const shift_id = searchParams.get('shift_id');
  const disableEdit = searchParams.get('disableEdit');

  const queryParams = {
    operation_id: operation_id,
    operation_type: operation_type,
    schedule_id: schedule_id,
    date: date,
    name: name,
    schedule_status: schedule_status,
    isCreated: isCreated,
    collection_operation_id: collection_operation_id,
    disableEdit: disableEdit,
    shift_id: shift_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();

  const dayOfWeek = new Date(date).getDay();
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = daysOfWeek[dayOfWeek];
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = new Date(date).toLocaleDateString('en-US', options);
  const topDivRef = useRef(null);
  const bottomDivRef = useRef(null);
  const limit = 25;

  const currentLocation = location.pathname;
  const [isAccount, setIsAccount] = useState(false);
  const [isDonorCenter, setIsDonorCenter] = useState(false);
  const [isNCE, setIsNCE] = useState(false);
  const [link, setLink] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLength, setDataLength] = useState(0);

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

  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [headers] = useState([]);

  useEffect(() => {
    clearTimeout(inputTimer);
    checkOperationType();
    inputTimer = setTimeout(async () => {
      fetchAllData();
    }, 500);
    if (headers.length === 0) {
      getFormattedDates(date);
    }
  }, [currentPage]);

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

  function getFormattedDates(dateForHeaders) {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const datePassed = new Date(dateForHeaders);
    const currentDayOfWeek = datePassed.getDay();
    const daysUntilMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Calculate the start date (Monday of the current week)
    const startDate = new Date(datePassed);
    startDate.setDate(datePassed.getDate() - daysUntilMonday);

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
      headers.push(formatDate(nextDay));
    });
  }

  const fetchAllData = async () => {
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
      urlParams.append('limit', limit);
      urlParams.append('page', currentPage);
      urlParams.append(
        'is_published',
        schedule_status === 'Draft' ? false : true
      );
      urlParams.append('operation_id', operation_id);
      urlParams.append('operation_type', operation_type);
      // urlParams.append('shift_id', shift_id);

      let url = `${BASE_URL}/view-schedules/departure-schedules/search?${urlParams.toString()}`;
      const result = await makeAuthorizedApiRequest('GET', url);
      const data = await result.json();
      if (data) {
        setDataLength(data.data.length);

        if (currentPage === 1 && limit === 25) {
          // initial fetch
          setRows(data.data);
        } else {
          setRows((prevRows) => [...prevRows, ...data.data]);
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
              label: 'Depart Schedule',
              class: 'active-label',
              link: currentLocation.concat('?').concat(appendToLink),
            },
          ]}
          BreadCrumbsTitle={'Depart Schedule'}
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
              Scheduling Progress - {name}
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
        <DepartScheduleTable
          isLoading={isLoading}
          departData={rows}
          headers={headers}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BuildScheduleDepartDetails;
