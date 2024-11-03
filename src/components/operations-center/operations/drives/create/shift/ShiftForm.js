import React, { useEffect, useMemo, useState } from 'react';
import FormInput from '../../../../../common/form/FormInput';
import FormCheckbox from '../../../../../common/form/FormCheckBox';
import { Controller } from 'react-hook-form';
import styles from '../../index.module.scss';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import moment from 'moment';
import ToolTip from '../../../../../common/tooltip';
import ShareStaffModal from '../share-staff-modal';
import { API } from '../../../../../../api/api-routes';
import { toast } from 'react-toastify';
import LinkVehiclesmodel from '../linkVehiclesmodel';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MyTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { CalculateSlots } from './calculate_slots';
import { addRemoveDevices } from '../helpers/index';
import ProjectionForm from './projectionForm';
import {
  // covertDatetoTZDate,
  formatDateWithTZ,
} from '../../../../../../helpers/convertDateTimeToTimezone';
import WarningIconImage from '../../../../../../assets/images/warningIcon.png';
import CancelModalPopUp from '../../../../../common/cancelModal';
import PolymorphicType from '../../../../../../enums/PolymorphicTypeEnum';

const ShiftForm = ({
  id,
  shift,
  index,
  control,
  setShifts,
  shifts,
  setLinkedDriveId,
  coordinatesA,
  setCoordinatesA,
  coordinatesB,
  setCoordinatesB,
  linkedDriveID,
  getValues,
  formErrors,
  errors,
  shiftDevicesOptions,
  shiftResourcesOptions,
  staffSetupOptions,
  bookingRules,
  collectionOperationId,
  driveDate,
  travelMinutes,
  procedureTypesList,
  procedureProducts,
  location_type,
  watch,
  industryCategories,
  isOverrideUser,
  allowAppointmentAtShiftEndTime,
  shiftSlots,
  setShiftSlots,
  setStaffSetupShiftOptions,
  staffSetupShiftOptions,
  selectedLinkDrive,
  setSelectedLinkDrive,
  accountId,
  removeShift,
  setRemoveShift,
  resourceShareData,
  setResourceShareData,
  dailyCapacities,
  staffUtilization,
  editable,
  linkedSettings,
  setLinkedSettings,
  MismatchModal,
  setMisMatchModal,
  setEditLinkDrive,
  editLinkDirve,
  setEditCurrentShift,
  editCurrentShift,
  updateLinkDriveBtn,
  setUpdateLinkDriveBtn,
  discardDriveBtn,
  setdiscardDriveBtn,
  configureShiftBtn,
  setConfigureShiftBtn,
  // handleDiscardDrive,
  handleupdateLinkDrive,
  onSubmit,
  handleSubmit,
  FormData,
  formDatas,
  EditHandle,
  shiftIndexesLength,
}) => {
  const account = watch('account');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [startDate, setStartDate] = useState();
  const [startShiftTimeToolTip, setStartShiftTimeToolTip] = useState('');
  const [endShiftTimeToolTip, setEndShiftTimeToolTip] = useState('');
  const [dailyHours, setDailyHours] = useState();
  const [reductionStep, setReductionStep] = useState('0.5');
  const [viewAs, setViewAs] = useState('product');
  const [totalSlots, setTotalSlots] = useState(0);
  const [shareStaffModal, setShareStaffModal] = useState(false);
  const [shareStaffData, setShareStaffData] = useState([]);
  const [staffShareRequired, setStaffShareRequired] = useState(0);
  const [linkableVehicles, setLinkAbleVehicles] = useState(null);
  const [vehiclesModel, setVehiclesModel] = useState(false);
  // eslint-disable-next-line
  const [endTimeDisabled, setEndTimeDisabled] = useState(true);
  // eslint-disable-next-line
  const [staffBreakendTimeDisabled, setStaffBreakendTimeDisabled] =
    useState(true);
  const [staffShareValue, setStaffShareValue] = useState({});
  const [availableStaff, setAvailableStaff] = useState(0);
  const [sumProducts, setSumProducts] = useState(0);
  const [sumProcedures, setSumProcedures] = useState(0);
  const [linkedDrive, setlinkedDrive] = useState(null);
  const [unLinkWarning, setUnLinkWarning] = useState(false);
  const [event, setEvent] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [shareStaffSearch, setShareStaffSearch] = useState('');
  const [staffSearched, setStaffSearched] = useState(false);
  useEffect(() => {
    setViewAs(bookingRules.oef_block_on_procedures ? 'Procedures' : 'Product');
  }, [bookingRules]);
  useEffect(() => {
    const dayName = moment(driveDate).format('dddd');
    const abbreviations = {
      Sunday: 'sun',
      Monday: 'mon',
      Tuesday: 'tue',
      Wednesday: 'wed',
      Thursday: 'thur',
      Friday: 'fri',
      Saturday: 'sat',
    };
    const driveDay = abbreviations[dayName];
    // const maxDrives = dailyCapacities[`${driveDay}_max_drives`];
    const maxStaff = dailyCapacities?.[`${driveDay}_max_staff`] || 0;
    const availableStaff =
      maxStaff - staffUtilization > 0 ? maxStaff - staffUtilization : 0;
    // console.log({ maxStaff, staffUtilization, availableStaff });
    setAvailableStaff(availableStaff);
  }, [driveDate, dailyCapacities]);

  useMemo(() => {
    // Loop Over Each Projection
    CalculateSlots(
      shifts,
      shift,
      index,
      setReductionStep,
      allowAppointmentAtShiftEndTime,
      setShiftSlots
    );
  }, [
    index,
    shift.startTime,
    shift.endTime,
    shift.reduceSlot,
    shift.breakStartTime,
    shift.breakEndTime,
    shift.reduction,
    shift.projections,
    shift.staffBreak,
  ]);

  useEffect(() => {
    let sumOfSlots = 0;
    Object.values(shiftSlots)?.[index]?.map((slotItem) => {
      sumOfSlots += slotItem?.items?.length;
    });
    setTotalSlots(sumOfSlots);
  }, [shiftSlots]);

  useEffect(() => {
    if (collectionOperationId && driveDate) {
      if (shareStaffSearch?.length > 1) {
        setStaffSearched(true);
        fetchStagingSitesAndDonorCenters(collectionOperationId, driveDate);
      }
      if (shareStaffSearch?.length <= 1 && staffSearched) {
        fetchStagingSitesAndDonorCenters(collectionOperationId, driveDate);
        setStaffSearched(false);
      }
    }
  }, [shareStaffSearch]);

  const fetchStagingSitesAndDonorCenters = async (
    driveDate,
    collectionOperationId
  ) => {
    const {
      data: { data },
    } =
      await API.systemConfiguration.organizationalAdministrations.facilities.getStagingSitesAndDonorCenters(
        driveDate,
        parseInt(collectionOperationId),
        PolymorphicType.OC_OPERATIONS_DRIVES,
        shareStaffSearch
      );
    setShareStaffData(data);
  };
  // console.log({ staffBreakendTimeDisabled, endTimeDisabled });

  // Fetch the Daily Hours based on drive date and collection operation of Account selected
  const fetchDailyHours = async () => {
    if (driveDate && collectionOperationId) {
      try {
        fetchStagingSitesAndDonorCenters(driveDate, collectionOperationId);
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/booking-drive/daily-hour/drive?collectionOperation=${collectionOperationId}&driveDate=${moment(
            driveDate
          )}`
        );
        const data = await response.json();
        setDailyHours(data?.data?.[0]);
      } catch (error) {
        console.error(`Failed to fetch Locations data ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };
  useEffect(() => {
    fetchDailyHours();
  }, [collectionOperationId, driveDate]);

  // Tooltip for Start and End time of Shift based on Daily Hours, Drive Date and Travel time of Location
  useEffect(() => {
    const driveDay = moment(driveDate).format('ddd').toLocaleLowerCase();

    const earliestDepartureTime =
      dailyHours?.[`${driveDay}_earliest_depart_time`] || null;

    const latestReturnTime =
      dailyHours?.[`${driveDay}_latest_return_time`] || null;

    if (earliestDepartureTime) {
      const earliestDepartureTimeM = moment(earliestDepartureTime);
      earliestDepartureTimeM.add(travelMinutes, 'minute');
      setStartShiftTimeToolTip(
        'The preferred shift start time based on daily hours is ' +
          earliestDepartureTimeM.format('h:mm A')
      );
    }
    if (latestReturnTime) {
      const latestReturnTimeM = moment(latestReturnTime);
      latestReturnTimeM.subtract(travelMinutes, 'minute');
      setEndShiftTimeToolTip(
        'The preferred shift end time based on daily hours is ' +
          latestReturnTimeM.format('h:mm A')
      );
    }
  }, [dailyHours, travelMinutes, driveDate]);

  const fetchStaffSetupConfigurations = async (ids) => {
    try {
      const driveDay = moment(driveDate).format('ddd').toLocaleLowerCase();
      const earliestDepartureTime =
        dailyHours?.[`${driveDay}_earliest_depart_time`] || null;
      const latestReturnTime =
        dailyHours?.[`${driveDay}_latest_return_time`] || null;
      const earliestDepartureTimeM = moment(earliestDepartureTime);
      const latestReturnTimeM = moment(latestReturnTime);
      let leadTime = 0;
      let setupTime = 0;
      let breakdownTime = 0;
      let wrapupTime = 0;
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-admin/staff-setup/drives/byIds?ids=${ids.join(
          ','
        )}`
      );
      const data = await response.json();
      data?.data?.map((item) => {
        const staffConfiguration = item.staff_configuration[0];
        if (leadTime < staffConfiguration.lead_time)
          leadTime = staffConfiguration.lead_time;
        if (setupTime < staffConfiguration.setup_time)
          setupTime = staffConfiguration.setup_time;
        if (breakdownTime < staffConfiguration.breakdown_time)
          breakdownTime = staffConfiguration.breakdown_time;
        if (wrapupTime < staffConfiguration.wrapup_time)
          wrapupTime = staffConfiguration.wrapup_time;
      });
      if (earliestDepartureTime) {
        earliestDepartureTimeM.add(travelMinutes, 'minute');
        earliestDepartureTimeM.add(leadTime, 'minute');
        earliestDepartureTimeM.add(setupTime, 'minute');
        setStartShiftTimeToolTip(
          'The preferred shift start time based on daily hours and staff setup is ' +
            earliestDepartureTimeM.format('h:mm A')
        );
      }
      if (latestReturnTime) {
        latestReturnTimeM.subtract(travelMinutes, 'minute');
        latestReturnTimeM.subtract(breakdownTime, 'minute');
        latestReturnTimeM.subtract(wrapupTime, 'minute');
        setEndShiftTimeToolTip(
          'The preferred shift end time based on daily hours and staff setup is ' +
            latestReturnTimeM.format('h:mm A')
        );
      }
    } catch (error) {
      console.error(`Error fetching data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const staffSetupSelected = shift?.projections?.map(
      (item) => item.staffSetup
    )[0];

    const staffSetupSelectedIds = staffSetupSelected?.map((item) => item.id);
    if (staffSetupSelectedIds?.length)
      fetchStaffSetupConfigurations(staffSetupSelectedIds);
  }, [shift, travelMinutes]);

  useEffect(() => {
    if (collectionOperationId && location_type && shift?.startTime) {
      setStartDate(getValues()?.start_date);
      fetchVehicles(index);
    }
  }, [collectionOperationId, location_type, shift?.startTime]);
  // Fetch the Vehicles based on the collection operation of Account selected and Location type of selected location
  const fetchVehicles = async (index) => {
    const locationTypeData = {
      Outside: 1,
      Inside: 2,
      Combination: 3,
    };
    if (
      collectionOperationId &&
      location_type != '' &&
      shift?.startTime != ''
    ) {
      const formatDate = moment(startDate).format('YYYY-MM-DD');
      const formatTime = moment(shift?.startTime).format('HH:mm:ss.SSSSSS');
      const timeStamp = formatDate + ' ' + formatTime;
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/vehicles/drives?location_type=${locationTypeData[location_type]}&collection_operation=${collectionOperationId}&start_time=${timeStamp}`
        );
        const data = await response.json();
        const vehicleOptions =
          data?.data?.map((item) => {
            return {
              name: item?.name,
              id: item?.id,
            };
          }) || [];
        setShifts((prev) => {
          return prev?.map((i, j) =>
            j === index
              ? {
                  ...i,
                  vehicleOptions: vehicleOptions,
                }
              : i
          );
        });
      } catch (error) {
        console.error(`Error fetching data ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };
  useEffect(() => {
    if (driveDate) getLinkableVehicles();
  }, [accountId, driveDate]);
  const getLinkableVehicles = async () => {
    try {
      if (id) {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/drives/linkvehicles?date=${moment(driveDate).format(
            'YYYY-MM-DD'
          )}&id=${id}`
        );
        let array = [];
        const data = await response.json();
        data?.data?.map((item, index) => {
          let date;
          let account;
          let location;
          let start_time;
          let end_time;
          let vehicles_name = null;
          let staffSetup;
          let total_time;
          let id;
          if (
            item?.drives?.shifts?.length &&
            item?.drives?.account?.name &&
            item?.drives?.location?.name &&
            item?.drives?.shifts?.[0]?.id
          ) {
            date = item?.drives?.date;
            id = item?.drives?.shifts?.[0]?.id;
            account = item?.drives?.account?.name;
            location = item?.drives?.location?.name;
            let long = item?.drives?.shifts?.length;
            start_time = formatDateWithTZ(
              item?.drives?.shifts?.[0]?.start_time,
              'hh:mm a'
            );
            end_time = formatDateWithTZ(
              item?.drives?.shifts?.[long - 1]?.end_time,
              'hh:mm a'
            )
              ? formatDateWithTZ(
                  item?.drives?.shifts?.[long - 1]?.end_time,
                  'hh:mm a'
                )
              : formatDateWithTZ(
                  item?.drives?.shifts?.[0]?.end_time,
                  'hh:mm a'
                );

            total_time = `${start_time} - ${end_time}`;
            let sum = 0;
            staffSetup = item?.drives?.staff_config?.map((ds, iii) => {
              return (sum += ds?.qty);
            });
            staffSetup = staffSetup + '-staff';
            for (let veh of item?.drives?.vehicles || []) {
              vehicles_name = vehicles_name
                ? vehicles_name +
                  (veh && veh.name !== undefined ? ', ' + veh.name : '')
                : veh && veh.name !== undefined
                ? veh.name
                : null;
            }
            let data = {
              id,
              date,
              account,
              location,
              start_time,
              end_time,
              vehicles_name,
              staffSetup,
              total_time,
            };
            array.push(data);
          }
        });

        if (array?.length) {
          setLinkAbleVehicles(array);
        }
      }
    } catch (err) {
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };
  const getLinkedShiftDetails = async (id) => {
    try {
      console.log(id);
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles/${id}`
      );
      const data = await response.json();
      setLinkedDriveId(data && data?.data && data?.data?.drives?.id);

      let procedureItem = {
        label: data?.data?.projection?.procedure_type?.name,
        procedure_duration:
          data?.data?.projection?.procedure_type?.procedure_duration,
        quantity: data?.data?.projection?.procedure_type_qty,
        value: data?.data?.projection?.procedure_type?.id,
      };
      // let productItem = {};
      let productItem = {
        id: data?.data?.products.id?.toString(),
        name: data?.data?.products?.name,
        quantity: data?.data?.projection?.product_yield,
        yield: data?.data?.projection?.product_yield,
      };
      // let projectionItem = {};
      let projectionItem = {
        label: data?.data?.projection?.procedure_type?.name,
        procedure_duration:
          data?.data?.projection?.procedure_type?.procedure_duration.toString(),
        value: data?.data?.projection?.procedure_type?.id.toString(),
      };

      let staffSetupItem = data?.data?.staff?.map((item) => {
        return {
          beds: item?.beds,
          concurrent_beds: item?.concurrent_beds,
          id: item?.id.toString(),
          name: item?.name,
          qty: item?.staff_configuration[0]?.qty,
          stagger: item?.stagger_slots,
        };
      });
      let projectionData = [];

      projectionData.push({
        procedure: procedureItem,
        product: productItem,
        projection: projectionItem,
        staffSetup: staffSetupItem,
      });

      // const newshifts = shifts
      const newShift = shift;
      newShift.projections = projectionData;

      newShift.devices =
        data?.data?.devices?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];

      newShift.resources =
        data?.data?.vehicles?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];

      shift = newShift;
      const newShifts = [];
      newShifts.push(newShift);
      setShifts(newShifts);
      setLinkedSettings(newShifts);
    } catch (err) {
      console.log(err);
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };
  // console.log({ shift });
  useEffect(() => {
    if (selectedLinkDrive?.length == 1) {
      getLinkedShiftDetails(selectedLinkDrive[0]);
    }
  }, [selectedLinkDrive]);

  const addRemoveResources = (i, e) => {
    const currentState = shifts[i].resources;
    if (currentState.find((item) => item.id === e.id)) {
      const output = shifts?.map((item, index) =>
        i === index
          ? {
              ...item,
              resources: shifts[i].resources.filter((s) => s.id !== e.id),
            }
          : item
      );
      setShifts([...output]);
    } else {
      const output = shifts?.map((item, index) =>
        i === index
          ? {
              ...item,
              resources: [...shifts[i].resources, e],
            }
          : item
      );
      setShifts([...output]);
    }
  };

  const selectUnselectAllDevices = (i, checked, data) => {
    const output = shifts?.map((item, index) =>
      i === index
        ? {
            ...item,
            devices: checked ? [] : data,
          }
        : item
    );
    setShifts([...output]);
  };

  const selectUnselectAllResources = (i, checked, data) => {
    const output = shifts?.map((item, index) =>
      i === index
        ? {
            ...item,
            resources: checked ? [] : data,
          }
        : item
    );
    setShifts([...output]);
  };

  const addNewShift = () => {
    const defaultState = {
      startTime: '',
      endTime: '',
      projections: [
        { projection: 0, procedure: 25, product: 25, staffSetup: [] },
      ],
      resources: [],
      devices: [],
      staffBreak: false,
      breakStartTime: '',
      breakEndTime: '',
      reduceSlot: false,
      reduction: 0,
      OEF: 0,
      minStaff: [0],
      maxStaff: [0],
    };
    setShifts((prev) => {
      return [...prev, defaultState];
    });
  };

  const removeNewShift = (index) => {
    setRemoveShift(shifts);
    setShifts((prev) => {
      return prev.filter((s, i) => i !== index);
    });
    setRemoveShift((prev) => {
      return prev.filter((s, i) => i == index);
    });

    let temp = shiftSlots;
    delete temp[index];
    setShiftSlots(temp);
  };

  useEffect(() => {
    let sumProducts = 0;
    let sumProcedures = 0;
    shift?.projections?.map((item) => {
      sumProducts += +item?.product?.quantity || 0;
      sumProcedures += +item?.procedure?.quantity || 0;
    });
    setSumProcedures(sumProcedures);
    setSumProducts(sumProducts);
  }, [shift?.projections]);

  const getOEFValue = () => {
    const shiftHours =
      shift.endTime && shift.startTime
        ? moment.duration(shift.endTime.diff(shift.startTime)).hours()
        : 0;
    const productHoursRation = sumProducts / shiftHours;
    const procedureHoursRation = sumProcedures / shiftHours;
    let sumStaff = 0;
    shift?.projections?.map((proj) => {
      proj.staffSetup?.map((ss) => {
        sumStaff += parseFloat(ss.qty);
      });
    });
    const oef =
      (viewAs == 'Products' ? productHoursRation : procedureHoursRation) /
      Math.ceil(sumStaff);
    return isNaN(oef) || sumStaff == 0 ? 0 : oef.toFixed(2);
  };

  const createDayjsObject = (momentObject, hour, minute) => {
    const year = momentObject.year();
    const month = momentObject.month(); // Note: Moment.js months are zero-indexed
    const day = momentObject.date();
    return dayjs()
      .year(year)
      .month(month)
      .date(day)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);
  };

  const getReductionPercentage = () => {
    if (shift?.reduction == 0 || isNaN(shift?.reduction)) return 0;
    else if (parseFloat(shift?.reduction)?.toFixed(2) < reductionStep)
      return reductionStep;
    return parseFloat(shift?.reduction)?.toFixed(2);
  };

  useEffect(() => {
    if (location_type && collectionOperationId) fetchVehicles(index);
  }, [location_type, collectionOperationId]);
  return (
    <>
      <div
        className="formGroup shift-form"
        key={'shifts' + index}
        name="shifts"
      >
        <h5>
          Schedule Shift {index + 1}
          <span className="shift-count">{index + 1}</span>
        </h5>{' '}
        <Controller
          name={`start_time${index}`}
          control={control}
          render={({ field }) => (
            <div className="form-field">
              <div className={`field shiftTime`}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MyTimePicker
                    classes={{ root: 'dsd' }}
                    valueType="time"
                    value={dayjs(shift?.startTime)}
                    onChange={(e) => {
                      const dayJsDate = createDayjsObject(
                        moment(driveDate),
                        e.hour(),
                        e.minute()
                      );
                      setEndTimeDisabled(false);
                      setShifts((prev) => {
                        return prev?.map((i, j) =>
                          j === index ? { ...i, startTime: dayJsDate } : i
                        );
                      });
                      field.onChange(e);
                    }}
                    className="w-100 shift"
                    label="Start Time*"
                  />
                </LocalizationProvider>
              </div>
              {startShiftTimeToolTip != '' && (
                <ToolTip text={startShiftTimeToolTip} />
              )}
              {errors?.startTime && (
                <div className="error">
                  <div className="error">
                    <p>{errors?.startTime}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        />
        <Controller
          name={`end_time${index}`}
          control={control}
          render={({ field }) => (
            <div className="form-field">
              <div className={`field shiftTime`}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MyTimePicker
                    classes={{ root: 'dsd' }}
                    valueType="time"
                    value={dayjs(shift?.endTime)}
                    // disabled={!editable && endTimeDisabled}
                    onChange={(e) => {
                      const dayJsDate = createDayjsObject(
                        moment(driveDate),
                        e.hour(),
                        e.minute()
                      );
                      // for (let data of shift.projection) {
                      //   // let projection_id = pro.id;
                      //   data?.procedure?.value = null;
                      //  data.procedure?.quantity = null;
                      //   data?.product?.quantity= null;
                      //   let staff_setups = [];
                      //   pro?.staffSetup?.map((staff) => {
                      //     staff_setups.push(staff.id);
                      //   });

                      //   projection.push({
                      //     // id: projection_id,
                      //     procedure_type_id,
                      //     procedure_type_qty,
                      //     product_yield,
                      //     staff_setups,
                      //   });
                      // }
                      setShifts((prev) => {
                        return prev?.map((i, j) =>
                          j === index ? { ...i, endTime: dayJsDate } : i
                        );
                      });
                      field.onChange(e);
                    }}
                    className="w-100 shift"
                    label="End Time*"
                  />
                </LocalizationProvider>
              </div>
              {endShiftTimeToolTip != '' && (
                <ToolTip text={endShiftTimeToolTip} />
              )}
              {errors?.endTime && (
                <div className="error">
                  <div className="error">
                    <p>{errors?.endTime}</p>
                  </div>
                </div>
              )}
              {shift?.endTime !== '' &&
              shift?.startTime !== '' &&
              shift?.startTime >= shift?.endTime ? (
                <div className="error">
                  <p>End Time should be greater than start time</p>
                </div>
              ) : null}
            </div>
          )}
        />
        {shift?.projections?.map((projection, pIndex) => {
          return (
            <ProjectionForm
              key={pIndex}
              projection={projection}
              projectionIndex={pIndex}
              control={control}
              procedureTypesList={procedureTypesList}
              errors={errors}
              shiftProjections={shift?.projections}
              shiftIndex={index}
              setShifts={setShifts}
              procedureProducts={procedureProducts}
              isOverrideUser={isOverrideUser}
              minOef={industryCategories?.[account?.value]?.minimum_oef}
              maxOef={industryCategories?.[account?.value]?.maximum_oef}
              shiftHours={
                shift.endTime && shift.startTime
                  ? moment.duration(shift.endTime.diff(shift.startTime)).hours()
                  : 0
              }
              location_type={location_type}
              collectionOperationId={collectionOperationId}
              driveDate={driveDate}
              availableStaff={availableStaff}
              utilizedStaff={staffUtilization}
              resourceShareData={resourceShareData}
              setResourceShareData={setResourceShareData}
              setStaffShareValue={setStaffShareValue}
              setShareStaffModal={setShareStaffModal}
              setStaffShareRequired={setStaffShareRequired}
              shifts={shifts}
            />
          );
        })}
        <h4>Resources*</h4>
        <Controller
          name="Vehicle"
          control={control}
          render={({ field }) => {
            return (
              <div className="form-field">
                <div className={`field`}>
                  <GlobalMultiSelect
                    data={shift?.vehicleOptions}
                    linkDrive={
                      shifts?.length == 1 &&
                      driveDate &&
                      location_type &&
                      dayjs(shift?.startTime).isValid() &&
                      dayjs(shift?.endTime).isValid()
                        ? true
                        : false
                    }
                    showModel={setVehiclesModel}
                    selectedOptions={shift?.resources}
                    error={errors?.vehicles}
                    onChange={(e) => {
                      if (linkedDriveID) {
                        setUnLinkWarning(true);
                        setEvent(e);
                        setSelectAll(false);
                      } else {
                        addRemoveResources(index, e);
                      }
                    }}
                    // onClick={setVehiclesModel(true)}
                    onSelectAll={(e) => {
                      if (linkedDriveID) {
                        setUnLinkWarning(true);
                        setEvent(e);
                        setSelectAll(true);
                      } else {
                        selectUnselectAllResources(
                          index,
                          shift?.resources?.length ===
                            shift?.vehicleOptions?.length,
                          shift?.vehicleOptions
                        );
                      }
                    }}
                    label={'Vehicles*'}
                    isquantity={false}
                    quantity={0}
                    disabled={false}
                  />
                </div>
              </div>
            );
          }}
        />
        <Controller
          name="Devices"
          control={control}
          render={({ field }) => {
            return (
              <div className="form-field">
                <div className={`field`}>
                  <GlobalMultiSelect
                    data={shiftDevicesOptions}
                    selectedOptions={shift.devices}
                    error={''}
                    onChange={(e) => {
                      addRemoveDevices(shifts, index, e, setShifts);
                    }}
                    onSelectAll={(e) => {
                      selectUnselectAllDevices(
                        index,
                        shift.devices.length === shiftDevicesOptions.length,
                        shiftDevicesOptions
                      );
                    }}
                    label={'Devices'}
                    isquantity={false}
                    quantity={0}
                    disabled={false}
                  />
                </div>
              </div>
            );
          }}
        />
        <div className="w-100">
          <Controller
            name="staff_break"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormCheckbox
                name={field.name}
                displayName="Staff Break"
                checked={shift.staffBreak}
                classes={{ root: 'mt-2 mb-4' }}
                onChange={(e) => {
                  setShifts((prev) => {
                    return prev?.map((i, j) =>
                      j === index
                        ? {
                            ...i,
                            staffBreak: e.target.checked,
                          }
                        : i
                    );
                  });
                }}
              />
            )}
          />
        </div>
        {shift.staffBreak && (
          <>
            <Controller
              name={`staff_start_time${index}`}
              control={control}
              render={({ field }) => (
                <div className="form-field">
                  <div className={`field shiftTime`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MyTimePicker
                        classes={{ root: 'dsd' }}
                        valueType="time"
                        value={dayjs(shift?.breakStartTime)}
                        onChange={(e) => {
                          const dayJsDate = createDayjsObject(
                            moment(driveDate),
                            e.hour(),
                            e.minute()
                          );
                          setStaffBreakendTimeDisabled(false);
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index
                                ? { ...i, breakStartTime: dayJsDate }
                                : i
                            );
                          });
                          field.onChange(e);
                        }}
                        className="w-100 shift"
                        label="Start Time*"
                      />
                    </LocalizationProvider>
                  </div>
                  {formErrors?.[`staff_start_time`] && (
                    <div className="error">
                      <div className="error">
                        <p>{formErrors?.[`staff_start_time`].message}</p>
                      </div>
                    </div>
                  )}
                  {/* {shift?.breakStartTime !== '' &&
                  shift?.breakStartTime >= shift?.breakEndTime ? (
                    <div className="error">
                      <p>Start Time should be less than end time</p>
                    </div>
                  ) : null} */}
                  {shift?.breakStartTime !== '' &&
                  shift?.startTime !== '' &&
                  shift?.startTime >= shift?.breakStartTime ? (
                    <div className="error">
                      <p>
                        Break start Time should be greater than Shift start time
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            />
            <Controller
              name={`staff_end_time${index}`}
              control={control}
              render={({ field }) => (
                <div className="form-field">
                  <div className={`field shiftTime`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <MyTimePicker
                        classes={{ root: 'dsd' }}
                        valueType="time"
                        value={dayjs(shift?.breakEndTime)}
                        // disabled={!editable && staffBreakendTimeDisabled}
                        onChange={(e) => {
                          const dayJsDate = createDayjsObject(
                            moment(driveDate),
                            e.hour(),
                            e.minute()
                          );
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index
                                ? { ...i, breakEndTime: dayJsDate }
                                : i
                            );
                          });
                          field.onChange(e);
                        }}
                        className="w-100 shift"
                        label="End Time*"
                      />
                    </LocalizationProvider>
                  </div>
                  {formErrors?.[`staff_end_time`] && (
                    <div className="error">
                      <div className="error">
                        <p>{formErrors?.[`staff_end_time`].message}</p>
                      </div>
                    </div>
                  )}
                  {shift?.breakEndTime !== '' &&
                  shift?.endTime !== '' &&
                  shift?.breakEndTime >= shift?.endTime ? (
                    <div className="error">
                      <p>Break end Time should be less than Shift end time</p>
                    </div>
                  ) : null}
                  {shift?.breakEndTime !== '' &&
                  shift?.breakStartTime !== '' &&
                  shift?.breakEndTime <= shift?.breakStartTime ? (
                    <div className="error">
                      <p>Break end Time should be less than Break start time</p>
                    </div>
                  ) : null}
                </div>
              )}
            />
            <div className="form-field">
              <div className="field">
                <Controller
                  name="staff_Reduce_Slots"
                  control={control}
                  render={({ field }) => (
                    <FormCheckbox
                      name={field.name}
                      displayName="Reduce Slots"
                      checked={shift.reduceSlot}
                      classes={{ root: 'mt-2' }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index
                                ? {
                                    ...i,
                                    reduction: reductionStep,
                                    reduceSlot: e.target.checked,
                                  }
                                : i
                            );
                          });
                        } else {
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index
                                ? {
                                    ...i,
                                    reduction: 0,
                                    reduceSlot: e.target.checked,
                                  }
                                : i
                            );
                          });
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>
            <div className="form-field">
              <div className="field">
                <span className="app-red">
                  <span></span>
                  Appointment Reduction ({getReductionPercentage()}
                  %)
                </span>
                <input
                  name="staff_Appointment_Reduction"
                  type="range"
                  className="form-range"
                  min="0"
                  max="100"
                  step={reductionStep}
                  id="customRange3"
                  disabled={shift?.reduceSlot ? false : true}
                  value={shift.reduction}
                  onChange={(e) => {
                    setShifts((prev) => {
                      return prev?.map((i, j) =>
                        j === index
                          ? {
                              ...i,
                              reduction: e.target.value,
                            }
                          : i
                      );
                    });
                  }}
                ></input>
              </div>
            </div>
          </>
        )}
        <Controller
          name="OEF (Products)"
          control={control}
          render={({ field }) => (
            <FormInput
              name={field.name}
              classes={{ root: '' }}
              displayName={`OEF (${viewAs})`}
              value={getOEFValue()}
              required={false}
              disabled={true}
            />
          )}
        />
        <div className="col-md-6 text-right">
          <button
            className="btn btn-md btn-link p-0 editBtn text-right view-pro"
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              if (viewAs === 'Products') {
                setViewAs('Procedures');
              } else {
                setViewAs('Products');
              }
            }}
          >
            View as {viewAs === 'Procedures' ? 'Products' : 'Procedures'}
          </button>
        </div>
        <p className="w-100 d-flex align-items-center">
          <span>
            <ToolTip
              text={
                'OEF range (minimum and maximum OEF ) is fetched from industry category based on selected account from drive section.'
              }
            />
          </span>
          <span className="ps-2">
            {viewAs} {viewAs === 'Procedures' ? sumProcedures : sumProducts} |
            Slots {totalSlots}
          </span>
        </p>
        <div className="w-100 text-right">
          {shiftIndexesLength === 1 ? (
            <button
              type="button"
              className="btn btn-primary right-btn btn-md"
              onClick={() => {
                addNewShift();
              }}
            >
              Add Shift
            </button>
          ) : index === shiftIndexesLength - 1 ? (
            <>
              <button
                onClick={() => {
                  removeNewShift(index);
                }}
                type="button"
                className="btn btn-danger right-btn btn-md"
              >
                Remove Shift
              </button>
              <button
                type="button"
                className="btn btn-primary right-btn btn-md"
                onClick={() => {
                  addNewShift();
                }}
              >
                Add Shift
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                removeNewShift(index);
              }}
              type="button"
              className="btn btn-danger right-btn btn-md"
            >
              Remove Shift
            </button>
          )}
        </div>
      </div>
      <ShareStaffModal
        setModal={setShareStaffModal}
        modal={shareStaffModal}
        shift={shift}
        setShareStaffSearch={setShareStaffSearch}
        shareStaffSearch={shareStaffSearch}
        staffShareRequired={staffShareRequired}
        shareStaffData={shareStaffData}
        resourceShareData={resourceShareData}
        setResourceShareData={setResourceShareData}
        staffShareValue={staffShareValue}
        setShifts={setShifts}
        shifts={shifts}
        driveDate={driveDate}
        collectionOperationId={collectionOperationId}
      />
      <LinkVehiclesmodel
        setModal={setVehiclesModel}
        modal={vehiclesModel}
        shift={shift}
        setCoordinatesB={setCoordinatesB}
        coordinatesB={coordinatesB}
        coordinatesA={coordinatesA}
        bookingRules={bookingRules}
        setCoordinatesA={setCoordinatesA}
        setlinkedDrive={setlinkedDrive}
        linkedDrive={linkedDrive}
        staffShareRequired={0}
        // selectedItems={setSelectedLinkDrive}
        shareStaffData={linkableVehicles}
        selectedLinkDrive={selectedLinkDrive}
        setSelectedLinkDrive={setSelectedLinkDrive}
      />
      {MismatchModal && (
        <section
          className={`popup full-section ${MismatchModal ? 'active' : ''}`}
        >
          <div className="popup-inner" style={{ maxWidth: '700px' }}>
            <div className="icon">
              <img src={WarningIconImage} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Warning!</h3>
              <p>
                The shift settings you have made will result in a device
                selection staff setup/procedure mix that is different than its
                linked drive.
              </p>
              <div className="buttons" style={{ gap: '10px' }}>
                <button
                  className={`btn btn-primary ${styles.popupButton}`}
                  onClick={async (e) => {
                    // submitLinkedDriveAndSave();
                    e.preventDefault();
                    setMisMatchModal(false);
                    const bool = await handleupdateLinkDrive();
                    if (bool) {
                      editable
                        ? await EditHandle(formDatas)
                        : await handleSubmit(formDatas);
                    }
                    setEditLinkDrive(true);
                  }}
                >
                  Copy changes from Current Drive to the Linked Drive.
                </button>
                <button
                  className={`btn btn-primary ${styles.popupButton}`}
                  onClick={async (e) => {
                    e.preventDefault();
                    setMisMatchModal(false);
                    // handleDiscardDrive();
                    // setEditCurrentShift(true);
                    if (selectedLinkDrive?.length == 1) {
                      await getLinkedShiftDetails(selectedLinkDrive[0]);

                      editable
                        ? await EditHandle(formDatas)
                        : await handleSubmit(formDatas);
                    }
                  }}
                >
                  Discard Current Drive changes and use linked drive settings.
                </button>
                <button
                  className={`btn btn-primary ${styles.popupButton}`}
                  onClick={async (e) => {
                    e.preventDefault();
                    setMisMatchModal(false);
                    // setConfigureShiftBtn(true);

                    editable
                      ? await EditHandle(formDatas)
                      : await handleSubmit(formDatas);
                  }}
                >
                  Proceed and save this shift as configured.
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      <CancelModalPopUp
        title="Warning"
        message="This will result in unlinking of drive"
        modalPopUp={unLinkWarning}
        setModalPopUp={setUnLinkWarning}
        methods={() => {
          setLinkedDriveId(null);
          setSelectedLinkDrive(null);
          setUnLinkWarning(false);
          addRemoveResources(index, event);
          if (selectAll) {
            selectUnselectAllResources(
              index,
              shift?.resources?.length === shift?.vehicleOptions?.length,
              shift?.vehicleOptions
            );
          }
        }}
        methodsToCall={true}
      />
    </>
  );
};

export default ShiftForm;
