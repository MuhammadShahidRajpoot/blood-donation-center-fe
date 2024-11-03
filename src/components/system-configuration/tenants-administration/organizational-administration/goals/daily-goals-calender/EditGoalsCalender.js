import React, { useEffect, useMemo, useRef, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { useParams, useSearchParams } from 'react-router-dom';
import styles from './index.module.scss';
import SuccessPopUpModal from '../../../../../common/successModal';
import CancelModalPopUp from '../../../../../common/cancelModal';
import { isEmpty } from 'lodash';
import SelectDropdown from '../../../../../common/selectDropdown';
import {
  makeAuthorizedApiRequestAxios,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import { toast } from 'react-toastify';
import FormInput from '../../../../../common/form/FormInput';
import FormToggle from '../../../../../common/form/FormToggle';
import moment from 'moment';
import {
  DAILY_GOALS_CALENDAR,
  SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../../routes/path';
import WarningModalPopUp from '../../../../../common/warningModal';
import { convertToMoment } from '../../../../../../helpers/convertDateTimeToTimezone';

const EditGoalsCalender = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [warningModal, setWarningModal] = useState(false);
  const [save, setSave] = useState('save');
  const [procedureType, setProcedureType] = useState('');
  const [procedureTypeData, setProcedureTypeData] = useState([]);
  const [collectionOperation, setCollectionOperation] = useState('');
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [searchParams] = useSearchParams();
  const currentYear = new Date().getFullYear();
  const [collectionOperationGoal, setCollectionOperationGoal] = useState();
  const distributionErrorMessage =
    'The redistribution will result in negative goals for some days, please try again...';
  const [distributionErrorModal, setDistributionErrorModal] = useState(false);
  const [canAllocate, setCanAllocate] = useState(true);
  const [adjustedGoal, setAdjustedGoal] = useState();
  const [isLocked, setIsLocked] = useState(false);
  const debouncedFetch = useRef(null);
  const years = Array.from({ length: 51 }, (_, index) => {
    return {
      label: (currentYear + index).toString(),
      value: (currentYear + index).toString(),
    };
  });
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [months] = useState([
    {
      value: 0,
      label: 'January',
    },
    {
      value: 1,
      label: 'February',
    },
    {
      value: 2,
      label: 'March',
    },
    {
      value: 3,
      label: 'April',
    },
    {
      value: 4,
      label: 'May',
    },
    {
      value: 5,
      label: 'June',
    },
    {
      value: 6,
      label: 'July',
    },
    {
      value: 7,
      label: 'August',
    },
    {
      value: 8,
      label: 'September',
    },
    {
      value: 9,
      label: 'October',
    },
    {
      value: 10,
      label: 'November',
    },
    {
      value: 11,
      label: 'December',
    },
  ]);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
  const [daysValues, setDaysValues] = useState({});
  const [editedDaysValues, setEditedDaysValues] = useState({});
  const [originalDaysValues, setOriginalDaysValues] = useState({});
  const [diffrenceDaysValues, setDiffrenceDaysValues] = useState({});
  const [dailyGoalsCalendarData, setDailyGoalsCalendarData] = useState();
  const [closedDates, setClosedDates] = useState([]);
  const [allocatedDiffrenceOver, setAllocateDiffrenceOver] = useState({
    label: 'Month',
    value: 'month',
  });

  const BreadcrumbsData = [
    {
      label: 'System Configurations',
      class: 'disable-label',
      link: SYSTEM_CONFIGURATION_PATH,
    },
    {
      label: 'Organizational Administration',
      class: 'disable-label',
      link: SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
    },
    {
      label: 'Goals',
      class: 'disable-label',
      link: DAILY_GOALS_CALENDAR.VIEW,
    },
    {
      label: 'Edit Daily Goals Calendar',
      class: 'active-label',
      link: `/organizational-administration/goals/daily-goals-calender/${id}/edit`,
    },
  ];

  const isClosed = (currentDate) => {
    for (const element of closedDates) {
      if (
        currentDate.isSameOrAfter(
          convertToMoment(element.start, 'UTC-0').startOf('day')
        ) &&
        currentDate.isSameOrBefore(
          convertToMoment(element.end, 'UTC-0').endOf('day')
        )
      )
        return true;
    }
    return false;
  };

  const fetchProcedureData = async () => {
    try {
      const response = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/procedure_types?fetchAll=true&status=true`
      );
      const data = response.data;
      setProcedureTypeData([
        ...(data?.data
          .filter((item) => item.is_goal_type == true)
          .map((item) => {
            return { value: item.id, label: item.name };
          }) || []),
      ]);
    } catch (error) {
      console.error('Error procedures:', error);
    }
  };

  const fetchCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list`
    );
    let { data } = await result.data;
    if (result.ok || result.status === 200) {
      setCollectionOperationData([
        ...(data?.map((item) => {
          return { value: item.id, label: item.name };
        }) || []),
      ]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  const archieveHandle = async () => {
    setModalPopUp(false);
  };

  const saveAndClose = async () => {
    let payloadDays = daysValues;
    let manual_updated = false;
    if (isLocked) {
      manual_updated = true;
      Object.keys(daysValues).forEach((key) => {
        payloadDays = {
          ...payloadDays,
          [key]:
            daysValues[key] +
            ((diffrenceDaysValues?.[key] || daysValues[key]) -
              daysValues?.[key]),
        };
      });
    } else {
      Object.keys(daysValues).forEach((key) => {
        if (daysValues[key] != originalDaysValues[key]) {
          manual_updated = true;
        }
      });
    }
    const requestData = {
      month: month?.value,
      year: year?.value,
      procedureType: procedureType?.value,
      collectionOperation: collectionOperation?.value,
      isLocked,
      daysValues: payloadDays,
      allocatedDiffrenceOver: allocatedDiffrenceOver.value,
      diffrence: adjustedGoal - collectionOperationGoal,
      manual_updated,
    };
    const result = await makeAuthorizedApiRequestAxios(
      'PUT',
      `${BASE_URL}/daily-goals-calender`,
      JSON.stringify(requestData)
    );
    const { status, response } = result.data;
    if (status === 'error') {
      toast.error(response);
    }
    if (status === 'success') {
      setModalPopUp(true);
      fetchDailyGoalsCalendar();
    }
  };

  const saveChanges = async () => {
    let payloadDays = daysValues;
    let manual_updated = false;
    if (isLocked) {
      manual_updated = true;
      Object.keys(daysValues).forEach((key) => {
        payloadDays = {
          ...payloadDays,
          [key]:
            daysValues[key] +
            ((diffrenceDaysValues?.[key] || daysValues[key]) -
              daysValues?.[key]),
        };
      });
    } else {
      Object.keys(daysValues).forEach((key) => {
        if (daysValues[key] != originalDaysValues[key]) {
          manual_updated = true;
        }
      });
    }
    const requestData = {
      month: month?.value,
      year: year?.value,
      procedureType: procedureType?.value,
      collectionOperation: collectionOperation?.value,
      isLocked,
      daysValues: payloadDays,
      allocatedDiffrenceOver: allocatedDiffrenceOver.value,
      diffrence: adjustedGoal - collectionOperationGoal,
      manual_updated,
    };
    const result = await makeAuthorizedApiRequestAxios(
      'PUT',
      `${BASE_URL}/daily-goals-calender`,
      JSON.stringify(requestData)
    );
    const { status, response } = result.data;
    if (status === 'error') {
      toast.error(response);
    }
    if (status === 'success') {
      toast.success(response);
      fetchDailyGoalsCalendar();
    }
  };

  const handleProcedureType = (item) => {
    setProcedureType(item);
  };

  const handleCollectionOperation = (item) => {
    setCollectionOperation(item);
  };

  const handleYear = (item) => {
    setYear(item);
  };

  const handleMonth = (item) => {
    setMonth(item);
  };

  useEffect(() => {
    fetchProcedureData();
    fetchCollectionOperations();
  }, []);

  const getSumOfValuesinWeek = (date) => {
    let sum = 0;
    const start = moment(new Date(year?.value, month?.value, date)).startOf(
      'week'
    );
    const end = moment(new Date(year?.value, month?.value, date)).endOf('week');
    while (start.isSameOrBefore(end)) {
      const itemDate = parseInt(start.format('DD'));
      sum += daysValues?.[itemDate.toString()] || 0;
      start.add(1, 'day');
    }
    return sum;
  };

  const handleFormInput = (event) => {
    const { value, name } = event.target;
    switch (name) {
      case 'collection_operation_goal':
        setCollectionOperationGoal(value);
        break;
      case 'adjusted_goal':
        setAdjustedGoal(value);
        break;
      default:
        if (isLocked) {
          // console.log(`is Locked ${isLocked}`);
          // console.log(
          //   `allocatedDiffrenceOver ${allocatedDiffrenceOver?.value}`
          // );
          // console.log(`Value: ${parseInt(value)}`);
          // console.log(`Collection Operation Goal ${collectionOperationGoal}`);
          if (
            allocatedDiffrenceOver?.value === 'month' &&
            value != '' &&
            parseInt(value) > collectionOperationGoal
          ) {
            setCanAllocate(false);
            setDistributionErrorModal(true);
          } else {
            setCanAllocate(true);
          }
          if (allocatedDiffrenceOver?.value === 'week') {
            const weekSum = getSumOfValuesinWeek(name);
            if (
              value != '' &&
              !isNaN(parseInt(value)) &&
              parseInt(value) > 0 &&
              parseInt(value) > weekSum
            ) {
              setCanAllocate(false);
              setDistributionErrorModal(true);
            } else {
              setCanAllocate(true);
            }
          }
          const val =
            value != '' && !isNaN(parseInt(value)) && parseInt(value) > 0
              ? parseInt(value)
              : 0;
          if (
            editedDaysValues[name] == true &&
            originalDaysValues[name] === val
          ) {
            setEditedDaysValues({
              ...editedDaysValues,
              [name]: false,
            });
            let hasOtherChanged = false;
            for (let key in editedDaysValues) {
              if (key !== name && editedDaysValues[key]) hasOtherChanged = true;
            }
            if (hasOtherChanged) {
              debouncedFetchCalendarDiffrence({
                ...daysValues,
                [name]:
                  value != '' && !isNaN(parseInt(value)) && parseInt(value) > 0
                    ? parseInt(value)
                    : 0,
              });
            } else {
              setDiffrenceDaysValues({
                ...daysValues,
                [name]:
                  value != '' && !isNaN(parseInt(value)) && parseInt(value) > 0
                    ? parseInt(value)
                    : 0,
              });
            }
          } else {
            debouncedFetchCalendarDiffrence({
              ...daysValues,
              [name]:
                value != '' && !isNaN(parseInt(value)) && parseInt(value) > 0
                  ? parseInt(value)
                  : 0,
            });
          }
        }
        setDaysValues({
          ...daysValues,
          [name]:
            value != '' && !isNaN(parseInt(value)) && parseInt(value) > 0
              ? parseInt(value)
              : 0,
        });
        if (value != '' && parseInt(value) != originalDaysValues[name]) {
          setEditedDaysValues({
            ...editedDaysValues,
            [name]: true,
          });
        }
        if (value != '' && parseInt(value) == originalDaysValues[name]) {
          setEditedDaysValues({
            ...editedDaysValues,
            [name]: false,
          });
        }
        break;
    }
  };

  useEffect(() => {
    if (isLocked)
      debouncedFetchCalendarDiffrence({
        ...daysValues,
      });
  }, [allocatedDiffrenceOver]);

  const debouncedFetchCalendarDiffrence = async (dailyData) => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }
    // Debounce the fetch function
    debouncedFetch.current = setTimeout(() => {
      // Your fetchStaffSetups logic goes here
      // Remember to handle cleanup and setStaffSetupShiftOptions accordingly
      fetchDailyGoalsCalendarDiffrence(dailyData);
    }, 1000); // Adjust the timeout as needed

    return () => {
      // Clear the timeout on component unmount or when the dependencies change
      clearTimeout(debouncedFetch.current);
    };
  };

  const fetchDailyGoalsCalendarDiffrence = async (dailyData) => {
    const adjustmentGoal = Object.values(dailyData).reduce(
      (accumulator, currentValue) => accumulator + Math.round(currentValue),
      0
    );
    const requestData = {
      month: month?.value,
      year: year?.value,
      procedureType: procedureType?.value,
      collectionOperation: collectionOperation?.value,
      daysValues: dailyData,
      allocatedDiffrenceOver: allocatedDiffrenceOver.value,
      diffrence: adjustmentGoal - collectionOperationGoal,
    };
    const result = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/daily-goals-calender/allocation`,
      JSON.stringify(requestData)
    );
    const { data } = await result.json();
    setDiffrenceDaysValues(data);
  };

  const hasDayDiffrence = (date) => {
    if (isLocked && !isNaN(daysValues?.[date] - diffrenceDaysValues?.[date])) {
      return {
        diffrence: editedDaysValues?.[date]
          ? diffrenceDaysValues?.[date] - originalDaysValues?.[date] !== 0
          : diffrenceDaysValues?.[date] - daysValues?.[date] !== 0,
        value: editedDaysValues?.[date]
          ? diffrenceDaysValues?.[date] - originalDaysValues?.[date]
          : diffrenceDaysValues?.[date] - daysValues?.[date],
      };
    }

    if (!isLocked && !isNaN(daysValues?.[date] - originalDaysValues?.[date])) {
      return {
        diffrence: daysValues?.[date] - originalDaysValues?.[date] !== 0,
        value: daysValues?.[date] - originalDaysValues?.[date],
      };
    }
    return { diffrence: false, value: 0 };
  };

  const getDaysItems = () => {
    const currentDate = new Date(year?.value, month?.value, 1);

    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const daysInPreviousMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    ).getDate();

    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();

    const days = Array.from(
      { length: daysInMonth },
      (_, i) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    );
    const prevMonthDays = Array.from(
      { length: firstDayOfMonth },
      (_, i) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          daysInPreviousMonth - i
        )
    );
    prevMonthDays.reverse();
    const totalPreviousDays = days.length + prevMonthDays.length;

    const nextMonthDays = Array.from(
      {
        length:
          totalPreviousDays >= 35
            ? 42 - totalPreviousDays
            : 35 - totalPreviousDays,
      },
      (_, i) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i + 1)
    );

    const daysItems = [];
    for (const item of prevMonthDays) {
      daysItems.push(
        <div key={`prev-${item.getDate()}`} className={`${styles.goalvalue}`}>
          <FormInput
            type="number"
            required={false}
            disabled={true}
            classes={{ root: 'w-100', label: 'goalsLabel' }}
            disable
            name={item.getDate()}
            displayName={`${item.getDate()} ${daysOfWeek[item.getDay()]}`}
          />
        </div>
      );
    }

    for (const item of days) {
      const date = item.getDate();
      const { diffrence: hasDiffrence, value: diffrenceValue } =
        hasDayDiffrence(date);
      daysItems.push(
        <>
          <div className="d-flex flex-column">
            <div key={`curr-${item}`} className={`${styles.goalvalue}`}>
              {closedDates?.length > 0 &&
              isClosed(
                moment(
                  new Date(item.getFullYear(), item.getMonth(), item.getDate()),
                  closedDates
                )
              ) ? (
                <FormInput
                  type="text"
                  required={false}
                  classes={{
                    root: 'w-100',
                    text: 'goalsActiveItem',
                    label: 'goalsLabel',
                  }}
                  disabled={true}
                  name={date}
                  displayName={`${date} ${daysOfWeek[item.getDay()]}`}
                  value={'Closed'}
                />
              ) : (
                <FormInput
                  type="number"
                  required={false}
                  classes={{
                    root: 'w-100',
                    text: 'goalsActiveItem',
                    label: 'goalsLabel',
                  }}
                  disabled={
                    dailyGoalsCalendarData === null ||
                    daysValues?.[date] === undefined
                  }
                  name={date}
                  displayName={`${date} ${daysOfWeek[item.getDay()]}`}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  onKeyUp={(e) => {
                    console.log(e.which, 'Key');
                    if (
                      e.which === 38 ||
                      e.which === 40 ||
                      e.which === 189 ||
                      e.which === 16 ||
                      e.which === 69
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onKeyDown={(e) => {
                    console.log(e.which, 'Key');
                    if (
                      e.which === 38 ||
                      e.which === 40 ||
                      e.which === 189 ||
                      e.which === 16 ||
                      e.which === 69
                    ) {
                      e.preventDefault();
                    }
                  }}
                  value={daysValues?.[date] !== 0 ? daysValues?.[date] : ''}
                  handleChange={handleFormInput}
                />
              )}
            </div>
            <p
              className={`ps-3 ${
                hasDiffrence && diffrenceValue > 0
                  ? styles.goalOver
                  : styles.goalUnder
              }`}
            >
              {hasDiffrence && diffrenceValue > 0 && '+'}
              {hasDiffrence ? diffrenceValue : ''}
            </p>
          </div>
        </>
      );
    }

    for (const item of nextMonthDays) {
      daysItems.push(
        <div key={`next-${item.getDate()}`} className={`${styles.goalvalue}`}>
          <FormInput
            type="number"
            required={false}
            disabled={true}
            classes={{ root: 'w-100', label: 'goalsLabel' }}
            name={item.getDate()}
            displayName={`${item.getDate()} ${daysOfWeek[item.getDay()]}`}
            handleChange={handleFormInput}
          />
        </div>
      );
    }
    return (
      <>
        <div className={styles.goalvalueparent}>{daysItems}</div>
      </>
    );
  };

  useEffect(() => {
    const selected = months?.filter(
      (item) => item.value === parseInt(searchParams.get('month'))
    );
    setMonth(selected[0]);
  }, [searchParams]);

  useEffect(() => {
    const selected = years?.filter(
      (item) => item.value === searchParams.get('year')
    );
    setYear(selected[0]);
  }, [searchParams]);

  useEffect(() => {
    const selected = collectionOperationData?.filter(
      (item) => item.value === searchParams.get('collectionOperation')
    );
    setCollectionOperation(selected[0]);
  }, [collectionOperationData, searchParams]);

  useEffect(() => {
    const selected = procedureTypeData?.filter(
      (item) => item.value === searchParams.get('procedureType')
    );
    setProcedureType(selected[0]);
  }, [procedureTypeData, searchParams]);

  const calculation = useMemo(
    () => month != '' && year != '' && getDaysItems(),
    [
      daysValues,
      isLocked,
      month,
      year,
      closedDates,
      diffrenceDaysValues,
      allocatedDiffrenceOver,
    ]
  );

  const fetchDailyGoalsCalendar = async () => {
    if (
      procedureType?.value &&
      collectionOperation?.value &&
      !isEmpty(procedureType?.value) &&
      !isEmpty(collectionOperation?.value) &&
      month &&
      year
    ) {
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/daily-goals-calender?procedure_type=${
          procedureType?.value || ''
        }&collection_operation=${collectionOperation?.value || ''}&month=${
          month?.value
        }&year=${year?.value}`
      );
      let { data, monthly_value, closedDatesListForMonth } = result.data;
      if (result.ok || result.status === 200) {
        setClosedDates(closedDatesListForMonth);
        setDailyGoalsCalendarData(data);
        setCollectionOperationGoal(monthly_value);
        const goal_amounts = data?.map((item) => item.goal_amount);
        const isLockeds = data?.map((item) => item.is_locked);
        const isLocked = isLockeds?.filter((item) => item === true) ?? false;
        if (isLocked.length > 0) {
          setIsLocked(isLocked);
        }
        setAdjustedGoal(
          goal_amounts?.reduce((partialSum, a) => partialSum + Math.round(a), 0)
        );
      } else {
        toast.error('Error Fetching Collection Operations', {
          autoClose: 3000,
        });
      }
    }
  };

  useEffect(() => {
    fetchDailyGoalsCalendar();
  }, [procedureType, month, year, collectionOperation]);

  const getdataByDay = (date) => {
    return dailyGoalsCalendarData?.filter((item) => {
      return item.date === moment(date).format('YYYY-MM-DD');
    });
  };

  useEffect(() => {
    const daysData = {};
    dailyGoalsCalendarData?.map((item) => {
      const dailyData = getdataByDay(item.date);
      daysData[moment(dailyData?.[0]?.date).date().toString()] = Math.round(
        dailyData[0].goal_amount
      );
    });
    if (Object.keys(daysData).length > 0) {
      setDaysValues((prevData) => ({
        ...daysData,
      }));
      setOriginalDaysValues((prevData) => ({
        ...daysData,
      }));
      setDiffrenceDaysValues((prevData) => ({
        ...daysData,
      }));
      const userUpdatedDaysValues = {};
      Object.keys(daysData)?.map((item) => {
        userUpdatedDaysValues[item] = false;
      });
      setEditedDaysValues(userUpdatedDaysValues);
    } else {
      setDaysValues({});
    }
  }, [dailyGoalsCalendarData]);

  useEffect(() => {
    const sum = Object.values(daysValues).reduce(
      (accumulator, currentValue) => accumulator + parseFloat(currentValue),
      0
    );
    setAdjustedGoal(sum);
  }, [daysValues]);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Daily Goals Calendar'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner">
        <div className={styles.goalcalender}>
          <form>
            <div className={`formGroup ${styles.editformcontainer}`}>
              <h5>Edit Daily Goals Calendar</h5>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <SelectDropdown
                      placeholder={'Collection Operation*'}
                      defaultValue={collectionOperation}
                      selectedValue={collectionOperation}
                      removeDivider
                      showLabel={!isEmpty(collectionOperation)}
                      removeTheClearCross
                      onChange={handleCollectionOperation}
                      options={collectionOperationData}
                      styles={{ root: 'w-100' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <SelectDropdown
                      placeholder={'Procedure Type*'}
                      defaultValue={procedureType}
                      selectedValue={procedureType}
                      removeDivider
                      showLabel={!isEmpty(procedureType)}
                      removeTheClearCross
                      onChange={handleProcedureType}
                      options={procedureTypeData}
                      styles={{ root: 'w-100' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <SelectDropdown
                      placeholder={'Select Year*'}
                      defaultValue={year}
                      selectedValue={year}
                      showLabel={!isEmpty(year)}
                      removeDivider
                      removeTheClearCross
                      onChange={handleYear}
                      options={years}
                      styles={{ root: 'w-100' }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <SelectDropdown
                      placeholder={'Month*'}
                      defaultValue={month}
                      selectedValue={month}
                      showLabel={!isEmpty(month)}
                      removeDivider
                      removeTheClearCross
                      onChange={handleMonth}
                      options={months}
                      styles={{ root: 'w-100' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
          <form className={styles.detailsgoaldiv}>
            <div className={` ${styles.detailsformcontainer} formGroup`}>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Daily Goals Details</h5>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <FormInput
                      disabled={true}
                      type="number"
                      required={false}
                      classes={{ root: 'w-100' }}
                      name={'collection_operation_goal'}
                      displayName={'Collection Operation Goal'}
                      value={collectionOperationGoal}
                      handleChange={handleFormInput}
                    />
                  </div>
                </div>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <FormInput
                      disabled={true}
                      type="number"
                      required={false}
                      classes={{ root: 'w-100' }}
                      name={'adjusted_goal'}
                      displayName={'Adjusted Goal'}
                      value={adjustedGoal}
                      handleChange={handleFormInput}
                    />
                  </div>
                </div>
              </div>
              <div className="w-100">
                <div className="form-field ">
                  <div className="field ">
                    <div className="position-relative">
                      <FormInput
                        type="number"
                        required={false}
                        disabled={true}
                        classes={{ root: 'w-100', label: 'goals' }}
                        name={'diffrence'}
                        displayName={'Difference'}
                        value={
                          adjustedGoal - collectionOperationGoal === 0
                            ? '0'
                            : Math.round(adjustedGoal - collectionOperationGoal)
                        }
                        handleChange={handleFormInput}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h6>Automatic Redistribution</h6>
              </div>
              <div className="form-field">
                <div className="field ">
                  <div className="position-relative">
                    <FormToggle
                      name="is_locked"
                      displayName="Lock Goal"
                      checked={isLocked}
                      classes={{ root: 'pt-2' }}
                      handleChange={(event) => {
                        setIsLocked(event.target.checked);
                        if (event.target.checked) {
                          setDiffrenceDaysValues(daysValues);
                          if (adjustedGoal - collectionOperationGoal !== 0) {
                            fetchDailyGoalsCalendarDiffrence(daysValues);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="form-field ">
                <div className="field ">
                  <div className="position-relative">
                    <SelectDropdown
                      styles={{ root: 'w-100' }}
                      showLabel={true}
                      placeholder={'Allocate Difference Over'}
                      defaultValue={allocatedDiffrenceOver}
                      selectedValue={allocatedDiffrenceOver}
                      removeDivider
                      removeTheClearCross
                      onChange={(item) => {
                        setAllocateDiffrenceOver(item);
                      }}
                      options={[
                        {
                          label: 'Month',
                          value: 'month',
                        },
                        {
                          label: 'Week',
                          value: 'week',
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
          <form className={`${styles.enterdetailsgoaldiv} mb-4`}>
            <div className={`formGroup ${styles.entergoalscontainer}`}>
              <div className="d-flex justify-content-between align-items-center w-100">
                <h5>Enter Daily Goals Values</h5>
              </div>
              <div className={styles.goalvalueparent}>{calculation}</div>
            </div>
          </form>
          <div className="form-footer">
            <p
              className={`btn btn-simple-text`}
              onClick={() => setCloseModal(true)}
            >
              Cancel
            </p>
            <button
              className={`btn btn-md btn-secondary} ${
                isLocked && !canAllocate ? 'disabled' : ''
              }`}
              disabled={canAllocate}
              onClick={() => {
                if (adjustedGoal - collectionOperationGoal !== 0) {
                  setSave('saveAndClose');
                  setWarningModal(true);
                } else {
                  saveAndClose();
                }
              }}
            >
              Save & Close
            </button>
            <button
              type="button"
              className={`btn btn-md btn-primary ${
                isLocked && !canAllocate ? 'disabled' : ''
              }`}
              onClick={() => {
                if (adjustedGoal - collectionOperationGoal !== 0) {
                  setSave('save');
                  setWarningModal(true);
                } else {
                  saveChanges();
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <SuccessPopUpModal
        title={'Success!'}
        message={'Daily Goals updated.'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        archived={archieveHandle}
        redirectPath={`${DAILY_GOALS_CALENDAR.VIEW}?month=${
          month?.value?.toString() || ''
        }&year=${year?.value || ''}&collectionOperation=${
          collectionOperation?.value
        }&procedureType=${procedureType?.value}`}
        isNavigate={true}
        showActionBtns={true}
      />

      <WarningModalPopUp
        title="Warning!"
        message={`There is a diffrence of ${
          adjustedGoal - collectionOperationGoal
        } in Allocation for the month.
        ${isLocked ? 'It will be redistributed across the' : ''}
        ${isLocked ? allocatedDiffrenceOver.label : ''}
        Are you sure you want to save changes?`}
        modalPopUp={warningModal}
        isNavigate={false}
        setModalPopUp={setWarningModal}
        showActionBtns={true}
        confirmAction={() => {
          save == 'save' ? saveChanges() : saveAndClose();
          setWarningModal(false);
        }}
      />

      <WarningModalPopUp
        title="Warning!"
        message={distributionErrorMessage}
        modalPopUp={distributionErrorModal}
        isNavigate={false}
        setModalPopUp={setDistributionErrorModal}
        showActionBtns={true}
        confirmAction={() => {
          setDistributionErrorModal(false);
        }}
      />

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={`${DAILY_GOALS_CALENDAR.VIEW}?month=${
          month?.value?.toString() || ''
        }&year=${year?.value || ''}&collectionOperation=${
          collectionOperation?.value
        }&procedureType=${procedureType?.value}`}
      />
    </div>
  );
};
export default EditGoalsCalender;
