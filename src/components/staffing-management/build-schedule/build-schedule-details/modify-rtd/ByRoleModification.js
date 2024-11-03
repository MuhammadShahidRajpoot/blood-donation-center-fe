import React, { useEffect, useState } from 'react';
import Styles from './index.module.scss';
import { Link, useLocation } from 'react-router-dom';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { styled } from '@mui/material';
import ToolTip from '../../../../common/tooltip';
import {
  recalculateTotalHours,
  convertTo12HourFormat,
  convertTo24HourFormat,
  setTimeFormat,
  recalculateClockInForObject,
  recalculateClockOutForObject,
} from './helper-functions';

const ByRoleModification = ({
  byRoleData,
  setByRoleData,
  rolesList,
  setFieldsChanged,
  fieldsChanged,
  applyToAllData,
  initialData,
  setIndividualData,
}) => {
  // data: array of objects, one object for every role.
  const location = useLocation();
  const Tabs = rolesList.map((role, index) => ({
    id: index,
    label: role,
  }));
  const [activeTab, setActiveTab] = useState(Tabs[0]); // first tab is active by default
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    // here we have array of objects which contain initial / previously edited values.
    // find the one corresponding to active tab (active tab = role user is currently seeing on the page).
    byRoleData.map((obj) => {
      if (obj.role_name === activeTab.label) {
        setEditedData(obj);
      }
    });

    if (applyToAllData) {
      // check fields updated in apply to all, reflect those changes in by Role
      for (const key of Object.keys(applyToAllData)) {
        if (applyToAllData[key] !== '') {
          if (['shift_start_time', 'shift_end_time'].includes(key)) {
            const formatted = convertTo24HourFormat(applyToAllData[key]);
            setNewTimeValue(
              key,
              dayjs()
                .set('hour', Number(formatted.substring(0, 2)))
                .set('minute', Number(formatted.slice(-2))),
              false
            );
          } else {
            handleEdit(key, applyToAllData[key]);
          }
        }
      }
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const checkChangedField = (field, value) => {
    initialData.map((row) => {
      if (row.role_name === activeTab.label) {
        if (Number(row[field]) !== value) {
          setFieldsChanged((prevArray) => {
            if (!Array.isArray(prevArray)) {
              prevArray = [];
            }
            const existingObjectIndex = prevArray.findIndex(
              (obj) => obj.role_name === activeTab.label
            );
            if (existingObjectIndex !== -1) {
              // If it exists, update the field of the found object
              return prevArray.map((obj, index) =>
                index === existingObjectIndex
                  ? { ...obj, [field]: { value: true, modified_from: 2 } }
                  : obj
              );
            }
          });
        } else {
          // if the value is the same, set it to false
          setFieldsChanged((prevArray) => {
            if (!Array.isArray(prevArray)) {
              prevArray = [];
            }
            const existingObjectIndex = prevArray.findIndex(
              (obj) => obj.role_name === activeTab.label
            );
            if (existingObjectIndex !== -1) {
              // If it exists, update the field of the found object
              return prevArray.map((obj, index) =>
                index === existingObjectIndex
                  ? { ...obj, [field]: { value: false, modified_from: 2 } }
                  : obj
              );
            }
          });
        }
      }
    });
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
    // update the UI with updating edited data
    setEditedData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        [field]: value,
      };
      return { ...updatedData };
    });
    /*
    individualData object is used to save the user's changes.
    Even when user switches between tabs / modification types,
    the changes persist on the page.
    Every change in by role page, should reflect in
    individual page as well.
    */
    setIndividualData((prevData) => {
      const updatedData = [...prevData];
      for (let index = 0; index < updatedData.length; index++) {
        if (updatedData[index].role_name === activeTab.label) {
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
      }
      return updatedData;
    });
    /* 
    byRoleData object is used to save the user's changes.
    Even when user switches between tabs / modification types,
    the changes persist on the page.
    */
    byRoleData.map((obj) => {
      if (obj.role_name === activeTab.label) {
        obj[field] = value;
      }
    });
    setByRoleData(byRoleData);
  };

  const handleBlur = (field, currentValue, shouldCheckForChange = true) => {
    if (currentValue === String(editedData[field])) {
      // nothing was edited
      return;
    }
    currentValue = Number(currentValue);

    // check which field was changed, to disable it in another component
    if (shouldCheckForChange) {
      checkChangedField(field, currentValue);
    }
    if (areAllFieldsSet()) {
      // handleEdit for total hours time is called within the function below
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

    if (!currentValue) {
      handleEdit(field, 0);
    } else {
      handleEdit(field, currentValue);
    }
  };

  const setNewTimeValue = (fieldEdited, value, shouldCheckForChange = true) => {
    // value is in dayjs format
    const formattedTime = convertTo12HourFormat(value?.format('HH:mm'));
    if (shouldCheckForChange) {
      checkChangedField(fieldEdited, formattedTime);
    }
    handleEdit(fieldEdited, formattedTime);
    // only if all fields have been edited, calculate clock in, clock out and total hours
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

  const areAllFieldsSet = () => {
    const obj = fieldsChanged.find(
      (fieldChanged) => fieldChanged.role_name === activeTab.label
    );
    let counter = 0;
    for (const key of Object.keys(obj)) {
      if (obj[key].value === true && obj[key].modified_from === 2) {
        ++counter;
      }
    }
    return counter >= 7;
  };

  const isFieldEditable = (field) => {
    const matchingObject = fieldsChanged.find(
      (fieldChanged) => fieldChanged.role_name === activeTab.label
    );
    // If matchingObject is found, check if the specified field is set to true
    if (matchingObject) {
      return !(
        matchingObject[field].value && matchingObject[field].modified_from !== 2
      );
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
      {initialData && editedData && (
        <div>
          <div className={`filterBar px-0 ${Styles.editByRoleTitle}`}>
            <div className="tabs">
              <ul>
                {Tabs?.map((tab, index) => (
                  <li key={index}>
                    <Link
                      to={{
                        pathname: location.pathname,
                        search: location.search, // Preserve existing query parameters
                      }}
                      className={activeTab.id === tab.id ? 'active' : ''}
                      onClick={() => handleTabClick(tab)}
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}{' '}
              </ul>
            </div>
          </div>

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
                    {editedData.lead_time || '0'}
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
                    {editedData.travel_to_time || '0'}
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
                    {editedData.setup_time || '0'}
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
                    {editedData.breakdown_time || '0'}
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
                    contentEditable={isFieldEditable(
                      'travel_from_time',
                      activeTab.label
                    )}
                    onBlur={(e) =>
                      handleBlur('travel_from_time', e.target.innerText)
                    }
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    {editedData.travel_from_time || '0'}
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
                    {editedData.wrapup_time || '0'}
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('shift_start_time') && Styles.editableCol
                  }`}
                >
                  <p>Shift Start</p>
                  <span
                    contentEditable={isFieldEditable('shift_start_time')}
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    <StyledTimePicker
                      className={Styles.timePicker}
                      value={setTimeFormat(editedData.shift_start_time)}
                      onAccept={(newValue) =>
                        setNewTimeValue('shift_start_time', newValue)
                      }
                      slotProps={{ field: { readOnly: true } }}
                      timeSteps={{ minutes: 1 }}
                      closeOnSelect={false}
                      disabled={!isFieldEditable('shift_start_time')}
                      skipDisabled={true}
                      maxTime={
                        editedData.shift_end_time &&
                        dayjs()
                          .set(
                            'hour',
                            Number(
                              convertTo24HourFormat(
                                editedData.shift_end_time
                              ).substring(0, 2)
                            )
                          )
                          .set(
                            'minute',
                            Number(
                              convertTo24HourFormat(
                                editedData.shift_end_time
                              ).slice(-2)
                            )
                          )
                      }
                    />
                  </span>
                </th>
                <th
                  className={`${
                    isFieldEditable('shift_end_time') && Styles.editableCol
                  }`}
                >
                  <p>Shift End</p>
                  <span
                    contentEditable={isFieldEditable('shift_end_time')}
                    suppressContentEditableWarning
                    onKeyDown={handleEnter}
                  >
                    <StyledTimePicker
                      className={Styles.timePicker}
                      value={setTimeFormat(editedData.shift_end_time)}
                      onAccept={(newValue) =>
                        setNewTimeValue('shift_end_time', newValue)
                      }
                      slotProps={{ field: { readOnly: true } }}
                      disabled={!isFieldEditable('shift_end_time')}
                      timeSteps={{ minutes: 1 }}
                      closeOnSelect={false}
                      skipDisabled={true}
                      minTime={
                        editedData.shift_start_time &&
                        dayjs()
                          .set(
                            'hour',
                            Number(
                              convertTo24HourFormat(
                                editedData.shift_start_time
                              ).substring(0, 2)
                            )
                          )
                          .set(
                            'minute',
                            Number(
                              convertTo24HourFormat(
                                editedData.shift_start_time
                              ).slice(-2)
                            )
                          )
                      }
                    />
                  </span>
                </th>
              </tr>
              <tr>
                <th>
                  <p>Clock In</p>
                  {editedData.clock_in_time || '0'}
                </th>
                <th>
                  <p>Clock Out</p>
                  {editedData.clock_out_time || '0'}
                </th>
                <th>
                  <p>Total Hours</p>
                  {editedData.total_hours || '0'}
                </th>
              </tr>
            </thead>
          </table>
        </div>
      )}
    </div>
  );
};

export default ByRoleModification;
