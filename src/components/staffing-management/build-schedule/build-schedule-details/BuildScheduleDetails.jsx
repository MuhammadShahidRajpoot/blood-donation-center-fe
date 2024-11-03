/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { BuildScheduleDetailsBreadCrumbData } from '../BuildScheduleBreadCrumbData';
import TopBar from '../../../common/topbar/index';
import { useLocation, useNavigate } from 'react-router-dom';
import NavTabs from '../../../common/navTabs';
import SvgComponent from '../../../common/SvgComponent';
import Styles from '../../index.module.scss';
import Details from '../create-schedule/schedule-details/Details/Details';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';
import ChangeSummary from '../create-schedule/schedule-details/change-summary/ChangeSummary';
import ControlOptions from './ControlOptions';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const BuildScheduleDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const schedule_id = searchParams.get('schedule_id');
  const schedule_status = searchParams.get('schedule_status');
  const isCreated = searchParams.get('isCreated');
  const disableEdit = searchParams.get('disableEdit');
  const collection_operation_id = searchParams.get('collection_operation_id');
  const resolve = searchParams.get('resolve');
  const shift_id = searchParams.get('shift_id');

  const [isAccount, setIsAccount] = useState(false);
  const [isDonorCenter, setIsDonorCenter] = useState(false);
  const [isNCE, setIsNCE] = useState(false);
  const [operationName, setOperationName] = useState();
  const [operationDate, setOperationDate] = useState();
  const [currentShiftId, setCurrentShiftId] = useState();
  const [shifts, setShifts] = useState();
  const [operations, setOperations] = useState();
  const [selectedOperation, setSelectedOperation] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState();
  const [link, setLink] = useState();

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const currentLocation = location.pathname;
  const queryParams = {
    schedule_id: schedule_id,
    operation_id: operation_id,
    operation_type: operation_type,
    name: operationName,
    date: operationDate,
    schedule_status: schedule_status,
    isCreated: isCreated,
    collection_operation_id: collection_operation_id,
    disableEdit: disableEdit,
    resolve: resolve,
    shift_id: shift_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();
  const [sync, setSync] = useState(false);

  const topDivRef = useRef(null);
  const bottomDivRef = useRef(null);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = new Date(operationDate).getDay();
  const dayName = daysOfWeek[dayOfWeek];
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = new Date(operationDate).toLocaleDateString(
    'en-US',
    options
  );

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

  useEffect(() => {
    fetchOperations();
    getCategories();
    getFiltersCode();
  }, []);

  useEffect(() => {
    checkOperationType();
    setOperationNameAndDate(selectedIndex);
    if (!resolve) {
      getShiftInformation();
    }
  }, [selectedIndex]);

  const setOperationNameAndDate = (index) => {
    if (operations) {
      const operation = operations[index];
      setSelectedOperation(operation);
      setOperationName(operation.name);
      setOperationDate(operation.date);
    }
  };
  const getCategories = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/notes/categories`
    );
    const data = await result.json();
    if (result.ok || result.status === 200) {
      setCategories(
        data?.data?.map((item) => {
          return { value: item.id, label: item.name };
        }) || []
      );
    } else {
      toast.error('Error Fetching Note Categories', { autoClose: 3000 });
    }
  };

  const getFiltersCode = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/build_schedule_notes_details`
      );
      let { data } = await result.json();
      if (result.status === 200) {
        const dataValues = Object.values(data);
        const initialFormData = {};
        dataValues?.forEach((item) => {
          initialFormData[item.name] = '';
        });
      }
    } catch (error) {
      toast.error('Error fetching notes filters', {
        autoClose: 3000,
      });
    }
  };

  const fetchOperations = async () => {
    try {
      let url = `${BASE_URL}/staffing-management/schedules/operation-list/${schedule_id}?getAllData=true`;
      url = resolve
        ? url.concat('&in_sync=false')
        : url.concat('&in_sync=true');
      const response = await makeAuthorizedApiRequest('GET', url);
      const data = await response.json();

      if (data) {
        setOperations(data.items);
        const index = data.items.findIndex((op) => op.id === operation_id);
        if (index !== -1) {
          setSelectedIndex(index);
          setSelectedOperation(data.items[index]);
          setOperationName(data.items[index].name);
          setOperationDate(data.items[index].date);
        }
      }
    } catch (error) {
      toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const getShiftInformation = async () => {
    let url = `${BASE_URL}/staffing-management/schedules/${operation_id}/${operation_type}`;
    const result = await makeAuthorizedApiRequest('GET', url);
    let { data } = await result.json();
    setShifts(data.shifts);
    setCurrentShiftId(data.shifts[0].id); // initially always show first shift in array
  };

  const setShiftId = (shiftId) => {
    setCurrentShiftId(shiftId);

    const queryParams = {
      schedule_id: schedule_id,
      operation_id: operation_id,
      operation_type: operation_type,
      name: operationName,
      date: operationDate,
      schedule_status: schedule_status,
      isCreated: isCreated,
      collection_operation_id: collection_operation_id,
      disableEdit: disableEdit,
      shift_id: shiftId,
    };

    navigate({
      pathname: currentLocation,
      search: new URLSearchParams(queryParams).toString(),
    });
  };

  useEffect(() => {
    const topDiv = topDivRef.current;
    const bottomDiv = bottomDivRef.current;
    if (!topDiv || !bottomDiv) return;
    function adjustBottomDivHeight() {
      const topDivHeight = topDiv.getBoundingClientRect().height + 15;
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

  const handleSyncUpdate = (sync) => {
    setSync(sync);
  };

  const Tabs = [
    {
      label: 'Details',
      link:
        !resolve || sync
          ? STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS.concat('?').concat(
            appendToLink
          )
          : null,
    },
    {
      label: 'Staff Schedule',
      link:
        !resolve || sync
          ? STAFFING_MANAGEMENT_BUILD_SCHEDULE.STAFF_SCHEDULE.concat(
            '?'
          ).concat(appendToLink)
          : null,
    },
    {
      label: 'Depart Schedule',
      link:
        !resolve || sync
          ? STAFFING_MANAGEMENT_BUILD_SCHEDULE.DEPART_DETAILS.concat(
            '?'
          ).concat(appendToLink)
          : null,
    },
    resolve && {
      label: 'Change Summary',
      link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.CHANGE_SUMMARY.concat(
        '?'
      ).concat(appendToLink),
    },
  ];

  return (
    <div className={Styles.mainContent}>
      <div ref={topDivRef} className={Styles.nonScrollContainer}>
        <TopBar
          BreadCrumbsData={[
            ...BuildScheduleDetailsBreadCrumbData,
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
              label: 'Details',
              class: 'active-label',
              link: `${currentLocation}?schedule_id=${schedule_id}&operation_id=${operation_id}&operation_type=${operation_type}&isCreated=${isCreated}&disableEdit=${disableEdit}`,
            },
          ]}
          BreadCrumbsTitle={'Details'}
        />
        <div
          className={Styles.buildScheduleDetails}
          style={
            schedule_status === 'Published'
              ? { backgroundColor: '#DEF0D7' }
              : { backgroundColor: '#ffffff' }
          }
        >
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
              {operationName}
              <br />
              <a
                className={Styles.headerSubTitle}
                href={link}
                target="_blank"
                rel="noreferrer"
              >
                {formattedDate === 'Invalid Date'
                  ? ''
                  : `${dayName}, ${formattedDate}`}
              </a>
            </h4>
          </div>
        </div>

        <div
          className="filterBar px-30 py-0 d-flex justify-between"
          style={
            schedule_status === 'Published'
              ? { backgroundColor: '#DEF0D7' }
              : { backgroundColor: '#ffffff' }
          }
        >
          <NavTabs
            tabs={Tabs}
            currentLocation={currentLocation.concat('?').concat(appendToLink)}
            marginBtmZero="true"
          />
          {[
            STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS,
            STAFFING_MANAGEMENT_BUILD_SCHEDULE.CHANGE_SUMMARY,
          ].includes(currentLocation) &&
            selectedOperation &&
            operations && (
              <ControlOptions
                topDivRef={topDivRef}
                bottomDivRef={bottomDivRef}
                operations={operations}
                setSelectedOperation={setSelectedOperation}
                selectedOperation={selectedOperation}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                scheduleId={schedule_id}
              />
            )}
        </div>
      </div>
      <div ref={bottomDivRef} className={Styles.scrollContainer}>
        <section className={Styles.detailsSectionContainer}>
          {currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS ? (
            <Details
              currentShiftId={currentShiftId}
              setCurrentShiftId={setShiftId}
              shifts={shifts}
              operationDate={operationDate}
              operationName={operationName}
              categories={categories}
            />
          ) : (
            <ChangeSummary updateSync={handleSyncUpdate} />
          )}
        </section>
      </div>
    </div>
  );
};

export default BuildScheduleDetails;
