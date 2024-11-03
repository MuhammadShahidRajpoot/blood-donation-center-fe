/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import './index.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
  BASE_URL,
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../../../helpers/Api';
import ReAssignTableListing from './ReAssignTableListing';
import SelectDropdown from '../../../../../../../common/selectDropdown';
import ReAssignStaffRolesModal from '../ReassignRolesModal/ReAssignStaffRolesModal';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import SuccessPopUpModal from '../../../../../../../common/successModal';
import PolymorphicType from '../../../../../../../../enums/PolymorphicTypeEnum';
import { ScheduledDaysTableComponent } from '../../schedules-days-table-component/ScheduledDaysTableComponent';

const ReAssignModal = ({
  recordName,
  showReassign,
  heading,
  record,
  operationDate,
  modalData,
  onCancel,
  onConfirm,
  resourceType,
  classes,
  cancelBtnText = 'Cancel',
  confirmBtnText = 'Submit',
  shift_id,
  collectionOperationValue,
  setCollectionOperationValue,
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const schedule_id = searchParams.get('schedule_id');
  const schedule_status = searchParams.get('schedule_status');
  const [rolesOptions, setRolesOptions] = useState([]);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [customFileds, setCustomFields] = useState();
  const [successMessage, setSuccessMessage] = useState('Success');
  const [disableButton, setDisableButton] = useState(true);
  const [showReassignRolesModal, setShowReassignRolesModal] = useState(false);
  const [operation, setOperation] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [collectionOperations, setCollectionOperations] = useState([]);
  const collection_operation_id = searchParams.get('collection_operation_id');
  const [scheduledDays, setScheduledDays] = useState([]);
  const [defaultCollectionOp, setDefaultCollectionOp] = useState(null);

  const [checkedRow, setcheckedRow] = useState();

  const [tableHeaders, setTableHeaders] = useState([]);

  const handleClickResolveBtn = () => {
    if (operation && checkedRow) {
      if (rolesOptions && rolesOptions.length > 0) {
        setShowReassignRolesModal(true);
      } else {
        toast.error(`No ${resourceType === 'Staff' ? 'roles' : resourceType === 'Vehicles' ? 'vehicle types' : 'device types'} to choose!`, {
          autoClose: 3000,
        });
      }
    } else {
      toast.error(`Select at least one Operation`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (resourceType) {
      if (resourceType === 'Staff') {
        setSuccessMessage('Staff Reassigned!');
      } else if (resourceType === 'Vehicles') {
        setSuccessMessage('Vehicle Reassigned!');
      } else {
        setSuccessMessage('Device Reassigned!');
      }
    }
  }, [resourceType]);

  const formatScheduledDays = (scheduleDates) => {
    return scheduleDates.map((date) => {
      if (date) {
        return new Date(date).getDay();
      }
    });
  };

  useEffect(() => {
    if (record && record.scheduled_dates && shift_id) {
      const days = formatScheduledDays(record.scheduled_dates);
      setScheduledDays(days);
    }
  }, [record, shift_id]);

  const fetchRolesData = async (operation) => {
    try {
      let response;
      if (resourceType === 'Staff') {
        response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation.op_id}/${operation.shiftable_type}/shifts/${operation.shift_id}/assigned-staff/${operation.schedule_id}`
        );
      } else if (resourceType === 'Vehicles') {
        response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation.op_id}/${operation.shiftable_type}/shifts/${operation.shift_id}/assigned-vehicle/${schedule_status}`
        );
      } else {
        response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation.op_id}/${operation.shiftable_type}/shifts/${operation.shift_id}/assigned-device/${schedule_status}`
        );
      }
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch ${resourceType === 'Staff' ? 'Roles' : resourceType === 'Vehicles' ? 'Vehicle Types' : 'Device Types'} Data: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const resourceSharing = async () => {
    try {
      if (
        Number(collection_operation_id) !== Number(collectionOperationValue.id)
      ) {
        let collecOp = collectionOperations.filter(
          (val) => val.id === collection_operation_id
        );
        let body = {
          start_date: operationDate,
          end_date: operationDate,
          share_type: 2,
          quantity: 1,
          description: `staff/vehicle/device sharing transaction for 1 staff from ${
            collecOp.length > 0 ? collecOp[0]?.name : ''
          }`,
          is_active: true,
          from_collection_operation_id: collection_operation_id,
          to_collection_operation_id: collectionOperationValue.id,
        };
        const response = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/operations-center/resource-sharing`,
          JSON.stringify(body)
        );
        return await response.json();
      }
    } catch (error) {
      toast.error(`Failed to Share Resource: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const resourceSharingFulfillment = async (resource_id) => {
    try {
      let body = {
        fullfilment_data: [
          {
            resource_share_id: resource_id,
            share_type_id:
              resourceType === 'Staff'
                ? record.staff_id
                : resourceType === 'Vehicles'
                ? record.assigned_vehicle_id
                : record.assigned_device_id,
          },
        ],
      };

      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/operations-center/resource-sharing/${resource_id}/fulfill-request`,
        JSON.stringify(body)
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fulfill Resource: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const updateData = async (role) => {
    try {
      const userName = localStorage.getItem('user_name');
      const result = await fetchData(`/tenant-users/email/${userName}`);
      if (result?.data) {
        if (resourceType === 'Staff') {
          const response = await makeAuthorizedApiRequest(
            'PUT',
            `${BASE_URL}/staffing-management/schedules/operation/staff-assignment?staff_assignment_id=${
              record.assignment_id ?? 0
            }&staff_draft_assignment_id=${
              record.draft_assignment_id
            }&updated_shift_id=${operation.shift_id}&updated_role_id=${
              role.value
            }&schedule_id=${schedule_id}&operation_id=${
              operation.op_id
            }&operation_type=${operation.shiftable_type}&userId=${
              result?.data.id
            }`
          );
          return await response.json();
        } else if (resourceType === 'Vehicles') {
          const response = await makeAuthorizedApiRequest(
            'PUT',
            `${BASE_URL}/staffing-management/schedules/operation/vehicle-assignment?shift_id=${
              operation.shift_id
            }&requested_vehicle_id=${
              record.requested_vehicle_id
            }&schedule_id=${schedule_id}&assigned_vehicle_id=${
              record.assigned_vehicle_id
            }&updated_operation_id=${operation.op_id}&updated_operation_type=${
              operation.shiftable_type
            }&vehicle_assignment_id=${
              record.vehicle_assignment_id ?? record.vehicle_assignment_draft_id
            }&userId=${result?.data.id}`
          );
          return await response.json();
        } else {
          const response = await makeAuthorizedApiRequest(
            'PUT',
            `${BASE_URL}/staffing-management/schedules/operation/device-assignment?old_shift_id=${shift_id}&requested_device_id=${
              record.requested_device_id
            }&schedule_id=${schedule_id}&assigned_device_id=${
              record.assigned_device_id
            }&updated_operation_id=${operation.op_id}&updated_operation_type=${
              operation.shiftable_type
            }&device_assignment_id=${
              record.device_assignment_id ?? undefined
            }&device_assignment_draft_id=${
              record.device_assignment_draft_id ?? undefined
            }&userId=${result?.data.id}&updated_shift_id=${operation.shift_id}`
          );
          return await response.json();
        }
      }
    } catch (error) {
      toast.error(`Failed to Update Staff the record in DB: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const handleSelect = (e, row, i) => {
    const array = rows.map((val) => {
      Number(val.id) === Number(row.id) &&
      Number(val.shift_id) === Number(row.shift_id)
        ? (val.checked = true)
        : (val.checked = false);
      return val;
    });
    setRows(array);
    if (row.checked) {
      setOperation(row);
      setcheckedRow(row);
      const result = fetchRolesData(row);
      result
        .then((data) => {
          let options;
          if (resourceType === 'Staff') {
            const filtered = data?.assignedStaffData.filter(
              (obj) => obj.staff_id === null
            );
            const distinct = filtered.reduce(
              (uniqueArray, obj) =>
                uniqueArray.some((item) => item.role_id === obj.role_id)
                  ? uniqueArray
                  : [...uniqueArray, obj],
              []
            );
            options = distinct?.map((item) => {
              return { label: item.role_name, value: item.role_id };
            });
          } else if (resourceType === 'Vehicles') {
            const vehicles = Object.values(data).filter(
              (obj) => typeof obj === 'object'
            );
    
            const filtered = vehicles?.filter(
              (obj) => obj.assigned_vehicle_id === null
            );
            const distinct = filtered?.reduce(
              (uniqueArray, obj) =>
                uniqueArray.some(
                  (item) =>
                    item.requested_vehicle_id === obj.requested_vehicle_id
                )
                  ? uniqueArray
                  : [...uniqueArray, obj],
              []
            );
            options = distinct?.map((item) => {
              return {
                label: item.requested_vehicle_type,
                value: item.requested_vehicle_id,
              };
            });
          } else {
            const devices = Object.values(data).filter(
              (obj) => typeof obj === 'object'
            );
            const filtered = devices?.filter(
              (obj) => obj.assigned_device_id === null
            );
            const distinct = filtered.reduce(
              (uniqueArray, obj) =>
                uniqueArray.some(
                  (item) => item.requested_device_id === obj.requested_device_id
                )
                  ? uniqueArray
                  : [...uniqueArray, obj],
              []
            );
            options = distinct?.map((item) => {
              return {
                label: item.requested_device_type,
                value: item.requested_device_id,
              };
            });
          }
          setRolesOptions(options);
          setCustomFields([]);
        })
        .catch((error) => {
          toast.error(`Failed to Fetch Roles List: ${error}`, {
            autoClose: 3000,
          });
        });
    } else {
      setOperation();
      setcheckedRow();
    }
  };

  useEffect(() => {
    let head =
      resourceType === 'Staff'
        ? [
            {
              name: 'checkbox',
              label: '',
              width: '8%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'date',
              label: 'Date',
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
          ]
        : [
            {
              name: 'checkbox',
              label: '',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'date',
              label: 'Date',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'location',
              label: 'Location',
              width: '20%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'shift_hours',
              label: 'Shift Hours',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'projection',
              label: 'Projection',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },

            {
              name: 'oef',
              label: 'OEF',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'clock_in',
              label: 'Depart',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
            {
              name: 'clock_out',
              label: 'Return',
              width: '10%',
              sortable: false,
              icon: false,
              checked: true,
            },
          ];

    setTableHeaders(head);

    let operation = [];
    modalData.map((val) => {
      if (resourceType === 'Staff') {
        const keyToIgnore = 'shifts';
        const filteredObject = Object.entries(val).reduce(
          (result, [key, value]) => {
            if (key !== keyToIgnore) {
              result[key] = value;
              result.op_id = result['id'];
              result.checked = false;
            }
            return result;
          },
          {}
        );
        let obj = val.shifts.flatMap((obj) => {
          obj.shift_id = obj.id;
          return { ...filteredObject, ...obj };
        });

        obj = obj.filter((val) => {
          if (shift_id === val.shift_id) {
            return;
          }
          if (
            val.shiftable_type ===
            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
          ) {
            if (
              val.shiftRole.requestedStaff > val.shiftRole.assignedStaff &&
              val.shiftRole.requestedStaff !== 0
            ) {
              return val;
            } else {
              return;
            }
          } else {
            if (
              val.staffSetup.requestedStaff > val.staffSetup.assignedStaff &&
              val.staffSetup.requestedStaff !== 0
            ) {
              return val;
            } else {
              return;
            }
          }
        });
        operation = [...obj, ...operation];
      } else {
        const keyToIgnore = 'shifts';
        const filteredObject = Object.entries(val).reduce(
          (result, [key, value]) => {
            if (key !== keyToIgnore) {
              result[key] = value;
              result.op_id = result['id'];
              result.checked = false;
            }
            return result;
          },
          {}
        );
        let obj = val.shifts.flatMap((obj) => {
          obj.shift_id = obj.id;
          return { ...filteredObject, ...obj };
        });
        operation = [...obj, ...operation];
      }
    });
    setRows(operation);
  }, [modalData]);

  useEffect(() => {
    // if user clears the dropdown and closes the modal
    // next time it opens, display default collection op instead of empty dropdown
    if (collectionOperationValue === null) {
      setCollectionOperationValue(defaultCollectionOp);
    }
  }, [showReassign]);

  useEffect(() => {
    const getCollectionOperation = async () => {
      try {
        const userName = localStorage.getItem('user_name');
        const result = await fetchData(`/tenant-users/email/${userName}`);
        if (result?.data) {
          collectionOperations.length > 0 ?? setCollectionOperations([]);
          const units = await fetchData(
            `/staffing-management/schedules/collection_operations/list/${result?.data.id}`
          );
          if (units?.data) {
            setCollectionOperations(units.data);
            let op = units.data.findIndex(
              (val) => val.id === collection_operation_id
            );
            setDefaultCollectionOp({
              id: units?.data[op].id,
              label: units?.data[op].name,
            });
            setCollectionOperationValue({
              id: units?.data[op].id,
              label: units?.data[op].name,
            });
          }
        }
      } catch (error) {
        toast.error(`Error fetching Collection Operations: ${error}`, {
          autoClose: 3000,
        });
      }
    };
    getCollectionOperation();
  }, [BASE_URL]);

  return (
    <section
      className={`${styles.popup} ${showReassign && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        <div className={styles.content}>
          <div className={styles.reAssignContainer}>
            <section>
              <div className="d-flex justify-content-between">
                {heading ? <h2>{heading}</h2> : ''}
                <div className="dropdown mt-2 mb-2">
                  <SelectDropdown
                    label="Collection Operation"
                    options={
                      collectionOperations?.length
                        ? collectionOperations.map((item) => ({
                            value: item?.id,
                            label: item?.name,
                          }))
                        : []
                    }
                    selectedValue={collectionOperationValue}
                    removeDivider
                    onChange={(val) => {
                      setCollectionOperationValue(
                        val !== null
                          ? {
                              id: val.value,
                              label: val.label,
                            }
                          : val
                      );
                    }}
                    placeholder="Change Collection Operation"
                  />
                </div>
              </div>
            </section>
            <section className="d-flex flex-column">
              <div className="w-100">
                <div className="d-flex mb-2">
                  <div className="flex-shrink-0" style={{ width: '180px' }}>
                    <p>
                      {resourceType === 'Staff'
                        ? 'Current Staff Name:'
                        : resourceType === 'Vehicles'
                        ? 'Current Vehicle Name:'
                        : 'Current Device Name:'}
                    </p>
                  </div>
                  <div className="flex-grow-0">
                    <span className="d-block align-items-center"  style={{ marginTop: '3px' }}>
                      {recordName}
                    </span>
                  </div>
                </div>

                {resourceType === 'Staff' && (
                  <div className="d-flex mb-2">
                    <div className="flex-shrink-0" style={{ width: '180px' }}>
                      <p>Hours:</p>
                    </div>
                    <div className="flex-grow-0">
                      <span className="d-block align-items-center mt-1">
                        24/30
                      </span>
                    </div>
                  </div>
                )}
                <div className="d-flex mb-2">
                  <div className="flex-shrink-0" style={{ width: '180px' }}>
                    <p>Scheduled Days:</p>
                  </div>
                  <div className="flex-grow-1">
                    {scheduledDays && (
                      <ScheduledDaysTableComponent
                        scheduledDays={scheduledDays}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
          <section className={styles.reassignStaffTableContainer}>
            <ReAssignTableListing
              resourceType={resourceType}
              isLoading={isLoading}
              handleSelect={handleSelect}
              data={rows}
              headers={tableHeaders}
              setTableHeaders={setTableHeaders}
            />
          </section>
          <div className={`${styles.buttons} ${classes?.btnGroup ?? ''}`}>
            <button
              className={`btn btn-secondary ${classes?.btn ?? ''}`}
              onClick={() => {
                setOperation();
                setcheckedRow();
                onCancel();
              }}
            >
              {cancelBtnText}
            </button>
            <button
              className={`btn btn-primary ${classes?.btn ?? ''}`}
              onClick={handleClickResolveBtn}
              disabled={!disableButton}
            >
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
      {rolesOptions !== (null || undefined) && rolesOptions.length > 0 ? (
        <ReAssignStaffRolesModal
          data={rolesOptions}
          showReassignRolesModal={showReassignRolesModal}
          heading={heading}
          confirmBtnText={'Reassign'}
          onConfirm={(data) => {
            updateData(data).then((val) => {
              if (val.status_code === 200) {
                resourceSharing().then((res) => {
                  if (res) {
                    resourceSharingFulfillment(res.data.id);
                  }
                });
                onConfirm();
              }
              setShowReassignRolesModal(false);
              setModalPopUp(true);
            });
          }}
          onCancel={() => setShowReassignRolesModal(false)}
        />
      ) : (
        ''
      )}
      <SuccessPopUpModal
        title={'Success!'}
        message={successMessage}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        isNavigate={false}
        onConfirm={() => {
          setRolesOptions([]);
          onConfirm();
        }}
      />
    </section>
  );
};

export default ReAssignModal;
