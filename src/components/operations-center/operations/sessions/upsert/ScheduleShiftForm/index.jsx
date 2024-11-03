import React from 'react';
import 'rc-time-picker/assets/index.css';
import { Controller } from 'react-hook-form';
import styles from '../../Session.module.scss';
import ToolTip from '../../../../../common/tooltip';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import FormCheckbox from '../../../../../common/form/FormCheckBox';
import FormInput from '../../../../../common/form/FormInput';
import Projection from './Projection';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MyTimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import { useFieldArray } from 'react-hook-form';
import dayjs from 'dayjs';
import { CalculateSlots } from '../../../drives/create/shift/calculate_slots';
import ShareStaffModal from '../../../drives/create/share-staff-modal';
import ConfirmIcon from '../../../../../../assets/images/confirmation-image.png';

const getHoursAndMinutes = (date) => {
  const d = new Date(date);
  return [d.getHours(), d.getMinutes()];
};

const validateEndTime = (startTime, endTime) => {
  const [startTimeHours, startTimeMins] = getHoursAndMinutes(startTime);
  const [endTimeHours, endTimeMins] = getHoursAndMinutes(endTime);

  if (startTimeHours === endTimeHours) {
    return startTimeMins <= endTimeMins ? true : false;
  } else if (startTimeHours <= endTimeHours) {
    return true;
  }
  return false;
};

const totalHoursOfShift = (startTime, endTime) => {
  const [startTimeHours] = getHoursAndMinutes(startTime);
  const [endTimeHours] = getHoursAndMinutes(endTime);

  return endTimeHours - startTimeHours;
};

export default function ScheduleShiftForm({
  control,
  watch,
  setValue,
  shiftIndex,
  addShift,
  removeShift,
  shiftIndexesLength,
  formErrors,
  shiftFieldName,
  procedureTypesOptions,
  OEF,
  devicesOptions,
  allowAppointmentAtShiftEndTime,
  customErrors,
  setCustomErrors,
  slots,
  handleSlotsChange,
  collectionOperation,
  sessionDate,
  isOverrideUser,
  isValidEditableTime,
  bookingRules,
  shifts,
  currentShift,
  shareStaffData,
  resourceShareData,
  setResourceShareData,
  dailyCapacities,
  staffUtilization,
  sessionId,
  isCopy,
  shift,
  setShareStaffSearch,
  shareStaffSearch,
}) {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `${shiftFieldName}.projections`,
  });
  const { append: appendRemoveProjection } = useFieldArray({
    control,
    name: `${shiftFieldName}.remove_projections`,
  });
  const [viewAs, setViewAs] = React.useState('Products');
  const [shiftOEF, setShiftOEF] = React.useState({
    oef_products: 0,
    oef_procedures: 0,
  });
  const [reductionStep, setReductionStep] = React.useState(0);
  const [allProjections, setAllProjections] = React.useState([]);
  const projectionUpdated = React.useRef(false);
  const [shareStaffModal, setShareStaffModal] = React.useState(false);
  const [staffShareRequired, setStaffShareRequired] = React.useState(0);
  const [staffShareValue, setStaffShareValue] = React.useState({});
  const [availableStaff, setAvailableStaff] = React.useState(0);
  const [confirmaton, setConfirmation] = React.useState(false);

  const projections = watch(`${shiftFieldName}.projections`);
  const devices = watch(`${shiftFieldName}.devices`);
  const appointmentReduction = watch(`${shiftFieldName}.appointment_reduction`);
  const staffBreak = watch(`${shiftFieldName}.staff_break`);
  const staffBreakStart = watch(`${shiftFieldName}.break_start_time`);
  const staffBreakEnd = watch(`${shiftFieldName}.break_end_time`);
  const startTime = watch(`${shiftFieldName}.start_time`);
  const endTime = watch(`${shiftFieldName}.end_time`);
  const reduceSlots = watch(`${shiftFieldName}.reduce_slots`);

  const projectionsJSON = JSON.stringify(projections);

  const totalSlots = React.useMemo(() => {
    let sumOfSlots = 0;
    slots?.forEach((item) => {
      sumOfSlots += item?.items?.length;
    });
    return sumOfSlots;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  React.useEffect(() => {
    const dayName = moment(sessionDate).format('dddd');
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
    const maxStaff = dailyCapacities?.[`${driveDay}_max_staff`] || 0;
    setAvailableStaff(
      maxStaff - staffUtilization > 0 ? maxStaff - staffUtilization : 0
    );
  }, [sessionDate, dailyCapacities, staffUtilization]);

  React.useEffect(() => {
    if (!isNaN(reductionStep)) {
      setValue(`${shiftFieldName}.appointment_reduction`, reductionStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reductionStep, setValue]);

  React.useEffect(() => {
    setValue(`${shiftFieldName}.oef_products`, shiftOEF.oef_products);
    setValue(`${shiftFieldName}.oef_procedures`, shiftOEF.oef_procedures);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue, shiftOEF]);

  React.useEffect(() => {
    let error_msg = '';
    if (endTime && !validateEndTime(startTime, endTime)) {
      error_msg = 'End time should be greater than start time';
    }
    setCustomErrors((prevErrors) => ({
      ...prevErrors,
      [`${shiftFieldName}.end_time`]: error_msg,
    }));
  }, [startTime, endTime, setCustomErrors, shiftFieldName]);

  React.useEffect(() => {
    const isBreakStartTimeLess = !validateEndTime(startTime, staffBreakStart);
    const isBreakStartTimeGreater = !validateEndTime(staffBreakStart, endTime);

    let error_msg = '';
    if (
      staffBreak &&
      staffBreakStart &&
      (isBreakStartTimeLess || isBreakStartTimeGreater)
    ) {
      error_msg = isBreakStartTimeLess
        ? 'Break start time should be greater than shift start time'
        : 'Break start time should be less than shift end time';
    }

    setCustomErrors((prevErrors) => ({
      ...prevErrors,
      [`${shiftFieldName}.break_start_time`]: error_msg,
    }));
  }, [
    staffBreak,
    staffBreakStart,
    startTime,
    endTime,
    setCustomErrors,
    shiftFieldName,
  ]);

  React.useEffect(() => {
    const isBreakEndTimeLess = !validateEndTime(staffBreakStart, staffBreakEnd);
    const isBreakEndTimeGreater = !validateEndTime(staffBreakEnd, endTime);

    let error_msg = '';
    if (
      staffBreak &&
      staffBreakEnd &&
      (isBreakEndTimeLess || isBreakEndTimeGreater)
    ) {
      error_msg = isBreakEndTimeLess
        ? 'Break end time should be greater than break start time'
        : 'Break end time should be less than shift end time';
    }
    setCustomErrors((prevErrors) => ({
      ...prevErrors,
      [`${shiftFieldName}.break_end_time`]: error_msg,
    }));
  }, [
    staffBreak,
    staffBreakStart,
    staffBreakEnd,
    endTime,
    shiftFieldName,
    setCustomErrors,
  ]);

  React.useEffect(() => {
    CalculateSlots(
      shifts?.map((shift) => ({
        ...shift,
        projections: shift?.projections?.map((proj) => ({
          ...proj,
          staffSetup: proj?.staff_setup,
        })),
      })),
      {
        startTime: currentShift?.start_time,
        endTime: currentShift?.end_time,
        breakStartTime: currentShift?.break_start_time,
        breakEndTime: currentShift?.break_end_time,
        staffBreak: currentShift?.staff_break,
        reduceSlot: currentShift?.reduce_slots,
        reduction: currentShift?.appointment_reduction,
        projections: currentShift?.projections?.map((proj) => ({
          procedure: proj?.procedure,
          staffSetup: proj?.staff_setup?.map((setup) => ({
            ...setup,
            stagger: setup?.stagger_slots,
          })),
        })),
      },
      shiftIndex,
      setReductionStep,
      allowAppointmentAtShiftEndTime,
      (callback) => {
        const newSlots = callback({});
        handleSlotsChange(shiftIndex, newSlots[shiftIndex]);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allowAppointmentAtShiftEndTime,
    currentShift,
    setValue,
    projectionsJSON,
    appointmentReduction,
    staffBreak,
    staffBreakEnd,
    staffBreakStart,
    startTime,
    endTime,
    reduceSlots,
  ]);

  React.useEffect(() => {
    const tempProjections = [];
    projections.forEach((projection) => {
      tempProjections.push(projection?.procedure?.id?.toString());
    });
    setAllProjections([...new Set(tempProjections)]);
  }, [projections, projectionsJSON]);

  const handleSumOfProjections = React.useCallback(
    (both = false) => {
      const sumReducer = (key) => (sum, proj) => {
        const value = parseFloat(proj[key]);
        return sum + (isNaN(value) ? 0 : value);
      };

      if (!both) {
        const key =
          viewAs === 'Products' ? 'product_yield' : 'procedure_type_qty';
        const sumOfProjections = projections?.reduce(sumReducer(key), 0);
        return isNaN(sumOfProjections) ? 0 : sumOfProjections;
      } else {
        const sumOfProjectionsProducts = projections?.reduce(
          sumReducer('product_yield'),
          0
        );
        const sumOfProjectionsProcedures = projections?.reduce(
          sumReducer('procedure_type_qty'),
          0
        );
        return [
          isNaN(sumOfProjectionsProducts) ? 0 : sumOfProjectionsProducts,
          isNaN(sumOfProjectionsProcedures) ? 0 : sumOfProjectionsProcedures,
        ];
      }
    },
    [projections, viewAs]
  );

  const handleOEF = React.useCallback(() => {
    const [sumOfProjectionsProducts, sumOfProjectionsProcedures] =
      handleSumOfProjections(true);
    const sumOfStaff =
      projections?.reduce(
        (sum, proj) =>
          sum +
          (proj?.staff_setup?.reduce(
            (setupSum, setup) =>
              setupSum +
              parseFloat(
                (setup?.sum_staff_qty ? setup?.sum_staff_qty : setup?.qty) || 0
              ),
            0
          ) || 0),
        0
      ) || 0;
    const hours = totalHoursOfShift(startTime, endTime) || 1;
    const staff = Math.ceil(sumOfStaff) || 1;

    const calculateOEF = (sumOfProjections) => {
      const oef = sumOfProjections / hours / staff;
      return isNaN(oef) || !isFinite(oef) ? 0 : oef.toFixed(2);
    };

    setShiftOEF({
      oef_products: calculateOEF(sumOfProjectionsProducts),
      oef_procedures: calculateOEF(sumOfProjectionsProcedures),
    });
  }, [projections, startTime, endTime, handleSumOfProjections]);

  React.useEffect(() => handleOEF(), [handleOEF, projectionsJSON]);

  const handleDevicesChange = (device) => {
    let devicesCopy = [...devices];
    devicesCopy = devicesCopy.some((item) => item.id === device.id)
      ? devicesCopy.filter((item) => item.id !== device.id)
      : [...devicesCopy, device];
    setValue(`${shiftFieldName}.devices`, devicesCopy, { shouldDirty: true });
  };

  const handleDevicesChangeAll = (data) =>
    setValue(`${shiftFieldName}.devices`, data, { shouldDirty: true });

  const handleViewAs = () => {
    setViewAs(viewAs === 'Procedures' ? 'Products' : 'Procedures');
  };

  const addProjection = React.useCallback(() => {
    append({
      procedure: null,
      procedure_type_qty: 1,
      staff_setup: [],
    });
  }, [append]);

  React.useEffect(() => {
    if (projections.length > fields.length && !projectionUpdated.current) {
      projectionUpdated.current = true;
      replace([...projections]);
    }
  }, [addProjection, fields, projections, projectionsJSON, replace]);

  const removeProjection = (index) => () => {
    const projectionId = projections[index]?.id;
    if (projectionId) appendRemoveProjection(projectionId);
    setResourceShareData(
      resourceShareData
        .filter(
          (item) =>
            item.shift_index !== shiftIndex && item.projection_index !== index
        )
        .map((item) => ({
          ...item,
          projection_index:
            item.shift_index !== shiftIndex
              ? Math.max(0, item.projection_index - 1)
              : item.projection_index,
        }))
    );
    remove(index);
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

  const handleResourceShareData = () => {
    const resourceShare = {
      ...staffShareValue?.resourceShare,
      shift_index: staffShareValue.shiftIndex,
      projection_index: staffShareValue.projectionIndex,
    };
    setResourceShareData([
      ...new Map(
        [...resourceShareData, resourceShare].map((item) => {
          const key = `${item?.staff_setup_id}-${item?.from_collection_operation_id}-${item?.to_collection_operation_id}-${item?.shift_index}`;
          return [key, item];
        })
      ).values(),
    ]);
    setValue(
      `${shiftFieldName}.projections[${staffShareValue.projectionIndex}].staff_setup`,
      [...(projections?.staff_setup || []), staffShareValue?.value]
    );
    handleOEF();
    setConfirmation(false);
  };

  return (
    <div className="formGroup shift-form" name={shiftFieldName} key={shift?.id}>
      <h5>
        Schedule Shift {shiftIndex + 1}
        <span className="shift-count">{shiftIndex + 1}</span>
      </h5>
      <Controller
        name={`${shiftFieldName}.start_time`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className="field shiftTime">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  disabled={
                    isValidEditableTime && bookingRules?.third_rail_fields_hours
                  }
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(startTime)}
                  onChange={(e) => {
                    if (!e) return;
                    const dayJsDate = createDayjsObject(
                      moment(startTime),
                      e.hour(),
                      e.minute()
                    );
                    setValue(`${shiftFieldName}.start_time`, dayJsDate);
                    field.onChange(e);
                  }}
                  className="w-100 shift"
                  label="Start Time*"
                />
              </LocalizationProvider>
            </div>
            {formErrors?.shifts?.[shiftIndex]?.start_time && (
              <div className="error">
                <p>{formErrors?.shifts[shiftIndex]?.start_time?.message}</p>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name={`${shiftFieldName}.end_time`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className="field shiftTime">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  disabled={
                    isValidEditableTime && bookingRules?.third_rail_fields_hours
                  }
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(endTime)}
                  onChange={(e) => {
                    if (!e) return;
                    const dayJsDate = createDayjsObject(
                      moment(endTime),
                      e.hour(),
                      e.minute()
                    );
                    setValue(`${shiftFieldName}.end_time`, dayJsDate);
                    field.onChange(e);
                  }}
                  className="w-100 shift"
                  label="End Time*"
                />
              </LocalizationProvider>
            </div>
            {(customErrors?.[`${shiftFieldName}.end_time`] ||
              formErrors?.shifts?.[shiftIndex]?.end_time) && (
              <div className="error">
                <p>
                  {customErrors?.[`${shiftFieldName}.end_time`] ||
                    formErrors?.shifts[shiftIndex]?.end_time?.message}
                </p>
              </div>
            )}
          </div>
        )}
      />
      {fields.map((proj, index) => {
        return (
          <Projection
            key={proj.id}
            addProjection={addProjection}
            removeProjection={removeProjection}
            shiftFieldName={shiftFieldName}
            projectionIndex={index}
            shiftIndex={shiftIndex}
            watch={watch}
            control={control}
            setValue={setValue}
            procedureTypesOptions={procedureTypesOptions.filter(
              (projection) =>
                !allProjections.includes(projection?.id?.toString())
            )}
            OEF={OEF}
            projectionIndexesLength={fields.length}
            totalHoursOfShift={totalHoursOfShift(startTime, endTime)}
            triggerOEF={handleOEF}
            formErrors={formErrors}
            collectionOperation={collectionOperation}
            sessionDate={sessionDate}
            isOverrideUser={isOverrideUser}
            isValidEditableTime={isValidEditableTime}
            bookingRules={bookingRules}
            setShareStaffModal={setShareStaffModal}
            setStaffShareRequired={setStaffShareRequired}
            availableStaff={availableStaff}
            resourceShareData={resourceShareData}
            setResourceShareData={setResourceShareData}
            setStaffShareValue={setStaffShareValue}
            customErrors={customErrors}
            setCustomErrors={setCustomErrors}
            sessionId={sessionId}
            isCopy={isCopy}
          />
        );
      })}
      <h4>Resources*</h4>
      <div className="form-field">
        <Controller
          name={`${shiftFieldName}.devices`}
          control={control}
          render={({ field }) => {
            return (
              <GlobalMultiSelect
                label="Devices"
                data={devicesOptions}
                selectedOptions={devices || []}
                error={formErrors?.shifts?.[shiftIndex]?.devices?.message || ''}
                onChange={handleDevicesChange}
                onSelectAll={handleDevicesChangeAll}
                onBlur={() => {}}
                isquantity={false}
                quantity={0}
                disabled={false}
              />
            );
          }}
        />
      </div>
      <div className="w-100">
        <Controller
          name={`${shiftFieldName}.staff_break`}
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormCheckbox
              name={field.name}
              displayName="Staff Break"
              checked={field?.value}
              onChange={(e) => {
                field?.onChange(e);
                setValue(`${shiftFieldName}.break_start_time`, null);
                setValue(`${shiftFieldName}.break_end_time`, null);
                setValue(`${shiftFieldName}.reduce_slots`, false);
                setValue(`${shiftFieldName}.appointment_reduction`, 0);
              }}
            />
          )}
        />
      </div>
      {staffBreak ? (
        <>
          <Controller
            name={`${shiftFieldName}.break_start_time`}
            control={control}
            render={({ field }) => (
              <div className="form-field daily-hour">
                <div className="field shiftTime">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MyTimePicker
                      disabled={
                        isValidEditableTime &&
                        bookingRules?.third_rail_fields_hours
                      }
                      classes={{ root: 'dsd' }}
                      valueType="time"
                      value={dayjs(staffBreakStart)}
                      onChange={(e) => {
                        const dayJsDate = createDayjsObject(
                          moment(staffBreakStart),
                          e.hour(),
                          e.minute()
                        );
                        setValue(
                          `${shiftFieldName}.break_start_time`,
                          dayJsDate
                        );
                        field.onChange(e);
                      }}
                      className="w-100 shift"
                      label="Start Time*"
                    />
                  </LocalizationProvider>
                </div>
                {customErrors?.[`${shiftFieldName}.break_start_time`] && (
                  <div className="error">
                    <p>
                      {customErrors?.[`${shiftFieldName}.break_start_time`]}
                    </p>
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name={`${shiftFieldName}.break_end_time`}
            control={control}
            render={({ field }) => (
              <div className="form-field daily-hour">
                <div className="field shiftTime">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MyTimePicker
                      disabled={
                        isValidEditableTime &&
                        bookingRules?.third_rail_fields_hours
                      }
                      classes={{ root: 'dsd' }}
                      valueType="time"
                      value={dayjs(staffBreakEnd)}
                      onChange={(e) => {
                        const dayJsDate = createDayjsObject(
                          moment(staffBreakEnd),
                          e.hour(),
                          e.minute()
                        );
                        setValue(`${shiftFieldName}.break_end_time`, dayJsDate);
                        field.onChange(e);
                      }}
                      className="w-100 shift"
                      label="End Time*"
                    />
                  </LocalizationProvider>
                </div>
                {customErrors?.[`${shiftFieldName}.break_end_time`] && (
                  <div className="error">
                    <p>{customErrors?.[`${shiftFieldName}.break_end_time`]}</p>
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name={`${shiftFieldName}.reduce_slots`}
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormCheckbox
                name={field.name}
                displayName="Reduce Slots"
                classes={{ root: 'mt-2' }}
                checked={field?.value}
                onChange={(e) => {
                  field?.onChange(e);
                }}
              />
            )}
          />
          {reduceSlots ? (
            <Controller
              name={`${shiftFieldName}.appointment_reduction`}
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <>
                  <div className="form-field">
                    <div className="field">
                      <span className="text-sm">
                        Appointment Reduction{' '}
                        {`(${
                          appointmentReduction ? appointmentReduction : 0
                        }%)`}{' '}
                      </span>
                      <div className="d-flex align-items-center">
                        <span className="text-sm me-1">0%</span>
                        <input
                          type="range"
                          className={`form-range ${styles.range}`}
                          min="0"
                          max="100"
                          step={reductionStep}
                          value={field?.value ? field?.value : 0}
                          onChange={(e) =>
                            setValue(
                              `${shiftFieldName}.appointment_reduction`,
                              e.target.value
                            )
                          }
                        />
                        <span className="text-sm ms-1">100%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            />
          ) : (
            <div className="w-50"></div>
          )}
        </>
      ) : null}
      <FormInput
        showLabel={true}
        displayName={`OEF (${viewAs})`}
        value={
          viewAs === 'Products'
            ? shiftOEF.oef_products
            : shiftOEF.oef_procedures
        }
        required={false}
        disabled={true}
      />
      <div className="col-md-6 text-end">
        <p className="text-right mt-2" style={{ color: '#005375' }}>
          <button
            type="button"
            className="bg-body border-0 text-primary"
            onClick={handleViewAs}
          >
            View As {viewAs === 'Procedures' ? 'Products' : 'Procedures'}
          </button>
        </p>
      </div>{' '}
      <p className="w-100 d-flex align-items-center">
        <span>
          <ToolTip
            text={
              'OEF range (minimum and maximum OEF ) is fetched from industry category based on selected account from session section.'
            }
          />
        </span>
        <span className="ps-2">
          {viewAs} {handleSumOfProjections()} | Slots {totalSlots}
        </span>
      </p>
      <div className="w-100 text-right">
        {shiftIndexesLength === 1 ? (
          <button
            type="button"
            className="btn btn-primary right-btn btn-md"
            onClick={addShift}
          >
            Add Shift
          </button>
        ) : shiftIndex === shiftIndexesLength - 1 ? (
          <>
            <button
              onClick={removeShift(shiftIndex)}
              type="button"
              className="btn btn-danger right-btn btn-md"
            >
              Remove Shift
            </button>
            <button
              type="button"
              className="btn btn-primary right-btn btn-md"
              onClick={addShift}
            >
              Add Shift
            </button>
          </>
        ) : (
          <button
            onClick={removeShift(shiftIndex)}
            type="button"
            className="btn btn-danger right-btn btn-md"
          >
            Remove Shift
          </button>
        )}
      </div>
      {shareStaffModal ? (
        <ShareStaffModal
          setModal={setShareStaffModal}
          modal={shareStaffModal}
          shift={currentShift}
          staffShareRequired={staffShareRequired}
          setShareStaffSearch={setShareStaffSearch}
          shareStaffSearch={shareStaffSearch}
          shareStaffData={shareStaffData}
          resourceShareData={[]}
          setResourceShareData={([data]) => {
            setStaffShareValue({ ...staffShareValue, resourceShare: data });
          }}
          staffShareValue={staffShareValue}
          setShifts={() => setConfirmation(true)}
          shifts={[]}
          driveDate={moment(sessionDate).format('MM-DD-YYYY')}
          collectionOperationId={collectionOperation?.id}
        />
      ) : null}
      {confirmaton ? (
        <section
          className={`popup full-section ${confirmaton ? 'active' : ''}`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={ConfirmIcon} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Confirmation</h3>
              <p>{staffShareValue?.resourceShare?.description}</p>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setConfirmation(false);
                  }}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResourceShareData}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
