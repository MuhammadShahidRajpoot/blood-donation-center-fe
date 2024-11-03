import React, { useEffect, useState } from 'react';
import TopBar from '../../common/topbar/index';
import { OPERATIONS_CENTER } from '../../../routes/path';
import SvgComponent from '../../common/SvgComponent';
import styles from './index.module.scss';
import moment from 'moment';
import CalenderFilters from './calenderFilters';
import ToolTip from '../../common/tooltip';
import { Link } from 'react-router-dom';
import { API } from '../../../api/api-routes';
import DatePicker from '../../common/DatePicker';
import { formatUser } from '../../../helpers/formatUser';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import CloseDateUpsert from './CloseDate/CloseDateUpsert';
import LockDateUpsert from './LockDate/LockDateUpsert';
import loadingGif from '../../../assets/images/Degree37-Loader.gif';
import { toast } from 'react-toastify';
import { formatDateWithTZ } from '../../../helpers/convertDateTimeToTimezone';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

function SingleDate({
  date,
  data,
  holidayData,
  lockHolidayData,
  collectionOperationData,
  showDetailView,
  className,
  onDateClick,
  onShiftClick,
  onShiftClickDuplicate,
  onShiftClickDuplicateNce,
  onShiftClickDuplicateSession,
  taskToggle,
  goalsToggle,
  currentLinkToggle,
  availableToggle,
  showLockDayPopup,
  setShowLockDayPopup,
  setShowCloseDayPopup,
  showCloseDayPopup,
  endDates,
  setEndDates,
  startDates,
  setStartDates,
  updateDate,
  setUpdateDate,
  nceToggle,
  showDriveInsideToggle,
  showDriveOutsideToggle,
  sessionsToggle,
  viewDetaileds,
}) {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [isLinkIcon, setIsLinkIcon] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(0);
  const [staffBooked, setStaffBooked] = useState(0);
  const [staffAvailable, setStaffAvailable] = useState(0);
  const [vehicleBooked, setVehicleBooked] = useState(0);
  const [vehicleAvailable, setVehicleAvailable] = useState(0);
  const [deviceBooked, setDeviceBooked] = useState(0);
  const [deviceAvailable, setDeviceAvailable] = useState(0);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  let hasUnlinkedDrive = false;
  let matchingItem = false;
  let matchingLockItem = {
    status: false,
    id: null,
  };

  const isIntegerHandle = (item) => {
    if (Number?.isInteger(item)) {
      return item;
    } else {
      return item?.toFixed(2);
    }
  };

  if (data?.drives && data?.drives?.length) {
    data?.drives?.forEach((item) => {
      if (item?.drive?.is_linkable && !item?.drive?.is_linked) {
        hasUnlinkedDrive = true;
      }
    });
  }

  useEffect(() => {
    setIsLinkIcon(hasUnlinkedDrive);
  }, [hasUnlinkedDrive]);

  const totalDrivesTasksLength =
    data?.drives &&
    data?.drives?.length &&
    data?.drives?.reduce((accumulator, drive) => {
      const tasks = drive.task_names || [];
      return accumulator + tasks?.length;
    }, 0);
  const totalNceTasksLength =
    data?.nce &&
    data?.nce?.length &&
    data?.nce?.reduce((accumulator, nce) => {
      const tasks = nce.task_names || [];
      return accumulator + tasks?.length;
    }, 0);
  const totalSessionsTasksLength =
    data?.sessions &&
    data?.sessions?.length &&
    data?.sessions?.reduce((accumulator, session) => {
      const tasks = session?.task_names || [];
      return accumulator + tasks?.length;
    }, 0);

  const handleClick = (
    staffBooked,
    staffAvailable,
    vehicleBooked,
    vehicleAvailable,
    deviceBooked,
    deviceAvailable
  ) => {
    if (data && onDateClick) {
      onDateClick({
        ...data,
        staffBooked: staffBooked,
        staffAvailable: staffAvailable,
        vehicleBooked: vehicleBooked,
        vehicleAvailable: vehicleAvailable,
        deviceBooked: deviceBooked,
        deviceAvailable: deviceAvailable,
      });
    } else {
      onDateClick(false);
    }
  };
  const bookingSection = () => {
    if (
      sessionsToggle &&
      nceToggle &&
      showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(isIntegerHandle(data?.staff_booked));
      setVehicleBooked(isIntegerHandle(data?.vehicles_booked));
      setDeviceBooked(isIntegerHandle(data?.devices_booked));
      setStaffAvailable(isIntegerHandle(data?.staff_available));
      setVehicleAvailable(isIntegerHandle(data?.vehicles_available));
      setDeviceAvailable(isIntegerHandle(data?.devices_available));
    }
    if (
      !sessionsToggle &&
      nceToggle &&
      showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        isIntegerHandle(data?.staff_booked - data?.totalSesionsStaffCount)
      );
      setVehicleBooked(
        isIntegerHandle(data?.vehicles_booked - data?.totalSessionsVehicleCount)
      );
      setDeviceBooked(
        isIntegerHandle(data?.devices_booked - data?.totalSessionsDevicesCount)
      );
      setStaffAvailable(
        isIntegerHandle(data?.staff_available + data?.totalSesionsStaffCount)
      );
      setVehicleAvailable(
        isIntegerHandle(
          data?.vehicles_available + data?.totalSessionsVehicleCount
        )
      );
      setDeviceAvailable(
        isIntegerHandle(
          data?.devices_available + data?.totalSessionsDevicesCount
        )
      );
    }
    if (
      sessionsToggle &&
      nceToggle &&
      showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        isIntegerHandle(data?.staff_booked - data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        isIntegerHandle(
          data?.vehicles_booked - data?.totalOutsideDrivesVehicleCount
        )
      );
      setDeviceBooked(
        isIntegerHandle(
          data?.devices_booked - data?.totalOutsideDrivesDeviceCount
        )
      );
      setStaffAvailable(
        isIntegerHandle(
          data?.staff_available + data?.totalOutsideDrivesStaffCount
        )
      );
      setVehicleAvailable(
        isIntegerHandle(
          data?.vehicles_available + data?.totalOutsideDrivesVehicleCount
        )
      );
      setDeviceAvailable(
        isIntegerHandle(
          data?.devices_available + data?.totalOutsideDrivesDeviceCount
        )
      );
    }
    if (
      sessionsToggle &&
      nceToggle &&
      !showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        isIntegerHandle(data?.staff_booked - data?.totalInsideDrivesStaffCount)
      );
      setVehicleBooked(
        isIntegerHandle(
          data?.vehicles_booked - data?.totalInsideDrivesVehicleCount
        )
      );
      setDeviceBooked(
        isIntegerHandle(
          data?.devices_booked - data?.totalInsideDrivesDeviceCount
        )
      );
      setStaffAvailable(
        isIntegerHandle(
          data?.staff_available + data?.totalInsideDrivesStaffCount
        )
      );
      setVehicleAvailable(
        isIntegerHandle(
          data?.vehicles_available + data?.totalInsideDrivesVehicleCount
        )
      );
      setDeviceAvailable(
        isIntegerHandle(
          data?.devices_available + data?.totalInsideDrivesDeviceCount
        )
      );
    }
    if (
      sessionsToggle &&
      nceToggle &&
      !showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        isIntegerHandle(
          data?.staff_booked -
            (data?.totalInsideDrivesStaffCount +
              data?.totalOutsideDrivesStaffCount)
        )
      );
      setVehicleBooked(
        isIntegerHandle(
          data?.vehicles_booked -
            (data?.totalInsideDrivesVehicleCount +
              data?.totalOutsideDrivesVehicleCount)
        )
      );
      setDeviceBooked(
        isIntegerHandle(
          data?.devices_booked -
            (data?.totalInsideDrivesDeviceCount +
              data?.totalOutsideDrivesDeviceCount)
        )
      );
      setStaffAvailable(
        isIntegerHandle(
          data?.staff_available +
            data?.totalInsideDrivesStaffCount +
            data?.totalOutsideDrivesStaffCount
        )
      );
      setVehicleAvailable(
        isIntegerHandle(
          data?.vehicles_available +
            data?.totalInsideDrivesVehicleCount +
            data?.totalOutsideDrivesVehicleCount
        )
      );
      setDeviceAvailable(
        isIntegerHandle(
          data?.devices_available +
            data?.totalInsideDrivesDeviceCount +
            data?.totalOutsideDrivesDeviceCount
        )
      );
    }
    if (
      sessionsToggle &&
      !nceToggle &&
      showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(data?.staff_booked - data?.totalNceStaffCount);
      setVehicleBooked(data?.vehicles_booked - data?.totalNceVehicleCount);
      setDeviceBooked(data?.devices_booked - data?.totalNceDevicesCount);
      setStaffAvailable(data?.staff_available + data?.totalNceStaffCount);
      setVehicleAvailable(
        data?.vehicles_available + data?.totalNceVehicleCount
      );
      setDeviceAvailable(data?.devices_available + data?.totalNceDevicesCount);
    }
    if (
      sessionsToggle &&
      !nceToggle &&
      showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount + data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount + data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount + data?.totalOutsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalNceStaffCount + data?.totalOutsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalNceVehicleCount + data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalNceDevicesCount + data?.totalOutsideDrivesDeviceCount)
      );
    }
    if (
      sessionsToggle &&
      !nceToggle &&
      !showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount + data?.totalInsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount + data?.totalInsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount + data?.totalInsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalNceStaffCount + data?.totalInsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalNceVehicleCount + data?.totalInsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalNceDevicesCount + data?.totalInsideDrivesDeviceCount)
      );
    }
    if (
      sessionsToggle &&
      !nceToggle &&
      !showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount +
            data?.totalInsideDrivesStaffCount +
            data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount +
            data?.totalInsideDrivesVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount +
            data?.totalInsideDrivesDeviceCount +
            data?.totalOutsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalNceStaffCount +
            data?.totalInsideDrivesStaffCount +
            data?.totalOutsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalNceVehicleCount +
            data?.totalInsideDrivesVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalNceDevicesCount +
            data?.totalInsideDrivesDeviceCount +
            data?.totalOutsideDrivesDeviceCount)
      );
    }
    if (
      !sessionsToggle &&
      nceToggle &&
      showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalSesionsStaffCount + data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalSessionsVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalSessionsDevicesCount +
            data?.totalOutsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalSesionsStaffCount + data?.totalOutsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalSessionsVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalSessionsDevicesCount +
            data?.totalOutsideDrivesDeviceCount)
      );
    }
    if (
      !sessionsToggle &&
      nceToggle &&
      !showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalSesionsStaffCount + data?.totalInsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalSessionsVehicleCount +
            data?.totalInsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalSessionsDevicesCount + data?.totalInsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalSesionsStaffCount + data?.totalInsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalSessionsVehicleCount +
            data?.totalInsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalSessionsDevicesCount + data?.totalInsideDrivesDeviceCount)
      );
    }
    if (
      !sessionsToggle &&
      nceToggle &&
      !showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalSesionsStaffCount +
            data?.totalInsideDrivesStaffCount +
            data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalSessionsVehicleCount +
            data?.totalInsideDrivesVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalSessionsDevicesCount +
            data?.totalInsideDrivesDeviceCount +
            data?.totalOutsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          (data?.totalSesionsStaffCount +
            data?.totalInsideDrivesStaffCount +
            data?.totalOutsideDrivesStaffCount)
      );
      setVehicleAvailable(
        data?.vehicles_available +
          (data?.totalSessionsVehicleCount +
            data?.totalInsideDrivesVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceAvailable(
        data?.devices_available +
          (data?.totalInsideDrivesDeviceCount +
            data?.totalInsideDrivesDeviceCount +
            data?.totalOutsideDrivesDeviceCount)
      );
    }
    if (
      !sessionsToggle &&
      !nceToggle &&
      showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount + data?.totalSesionsStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount + data?.totalSessionsVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount + data?.totalSessionsDevicesCount)
      );
      setStaffAvailable(
        data?.staff_available +
          data?.totalNceStaffCount +
          data?.totalSesionsStaffCount
      );
      setVehicleAvailable(
        data?.vehicles_available +
          data?.totalNceVehicleCount +
          data?.totalSessionsVehicleCount
      );
      setDeviceAvailable(
        data?.devices_available +
          data?.totalNceDevicesCount +
          data?.totalSessionsDevicesCount
      );
    }
    if (
      !sessionsToggle &&
      !nceToggle &&
      showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount +
            data?.totalSesionsStaffCount +
            data?.totalOutsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount +
            data?.totalSessionsVehicleCount +
            data?.totalOutsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount +
            data?.totalSessionsDevicesCount +
            data?.totalOutsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          data?.totalNceStaffCount +
          data?.totalSesionsStaffCount +
          data?.totalOutsideDrivesStaffCount
      );
      setVehicleAvailable(
        data?.vehicles_available +
          data?.totalNceVehicleCount +
          data?.totalSessionsVehicleCount +
          data?.totalOutsideDrivesVehicleCount
      );
      setDeviceAvailable(
        data?.devices_available +
          data?.totalNceDevicesCount +
          data?.totalSessionsDevicesCount +
          data?.totalOutsideDrivesDeviceCount
      );
    }
    if (
      !sessionsToggle &&
      !nceToggle &&
      !showDriveInsideToggle &&
      showDriveOutsideToggle
    ) {
      setStaffBooked(
        data?.staff_booked -
          (data?.totalNceStaffCount +
            data?.totalSesionsStaffCount +
            data?.totalInsideDrivesStaffCount)
      );
      setVehicleBooked(
        data?.vehicles_booked -
          (data?.totalNceVehicleCount +
            data?.totalSessionsVehicleCount +
            data?.totalInsideDrivesVehicleCount)
      );
      setDeviceBooked(
        data?.devices_booked -
          (data?.totalNceDevicesCount +
            data?.totalSessionsDevicesCount +
            data?.totalInsideDrivesDeviceCount)
      );
      setStaffAvailable(
        data?.staff_available +
          data?.totalNceStaffCount +
          data?.totalSesionsStaffCount +
          data?.totalInsideDrivesStaffCount
      );
      setVehicleAvailable(
        data?.vehicles_available +
          data?.totalNceVehicleCount +
          data?.totalSessionsVehicleCount +
          data?.totalInsideDrivesVehicleCount
      );
      setDeviceAvailable(
        data?.devices_available +
          data?.totalNceDevicesCount +
          data?.totalSessionsDevicesCount +
          data?.totalInsideDrivesDeviceCount
      );
    }
    if (
      !sessionsToggle &&
      !nceToggle &&
      !showDriveInsideToggle &&
      !showDriveOutsideToggle
    ) {
      setStaffBooked(0);
      setVehicleBooked(0);
      setDeviceBooked(0);
      setStaffAvailable(
        data?.staff_available +
          data?.totalNceStaffCount +
          data?.totalSesionsStaffCount +
          data?.totalInsideDrivesStaffCount +
          data?.totalOutsideDrivesStaffCount
      );
      setVehicleAvailable(
        data?.vehicles_available +
          data?.totalNceVehicleCount +
          data?.totalSessionsVehicleCount +
          data?.totalInsideDrivesVehicleCount +
          data?.totalOutsideDrivesVehicleCount
      );
      setDeviceAvailable(
        data?.devices_available +
          data?.totalNceDevicesCount +
          data?.totalSessionsDevicesCount +
          data?.totalInsideDrivesDeviceCount +
          data?.totalOutsideDrivesDeviceCount
      );
    }
  };

  useEffect(() => {
    bookingSection();
  }, [
    sessionsToggle,
    nceToggle,
    showDriveInsideToggle,
    showDriveOutsideToggle,
    data,
  ]);

  const DuplicateHandleShiftClick = (data, name) => {
    // onShiftClickDuplicate(data);
    if (data && name === PolymorphicType.OC_OPERATIONS_DRIVES) {
      onShiftClickDuplicate(data);
    }
    if (data && name === 'nce') {
      onShiftClickDuplicateNce(data);
    }
    if (data && name === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      onShiftClickDuplicateSession(data);
    } else {
      onShiftClickDuplicate(false);
      onShiftClickDuplicateNce(false);
      onShiftClickDuplicateSession(false);
    }
  };
  if (holidayData?.length && data?.isHoliday) {
    matchingItem = true;
  }

  if (lockHolidayData?.length) {
    for (let holi of lockHolidayData) {
      const startDate = moment(holi?.start_date);
      const endDate = moment(holi?.end_date);

      const datesBetween = [];
      let currentDate = startDate.clone();

      while (currentDate.isSameOrBefore(endDate, 'day')) {
        datesBetween.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'day');
      }
      if (datesBetween?.length) {
        for (let desh of datesBetween) {
          if (moment(desh).isSame(moment(data?.date), 'day')) {
            matchingLockItem = {
              status: true,
              id: holi?.id,
            };
          }
        }
      }
    }
  }

  const handleUnlockDay = async (item) => {
    try {
      const res = await makeAuthorizedApiRequest(
        'DELETE',
        `${BASE_URL}/lock-dates/${item?.id}`
      );
      let { data, status, response } = await res.json();
      if (status === 'success') {
        setUpdateDate(!updateDate);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        // Handle bad request
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const insideLocations =
    data?.drives && data?.drives?.length
      ? data?.drives?.filter((item) =>
          item?.crm_locations ? item?.crm_locations?.site_type === 'Inside' : ''
        )
      : '';
  const insideLocationsCount = insideLocations?.length;

  const outsideLocations =
    data?.drives && data?.drives?.length
      ? data?.drives?.filter((item) =>
          item?.crm_locations
            ? item?.crm_locations?.site_type === 'Outside'
            : ''
        )
      : '';
  const outsideLocationsCount = outsideLocations?.length;

  const calculateProductScheduleFunc = () => {
    if (sessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        data?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives?.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        data?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setScheduleValue(0);
    }
  };
  const calculateProcedureScheduleFunc = () => {
    if (sessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        data?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives?.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data.drives.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      sessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.sessions && data?.sessions?.length > 0) {
        data?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        data?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !sessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (data?.drives && data?.drives?.length > 0) {
        const filteredDrives = data?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setScheduleValue(0);
    }
  };

  useEffect(() => {
    if (goalsToggle) {
      calculateProductScheduleFunc();
    } else {
      calculateProcedureScheduleFunc();
    }
  }, [data, sessionsToggle, showDriveOutsideToggle, showDriveInsideToggle]);

  return data ? (
    matchingItem ? (
      <div
        style={{ display: 'block' }}
        className={`${className} ${styles.daysOn}`}
      >
        <div className={styles.calendarHeader}>
          <div className={styles.date}>{date.format('DD')}</div>
        </div>
        <div className={styles.holidayDiv}>Holiday</div>
      </div>
    ) : (
      <>
        <div
          className={`${className} ${viewDetaileds ? styles.viewDetailed : ''}`}
        >
          <div className={styles.calendarHeader}>
            <div className={styles.date}>{date.format('DD')}</div>
            <div className={styles.headerBTN}>
              {availableToggle && (
                <>
                  <button className={styles.smallBtn}>
                    <ToolTip
                      className={styles.toolTip}
                      text={'Date Available (Outside)'}
                      icon={<SvgComponent name={'CalendarDirectionIcon'} />}
                    />
                  </button>
                  <button className={styles.smallBtn}>
                    <ToolTip
                      className={styles.toolTip}
                      text={' Date Available (Inside)'}
                      icon={<SvgComponent name={'CalendarHumidityIcon'} />}
                    />
                  </button>
                </>
              )}

              {isLinkIcon && currentLinkToggle && (
                <button className={styles.smallBtn}>
                  <ToolTip
                    className={styles.toolTip}
                    text={' Link Opportunity'}
                    icon={<SvgComponent name={'CalendarLinkIcon'} />}
                  />
                </button>
              )}
              {matchingLockItem?.status ? (
                <button className={styles.smallBtn}>
                  <ToolTip
                    className={styles.toolTip}
                    text={' Day Locked'}
                    icon={<SvgComponent name={'CalendarLockIcon'} />}
                  />
                </button>
              ) : (
                ''
              )}

              <button className={styles.smallBtn}>
                <ToolTip
                  className={styles.toolTip}
                  text1={`Shared Staff: ${data?.net_total_shared_staff}`}
                  text2={`Shared Vehicles: ${data?.net_total_shared_vehicles}`}
                  text3={`Shared Devices: ${data?.net_total_shared_devices}`}
                  icon={<SvgComponent name={'CalendarMoveDownIcon'} />}
                />
                &nbsp;10
              </button>
              <button
                className={styles.moreBtn}
                style={{ zIndex: '1' }}
                onClick={() => {
                  setDropDownOpen((prev) => !prev);
                }}
              >
                <SvgComponent name={'CalendarMoreIcon'} />
                <div
                  className="calendar-dropdown"
                  style={{
                    position: dropDownOpen ? 'relative' : 'initial',
                  }}
                >
                  <ul
                    className={`dropdown-menu ${dropDownOpen ? 'show' : ''}`}
                    style={{
                      backgroundColor: dropDownOpen ? '#F5F5F5' : 'initial',
                      position: dropDownOpen ? 'absolute' : 'initial',
                      left: dropDownOpen ? '-149px' : 'initial',
                      top: dropDownOpen ? '13px' : 'initial',
                    }}
                  >
                    <li>
                      <a
                        // onClick={() => handleDateLock(data)}
                        onClick={
                          matchingLockItem?.status
                            ? () => handleUnlockDay(matchingLockItem)
                            : () => {
                                setShowLockDayPopup(true);
                                setStartDates(
                                  new Date(data?.date)
                                  // moment(data?.date).format('MM/dd/yyyy')
                                );
                                setEndDates(
                                  new Date(data?.date)
                                  // moment(data?.date).format('MM/dd/yyyy')
                                );
                              }
                        }
                        className="dropdown-item"
                      >
                        {matchingLockItem?.status ? 'Unlock Day' : 'Lock Day'}
                      </a>
                    </li>
                    <li>
                      {/* <a
                        onClick={() => handleDateClose(data)}
                        className="dropdown-item"
                      > */}
                      <a
                        onClick={() => {
                          setShowCloseDayPopup(true);
                          setStartDates(
                            new Date(data?.date)
                            // moment(data?.date).format('MM/dd/yyyy')
                          );
                          setEndDates(
                            new Date(data?.date)
                            // moment(data?.date).format('MM/dd/yyyy')
                          );
                        }}
                        className="dropdown-item"
                      >
                        Close Date
                      </a>
                    </li>
                  </ul>
                  <div
                    className="overlay"
                    onClick={() => {
                      setDropDownOpen(false);
                    }}
                  ></div>
                </div>
              </button>
            </div>
          </div>
          <div
            className={styles.taskData}
            onClick={() =>
              handleClick(
                staffBooked,
                staffAvailable,
                vehicleBooked,
                vehicleAvailable,
                deviceBooked,
                deviceAvailable
              )
            }
          >
            {taskToggle && (
              <div className={styles.calendarTask}>
                <button className={styles.taskCount}>
                  {totalDrivesTasksLength +
                    totalNceTasksLength +
                    totalSessionsTasksLength}
                </button>
                Tasks
              </div>
            )}

            <div className={styles.taskDetails}>
              <h3>
                <span>Goal</span>
                {goalsToggle
                  ? data?.goal_products
                    ? Number.isInteger(data?.goal_products)
                      ? data?.goal_products?.toString()
                      : data?.goal_products?.toFixed(2)
                    : 0
                  : data?.goal_procedures
                  ? Number.isInteger(data?.goal_procedures)
                    ? data.goal_procedures?.toString()
                    : data.goal_procedures?.toFixed(2)
                  : 0}
              </h3>
              <h3>
                <span>{showDetailView ? 'Sch.' : 'Scheduled'}</span>
                {scheduleValue}
              </h3>
              <h3>
                <span>{showDetailView ? 'Act.' : 'Actual'}</span>
                {goalsToggle
                  ? data?.actual_products
                    ? Number.isInteger(data?.actual_products)
                      ? data?.actual_products?.toString()
                      : data?.actual_products?.toFixed(2)
                    : 0
                  : data?.actual_procedures
                  ? Number.isInteger(data?.actual_procedures)
                    ? data?.actual_procedures?.toString()
                    : data?.actual_procedures?.toFixed(2)
                  : 0}
              </h3>
              <br />
              <h3>
                <span>PA</span>
                {data?.date &&
                new Date(data?.date).toISOString().slice(0, 10) >=
                  new Date().toISOString().slice(0, 10)
                  ? '-'
                  : goalsToggle
                  ? scheduleValue &&
                    data?.actual_procedures &&
                    scheduleValue !== 0 &&
                    data?.actual_procedures !== 0
                    ? `${parseInt(
                        (data?.actual_products / scheduleValue) * 100,
                        10
                      )}%`
                    : '0%'
                  : scheduleValue &&
                    scheduleValue &&
                    scheduleValue !== 0 &&
                    data?.actual_procedures !== 0
                  ? `${parseInt(
                      (data?.actual_procedures / scheduleValue) * 100,
                      10
                    )}%`
                  : '0%'}
              </h3>
              <h3>
                <span>PG</span>
                {data?.date &&
                new Date(data?.date).toISOString().slice(0, 10) >=
                  new Date().toISOString().slice(0, 10)
                  ? '-'
                  : goalsToggle
                  ? data?.goal_products &&
                    data?.actual_products &&
                    data?.goal_products !== 0 &&
                    data?.actual_products !== 0
                    ? `${parseInt(
                        (data?.actual_products / data?.goal_products) * 100,
                        10
                      )}%`
                    : '0%'
                  : data?.goal_procedures &&
                    data?.actual_procedures &&
                    data?.goal_procedures !== 0 &&
                    data?.actual_procedures !== 0
                  ? `${parseInt(
                      (data?.actual_procedures / data?.goal_procedures) * 100,
                      10
                    )}%`
                  : '0%'}
              </h3>
            </div>
            <div className={styles.taskResources}>
              <div className="view-flex">
                <h4>
                  <ToolTip
                    className={styles.toolTip}
                    text1={`Booked: ${staffBooked}`}
                    text2={`Available: ${staffAvailable}`}
                    calendarIcon={true}
                    childeren={'Staff: '}
                  />
                  <span>{`${staffBooked}/${staffAvailable}`}</span>
                </h4>
                <h4>
                  <ToolTip
                    className={styles.toolTip}
                    text1={`Booked: ${vehicleBooked}`}
                    text2={`Available: ${vehicleAvailable}`}
                    calendarIcon={true}
                    childeren={'Vehicles: '}
                  />
                  <span>{`${vehicleBooked}/${vehicleAvailable}`}</span>
                </h4>
                <h4>
                  <ToolTip
                    className={styles.toolTip}
                    text1={`Booked: ${deviceBooked}`}
                    text2={`Available: ${deviceAvailable}`}
                    calendarIcon={true}
                    childeren={'Devices: '}
                  />
                  <span>{`${deviceBooked}/${deviceAvailable}`}</span>
                </h4>
              </div>
              <button className={styles.resourcesCountBtn}>
                <ToolTip
                  className={styles.toolTip}
                  text1={`Drives: ${
                    showDriveInsideToggle && showDriveOutsideToggle
                      ? insideLocationsCount + outsideLocationsCount
                      : showDriveInsideToggle
                      ? insideLocationsCount
                      : showDriveOutsideToggle
                      ? outsideLocationsCount
                      : '0'
                  }`}
                  text2={`Sessions: ${
                    sessionsToggle && data?.sessions && data?.sessions?.length
                      ? data?.sessions?.length
                      : '0'
                  }`}
                  text3={`Events: ${
                    nceToggle && data?.nce && data?.nce?.length
                      ? data?.nce?.length
                      : '0'
                  }`}
                  calendarIcon={true}
                  childerenButtonText={(
                    (showDriveInsideToggle && showDriveOutsideToggle
                      ? insideLocationsCount + outsideLocationsCount
                      : showDriveInsideToggle
                      ? insideLocationsCount
                      : showDriveOutsideToggle
                      ? outsideLocationsCount
                      : 0) +
                    (sessionsToggle && data?.sessions && data?.sessions?.length
                      ? data?.sessions?.length
                      : 0) +
                    (nceToggle && data?.nce && data?.nce?.length
                      ? data?.nce?.length
                      : 0)
                  ).toString()}
                />
              </button>
            </div>
          </div>
          <div className="calendarTaskList">
            {showDetailView && data?.drives && data?.drives?.length
              ? data?.drives
                  ?.filter((item) => {
                    if (
                      !showDriveInsideToggle &&
                      item.crm_locations.site_type === 'Inside'
                    ) {
                      return false;
                    }

                    if (
                      !showDriveOutsideToggle &&
                      item.crm_locations.site_type === 'Outside'
                    ) {
                      return false;
                    }

                    return true;
                  })
                  ?.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className={styles.listBox}
                        onClick={() =>
                          DuplicateHandleShiftClick(
                            item,
                            PolymorphicType.OC_OPERATIONS_DRIVES
                          )
                        }
                      >
                        <div
                          className={
                            item.crm_locations.site_type === 'Inside'
                              ? styles.darkBlueBox
                              : styles.whiteBox
                          }
                        >
                          <div className={styles.listCenterTitle}>
                            <h4
                              className={`${styles.listTitle} ${
                                item?.drive?.operation_status_id?.chip_color ===
                                'Grey'
                                  ? styles.greyChip
                                  : item?.drive?.operation_status_id
                                      ?.chip_color === 'Green'
                                  ? styles.greenChip
                                  : item?.drive?.operation_status_id
                                      ?.chip_color === 'Yellow'
                                  ? styles.yellowChip
                                  : item?.drive?.operation_status_id
                                      ?.chip_color === 'Red'
                                  ? styles.redChip
                                  : item?.drive?.operation_status_id
                                      ?.chip_color === 'Blue'
                                  ? styles.blueChip
                                  : item?.drive?.operation_status_id
                                      ?.chip_color === 'Lavender'
                                  ? styles.lavendarChip
                                  : styles.green
                              }`}
                            >
                              {item?.linkedName ? item.linkedName : ''}{' '}
                              {item?.linkedName ? (
                                <span>
                                  {item?.account?.name
                                    ? item?.account?.name
                                    : 'N/A'}
                                </span>
                              ) : (
                                `${
                                  item?.account?.name
                                    ? item?.account?.name
                                    : 'N/A'
                                }`
                              )}
                            </h4>
                            <h4 className={styles.lisTtime}>
                              {item?.shifts_data?.earliest_shift_start_time
                                ? `${formatDateWithTZ(
                                    item?.shifts_data
                                      ?.earliest_shift_start_time,
                                    'HH:mm'
                                  )} - ${formatDateWithTZ(
                                    item?.shifts_data?.latest_shift_return_time,
                                    'HH:mm'
                                  )}`
                                : ''}
                            </h4>
                          </div>
                          <div className={styles.listCenterDescription}>
                            <p className={styles.description}>
                              {formatUser(item?.recruiter, 1)
                                ? formatUser(item?.recruiter, 1)
                                : 'N/A'}
                            </p>
                            <p className={styles.discCount}>
                              {goalsToggle
                                ? item?.projections?.total_product_yield
                                  ? item?.projections?.total_product_yield
                                  : ''
                                : item?.projections?.total_procedure_type_qty
                                ? item?.projections?.total_procedure_type_qty
                                : ''}{' '}
                              {item?.projections?.total_product_yield &&
                              item?.projections?.total_procedure_type_qty ? (
                                <span>
                                  {item?.staff_setups_count &&
                                  item?.staff_setups_count?.length
                                    ? item?.staff_setups_count?.map(
                                        (items, index) => {
                                          const isLastItem =
                                            index ===
                                            item?.staff_setups_count?.length -
                                              1;
                                          return (
                                            <React.Fragment key={index}>
                                              {`${items}`}
                                              {isLastItem ? '' : ', '}
                                            </React.Fragment>
                                          );
                                        }
                                      )
                                    : ''}
                                </span>
                              ) : item?.staff_setups_count &&
                                item?.staff_setups_count?.length ? (
                                item?.staff_setups_count?.map(
                                  (items, index) => {
                                    const isLastItem =
                                      index ===
                                      item?.staff_setups_count?.length - 1;
                                    return (
                                      <React.Fragment key={index}>
                                        {`${items}`}
                                        {isLastItem ? '' : ', '}
                                      </React.Fragment>
                                    );
                                  }
                                )
                              ) : (
                                ''
                              )}
                              {item?.vehicles && item?.vehicles?.length
                                ? item?.vehicles?.map((short, index) => {
                                    return (
                                      <React.Fragment key={index}>
                                        {`${
                                          short?.short_name
                                            ? ` , ${short?.short_name}`
                                            : ''
                                        }`}
                                      </React.Fragment>
                                    );
                                  })
                                : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
              : ''}
            {showDetailView && nceToggle && data?.nce && data?.nce?.length
              ? data?.nce?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={styles.listBox}
                      onClick={() => DuplicateHandleShiftClick(item, 'nce')}
                    >
                      <div className={styles.blueBox}>
                        <div className={styles.listCenterTitle}>
                          <h4
                            className={`${styles.listTitle} ${
                              item?.status?.operation_status_id?.chip_color ===
                              'Grey'
                                ? styles.greyChip
                                : item?.status?.operation_status_id
                                    ?.chip_color === 'Green'
                                ? styles.greenChip
                                : item?.status?.operation_status_id
                                    ?.chip_color === 'Yellow'
                                ? styles.yellowChip
                                : item?.status?.operation_status_id
                                    ?.chip_color === 'Red'
                                ? styles.redChip
                                : item?.status?.operation_status_id
                                    ?.chip_color === 'Blue'
                                ? styles.blueChip
                                : item?.status?.operation_status_id
                                    ?.chip_color === 'Lavender'
                                ? styles.lavendarChip
                                : styles.green
                            }`}
                          >
                            {item?.ncp?.non_collection_profile?.name
                              ? item?.ncp?.non_collection_profile?.name
                              : 'N?A'}
                          </h4>
                          <h4 className={styles.lisTtime}>
                            {item?.shifts_data?.latest_shift_return_time
                              ? `${formatDateWithTZ(
                                  item?.shifts_data?.earliest_shift_start_time,
                                  'HH:mm'
                                )} - ${formatDateWithTZ(
                                  item?.shifts_data?.latest_shift_return_time,
                                  'HH:mm'
                                )}`
                              : ''}
                          </h4>
                        </div>
                        <div className={styles.listCenterDescription}>
                          <p className={styles.description}></p>
                          <p className={styles.discCount}>
                            {/* {goalsToggle
                              ? item?.projections?.total_product_yield
                                ? item?.projections?.total_product_yield
                                : ''
                              : item?.projections?.total_procedure_type_qty
                              ? item?.projections?.total_procedure_type_qty
                              : ''}{' '} */}
                            {goalsToggle
                              ? item?.projections?.total_product_yield
                              : item?.projections
                                  ?.total_procedure_type_qty}{' '}
                            {/* {item?.projections?.total_product_yield &&
                            item?.projections?.total_procedure_type_qty ? (
                              <span>
                                {item?.staff_setups_count &&
                                item?.staff_setups_count?.length
                                  ? item?.staff_setups_count?.map(
                                      (items, index) => {
                                        const isLastItem =
                                          index ===
                                          item?.staff_setups_count?.length - 1;
                                        return (
                                          <React.Fragment key={index}>
                                            {`${items}`}
                                            {isLastItem ? '' : ', '}
                                          </React.Fragment>
                                        );
                                      }
                                    )
                                  : ''}
                              </span>
                            ) : item?.staff_setups_count &&
                              item?.staff_setups_count?.length ? (
                              item?.staff_setups_count?.map((items, index) => {
                                const isLastItem =
                                  index ===
                                  item?.staff_setups_count?.length - 1;
                                return (
                                  <React.Fragment key={index}>
                                    {`${items}`}
                                    {isLastItem ? '' : ', '}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              ''
                            )} */}
                            {item?.vehicles && item?.vehicles?.length
                              ? item?.vehicles?.map((short, index) => {
                                  return (
                                    <React.Fragment key={index}>
                                      {`${
                                        short?.short_name
                                          ? ` , ${short?.short_name}`
                                          : ''
                                      }`}
                                    </React.Fragment>
                                  );
                                })
                              : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              : ''}
            {showDetailView &&
            sessionsToggle &&
            data?.sessions &&
            data?.sessions?.length
              ? data?.sessions?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={styles.listBox}
                      onClick={() =>
                        DuplicateHandleShiftClick(
                          item,
                          PolymorphicType.OC_OPERATIONS_SESSIONS
                        )
                      }
                    >
                      <div className={styles.lightBlueBox}>
                        <div className={styles.listCenterTitle}>
                          <h4
                            className={`${styles.listTitle} ${
                              item?.oc_chip_color === 'Grey'
                                ? styles.greyChip
                                : item?.oc_chip_color === 'Green'
                                ? styles.greenChip
                                : item?.oc_chip_color === 'Yellow'
                                ? styles.yellowChip
                                : item?.oc_chip_color === 'Red'
                                ? styles.redChip
                                : item?.oc_chip_color === 'Blue'
                                ? styles.blueChip
                                : item?.oc_chip_color === 'Lavender'
                                ? styles.lavendarChip
                                : styles.green
                            }`}
                          >
                            {item?.dc_name}
                          </h4>
                          <h4 className={styles.lisTtime}>
                            {item?.shifts_data?.latest_shift_return_time
                              ? `${formatDateWithTZ(
                                  item?.shifts_data?.earliest_shift_start_time,
                                  'HH:mm'
                                )} - ${formatDateWithTZ(
                                  item?.shifts_data?.latest_shift_return_time,
                                  'HH:mm'
                                )}`
                              : ''}
                          </h4>
                        </div>
                        <div className={styles.listCenterDescription}>
                          <p className={styles.description}></p>
                          <p className={styles.discCount}>
                            {goalsToggle
                              ? item?.projections?.total_product_yield
                                ? item?.projections?.total_product_yield
                                : ''
                              : item?.projections?.total_procedure_type_qty
                              ? item?.projections?.total_procedure_type_qty
                              : ''}{' '}
                            {item?.projections?.total_product_yield &&
                            item?.projections?.total_procedure_type_qty ? (
                              <span>
                                {item?.staff_setups_count &&
                                item?.staff_setups_count?.length
                                  ? item?.staff_setups_count?.map(
                                      (items, index) => {
                                        const isLastItem =
                                          index ===
                                          item?.staff_setups_count?.length - 1;
                                        return (
                                          <React.Fragment key={index}>
                                            {`${items}`}
                                            {isLastItem ? '' : ', '}
                                          </React.Fragment>
                                        );
                                      }
                                    )
                                  : ''}
                              </span>
                            ) : item?.staff_setups_count &&
                              item?.staff_setups_count?.length ? (
                              item?.staff_setups_count?.map((items, index) => {
                                const isLastItem =
                                  index ===
                                  item?.staff_setups_count?.length - 1;
                                return (
                                  <React.Fragment key={index}>
                                    {`${items}`}
                                    {isLastItem ? '' : ', '}
                                  </React.Fragment>
                                );
                              })
                            ) : (
                              ''
                            )}
                            {/* {item?.vehicles && item?.vehicles?.length
                              ? item?.vehicles?.map((short, index) => {
                                  return (
                                    <React.Fragment key={index}>
                                      {`${
                                        short?.short_name
                                          ? ` , ${short?.short_name}`
                                          : ''
                                      }`}
                                    </React.Fragment>
                                  );
                                })
                              : ''} */}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              : ''}
          </div>
        </div>
      </>
    )
  ) : (
    <div className={className}>{date.format('DD')}</div>
  );
}

export default function ViewCalendar() {
  const [months] = useState([
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]);
  const [weekMode, setWeekMode] = useState('false');
  const [date, setDate] = useState(new Date());
  const [showYear, setShowYear] = useState(moment(new Date()).format('YYYY'));
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupDetailsOpen, setPopupDetailsOpen] = useState(false);
  const [updateDate, setUpdateDate] = useState(false);
  const [popupDetailsOpenDuplicate, setPopupDetailsOpenDuplicate] =
    useState(false);
  const [popupNceDetailsOpenDuplicate, setPopupNceDetailsOpenDuplicate] =
    useState(false);
  const [
    popupSessionDetailsOpenDuplicate,
    setPopupSessionDetailsOpenDuplicate,
  ] = useState(false);
  const [frontDetailData, setFrontDetailData] = useState({});
  const [frontNceDetailData, setFrontNceDetailData] = useState({});
  const [frontSessionDetailData, setFrontSessionDetailData] = useState({});
  const [showAllInfo, setShowAllInfo] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDriveFilters, setShowDriveFilter] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [goalsToggle, setGoalsToggle] = useState(false);
  const [popupToggleProd, setPopupToggleProd] = useState(false);
  const [showTaskToggle, setShowTaskToggle] = useState(true);
  const [showDriveInsideToggle, setShowDriveInsideToggle] = useState(true);
  const [showDriveOutsideToggle, setShowDriveOutsideToggle] = useState(true);
  const [showNceToggle, setShowNceToggle] = useState(true);
  const [showCurrentLintToggle, setShowCurrentLintToggle] = useState(true);
  const [showAvailableDateToggle, setShowAvailableDateToggle] = useState(true);
  const [showUnderGoalToggle, setShowUnderGoalToggle] = useState(true);
  const [showSessionsToggle, setShowSessionsToggle] = useState(true);
  const [sortingCriteria, setSortingCriteria] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [activeTab, setActiveTab] = useState('Drives');
  const [calenderViewData, setCalenderViewData] = useState([]);
  const [popupSideDetailsOpen, setPopupSideDetailsOpen] = useState(false);
  const [popupSideDetailsNceOpen, setPopupSideDetailsNceOpen] = useState(false);
  const [openMonthPopUp, setOpenMonthPopUp] = useState(false);
  const [openYearPopUp, setOpenYearPopUp] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [goalVarianceData, setGoalVarianceData] = useState();
  const [filterApplied, setFilterApplied] = useState({});
  const [driveDetailsData, setDriveDetailsData] = useState({});
  const [nceDetailsData, setNceDetailsData] = useState({});
  const [sessionDetailsData, setSessionDetailsData] = useState({});
  const [popupSideDetailsSessionOpen, setPopupSideDetailsSessionOpen] =
    useState(false);
  const [activeNotiTab, setActiveNotiTab] = useState('Banners');
  const [showBannerToggle, setShowBannerToggle] = useState(true);
  const [showPromotionToggle, setShowPromotionToggle] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState();
  const [promotionsData, setPromotionsData] = useState([]);
  const [bannersData, setBannersData] = useState([]);
  const [isLinkIcon, setIsLinkIcon] = useState(false);
  const [bannersCoData, setBannersCoData] = useState([]);
  const [scheduleValue, setScheduleValue] = useState(0);
  const [legendScheduleValue, setLegendScheduleValue] = useState(0);
  const [legendDriveValue, setLegendDriveValue] = useState(0);
  const [legendSessionValue, setLegendSessionValue] = useState(0);
  const [getDataDepend, setGetDataDepend] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const bearerToken = localStorage.getItem('token');

  // let currentMonth = date.getMonth();

  const handleNotiClick = (tab) => {
    setActiveNotiTab(tab);
  };

  const monthsData = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const yearsData = [
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
  ];

  const [currentMonths, setCurrentMonths] = useState(new Date().getMonth());
  const [holidayData, setHolidayData] = useState([]);
  const [lockHolidayData, setLockHolidayData] = useState([]);
  const [viewName, setViewName] = useState('');
  const [collectionOperationData, setCollectionOperation] = useState([]);
  const [showLockDayPopup, setShowLockDayPopup] = useState(false);
  const [showCloseDayPopup, setShowCloseDayPopup] = useState(false);
  const [isGoTo, setIsGoTo] = useState(false);
  const [endDates, setEndDates] = useState('');
  const [startDates, setStartDates] = useState('');
  const [clearFilters, setClearFilters] = useState(false);
  const [weekDates, setWeekDates] = useState({
    start: '',
    end: '',
  });

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const getGoalVarianceData = async () => {
      const { data } =
        await API.operationCenter.calender.goalvariance.getGoalVariance(
          bearerToken
        );
      if (data?.data) {
        setGoalVarianceData(data?.data);
      }
    };
    getGoalVarianceData();
  }, [isGoTo, updateDate]);

  useEffect(() => {
    const getPromotionData = async () => {
      const { data } = await API.operationCenter.calender.getPromotions(
        bearerToken,
        currentMonths + 1,
        showYear
      );
      if (data?.status === 200) {
        setPromotionsData(data?.data);
      }
    };
    const getBannersData = async () => {
      const { data } = await API.operationCenter.calender.getBanners(
        bearerToken,
        currentMonths + 1,
        showYear
      );
      if (data?.status === 200) {
        setBannersData(data?.data);
        setBannersCoData(data?.data?.collectionOperations);
      }
    };
    if (showYear >= 0 && currentMonths >= 0) {
      getPromotionData();
      getBannersData();
    }
  }, [showYear, currentMonths]);

  let hasUnlinkedDrive = false;

  if (selectedDate?.drives && selectedDate?.drives?.length) {
    selectedDate?.drives?.forEach((item) => {
      if (item?.drive?.is_linkable && !item?.drive?.is_linked) {
        hasUnlinkedDrive = true;
      }
    });
  }

  useEffect(() => {
    setIsLinkIcon(hasUnlinkedDrive);
  }, [hasUnlinkedDrive]);

  const getData = async (monthNumber, year) => {
    setIsLoading(true);
    setCurrentMonths(monthNumber - 1);
    setShowYear(year);
    const { data } = await API.operationCenter.calender.getView(
      bearerToken,
      monthNumber,
      year,
      weekMode === 'true' ??
        moment(weekDates.start).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      weekMode === 'true' ??
        moment(weekDates.end).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      weekMode === 'true' ?? 'week_view'
    );
    if (data?.status_code === 200) {
      setCalenderViewData(data?.data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setViewName(popupToggleProd ? 'product' : goalsToggle ? 'product' : '');

      if (currentMonths >= 0 && showYear) {
        setIsLoading(true);

        try {
          const { data } = await API.operationCenter.calender.getView(
            bearerToken,
            +currentMonths + 1,
            showYear,
            popupToggleProd ? 'product' : goalsToggle ? 'product' : '',
            weekMode === 'true'
              ? moment(weekDates.start).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
              : '',
            weekMode === 'true'
              ? moment(weekDates.end).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
              : '',
            weekMode === 'true' ? 'week_view' : ''
          );

          if (data?.status_code === 200) {
            setCalenderViewData(data?.data);
            if (weekMode === 'true') {
              renderCalendar();
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [
    currentMonths,
    showYear,
    goalsToggle,
    popupToggleProd,
    clearFilters,
    updateDate,
    weekDates,
    weekMode,
  ]);

  useEffect(() => {
    const handleGetCloseDate = async () => {
      try {
        const { data } =
          await API.operationCenter.calender.getCloseDate(bearerToken);
        if (data?.data?.length) {
          setHolidayData(data?.data);
        }
      } catch (e) {
        console.log(e);
      }
    };
    const handleGetLockDate = async () => {
      try {
        const { data } =
          await API.operationCenter.calender.getLockDate(bearerToken);
        if (data?.data?.length) {
          setLockHolidayData(data?.data);
        }
      } catch (e) {
        console.log(e);
      }
    };
    const handleGetCollectionOperation = async () => {
      try {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/business_units/collection_operations/list?status=true`
        );
        const { data } = await result.json();
        if (data?.length) {
          const transformedData = data?.map((item) => +item?.id);
          setCollectionOperation(transformedData);
        }
      } catch (e) {
        console.log(e);
      }
    };
    handleGetCloseDate();
    handleGetLockDate();
    handleGetCollectionOperation();
  }, [updateDate]);

  const handleMonthClick = (index) => {
    setCurrentMonths(index);
    setOpenMonthPopUp(false);
    setOpenYearPopUp(false);
    const newDate = new Date(date);
    setDate(newDate);
  };
  const handleYearClick = (index) => {
    const newDate = new Date(date);
    setShowYear(index);
    newDate.setFullYear(index);
    setDate(newDate);
    setOpenYearPopUp(false);
    setOpenMonthPopUp(false);
  };

  const handleClick = (tab) => {
    setActiveTab(tab);
    setDriveDetailsData({});
    setNceDetailsData({});
    setSessionDetailsData({});
    setPopupSideDetailsOpen(false);
    setPopupSideDetailsNceOpen(false);
    setPopupSideDetailsSessionOpen(false);
  };
  const handleGoTo = async () => {
    const { weekStart, weekEnd } = getCurrentWeek(new Date());
    setWeekDates({
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
    // const getMonth = new Date().getMonth() + 1;
    const getYear = new Date().getFullYear();
    setCurrentMonths(new Date().getMonth());
    setShowYear(getYear);
    setIsLoading(true);
    setDate(new Date());
    setStartDate('');
  };

  const handlePrevClick = () => {
    if (weekMode === 'true') {
      const start = new Date(weekDates.start);
      const end = new Date(weekDates.end);

      start.setDate(start.getDate() - 7);
      end.setDate(end.getDate() - 7);

      setWeekDates({
        start,
        end,
      });
    } else {
      const newDate = new Date(date);
      const newMonth = currentMonths - 1;
      newDate.setMonth(newMonth);
      if (newMonth < 0) {
        newDate.setFullYear(date.getFullYear() - 1);
        setShowYear(newDate.getFullYear());
        setCurrentMonths(11);
      } else {
        setShowYear(newDate.getFullYear());
        setCurrentMonths(newMonth);
      }

      setDate(newDate);
    }
  };

  const handleNextClick = () => {
    if (weekMode === 'true') {
      const start = new Date(weekDates.start);
      const end = new Date(weekDates.end);

      start.setDate(start.getDate() + 7);
      end.setDate(end.getDate() + 7);

      setWeekDates({
        start,
        end,
      });
    } else {
      const newDate = new Date(date);
      const newMonth = currentMonths + 1;
      newDate.setMonth(newMonth);

      if (newMonth > 11) {
        newDate.setFullYear(date.getFullYear() + 1);
        setShowYear(newDate.getFullYear());
        setCurrentMonths(0);
      } else {
        setShowYear(newDate.getFullYear());
        setCurrentMonths(newMonth);
      }

      setDate(newDate);
    }
  };

  const getCurrentWeek = (currentDate) => {
    const weekStart = moment(currentDate).clone().startOf('week');
    const weekEnd = moment(currentDate).clone().endOf('week');

    return { weekStart, weekEnd };
  };
  const renderCalendar = () => {
    const firstDay = new Date(showYear, currentMonths, 1);
    const lastDay = new Date(showYear, currentMonths + 1, 0);
    const totalDaysInMonth = moment(firstDay).daysInMonth();
    const prevLastDay = new Date(showYear, currentMonths, 0);
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const startAdditionalDays = firstDayIndex;
    const endAdditionalDays = 6 - lastDayIndex;

    const getDatesInRange = (start, end) => {
      const startDate = moment(start);
      const endDate = moment(end);
      const datesArray = [];

      while (startDate <= endDate) {
        datesArray.push(startDate.format('DDMMYYYY'));
        startDate.add(1, 'days');
      }

      return datesArray;
    };

    const datesBetween = bannersData?.map((banner) => ({
      id: banner.id,
      datesInRange: getDatesInRange(banner?.start_date, banner?.end_date),
    }));

    const PromotionDatesBetween = promotionsData?.map((banner) => ({
      id: banner.id,
      datesInRange: getDatesInRange(banner?.start_date, banner?.end_date),
    }));

    const dates1 = datesBetween?.map((obj) => obj.datesInRange).flat();
    const dates2 = PromotionDatesBetween?.map((obj) => obj.datesInRange).flat();

    const duplicates = dates1.filter((date) => dates2.includes(date));

    function isDateWithinRange(date, startDate, endDate) {
      return date >= startDate && date <= endDate;
    }
    let filteredDates = [];
    if (bannersData?.length && calenderViewData?.length) {
      filteredDates = calenderViewData?.filter((calendarDate) => {
        const date = calendarDate?.date;
        return bannersData?.some((banner) =>
          isDateWithinRange(date, banner?.start_date, banner?.end_date)
        );
      });
    }

    const filteredPromotionDates = calenderViewData?.filter((calendarDate) => {
      const date = calendarDate?.date;
      return promotionsData?.some((banner) =>
        isDateWithinRange(date, banner.start_date, banner.end_date)
      );
    });

    function getWeekDates(startDate) {
      const sunday = new Date(startDate);
      const result = [];

      // Find Sunday of the current week
      sunday.setDate(sunday.getDate() - sunday.getDay());

      // Generate dates from Sunday to Saturday for the week
      for (let i = 0; i < 7; i++) {
        result.push(new Date(sunday).toISOString().slice(0, 10));
        sunday.setDate(sunday.getDate() + 1);
      }
      return result;
    }

    function getPromotionWeekDates(startDate) {
      const sunday = new Date(startDate);
      const result = [];

      // Find Sunday of the current week
      sunday.setDate(sunday.getDate() - sunday.getDay());

      // Generate dates from Sunday to Saturday for the week
      for (let i = 0; i < 7; i++) {
        result.push(new Date(sunday).toISOString().slice(0, 10));
        sunday.setDate(sunday.getDate() + 1);
      }
      return result;
    }

    const allWeekDates = filteredDates.reduce((acc, item) => {
      const weekDates = getWeekDates(item.date);
      return [...acc, ...weekDates];
    }, []);

    const allPromotionWeekDates = filteredPromotionDates?.reduce(
      (acc, item) => {
        const weekDates = getPromotionWeekDates(item?.date);
        return [...acc, ...weekDates];
      },
      []
    );

    // Get unique week dates and sort them
    const uniqueWeekDates = Array.from(new Set(allWeekDates)).sort();
    const uniquePromotionWeekDates = Array.from(
      new Set(allPromotionWeekDates)
    ).sort();
    let mergedArray;
    mergedArray = uniqueWeekDates.concat(uniquePromotionWeekDates);
    const dateCounts = mergedArray.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Filter out dates that occur more than once (duplicates)
    const duplicateDates = Object.keys(dateCounts).filter(
      (date) => dateCounts[date] > 1
    );

    if (showBannerToggle && showPromotionToggle) {
      mergedArray = uniqueWeekDates.concat(uniquePromotionWeekDates);
    } else if (!showBannerToggle && showPromotionToggle) {
      mergedArray = mergedArray.filter(
        (date) => !uniqueWeekDates.includes(date)
      );
    } else if (showBannerToggle && !showPromotionToggle) {
      mergedArray = mergedArray.filter(
        (date) => !uniquePromotionWeekDates.includes(date)
      );
    } else if (!showBannerToggle && !showPromotionToggle) {
      mergedArray = [];
    }

    const days = [];
    if (weekMode === 'false') {
      for (let i = startAdditionalDays - 1; i >= 0; i--) {
        const currentDate = moment(prevLastDay).subtract(i, 'days');
        const { weekStart, weekEnd } = getCurrentWeek(new Date());
        const inCurrentWeek = currentDate.isBetween(
          weekStart,
          weekEnd,
          'days',
          '[]'
        );
        days.push(
          <div
            className={`${inCurrentWeek ? 'current-week' : ''} ${
              styles.prevdate
            }`}
            style={{
              marginTop: `${
                duplicateDates?.some(
                  (item) =>
                    item ===
                    moment(prevLastDay).subtract(i, 'days').format('YYYY-MM-DD')
                )
                  ? bannersData?.length > 1 || promotionsData?.length > 1
                    ? showPromotionToggle && showBannerToggle
                      ? '95px'
                      : !showPromotionToggle && showBannerToggle
                      ? '62px'
                      : showPromotionToggle && !showBannerToggle
                      ? '57px'
                      : !showPromotionToggle && !showBannerToggle
                      ? '0px'
                      : ''
                    : showPromotionToggle && showBannerToggle
                    ? '62px'
                    : !showPromotionToggle && showBannerToggle
                    ? '31px'
                    : showPromotionToggle && !showBannerToggle
                    ? '31px'
                    : !showPromotionToggle && !showBannerToggle
                    ? '0px'
                    : ''
                  : mergedArray?.some(
                      (item) =>
                        item ===
                        moment(prevLastDay)
                          .subtract(i, 'days')
                          .format('YYYY-MM-DD')
                    )
                  ? bannersData?.length === 1 || promotionsData?.length === 1
                    ? showPromotionToggle && showBannerToggle
                      ? '31px'
                      : !showPromotionToggle && showBannerToggle
                      ? '31px'
                      : showPromotionToggle && !showBannerToggle
                      ? '31px'
                      : !showPromotionToggle && !showBannerToggle
                      ? '0px'
                      : ''
                    : '60px'
                  : ''
              }`,
              position: 'relative',
            }}
          >
            {showPromotionToggle &&
            promotionsData?.length > 1 &&
            uniquePromotionWeekDates?.some(
              (item) =>
                item ===
                moment(prevLastDay).subtract(i, 'days').format('YYYY-MM-DD')
            ) ? (
              <div
                style={{ position: 'absolute' }}
                className={styles.Bcontainer}
              >
                <div
                  style={{
                    position: 'absolute',
                    // left: '-680%',
                    // width: '1400%',
                    top: '-38px',
                    height: '28px',
                    left: '-14px',
                    width: '102%',
                  }}
                  className={styles.BnotificationBox}
                  onClick={() => {
                    setShowModal(true);
                    setActiveNotiTab('Banners');
                  }}
                >
                  {uniquePromotionWeekDates?.some((item, index) => {
                    const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                    const dataDateIndex = uniquePromotionWeekDates.indexOf(
                      moment(prevLastDay)
                        .subtract(i, 'days')
                        .format('YYYY-MM-DD')
                    );

                    // Check if the current date is the 4th day of the week
                    return (
                      dataDateIndex !== -1 &&
                      dataDateIndex % 7 === fourthDayIndex
                    );
                  }) ? (
                    <div className={styles.BnotificationText}>
                      {bannersData?.length
                        ? bannersData?.length - 1
                        : 0 +
                          (promotionsData?.length
                            ? promotionsData?.length - 1
                            : 0)}{' '}
                      more...
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ) : (
              ''
            )}
            {showBannerToggle &&
            bannersData?.length > 1 &&
            uniqueWeekDates?.some(
              (item) =>
                item ===
                moment(prevLastDay).subtract(i, 'days').format('YYYY-MM-DD')
            ) ? (
              <div
                style={{ position: 'absolute' }}
                className={styles.Bcontainer}
              >
                <div
                  style={{
                    position: 'absolute',
                    // left: '-680%',
                    // width: '1400%',
                    top: '-38px',
                    height: '28px',
                    left: '-14px',
                    width: '102%',
                  }}
                  className={styles.BnotificationBox}
                  onClick={() => {
                    setShowModal(true);
                    setActiveNotiTab('Banners');
                  }}
                >
                  {uniqueWeekDates?.some((item, index) => {
                    const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                    const dataDateIndex = uniqueWeekDates.indexOf(
                      moment(prevLastDay)
                        .subtract(i, 'days')
                        .format('YYYY-MM-DD')
                    );

                    // Check if the current date is the 4th day of the week
                    return (
                      dataDateIndex !== -1 &&
                      dataDateIndex % 7 === fourthDayIndex
                    );
                  }) ? (
                    <div className={styles.BnotificationText}>
                      {bannersData?.length
                        ? bannersData?.length - 1
                        : 0 +
                          (promotionsData?.length
                            ? promotionsData?.length - 1
                            : 0)}{' '}
                      more...
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ) : (
              ''
            )}
            <SingleDate
              date={moment(prevLastDay).subtract(i, 'days')}
              data={null}
            />
          </div>
        );
      }
    }

    const checkGreyFunc = (dateData) => {
      let calcPg;
      if (goalsToggle) {
        calcPg = parseInt(
          (dateData?.actual_products / dateData?.goal_products) * 100,
          10
        );
      } else {
        calcPg = parseInt(
          (dateData?.actual_procedures / dateData?.goal_procedures) * 100,
          10
        );
      }
      if (calcPg < goalVarianceData?.under_goal) {
        return true;
      } else {
        return false;
      }
    };
    const checkPinkFunc = (dateData) => {
      let calcPg;
      if (goalsToggle) {
        calcPg = parseInt(
          (dateData?.actual_products / dateData?.goal_products) * 100,
          10
        );
      } else {
        calcPg = parseInt(
          (dateData?.actual_procedures / dateData?.goal_procedures) * 100,
          10
        );
      }

      if (calcPg > goalVarianceData?.over_goal) {
        return true;
      } else {
        return false;
      }
    };
    for (let i = 1; i <= totalDaysInMonth; i++) {
      let isToday = moment().format('D') == i ? true : false;
      let currentDate;
      if (weekMode === 'true') {
        currentDate = moment(weekDates.start).add(i - 1, 'days');
      } else {
        currentDate = moment(firstDay).add(i - 1, 'days');
      }
      const { weekStart, weekEnd } = getCurrentWeek(
        weekMode === 'true' ? new Date(weekDates.start) : new Date()
      );

      const inCurrentWeek = currentDate.isBetween(
        weekStart,
        weekEnd,
        'days',
        '[]'
      );
      const data = calenderViewData?.find((item) => {
        return (
          moment(item?.date).format('DDMMYYYY') ===
          currentDate?.format('DDMMYYYY')
        );
      });
      if (holidayData?.length) {
        for (let holi of holidayData) {
          const startDate = moment(holi?.start_date);
          const endDate = moment(holi?.end_date);

          const datesBetween = [];
          let currentDate = startDate.clone();

          while (currentDate.isSameOrBefore(endDate, 'day')) {
            datesBetween.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
          }

          if (datesBetween?.length && data) {
            for (let desh of datesBetween) {
              if (
                moment(desh).format('YYYY-MM-DD') ===
                  moment(data?.date).format('YYYY-MM-DD') ||
                moment(desh).format('YYYY-MM-DD') ===
                  moment(data?.date).format('YYYY-MM-DD')
              ) {
                data.isHoliday = true;
              }
            }
          }
        }
      }
      const classnam = `${inCurrentWeek ? 'current-week' : ''} ${
        isToday ? 'current-day' : ''
      } ${
        data && showUnderGoalToggle
          ? data?.isHoliday
            ? styles.white // If isHoliday is true, assign white class
            : checkPinkFunc(data)
            ? styles.gray // If checkPinkFunc is true, assign gray class
            : checkGreyFunc(data)
            ? styles.pink // If checkGreyFunc is true, assign pink class
            : ''
          : isToday
          ? styles.today
          : styles.today
      }`;
      const dataDateFormatted = moment(data?.date)?.format('DDMMYYYY');
      const bannerMatchingItem = datesBetween?.find((banner) =>
        banner?.datesInRange?.includes(dataDateFormatted)
      );
      const promotionMatchingItem = PromotionDatesBetween?.find((banner) =>
        banner?.datesInRange?.includes(dataDateFormatted)
      );

      days.push(
        <>
          {duplicateDates &&
          duplicateDates?.length &&
          duplicateDates?.some((item) => item === data?.date) ? (
            <div
              className={`${classnam} ${
                showDetailView ? styles.viewDetailed : ''
              }`}
              style={{
                position: 'relative',
                marginTop: `${
                  !(promotionsData?.length > 1 || bannersData?.length > 1) &&
                  showBannerToggle &&
                  showPromotionToggle
                    ? '61px'
                    : !(
                        promotionsData?.length > 1 || bannersData?.length > 1
                      ) &&
                      !showBannerToggle &&
                      showPromotionToggle
                    ? '31px'
                    : !(
                        promotionsData?.length > 1 || bannersData?.length > 1
                      ) &&
                      showBannerToggle &&
                      !showPromotionToggle
                    ? '31px'
                    : !(
                        promotionsData?.length > 1 || bannersData?.length > 1
                      ) &&
                      !showBannerToggle &&
                      !showPromotionToggle
                    ? '0px'
                    : showBannerToggle && showPromotionToggle
                    ? '95px'
                    : showBannerToggle && !showPromotionToggle
                    ? '62px'
                    : showPromotionToggle && !showBannerToggle
                    ? '55px'
                    : '0px'
                }`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '0px',
                  height: '31px',
                  width: '102%',
                }}
                className={styles.Bcontainer}
              >
                {bannerMatchingItem &&
                  showBannerToggle &&
                  uniqueWeekDates?.some((item) => item === data?.date) &&
                  (bannersData && bannersData?.length ? (
                    <>
                      {' '}
                      <div
                        className={`${styles.BinfoBox} ${
                          bannerMatchingItem?.datesInRange?.length === 1
                            ? `${styles.borderLeft} ${styles.borderRight}`
                            : bannerMatchingItem?.datesInRange[0] ===
                              dataDateFormatted
                            ? styles.borderLeft
                            : bannerMatchingItem?.datesInRange[
                                bannerMatchingItem?.datesInRange?.length - 1
                              ] === dataDateFormatted
                            ? styles.borderRight
                            : ''
                        }`}
                        style={{
                          top: showPromotionToggle
                            ? promotionsData?.length > 1 ||
                              bannersData?.length > 1
                              ? '-103px'
                              : '-70px'
                            : !(
                                promotionsData?.length > 1 ||
                                bannersData?.length > 1
                              )
                            ? '-40px'
                            : '-70px',
                          position: 'relative',
                        }}
                        onClick={() => {
                          if (bannersData?.length === 1) {
                            setShowModal(true);
                            setActiveNotiTab('Banners');
                          }
                        }}
                      >
                        <div className={styles.BinfoText}>
                          {bannersData?.length
                            ? bannerMatchingItem?.datesInRange[0] ===
                              dataDateFormatted
                              ? (() => {
                                  const bannerForDate = bannersData?.find(
                                    (banner) =>
                                      moment(banner?.start_date)?.format(
                                        'DDMMYYYY'
                                      ) === bannerMatchingItem?.datesInRange[0]
                                  );
                                  return bannerForDate
                                    ? bannerForDate?.title?.length > 25
                                      ? `${bannerForDate?.title?.substring(
                                          0,
                                          25
                                        )}...`
                                      : bannerForDate?.title
                                    : '';
                                })()
                              : ''
                            : ''}
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  ))}
                {promotionMatchingItem &&
                  showPromotionToggle &&
                  (promotionsData && promotionsData?.length ? (
                    <>
                      <div
                        onClick={() => {
                          if (promotionsData?.length === 1) {
                            setShowModal(true);
                            setActiveNotiTab('Banners');
                          }
                        }}
                        className={styles.Balertdiv}
                        style={{
                          position: 'relative',
                          height: '30px',
                          top: `${
                            duplicates.some(
                              (item) =>
                                item === moment(data?.date).format('DDMMYYYY')
                            ) && showBannerToggle
                              ? promotionsData?.length > 1 ||
                                bannersData?.length > 1
                                ? '-100px'
                                : '-69px'
                              : promotionsData?.length > 1 ||
                                bannersData?.length > 1
                              ? '-70px'
                              : '-39px'
                          }`,
                        }}
                      >
                        <div className={styles.BalertBox}>
                          <div className={styles.BalertText}>
                            {promotionsData?.length
                              ? promotionMatchingItem?.datesInRange[0] ===
                                dataDateFormatted
                                ? (() => {
                                    const bannerForDate = promotionsData?.find(
                                      (banner) =>
                                        moment(banner?.start_date)?.format(
                                          'DDMMYYYY'
                                        ) ===
                                        promotionMatchingItem?.datesInRange[0]
                                    );
                                    return bannerForDate
                                      ? bannerForDate?.name?.length > 25
                                        ? `${bannerForDate?.name?.substring(
                                            0,
                                            25
                                          )}...`
                                        : bannerForDate?.name
                                      : '';
                                  })()
                                : ''
                              : ''}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  ))}
                {(showBannerToggle || showPromotionToggle) &&
                (promotionsData?.length > 1 || bannersData?.length > 1) ? (
                  <div className={styles.Balertdiv}>
                    <div
                      style={{
                        position: 'absolute',
                        height: '28px',
                        // left: '-680%',
                        // width: '1400%',
                        top: `${showPromotionToggle ? '-38px' : '-38px'}`,
                      }}
                      className={styles.BnotificationBox}
                      onClick={() => {
                        setShowModal(true);
                        setActiveNotiTab('Banners');
                      }}
                    >
                      {duplicateDates?.some((item, index) => {
                        const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                        const dataDateIndex = duplicateDates.indexOf(
                          data?.date
                        );

                        // Check if the current date is the 4th day of the week
                        return (
                          dataDateIndex !== -1 &&
                          dataDateIndex % 7 === fourthDayIndex
                        );
                      }) ? (
                        <div className={styles.BnotificationText}>
                          {bannersData?.length
                            ? bannersData?.length - 1
                            : 0 +
                              (promotionsData?.length
                                ? promotionsData?.length - 1
                                : 0)}{' '}
                          more...
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
              <SingleDate
                date={currentDate}
                endDates={endDates}
                setEndDates={setEndDates}
                startDates={startDates}
                setStartDates={setStartDates}
                holidayData={holidayData}
                showDetailView={showDetailView}
                lockHolidayData={lockHolidayData}
                collectionOperationData={collectionOperationData}
                data={
                  data ? { ...data, drives: convertDrives(data?.drives) } : null
                }
                taskToggle={showTaskToggle}
                nceToggle={showNceToggle}
                updateDate={updateDate}
                setUpdateDate={setUpdateDate}
                showDriveInsideToggle={showDriveInsideToggle}
                showDriveOutsideToggle={showDriveOutsideToggle}
                sessionsToggle={showSessionsToggle}
                currentLinkToggle={showCurrentLintToggle}
                availableToggle={showAvailableDateToggle}
                goalsToggle={goalsToggle}
                showLockDayPopup={showLockDayPopup}
                setShowLockDayPopup={setShowLockDayPopup}
                showCloseDayPopup={showCloseDayPopup}
                setShowCloseDayPopup={setShowCloseDayPopup}
                onDateClick={(data) => {
                  if (data) {
                    setSelectedDate({
                      ...data,
                      goalVarianceData: goalVarianceData,
                    });

                    setPopupOpen(true);
                  }
                }}
                onShiftClick={(data) => {
                  if (data) {
                    setSelectedDate(data);
                    setPopupDetailsOpen(true);
                    setShowAllInfo(false);
                  }
                }}
                onShiftClickDuplicate={(data) => {
                  if (data) {
                    setFrontDetailData(data);
                    setPopupDetailsOpenDuplicate(true);
                  }
                }}
                onShiftClickDuplicateNce={(data) => {
                  if (data) {
                    setFrontNceDetailData(data);
                    setPopupNceDetailsOpenDuplicate(true);
                  }
                }}
                onShiftClickDuplicateSession={(data) => {
                  if (data) {
                    setFrontSessionDetailData(data);
                    setPopupSessionDetailsOpenDuplicate(true);
                  }
                }}
                // className={classnam}
              />
            </div>
          ) : mergedArray?.some((item) => item === data?.date) ? (
            <div
              className={`${classnam} ${
                showDetailView ? styles.viewDetailed : ''
              }`}
              style={{
                position: 'relative',
                marginTop:
                  bannersData?.length === 1 && promotionsData?.length === 1
                    ? '30px'
                    : bannersData?.length === 1 && !promotionsData?.length
                    ? '30px'
                    : !bannersData?.length && promotionsData?.length === 1
                    ? '30px'
                    : bannersData?.length > 1 && promotionsData?.length > 1
                    ? '60px'
                    : (bannersData?.length === 1 &&
                        promotionsData?.length > 1 &&
                        uniqueWeekDates?.some((item) => item === data?.date)) ||
                      (promotionsData?.length === 1 &&
                        bannersData?.length > 1 &&
                        uniquePromotionWeekDates?.some(
                          (item) => item === data?.date
                        ))
                    ? '30px'
                    : '60px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-60px',
                  left: '0px',
                  height: '31px',
                  width: '102%',
                }}
                className={styles.Bcontainer}
              >
                {bannerMatchingItem &&
                  showBannerToggle &&
                  uniqueWeekDates?.some((item) => item === data?.date) &&
                  (bannersData && bannersData?.length ? (
                    <>
                      {' '}
                      <div
                        className={`${styles.BinfoBox} ${
                          bannerMatchingItem?.datesInRange?.length === 1
                            ? `${styles.borderLeft} ${styles.borderRight}`
                            : bannerMatchingItem?.datesInRange[0] ===
                              dataDateFormatted
                            ? styles.borderLeft
                            : bannerMatchingItem?.datesInRange[
                                bannerMatchingItem?.datesInRange?.length - 1
                              ] === dataDateFormatted
                            ? styles.borderRight
                            : ''
                        }`}
                        style={{
                          position: 'relative',
                          top: `${bannersData?.length === 1 ? '29px' : ''}`,
                        }}
                        onClick={() => {
                          if (bannersData?.length === 1) {
                            setShowModal(true);
                            setActiveNotiTab('Banners');
                          }
                        }}
                      >
                        <div className={styles.BinfoText}>
                          {bannersData?.length
                            ? bannerMatchingItem?.datesInRange[0] ===
                              dataDateFormatted
                              ? (() => {
                                  const bannerForDate = bannersData?.find(
                                    (banner) =>
                                      moment(banner?.start_date)?.format(
                                        'DDMMYYYY'
                                      ) === bannerMatchingItem?.datesInRange[0]
                                  );
                                  return bannerForDate
                                    ? bannerForDate?.title?.length > 25
                                      ? `${bannerForDate?.title?.substring(
                                          0,
                                          25
                                        )}...`
                                      : bannerForDate?.title
                                    : '';
                                })()
                              : ''
                            : ''}
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  ))}
                {bannersData?.length > 1 &&
                uniqueWeekDates?.some((item) => item === data?.date) ? (
                  //   bannerMatchingItem?.datesInRange[0] ===
                  // dataDateFormatted ?
                  <div
                    style={{
                      position: 'absolute',
                      // left: '-680%',
                      // width: '1400%',
                      height: '28px',
                      top: '30px',
                    }}
                    className={styles.BnotificationBox}
                    onClick={() => {
                      setShowModal(true);
                      setActiveNotiTab('Banners');
                    }}
                  >
                    {uniqueWeekDates?.some((item, index) => {
                      const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                      const dataDateIndex = uniqueWeekDates.indexOf(data?.date);

                      // Check if the current date is the 4th day of the week
                      return (
                        dataDateIndex !== -1 &&
                        dataDateIndex % 7 === fourthDayIndex
                      );
                    }) ? (
                      <div className={styles.BnotificationText}>
                        {bannersData?.length
                          ? bannersData?.length - 1
                          : 0 +
                            (promotionsData
                              ? promotionsData?.length - 1
                              : 0)}{' '}
                        more...
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  ''
                )}
                {promotionMatchingItem &&
                  showPromotionToggle &&
                  (promotionsData && promotionsData?.length ? (
                    <>
                      <div
                        className={styles.Balertdiv}
                        style={{
                          position: 'relative',
                          top: `${promotionsData?.length === 1 ? '29px' : ''}`,
                        }}
                        onClick={() => {
                          if (promotionsData?.length === 1) {
                            setShowModal(true);
                            setActiveNotiTab('Banners');
                          }
                        }}
                      >
                        <div className={styles.BalertBox}>
                          <div className={styles.BalertText}>
                            {promotionsData?.length
                              ? promotionMatchingItem?.datesInRange[0] ===
                                dataDateFormatted
                                ? (() => {
                                    const bannerForDate = promotionsData?.find(
                                      (banner) =>
                                        moment(banner?.start_date)?.format(
                                          'DDMMYYYY'
                                        ) ===
                                        promotionMatchingItem?.datesInRange[0]
                                    );
                                    return bannerForDate
                                      ? bannerForDate?.name?.length > 25
                                        ? `${bannerForDate?.name?.substring(
                                            0,
                                            25
                                          )}...`
                                        : bannerForDate?.name
                                      : '';
                                  })()
                                : ''
                              : ''}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    ''
                  ))}
                {promotionsData?.length > 1 &&
                uniquePromotionWeekDates?.some(
                  (item) => item === data?.date
                ) ? (
                  <div
                    style={{
                      position: 'absolute',
                      // left: '-680%',
                      // width: '1400%',
                      top: '30px',
                      height: '28px',
                    }}
                    className={styles.BnotificationBox}
                    onClick={() => {
                      setShowModal(true);
                      setActiveNotiTab('Banners');
                    }}
                  >
                    {uniquePromotionWeekDates?.some((item, index) => {
                      const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                      const dataDateIndex = uniquePromotionWeekDates.indexOf(
                        data?.date
                      );

                      // Check if the current date is the 4th day of the week
                      return (
                        dataDateIndex !== -1 &&
                        dataDateIndex % 7 === fourthDayIndex
                      );
                    }) ? (
                      <div className={styles.BnotificationText}>
                        {bannersData?.length
                          ? bannersData?.length - 1
                          : 0 +
                            (promotionsData?.length
                              ? promotionsData?.length - 1
                              : 0)}{' '}
                        more...
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  ''
                )}
              </div>
              <SingleDate
                date={currentDate}
                holidayData={holidayData}
                showDetailView={showDetailView}
                lockHolidayData={lockHolidayData}
                collectionOperationData={collectionOperationData}
                data={
                  data ? { ...data, drives: convertDrives(data?.drives) } : null
                }
                taskToggle={showTaskToggle}
                nceToggle={showNceToggle}
                updateDate={updateDate}
                setUpdateDate={setUpdateDate}
                showDriveInsideToggle={showDriveInsideToggle}
                showDriveOutsideToggle={showDriveOutsideToggle}
                sessionsToggle={showSessionsToggle}
                currentLinkToggle={showCurrentLintToggle}
                availableToggle={showAvailableDateToggle}
                goalsToggle={goalsToggle}
                endDates={endDates}
                setEndDates={setEndDates}
                startDates={startDates}
                setStartDates={setStartDates}
                showLockDayPopup={showLockDayPopup}
                setShowLockDayPopup={setShowLockDayPopup}
                showCloseDayPopup={showCloseDayPopup}
                setShowCloseDayPopup={setShowCloseDayPopup}
                onDateClick={(data) => {
                  if (data) {
                    setSelectedDate({
                      ...data,
                      goalVarianceData: goalVarianceData,
                    });

                    setPopupOpen(true);
                  }
                }}
                onShiftClick={(data) => {
                  if (data) {
                    setSelectedDate(data);
                    setPopupDetailsOpen(true);
                    setShowAllInfo(false);
                  }
                }}
                onShiftClickDuplicate={(data) => {
                  if (data) {
                    setFrontDetailData(data);
                    setPopupDetailsOpenDuplicate(true);
                  }
                }}
                onShiftClickDuplicateNce={(data) => {
                  if (data) {
                    setFrontNceDetailData(data);
                    setPopupNceDetailsOpenDuplicate(true);
                  }
                }}
                onShiftClickDuplicateSession={(data) => {
                  if (data) {
                    setFrontSessionDetailData(data);
                    setPopupSessionDetailsOpenDuplicate(true);
                  }
                }}
                // className={classnam}
              />
            </div>
          ) : (
            <SingleDate
              date={currentDate}
              holidayData={holidayData}
              showDetailView={showDetailView}
              lockHolidayData={lockHolidayData}
              collectionOperationData={collectionOperationData}
              data={
                data ? { ...data, drives: convertDrives(data?.drives) } : null
              }
              taskToggle={showTaskToggle}
              nceToggle={showNceToggle}
              updateDate={updateDate}
              setUpdateDate={setUpdateDate}
              showDriveInsideToggle={showDriveInsideToggle}
              showDriveOutsideToggle={showDriveOutsideToggle}
              sessionsToggle={showSessionsToggle}
              endDates={endDates}
              setEndDates={setEndDates}
              startDates={startDates}
              setStartDates={setStartDates}
              currentLinkToggle={showCurrentLintToggle}
              availableToggle={showAvailableDateToggle}
              goalsToggle={goalsToggle}
              showLockDayPopup={showLockDayPopup}
              setShowLockDayPopup={setShowLockDayPopup}
              showCloseDayPopup={showCloseDayPopup}
              setShowCloseDayPopup={setShowCloseDayPopup}
              onDateClick={(data) => {
                if (data) {
                  setSelectedDate({
                    ...data,
                    goalVarianceData: goalVarianceData,
                  });

                  setPopupOpen(true);
                }
              }}
              onShiftClick={(data) => {
                if (data) {
                  setSelectedDate(data);
                  setPopupDetailsOpen(true);
                  setShowAllInfo(false);
                }
              }}
              onShiftClickDuplicate={(data) => {
                if (data) {
                  setFrontDetailData(data);
                  setPopupDetailsOpenDuplicate(true);
                }
              }}
              onShiftClickDuplicateNce={(data) => {
                if (data) {
                  setFrontNceDetailData(data);
                  setPopupNceDetailsOpenDuplicate(true);
                }
              }}
              onShiftClickDuplicateSession={(data) => {
                if (data) {
                  setFrontSessionDetailData(data);
                  setPopupSessionDetailsOpenDuplicate(true);
                }
              }}
              viewDetaileds={showDetailView}
              className={classnam}
            />
          )}
        </>
      );
    }
    if (weekMode === 'false') {
      for (let i = 1; i <= endAdditionalDays; i++) {
        const currentDate = moment(lastDay).add(i, 'days');
        const { weekStart, weekEnd } = getCurrentWeek(new Date());
        const inCurrentWeek = currentDate.isBetween(
          weekStart,
          weekEnd,
          'days',
          '[]'
        );
        days.push(
          <div
            style={{
              marginTop: `${
                duplicateDates?.some(
                  (item) =>
                    item === moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
                )
                  ? bannersData?.length > 1 || promotionsData?.length > 1
                    ? showPromotionToggle && showBannerToggle
                      ? '95px'
                      : !showPromotionToggle && showBannerToggle
                      ? '62px'
                      : showPromotionToggle && !showBannerToggle
                      ? '57px'
                      : !showPromotionToggle && !showBannerToggle
                      ? '0px'
                      : ''
                    : showPromotionToggle && showBannerToggle
                    ? '62px'
                    : !showPromotionToggle && showBannerToggle
                    ? '31px'
                    : showPromotionToggle && !showBannerToggle
                    ? '31px'
                    : !showPromotionToggle && !showBannerToggle
                    ? '0px'
                    : ''
                  : mergedArray?.some(
                      (item) =>
                        item ===
                        moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
                    )
                  ? bannersData?.length === 1 || promotionsData?.length === 1
                    ? showPromotionToggle && showBannerToggle
                      ? '31px'
                      : !showPromotionToggle && showBannerToggle
                      ? '31px'
                      : showPromotionToggle && !showBannerToggle
                      ? '31px'
                      : !showPromotionToggle && !showBannerToggle
                      ? '0px'
                      : ''
                    : '60px'
                  : ''
              }`,
              position: 'relative',
            }}
            className={`${inCurrentWeek ? 'current-week' : ''} ${
              styles.prevdate
            }`}
          >
            {showPromotionToggle &&
            promotionsData?.length > 1 &&
            uniquePromotionWeekDates?.some(
              (item) =>
                item === moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
            ) ? (
              <div
                style={{ position: 'absolute' }}
                className={styles.Bcontainer}
              >
                <div
                  style={{
                    position: 'absolute',
                    // left: '-680%',
                    // width: '1400%',
                    top: '-38px',
                    height: '28px',
                    left: '-14px',
                    width: '102%',
                  }}
                  className={styles.BnotificationBox}
                  onClick={() => {
                    setShowModal(true);
                    setActiveNotiTab('Banners');
                  }}
                >
                  {uniquePromotionWeekDates?.some((item, index) => {
                    const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                    const dataDateIndex = uniquePromotionWeekDates.indexOf(
                      moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
                    );

                    // Check if the current date is the 4th day of the week
                    return (
                      dataDateIndex !== -1 &&
                      dataDateIndex % 7 === fourthDayIndex
                    );
                  }) ? (
                    <div className={styles.BnotificationText}>
                      {bannersData?.length
                        ? bannersData?.length - 1
                        : 0 +
                          (promotionsData?.length
                            ? promotionsData?.length - 1
                            : 0)}{' '}
                      more...
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ) : (
              ''
            )}
            {showBannerToggle &&
            bannersData?.length > 1 &&
            uniqueWeekDates?.some(
              (item) =>
                item === moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
            ) ? (
              <div
                style={{ position: 'absolute' }}
                className={styles.Bcontainer}
              >
                <div
                  style={{
                    position: 'absolute',
                    // left: '-680%',
                    // width: '1400%',
                    top: '-38px',
                    height: '28px',
                    left: '-14px',
                    width: '102%',
                  }}
                  className={styles.BnotificationBox}
                  onClick={() => {
                    setShowModal(true);
                    setActiveNotiTab('Banners');
                  }}
                >
                  {uniqueWeekDates?.some((item, index) => {
                    const fourthDayIndex = 3; // Index of the 4th day in a zero-based array
                    const dataDateIndex = uniqueWeekDates.indexOf(
                      moment(lastDay).add(i, 'days').format('YYYY-MM-DD')
                    );

                    // Check if the current date is the 4th day of the week
                    return (
                      dataDateIndex !== -1 &&
                      dataDateIndex % 7 === fourthDayIndex
                    );
                  }) ? (
                    <div className={styles.BnotificationText}>
                      {bannersData?.length
                        ? bannersData?.length - 1
                        : 0 +
                          (promotionsData?.length
                            ? promotionsData?.length - 1
                            : 0)}{' '}
                      more...
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ) : (
              ''
            )}
            <SingleDate date={moment(lastDay).add(i, 'days')} data={null} />
          </div>
        );
      }
    }

    return (
      <>
        <div className={styles.days}>{days}</div>
      </>
    );
  };

  let matchingLockItem = {
    status: false,
    id: null,
  };

  if (lockHolidayData?.length) {
    for (let holi of lockHolidayData) {
      const startDate = moment(holi?.start_date);
      const endDate = moment(holi?.end_date);

      const datesBetween = [];
      let currentDate = startDate.clone();

      while (currentDate.isSameOrBefore(endDate, 'day')) {
        datesBetween.push(currentDate.format('YYYY-MM-DD'));
        currentDate.add(1, 'day');
      }
      if (datesBetween?.length) {
        for (let desh of datesBetween) {
          if (moment(desh).isSame(moment(selectedDate?.date), 'day')) {
            matchingLockItem = {
              status: true,
              id: holi?.id,
            };
          }
        }
      }
    }
  }

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Calendar',
      class: 'disable-label',
      link: '/operations-center/calendar/ViewCalendar',
    },
  ];
  useEffect(() => {
    fetchAllStages(filterApplied);
  }, [getDataDepend, goalsToggle, viewName]);

  const fetchAllStages = async (filters) => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    setFilterApplied(filters);

    try {
      const getFilterValue = (filter) => {
        if (typeof filter === 'object' && 'value' in filter) {
          return filter.value;
        } else if (Array.isArray(filter)) {
          return filter[0];
        } else {
          return filter;
        }
      };
      const filterProperties = [
        'procedure_type_id',
        'product_id',
        'operation_status_id',
        'organizational_levels',
      ];
      let queryParams = filterProperties
        ?.map((property) => {
          const filterValue = getFilterValue(filters[property]);
          return filterValue
            ? `${property}=${
                property === 'date'
                  ? moment(filterValue).format('YYYY-MM-DD')
                  : filterValue
              }`
            : '';
        })
        .filter((param) => param !== '')
        .join('&');
      const hasProcedureAndProduct =
        queryParams.includes('procedure_type_id') &&
        queryParams.includes('product_id');
      if (hasProcedureAndProduct) {
        queryParams = queryParams.replace(/procedure_type_id=[^&]*&?/, '');
      }
      let response;
      const isEmpty = Object.keys(filters).length === 0;
      if (!isEmpty) {
        setIsLoading(true);
        response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/operations-center/calender/monthly-view?month=${
            +currentMonths + 1
          }&year=${showYear}${viewName ? `&view_as=${viewName}` : ''}${
            weekMode === 'true'
              ? `&week_start_date=${moment(weekDates.start).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
                )}&week_end_date=${moment(weekDates.end).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
                )}&week_view=true`
              : ''
          }${queryParams ? `&${queryParams}` : ''}
          `
        );
      }

      const data = await response.json();
      if (data) {
        setCalenderViewData(data.data);
        setIsLoading(false);
      }
    } catch (error) {
      // toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setGetDataDepend(false);
    // setIsLoading(false);
  };
  const isIntegerHandle = (item) => {
    if (Number?.isInteger(item)) {
      return item;
    } else {
      return item?.toFixed(2);
    }
  };

  const calculateTotalOefProduct = () => {
    let totalOEFProducts = 0;
    calenderViewData?.forEach((item) => {
      if (item?.drives && item?.drives?.length > 0) {
        item?.drives?.forEach((drive) => {
          if (
            drive.shifts_data &&
            drive.shifts_data.total_oef_products !== null
          ) {
            totalOEFProducts += parseFloat(
              drive.shifts_data.total_oef_products
            );
          }
        });
      }

      if (item?.sessions && item?.sessions?.length > 0) {
        item?.sessions?.forEach((session) => {
          if (
            session.shifts_data &&
            session.shifts_data.total_oef_products !== null
          ) {
            totalOEFProducts += parseFloat(
              session.shifts_data.total_oef_products
            );
          }
        });
      }

      if (item?.nce && item?.nce?.length > 0) {
        item?.nce?.forEach((session) => {
          if (
            session.shifts_data &&
            session.shifts_data.total_oef_products !== null
          ) {
            totalOEFProducts += parseFloat(
              session.shifts_data.total_oef_products
            );
          }
        });
      }
    });

    return totalOEFProducts ? totalOEFProducts?.toFixed(2) : 0;
  };

  const calculateTotalOefProcedure = () => {
    let totalOEFProcedure = 0;

    calenderViewData?.forEach((item) => {
      if (item?.drives && item?.drives?.length > 0) {
        item?.drives?.forEach((drive) => {
          if (
            drive.shifts_data &&
            drive.shifts_data.total_oef_procedures !== null
          ) {
            totalOEFProcedure += parseFloat(
              drive.shifts_data.total_oef_procedures
            );
          }
        });
      }
      if (item?.sessions && item?.sessions?.length > 0) {
        item?.sessions?.forEach((session) => {
          if (
            session.shifts_data &&
            session.shifts_data.total_oef_procedures !== null
          ) {
            totalOEFProcedure += parseFloat(
              session.shifts_data.total_oef_procedures
            );
          }
        });
      }

      if (item?.nce && item?.nce?.length > 0) {
        item?.nce?.forEach((session) => {
          if (
            session.shifts_data &&
            session.shifts_data.total_oef_procedures !== null
          ) {
            totalOEFProcedure += parseFloat(
              session.shifts_data.total_oef_procedures
            );
          }
        });
      }
    });

    return totalOEFProcedure ? totalOEFProcedure?.toFixed(2) : 0;
  };

  const showLegendDriveTotal = () => {
    if (showDriveInsideToggle && showDriveOutsideToggle) {
      const totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.total_drives,
        0
      );
      setLegendDriveValue(totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0);
    } else if (!showDriveInsideToggle && showDriveOutsideToggle) {
      const totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.total_drives,
        0
      );
      const countInsideSiteType = calenderViewData.reduce((acc, obj) => {
        const insideCount = obj?.drives?.filter(
          (drive) => drive?.crm_locations?.site_type === 'Inside'
        )?.length;
        return acc + insideCount;
      }, 0);
      const total = totalReduce - countInsideSiteType;
      setLegendDriveValue(total >= 0 ? isIntegerHandle(total) : 0);
    } else if (showDriveInsideToggle && !showDriveOutsideToggle) {
      const totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.total_drives,
        0
      );
      const countOutsideSiteType = calenderViewData.reduce((acc, obj) => {
        const insideCount = obj?.drives?.filter(
          (drive) => drive?.crm_locations?.site_type === 'Outside'
        )?.length;
        return acc + insideCount;
      }, 0);
      const total = totalReduce - countOutsideSiteType;
      setLegendDriveValue(total >= 0 ? isIntegerHandle(total) : 0);
    } else {
      setLegendDriveValue(0);
    }
  };

  const showLegendSessionTotal = () => {
    if (showSessionsToggle) {
      const totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.total_sessions,
        0
      );
      setLegendSessionValue(
        totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0
      );
    } else {
      setLegendSessionValue(0);
    }
  };
  const calculateProductGoals = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.goal_products,
      0
    );
    return totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0;
  };
  const calculateProcedureGoals = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.goal_procedures,
      0
    );
    return totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0;
  };

  const calculateProcedureScheduleLegend = () => {
    if (showSessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          item?.drives?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Outside' &&
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Inside' &&
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          item?.drives?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_procedure_type_qty
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Outside' &&
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Inside' &&
              drive?.projections &&
              drive?.projections?.total_procedure_type_qty !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setLegendScheduleValue(0);
    }
  };

  const calculateProductScheduleLegend = () => {
    if (showSessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          item?.drives?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Outside' &&
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Inside' &&
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          });
        }
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.sessions && item?.sessions?.length > 0) {
          item?.sessions?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          item?.drives?.forEach((drive) => {
            if (
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            ) {
              scheduleValue += parseFloat(
                drive?.projections?.total_product_yield
              );
            }
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Outside' &&
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      calenderViewData?.forEach((item) => {
        if (item?.drives && item?.drives?.length > 0) {
          const filteredDrives = item.drives.filter((drive) => {
            return (
              drive?.crm_locations &&
              drive?.crm_locations?.site_type !== 'Inside' &&
              drive?.projections &&
              drive?.projections?.total_product_yield !== null
            );
          });

          filteredDrives.forEach((drive) => {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          });
        }
      });
      setLegendScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setLegendScheduleValue(0);
    }
  };

  const calculateScheduleProductPercent = () => {
    const goals = calenderViewData?.reduce(
      (acc, obj) => acc + obj.goal_products,
      0
    );

    if (legendScheduleValue && goals !== 0) {
      return `${((legendScheduleValue / goals) * 100)?.toFixed(1)}`;
    } else {
      return '0';
    }
  };

  const calculateActualProductPercent = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.actual_products,
      0
    );
    const goals = calenderViewData?.reduce(
      (acc, obj) => acc + obj.scheduled_products,
      0
    );

    if (totalReduce && goals !== 0) {
      return `${((totalReduce / goals) * 100)?.toFixed(1)}%`;
    } else {
      return '0%';
    }
  };

  const calculateActualProcedurePercent = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.actual_procedures,
      0
    );
    const goals = calenderViewData?.reduce(
      (acc, obj) => acc + obj.scheduled_procedures,
      0
    );
    if (totalReduce && goals !== 0) {
      return `${((totalReduce / goals) * 100)?.toFixed(1)}%`;
    } else {
      return '0%';
    }
  };

  const calculateScheduleProcedurePercent = () => {
    const goals = calenderViewData?.reduce(
      (acc, obj) => acc + obj.goal_procedures,
      0
    );
    if (legendScheduleValue && goals !== 0) {
      return `${((legendScheduleValue / goals) * 100)?.toFixed(1)}`;
    } else {
      return '0';
    }
  };

  const calculateActualProduct = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.actual_products,
      0
    );
    return totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0;
  };

  const calculateActualProcedures = () => {
    const totalReduce = calenderViewData?.reduce(
      (acc, obj) => acc + obj.actual_procedures,
      0
    );
    return totalReduce >= 0 ? isIntegerHandle(totalReduce) : 0;
  };

  const calculateForecast = () => {
    let totalReduce;
    if (goalsToggle) {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_products,
        0
      );
    } else {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_procedures,
        0
      );
    }
    const currentDateOnly = moment().startOf('day');
    const currentDate = moment();
    const endOfMonth = moment().endOf('month');
    const remainingDaysInMonth = endOfMonth.diff(currentDate, 'days');
    const total =
      (totalReduce / currentDateOnly.format('DD')) *
      (remainingDaysInMonth + totalReduce);
    return total >= 0 ? isIntegerHandle(total) : 0;
  };

  const calculateForecastPercent = () => {
    let totalReduce;
    let totalGoals;
    if (goalsToggle) {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_products,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_products,
        0
      );
    } else {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_procedures,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_procedures,
        0
      );
    }
    const currentDateOnly = moment().startOf('day');
    const currentDate = moment();
    const endOfMonth = moment().endOf('month');
    const remainingDaysInMonth = endOfMonth.diff(currentDate, 'days');
    const percent =
      (totalReduce / currentDateOnly.format('DD')) *
      (remainingDaysInMonth + totalReduce);
    return `${
      percent && totalGoals !== 0
        ? ((percent / totalGoals) * 100)?.toFixed(1)
        : '0'
    }`;
  };

  const calculateRequired = () => {
    let totalReduce;
    let totalGoals;
    if (goalsToggle) {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_products,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_products,
        0
      );
    } else {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_procedures,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_procedures,
        0
      );
    }
    const total = totalGoals - totalReduce;
    return total >= 0 ? isIntegerHandle(total) : 0;
  };

  const calculateRequiredPercent = () => {
    let totalReduce;
    let totalGoals;
    if (goalsToggle) {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_products,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_products,
        0
      );
    } else {
      totalReduce = calenderViewData?.reduce(
        (acc, obj) => acc + obj.actual_procedures,
        0
      );
      totalGoals = calenderViewData?.reduce(
        (acc, obj) => acc + obj.goal_procedures,
        0
      );
    }
    const data = totalGoals - totalReduce;
    if (totalGoals !== 0 && data) {
      return `${((data / totalGoals) * 100)?.toFixed(1)}%`;
    } else {
      return '0%';
    }
  };

  const sortingData = () => {
    if (activeTab === 'Drives') {
      if (
        sortingCriteria === 'Account Name' ||
        sortingCriteria === 'Account Name Desc'
      ) {
        const temp = selectedDate?.drives?.sort((a, b) => {
          const nameA = a.account.name.toUpperCase();
          const nameB = b.account.name.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Depart Time') {
        const temp = selectedDate?.drives?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.earliest_shift_start_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.earliest_shift_start_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Return Time') {
        const temp = selectedDate?.drives?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.latest_shift_return_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.latest_shift_return_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Status') {
        const temp = selectedDate?.drives?.sort((a, b) => {
          const nameA = a.drive.operation_status_id.name.toUpperCase(); // Ignore case sensitivity
          const nameB = b.drive.operation_status_id.name.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1; // Return 1 to place 'a' after 'b'
            }
            if (nameA > nameB) {
              return 1; // Return -1 to place 'a' before 'b'
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Projection') {
        let temp;
        if (goalsToggle) {
          temp = selectedDate?.drives?.sort((a, b) => {
            const nameA = a.total_product_yield; // Ignore case sensitivity
            const nameB = b.total_product_yield;
            if (isAscending) {
              if (nameA < nameB) {
                return -1; // Return 1 to place 'a' after 'b'
              }
              if (nameA > nameB) {
                return 1; // Return -1 to place 'a' before 'b'
              }
              return 0;
            } else {
              if (nameA < nameB) {
                return 1;
              }
              if (nameA > nameB) {
                return -1;
              }
              return 0;
            }
            // Names are equal, no change needed
          });
        } else {
          temp = selectedDate?.drives?.sort((a, b) => {
            const nameA = a.total_procedure_type_qty; // Ignore case sensitivity
            const nameB = b.total_procedure_type_qty;
            if (isAscending) {
              if (nameA < nameB) {
                return -1; // Return 1 to place 'a' after 'b'
              }
              if (nameA > nameB) {
                return 1; // Return -1 to place 'a' before 'b'
              }
              return 0;
            } else {
              if (nameA < nameB) {
                return 1;
              }
              if (nameA > nameB) {
                return -1;
              }
              return 0;
            }
            // Names are equal, no change needed
          });
        }

        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
    }
    if (activeTab === 'Sessions') {
      if (
        sortingCriteria === 'Account Name' ||
        sortingCriteria === 'Account Name Desc'
      ) {
        const temp = selectedDate?.sessions?.sort((a, b) => {
          const nameA = a?.dc_name?.toUpperCase(); // Ignore case sensitivity
          const nameB = b?.dc_name?.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1; // Return 1 to place 'a' after 'b'
            }
            if (nameA > nameB) {
              return 1; // Return -1 to place 'a' before 'b'
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Depart Time') {
        const temp = selectedDate?.sessions?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.earliest_shift_start_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.earliest_shift_start_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Return Time') {
        const temp = selectedDate?.sessions?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.latest_shift_return_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.latest_shift_return_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Status') {
        const temp = selectedDate?.sessions?.sort((a, b) => {
          const nameA = a.oc_name.toUpperCase(); // Ignore case sensitivity
          const nameB = b.oc_name.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1; // Return 1 to place 'a' after 'b'
            }
            if (nameA > nameB) {
              return 1; // Return -1 to place 'a' before 'b'
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
    }
    if (activeTab === 'Events') {
      if (
        sortingCriteria === 'Account Name' ||
        sortingCriteria === 'Account Name Desc'
      ) {
        const temp = selectedDate?.nce?.sort((a, b) => {
          const nameA = a?.ncp?.non_collection_profile?.name?.toUpperCase(); // Ignore case sensitivity
          const nameB = b?.ncp?.non_collection_profile?.name?.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1; // Return 1 to place 'a' after 'b'
            }
            if (nameA > nameB) {
              return 1; // Return -1 to place 'a' before 'b'
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Depart Time') {
        const temp = selectedDate?.nce?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.earliest_shift_start_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.earliest_shift_start_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Return Time') {
        const temp = selectedDate?.nce?.sort((a, b) => {
          const timeA = new Date(
            a.shifts_data.latest_shift_return_time
          ).getTime();
          const timeB = new Date(
            b.shifts_data.latest_shift_return_time
          ).getTime();

          return isAscending ? timeA - timeB : timeB - timeA;
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
      if (sortingCriteria === 'Status') {
        const temp = selectedDate?.nce?.sort((a, b) => {
          const nameA = a?.status?.operation_status_id?.name?.toUpperCase(); // Ignore case sensitivity
          const nameB = b?.status?.operation_status_id?.name?.toUpperCase();
          if (isAscending) {
            if (nameA < nameB) {
              return -1; // Return 1 to place 'a' after 'b'
            }
            if (nameA > nameB) {
              return 1; // Return -1 to place 'a' before 'b'
            }
            return 0;
          } else {
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
            return 0;
          }
          // Names are equal, no change needed
        });
        setIsAscending(!isAscending);
        setSelectedDate((prevSelectedDate) => ({
          ...prevSelectedDate,
          drive: temp,
        }));
      }
    }
  };

  const overGoalFunc = () => {
    let calcPg;
    if (popupToggleProd) {
      calcPg = parseInt(
        (selectedDate?.actual_products / selectedDate?.goal_products) * 100,
        10
      );
      if (calcPg > selectedDate?.goalVarianceData?.over_goal) {
        return 'Over Goal';
      } else if (calcPg < selectedDate?.goalVarianceData?.under_goal) {
        return 'Under Goal';
      } else {
        return '';
      }
    } else {
      calcPg = parseInt(
        (selectedDate?.actual_procedures / selectedDate?.goal_procedures) * 100,
        10
      );
      if (calcPg > selectedDate?.goalVarianceData?.over_goal) {
        return 'Over Goal';
      } else if (calcPg < selectedDate?.goalVarianceData?.under_goal) {
        return 'Under Goal';
      } else {
        return '';
      }
    }
  };
  const calculateProductScheduleFunc = () => {
    if (showSessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        selectedDate?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives?.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        selectedDate?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_product_yield
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_product_yield !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(drive?.projections?.total_product_yield);
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setScheduleValue(0);
    }
  };
  const calculateProcedureScheduleFunc = () => {
    if (showSessionsToggle && showDriveOutsideToggle && showDriveInsideToggle) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        selectedDate?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives?.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      showSessionsToggle &&
      !showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.sessions && selectedDate?.sessions?.length > 0) {
        selectedDate?.sessions?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        selectedDate?.drives?.forEach((drive) => {
          if (
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          ) {
            scheduleValue += parseFloat(
              drive?.projections?.total_procedure_type_qty
            );
          }
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      !showDriveOutsideToggle &&
      showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Outside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else if (
      !showSessionsToggle &&
      showDriveOutsideToggle &&
      !showDriveInsideToggle
    ) {
      let scheduleValue = 0;
      if (selectedDate?.drives && selectedDate?.drives?.length > 0) {
        const filteredDrives = selectedDate?.drives?.filter((drive) => {
          return (
            drive?.crm_locations &&
            drive?.crm_locations?.site_type !== 'Inside' &&
            drive?.projections &&
            drive?.projections?.total_procedure_type_qty !== null
          );
        });

        filteredDrives.forEach((drive) => {
          scheduleValue += parseFloat(
            drive?.projections?.total_procedure_type_qty
          );
        });
      }
      setScheduleValue(
        !isNaN(scheduleValue) ? isIntegerHandle(scheduleValue) : 0
      );
    } else {
      setScheduleValue(0);
    }
  };

  useEffect(() => {
    if (goalsToggle) {
      calculateProductScheduleFunc();
      calculateProductScheduleLegend();
    } else {
      calculateProcedureScheduleFunc();
      calculateProcedureScheduleLegend();
    }
    showLegendDriveTotal();
    showLegendSessionTotal();
  }, [
    selectedDate,
    calenderViewData,
    showSessionsToggle,
    showDriveOutsideToggle,
    showDriveInsideToggle,
  ]);

  function convertDrives(drives) {
    const linkedNames = {};
    let currentLetter = 65;

    return drives?.map((currentDrive) => {
      if (currentDrive?.linked_drive) {
        const linkedDriveId = currentDrive?.linked_drive?.linked_drive_id;
        const linkedDrive = drives?.find(
          (drive) => drive?.drive?.id === linkedDriveId
        );

        if (linkedDrive) {
          const linkedNameKey = `${currentDrive?.drive?.id}-${linkedDriveId}`;
          const existingLinkedName = linkedNames[linkedNameKey];

          if (!existingLinkedName) {
            // Assign a new linkedName only if it hasn't been assigned yet
            const newLinkedName = String.fromCharCode(currentLetter);
            linkedNames[linkedNameKey] = newLinkedName;
            currentDrive.linkedName = newLinkedName;
            linkedDrive.linkedName = newLinkedName;
            currentLetter++;
          } else {
            currentDrive.linkedName = existingLinkedName;
          }
        }
      }

      return currentDrive;
    });
  }

  function updateDrives() {
    const updatedDrives = convertDrives(selectedDate?.drives);
    setSelectedDate({ ...selectedDate, drives: updatedDrives });
  }

  useEffect(() => {
    if (selectedDate) {
      updateDrives();
    }
  }, [popupOpen, popupDetailsOpen, popupDetailsOpenDuplicate]);

  const handleDateChange = (dates) => {
    const [start] = dates;
    const { weekStart, weekEnd } = getCurrentWeek(start);
    setWeekDates({
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
  };

  useEffect(() => {
    const { weekStart, weekEnd } = getCurrentWeek(new Date());
    setWeekDates({
      start: new Date(weekStart),
      end: new Date(weekEnd),
    });
  }, []);

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Calendar'}
        />

        <div className="mainContentInner crm">
          <CalenderFilters
            fetchAllStages={fetchAllStages}
            setSelectedOptions={setSelectedOptions}
            selectedOptions={selectedOptions}
            clearFilters={clearFilters}
            setClearFilters={setClearFilters}
            // setIsLoading={setIsLoading}
          />
          {isLoading ? (
            <div className={styles.loaderGif}>
              <img
                style={{ width: '360px', height: '250px' }}
                src={loadingGif}
                alt="Loading"
              />
            </div>
          ) : (
            <>
              <div className="claendargetDayTopSec">
                <div className="d-flex justify-content-between mt-4 mb-2">
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => setGoalsToggle(!goalsToggle)}
                    className="link"
                  >
                    {goalsToggle ? 'View as Procedures' : 'View as Products'}
                  </span>
                  <span
                    className="link"
                    onClick={(e) => {
                      setShowDetailView(!showDetailView);
                    }}
                  >
                    {showDetailView ? 'Hide' : 'Show'} Detailed View
                  </span>
                </div>
                <div className="d-flex justify-content-between mt-4 calendar-data-filter">
                  <div className="left-sec">
                    <div
                      className="left-box light-box"
                      style={{
                        padding: '8px',
                        fontSize: '10px',
                        color: '#005375',
                        marginRight: '8px',
                        height: '90px',
                      }}
                    >
                      <div
                        className={`box-light-calendar ${styles.boxLightWidth}`}
                      >
                        Drives <br />
                        <strong className={styles.boxCalendarStrong}>
                          {legendDriveValue}
                        </strong>
                      </div>
                      <div
                        className={`box-light-calendar ${styles.boxLightWidth}`}
                      >
                        Sessions <br />
                        <strong className={styles.boxCalendarStrong}>
                          {legendSessionValue}
                        </strong>
                      </div>

                      <div
                        className="white-box"
                        style={{
                          padding: '8px 8px 8px 0px',
                          color: '#005375',
                          marginLeft: '10px',
                        }}
                      >
                        <div
                          className={`box-light-calendar ${styles.boxLightWidth}`}
                        >
                          Goal <br />
                          <strong className={styles.boxCalendarStrong}>
                            {goalsToggle
                              ? calculateProductGoals()
                              : calculateProcedureGoals()}
                          </strong>
                        </div>
                        <div
                          className={`box-light-calendar ${styles.boxLightWidth}`}
                        >
                          Scheduled <br />
                          <strong className={styles.boxCalendarStrong}>
                            {legendScheduleValue}
                          </strong>
                          <span>
                            {goalsToggle
                              ? `${calculateScheduleProductPercent()}%`
                              : `${calculateScheduleProcedurePercent()}%`}
                            {goalsToggle ? (
                              calculateScheduleProductPercent() > 100 ? (
                                <SvgComponent name={'CalendarUpArrow'} />
                              ) : (
                                ''
                              )
                            ) : calculateScheduleProcedurePercent() > 100 ? (
                              <SvgComponent name={'CalendarUpArrow'} />
                            ) : (
                              ''
                            )}
                          </span>
                        </div>
                        <div
                          className={`box-light-calendar ${styles.boxLightWidth}`}
                        >
                          Actual <br />
                          <strong className={styles.boxCalendarStrong}>
                            {goalsToggle
                              ? calculateActualProduct()
                              : calculateActualProcedures()}
                          </strong>
                          <span>
                            {goalsToggle
                              ? calculateActualProductPercent()
                              : calculateActualProcedurePercent()}
                          </span>
                        </div>
                        <div
                          className={`box-light-calendar ${styles.boxLightWidth}`}
                        >
                          Forecast <br />
                          <strong className={styles.boxCalendarStrong}>
                            {calculateForecast()}
                          </strong>
                          <span>
                            {`${calculateForecastPercent()}%`}
                            {calculateForecastPercent() > 100 ? (
                              <SvgComponent name={'CalendarUpArrow'} />
                            ) : (
                              ''
                            )}
                          </span>
                        </div>
                        <div
                          className={`box-light-calendar ${styles.boxLightWidth}`}
                        >
                          Required <br />
                          <strong className={styles.boxCalendarStrong}>
                            {calculateRequired()}
                          </strong>
                          <span>{calculateRequiredPercent()}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="light-box"
                      style={{
                        padding: '8px',
                        color: '#005375',
                        fontSize: '10px',
                        height: '90px',
                      }}
                    >
                      <div
                        className={`box-light-calendar ${styles.boxLightWidth}`}
                      >
                        OEF <br />
                        <strong className={styles.boxCalendarStrong}>
                          {goalsToggle
                            ? calculateTotalOefProduct()
                            : calculateTotalOefProcedure()}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="right-sec">
                    <button
                      onClick={() =>
                        setShowAvailableDateToggle(!showAvailableDateToggle)
                      }
                      className={`c-right-btn ${
                        showAvailableDateToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon3'} />
                      Available Date
                    </button>
                    <button
                      onClick={() =>
                        setShowCurrentLintToggle(!showCurrentLintToggle)
                      }
                      className={`c-right-btn ${
                        showCurrentLintToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon1'} />
                      Not currently linked
                    </button>
                    <button
                      onClick={() =>
                        setShowUnderGoalToggle(!showUnderGoalToggle)
                      }
                      className={`c-right-btn ${
                        showUnderGoalToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon2'} />
                      Over/Under Goal
                    </button>
                    <button
                      onClick={() => setShowBannerToggle(!showBannerToggle)}
                      className={`c-right-btn ${
                        showBannerToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon8'} />
                      Banner
                    </button>
                    <button
                      onClick={() =>
                        setShowPromotionToggle(!showPromotionToggle)
                      }
                      className={`c-right-btn ${
                        showPromotionToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon10'} />
                      Promotions
                    </button>
                    <button
                      onClick={() => setShowTaskToggle(!showTaskToggle)}
                      className={`c-right-btn ${
                        showTaskToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon5'} />
                      Tasks
                    </button>
                    <button
                      onClick={() =>
                        setShowDriveInsideToggle(!showDriveInsideToggle)
                      }
                      className={`c-right-btn ${
                        showDriveInsideToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon9'} />
                      Drives (inside)
                    </button>
                    <button
                      onClick={() =>
                        setShowDriveOutsideToggle(!showDriveOutsideToggle)
                      }
                      className={`c-right-btn ${
                        showDriveOutsideToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon7'} />
                      Drives (Outside)
                    </button>
                    <button
                      onClick={() => setShowNceToggle(!showNceToggle)}
                      className={`c-right-btn ${showNceToggle ? 'active' : ''}`}
                    >
                      <SvgComponent name={'CalendarIcon6'} />
                      NCEs
                    </button>
                    <button
                      onClick={() => setShowSessionsToggle(!showSessionsToggle)}
                      className={`c-right-btn ${
                        showSessionsToggle ? 'active' : ''
                      }`}
                    >
                      <SvgComponent name={'CalendarIcon4'} />
                      Sessions
                    </button>
                  </div>
                </div>
              </div>
              {showLockDayPopup && (
                <section
                  className={`calendarPoup full-section popup ${
                    showLockDayPopup ? 'active' : ''
                  } `}
                >
                  <LockDateUpsert
                    setShowLockDayPopup={setShowLockDayPopup}
                    showLockDayPopup={showLockDayPopup}
                    endDates={endDates}
                    setEndDates={setEndDates}
                    startDates={startDates}
                    setStartDates={setStartDates}
                    updateDate={updateDate}
                    setUpdateDate={setUpdateDate}
                  />
                </section>
              )}
              {showCloseDayPopup && (
                <section
                  className={`calendarPoup full-section popup ${
                    showCloseDayPopup ? 'active' : ''
                  } `}
                >
                  <CloseDateUpsert
                    showCloseDayPopup={showCloseDayPopup}
                    setShowCloseDayPopup={setShowCloseDayPopup}
                    endDates={endDates}
                    setEndDates={setEndDates}
                    startDates={startDates}
                    setStartDates={setStartDates}
                    updateDate={updateDate}
                    setUpdateDate={setUpdateDate}
                  />
                </section>
              )}
              <div
                className={`${
                  weekMode === 'true' ? 'week-mode' : 'month-mode'
                } ${showDetailView ? 'detail-view' : ''} calendar-container ${
                  styles.calendar
                }`}
              >
                <div className={styles.calendarchild}>
                  <div
                    style={{ cursor: 'pointer' }}
                    className={styles.calendarMode}
                  >
                    <select
                      style={{ cursor: 'pointer' }}
                      value={weekMode}
                      onChange={(e) => {
                        setClearFilters(true);
                        setWeekMode(e.target.value);
                      }}
                    >
                      {' '}
                      <option value={'true'}>Week View</option>
                      <option value={'false'}>Month View</option>
                    </select>
                  </div>
                  <div className={styles.month}>
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="#2D2D2E"
                        className={`bi bi-chevron-left ${styles.pointer}`}
                        viewBox="0 0 16 16"
                        onClick={handlePrevClick}
                        strokeWidth={5}
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                        />
                      </svg>
                      <div
                        className={`week-navigation ${styles.weekNavigation}`}
                      >
                        <DatePicker
                          name="week_dates"
                          placeholderText={'Date Range'}
                          selected={weekDates.start}
                          startDate={weekDates.start}
                          endDate={weekDates.end}
                          onChange={handleDateChange}
                          selectsRange
                          isClearable={false}
                        />
                        {/* {getCurrentWeek(new Date()).weekStart.format(
                          'DD MMMM, YYYY'
                        )}{' '}
                        -{' '}
                        {getCurrentWeek(new Date()).weekEnd.format(
                          'DD MMMM, YYYY'
                        )} */}
                      </div>
                      <div
                        className={`d-flex align-items-center month-navigation ${styles.date}`}
                      >
                        <div
                          onClick={() => setOpenMonthPopUp(!openMonthPopUp)}
                          className="d-flex position-relative align-items-center justify-content-between ms-5"
                        >
                          <h1 style={{ cursor: 'pointer' }}>
                            {months[currentMonths]}
                          </h1>
                          {openMonthPopUp && weekMode !== 'true' && (
                            <div className={styles.calenderMain}>
                              <div className={styles.monthBox}>
                                {monthsData?.map((month, index) => (
                                  <div
                                    key={month}
                                    className={styles.monthdiv}
                                    onClick={() => handleMonthClick(index)}
                                  >
                                    {month}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="d-flex flex-column align-items-center justify-content-between">
                            <span
                              className={styles.upchevron}
                              // onClick={handleNextClick}
                            >
                              <SvgComponent name={'UpChevron'} />
                            </span>
                            <span
                              className={styles.downchevron}
                              // onClick={handlePrevClick}
                            >
                              <SvgComponent name={'DownChevron'} />
                            </span>
                          </div>
                        </div>
                        <div
                          onClick={() => setOpenYearPopUp(!openYearPopUp)}
                          className="d-flex position-relative align-items-center justify-content-between me-5"
                        >
                          <h1 style={{ cursor: 'pointer' }} className="ms-5">
                            {showYear}
                          </h1>
                          {openYearPopUp && weekMode !== 'true' && (
                            <div className={styles.calenderMain}>
                              <div
                                style={{ marginLeft: '45px' }}
                                className={styles.monthBox}
                              >
                                {yearsData?.map((year, index) => (
                                  <div
                                    key={year}
                                    className={styles.monthdiv}
                                    onClick={() => handleYearClick(year)}
                                  >
                                    {year}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="d-flex flex-column align-items-center justify-content-between">
                            <span
                              className={styles.upchevron}
                              // onClick={nextYear}
                            >
                              <SvgComponent name={'UpChevron'} />
                            </span>
                            <span
                              className={styles.downchevron}
                              // onClick={prevYear}
                            >
                              <SvgComponent name={'DownChevron'} />
                            </span>
                          </div>
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="#2D2D2E"
                        className={`bi bi-chevron-right ${styles.pointer}`}
                        viewBox="0 0 16 16"
                        onClick={handleNextClick}
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                        />
                      </svg>
                    </>
                    <div className={styles.calenderTopBtn}>
                      <div
                        style={{ width: weekMode === 'true' ? '170px' : '' }}
                        className={styles.todayBtn}
                        onClick={handleGoTo}
                      >
                        Today
                      </div>
                      {weekMode === 'false' ? (
                        <div className={`${styles.fieldDate} ms-2`}>
                          <DatePicker
                            dateFormat="MM/dd/yyyy"
                            // showLabel={true}
                            selected={startDate}
                            className={`${styles.dateTimeSvg} `}
                            onChange={(item) => {
                              if (item) {
                                const date = moment(item);
                                setDate(item);
                                const monthNumber = date?.format('MM');
                                const year = date?.format('YYYY');
                                getData(monthNumber, year);
                              } else {
                                setIsGoTo(true);
                                handleGoTo();
                              }
                              setStartDate(item);
                            }}
                            placeholderText="Go to Date"
                          />
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                  <div className={styles.weekdays}>
                    <div>Sunday</div>
                    <div>Monday</div>
                    <div>Tuesday</div>
                    <div>Wednesday</div>
                    <div>Thursday</div>
                    <div>Friday</div>
                    <div>Saturday</div>
                  </div>
                  <div
                    className="calendar-dates"
                    style={{
                      display: isLoading ? 'flex' : 'block',
                      justifyContent: 'center',
                    }}
                  >
                    {renderCalendar()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {showModal && (
          <section
            className={`calendarPoup full-section popup ${
              showModal ? 'active' : ''
            } `}
          >
            {/* <Modal show={showModal} style={{ width: '1000px' }}> */}
            <div
              className="popup-inner"
              style={{
                maxWidth: '1000px',
                height: '500px',
                overflowY: 'auto',
              }}
            >
              {/* <Container style={{ width: '100%' }}> */}
              <div className={styles.popupHeader}>
                <h3 className={styles.popupTitle}>Banners and Promotions</h3>
                <button
                  className={styles.popupClose}
                  onClick={() => {
                    setShowModal(false);
                    setShowDriveFilter(false);
                  }}
                >
                  <SvgComponent name={'CrossIcon'} />
                </button>
              </div>
              <div className="mainContentInner pb-1 px-0">
                <div className={`NotesBar border-separator pb-0`}>
                  <div className="d-flex align-items-center h-100">
                    <Link
                      className={
                        activeNotiTab === 'Banners'
                          ? 'text-white h-100'
                          : 'h-100'
                      }
                      onClick={() => handleNotiClick('Banners')}
                    >
                      <p
                        className={
                          activeNotiTab === 'Banners'
                            ? `mb-0 ${styles.activeNotitab}`
                            : `mb-0 ${styles.NotactiveNotitab}`
                        }
                      >
                        Banners
                      </p>
                    </Link>

                    <Link
                      className={
                        activeNotiTab === 'Promotions'
                          ? 'text-white h-100'
                          : 'h-100'
                      }
                      onClick={() => handleNotiClick('Promotions')}
                    >
                      <p
                        className={
                          activeNotiTab === 'Promotions'
                            ? `mb-0 activeNotes ${styles.activeNotitab}`
                            : `mb-0 ${styles.NotactiveNotitab}`
                        }
                        // style={{ padding: '0 20px', color: '#005375' }}
                      >
                        Promotions
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr className={styles.tableHeaderRow}>
                  <th className={styles.promotionBannerHead}>Name</th>
                  <th className={styles.promotionBannerHead}>Description</th>
                  <th className={styles.promotionBannerHead}>Collection Op.</th>
                  <th className={styles.promotionBannerHead}>Start Date</th>
                  <th className={styles.promotionBannerHead}>End Date</th>
                </tr>
                {/* <tbody> */}
                {activeNotiTab === 'Banners' &&
                bannersData &&
                bannersData?.length
                  ? bannersData?.map((banner) => (
                      <tr className={styles.tableDataRow} key={banner.id}>
                        <td>{banner?.title}</td>
                        <td>{banner?.description}</td>
                        <td>
                          {bannersCoData?.length
                            ? bannersCoData
                                ?.filter(
                                  (co) => +co?.banner_id?.id === +banner?.id
                                )
                                ?.map((co, index, array) => (
                                  <span key={index}>
                                    {co?.collection_operation_id?.name}
                                    {index < array.length - 1 ? ', ' : ''}
                                  </span>
                                ))
                            : ''}
                        </td>
                        <td>
                          {moment(banner?.start_date).format('DD-MM-YYYY')}
                        </td>
                        <td>{moment(banner?.end_date).format('DD-MM-YYYY')}</td>
                      </tr>
                    ))
                  : ''}
                {activeNotiTab === 'Promotions' &&
                promotionsData &&
                promotionsData?.length
                  ? promotionsData?.map((promotion) => {
                      return (
                        <tr className={styles.tableDataRow} key={promotion.id}>
                          <td>{promotion?.name}</td>
                          <td>{promotion?.description}</td>
                          <td>
                            {promotion?.collectionOperations?.length
                              ? promotion?.collectionOperations?.map(
                                  (co, index, array) => (
                                    <span key={index}>
                                      {co?.collection_operation_id?.name}
                                      {index < array.length - 1 ? ', ' : ''}
                                    </span>
                                  )
                                )
                              : ''}
                          </td>
                          <td>
                            {moment(promotion?.start_date).format('DD-MM-YYYY')}
                          </td>
                          <td>
                            {moment(promotion?.end_date).format('DD-MM-YYYY')}
                          </td>
                        </tr>
                      );
                    })
                  : ''}
                {/* </tbody> */}
              </table>
            </div>
          </section>
        )}
        {popupOpen ? (
          <section
            className={`calendarPoup full-section popup ${
              popupOpen ? 'active' : ''
            } `}
          >
            <div className="popup-inner" style={{ maxWidth: '800px' }}>
              <div className={`content ${styles.tooltipSize}`}>
                <div className={styles.popupHeader}>
                  <h3 className={styles.popupTitle}>
                    {moment(selectedDate?.date).format('MM-DD-YYYY')}
                  </h3>
                  <button
                    className={styles.popupClose}
                    onClick={() => {
                      setPopupOpen(false);
                      setShowDriveFilter(false);
                    }}
                  >
                    <SvgComponent name={'CrossIcon'} />
                  </button>
                </div>
                <div className="row">
                  <div className="col-md-7">
                    <div className="d-flex justify-content-between mb-4">
                      <h4
                        className={`${styles.innerTitle} ${
                          overGoalFunc() === 'Over Goal'
                            ? styles.iconGreenColor
                            : overGoalFunc() === 'Under Goal'
                            ? styles.iconRedColor
                            : ''
                        }`}
                      >
                        {overGoalFunc()}
                      </h4>
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => setPopupToggleProd(!popupToggleProd)}
                        className={styles.linkPopup}
                      >
                        {popupToggleProd
                          ? 'View as Procedures'
                          : 'View as Products'}
                      </span>
                    </div>
                    <div className={styles.headerBTN}>
                      {showAvailableDateToggle && (
                        <>
                          <button className={styles.smallBtn}>
                            <ToolTip
                              className={styles.toolTip}
                              text={'Date Available (Outside)'}
                              icon={
                                <SvgComponent name={'CalendarDirectionIcon'} />
                              }
                            />
                          </button>
                          <button className={styles.smallBtn}>
                            <ToolTip
                              className={styles.toolTip}
                              text={' Date Available (Inside)'}
                              icon={
                                <SvgComponent name={'CalendarHumidityIcon'} />
                              }
                            />
                          </button>
                        </>
                      )}
                      {isLinkIcon && showCurrentLintToggle && (
                        <button className={styles.smallBtn}>
                          <ToolTip
                            className={styles.toolTip}
                            text={' Link Opportunity'}
                            icon={<SvgComponent name={'CalendarLinkIcon'} />}
                          />
                        </button>
                      )}
                      {matchingLockItem?.status ? (
                        <button className={styles.smallBtn}>
                          <ToolTip
                            className={styles.toolTip}
                            text={' Day Locked'}
                            icon={<SvgComponent name={'CalendarLockIcon'} />}
                          />
                        </button>
                      ) : (
                        ''
                      )}

                      <button className={styles.smallBtn}>
                        <ToolTip
                          className={styles.toolTip}
                          text1={`Shared Staff: ${selectedDate?.net_total_shared_staff}`}
                          text2={`Shared Vehicles: ${selectedDate?.net_total_shared_vehicles}`}
                          text3={`Shared Devices: ${selectedDate?.net_total_shared_devices}`}
                          icon={<SvgComponent name={'CalendarMoveDownIcon'} />}
                        />
                        &nbsp;10
                      </button>
                    </div>
                    <div className={styles.taskDetails}>
                      <h3>
                        <span>Goal</span>
                        {popupToggleProd
                          ? selectedDate?.goal_products
                            ? Number.isInteger(selectedDate?.goal_products)
                              ? selectedDate?.goal_products.toString()
                              : selectedDate?.goal_products?.toFixed(2)
                            : 0
                          : selectedDate?.goal_procedures
                          ? Number.isInteger(selectedDate?.goal_procedures)
                            ? selectedDate?.goal_procedures.toString()
                            : selectedDate?.goal_procedures?.toFixed(2)
                          : 0}
                      </h3>
                      <h3>
                        <span>Scheduled</span>
                        {scheduleValue}
                      </h3>
                      <h3>
                        <span>Actual</span>
                        {popupToggleProd
                          ? selectedDate?.actual_products
                            ? Number.isInteger(selectedDate?.actual_products)
                              ? selectedDate?.actual_products.toString()
                              : selectedDate?.actual_products?.toFixed(2)
                            : 0
                          : selectedDate?.actual_procedures
                          ? Number.isInteger(selectedDate?.actual_procedures)
                            ? selectedDate?.actual_procedures.toString()
                            : selectedDate?.actual_procedures?.toFixed(2)
                          : 0}
                      </h3>
                      <br />
                      <h3>
                        <span>PA</span>
                        {selectedDate?.date &&
                        new Date(selectedDate?.date)
                          .toISOString()
                          .slice(0, 10) >= new Date().toISOString().slice(0, 10)
                          ? '-'
                          : popupToggleProd
                          ? scheduleValue &&
                            selectedDate?.actual_products &&
                            scheduleValue !== 0 &&
                            selectedDate?.actual_products !== 0
                            ? `${parseInt(
                                (selectedDate?.actual_products /
                                  scheduleValue) *
                                  100,
                                10
                              )}%`
                            : '0%'
                          : scheduleValue &&
                            selectedDate.actual_procedures &&
                            scheduleValue !== 0 &&
                            selectedDate.actual_procedures !== 0
                          ? `${parseInt(
                              (selectedDate.actual_procedures / scheduleValue) *
                                100,
                              10
                            )}%`
                          : '0%'}
                      </h3>
                      <h3>
                        <span>PG</span>
                        {selectedDate?.date &&
                        new Date(selectedDate?.date)
                          .toISOString()
                          .slice(0, 10) >= new Date().toISOString().slice(0, 10)
                          ? '-'
                          : popupToggleProd
                          ? selectedDate?.goal_products &&
                            selectedDate?.actual_products &&
                            selectedDate?.goal_products !== 0 &&
                            selectedDate?.actual_products !== 0
                            ? `${parseInt(
                                (selectedDate?.actual_products /
                                  selectedDate?.goal_products) *
                                  100,
                                10
                              )}%`
                            : '0%'
                          : selectedDate.goal_procedures &&
                            selectedDate.actual_procedures &&
                            selectedDate.goal_procedures !== 0 &&
                            selectedDate.actual_procedures !== 0
                          ? `${parseInt(
                              (selectedDate.actual_procedures /
                                selectedDate.goal_procedures) *
                                100,
                              10
                            )}%`
                          : '0%'}
                      </h3>
                    </div>
                    <div className={styles.progress}>
                      <div>
                        <h4>Staff</h4>
                        <h3>{`${selectedDate?.staffBooked}/${selectedDate?.staffAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressRed}
                            style={{
                              maxWidth: `${
                                selectedDate?.staffBooked === 0 &&
                                selectedDate?.staffAvailable === 0
                                  ? '0'
                                  : (selectedDate?.staffBooked /
                                      selectedDate?.staffAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h4>Vehicles</h4>
                        <h3>{`${selectedDate?.vehicleBooked}/${selectedDate?.vehicleAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressGreen}
                            style={{
                              maxWidth: `${
                                selectedDate?.vehicleBooked === 0 &&
                                selectedDate?.vehicleAvailable === 0
                                  ? '0'
                                  : (selectedDate?.vehicleBooked /
                                      selectedDate?.vehicleAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h4>Devices</h4>
                        <h3>{`${selectedDate?.deviceBooked}/${selectedDate?.deviceAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressYellow}
                            style={{
                              maxWidth: `${
                                selectedDate?.deviceBooked === 0 &&
                                selectedDate?.deviceAvailable === 0
                                  ? '0'
                                  : (selectedDate?.deviceBooked /
                                      selectedDate?.deviceAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.popupTask}>
                      <p>
                        <strong>Tasks</strong>
                      </p>
                      <div className={styles.taskList}>
                        {showTaskToggle &&
                          selectedDate?.drives?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                        {showTaskToggle &&
                          selectedDate?.sessions?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                        {showTaskToggle &&
                          selectedDate?.nce?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className={styles.headerPopupRight}>
                      <div className={styles.popupAccordion}>
                        <button
                          className={
                            activeTab === 'Drives' ? styles.active : ''
                          }
                          onClick={() => handleClick('Drives')}
                        >
                          Drives
                        </button>
                        <button
                          className={
                            activeTab === 'Sessions' ? styles.active : ''
                          }
                          onClick={() => handleClick('Sessions')}
                        >
                          Sessions
                        </button>
                        <button
                          className={
                            activeTab === 'Events' ? styles.active : ''
                          }
                          onClick={() => handleClick('Events')}
                        >
                          Events
                        </button>
                      </div>
                      <div className={styles.popupRight}>
                        <div>
                          <button
                            onClick={() => {
                              setShowDriveFilter((prev) => !prev);
                            }}
                          >
                            <SvgComponent name={'CalendarSortIcon'} />
                          </button>
                          <ul
                            className={`dropdown-menu claendar-dropdown ${
                              showDriveFilters ? 'show' : ''
                            }`}
                          >
                            <li
                              onClick={() => {
                                setSortingCriteria('Account Name');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a className="dropdown-item">Account Name</a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Account Name Desc');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Account Name (Z-A)
                              </a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Operation Type');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Operation Type
                              </a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Depart Time');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Depart Time
                              </a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Return Time');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Return Time
                              </a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Projection');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Projection
                              </a>
                            </li>
                            <li
                              onClick={() => {
                                setSortingCriteria('Status');
                                setShowDriveFilter(false);
                              }}
                            >
                              <a href="#" className="dropdown-item">
                                Status
                              </a>
                            </li>
                          </ul>
                        </div>
                        <button onClick={sortingData}>
                          <SvgComponent name={'CalendarSortIconTwo'} />
                        </button>
                      </div>
                    </div>
                    {activeTab === 'Drives' && (
                      <div className="calendarTaskList">
                        {selectedDate?.drives && selectedDate?.drives?.length
                          ? selectedDate?.drives
                              ?.filter((item) => {
                                if (
                                  !showDriveInsideToggle &&
                                  item.crm_locations.site_type === 'Inside'
                                ) {
                                  return false;
                                }

                                if (
                                  !showDriveOutsideToggle &&
                                  item.crm_locations.site_type === 'Outside'
                                ) {
                                  return false;
                                }

                                return true;
                              })
                              ?.map((item, index) => {
                                return (
                                  <div
                                    key={index}
                                    style={{ cursor: 'pointer' }}
                                    className={styles.listBox}
                                    onClick={() => {
                                      setShowAllInfo(true);
                                      setPopupDetailsOpen(true);
                                      setPopupOpen(false);
                                      setShowDriveFilter(false);
                                      setDriveDetailsData(item);
                                      setPopupSideDetailsOpen(true);
                                      setPopupSideDetailsNceOpen(false);
                                    }}
                                  >
                                    <div
                                      className={
                                        item.crm_locations.site_type ===
                                        'Inside'
                                          ? styles.darkBlueBox
                                          : styles.whiteBox
                                      }
                                    >
                                      <div className={styles.listCenterTitle}>
                                        <h4
                                          className={`${styles.listTitle} ${
                                            item?.drive?.operation_status_id
                                              ?.chip_color === 'Grey'
                                              ? styles.greyChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Green'
                                              ? styles.greenChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Yellow'
                                              ? styles.yellowChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Red'
                                              ? styles.redChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Blue'
                                              ? styles.blueChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Lavender'
                                              ? styles.lavendarChip
                                              : styles.green
                                          }`}
                                        >
                                          {item?.linkedName
                                            ? item.linkedName
                                            : ''}{' '}
                                          {item?.linkedName ? (
                                            <span>
                                              {item?.account?.name
                                                ? item?.account?.name
                                                : 'N/A'}
                                            </span>
                                          ) : (
                                            `${
                                              item?.account?.name
                                                ? item?.account?.name
                                                : 'N/A'
                                            }`
                                          )}
                                        </h4>
                                        <h4 className={styles.lisTtime}>
                                          {item?.shifts_data
                                            ?.earliest_shift_start_time
                                            ? `${formatDateWithTZ(
                                                item?.shifts_data
                                                  ?.earliest_shift_start_time,
                                                'HH:mm'
                                              )} - ${formatDateWithTZ(
                                                item?.shifts_data
                                                  ?.latest_shift_return_time,
                                                'HH:mm'
                                              )}`
                                            : 'N/A'}
                                        </h4>
                                      </div>
                                      <div
                                        className={styles.listCenterDescription}
                                      >
                                        <p className={styles.description}>
                                          {item?.recruiter
                                            ? formatUser(item?.recruiter, 1)
                                            : 'N/A'}
                                        </p>
                                        <p className={styles.discCount}>
                                          {popupToggleProd
                                            ? item?.projections
                                                ?.total_product_yield
                                              ? item?.projections
                                                  ?.total_product_yield
                                              : ''
                                            : item?.projections
                                                ?.total_procedure_type_qty
                                            ? item?.projections
                                                ?.total_procedure_type_qty
                                            : ''}{' '}
                                          {item?.projections
                                            ?.total_product_yield &&
                                          item?.projections
                                            ?.total_procedure_type_qty ? (
                                            <span>
                                              {item?.staff_setups_count &&
                                              item?.staff_setups_count?.length
                                                ? item?.staff_setups_count?.map(
                                                    (items, index) => {
                                                      const isLastItem =
                                                        index ===
                                                        item?.staff_setups_count
                                                          ?.length -
                                                          1;
                                                      return (
                                                        <React.Fragment
                                                          key={index}
                                                        >
                                                          {`${items}`}
                                                          {isLastItem
                                                            ? ''
                                                            : ', '}
                                                        </React.Fragment>
                                                      );
                                                    }
                                                  )
                                                : ''}
                                            </span>
                                          ) : item?.staff_setups_count &&
                                            item?.staff_setups_count?.length ? (
                                            item?.staff_setups_count?.map(
                                              (items, index) => {
                                                const isLastItem =
                                                  index ===
                                                  item?.staff_setups_count
                                                    ?.length -
                                                    1;
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${items}`}
                                                    {isLastItem ? '' : ', '}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          ) : (
                                            ''
                                          )}
                                          {item?.vehicles &&
                                          item?.vehicles?.length
                                            ? item?.vehicles?.map(
                                                (short, index) => {
                                                  return (
                                                    <React.Fragment key={index}>
                                                      {`${
                                                        short?.short_name
                                                          ? ` , ${short?.short_name}`
                                                          : ''
                                                      }`}
                                                    </React.Fragment>
                                                  );
                                                }
                                              )
                                            : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          : ''}
                      </div>
                    )}
                    {activeTab === 'Sessions' && (
                      <div className="calendarTaskList">
                        {showSessionsToggle &&
                        selectedDate?.sessions &&
                        selectedDate?.sessions?.length
                          ? selectedDate?.sessions?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={styles.listBox}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setShowAllInfo(true);
                                    setPopupSideDetailsSessionOpen(true);
                                    setPopupDetailsOpen(true);
                                    setPopupOpen(false);
                                    setShowDriveFilter(false);
                                    setSessionDetailsData(item);
                                    setPopupSideDetailsOpen(false);
                                  }}
                                >
                                  <div className={styles.lightBlueBox}>
                                    <div className={styles.listCenterTitle}>
                                      <h4
                                        className={`${styles.listTitle} ${
                                          item?.oc_chip_color === 'Grey'
                                            ? styles.greyChip
                                            : item?.oc_chip_color === 'Green'
                                            ? styles.greenChip
                                            : item?.oc_chip_color === 'Yellow'
                                            ? styles.yellowChip
                                            : item?.oc_chip_color === 'Red'
                                            ? styles.redChip
                                            : item?.oc_chip_color === 'Blue'
                                            ? styles.blueChip
                                            : item?.oc_chip_color === 'Lavender'
                                            ? styles.lavendarChip
                                            : styles.green
                                        }`}
                                      >
                                        {item?.dc_name ? item?.dc_name : 'N/A'}
                                      </h4>
                                      <h4 className={styles.lisTtime}>
                                        {item?.shifts_data
                                          ?.earliest_shift_start_time
                                          ? `${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.earliest_shift_start_time,
                                              'HH:mm'
                                            )} - ${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.latest_shift_return_time,
                                              'HH:mm'
                                            )}`
                                          : 'N/A'}
                                      </h4>
                                    </div>
                                    <div
                                      className={styles.listCenterDescription}
                                    >
                                      <p className={styles.description}></p>
                                      <p className={styles.discCount}>
                                        {popupToggleProd
                                          ? item?.projections
                                              ?.total_product_yield
                                            ? item?.projections
                                                ?.total_product_yield
                                            : ''
                                          : item?.projections
                                              ?.total_procedure_type_qty
                                          ? item?.projections
                                              ?.total_procedure_type_qty
                                          : ''}{' '}
                                        {item?.projections
                                          ?.total_product_yield &&
                                        item?.projections
                                          ?.total_procedure_type_qty ? (
                                          <span>
                                            {item?.staff_setups_count &&
                                            item?.staff_setups_count?.length
                                              ? item?.staff_setups_count?.map(
                                                  (items, index) => {
                                                    const isLastItem =
                                                      index ===
                                                      item?.staff_setups_count
                                                        ?.length -
                                                        1;
                                                    return (
                                                      <React.Fragment
                                                        key={index}
                                                      >
                                                        {`${items}`}
                                                        {isLastItem ? '' : ', '}
                                                      </React.Fragment>
                                                    );
                                                  }
                                                )
                                              : ''}
                                          </span>
                                        ) : item?.staff_setups_count &&
                                          item?.staff_setups_count?.length ? (
                                          item?.staff_setups_count?.map(
                                            (items, index) => {
                                              const isLastItem =
                                                index ===
                                                item?.staff_setups_count
                                                  ?.length -
                                                  1;
                                              return (
                                                <React.Fragment key={index}>
                                                  {`${items}`}
                                                  {isLastItem ? '' : ', '}
                                                </React.Fragment>
                                              );
                                            }
                                          )
                                        ) : (
                                          ''
                                        )}
                                        {/* {item?.vehicles &&
                                        item?.vehicles?.length
                                          ? item?.vehicles?.map(
                                              (short, index) => {
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${
                                                      short?.short_name
                                                        ? ` , ${short?.short_name}`
                                                        : ''
                                                    }`}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          : ''} */}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : ''}
                      </div>
                    )}
                    {activeTab === 'Events' && (
                      <div className="calendarTaskList">
                        {showNceToggle &&
                        selectedDate?.nce &&
                        selectedDate?.nce?.length
                          ? selectedDate?.nce?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  style={{ cursor: 'pointer' }}
                                  className={styles.listBox}
                                  onClick={() => {
                                    setNceDetailsData(item);
                                    setPopupSideDetailsNceOpen(true);
                                    setPopupSideDetailsOpen(false);
                                    setShowAllInfo(true);
                                    setPopupDetailsOpen(true);
                                    setPopupOpen(false);
                                    setShowDriveFilter(false);
                                  }}
                                >
                                  <div className={styles.blueBox}>
                                    <div className={styles.listCenterTitle}>
                                      <h4
                                        className={`${styles.listTitle} ${
                                          item?.status?.operation_status_id
                                            ?.chip_color === 'Grey'
                                            ? styles.greyChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Green'
                                            ? styles.greenChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Yellow'
                                            ? styles.yellowChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Red'
                                            ? styles.redChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Blue'
                                            ? styles.blueChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Lavender'
                                            ? styles.lavendarChip
                                            : styles.green
                                        }`}
                                      >
                                        {item?.ncp?.non_collection_profile?.name
                                          ? item?.ncp?.non_collection_profile
                                              ?.name
                                          : 'N/A'}
                                      </h4>
                                      <h4 className={styles.lisTtime}>
                                        {item?.shifts_data
                                          ?.latest_shift_return_time
                                          ? `${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.earliest_shift_start_time,
                                              'HH:mm'
                                            )} - ${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.latest_shift_return_time,
                                              'HH:mm'
                                            )}`
                                          : 'N/A'}
                                      </h4>
                                    </div>
                                    <div
                                      className={styles.listCenterDescription}
                                    >
                                      <p className={styles.description}></p>
                                      <p className={styles.discCount}>
                                        {popupToggleProd
                                          ? item?.projections
                                              ?.total_product_yield
                                          : item?.projections
                                              ?.total_procedure_type_qty}{' '}
                                        {/* {item?.projections
                                          ?.total_product_yield &&
                                        item?.projections
                                          ?.total_procedure_type_qty ? (
                                          <span>
                                            {item?.staff_setups_count &&
                                            item?.staff_setups_count?.length
                                              ? item?.staff_setups_count?.map(
                                                  (items, index) => {
                                                    const isLastItem =
                                                      index ===
                                                      item?.staff_setups_count
                                                        ?.length -
                                                        1;
                                                    return (
                                                      <React.Fragment
                                                        key={index}
                                                      >
                                                        {`${items}`}
                                                        {isLastItem ? '' : ', '}
                                                      </React.Fragment>
                                                    );
                                                  }
                                                )
                                              : ''}
                                          </span>
                                        ) : item?.staff_setups_count &&
                                          item?.staff_setups_count?.length ? (
                                          item?.staff_setups_count?.map(
                                            (items, index) => {
                                              const isLastItem =
                                                index ===
                                                item?.staff_setups_count
                                                  ?.length -
                                                  1;
                                              return (
                                                <React.Fragment key={index}>
                                                  {`${items}`}
                                                  {isLastItem ? '' : ', '}
                                                </React.Fragment>
                                              );
                                            }
                                          )
                                        ) : (
                                          ''
                                        )} */}
                                        {item?.vehicles &&
                                        item?.vehicles?.length
                                          ? item?.vehicles?.map(
                                              (short, index) => {
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${
                                                      short?.short_name
                                                        ? ` , ${short?.short_name}`
                                                        : ''
                                                    }`}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {popupDetailsOpenDuplicate ? (
          <section
            className={`calendarPoup full-section ${
              showAllInfo ? 'show-info' : 'hide-info'
            } popup ${popupDetailsOpenDuplicate ? 'active' : ''}`}
          >
            <div
              className="popup-inner"
              style={{ maxWidth: '400px', padding: '20px' }}
            >
              <div className="col-md-12">
                <div className={styles.popupHeader}>
                  <h3 style={{ color: '#005375' }}>
                    <span className={styles.popupTitle}>
                      {frontDetailData?.account?.name}
                    </span>
                    <br />
                    <span style={{ color: '#000', fontSize: '16px' }}>
                      {moment(frontDetailData?.drive?.date).format(
                        'MM-DD-YYYY'
                      )}
                    </span>
                  </h3>
                  <button
                    className={styles.popupClose}
                    onClick={() => {
                      setPopupDetailsOpenDuplicate(false);
                      setShowDriveFilter(false);
                    }}
                  >
                    <SvgComponent name={'CrossIcon'} />
                  </button>
                </div>
                <div className={styles.popupTaskDetail}>
                  {/* <h3>
                  Metro High School
                  <span>1 January, 2023</span>
                </h3> */}
                  <p className={styles.time}>
                    {frontDetailData?.shifts_data?.earliest_shift_start_time &&
                    frontDetailData?.shifts_data?.latest_shift_return_time
                      ? `${formatDateWithTZ(
                          frontDetailData?.shifts_data
                            ?.earliest_shift_start_time,
                          'HH:mm a'
                        )} - ${formatDateWithTZ(
                          frontDetailData?.shifts_data
                            ?.latest_shift_return_time,
                          'HH:mm a'
                        )}`
                      : ''}{' '}
                    <span>
                      {popupToggleProd
                        ? frontDetailData?.projections?.total_product_yield
                        : frontDetailData?.projections
                            ?.total_procedure_type_qty}{' '}
                    </span>
                  </p>
                  <div className={styles.popupLocation}>
                    <h4>
                      <span>Location</span>
                      <span
                        style={
                          frontDetailData?.crm_locations?.name
                            ? {
                                color: '#005375',
                                fontSize: '16px',
                                fontWeight: '500',
                              }
                            : ''
                        }
                      >
                        {frontDetailData?.crm_locations?.name
                          ? frontDetailData?.crm_locations?.name
                          : 'N/A'}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Primary Chairperson</span>
                      <span
                        className={styles.operationDetails}
                        style={{
                          color: '#005375',
                          fontSize: '16px',
                          fontWeight: '500',
                        }}
                      >
                        {frontDetailData?.drive?.drive_contacts &&
                        frontDetailData?.drive?.drive_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]?.role?.name
                          ? frontDetailData?.drive?.drive_contacts[0]?.role
                              ?.name
                          : 'N/A'}
                      </span>
                    </h4>
                    <h4>
                      <span>Chairperson Phone</span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.drive?.drive_contacts &&
                        frontDetailData?.drive?.drive_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data?.length
                          ? frontDetailData?.drive?.drive_contacts[0]
                              ?.account_contacts[0]?.contactable_data[0]?.data
                          : 'N/A'}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Chairperson SMS</span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.drive?.drive_contacts &&
                        frontDetailData?.drive?.drive_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data[0]?.data
                          ? frontDetailData?.drive?.drive_contacts[0]
                              ?.account_contacts[0]?.contactable_data[0]?.data
                          : 'N/A'}
                      </span>
                    </h4>
                    <h4>
                      <span>Chairperson Email</span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.drive?.drive_contacts &&
                        frontDetailData?.drive?.drive_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts?.length &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data?.length > 1 &&
                        frontDetailData?.drive?.drive_contacts[0]
                          ?.account_contacts[0]?.contactable_data[1]?.data
                          ? frontDetailData?.drive?.drive_contacts[0]
                              ?.account_contacts[0]?.contactable_data[1]?.data
                          : 'N/A'}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Recruite</span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.recruiter
                          ? formatUser(frontDetailData?.recruiter, 1)
                          : 'N/A'}
                      </span>
                    </h4>
                    <h4>
                      <span>Setup</span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.staff_setups_count &&
                        frontDetailData?.staff_setups_count?.length
                          ? frontDetailData?.staff_setups_count?.map(
                              (item, index) => {
                                const isLastItem =
                                  index ===
                                  frontDetailData?.staff_setups_count?.length -
                                    1;
                                return (
                                  <React.Fragment key={index}>
                                    {`${item}`}
                                    {isLastItem ? '' : ', '}
                                  </React.Fragment>
                                );
                              }
                            )
                          : 'N/A'}
                      </span>
                      <span className={styles.operationDetails}>
                        {frontDetailData?.vehicles &&
                        frontDetailData?.vehicles?.length
                          ? frontDetailData?.vehicles?.map((short, index) => {
                              const isLastItem =
                                index === frontDetailData?.vehicles?.length - 1;
                              return (
                                <React.Fragment key={index}>
                                  {`${
                                    short?.short_name ? short?.short_name : ''
                                  }`}
                                  {short?.short_name
                                    ? isLastItem
                                      ? ''
                                      : ', '
                                    : ''}
                                </React.Fragment>
                              );
                            })
                          : 'N/A'}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Shifts</span>
                      {frontDetailData?.shifts_data?.shifts
                        ? frontDetailData?.shifts_data?.shifts
                        : 'N/A'}
                    </h4>
                    {frontDetailData?.linked_drive?.account_name ? (
                      <h4>
                        <span>Linked With</span>
                        {frontDetailData?.linked_drive?.account_name}
                      </h4>
                    ) : (
                      ''
                    )}
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Status</span>
                      <button
                        style={{
                          borderRadius: '4px',
                          padding: '5px',
                          // height: '25px',
                          // lineHeight: '25px',
                          textAlign: 'center',
                          minWidth: '80px',
                          fontSize: '12px',
                          cursor: 'text',
                        }}
                        className={
                          frontDetailData?.drive?.operation_status_id
                            ?.chip_color === 'Green'
                            ? styles.green
                            : frontDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Yellow'
                            ? styles.yellow
                            : frontDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Red'
                            ? styles.red
                            : frontDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Blue'
                            ? styles.blue
                            : frontDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Grey'
                            ? styles.grey
                            : frontDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Lavender'
                            ? styles.lavendar
                            : styles.green
                        }
                      >
                        {frontDetailData?.drive?.operation_status_id?.name}
                      </button>
                    </h4>
                  </div>
                  <div className="d-flex justify-content-end">
                    <h4 className="font-size-14px text-primary">
                      <Link
                        to={`/operations-center/operations/drives/${frontDetailData?.drive?.id}/view/about`}
                      >
                        View Drive
                      </Link>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          ''
        )}
        {popupNceDetailsOpenDuplicate ? (
          <section
            className={`calendarPoup full-section ${
              showAllInfo ? 'show-info' : 'hide-info'
            } popup ${popupNceDetailsOpenDuplicate ? 'active' : ''}`}
          >
            <div
              className="popup-inner"
              style={{ maxWidth: '400px', padding: '20px' }}
            >
              <div className="col-md-12">
                <div className={styles.popupHeader}>
                  <h3 style={{ color: '#005375' }}>
                    <span className={styles.popupTitle}>
                      {frontNceDetailData?.ncp?.non_collection_profile?.name}
                    </span>
                    <br />
                    <span style={{ color: '#000', fontSize: '16px' }}>
                      {moment(frontNceDetailData?.date).format('MM-DD-YYYY')}
                    </span>
                  </h3>
                  <button
                    className={styles.popupClose}
                    onClick={() => {
                      setPopupNceDetailsOpenDuplicate(false);
                      setShowDriveFilter(false);
                    }}
                  >
                    <SvgComponent name={'CrossIcon'} />
                  </button>
                </div>
                <div className={styles.popupTaskDetail}>
                  <p className={styles.time}>
                    {frontNceDetailData?.shifts_data?.earliest_shift_start_time
                      ? `${formatDateWithTZ(
                          frontNceDetailData?.shifts_data
                            ?.earliest_shift_start_time,
                          'HH:mm a'
                        )} - ${formatDateWithTZ(
                          frontNceDetailData?.shifts_data
                            ?.latest_shift_return_time,
                          'HH:mm a'
                        )}`
                      : ''}{' '}
                    <span>
                      {popupToggleProd
                        ? frontNceDetailData?.projections?.total_product_yield
                        : frontNceDetailData?.projections
                            ?.total_procedure_type_qty}{' '}
                    </span>
                  </p>
                  <div className={styles.popupLocation}>
                    <h4>
                      <span>Location</span>
                      <span
                        style={
                          frontNceDetailData?.crm_locations?.name
                            ? {
                                color: '#005375',
                                fontSize: '16px',
                                fontWeight: '500',
                              }
                            : ''
                        }
                      >
                        {frontNceDetailData?.crm_locations?.name}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Shifts</span>
                      {frontNceDetailData?.shifts_data?.shifts}
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Status</span>
                      <button
                        style={{
                          borderRadius: '4px',
                          padding: '5px',
                          // height: '25px',
                          // lineHeight: '25px',
                          textAlign: 'center',
                          minWidth: '80px',
                          fontSize: '12px',
                          cursor: 'text',
                        }}
                        className={
                          frontNceDetailData?.drive?.operation_status_id
                            ?.chip_color === 'Green'
                            ? styles.green
                            : frontNceDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Yellow'
                            ? styles.yellow
                            : frontNceDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Red'
                            ? styles.red
                            : frontNceDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Blue'
                            ? styles.blue
                            : frontNceDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Grey'
                            ? styles.grey
                            : frontNceDetailData?.drive?.operation_status_id
                                ?.chip_color === 'Lavender'
                            ? styles.lavendar
                            : styles.green
                        }
                      >
                        {frontNceDetailData?.status?.operation_status_id?.name}
                      </button>
                    </h4>
                  </div>
                  <div className="d-flex justify-content-end">
                    <h4 className="font-size-14px text-primary">
                      <Link
                        to={`/operations-center/operations/non-collection-events/${frontNceDetailData?.id}/view/about`}
                      >
                        View Event
                      </Link>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          ''
        )}
        {popupSessionDetailsOpenDuplicate ? (
          <section
            className={`calendarPoup full-section ${
              showAllInfo ? 'show-info' : 'hide-info'
            } popup ${popupSessionDetailsOpenDuplicate ? 'active' : ''}`}
          >
            <div
              className="popup-inner"
              style={{ maxWidth: '400px', padding: '20px' }}
            >
              <div className="col-md-12">
                <div className={styles.popupHeader}>
                  <h3
                    className={styles.popupTitle}
                    style={{ color: '#005375' }}
                  >
                    <span className={styles.popupTitle}>
                      {frontSessionDetailData?.dc_name}
                    </span>
                    <br />
                    <span style={{ color: '#000', fontSize: '16px' }}>
                      {moment(frontSessionDetailData?.sessions_date).format(
                        'MM-DD-YYYY'
                      )}
                    </span>
                  </h3>
                  <button
                    className={styles.popupClose}
                    onClick={() => {
                      setPopupSessionDetailsOpenDuplicate(false);
                      setShowDriveFilter(false);
                    }}
                  >
                    <SvgComponent name={'CrossIcon'} />
                  </button>
                </div>
                <div className={styles.popupTaskDetail}>
                  {/* <h3>
                  Metro High School
                  <span>1 January, 2023</span>
                </h3> */}
                  <p className={styles.time}>
                    {frontSessionDetailData?.shifts_data
                      ?.earliest_shift_start_time
                      ? `${formatDateWithTZ(
                          frontSessionDetailData?.shifts_data
                            ?.earliest_shift_start_time,
                          'HH:mm a'
                        )} - ${formatDateWithTZ(
                          frontSessionDetailData?.shifts_data
                            ?.latest_shift_return_time,
                          'HH:mm a'
                        )}`
                      : ''}{' '}
                    <span>
                      {popupToggleProd
                        ? frontSessionDetailData?.projections
                            ?.total_product_yield
                        : frontSessionDetailData?.projections
                            ?.total_procedure_type_qty}{' '}
                    </span>
                  </p>
                  <div className={styles.popupLocation}>
                    <h4>
                      <span>Facility Name</span>
                      {frontSessionDetailData?.dc_name}
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Setup</span>
                      <span
                        style={{
                          fontSize: '16px',
                        }}
                      >
                        {frontSessionDetailData?.staff_setups_count &&
                        frontSessionDetailData?.staff_setups_count?.length
                          ? frontSessionDetailData?.staff_setups_count?.map(
                              (item, index) => {
                                const isLastItem =
                                  index ===
                                  frontSessionDetailData?.staff_setups_count
                                    ?.length -
                                    1;
                                return (
                                  <React.Fragment key={index}>
                                    {`${item}`}
                                    {isLastItem ? '' : ', '}
                                  </React.Fragment>
                                );
                              }
                            )
                          : ''}
                      </span>
                      <span
                        style={{
                          fontSize: '16px',
                        }}
                      >
                        {frontSessionDetailData?.vehicles &&
                        frontSessionDetailData?.vehicles?.length
                          ? frontSessionDetailData?.vehicles?.map(
                              (short, index) => {
                                const isLastItem =
                                  index ===
                                  frontSessionDetailData?.vehicles?.length - 1;
                                return (
                                  <React.Fragment key={index}>
                                    {`${
                                      short?.short_name ? short?.short_name : ''
                                    }`}
                                    {short?.short_name
                                      ? isLastItem
                                        ? ''
                                        : ', '
                                      : ''}
                                  </React.Fragment>
                                );
                              }
                            )
                          : ''}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Shifts</span>
                      {frontSessionDetailData?.shifts_data?.shifts}
                    </h4>
                  </div>
                  <div className="d-flex two-col">
                    <h4>
                      <span>Status</span>
                      <button
                        style={{
                          borderRadius: '4px',
                          padding: '5px',
                          // height: '25px',
                          // lineHeight: '25px',
                          textAlign: 'center',
                          minWidth: '80px',
                          fontSize: '12px',
                          cursor: 'text',
                        }}
                        className={
                          frontSessionDetailData?.oc_chip_color === 'Green'
                            ? styles.green
                            : frontSessionDetailData?.oc_chip_color === 'Yellow'
                            ? styles.yellow
                            : frontSessionDetailData?.oc_chip_color === 'Red'
                            ? styles.red
                            : frontSessionDetailData?.oc_chip_color === 'Blue'
                            ? styles.blue
                            : frontSessionDetailData?.oc_chip_color === 'Grey'
                            ? styles.grey
                            : frontSessionDetailData?.oc_chip_color ===
                              'Lavender'
                            ? styles.lavendar
                            : styles.green
                        }
                      >
                        {frontSessionDetailData?.oc_name}
                      </button>
                    </h4>
                  </div>
                  <div className="d-flex justify-content-end">
                    <h4 className="font-size-14px text-primary">
                      <Link
                        to={`/operations-center/operations/sessions/${frontSessionDetailData?.sessions_id}/view/about`}
                      >
                        View Session
                      </Link>
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          ''
        )}
        {popupDetailsOpen ? (
          <section
            className={`calendarPoup full-section ${
              showAllInfo ? 'show-info' : 'hide-info'
            } popup ${popupDetailsOpen ? 'active' : ''}`}
          >
            <div
              className="popup-inner"
              style={{
                maxWidth:
                  popupSideDetailsOpen ||
                  popupSideDetailsNceOpen ||
                  popupSideDetailsSessionOpen
                    ? '1050px'
                    : '800px',
              }}
            >
              <div className={`content ${styles.tooltipSize}`}>
                <div className={styles.popupHeader}>
                  <h3 className={styles.popupTitle}>
                    {moment(selectedDate?.date).format('MM-DD-YYYY')}
                  </h3>
                  <button
                    className={styles.popupClose}
                    onClick={() => {
                      setPopupDetailsOpen(false);
                      setShowDriveFilter(false);
                    }}
                  >
                    <SvgComponent name={'CrossIcon'} />
                  </button>
                </div>
                <div className="row">
                  <div
                    className={
                      popupSideDetailsOpen ||
                      popupSideDetailsNceOpen ||
                      popupSideDetailsSessionOpen
                        ? 'col-md-4'
                        : 'col-md-7'
                    }
                  >
                    <div className="d-flex justify-content-between mb-4">
                      <h4
                        className={`${styles.innerTitle} ${
                          overGoalFunc() === 'Over Goal'
                            ? styles.iconGreenColor
                            : overGoalFunc() === 'Under Goal'
                            ? styles.iconRedColor
                            : ''
                        }`}
                      >
                        {overGoalFunc()}
                      </h4>
                      <span
                        onClick={() => setPopupToggleProd(!popupToggleProd)}
                        className={styles.linkPopup}
                        style={{ cursor: 'pointer' }}
                      >
                        {popupToggleProd
                          ? 'View as Procedures'
                          : 'View as Products'}
                      </span>
                    </div>
                    <div className={styles.headerBTN}>
                      {showAvailableDateToggle && (
                        <>
                          <button className={styles.smallBtn}>
                            <ToolTip
                              className={styles.toolTip}
                              text={'Date Available (Outside)'}
                              icon={
                                <SvgComponent name={'CalendarDirectionIcon'} />
                              }
                            />
                          </button>
                          <button className={styles.smallBtn}>
                            <ToolTip
                              className={styles.toolTip}
                              text={' Date Available (Inside)'}
                              icon={
                                <SvgComponent name={'CalendarHumidityIcon'} />
                              }
                            />
                          </button>
                        </>
                      )}

                      {isLinkIcon && showCurrentLintToggle && (
                        <button className={styles.smallBtn}>
                          <ToolTip
                            className={styles.toolTip}
                            text={' Link Opportunity'}
                            icon={<SvgComponent name={'CalendarLinkIcon'} />}
                          />
                        </button>
                      )}
                      {matchingLockItem?.status ? (
                        <button className={styles.smallBtn}>
                          <ToolTip
                            className={styles.toolTip}
                            text={' Day Locked'}
                            icon={<SvgComponent name={'CalendarLockIcon'} />}
                          />
                        </button>
                      ) : (
                        ''
                      )}
                      <button className={styles.smallBtn}>
                        <ToolTip
                          className={styles.toolTip}
                          text1={`Shared Staff: ${selectedDate?.net_total_shared_staff}`}
                          text2={`Shared Vehicles: ${selectedDate?.net_total_shared_vehicles}`}
                          text3={`Shared Devices: ${selectedDate?.net_total_shared_devices}`}
                          icon={<SvgComponent name={'CalendarMoveDownIcon'} />}
                        />
                        &nbsp;10
                      </button>
                    </div>
                    <div className={styles.taskDetails}>
                      <h3>
                        <span>Goal</span>
                        {popupToggleProd
                          ? selectedDate?.goal_products
                            ? Number.isInteger(selectedDate?.goal_products)
                              ? selectedDate?.goal_products.toString()
                              : selectedDate?.goal_products?.toFixed(2)
                            : 0
                          : selectedDate?.goal_procedures
                          ? Number.isInteger(selectedDate?.goal_procedures)
                            ? selectedDate?.goal_procedures.toString()
                            : selectedDate?.goal_procedures?.toFixed(2)
                          : 0}
                      </h3>
                      <h3>
                        <span>Scheduled</span>
                        {scheduleValue}
                      </h3>
                      <h3>
                        <span>Actual</span>
                        {popupToggleProd
                          ? selectedDate?.actual_products
                            ? Number.isInteger(selectedDate?.actual_products)
                              ? selectedDate?.actual_products.toString()
                              : selectedDate?.actual_products?.toFixed(2)
                            : 0
                          : selectedDate?.actual_procedures
                          ? Number.isInteger(selectedDate?.actual_procedures)
                            ? selectedDate?.actual_procedures.toString()
                            : selectedDate?.actual_procedures?.toFixed(2)
                          : 0}
                      </h3>
                      <br />
                      <h3>
                        <span>PA</span>
                        {selectedDate?.date &&
                        new Date(selectedDate?.date)
                          .toISOString()
                          .slice(0, 10) >= new Date().toISOString().slice(0, 10)
                          ? '-'
                          : popupToggleProd
                          ? scheduleValue &&
                            selectedDate?.actual_products &&
                            scheduleValue !== 0 &&
                            selectedDate?.actual_products !== 0
                            ? `${parseInt(
                                (selectedDate?.actual_products /
                                  scheduleValue) *
                                  100,
                                10
                              )}%`
                            : '0%'
                          : scheduleValue &&
                            selectedDate?.actual_procedures &&
                            scheduleValue !== 0 &&
                            selectedDate?.actual_procedures !== 0
                          ? `${parseInt(
                              (selectedDate?.actual_procedures /
                                scheduleValue) *
                                100,
                              10
                            )}%`
                          : '0%'}
                      </h3>
                      <h3>
                        <span>PG</span>
                        {selectedDate?.date &&
                        new Date(selectedDate?.date)
                          .toISOString()
                          .slice(0, 10) >= new Date().toISOString().slice(0, 10)
                          ? '-'
                          : popupToggleProd
                          ? selectedDate?.goal_products &&
                            selectedDate?.actual_products &&
                            selectedDate?.goal_products !== 0 &&
                            selectedDate?.actual_products !== 0
                            ? `${parseInt(
                                (selectedDate?.actual_products /
                                  selectedDate?.goal_products) *
                                  100,
                                10
                              )}%`
                            : '0%'
                          : selectedDate?.goal_procedures &&
                            selectedDate?.actual_procedures &&
                            selectedDate?.goal_procedures !== 0 &&
                            selectedDate?.actual_procedures !== 0
                          ? `${parseInt(
                              (selectedDate?.actual_procedures /
                                selectedDate?.goal_procedures) *
                                100,
                              10
                            )}%`
                          : '0%'}
                      </h3>
                    </div>
                    <div className={styles.progress}>
                      <div>
                        <h4>Staff</h4>
                        <h3>{`${selectedDate?.staffBooked}/${selectedDate?.staffAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressRed}
                            style={{
                              maxWidth: `${
                                selectedDate?.staffBooked === 0 &&
                                selectedDate?.staffAvailable === 0
                                  ? '0'
                                  : (selectedDate?.staffBooked /
                                      selectedDate?.staffAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h4>Vehicles</h4>
                        <h3>{`${selectedDate?.vehicleBooked}/${selectedDate?.vehicleAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressGreen}
                            style={{
                              maxWidth: `${
                                selectedDate?.vehicleBooked === 0 &&
                                selectedDate?.vehicleAvailable === 0
                                  ? '0'
                                  : (selectedDate?.vehicleBooked /
                                      selectedDate?.vehicleAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h4>Devices</h4>
                        <h3>{`${selectedDate?.deviceBooked}/${selectedDate?.deviceAvailable}`}</h3>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressYellow}
                            style={{
                              maxWidth: `${
                                selectedDate?.deviceBooked === 0 &&
                                selectedDate?.deviceAvailable === 0
                                  ? '0'
                                  : (selectedDate?.deviceBooked /
                                      selectedDate?.deviceAvailable) *
                                    100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.popupTask}>
                      <p>
                        <strong>Tasks</strong>
                      </p>
                      <div className={styles.taskList}>
                        {showTaskToggle &&
                          selectedDate?.drives?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                        {showTaskToggle &&
                          selectedDate?.sessions?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                        {showTaskToggle &&
                          selectedDate?.nce?.map((item) => {
                            return item?.task_names && item?.task_names?.length
                              ? item?.task_names?.map((items, index) => {
                                  return <p key={index}>{items?.name}</p>;
                                })
                              : '';
                          })}
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      popupSideDetailsOpen ||
                      popupSideDetailsNceOpen ||
                      popupSideDetailsSessionOpen
                        ? 'col-md-4'
                        : 'col-md-5'
                    }
                  >
                    <div className={styles.headerPopupRight}>
                      <div className={styles.popupAccordion}>
                        <button
                          className={
                            activeTab === 'Drives' ? styles.active : ''
                          }
                          onClick={() => handleClick('Drives')}
                        >
                          Drives
                        </button>
                        <button
                          className={
                            activeTab === 'Sessions' ? styles.active : ''
                          }
                          onClick={() => handleClick('Sessions')}
                        >
                          Sessions
                        </button>
                        <button
                          className={
                            activeTab === 'Events' ? styles.active : ''
                          }
                          onClick={() => handleClick('Events')}
                        >
                          Events
                        </button>
                      </div>
                      <div className={styles.popupRight}>
                        <button
                          onClick={() => {
                            setShowDriveFilter((prev) => !prev);
                          }}
                        >
                          <SvgComponent name={'CalendarSortIcon'} />
                        </button>
                        <ul
                          style={{ marginTop: '25px' }}
                          className={`dropdown-menu claendar-dropdown ${
                            showDriveFilters ? 'show' : ''
                          }`}
                        >
                          <li
                            onClick={() => {
                              setSortingCriteria('Account Name');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Account Name
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Account Name Desc');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Account Name (Z-A)
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Operation Type');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Operation Type
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Depart Time');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Depart Time
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Return Time');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Return Time
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Projection');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Projection
                            </a>
                          </li>
                          <li
                            onClick={() => {
                              setSortingCriteria('Status');
                              setShowDriveFilter(false);
                            }}
                          >
                            <a href="#" className="dropdown-item">
                              Status
                            </a>
                          </li>
                        </ul>
                        <button onClick={sortingData}>
                          <SvgComponent name={'CalendarSortIconTwo'} />
                        </button>
                      </div>
                    </div>
                    {activeTab === 'Drives' && (
                      <div className="calendarTaskList">
                        {selectedDate?.drives && selectedDate?.drives?.length
                          ? selectedDate?.drives
                              ?.filter((item) => {
                                if (
                                  !showDriveInsideToggle &&
                                  item.crm_locations.site_type === 'Inside'
                                ) {
                                  return false;
                                }

                                if (
                                  !showDriveOutsideToggle &&
                                  item.crm_locations.site_type === 'Outside'
                                ) {
                                  return false;
                                }

                                return true;
                              })
                              ?.map((item, index) => {
                                return (
                                  <div
                                    key={index}
                                    style={{ cursor: 'pointer' }}
                                    className={styles.listBox}
                                    onClick={() => {
                                      // setDriveDetailsData(item);
                                      setShowAllInfo(true);
                                      setPopupDetailsOpen(true);
                                      setPopupOpen(false);
                                      setShowDriveFilter(false);
                                      // setPopupSideDetailsOpen(true);
                                      setPopupSideDetailsNceOpen(false);
                                      if (
                                        driveDetailsData?.drive?.id &&
                                        item?.drive?.id ===
                                          driveDetailsData?.drive?.id
                                      ) {
                                        setPopupSideDetailsOpen(false);
                                        setDriveDetailsData({});
                                      } else {
                                        setDriveDetailsData(item);
                                        setPopupSideDetailsOpen(true);
                                      }
                                    }}
                                  >
                                    <div
                                      className={
                                        item.crm_locations.site_type ===
                                        'Inside'
                                          ? styles.darkBlueBox
                                          : styles.whiteBox
                                      }
                                      style={{
                                        opacity:
                                          !popupSideDetailsOpen ||
                                          (driveDetailsData?.drive?.id &&
                                            driveDetailsData?.drive?.id &&
                                            item?.drive?.id ===
                                              driveDetailsData?.drive?.id)
                                            ? 1
                                            : 0.2,
                                      }}
                                    >
                                      <div className={styles.listCenterTitle}>
                                        <h4
                                          className={`${styles.listTitle} ${
                                            item?.drive?.operation_status_id
                                              ?.chip_color === 'Grey'
                                              ? styles.greyChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Green'
                                              ? styles.greenChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Yellow'
                                              ? styles.yellowChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Red'
                                              ? styles.redChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Blue'
                                              ? styles.blueChip
                                              : item?.drive?.operation_status_id
                                                  ?.chip_color === 'Lavender'
                                              ? styles.lavendarChip
                                              : styles.green
                                          }`}
                                        >
                                          {item?.linkedName
                                            ? item.linkedName
                                            : ''}{' '}
                                          {item?.linkedName ? (
                                            <span>{item?.account?.name}</span>
                                          ) : (
                                            `${item?.account?.name}`
                                          )}
                                        </h4>
                                        <h4 className={styles.lisTtime}>
                                          {item?.shifts_data
                                            ?.earliest_shift_start_time
                                            ? `${formatDateWithTZ(
                                                item?.shifts_data
                                                  ?.earliest_shift_start_time,
                                                'HH:mm'
                                              )} - ${formatDateWithTZ(
                                                item?.shifts_data
                                                  ?.latest_shift_return_time,
                                                'HH:mm'
                                              )}`
                                            : ''}
                                        </h4>
                                      </div>
                                      <div
                                        className={styles.listCenterDescription}
                                      >
                                        <p className={styles.description}>
                                          {item?.recruiter
                                            ? formatUser(item?.recruiter, 1)
                                            : 'N/A'}
                                        </p>
                                        <p className={styles.discCount}>
                                          {popupToggleProd
                                            ? item?.projections
                                                ?.total_product_yield
                                              ? item?.projections
                                                  ?.total_product_yield
                                              : ''
                                            : item?.projections
                                                ?.total_procedure_type_qty
                                            ? item?.projections
                                                ?.total_procedure_type_qty
                                            : ''}{' '}
                                          {item?.projections
                                            ?.total_product_yield &&
                                          item?.projections
                                            ?.total_procedure_type_qty ? (
                                            <span>
                                              {item?.staff_setups_count &&
                                              item?.staff_setups_count?.length
                                                ? item?.staff_setups_count?.map(
                                                    (items, index) => {
                                                      const isLastItem =
                                                        index ===
                                                        item?.staff_setups_count
                                                          ?.length -
                                                          1;
                                                      return (
                                                        <React.Fragment
                                                          key={index}
                                                        >
                                                          {`${items}`}
                                                          {isLastItem
                                                            ? ''
                                                            : ', '}
                                                        </React.Fragment>
                                                      );
                                                    }
                                                  )
                                                : ''}
                                            </span>
                                          ) : item?.staff_setups_count &&
                                            item?.staff_setups_count?.length ? (
                                            item?.staff_setups_count?.map(
                                              (items, index) => {
                                                const isLastItem =
                                                  index ===
                                                  item?.staff_setups_count
                                                    ?.length -
                                                    1;
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${items}`}
                                                    {isLastItem ? '' : ', '}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          ) : (
                                            ''
                                          )}
                                          {item?.vehicles &&
                                          item?.vehicles?.length
                                            ? item?.vehicles?.map(
                                                (short, index) => {
                                                  return (
                                                    <React.Fragment key={index}>
                                                      {`${
                                                        short?.short_name
                                                          ? ` , ${short?.short_name}`
                                                          : ''
                                                      }`}
                                                    </React.Fragment>
                                                  );
                                                }
                                              )
                                            : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          : ''}
                      </div>
                    )}
                    {activeTab === 'Sessions' && (
                      <div className="calendarTaskList">
                        {showSessionsToggle &&
                        selectedDate?.sessions &&
                        selectedDate?.sessions?.length
                          ? selectedDate?.sessions?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={styles.listBox}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setShowAllInfo(true);
                                    // setPopupSideDetailsSessionOpen(true);
                                    setPopupDetailsOpen(true);
                                    setPopupOpen(false);
                                    setShowDriveFilter(false);
                                    // setSessionDetailsData(item);
                                    setPopupSideDetailsOpen(false);
                                    if (
                                      sessionDetailsData?.sessions_id &&
                                      item?.sessions_id ===
                                        sessionDetailsData?.sessions_id
                                    ) {
                                      setSessionDetailsData({});
                                      setPopupSideDetailsSessionOpen(false);
                                    } else {
                                      setSessionDetailsData(item);
                                      setPopupSideDetailsSessionOpen(true);
                                    }
                                  }}
                                >
                                  <div
                                    className={styles.lightBlueBox}
                                    style={{
                                      opacity:
                                        !popupSideDetailsSessionOpen ||
                                        (sessionDetailsData?.sessions_id &&
                                          sessionDetailsData?.sessions_id &&
                                          item?.sessions_id ===
                                            sessionDetailsData?.sessions_id)
                                          ? 1
                                          : 0.2,
                                    }}
                                  >
                                    <div className={styles.listCenterTitle}>
                                      <h4
                                        className={`${styles.listTitle} ${
                                          item?.oc_chip_color === 'Grey'
                                            ? styles.greyChip
                                            : item?.oc_chip_color === 'Green'
                                            ? styles.greenChip
                                            : item?.oc_chip_color === 'Yellow'
                                            ? styles.yellowChip
                                            : item?.oc_chip_color === 'Red'
                                            ? styles.redChip
                                            : item?.oc_chip_color === 'Blue'
                                            ? styles.blueChip
                                            : item?.oc_chip_color === 'Lavender'
                                            ? styles.lavendarChip
                                            : styles.green
                                        }`}
                                      >
                                        {item?.dc_name}
                                      </h4>
                                      <h4 className={styles.lisTtime}>
                                        {item?.shifts_data
                                          ?.earliest_shift_start_time
                                          ? `${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.earliest_shift_start_time,
                                              'HH:mm'
                                            )} - ${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.latest_shift_return_time,
                                              'HH:mm'
                                            )}`
                                          : 'N/A'}
                                      </h4>
                                    </div>
                                    <div
                                      className={styles.listCenterDescription}
                                    >
                                      <p className={styles.description}></p>
                                      <p className={styles.discCount}>
                                        {popupToggleProd
                                          ? item?.projections
                                              ?.total_product_yield
                                            ? item?.projections
                                                ?.total_product_yield
                                            : ''
                                          : item?.projections
                                              ?.total_procedure_type_qty
                                          ? item?.projections
                                              ?.total_procedure_type_qty
                                          : ''}{' '}
                                        {item?.projections
                                          ?.total_product_yield &&
                                        item?.projections
                                          ?.total_procedure_type_qty ? (
                                          <span>
                                            {item?.staff_setups_count &&
                                            item?.staff_setups_count?.length
                                              ? item?.staff_setups_count?.map(
                                                  (items, index) => {
                                                    const isLastItem =
                                                      index ===
                                                      item?.staff_setups_count
                                                        ?.length -
                                                        1;
                                                    return (
                                                      <React.Fragment
                                                        key={index}
                                                      >
                                                        {`${items}`}
                                                        {isLastItem ? '' : ', '}
                                                      </React.Fragment>
                                                    );
                                                  }
                                                )
                                              : ''}
                                          </span>
                                        ) : item?.staff_setups_count &&
                                          item?.staff_setups_count?.length ? (
                                          item?.staff_setups_count?.map(
                                            (items, index) => {
                                              const isLastItem =
                                                index ===
                                                item?.staff_setups_count
                                                  ?.length -
                                                  1;
                                              return (
                                                <React.Fragment key={index}>
                                                  {`${items}`}
                                                  {isLastItem ? '' : ', '}
                                                </React.Fragment>
                                              );
                                            }
                                          )
                                        ) : (
                                          ''
                                        )}
                                        {/* {item?.vehicles &&
                                        item?.vehicles?.length
                                          ? item?.vehicles?.map(
                                              (short, index) => {
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${
                                                      short?.short_name
                                                        ? ` , ${short?.short_name}`
                                                        : ''
                                                    }`}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          : ''} */}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : ''}
                      </div>
                    )}
                    {activeTab === 'Events' && (
                      <div className="calendarTaskList">
                        {showNceToggle &&
                        selectedDate?.nce &&
                        selectedDate?.nce?.length
                          ? selectedDate?.nce?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className={styles.listBox}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    // setNceDetailsData(item);
                                    setShowAllInfo(true);
                                    setPopupDetailsOpen(true);
                                    setPopupOpen(false);
                                    setShowDriveFilter(false);
                                    // setPopupSideDetailsNceOpen(true);
                                    setPopupSideDetailsOpen(false);
                                    if (
                                      nceDetailsData?.id &&
                                      item?.id === nceDetailsData?.id
                                    ) {
                                      setNceDetailsData({});
                                      setPopupSideDetailsNceOpen(false);
                                    } else {
                                      setNceDetailsData(item);
                                      setPopupSideDetailsNceOpen(true);
                                    }
                                  }}
                                >
                                  <div
                                    className={styles.blueBox}
                                    style={{
                                      opacity:
                                        !popupSideDetailsNceOpen ||
                                        (nceDetailsData?.id &&
                                          nceDetailsData?.id &&
                                          item?.id === nceDetailsData?.id)
                                          ? 1
                                          : 0.2,
                                    }}
                                  >
                                    <div className={styles.listCenterTitle}>
                                      <h4
                                        className={`${styles.listTitle} ${
                                          item?.status?.operation_status_id
                                            ?.chip_color === 'Grey'
                                            ? styles.greyChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Green'
                                            ? styles.greenChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Yellow'
                                            ? styles.yellowChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Red'
                                            ? styles.redChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Blue'
                                            ? styles.blueChip
                                            : item?.status?.operation_status_id
                                                ?.chip_color === 'Lavender'
                                            ? styles.lavendarChip
                                            : styles.green
                                        }`}
                                      >
                                        {
                                          item?.ncp?.non_collection_profile
                                            ?.name
                                        }
                                      </h4>
                                      <h4 className={styles.lisTtime}>
                                        {item?.shifts_data
                                          ?.latest_shift_return_time
                                          ? `${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.earliest_shift_start_time,
                                              'HH:mm'
                                            )} - ${formatDateWithTZ(
                                              item?.shifts_data
                                                ?.latest_shift_return_time,
                                              'HH:mm'
                                            )}`
                                          : ''}
                                      </h4>
                                    </div>
                                    <div
                                      className={styles.listCenterDescription}
                                    >
                                      <p className={styles.description}></p>
                                      <p className={styles.discCount}>
                                        {popupToggleProd
                                          ? item?.projections
                                              ?.total_product_yield
                                          : item?.projections
                                              ?.total_procedure_type_qty}{' '}
                                        {/* {item?.projections
                                          ?.total_product_yield &&
                                        item?.projections
                                          ?.total_procedure_type_qty ? (
                                          <span>
                                            {item?.staff_setups_count &&
                                            item?.staff_setups_count?.length
                                              ? item?.staff_setups_count?.map(
                                                  (items, index) => {
                                                    const isLastItem =
                                                      index ===
                                                      item?.staff_setups_count
                                                        ?.length -
                                                        1;
                                                    return (
                                                      <React.Fragment
                                                        key={index}
                                                      >
                                                        {`${items}`}
                                                        {isLastItem ? '' : ', '}
                                                      </React.Fragment>
                                                    );
                                                  }
                                                )
                                              : ''}
                                          </span>
                                        ) : item?.staff_setups_count &&
                                          item?.staff_setups_count?.length ? (
                                          item?.staff_setups_count?.map(
                                            (items, index) => {
                                              const isLastItem =
                                                index ===
                                                item?.staff_setups_count
                                                  ?.length -
                                                  1;
                                              return (
                                                <React.Fragment key={index}>
                                                  {`${items}`}
                                                  {isLastItem ? '' : ', '}
                                                </React.Fragment>
                                              );
                                            }
                                          )
                                        ) : (
                                          ''
                                        )} */}
                                        {item?.vehicles &&
                                        item?.vehicles?.length
                                          ? item?.vehicles?.map(
                                              (short, index) => {
                                                return (
                                                  <React.Fragment key={index}>
                                                    {`${
                                                      short?.short_name
                                                        ? ` , ${short?.short_name}`
                                                        : ''
                                                    }`}
                                                  </React.Fragment>
                                                );
                                              }
                                            )
                                          : ''}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : ''}
                      </div>
                    )}
                  </div>
                  {popupSideDetailsOpen && (
                    <div className="col-md-4">
                      <div className={styles.popupTaskDetail}>
                        <h3>
                          <span className={styles.popupTitle}>
                            {driveDetailsData?.account?.name}
                          </span>
                          <span>
                            {moment(driveDetailsData?.drive?.date).format(
                              'MM-DD-YYYY'
                            )}
                          </span>
                        </h3>
                        <p className={styles.time}>
                          {driveDetailsData?.shifts_data
                            ?.earliest_shift_start_time
                            ? `${formatDateWithTZ(
                                driveDetailsData?.shifts_data
                                  ?.earliest_shift_start_time,
                                'HH:mm a'
                              )} - ${formatDateWithTZ(
                                driveDetailsData?.shifts_data
                                  ?.latest_shift_return_time,
                                'HH:mm a'
                              )}`
                            : ''}{' '}
                          <span>
                            {popupToggleProd
                              ? driveDetailsData?.projections
                                  ?.total_product_yield
                              : driveDetailsData?.projections
                                  ?.total_procedure_type_qty}{' '}
                          </span>
                        </p>
                        <div className={styles.popupLocation}>
                          <h4>
                            <span>Location</span>
                            <span
                              style={
                                driveDetailsData?.crm_locations?.name
                                  ? {
                                      color: '#005375',
                                      fontSize: '16px',
                                      fontWeight: '500',
                                    }
                                  : ''
                              }
                            >
                              {driveDetailsData?.crm_locations?.name
                                ? driveDetailsData?.crm_locations?.name
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Primary Chairperson</span>
                            <span
                              className={styles.operationDetails}
                              style={{
                                color: '#005375',
                                fontSize: '16px',
                                fontWeight: '500',
                              }}
                            >
                              {driveDetailsData?.drive?.drive_contacts &&
                              driveDetailsData?.drive?.drive_contacts?.length
                                ? driveDetailsData?.drive?.drive_contacts[0]
                                    ?.role?.name
                                : 'N/A'}
                            </span>
                          </h4>
                          <h4>
                            <span>Chairperson Phone</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.drive?.drive_contacts &&
                              driveDetailsData?.drive?.drive_contacts.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts?.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data?.length
                                ? driveDetailsData?.drive?.drive_contacts[0]
                                    ?.account_contacts[0]?.contactable_data[0]
                                    ?.data
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Chairperson SMS</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.drive?.drive_contacts &&
                              driveDetailsData?.drive?.drive_contacts.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts?.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data?.length
                                ? driveDetailsData?.drive?.drive_contacts[0]
                                    ?.account_contacts[0]?.contactable_data[0]
                                    ?.data
                                : 'N/A'}
                            </span>
                          </h4>
                          <h4>
                            <span>Chairperson Email</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.drive?.drive_contacts &&
                              driveDetailsData?.drive?.drive_contacts.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts?.length &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data &&
                              driveDetailsData?.drive?.drive_contacts[0]
                                ?.account_contacts[0]?.contactable_data
                                ?.length > 1
                                ? driveDetailsData?.drive?.drive_contacts[0]
                                    ?.account_contacts[0]?.contactable_data[1]
                                    ?.data
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Recruite</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.recruiter
                                ? formatUser(driveDetailsData?.recruiter, 1)
                                : 'N/A'}
                            </span>
                          </h4>
                          <h4>
                            <span>Setup</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.staff_setups_count &&
                              driveDetailsData?.staff_setups_count?.length
                                ? driveDetailsData?.staff_setups_count?.map(
                                    (item, index) => {
                                      const isLastItem =
                                        index ===
                                        driveDetailsData?.staff_setups_count
                                          ?.length -
                                          1;
                                      return (
                                        <React.Fragment key={index}>
                                          {`${item}`}
                                          {isLastItem ? '' : ', '}
                                        </React.Fragment>
                                      );
                                    }
                                  )
                                : 'N/A'}
                            </span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.vehicles &&
                              driveDetailsData?.vehicles?.length
                                ? driveDetailsData?.vehicles?.map(
                                    (short, index) => {
                                      const isLastItem =
                                        index ===
                                        driveDetailsData?.vehicles?.length - 1;
                                      return (
                                        <React.Fragment key={index}>
                                          {`${
                                            short?.short_name
                                              ? short?.short_name
                                              : ''
                                          }`}
                                          {short?.short_name
                                            ? isLastItem
                                              ? ''
                                              : ', '
                                            : ''}
                                        </React.Fragment>
                                      );
                                    }
                                  )
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Shifts</span>
                            <span className={styles.operationDetails}>
                              {driveDetailsData?.shifts_data?.shifts
                                ? driveDetailsData?.shifts_data?.shifts
                                : 'N/A'}
                            </span>
                          </h4>
                          {driveDetailsData?.linked_drive?.account_name ? (
                            <h4>
                              <span>Linked With</span>
                              {driveDetailsData?.linked_drive?.account_name}
                            </h4>
                          ) : (
                            ''
                          )}
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Status</span>
                            <button
                              style={{
                                borderRadius: '4px',
                                padding: '5px',
                                // height: '25px',
                                // lineHeight: '25px',
                                textAlign: 'center',
                                minWidth: '80px',
                                fontSize: '12px',
                                cursor: 'text',
                              }}
                              className={
                                driveDetailsData?.drive?.operation_status_id
                                  ?.chip_color === 'Green'
                                  ? styles.green
                                  : driveDetailsData?.drive?.operation_status_id
                                      ?.chip_color === 'Yellow'
                                  ? styles.yellow
                                  : driveDetailsData?.drive?.operation_status_id
                                      ?.chip_color === 'Red'
                                  ? styles.red
                                  : driveDetailsData?.drive?.operation_status_id
                                      ?.chip_color === 'Blue'
                                  ? styles.blue
                                  : driveDetailsData?.drive?.operation_status_id
                                      ?.chip_color === 'Grey'
                                  ? styles.grey
                                  : driveDetailsData?.drive?.operation_status_id
                                      ?.chip_color === 'Lavender'
                                  ? styles.lavendar
                                  : styles.green
                              }
                            >
                              {
                                driveDetailsData?.drive?.operation_status_id
                                  ?.name
                              }
                            </button>
                          </h4>
                        </div>
                        <div className="d-flex justify-content-end">
                          <h4 className="font-size-14px text-primary">
                            {activeTab === 'Drives' && (
                              <Link
                                to={`/operations-center/operations/drives/${driveDetailsData?.drive?.id}/view/about`}
                              >
                                View Drive
                              </Link>
                            )}
                            {activeTab === 'Events' && <Link>View Event</Link>}
                            {activeTab === 'Sessions' && (
                              <Link>View Session</Link>
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                  {popupSideDetailsNceOpen && (
                    <div className="col-md-4">
                      <div className={styles.popupTaskDetail}>
                        <h3>
                          <span className={styles.popupTitle}>
                            {nceDetailsData?.ncp?.non_collection_profile?.name}
                          </span>
                          <span>
                            {moment(nceDetailsData?.date).format('MM-DD-YYYY')}
                          </span>
                        </h3>
                        <p className={styles.time}>
                          {nceDetailsData?.shifts_data
                            ?.earliest_shift_start_time
                            ? `${formatDateWithTZ(
                                nceDetailsData?.shifts_data
                                  ?.earliest_shift_start_time,
                                'HH:mm a'
                              )} - ${formatDateWithTZ(
                                nceDetailsData?.shifts_data
                                  ?.latest_shift_return_time,
                                'HH:mm a'
                              )}`
                            : ''}{' '}
                          <span>
                            {popupToggleProd
                              ? nceDetailsData?.projections?.total_product_yield
                              : nceDetailsData?.projections
                                  ?.total_procedure_type_qty}{' '}
                          </span>
                        </p>
                        <div className={styles.popupLocation}>
                          <h4>
                            <span>Location</span>
                            <span
                              style={
                                nceDetailsData?.crm_locations?.name
                                  ? {
                                      color: '#005375',
                                      fontSize: '16px',
                                      fontWeight: '500',
                                    }
                                  : ''
                              }
                            >
                              {nceDetailsData?.crm_locations?.name
                                ? nceDetailsData?.crm_locations?.name
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Shifts</span>
                            {nceDetailsData?.shifts_data?.shifts
                              ? nceDetailsData?.shifts_data?.shifts
                              : 'N/A'}
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Status</span>
                            <button
                              style={{
                                borderRadius: '4px',
                                padding: '5px',
                                // height: '25px',
                                // lineHeight: '25px',
                                textAlign: 'center',
                                minWidth: '80px',
                                fontSize: '12px',
                                cursor: 'text',
                              }}
                              className={
                                nceDetailsData?.status?.operation_status_id
                                  ?.chip_color === 'Green'
                                  ? styles.green
                                  : nceDetailsData?.status?.operation_status_id
                                      ?.chip_color === 'Yellow'
                                  ? styles.yellow
                                  : nceDetailsData?.status?.operation_status_id
                                      ?.chip_color === 'Red'
                                  ? styles.red
                                  : nceDetailsData?.status?.operation_status_id
                                      ?.chip_color === 'Blue'
                                  ? styles.blue
                                  : nceDetailsData?.status?.operation_status_id
                                      ?.chip_color === 'Grey'
                                  ? styles.grey
                                  : nceDetailsData?.status?.operation_status_id
                                      ?.chip_color === 'Lavender'
                                  ? styles.lavendar
                                  : styles.green
                              }
                            >
                              {
                                nceDetailsData?.status?.operation_status_id
                                  ?.name
                              }
                            </button>
                          </h4>
                        </div>
                        <div className="d-flex justify-content-end">
                          <h4 className="font-size-14px text-primary">
                            {activeTab === 'Drives' && <Link>View Drive</Link>}
                            {activeTab === 'Events' && (
                              <Link
                                to={`/operations-center/operations/non-collection-events/${nceDetailsData?.id}/view/about`}
                              >
                                View Event
                              </Link>
                            )}
                            {activeTab === 'Sessions' && (
                              <Link>View Session</Link>
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                  {popupSideDetailsSessionOpen && (
                    <div className="col-md-4">
                      <div className={styles.popupTaskDetail}>
                        <h3>
                          <span className={styles.popupTitle}>
                            {sessionDetailsData?.dc_name}
                          </span>
                          <span>
                            {moment(sessionDetailsData?.sessions_date).format(
                              'MM-DD-YYYY'
                            )}
                          </span>
                        </h3>
                        <p className={styles.time}>
                          {sessionDetailsData?.shifts_data
                            ?.earliest_shift_start_time
                            ? `${formatDateWithTZ(
                                sessionDetailsData?.shifts_data
                                  ?.earliest_shift_start_time,
                                'HH:mm a'
                              )} - ${formatDateWithTZ(
                                sessionDetailsData?.shifts_data
                                  ?.latest_shift_return_time,
                                'HH:mm a'
                              )}`
                            : ''}{' '}
                          <span>
                            {popupToggleProd
                              ? sessionDetailsData?.projections
                                  ?.total_product_yield
                              : sessionDetailsData?.projections
                                  ?.total_procedure_type_qty}{' '}
                          </span>
                        </p>
                        <div className={styles.popupLocation}>
                          <h4>
                            <span>Facility Name</span>
                            {sessionDetailsData?.dc_name
                              ? sessionDetailsData?.dc_name
                              : 'N/A'}
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Setup</span>
                            <span
                              style={{
                                fontSize: '16px',
                              }}
                            >
                              {sessionDetailsData?.staff_setups_count &&
                              sessionDetailsData?.staff_setups_count?.length
                                ? sessionDetailsData?.staff_setups_count?.map(
                                    (item, index) => {
                                      const isLastItem =
                                        index ===
                                        sessionDetailsData?.staff_setups_count
                                          ?.length -
                                          1;
                                      return (
                                        <React.Fragment key={index}>
                                          {`${item}`}
                                          {isLastItem ? '' : ', '}
                                        </React.Fragment>
                                      );
                                    }
                                  )
                                : 'N/A'}
                            </span>
                            <span
                              style={{
                                fontSize: '16px',
                              }}
                            >
                              {sessionDetailsData?.vehicles &&
                              sessionDetailsData?.vehicles?.length
                                ? sessionDetailsData?.vehicles?.map(
                                    (short, index) => {
                                      const isLastItem =
                                        index ===
                                        sessionDetailsData?.vehicles?.length -
                                          1;
                                      return (
                                        <React.Fragment key={index}>
                                          {`${
                                            short?.short_name
                                              ? short?.short_name
                                              : ''
                                          }`}
                                          {short?.short_name
                                            ? isLastItem
                                              ? ''
                                              : ', '
                                            : ''}
                                        </React.Fragment>
                                      );
                                    }
                                  )
                                : 'N/A'}
                            </span>
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Shifts</span>
                            {sessionDetailsData?.shifts_data?.shifts}
                          </h4>
                        </div>
                        <div className="d-flex two-col">
                          <h4>
                            <span>Status</span>
                            <button
                              style={{
                                borderRadius: '4px',
                                padding: '5px',
                                // height: '25px',
                                // lineHeight: '25px',
                                textAlign: 'center',
                                minWidth: '80px',
                                fontSize: '12px',
                                cursor: 'text',
                              }}
                              className={
                                sessionDetailsData?.oc_chip_color === 'Green'
                                  ? styles.green
                                  : sessionDetailsData?.oc_chip_color ===
                                    'Yellow'
                                  ? styles.yellow
                                  : sessionDetailsData?.oc_chip_color === 'Red'
                                  ? styles.red
                                  : sessionDetailsData?.oc_chip_color === 'Blue'
                                  ? styles.blue
                                  : sessionDetailsData?.oc_chip_color === 'Grey'
                                  ? styles.grey
                                  : sessionDetailsData?.oc_chip_color ===
                                    'Lavender'
                                  ? styles.lavendar
                                  : styles.green
                              }
                            >
                              {sessionDetailsData?.oc_name}
                            </button>
                          </h4>
                        </div>
                        <div className="d-flex justify-content-end">
                          <h4 className="font-size-14px text-primary">
                            {activeTab === 'Drives' && <Link>View Drive</Link>}
                            {activeTab === 'Events' && <Link>View Event</Link>}
                            {activeTab === 'Sessions' && (
                              <Link
                                to={`/operations-center/operations/sessions/${sessionDetailsData?.sessions_id}/view/about`}
                              >
                                View Session
                              </Link>
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
