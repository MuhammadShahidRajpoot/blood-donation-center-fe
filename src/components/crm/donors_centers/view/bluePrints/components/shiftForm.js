import React, { useEffect, useMemo, useState } from 'react';
import FormInput from '../../../../../common/form/FormInput';
import FormCheckbox from '../../../../../common/form/FormCheckBox';
import { Controller } from 'react-hook-form';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import 'rc-time-picker/assets/index.css';
import ToolTip from '../../../../../common/tooltip';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MyTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { CalculateSlots } from '../../../../../operations-center/operations/drives/create/shift/calculate_slots';
import { addRemoveDevices } from '../../../../../operations-center/operations/drives/create/helpers/index';
import ProjectionForm from './projectionForm';

const ShiftForm = ({
  shift,
  index,
  shiftIndexesLength,
  control,
  setShifts,
  shifts,
  errors,
  formErrors,
  shiftDevicesOptions,
  procedureTypesList,
  procedureProducts,
  allowAppointmentAtShiftEndTime,
  maximumOef,
  minimumOef,
  shiftSlots,
  setShiftSlots,
  staffSetupShiftOptions,
  setStaffSetupShiftOptions,
}) => {
  const [disableReduction, setDisableReduction] = useState(true);
  const [startShiftTimeToolTip] = useState('');
  const [endShiftTimeToolTip] = useState('');
  const [reductionStep, setReductionStep] = useState('0');
  const [viewAs, setViewAs] = useState('Products');
  const [totalSlots, setTotalSlots] = useState(0);
  const [endTimeDisabled, setEndTimeDisabled] = useState(true);
  const [staffBreakendTimeDisabled, setStaffBreakendTimeDisabled] =
    useState(true);

  const [sumProducts, setSumProducts] = useState(0);
  const [sumProcedures, setSumProcedures] = useState(0);
  const [oefProducts, setOEFProducts] = useState(0);
  const [oefProcedures, setOEFProdures] = useState(0);

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
    allowAppointmentAtShiftEndTime,
  ]);

  useEffect(() => {
    let sumOfSlots = 0;
    Object.values(shiftSlots)?.[index]?.map((slotItem) => {
      sumOfSlots += slotItem?.items?.length;
    });
    setTotalSlots(sumOfSlots);
  }, [shiftSlots]);

  const selectUnselectAllDevices = (i, checked, data) => {
    const output = shifts.map((item, index) =>
      i === index
        ? {
            ...item,
            devices: checked ? [] : data,
          }
        : item
    );
    setShifts([...output]);
  };

  const removeNewShift = (index) => {
    setShifts((prev) => {
      return prev.filter((s, i) => i !== index);
    });
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

  useEffect(() => {
    let sumProducts = 0;
    let sumProcedures = 0;
    shift?.projections?.map((item) => {
      sumProducts += +item?.product?.quantity || 0;
      sumProcedures += +item?.procedure?.quantity || 0;
    });
    setSumProcedures(sumProcedures);
    setSumProducts(sumProducts);
  }, [shift.projections]);

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
    const oefProducts = productHoursRation / Math.ceil(sumStaff);
    const oefProcedures = procedureHoursRation / Math.ceil(sumStaff);
    setOEFProducts(
      isNaN(oefProducts) || sumStaff == 0 ? 0 : oefProducts.toFixed(2)
    );
    setOEFProdures(
      isNaN(oefProcedures) || sumStaff == 0 ? 0 : oefProcedures.toFixed(2)
    );
  };

  useEffect(() => {
    getOEFValue();
  }, [
    sumProcedures,
    sumProducts,
    shift.startTime,
    shift.endTime,
    shift.projections,
  ]);
  useEffect(() => {
    if (!isNaN(reductionStep)) {
      setShifts((prev) => {
        return prev.map((i, j) =>
          j === index
            ? {
                ...i,
                reduction: reductionStep,
              }
            : i
        );
      });
    }
  }, [reductionStep]);

  return (
    <>
      <div className="formGroup shift-form" key={'shifts' + index}>
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
                      setEndTimeDisabled(false);
                      setShifts((prev) => {
                        return prev?.map((i, j) =>
                          j === index ? { ...i, startTime: e } : i
                        );
                      });
                      field.onChange(e);
                    }}
                    className="w-100 shift"
                    label="Start Time*"
                  />
                </LocalizationProvider>
              </div>

              {startShiftTimeToolTip !== '' && (
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
                    disabled={endTimeDisabled}
                    onChange={(e) => {
                      setShifts((prev) => {
                        return prev?.map((i, j) =>
                          j === index ? { ...i, endTime: e } : i
                        );
                      });
                      field.onChange(e);
                    }}
                    className="w-100 shift"
                    label="End Time*"
                  />
                </LocalizationProvider>
              </div>
              {endShiftTimeToolTip !== '' && (
                <ToolTip text={endShiftTimeToolTip} />
              )}
              {errors?.endTime && (
                <div className="error">
                  <div className="error">
                    <p>{errors?.endTime}</p>
                  </div>
                </div>
              )}
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
              minOef={minimumOef}
              maxOef={maximumOef}
              shiftHours={
                shift.endTime && shift.startTime
                  ? moment.duration(shift.endTime.diff(shift.startTime)).hours()
                  : 0
              }
              shifts={shifts}
            />
          );
        })}
        <div className="w-100">
          <p>Resources</p>
        </div>
        <div className="col-md-6">
          <Controller
            name="Devices"
            control={control}
            render={({ field }) => {
              return (
                <GlobalMultiSelect
                  data={shiftDevicesOptions}
                  selectedOptions={shift.devices}
                  error={errors?.devices}
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
              );
            }}
          />
        </div>
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
                classes={{ root: 'mt-2' }}
                onChange={(e) => {
                  setShifts((prev) => {
                    return prev.map((i, j) =>
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
        {shift?.staffBreak && (
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
                          setStaffBreakendTimeDisabled(false);
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index ? { ...i, breakStartTime: e } : i
                            );
                          });
                          field.onChange(e);
                        }}
                        className="w-100 shift"
                        label="Start Time*"
                      />
                    </LocalizationProvider>
                  </div>
                  {errors?.breakStartTime && (
                    <div className="error">
                      <div className="error">
                        <p>{errors?.breakStartTime}</p>
                      </div>
                    </div>
                  )}
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
                        disabled={staffBreakendTimeDisabled}
                        onChange={(e) => {
                          setShifts((prev) => {
                            return prev?.map((i, j) =>
                              j === index ? { ...i, breakEndTime: e } : i
                            );
                          });
                          field.onChange(e);
                        }}
                        className="w-100 shift"
                        label="End Time*"
                      />
                    </LocalizationProvider>
                  </div>
                  {errors?.breakEndTime && (
                    <div className="error">
                      <div className="error">
                        <p>{errors?.breakEndTime}</p>
                      </div>
                    </div>
                  )}
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
                        e?.target?.checked
                          ? setDisableReduction(false)
                          : setDisableReduction(true);
                        setShifts((prev) => {
                          return prev.map((i, j) =>
                            j === index
                              ? {
                                  ...i,
                                  reduceSlot: e.target.checked,
                                }
                              : i
                          );
                        });
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
                  Appointment Reduction (
                  {!disableReduction
                    ? isNaN(shift.reduction)
                      ? 0
                      : shift.reduction
                    : 0}
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
                  disabled={disableReduction}
                  value={!disableReduction ? shift.reduction : 0}
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
              value={viewAs == 'Products' ? oefProducts : oefProcedures}
              required={false}
              disabled={true}
            />
          )}
        />
        <div className="col-md-6 text-right">
          <button
            className="btn btn-md btn-link p-0 editBtn text-right view-pro"
            color="primary"
            type="button"
            onClick={() => {
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
                'OEF range (minimum and maximum OEF ) is fetched from industry category based on Donor Center.'
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
    </>
  );
};

export default ShiftForm;
