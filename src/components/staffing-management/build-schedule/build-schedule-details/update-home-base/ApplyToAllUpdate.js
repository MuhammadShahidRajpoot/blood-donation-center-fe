/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Styles from './index.module.scss';
import SelectDropdown from '../../../../common/selectDropdown';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import SvgComponent from '../../../../common/SvgComponent';

const ApplyToAllUpdate = ({
  applyToAllData,
  setApplyToAllData,
  initialData,
  setFieldDisabled,
  isFieldDisabled,
}) => {
  const [isTravelTimeIncluded, setIsTravelTimeIncluded] = useState(false);
  const [homeBase, setHomeBase] = useState();

  useEffect(() => {
    if (applyToAllData) {
      if (applyToAllData.home_base) {
        setHomeBase(applyToAllData.home_base);
      }
      if (applyToAllData.is_travel_time_included) {
        setIsTravelTimeIncluded(applyToAllData.is_travel_time_included);
      }
    }
  }, []);

  const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: 14,
      fontWeight: 400,
      backgroundColor: '#72a3d0',
      borderRadius: 8,
      padding: 12,
      fontFamily: 'Inter',
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: '#72a3d0',
    },
  });

  const onCheckboxChange = (isChecked) => {
    setIsTravelTimeIncluded(isChecked);
    setApplyToAllData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        is_travel_time_included: isChecked,
      };
      return updatedData;
    });
    // initial data in apply to all for checkbox is always false
    if (isChecked) {
      // disable the field in other components
      setFieldDisabled('is_travel_time_included', true, 'applyToAll', null);
    } else {
      // no change
      setFieldDisabled('is_travel_time_included', false, 'applyToAll', null);
    }
  };

  const getOptions = (rowData) => {
    const options = [
      {
        value: 1,
        label: rowData.staff_collection_operation,
      },
      {
        value: 2,
        label: rowData.operation_collection_operation,
      },
      {
        value: 3,
        label: 'Staff Home Address',
      },
    ];
    return options;
  };

  const getHomeBases = () => {
    const staffOptions = initialData
      .map((staff) => {
        const opt = getOptions(staff);
        return opt;
      })
      .flat();
    const uniqueObjects = Array.from(
      new Set(staffOptions.map((item) => item.label))
    ).map((label) => {
      return staffOptions.find((item) => item.label === label);
    });
    return uniqueObjects;
  };

  const changeHomeBase = (newValue) => {
    if (newValue === null) {
      // field was cleared, discard the change, enable edit on field in other components
      setFieldDisabled('home_base', false, 'applyToAll', null);
    } else {
      // disable the field
      setFieldDisabled('home_base', true, 'applyToAll', null);
    }
    setHomeBase(newValue);
    setApplyToAllData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        home_base: newValue,
      };
      return updatedData;
    });
  };

  return (
    <div className={Styles.editContainer}>
      <h5>
        Edit Home Base{' '}
        <StyledTooltip
          title="Select a Collection Operation or Home Address and directions and travel times will be adjusted."
          arrow
          placement="right"
        >
          <span>
            <SvgComponent name={'Info'} />
          </span>
        </StyledTooltip>
      </h5>

      {initialData.length > 0 && (
        <React.Fragment>
          <div className={Styles.byRoleTable}>
            <span>
              <SelectDropdown
                placeholder={'Home Base'}
                required
                removeDivider
                selectedValue={homeBase}
                options={getHomeBases()}
                onChange={(newValue) => changeHomeBase(newValue)}
                disabled={isFieldDisabled('home_base', 'applyToAll', null)}
              />
            </span>
          </div>
          <span className={Styles.newLineCheckbox}>
            <input
              type="checkbox"
              disabled={isFieldDisabled(
                'is_travel_time_included',
                'applyToAll',
                null
              )}
              checked={isTravelTimeIncluded}
              onChange={(e) => onCheckboxChange(e.target.checked)}
            />
            Include Travel Time
            <StyledTooltip
              title="If Include Travel Time is not checked, Travel
          Times will be adjusted do 0 minutes."
              arrow
              placement="right"
            >
              <span>
                <SvgComponent name={'Info'} />
              </span>
            </StyledTooltip>
          </span>
        </React.Fragment>
      )}
    </div>
  );
};

export default ApplyToAllUpdate;
