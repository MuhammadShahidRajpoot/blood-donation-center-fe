import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import styles from '../index.module.scss';
import DatePicker from 'react-datepicker';
import SelectDropdown from '../../../../common/selectDropdown';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import FormInput from '../../../../common/form/FormInput';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import WarningModalPopUp from '../../../../common/warningModal';
import { useSearchParams } from 'react-router-dom';
import { DriveFormEnum } from '../enums';
import axios from 'axios';

export default function CreateDriveForm({
  control,
  formErrors,
  setValue,
  accounts,
  collectionOperation,
  territory,
  recruiters,
  recruiterOptions,
  locationsData,
  promotions,
  promotiomsOption,
  operationStatus,
  setAccountId,
  accountId,
  RSMO,
  getValues,
  watch,
  miles,
  minutes,
  locationType,
  coordinatesA,
  setCoordinatesA,
  setTravelMinutes,
  initialShift,
  setShifts,
  setSelectedContacts,
  setSelectedRoles,
  editable,
  setContactRows,
  fetchData,
  setAllInitialContacts,
  locationQualification,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [searchParams] = useSearchParams();

  const [scheduleAnywayPopup, setScheduleAnywayPopup] = useState(false);
  const [locationQualificationPopup, setLocationQualificationPopup] =
    useState(false);
  const [closedDatePopup, setClosedDatePopup] = useState(false);
  const [clearInfo, setClearInfo] = useState(true);

  const start_date = watch('start_date');
  const collection_operation = watch('collection_operation');

  function daysDifference(dateToCompare) {
    // Create a Date object for the current date
    const currentDate = new Date();

    // Create a Date object for the date you want to compare
    const comparedDate = new Date(dateToCompare);

    // Calculate the time difference in milliseconds
    const timeDifference = currentDate - comparedDate;

    // Convert milliseconds to days (1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
    const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

    return daysDifference;
  }

  const handleCRMAccount = async (id) => {
    if (id) {
      const lastDriveResponse = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/last/${id}`
      );
      const data = await lastDriveResponse.json();

      if (daysDifference(data?.data?.date) < 56) {
        if (!RSMO?.[id]) {
          setScheduleAnywayPopup(true);
        }
      }
    }
    setAccountId(id);
    setValue('collection_operation', collectionOperation?.[parseInt(id)]?.name);
    setValue('territory', territory?.[parseInt(id)]?.territory_name);
    const recruiter = recruiters?.[parseInt(id)];
    recruiter &&
      setValue('recruiter', {
        value: recruiter.id,
        label: recruiter.first_name || '' + recruiter.last_name || '',
      });
  };

  useEffect(() => {
    const id = searchParams.get('accountId');
    const bluerintId = searchParams.get('blueprintId');
    const exists = accounts?.filter((item) => item.value == id);
    if (
      exists.length &&
      Object.values(RSMO).length &&
      Object.values(territory).length &&
      Object.values(collectionOperation).length &&
      Object.values(recruiters).length &&
      typeof bluerintId === 'object'
    ) {
      setValue('account', {
        value: exists?.[0]?.value,
        label: exists?.[0]?.label,
      });
      handleCRMAccount(id);
    }
  }, [
    searchParams,
    accounts,
    RSMO,
    territory,
    collectionOperation,
    recruiters,
  ]);

  const handleChangeAccount = async (field, e) => {
    setContactRows([]);
    setAllInitialContacts([]);

    if (e?.value) {
      const lastDriveResponse = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/last/${e.value}`
      );
      const data = await lastDriveResponse.json();
      if (daysDifference(data?.data?.date) < 56) {
        if (!RSMO[e.value]) {
          setScheduleAnywayPopup(true);
        }
      }
    }
    setShifts((prev) => {
      return prev?.map((item, index) => {
        return {
          ...item,
          projections: prev[index].projections?.map((pItem) => {
            return { ...pItem, staffSetup: [] };
          }),
        };
      });
    });
    setSelectedContacts([]);
    setSelectedRoles([]);
    setAccountId(e?.value);
    setValue(
      'collection_operation',
      collectionOperation[parseInt(e?.value)]?.name
    );
    setValue('territory', territory[parseInt(e?.value)]?.territory_name);
    const recruiter = recruiters[parseInt(e?.value)];
    recruiter &&
      setValue('recruiter', {
        value: recruiter.id,
        label: recruiter.first_name || '' + recruiter.last_name || '',
      });
    fetchData(1);
    field.onChange(e);
  };

  useEffect(() => {
    if (scheduleAnywayPopup === false && clearInfo) {
      setValue('account', '');
      setValue('collection_operation', '');
      setValue('territory', '');
      setValue('recruiter', '');
      setClearInfo(true);
    }
  }, [scheduleAnywayPopup, clearInfo]);

  const handleDateandCollectionOperationClosedDates = async () => {
    if (start_date !== '' && collection_operation !== '') {
      const collectionOperationId = Object.values(collectionOperation)?.filter(
        (item) => item.name === collection_operation
      )?.[0]?.id;
      const responseClosedDate = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/close-dates/is_closed?collection_operation_id=${collectionOperationId}&date=${start_date}`
      );
      const data = await responseClosedDate.json();
      if (data?.closed) {
        setClosedDatePopup(true);
        setValue('start_date', '');
      }
    }
  };

  useEffect(() => {
    handleDateandCollectionOperationClosedDates();
  }, [start_date, collection_operation]);
  const type = watch('form');

  const handleChangeLocation = async (field, e) => {
    if (e?.value) {
      console.log('e?.value', e?.value);
      if (locationQualification) {
        if (e?.qualification_status == 'Qualified') {
          console.log('Qualified');
          setValue('location_type', locationType[e?.value] || '');
          setValue('miles', miles[e?.value] || '');
          setValue('minutes', minutes[e?.value] || '');
          setTravelMinutes(minutes[e?.value] || 0);
          field.onChange(e);
          getAddressCoordinate(e?.value);
        } else {
          setLocationQualificationPopup(true);
        }
      } else {
        setValue('location_type', locationType[e?.value] || '');
        setValue('miles', miles[e?.value] || '');
        setValue('minutes', minutes[e?.value] || '');
        setTravelMinutes(minutes[e?.value] || 0);
        field.onChange(e);
        console.log('e?.value', e?.value);
        getAddressCoordinate(e?.value);
      }
    } else {
      setValue('location_type', '');
      setValue('miles', '');
      setValue('minutes', '');
      field.onChange(e);
      setTravelMinutes('');
      getAddressCoordinate(e?.value);
    }
  };

  const getAddressCoordinate = async (id) => {
    try {
      console.log('getDate', id);
      const getDate = await axios.get(`${BASE_URL}/drives/location/${id}`);
      console.log({ getDate });
      const data = getDate?.data?.data?.coordinates;
      setCoordinatesA(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="formGroup">
      <h5>
        {' '}
        {editable
          ? 'Edit Drive'
          : type === DriveFormEnum.CLEAN_SLATE
          ? 'Create Drive'
          : type === DriveFormEnum.BLUEPRINT
          ? 'Create Drive from Blueprint'
          : 'Copy Drive from Existing Drive'}
      </h5>
      <Controller
        name="start_date"
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field`} name="start_date">
              <DatePicker
                // defaultValue={field}
                minDate={new Date().setDate(new Date().getDate())}
                dateFormat="MM-dd-yyyy"
                className={`custom-datepicker ${styles.datepicker}`}
                placeholderText="Date*"
                selected={field?.value}
                error={formErrors?.start_date?.message}
                onChange={(e) => {
                  const currentDate = new Date(e);
                  currentDate.setDate(currentDate.getDate() - 30);
                  field.onChange(e);
                  setValue(
                    'order_due_date',
                    currentDate < new Date() ? new Date() : currentDate
                  );
                  const check = getValues('online_scheduling_allowed');
                  if (check) {
                    //  const date = getValues('start_date');
                    const newDate = new Date(e);
                    newDate.setDate(newDate.getDate() - 60);
                    setValue(
                      'marketing_start_date',
                      newDate < new Date() ? new Date() : newDate
                    );
                    const endDateTime = new Date();
                    endDateTime.setHours(6, 0, 0, 0);
                    setValue('marketing_end_date', new Date(e));
                    setValue('marketing_start_time', endDateTime);
                    setValue('marketing_end_time', endDateTime);
                  }
                }}
                handleBlur={(e) => {
                  field.onChange(e);
                }}
              />
              {field?.value && (
                <label
                  className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                >
                  Date*
                </label>
              )}
            </div>
            {formErrors.start_date && (
              <div className="error">
                <div className="error">
                  <p>{formErrors.start_date.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name="account"
        control={control}
        render={({ field }) => {
          return (
            <SelectDropdown
              searchable={true}
              placeholder={'Account Name*'}
              showLabel={field?.value?.value}
              defaultValue={field?.value}
              selectedValue={field?.value}
              removeDivider
              onChange={(e) => {
                handleChangeAccount(field, e);
              }}
              handleBlur={(e) => {
                field.onChange(e);
              }}
              options={accounts}
              error={formErrors?.account?.message}
            />
          );
        }}
      />
      <Controller
        name="location"
        control={control}
        render={({ field }) => {
          return (
            <SelectDropdown
              searchable={true}
              placeholder={'Location*'}
              showLabel={field?.value?.value}
              defaultValue={field?.value}
              selectedValue={field?.value}
              removeDivider
              onChange={(e) => {
                handleChangeLocation(field, e);
              }}
              handleBlur={(e) => {
                field.onChange(e);
              }}
              options={locationsData}
              error={formErrors?.location?.message}
            />
          );
        }}
      />
      <Controller
        name="location_type"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Location Type"
            value={field?.value}
            required={false}
            disabled={true}
            error={formErrors?.location && formErrors?.location_type?.message}
          />
        )}
      />
      <Controller
        name="miles"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Miles"
            value={field?.value}
            required={false}
            disabled={true}
            error={formErrors?.location && formErrors?.miles?.message}
          />
        )}
      />
      <Controller
        name="minutes"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Minutes"
            value={field?.value}
            required={false}
            disabled={true}
            error={formErrors?.location && formErrors?.minutes?.message}
          />
        )}
      />
      <h4>Attributes</h4>
      <Controller
        name="promotion"
        control={control}
        render={({ field }) => (
          <SelectDropdown
            // searchable={true}
            placeholder={'Promotion'}
            showLabel={field?.value?.value}
            defaultValue={field?.value}
            selectedValue={field?.value}
            removeDivider
            onChange={(e) => {
              const promotion = promotions[parseInt(e?.value)];
              promotion &&
                setValue('promotion', {
                  value: promotion.value,
                  label: promotion.label,
                });
              field.onChange(e);
            }}
            handleBlur={(e) => {
              field.onChange(e);
            }}
            options={promotiomsOption}
            error={formErrors?.promotion?.message}
          />
        )}
      />
      <Controller
        name="collection_operation"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Collection Operation"
            value={field?.value}
            required={false}
            disabled={true}
            error={
              formErrors?.account && formErrors?.collection_operation?.message
            }
          />
        )}
      />
      <Controller
        name="recruiter"
        control={control}
        render={({ field }) => (
          <SelectDropdown
            // searchable={true}
            placeholder={'Recruiter*'}
            showLabel={field?.value?.value}
            defaultValue={field?.value}
            selectedValue={field?.value}
            removeDivider
            onChange={(e) => {
              const recruiter = recruiters[parseInt(e?.value)];
              recruiter &&
                setValue('recruiter', {
                  value: recruiter.id,
                  label: recruiter.first_name || '' + recruiter.last_name || '',
                });
              field.onChange(e);
            }}
            handleBlur={(e) => {
              field.onChange(e);
            }}
            options={recruiterOptions}
            error={formErrors?.account && formErrors?.recruiter?.message}
          />
        )}
      />
      <Controller
        name="territory*"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Territory"
            value={field?.value}
            required={false}
            disabled={true}
            error={formErrors?.account && formErrors?.territory?.message}
          />
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => {
          return (
            <SelectDropdown
              // searchable={true}
              styles={{ root: '' }}
              placeholder={'Status*'}
              showLabel={field?.value?.value}
              defaultValue={field?.value}
              selectedValue={field?.value}
              removeDivider
              onChange={(e) => {
                field.onChange(e);
              }}
              handleBlur={(e) => {
                field.onChange(e);
              }}
              options={operationStatus}
              error={formErrors?.status?.message}
            />
          );
        }}
      />
      <Controller
        name="multi_day"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <FormCheckbox
            name={field.name}
            displayName="Multi-day Drive"
            checked={field.value}
            classes={{ root: 'mt-2' }}
            onChange={(e) => field.onChange(e.target.checked)}
          />
        )}
      />
      <WarningModalPopUp
        title="Alert !"
        message={`It has not been 56 days, schedule anyway?`}
        modalPopUp={scheduleAnywayPopup}
        setModalPopUp={setScheduleAnywayPopup}
        showActionBtns={true}
        confirmAction={() => {
          setClearInfo(false);
          setScheduleAnywayPopup(false);
        }}
        cancelAction={() => {
          setClearInfo(true);
          setScheduleAnywayPopup(false);
        }}
        cancelText={'No'}
        confirmText={'Yes'}
      />
      <WarningModalPopUp
        title="Warning"
        message={`The selected date is closed. Please try with another date.`}
        modalPopUp={closedDatePopup}
        setModalPopUp={setClosedDatePopup}
        showActionBtns={true}
        confirmAction={() => {
          setClosedDatePopup(false);
        }}
      />
      <WarningModalPopUp
        title="Alert !"
        message={`The selected location's Qualification status must be qualified.`}
        modalPopUp={locationQualificationPopup}
        setModalPopUp={setLocationQualificationPopup}
        showActionBtns={true}
        confirmAction={() => {
          setValue('location_type', '');
          setValue('miles', '');
          setValue('minutes', '');
          setValue('location', '');
          setTravelMinutes('');
          setLocationQualificationPopup(false);
        }}
        cancelAction={() => {
          setValue('location_type', '');
          setValue('miles', '');
          setValue('minutes', '');
          setValue('location', '');
          setTravelMinutes('');
          setLocationQualificationPopup(false);
        }}
      />
    </div>
  );
}
