/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Styles from './index.module.scss';
import SelectDropdown from '../../../../common/selectDropdown';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import SvgComponent from '../../../../common/SvgComponent';
import { styled } from '@mui/material/styles';

const IndividualUpdate = ({
  byRoleData,
  applyToAllData,
  initialData,
  setIndividualData,
  setFieldDisabled,
  isFieldDisabled,
}) => {
  const [editedData, setEditedData] = useState(initialData);
  useEffect(() => {
    if (applyToAllData) {
      if (applyToAllData.home_base) {
        editedData.map((obj, index) => {
          setEditedData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
              ...updatedData[index],
              home_base: applyToAllData.home_base,
            };
            return updatedData;
          });
        });
      }
      if (applyToAllData.is_travel_time_included) {
        editedData.map((obj, index) => {
          setEditedData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
              ...updatedData[index],
              is_travel_time_included: applyToAllData.is_travel_time_included,
            };
            return updatedData;
          });
        });
      }
    }
    if (byRoleData) {
      editedData?.map((obj, index) => {
        const matchingRoleUpdate =
          byRoleData?.role_name?.label === obj.role_name;
        if (matchingRoleUpdate) {
          for (const key of Object.keys(byRoleData)) {
            if (key !== 'role_name') {
              setEditedData((prevData) => {
                const updatedData = [...prevData];
                updatedData[index] = {
                  ...updatedData[index],
                  [key]: byRoleData[key],
                };
                return updatedData;
              });
            }
          }
        }
      });
    }
  }, []);

  const handleCheckboxChange = (event, index, roleName) => {
    setEditedData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = {
        ...updatedData[index],
        is_travel_time_included: event.target.checked,
      };
      return updatedData;
    });
    setIndividualData((prevData) => {
      if (!prevData) {
        prevData = [];
      }
      const updatedData = [...prevData];
      updatedData[index] = {
        ...updatedData[index],
        is_travel_time_included: event.target.checked,
        staff_assignment_id: initialData[index].staff_assignment_id,
        staff_assignment_draft_id: initialData[index].staff_assignment_draft_id,
      };
      return updatedData;
    });
    // disable the field in other components
    setFieldDisabled('is_travel_time_included', true, 'individual', roleName);
  };

  const getInitialDataInField = (index) => {
    return initialData[index];
  };

  const setHomeBase = (newValue, roleName, index) => {
    if (newValue === null) {
      // home base field was cleared, do not update anything
      // set home base value which was there initially
      const initialValue = getInitialDataInField(index);
      setEditedData((prevData) => {
        const updatedData = [...prevData];
        updatedData[index] = {
          ...updatedData[index],
          home_base: initialValue.home_base,
        };
        return updatedData;
      });
      setIndividualData((prevData) => {
        if (!prevData) {
          prevData = [];
        }
        const updatedData = [...prevData];
        updatedData[index] = {
          ...updatedData[index],
          home_base_enum: initialValue.home_base_enum,
          role_name: roleName,
          staff_assignment_id: initialData[index].staff_assignment_id,
          staff_assignment_draft_id:
            initialData[index].staff_assignment_draft_id,
        };
        return updatedData;
      });
      // remove field disabled
      setFieldDisabled('home_base', false, 'individual', roleName);
      return;
    } else {
      // change happened
      setEditedData((prevData) => {
        const updatedData = [...prevData];
        updatedData[index] = {
          ...updatedData[index],
          home_base: newValue,
        };
        return updatedData;
      });
      setIndividualData((prevData) => {
        if (!prevData) {
          prevData = [];
        }
        const updatedData = [...prevData];
        updatedData[index] = {
          ...updatedData[index],
          home_base_enum: newValue.value,
          role_name: roleName,
          staff_assignment_id: initialData[index].staff_assignment_id,
          staff_assignment_draft_id:
            initialData[index].staff_assignment_draft_id,
        };
        return updatedData;
      });
      // disable the field in other components
      setFieldDisabled('home_base', true, 'individual', roleName);
    }
  };

  const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 320,
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

  const shortenRoleName = (roleName) => {
    const words = roleName.split(/\s+/);
    if (words.length > 1) {
      // Extract the first letter from each word
      const extractedLetters = words.map((word) => word[0]);
      return extractedLetters.join('').toUpperCase().substring(0, 3);
    } else if (words.length === 1) {
      // Remove vowels from the word
      const acronym = words[0].replace(/[aeiou]/gi, '');
      return acronym.toUpperCase().substring(0, 3);
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
      {editedData?.map(
        (row, index) =>
          row.staff_name &&
          row.staff_name !== '' && (
            <React.Fragment key={index}>
              <div className={Styles.individualTable}>
                <span>
                  <p>Staff Name</p> {row.staff_name}
                </span>
                <span>
                  <p>Role</p> {row.role_short_name}
                </span>
                <span>
                  <SelectDropdown
                    placeholder={'Home Base'}
                    required
                    removeDivider
                    disabled={isFieldDisabled(
                      'home_base',
                      'individual',
                      row.role_name
                    )}
                    options={getOptions(row)}
                    selectedValue={row.home_base}
                    onChange={(selectedOption) => {
                      setHomeBase(selectedOption, row.role_name, index);
                    }}
                  />
                </span>
                <span className={Styles.checkbox}>
                  <input
                    type="checkbox"
                    disabled={isFieldDisabled(
                      'is_travel_time_included',
                      'individual',
                      row.role_name
                    )}
                    checked={row.is_travel_time_included}
                    onChange={(e) =>
                      handleCheckboxChange(e, index, row.role_name)
                    }
                  />
                  Include Travel Time
                </span>
              </div>
            </React.Fragment>
          )
      )}
    </div>
  );
};

export default IndividualUpdate;
