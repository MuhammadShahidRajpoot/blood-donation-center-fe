import React, { useEffect, useState } from 'react';
// import { Controller, useForm } from 'react-hook-form';
// import styles from '../drives/index.module.scss';
import styles from './index.module.scss';
import DatePicker from 'react-datepicker';
import SelectDropdown from '../../../common/selectDropdown';
// import FormCheckbox from '../../../common/form/FormCheckBox';
import FormInput from '../../../common/form/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import NceShiftForm from './NceShiftForm';
import TopBar from '../../../common/topbar/index';
import { OPERATIONS_CENTER_NCE } from '../../../../routes/path';
import SuccessPopUpModal from '../../../common/successModal';
import CancelModalPopUp from '../../../common/cancelModal';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { API } from '../../../../api/api-routes';
import { formatUser } from '../../../../helpers/formatUser';
import { toast } from 'react-toastify';
import CustomFieldsForm from '../../../common/customeFileds/customeFieldsForm';
import { customFieldsValidation } from '../../../common/customeFileds/yupValidation';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import GlobalMultiSelect from '../../../common/GlobalMultiSelect';
import {
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../../helpers/convertDateTimeToTimezone';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OcPermissions from '../../../../enums/OcPermissionsEnum';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const initialShift = {
  generatedId: Math.random().toString(36).substring(2),
  startTime: null,
  endTime: '',
  roles: [{ role: null, qty: null }],
  staffBreak: false,
  breakStartTime: '',
  breakEndTime: '',
  vehicles_ids: [],
  device_ids: [],
  shiftBreakStartTime: null,
  shiftBreakEndTime: null,
  showBreakTime: false,
};
const BASE_URL = process.env.REACT_APP_BASE_URL;

const NceEdit = () => {
  const params = useParams();
  const [shifts, setShifts] = useState([]);
  const [closeModal, setCloseModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [editApiToggle, setEditApiToggle] = useState(null);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [showModalText, setShowModalText] = useState(null);
  const [showSuccessMessageArchived, setShowSuccessMessageArchived] =
    useState(false);
  const [ownerId, SetOwnerId] = useState(null);
  const [collectionOperation, setCollectionOperation] = useState(null);
  const [statusOption, setStatusOption] = useState([]);
  const [eventCategory, setEventCategory] = useState('');
  const [eventSubCategory, setEventSubCategory] = useState('');
  const [locationOption, setLocationOption] = useState([]);
  const [, setBluePrintNcpName] = useState(null);
  const [profileListData, setProfileListData] = useState([]);
  const [customFileds, setcustomFields] = useState();
  const [collectionOperationShow, setCollectionOperationShow] = useState(null);
  const [initialTime, setInitialTime] = useState(null);
  const token = localStorage.getItem('token');

  const dynamicSchema = customFieldsValidation(customFileds);
  const schema = yup.object().shape({
    ...dynamicSchema,
    event_name: yup
      .string()
      .trim()
      .required('Event name is required.')
      .matches(
        /^[A-Za-z\s]+$/,
        'Event name must contain only alphabetic characters'
      )
      .max(50, 'Maximum 50 characters are allowed.'),
    location: yup.object().required('Location is required.'),
    non_collection_profile: yup.object().required('NCP Name is required.'),
    date: yup.date().required('Date is required.'),
    owner_id: yup.object().required('Owner is required.'),
    status: yup.object().required('Status is required.'),
    shifts: yup.array().of(
      yup.object().shape({
        id: yup.number().optional().nullable(),
        startTime: yup.string().required('Start Time is required.'),
        endTime: yup
          .string()
          .when('startTime', (startTime, schema) => {
            return schema.test(
              'is-greater',
              'End Time must be greater than Start Time',
              function (endTime) {
                if (!startTime || !endTime) {
                  return true;
                }
                const startTimeDate = new Date(`${startTime}`);
                const endTimeDate = new Date(`${endTime}`);
                const momentStartTime = moment(startTimeDate).format('HH:mm');
                const momentEndTime = moment(endTimeDate).format('HH:mm');
                const [hour1, minute1] = momentStartTime.split(':').map(Number);
                const [hour2, minute2] = momentEndTime.split(':').map(Number);
                if (hour1 < hour2) {
                  return true;
                } else if (hour1 === hour2 && minute1 < minute2) {
                  return true;
                }

                return false;
              }
            );
          })
          .required('End Time is required.'),
        roles: yup.array().of(
          yup.object().shape({
            role: yup
              .object({
                label: yup.string().required(),
                value: yup.string().required(),
              })
              .required('Role is required.'),
            qty: yup
              .number()
              .typeError('Quantity must be a number.')
              .required('Quantity is required.')
              .min(1, 'Quantity must be at least 1.'),
          })
        ),
        staffBreak: yup.boolean(),
        breakStartTime: yup.string().when('showBreakTime', {
          is: true,
          then: (showBreakTime, schema) => {
            return yup
              .string()
              .test(
                'is-between-shift-hours',
                'Your hours are not between the shift hours',
                function (breakStartTime) {
                  if (
                    !this.parent.startTime ||
                    !this.parent.endTime ||
                    !breakStartTime
                  ) {
                    return true; // Don't perform validation if any of these fields are empty
                  }
                  const startTimeDate = new Date(this.parent.startTime);
                  const endTimeDate = new Date(this.parent.endTime);
                  const breakStartTimeDate = new Date(breakStartTime);

                  const startTimeHours = startTimeDate.getHours();
                  const startTimeMinutes = startTimeDate.getMinutes();
                  const breakStartTimeHours = breakStartTimeDate.getHours();
                  const breakStartTimeMinutes = breakStartTimeDate.getMinutes();
                  const endTimeHours = endTimeDate.getHours();
                  const endTimeMinutes = endTimeDate.getMinutes();
                  return (
                    (startTimeHours < breakStartTimeHours ||
                      (startTimeHours === breakStartTimeHours &&
                        startTimeMinutes <= breakStartTimeMinutes)) &&
                    (breakStartTimeHours < endTimeHours ||
                      (breakStartTimeHours === endTimeHours &&
                        breakStartTimeMinutes <= endTimeMinutes))
                  );
                }
              )
              .required('Start Time is required.');
          },
        }),
        breakEndTime: yup.string().when('showBreakTime', {
          is: true,
          then: () =>
            yup
              .string()
              .when('breakStartTime', (breakStartTime, schema) => {
                return yup
                  .string()
                  .test(
                    'is-greater',
                    'End Time must be greater than Start Time',
                    function (breakEndTime) {
                      if (!breakStartTime || !breakEndTime) {
                        return true; // Let other validators handle empty values
                      }
                      const startTimeDate = new Date(`${breakStartTime}`);
                      const endTimeDate = new Date(`${breakEndTime}`);
                      const momentStartTime =
                        moment(startTimeDate).format('HH:mm');
                      const momentEndTime = moment(endTimeDate).format('HH:mm');
                      const [hour1, minute1] = momentStartTime
                        .split(':')
                        .map(Number);
                      const [hour2, minute2] = momentEndTime
                        .split(':')
                        .map(Number);
                      if (hour1 < hour2) {
                        return true;
                      } else if (hour1 === hour2 && minute1 < minute2) {
                        return true;
                      }

                      return false;
                    }
                  )
                  .test(
                    'is-between-shift-hours',
                    'Your hours are not between the shift hours',
                    function (breakEndTime) {
                      if (
                        !this.parent.startTime ||
                        !this.parent.endTime ||
                        !breakEndTime
                      ) {
                        return true; // Don't perform validation if any of these fields are empty
                      }
                      const startTimeDate = new Date(this.parent.startTime);
                      const endTimeDate = new Date(this.parent.endTime);
                      const breakEndTimeDate = new Date(breakEndTime);

                      const startTimeHours = startTimeDate.getHours();
                      const startTimeMinutes = startTimeDate.getMinutes();
                      const breakEndTimeHours = breakEndTimeDate.getHours();
                      const breakEndTimeMinutes = breakEndTimeDate.getMinutes();
                      const endTimeHours = endTimeDate.getHours();
                      const endTimeMinutes = endTimeDate.getMinutes();

                      return (
                        (startTimeHours < breakEndTimeHours ||
                          (startTimeHours === breakEndTimeHours &&
                            startTimeMinutes <= breakEndTimeMinutes)) &&
                        (breakEndTimeHours < endTimeHours ||
                          (breakEndTimeHours === endTimeHours &&
                            breakEndTimeMinutes <= endTimeMinutes))
                      );
                    }
                  );
              })
              .required('End Time is required.'),
        }),
        vehicles_ids: yup
          .array()
          .of(
            yup.object({
              id: yup.string().required('Vehicle Setup is required.'),
              name: yup.string().required('Vehicle Setup is required.'),
            })
          )
          .min(1, 'Vehicle Setup is required.')
          .required('Vehicle Setup is required.'),
        device_ids: yup
          .array()
          .of(
            yup.object({
              name: yup.string().required('Device Setup is required.'),
              id: yup.string().required('Device Setup is required.'),
            })
          )
          .min(1, 'Device Setup is required.')
          .required('Device Setup is required.'),
        // showBreakTime: yup.boolean(),
      })
    ),
  });

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const { append, remove } = useFieldArray({
    control,
    name: 'shifts',
  });
  const BreadcrumbsData = [
    { label: 'Operations Center', class: 'disable-label', link: '#' },
    {
      label: 'Operations',
      class: 'active-label',
      link: '#',
    },
    {
      label: 'Non-Collection Events',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE.LIST,
    },
    {
      label: 'Edit Non-Collection Events',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE.EDIT,
    },
  ];

  useEffect(() => {
    const getNceData = async () => {
      try {
        const { data } = await API.ocNonCollectionEvents.getSingleData(
          token,
          params?.id
        );
        if (data?.status_code === 200) {
          setValue('event_name', data?.data?.event_name);
          setValue('date', moment(data?.data?.date, 'YYYY-MM-DD').toDate());
          // setValue(
          //   'collection_operation',
          //   data?.data?.collection_operation_id?.id
          // );
          setValue('non_collection_profile', {
            value: data?.data?.non_collection_profile_id?.id,
            label: data?.data?.non_collection_profile_id?.profile_name,
          });
          setValue('location', {
            value: data?.data?.location_id?.id,
            label: data?.data?.location_id?.name,
          });
          setValue('owner_id', {
            label: formatUser(data?.data?.owner_id, 1),
            value: data?.data?.owner_id?.id,
          });
          setValue('status', {
            label: data?.data?.status_id?.name,
            value: data?.data?.status_id?.id,
          });
          setEventCategory(data?.data?.event_category_id?.id);
          setEventSubCategory(data?.data?.event_subcategory_id?.id);
          setCollectionOperationShow(
            data?.data?.collection_operation_id?.map((obj) => {
              return {
                id: obj?.id,
                name: obj?.name,
              };
            })
          );
          const arrayOfIds = data?.data?.collection_operation_id?.map(
            (obj) => obj?.id
          );
          setCollectionOperation(arrayOfIds);
          setValue('collection_operation', arrayOfIds);

          // setCollectionOperation({
          //   label: data?.data?.collection_operation_id?.name,
          //   value: data?.data?.collection_operation_id?.id,
          // });
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      }
    };
    const fetchOperationStatus = async () => {
      try {
        const { data } =
          await API.ocNonCollectionEvents.getAlloperationstatus(token);
        if (data?.data) {
          const statusOptionData = data?.data?.map((item) => {
            return {
              label: item?.name,
              value: item?.id,
            };
          });
          setStatusOption(statusOptionData);
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      }
    };
    const getSingleShiftData = async () => {
      try {
        const { data } = await API.ocNonCollectionEvents.getSingleShiftData(
          token,
          params?.id
        );
        if (data?.status_code === 200) {
          const modified = data?.data?.map((item) => {
            const showBreakTime =
              item?.break_start_time !== null && item?.break_end_time !== null;
            const startTime = moment(covertDatetoTZDate(item?.start_time));
            setInitialTime(covertDatetoTZDate(item?.start_time));
            const endTime = moment(covertDatetoTZDate(item?.end_time));
            const shiftBreakStartTime = moment(
              covertDatetoTZDate(item?.break_start_time)
            );
            const shiftBreakEndTime = moment(
              covertDatetoTZDate(item?.break_end_time)
            );
            return {
              id: item?.id,
              startTime: startTime,
              endTime: endTime,
              roles: item?.shiftRoles?.map((e) => {
                return {
                  role: { label: e?.role?.name, value: e?.role?.id },
                  qty: e?.quantity,
                };
              }),
              vehicles_ids: item?.shiftVehicles?.map((e) => {
                return {
                  name: e?.vehicle?.name,
                  id: e?.vehicle?.id,
                };
              }),
              device_ids: item?.shiftDevices.map((e) => {
                return {
                  name: e?.device?.name,
                  id: e?.device?.id,
                };
              }),
              showBreakTime: showBreakTime,
              breakStartTime:
                item?.break_start_time !== null ? shiftBreakStartTime : '',
              breakEndTime:
                item?.break_end_time !== null ? shiftBreakEndTime : '',
            };
          });
          setEditApiToggle(!editApiToggle);
          setShifts(modified);
          setValue('shifts', modified);
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      }
    };
    const getnonCollectionProfilesData = async () => {
      // setIsLoading(true);
      try {
        const { data } = await API.nonCollectionProfiles.getAll.get(token);
        if (data?.data) {
          const profileListoptionData = data?.data?.map((item) => {
            return {
              label: item?.profile_name,
              value: item?.id,
              co_id: item?.collection_operation_id,
              event_category_id: item?.event_category_id?.id,
              event_subcategory_id: item?.event_subcategory_id?.id ?? null,
            };
          });

          setProfileListData(profileListoptionData);
          // setTotalRecords(data?.count);
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      } finally {
        // setIsLoading(false);
      }
    };
    if (params?.id) {
      getNceData();
      fetchOperationStatus();
      getSingleShiftData();
      getnonCollectionProfilesData();
    }
  }, [params?.id, showSuccessMessage === true]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { data } = await API.ocNonCollectionEvents.getNceLocation(
          token,
          JSON.stringify(collectionOperation)
        );
        if (data?.data) {
          const locationOptionData = data?.data?.map((item) => {
            return {
              label: item?.name,
              value: item?.id,
            };
          });
          setLocationOption(locationOptionData);
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      } finally {
        // setIsLoading(false);
      }
    };
    if (collectionOperation?.length) {
      fetchLocation();
    }
  }, [collectionOperation]);

  useEffect(() => {
    const getOwners = async () => {
      try {
        const { data } = await API.nonCollectionProfiles.ownerId.getAll(
          token,
          collectionOperation?.join(',')
          // JSON.stringify(collectionOperation)
        );
        SetOwnerId(data?.data);
      } catch (error) {
        toast.error(`Failed to fetch`, { autoClose: 3000 });
      }
    };
    if (collectionOperation?.length) {
      getOwners();
    } else {
      SetOwnerId([]);
    }
  }, [collectionOperation]);

  const handleRemoveShift = (index) => {
    if (shifts.length > 1) {
      const updatedShifts = [...shifts];
      updatedShifts.splice(index, 1);
      setShifts(updatedShifts);
    }
  };
  const handleArchive = async () => {
    try {
      const { data } = await API.ocNonCollectionEvents.archiveNceData(
        token,
        params?.id
      );
      if (data?.status_code === 200) {
        setModalPopUp(false);
        setShowSuccessMessageArchived(true);
      } else {
        setModalPopUp(false);
        setShowSuccessMessageArchived(false);
        toast.error(`${data?.response}`, { autoClose: 3000 });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };
  useEffect(() => {
    getCustomFields();
    getCustomFieldsData();
  }, []);
  const getCustomFields = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/organization-administration/custom-fields/modules/6`
      );
      const data = await response.json();
      if (data?.status === 200) {
        setcustomFields(data.data);
      }
    } catch (error) {
      console.error(`Failed to fetch NCE data ${error}`, {
        autoClose: 3000,
      });
    }
  };
  const getCustomFieldsData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/organization-administration/custom-fields/data?custom_field_datable_id=${params?.id}&custom_field_datable_type=${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}`
      );
      const data = await response.json();
      if (data?.status_code === 201) {
        // const modified = data.data.map((item) => {
        //   return item.field_id;
        // });
        // setcustomFields(modified);
        const fieldsToUpdate = data.data;
        fieldsToUpdate.forEach(
          ({ field_id: { id, pick_list }, field_data }) => {
            let updatedValue;

            if (pick_list.length > 0) {
              const matchingPickItem = pick_list.find((pickItem) => {
                if (typeof field_data === 'boolean') {
                  return pickItem.type_value === field_data;
                } else {
                  return pickItem.type_value === field_data.toString();
                }
              });

              if (matchingPickItem) {
                updatedValue = {
                  label: matchingPickItem.type_name,
                  value: matchingPickItem.type_value,
                };
              } else {
                // If no match is found, use the first pick list item as a fallback
                updatedValue = {
                  label: '',
                  value: '',
                };
              }
            } else {
              updatedValue = field_data;
            }
            setValue(id, updatedValue);
          }
        );
      }
    } catch (error) {
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
  };
  const onSubmit = async (data, event) => {
    const shiftData = data?.shifts?.map((item) => {
      return {
        start_time: covertToTimeZone(moment(item?.startTime)),
        end_time: covertToTimeZone(moment(item?.endTime)),
        break_start_time: item?.breakStartTime
          ? covertToTimeZone(moment(item?.breakStartTime))
          : null,
        break_end_time: item?.breakEndTime
          ? covertToTimeZone(moment(item?.breakEndTime))
          : null,
        vehicles_ids: item?.vehicles_ids?.map((item) => parseInt(item.id, 10)),
        devices_ids: item?.device_ids?.map((item) => parseInt(item.id, 10)),
        shift_roles: item?.roles?.map((item) => ({
          role_id: parseInt(item?.role?.value, 10),
          qty: item.qty,
        })),
        id: item?.id,
      };
    });
    const fieldsData = [];
    const customFieldDatableType =
      PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS; // You can change this as needed
    let resulting;
    for (const key in data) {
      if (key > 0) {
        const value = data[key]?.value ?? data[key];
        fieldsData.push({
          field_id: key,
          field_data:
            value === null
              ? null
              : typeof value === 'object' && !Array.isArray(value)
              ? JSON.stringify(value)
              : value?.toString(),
        });
      }
    }
    resulting = {
      fields_data: fieldsData,
      // custom_field_datable_id: customFieldDatableId,
      custom_field_datable_type: customFieldDatableType,
    };
    const body = {
      custom_fields: resulting,
      date: covertToTimeZone(moment(data?.date)).format('YYYY-MM-DD'),
      event_name: data?.event_name,
      owner_id: +data?.owner_id?.value,
      non_collection_profile_id: +data?.non_collection_profile?.value,
      location_id: +data?.location?.value,
      collection_operation_id: data?.collection_operation,
      status_id: +data?.status?.value,
      event_category_id: +eventCategory,
      event_subcategory_id: +eventSubCategory ?? null,
      shifts: shiftData,
    };
    try {
      const response = await API?.ocNonCollectionEvents.updateNceData(
        token,
        params?.id,
        body
      );
      if (response?.data?.status_code === 201) {
        if (event?.target?.name === 'Save & Close') {
          setIsNavigate(true);
          setShowSuccessMessage(true);
        } else if (event?.target?.name === 'Save Changes') {
          setShowSuccessMessage(true);
        }
      } else {
        toast.error(response?.data?.response, {
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };
  return (
    <div className="mainContent">
      <SuccessPopUpModal
        title="Confirmation"
        message={showModalText}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'NCE archived successfully.'}
        modalPopUp={showSuccessMessageArchived}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessageArchived}
        isNavigate={true}
        redirectPath={-1}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'NCE Updated Successfully.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
        isNavigate={isNavigate}
        redirectPath={-1}
      />
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Non-Collection Events'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form
          className={styles.account}
          style={{ marginBottom: '150px' }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="formGroup mt-4">
            <h5>Edit Non-Collection Event</h5>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="form-field">
                  <div className={`field`}>
                    <DatePicker
                      dateFormat="MM-dd-yyyy"
                      // minDate={new Date()}
                      className="custom-datepicker effectiveDate"
                      placeholderText={'Date*'}
                      selected={field?.value}
                      //   error={formErrors?.start_date?.message}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                      handleBlur={(e) => {
                        field.onChange(e);
                      }}
                      error={errors?.date?.message}
                    />
                    {field?.date && (
                      <label
                        className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                      >
                        Date*
                      </label>
                    )}
                  </div>
                  {errors?.date?.message && (
                    <div className="error">
                      <p>{errors?.date?.message}</p>
                    </div>
                  )}
                </div>
              )}
            />
            <Controller
              name="event_name"
              control={control}
              render={({ field }) => (
                <FormInput
                  name={field.name}
                  classes={{ root: '' }}
                  displayName="Event Name"
                  value={field?.value}
                  required={false}
                  //disabled={true}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  handleBlur={(e) => {
                    field.onChange(e);
                  }}
                  error={errors?.event_name?.message}
                />
              )}
            />
            <Controller
              name={`location`}
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <SelectDropdown
                  placeholder={'Location'}
                  defaultValue={field?.value}
                  selectedValue={field?.value}
                  styles={{ root: 'mt-4' }}
                  removeDivider
                  options={locationOption}
                  onBlur={field?.onBlur}
                  showLabel
                  onChange={(e) => {
                    field?.onChange(e);
                    // setValue('location2', e);
                  }}
                  error={errors?.location?.message}
                />
              )}
            />
            <div className="w-100 mb-2">
              <p>Attributes</p>
            </div>
            {/* <Controller
              name="collection_operation"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    // searchable={true}
                    styles={{ root: '' }}
                    placeholder={'Collection Operation'}
                    showLabel={field?.value}
                    selectedValue={
                      collectionOperation
                        ? collectionOperation.label !== undefined
                          ? collectionOperation
                          : null
                        : null
                    }
                    disabled={true}
                  />
                );
              }}
            /> */}
            <div className="form-field">
              <div className="field">
                <Controller
                  name={'collection_operation'}
                  control={control}
                  render={({ field }) => (
                    <GlobalMultiSelect
                      label="Collection Operation"
                      disabled={true}
                      selectedOptions={
                        collectionOperationShow?.length
                          ? collectionOperationShow
                          : []
                      }
                      onBlur={field.onBlur}
                      error={errors?.collection_operation?.message}
                    />
                  )}
                />
              </div>
            </div>
            <Controller
              name={`owner_id`}
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <SelectDropdown
                  placeholder={'Owner'}
                  defaultValue={field?.value}
                  selectedValue={field?.value}
                  removeDivider
                  options={ownerId?.map((item) => ({
                    value: item?.id,
                    label: formatUser(item, 1),
                  }))}
                  onBlur={field?.onBlur}
                  showLabel
                  onChange={(e) => {
                    field?.onChange(e);
                    setValue('owner_id', e);
                  }}
                  error={errors?.owner_id?.message}
                />
              )}
            />
            <Controller
              name={`status`}
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <SelectDropdown
                  placeholder={'Status'}
                  defaultValue={field?.value}
                  selectedValue={field?.value}
                  removeDivider
                  options={statusOption}
                  styles={{ root: 'mt-4' }}
                  onBlur={field?.onBlur}
                  showLabel
                  onChange={(e) => {
                    field?.onChange(e);
                    setValue('status', e);
                  }}
                  error={errors?.status?.message}
                />
              )}
            />
            <Controller
              name={`non_collection_profile`}
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <SelectDropdown
                  placeholder={'Non-Collection Profile'}
                  defaultValue={field?.value}
                  selectedValue={field?.value}
                  removeDivider
                  options={profileListData}
                  styles={{ root: 'mt-4' }}
                  onBlur={field?.onBlur}
                  showLabel
                  onChange={(e) => {
                    field?.onChange(e);
                    setEventCategory(e?.event_category_id);
                    setEventSubCategory(e?.event_subcategory_id);
                    setBluePrintNcpName(e?.value);
                    setCollectionOperationShow(
                      e?.co_id?.map((obj) => {
                        return {
                          id: obj?.id,
                          name: obj?.name,
                        };
                      })
                    );
                    const arrayOfIds = e?.co_id?.map((obj) => obj?.id);
                    setCollectionOperation(arrayOfIds);
                    setValue('collection_operation', arrayOfIds);
                    setValue('location', null);
                  }}
                  error={errors?.non_collection_profile?.message}
                />
              )}
            />
            {/* <WarningModalPopUp
          title="Alert !"
          message={`It has not been 56 days, schedule anyway?`}
          modalPopUp={scheduleAnywayPopup}
          setModalPopUp={setScheduleAnywayPopup}
          showActionBtns={true}
          confirmAction={() => {
            setClearInfo(false);
            setScheduleAnywayPopup(false);
          }}
        />
        <WarningModalPopUp
          title="Warning"
          message={`The selected date is closed. Please try with another date.`}
          modalPopUp={closedDatePopup}
          setModalPopUp={setClosedDatePopup}
          showActionBtns={true}
          confirmAction={() => {
            setClosedDatePopup(false);
          }} */}
          </div>
          {customFileds?.length ? (
            <CustomFieldsForm
              control={control}
              formErrors={errors}
              customFileds={customFileds}
            />
          ) : (
            ''
          )}
          {shifts?.map((shift, index) => {
            return (
              <NceShiftForm
                control={control}
                key={shift?.generatedId ? shift?.generatedId : shift?.id}
                shift={shift}
                removeShift={() => remove(index)}
                setShift={(updatedShift) => {
                  const updatedShifts = [...shifts];
                  updatedShifts[index] = updatedShift;
                  setShifts(updatedShifts);
                }}
                errors={errors}
                initialShift={initialShift}
                handleRemoveShift={handleRemoveShift}
                append={append}
                setShifts={setShifts}
                currentNumber={index}
                initialTime={initialTime}
                shifts={shifts}
                getValues={getValues}
                setValue={setValue}
                collectionOperation={collectionOperation}
                editApiToggle={editApiToggle}
              />
            );
          })}
        </form>
        <div className={`form-footer`}>
          <CancelModalPopUp
            title="Confirmation"
            message="Unsaved changes will be lost, do you wish to proceed?"
            modalPopUp={closeModal}
            isNavigate={true}
            setModalPopUp={setCloseModal}
            redirectPath={-1}
          />
          <div>
            {CheckPermission([
              OcPermissions.OPERATIONS_CENTER.OPERATIONS.NON_COLLECTION_EVENTS
                .ARCHIVE,
            ]) && (
              <span
                className="archived"
                onClick={() => {
                  setShowModalText('Are you sure you want to archive?');
                  setModalPopUp(true);
                }}
              >
                Archive
              </span>
            )}
          </div>
          <div>
            <span
              className={`btn simple-text`}
              onClick={() => {
                setCloseModal(true);
              }}
            >
              Cancel
            </span>
            <button
              name="Save & Close"
              className={`btn btn-secondary btn-md`}
              onClick={handleSubmit(onSubmit)}
            >
              Save & Close
            </button>
            <button
              name="Save Changes"
              type="button"
              className={`btn btn-primary btn-md`}
              onClick={handleSubmit(onSubmit)}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NceEdit;
