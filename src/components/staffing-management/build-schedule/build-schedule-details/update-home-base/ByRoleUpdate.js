/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Styles from './index.module.scss';
import SelectDropdown from '../../../../common/selectDropdown';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import SvgComponent from '../../../../common/SvgComponent';

const ByRoleUpdate = ({
  byRoleData,
  setByRoleData,
  applyToAllData,
  roles,
  initialData,
  setFieldDisabled,
  isFieldDisabled,
}) => {
  const [isTravelTimeIncluded, setIsTravelTimeIncluded] = useState(false);
  const [homeBase, setHomeBase] = useState(); // this is id from home_base_options
  const [role, setRole] = useState();
  useEffect(() => {
    if (applyToAllData) {
      if (applyToAllData.home_base) {
        setHomeBase(applyToAllData.home_base);
      }
      if (applyToAllData.is_travel_time_included) {
        setIsTravelTimeIncluded(applyToAllData.is_travel_time_included);
      }
    }
    if (byRoleData) {
      if (byRoleData.home_base) {
        setHomeBase(byRoleData.home_base);
      }
      if (byRoleData.role_name) {
        setRole(byRoleData.role_name);
      }
      if (byRoleData.is_travel_time_included) {
        setIsTravelTimeIncluded(byRoleData.is_travel_time_included);
      }
    }
  }, []);

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

  const getHomeBasesByRole = (roleName) => {
    // Filter staff with the specified role
    const staffWithRole = initialData.filter(
      (staff) => staff.role_name === roleName
    );
    // Extract home bases from the filtered staff
    const homeBases = staffWithRole.flatMap((staff) => {
      const opt = getOptions(staff);
      return opt;
    });
    const uniqueObjects = Array.from(
      new Set(homeBases.map((item) => item.label))
    ).map((label) => {
      return homeBases.find((item) => item.label === label);
    });
    return uniqueObjects;
  };

  const onRoleChange = (newRole) => {
    // if role was changed, clear home base field
    setHomeBase(null);
    if (!newRole) {
      // field cleared. Remove the prev update
      setRole(null);
      setIsTravelTimeIncluded(false);
      setByRoleData((prevData) => {
        if (!prevData) {
          prevData = {};
        }
        const updatedData = {
          ...prevData,
          role_name: newRole,
          home_base: null,
          is_travel_time_included: null,
        };
        return updatedData;
      });
      return;
    }
    setRole(newRole);
    setByRoleData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
      const updatedData = {
        ...prevData,
        role_name: newRole,
      };
      return updatedData;
    });
  };

  const onCheckboxChange = (isChecked) => {
    setIsTravelTimeIncluded(isChecked);
    if (isChecked) {
      // only if it's checked, we will save
      setByRoleData((prevData) => {
        if (!prevData) {
          prevData = {};
        }
        const updatedData = {
          ...prevData,
          role_name: role,
          is_travel_time_included: isChecked,
        };
        return updatedData;
      });
      setFieldDisabled('is_travel_time_included', true, 'byRole', role.label);
    }
  };

  const onHomeBaseChange = (newHomeBase) => {
    if (!newHomeBase) {
      // home base field was cleared, clear it in by role data
      setHomeBase(null);
      setByRoleData((prevData) => {
        if (!prevData) {
          prevData = {};
        }
        const updatedData = {
          ...prevData,
        };
        delete updatedData.home_base;
        return updatedData;
      });
      // field was cleared which means change was discared as well
      setFieldDisabled('home_base', false, 'byRole', role.label);
    } else {
      // change happened
      setHomeBase(newHomeBase);
      setByRoleData((prevData) => {
        if (!prevData) {
          prevData = {};
        }
        const updatedData = {
          ...prevData,
          home_base: newHomeBase,
        };
        return updatedData;
      });
      // disable the field
      setFieldDisabled('home_base', true, 'byRole', role.label);
    }
  };

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
                options={getHomeBasesByRole(role?.label)}
                onChange={(newValue) => onHomeBaseChange(newValue)}
                disabled={isFieldDisabled('home_base', 'byRole', role?.label)}
              />
            </span>
            <span>
              <SelectDropdown
                placeholder={'Role'}
                required
                removeDivider
                selectedValue={role}
                options={roles?.map((option, index) => {
                  return {
                    value: index,
                    label: option,
                  };
                })}
                onChange={(newValue) => onRoleChange(newValue)}
                // disabled={isFieldDisabled('home_base', 'byRole', role?.label)}
              />
            </span>
          </div>
          <span className={Styles.newLineCheckbox}>
            <input
              type="checkbox"
              disabled={isFieldDisabled(
                'is_travel_time_included',
                'byRole',
                role?.label
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

export default ByRoleUpdate;
