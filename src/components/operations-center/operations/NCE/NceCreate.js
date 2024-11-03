import React, { useState, useEffect } from 'react';
// import { Controller, useForm } from 'react-hook-form';
import FormRadioButtons from '../../../common/form/FormRadioButtons';
// import styles from '../drives/index.module.scss';
import styles from './index.module.scss';
import DatePicker from 'react-datepicker';
import SelectDropdown from '../../../common/selectDropdown';
// import FormCheckbox from '../../../common/form/FormCheckBox';
import FormInput from '../../../common/form/FormInput';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import NceShiftForm from './NceShiftForm';
import { toast } from 'react-toastify';
import { OPERATIONS_CENTER_NCE } from '../../../../routes/path';
import TopBar from '../../../common/topbar/index';
import * as yup from 'yup';
import moment from 'moment';
import SuccessPopUpModal from '../../../common/successModal';
import CancelModalPopUp from '../../../common/cancelModal';
import { API } from '../../../../api/api-routes';
import { formatUser } from '../../../../helpers/formatUser';
import { useLocation } from 'react-router-dom';
import CustomFieldsForm from '../../../common/customeFileds/customeFieldsForm';
import { customFieldsValidation } from '../../../common/customeFileds/yupValidation';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import GlobalMultiSelect from '../../../common/GlobalMultiSelect';
import {
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../../helpers/convertDateTimeToTimezone';
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
  shiftBreakStartTime: '',
  shiftBreakEndTime: '',
  showBreakTime: false,
};

const BASE_URL = process.env.REACT_APP_BASE_URL;

const NceCreate = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const ncpBlueprintId = searchParams.get('ncp_blueprint_id');
  let nceId = location?.state;
  const [selectedRadioOption, setSelectedRadioOption] = useState(
    nceId ? 'existing_nce' : 'blueprint'
  );
  const [showModel, setShowModel] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [profileListData, setProfileListData] = useState([]);
  const [locationOption, setLocationOption] = useState([]);
  const [statusOption, setStatusOption] = useState([]);
  const [, setNcBluePrintLis] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [ncp_Id, setNcp_Id] = useState(null);
  const [nceCopyDate, setNceCopyDate] = useState(null);
  const [collectionOperation, setCollectionOperation] = useState(null);
  const [eventCategory, setEventCategory] = useState('');
  const [eventSubCategory, setEventSubCategory] = useState('');
  const [ownerId, SetOwnerId] = useState(null);
  const [bluePrintNcpName, setBluePrintNcpName] = useState(null);
  const [shiftNcpName, setShiftNcpName] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [bluePrintData, setBluePrintData] = useState([]);
  const [initialTime, setInitialTime] = useState(null);
  const [nceIds, setNceId] = useState(null);
  const [customFileds, setcustomFields] = useState();
  const [dateMantainance, setDateMantainance] = useState(null);
  const [collectionOperationShow, setCollectionOperationShow] = useState(null);
  const [shifts, setShifts] = useState(
    selectedRadioOption !== 'existing_nce' ? [initialShift] : []
  );

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
    date: yup.date().required('Date is required.'),
    event_create_date: yup.date().when('form', {
      is: 'existing_nce',
      then: () => yup.date().required('Date is required.'),
      otherwise: () => yup.date().notRequired(),
    }),
    owner_id: yup.mixed().required('Owner is required.'),
    status: yup.object().required('Status is required.'),
    location: yup.object().required('Location is required.'),
    non_collection_profile: yup.object().required('NCP Name is required.'),
    blueprint_name: yup.string().when('form', {
      is: 'blueprint',
      then: () => yup.object().required('Blueprint is required.'),
      otherwise: () => yup.object().notRequired(),
    }),
    shifts: yup.array().of(
      yup.object().shape({
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

  const token = localStorage.getItem('token');
  const defaultValues =
    selectedRadioOption !== 'existing_nce' ? { shifts: [initialShift] } : null;

  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
    defaultValues: defaultValues,
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
      label: 'Create Non-Collection Events',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE.CREATE,
    },
  ];
  useEffect(() => {
    if (collectionOperation && selectedRadioOption !== 'existing_nce') {
      fetchLocation();
    }
  }, [collectionOperation]);

  useEffect(() => {
    getnonCollectionProfilesData();
    fetchOperationStatus();
    getCustomFields();
    // fetchLocation();
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
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const getSingleShiftData = async () => {
    try {
      const { data } = await API.ocNonCollectionEvents.getSingleShiftData(
        token,
        nceId ? nceId : +nceIds
      );
      if (data?.status_code === 200) {
        const modified = data?.data?.map((item) => {
          const showBreakTime =
            item?.break_start_time !== null && item?.break_end_time !== null;
          const startTime = moment(covertDatetoTZDate(item?.start_time));
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
        setShifts(modified);
        setValue('shifts', modified);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };
  const getNceData = async () => {
    try {
      const { data } = await API.ocNonCollectionEvents.getSingleData(
        token,
        nceId
      );
      if (data?.status_code === 200) {
        setValue('event_name', data?.data?.event_name);
        setValue('date', moment(data?.data?.date, 'YYYY-MM-DD').toDate());
        // setCollectionOperation({
        //   label: data?.data?.collection_operation_id?.name,
        //   value: data?.data?.collection_operation_id?.id,
        // });
        // setValue(
        //   'collection_operation',
        //   data?.data?.collection_operation_id?.id
        // );
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
        setValue('owner_id', {
          label: formatUser(data?.data?.owner_id, 1),
          value: data?.data?.owner_id?.id,
        });
        setValue('status', {
          label: data?.data?.status_id?.name,
          value: data?.data?.status_id?.id,
        });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (nceId) {
      getNceData();
      getSingleShiftData();
    }
  }, [nceId]);

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

  useEffect(() => {
    const getBluePrints = async (id) => {
      try {
        const response = await API.ocNonCollectionEvents.getAllblueprints(
          token,
          +id
        );
        const bPData = response?.data?.data?.map((item) => {
          return {
            label: item?.blueprint_name,
            value: +item?.id,
          };
        });
        setBluePrintData(bPData);
      } catch (error) {
        toast.error(`Failed to fetch`, { autoClose: 3000 });
      }
    };
    if (bluePrintNcpName) {
      getBluePrints(bluePrintNcpName);
    }
  }, [bluePrintNcpName]);

  useEffect(() => {
    const getNcpAndBp = async (id) => {
      try {
        const { data } = await API.ocNonCollectionEvents.getAllNCPBPDetail(
          token,
          id
        );
        if (data?.status_code === 200) {
          setValue('blueprint_name', {
            label: data?.data?.blueprint_name,
            value: +data?.data?.id,
          });
          const element =
            profileListData &&
            profileListData?.length &&
            profileListData.find(
              (item) =>
                +item?.value === +data?.data?.crm_non_collection_profiles_id?.id
            );
          setEventCategory(element?.event_category_id);
          setEventSubCategory(element?.event_subcategory_id);
          setCollectionOperationShow(
            element?.co_id?.map((obj) => {
              return {
                id: obj?.id,
                name: obj?.name,
              };
            })
          );
          const arrayOfIds = element?.co_id?.map((obj) => obj?.id);
          setValue('collection_operation', arrayOfIds);
          setCollectionOperation(arrayOfIds);
          // setNcp_Id(e?.value);
          setValue('non_collection_profile', {
            label: data?.data?.crm_non_collection_profiles_id?.profile_name,
            value: +data?.data?.crm_non_collection_profiles_id?.id,
          });
          setShiftNcpName(+data?.data?.id);
          setBluePrintNcpName(+data?.data?.crm_non_collection_profiles_id?.id);
        }
      } catch (error) {
        toast.error(`Failed to fetch`, { autoClose: 3000 });
      }
    };
    if (ncpBlueprintId) {
      getNcpAndBp(ncpBlueprintId);
    }
  }, [ncpBlueprintId, profileListData]);

  useEffect(() => {
    setShifts([initialShift]);
    const getShiftData = async (id) => {
      try {
        const response = await API.ocNonCollectionEvents.getAllShiftDetail(
          token,
          id
        );
        if (response?.data?.data) {
          const modified = response?.data?.data?.map((item) => {
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
          setShifts(modified);
          setValue('shifts', modified);
        }
      } catch (error) {
        toast.error(`Failed to fetch`, { autoClose: 3000 });
      }
    };
    if (shiftNcpName) {
      getShiftData(shiftNcpName);
    }
  }, [shiftNcpName]);

  useEffect(() => {
    const date = moment(nceCopyDate).format('YYYY-MM-DD');
    const getLocationData = async () => {
      try {
        const { data } = await API.ocNonCollectionEvents.getNceLocation(
          token,
          JSON.stringify(collectionOperation),
          date
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
      }
    };
    if (collectionOperation && nceCopyDate) {
      getLocationData();
    }
  }, [collectionOperation, nceCopyDate]);

  useEffect(() => {
    const getCopyNceData = async () => {
      try {
        const response = await API.ocNonCollectionEvents.getNceCopyData(
          token,
          +locationId
        );
        if (response?.data?.status_code === 200) {
          setNceId(response?.data?.data?.id);
          setValue('event_name', response?.data?.data?.event_name);
          setValue(
            'date',
            moment(response?.data?.data?.date, 'YYYY-MM-DD').toDate()
          );
          // setCollectionOperation({
          //   label: response?.data?.data?.collection_operation_id?.name,
          //   value: response?.data?.data?.collection_operation_id?.id,
          // });

          setCollectionOperationShow(
            response?.data?.data?.collection_operation_id?.map((obj) => {
              return {
                id: obj?.id,
                name: obj?.name,
              };
            })
          );
          const arrayOfIds = response?.data?.data?.collection_operation_id?.map(
            (obj) => obj?.id
          );
          setCollectionOperation(arrayOfIds);
          setValue('collection_operation', arrayOfIds);
          setValue('owner_id', {
            label: formatUser(response?.data?.data?.owner_id, 1),
            value: response?.data?.data?.owner_id?.id,
          });
          setValue('status', {
            label: response?.data?.data?.status_id?.name,
            value: response?.data?.data?.status_id?.id,
          });
        }
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      }
    };
    if (locationId && selectedRadioOption === 'existing_nce') {
      getCopyNceData();
    }
    if (nceIds && selectedRadioOption === 'existing_nce') {
      getSingleShiftData();
    }
  }, [locationId, nceIds]);

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
  const getBlueprintData = async () => {
    const id = parseInt(ncp_Id, 10);

    try {
      const { data } = await API.ocNonCollectionEvents.getAllblueprints(
        token,
        id
      );
      if (data) {
        const modified = data?.data?.map((item) => {
          return {
            value: item?.id,
            label: item?.blueprint_name,
          };
        });
        setNcBluePrintLis(modified);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };
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
    } finally {
      // setIsLoading(false);
    }
  };

  const handleRemoveShift = (index) => {
    if (shifts.length > 1) {
      const updatedShifts = [...shifts];
      updatedShifts?.splice(index, 1);
      setShifts(updatedShifts);
    }
  };
  const onSubmit = async (data) => {
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
      };
    });
    const fieldsData = [];
    // const customFieldDatableId = 0; // You can change this as needed
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
              ? moment(value).format('YYYY-MM-DD')
              : value?.toString(),
        });
      }
    }
    resulting = {
      fields_data: fieldsData,
      custom_field_datable_type: customFieldDatableType,
    };
    const body = {
      custom_fields: resulting,
      date: covertToTimeZone(moment(data?.date)).format('YYYY-MM-DD'),
      event_name: data?.event_name,
      owner_id: +data?.owner_id?.value,
      non_collection_profile_id: +data?.non_collection_profile?.value,
      location_id: +data?.location?.value,
      collection_operation_id: data?.collection_operation?.map((str) =>
        parseInt(str, 10)
      ),
      status_id: +data?.status?.value,
      event_category_id: +eventCategory,
      event_subcategory_id: +eventSubCategory ?? null,
      shifts: shiftData,
      approval_status: 'approved',
      is_archived: false,
    };
    try {
      const response = await API?.ocNonCollectionEvents?.create(token, body);
      if (response?.data?.status_code === 201) {
        setShowModel(true);
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
        title={'Success !'}
        message={'NCE Created Successfully'}
        modalPopUp={showModel}
        setModalPopUp={setShowModel}
        showActionBtns={true}
        isNavigate={true}
        redirectPath={OPERATIONS_CENTER_NCE.LIST}
      />
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Non-Collection Events'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form className={styles.account} onSubmit={handleSubmit(onSubmit)}>
          <div className="formGroup">
            <h5>Schedule Non-Collection Event</h5>
            <div className={styles.CheckboxGroup}>
              <Controller
                name="form"
                control={control}
                defaultValue={selectedRadioOption}
                render={({ field }) => (
                  <>
                    <FormRadioButtons
                      label={'NCP Blueprint'}
                      value={'blueprint'}
                      className={`${styles.formCheckBoxes} gap-2`}
                      selected={field?.value}
                      handleChange={(event) => {
                        field?.onChange({
                          target: { value: event.target.value },
                        });
                        setValue('location', null);
                        setValue('non_collection_profile', null);
                        setValue('blueprint_name', null);
                        setValue('event_create_date', null);
                        setValue('event_name', '');
                        setValue('date', null);
                        setNceId(null);
                        setNceCopyDate(null);
                        setCollectionOperation(null);
                        setCollectionOperationShow([]);
                        setShifts([initialShift]);
                        setValue('shifts', [initialShift]);
                        setValue('collection_operation', null);
                        setValue('owner_id', null);
                        setValue('status', null);
                        clearErrors('location');
                        clearErrors('non_collection_profile');
                        clearErrors('blueprint_name');
                        clearErrors('event_create_date');
                        setSelectedRadioOption('blueprint');
                      }}
                    />
                    <FormRadioButtons
                      label={'Copy NCE'}
                      value={'existing_nce'}
                      className={`${styles.formCheckBoxes} gap-2`}
                      selected={field?.value}
                      handleChange={(event) => {
                        field?.onChange({
                          target: { value: event.target.value },
                        });
                        setValue('location', null);
                        setValue('non_collection_profile', null);
                        setValue('blueprint_name', null);
                        setValue('event_create_date', null);
                        setShiftNcpName(null);
                        setCollectionOperation(null);
                        setCollectionOperationShow([]);
                        setValue('collection_operation', null);
                        clearErrors('location');
                        clearErrors('non_collection_profile');
                        clearErrors('blueprint_name');
                        setLocationOption([]);
                        clearErrors('event_create_date');
                        setShifts([initialShift]);
                        setValue('shifts', [initialShift]);
                        setSelectedRadioOption('existing_nce');
                        if (!nceId) {
                          setValue('date', null);
                        }
                      }}
                    />
                    <FormRadioButtons
                      label={'Clean Slate'}
                      value={'clean_state'}
                      className={`${styles.formCheckBoxes} gap-2`}
                      selected={field?.value}
                      handleChange={(event) => {
                        field?.onChange({
                          target: { value: event.target.value },
                        });
                        setValue('location', null);
                        setValue('non_collection_profile', null);
                        setValue('blueprint_name', null);
                        setValue('event_create_date', null);
                        setShiftNcpName(null);
                        setShifts([initialShift]);
                        setValue('shifts', [initialShift]);
                        setValue('event_name', '');
                        setValue('date', null);
                        setNceId(null);
                        setNceCopyDate(null);
                        setCollectionOperation(null);
                        setCollectionOperationShow([]);
                        setValue('collection_operation', null);
                        setValue('owner_id', null);
                        setValue('status', null);
                        clearErrors('location');
                        clearErrors('non_collection_profile');
                        clearErrors('blueprint_name');
                        clearErrors('event_create_date');
                        setSelectedRadioOption('clean_state');
                      }}
                    />
                  </>
                )}
              />
            </div>
            {selectedRadioOption === 'clean_state' && (
              <>
                <Controller
                  name={`non_collection_profile`}
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'NCP Name'}
                      defaultValue={field?.value}
                      selectedValue={field?.value}
                      removeDivider
                      options={profileListData}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        setEventCategory(e?.event_category_id);
                        setEventSubCategory(e?.event_subcategory_id);
                        field?.onChange(e);
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
                        setNcp_Id(e?.value);
                        getBlueprintData();
                        setValue('location', null);
                      }}
                      error={errors?.non_collection_profile?.message}
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
                      removeDivider
                      options={locationOption}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        field?.onChange(e);
                        // setValue('location1', e);
                      }}
                      error={errors?.location?.message}
                    />
                  )}
                />
              </>
            )}
            {selectedRadioOption === 'blueprint' && (
              <>
                <Controller
                  name={`non_collection_profile`}
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'NCP Name'}
                      defaultValue={field?.value}
                      selectedValue={field?.value}
                      removeDivider
                      options={profileListData}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        field?.onChange(e);
                        setEventCategory(e?.event_category_id);
                        setEventSubCategory(e?.event_subcategory_id);
                        setCollectionOperationShow(
                          e?.co_id?.map((obj) => {
                            return {
                              id: obj?.id,
                              name: obj?.name,
                            };
                          })
                        );
                        setBluePrintNcpName(e?.value);
                        const arrayOfIds = e?.co_id?.map((obj) => obj?.id);
                        setValue('collection_operation', arrayOfIds);
                        setCollectionOperation(arrayOfIds);
                        setNcp_Id(e?.value);
                        setValue('location', null);
                        setValue('blueprint_name', null);
                        setShifts([initialShift]);
                        setValue('shifts', [initialShift]);
                        setShiftNcpName(null);
                      }}
                      error={errors?.non_collection_profile?.message}
                    />
                  )}
                />
                <Controller
                  name={`blueprint_name`}
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'Blueprint'}
                      defaultValue={field?.value}
                      selectedValue={field?.value}
                      removeDivider
                      options={bluePrintData}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        field?.onChange(e);
                        setShiftNcpName(e?.value);
                      }}
                      error={errors?.blueprint_name?.message}
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
              </>
            )}
            {selectedRadioOption === 'existing_nce' && (
              <>
                <Controller
                  name={`non_collection_profile`}
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'NCP Name'}
                      defaultValue={field?.value}
                      selectedValue={field?.value}
                      removeDivider
                      options={profileListData}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        field?.onChange(e);
                        setEventCategory(e?.event_category_id);
                        setEventSubCategory(e?.event_subcategory_id);
                        setCollectionOperationShow(
                          e?.co_id?.map((obj) => {
                            return {
                              id: obj?.id,
                              name: obj?.name,
                            };
                          })
                        );
                        const arrayOfIds = e?.co_id?.map((obj) => obj?.id);
                        setValue('collection_operation', arrayOfIds);
                        setCollectionOperation(arrayOfIds);
                        setNcp_Id(e?.value);
                        getBlueprintData();
                      }}
                      error={errors?.non_collection_profile?.message}
                    />
                  )}
                />
                <Controller
                  name="event_create_date"
                  control={control}
                  render={({ field }) => (
                    <div className="form-field">
                      <div className={`field`}>
                        <DatePicker
                          dateFormat="MM-dd-yyyy"
                          className="custom-datepicker effectiveDate"
                          placeholderText={'Date*'}
                          selected={field?.value}
                          // minDate={new Date()}
                          onChange={(e) => {
                            field?.onChange(e);
                            setNceCopyDate(e);
                          }}
                          handleBlur={(e) => {
                            field?.onChange(e);
                          }}
                        />
                        {field?.start_date && (
                          <label
                            className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                          >
                            Date*
                          </label>
                        )}
                      </div>
                      {errors?.event_create_date?.message && (
                        <div className="error">
                          <p>{errors?.event_create_date?.message}</p>
                        </div>
                      )}
                    </div>
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
                      removeDivider
                      options={locationOption}
                      onBlur={field?.onBlur}
                      showLabel
                      onChange={(e) => {
                        field?.onChange(e);
                        setLocationId(e?.value);
                        // setValue('location3', e);
                      }}
                      error={errors?.location?.message}
                    />
                  )}
                />
              </>
            )}
          </div>
          <div className="formGroup">
            <h5>Create Non-Collection Event</h5>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <div className="form-field">
                  <div className={`field`}>
                    <DatePicker
                      dateFormat="MM-dd-yyyy"
                      className="custom-datepicker effectiveDate"
                      placeholderText={'Date*'}
                      selected={field?.value}
                      minDate={new Date()}
                      //   error={formErrors?.start_date?.message}
                      onChange={(e) => {
                        field?.onChange(e);
                        setDateMantainance(e);
                      }}
                      handleBlur={(e) => {
                        field?.onChange(e);
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
                  name={field?.name}
                  classes={{ root: '' }}
                  displayName="Event Name"
                  value={field?.value}
                  required={false}
                  //disabled={true}
                  onChange={(e) => {
                    field?.onChange(e);
                  }}
                  handleBlur={(e) => {
                    field?.onChange(e);
                  }}
                  error={errors?.event_name?.message}
                />
              )}
            />
            <h4>Attributes</h4>
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
                key={
                  selectedRadioOption !== 'existing_nce'
                    ? shift?.generatedId
                    : shift?.generatedId
                    ? shift?.generatedId
                    : shift?.id
                }
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
                shifts={shifts}
                getValues={getValues}
                setValue={setValue}
                initialTime={initialTime}
                collectionOperation={collectionOperation}
                dateMantainance={dateMantainance}
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
          <span
            className="btn simple-text"
            onClick={() => {
              setCloseModal(true);
            }}
          >
            Cancel
          </span>
          <button
            type="button"
            className={`btn-md btn btn-primary`}
            onClick={handleSubmit(onSubmit)}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NceCreate;
