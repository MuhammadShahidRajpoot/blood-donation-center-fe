import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import styles from './index.module.scss';
import { useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import createDynamicSchema from './driveSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import { API } from '../../../../api/api-routes';
import {
  makeAuthorizedApiRequest,
  makeAuthorizedApiRequestAxios,
} from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import 'rc-time-picker/assets/index.css';
import AddContactsModal from './create/add-contacts-modal';
import AddContactsSection from './create/add-contacts-section';
import CustomFieldsForm from '../../../common/customeFileds/customeFieldsForm';
import CreateDriveForm from './create/create-drive-form';
import SelectDriveForm from './create/select-drive-form';
import DonorCommunicationForm from './create/donor-communication-form';
import MarketingEquipmentForm from './create/marketing-eqipment-form';
import DetailsForm from './create/details-form';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_DRIVES_PATH,
} from '../../../../routes/path';
import ShiftForm from './create/shift/ShiftForm';
import moment from 'moment';
import AddAccountsModal from './create/add-accounts-modal';
import CancelModalPopUp from '../../../common/cancelModal';
import SuccessPopUpModal from '../../../common/successModal';
import WarningModalPopUp from '../../../common/warningModal';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import { isEmpty } from 'lodash';
import * as _ from 'lodash';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { DriveFormEnum } from './enums';
import {
  convertToMoment,
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../../helpers/convertDateTimeToTimezone';
import CheckPermission from '../../../../helpers/CheckPermissions';
import OcPermissions from '../../../../enums/OcPermissionsEnum';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

function DrivesUpsert() {
  const [redirection, setRedirection] = useState();
  const [MismatchModal, setMisMatchModal] = useState(false);
  const [linkedSettings, setLinkedSettings] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [closeModal, setCloseModal] = useState(false);
  const [contactsCloseModal, setContactsCloseModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [primaryChairPersonModal, setPrimaryChairPersonModal] = useState(false);
  const [primaryChairPersonModalContent, setPrimaryChairPersonModalContent] =
    useState('');
  const [accounts, setAccounts] = useState([]);
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [marketingOptions, setMarketingOptions] = useState([]);
  const [promotionalOptions, setPromotionalOptions] = useState([]);
  const [certificationOptions, setCertificationOptions] = useState([]);
  const [collectionOperationId, setCollectionOperationId] = useState();
  const [territory, setTerritory] = useState([]);
  const [industryCategories, setIndustryCategories] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [locationsData, setLocationsData] = useState([]);
  const [operationStatus, setOperationStatus] = useState([]);
  const [recruiters, setRecruiters] = useState(null);
  const [recruiterOptions, setRecruiterOption] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotiomsOption, setPromotionsOption] = useState([]);
  const [contactRows, setContactRows] = useState([]);
  const [accountRows, setAccountRows] = useState([]);
  const [accountContactsList, setAccountContactsList] = useState([]);
  const [RSMO, setRSMO] = useState();
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [contactRoles, setContactRoles] = useState([]);
  const [coordinatesA, setCoordinatesA] = useState(0);
  const [coordinatesB, setCoordinatesB] = useState(0);
  const [contactsSearchText, setContactsSearchText] = useState('');
  const [accountsSearchText, setAccountsSearchText] = useState('');
  const [locationType, setLocationType] = useState({});
  const [miles, setMiles] = useState({});
  const [minutes, setMinutes] = useState({});
  const [customFileds, setcustomFields] = useState();
  const [travelMinutes, setTravelMinutes] = useState(0);

  const [procedureTypesList, setProcedureTypesList] = useState([]);
  const [procedureProducts, setProcedureProducts] = useState({});
  const [equipment, setEquipment] = useState([
    { equipment: null, quantity: '' },
  ]);
  const [marketing, setMarketing] = useState([{ item: null, mquantity: '' }]);
  const [promotional, setPromotional] = useState([
    { item: null, pquantity: '' },
  ]);
  const [addContactsModal, setAddContactsModal] = useState(false);
  const [addAccountsModal, setAddAccountsModal] = useState(false);
  const [isOverrideUser, setIsOverrideUser] = useState(false);
  const [zipCodes, setZipCodes] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [customErrors, setcustomErrors] = useState({});
  const [contacts, setContacts] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loader, setLoader] = useState(true);
  const [shiftSlots, setShiftSlots] = useState([]);
  const [staffSetupShiftOptions, setStaffSetupShiftOptions] = useState([]);
  const [devicesOptions, setDevicesOptions] = useState([]);
  const [bookingRules, setBookingRules] = useState({});
  const [disableButton, setDisableButton] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null); // For Blue print
  const [selectedBlueprint, setSelectedBlueprint] = useState(null); // For Blue print
  const [selectedLinkDrive, setSelectedLinkDrive] = useState(null);
  const [editable, setEditable] = useState(false);
  const [editData, setEditData] = useState(false);
  const { id } = useParams();
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [blueprintAccounts, setBlueprintAccounts] = useState([]);
  const [archivePopup, setArchivePopup] = useState(false);
  const [blueprintList, setBlueprintList] = useState([]);
  const [linkedDriveID, setLinkedDriveId] = useState(null);
  const [removeShift, setRemoveShift] = useState([]);
  const [blueprint, setblueprint] = useState(false);
  const [blueprintAccountsSearchText, setBlueprintAccountsSearchText] =
    useState('');

  const [resourceShareData, setResourceShareData] = useState([]);
  const [dailyCapacities, setDailyCapacities] = useState({});
  const [staffUtilization, setStaffUtilization] = useState(0);
  const [donorCommunication, setDonorCommunication] = useState({
    tele_recruitment: false,
    email_status: false,
    sms_status: false,
  });
  const [editLinkDirve, setEditLinkDrive] = useState(false);
  const [updateLinkDriveBtn, setUpdateLinkDriveBtn] = useState(false);
  const [discardDriveBtn, setdiscardDriveBtn] = useState(false);
  const [configureShiftBtn, setConfigureShiftBtn] = useState(false);
  const [editCurrentShift, setEditCurrentShift] = useState(false);
  const [drivesDateList, setDrivesDateList] = useState([]);
  const [allInitialContacts, setAllInitialContacts] = useState([]);
  const validationSchema = createDynamicSchema(customFileds);
  const {
    handleSubmit: onSubmit,
    control,
    formState: { errors: formErrors /*isDirty*/ },
    setValue,
    getValues,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      form: DriveFormEnum.CLEAN_SLATE,
      account: { label: 'Account', value: null },
      promotion: '',
      start_date: '',
      collection_operation: '',
      territory: '',
      recruiter: '',
      location: '',
      certifications: [],
      multi_day: false,
      marketing_order_status: '',
      promotioanal_order_status: '',
      tele_recruitment_status: 'Approved',
      email_status: 'Approved',
      sms_status: 'Approved',
      marketing_start_time: '',
      marketing_end_time: '',
    },
    mode: 'onChange',
  });
  useEffect(() => {
    if (window.location.href.includes('edit')) {
      setEditable(true);
    } else {
      setEditable(false);
    }
  }, [window.location.href]);
  const type = watch('form');
  useEffect(() => {
    const id = searchParams.get('accountId');
    const bluerintId = searchParams.get('blueprintId');
    const date = searchParams.get('date');
    if (
      typeof bluerintId !== 'object' &&
      typeof id !== 'object' &&
      Object.entries(miles).length
    ) {
      setValue('form', DriveFormEnum.BLUEPRINT);
      const account = blueprintAccounts?.filter((item) => item.id === id)?.[0];
      setSelectedAccount(account);
      const blueprint = blueprintList?.filter(
        (item) => item.value === bluerintId
      )?.[0];
      setValue('blueprint_select', blueprint);
    }

    if (
      typeof date !== 'object' &&
      typeof id !== 'object' &&
      Object.entries(miles).length &&
      type !== DriveFormEnum.BLUEPRINT
    ) {
      setValue('form', DriveFormEnum.COPY_EXISTING_DRIVE);
      const account = blueprintAccounts?.filter((item) => item.id === id)?.[0];
      setSelectedAccount(account);
      const drive = drivesDateList?.filter(
        (item) =>
          item.label === convertToMoment(date, 'UTC-0').format('MM-DD-YYYY')
      )?.[0];
      setValue('existing_drive_date', drive);
    }
  }, [
    searchParams,
    blueprintAccounts,
    blueprintList,
    miles,
    minutes,
    drivesDateList,
  ]);

  const getAccountDrives = async () => {
    const { data } = await API.operationCenter.drives.getAccountDrives(
      selectedAccount.id
    );
    const options = data?.data?.map((item) => {
      return {
        value: item.id,
        label: `${moment(item.date).format('MM-DD-YYYY')}`,
      };
    });
    setDrivesDateList(options);
  };

  const fetchApprovals = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.marketingEquipment.approvals.getApprovals();
    setApprovals(data?.data || {});
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

  useEffect(() => {
    fetchApprovals();
    fetchCurrentUser();
    fetchBookingRules();
  }, []);

  const start_date = watch('start_date');
  const collection_operation = watch('collection_operation');
  const recruiter = watch('recruiter');
  const driveDate = watch('start_date');
  const location_type = watch('location_type');
  const blueprint_selected = watch('blueprint_select');
  const existing_drive_date = watch('existing_drive_date');

  useEffect(() => {
    if (type !== DriveFormEnum.CLEAN_SLATE) {
      getAccountHavingBlueprint();
    }
  }, [type, blueprintAccountsSearchText]);

  const getAccountHavingBlueprint = async () => {
    const accounts = await API.crm.crmAccounts.getAllRecruiterAccounts(
      blueprintAccountsSearchText
    );
    const { data } = accounts;
    setBlueprintAccounts([
      ...(data?.data?.map((item) => {
        return {
          value: item?.id,
          id: item?.id,
          label: item?.name,
          alternate_name: item?.alternate_name,
          street_address: `${item?.address?.address1} ${item?.address?.address2}, ${item?.address?.city}, ${item?.address?.state} ${item?.address?.zip_code}`,
          city: item?.address?.city,
          state: item?.address?.state,
        };
      }) || []),
    ]);
  };

  const fetchProcedureTypes = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/procedure_types?goal_type=true&fetchAll=true`
      );
      const { data } = await response.json();

      const procedureOptions = data?.map((item) => {
        return {
          label: item.name,
          value: item.id,
          procedure_duration: item.procedure_duration,
        };
      });
      const productsMap = {};
      data?.map((item) => {
        productsMap[item.id] = {
          name: item?.procedure_types_products?.[0]?.products?.name,
          id: item?.procedure_types_products?.[0]?.products?.id,
          quantity: item?.procedure_types_products?.[0]?.quantity,
          yield: item?.procedure_types_products?.[0]?.quantity,
        };
      });
      setProcedureTypesList(procedureOptions);
      setProcedureProducts(productsMap);
    } catch (error) {
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchDailyCapacities = async () => {
    if (collectionOperationId && driveDate) {
      const response =
        await API.systemConfiguration.operationAdministrations.bookingDrives.dailyCapacities.getDailyCapacities(
          collectionOperationId,
          driveDate
        );
      setDailyCapacities(response?.data?.data);
    }
  };

  const fetchStaffUtilization = async () => {
    if (collectionOperationId && driveDate) {
      const {
        data: {
          data: { count },
        },
      } =
        await API.systemConfiguration.staffAdmininstration.staffSetup.getStaffSetupUtilizationForDrives(
          {
            drive_date: driveDate,
            collectionOperation: collectionOperationId,
          }
        );
      setStaffUtilization(count || 0);
    }
  };
  useEffect(() => {
    const collection_operation_id = Object.values(collectionOperation)?.filter(
      (item) => item.name === collection_operation
    )?.[0]?.id;
    setCollectionOperationId(collection_operation_id);
    console.log({ collection_operation });
    if (collection_operation == undefined) {
      setLocationType({});
      setLocationsData({});
      setMiles({});
      setMinutes({});
      setValue('location', '');
      setValue('location_type', '');
      setValue('miles', '');
      setValue('minutes', '');
    }
  }, [collection_operation]);

  useEffect(() => {
    fetchDailyCapacities();
    fetchStaffUtilization();
  }, [collectionOperationId, driveDate]);

  // Fetch Supplemental accounts Start
  const fetchAllSupplementalAccounts = async () => {
    if (recruiter?.value) {
      try {
        const { data } =
          await API.crm.crmAccounts.getAllRecruiterAccountsByRecruiterId(
            recruiter?.value,
            accountsSearchText
          );

        if (accountId) {
          const suppData = data?.data.filter((item) => item.id != accountId);
          setAccountRows(suppData);
        } else {
          setAccountRows(data?.data);
        }
      } catch (error) {
        toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
      }
    }
  };

  useEffect(() => {
    if (accountsSearchText.length >= 3 || accountsSearchText.length == 0)
      fetchAllSupplementalAccounts();
  }, [accountsSearchText]);

  useEffect(() => {
    fetchAllSupplementalAccounts();
  }, [recruiter]);
  // Fetch Supplemental accounts End

  const initialShift = [
    {
      startTime: '',
      endTime: '',
      projections: [
        { projection: 0, procedure: '25', product: '25', staffSetup: [] },
      ],
      staffSetupOptions: [],
      additionalStaffOptions: [],
      vehicleOptions: [],
      resources: [],
      devices: [],
      staffBreak: false,
      breakStartTime: '',
      breakEndTime: '',
      reduceSlot: false,
      reduction: 0,
      minOEF: 0,
      maxOEF: 0,
      minStaff: [0],
      maxStaff: [0],
    },
  ];
  const [shifts, setShifts] = useState(initialShift);

  // Fetch Devices Start
  const fetchDevices = async (index) => {
    const collectionOperationId = Object.values(collectionOperation)?.filter(
      (item) => item.name === collection_operation
    )?.[0]?.id;
    if (collectionOperationId) {
      try {
        const { data } =
          await API.systemConfiguration.organizationalAdministrations.devices.getDriveDevices(
            {
              collection_operation: collectionOperationId,
            }
          );
        const deviceOptions = data?.data?.map((item) => {
          return { name: item.name, id: item.id };
        });
        setDevicesOptions(deviceOptions);
      } catch (error) {
        console.error(`Error fetching data ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [collection_operation]);
  // Fetch Devices End

  const fetchEquipments = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.marketingEquipment.promotions.getMarketingEquipmentByCollectionOperationAndType(
        {
          collection_operations: collectionOperationId,
          type: 'COLLECTIONS',
        }
      );
    let options = data?.data?.map((item) => {
      return { label: item.name, value: item.id };
    });
    setEquipmentOptions(options);
  };

  const fetchMarketingMaterials = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.marketingEquipment.marketingMaterials.getMarketingEquipmentMarketingMaterialsByCollectionOperation(
        {
          collection_operations: collectionOperationId,
          driveDate: driveDate,
        }
      );
    const options = data?.data?.map((item) => {
      return { label: item.name, value: item.id };
    });
    setMarketingOptions(options);
  };

  const fetchPromotionalItems = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.marketingEquipment.promotionalItems.getPromotionalItemsByCollectionOperation(
        {
          collection_operations: collectionOperationId,
          driveDate: driveDate,
        }
      );
    const options =
      data?.data?.map((item) => {
        return { label: item.name, value: item.id };
      }) || [];
    setPromotionalOptions(options);
  };

  const fetchCertifications = async () => {
    const { data } =
      await API.systemConfiguration.staffAdmininstration.certifications.getCertificationsByType(
        'STAFF',
        true
      );
    const options = data?.data?.map((item) => {
      return { name: item.name, id: item.id };
    });
    setCertificationOptions(options);
  };

  useEffect(() => {
    if (collectionOperationId) {
      fetchEquipments({});
      fetchLocations();
    }
    if (collectionOperationId && driveDate != '') {
      fetchMarketingMaterials();
      fetchPromotionalItems();
    }
  }, [collectionOperationId, driveDate]);

  useEffect(() => {
    getAccounts();
    fetchRecruiters();
    fetchData(pageNumber);
    fetchOperationStatus();
    getContactRoles();
    fetchProcedureTypes();
    fetchCertifications();
  }, []);
  useEffect(() => {
    if (accountId) fetchData(pageNumber);
  }, [accountId]);

  useEffect(() => {
    if (collectionOperationId && start_date) fetchPromotions();
  }, [start_date, collectionOperationId]);

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Operations',
      class: 'disable-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'Drive',
      class: 'disable-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: editable ? 'Edit Drive' : 'Create Drive',
      class: 'active-label',
      link: editable
        ? OPERATIONS_CENTER_DRIVES_PATH.EDIT
        : OPERATIONS_CENTER_DRIVES_PATH.CREATE,
    },
  ];

  useEffect(() => {
    const contacts = selectedContacts?.map((item) => {
      return {
        accounts_contacts_id: item,
        role_id: selectedRoles?.[item]?.value,
      };
    });
    setContacts(contacts);
  }, [selectedContacts, selectedRoles]);

  const [formDatas, setFormDatas] = useState(null);
  const [searched, setSearched] = useState(false);

  const beforeSubmit = async (formData, e) => {
    // setDisableButton(true);
    const data = { ...formData, event: e?.target?.name };

    if (
      shifts?.[0]?.projections?.length &&
      linkedSettings?.[0]?.projections?.length
    ) {
      if (
        JSON.stringify(shifts?.[0]?.projections) !=
        JSON.stringify(linkedSettings?.[0]?.projections)
      ) {
        setMisMatchModal(true);
        setFormDatas(data);
      } else {
        editable ? await EditHandle(data) : await handleSubmit(data);
      }
      // setMisMatchModal(true);
    } else {
      editable ? await EditHandle(data) : await handleSubmit(data);
    }
  };

  // const handleDiscardDrive = async () => {
  //   try {
  //     const result = await makeAuthorizedApiRequestAxios(
  //       'GET',
  //       `${BASE_URL}/drives/linkDrive/update/:id`
  //     );
  //     console.log({ result });
  //     if (result?.data?.status_code === 201) {
  //       return true;
  //     }
  //   } catch (err) {
  //     toast.error('can not update link drive');
  //   }
  // };
  const handleupdateLinkDrive = async (formData) => {
    try {
      let shiftErrors = [];
      const ShiftsBody = shifts?.map((item, index) => {
        let projection = [];
        let shiftItemErrors = {};
        if (isEmpty(item?.startTime))
          shiftItemErrors['startTime'] = 'Start time is required.';
        if (isEmpty(item?.endTime))
          shiftItemErrors['endTime'] = 'End time is required.';

        if (item?.vehicles?.length == 0)
          shiftItemErrors['vehicles'] = 'At least one vehicle is required.';
        let projectionErrors = [];
        item?.projections?.forEach((element) => {
          let projItemErrors = {};
          if (element.projection == 0) {
            projItemErrors['projection'] = 'Projection is required.';
          }
          if (element.staffSetup.length == 0) {
            projItemErrors['staff_setup'] =
              'At least one Staff setup is required.';
          }
          if (Object.entries(projItemErrors)?.length)
            projectionErrors.push(projItemErrors);
        });
        if (Object.entries(projectionErrors)?.length) {
          let errorArrays = [];
          for (let sh of shifts) {
            if (sh.projections.length) {
              errorArrays = sh?.projections?.map((projections) => {
                if (projections.projection) {
                  return {};
                } else
                  return {
                    projection: 'Projection is required.',
                    staff_setup: 'At least one Staff setup is required.',
                  };
              });
            }
          }
          shiftItemErrors['projections'] = errorArrays;
          shiftErrors.push(shiftItemErrors);
        }
        for (let pro of item.projections) {
          let projection_id = pro.id;
          let procedure_type_id = +pro?.procedure?.value;
          let procedure_type_qty = +pro?.procedure?.quantity;
          let product_yield = +pro?.product?.quantity;
          let staff_setups = [];
          pro?.staffSetup?.map((staff) => {
            staff_setups.push(staff.id);
          });

          projection.push({
            id: projection_id,
            procedure_type_id,
            procedure_type_qty,
            product_yield,
            staff_setups,
          });
        }
        let count_products = 0;
        let count_procedures = 0;
        const duration =
          item?.endTime && item?.startTime
            ? moment.duration(item?.endTime.diff(item?.startTime))
            : 0;
        const hour = duration != 0 ? duration?.hours() : 0;
        let sumofProducts = 0;
        let sumofProcedures = 0;
        let sumofStaff_Setups = 0;
        item?.projections?.map((pro, indexing) => {
          sumofProducts += pro?.product?.quantity;
          sumofProcedures += +pro?.procedure?.quantity;
        });
        item?.projections?.map((pro, indexing) => {
          let sumStaff = 0;
          pro?.staffSetup?.map((staff) => {
            sumStaff += +staff?.qty;
          });
          sumofStaff_Setups += sumStaff;
        });
        count_products = (sumofProducts / hour / sumofStaff_Setups).toFixed(2);
        count_procedures = (sumofProcedures / hour / sumofStaff_Setups).toFixed(
          2
        );

        const devices = item?.devices?.map((item) => item.id);
        const vehicles = item?.resources?.map((item) => item.id);
        return {
          projections: projection,
          start_time: covertToTimeZone(moment(item?.startTime)),
          end_time: covertToTimeZone(moment(item?.endTime)),
          break_start_time:
            item?.breakStartTime && item?.breakStartTime?.isValid()
              ? covertToTimeZone(item?.breakStartTime)
              : null,
          break_end_time:
            item?.breakEndTime && item?.breakEndTime?.isValid()
              ? covertToTimeZone(item?.breakEndTime)
              : null,
          reduce_slots: item?.reduction !== 0 ? true : false,
          reduction_percentage: item?.reduction,
          oef_products: +count_products,
          oef_procedures: +count_procedures,
          devices,
          vehicles,
        };
      });
      let hasErrors = false;
      if (shiftErrors?.length) {
        setcustomErrors((prev) => ({
          ...prev,
          shifts: shiftErrors,
        }));
        hasErrors = true;
      } else {
        setcustomErrors((prev) => {
          const { contacts, ...rest } = prev;
          return rest;
        });
      }

      if (hasErrors) {
        setDisableButton(false);
        return;
      }
      let shift = ShiftsBody;
      let slots = shiftSlots;
      const body = { shift, slots };
      const result = await makeAuthorizedApiRequestAxios(
        'POST',
        `${BASE_URL}/drives/linkDrive/update/${linkedDriveID}`,
        JSON.stringify(body)
      );
      if (result?.data?.status == 'success') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      toast.error(err);
    }
  };

  const scrollToFirstErrorField = () => {
    const firstErrorField = Object.keys(formErrors)[0];
    const firstErrorElement = document.querySelector(
      `[name="${firstErrorField}"]`
    );
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    scrollToFirstErrorField();
  }, [formErrors]);

  const scrollToFirstCustomErrorField = () => {
    const firstErrorField = Object.keys(customErrors)[0];
    // const firstErrorElement = document.getElementById(`${firstErrorField}`);
    const firstErrorElement = document.querySelector(
      `[name="${firstErrorField}"]`
    );
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    scrollToFirstCustomErrorField();
  }, [customErrors]);

  const handleSubmit = async (formData) => {
    //  ====== Custom Fields Form Data =======
    // console.log('heloooooooooooooooooo in submmit', { formData });
    // console.log()
    setDisableButton(true);
    const fieldsData = [];
    // const customFieldDatableId = 0; // You can change this as needed
    const customFieldDatableType = PolymorphicType.OC_OPERATIONS_DRIVES; // You can change this as needed
    let resulting;
    for (const key in formData) {
      if (key > 0) {
        const value = formData[key]?.value ?? formData[key];
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
      custom_field_datable_type: customFieldDatableType,
    };
    try {
      let hasErrors = false;
      if (contacts.length === 0) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            contacts:
              'At least one contact with Primary Chairperson is required.',
          };
        });
        hasErrors = true;
      }

      if (equipment.length >= 0) {
        equipment?.map((el, i) => {
          if (
            el?.equipment != null &&
            el?.equipment?.label != '' &&
            el.quantity === ''
          ) {
            setcustomErrors((prev) => ({
              ...prev,
              [`quantity${i}`]: 'Equipment Quantity is required.',
            }));
            hasErrors = true;
          } else {
            setcustomErrors((prev) => {
              const { [`quantity${i}`]: removedError, ...rest } = prev;
              return rest;
            });
          }
        });
      }

      const checkMarketingMaterialquantity = marketing.filter((item) => {
        return (
          item?.item != null && item?.item?.label != '' && item.mquantity === ''
        );
      });
      if (checkMarketingMaterialquantity.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            mquantity: 'Marketing material quantity is required.',
          };
        });
        hasErrors = true;
      } else {
        setcustomErrors((prev) => {
          const { mquantity, ...rest } = prev;
          return rest;
        });
      }
      const checkMarketingPrmotionsQuantity = promotional.filter((item) => {
        return (
          item?.item != null && item?.item?.label != '' && item.pquantity === ''
        );
      });
      if (checkMarketingPrmotionsQuantity.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            promotionalQuantity: 'Promotional item quantity is required.',
          };
        });
        hasErrors = true;
      } else {
        setcustomErrors((prev) => {
          const { promotionalQuantity, ...rest } = prev;
          return rest;
        });
      }

      let shiftErrors = [];
      const ShiftsBody = shifts?.map((item, index) => {
        let projection = [];
        let shiftItemErrors = {};
        if (isEmpty(item?.startTime))
          shiftItemErrors['startTime'] = 'Start time is required.';
        if (isEmpty(item?.endTime))
          shiftItemErrors['endTime'] = 'End time is required.';

        if (item?.devices.length == 0)
          shiftItemErrors['vehicles'] = 'At least one vehicle is required.';
        let projectionErrors = [];
        item?.projections?.forEach((element) => {
          let projItemErrors = {};
          if (element.projection == 0) {
            projItemErrors['projection'] = 'Projection is required.';
          }
          if (element.staffSetup.length == 0) {
            projItemErrors['staff_setup'] =
              'At least one Staff setup is required.';
          }
          if (Object.entries(projItemErrors)?.length)
            projectionErrors.push(projItemErrors);
        });
        if (Object.entries(projectionErrors)?.length) {
          let errorArrays = [];
          for (let sh of shifts) {
            if (sh.projections.length) {
              errorArrays = sh?.projections?.map((projections) => {
                if (projections.projection) {
                  return {};
                } else
                  return {
                    projection: 'Projection is required.',
                    staff_setup: 'At least one Staff setup is required.',
                  };
              });
            }
          }
          shiftItemErrors['projections'] = errorArrays;
          shiftErrors.push(shiftItemErrors);
        }
        for (let pro of item.projections) {
          let projection_id = pro.id;
          let procedure_type_id = +pro?.procedure?.value;
          let procedure_type_qty = +pro?.procedure?.quantity;
          let product_yield = +pro?.product?.quantity;
          let staff_setups = [];
          pro?.staffSetup?.map((staff) => {
            staff_setups.push(staff.id);
          });

          projection.push({
            id: projection_id,
            procedure_type_id,
            procedure_type_qty,
            product_yield,
            staff_setups,
          });
        }
        let count_products = 0;
        let count_procedures = 0;
        const duration =
          item?.endTime && item?.startTime
            ? moment.duration(item?.endTime.diff(item?.startTime))
            : 0;
        const hour = duration != 0 ? duration?.hours() : 0;
        let sumofProducts = 0;
        let sumofProcedures = 0;
        let sumofStaff_Setups = 0;
        item?.projections?.map((pro, indexing) => {
          sumofProducts += pro?.product?.quantity;
          sumofProcedures += +pro?.procedure?.quantity;
        });
        item?.projections?.map((pro, indexing) => {
          let sumStaff = 0;
          pro?.staffSetup?.map((staff) => {
            sumStaff += +staff?.qty;
          });
          sumofStaff_Setups += sumStaff;
        });
        count_products = (sumofProducts / hour / sumofStaff_Setups).toFixed(2);
        count_procedures = (sumofProcedures / hour / sumofStaff_Setups).toFixed(
          2
        );

        const devices = item?.devices?.map((item) => item.id);
        const vehicles = item?.resources?.map((item) => item.id);
        return {
          projections: projection,
          start_time: covertToTimeZone(item?.startTime),
          end_time: covertToTimeZone(item?.endTime),
          break_start_time:
            item?.breakStartTime && item?.breakStartTime?.isValid()
              ? covertToTimeZone(item?.breakStartTime)
              : null,
          break_end_time:
            item?.breakEndTime && item?.breakEndTime?.isValid()
              ? covertToTimeZone(item?.breakEndTime)
              : null,
          reduce_slots: item?.reduction !== 0 ? true : false,
          reduction_percentage: item?.reduction,
          oef_products: +count_products,
          oef_procedures: +count_procedures,
          devices,
          vehicles,
        };
      });

      let sum_of_product = 0;
      let sum_of_procedure = 0;
      for (let shi of ShiftsBody) {
        sum_of_product += shi.oef_products;
        sum_of_procedure += shi.oef_procedures;
      }
      if (shiftErrors.length) {
        setcustomErrors((prev) => ({
          ...prev,
          shifts: shiftErrors,
        }));
        hasErrors = true;
      }

      if (hasErrors) {
        setDisableButton(false);
        return;
      }

      const body = {
        // ====== Create Drive Form ======
        date: covertToTimeZone(moment(formData?.start_date)).format(
          'YYYY-MM-DD'
        ),
        account_id: +formData?.account?.value,
        promotion_id: +formData?.promotion?.value,
        recruiter_id: +formData?.recruiter?.value,
        operations_status_id: +formData?.status?.value,
        is_multi_day_drive: formData?.multi_day,
        location_id: +formData?.location?.value,
        oef_products: sum_of_product,
        oef_procedures: sum_of_procedure,
        // ======  Custom Fields Form ======
        custom_fields: resulting,

        //  ======  Add Contacts Form ======
        contacts,
        slots: shiftSlots,

        // ====== Details Form ======
        open_to_public: formData?.open_public,
        certifications: formData?.certifications?.map((item) =>
          parseInt(item.id)
        ),
        equipment: equipment
          ?.map((item) => {
            const equipment = item.equipment;
            return {
              equipment_id: equipment?.value,
              quantity: item?.quantity,
            };
          })
          .filter((item) => item.equipment_id !== undefined),

        online_scheduling_allowed: formData?.online_scheduling_allowed,
        // ======  Marketing and Equipment Form ======
        marketing: {
          marketing_materials: marketing
            ?.map((item) => {
              return {
                marketing_material_item_id: item?.item?.value,
                quantity: item?.mquantity,
              };
            })
            .filter((item) => item.marketing_material_item_id !== undefined),
          promotional_items: promotional
            ?.map((item) => {
              return {
                promotional_item_id: item?.item?.value,
                quantity: item?.pquantity,
              };
            })
            .filter((item) => item.promotional_item_id !== undefined),
          marketing_start_date: covertToTimeZone(
            moment(formData?.marketing_start_date)
          ),
          marketing_start_time: covertToTimeZone(
            moment(formData?.marketing_start_time)
          ),
          marketing_end_date: covertToTimeZone(
            moment(formData?.marketing_end_date)
          ),
          marketing_end_time: covertToTimeZone(
            moment(formData?.marketing_end_time)
          ),
          instructional_info: formData?.instructional_information,
          donor_info: formData?.donor_information,
          order_due_date: formData?.order_due_date
            ? covertToTimeZone(moment(formData?.order_due_date)).format(
                'YYYY-MM-DD'
              )
            : null,
        },

        // ====== Donor Communication Form ======
        zip_codes: zipCodes,
        is_linkable: shifts?.length === 1 ? true : false,
        is_linked: linkedDriveID ? true : false,
        linked_id: [linkedDriveID],
        tele_recruitment_enabled: formData?.tele_recruitment,
        email_enabled: formData?.email,
        sms_enabled: formData?.sms,
        tele_recruitment_status: formData?.tele_recruitment
          ? formData?.tele_recruitment_status
          : '',
        email_status: formData?.email ? formData?.email_status : '',
        sms_status: formData?.sms ? formData?.sms_status : '',
        donor_communication: {
          account_ids: selectedAccounts,
        },
        shifts: ShiftsBody,
        resource_sharing: resourceShareData,
        marketing_items_status:
          formData?.marketing_order_status === 'Approved'
            ? true
            : formData?.marketing_order_status === 'Pending Approval'
            ? false
            : null,
        promotional_items_status:
          formData?.promotioanal_order_status === 'Approved'
            ? true
            : formData?.promotioanal_order_status === 'Pending Approval'
            ? false
            : null,
      };
      const result = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/drives`,
        JSON.stringify(body)
      );

      const { status, response } = await result.json();
      if (status === 'success') {
        setDisableButton(false);
        setRedirection(true);
      }
      if (status === 'error') {
        setDisableButton(false);
        toast.error(response, { autoClose: 3000 });
      }
    } catch (err) {
      setDisableButton(false);
      console.log('err', err);
      toast.error(err);
    }
  };

  const EditHandle = async (formData) => {
    //  ====== Custom Fields Form Data =======
    setDisableButton(true);
    // setCheckRedirection(status);
    const fieldsData = [];
    // const customFieldDatableId = 0; // You can change this as needed
    const customFieldDatableType = PolymorphicType.OC_OPERATIONS_DRIVES; // You can change this as needed
    let resulting;
    for (const key in formData) {
      if (key > 0) {
        const value = formData[key]?.value ?? formData[key];
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
    // Do not remove this until development completed.
    // console.log({
    //   start_time0: moment(formData.start_time0).format('HH:mm:ss'),
    //   start_time1: moment(formData.start_time1).format('HH:mm:ss'),
    //   end_time0: moment(formData.end_time0).format('HH:mm:ss'),
    //   end_time1: moment(formData.end_time1).format('HH:mm:ss'),
    // });
    try {
      let hasErrors = false;
      if (contacts.length === 0) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            contacts:
              'At least one contact with Primary Chairperson is required.',
          };
        });
        hasErrors = true;
      }
      if (equipment.length >= 0) {
        equipment?.map((el, i) => {
          if (
            el?.equipment != null &&
            el?.equipment?.label != '' &&
            el.quantity === ''
          ) {
            setcustomErrors((prev) => ({
              ...prev,
              [`quantity${i}`]: 'Equipment Quantity is required.',
            }));
            hasErrors = true;
          } else {
            setcustomErrors((prev) => {
              const { [`quantity${i}`]: removedError, ...rest } = prev;
              return rest;
            });
          }
        });
      }

      const checkMarketingMaterialquantity = marketing?.filter((item) => {
        return (
          item?.item != null && item?.item?.label != '' && item.mquantity === ''
        );
      });
      if (checkMarketingMaterialquantity.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            mquantity: 'Marketing material quantity is required.',
          };
        });
        hasErrors = true;
      } else {
        setcustomErrors((prev) => {
          const { mquantity, ...rest } = prev;
          return rest;
        });
      }

      const checkMarketingPrmotionsQuantity = promotional?.filter((item) => {
        return (
          item?.item != null && item?.item?.label != '' && item.pquantity === ''
        );
      });
      if (checkMarketingPrmotionsQuantity.length >= 1) {
        setcustomErrors((prev) => {
          return {
            ...prev,
            promotionalQuantity: 'Promotional item quantity is required.',
          };
        });
        hasErrors = true;
      } else {
        setcustomErrors((prev) => {
          const { promotionalQuantity, ...rest } = prev;
          return rest;
        });
      }

      let shiftErrors = [];

      const ShiftsBody = shifts?.map((item, index) => {
        let shiftItemErrors = {};
        let projection = [];

        if (isEmpty(item?.startTime))
          shiftItemErrors['startTime'] = 'Start time is required.';
        if (isEmpty(item?.endTime))
          shiftItemErrors['endTime'] = 'End time is required.';

        if (item?.devices.length == 0)
          shiftItemErrors['devices'] = 'At least one device is required.';
        let projectionErrors = [];
        item?.projections?.forEach((element) => {
          let projItemErrors = {};
          if (element.projection == 0) {
            projItemErrors['projection'] = 'Projection is required.';
          }
          if (element.staffSetup.length == 0) {
            projItemErrors['staff_setup'] =
              'At least one Staff setup is required.';
          }
          if (Object.entries(projItemErrors)?.length)
            projectionErrors.push(projItemErrors);
        });
        if (Object.entries(projectionErrors)?.length) {
          let errorArrays = [];
          for (let sh of shifts) {
            if (sh.projections.length) {
              errorArrays = sh.projections?.map((projections) => {
                if (projections.projection) {
                  return {};
                } else
                  return {
                    projection: 'Projection is required.',
                    staff_setup: 'At least one Staff setup is required.',
                  };
              });
            }
          }
          shiftItemErrors['projections'] = errorArrays;
          shiftErrors.push(shiftItemErrors);
        }

        for (let pro of item.projections) {
          // let projection_id = pro.id;
          let procedure_type_id = +pro?.procedure?.value;
          let procedure_type_qty = +pro?.procedure?.quantity;
          let product_yield = +pro?.product?.quantity;
          let staff_setups = [];
          pro?.staffSetup?.map((staff) => {
            staff_setups.push(staff.id);
          });

          projection.push({
            // id: projection_id,
            procedure_type_id,
            procedure_type_qty,
            product_yield,
            staff_setups,
          });
        }
        let count_products = 0;
        let count_procedures = 0;
        const duration =
          item?.endTime && item?.startTime
            ? moment.duration(item?.endTime.diff(item?.startTime))
            : 0;
        const hour = duration != 0 ? duration?.hours() : 0;
        let sumofProducts = 0;
        let sumofProcedures = 0;
        let sumofStaff_Setups = 0;
        item?.projections?.map((pro, indexing) => {
          sumofProducts += pro?.product?.quantity;
          sumofProcedures += +pro?.procedure?.quantity;
        });
        item?.projections?.map((pro, indexing) => {
          let sumStaff = 0;
          pro?.staffSetup?.map((staff) => {
            sumStaff += +staff?.qty;
          });
          sumofStaff_Setups += sumStaff;
        });
        count_products = (sumofProducts / hour / sumofStaff_Setups).toFixed(2);
        count_procedures = (sumofProcedures / hour / sumofStaff_Setups).toFixed(
          2
        );

        const devices = item?.devices?.map((item) => item.id);
        const vehicles = item?.resources?.map((item) => item.id);
        return {
          projections: projection,
          start_time: covertToTimeZone(item?.startTime),
          end_time: covertToTimeZone(item?.endTime),
          is_multi_day_drive: item?.multi_day,
          break_start_time:
            item?.breakStartTime && item?.breakStartTime?.isValid()
              ? covertToTimeZone(item?.breakStartTime)
              : null,
          break_end_time:
            item?.breakEndTime && item?.breakEndTime?.isValid()
              ? covertToTimeZone(item?.breakEndTime)
              : null,
          reduce_slots: item?.reduceSlot,
          reduction_percentage: item?.reduction,
          oef_products: +count_products,
          oef_procedures: +count_procedures,
          devices,
          vehicles,
          shift_id: item?.shift_id,
          // slots: Object.values(shiftSlots[index]),
        };
      });
      let sum_of_product = 0;
      let sum_of_procedure = 0;
      for (let shi of ShiftsBody) {
        sum_of_product += shi.oef_products;
        sum_of_procedure += shi.oef_procedures;
      }
      if (shiftErrors.length) {
        setcustomErrors((prev) => ({
          ...prev,
          shifts: shiftErrors,
        }));
        hasErrors = true;
      }

      if (hasErrors) {
        setDisableButton(false);
        return;
      }
      const body = {
        // ====== Create Drive Form ======
        remove_shift: removeShift,
        date: covertToTimeZone(moment(formData?.start_date)).format(
          'YYYY-MM-DD'
        ),
        account_id: +formData?.account?.value,
        promotion_id: +formData?.promotion?.value,
        recruiter_id: +formData?.recruiter?.value,
        operations_status_id: +formData?.status?.value,
        is_multi_day_drive: formData?.multi_day,
        location_id: +formData?.location?.value,
        oef_procedures: sum_of_procedure,
        oef_products: sum_of_product,
        // ======  Custom Fields Form ======
        custom_fields: resulting,

        //  ======  Add Contacts Form ======
        contacts,
        slots: shiftSlots,

        // ====== Details Form ======
        open_to_public: formData?.open_public,
        certifications: formData?.certifications?.map((item) =>
          parseInt(item.id)
        ),
        equipment: equipment
          ?.map((item) => {
            const equipment = item.equipment;
            return {
              equipment_id: equipment?.value,
              quantity: item?.quantity,
            };
          })
          .filter((item) => item.equipment_id !== undefined),
        online_scheduling_allowed: formData?.online_scheduling_allowed,

        // ======  Marketing and Equipment Form ======
        marketing: {
          marketing_materials: marketing
            ?.map((item) => {
              return {
                marketing_material_item_id: item?.item?.value,
                quantity: item?.mquantity,
              };
            })
            .filter(
              (item) =>
                item.marketing_material_item_id !== undefined &&
                item.marketing_material_item_id != ''
            ),
          promotional_items: promotional
            ?.map((item) => {
              return {
                promotional_item_id: item?.item?.value,
                quantity: item?.pquantity,
              };
            })
            .filter(
              (item) =>
                item.promotional_item_id !== undefined &&
                item.promotional_item_id != ''
            ),
          marketing_start_date: covertToTimeZone(
            moment(formData?.marketing_start_date)
          ),
          marketing_start_time: covertToTimeZone(
            moment(formData?.marketing_start_time)
          ),
          marketing_end_date: covertToTimeZone(
            moment(formData?.marketing_end_date)
          ),
          marketing_end_time: covertToTimeZone(
            moment(formData?.marketing_end_time)
          ),
          instructional_info: formData?.instructional_information,
          donor_info: formData?.donor_information,
          order_due_date: formData?.order_due_date
            ? covertToTimeZone(moment(formData?.order_due_date)).format(
                'YYYY-MM-DD'
              )
            : null,
        },

        // ====== Donor Communication Form ======
        zip_codes: zipCodes,
        is_linkable: shifts?.length === 1 ? true : false,
        is_linked: selectedLinkDrive ? true : false,
        is_blueprint: blueprint,
        tele_recruitment_enabled: formData?.tele_recruitment,
        email_enabled: formData?.email,
        sms_enabled: formData?.sms,
        tele_recruitment_status: formData?.tele_recruitment
          ? formData?.tele_recruitment_status
          : '',
        email_status: formData?.email ? formData?.email_status : '',
        sms_status: formData?.sms ? formData?.sms_status : '',
        donor_communication: {
          account_ids: selectedAccounts,
        },
        shifts: ShiftsBody,
        marketing_items_status:
          formData?.marketing_order_status === 'Approved'
            ? true
            : formData?.marketing_order_status === 'Pending Approval'
            ? false
            : null,
        promotional_items_status:
          formData?.promotioanal_order_status === 'Approved'
            ? true
            : formData?.promotioanal_order_status === 'Pending Approval'
            ? false
            : null,
      };

      const result = await makeAuthorizedApiRequest(
        'PUT',
        `${BASE_URL}/drives/${id}`,
        JSON.stringify(body)
      );
      const { status, response } = await result.json();
      if (status == 'success') {
        if (formData?.event == 'Save & Close') {
          setRedirection(true);
          getEditData(id);
          setDisableButton(false);
        } else {
          setSuccessModal(true);
          getEditData(id);
          setDisableButton(false);
        }
      } else if (status === 'error') {
        setDisableButton(false);
        toast.error(response, { autoClose: 3000 });
      }
    } catch (err) {
      setDisableButton(false);
      console.log('err', err);
      toast.error(err);
    }
  };

  const fetchPromotions = async () => {
    if (start_date !== '' && collection_operation !== '') {
      const collectionOperationId = Object.values(collectionOperation)?.filter(
        (item) => item.name === collection_operation
      )?.[0]?.id;
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/marketing-equipment/promotions/drives?collection_operation_id=${collectionOperationId}&date=${start_date}&status=${true}`
        );
        const data = await response.json();
        setPromotionsOption([
          ...((data?.data?.length > 0 &&
            data?.data?.map((item) => {
              return {
                value: item.id,
                label: item.name || '' + item.short_name || '',
              };
            })) ||
            []),
        ]);
        setPromotions([...(data.data || [])]);
      } catch (error) {
        console.error(`Error fetching data ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/tenant-users/recruiters`
      );
      const data = await response.json();

      if (data?.data) {
        const RecruiterOptionData = data?.data?.map((item) => {
          return {
            label: item?.first_name,
            value: item?.id,
          };
        });
        setRecruiterOption(RecruiterOptionData);
      }
    } catch (error) {
      toast.error('Error fetching data:', error);
    }
  };

  const fetchOperationStatus = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/booking-drive/operation-status?appliesTo=Drives&status=true`
      );
      const data = await result.json();
      setOperationStatus([]);
      setOperationStatus([
        ...(data?.data?.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }) || []),
      ]);
    } catch (error) {
      toast.error('Error fetching data:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/crm/locations/withDirections?collection_operation_id=${collectionOperationId}`
      );
      const data = await response.json();
      setLocationsData([
        ...(data?.data?.map((item) => {
          return {
            value: item.id,
            label: item.name,
            qualification_status: item.qualification_status,
          };
        }) || []),
      ]);
      let locationTypeMap = {};
      let milesMap = {};
      let minutesMap = {};
      for (const location of data?.data || []) {
        locationTypeMap[location.id] = location.site_type;
        milesMap[location.id] =
          location?.directions?.[0]?.miles?.toFixed(2) || 0;
        minutesMap[location.id] =
          location?.directions?.[0]?.minutes?.toFixed(2) || 0;
      }
      setLocationType(locationTypeMap);
      setMiles(milesMap);
      setMinutes(minutesMap);
    } catch (error) {
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
  };
  const getAccounts = async () => {
    const accounts = await API.crm.crmAccounts.getAllRecruiterAccounts();
    const { data } = accounts;
    setAccounts([
      ...(data?.data?.map((item) => {
        return { value: item.id, label: item.name };
      }) || []),
    ]);
    let collectionOpertionMap = {};
    let territoryMap = {};
    let recruiterMap = {};
    let industryCategoryMap = {};
    let RSMOMap = {};
    for (const account of data?.data || []) {
      collectionOpertionMap[account.id] = account.collection_operation;
      territoryMap[account.id] = account.territory;
      recruiterMap[account.id] = account.recruiter;
      RSMOMap[account.id] = account.RSMO;
      industryCategoryMap[account.id] = account.industry_category;
    }
    setCollectionOperation(collectionOpertionMap);
    setTerritory(territoryMap);
    setRecruiters(recruiterMap);
    setRSMO(RSMOMap);
    setIndustryCategories(industryCategoryMap);
  };

  const getContactRoles = async () => {
    const deviceTypeUrl = `${BASE_URL}/contact-roles?function_id=1&status=${true}&fetchAll=true`;
    const result = await makeAuthorizedApiRequest('GET', deviceTypeUrl);
    const data = await result.json();
    setContactRoles(
      data?.data?.map((item) => {
        return {
          value: item.id,
          label: item.name,
          is_primary_chairperson: item?.is_primary_chairperson,
        };
      })
    );
  };

  useEffect(() => {
    getCustomFields();
  }, []);

  const getCustomFields = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/organization-administration/custom-fields/modules/4`
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

  useEffect(() => {
    if (contactsSearchText?.length > 1) {
      setSearched(true);
      accountId && fetchAllVolunteerContacts(1, accountId);
    }
    if (contactsSearchText?.length <= 1 && searched) {
      setSearched(false);
      accountId && fetchAllVolunteerContacts(1, accountId);
    }
  }, [contactsSearchText]);

  const fetchAllVolunteerContacts = async (page, accountId) => {
    const isSearch =
      contactsSearchText && contactsSearchText?.length > 1 ? true : false;

    try {
      if (page == 1) {
        setContactRows([]);
      }
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contact-volunteer/get/account_contacts?sortOrder='asc'&account=${+accountId}&page=${page}&limit=3${
          isSearch ? '&name=' + contactsSearchText : `&onlyCurrentAccount=true`
        }`
      );
      const data = await response.json();
      if (data.status !== 500) {
        if (data.data.length >= 0) {
          const contactData = data.data;
          let outputDataArray = [];
          for (const inputData of contactData) {
            const outputData = {
              ...inputData,
              id: inputData?.account_contact_id,
              name: inputData?.name,
              email: inputData?.primary_email,
              phone: inputData?.primary_phone,
              city: inputData?.address_city,
              role_id: inputData?.role_id,
              role_name: inputData?.role_name,
              is_primary_chairperson: inputData?.roles_is_primary_chairperson,
            };
            if (outputData?.id) outputDataArray.push(outputData);
          }
          contactsSearchText == ''
            ? setContactRows({
                ...contactRows,
                ..._.keyBy(outputDataArray, 'id'),
              })
            : setContactRows({
                ..._.keyBy(outputDataArray, 'id'),
              });
        } else {
          setLoader(false);
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, {
        autoClose: 3000,
      });
    }
  };
  const getAllContacts = async () => {
    if (accountId && selectedContacts) {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contact-volunteer/get/account_contacts?account=${+accountId}&selectedContactsForAccount=${selectedContacts.join(
          ','
        )}`
      );
      const data = await response.json();
      if (data?.data?.length >= 0) {
        const contactData = data.data;
        let outputDataArray = [];
        for (const inputData of contactData) {
          const outputData = {
            ...inputData,
            id: inputData?.account_contact_id,
            name: inputData?.name,
            email: inputData?.primary_email,
            phone: inputData?.primary_phone,
            city: inputData?.address_city,
            role_id: inputData?.role_id,
            role_name: inputData?.role_name,
            is_primary_chairperson: inputData?.roles_is_primary_chairperson,
          };

          outputDataArray.push(outputData);
        }
        setAllInitialContacts({
          ...contactRows,
          ..._.keyBy(outputDataArray, 'id'),
        });
      }
    }
  };

  useEffect(() => {
    getAllContacts();
  }, [accountId, selectedContacts]);

  useEffect(() => {
    if (accountId) fetchAllVolunteerContacts(1, accountId);
  }, [accountId]);

  const fetchData = (page) => {
    setPageNumber(page);
    if (accountId) {
      fetchAllVolunteerContacts(page, accountId);
    }
  };

  useEffect(() => {
    if (blueprint_selected?.value) getBlueprintData(blueprint_selected?.value);
  }, [blueprint_selected]);

  useEffect(() => {
    if (existing_drive_date?.value && Object.entries(miles).length)
      getBlueprintData(existing_drive_date?.value);
  }, [existing_drive_date, miles]);

  useEffect(() => {
    if (editable) {
      getEditData(id);
    }
  }, [editable]);
  // console.log({ contactRoles });
  const getBlueprintData = async (id) => {
    const {
      data: { data, projections, customFieldsData },
    } = await API.operationCenter.drives.getSingle(id);

    const fetchedData = data?.[0];
    const fetchedProjections = projections?.length > 0 ? projections : [];
    const fieldsToUpdate = customFieldsData?.length > 0 ? customFieldsData : [];
    fieldsToUpdate?.forEach(({ field_id: { id, pick_list }, field_data }) => {
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
    });

    if (type == DriveFormEnum.COPY_EXISTING_DRIVE) {
      fetchedData?.drive?.promotion?.id
        ? setValue('promotion', {
            value: fetchedData?.drive?.promotion?.id,
            label: fetchedData?.drive?.promotion?.name,
          })
        : setValue('promotion', '');

      setValue('status', {
        value: fetchedData?.drive?.status?.id,
        label: fetchedData?.drive?.status?.name,
      });
    }
    setAccountId(fetchedData?.account?.id);
    setValue('account', {
      value: fetchedData?.account.id.toString(),
      label: fetchedData?.account.name,
    });
    setValue(
      'collection_operation',
      fetchedData?.account?.collection_operation?.name
    );
    setValue(
      'territory',
      territory[parseInt(fetchedData?.account.id)]?.territory_name
    );
    const recruiter = recruiters[parseInt(fetchedData?.account.id)];
    recruiter &&
      setValue('recruiter', {
        value: recruiter.id,
        label: recruiter.first_name || '' + recruiter.last_name || '',
      });

    setValue('location', {
      value: fetchedData?.crm_locations.id,
      label: fetchedData?.crm_locations.name,
    });
    setValue(
      'location_type',
      locationType[fetchedData?.crm_locations.id.toString()] || ''
    );
    setValue('miles', miles[fetchedData?.crm_locations.id.toString()] || '');
    setValue(
      'minutes',
      minutes[fetchedData?.crm_locations.id.toString()] || ''
    );
    setTravelMinutes(minutes[fetchedData?.crm_locations.id] || 0);

    let drive_contacts_list = [];
    let roles_list = [];
    fetchedData?.drive_contacts?.map((item) => {
      drive_contacts_list.push(item.accounts_contacts_id.toString());
      roles_list[item.accounts_contacts_id.toString()] = {
        label: item.role.name,
        value: item.role.id.toString(),
        is_primary_chairperson: item?.role?.is_primary_chairperson,
      };
    });

    setSelectedRoles(roles_list);
    setSelectedContacts(drive_contacts_list);

    let shiftsData = [];
    for (const shiftItem of fetchedData?.shifts || []) {
      let shiftItemData = {};
      shiftItemData.shift_id = shiftItem.id;
      shiftItemData.startTime = moment(
        covertDatetoTZDate(shiftItem.start_time)
      );
      shiftItemData.endTime = moment(covertDatetoTZDate(shiftItem.end_time));
      let projectionData = [];
      const shiftProjections = fetchedProjections?.filter(
        (item) => item.shift_id == shiftItem.id
      );
      for (const shiftProjectionsStaffItem of shiftProjections) {
        const procedureLabel = shiftProjectionsStaffItem?.procedure_type?.name;
        const procedureDuration =
          shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString();
        const procedureQuantity = shiftProjectionsStaffItem?.procedure_type_qty;
        const procedureId =
          shiftProjectionsStaffItem?.procedure_type?.id?.toString();
        const procedureItem = {
          label: procedureLabel,
          procedure_duration: procedureDuration,
          quantity: procedureQuantity,
          value: procedureId,
        };
        const productItem = {
          id: shiftProjectionsStaffItem?.procedure_type?.procedure_type_products?.[0]?.product_id?.toString(),
          name: shiftProjectionsStaffItem?.procedure_type
            .procedure_type_products?.[0]?.name,
          quantity: shiftProjectionsStaffItem?.product_yield,
          yield:
            shiftProjectionsStaffItem?.procedure_type
              ?.procedure_type_products?.[0]?.quantity,
        };

        const projectionItem = {
          label: shiftProjectionsStaffItem.procedure_type.name,
          procedure_duration:
            shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString(),
          value: shiftProjectionsStaffItem?.procedure_type?.id?.toString(),
        };

        const staffSetupItem = shiftProjectionsStaffItem?.staff_setups?.map(
          (item) => {
            return {
              beds: item.beds,
              concurrent_beds: item.concurrent_beds,
              id: item.id.toString(),
              name: item.name,
              qty: item.qty,
              stagger: item.stagger_slots,
            };
          }
        );
        projectionData.push({
          procedure: procedureItem,
          product: productItem,
          projection: projectionItem,
          staffSetup: staffSetupItem,
        });
      }
      shiftItemData.projections = projectionData;
      shiftItemData.devices =
        shiftItem.shifts_devices?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];
      shiftItemData.resources =
        shiftItem.shifts_vehicles?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];
      shiftItemData.staffBreak =
        typeof shiftItem.break_start_time == 'string' ||
        typeof shiftItem.break_end_time == 'string'
          ? true
          : false;
      if (shiftItemData.staffBreak) {
        shiftItemData.breakStartTime = moment(
          covertDatetoTZDate(shiftItem.break_start_time)
        );
        shiftItemData.breakEndTime = moment(
          covertDatetoTZDate(shiftItem.break_end_time)
        );
        shiftItemData.reduceSlot = shiftItem.reduce_slots;
        shiftItemData.reduction = shiftItem.reduction_percentage;
      }

      shiftsData.push(shiftItemData);
    }
    setShifts(shiftsData);
    setValue('open_public', fetchedData?.drive?.open_to_public);

    const equipmentsList = fetchedData?.drives_equipments?.map((item) => {
      return {
        equipment: {
          value: item.id,
          label: item.equipment_id[0].name,
        },
        quantity: item.quantity,
      };
    });
    if (equipmentsList?.length > 0) setEquipment(equipmentsList);
    setValue(
      'certifications',
      fetchedData?.drives_certifications?.map((item) => {
        return {
          id: item.certificate_id?.[0]?.id,
          name: item.certificate_id?.[0]?.name,
        };
      }) || []
    );
    setValue(
      'marketing_start_date',
      new Date(fetchedData?.drive?.marketing_start_date)
    );
    setValue(
      'online_scheduling_allowed',
      fetchedData?.drive?.online_scheduling_allowed
    );
    setValue(
      'marketing_end_date',
      new Date(fetchedData?.drive?.marketing_end_date)
    );

    setValue(
      'marketing_start_time',
      moment(covertDatetoTZDate(fetchedData?.drive?.marketing_start_time))
    );
    setValue(
      'marketing_end_time',
      moment(covertDatetoTZDate(fetchedData?.drive?.marketing_end_time))
    );
    setValue(
      'instructional_information',
      fetchedData?.drive?.instructional_information
    );
    setValue('donor_information', fetchedData?.drive?.donor_information);
    const marketingList = fetchedData?.drives_marketing_materials?.map(
      (item) => {
        return {
          item: {
            value: item.id,
            label: item.marketing_materials[0].name,
          },
          mquantity: item.quantity,
        };
      }
    );
    if (marketingList?.length > 0) setMarketing(marketingList);

    setValue(
      'order_due_date',
      fetchedData?.drive?.order_due_date
        ? new Date(fetchedData?.drive?.order_due_date)
        : null
    );
    const promotionalList = fetchedData?.drives_promotional_items?.map(
      (item) => {
        return {
          item: {
            value: item.id,
            label: item.promotional_items[0].name,
          },
          pquantity: item.quantity,
        };
      }
    );
    if (promotionalList?.length > 0) setPromotional(promotionalList);

    setValue('tele_recruitment', fetchedData?.drive?.tele_recruitment);
    setValue('email', fetchedData?.drive?.email);
    setValue('sms', fetchedData?.drive?.sms);
    setDonorCommunication({
      tele_recruitment: fetchedData?.drive?.tele_recruitment,
      email_status: fetchedData?.drive?.email,
      sms_status: fetchedData?.drive?.sms,
    });
    setSelectedAccounts(
      fetchedData?.drives_supp_accounts?.map((item) => item?.id?.toString()) ||
        []
    );
    setZipCodes(fetchedData?.zip_codes?.map((item) => item.zip_code) || []);
  };
  useEffect(() => {
    if (editData && miles) {
      setValue('location_type', editData?.crm_locations?.site_type || '');
      setValue('miles', miles[editData?.crm_locations.id] || 0);
      setValue('minutes', minutes[editData?.crm_locations.id] || 0);
      setTravelMinutes(minutes[editData?.crm_locations.id] || 0);
    }
  }, [miles, editData]);

  const getEditData = async (id) => {
    const data = await API.operationCenter.drives.getSingle(id);
    const fetchedData = data?.data?.data?.[0];
    const fetchedProjections = data?.data?.projections;
    setEditData(data?.data?.data?.[0]);
    setValue('account', {
      value: fetchedData?.account.id.toString(),
      label: fetchedData?.account.name,
    });
    setValue('multi_day', fetchedData?.drive?.is_multi_day_drive);
    setblueprint(fetchedData?.drive?.is_blueprint);
    setAccountId(fetchedData?.account.id);
    // collectionOperation[parseInt(fetchedData?.account.id)]?.name ??
    setValue(
      'collection_operation',
      fetchedData?.account?.collection_operation?.name
    );
    setCollectionOperationId(fetchedData?.account?.collection_operation?.id);
    // setCollectionOperation();
    // territory[parseInt(fetchedData?.account.id)]?.territory_name ??
    setValue('territory', fetchedData?.account?.territory?.territory_name);

    fetchedData?.drive?.promotion?.id
      ? setValue('promotion', {
          value: fetchedData?.drive?.promotion?.id,
          label: fetchedData?.drive?.promotion?.name,
        })
      : setValue('promotion', '');

    setValue('status', {
      value: fetchedData?.drive?.status?.id,
      label: fetchedData?.drive?.status?.name,
    });

    setValue('recruiter', {
      value: fetchedData?.drive?.recruiter?.id,
      label:
        fetchedData?.drive?.recruiter?.first_name ||
        '' + fetchedData?.drive?.recruiter?.last_name ||
        '',
    });

    setValue('start_date', new Date(moment(fetchedData?.drive?.date)));
    setValue('location', {
      value: fetchedData?.crm_locations?.id,
      label: fetchedData?.crm_locations?.name,
    });

    let drive_contacts_list = [];
    let roles_list = [];
    fetchedData?.drive_contacts?.map((item) => {
      drive_contacts_list.push(item.accounts_contacts_id.toString());
      roles_list[item.accounts_contacts_id.toString()] = {
        label: item.role.name,
        value: item.role.id.toString(),
        is_primary_chairperson: item?.role?.is_primary_chairperson,
      };
    });

    setSelectedRoles(roles_list);
    setSelectedContacts(drive_contacts_list);

    // const modified = data?.data?.customFieldsData?.map((item) => {
    //   return item.field_id;
    // });
    // setcustomFields(modified);
    const fieldsToUpdate = data?.data?.customFieldsData;
    fieldsToUpdate?.forEach(({ field_id: { id, pick_list }, field_data }) => {
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
    });

    let shiftsData = [];
    for (const shiftItem of fetchedData?.shifts || []) {
      let shiftItemData = {};
      shiftItemData.shift_id = shiftItem.id;
      shiftItemData.startTime = moment(
        covertDatetoTZDate(
          moment(shiftItem.start_time).format('ddd MMM DD YYYY HH:mm:ss')
        )
      );
      shiftItemData.endTime = moment(
        covertDatetoTZDate(
          moment(shiftItem.end_time).format('ddd MMM DD YYYY HH:mm:ss')
        )
      );
      let projectionData = [];
      const shiftProjections = fetchedProjections?.filter(
        (item) => item.shift_id == shiftItem.id
      );
      for (const shiftProjectionsStaffItem of shiftProjections) {
        const procedureLabel = shiftProjectionsStaffItem?.procedure_type?.name;
        const procedureDuration =
          shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString();
        const procedureQuantity = shiftProjectionsStaffItem?.procedure_type_qty;
        const procedureId =
          shiftProjectionsStaffItem?.procedure_type?.id?.toString();
        const procedureItem = {
          label: procedureLabel,
          procedure_duration: procedureDuration,
          quantity: procedureQuantity,
          value: procedureId,
        };
        const productItem = {
          id: shiftProjectionsStaffItem?.procedure_type?.procedure_type_products?.[0]?.product_id?.toString(),
          name: shiftProjectionsStaffItem?.procedure_type
            .procedure_type_products?.[0]?.name,
          quantity: shiftProjectionsStaffItem?.product_yield,
          yield:
            shiftProjectionsStaffItem?.procedure_type
              ?.procedure_type_products?.[0]?.quantity,
        };

        const projectionItem = {
          label: shiftProjectionsStaffItem.procedure_type.name,
          procedure_duration:
            shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString(),
          value: shiftProjectionsStaffItem?.procedure_type?.id?.toString(),
        };

        const staffSetupItem = shiftProjectionsStaffItem?.staff_setups?.map(
          (item) => {
            return {
              beds: item.beds,
              concurrent_beds: item.concurrent_beds,
              id: item.id.toString(),
              name: item.name,
              qty: item.qty,
              stagger: item.stagger_slots,
            };
          }
        );
        projectionData.push({
          procedure: procedureItem,
          product: productItem,
          projection: projectionItem,
          staffSetup: staffSetupItem,
        });
      }
      shiftItemData.projections = projectionData;
      shiftItemData.devices =
        shiftItem.shifts_devices?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];
      shiftItemData.resources =
        shiftItem.shifts_vehicles?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];
      shiftItemData.staffBreak =
        typeof shiftItem.break_start_time == 'string' ||
        typeof shiftItem.break_end_time == 'string'
          ? true
          : false;
      if (shiftItemData.staffBreak) {
        shiftItemData.breakStartTime = moment(
          covertDatetoTZDate(shiftItem.break_start_time)
        );
        shiftItemData.breakEndTime = moment(
          covertDatetoTZDate(shiftItem.break_end_time)
        );
        shiftItemData.reduceSlot = shiftItem.reduce_slots;
        shiftItemData.reduction = shiftItem.reduction_percentage;
      } else {
        shiftItemData.breakStartTime = '';
        shiftItemData.breakEndTime = '';
        shiftItemData.reduceSlot = false;
        shiftItemData.reduction = 0.0;
      }

      shiftsData.push(shiftItemData);
    }
    setShifts(shiftsData);
    setValue('open_public', fetchedData?.drive?.open_to_public);

    const equipmentsList = fetchedData?.drives_equipments?.map((item) => {
      return {
        equipment: {
          value: item.id,
          label: item.equipment_id[0].name,
        },
        quantity: item.quantity,
      };
    });
    if (equipmentsList?.length > 0) setEquipment(equipmentsList);
    setValue(
      'certifications',
      fetchedData?.drives_certifications?.map((item) => {
        return {
          id: item.certificate_id?.[0]?.id?.toString(),
          name: item.certificate_id?.[0]?.name,
        };
      }) || []
    );
    setValue(
      'marketing_start_date',
      new Date(fetchedData?.drive?.marketing_start_date)
    );
    setValue(
      'marketing_end_date',
      new Date(fetchedData?.drive?.marketing_end_date)
    );
    setValue(
      'marketing_start_time',
      moment(covertDatetoTZDate(fetchedData?.drive?.marketing_start_time))
    );
    setValue(
      'marketing_end_time',
      moment(covertDatetoTZDate(fetchedData?.drive?.marketing_end_time))
    );
    setValue(
      'instructional_information',
      fetchedData?.drive?.instructional_information
    );
    setValue(
      'online_scheduling_allowed',
      fetchedData?.drive?.online_scheduling_allowed
    );
    setValue('donor_information', fetchedData?.drive?.donor_information);
    const marketingList = fetchedData?.drives_marketing_materials?.map(
      (item) => {
        return {
          item: {
            value: item.id,
            label: item.marketing_materials[0].name,
          },
          mquantity: item.quantity,
        };
      }
    );
    if (marketingList?.length > 0) setMarketing(marketingList);
    setValue(
      'order_due_date',
      fetchedData?.drive?.order_due_date
        ? new Date(fetchedData?.drive?.order_due_date)
        : fetchedData?.drive?.order_due_date
    );
    const promotionalList = fetchedData?.drives_promotional_items?.map(
      (item) => {
        return {
          item: {
            value: item.id,
            label: item.promotional_items[0].name,
          },
          pquantity: item.quantity,
        };
      }
    );
    if (promotionalList?.length > 0) setPromotional(promotionalList);
    setValue('tele_recruitment', fetchedData?.drive?.tele_recruitment);
    setValue('email', fetchedData?.drive?.email);
    setValue('sms', fetchedData?.drive?.sms);
    setDonorCommunication({
      tele_recruitment: fetchedData?.drive?.tele_recruitment,
      email_status: fetchedData?.drive?.email,
      sms_status: fetchedData?.drive?.sms,
    });
    setSelectedAccounts(
      fetchedData?.drives_supp_accounts?.map((item) => item?.id?.toString()) ||
        []
    );
    setZipCodes(fetchedData?.zip_codes?.map((item) => item.zip_code) || []);
    setValue('location', {
      value: fetchedData?.crm_locations.id,
      label: fetchedData?.crm_locations.name,
    });
  };

  const handleArchive = async () => {
    try {
      const response = await API.operationCenter.drives.archive(id);
      const { data } = response;
      const { status_code: status } = data;
      if (status === 204) {
        setArchiveSuccess(true);
        setArchivePopup(false);
        navigate(OPERATIONS_CENTER_DRIVES_PATH.LIST);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const updateShiftTimesWithDriveDate = () => {
    const newData = shifts?.map((shiftItem) => {
      const driveDateMoment = moment(driveDate);
      const newStartTime = dayjs(shiftItem?.startTime)
        .date(driveDateMoment.date())
        .month(driveDateMoment.month())
        .year(driveDateMoment.year());
      const newEndTime = dayjs(shiftItem?.endTime)
        .date(driveDateMoment.date())
        .month(driveDateMoment.month())
        .year(driveDateMoment.year());
      const newBreakStartTime = dayjs(shiftItem?.breakStartTime)
        .date(driveDateMoment.date())
        .month(driveDateMoment.month())
        .year(driveDateMoment.year());
      const newBreakEndTime = dayjs(shiftItem?.breakEndTime)
        .date(driveDateMoment.date())
        .month(driveDateMoment.month())
        .year(driveDateMoment.year());
      return {
        ...shiftItem,
        startTime: newStartTime,
        endTime: newEndTime,
        breakStartTime: newBreakStartTime,
        breakEndTime: newBreakEndTime,
      };
    });
    setShifts(newData);
  };
  useEffect(() => {
    updateShiftTimesWithDriveDate();
  }, [driveDate]);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Drive'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />

      <div className="mainContentInner form-container">
        <form className={styles.account}>
          {!editable && (
            <SelectDriveForm
              control={control}
              watch={watch}
              selectedAccount={selectedAccount}
              selectedBlueprint={selectedBlueprint}
              setSelectedBlueprint={setSelectedBlueprint}
              setSelectedAccount={setSelectedAccount}
              setShifts={setShifts}
              initialShift={initialShift}
              setValue={setValue}
              setTravelMinutes={setTravelMinutes}
              setSelectedAccounts={setSelectedAccounts}
              setZipCodes={setZipCodes}
              setEquipment={setEquipment}
              RSMO={RSMO}
              setPromotional={setPromotional}
              setMarketing={setMarketing}
              setSelectedContacts={setSelectedContacts}
              blueprintAccounts={blueprintAccounts}
              setBlueprintAccounts={setBlueprintAccounts}
              blueprintList={blueprintList}
              setBlueprintList={setBlueprintList}
              blueprintAccountsSearchText={blueprintAccountsSearchText}
              setBlueprintAccountsSearchText={setBlueprintAccountsSearchText}
              getAccountDrives={getAccountDrives}
              drivesDateList={drivesDateList}
              setDrivesDateList={setDrivesDateList}
            />
          )}
          <CreateDriveForm
            editable={editable}
            control={control}
            formErrors={formErrors}
            setValue={setValue}
            accounts={accounts}
            collectionOperation={collectionOperation}
            territory={territory}
            operationStatus={operationStatus}
            recruiters={recruiters}
            recruiterOptions={recruiterOptions}
            promotions={promotions}
            fetchData={fetchData}
            promotiomsOption={promotiomsOption}
            locationsData={locationsData}
            setAccountId={setAccountId}
            accountId={accountId}
            RSMO={RSMO}
            setContactRows={setContactRows}
            setAllInitialContacts={setAllInitialContacts}
            allInitialContacts={allInitialContacts}
            getValues={getValues}
            watch={watch}
            coordinatesA={coordinatesA}
            setCoordinatesA={setCoordinatesA}
            miles={miles}
            minutes={minutes}
            locationType={locationType}
            setTravelMinutes={setTravelMinutes}
            initialShift={initialShift}
            setShifts={setShifts}
            setSelectedContacts={setSelectedContacts}
            setSelectedRoles={setSelectedRoles}
            locationQualification={
              bookingRules?.location_quali_drive_scheduling || false
            }
          />

          <CustomFieldsForm
            control={control}
            locationsData={locationsData}
            formErrors={formErrors}
            customFileds={customFileds}
          />

          <AddContactsSection
            customErrors={customErrors}
            setAddContactsModal={setAddContactsModal}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
            contactRoles={contactRoles}
            contactRows={contactRows}
            allInitialContacts={allInitialContacts}
          />
          {shifts?.map((shift, index) => {
            return (
              <ShiftForm
                id={id}
                key={index}
                shift={shift}
                index={index}
                shiftIndexesLength={shifts?.length || 0}
                control={control}
                setLinkedDriveId={setLinkedDriveId}
                linkedDriveID={linkedDriveID}
                getValues={getValues}
                setShifts={setShifts}
                bookingRules={bookingRules}
                shifts={shifts}
                linkedSettings={linkedSettings}
                setLinkedSettings={setLinkedSettings}
                errors={customErrors?.shifts?.[index]}
                formErrors={formErrors}
                shiftDevicesOptions={devicesOptions}
                collectionOperationId={collectionOperationId}
                driveDate={driveDate}
                coordinatesA={coordinatesA}
                setCoordinatesA={setCoordinatesA}
                coordinatesB={coordinatesB}
                setCoordinatesB={setCoordinatesB}
                travelMinutes={travelMinutes}
                procedureProducts={procedureProducts}
                procedureTypesList={procedureTypesList}
                location_type={location_type}
                industryCategories={industryCategories}
                watch={watch}
                isOverrideUser={isOverrideUser}
                allowAppointmentAtShiftEndTime={
                  bookingRules?.maximum_draw_hours_allow_appt || false
                }
                shiftSlots={shiftSlots}
                setShiftSlots={setShiftSlots}
                staffSetupShiftOptions={staffSetupShiftOptions}
                setStaffSetupShiftOptions={setStaffSetupShiftOptions}
                selectedLinkDrive={selectedLinkDrive}
                setSelectedLinkDrive={setSelectedLinkDrive}
                accountId={accountId}
                setAccountId={setAccountId}
                removeShift={removeShift}
                setRemoveShift={setRemoveShift}
                resourceShareData={resourceShareData}
                setResourceShareData={setResourceShareData}
                dailyCapacities={dailyCapacities}
                staffUtilization={staffUtilization}
                editable={editable}
                MismatchModal={MismatchModal}
                setMisMatchModal={setMisMatchModal}
                setEditLinkDrive={setEditLinkDrive}
                editLinkDirve={editLinkDirve}
                setEditCurrentShift={setEditCurrentShift}
                editCurrentShift={editCurrentShift}
                updateLinkDriveBtn={updateLinkDriveBtn}
                setUpdateLinkDriveBtn={setUpdateLinkDriveBtn}
                discardDriveBtn={discardDriveBtn}
                setdiscardDriveBtn={setdiscardDriveBtn}
                configureShiftBtn={configureShiftBtn}
                setConfigureShiftBtn={setConfigureShiftBtn}
                // handleDiscardDrive={handleDiscardDrive}
                handleupdateLinkDrive={handleupdateLinkDrive}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                EditHandle={EditHandle}
                formDatas={formDatas}
                // FormData={formData}
              />
            );
          })}

          <DetailsForm
            customErrors={customErrors}
            setcustomErrors={setcustomErrors}
            control={control}
            formErrors={formErrors}
            equipment={equipment}
            setEquipment={setEquipment}
            singleEquipmentOption={equipmentOptions}
            certificationOptions={certificationOptions}
            getValues={getValues}
          />

          <MarketingEquipmentForm
            setValue={setValue}
            customErrors={customErrors}
            setCustomErrors={setcustomErrors}
            approvals={approvals}
            control={control}
            formErrors={formErrors}
            marketing={marketing}
            setMarketing={setMarketing}
            promotional={promotional}
            setPromotional={setPromotional}
            singleItemOption={marketingOptions}
            promotionalOptions={promotionalOptions}
            getValues={getValues}
            watch={watch}
            editable={editable}
          />
          <DonorCommunicationForm
            setValue={setValue}
            approvals={approvals}
            control={control}
            setAddAccountsModal={setAddAccountsModal}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
            accountRows={accountRows}
            zipCodes={zipCodes}
            setZipCodes={setZipCodes}
            getValues={getValues}
            setDonorCommunication={setDonorCommunication}
            donorCommunication={donorCommunication}
          />
          <AddContactsModal
            setcustomErrors={setcustomErrors}
            setAddContactsModal={setAddContactsModal}
            addContactsModal={addContactsModal}
            contactRows={contactRows}
            contactsSearchText={contactsSearchText}
            setContactsSearchText={setContactsSearchText}
            accountContactsList={accountContactsList}
            setAccountContactsList={setAccountContactsList}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContacts}
            selectedRoles={selectedRoles}
            setSelectedRoles={setSelectedRoles}
            contactRoles={contactRoles}
            fetchData={fetchData}
            loader={loader}
            setPrimaryChairPersonModal={setPrimaryChairPersonModal}
            setPrimaryChairPersonModalContent={
              setPrimaryChairPersonModalContent
            }
            setContactsCloseModal={setContactsCloseModal}
            setPageNumber={setPageNumber}
            pageNumber={pageNumber}
          />
          <AddAccountsModal
            setAddAccountsModal={setAddAccountsModal}
            addAccountsModal={addAccountsModal}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
            accountRows={accountRows}
            accountsSearchText={accountsSearchText}
            setAccountsSearchText={setAccountsSearchText}
          />
        </form>
        <div className="form-footer">
          {editable &&
          CheckPermission([
            OcPermissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.ARCHIVE,
          ]) ? (
            <>
              <div
                onClick={() => {
                  setArchivePopup(true);
                }}
                className="archived"
              >
                <span>Archive</span>
              </div>
            </>
          ) : null}
          <button
            className="btn simple-text"
            onClick={(e) => {
              e.preventDefault();
              setCloseModal(true);
            }}
            disabled={disableButton}
          >
            Cancel
          </button>

          <button
            type="button"
            name={editable ? `Save & Close` : `Create`}
            onClick={
              !editable ? onSubmit(beforeSubmit) : onSubmit(beforeSubmit)
            }
            disabled={disableButton}
            className={`btn btn-md ${
              editable ? 'btn-secondary' : 'btn-primary'
            }`}
          >
            {editable ? `Save & Close` : `Create`}
          </button>

          {editable ? (
            <button
              type="button"
              onClick={onSubmit(beforeSubmit)}
              disabled={disableButton}
              className={`btn btn-md btn-primary`}
            >
              Save Changes
            </button>
          ) : null}
        </div>
      </div>
      {editable &&
      CheckPermission([
        OcPermissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.ARCHIVE,
      ]) ? (
        <>
          <div
            onClick={() => {
              setArchivePopup(true);
            }}
            className="archived"
          >
            <span>Archive</span>
          </div>
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
                  <button
                    className="btn btn-primary"
                    onClick={() => handleArchive()}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={-1}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={contactsCloseModal}
        setModalPopUp={setContactsCloseModal}
        methods={() => {
          // setSelectedContacts([]);
          // setSelectedRoles([]);
          setAddContactsModal(false);
          setContactsSearchText('');
          setContactsCloseModal(false);
        }}
        methodsToCall={true}
      />
      <SuccessPopUpModal
        title="Success!"
        message={id ? `Drive updated successfully` : `Drive created`}
        modalPopUp={redirection}
        isNavigate={true}
        setModalPopUp={setRedirection}
        showActionBtns={true}
        redirectPath={-1}
      />
      <SuccessPopUpModal
        title="Success!"
        message={id ? `Drive updated successfully` : `Drive created`}
        modalPopUp={successModal}
        setModalPopUp={setSuccessModal}
        showActionBtns={true}
      />
      <WarningModalPopUp
        title="Warning!"
        message={primaryChairPersonModalContent}
        modalPopUp={primaryChairPersonModal}
        isNavigate={false}
        setModalPopUp={setPrimaryChairPersonModal}
        showActionBtns={true}
        confirmAction={() => {
          setPrimaryChairPersonModal(false);
        }}
      />
      <SuccessPopUpModal
        title="Success!"
        message="Drive archived."
        modalPopUp={archiveSuccess}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        onConfirm={() => {
          setArchiveSuccess(false);
        }}
      />
    </div>
  );
}

export default DrivesUpsert;
