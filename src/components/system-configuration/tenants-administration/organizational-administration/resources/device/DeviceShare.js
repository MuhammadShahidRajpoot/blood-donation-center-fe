import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import styles from './device.module.scss';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import jwt from 'jwt-decode';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../../common/successModal';
import CancelModalPopUp from '../../../../../common/cancelModal';
import * as yup from 'yup';
import 'react-datepicker/dist/react-datepicker.css';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
// import axios from 'axios';
import SelectDropdown from '../../../../../common/selectDropdown';
import moment from 'moment';

const DeviceShare = ({ deviceId, shareId }) => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const shareType = 'Device';
  const bearerToken = localStorage.getItem('token');

  const [id, setId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [isStateDirty, setIsStateDirty] = useState(false);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [errors, setErrors] = useState({
    start_date: '',
    end_date: '',
    from: '',
    to: '',
  });
  // const [maintenanceData, setMaintenanceData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retireDate, setRetireDate] = useState('');
  const [deviceShareMaintenaceData, setDeviceShareMaintenaceData] = useState(
    []
  );

  const BreadcrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: shareId ? 'Edit Share Device' : 'Share Device',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/organization-admin/resources/devices/${deviceId}/share${
        shareId ? `/${shareId}` : ''
      }`,
    },
  ];
  const validationSchema = yup.object({
    start_date: yup.string().required('Start Date is required.'),
    end_date: yup.string().required('End Date is required.'),
    from: yup.string().required('From is required.'),
    to: yup.string().required('To is required.'),
  });

  useEffect(() => {
    const getData = async (deviceId, retire = false) => {
      const result = await fetch(`${BASE_URL}/devices/${deviceId}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        if (retire) {
          setRetireDate(data.retire_on);
        } else {
          setRetireDate(data.retire_on);
          setFrom({
            value: data?.collection_operation?.id,
            label: data?.collection_operation?.name,
          });
        }
      } else {
        toast.error('Error Fetching Vehicle Details', { autoClose: 3000 });
      }
    };

    const getShareData = async (shareId) => {
      const result = await fetch(
        `${BASE_URL}/devices/${deviceId}/share/${shareId}`,
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
        setFrom({
          value: data.from.id,
          label: data.from.name,
        });
        setTo({
          value: data.to.id,
          label: data.to.name,
        });
        setStartDate(new Date(data.start_date));
        setEndDate(new Date(data.end_date));
      } else {
        toast.error('Error Fetching Vehicle Details', { autoClose: 3000 });
      }
    };

    const getShareMaintenaceData = async (vehicleId) => {
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
        const deviceShare = deviceShareData.filter(
          (item) => item.ds_id !== shareId
        );
        // Iterate over deviceShare to get start and end dates
        const deviceShareDates = deviceShare.map((item) => ({
          start: new Date(moment(item.ds_start_date).startOf('day').format()),
          end: new Date(moment(item.ds_end_date).endOf('day').format()),
        }));
        // Extract start and end dates from maintenaceData
        const maintenaceDates = maintenaceData.map((item) => ({
          start: new Date(
            moment(item.dm_start_date_time).startOf('day').format()
          ),
          end: new Date(moment(item.dm_end_date_time).endOf('day').format()),
        }));

        const combinedData = [...maintenaceDates, ...deviceShareDates];
        setDeviceShareMaintenaceData(combinedData);
      } else {
        toast.error('Error Fetching Device Maintenance Details', {
          autoClose: 3000,
        });
      }
    };

    if (shareId) {
      getShareData(shareId);
      getShareMaintenaceData(deviceId);
      getData(deviceId, true);
    } else {
      getData(deviceId);
      getShareMaintenaceData(deviceId);
    }
  }, [deviceId, shareId]);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');

    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setId(decodeToken?.id);
      }
    }
    getCollectionOperations();
  }, []);
  const getCollectionOperations = async () => {
    const result = await fetch(
      `${BASE_URL}/business_units/collection_operations/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setCollectionOperationData(
        data.map((item) => ({ label: item.name, value: item.id }))
      );
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
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

  const onSubmit = async () => {
    try {
      if (checkDateOverlap()) {
        toast.error(
          'Device share overlap with device maintenance or share dates.'
        );
        return;
      }
      setIsSubmitting(true);
      const body = {
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        from: parseInt(from.value),
        to: parseInt(to.value),
        created_by: +id,
      };
      if (shareId) {
        const res = await fetch(
          `${BASE_URL}/devices/${deviceId}/share/${shareId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
            body: JSON.stringify(body),
          }
        );
        let { status } = await res.json();
        if (status === 'success') {
          // Handle successful response
          setSuccessModal(true);
        } else {
          toast.error('Failed to update device share.', { autoClose: 3000 });
        }
      } else {
        const res = await fetch(`${BASE_URL}/devices/${deviceId}/shares`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(body),
        });
        let { status } = await res.json();
        if (status === 'success') {
          // Handle successful response
          setSuccessModal(true);
        } else {
          toast.error('Failed to schedule device share.', { autoClose: 3000 });
        }
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    validationSchema
      .validate(
        {
          start_date: startDate,
          end_date: endDate,
          from: from?.value,
          to: to?.value,
        },
        { abortEarly: false }
      )
      .then(async () => {
        setErrors({});
        onSubmit();
      })
      .catch((validationErrors) => {
        const newErrors = {};
        validationErrors?.inner?.forEach((error) => {
          newErrors[error?.path] = error.message;
        });
        setErrors(newErrors);
      });
  };

  const handleOnBlur = async (key, value) => {
    if (!value || value === 'reset') {
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
            <h5>{shareId ? 'Edit ' : ''}Share Device</h5>

            <div className="form-field">
              <div className="field">
                <DatePicker
                  showTimeSelect
                  dateFormat="Pp"
                  filterTime={filterCurrentTime}
                  className="custom-datepicker"
                  placeholderText="Start Date/Time*"
                  selected={startDate}
                  minDate={new Date()}
                  maxDate={retireDate ? new Date(retireDate) : ''}
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
                  excludeDateIntervals={deviceShareMaintenaceData}
                />
                {startDate && (
                  <label
                    className={`text-secondary custom-label ${styles.labelselected} ml-1 mt-1 pb-2`}
                  >
                    Start Date/Time*
                  </label>
                )}
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
                  showTimeSelect
                  minDate={new Date(startDate).setMinutes(
                    new Date(startDate).getMinutes() + 1
                  )}
                  filterTime={filterStartTime}
                  dateFormat="Pp"
                  className="custom-datepicker"
                  placeholderText="End Date/Time*"
                  selected={endDate}
                  onBlur={(e) => handleOnBlur('end_date', e.target.value)}
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
                  maxDate={retireDate ? new Date(retireDate) : ''}
                  excludeDateIntervals={deviceShareMaintenaceData}
                />
                {endDate && (
                  <label
                    className={`text-secondary custom-label ${styles.labelselected} ml-1 mt-1 pb-2`}
                  >
                    End Date/Time*
                  </label>
                )}
              </div>
              {errors?.end_date && (
                <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                  <p>{errors.end_date}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                {from && (
                  <label
                    style={{ fontSize: '12px', top: '24%', color: '#555555' }}
                  >
                    From*
                  </label>
                )}
                <SelectDropdown
                  styles={{ root: 'w-100 m-0' }}
                  placeholder={'From*'}
                  selectedValue={from}
                  disabled={true}
                  removeDivider
                  showLabel={true}
                  onChange={(val) => {
                    handleOnBlur('to', val);
                    if (val) {
                      setIsStateDirty(true);
                      setFrom(val);
                      setTo(null);
                    } else {
                      setFrom(val);
                    }
                  }}
                  options={collectionOperationData}
                />
                {errors?.from && (
                  <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                    <p>{errors.from}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-field">
              <div className="field">
                {to && (
                  <label
                    style={{ fontSize: '12px', top: '24%', color: '#555555' }}
                  >
                    To*
                  </label>
                )}
                <SelectDropdown
                  styles={{ root: 'w-100 m-0' }}
                  placeholder={'To*'}
                  selectedValue={to}
                  removeDivider
                  onChange={(val) => {
                    handleOnBlur('to', val);
                    if (val) {
                      setIsStateDirty(true);
                      setTo(val);
                    } else {
                      setTo(null);
                    }
                  }}
                  options={collectionOperationData.filter(
                    (collectionOperationItem) =>
                      collectionOperationItem.value !== from?.value
                  )}
                />
                {errors?.to && (
                  <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                    <p>{errors.to}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  type="text"
                  className="form-control"
                  name="share-type"
                  placeholder=" "
                  disabled
                  value={shareType}
                />
                <label>Share Type</label>
              </div>
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
          {shareId ? (
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
              Share
            </button>
          )}
        </div>
      </div>
      <SuccessPopUpModal
        title={'Success!'}
        message={`Device Share  ${shareId ? 'updated' : 'scheduled'}.`}
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

export default DeviceShare;
