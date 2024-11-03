import React, { useEffect, useState } from 'react';
import TopBar from '../../common/topbar/index';
import { useNavigate } from 'react-router-dom';
import styles from './accounts.module.scss';
import { toast } from 'react-toastify';
import CancelIconImage from '../../../assets/images/ConfirmCancelIcon.png';
import WarningIconImage from '../../../assets/images/warningIcon.png';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import SuccessPopUpModal from '../../common/successModal';
import CancelModalPopUp from '../../common/cancelModal';
import { AccountFormSchema } from './AccountFormSchema';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import TableList from '../../common/tableListing';
import * as _ from 'lodash';
import ToolTip from '../../common/tooltip';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './about/about.scss';
import SelectDropdown from '../../common/selectDropdown';
import FormInput from '../../common/form/FormInput';
import jwt from 'jwt-decode';
import { CRMAccountsBreadCrumbsData } from './AccountsBreadCrumbsData';
import FormFooter from '../../common/FormFooter';
// import axios from 'axios';
import CustomFieldsForm from '../../common/customeFileds/customeFieldsForm';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  removeCountyWord,
  replaceSpecialCharacters,
  formatPhoneNumber,
  checkAddressValidation,
} from '../../../helpers/utils';
import { ADDRESS_VALIDATION_ERROR } from '../../../helpers/constants';
import CheckPermission from '../../../helpers/CheckPermissions';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';
import SvgComponent from '../../common/SvgComponent';
import CreateContactModal from './CreateContactModal';

function AccountUpsert({ accountId }) {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [industryCategories, setIndustryCategories] = useState([]);
  const [subIndustryCategories, setSubIndustryCategories] = useState([]);
  const [stages, setStages] = useState([]);
  const [sources, setSources] = useState([]);
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [territory, setTerritory] = useState([]);
  const [allIndustrySubCategory, setAllIndustrySubCategory] = useState({});
  const [closeModal, setCloseModal] = useState(false);
  const [close, setClose] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [existingAccountModal, setExistingAccountModal] = useState(false);
  const [addContactsModal, setAddContactsModal] = useState(false);
  const [createContactsModal, setCreateContactsModal] = useState(false);
  const [accountContactsList, setAccountContactsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRoles, setselectedRoles] = useState({});
  const [contactRoles, setContactRoles] = useState([]);
  const [contactRows, setContactRows] = useState({});
  const [sortedContactRows, setsortedContactRows] = useState({});
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [duplicateChecked, SetDuplicateChecked] = useState(false);
  const [duplicateConfirmation, setDuplicateConfirmation] = useState(null);
  const [duplicateId, setDuplicateId] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [defaultAccountContacts, setDefaultAccountContacts] = useState([]);
  const bearerToken = localStorage.getItem('token');
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customFields, setcustomFields] = useState();
  const [selectedIndustryCategory, setSelectedIndustryCategory] =
    useState(null);
  const [selectedIndustrySubCategory, setSelectedIndustrySubCategory] =
    useState(null);
  const [selectedStages, setSelectedStages] = useState(null);
  const [selectedSources, setSelectedSources] = useState(null);
  const [selectedCollectionOperations, setSelectedCollectionOperations] =
    useState(null);
  const [searched, setSearched] = useState(false);
  const [selectedRecruiters, setSelectedRecruiters] = useState(null);
  const [selectedTerritories, setSelectedTerritories] = useState(null);
  const [allRecruitersObject, setAllRecruitersObject] = useState({});
  const [allTerritoriesObject, setAllTerritoriesObject] = useState({});
  const [allCollectionOperationsObject, setAllCollectionOperationsObject] =
    useState({});
  const [dependee, setDependee] = useState(null);
  const [userId, setUserId] = useState('');
  const [loggedInRecruiterLoaded, setLoggedInRecruiterLoaded] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  // const [multiExactModal, setMultiExactModal] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState({
    external_id: null,
    account_id: null,
  });
  // const [multiExactArray, setMultiExactArray] = useState([]);
  // const [bodyToSend, setBodyToSend] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [primaryChairPersonName, setPrimaryChairPersonName] = useState('');
  const [industry_subCategoryError, setIndustry_subCategoryError] =
    useState('');
  const [pageNumber, setPageNumber] = useState(1);

  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (Object.values(selectedRoles)?.length > 0) {
      if (
        Object.values(selectedRoles).some((item) => item.isPrimaryChairPerson)
      ) {
        const dupArr = [...contactRoles];
        const findIndex = dupArr.findIndex((item) => item.isPrimaryChairPerson);
        if (findIndex !== -1) {
          dupArr.splice(findIndex, 1);
        }
        setContactRoles(dupArr);
      } else if (contactRoles.length !== allRoles.length) {
        setContactRoles(allRoles);
      }
    }
  }, [selectedRoles]);

  useEffect(() => {
    window.addEventListener('beforeunload', function (event) {
      event.stopImmediatePropagation();
    });
  });
  const AccountSchema = AccountFormSchema(customFields);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(AccountSchema),
  });
  const recruiter = watch('recruiter');
  const [customFieldsToUpdate, setCustomFieldsToUpdate] = useState(null);
  useEffect(() => {
    setValue('BECS_code', '');
    setValue('is_active', true);
    setValue('RSMO', false);
    setValue('address2', '');
    setValue('address1', '');
    setValue('county', '');
    setValue('latitude', '');
    setValue('longitude', '');
  }, []);
  const BreadcrumbsData = [
    ...CRMAccountsBreadCrumbsData,
    {
      label: accountId ? 'Edit Account' : 'Create Account',
      class: 'disable-label',
      link: accountId
        ? `/crm/accounts/${accountId}/edit`
        : '/crm/accounts/create',
    },
  ];

  useEffect(() => {
    getLoginUserId();
  }, []);

  const getLoginUserId = () => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodedData = jwt(jwtToken);
      if (decodedData?.id) {
        setUserId(decodedData.id);
      }
    }
  };

  useEffect(() => {
    const loggedInRecruiter = recruiters?.find(
      (recruiter) => recruiter?.id == userId
    );
    if (!accountId && loggedInRecruiter && !loggedInRecruiterLoaded) {
      setSelectedRecruiters({
        value: +loggedInRecruiter.id,
        label: `${loggedInRecruiter.first_name} ${
          loggedInRecruiter.last_name || ''
        }`,
      });
      setValue('recruiter', loggedInRecruiter.id || null);
      setLoggedInRecruiterLoaded(true);
      if (dependee === null) {
        setDependee('recruiter');
      }
    }
  }, [userId, recruiters]);

  const getAccountData = async (id) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/accounts/${id}`
    );
    const { data } = await result.json();

    const mailing_address = (
      data?.address?.address1 +
      ' ' +
      data?.address?.address2
    ).trim();

    setAccountData(data);
    const addAccountUpdates = {
      name: data?.name || '',
      alternate_name: data?.alternate_name || '',
      mailing_address: mailing_address || '',
      zip_code: data?.address?.zip_code || '',
      city: removeCountyWord(data?.address?.city) || '',
      state: data?.address?.state || '',
      country: data?.address?.country || '',
      county: removeCountyWord(data?.address?.county) || '',
      address2: data?.address?.address2 || '',
      latitude: data?.address?.coordinates?.x || '',
      longitude: data?.address?.coordinates?.y || '',
      phone: formatPhoneNumber(data?.phone) || '',
      website: data?.website || '',
      facebook: data?.facebook || '',
      industry_category: data?.industry_category?.id || '',
      industry_subcategory: data?.industry_subcategory?.id || '',
      stage: data?.stage?.id || '',
      source: data?.source?.id || '',
      BECS_code: data?.becs_code || '',
      collection_operation: data?.collection_operation?.id || '',
      recruiter: data?.recruiter?.id || '',
      territory: data?.territory?.id || '',
      population: data?.population || '',
      is_active: data?.is_active,
      RSMO: data?.RSMO,
    };
    let dupSponsorCheckbox = { ...checkboxValue };
    dupSponsorCheckbox.account_id = data?.account_id || null;
    dupSponsorCheckbox.external_id = data?.external_id || null;
    setCheckboxValue(dupSponsorCheckbox);
    reset(addAccountUpdates);
    getAccountCustomFields();
    setSelectedIndustryCategory({
      value: +data?.industry_category?.id,
      label: data?.industry_category?.name,
    });
    setSelectedIndustrySubCategory({
      value: +data?.industry_subcategory?.id,
      label: data?.industry_subcategory?.name,
    });
    setSelectedStages({
      value: +data?.stage?.id,
      label: data?.stage?.name,
    });
    setSelectedSources({
      value: +data?.source?.id,
      label: data?.source?.name,
    });
    setSelectedCollectionOperations({
      value: +data?.collection_operation?.id,
      label: data?.collection_operation?.name,
    });
    setSelectedRecruiters({
      value: +data?.recruiter?.id,
      label: `${data?.recruiter?.first_name} ${
        data?.recruiter?.last_name || ''
      }`,
    });

    setSelectedTerritories({
      value: +data?.territory?.id,
      label: data?.territory?.territory_name,
    });
  };

  const getAccountCustomFields = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/organization-administration/custom-fields/data?custom_field_datable_id=${accountId}&custom_field_datable_type=${PolymorphicType.CRM_ACCOUNTS}`
      );
      const data = await response.json();
      if (data?.status_code === 201) {
        const fieldsToUpdate = data.data;
        setCustomFieldsToUpdate(fieldsToUpdate);
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

  useEffect(() => {
    getAllResponses();
  }, [allCollectionOperationsObject]);

  const getAllResponses = async () => {
    if (accountId && Object.values(allCollectionOperationsObject).length) {
      await getAccountData(accountId);
    }
  };

  useEffect(() => {
    if (accountId && !customFieldsToUpdate) getAccountCustomFields(accountId);
  }, [accountId]);

  useEffect(() => {
    getAccountSeedData();
    getCustomFields();
  }, []);

  const getCustomFields = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/organization-administration/custom-fields/modules/1`
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

  const getAccountSeedData = async (existing = {}) => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/accounts/upsert/seed-data`
      );
      const data = await result.json();
      setIndustryCategories(data?.data?.industryCategories || []);
      setStages(data?.data?.stages || []);
      setSources(data?.data?.sources || []);
      if (existing?.id) {
        const isExistingOperationInData = data?.data?.businessUnits.some(
          (operation) => operation.id === existing?.id
        );
        if (!isExistingOperationInData) {
          setCollectionOperation(
            [...data.data.businessUnits, existing].filter(Boolean)
          );
        } else {
          setCollectionOperation([...data.data.businessUnits].filter(Boolean));
        }
      } else {
        setCollectionOperation(data?.data?.businessUnits || []);
      }
      setRecruiters(data?.data?.recruiters || []);
      setTerritory(data?.data?.territories || []);
      if (data?.data?.businessUnits?.length > 0) {
        setAllCollectionOperationsObject(
          _.groupBy(data?.data?.businessUnits, 'id') || {}
        );
      }
      if (data?.data?.recruiters?.length > 0) {
        setAllRecruitersObject(
          _.groupBy(data?.data?.recruiters, 'business_unit.id') || {}
        );
      }
      if (data?.data?.territories?.length > 0) {
        setAllTerritoriesObject(
          _.groupBy(data?.data?.territories, 'recruiter_id') || {}
        );
      }
      if (data?.data?.industrySubCategories?.length > 0) {
        setAllIndustrySubCategory(
          _.groupBy(data?.data?.industrySubCategories, 'parent_id.id') || {}
        );
      }
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };

  const getPlacePredictions = (input) => {
    if (window.google) {
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'us' },
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            !predictions.some(
              (item) => item.description == getValues('mailing_address')
            )
          ) {
            setPredictions(predictions);
          } else {
            setPredictions([]);
          }
        }
      );
    }
  };

  const getPlaceDetails = (address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const place = results[0];
          const city = getAddressComponent(place, 'locality');
          const county = getAddressComponent(
            place,
            'administrative_area_level_2'
          );
          setValue('zip_code', getAddressComponent(place, 'postal_code'));
          setValue('city', removeCountyWord(city || county));
          setValue(
            'state',
            getAddressComponent(place, 'administrative_area_level_1')
          );
          setValue('country', getAddressComponent(place, 'country'));
          setValue('address1', getAddressComponent(place, 'street_number'));
          setValue('address2', getAddressComponent(place, 'route'));
          setValue('county', removeCountyWord(county));
          setValue('latitude', place.geometry.location.lat().toString());
          setValue('longitude', place.geometry.location.lng().toString());
          const mailing_address = `${getAddressComponent(
            place,
            'street_number'
          )} ${getAddressComponent(place, 'route')}`.trim();
          setValue('mailing_address', mailing_address);
          if (mailing_address === '') {
            errors.mailing_address = {
              message: 'Mailing address is required.',
            };
          } else {
            errors.mailing_address = {
              message: '',
            };
          }
        }
      }
    });
  };
  const getAddressComponent = (place, type) => {
    const addressComponent = place.address_components.find((component) =>
      component.types.includes(type)
    );
    return addressComponent ? addressComponent.long_name : '';
  };

  const handlePredictionClick = (prediction) => {
    getPlaceDetails(prediction.description);
    setPredictions([]);
  };

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      getPlaceDetails(getValues('mailing_address'));
    }
  }

  useEffect(() => {
    if (getValues('industry_category') != '') {
      getSubIndustryCategories();
    }
  }, [watch('industry_category')]);

  const getSubIndustryCategories = async () => {
    setSubIndustryCategories(
      allIndustrySubCategory?.[getValues('industry_category')] || []
    );
    if (accountId) {
      if (
        +accountData?.industry_subcategory?.id ===
          +getValues('industry_subcategory') &&
        +accountData?.industry_category?.id === +getValues('industry_category')
      ) {
        setValue('industry_subcategory', accountData?.industry_subcategory?.id);
        setSelectedIndustrySubCategory({
          value: +accountData?.industry_subcategory?.id,
          label: accountData?.industry_subcategory?.name,
        });
      } else {
        setValue('industry_subcategory', '');
        setSelectedIndustrySubCategory(null);
      }
    } else {
      setValue('industry_subcategory', '');
      setSelectedIndustrySubCategory(null);
    }
  };

  useEffect(() => {
    if (getValues('collection_operation') != '') {
      getAffiliatedRecruiters(getValues('collection_operation'));
    }
  }, [watch('collection_operation')]);

  const getAffiliatedRecruiters = async (collectionOperationId) => {
    if (dependee === 'collection_operation' || accountId) {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/user/recruiters?id=${collectionOperationId}`
      );
      const { data } = await result.json();
      setRecruiters(data);
    }
    if (selectedCollectionOperations === null && dependee === null) {
      setCollectionOperation(
        Object.values(allCollectionOperationsObject)?.flat(1) || []
      );

      setRecruiters(Object.values(allRecruitersObject)?.flat(1) || []);
      setTerritory(Object.values(allTerritoriesObject)?.flat(1) || []);
      setValue('recruiter', '');
      setSelectedRecruiters(null);
      setValue('territory', '');
      setSelectedTerritories(null);
    }
    if (accountId) {
      if (
        +accountData?.recruiter?.id === +getValues('recruiter') &&
        +accountData?.collection_operation?.id ===
          +getValues('collection_operation')
      ) {
        setValue('recruiter', accountData?.recruiter?.id);
        setSelectedRecruiters({
          value: +accountData?.recruiter?.id,
          label: `${accountData?.recruiter?.first_name} ${
            accountData?.recruiter?.last_name || ''
          }`,
        });
      } else {
        if (dependee === 'collection_operation') {
          setValue('recruiter', '');
          setSelectedRecruiters(null);
          setValue('territory', '');
          setSelectedTerritories(null);
          setTerritory([]);
        }
      }
    } else {
      if (dependee === 'collection_operation') {
        setValue('recruiter', '');
        setSelectedRecruiters(null);
        setValue('territory', '');
        setSelectedTerritories(null);
        setTerritory([]);
      }
    }
  };

  useEffect(() => {
    if (getValues('recruiter') != '') {
      getAffiliatedTerritories(getValues('recruiter'));
    }
  }, [recruiter]);

  const getAffiliatedTerritories = async (recruiterId) => {
    setTerritory(allTerritoriesObject?.[getValues('recruiter')] || []);
    if (dependee === 'recruiter' || accountId) {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/facilities/collection-operation/staging/${recruiterId}`
      );
      const { data } = await result.json();
      setCollectionOperation(data);
    }
    if (selectedRecruiters === null && dependee === null) {
      setCollectionOperation(
        Object.values(allCollectionOperationsObject)?.flat(1) || []
      );
      setTerritory(Object.values(allTerritoriesObject)?.flat(1) || []);
      setRecruiters(Object.values(allRecruitersObject)?.flat(1) || []);
      setValue('territory', '');
      setSelectedTerritories(null);
      setValue('collection_operation', '');
      setSelectedCollectionOperations(null);
    }
    if (accountId) {
      if (
        +accountData?.territory?.id === +getValues('territory') &&
        +accountData?.recruiter?.id === +getValues('recruiter')
      ) {
        setValue('territory', accountData?.territory?.id);
        setSelectedTerritories({
          value: +accountData?.territory?.id,
          label: accountData?.territory?.territory_name,
        });
      } else {
        if (recruiterId) {
          if (
            Object.values(allCollectionOperationsObject)?.flat(1).length == 1
          ) {
            let id = Object.values(allCollectionOperationsObject)?.flat(1)[0]
              .id;
            let name = Object.values(allCollectionOperationsObject)?.flat(1)[0]
              .name;
            setValue('collection_operation', +id);
            setSelectedCollectionOperations({
              label: name,
              value: +id,
            });
          }
        } else {
          setValue('collection_operation', '');
          setSelectedCollectionOperations(null);
        }

        if (
          (allTerritoriesObject?.[getValues('recruiter')] || []).length === 1
        ) {
          setValue(
            'territory',
            allTerritoriesObject?.[getValues('recruiter')][0].id
          );
          setSelectedTerritories({
            label:
              allTerritoriesObject?.[getValues('recruiter')][0].territory_name,
            value: allTerritoriesObject?.[getValues('recruiter')][0].id,
          });
        } else {
          setSelectedTerritories(null);
          setValue('territory', '');
        }
      }
    } else {
      if (recruiterId) {
        if (Object.values(allCollectionOperationsObject)?.flat(1).length == 1) {
          let id = Object.values(allCollectionOperationsObject)?.flat(1)[0].id;
          let name = Object.values(allCollectionOperationsObject)?.flat(1)[0]
            .name;
          setValue('collection_operation', +id);
          setSelectedCollectionOperations({
            label: name,
            value: +id,
          });
        }
      } else {
        setValue('collection_operation', '');
        setSelectedCollectionOperations(null);
      }

      if ((allTerritoriesObject?.[getValues('recruiter')] || []).length === 1) {
        setValue(
          'territory',
          allTerritoriesObject?.[getValues('recruiter')][0].id
        );
        setSelectedTerritories({
          label:
            allTerritoriesObject?.[getValues('recruiter')][0].territory_name,
          value: allTerritoriesObject?.[getValues('recruiter')][0].id,
        });
      } else {
        setSelectedTerritories(null);
        setValue('territory', '');
      }
    }
  };

  useEffect(() => {
    if (
      getValues('name') === '' &&
      getValues('alternate_name') === '' &&
      getValues('mailing_address') === '' &&
      getValues('zip_code') === '' &&
      getValues('city') === '' &&
      getValues('state') === '' &&
      getValues('county') === '' &&
      getValues('phone') === '' &&
      getValues('website') === '' &&
      getValues('facebook') === '' &&
      getValues('industry_category') === '' &&
      getValues('industry_subcategory') === '' &&
      getValues('stage') === '' &&
      getValues('source') === '' &&
      getValues('collection_operation') === '' &&
      getValues('territory') === '' &&
      getValues('population') === ''
    ) {
      setUnsavedChanges(false);
    } else {
      setUnsavedChanges(true);
    }
  }, [watch()]);

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmationDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(-1);
    }
  };

  const archiveDuplicates = async () => {
    if (!accountId) return;

    const response = await makeAuthorizedApiRequest(
      'PATCH',
      `${BASE_URL}/accounts/duplicates/${accountId}/archive`
    );
    const data = await response.json();
    if (data?.status !== 'success') {
      toast.error('Staff duplicates are not archived.', {
        autoClose: 3000,
      });
      throw Error(data.response);
    }
  };

  const handleExistingAccount = async (values) => {
    const {
      name,
      alternate_name,
      mailing_address,
      zip_code,
      city,
      state,
      country,
      phone,
      website,
      facebook,
      industry_category,
      industry_subcategory,
      stage,
      source,
      BECS_code,
      collection_operation,
      recruiter,
      territory,
      population,
      is_active,
      RSMO,
      county,
      address2,
      longitude,
      latitude,
      address1,
    } = values;

    let body = {
      name: name?.trim(),
      alternate_name: !alternate_name ? null : alternate_name,
      mailing_address: mailing_address?.trim(),
      zip_code: !zip_code ? null : zip_code,
      city: city?.trim(),
      state: state?.trim(),
      country: country?.trim(),
      phone: !phone ? null : replaceSpecialCharacters(phone)?.trim(),
      website,
      facebook,
      industry_category: +industry_category,
      industry_subcategory: +industry_subcategory,
      stage: +stage,
      source: +source,
      BECS_code,
      collection_operation: +collection_operation,
      recruiter: +recruiter,
      territory: !territory ? null : +territory,
      population: !population ? null : population,
      is_active,
      RSMO,
      county,
      address2: address2?.trim(),
      address1: address1?.trim(),
      longitude,
      latitude,
      account_id: accountId,
    };
    //used for escaping error
    const dupArr = [...selectedContacts];
    if (!checkAddressValidation(longitude, latitude)) {
      toast.error(ADDRESS_VALIDATION_ERROR);
      return;
    }

    if (selectedContacts?.length > 0) {
      accountContactsList.forEach((item) => {
        if (
          selectedContacts.includes(item.record?.id) &&
          item?.role_id?.id === selectedRoles[item.record?.id]?.value
        ) {
          const indexToRemove = dupArr.findIndex(
            (record) => record === item.record?.id
          );
          dupArr.splice(indexToRemove, 1);
        }
      });
    }
    if (!accountId && dupArr?.length === 0) {
      return toast.error('At least one contact is required.');
    }
    if (
      !selectedContacts.some(
        (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
      )
    ) {
      return toast.error(
        'At least one contact with Primary chairperson role is required.'
      );
    }
    if (
      selectedContacts.filter(
        (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
      ).length > 1
    ) {
      return toast.error(
        'There can only be one contact with Primary Chairperson role.'
      );
    }
    try {
      setIsSubmitting(true);
      if (!duplicateChecked) {
        SetDuplicateChecked(true);
        const response = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/accounts/duplicates/identify`,
          JSON.stringify(body)
        );
        let data = await response.json();
        if (accountId && response.ok && response.status === 207) {
          await archiveDuplicates();
          return false;
        } else if (data?.status_code === 409) {
          setDuplicateConfirmation({ ...body, duplicate: data?.data });
          setExistingAccountModal(true);
        } else if (data?.status_code === 200) {
          handleSubmitForm(values);
        }
      } else {
        handleSubmitForm(values);
      }
      setIsSubmitting(false);
      // handleSubmitForm(values);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const createDuplicates = async (recordId) => {
    if (!duplicateConfirmation || !duplicateConfirmation?.duplicate?.length)
      return;

    await archiveDuplicates();
    setDuplicateId(recordId);
    const { duplicate = [] } = duplicateConfirmation;
    const response = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/accounts/duplicates/create-many`,
      JSON.stringify({
        record: recordId,
        duplicatable_ids: duplicate
          .map((dup) => dup?.id)
          .filter((dupId) => dupId),
      })
    );
    const data = await response.json();
    if (data?.status !== 'success') {
      throw new Error('Account duplicates are not created.');
    }
  };

  const handleSubmitForm = async (data) => {
    const {
      name,
      alternate_name,
      mailing_address,
      zip_code,
      city,
      state,
      country,
      phone,
      website,
      facebook,
      industry_category,
      industry_subcategory,
      stage,
      source,
      BECS_code,
      collection_operation,
      recruiter,
      territory,
      population,
      is_active,
      RSMO,
      county,
      address2,
      address1,
      longitude,
      latitude,
    } = data;

    const fieldsData = [];
    // const customFieldDatableId = 0; // You can change this as needed
    const customFieldDatableType = PolymorphicType.CRM_ACCOUNTS; // You can change this as needed
    let resulting;
    if (!checkAddressValidation(longitude, latitude)) {
      toast.error(ADDRESS_VALIDATION_ERROR);
      return;
    }

    for (const key in data) {
      if (key > 0) {
        const value = data[key]?.value ?? data[key];
        fieldsData.push({
          field_id: key,
          field_data:
            value === null
              ? null
              : typeof value === 'object' && !Array.isArray(value)
              ? new Date(value).toISOString()
              : value?.toString(),
        });
      }
    }
    resulting = {
      fields_data: fieldsData,
      // custom_field_datable_id: customFieldDatableId,
      custom_field_datable_type: customFieldDatableType,
    };
    const dupArr = [...selectedContacts];
    const dupArrDelete = [...deletedContacts];
    if (selectedContacts?.length > 0) {
      accountContactsList.forEach((item) => {
        if (
          selectedContacts.includes(item.record?.id) &&
          item?.role_id?.id === selectedRoles[item.record?.id]?.value
        ) {
          const indexToRemove = dupArr.findIndex(
            (record) => record === item.record?.id
          );
          dupArr.splice(indexToRemove, 1);
        } else {
          if (!dupArrDelete.includes(item.id)) {
            dupArrDelete.push(item.id);
          }
        }
      });
    }
    if (subIndustryCategories?.length > 0 && !industry_subcategory) {
      setIndustry_subCategoryError('Please select a subcategory.');
      return;
    }
    if (!accountId && dupArr?.length === 0) {
      return toast.error('At least one contact is required.');
    }
    if (
      !selectedContacts.some(
        (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
      )
    ) {
      return toast.error(
        'At least one contact with Primary chairperson role is required.'
      );
    }
    if (
      selectedContacts.filter(
        (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
      ).length > 1
    ) {
      return toast.error(
        'There can only be one contact with Primary Chairperson role.'
      );
    }

    try {
      let body = {
        account_id: null,
        external_id: null,
        name,
        alternate_name: !alternate_name ? null : alternate_name,
        mailing_address,
        zip_code: !zip_code ? null : zip_code,
        city,
        state,
        country,
        county,
        address2,
        address1,
        longitude,
        latitude,
        phone: !phone ? null : replaceSpecialCharacters(phone),
        website,
        facebook,
        industry_category: +industry_category,
        industry_subcategory: !industry_subcategory
          ? null
          : +industry_subcategory,
        stage: +stage,
        source: +source,
        BECS_code,
        collection_operation: +collection_operation,
        recruiter: +recruiter,
        territory: !territory ? null : +territory,
        population: !population ? null : population,
        is_active,
        RSMO,
        deleteContacts: dupArrDelete,
        // ======  Custom Fields Form ======
        custom_fields: resulting,

        contacts: dupArr.map((item) => {
          return {
            contactable_type: PolymorphicType.CRM_ACCOUNTS,
            contactable_id: accountId || null,
            record: item,
            role_id: selectedRoles[item]?.value,
          };
        }),
      };

      // const bbcsExisting = await axios.get(
      //   `${BASE_URL}/sponsors?sponsorGroupName=${name}&addressLineOne=${mailing_address}&addressLineTwo=${address2}&city=${city}&state=${state}&zipCode=${zip_code}&phone=${phone}`
      // );
      // if (bbcsExisting === null) {
      //   body.account_id = null;
      //   body.external_id = null;
      // } else if (bbcsExisting?.type === 'EXACT') {
      //   body.account_id = +bbcsExisting?.id;
      //   body.external_id = bbcsExisting?.UUID;
      // } else if (bbcsExisting?.type === 'MULTIEXACT') {
      //   setBodyToSend(body);
      //   setMultiExactArray(bbcsExisting?.data || []);
      //   setMultiExactModal(true);
      //   return;
      // }
      setIsSubmitting(true);
      if (accountId) {
        const response = await makeAuthorizedApiRequest(
          'PUT',
          `${BASE_URL}/accounts/${accountId}`,
          JSON.stringify(body)
        );
        let data = await response.json();
        if (data?.status === 'success') {
          await createDuplicates(accountId);
          getAccountData(accountId);
          getAccountCustomFields(accountId);
          getAccountContacts(accountId);
          setShowModel(true);
        } else if (data?.status === 'currently_in_use') {
          toast.error(
            `One or more contact/s can't be removed they are in use for drive.`,
            {
              autoClose: 3000,
            }
          );
        } else if (data?.statusCode === 404) {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message;

          toast.error(`${showMessage}`, { autoClose: 3000 });
        } else if (data?.status_code === 500) {
          toast.error(`${data?.response}`, { autoClose: 3000 });
        } else {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message;

          toast.error(`${showMessage}`, { autoClose: 3000 });
        }
      } else {
        const response = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/accounts`,
          JSON.stringify(body)
        );
        let data = await response.json();
        if (data?.status === 'success') {
          await createDuplicates(data?.data?.id);
          setModalPopUp(true);
          setIsNavigate(true);
        } else if (data?.status_code === 400) {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message || data?.response;

          toast.error(`${showMessage}`, { autoClose: 3000 });
        } else if (data?.status_code === 500) {
          toast.error(`${data?.response}`, { autoClose: 3000 });
        } else {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message;
          toast.error(`${showMessage}`, { autoClose: 3000 });
        }
        setDuplicateConfirmation(null);
      }
    } catch (error) {
      if (accountId) {
        const showMessage = Array.isArray(error?.message)
          ? error?.message[0]
          : error?.message;
        toast.error(`${showMessage}`, { autoClose: 3000 });
      } else {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
    setIsSubmitting(false);
    // }
  };

  useEffect(() => {
    // Add a cleanup function to remove the event listener when the component is unmounted
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        // Show a generic message to prevent the user from accidentally leaving the page
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [unsavedChanges]);

  const archiveAccount = async () => {
    try {
      const res = await makeAuthorizedApiRequest(
        'DELETE',
        `${BASE_URL}/accounts/${accountId}`
      );

      let { data, status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        toast.success(response, { autoClose: 3000 });
        navigate('/crm/accounts');
      } else if (status === 'currently_in_use') {
        setArchiveModal(false);
        toast.error(`This account can't be archived it is in use for drive`, {
          autoClose: 3000,
        });
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        // Handle bad request
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (accountContactsList?.length > 0 || defaultAccountContacts?.length > 0) {
      setSelectedContacts(
        defaultAccountContacts.map((item) => item.contact_id)
      );
      const dupObj = {};
      defaultAccountContacts.forEach((item) => {
        dupObj[item.contact_id] = {
          value: item.role,
          label: item.roleName,
          isPrimaryChairPerson: item?.isPrimaryChairPerson,
        };
      });
      setselectedRoles(dupObj);
    } else {
      setSelectedContacts([]);
      setselectedRoles({});
    }
  }, [defaultAccountContacts?.length, closeModal, addContactsModal]);
  useEffect(() => {
    if (selectedContacts?.length > 0) {
      const dupArr = [];
      accountContactsList.forEach((item) => {
        if (!selectedContacts.includes(item.record?.id)) {
          dupArr.push(item.id);
        }
      });
      setDeletedContacts(dupArr);
    }
  }, [selectedContacts?.length]);

  useEffect(() => {
    if (accountId) {
      getAccountContacts(accountId);
    }
  }, [accountId]);

  const getAccountContacts = async (id) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/accounts/${id}/account-contacts?is_current=true`
    );
    const { data } = await result.json();
    if (data?.length > 0) {
      setAccountContactsList(data);
      const accContactsData = data.map((contactdata) => {
        return {
          ...contactdata,
          name: `${contactdata?.record?.first_name} ${contactdata?.record?.last_name}`,
          role: contactdata?.role_id?.id,
          roleName: contactdata?.role_id?.name || null,
          email: contactdata?.record?.contact?.[0]?.data?.includes('@')
            ? contactdata?.record?.contact?.[0]?.data
            : contactdata?.record?.contact?.[1]?.data || null,
          phone: contactdata?.record?.contact?.[0]?.data?.includes('@')
            ? contactdata?.record?.contact?.[1]?.data
            : contactdata?.record?.contact?.[0]?.data || null,
          contact_id: contactdata?.record?.id,
          isPrimaryChairPerson: contactdata?.role_id?.is_primary_chairperson,
        };
      });
      setDefaultAccountContacts(accContactsData);
      const freeDataWithContactIdAsKey = {};
      accContactsData?.forEach((contact) => {
        freeDataWithContactIdAsKey[contact?.contact_id] = contact;
      });
      const updatedState = { ...contactRows, ...freeDataWithContactIdAsKey };
      setContactRows(updatedState);
    }
  };

  const fetchData = (page) => {
    setPageNumber(page);
    console.log({ page });
    fetchAllVolunteerContacts(page);
  };
  useEffect(() => {
    fetchAllVolunteerContacts(1);
  }, []);
  useEffect(() => {
    if (searchText?.length > 1) {
      setSearched(true);
      fetchAllVolunteerContacts(1);
    }
    if (searchText.length <= 1 && searched) {
      setSearched(false);
      fetchAllVolunteerContacts(1);
    }
  }, [searchText]);

  const fetchAllVolunteerContacts = async (page, filters) => {
    const isSearch = searchText && searchText?.length > 1 ? true : false;
    try {
      if (isSearch) {
        setsortedContactRows([]);
      }
      if (page == 1) {
        setContactRows([]);
      }
      setIsLoading(true);
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contact-volunteer?page=${+page}&limit=3&status=true${
          isSearch ? '&name=' + searchText : `&onlyCurrentUser=true`
        }&sortBy=last_name&sortOrder=ASC`
      );
      const data = await response.json();
      if (data.status !== 500) {
        if (data?.data) {
          const contactData = data.data;
          let outputDataArray = [];
          for (const inputData of contactData) {
            const outputData = {
              id: inputData?.volunteer_id,
              name: inputData?.name,
              email: inputData?.primary_email,
              phone:
                inputData?.primary_phone
                  ?.replace(/\W/g, '')
                  ?.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') ||
                inputData?.primary_phone,
              city: inputData?.address_city,
            };

            if (!outputDataArray.some((item) => item.id === outputData.id)) {
              outputDataArray.push(outputData);
            }
          }
          if (sortedContactRows?.length) {
            setsortedContactRows((prev) => [...prev, ...outputDataArray]);
            setContactRows((prev) => ({
              ...prev,
              ..._.keyBy(outputDataArray, 'id'),
            }));
          } else {
            setsortedContactRows(outputDataArray);
            // setContactRows(_.keyBy(outputDataArray, 'id'));
            setContactRows((prev) => ({
              ...prev,
              ..._.keyBy(outputDataArray, 'id'),
            }));
          }
        } else {
          // setContactRows([]);
          setLoader(false);
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const TableHeaders = [
    {
      name: 'name',
      label: 'Name',
      width: '17%',
      sortable: false,
    },
    {
      name: 'role_name',
      type: 'select',
      label: 'Role',
      width: '25%',
      sortable: false,
    },
    {
      name: 'email',
      label: 'Email',
      width: '19%',
      type: 'noWrap',
      sortable: false,
    },
    {
      name: 'phone',
      label: 'Phone',
      width: '17%',
      type: 'noWrap',
      sortable: false,
    },
    {
      name: 'city',
      label: 'City',
      width: '15%',
      sortable: false,
    },
    {
      name: '',
      label: '',
      width: '20%',
      sortable: false,
    },
  ];

  useEffect(() => {
    getContactRoles();
  }, []);
  const getContactRoles = async () => {
    const deviceTypeUrl = `${BASE_URL}/contact-roles/volunteer`;
    const result = await fetch(`${deviceTypeUrl}`, {
      headers: {
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    const data = await result.json();
    const mappedData = data?.data.map((item) => {
      if (item?.is_primary_chairperson) {
        setPrimaryChairPersonName(`${item?.name}`);
      }
      return {
        value: item.id,
        label: item.name,
        isPrimaryChairPerson: item.is_primary_chairperson,
      };
    });
    setContactRoles(mappedData);
    setAllRoles(mappedData);
  };
  const submitContacts = async () => {
    if (selectedContacts?.length <= Object.keys(selectedRoles)?.length) {
      if (selectedContacts.length === 0) {
        toast.error('At least one contact is required.');
      } else {
        let dupDefaultAccountContacts = [];
        if (selectedContacts?.length > 0) {
          selectedContacts.forEach((item) => {
            dupDefaultAccountContacts.push({
              name: contactRows[item]?.name,
              role: selectedRoles[item]?.value,
              roleName: selectedRoles[item]?.label || null,
              email: contactRows[item]?.email || null,
              phone: contactRows[item]?.phone || null,
              contact_id: item,
              isPrimaryChairPerson: selectedRoles[item]?.isPrimaryChairPerson,
            });
          });
          setDefaultAccountContacts(dupDefaultAccountContacts);
        }
        setAddContactsModal(false);
      }
    } else {
      toast.error('Roles for selected contacts are required.');
    }
  };
  const handleCrossClick = (index) => {
    const dupArr = [...defaultAccountContacts];
    dupArr.splice(index, 1);
    setDefaultAccountContacts(dupArr);
  };
  // const CheckboxInput = ({ value, ...otherProps }) => (
  //   <input
  //     type="checkbox"
  //     value={value}
  //     style={{
  //       height: '15px',
  //       width: '15px',
  //     }}
  //     {...otherProps}
  //   />
  // );
  // const handleSponsorGroupChecked = (e, row) => {
  //   e.preventDefault();
  //   let dupObj = { ...checkboxValue };
  //   if (e.target.checked) {
  //     dupObj.account_id = row?.id;
  //     dupObj.external_id = row?.UUID;
  //   } else {
  //     dupObj.account_id = null;
  //     dupObj.external_id = null;
  //   }
  //   setCheckboxValue(dupObj);
  // };
  // const handleSubmitSponsorGroup = async () => {
  //   debugger; // eslint-disable-line
  //   if (
  //     checkboxValue.account_id === null &&
  //     checkboxValue.external_id === null
  //   ) {
  //     return toast.error('Please select one Sponsor Group to proceed.');
  //   } else {
  //     let dupBodyToSend = { ...bodyToSend };
  //     dupBodyToSend.account_id = checkboxValue.account_id;
  //     dupBodyToSend.external_id = checkboxValue.external_id;

  //     try {
  //       if (accountId) {
  //         const response = await makeAuthorizedApiRequest(
  //           'PUT',
  //           `${BASE_URL}/accounts/${accountId}`,
  //           JSON.stringify(dupBodyToSend)
  //         );
  //         let data = await response.json();
  //         if (data?.status === 'success') {
  //           getAccountData(accountId);
  //           getAccountContacts(accountId);
  //           setMultiExactModal(false);
  //           setShowModel(true);
  //         } else if (data?.statusCode === 404) {
  //           const showMessage = Array.isArray(data?.message)
  //             ? data?.message[0]
  //             : data?.message;

  //           toast.error(`${showMessage}`, { autoClose: 3000 });
  //         } else if (data?.status_code === 500) {
  //           toast.error(`${data?.response}`, { autoClose: 3000 });
  //         } else {
  //           const showMessage = Array.isArray(data?.message)
  //             ? data?.message[0]
  //             : data?.message;

  //           toast.error(`${showMessage}`, { autoClose: 3000 });
  //         }
  //       } else {
  //         const response = await makeAuthorizedApiRequest(
  //           'POST',
  //           `${BASE_URL}/accounts`,
  //           JSON.stringify(dupBodyToSend)
  //         );
  //         let data = await response.json();
  //         if (data?.status === 'success') {
  //           setMultiExactModal(false);
  //           setModalPopUp(true);
  //           setIsNavigate(true);
  //         } else if (data?.status_code === 400) {
  //           const showMessage = Array.isArray(data?.message)
  //             ? data?.message[0]
  //             : data?.message;

  //           toast.error(`${showMessage}`, { autoClose: 3000 });
  //         } else if (data?.status_code === 500) {
  //           toast.error(`${data?.response}`, { autoClose: 3000 });
  //         } else {
  //           const showMessage = Array.isArray(data?.message)
  //             ? data?.message[0]
  //             : data?.message;
  //           toast.error(`${showMessage}`, { autoClose: 3000 });
  //         }
  //       }
  //     } catch (error) {
  //       if (accountId) {
  //         const showMessage = Array.isArray(error?.message)
  //           ? error?.message[0]
  //           : error?.message;
  //         toast.error(`${showMessage}`, { autoClose: 3000 });
  //       } else {
  //         toast.error(`${error?.message}`, { autoClose: 3000 });
  //       }
  //     }
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mailing_address') {
      setValue('latitude', '');
      setValue('longitude', '');
      getPlacePredictions(value);
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Accounts'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />

      <div className="mainContentInner form-container">
        <form className={styles.account}>
          <div className="formGroup">
            <h5>{accountId ? 'Edit Account' : 'Create Account'}</h5>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('name')}
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder=" "
                  required
                />

                <label>Name*</label>
              </div>
              {errors?.name && (
                <div className="error">
                  <div className="error">
                    <p>{errors?.name?.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('alternate_name')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="alternate_name"
                  required
                />
                <label>Alternate Name</label>
              </div>
              {errors?.alternate_name && (
                <div className="error">
                  <div className="error">
                    <p>{errors?.alternate_name?.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="form-field w-100">
              <div className="field">
                <input
                  {...register('mailing_address')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="mailing_address"
                  onKeyDown={handleKeyPress}
                  required
                  onChange={handleChange}
                />

                <label>Mailing Address*</label>
              </div>
              <ul className="list-group">
                {predictions.map((prediction) => (
                  <li
                    key={prediction.place_id}
                    onClick={() => handlePredictionClick(prediction)}
                    className="list-group-item bg-light text-dark small border-0"
                    style={{ cursor: 'pointer' }}
                  >
                    {prediction.description}
                  </li>
                ))}
              </ul>

              {errors?.mailing_address && (
                <div className="error">
                  <p>{errors?.mailing_address?.message}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('zip_code')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="zip_code"
                  required
                />
                <label>Zip Code</label>
              </div>
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('city')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="city"
                  required
                />
                <label>City</label>
              </div>
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('state')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="state"
                  required
                />
                <label>State</label>
              </div>
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('county')}
                  type="text"
                  className="form-control"
                  placeholder=" "
                  name="county"
                  required
                />
                <label>County</label>
              </div>
            </div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <FormInput
                  label="Phone"
                  name="phone"
                  variant="phone"
                  displayName="Phone"
                  value={getValues('phone')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value?.length === 14 || value?.length === 0) {
                      field.onChange(value);
                    }
                    setValue('phone', value);
                  }}
                  error={errors?.phone?.message}
                  required={false}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value?.length > 0) {
                      field.onBlur();
                    }
                  }}
                />
              )}
            />

            <div className="form-field">
              <div className="field">
                <input
                  {...register('website')}
                  type="text"
                  className="form-control"
                  name="website"
                  placeholder=" "
                />
                <label>Website</label>
              </div>
              {errors?.website && (
                <div className="error">
                  <p>{errors?.website?.message}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="field">
                <input
                  {...register('facebook')}
                  type="text"
                  className="form-control"
                  name="facebook"
                  placeholder=" "
                />
                <label>Facebook</label>
              </div>
              {errors?.facebook && (
                <div className="error">
                  <p>{errors?.facebook?.message}</p>
                </div>
              )}
            </div>
            <h5 className={styles.subHeading}>Attributes</h5>
            <Controller
              name="industry_category"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Industry Category*"
                  name={field.name}
                  options={
                    industryCategories?.length > 0
                      ? industryCategories.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedIndustryCategory}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedIndustryCategory(option);
                    setValue('industry_category', option?.value || null);
                    setIndustry_subCategoryError('');
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.industry_category?.message}
                  showLabel
                />
              )}
            />
            <Controller
              name="industry_subcategory"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder={`Industry Subcategory${
                    subIndustryCategories?.length > 0 ? '*' : ''
                  }`}
                  name={field.name}
                  options={
                    subIndustryCategories?.length > 0
                      ? subIndustryCategories.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedIndustrySubCategory}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedIndustrySubCategory(option);
                    setValue('industry_subcategory', option?.value || null);
                    setIndustry_subCategoryError('');
                  }}
                  required={false}
                  disabled={subIndustryCategories?.length > 0 ? false : true}
                  onBlur={() => {
                    if (
                      subIndustryCategories?.length > 0 &&
                      !getValues('industry_subcategory')
                    ) {
                      setIndustry_subCategoryError(
                        'Please select a subcategory.'
                      );
                    }
                  }}
                  error={industry_subCategoryError}
                  showLabel
                />
              )}
            />
            <Controller
              name="stage"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Stage*"
                  name={field.name}
                  options={
                    stages?.length > 0
                      ? stages.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedStages}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedStages(option);
                    setValue('stage', option?.value || null);
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.stage?.message}
                  showLabel
                />
              )}
            />
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Source*"
                  name={field.name}
                  options={
                    sources?.length > 0
                      ? sources.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedSources}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedSources(option);
                    setValue('source', option?.value || null);
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.source?.message}
                  showLabel
                />
              )}
            />

            <div className="form-field">
              <div className="field">
                <input
                  {...register('BECS_code')}
                  type="text"
                  className="form-control"
                  name="BECS_code"
                  disabled={accountId ? true : false}
                  maxLength={4}
                  required
                  placeholder=" "
                />
                <label>BECS Code*</label>
              </div>
            </div>
            <Controller
              name="collection_operation"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Collection Operation*"
                  name={field.name}
                  options={
                    collectionOperation?.length > 0
                      ? collectionOperation.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedCollectionOperations}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedCollectionOperations(option);
                    setValue('collection_operation', option?.value || null);
                    if (dependee === null && option !== null) {
                      setDependee('collection_operation');
                    } else if (option === null) {
                      setDependee(null);
                    }
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.collection_operation?.message}
                  showLabel
                />
              )}
            />
            <Controller
              name="recruiter"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Recruiter*"
                  name={field.name}
                  isSortByLastName={true}
                  options={
                    recruiters?.length > 0
                      ? recruiters?.map((item) => {
                          return {
                            value: +item?.id,
                            label: `${item?.first_name} ${
                              item?.last_name || ''
                            }`,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedRecruiters}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedRecruiters(option);
                    setValue('recruiter', option?.value || null);
                    if (dependee === null && option !== null) {
                      setDependee('recruiter');
                    } else if (option === null) {
                      setDependee(null);
                    }
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.recruiter?.message}
                  showLabel
                />
              )}
            />

            <Controller
              name="territory"
              control={control}
              render={({ field }) => (
                <SelectDropdown
                  removeDivider
                  placeholder="Territory"
                  name={field.name}
                  options={
                    territory?.length > 0
                      ? territory?.map((item) => {
                          return {
                            value: +item?.id,
                            label: item?.territory_name,
                          };
                        })
                      : []
                  }
                  selectedValue={selectedTerritories}
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedTerritories(option);
                    setValue('territory', option?.value || null);
                  }}
                  required={false}
                  onBlur={field.onBlur}
                  error={errors?.territory?.message}
                  showLabel
                />
              )}
            />

            <div className="form-field">
              <div className="field">
                <input
                  type="number"
                  className="form-control"
                  placeholder=" "
                  {...register('population')}
                  name="population"
                  min={0}
                  required
                />
                <label>Population</label>
              </div>
              {errors?.population && (
                <div className="error">
                  <p>{errors?.population?.message}</p>
                </div>
              )}
            </div>

            <div className="d-flex align-items-start w-100 justify-content-between">
              <div className="form-field checkbox">
                <span className="toggle-text">
                  {watch('is_active') ? 'Active' : 'Inactive'}
                </span>
                <label htmlFor="toggle" className="switch">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    name="is_active"
                    id="toggle"
                    className="toggle-input"
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-field checkbox justify-content-end mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  {...register('RSMO')}
                  id="is_linkable"
                />
                <label className="form-check-label" htmlFor="is_goal_type">
                  RSMO
                </label>
              </div>
            </div>
          </div>
          <CustomFieldsForm
            control={control}
            formErrors={errors}
            customFileds={customFields}
          />
          <div className="formGroup contacts">
            <div className="d-flex justify-content-between gap-2 w-100">
              <div className="d-flex gap-2">
                <h5>Add Contacts</h5>
                <ToolTip
                  text={`A ${primaryChairPersonName} is required. Click the Add button to search for and select contacts for this account.`}
                />
              </div>
              {!accountId ? (
                <div onClick={() => setCreateContactsModal(true)}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#005375',
                      cursor: 'pointer',
                    }}
                  >
                    Create Contact
                  </span>
                </div>
              ) : (
                ''
              )}
            </div>
            <div className={`tableContainer ${styles.contactTable}`}>
              <table className="viewTables w-100 mt-2 mb-4 rounded-0">
                <thead>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>Name</td>
                    <td style={{ whiteSpace: 'nowrap' }}>Role</td>
                    <td style={{ whiteSpace: 'nowrap' }}>Email</td>
                    <td style={{ whiteSpace: 'nowrap' }}>Phone</td>
                    <td style={{ width: '10%' }}></td>
                  </tr>
                </thead>
                <tbody>
                  {defaultAccountContacts?.length > 0 ? (
                    defaultAccountContacts.map((fetchedContact, index) => (
                      <tr key={index}>
                        <td style={{ wordBreak: 'break-word' }}>
                          {fetchedContact?.name}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {fetchedContact?.roleName || ''}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {fetchedContact?.email || ''}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {fetchedContact?.phone || ''}
                        </td>
                        <td style={{ width: '10%', whiteSpace: 'nowrap' }}>
                          <FontAwesomeIcon
                            className="cursor-pointer"
                            style={{ width: '20px', height: '20px' }}
                            color="#A3A3A3"
                            icon={faXmark}
                            onClick={() => handleCrossClick(index)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-data text-sm text-center">
                        No contacts selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="w-100 d-flex align-items-center justify-content-end ">
              <button
                type="button"
                onClick={() => setAddContactsModal(true)}
                className="btn btn-md btn-primary"
              >
                Add Contacts
              </button>
            </div>
          </div>
        </form>
        <section
          className={`popup full-section ${
            showConfirmationDialog ? 'active' : ''
          }`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={CancelIconImage} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Confirmation</h3>
              <p>Unsaved changes will be lost. Do you want to continue?</p>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleConfirmationResult(false)}
                >
                  No
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleConfirmationResult(true)}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </section>
        <section
          className={`popup full-section ${
            existingAccountModal ? 'active' : ''
          }`}
        >
          <div className="popup-inner" style={{ maxWidth: '500px' }}>
            <div className="icon">
              <img src={WarningIconImage} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Warning!</h3>
              {duplicateConfirmation?.duplicate?.length > 1 ? (
                <p>
                  There are possible duplicates for this record using the same{' '}
                  <span className="text-primary">
                    {getValues('mailing_address')}
                  </span>
                  .
                  <br />
                  <br />
                  Please click CANCEL to discard this record and be taken to a
                  list of possible duplicates for review{' '}
                  <span className="text-primary">{getValues('name')}</span> or
                  click PROCEED to create this new record.
                </p>
              ) : (
                <p>
                  A possible duplicate has been found.{' '}
                  <span className="text-primary">
                    {getValues('mailing_address')}
                  </span>{' '}
                  already exists.
                  <br />
                  <br />
                  Please click CANCEL to discard this record and be taken to the
                  existing record for{' '}
                  <span className="text-primary">{getValues('name')}</span> or
                  click PROCEED to create this new record.
                </p>
              )}
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  style={{ width: '47%' }}
                  onClick={() => {
                    setExistingAccountModal(false);
                    SetDuplicateChecked(false);
                    navigate(
                      `/crm/accounts/${duplicateConfirmation?.duplicate?.[0]?.id}/view/about`
                    );
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  style={{ width: '47%' }}
                  className="btn btn-primary"
                  onClick={(e) => {
                    handleExistingAccount(getValues());
                    setExistingAccountModal(false);
                  }}
                  disabled={isLoading}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      {accountId ? (
        <FormFooter
          enableArchive={CheckPermission([CrmPermissions.CRM.ACCOUNTS.ARCHIVE])}
          onClickArchive={() => setArchiveModal(true)}
          enableCancel={true}
          onClickCancel={handleCancelClick}
          enableSaveAndClose={true}
          onClickSaveAndClose={handleSubmit(handleExistingAccount)}
          onClickCaptureSaveAndClose={(e) => setClose(true)}
          enableSaveChanges={true}
          onClickSaveChanges={handleSubmit(handleExistingAccount)}
          disabled={isSubmitting}
        />
      ) : (
        <FormFooter
          enableCancel={true}
          onClickCancel={handleCancelClick}
          enableCreate={true}
          onClickCreate={handleSubmit(handleExistingAccount)}
          disabled={isSubmitting}
        />
      )}
      {modalPopUp && (
        <SuccessPopUpModal
          title={'Success!'}
          message={'Account created.'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={true}
          isNavigate={isNavigate}
          onConfirm={() => {
            if (isNavigate) {
              navigate(
                duplicateId
                  ? `/crm/accounts/${duplicateId}/view/duplicates`
                  : -1
              );
            }
          }}
        />
      )}
      {archiveModal && (
        <SuccessPopUpModal
          title={'Confirmation'}
          message={'Are you sure you want to archive?'}
          modalPopUp={archiveModal}
          setModalPopUp={setArchiveModal}
          showActionBtns={false}
          isArchived={archiveModal}
          archived={archiveAccount}
          isNavigate={isNavigate}
          redirectPath={'/crm/accounts'}
        />
      )}
      {closeModal === true ? (
        <CancelModalPopUp
          title="Confirmation"
          message="Unsaved changes will be lost, do you wish to proceed?"
          modalPopUp={closeModal}
          isNavigate={true}
          setModalPopUp={setCloseModal}
          onConfirm={() => {
            if (isNavigate) {
              navigate(-1);
            }
          }}
        />
      ) : null}
      {showModel === true ? (
        <SuccessPopUpModal
          title="Success!"
          message="Account updated."
          modalPopUp={showModel}
          isNavigate={true}
          setModalPopUp={setShowModel}
          showActionBtns={true}
          onConfirm={() => {
            if (close) {
              navigate(-1);
            }
          }}
        />
      ) : null}
      <section
        className={`aboutAccountMain popup full-section ${
          addContactsModal ? 'active' : ''
        }`}
      >
        <div className={`popup-inner ${styles.popupStyle}`}>
          <div className="content">
            <div className="d-flex align-items-center justify-between">
              <h3>Add Contacts</h3>
              <div className="search">
                <div className="formItem">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div
              id="scrollableDiv"
              className="mt-4 overflow-y-auto"
              style={{ height: '50vh' }}
            >
              <TableList
                isLoading={isLoading}
                data={sortedContactRows}
                headers={TableHeaders}
                checkboxValues={selectedContacts}
                handleCheckboxValue={(row) => row.id}
                handleCheckbox={setSelectedContacts}
                selectOptions={contactRoles}
                selectValues={selectedRoles}
                setSelectValues={setselectedRoles}
              />
              <InfiniteScroll
                dataLength={Object.values(sortedContactRows).length} //This is important field to render the next data
                next={() => {
                  console.log();
                  fetchData(pageNumber + 1);
                }}
                hasMore={true}
                loader={
                  loader ? (
                    <div className="text-center">
                      <SvgComponent name={'Down'} />
                    </div>
                  ) : null
                }
                scrollableTarget="scrollableDiv"
              ></InfiniteScroll>
            </div>

            <div className="buttons d-flex align-items-center justify-content-between mt-4">
              <button
                className="btn btn-md btn-primary"
                onClick={fetchAllVolunteerContacts}
              >
                Refresh
              </button>
              <div>
                <button
                  className="btn btn-link"
                  onClick={() => {
                    if (
                      selectedContacts?.length > 0 ||
                      Object.keys(selectedRoles)?.length > 0
                    ) {
                      setCloseModal(true);
                    } else {
                      setAddContactsModal(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  className="btn btn-md btn-primary"
                  onClick={submitContacts}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {createContactsModal && (
        <CreateContactModal
          createContactsModal={createContactsModal}
          setCreateContactsModal={setCreateContactsModal}
        />
      )}

      {closeModal === true ? (
        <CancelModalPopUp
          title="Confirmation"
          message="Unsaved changes will be lost, do you wish to proceed?"
          modalPopUp={closeModal}
          isNavigate={false}
          setModalPopUp={setCloseModal}
          onConfirm={() => {
            if (isNavigate) {
              navigate(-1);
            }
          }}
          methodsToCall={true}
          methods={() => {
            setAddContactsModal(false);
          }}
        />
      ) : null}
    </div>
  );
}

export default AccountUpsert;
