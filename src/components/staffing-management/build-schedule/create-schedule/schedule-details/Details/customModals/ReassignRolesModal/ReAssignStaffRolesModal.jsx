/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import './index.module.scss';
// import {
// BASE_URL,
// makeAuthorizedApiRequest,
// } from '../../../../../../../../helpers/Api';
import { toast } from 'react-toastify';
// import ReAssignTableListing from './ReAssignTableListing';
import SelectDropdown from '../../../../../../../common/selectDropdown';

const ReAssignStaffRolesModal = ({
  showReassignRolesModal,
  heading,
  data,
  onCancel,
  onConfirm,
  resourceType,
  classes,
  roleData,
  cancelBtnText = 'Cancel',
  confirmBtnText = 'Submit',
  disabled = false,
}) => {
  const [customErrors, setcustomErrors] = useState({});
  // const [role, setRole] = useState([{ role: null, quantity: '' }]);
  const [role, setRole] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [customFileds, setCustomFields] = useState();
  const [disableButton, setDisableButton] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [collectionOperationValue, setCollectionOperationValue] = useState();
  const [collectionOperationOptions, setCollectionOperationOptions] = useState(
    []
  );

  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'date',
      label: 'Data',
      width: '10%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'location',
      label: 'Location',
      width: '10%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'shift_hours',
      label: 'Shift Hours',
      width: '8%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'projection',
      label: 'Projection',
      width: '8%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'schedule_fill_status',
      label: 'Schedule Fill Status',
      width: '10%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'oef',
      label: 'OEF',
      width: '8%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'clock_in',
      label: 'Clock In',
      width: '10%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'clock_out',
      label: 'Clock Out',
      width: '10%',
      sortable: false,
      icon: false,
      checked: true,
    },
    {
      name: 'total_hours',
      label: 'Total Hours',
      width: '8%',
      sortable: false,
      icon: false,
      checked: true,
    },
  ]);

  const getRoles = async () => {
    const result = await fetch(
      `${BASE_URL}/contact-roles?fetchAll=true&staffable=true&status=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    const data = await result.json();
    setRolesOptions(
      data?.data?.map((item) => {
        return { id: item.id, name: item.name };
      }) || []
    );
  };

  // this block of code will be use later
  // const fetchRolesData = async () => {
  // try {
  //   const response = await makeAuthorizedApiRequest(
  //     'GET',
  //     `${BASE_URL}/roles/all`
  //   );
  //   return await response.json();
  // } catch (error) {
  //   toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
  //     autoClose: 3000,
  //   });
  // }
  // };

  // this block of code will be use later
  // useEffect(() => {
  //   const result = fetchRolesData();
  //   result
  //     .then((data) => {
  //       const options = data?.data?.map((item) => {
  //         return { label: item.name, value: item.id };
  //       });
  //       setRolesOptions(options);
  //       setCustomFields([]);
  //     })
  //     .catch((error) => {
  //       toast.error(`Failed to Fetch Roles List: ${error}`, {
  //         autoClose: 3000,
  //       });
  //     });
  // }, []);

  return (
    <section
      className={`${styles.popup} ${showReassignRolesModal && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        <div className={styles.content}>
          <div className={styles.reAssignContainer}>
            <section>
              <div className="d-flex flex-column">
                {heading ? <h2>{heading}</h2> : ''}
                <div className="dropdown mt-2 mb-2">
                  <SelectDropdown
                    label="Roles"
                    options={
                      data?.length
                        ? data.map((item) => ({
                            value: item?.value,
                            label: item?.label,
                          }))
                        : []
                    }
                    selectedValue={role}
                    removeDivider
                    onChange={(val) => {
                      setRole(val);
                    }}
                    placeholder="Roles"
                  />
                </div>
              </div>
            </section>
          </div>
          <div className={`${styles.buttons} ${classes?.btnGroup ?? ''}`}>
            <button
              className={`btn btn-secondary ${classes?.btn ?? ''}`}
              onClick={onCancel}
            >
              {cancelBtnText}
            </button>
            <button
              className={`btn btn-primary ${classes?.btn ?? ''}`}
              onClick={() => onConfirm(role)}
              disabled={!disableButton}
            >
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReAssignStaffRolesModal;
