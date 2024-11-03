import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import styles from './device.module.scss';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
// import jwt from 'jwt-decode';
import { toast } from 'react-toastify';

import 'react-datepicker/dist/react-datepicker.css';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
// import axios from 'axios';
import SuccessPopUpModal from '../../../../../common/successModal';
import moment from 'moment';
import CancelModalPopUp from '../../../../../common/cancelModal';

const DeviceScheduleMaintenance = ({ deviceId, maintenanceId }) => {
  const bearerToken = localStorage.getItem('token');
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isStateDirty, setIsStateDirty] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [reduceSlots, setReduceSlots] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [retireDate, setRetireDate] = useState('');
  const [deviceShareMaintenaceData, setDeviceShareMaintenaceData] = useState(
    []
  );
  const [errors, setErrors] = useState({
    start_date: '',
    end_date: '',
    description: '',
  });
  const BreadcrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: maintenanceId
        ? 'Edit Schedule Maintenance'
        : 'Schedule Maintenance',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/organization-admin/resources/devices/${deviceId}/schedule-maintenance${
        maintenanceId ? `/${maintenanceId}` : ''
      }`,
    },
  ];

  useEffect(() => {
    const getDeviceData = async (deviceId) => {
      const result = await fetch(`${BASE_URL}/devices/${deviceId}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        setRetireDate(data.retire_on);
      } else {
        toast.error('Error Fetching Vehicle Details', { autoClose: 3000 });
      }
    };
    const getShareMaintenaceData = async (deviceId) => {
      const bearerToken = localStorage.getItem('token');
      const maintenanceResult = await fetch(
        `${BASE_URL}/devices/${deviceId}/maintenances`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const deviceShareResult = await fetch(
        `${BASE_URL}/devices/${deviceId}/shares`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const { data: maintenaceData } = await maintenanceResult.json();
      const { data: deviceShareData } = await deviceShareResult.json();
      if (
        (maintenanceResult.ok || maintenanceResult.status === 200) &&
        (deviceShareResult.ok || deviceShareResult.status === 200)
      ) {
        const maintenace = maintenaceData.filter(
          (item) => item.dm_id !== maintenanceId
        );
        // Iterate over vehicleShareData to get start and end dates
        const deviceShareDates = deviceShareData.map((item) => ({
          start: new Date(moment(item.ds_start_date).startOf('day').format()),
          end: new Date(moment(item.ds_end_date).endOf('day').format()),
        }));
        // Extract start and end dates from maintenace
        const maintenaceDates = maintenace.map((item) => ({
          start: new Date(
            moment(item.dm_start_date_time).startOf('day').format()
          ),
          end: new Date(moment(item.dm_end_date_time).endOf('day').format()),
        }));

        const combinedData = [...maintenaceDates, ...deviceShareDates];
        setDeviceShareMaintenaceData(combinedData);
      } else {
        toast.error('Error Fetching Vehicle Maintenance Details', {
          autoClose: 3000,
        });
      }
    };
    const getMaintenaceData = async (maintenanceId) => {
      const bearerToken = localStorage.getItem('token');
      const result = await fetch(
        `${BASE_URL}/devices/${deviceId}/maintenances/${maintenanceId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        data = data[0];
        setStartDate(new Date(data.start_date_time));
        setEndDate(new Date(data.end_date_time));
        setDescription(data.description);
        setReduceSlots(data.reduce_slots);
      } else {
        toast.error('Error Fetching Vehicle Maintenance Details', {
          autoClose: 3000,
        });
      }
    };
    if (maintenanceId) {
      getMaintenaceData(maintenanceId);
      getShareMaintenaceData(deviceId);
      getDeviceData(deviceId);
    } else {
      getDeviceData(deviceId);
      getShareMaintenaceData(deviceId);
    }
  }, [deviceId, maintenanceId]);

  const handleOnBlur = async (key, value) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: `${(key.charAt(0).toUpperCase() + key.slice(1)).replace(
          /_/g,
          ' '
        )} is required.`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: '',
      }));
    }
  };
  const checkDateOverlap = () => {
    // Convert shareStartDate and shareEndDate to Date objects
    const shareStart = new Date(startDate);
    const shareEnd = new Date(endDate);

    // Loop through the dateRanges array and check for overlap
    for (const dateRange of deviceShareMaintenaceData) {
      const rangeStart = new Date(dateRange.start);
      const rangeEnd = new Date(dateRange.end);

      // Check for overlap
      if (shareStart <= rangeEnd && shareEnd >= rangeStart) {
        return true; // Overlapping dates found
      }
    }

    return false; // No overlapping dates found
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitCondition = !startDate || !endDate || !description;
      if (submitCondition) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          start_date: !startDate ? 'Start date is required.' : '',
          end_date: !endDate ? 'End date is required.' : '',
          description: !description ? 'Description is required.' : '',
        }));
        return;
      }
      if (checkDateOverlap()) {
        toast.error(
          'Device maintenance overlap with device maintenance or share dates.'
        );
        return;
      }
      const body = {
        start_date_time: new Date(startDate).toISOString(),
        end_date_time: new Date(endDate).toISOString(),
        description: description,
        reduce_slots: reduceSlots,
      };
      setIsSubmitting(true);
      if (maintenanceId) {
        const res = await fetch(
          `${BASE_URL}/devices/${deviceId}/maintenances/${maintenanceId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
            body: JSON.stringify(body),
          }
        );
        let { status, response } = await res.json();
        if (status === 'success') {
          // Handle successful response
          setSuccessModal(true);
        } else if (response?.status === 400) {
          toast.error('Failed to schedule Device maintenance.', {
            autoClose: 3000,
          });
          // Handle bad request
        } else {
          toast.error('Failed to schedule Device maintenance.', {
            autoClose: 3000,
          });
        }
        setIsSubmitting(false);
      } else {
        const res = await fetch(
          `${BASE_URL}/devices/${deviceId}/maintenances`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
            body: JSON.stringify(body),
          }
        );
        let { status, response } = await res.json();
        if (status === 'success') {
          // Handle successful response
          setSuccessModal(true);
        } else if (response?.status === 400) {
          toast.error('Failed to schedule Device maintenance.', {
            autoClose: 3000,
          });
          // Handle bad request
        } else {
          toast.error('Failed to schedule Device maintenance.', {
            autoClose: 3000,
          });
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const filterStartTime = (time) => {
    const currentDate = new Date(startDate);
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };
  const filterCurrentTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Devices'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner mt-5">
        <form className={styles.device}>
          <div className="formGroup mt-5">
            <h5>{maintenanceId ? 'Edit ' : ''}Schedule Maintenance</h5>
            <div className="form-field">
              <div className="field">
                <DatePicker
                  showTimeSelect
                  filterTime={filterCurrentTime}
                  minDate={new Date()}
                  maxDate={retireDate ? new Date(retireDate) : ''}
                  dateFormat="Pp"
                  className="custom-datepicker"
                  placeholderText="Start Date/Time*"
                  selected={startDate}
                  excludeDateIntervals={deviceShareMaintenaceData}
                  onBlur={(e) => handleOnBlur('start_date', e.target.value)}
                  onChange={(date) => {
                    handleOnBlur('start_date', date);
                    setIsStateDirty(true);
                    if (date === null || date === undefined) {
                      handleOnBlur('start_date', date);
                      setStartDate(date);
                    } else if (date < new Date()) {
                      setStartDate(new Date());
                    } else {
                      setStartDate(date);
                    }
                    setEndDate('');
                  }}
                />
              </div>
              {errors?.start_date && (
                <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                  <p>{errors.start_date}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                <DatePicker
                  minDate={new Date(startDate).setMinutes(
                    new Date(startDate).getMinutes() + 1
                  )}
                  filterTime={filterStartTime}
                  maxDate={retireDate ? new Date(retireDate) : ''}
                  showTimeSelect
                  dateFormat="Pp"
                  excludeDateIntervals={deviceShareMaintenaceData}
                  onBlur={(e) => handleOnBlur('end_date', e.target.value)}
                  className="custom-datepicker"
                  placeholderText="End Date/Time*"
                  selected={endDate}
                  onChange={(date) => {
                    handleOnBlur('end_date', date);
                    setIsStateDirty(true);
                    if (date === null || date === undefined) {
                      handleOnBlur('end_date', date);
                      setEndDate(date);
                    } else if (date <= startDate) {
                      const newEndDate = new Date(date);
                      newEndDate.setHours(new Date(startDate).getHours());
                      newEndDate.setMinutes(
                        new Date(startDate).getMinutes() + 1
                      );
                      setEndDate(newEndDate);
                    } else {
                      setEndDate(date);
                    }
                  }}
                />
              </div>
              {errors?.end_date && (
                <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                  <p>{errors.end_date}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                <textarea
                  type="text"
                  className="form-control"
                  placeholder="Description*"
                  name="description"
                  value={description}
                  onChange={(e) => {
                    setIsStateDirty(true);
                    setDescription(e.target.value);
                  }}
                  onBlur={(e) => handleOnBlur('description', e.target.value)}
                />
              </div>
              {errors?.description && (
                <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                  <p>{errors.description}</p>
                </div>
              )}
            </div>

            <div className="form-field"></div>

            <div className="form-field checkbox">
              <span className="toggle-text">Reduce Slots</span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  name="reduce_slots"
                  checked={reduceSlots}
                  onChange={(e) => {
                    setIsStateDirty(true);
                    setReduceSlots(e.target.checked);
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>
        <div className="form-footer">
          <button
            className="btn btn-md btn-link me-0 pe-4"
            onClick={() => (isStateDirty ? setCancelModal(true) : navigate(-1))}
          >
            Cancel
          </button>
          {maintenanceId ? (
            <>
              <button
                type="submit"
                className="btn btn-md btn-secondary"
                onClick={(e) => {
                  setIsNavigate(true);
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
              >
                Save & Close
              </button>
              <button
                type="button"
                className="btn btn-md btn-primary"
                onClick={(e) => {
                  setIsNavigate(false);
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-md btn-primary"
              onClick={(e) => {
                setIsNavigate(true);
                handleSubmit(e);
              }}
              disabled={isSubmitting}
            >
              Create
            </button>
          )}
        </div>
      </div>
      <SuccessPopUpModal
        title={'Success!'}
        message={`Device Maintenance ${
          maintenanceId ? 'updated' : 'scheduled'
        }.`}
        modalPopUp={successModal}
        setModalPopUp={setSuccessModal}
        showActionBtns={true}
        isNavigate={isNavigate}
        redirectPath={-1}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={cancelModal}
        isNavigate={true}
        setModalPopUp={setCancelModal}
        redirectPath={-1}
      />
    </div>
  );
};

export default DeviceScheduleMaintenance;
