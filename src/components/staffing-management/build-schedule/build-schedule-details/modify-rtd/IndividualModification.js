import React, { useState } from 'react';
import Styles from './index.module.scss';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { styled } from '@mui/material';
import {
  recalculateTotalHours,
  convertTo12HourFormat,
  convertTo24HourFormat,
  setTimeFormat,
  recalculateClockInForObject,
  recalculateClockOutForObject,
} from './helper-functions';

const IndividualModification = ({
  individualData,
  setIndividualData,
  setFieldsChanged,
  fieldsChanged,
  initialData,
}) => {
  const [editedData, setEditedData] = useState(individualData);

  const handleEdit = (index, field, value) => {
    /* 
    This object is for this component only.
    */
    setEditedData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      return updatedData;
    });
    /* 
    individualData object is used to save the user's changes.
    Even when user switches between tabs / modification types,
    the changes persist on the page.
    */
    setIndividualData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [field]: value };
      return updatedData;
    });
  };

  const handleBlur = (index, field, currentValue, checkChange = true) => {
    if (currentValue === String(editedData[index][field])) {
      // nothing was edited
      return;
    }
    currentValue = Number(currentValue);
    // check which field was changed, to disable it in another component
    if (checkChange) {
      checkChangedField(index, field, currentValue);
    }
    let isClockInUpdated,
      isClockOutUpdated = false;
    let clockInTime = editedData[index].clock_in_time;
    let clockOutTime = editedData[index].clock_out_time;
    if (
      [
        'shift_start_time',
        'lead_time',
        'setup_time',
        'travel_to_time',
      ].includes(field)
    ) {
      isClockInUpdated = true;
      clockInTime = recalculateClockInForObject({
        ...editedData[index],
        [field]: currentValue,
      });
      handleEdit(index, 'clock_in_time', clockInTime);
    }
    if (
      [
        'shift_end_time',
        'breakdown_time',
        'travel_from_time',
        'wrapup_time',
      ].includes(field)
    ) {
      isClockOutUpdated = true;
      clockOutTime = recalculateClockOutForObject({
        ...editedData[index],
        [field]: currentValue,
      });
      handleEdit(index, 'clock_out_time', clockOutTime);
    }
    if (isClockInUpdated || isClockOutUpdated) {
      const totalHours = recalculateTotalHours(clockInTime, clockOutTime);
      handleEdit(index, 'total_hours', Number(totalHours));
    }
    if (!currentValue) {
      handleEdit(index, field, 0);
    } else {
      handleEdit(index, field, currentValue);
    }
  };
  const checkChangedField = (index, field, value) => {
    const roleName = individualData[index].role_name;
    if (Number(initialData[index][field]) === value) {
      // nothing was changed
      setFieldsChanged((prevArray) => {
        if (!Array.isArray(prevArray)) {
          prevArray = [];
        }
        const existingObjectIndex = prevArray.findIndex(
          (obj) => obj.role_name === roleName
        );
        if (existingObjectIndex !== -1) {
          // If it exists, update the field of the found object
          prevArray[existingObjectIndex][field] = {
            value: false,
            modified_from: 1,
          };
          return prevArray;
        }
      });
    } else {
      // change happened
      setFieldsChanged((prevArray) => {
        if (!Array.isArray(prevArray)) {
          prevArray = [];
        }
        const existingObjectIndex = prevArray.findIndex(
          (obj) => obj.role_name === roleName
        );
        if (existingObjectIndex !== -1) {
          // If it exists, update the field of the found object
          return prevArray.map((obj, index) =>
            index === existingObjectIndex
              ? { ...obj, [field]: { value: true, modified_from: 1 } }
              : obj
          );
        }
      });
    }
  };

  const isFieldEditable = (field, roleName) => {
    const matchingObject = fieldsChanged.find(
      (fieldChanged) => fieldChanged.role_name === roleName
    );

    // If matchingObject is found, check if the specified field is set to true
    if (
      matchingObject &&
      matchingObject[field].value &&
      matchingObject[field].modified_from !== 1
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Removes the border in imported TimePicker
  const StyledTimePicker = styled(TimePicker)({
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
      padding: 0,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      border: 'none',
      padding: 0,
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: 'none',
      padding: 0,
    },
  });

  const setNewTimeValue = (
    index,
    fieldEdited,
    value,
    checkForChange = true
  ) => {
    // value is in dayjs format
    const formattedTime = convertTo12HourFormat(value?.format('HH:mm'));
    if (checkForChange) {
      checkChangedField(index, fieldEdited, formattedTime);
    }
    handleEdit(index, fieldEdited, formattedTime);
    // calculate clock in, clock out and total hours
    const clockInTime = recalculateClockInForObject({
      ...editedData[index],
      [fieldEdited]: formattedTime,
    });
    const clockOutTime = recalculateClockOutForObject({
      ...editedData[index],
      [fieldEdited]: formattedTime,
    });
    const totalHours = recalculateTotalHours(clockInTime, clockOutTime);
    handleEdit(index, 'clock_in_time', clockInTime);
    handleEdit(index, 'clock_out_time', clockOutTime);
    handleEdit(index, 'total_hours', Number(totalHours));
  };

  const handleChange = (e) => {
    setTimeout(() => {
      // prevent typing more that 4 characters
      const maxLength = 4;
      let value = e.target.innerText.replace(/\D/g, '');

      if (value.length > maxLength) {
        // Get the current selection and cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const startOffset = range.startOffset;

        // Update the content with the trimmed value
        e.target.textContent = value.slice(0, maxLength);

        const newStartOffset =
          startOffset + Math.min(value.length - maxLength, 0);

        // Move the cursor to the correct position
        range.setStart(startContainer, newStartOffset);
        range.collapse(true);
        selection.removeAllRanges();
        if (range.startOffset < 5 || range.endOffset < 5) {
          selection.addRange(range);
        }
      }
    }, 0);
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.target.blur();
    }
  };
  return (
    <div className={Styles.editContainer}>
      <h5>Edit Role Time Details</h5>
      {editedData?.map(
        (row, index) =>
          row.staff_name &&
          row.staff_name !== '' && (
            <React.Fragment key={index}>
              <span className={Styles.staffName}>Staff Name: </span>{' '}
              <span className={Styles.staffNameValue}>{row.staff_name}</span>
              <table className={Styles.rtdTable}>
                <thead>
                  <tr>
                    <th>
                      <p>Role</p> {row.role_short_name}
                    </th>
                    <th
                      className={`${
                        isFieldEditable('lead_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Lead</p>
                      <span
                        contentEditable={isFieldEditable(
                          'lead_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(index, 'lead_time', e.target.innerText)
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.lead_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('travel_to_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Trv To</p>
                      <span
                        contentEditable={isFieldEditable(
                          'travel_to_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(
                            index,
                            'travel_to_time',
                            e.target.innerText
                          )
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.travel_to_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('setup_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Setup</p>
                      <span
                        contentEditable={isFieldEditable(
                          'setup_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(index, 'setup_time', e.target.innerText)
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.setup_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('breakdown_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Breakdown</p>
                      <span
                        contentEditable={isFieldEditable(
                          'breakdown_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(
                            index,
                            'breakdown_time',
                            e.target.innerText
                          )
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.breakdown_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('travel_from_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Trv From</p>
                      <span
                        contentEditable={isFieldEditable(
                          'travel_from_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(
                            index,
                            'travel_from_time',
                            e.target.innerText
                          )
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.travel_from_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('wrapup_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Wrap Up</p>
                      <span
                        contentEditable={isFieldEditable(
                          'wrapup_time',
                          row.role_name
                        )}
                        onBlur={(e) =>
                          handleBlur(index, 'wrapup_time', e.target.innerText)
                        }
                        onInput={(e) => handleChange(e)}
                        onKeyDown={handleEnter}
                        suppressContentEditableWarning
                      >
                        {row.wrapup_time || '0'}
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('shift_start_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Shift Start</p>
                      <span>
                        <StyledTimePicker
                          className={Styles.timePicker}
                          value={setTimeFormat(row.shift_start_time)}
                          onAccept={(newValue) =>
                            setNewTimeValue(index, 'shift_start_time', newValue)
                          }
                          slotProps={{ field: { readOnly: true } }}
                          timeSteps={{ minutes: 1 }}
                          disabled={
                            !isFieldEditable('shift_start_time', row.role_name)
                          }
                          skipDisabled={true}
                          closeOnSelect={false}
                          maxTime={
                            row.shift_end_time &&
                            dayjs()
                              .set(
                                'hour',
                                Number(
                                  convertTo24HourFormat(
                                    row.shift_end_time
                                  ).substring(0, 2)
                                )
                              )
                              .set(
                                'minute',
                                Number(
                                  convertTo24HourFormat(
                                    row.shift_end_time
                                  ).slice(-2)
                                )
                              )
                          }
                        />
                      </span>
                    </th>
                    <th
                      className={`${
                        isFieldEditable('shift_end_time', row.role_name) &&
                        Styles.editableCol
                      }`}
                    >
                      <p>Shift End</p>
                      <span>
                        <StyledTimePicker
                          className={Styles.timePicker}
                          value={setTimeFormat(row.shift_end_time)}
                          onAccept={(newValue) =>
                            setNewTimeValue(index, 'shift_end_time', newValue)
                          }
                          slotProps={{
                            field: { readOnly: true },
                          }}
                          timeSteps={{ minutes: 1 }}
                          skipDisabled={true}
                          disabled={
                            !isFieldEditable('shift_end_time', row.role_name)
                          }
                          closeOnSelect={false}
                          minTime={
                            row.shift_start_time &&
                            dayjs()
                              .set(
                                'hour',
                                Number(
                                  convertTo24HourFormat(
                                    row.shift_start_time
                                  ).substring(0, 2)
                                )
                              )
                              .set(
                                'minute',
                                Number(
                                  convertTo24HourFormat(
                                    row.shift_start_time
                                  ).slice(-2)
                                )
                              )
                          }
                        />
                      </span>
                    </th>
                    <th>
                      <p>Clock In</p>
                      {row.clock_in_time}
                    </th>
                    <th>
                      <p>Clock Out</p>
                      {row.clock_out_time}
                    </th>
                    <th>
                      <p>Total Hours</p>
                      {row.total_hours}
                    </th>
                  </tr>
                </thead>
              </table>
            </React.Fragment>
          )
      )}
    </div>
  );
};
export default IndividualModification;
