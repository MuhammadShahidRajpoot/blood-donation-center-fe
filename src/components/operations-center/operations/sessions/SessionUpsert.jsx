import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import styles from '../drives/index.module.scss';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import sessionSchema from './sessionSchema';
import SessionForm from './upsert/SessionForm';
import { API } from '../../../../api/api-routes';
import ScheduleShiftForm from './upsert/ScheduleShiftForm';
import SelectSessionForm from './upsert/SelectSessionForm';
import CustomFieldsForm from '../../../common/customeFileds/customeFieldsForm';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { OPERATIONS_CENTER_SESSIONS_PATH } from '../../../../routes/path';
import CancelModalPopUp from '../../../common/cancelModal';
import SuccessPopUpModal from '../../../common/successModal';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import moment from 'moment';
import CheckPermission from '../../../../helpers/CheckPermissions';
import Permissions from '../../../../enums/OcPermissionsEnum';
import { toast } from 'react-toastify';
import { formEnum } from './upsert/enums';
import {
  covertDatetoTZDate,
  covertToTimeZone,
  removeTZ,
} from '../../../../helpers/convertDateTimeToTimezone';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import WarningModalPopUp from '../../../common/warningModal';

function SessionUpsert({ isCopy = false, isBlueprint = false }) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formValue, setFormValue] = useState(
    isCopy
      ? formEnum.COPY_SESSION
      : isBlueprint
      ? formEnum.SESSION_BLUEPRINT
      : formEnum.CLEAN_SLATE
  );
  const [donorCenters, setDonorCenters] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [collectionOperation, setCollectionOperation] = useState(null);
  const [status, setStatus] = useState([]);
  const [customFileds, setCustomFields] = useState();
  const [success, setSuccess] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [procedureTypes, setProcedureTypes] = React.useState([]);
  const [devices, setDevices] = React.useState([]);
  const [bookingRules, setBookingRules] = React.useState([]);
  const [customErrors, setCustomErrors] = React.useState({});
  const [isOverrideUser, setIsOverrideUser] = React.useState(false);
  const [OEF, setOEF] = useState({
    minOEF: 0,
    maxOEF: 0,
  });
  const [slots, setSlots] = React.useState({});
  const [archivePopup, setArchivePopup] = useState(false);
  const [stayOnEditSession, setStayOnEditSession] = useState(false);
  const [sessions, setSessions] = React.useState([]);
  const [copyDonorCenter, setCopyDonorCenter] = React.useState(null);
  const [copyDate, setCopyDate] = React.useState(null);
  const [blueprints, setBlueprints] = React.useState([]);
  const [activeWeekDays, setActiveWeekDays] = useState([]);
  const [shareStaffData, setShareStaffData] = React.useState([]);
  const [resourceShareData, setResourceShareData] = useState([]);
  const [dailyCapacities, setDailyCapacities] = useState({});
  const [staffUtilization, setStaffUtilization] = useState(0);
  const [calcStaffUtilization, setCalcStaffUtilization] = useState(0);
  const [isSessionOverride, setSessionOverride] = useState(false);
  const [shareStaffSearch, setShareStaffSearch] = React.useState('');
  const [staffSearched, setStaffSearched] = React.useState(false);

  const {
    control,
    formState: { isDirty, errors: formErrors },
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(sessionSchema(customFileds, isBlueprint)),
    defaultValues: {
      donor_center: null,
      promotions: [],
      collection_operation: null,
      status: null,
      shifts: [
        {
          start_time: null,
          end_time: null,
          staff_break: false,
          break_start_time: null,
          break_end_time: null,
          oef_products: 0,
          oef_procedures: 0,
          reduce_slots: false,
          projections: [
            {
              procedure: null,
              procedure_type_qty: 1,
              staff_setup: [],
            },
          ],
          remove_projections: [],
          appointment_reduction: 0,
          devices: [],
        },
      ],
      remove_shifts: [],
      override: false,
    },
    mode: 'all',
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'shifts',
  });
  const { append: appendRemoveShift } = useFieldArray({
    control,
    name: 'remove_shifts',
  });

  const watchDonorCenter = watch('donor_center');
  const watchSessionDate = watch('session_date');
  const watchPromotions = watch('promotions');
  const watchShifts = watch('shifts');
  const watchEarliestShiftTime = watch('earliest_shift_time');
  const watchBlueprintName = watch('blueprint_name');
  const watchStartDate = watch('start_date');
  const watchEndDate = watch('end_date');

  const shiftsJSON = JSON.stringify(watchShifts);
  const isEdit = !!params?.id && !isCopy;
  const isValidEditableTime =
    !isOverrideUser &&
    new Date(watchEarliestShiftTime) <
      new Date(bookingRules.schedule_lock_lead_time_eff_date) &&
    new Date(watchEarliestShiftTime) >
      new Date(bookingRules.current_lock_lead_time_eff_date);

  const refTypeEnum = {
    SESSION: '1',
    BLUEPRINT: '2',
  };
  useEffect(() => {
    const date = moment(
      watchSessionDate ? watchSessionDate : watchStartDate
    ).format('MM-DD-YYYY');

    if (date) {
      if (shareStaffSearch?.length > 1) {
        setStaffSearched(true);
        fetchStagingSitesAndDonorCenters(date);
      }
      if (shareStaffSearch?.length <= 1 && staffSearched) {
        fetchStagingSitesAndDonorCenters(date);
        setStaffSearched(false);
      }
    }
  }, [shareStaffSearch]);

  const breadcrumbsData = [
    { label: 'Operations Center', class: 'disable-label', link: '/' },
    {
      label: 'Operations',
      class: 'disable-label',
      link: '#',
    },
    {
      label: 'Sessions',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: isEdit ? 'Edit Session' : 'Create Session',
      class: 'disable-label',
      link: isEdit
        ? OPERATIONS_CENTER_SESSIONS_PATH.EDIT.replace(':id', params?.id)
        : OPERATIONS_CENTER_SESSIONS_PATH.CREATE,
    },
  ];

  useEffect(() => {
    const donorCenter =
      watchDonorCenter &&
      donorCenters.find((dc) => dc.id === watchDonorCenter.value);

    if (donorCenter) {
      setOEF({
        minOEF: donorCenter.minimum_oef || 0,
        maxOEF: donorCenter.maximum_oef || 0,
      });
      setCollectionOperation({
        id: donorCenter?.collection_operation_id,
        name: donorCenter?.collection_operation,
      });
    } else {
      setCollectionOperation(null);
      setDevices([]);
      if (!isBlueprint) {
        setPromotions([]);
        setValue('promotions', []);
      }
      fields.forEach((_, index) => {
        setValue(`shifts[${index}].devices`, []);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donorCenters, watchDonorCenter, setValue]);

  useEffect(() => {
    const fetchDonorCenters = async () => {
      const { data } =
        await API.systemConfiguration.organizationalAdministrations.facilities.getDonorCenters();
      setDonorCenters(data?.data || []);
    };

    const fetchStatus = async () => {
      const { data } =
        await API.systemConfiguration.operationAdministrations.bookingDrives.operationStatus.getOperationStatus();
      setStatus(data?.data || []);
    };

    const fetchCustomFields = async () => {
      try {
        const { data } =
          await API.systemConfiguration.organizationalAdministrations.customFields.getModuleCustomFields(
            7
          );
        if (data?.status === 200) setCustomFields(data?.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchProcedureTypes = async () => {
      const { data } =
        await API.systemConfiguration.organizationalAdministrations.procedureTypes.list(
          {
            fetchAll: 'true',
            status: 'true',
            goal_type: 'true',
          }
        );
      setProcedureTypes(data?.data || []);
    };

    const fetchBookingRules = async () => {
      const { data } =
        await API.systemConfiguration.operationAdministrations.bookingDrives.bookingRules.getBookingRules();
      setBookingRules(data?.data || {});
    };

    const fetchCurrentUser = async () => {
      const { data } =
        await API.systemConfiguration.userAdministration.users.getCurrent();
      setIsOverrideUser(data?.data?.override || false);
    };

    const fetchAllPromotions = async () => {
      if (!isBlueprint) return;
      const { data } =
        await API.systemConfiguration.operationAdministrations.marketingEquipment.promotions.getAllPromotions(
          { status: true }
        );
      setPromotions(
        data?.data?.map((promo) => ({
          id: promo?.id,
          name: promo?.name,
        })) || []
      );
    };

    fetchCurrentUser();
    fetchProcedureTypes();
    fetchDonorCenters();
    fetchStatus();
    fetchCustomFields();
    fetchBookingRules();
    fetchAllPromotions();
  }, [isBlueprint]);

  const addShift = React.useCallback(() => {
    append({
      start_time: null,
      end_time: null,
      staff_break: false,
      break_start_time: undefined,
      break_end_time: undefined,
      oef_products: 0,
      oef_procedures: 0,
      reduce_slots: false,
      projections: [
        {
          procedure: null,
          procedure_type_qty: 1,
          staff_setup: [],
        },
      ],
      appointment_reduction: 0,
      devices: [],
    });
  }, [append]);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data } = await API.operationCenter.sessions.find(params?.id);
      setSession(data?.data || {});
      setLoading(false);
    };

    const validateSessionDate = (sessionDate) => {
      if (isEdit && sessionDate < new Date()) {
        toast.error('This session is not editable', { autoClose: 3000 });
        navigate(OPERATIONS_CENTER_SESSIONS_PATH.LIST);
      }
    };

    const setCustomFields = (customFields) => {
      return customFields?.forEach((customField) => {
        if (customField?.field_id?.field_data_type === '4') {
          const fieldValue = customField?.field_id?.pick_list?.filter(
            (pickList) => pickList.type_value === customField.field_data
          );
          setValue(customField.field_id.id, {
            label: fieldValue?.[0].type_name,
            value: fieldValue?.[0].type_value,
          });
        } else {
          setValue(customField?.field_id?.id, customField?.field_data);
        }
        setValue(`customField-${customField?.field_id?.id}`, customField?.id);
      });
    };

    const setProjections = (projections, shiftIndex) => {
      return projections?.forEach((projection, projectionIndex) => {
        const fieldName = `shifts[${shiftIndex}].projections[${projectionIndex}]`;
        setValue(`${fieldName}.loading`, true);
        setValue(`${fieldName}.id`, projection?.id);
        setTimeout(() => {
          setValue(`${fieldName}.procedure`, {
            ...projection?.procedure_type,
            label: projection?.procedure_type?.name,
            value: projection?.procedure_type?.id,
          });
          setTimeout(() => {
            setValue(
              `${fieldName}.procedure_type_qty`,
              projection?.procedure_type_qty
            );
            setValue(`${fieldName}.product_yield`, projection?.product_yield);
            setTimeout(() => {
              setValue(
                `${fieldName}.staff_setup`,
                projection?.staff_setup.map((staff) => ({
                  ...staff,
                  id: staff?.id?.toString(),
                }))
              );
              setValue(`${fieldName}.loading`, false);
            }, 2000);
          }, 500);
        }, 0);
      });
    };

    const setShifts = (shifts) => {
      return shifts?.forEach((shift, shiftIndex) => {
        if (shifts.length > fields.length && shiftIndex !== 0) addShift();
        setValue(`shifts[${shiftIndex}].shift_id`, shift?.id);
        setValue(
          `shifts[${shiftIndex}].start_time`,
          moment(covertDatetoTZDate(shift?.start_time))
        );
        setValue(
          `shifts[${shiftIndex}].end_time`,
          moment(covertDatetoTZDate(shift?.end_time))
        );
        setProjections(shift?.projections, shiftIndex);
        setTimeout(() => {
          setValue(
            `shifts[${shiftIndex}].devices`,
            shift?.devices?.map((device) => ({
              ...device,
              id: device?.id?.toString(),
            })) || []
          );
        }, 0);
        if (shift?.break_start_time || shift?.break_end_time) {
          setValue(`shifts[${shiftIndex}].staff_break`, true);
        }
        setValue(
          `shifts[${shiftIndex}].break_start_time`,
          moment(covertDatetoTZDate(shift?.break_start_time))
        );
        setValue(
          `shifts[${shiftIndex}].break_end_time`,
          moment(covertDatetoTZDate(shift?.break_end_time))
        );
        setValue(`shifts[${shiftIndex}].reduce_slots`, shift?.reduce_slots);
        setValue(
          `shifts[${shiftIndex}].appointment_reduction`,
          shift?.reduction_percentage
        );
      });
    };

    const setSession = (session) => {
      let sessionDate = new Date(session?.date);
      let earliestShiftTime = new Date(session?.earliest_shift_time);
      sessionDate.setHours(earliestShiftTime.getHours());
      sessionDate.setMinutes(earliestShiftTime.getMinutes());
      sessionDate.setSeconds(earliestShiftTime.getSeconds());
      sessionDate.setMilliseconds(earliestShiftTime.getMilliseconds());
      validateSessionDate(sessionDate);

      setValue('session_date', new Date(session?.date));
      setValue('donor_center', {
        label: session?.donor_center?.name,
        value: session?.donor_center?.id,
      });
      if (isCopy) {
        setCopyDate({
          label: moment(session?.date).format('MM-DD-YYYY'),
          value: session?.id,
        });
        setCopyDonorCenter({
          label: session?.donor_center?.name,
          value: session?.donor_center?.id,
        });
      }
      setTimeout(() => {
        setValue(
          'promotions',
          session?.promotions.map((promotion) => ({
            id: promotion.id,
            name: promotion.name,
          })) || []
        );
      }, 0);
      setValue('status', {
        label: session?.operation_status?.name,
        value: session?.operation_status?.id,
      });
      setValue('earliest_shift_time', sessionDate);
      setCustomFields(session?.customFields);
      setShifts(session?.shifts);
    };

    if (params?.id && !success) fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addShift, params?.id, setValue, success]);

  useEffect(() => {
    const fetchDevices = async () => {
      const { data } =
        await API.systemConfiguration.organizationalAdministrations.devices.getDriveDevices(
          {
            collection_operation: collectionOperation.id,
          }
        );
      setDevices(data?.data || []);
    };

    if (collectionOperation) {
      fetchDevices();
      setValue('collection_operation', collectionOperation);
    } else {
      setDevices([]);
      setValue('collection_operation', '');
    }
    setCustomErrors((prevErrors) => ({
      ...prevErrors,
      collection_operation: '',
    }));
  }, [collectionOperation, setValue]);

  const fetchStagingSitesAndDonorCenters = async (date) => {
    const {
      data: { data },
    } =
      await API.systemConfiguration.organizationalAdministrations.facilities.getStagingSitesAndDonorCenters(
        date,
        collectionOperation.id,
        PolymorphicType.OC_OPERATIONS_SESSIONS,
        shareStaffSearch
      );
    setShareStaffData(data);
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data } =
        await API.systemConfiguration.operationAdministrations.marketingEquipment.promotions.getPromotionsForOperationAdministration(
          {
            collectionOperationId: collectionOperation.id,
            date: watchSessionDate,
            status: 'true',
          }
        );
      setPromotions(
        data?.data?.map((promo) => ({ id: promo?.id, name: promo?.name })) || []
      );
    };

    const fetchDailyCapacities = async (date) => {
      const response =
        await API.systemConfiguration.operationAdministrations.bookingDrives.dailyCapacities.getDailyCapacities(
          collectionOperation.id,
          date
        );
      setDailyCapacities(response?.data?.data);
    };

    const fetchStaffUtilization = async (date) => {
      const {
        data: {
          data: { count },
        },
      } =
        await API.systemConfiguration.staffAdmininstration.staffSetup.getStaffSetupUtilizationForSessions(
          {
            ...(isEdit && { sessions_id: params?.id }),
            sessions_date: date,
            collection_operation_id: collectionOperation.id,
          }
        );
      setStaffUtilization(count || 0);
    };

    if (collectionOperation && (watchSessionDate || watchStartDate)) {
      const date = moment(
        watchSessionDate ? watchSessionDate : watchStartDate
      ).format('MM-DD-YYYY');
      fetchStagingSitesAndDonorCenters(date);
      fetchDailyCapacities(date);
      fetchStaffUtilization(date);
      !isBlueprint && fetchPromotions();
    } else {
      !isBlueprint && setPromotions([]);
    }
  }, [
    collectionOperation,
    watchSessionDate,
    watchStartDate,
    setValue,
    isBlueprint,
    isEdit,
    params?.id,
  ]);

  useEffect(() => {
    if (copyDate)
      navigate(
        OPERATIONS_CENTER_SESSIONS_PATH.COPY.replace(':id', copyDate.value)
      );
  }, [copyDate, navigate]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await API.operationCenter.sessions.list({
        donor_center_id: copyDonorCenter.value,
      });
      setSessions(data?.data?.records || []);
    };

    if (copyDonorCenter) fetchSessions();
  }, [copyDonorCenter]);

  useEffect(() => {
    const donorCenterId = searchParams.get('donor_center_id');
    const donorCenter = donorCenters.find((dc) => dc.id === donorCenterId);

    if (isBlueprint && donorCenter) {
      setValue('donor_center', {
        label: donorCenter.name,
        value: donorCenter.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlueprint, donorCenters, searchParams, setValue]);

  useEffect(() => {
    const blueprintId = searchParams.get('blueprint_id');
    const donorCenterId = searchParams.get('donor_center_id');
    const donorCenter = donorCenters.find((dc) => dc.id === donorCenterId);
    const blueprint = blueprints.find(
      (bp) => bp.value.toString() === blueprintId
    );

    if (isBlueprint && donorCenter && blueprint) {
      setValue('blueprint_name', blueprint);
    }
  }, [blueprints, donorCenters, isBlueprint, searchParams, setValue]);

  useEffect(() => {
    const fetchBlueprints = async () => {
      const { data } = await API.crm.donorCenter.blueprint.getBlueprints(
        watchDonorCenter?.value,
        { status: true, fetchAll: true }
      );
      setBlueprints(
        data?.data?.map((blueprint) => ({
          value: blueprint?.donor_center_blueprints?.id,
          label: blueprint?.donor_center_blueprints?.name,
        })) || []
      );
    };

    if (isBlueprint && watchDonorCenter) {
      setValue('shifts', []);
      addShift();
      setActiveWeekDays([]);
      fetchBlueprints();
    } else {
      setActiveWeekDays([]);
    }
  }, [addShift, isBlueprint, setValue, watchDonorCenter]);

  useEffect(() => {
    const fetchBlueprintDetail = async () => {
      const response = await API.crm.donorCenter.blueprint.getOne(
        watchBlueprintName?.value
      );
      const {
        data: {
          data: { data, projections },
        },
      } = response;

      const { donor_center_blueprint, shifts } = data?.[0] || {};

      if (donor_center_blueprint?.donorcenter?.collection_operation) {
        setCollectionOperation(
          donor_center_blueprint?.donorcenter?.collection_operation
        );
      }

      // Merge Shifts and Projections
      const shiftProjections = {};
      for (const projection of projections) {
        if (!shiftProjections[projection.shift_id]) {
          shiftProjections[projection.shift_id] = [];
        }
        shiftProjections[projection.shift_id].push(projection);
      }
      for (const shift of shifts || []) {
        shift.projections = shiftProjections[shift.id] || [];
      }

      const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
        donor_center_blueprint;
      setActiveWeekDays([
        monday && 'monday',
        tuesday && 'tuesday',
        wednesday && 'wednesday',
        thursday && 'thursday',
        friday && 'friday',
        saturday && 'saturday',
        sunday && 'sunday',
      ]);
      setShifts(shifts || []);
    };

    const setProjections = (projections, shiftIndex) => {
      return projections?.forEach((projection, projectionIndex) => {
        const fieldName = `shifts[${shiftIndex}].projections[${projectionIndex}]`;
        setValue(`${fieldName}.id`, projection?.id);
        setTimeout(() => {
          setValue(`${fieldName}.procedure`, {
            ...projection?.procedure_type,
            label: projection?.procedure_type?.name,
            value: projection?.procedure_type?.id.toString(),
            procedure_types_products:
              projection?.procedure_type?.procedure_type_products?.map(
                (product) => ({
                  ...product,
                  products: { name: product?.name },
                })
              ),
          });
          setTimeout(() => {
            setValue(
              `${fieldName}.procedure_type_qty`,
              +projection?.procedure_type_qty
            );
            setValue(`${fieldName}.product_yield`, +projection?.product_yield);
            setTimeout(() => {
              setValue(
                `${fieldName}.staff_setup`,
                projection?.staff_setups?.map((staff) => ({
                  ...staff,
                  id: staff?.id?.toString(),
                }))
              );
            }, 2000);
          }, 500);
        }, 0);
      });
    };

    const setShifts = (shifts) => {
      return shifts?.forEach((shift, shiftIndex) => {
        if (shifts.length > fields.length && shiftIndex !== 0) addShift();
        setValue(`shifts[${shiftIndex}].shift_id`, shift?.id);
        setValue(
          `shifts[${shiftIndex}].start_time`,
          moment(covertDatetoTZDate(shift?.start_time))
        );
        setValue(
          `shifts[${shiftIndex}].end_time`,
          moment(covertDatetoTZDate(shift?.end_time))
        );
        setProjections(shift?.projections, shiftIndex);
        setTimeout(() => {
          setValue(
            `shifts[${shiftIndex}].devices`,
            shift?.shifts_devices?.map((device) => ({
              ...device,
              id: device?.id?.toString(),
            })) || []
          );
        }, 0);
        if (shift?.break_start_time || shift?.break_end_time) {
          setValue(`shifts[${shiftIndex}].staff_break`, true);
        }
        setValue(
          `shifts[${shiftIndex}].break_start_time`,
          moment(covertDatetoTZDate(shift?.break_start_time))
        );
        setValue(
          `shifts[${shiftIndex}].break_end_time`,
          moment(covertDatetoTZDate(shift?.break_end_time))
        );
        setValue(`shifts[${shiftIndex}].reduce_slots`, shift?.reduce_slots);
        setValue(
          `shifts[${shiftIndex}].appointment_reduction`,
          shift?.reduction_percentage
        );
      });
    };

    if (isBlueprint) watchBlueprintName && fetchBlueprintDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addShift,
    isBlueprint,
    setValue,
    watchBlueprintName,
    watchBlueprintName?.value,
  ]);

  useEffect(() => {
    function days(from, to) {
      let daysBetween = [],
        daysOfWeek = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ];
      while (from < to) {
        if (daysBetween?.includes(daysOfWeek[from.getDay()]))
          return daysBetween;
        daysBetween.push(daysOfWeek[from.getDay()]);
        from.setDate(from.getDate() + 1);
      }
      if (from.getDay() === to.getDay())
        // include last day
        daysBetween.push(daysOfWeek[from.getDay()]);
      return daysBetween;
    }

    const from = new Date(watchStartDate),
      to = new Date(watchEndDate);
    const daysbetween = days(from, to);
    const validDateRange = activeWeekDays
      ?.filter((day) => day)
      ?.every((day) => daysbetween.includes(day));
    if (watchStartDate && watchEndDate && !validDateRange) {
      toast.error('The selected days does not fall between the date range', {
        autoClose: 3000,
      });
      setValue('end_date', undefined);
    }
  }, [watchStartDate, watchEndDate, activeWeekDays, setValue]);

  useEffect(() => {
    const utilization = watchShifts.reduce((shiftSum, shift) => {
      return (
        shiftSum +
        (shift.projections?.reduce(
          (projSum, proj) =>
            projSum +
            (proj?.staff_setup?.reduce(
              (setupSum, setup) =>
                setupSum +
                parseFloat(
                  (setup?.sum_staff_qty ? setup?.sum_staff_qty : setup?.qty) ||
                    0
                ),
              0
            ) || 0),
          0
        ) || 0)
      );
    }, staffUtilization);

    if (calcStaffUtilization !== utilization) {
      setCalcStaffUtilization(utilization);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffUtilization, watchShifts, shiftsJSON]);

  const handleCancel = async () => {
    if (!isDirty) navigate(OPERATIONS_CENTER_SESSIONS_PATH.LIST);
    setCancel(true);
  };

  const handleCustomFields = async (formData) => {
    const tempFields = [];
    for (const key in formData) {
      if (key > 0) {
        const value = formData[key]?.value ?? formData[key];
        const customFieldId = formData[`customField-${key}`];
        tempFields.push({
          ...(isEdit && customFieldId ? { id: customFieldId } : {}),
          field_id: parseInt(key),
          field_data:
            typeof value === 'object' && value !== null && !Array.isArray(value)
              ? covertToTimeZone(moment(value))
              : value?.toString(),
        });
      }
    }
    return {
      fields_data: tempFields,
      custom_field_datable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
    };
  };

  const validateCustomErrors = () => {
    return Object.values(customErrors).every((error) => error === '');
  };

  const getBlueprintPayload = (startDate, endDate, payload) => {
    moment.updateLocale('en', {
      week: {
        dow: 1,
      },
    });
    const payloads = [];
    for (
      const sessionDate = new Date(startDate);
      sessionDate <= new Date(endDate);
      sessionDate.setDate(sessionDate.getDate() + 1)
    ) {
      const date = moment(sessionDate);
      let sessionDay = sessionDate.getDay();
      sessionDay = sessionDay === 0 ? 6 : sessionDay - 1;
      activeWeekDays.forEach((day, dayIndex) => {
        if (!day) return;
        if (dayIndex === sessionDay) {
          payloads.push({
            ...payload,
            date: removeTZ(date),
          });
          return;
        }
      });
    }
    return payloads;
  };

  const onSubmit = async (formData) => {
    const date = moment(formData?.session_date);
    if (!validateCustomErrors()) return;
    const customFieldsData = await handleCustomFields(formData);
    formData = { ...formData, custom_fields: customFieldsData };
    let refrenceId, refrenceType;
    let isRefrence = false;
    if (isCopy || isBlueprint) {
      isRefrence = true;
      refrenceId = isCopy
        ? params?.id
        : isBlueprint
        ? getValues('blueprint_id')
        : '';
      refrenceType = isCopy
        ? refTypeEnum.SESSION
        : isBlueprint
        ? refTypeEnum.BLUEPRINT
        : '';
    }
    const payload = {
      date: isEdit ? date : removeTZ(date),
      promotion_ids: formData?.promotions?.map((promo) => parseInt(promo.id)),
      donor_center_id: formData?.donor_center?.value,
      status_id: formData?.status?.value,
      collection_operation_id: formData?.collection_operation?.id,
      custom_fields: formData?.custom_fields,
      slots,
      shifts: formData?.shifts?.map((shift) => ({
        ...(isEdit && { shift_id: shift?.shift_id }),
        start_time: covertToTimeZone(moment(shift?.start_time)),
        end_time: covertToTimeZone(moment(shift?.end_time)),
        oef_products: shift?.oef_products,
        oef_procedures: shift?.oef_procedures,
        staff_break: shift?.staff_break,
        break_start_time: shift?.staff_break
          ? covertToTimeZone(moment(shift?.break_start_time))
          : null,
        break_end_time: shift?.staff_break
          ? covertToTimeZone(moment(shift?.break_end_time))
          : null,
        reduce_slots: shift?.reduce_slots,
        reduction_percentage: shift?.appointment_reduction,
        devices: shift?.devices?.map((device) => device?.id),
        projections: shift?.projections?.map((projection) => ({
          ...(isEdit && { id: projection?.id }),
          procedure_type_id: projection?.procedure?.id,
          product_yield: projection?.product_yield,
          procedure_type_qty: projection?.procedure_type_qty,
          staff_setups: projection?.staff_setup?.map((staff) => staff?.id),
        })),
        remove_projections: shift?.remove_projections || [],
      })),
      remove_shifts: formData?.remove_shifts || [],
      resource_sharing: resourceShareData,
      ...(isRefrence && { ref_id: refrenceId }),
      ...(isRefrence && { ref_type: refrenceType }),
      override: formData?.override,
    };

    setLoading(true);
    try {
      if (isBlueprint) {
        const payloads = getBlueprintPayload(
          formData?.start_date,
          formData?.end_date,
          payload
        );
        await API.operationCenter.sessions.createMany(payloads);
      } else if (isEdit) {
        await API.operationCenter.sessions.update(params?.id, payload);
      } else {
        await API.operationCenter.sessions.create(payload);
      }
      setSuccess(true);
    } catch (error) {
      if (error.response.status === 409) {
        setSessionOverride(true);
      }
      console.error(error);
    }
    setLoading(false);
  };

  const handleArchive = async () => {
    setLoading(true);
    await API.operationCenter.sessions.delete(params?.id);
    setLoading(false);
    navigate(OPERATIONS_CENTER_SESSIONS_PATH.LIST);
  };

  const removeShift = (index) => () => {
    if (watchShifts[index]?.shift_id) {
      appendRemoveShift(watchShifts[index]?.shift_id);
    }

    // remove shift slots
    const tempSlots = Object.entries(slots)
      .filter(([shiftIndex]) => `${shiftIndex}` !== `${index}`)
      .map(([_, value], index) => [`${index}`, value]);
    setSlots(Object.fromEntries(tempSlots));

    // remove resourse data
    setResourceShareData(
      resourceShareData
        .filter((item) => item.shift_index !== index)
        .map((item) => ({
          ...item,
          shift_index: Math.max(0, item.shift_index - 1),
        }))
    );

    // remove shift
    remove(index);
  };

  const handleFormValue = (value) => {
    setFormValue(value);
    if (value === formEnum.CLEAN_SLATE) {
      navigate(OPERATIONS_CENTER_SESSIONS_PATH.CREATE);
    } else if (value === formEnum.SESSION_BLUEPRINT) {
      navigate(OPERATIONS_CENTER_SESSIONS_PATH.BLUEPRINT);
    } else if (value === formEnum.COPY_SESSION && isEdit) {
      navigate(OPERATIONS_CENTER_SESSIONS_PATH.COPY.replace(':id', params?.id));
    }
    reset();
  };

  const handleSlotsChange = (index, shiftSlots) => {
    setSlots((prevSlots) => ({ ...prevSlots, [index]: shiftSlots }));
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={breadcrumbsData}
        BreadCrumbsTitle={'Sessions'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />
      <div className="mainContentInner form-container">
        <form className={styles.account}>
          <SelectSessionForm
            control={control}
            formValue={formValue}
            setFormValue={handleFormValue}
            donorCenterOptions={donorCenters?.map((dc) => ({
              label: dc.name,
              value: dc.id,
            }))}
            dateOptions={sessions?.map((session) => ({
              label: moment(session.date).format('MM-DD-YYYY'),
              value: session.id,
            }))}
            copyDate={copyDate}
            copyDonorCenter={copyDonorCenter}
            setCopyDate={setCopyDate}
            setCopyDonorCenter={setCopyDonorCenter}
            blueprints={blueprints}
            activeDays={activeWeekDays}
            setActiveDays={setActiveWeekDays}
            setValue={setValue}
          />

          <SessionForm
            control={control}
            formErrors={formErrors}
            donorCenterOptions={donorCenters?.map((dc) => ({
              label: dc.name,
              value: dc.id,
            }))}
            donorCenters={donorCenters}
            statusOptions={status?.map((status) => ({
              label: status.name,
              value: status.id,
            }))}
            promotions={promotions}
            selectedPromotions={watchPromotions}
            collectionOperation={collectionOperation}
            sessionDate={watchSessionDate}
            startDate={watchStartDate}
            endDate={watchEndDate}
            setValue={setValue}
            isValidEditableTime={isValidEditableTime}
            bookingRules={bookingRules}
            formValue={formValue}
            customErrors={customErrors}
            setCustomErrors={setCustomErrors}
            isBlueprint={isBlueprint}
            isEdit={isEdit}
          />

          {customFileds ? (
            <CustomFieldsForm
              control={control}
              formErrors={formErrors}
              customFileds={customFileds}
            />
          ) : null}
          {fields.map((shift, index) => {
            const fieldName = `shifts[${index}]`;
            return (
              <ScheduleShiftForm
                shift={shift}
                key={shift.id}
                shiftIndex={index}
                control={control}
                watch={watch}
                setValue={setValue}
                addShift={addShift}
                removeShift={removeShift}
                shiftIndexesLength={fields?.length || 0}
                formErrors={formErrors}
                setShareStaffSearch={setShareStaffSearch}
                shareStaffSearch={shareStaffSearch}
                shiftFieldName={fieldName}
                procedureTypes={procedureTypes}
                procedureTypesOptions={procedureTypes.map((type) => ({
                  label: type.name,
                  value: type.id,
                  ...type,
                }))}
                OEF={OEF}
                devicesOptions={devices.map((device) => ({
                  id: device.id,
                  name: device.name,
                }))}
                allowAppointmentAtShiftEndTime={
                  bookingRules?.maximum_draw_hours_allow_appt || false
                }
                customErrors={customErrors}
                setCustomErrors={setCustomErrors}
                slots={slots[index]}
                handleSlotsChange={handleSlotsChange}
                collectionOperation={collectionOperation}
                sessionDate={isBlueprint ? watchStartDate : watchSessionDate}
                isOverrideUser={isOverrideUser}
                isValidEditableTime={isValidEditableTime}
                bookingRules={bookingRules}
                shifts={watchShifts}
                currentShift={watchShifts.length && watchShifts[index]}
                shareStaffData={shareStaffData}
                resourceShareData={resourceShareData}
                setResourceShareData={setResourceShareData}
                dailyCapacities={dailyCapacities}
                staffUtilization={calcStaffUtilization}
                sessionId={isEdit && params?.id}
                isCopy={isCopy}
              />
            );
          })}
        </form>
        <div className="form-footer">
          {isEdit &&
          CheckPermission([
            Permissions.OPERATIONS_CENTER.OPERATIONS.SESSIONS.ARCHIVE,
          ]) ? (
            <div
              onClick={() => {
                setArchivePopup(true);
              }}
              className="archived"
            >
              <span>Archive</span>
            </div>
          ) : null}
          <button
            className="btn simple-text"
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            name={isEdit ? `Save & Close` : `Create`}
            onClick={(e) => {
              handleSubmit(onSubmit)(e);
              setStayOnEditSession(false);
            }}
            disabled={isLoading}
            className={`btn btn-md ${isEdit ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isEdit ? `Save & Close` : `Create`}
          </button>

          {isEdit ? (
            <button
              type="button"
              onClick={(e) => {
                handleSubmit(onSubmit)(e);
                setStayOnEditSession(true);
              }}
              disabled={isLoading}
              className={`btn btn-md btn-primary`}
            >
              Save Changes
            </button>
          ) : null}
        </div>
        {isEdit ? (
          <section
            className={`popup full-section ${archivePopup ? 'active' : ''}`}
          >
            <div className="popup-inner">
              <div className="icon">
                <img src={ConfirmArchiveIcon} alt="CancelIcon" />
              </div>
              <div className="content">
                <h3>Confirmation</h3>
                <p>Are you sure you want to archive?</p>
                <div className="buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setArchivePopup(false);
                    }}
                  >
                    No
                  </button>
                  <button className="btn btn-primary" onClick={handleArchive}>
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={cancel}
        isNavigate={true}
        setModalPopUp={setCancel}
        redirectPath={OPERATIONS_CENTER_SESSIONS_PATH.LIST}
      />
      <SuccessPopUpModal
        title="Success!"
        message={isEdit ? 'Session updated.' : 'Session created.'}
        modalPopUp={success}
        isNavigate={!stayOnEditSession}
        setModalPopUp={setSuccess}
        showActionBtns={true}
        redirectPath={OPERATIONS_CENTER_SESSIONS_PATH.LIST}
      />
      <WarningModalPopUp
        confirmText="Proceed"
        message={
          isCopy
            ? `A session already exists with a given date and donor center, click Cancel to change or Proceed to overwrite the previous session.`
            : `A session already exists within a date range and donor center, click Cancel to change or Proceed to overwrite the previous session.`
        }
        methods={(e) => {
          setValue('override', true);
          handleSubmit(onSubmit)(e);
        }}
        modalPopUp={isSessionOverride}
        setModalPopUp={setSessionOverride}
        title="Warning"
      />
    </div>
  );
}

export default SessionUpsert;
