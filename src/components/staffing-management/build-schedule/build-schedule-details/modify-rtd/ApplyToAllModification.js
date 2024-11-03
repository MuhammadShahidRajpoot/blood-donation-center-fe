import React, { useEffect, useState } from 'react';
import Styles from './index.module.scss';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { styled } from '@mui/material';
import ToolTip from '../../../../common/tooltip';
import {
  recalculateClockInForObject,
  recalculateClockOutForObject,
  recalculateTotalHours,
  convertTo12HourFormat,
  convertTo24HourFormat,
  setTimeFormat,
} from './helper-functions';
const ApplyToAllModification = ({
  applyToAllData,
  setApplyToAllData,
  setFieldsChanged,
  fieldsChanged,
  setIndividualData,
}) => {
  const [editedData, setEditedData] = useState(applyToAllData);

  useEffect(() => {
    if (!applyToAllData) {
      const emptyObj = {
        lead_time: '',
        travel_to_time: '',
        setup_time: '',
        breakdown_time: '',
        travel_from_time: '',
        wrapup_time: '',
        shift_start_time: '',
        shift_end_time: '',
        clock_in_time: '',
        clock_out_time: '',
        total_hours: '',
      };
      setEditedData(emptyObj);
    }
  }, []);

  const checkChangedField = (field, value) => {
    // in apply to all, it's always '' initially
    if (value === '') {
      // nothing was updated
      setFieldsChanged((prevArray) => {
        if (!Array.isArray(prevArray)) {
          prevArray = [];
        }

        // Map through prevArray and update field in all objects to the specified value
        const updatedArray = prevArray.map((obj) => ({
          ...obj,
          [field]: { value: false, modified_from: 3 },
        }));

        return updatedArray;
      });
    } else {
      setFieldsChanged((prevArray) => {
        if (!Array.isArray(prevArray)) {
          prevArray = [];
        }

        // Map through prevArray and update field in all objects to the specified value
        const updatedArray = prevArray.map((obj) => ({
          ...obj,
          [field]: { value: true, modified_from: 3 },
        }));

        return updatedArray;
      });
    }
  };

  const setNewTimeValue = (fieldEdited, value) => {
    // value is in dayjs format
    const formattedTime = convertTo12HourFormat(value?.format('HH:mm'));
    checkChangedField(fieldEdited, formattedTime);
    handleEdit(fieldEdited, formattedTime);

    // only if all fields  have been edited, calculate clock in, clock out and total hours
    if (areAllFieldsSet()) {
      const clockInTime = recalculateClockInForObject({
        ...editedData,
        [fieldEdited]: formattedTime,
      });
      const clockOutTime = recalculateClockOutForObject({
        ...editedData,
        [fieldEdited]: formattedTime,
      });
      const totalHours = recalculateTotalHours(clockInTime, clockOutTime);
      handleEdit('clock_in_time', clockInTime);
      handleEdit('clock_out_time', clockOutTime);
      handleEdit('total_hours', Number(totalHours));
    }
  };

  // Removes the border in imported TimePicker
  const StyledTimePicker = styled(TimePicker)({
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  });

  const handleEdit = (field, value) => {
    setEditedData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        [field]: value,
      };
      return updatedData;
    });
    /*
    individualData object is used to save the user's changes.
    Even when user switches between tabs / modification types,
    the changes persist on the page.
    Every change in apply to all page, should reflect in
    individual page as well.
    */
    setIndividualData((prevData) => {
      const updatedData = [...prevData];
      for (let index = 0; index < updatedData.length; index++) {
        updatedData[index] = { ...updatedData[index], [field]: value };
        // recalculate these times for every individual
        const clockIn = recalculateClockInForObject(updatedData[index]);
        const clockOut = recalculateClockOutForObject(updatedData[index]);
        const totalHours = recalculateTotalHours(clockIn, clockOut);
        updatedData[index] = {
          ...updatedData[index],
          clock_in_time: clockIn,
          clock_out_time: clockOut,
          total_hours: totalHours,
        };
      }
      return updatedData;
    });
    /* 
    applyToAllData object is used to save the user's changes.
    Even when user switches between tabs / modification types,
    the changes persist on the page.
    */
    setApplyToAllData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        [field]: value,
      };
      return updatedData;
    });
  };

  const handleBlur = (field, currentValue) => {
    if (currentValue === String(editedData[field])) {
      // nothing was edited
      return;
    }
    currentValue = Number(currentValue);
    checkChangedField(field, currentValue);
    if (!currentValue) {
      handleEdit(field, 0);
    } else {
      handleEdit(field, currentValue);
    }
    if (areAllFieldsSet()) {
      // only if all fields  have been edited, calculate clock in, clock out and total hours
      const clockInTime = recalculateClockInForObject({
        ...editedData,
        [field]: currentValue,
      });
      const clockOutTime = recalculateClockOutForObject({
        ...editedData,
        [field]: currentValue,
      });
      const totalHours = recalculateTotalHours(clockInTime, clockOutTime);
      handleEdit('clock_in_time', clockInTime);
      handleEdit('clock_out_time', clockOutTime);
      handleEdit('total_hours', Number(totalHours));
    }
  };

  const isFieldEditable = (field) => {
    if (fieldsChanged) {
      return !fieldsChanged.some(
        (fieldChanged) =>
          fieldChanged[field].value && fieldChanged[field].modified_from !== 3
      );
    }
  };

  const areAllFieldsSet = () => {
    const obj = fieldsChanged[0];
    let counter = 0;
    for (const key of Object.keys(obj)) {
      if (obj[key].value === true && obj[key].modified_from === 3) {
        ++counter;
      }
    }
    return counter >= 7;
  };

  const handleChange = (value, field) => {
    if (!value) {
      // field was cleared, clear it from fields changed & data
      setFieldsChanged((prevArray) => {
        if (!Array.isArray(prevArray)) {
          prevArray = [];
        }

        // Map through prevArray and update field in all objects to the specified value
        const updatedArray = prevArray.map((obj) => ({
          ...obj,
          [field]: { value: false, modified_from: 3 },
        }));

        return updatedArray;
      });

      setEditedData((prevData) => {
        if (!prevData) {
          prevData = {};
        }
        const updatedData = {
          ...prevData,
          [field]: '',
        };
        return updatedData;
      });
    }
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div className={Styles.editContainer}>
      <h5 className={Styles.editTitle}>
        Edit Role Time Details{' '}
        <ToolTip
          text={
            'All modifications using this tool will overwrite any previous modifications.'
          }
          isOperationListTooltip={true}
        />
      </h5>
      {editedData && (
        <React.Fragment>
          <table className={Styles.byRoleTable}>
            <thead>
              <tr>
                <th
                  className={`${
                    isFieldEditable('lead_time') && Styles.editableCol
                  }`}
                >
                  <p>Lead</p>
                  <span
                    contentEditable={isFieldEditable('lead_time')}
                    onBlur={(e) => handleBlur('lead_time', e.target.innerText)}
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.lead_time}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('travel_to_time') && Styles.editableCol
                  }`}
                >
                  <p>Travel To</p>
                  <span
                    contentEditable={isFieldEditable('travel_to_time')}
                    onBlur={(e) =>
                      handleBlur('travel_to_time', e.target.innerText)
                    }
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.travel_to_time}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('setup_time') && Styles.editableCol
                  }`}
                >
                  <p>Setup</p>
                  <span
                    contentEditable={isFieldEditable('setup_time')}
                    onBlur={(e) => handleBlur('setup_time', e.target.innerText)}
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.setup_time}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('breakdown_time') && Styles.editableCol
                  }`}
                >
                  <p>Breakdown</p>
                  <span
                    contentEditable={isFieldEditable('breakdown_time')}
                    onBlur={(e) =>
                      handleBlur('breakdown_time', e.target.innerText)
                    }
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.breakdown_time}
                  </span>
                </th>
              </tr>
              <tr>
                <th
                  className={`${
                    isFieldEditable('travel_from_time') && Styles.editableCol
                  }`}
                >
                  <p>Travel From</p>
                  <span
                    contentEditable={isFieldEditable('travel_from_time')}
                    onBlur={(e) =>
                      handleBlur('travel_from_time', e.target.innerText)
                    }
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.travel_from_time}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('wrapup_time') && Styles.editableCol
                  }`}
                >
                  <p>Wrap Up</p>
                  <span
                    contentEditable={isFieldEditable('wrapup_time')}
                    onBlur={(e) =>
                      handleBlur('wrapup_time', e.target.innerText)
                    }
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.wrapup_time}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('shift_start_time') && Styles.editableCol
                  }`}
                >
                  <p>Shift Start</p>
                  <span contentEditable={false}>
                    <StyledTimePicker
                      className={Styles.timePicker}
                      value={setTimeFormat(editedData.shift_start_time)}
                      onAccept={(newValue) =>
                        setNewTimeValue('shift_start_time', newValue)
                      }
                      onKeyDown={(event) => {
                        event.preventDefault();
                      }}
                      onChange={(newValue) =>
                        handleChange(newValue, 'shift_start_time')
                      }
                      timeSteps={{ minutes: 1 }}
                      closeOnSelect={false}
                      disabled={!isFieldEditable('shift_start_time')}
                      slotProps={{ field: { clearable: true, readOnly: true } }}
                      maxTime={dayjs().set(
                        'hour',
                        Number(
                          convertTo24HourFormat(
                            editedData.shift_end_time
                          )?.substring(0, 2)
                        )
                      )}
                    />
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('shift_end_time') && Styles.editableCol
                  }`}
                >
                  <p>Shift End</p>
                  <span contentEditable={false}>
                    <StyledTimePicker
                      className={Styles.timePicker}
                      value={setTimeFormat(editedData.shift_end_time)}
                      onAccept={(newValue) =>
                        setNewTimeValue('shift_end_time', newValue)
                      }
                      onChange={(newValue) =>
                        handleChange(newValue, 'shift_end_time')
                      }
                      timeSteps={{ minutes: 1 }}
                      closeOnSelect={false}
                      disabled={!isFieldEditable('shift_end_time')}
                      slotProps={{ field: { clearable: true, readOnly: true } }}
                      minTime={dayjs().set(
                        'hour',
                        Number(
                          convertTo24HourFormat(
                            editedData.shift_start_time
                          )?.substring(0, 2)
                        )
                      )}
                    />
                  </span>
                </th>
              </tr>
              <tr>
                <th>
                  <p>Clock In</p>
                  {editedData.clock_in_time}
                </th>
                <th>
                  <p>Clock Out</p>
                  {editedData.clock_out_time}
                </th>
                <th>
                  <p>Total Hours</p>
                  {editedData.total_hours}
                </th>
              </tr>
            </thead>
          </table>
        </React.Fragment>
      )}
    </div>
  );
};

export default ApplyToAllModification;
