/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import ResourcesAvailableSection from './ResourcesAvailable';
import './details.scss';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../../../routes/path';
import SplitShiftConfirmModal from './customModals/SplitShiftConfirmModal';
import ConfirmationIcon from '../../../../../../assets/images/confirmation-image.png';
import AddRecordModal from './customModals/AddStaffModal/AddRecordModal';
import ReAssignModal from './customModals/ReassignModal/ReAssignModal';
import {
  BASE_URL,
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import { toast } from 'react-toastify';
import Success from '../../../../../../assets/success.svg';
import ToolTip from '../../../../../common/tooltip';
import homeBaseEnum from '../../../homeBase.enum';
import _ from 'lodash';

function ResourceRequestedSection(props) {
  const [resourceRequestedTabs, setResourceRequestedTabs] = useState('Staff');
  const [tabDataId, setTabDataId] = useState();
  const [operation, setOperation] = useState();
  const [roleName, setRoleName] = useState();
  const [recordName, setrecordName] = useState();
  const navigate = useNavigate();
  const [showSplitShiftConfirmModal, setShowSplitShiftConfirmModal] =
    useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReAssignModal, setShowReAssignModal] = useState(false);
  const [reAssignModalData, setReAssignModalData] = useState([]);
  const [requestedResourceData, setRequestedResourceData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [newStaffAdded, setNewStaffAdded] = useState([]);
  const [newVehiclesAdded, setNewVehiclesAdded] = useState([]);
  const [newDevicesAdded, setNewDevicesAdded] = useState([]);
  const [requestedStaffCount, setRequestedStaffCount] = useState([]);
  const [additionalData, setAdditionalData] = useState([]);
  const [requestedVehiclesData, setRequestedVehiclesData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [vehiclesAdditionalData, setVehiclesAdditionalData] = useState([]);
  const [requestedDevicesData, setRequestedDevicesData] = useState([]);
  const [devicesData, setDevicesData] = useState([]);
  const [devicesAdditionalData, setDevicesAdditionalData] = useState([]);
  const [dataLength, setDataLength] = useState(0);
  const [rowData, setRowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const [collectionOpForReassign, setCollectionOpForReassign] = useState(null);

  const onRoleSelect = async (item, index) => {
    if (item?.staff_id === null && item?.staff_name === null) {
      setTabDataId(item?.role_id);
      setSelectedRow(index);
      setRoleName(item?.role_name);
      setSelectedData(item);
    }
  };
  const onVehicleSelect = async (item, index) => {
    if (item.assigned_vehicle === null && item.assigned_vehicle_id === null) {
      setTabDataId(item.requested_vehicle_id);
      setSelectedRow(index);
      setRoleName(item.requested_vehicle_type);
    }
  };
  const onDeviceSelect = async (item, index) => {
    if (item.assigned_device === null && item.assigned_device_id === null) {
      setTabDataId(item.requested_device_id);
      setSelectedRow(index);
      setRoleName(item.requested_device);
    }
  };
  const [modalPopUp, setModalPopUp] = useState(false);
  const [staffOEF, setStaffOEF] = useState(0);
  const [assignedStaff, setAssignedStaff] = useState(0);
  const [assignedStaffAdded, setAssignedStaffAdded] = useState(0);
  const [assignedVehicles, setAssignedVehicles] = useState(0);
  const [assignedVehiclesAdded, setAssignedVehiclesAdded] = useState(0);
  const [assignedDevices, setAssignedDevices] = useState(0);
  const [assignedDevicesAdded, setAssignedDevicesAdded] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [certificateIds, setCertificateIds] = useState([]);
  const [scheduleStartDate, setScheduleStartDate] = useState();
  const [scheduleEndDate, setScheduleEndDate] = useState();
  const [operationDate, setOperationDate] = useState();
  const [reassignModalHeading, setReassignModalHeading] =
    useState('Reassign Staff');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const schedule_id = searchParams.get('schedule_id');
  const schedule_status = searchParams.get('schedule_status');
  const shift_id = props.shift_id;
  const operation_date = props.operation_date;
  const isCreated = searchParams.get('isCreated');
  const collection_operation_id = searchParams.get('collection_operation_id');

  const queryParams = {
    operation_id: operation_id,
    operation_type: operation_type,
    schedule_id: schedule_id,
    schedule_status: schedule_status,
    isCreated: isCreated,
    shift_id: shift_id,
    collection_operation_id: collection_operation_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();
  const onUpdateHomeBase = () => {
    navigate(
      STAFFING_MANAGEMENT_BUILD_SCHEDULE.UPDATE_HOME_BASE.concat('?').concat(
        appendToLink
      )
    );
  };

  const getWeekBounds = (inputDate) => {
    const date = new Date(inputDate);
    const currentDay = date.getDay();
    const daysUntilMonday = (currentDay + 6) % 7;
    // Set the date to the first day (Monday) of the week
    date.setDate(date.getDate() - daysUntilMonday);
    // Calculate the last day (Sunday) of the week
    const lastDay = new Date(date);
    lastDay.setDate(date.getDate() + 6);
    return { firstDay: date.toISOString(), lastDay: lastDay.toISOString() };
  };

  useEffect(() => {
    if (operation_date) {
      const scheduleDates = getWeekBounds(operation_date);
      setScheduleStartDate(scheduleDates.firstDay);
      setScheduleEndDate(scheduleDates.lastDay);
    }
  }, [operation_date]);

  const handleConfirmationCancel = () => {
    setShowSplitShiftConfirmModal(false);
  };

  const handleConfirmationConfirm = async () => {
    let shifted = await splitShifts(rowData);
    if (shifted) {
      setShowSplitShiftConfirmModal(false);
    }
  };

  const handleConfirmationModifyRTD = () => {
    navigate(
      STAFFING_MANAGEMENT_BUILD_SCHEDULE.MODIFY_RTD.concat('?').concat(
        appendToLink
      )
    );
  };

  const sortArrayBy = (arr, sortByValue) => {
    return _.sortBy(arr, sortByValue);
  };

  const addNewRecord = (data) => {
    if (data.length > 0) {
      switch (resourceRequestedTabs) {
        case 'Staff':
          setRequestedResourceData((oldVal) => [...oldVal, ...data]);
          setAdditionalData((oldVal) => [...oldVal, ...data]);
          setNewStaffAdded([...data]);
          break;
        case 'Vehicles':
          setRequestedVehiclesData([...requestedVehiclesData, ...data]);
          setVehiclesAdditionalData([...vehiclesAdditionalData, ...data]);
          setNewVehiclesAdded([...data]);
          break;
        case 'Devices':
          setRequestedDevicesData([...requestedDevicesData, ...data]);
          setDevicesAdditionalData([...devicesAdditionalData, ...data]);
          setNewDevicesAdded([...data]);
          break;
        default:
          break;
      }
      setShowAddModal(false);
    } else {
      setShowAddModal(false);
    }
  };

  const unassignVehicles = async () => {
    try {
      if (
        rowData.assigned_vehicle_id !== null &&
        rowData.requested_vehicle_id !== null
      ) {
        const body = {
          vehicle_assignment_draft_id: rowData.vehicle_assignment_draft_id,
          vehicle_assignment_id: rowData.vehicle_assignment_id,
        };
        const response = await makeAuthorizedApiRequest(
          'DELETE',
          `${BASE_URL}/staffing-management/schedules/${operation_id}/shifts/${shift_id}/assigned-vehicle`,
          JSON.stringify(body)
        );
        setModalPopUp(false);
        return await response.json();
      } else {
        setModalPopUp(false);
      }
    } catch (error) {
      setModalPopUp(false);
      toast.error(`Failed to Unassign a staff: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const unassignDevices = async () => {
    try {
      if (
        rowData.assigned_device_id !== null &&
        rowData.requested_device_id !== null
      ) {
        const body = {
          device_assignment_draft_id: rowData.device_assignment_draft_id,
          device_assignment_id: rowData.device_assignment_id,
        };
        const response = await makeAuthorizedApiRequest(
          'DELETE',
          `${BASE_URL}/staffing-management/schedules/${operation_id}/shifts/${shift_id}/assigned-device`,
          JSON.stringify(body)
        );
        setModalPopUp(false);
        return await response.json();
      } else {
        setModalPopUp(false);
      }
    } catch (error) {
      setModalPopUp(false);
      toast.error(`Failed to Unassign a staff: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const unassignStaff = async () => {
    try {
      setIsLoading(true);
      if (rowData.role_id !== null && rowData.staff_id !== null) {
        const response = await makeAuthorizedApiRequest(
          'DELETE',
          `${BASE_URL}/staffing-management/schedules/${schedule_id}/${operation_id}/shifts/${shift_id}/assigned-staff?role_id=${rowData.role_id}&staff_id=${rowData.staff_id}&operation_type=${operation_type}`
        );
        if (response.status === 200) {
          fetchStaffData();
          props.setStaffAssignUnassignFlag(Math.floor(Math.random() * 100) + 1);
          setRequestedResourceData([
            ...requestedResourceData,
            ...newStaffAdded,
          ]);
          setIsLoading(false);
        }
        setTabDataId(null);
        setSelectedRow(null);
        setRoleName(null);
        setModalPopUp(false);
        return await response.json();
      } else {
        setModalPopUp(false);
        setIsLoading(false);
      }
    } catch (error) {
      setModalPopUp(false);
      setIsLoading(false);
      toast.error(`Failed to Unassign a staff: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const splitShifts = async (rowData) => {
    try {
      if (rowData.role_id !== null && rowData.staff_id !== null) {
        const response = await makeAuthorizedApiRequest(
          'PATCH',
          `${BASE_URL}/staffing-management/schedules/operations/split_shift/${
            rowData.assignment_id ?? rowData.draft_assignment_id
          }/${rowData.assignment_id ? 'Main' : 'Draft'}/${schedule_id}`
        );
        return await response.json();
      } else {
        toast.error(`No Staff is Assigned to this role: ${error}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to Split Shift: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchReassignData = async (
    collectionOperationId = null,
    row = null
  ) => {
    try {
      const relativeData = await fetchData(
        `/staffing-management/schedules/operations/data/${operation_id}/${operation_type}/schedule/${schedule_id}`
      );
      setOperationDate(relativeData.operation.date);
      if (row && row.role_id && row.staff_id) {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/operation/staff/reassign_staff?collection_operation_id=${
            collectionOperationId ??
            relativeData.schedule.collection_operation_id
          }&date=${relativeData.operation.date}&staff_id=${
            row.staff_id
          }&operation_status=${
            relativeData.operation.operation_status
          }&role_id=${row.role_id}`
        );
        return await response.json();
      } else if (row && row.requested_vehicle_id) {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/operation/staff/reassign_vehicle?collection_operation_id=${
            collectionOperationId ??
            relativeData.schedule.collection_operation_id
          }&date=${relativeData.operation.date}`
        );
        return await response.json();
      } else if (row && row.requested_device_id) {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/operation/staff/reassign-device?collection_operation_id=${
            collectionOperationId ??
            relativeData.schedule.collection_operation_id
          }&date=${relativeData.operation.date}`
        );
        return await response.json();
      } else {
        return {
          drive: [],
          nce: [],
          session: [],
        };
      }
    } catch (error) {
      toast.error(`Failed to Reassign Staff/Vehicle/Device: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const getReassignModalData = (data) => {
    let val = fetchReassignData(data?.id, rowData);
    val.then((data) => {
      setrecordName(
        rowData && resourceRequestedTabs === 'Staff'
          ? rowData.staff_name
          : rowData && resourceRequestedTabs === 'Vehicles'
          ? rowData.assigned_vehicle
          : rowData && rowData.assigned_device
      );
      setReAssignModalData([
        ...(data.drive ?? []),
        ...(data.nce ?? []),
        ...(data.session ?? []),
      ]);
    });
  };

  const getcertificate = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-management/schedules/drives/certifications/${operation_id}`
      );
      const { data } = await response.json();
      setCertificates(data);
      const ids = Object.values(data).map((item) => item.id);
      setCertificateIds(ids);
      return data;
    } catch (error) {
      toast.error(error, {
        autoClose: 3000,
      });
    }
  };

  const fetchVehiclesData = async () => {
    if (shift_id) {
      setIsLoading(true);
      setVehiclesAdditionalData([]);
      setRequestedVehiclesData([]);
      setVehiclesData([]);
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation_id}/${operation_type}/shifts/${shift_id}/assigned-vehicle/${schedule_status}`
        );
        const dataArray = await response.json();

        const vehicles = Object.values(dataArray).filter(
          (obj) => typeof obj === 'object'
        );

        if (vehicles) {
          newVehiclesAdded.splice(0, 1);
          setRequestedVehiclesData([...vehicles, ...newVehiclesAdded]);
          setVehiclesAdditionalData(
            vehicles.filter((val) => val.is_additional)
          );
          setVehiclesData(vehicles);
          setAssignedVehicles(
            countObjectsWithAssignedVehicleIdNotNull(vehicles)
          );
          setAssignedVehiclesAdded(
            countObjectsWithAssignedVehicleIdNotNull(vehiclesAdditionalData)
          );
          setDataLength(requestedVehiclesData.length);
          setIsLoading(false);
        }
      } catch (error) {
        toast.error(`Failed to Fetch Vehicles data: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const fetchDevicesData = async () => {
    if (shift_id) {
      setIsLoading(true);
      setDevicesAdditionalData([]);
      setRequestedDevicesData([]);
      setDevicesData([]);
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation_id}/${operation_type}/shifts/${shift_id}/assigned-device/${schedule_status}`
        );
        const dataArray = await response.json();

        const devices = Object.values(dataArray).filter(
          (obj) => typeof obj === 'object'
        );
        if (devices) {
          newDevicesAdded.splice(0, 1);
          setRequestedDevicesData([...devices, ...newDevicesAdded]);
          setDevicesAdditionalData(devices.filter((val) => val.is_additional));
          setDevicesData(devices);
          setAssignedDevices(countObjectsWithAssignedDeviceIdNotNull(devices));
          setAssignedDevicesAdded(
            countObjectsWithAssignedDeviceIdNotNull(devicesAdditionalData)
          );
          setDataLength(requestedDevicesData?.length);
          setIsLoading(false);
        }
      } catch (error) {
        toast.error(`Failed to Fetch Devices data: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const fetchStaffData = async () => {
    if (shift_id) {
      setIsLoading(true);
      setAdditionalData([]);
      setRequestedResourceData([]);
      setResourceData([]);
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/${operation_id}/${operation_type}/shifts/${shift_id}/assigned-staff/${schedule_id}`
        );
        const data = await response.json();
        if (data.assignedStaffData) {
          let oef =
            data.Staffed_OEF !== null
              ? Number(data?.Staffed_OEF)?.toFixed(2)
              : 0;
          setStaffOEF(oef);
          let updatedResponse = data.assignedStaffData.map((val) => {
            val.type = 'staff';
            return val;
          });
          updatedResponse.sort((a, b) => {
            if (a.staff_name === null) return 1;
            if (b.staff_name === null) return -1;
            return a.staff_name.localeCompare(b.staff_name);
          });

          setAdditionalData(updatedResponse.filter((val) => val.is_additional));
          if (newStaffAdded.length > 0) {
            updatedResponse.forEach((item) => {
              const index = newStaffAdded.findIndex(
                (idx) =>
                  idx.role_id === item.role_id &&
                  idx.role_name === item.role_name &&
                  item.is_additional == true &&
                  item.staff_id !== null
              );
              if (index !== -1) {
                newStaffAdded.splice(index, 1);
              }
            });
          }
          setRequestedResourceData([...updatedResponse, ...newStaffAdded]);
          setResourceData(updatedResponse);
          setAssignedStaff(countObjectsWithStaffIdNotNull(updatedResponse));
          setRequestedStaffCount(
            updatedResponse.filter((val) => !val.is_additional)
          );
          setAssignedStaffAdded(
            countObjectsWithAdditionalStaffIdNotNull(updatedResponse)
          );
          setDataLength(requestedResourceData.length);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        toast.error(`Failed to Fetch Staff data: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const renderOptions = (rowData) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        <ul className="dropdown-menu">
          {optionsConfig?.map((option, index) =>
            resourceRequestedTabs === 'Staff' ? (
              <li
                key={index}
                style={{
                  zIndex: '100',
                  opacity: rowData.staff_id !== null ? '1' : '.6',
                }}
              >
                <a
                  className="dropdown-item"
                  onClick={(e) => {
                    if (rowData.staff_id !== null) {
                      if (option?.openNewTab?.(rowData)) {
                        return;
                      }
                      if (!(e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        if (option.path) {
                          const path = option?.path(rowData);
                          navigate(path);
                        } else if (option.action) {
                          option.action(rowData);
                        }
                      }
                    }
                  }}
                  href={
                    rowData.staff_id !== null &&
                    option?.path &&
                    option?.path(rowData)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {option?.label}
                </a>
              </li>
            ) : resourceRequestedTabs === 'Vehicles' ? (
              <li
                key={index}
                style={{
                  zIndex: '100',
                  opacity: rowData.assigned_vehicle_id !== null ? '1' : '.6',
                }}
              >
                <a
                  className="dropdown-item"
                  onClick={(e) => {
                    if (rowData.assigned_vehicle_id !== null) {
                      if (option?.openNewTab?.(rowData)) {
                        return;
                      }
                      if (!(e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        if (option.path) {
                          const path = option?.path(rowData);
                          navigate(path);
                        } else if (option.action) {
                          option.action(rowData);
                        }
                      }
                    }
                  }}
                  href={
                    rowData.staff_id !== null &&
                    option?.path &&
                    option?.path(rowData)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {option?.label}
                </a>
              </li>
            ) : resourceRequestedTabs !== 'Staff' &&
              option?.label !== 'Role Time Details' ? (
              <li key={index}>
                <a
                  className="dropdown-item"
                  onClick={(e) => {
                    if (rowData.staff_id !== null) {
                      if (option?.openNewTab?.(rowData)) {
                        return;
                      }
                      if (!(e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        if (option.path) {
                          const path = option?.path(rowData);
                          navigate(path);
                        } else if (option.action) {
                          option.action(rowData);
                        }
                      }
                    }
                  }}
                  href={
                    rowData.staff_id !== null &&
                    option?.path &&
                    option?.path(rowData)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {option?.label}
                </a>
              </li>
            ) : (
              ''
            )
          )}
        </ul>
      </div>
    );
  };

  const removeTabs = (tabName) => {
    setResourceRequestedTabs(tabName);
    setTabDataId(null);
    setSelectedRow(null);
    setRoleName(null);
  };

  const handleAddResource = () => {
    setShowAddModal(true);
  };

  const handleReAssignCancel = () => {
    setShowReAssignModal(false);
  };

  const handleReAssignSubmit = () => {};
  let inputTimer = null;

  const optionsConfig =
    resourceRequestedTabs === 'Staff'
      ? [
          {
            label: 'Unassign',
            action: (rowData) => {
              setRowData(rowData);
              setModalPopUp(true);
            },
          },
          {
            label: 'Reassign',
            action: (rowData) => {
              setRowData(rowData);
              let val = fetchReassignData(
                collectionOpForReassign ? collectionOpForReassign.id : null,
                rowData
              );
              val.then((data) => {
                setrecordName(rowData.staff_name);
                setReAssignModalData([
                  ...data.drive,
                  ...data.nce,
                  ...data.session,
                ]);
                setReassignModalHeading('Reassign Staff');
              });
              setShowReAssignModal(true);
            },
          },
          {
            label: 'Split Shift',
            action: (rowData) => {
              setRowData(rowData);
              setShowSplitShiftConfirmModal(true);
            },
          },
          {
            label: 'Role Time Details',
            action: () => {
              navigate(
                STAFFING_MANAGEMENT_BUILD_SCHEDULE.MODIFY_RTD.concat(
                  '?'
                ).concat(appendToLink)
              );
            },
          },
        ]
      : [
          {
            label: 'Unassign',
            action: (rowData) => {
              setRowData(rowData);
              setModalPopUp(true);
            },
          },
          {
            label: 'Reassign',
            action: (data) => {
              setRowData(data);
              if (resourceRequestedTabs === 'Vehicles') {
                setrecordName(data.assigned_vehicle);
                let data2 = fetchReassignData(null, data);
                data2
                  .then((val) => {
                    let drives = val.drive ? val.drive : [];
                    let sessions = val.session ? val.session : [];
                    let nce = val.nce ? val.nce : [];
                    setReAssignModalData([...drives, ...sessions, ...nce]);
                    setReassignModalHeading('Reassign Vehicle');
                    setShowReAssignModal(true);
                  })
                  .catch((error) => {
                    toast.error(
                      'Failed to Reassign Vehicle: Failed to Open Modal'
                    );
                  });
              } else {
                setrecordName(data.assigned_device);
                let data2 = fetchReassignData(null, data);
                data2
                  .then((val) => {
                    let drives = val.drive ? val.drive : [];
                    let sessions = val.session ? val.session : [];
                    let nce = val.nce ? val.nce : [];
                    setReAssignModalData([...drives, ...sessions, ...nce]);
                    setReassignModalHeading('Reassign Device');
                    setShowReAssignModal(true);
                  })
                  .catch((error) => {
                    toast.error(
                      'Failed to Reassign Device: Failed to Open Modal'
                    );
                  });
              }
            },
          },
        ];

  const handleSubmit = async (formData) => {
    //  ====== Custom Fields Form Data =======
    setDisableButton(true);

    const fieldsData = [];
    for (const key in formData) {
      if (key > 0) {
        const value = formData[key]?.value ?? formData[key];
        fieldsData.push({
          field_id: key,
          field_data:
            typeof value === 'object' && !Array.isArray(value)
              ? JSON.stringify(value)
              : value?.toString(),
        });
      }
    }
    try {
      let hasErrors = false;
      const checkRole = role.filter((item) => {
        return item.role === null;
      });
      if (checkRole.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            role: 'Role is required.',
          };
        });
        hasErrors = true;
      }
      const checkQuantity = role.filter((item) => {
        return item.quantity === '';
      });

      if (checkQuantity.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            quantity: 'Quantity is required.',
          };
        });
        hasErrors = true;
      }

      if (hasErrors) {
        setDisableButton(false);
        return;
      }

      const body = {
        // ====== Details Form ======
        role: role?.map((item) => {
          return {
            role_id: item.value,
            quantity: item.quantity,
          };
        }),
      };

      //this code block will be used later
      // const result = await makeAuthorizedApiRequest(
      //   'POST',
      //   `${BASE_URL}/drives`,
      //   JSON.stringify(body)
      // );
      // const { status, response } = await result.json();
      // if (status === 'success') {
      // setDisableButton(false);
      // setRedirection(true);
      // }
      // if (status === 'error') {
      //   // setDisableButton(false);
      //   toast.error(response, { autoClose: 3000 });
      // }
    } catch (err) {
      setDisableButton(false);
      toast.error(err);
    }
  };
  const refreshData = () => {
    setShowReAssignModal(false);
    if (resourceRequestedTabs === 'Staff') {
      fetchStaffData();
    } else if (resourceRequestedTabs === 'Vehicles') {
      fetchVehiclesData();
    } else {
      fetchDevicesData();
    }
  };
  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      fetchStaffData();
      fetchVehiclesData();
      fetchDevicesData();
    }, 500);
    setTabDataId(null);
  }, [shift_id]);

  useEffect(() => {
    getcertificate();
  }, [operation_id]);

  const reassignSetOperation = (operation) => {
    setOperation(operation);
  };

  useEffect(() => {
    switch (resourceRequestedTabs) {
      case 'Staff':
        setDataLength(requestedResourceData.length);
        break;
      case 'Vehicles':
        setDataLength(requestedVehiclesData.length);
        break;
      case 'Devices':
        setDataLength(requestedDevicesData?.length);
        break;
      default:
        break;
    }
  }, [resourceRequestedTabs]);

  useEffect(() => {
    // every time user selects another collection operation in reassign modal
    // if dropdown is cleared, do not fetch
    if (collectionOpForReassign !== null) {
      getReassignModalData(collectionOpForReassign);
    }
  }, [collectionOpForReassign]);

  useEffect(() => {
    if (!isLoading) {
      changeShiftStatus();
    }
  }, [
    assignedStaff,
    assignedStaffAdded,
    assignedDevices,
    assignedDevicesAdded,
    assignedVehicles,
    assignedVehiclesAdded,
    isLoading,
  ]);

  const changeShiftStatus = () => {
    const noStaffAssigned = assignedStaff === 0;
    const noDevicesAssigned = assignedDevices === 0;
    const noVehiclesAssigned = assignedVehicles === 0;
    const allStaffAssigned =
      requestedResourceData?.length > 0 &&
      assignedStaff === requestedResourceData?.length;
    const allDevicesAssigned =
      devicesData?.length > 0 && assignedDevices === devicesData?.length;
    const allVehiclesAssigned =
      vehiclesData?.length > 0 && assignedVehicles === vehiclesData;
    const additionalStaffAssigned =
      additionalData.length > 0 && assignedStaffAdded === additionalData.length;
    const additionalVehiclesAssigned =
      vehiclesAdditionalData.length > 0 &&
      assignedVehiclesAdded === vehiclesAdditionalData.length;
    const additionalDevicesAssigned =
      devicesAdditionalData.length > 0 &&
      assignedDevicesAdded === devicesAdditionalData.length;

    const completed =
      (allStaffAssigned && allVehiclesAssigned && allDevicesAssigned) ||
      (allStaffAssigned && allVehiclesAssigned && devicesData?.length == 0) ||
      (allStaffAssigned && allDevicesAssigned && vehiclesData?.length == 0) ||
      (allVehiclesAssigned &&
        allDevicesAssigned &&
        requestedResourceData?.length == 0) ||
      (allStaffAssigned &&
        vehiclesData?.length == 0 &&
        devicesData?.length == 0) ||
      (allVehiclesAssigned &&
        requestedResourceData?.length == 0 &&
        devicesData?.length == 0) ||
      (allDevicesAssigned &&
        requestedResourceData?.length == 0 &&
        vehiclesData?.length == 0);

    const additionalCompleted =
      (additionalStaffAssigned &&
        additionalVehiclesAssigned &&
        additionalDevicesAssigned) ||
      (additionalStaffAssigned &&
        additionalVehiclesAssigned &&
        devicesAdditionalData?.length == 0) ||
      (additionalStaffAssigned &&
        additionalDevicesAssigned &&
        vehiclesAdditionalData?.length == 0) ||
      (additionalVehiclesAssigned &&
        additionalDevicesAssigned &&
        requestedResourceData?.length == 0) ||
      (additionalStaffAssigned &&
        vehiclesAdditionalData?.length == 0 &&
        devicesAdditionalData?.length == 0) ||
      (additionalVehiclesAssigned &&
        requestedResourceData?.length == 0 &&
        devicesAdditionalData?.length == 0) ||
      (additionalDevicesAssigned &&
        requestedResourceData?.length == 0 &&
        vehiclesAdditionalData?.length == 0);

    // first check case when there is no additional data
    if (
      additionalData?.length === 0 &&
      vehiclesAdditionalData.length === 0 &&
      devicesAdditionalData.length === 0
    ) {
      if (completed) {
        // all requested is assigned
        props.setShiftStatus({ shift_id: shift_id, shift_status: 'Complete' });
      } else if (
        // all have to be == 0 in order for shift to be not started
        noStaffAssigned &&
        noDevicesAssigned &&
        noVehiclesAssigned
      ) {
        props.setShiftStatus({
          shift_id: shift_id,
          shift_status: 'Not Started',
        });
      } else {
        props.setShiftStatus({
          shift_id: shift_id,
          shift_status: 'Incomplete',
        });
      }
    } else {
      // in this ELSE block, some additional resource was requested
      if (completed && additionalCompleted) {
        props.setShiftStatus({ shift_id: shift_id, shift_status: 'Complete' }); // all is assigned, both additional and requested resource
      } else {
        props.setShiftStatus({
          shift_id: shift_id,
          shift_status: 'Incomplete',
        }); // something is unassigned
      }
      /* 
      in this case there is no 'Not Started' option 
      because as soon as additional data was requested,
      shift status cannot be Not Started  
      */
    }
  };

  const countObjectsWithStaffIdNotNull = (array) => {
    return array.reduce((count, item) => {
      // Check if staff_id is not null
      if (item.staff_id !== null && item.is_additional == false) {
        return count + 1;
      }
      return count;
    }, 0);
  };
  const countObjectsWithAdditionalStaffIdNotNull = (array) => {
    return array.reduce((count, item) => {
      // Check if staff_id is not null
      if (item.staff_id !== null && item.is_additional == true) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const countObjectsWithAssignedVehicleIdNotNull = (array) => {
    return array.reduce((count, item) => {
      // Check if staff_id is not null
      if (item.assigned_vehicle_id !== null) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const countObjectsWithAssignedDeviceIdNotNull = (array) => {
    return array.reduce((count, item) => {
      // Check if staff_id is not null
      if (item.assigned_device_id !== null) {
        return count + 1;
      }
      return count;
    }, 0);
  };
  return (
    <div className="row row-gap-4 detailsMain resourceRequested">
      <section className="col-6 col-md-6">
        <table className="viewTables w-100 mt-4" style={{ overflow: 'auto' }}>
          <thead>
            <tr>
              <th>
                <div
                  className={`d-flex align-items-center w-100 ${
                    resourceRequestedTabs === 'Staff' ? 'justify-between' : ''
                  }`}
                >
                  {resourceRequestedTabs === 'Staff' && (
                    <>
                      <p className="table-header-title">Staff Requested</p>
                      <div className="d-flex gap-2 align-items-center">
                        <div
                          className={
                            assignedStaff === requestedStaffCount.length
                              ? 'badge-pills badge-pills-bg-fully'
                              : 'badge-pills badge-pills-bg-available'
                          }
                        >
                          <p className="badge-pills-content">
                            {assignedStaff}/{requestedStaffCount.length}
                          </p>
                        </div>
                        {additionalData.length > 0 && (
                          <div
                            className={
                              assignedStaffAdded === additionalData.length
                                ? 'badge-pills badge-pills-bg-fully'
                                : 'badge-pills badge-pills-bg-available'
                            }
                          >
                            <p className="badge-pills-content">
                              {assignedStaffAdded}/{additionalData.length}
                            </p>
                          </div>
                        )}
                        {certificates.length > 0 && (
                          <div>
                            <ToolTip
                              text={certificates.map((certificate) => (
                                <ul
                                  style={{ margin: '0', paddingLeft: '1rem' }}
                                >
                                  <li>{certificate.name}</li>
                                </ul>
                              ))}
                              icon={<SvgComponent name={'BadgeIcon'} />}
                            />
                          </div>
                        )}
                      </div>
                      <p className="staffed-oef-content mb-0">
                        Staffed OEF: {staffOEF}
                      </p>
                    </>
                  )}
                  {resourceRequestedTabs === 'Staff' && (
                    <button
                      className="btn btn-link btn-md bg-transparent"
                      onClick={onUpdateHomeBase}
                    >
                      Update Home Base
                    </button>
                  )}

                  {resourceRequestedTabs === 'Vehicles' && (
                    <>
                      <p className="table-header-title">Vehicles Requested</p>
                      <div className="d-flex gap-2 align-items-center  ms-2">
                        <div
                          className={
                            assignedVehicles === vehiclesData.length
                              ? 'badge-pills badge-pills-bg-fully'
                              : 'badge-pills badge-pills-bg-available'
                          }
                        >
                          <p className="badge-pills-content">
                            {assignedVehicles}/{vehiclesData.length}
                          </p>
                        </div>
                        {additionalData.length > 0 && (
                          <div
                            className={
                              assignedVehiclesAdded ===
                              vehiclesAdditionalData.length
                                ? 'badge-pills badge-pills-bg-fully'
                                : 'badge-pills badge-pills-bg-available'
                            }
                          >
                            <p className="badge-pills-content">
                              {assignedVehiclesAdded}/
                              {vehiclesAdditionalData.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {resourceRequestedTabs === 'Devices' && (
                    <>
                      <p className="table-header-title">Devices Requested</p>
                      <div className="d-flex gap-2 align-items-center  ms-2">
                        <div
                          className={
                            assignedDevices === devicesData.length
                              ? 'badge-pills badge-pills-bg-fully'
                              : 'badge-pills badge-pills-bg-available'
                          }
                        >
                          <p className="badge-pills-content">
                            {assignedDevices}/{devicesData.length}
                          </p>
                        </div>
                        {additionalData.length > 0 && (
                          <div
                            className={
                              assignedDevicesAdded ===
                              devicesAdditionalData.length
                                ? 'badge-pills badge-pills-bg-fully'
                                : 'badge-pills badge-pills-bg-available'
                            }
                          >
                            <p className="badge-pills-content">
                              {assignedDevicesAdded}/
                              {devicesAdditionalData.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            className={`overflow-y-auto w-100 d-block`}
            style={{
              height: '364px',
            }}
          >
            <tr
              className="w-100 resource-requsted-table-fix-row top-nav-cont-row table-head-tabs"
              style={{ width: '100%' }}
            >
              <td
                colSpan="5"
                className="pb-0 nav-tabs-container"
                style={{ width: '100%' }}
              >
                <div className="filterBar p-0" style={{ width: '100%' }}>
                  <div className="tabs border-0 mb-0 w-100">
                    <ul>
                      <li>
                        <a
                          onClick={() => removeTabs('Staff')}
                          className={`requested-resource-nav-tab-item
                            ${
                              resourceRequestedTabs === 'Staff'
                                ? 'active'
                                : 'fw-medium'
                            }
                          `}
                        >
                          Staff
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => removeTabs('Vehicles')}
                          className={`requested-resource-nav-tab-item
                            ${
                              resourceRequestedTabs === 'Vehicles'
                                ? 'active'
                                : 'fw-medium'
                            }
                          `}
                        >
                          Vehicles
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => removeTabs('Devices')}
                          className={`requested-resource-nav-tab-item
                            ${
                              resourceRequestedTabs === 'Devices'
                                ? 'active'
                                : 'fw-medium'
                            }
                          `}
                        >
                          Devices
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
            {(resourceRequestedTabs.length ||
              requestedVehiclesData?.length ||
              requestedDevicesData?.length) > 0 ? (
              <tr
                className="bg-white resource-requsted-table-fix-row top-table-col-head-row title-col-head"
                style={{ width: '100%' }}
              >
                <td
                  className="tableTD tableHead"
                  style={{
                    width: resourceRequestedTabs === 'Staff' ? '30%' : '50%',
                  }}
                >
                  {resourceRequestedTabs === 'Staff' ? 'Role' : 'Type'}
                </td>
                <td
                  className="tableTD tableHead"
                  style={{
                    width: resourceRequestedTabs === 'Staff' ? '30%' : '50%',
                  }}
                >
                  Name
                </td>
                <td
                  className="tableTD tableHead"
                  style={{
                    width: '30%',
                    display: resourceRequestedTabs !== 'Staff' && 'none',
                  }}
                >
                  Home Base
                </td>
                <td
                  className="tableTD tableHead"
                  style={{
                    width: resourceRequestedTabs === 'Staff' ? '10%' : '10%',
                  }}
                ></td>
              </tr>
            ) : (
              <tr>
                <td colSpan="5" className="no-data text-sm text-center">
                  No data found
                </td>
              </tr>
            )}
            {requestedResourceData.length > 0 &&
              !isLoading &&
              resourceRequestedTabs === 'Staff' &&
              sortArrayBy(requestedResourceData, 'role_name').map(
                (item, index) => {
                  return (
                    <tr
                      key={`${item.role_id}-${index}`}
                      className={`${
                        selectedRow === index ? 'selected-row' : ''
                      }`}
                      style={{
                        cursor: 'pointer',
                      }}
                    >
                      <td
                        onClick={() => onRoleSelect(item, index)}
                        className="tableTD col1 tabel-cells-content"
                        style={{
                          width: '30%',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                      >
                        <div className="d-flex justify-between">
                          {item?.role_name}
                          {item?.is_additional && (
                            <SvgComponent name={'UserRolesIcon'} />
                          )}
                        </div>
                      </td>
                      <td
                        onClick={() => onRoleSelect(item, index)}
                        className="tableTD col2 tabel-cells-content"
                        style={{
                          width: '30%',
                          wordBreak: 'break-word',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                      >
                        {item?.staff_name !== null
                          ? item?.staff_name
                          : 'Unassigned'}
                      </td>
                      <td
                        onClick={() => onRoleSelect(item, index)}
                        className="tableTD col2 tabel-cells-content"
                        style={{
                          width: '20%',
                          wordBreak: 'break-word',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                      >
                        {item?.home_base === (null || '')
                          ? 'No Home Base'
                          : item?.home_base === 1
                          ? homeBaseEnum['1']
                          : item?.home_base === 2
                          ? homeBaseEnum['2']
                          : item?.home_base === 3
                          ? homeBaseEnum['3']
                          : 'No Home Base'}
                      </td>
                      <td
                        className="tableTD col2"
                        style={{
                          width: '20%',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                      >
                        {<span>{renderOptions(item)}</span>}
                      </td>
                    </tr>
                  );
                }
              )}
            {requestedVehiclesData?.length === 0 &&
              resourceRequestedTabs === 'Vehicles' && (
                <td className="tableTD col1 tabel-cells-content">
                  No Vehicle.
                </td>
              )}
            {requestedVehiclesData?.length > 0 &&
              resourceRequestedTabs === 'Vehicles' &&
              requestedVehiclesData?.map((item, index) => {
                return (
                  <tr
                    key={item.assigned_vehicle_id}
                    className={`${selectedRow === index ? 'selected-row' : ''}`}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    {item?.requested_vehicle_id && (
                      <td
                        className="tableTD col1 tabel-cells-content"
                        style={{
                          width: '30%',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                        onClick={() => onVehicleSelect(item, index)}
                      >
                        <div className="d-flex justify-between">
                          {item?.requested_vehicle_type}
                          {item?.is_additional && (
                            <SvgComponent name={'UserRolesIcon'} />
                          )}
                        </div>
                      </td>
                    )}
                    <td
                      className="tableTD col2 tabel-cells-content"
                      style={{
                        width: '20%',
                        wordBreak: 'break-word',
                        backgroundColor: item.pending_assignment
                          ? '#ff1e1e'
                          : undefined,
                      }}
                      onClick={() => onVehicleSelect(item, index)}
                    >
                      {item?.assigned_vehicle_id
                        ? item?.assigned_vehicle
                        : 'Unassigned'}
                    </td>
                    <td
                      className="tableTD col2"
                      style={{
                        width: '20%',
                        backgroundColor: item.pending_assignment
                          ? '#ff1e1e'
                          : undefined,
                      }}
                    >
                      {item?.requested_vehicle_id && (
                        <span>{renderOptions(item)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            {requestedDevicesData?.length === 0 &&
              resourceRequestedTabs === 'Devices' && (
                <td className="tableTD col1 tabel-cells-content">No Device.</td>
              )}
            {requestedDevicesData?.length > 0 &&
              resourceRequestedTabs === 'Devices' &&
              requestedDevicesData?.map((item, index) => {
                return (
                  <tr
                    key={item.assigned_device_id}
                    className={`${selectedRow === index ? 'selected-row' : ''}`}
                    style={{
                      cursor: 'pointer',
                    }}
                  >
                    {item?.requested_device_id && (
                      <td
                        className="tableTD col1 tabel-cells-content"
                        style={{
                          width: '30%',
                          wordBreak: 'break-word',
                          cursor: 'pointer',
                          backgroundColor: item.pending_assignment
                            ? '#ff1e1e'
                            : undefined,
                        }}
                        onClick={() => onDeviceSelect(item, index)}
                      >
                        <div className="d-flex justify-between">
                          {item?.requested_device_type}
                          {item?.is_additional && (
                            <SvgComponent name={'UserRolesIcon'} />
                          )}
                        </div>
                      </td>
                    )}

                    <td
                      className="tableTD col2 tabel-cells-content"
                      style={{
                        width: '20%',
                        wordBreak: 'break-word',
                        backgroundColor: item.pending_assignment
                          ? '#ff1e1e'
                          : undefined,
                      }}
                      onClick={() => onDeviceSelect(item, index)}
                    >
                      {item?.assigned_device_id
                        ? item?.assigned_device
                        : 'Unassigned'}
                    </td>
                    <td
                      className="tableTD col2"
                      style={{
                        width: '20%',
                        backgroundColor: item.pending_assignment
                          ? '#ff1e1e'
                          : undefined,
                      }}
                    >
                      {<span>{renderOptions(item)}</span>}
                    </td>
                  </tr>
                );
              })}
            {
              <tr className="resource-requsted-table-fix-row bottom-btn-container-row">
                <td colSpan="5">
                  <div className="d-flex w-100 justify-content-end">
                    <a
                      className="add-resource-requested-btn"
                      onClick={handleAddResource}
                    >
                      <div className="svg-container">
                        <SvgComponent name="TagsPlusIcon" />
                      </div>{' '}
                      Add {resourceRequestedTabs}
                    </a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
      {tabDataId && (
        <section className="col-6 col-md-6">
          <ResourcesAvailableSection
            requestedResourceType={resourceRequestedTabs}
            dataId={tabDataId}
            roleName={roleName}
            rowData={selectedData}
            schedule_id={schedule_id}
            scheduleEndDate={scheduleEndDate}
            scheduleStartDate={scheduleStartDate}
            operationId={operation_id}
            operationType={operation_type}
            date={operation_date}
            shiftId={shift_id}
            certifications={certificateIds}
            fetchStaffData={fetchStaffData}
            fetchVehiclesData={fetchVehiclesData}
            fetchDevicesData={fetchDevicesData}
            setTabDataId={setTabDataId}
            setSelectedRow={setSelectedRow}
            setRoleName={setRoleName}
            allData={requestedResourceData}
            collection_operation_id={collection_operation_id}
            setStaffAssignUnassignFlag={props.setStaffAssignUnassignFlag}
          />
        </section>
      )}
      <SplitShiftConfirmModal
        showConfirmation={showSplitShiftConfirmModal}
        onCancel={handleConfirmationCancel}
        onConfirm={handleConfirmationConfirm}
        onModifyRTD={handleConfirmationModifyRTD}
        icon={ConfirmationIcon}
        heading={'Confirmation'}
        description={
          'This staff person is scheduled for this operation from START TIME to END TIME and will be made available for other operations outside of these times. You can modify their RTD to change thses settings.'
        }
      />
      <AddRecordModal
        showConfirmation={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onConfirm={(data) => {
          addNewRecord(data);
        }}
        resourceType={resourceRequestedTabs.toLowerCase()}
      />
      <ReAssignModal
        recordName={recordName}
        showReassign={showReAssignModal}
        getData={getReassignModalData}
        modalData={reAssignModalData}
        shift_id={shift_id}
        record={rowData}
        operationDate={operationDate}
        resourceType={resourceRequestedTabs}
        heading={reassignModalHeading}
        cancelBtnText={'Cancel'}
        confirmBtnText={'Reassign'}
        onCancel={handleReAssignCancel}
        onConfirm={refreshData}
        collectionOperationValue={collectionOpForReassign}
        setCollectionOperationValue={setCollectionOpForReassign}
      />
      <section className={`popup full-section ${modalPopUp ? 'active' : ''}`}>
        <div className="popup-inner">
          <div className="icon">
            <img src={Success} className="bg-white" alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>
              Are you sure you want to unassign this{' '}
              {resourceRequestedTabs === 'Staff'
                ? 'Staff Member'
                : resourceRequestedTabs === 'Vehicles'
                ? 'Vehicle'
                : 'Device'}
              ?
            </p>
            <div className="buttons">
              <button
                className="btn btn-md btn-secondary"
                style={{ color: '#387de5' }}
                onClick={() => setModalPopUp(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-primary"
                onClick={() =>
                  resourceRequestedTabs === 'Staff'
                    ? unassignStaff(rowData)
                    : resourceRequestedTabs === 'Vehicles'
                    ? unassignVehicles()
                    : unassignDevices()
                }
              >
                Unassign
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResourceRequestedSection;
