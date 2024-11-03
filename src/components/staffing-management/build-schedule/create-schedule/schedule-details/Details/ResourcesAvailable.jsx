/* eslint-disable */
import React, { useEffect, useMemo, useState } from 'react';
import { Table } from './table/Table';
import { ScheduledDaysTableComponent } from './schedules-days-table-component/ScheduledDaysTableComponent';
import { Add } from './table-actions/Add';
import { ExtraHeaderComponent } from './extra-header-component/ExtraHeaderComponent';
import SelectDropdown from '../../../../../common/selectDropdown';
import { NameDetailComponent } from './name-detail-component/NameDetailComponent';
import { StaffNumberComponent } from './staff-number-component/StaffNumberComponent';
import { HourDetailComponent } from './hour-detail-component/HourDetailComponent';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

const typeTabsMap = {
  Staff: {
    title: 'Staff Available',
    extraTabsComponent: undefined,
    columns: {
      Primary: [
        {
          title: 'Name',
          value: 'name',
          renderComponent: (row) =>
            NameDetailComponent({
              firstName: row.firstName,
              lastName: row.lastName,
              reason: row.reason,
            }),
        },
        {
          title: 'Hours',
          value: 'hours',
          renderComponent: (row) =>
            HourDetailComponent({ text: row.hours, reason: row.hoursReason }),
        },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Secondary: [
        {
          title: 'Name',
          value: 'name',
          renderComponent: (row) =>
            NameDetailComponent({
              firstName: row.firstName,
              lastName: row.lastName,
            }),
        },
        {
          title: 'Hours',
          value: 'hours',
          renderComponent: (row) =>
            HourDetailComponent({ text: row.hours, reason: row.hoursReason }),
        },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Shared: [
        {
          title: 'Name',
          value: 'name',
          renderComponent: (row) =>
            NameDetailComponent({
              firstName: row.firstName,
              lastName: row.lastName,
            }),
        },
        {
          title: 'Hours',
          value: 'hours',
          renderComponent: (row) =>
            HourDetailComponent({ text: row.hours, reason: row.hoursReason }),
        },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Unavailable: [
        {
          title: 'Name',
          value: 'name',
          renderComponent: (row) =>
            NameDetailComponent({
              firstName: row.firstName,
              lastName: row.lastName,
            }),
        },
        {
          title: 'Hours',
          value: 'hours',
          renderComponent: (row) =>
            HourDetailComponent({ text: row.hours, reason: row.hoursReason }),
        },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
    },
  },
  Vehicles: {
    title: 'Vehicles Available',
    columns: {
      Primary: [
        { title: 'Name', value: 'vehicle_name' },
        { title: 'Certification', value: 'certifications' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Shared: [
        { title: 'Name', value: 'vehicle_name' },
        { title: 'Certification', value: 'certifications' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Unavailable: [
        { title: 'Name', value: 'vehicle_name' },
        { title: 'Certification', value: 'certifications' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
    },
  },
  Devices: {
    title: 'Devices Available',
    columns: {
      Primary: [
        { title: 'Name', value: 'device_name' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Shared: [
        { title: 'Name', value: 'device_name' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
      Unavailable: [
        { title: 'Name', value: 'device_name' },
        {
          title: 'Scheduled Days',
          value: 'scheduled_days',
          renderComponent: (row, selectedRow) =>
            ScheduledDaysTableComponent({
              scheduledDays: row.scheduled_days,
              selectedRow,
            }),
        },
        {
          title: '',
          value: '',
          renderComponent: (row, selectedRow) => {
            return (
              <Add onClick={() => row.add(row.id)} selectedRow={selectedRow} />
            );
          },
        },
      ],
    },
  },
};

const teamsDataTemplate = [
  {
    id: 1,
    name: 'Team 1',
  },
  {
    id: 2,
    name: 'Team 2',
  },
  {
    id: 3,
    name: 'Team 3',
  },
];

function ResourcesAvailableSection({
  roleName,
  setRoleName,
  requestedResourceType,
  dataId,
  date,
  schedule_id,
  performanceTypeEnum,
  operationType,
  operationId,
  shiftId,
  fetchStaffData,
  fetchVehiclesData,
  fetchDevicesData,
  setTabDataId,
  setSelectedRow,
  allData,
  collection_operation_id,
  setStaffAssignUnassignFlag,
  certifications,
  rowData,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [teamsData, setTeamsData] = useState(teamsDataTemplate);
  const [selectedTab, setSelectedTab] = useState({ name: 'Primary' });
  const [sharedUsersNumber, setSharedUsersNumber] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState();
  const [filteredData, setFilteredData] = useState();
  const [data, setData] = useState();
  const [roleTimes, setRoleTimes] = useState();
  const [dataLoading, setDataLoading] = useState();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const schedule_status = searchParams.get('schedule_status');
  let requested_device_type_id;
  let requested_vehicle_type_id;
  //todo: either populate through fe or be, the role default value
  const addStaff = (staffId, is_unavailable = false) => {
    const body = {
      staff_id: staffId,
      operation_type: operationType,
      role_id: dataId,
      lead_time: 0,
      travel_to_time: 0,
      setup_time: 0,
      breakdown_time: 0,
      travel_from_time: 0,
      wrapup_time: 0,
      clock_in_time: '2024-04-26T18:25:43.511Z',
      clock_out_time: '2024-04-29T18:25:43.511Z',
      total_hours: 0,
      is_additional: rowData.is_additional,
      home_base: 1,
      is_travel_time_included: false,
      is_published: schedule_status === 'Draft' ? false : true,
      pending_assignment: false,
      is_archived: false,
    };

    let data = allData.filter(
      (val) => val.role_id === dataId && val.staff_id === staffId
    );
    if (data.length === 0 && !is_unavailable) {
      setDataLoading(true);
      makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/staffing-management/schedules/operations/${operationId}/shifts/${shiftId}/staff-assignments`,
        JSON.stringify(body)
      ).then(() => {
        setTabDataId(null);
        setSelectedRow(null);
        setRoleName(null);
        fetchStaffData();
        setStaffAssignUnassignFlag(Math.floor(Math.random() * 100) + 1);
        setDataLoading(false);
      });
    } else {
      toast.error('Staff already assigned to another Role', {
        autoClose: 3000,
      });
      setDataLoading(false);
    }
  };

  const addVehicle = (vehicleId, is_unavailable = false) => {
    const body = {
      assigned_vehicle_id: vehicleId,
      operation_type: operationType,
      is_additional: false,
      is_published: schedule_status === 'Draft' ? false : true,
      reason: '',
      reassign_by: 1,
      operation_id: operationId,
      shift_id: shiftId,
      created_by: undefined,
      pending_assignment: false,
      requested_vehicle_type_id: requested_vehicle_type_id,
    };
    let data = allData.filter(
      (val) =>
        val.role_id === dataId && val.requested_vehicle_type_id === vehicleId
    );
    if (data.length === 0 && !is_unavailable) {
      setDataLoading(true);
      makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/staffing-management/schedules/operations/${operationId}/shifts/${shiftId}/vehicles-assignments`,
        JSON.stringify(body)
      )
        .then(() => {
          setTabDataId(null);
          setSelectedRow(null);
          setRoleName(null);
          fetchVehiclesData();
          setDataLoading(false);
        })
        .catch((error) => {
          console.error('Error occurred while making POST request:', error);
          toast.error('Failed to assign vehicle to the role', {
            autoClose: 3000,
          });
          setDataLoading(false);
        });
    } else {
      toast.error('Vehicle already assigned to another Role', {
        autoClose: 3000,
      });
      setDataLoading(false);
    }
  };

  const addDevice = (deviceId, is_unavailable = false) => {
    const body = {
      assigned_device_id: deviceId,
      operation_type: operationType,
      is_additional: false,
      is_published: schedule_status === 'Draft' ? false : true,
      reason: '',
      reassign_by: 1,
      operation_id: operationId,
      shift_id: shiftId,
      created_by: undefined,
      pending_assignment: false,
      device_assignment_id: 1,
      requested_device_type_id: requested_device_type_id,
    };
    let data = allData.filter(
      (val) =>
        val.role_id === dataId && val.requested_device_type_id === deviceId
    );
    if (data.length === 0 && !is_unavailable) {
      setDataLoading(true);
      makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/staffing-management/schedules/operations/${operationId}/shifts/${shiftId}/devices-assignments`,
        JSON.stringify(body)
      )
        .then(() => {
          setTabDataId(null);
          setSelectedRow(null);
          setRoleName(null);
          fetchDevicesData();
          setDataLoading(false);
        })
        .catch((error) => {
          console.error('Error occurred while making POST request:', error);
          toast.error('Failed to assign device to the role', {
            autoClose: 3000,
          });
          setDataLoading(false);
        });
    } else {
      toast.error('Device already assigned to another Role', {
        autoClose: 3000,
      });
      setDataLoading(false);
    }
  };

  const tabs = useMemo(
    () =>
      ({
        Staff: [
          {
            name: 'Primary',
          },
          {
            name: 'Secondary',
          },
          {
            name: 'Shared',
            extraComponent: (
              <StaffNumberComponent number={sharedUsersNumber ?? 0} />
            ),
          },
          { name: 'Unavailable' },
        ],
        Vehicles: [
          { name: 'Primary' },
          { name: 'Shared' },
          { name: 'Unavailable' },
        ],
        Devices: [
          { name: 'Primary' },
          { name: 'Shared' },
          { name: 'Unavailable' },
        ],
      })[requestedResourceType],
    [sharedUsersNumber, requestedResourceType]
  );

  useEffect(() => {
    getTeams();
    tabs && setSelectedTab(tabs[0].name);
    if (requestedResourceType && dataId) {
      calculateDataForTabs('Primary');
    }
  }, [requestedResourceType, dataId]);

  const formatScheduledDays = (scheduleDates) => {
    return scheduleDates.map((date) => {
      if (date) {
        //between shiftt dates or schedule dates ???
        return new Date(date).getDay();
      }
    });
  };

  const getCertificationSettings = (staff, type) => {
    const reasons = [];
    const classification = staff?.staff_classification;
    const daysPerWeek = staff.assigned_hours > 0 ? staff.assigned_hours / 8 : 0;

    if (staff.staff_classification === null) reasons.push('No Classification');

    if (!staff.is_certified) {
      reasons.push('Not Certified');
    } else if (staff.is_certificate_expired) {
      reasons.push('Certification Expired');
    }

    if (staff?.assigned_hours > classification?.maximum_hours_per_week)
      reasons.push('Max Hours Exceeded');

    if (daysPerWeek > classification?.maximum_days_per_week)
      reasons.push('Max Days Exceeded');

    if (!staff?.is_available) reasons.push('PTO');

    if (staff?.already_scheduled) reasons.push('Other Assignments');

    //These do not apply to primary tab
    if (type != 'primary') {
      if (
        !staff.already_scheduled &&
        staff.is_available &&
        reasons.length == 0
      ) {
      } else {
        if (staff?.assigned_hours < classification?.minimum_hours_per_week)
          reasons.push('Min Hours Not Met');

        if (daysPerWeek < classification?.minimum_days_per_week)
          reasons.push('Min Days Not Met');
      }
    }

    return reasons;
  };

  function comparePrimary(a, b) {
    if (
      (a?.target_hours == 0 &&
        b?.target_hours == 0 &&
        a?.assigned_hours == 0 &&
        b?.assigned_hours == 0) ||
      a?.assigned_hours == null ||
      b?.assigned_hours == null ||
      a?.target_hours == null ||
      b?.target_hours == null
    )
      return 0;

    const aVal = Math.abs(a.target_hours - a.assigned_hours),
      bVal = Math.abs(b.target_hours - b.assigned_hours);

    return bVal - aVal;
  }

  function compareSecondary(a, b) {
    return b.is_preferred - a.is_preferred;
  }

  const formatData = (data) => {
    switch (requestedResourceType) {
      case 'Staff': {
        return data?.data
          ?.map((staff) => {
            return {
              id: staff.id,
              type: 'staff',
              firstName: staff.first_name,
              lastName: staff.last_name,
              hours: `${parseInt(staff?.assigned_hours)}/${parseInt(
                staff?.target_hours
              )}`,
              scheduled_days: formatScheduledDays(staff.schedule_dates),
              teams: staff.teams,
              reason: staff.is_preferred ? 'Preferred' : undefined,
              hoursReason: combineStrings(staff.staff_classification),
              target_hours: staff?.target_hours ?? 0,
              assigned_hours: staff?.assigned_hours ?? 0,
              is_preferred: staff?.is_preferred,
              is_unavailable: staff.is_unavailable,
              add: addStaff,
            };
          })
          .sort((a, b) => comparePrimary(a, b) || compareSecondary(a, b));
      }
      case 'Vehicles': {
        return data?.data?.map((vehicle) => {
          requested_vehicle_type_id = vehicle.vehicle_type_id;
          return {
            ...vehicle,
            id: vehicle.vehicle_id,
            scheduled_days: formatScheduledDays(vehicle.scheduled_dates),
            is_unavailable: vehicle.is_unavailable,
            add: addVehicle,
          };
        });
      }
      case 'Devices': {
        return data?.data?.map((device) => {
          requested_device_type_id = device.device_type_id;
          return {
            ...device,
            id: device.device_id,
            scheduled_days: formatScheduledDays(device.scheduled_dates),
            is_unavailable: device.is_unavailable,
            add: addDevice,
          };
        });
      }
      default: {
        return data?.data
          ?.map((staff) => {
            return {
              id: staff.id,
              type: 'staff',
              firstName: staff.first_name,
              lastName: staff.last_name,
              hours: `${parseInt(staff?.assigned_hours)}/${parseInt(
                staff?.target_hours
              )}`,
              scheduled_days: formatScheduledDays(staff.schedule_dates),
              teams: staff.teams,
              reason: staff.is_preferred ? 'Preferred' : undefined,
              hoursReason: combineStrings(staff.staff_classification),
              target_hours: staff?.target_hours ?? 0,
              assigned_hours: staff?.assigned_hours ?? 0,
              is_preferred: staff?.is_preferred,
              add: addStaff,
            };
          })
          .sort((a, b) => comparePrimary(a, b) || compareSecondary(a, b));
      }
    }
  };

  function combineStrings(stringArray) {
    if (!Array.isArray(stringArray) || stringArray.length === 0) {
      return '';
    }

    return stringArray.join(', ');
  }

  const onTabChange = async (tab) => {
    if (tab === 'Shared') {
      calculateSharedTabData();
    } else {
      calculateDataForTabs(tab);
    }
    setSelectedTab(tab);
  };

  const calculateSharedTabData = async () => {
    switch (requestedResourceType) {
      case 'Staff': {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/view-schedules/staff-schedules/shared-staff/${shiftId}?role_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&certifications=${certifications}`
        );
        const staffData = await result.json();
        const sharedData = [];
        if (staffData?.data.length > 0) {
          staffData?.data.forEach((userData) => {
            userData.staff_classification = getCertificationSettings(
              userData,
              'shared'
            );

            if (!userData.already_scheduled && userData.is_available) {
              sharedData.push(userData);
            }
          });
        }

        setSharedUsersNumber(sharedData.length);
        setData(
          formatData({
            data: sharedData,
          })
        );
        break;
      }
      case 'Vehicles': {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/shared-vehicles?vehicle_type_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&is_published=${
            schedule_status === 'Draft' ? false : true
          }`
        );
        const vehiclesData = await result.json();
        setSharedUsersNumber(vehiclesData.data.length);
        setData(formatData(vehiclesData));
        break;
      }
      case 'Devices': {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/shared-devices?device_type_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&is_published=${
            schedule_status === 'Draft' ? false : true
          }`
        );
        const devicesData = await result.json();
        setSharedUsersNumber(devicesData.data.length);
        setData(formatData(devicesData));
        break;
      }
      default: {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/view-schedules/staff-schedules/shared-staff/${shiftId}?role_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&certifications=${certifications}`
        );
        const staffData = await result.json();
        const sharedData = [];
        if (staffData?.data.length > 0) {
          staffData?.data.forEach((userData) => {
            userData.staff_classification = getCertificationSettings(
              userData,
              'shared'
            );

            if (!userData.already_scheduled && userData.is_available) {
              sharedData.push(userData);
            }
          });
        }

        setSharedUsersNumber(sharedData.length);
        setData(
          formatData({
            data: sharedData,
          })
        );
        break;
      }
    }
  };

  const calculateDataForTabs = async (tab) => {
    switch (requestedResourceType) {
      case 'Staff': {
        calculateDataForStaffTabs(tab);
        break;
      }
      case 'Vehicles': {
        calculateDataForVehiclesTabs(tab);
        break;
      }
      case 'Devices': {
        calculateDataForDevicesTabs(tab);
        break;
      }
      default: {
        calculateDataForStaffTabs(tab);
        break;
      }
    }
  };

  const calculateDataForStaffTabs = async (tab) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/view-schedules/staff-schedules/available-staff/${shiftId}?role_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&schedule_id=${schedule_id}&certifications=${certifications}`
    );
    const staffData = await result.json();

    setRoleTimes(staffData.role_times);
    if (tab === 'Primary') {
      const primary = [];
      let primaryData = [];
      staffData.data.forEach((userData) => {
        userData.staff_classification = getCertificationSettings(
          userData,
          'primary'
        );
        if (
          !userData.already_scheduled &&
          userData.is_available &&
          userData.staff_classification.length == 0 &&
          userData.is_certified &&
          !userData.is_certificate_expired
        ) {
          primary.push(userData);
        }
      });

      const result2 = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/view-schedules/staff-schedules/shared-staff/${shiftId}?role_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&certifications=${certifications}`
      );
      const staffData2 = await result2.json();
      const sharedData = [];
      if (staffData2?.data.length > 0) {
        staffData2?.data.forEach((userData) => {
          userData.staff_classification = getCertificationSettings(
            userData,
            'shared'
          );

          if (!userData.already_scheduled && userData.is_available) {
            sharedData.push(userData);
          }
        });
      }

      primaryData = primary.filter(
        (item1) => !sharedData.some((item2) => item1.id === item2.id)
      );
      setSharedUsersNumber(sharedData.length);
      setData(
        formatData({
          ...staffData,
          data: primaryData,
        })
      );
    } else if (tab === 'Secondary') {
      let secondary = [];
      let secondaryData = [];
      staffData.data.forEach((userData) => {
        userData.staff_classification = getCertificationSettings(
          userData,
          'secondary'
        );
        if (
          userData.is_available &&
          !userData.already_scheduled &&
          userData.staff_classification.length > 0
        ) {
          secondary.push(userData);
        }
      });
      const result2 = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/view-schedules/staff-schedules/shared-staff/${shiftId}?role_id=${dataId}&is_active=true&date=${date}&collection_operation_id=${collection_operation_id}&certifications=${certifications}`
      );
      const staffData2 = await result2.json();
      const sharedData = [];
      if (staffData2?.data.length > 0) {
        staffData2?.data.forEach((userData) => {
          userData.staff_classification = getCertificationSettings(
            userData,
            'shared'
          );

          if (!userData.already_scheduled && userData.is_available) {
            sharedData.push(userData);
          }
        });
      }
      secondaryData = secondary.filter(
        (item1) => !sharedData.some((item2) => item1.id === item2.id)
      );

      setSharedUsersNumber(sharedData.length);
      setData(
        formatData({
          ...staffData,
          data: secondaryData,
        })
      );
    } else if (tab === 'Unavailable') {
      const unavailableData = [];
      staffData.data.forEach((userData) => {
        if (userData.already_scheduled) {
          userData.staff_classification = getCertificationSettings(
            userData,
            'unavailable'
          );
          userData.is_unavailable = true;
          unavailableData.push(userData);
        }
      });

      setData(
        formatData({
          ...staffData,
          data: unavailableData,
        })
      );
    }
  };

  const calculateDataForVehiclesTabs = async (tab) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/staffing-management/schedules/available-vehicles?vehicle_type_id=${dataId}&is_active=true&operationDate=${date}&shift_id=${shiftId}&operation_id=${operationId}&operation_type=${operationType}&collection_operation_id=${collection_operation_id}&is_published=${
        schedule_status === 'Draft' ? false : true
      }`
    );
    const vehiclesData = await result.json();
    if (tab === 'Primary') {
      const primaryData = [];
      vehiclesData.data.forEach((userData) => {
        if (userData.is_available && userData.already_scheduled === false) {
          primaryData.push(userData);
        }
      });
      setData(
        formatData({
          ...vehiclesData,
          data: primaryData,
        })
      );
    } else if (tab === 'Unavailable') {
      const unavailableData = [];
      vehiclesData.data.forEach((userData) => {
        if (
          userData.is_available === false ||
          userData.already_scheduled === true
        ) {
          userData.is_unavailable = true;
          unavailableData.push(userData);
        }
      });
      setData(
        formatData({
          ...vehiclesData,
          data: unavailableData,
        })
      );
    }
  };

  const calculateDataForDevicesTabs = async (tab) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/staffing-management/schedules/available-devices?device_type_id=${dataId}&is_active=true&operationDate=${date}&shift_id=${shiftId}&operation_id=${operationId}&operation_type=${operationType}&collection_operation_id=${collection_operation_id}&is_published=${
        schedule_status === 'Draft' ? false : true
      }`
    );
    const devicesData = await result.json();
    if (tab === 'Primary') {
      const primaryData = [];
      devicesData.data.forEach((userData) => {
        if (userData.is_available && userData.already_scheduled === false) {
          primaryData.push(userData);
        }
      });
      setData(
        formatData({
          ...devicesData,
          data: primaryData,
        })
      );
    } else if (tab === 'Unavailable') {
      const unavailableData = [];
      devicesData.data.forEach((userData) => {
        if (
          userData.is_available === false ||
          userData.already_scheduled === true
        ) {
          userData.is_unavailable = true;
          unavailableData.push(userData);
        }
      });
      setData(
        formatData({
          ...devicesData,
          data: unavailableData,
        })
      );
    }
  };

  const [hasSelectedTeamBefore, setHasSelectedTeamBefore] = useState(false);
  const [isDataFiltered, setIsDataFiltered] = useState(false);

  useEffect(() => {
    if (selectedTeam) {
      setHasSelectedTeamBefore(true);
      const newDataArr = [];
      data.forEach((userData) => {
        if (userData.teams.includes(selectedTeam.value)) {
          newDataArr.push(userData);
        }
      });
      setFilteredData(newDataArr);
      setIsDataFiltered(true);
    } else if (selectedTeam == null && hasSelectedTeamBefore) {
      setHasSelectedTeamBefore(false);
      calculateDataForTabs(selectedTab);
      setIsDataFiltered(false);
    }
  }, [selectedTab, selectedTeam]);

  const getTeams = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/staff-admin/teams?status=true`
    );
    const responseData = await result.json();
    if (result.ok || result.status === 200) {
      const teamsArray = [];
      responseData.data.forEach((team) => {
        teamsArray.push({ id: team.id, name: team.name });
      });
      setTeamsData(teamsArray);
    } else {
      toast.error('Error Fetching Teams', { autoClose: 3000 });
    }
  };

  const extraHeaderComponent = {
    Staff: {
      Primary: () =>
        ExtraHeaderComponent({
          title:
            roleTimes !== null
              ? `${roleName} (${roleTimes?.clock_in_time} - ${roleTimes?.clock_out_time} | ${roleTimes?.total_hours})`
              : `${roleName} (No RTD)`,
        }),
      Secondary: () =>
        ExtraHeaderComponent({
          title:
            roleTimes !== null
              ? `${roleName} (${roleTimes?.clock_in_time} - ${roleTimes?.clock_out_time} | ${roleTimes?.total_hours})`
              : `${roleName} (No RTD)`,
        }),
      Shared: () =>
        ExtraHeaderComponent({
          title:
            roleTimes !== null
              ? `${roleName} (${roleTimes?.clock_in_time} - ${roleTimes?.clock_out_time} | ${roleTimes?.total_hours})`
              : `${roleName} (No RTD)`,
        }),
      Unavailable: () =>
        ExtraHeaderComponent({
          title:
            roleTimes !== null
              ? `${roleName} (${roleTimes?.clock_in_time} - ${roleTimes?.clock_out_time} | ${roleTimes?.total_hours})`
              : `${roleName} (No RTD)`,
        }),
    },
    Vehicles: {},
    Devices: {},
  };

  const extraTabsComponent = () => (
    <SelectDropdown
      customHeight={40}
      options={teamsData.map((team) => ({
        value: team.id,
        label: team.name,
      }))}
      selectedValue={selectedTeam}
      onChange={setSelectedTeam}
      removeDivider
      placeholder="Select Team"
    />
  );

  return (
    <div
      onClickCapture={(e) => {
        dataLoading && e.stopPropagation();
      }}
    >
      <Table
        {...typeTabsMap[requestedResourceType]}
        extraHeaderComponent={
          extraHeaderComponent[requestedResourceType][selectedTab]
        }
        extraTabsComponent={
          requestedResourceType === 'Staff' ? extraTabsComponent : undefined
        }
        tabs={tabs ?? []}
        data={isDataFiltered ? filteredData : data}
        onTabChange={onTabChange}
        defaultTab={selectedTab}
      />
    </div>
  );
}

export default ResourcesAvailableSection;
