import React, { useEffect, useState } from 'react';
import SelectDropdown from '../../../common/selectDropdown';
import SvgComponent from '../../../common/SvgComponent';
import FormCheckbox from '../../../common/form/FormCheckBox';
import FormInput from '../../../common/form/FormInput';
import { Controller, useFieldArray } from 'react-hook-form';
import styles from './index.module.scss';

import GlobalMultiSelect from '../../../common/GlobalMultiSelect';
import 'rc-time-picker/assets/index.css';
import { API } from '../../../../api/api-routes';
import { toast } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MyTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import ToolTip from '../../../common/tooltip';
// import NceTimerInput from './NceTimerInput';
// NceTi

const NceShiftForm = ({
  shift,
  setShift,
  setShifts,
  currentNumber,
  shifts,
  handleRemoveShift,
  control,
  removeShift,
  initialTime,
  append,
  setValue,
  initialShift,
  getValues,
  errors,
  dateMantainance,
  collectionOperation,
  editApiToggle,
}) => {
  const [showBreakTime, setShowBreakTime] = useState([]);
  useEffect(() => {
    if (shifts?.length) {
      const arrayCheck = [];
      shifts?.map((sh) => {
        arrayCheck?.push(sh?.showBreakTime);
      });
      setShowBreakTime(arrayCheck);
    }
  }, []);
  const [contactRoleOption, setContactRoleOption] = useState([]);
  const [vehiclesOption, setVehiclesOption] = useState([]);
  const [vehiclesOptionList, setVehiclesOptionList] = useState([]);
  const [devicesOptionList, setDevicesOptionList] = useState([]);
  const [startTimeCheck, setStartTimeCheck] = useState(null);
  const [deviceOption, setDeviceOption] = useState([]);
  const [startShiftTimeToolTip] = useState('');
  const [endShiftTimeToolTip] = useState('');

  const { append: appendRoles, remove: removeRoles } = useFieldArray({
    control,
    name: `shifts[${currentNumber}].roles`,
  });

  useEffect(() => {
    if (collectionOperation?.length) {
      fetchContactRole();
      fetchVehicles();
      fetchDevices();
    }
  }, [collectionOperation]);

  const fetchContactRole = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.nonCollectionProfiles.getNcpRole(
        token,
        JSON.stringify(collectionOperation)
      );
      if (data?.data) {
        const contactRoleOptionData = data?.data?.map((item) => ({
          label: item?.name,
          value: item?.id,
        }));

        setContactRoleOption(contactRoleOptionData);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.nonCollectionProfiles.getNcpVehiclesType(
        token,
        JSON.stringify(collectionOperation)
      );
      if (data?.data) {
        // const vehiclesOptionData = data?.data?.map((item) => {
        //   return {
        //     name: item?.name,
        //     id: item?.id,
        //   };
        // });
        setVehiclesOption(data?.data);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  useEffect(() => {
    const mantainanceVehicle = () => {
      const dateMant = new Date(dateMantainance);
      const startTime = new Date(startTimeCheck ? startTimeCheck : initialTime);

      const filteredData = vehiclesOption?.filter((item) => {
        if (item?.vm_end_date_time) {
          const itemDate = new Date(item?.vm_end_date_time);
          if (
            itemDate.getFullYear() <= dateMant.getFullYear() &&
            itemDate.getMonth() <= dateMant.getMonth() &&
            itemDate.getDate() <= dateMant.getDate()
          ) {
            return true;
          } else if (
            itemDate.getDate() === dateMant.getDate() &&
            itemDate.getHours() <= startTime.getHours()
          ) {
            return true;
          } else if (
            itemDate.getDate() === dateMant.getDate() &&
            itemDate.getMinutes() < startTime.getMinutes()
          ) {
            return true;
          }
          return false;
        }
        return item;
      });

      const filteredVehicleData = filteredData?.map((item) => ({
        id: item?.id,
        name: item?.name,
      }));

      setVehiclesOptionList(filteredVehicleData);
    };

    const mantainanceDevice = () => {
      const dateMant = new Date(dateMantainance);
      const startTime = new Date(startTimeCheck);

      const filteredData = deviceOption?.filter((item) => {
        if (item?.vm_end_date_time) {
          const itemDate = new Date(item?.vm_end_date_time);
          if (
            itemDate.getFullYear() <= dateMant.getFullYear() &&
            itemDate.getMonth() <= dateMant.getMonth() &&
            itemDate.getDate() <= dateMant.getDate()
          ) {
            return true;
          } else if (
            itemDate.getDate() === dateMant.getDate() &&
            itemDate.getHours() <= startTime.getHours()
          ) {
            return true;
          } else if (
            itemDate.getDate() === dateMant.getDate() &&
            itemDate.getMinutes() < startTime.getMinutes()
          ) {
            return true;
          }
          return false;
        }
        return item;
      });

      const filteredDeviceData = filteredData?.map((item) => ({
        id: item?.id,
        name: item?.name,
      }));
      setDevicesOptionList(filteredDeviceData);
    };

    if ((startTimeCheck || initialTime) && vehiclesOption) {
      mantainanceVehicle();
    }
    if ((startTimeCheck || initialTime) && deviceOption) {
      mantainanceDevice();
    }
  }, [
    startTimeCheck,
    editApiToggle,
    initialTime,
    vehiclesOption?.length,
    deviceOption?.length,
  ]);
  const fetchDevices = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.nonCollectionProfiles.getNcpDevicesType(
        token,
        JSON.stringify(collectionOperation)
      );
      if (data?.data) {
        // const deviceOptionData = data?.data?.map((item) => {
        //   return {
        //     name: item?.name,
        //     id: item?.id,
        //   };
        // });
        setDeviceOption(data?.data);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const resetProjections = (currentNumber, index) => {
    setValue(`shifts[${currentNumber}].roles[${index}].role`, null);
    setValue(`shifts[${currentNumber}].roles[${index}].qty`, '');
  };
  return (
    <div className="formGroup shift-form">
      <h5>
        Schedule Shift {currentNumber + 1}
        <span className="shift-count">{currentNumber + 1}</span>
      </h5>

      <Controller
        name={`shifts[${currentNumber}].startTime`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field shiftTime`}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(field?.value)}
                  onChange={(e) => {
                    field.onChange(e);
                    setStartTimeCheck(e);
                  }}
                  className="w-100 shift"
                  label="Start Time*"
                />
              </LocalizationProvider>
            </div>
            {startShiftTimeToolTip !== '' && (
              <ToolTip text={startShiftTimeToolTip} />
            )}
            {errors?.shifts?.[currentNumber]?.startTime?.message && (
              <div className="error">
                <div className="error">
                  <p>{errors?.shifts?.[currentNumber]?.startTime?.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name={`shifts[${currentNumber}].endTime`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field shiftTime`}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(field?.value)}
                  onChange={(e) => {
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
            {errors?.shifts?.[currentNumber]?.endTime?.message && (
              <div className="error">
                <div className="error">
                  <p>{errors?.shifts?.[currentNumber]?.endTime?.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      {shift?.roles?.map((dataRole, index) => (
        <>
          <Controller
            name={`shifts[${currentNumber}].roles[${index}].role`}
            control={control}
            defaultValue={dataRole?.role || ''}
            render={({ field }) => (
              <SelectDropdown
                placeholder={'Role*'}
                defaultValue={field.value}
                selectedValue={field.value}
                onBlur={field.onBlur}
                removeDivider
                options={contactRoleOption}
                showLabel
                onChange={(e) => field.onChange(e)}
                error={
                  errors?.shifts?.[currentNumber]?.roles?.[index]?.role?.message
                }
              />
            )}
          />
          <Controller
            name={`shifts[${currentNumber}].roles[${index}].qty`}
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <FormInput
                name="qty"
                displayName="Qty"
                value={field.value}
                handleBlur={field.onBlur}
                onChange={(e) => field.onChange(e)}
                required
                error={
                  errors?.shifts?.[currentNumber]?.roles?.[index]?.qty?.message
                }
              />
            )}
          />
          <div className="d-flex w-100 justify-content-end align-items-end">
            <p className="res-add-btn">
              <button
                onClick={() => {
                  resetProjections(currentNumber, index);
                }}
                type="button"
              >
                <SvgComponent name={'ResetIcon'} />
              </button>

              {shift?.roles?.length > 1 && (
                <button
                  type="button"
                  className={`bg-transparent ${styles.plusNon}`}
                  onClick={() => {
                    if (shift?.roles?.length > 1) {
                      const getVal = getValues()?.shifts[
                        currentNumber
                      ]?.roles?.filter(
                        (item, rolesIndex) => rolesIndex !== index
                      );
                      getVal?.forEach((item, ind) => {
                        setValue(
                          `shifts[${currentNumber}].roles[${ind}].qty`,
                          getVal[ind]?.qty
                        );
                        setValue(
                          `shifts[${currentNumber}].roles[${ind}].role`,
                          getVal[ind]?.role
                        );
                      });
                      setShift({
                        ...shift,
                        roles: getVal,
                      });
                      removeRoles(shift?.roles?.length - 1);
                    }
                  }}
                >
                  {<SvgComponent name={'TagsMinusIcon'} />}
                </button>
              )}

              <button
                type="button"
                className={`bg-transparent ${styles.plusNon}`}
                onClick={() => {
                  setShift({
                    ...shift,
                    roles: [...shift.roles, { role: null, qty: '' }],
                  });
                  appendRoles({ role: null, qty: '' });
                }}
              >
                <SvgComponent name={'TagsPlusIcon'} />
              </button>
            </p>
          </div>
        </>
      ))}

      <div className="form-field">
        <div className="field">
          <Controller
            name={`shifts[${currentNumber}].vehicles_ids`}
            control={control}
            render={({ field }) => (
              <GlobalMultiSelect
                label="Vehicle Setup*"
                data={vehiclesOptionList}
                selectedOptions={field.value}
                onChange={(selectedItems) => {
                  const currentValue = field.value || [];
                  if (
                    currentValue.some((text) => text.id === selectedItems.id)
                  ) {
                    const updatedValue = field.value.filter(
                      (item) => item.id !== selectedItems.id
                    );
                    field.onChange(updatedValue);
                  } else {
                    field.onChange([...currentValue, selectedItems]);
                  }
                }}
                onSelectAll={(e) => field.onChange(e)}
                onBlur={field.onBlur}
                error={errors?.shifts?.[currentNumber]?.vehicles_ids?.message}
              />
            )}
          />
        </div>
      </div>
      <div className="form-field">
        <div className="field">
          <Controller
            name={`shifts[${currentNumber}].device_ids`}
            control={control}
            render={({ field }) => (
              <GlobalMultiSelect
                label="Device Setup*"
                data={devicesOptionList}
                selectedOptions={field.value}
                onChange={(selectedItems) => {
                  const currentValue = field.value || [];
                  if (
                    currentValue.some((text) => text.id === selectedItems.id)
                  ) {
                    const updatedValue = field.value.filter(
                      (item) => item.id !== selectedItems.id
                    );
                    field.onChange(updatedValue);
                  } else {
                    field.onChange([...currentValue, selectedItems]);
                  }
                }}
                onSelectAll={(e) => field.onChange(e)}
                onBlur={field.onBlur}
                error={errors?.shifts?.[currentNumber]?.device_ids?.message}
              />
            )}
          />
        </div>
      </div>
      <div className="w-100">
        <Controller
          name={`shifts[${currentNumber}].showBreakTime`}
          control={control}
          render={({ field }) => (
            <FormCheckbox
              displayName="Staff Break"
              checked={field.value}
              classes={{ root: 'w-25' }}
              onChange={(e) => {
                field.onChange(e.target.checked);
                const checkbox = [...showBreakTime];
                checkbox[currentNumber] = e.target.checked;
                setShowBreakTime(checkbox);
                if (!e.target.checked) {
                  setValue(`shifts[${currentNumber}].breakStartTime`, '');
                  setValue(`shifts[${currentNumber}].breakEndTime`, '');
                }
              }}
            />
          )}
        />
      </div>
      {getValues()?.shifts[currentNumber]?.showBreakTime && (
        <>
          <Controller
            name={`shifts[${currentNumber}].breakStartTime`}
            control={control}
            defaultValue={shifts[currentNumber]?.shiftBreakStartTime || ''}
            render={({ field }) => (
              <div className="form-field">
                <div className={`field shiftTime`}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MyTimePicker
                      classes={{ root: 'dsd' }}
                      valueType="time"
                      value={dayjs(field?.value)}
                      onChange={(e) => {
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
                {errors?.shifts?.[currentNumber]?.breakStartTime?.message && (
                  <div className="error">
                    <div className="error">
                      <p>
                        {
                          errors?.shifts?.[currentNumber]?.breakStartTime
                            ?.message
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name={`shifts[${currentNumber}].breakEndTime`}
            control={control}
            defaultValue={shift?.shiftBreakEndTime || ''}
            render={({ field }) => (
              <div className="form-field">
                <div className={`field shiftTime`}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <MyTimePicker
                      classes={{ root: 'dsd' }}
                      valueType="time"
                      value={dayjs(field?.value)}
                      onChange={(e) => {
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
                {errors?.shifts?.[currentNumber]?.breakEndTime?.message && (
                  <div className="error">
                    <div className="error">
                      <p>
                        {errors?.shifts?.[currentNumber]?.breakEndTime?.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </>
      )}

      <div className="w-100 mt-3 d-flex justify-content-end">
        {shifts?.length > 1 && (
          <button
            type="button"
            className={`btn btn-danger right-btn btn-md ${styles.addShift}`}
            onClick={() => {
              handleRemoveShift(currentNumber);
              removeShift(currentNumber);
            }}
          >
            Remove Shift
          </button>
        )}
        {shifts?.length === currentNumber + 1 && (
          <button
            type="button"
            className={`btn btn-primary ${styles.addShift}`}
            onClick={() => {
              setShifts((prevShifts) => [
                ...prevShifts,
                {
                  ...initialShift,
                  generatedId: Math.random().toString(36).substring(2),
                },
              ]);
              append(initialShift);
            }}
          >
            Add Shift
          </button>
        )}
      </div>
    </div>
  );
};
export default NceShiftForm;
