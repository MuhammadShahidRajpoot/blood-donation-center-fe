import React, { useEffect, useRef, useState } from 'react';
import styles from './accounts.module.scss';
import SuccessPopUpModal from '../../common/successModal';
import ConfirmModal from '../../common/confirmModal';
import SelectDropdown from '../../common/selectDropdown';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import WarningIcon from '../../../assets/images/warningIcon.png';
import CancelIconImage from '../../../assets/images/ConfirmCancelIcon.png';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../common/form/FormInput';
import {
  checkAddressValidation,
  formatPhoneNumber,
  removeCountyWord,
  replaceSpecialCharacters,
} from '../../../helpers/utils';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';
import { ADDRESS_VALIDATION_ERROR } from '../../../helpers/constants';
import dayjs from 'dayjs';
import { VolunteerFormSchema } from '../contacts/volunteers/YupSchema';
import { yupResolver } from '@hookform/resolvers/yup';

const CreateContactModal = ({
  createContactsModal,
  setCreateContactsModal,
  setApiToggle,
}) => {
  const { volunteerId: volunteerID } = useParams();
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [duplicateConfirmation, setDuplicateConfirmation] = useState(null);
  const [, setUnsavedChanges] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [prefixes, setPrefixes] = useState([]);
  const [suffixes, setSuffixes] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const closeAfterFinish = useRef(false);
  const [customFields] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datecleared, setDateCleared] = useState(false);
  const [dataEntered, setDataEntered] = useState({
    phone: false,
    email: false,
  });
  const VolunteerSchema = VolunteerFormSchema(customFields);
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(VolunteerSchema),
  });

  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const initialState = {
    prefix_id: '',
    suffix_id: '',
    title: '',
    employee: '',
    first_name: '',
    last_name: '',
    nick_name: '',
    birth_date: null,
    is_archived: '',
    is_active: true,
    created_by: '',
    tenant_id: '',
    mailing_address: '',
    workPhone: '',
    mobPhone: '',
    otherPhone: '',
    workEmail: '',
    homeEmail: '',
    otherEmail: '',
    addressable_id: '',
    addressable_type: '',
    address1: '',
    zip_code: '',
    city: '',
    state: '',
    country: '',
    county: '',
    latitude: '',
    longitude: '',
    coordinates: '',
    contact: [],
    address: {},
  };

  const [addVolunteer, setAddVolunteer] = useState(initialState);

  const [primaryPhone, setPrimaryPhone] = useState(0);
  const [primaryEmail, setPrimaryEmail] = useState(0);

  const [customErrors, setCustomErrors] = useState({});

  // Fetch Volunteer if ID
  const fetchVolunteer = async () => {
    const result = await fetch(`${BASE_URL}/contact-volunteer/${volunteerID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setAddVolunteer(data);
      const mailing_address =
        data?.address?.address1 + ' ' + data?.address?.address2;
      setValue('first_name', data.first_name);
      setValue('last_name', data.last_name);
      setValue('nick_name', data.nick_name);
      setValue('zip_code', data?.address?.zip_code);
      setValue('city', removeCountyWord(data?.address?.city));
      setValue('state', data?.address?.state);
      setValue('country', data?.address?.country);
      setValue('county', removeCountyWord(data?.address?.county));
      setValue('birth_date', dayjs(data.birth_date));
      setValue('mailing_address', mailing_address);
      const workPhone = data.contact.filter(
        (contact) => contact.contact_type === 1
      );
      const mobPhone = data.contact.filter(
        (contact) => contact.contact_type === 2
      );
      const otherPhone = data.contact.filter(
        (contact) => contact.contact_type === 3
      );
      const workEmail = data.contact.filter(
        (contact) => contact.contact_type === 4
      );
      const homeEmail = data.contact.filter(
        (contact) => contact.contact_type === 5
      );
      const otherEmail = data.contact.filter(
        (contact) => contact.contact_type === 6
      );

      // find primary field
      const primaryPhoneField = data.contact.find(
        (contact) =>
          contact.is_primary &&
          contact.contact_type > 0 &&
          contact.contact_type < 4
      );
      const primaryEmailField = data.contact.find(
        (contact) =>
          contact.is_primary &&
          contact.contact_type > 3 &&
          contact.contact_type < 7
      );
      setPrimaryPhone(primaryPhoneField?.contact_type);
      setPrimaryEmail(primaryEmailField?.contact_type - 3);

      setAddVolunteer((prevValue) => ({
        ...prevValue,
        prefix_id: {
          label: data.prefix_id?.abbreviation,
          value: data.prefix_id?.id,
        },
        suffix_id: {
          label: data.suffix_id?.abbreviation,
          value: data.suffix_id?.id,
        },
        workPhone: workPhone.length ? formatPhoneNumber(workPhone[0].data) : '',
        mobPhone: mobPhone.length ? formatPhoneNumber(mobPhone[0].data) : '',
        otherPhone: otherPhone.length
          ? formatPhoneNumber(otherPhone[0].data)
          : '',
        workEmail: workEmail.length ? workEmail[0].data : '',
        homeEmail: homeEmail.length ? homeEmail[0].data : '',
        otherEmail: otherEmail.length ? otherEmail[0].data : '',
      }));
    } else {
      toast.error('Error Fetching Volunteer Details', { autoClose: 3000 });
    }
  };

  // Fetch Prefixes
  const getPrefixes = async () => {
    try {
      const result = await fetch(`${BASE_URL}/prefixes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await result.json();
      setPrefixes(data?.data.records);
    } catch (error) {
      toast.error(`Failed to fetch.`, { autoClose: 3000 });
    }
  };

  // Fetch Suffixes
  const getSuffixes = async () => {
    try {
      const result = await fetch(`${BASE_URL}/suffixes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await result.json();
      setSuffixes(data?.data.records);
    } catch (error) {
      toast.error(`Failed to fetch.`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (datecleared) {
      const timeout = setTimeout(() => {
        setDateCleared(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [datecleared]);
  // UseEffect for map and fetching APIs
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }
    getPrefixes();
    getSuffixes();
    if (volunteerID) {
      fetchVolunteer();
      //   getCustomDataFields();
    }
    // getCustomFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputBlur = (e) => {
    setUnsavedChanges(true);
    const validatePhone = ['workPhone', 'mobPhone', 'otherPhone'];
    const validateEmail = ['workEmail', 'homeEmail', 'otherEmail'];
    let { name, value } = e?.target ? e.target : '';
    let errorMessage = '';
    const setError = (fieldName, errorMsg) => {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: errorMsg,
      }));
    };

    if (validatePhone.includes(name)) {
      const isValidPhoneNumber = phoneRegex.test(value);
      if (value && !isValidPhoneNumber) {
        errorMessage =
          'Please enter a valid phone number in the format (123) 456-7890.';
      }
      setError(name, errorMessage);
    }

    if (validateEmail.includes(name)) {
      const isValidEmail = emailRegex.test(value);
      if (value && !isValidEmail) {
        errorMessage = 'Please enter a valid email.';
      }
      setError(name, errorMessage);
    }

    // Additional logic to check for at least one phone and one email
    const phoneCount = addVolunteer.contact.filter(
      (contact) => contact.contact_type >= 1 && contact.contact_type <= 3
    ).length;
    const emailCount = addVolunteer.contact.filter(
      (contact) => contact.contact_type >= 4 && contact.contact_type <= 6
    ).length;

    if (phoneCount === 0) {
      setError('phone', '');
    } else {
      setError('phone', '');
    }

    if (emailCount === 0) {
      setError('email', '');
    } else {
      setError('email', '');
    }
  };

  const handleFormInput = (e, key) => {
    setUnsavedChanges(true);

    const { value, name, checked } = e.target;
    let fieldValue = checked;
    if (name === 'mailing_address') {
      setValue('longitude', '');
      setValue('latitude', '');
      getPlacePredictions(e.target.value);

      setAddVolunteer((prevData) => ({
        ...prevData,
        mailing_address: e.target.value,
      }));
    } else if (name === 'zip_code') {
      setAddVolunteer((prevData) => ({
        ...prevData,

        zip_code: e.target.value,
      }));
    } else if (name === 'city') {
      setAddVolunteer((prevData) => ({
        ...prevData,
        city: e.target.value,
      }));
    } else if (name === 'state') {
      setAddVolunteer((prevData) => ({
        ...prevData,
        state: e.target.value,
      }));
    } else if (name === 'county') {
      setAddVolunteer((prevData) => ({
        ...prevData,
        county: e.target.value,
      }));
    } else if (name === 'is_active') {
      setAddVolunteer((prevData) => ({
        ...prevData,
        [name]: fieldValue,
      }));
    } else {
      setAddVolunteer((prevData) => ({
        ...prevData,
        [key]: value,
      }));
    }
  };

  //   const handleCancelClick = () => {
  //     if (unsavedChanges) {
  //       setShowConfirmationDialog(true);
  //     } else {
  //       navigate(-1);
  //     }
  //   };

  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(-1);
    }
  };

  const validateContactFields = () => {
    let fields = addVolunteer.contact;
    let phoneExists = false;
    let emailExists = false;
    for (let i = 0; i < fields.length; i++) {
      // for phone fields
      if (fields[i].contact_type > 0 && fields[i].contact_type < 4) {
        if (fields[i].data && fields[i].data.length) {
          phoneExists = true;
          fields[i].data = replaceSpecialCharacters(fields[i].data);
        }
      }
      // for email fields
      if (fields[i].contact_type > 3 && fields[i].contact_type < 7) {
        if (fields[i].data && fields[i].data.length) {
          emailExists = true;
        }
      }
    }

    if (!phoneExists) {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        phone: 'At least one phone number is required.',
      }));
    } else {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        phone: '',
      }));
    }

    if (!emailExists) {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        email: 'At least one email is required.',
      }));
    } else {
      setCustomErrors((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }
  };

  const duplicateConfirmationMessage = () => {
    if (duplicateConfirmation === null) return;

    const contact = `${duplicateConfirmation.first_name} ${duplicateConfirmation.last_name}`;
    let criteria = null;
    if (
      Object.keys(duplicateConfirmation.address).every(
        (key) =>
          duplicateConfirmation.address[key]?.toLowerCase() ===
          duplicateConfirmation.duplicate?.[0]?.[key]?.toLowerCase()
      )
    ) {
      criteria = Object.values(duplicateConfirmation.address)
        .filter((v) => v)
        .join(', ');
    } else if (
      duplicateConfirmation.work_phone?.toLowerCase() ===
      duplicateConfirmation.duplicate?.[0]?.work_phone?.toLowerCase()
    ) {
      criteria = duplicateConfirmation.work_phone;
    } else if (
      duplicateConfirmation.mobile_phone?.toLowerCase() ===
      duplicateConfirmation.duplicate?.[0]?.mobile_phone?.toLowerCase()
    ) {
      criteria = duplicateConfirmation.mobile_phone;
    }

    if (duplicateConfirmation?.duplicate?.length > 1) {
      return (
        <p>
          There are possible duplicates for this record using the same{' '}
          <span className="text-primary">{criteria}</span>.
          <br />
          <br />
          Please click CANCEL to discard this record and be taken to a list of
          possible duplicates for review{' '}
          <span className="text-primary">{contact}</span> or click PROCEED to
          create this new record.
        </p>
      );
    } else {
      return (
        <p>
          A possible duplicate has been found.{' '}
          <span className="text-primary">{contact}</span> at{' '}
          <span className="text-primary">{criteria}</span> already exists.
          <br />
          <br />
          Please click CANCEL to discard this record and be taken to the
          existing record for <span className="text-primary">{contact}</span> or
          click PROCEED to create this new record.
        </p>
      );
    }
  };

  const identifyDuplicates = async (
    first_name,
    last_name,
    fields,
    address = null
  ) => {
    const identifyPayload = {
      first_name: first_name?.trim(),
      last_name: last_name?.trim(),
      volunteer_id: volunteerID,
    };
    if (address) {
      identifyPayload['address'] = {
        address1: address.address1?.trim(),
        address2: address.address2?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zip_code: address.zip_code?.trim(),
      };
    }
    for (const field of fields) {
      if (field.contact_type === 1) {
        identifyPayload['work_phone'] = field.data?.trim();
      } else if (field.contact_type === 2) {
        identifyPayload['mobile_phone'] = field.data?.trim();
      }
    }
    const response = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/contact-volunteer/duplicates/identify`,
      JSON.stringify(identifyPayload)
    );
    const json = await response.json();
    if (volunteerID && response.ok && response.status === 207) {
      await archiveDuplicates();
      return false;
    } else if (!response.ok && response.status === 409) {
      setDuplicateConfirmation({ ...identifyPayload, duplicate: json.data });
      return true;
    } else if (!response.ok) {
      toast.error(json.message.length && json.message[0], { autoClose: 3000 });
    }
    return false;
  };

  const createDuplicates = async (recordId) => {
    if (!duplicateConfirmation || !duplicateConfirmation?.duplicate?.length)
      return;

    await archiveDuplicates();
    const { duplicate = [] } = duplicateConfirmation;
    const response = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/contact-volunteer/duplicates/create-many`,
      JSON.stringify({
        record_id: recordId,
        duplicatable_ids: duplicate
          .map((dup) => dup?.volunteer_id)
          .filter((dupId) => dupId),
      })
    );
    const data = await response.json();
    if (data?.status !== 'success') {
      toast.error('Volunteer duplicate not created.', {
        autoClose: 3000,
      });
      throw Error(data.response);
    }
  };

  const archiveDuplicates = async () => {
    if (!volunteerID) return;

    const response = await makeAuthorizedApiRequest(
      'PATCH',
      `${BASE_URL}/contact-volunteer/duplicates/${volunteerID}/archive`
    );
    const data = await response.json();
    if (data?.status !== 'success') {
      toast.error('Volunteer duplicates are not archived.', {
        autoClose: 3000,
      });
      throw Error(data.response);
    }
  };

  const onSubmit = async (data, e, redirect = true) => {
    try {
      setIsSubmitting(true);
      let fields = addVolunteer.contact;

      if (
        !checkAddressValidation(getValues('longitude'), getValues('latitude'))
      ) {
        toast.error(ADDRESS_VALIDATION_ERROR);
        return;
      }

      for (let i = 0; i < fields.length; i++) {
        // for phone fields
        if (fields[i].contact_type > 0 && fields[i].contact_type < 4) {
          if (fields[i].contact_type === primaryPhone) {
            fields[i]['is_primary'] = true;
          } else {
            fields[i]['is_primary'] = false;
          }
        }
        // for email fields
        if (fields[i].contact_type > 3 && fields[i].contact_type < 7) {
          if (fields[i].contact_type - 3 === primaryEmail) {
            fields[i]['is_primary'] = true;
          } else {
            fields[i]['is_primary'] = false;
          }
        }
      }

      const fieldsData = [];
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

      let body = {
        prefix_id: parseInt(addVolunteer.prefix_id.value),
        suffix_id: parseInt(addVolunteer.suffix_id.value),
        title: addVolunteer.title,
        employee: addVolunteer.employee,
        first_name: data.first_name,
        last_name: data.last_name,
        nick_name: data.nick_name,
        birth_date: data.birth_date.toISOString(),
        is_active: addVolunteer.is_active,
        address: {
          zip_code: data?.zip_code,
          city: data?.city,
          state: data?.state,
          country: data?.country,
          address1: addVolunteer?.address?.address1,
          address2: addVolunteer?.address?.address2,
          addressable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
          county: addVolunteer?.address?.county,
          coordinates: {
            latitude: addVolunteer?.address?.coordinates?.latitue,
            longitude: addVolunteer?.address?.coordinates?.longitude,
          },
          latitude: addVolunteer?.address?.latitude,
          longitude: addVolunteer?.address?.longitude,
          id: volunteerID ? addVolunteer?.address?.id : null,
          addressable_id: volunteerID
            ? addVolunteer?.address?.addressable_id
            : null,
        },
        contact: fields,
      };

      const validatePhoneFields = ['workPhone', 'mobPhone', 'otherPhone'];
      const validateEmailFields = ['workEmail', 'homeEmail', 'otherEmail'];

      let isPhoneValid = customErrors.phone;
      let isAdditionalPhoneValid = true;
      if (isPhoneValid && isPhoneValid.length) {
        isPhoneValid = false;
      } else {
        isPhoneValid = true;
      }

      let isEmailValid = customErrors.email;
      let isAdditionalEmailValid = true;
      if (isEmailValid && isEmailValid.length) {
        isEmailValid = false;
      } else {
        isEmailValid = true;
      }

      for (let i = 0; i < 3; i++) {
        if (
          customErrors[validatePhoneFields[i]] &&
          customErrors[validatePhoneFields[i]].length
        ) {
          isAdditionalPhoneValid = false;
        }
      }
      for (let i = 0; i < 3; i++) {
        if (
          customErrors[validateEmailFields[i]] &&
          customErrors[validateEmailFields[i]].length
        ) {
          isAdditionalEmailValid = false;
        }
      }

      const setError = (fieldName, errorMsg) => {
        setCustomErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]: errorMsg,
        }));
      };

      let address1 = body?.address?.address1;
      let address2 = body?.address?.address2;
      let longitude = body?.address?.longitude;
      let latitude = body?.address?.latitude;

      if ((address1 || address2) && longitude && latitude) {
        setError('addressValidation', '');
      } else {
        setError('addressValidation', 'Please select a valid address');
      }

      if (isPhoneValid && primaryPhone === 0) {
        setError('phone', 'At least one phone number should be primary.');
      } else if (isPhoneValid) {
        setError('phone', '');
      }

      if (isEmailValid && primaryEmail === 0) {
        setError('email', 'At least one email should be primary.');
      } else if (isEmailValid) {
        setError('email', '');
      }

      if (
        primaryPhone !== 0 &&
        primaryEmail !== 0 &&
        (address1 || address2) &&
        longitude &&
        latitude &&
        isPhoneValid &&
        isEmailValid &&
        isAdditionalPhoneValid &&
        isAdditionalEmailValid
      ) {
        if (
          !duplicateConfirmation &&
          (await identifyDuplicates(
            body.first_name,
            body.last_name,
            fields,
            body.address
          ))
        ) {
          return;
        }
        setIsSubmitting(true);
        if (volunteerID) {
          try {
            const response = await makeAuthorizedApiRequest(
              'PUT',
              `${BASE_URL}/contact-volunteer/${volunteerID}`,
              JSON.stringify(body)
            );
            if (!response.ok) {
              // Handle non-successful response (e.g., show an error message)
              const errorData = await response.json();
              const errorMessage = Array.isArray(errorData?.message)
                ? errorData?.message[0]
                : errorData?.message;
              toast.error(`${errorMessage}`, { autoClose: 3000 });
              return; // Exit the function on error
            }

            const data = await response.json();

            if (data?.status === 201) {
              // Handle successful response
              await createDuplicates(volunteerID);
              setModalPopUp(true);
            } else {
              // Handle other response status codes (if needed)
              const showMessage = Array.isArray(data?.message)
                ? data?.message[0]
                : data?.message;
              toast.error(`${showMessage}`, { autoClose: 3000 });
            }
          } catch (error) {
            console.error('API request error:', error);
            toast.error(`${error?.message}`, { autoClose: 3000 });
          }
        } else {
          try {
            const response = await makeAuthorizedApiRequest(
              'POST',
              `${BASE_URL}/contact-volunteer`,
              JSON.stringify(body)
            );

            if (!response.ok) {
              // Handle non-successful response (e.g., show an error message)
              const errorData = await response.json();
              const errorMessage = Array.isArray(errorData?.message)
                ? errorData?.message[0]
                : errorData?.message;
              toast.error(`${errorMessage}`, { autoClose: 3000 });
              return; // Exit the function on error
            }

            const data = await response.json();

            if (data?.status === 201) {
              await createDuplicates(data?.data?.id);
              setModalPopUp(true);
              setApiToggle(true);
            } else if (data?.status_code === 404) {
              toast.error(`${data?.response}`, { autoClose: 3000 });
            } else {
              // Handle other response status codes (if needed)
              const showMessage = Array.isArray(data?.message)
                ? data?.message[0]
                : data?.message;
              toast.error(`${showMessage}`, { autoClose: 3000 });
            }
          } catch (error) {
            console.error('API request error:', error);
            toast.error(`${error?.message}`, { autoClose: 3000 });
          }
        }
        setDuplicateConfirmation(null);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error creating volunteer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ADDRESSES
  const getPlacePredictions = (input) => {
    const autocompleteService =
      new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'us' },
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const getPlaceDetails = (address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const place = results[0];
          setAddVolunteer((prevData) => {
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
            setValue('county', removeCountyWord(county));

            setValue('longitude', place.geometry.location.lng().toString());
            setValue('latitude', place.geometry.location.lat().toString());

            const updatedAddress = {
              address1: getAddressComponent(place, 'street_number'),
              address2: getAddressComponent(place, 'route'),
              zip_code: getAddressComponent(place, 'postal_code'),
              city: city || county,
              state: getAddressComponent(place, 'administrative_area_level_1'),
              county: county,
              country: getAddressComponent(place, 'country'),
              coordinates: {
                latitude: place.geometry.location.lat().toString(),
                longitude: place.geometry.location.lng().toString(),
              },
              latitude: place.geometry.location.lat().toString(),
              longitude: place.geometry.location.lng().toString(),
            };
            const mailing_address =
              `${updatedAddress.address1} ${updatedAddress.address2}`.trim();
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

            if (volunteerID) {
              return {
                ...prevData,
                address: {
                  ...updatedAddress,
                  id: addVolunteer?.address?.id,
                  addressable_id: addVolunteer?.address?.addressable_id,
                },
              };
            } else {
              return {
                ...prevData,
                address: {
                  ...updatedAddress,
                },
              };
            }
          });
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
      getPlaceDetails();
    }
  }

  // ADDRESSES

  // CONTACTS

  function handleContactInput(updatedContactType, updatedValue, type, value) {
    let prev = addVolunteer;
    if (updatedContactType === 1) {
      prev = { ...prev, workPhone: updatedValue };
    }
    if (updatedContactType === 2) {
      prev = { ...prev, mobPhone: updatedValue };
    }
    if (updatedContactType === 3) {
      prev = { ...prev, otherPhone: updatedValue };
    }
    if (updatedContactType === 4) {
      prev = { ...prev, workEmail: updatedValue };
    }
    if (updatedContactType === 5) {
      prev = { ...prev, homeEmail: updatedValue };
    }
    if (updatedContactType === 6) {
      prev = { ...prev, otherEmail: updatedValue };
    }
    const existingContactIndex = prev.contact.findIndex(
      (contact) => contact.contact_type === updatedContactType
    );

    if (existingContactIndex !== -1) {
      // If the updated value is empty, remove the contact object
      if (updatedValue === '') {
        if (type === 'phone' && value === primaryPhone) {
          setPrimaryPhone(0);
        }
        if (type === 'email' && value === primaryEmail) {
          setPrimaryEmail(0);
        }
        const updatedContactArray = [...prev.contact];
        updatedContactArray.splice(existingContactIndex, 1);

        setAddVolunteer({
          ...prev,
          contact: updatedContactArray,
        });
      } else {
        if (type === 'phone') {
          if (primaryPhone === 0) {
            setPrimaryPhone(value);
          }
        }
        if (type === 'email') {
          if (primaryEmail === 0) {
            setPrimaryEmail(value);
          }
        }

        // If a contact with the same contact_type exists and the value is not empty, update it

        setAddVolunteer({
          ...prev,
          contact: prev.contact.map((contact, index) =>
            index === existingContactIndex
              ? {
                  ...contact,
                  contactable_id: contact.contactable_id,
                  contactable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
                  contact_type: updatedContactType,
                  data: updatedValue,
                  is_archived: false,
                }
              : contact
          ),
        });
      }
    } else {
      // If a contact with the same contact_type doesn't exist and the value is not empty, add a new one
      if (updatedValue === '') {
        if (type === 'phone') {
          setPrimaryPhone(0);
        }
        if (type === 'email') {
          setPrimaryEmail(0);
        }
        setAddVolunteer(prev); // No change if the value is empty
      } else {
        if (type === 'phone') {
          if (primaryPhone === 0) {
            setPrimaryPhone(value);
          }
        }
        if (type === 'email') {
          if (primaryEmail === 0) {
            setPrimaryEmail(value);
          }
        }

        const updatedContactArray = [
          ...prev.contact,
          {
            contactable_id: parseInt(volunteerID),
            contactable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
            contact_type: updatedContactType,
            data: updatedValue,
            is_archived: false,
          },
        ];

        // Automatically set the primary flag to true for the first time data is entered
        const section = Math.floor((updatedContactType - 1) / 3) + 1;
        if (!dataEntered[getSectionKey(section)]) {
          setDataEntered((prevDataEntered) => ({
            ...prevDataEntered,
            [getSectionKey(section)]: true,
          }));
        }
        setAddVolunteer({
          ...prev,
          contact: updatedContactArray,
        });
      }
    }
  }

  function getSectionKey(section) {
    return section === 1 ? 'phone' : 'email';
  }

  function handlePrimaryChange(type, value) {
    if (type === 'phone') {
      const field = addVolunteer.contact.find(
        (item) => item.contact_type === value
      );
      if (field && field.data.length) {
        setPrimaryPhone(value);
      }
    }
    if (type === 'email') {
      const field = addVolunteer.contact.find(
        (item) => item.contact_type - 3 === value
      );
      if (field && field.data.length) {
        setPrimaryEmail(value);
      }
    }
  }

  const resetForm = () => {
    reset();
    setAddVolunteer(initialState);
    setPrimaryEmail(0);
    setPrimaryPhone(0);
    setCreateContactsModal(false);
  };
  return (
    <section
      className={`aboutAccountMain popup full-section ${
        createContactsModal ? 'active' : ''
      }`}
    >
      <div
        className={`popup-inner ${styles.popupStyle} ${styles.modalPadding}`}
        style={{ width: '800px', marginTop: '65px' }}
      >
        <div className="content text-start">
          <div
            style={{ marginTop: '15px' }}
            className="buttons d-flex align-items-center justify-content-between"
          >
            <div>
              <div className="mainContent">
                <form
                  className={styles.account}
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="d-flex align-items-center justify-between p-3">
                    <h3>Add Contact</h3>
                  </div>
                  <div style={{ height: '65vh', overflowY: 'scroll' }}>
                    <div className="formGroup w-auto border-0 p-3 mb-0">
                      <SelectDropdown
                        placeholder={'Prefix'}
                        name="prefix_id"
                        searchable={true}
                        defaultValue={addVolunteer.prefix_id}
                        selectedValue={addVolunteer.prefix_id}
                        removeDivider
                        showLabel={
                          addVolunteer.prefix_id !== null &&
                          addVolunteer.prefix_id !== ''
                            ? true
                            : false
                        }
                        onChange={(value) => {
                          handleFormInput(
                            { target: { name: 'prefix_id', value: value } },
                            'prefix_id'
                          );
                        }}
                        onBlur={(e) => {
                          handleInputBlur(e);
                        }}
                        options={prefixes.map((item, index) => ({
                          label: item.abbreviation,
                          value: item.id,
                        }))}
                      />
                      {customErrors.prefix_id && (
                        <div className="error">
                          <p>{customErrors.prefix_id}</p>
                        </div>
                      )}

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="first_name"
                            control={control}
                            defaultValue={addVolunteer.first_name}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  maxLength={50}
                                  className="form-control"
                                  onChange={setUnsavedChanges(true)}
                                  {...field}
                                />
                                <label>First Name*</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.first_name && (
                          <div className="error">
                            <div className="error">
                              <p>{errors.first_name.message}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <SelectDropdown
                        placeholder={'Suffix'}
                        name="suffix_id"
                        searchable={true}
                        defaultValue={addVolunteer.suffix_id}
                        selectedValue={addVolunteer.suffix_id}
                        removeDivider
                        showLabel={
                          addVolunteer.suffix_id !== null &&
                          addVolunteer.suffix_id !== ''
                            ? true
                            : false
                        }
                        onChange={(value) => {
                          handleFormInput(
                            { target: { name: 'suffix_id', value: value } },
                            'suffix_id'
                          );
                        }}
                        onBlur={(e) => {
                          handleInputBlur(e);
                        }}
                        options={suffixes.map((item, index) => ({
                          label: item.abbreviation,
                          value: item.id,
                        }))}
                      />
                      {customErrors.suffix_id && (
                        <div className="error">
                          <p>{customErrors.suffix_id}</p>
                        </div>
                      )}

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="last_name"
                            control={control}
                            defaultValue={addVolunteer.last_name}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  maxLength={50}
                                  className="form-control"
                                  onChange={setUnsavedChanges(true)}
                                  {...field}
                                />
                                <label>Last Name*</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.last_name && (
                          <div className="error">
                            <div className="error">
                              <p>{errors.last_name.message}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="nick_name"
                            control={control}
                            defaultValue={addVolunteer.nick_name}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  maxLength={50}
                                  className="form-control"
                                  onChange={setUnsavedChanges(true)}
                                  {...field}
                                />
                                <label>Nickname</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.nick_name && (
                          <div className="error">
                            <div className="error">
                              <p>{errors.nick_name.message}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className={`field form-datepicker ${styles.dob}`}>
                          <Controller
                            name="birth_date"
                            control={control}
                            defaultValue={addVolunteer.birth_date}
                            render={({ field }) => (
                              <>
                                <DatePicker
                                  onChange={(date) => field.onChange(date)}
                                  label="Date of birth*"
                                  value={field.value}
                                  sx={{ width: 260 }}
                                  disableFuture
                                  slotProps={{
                                    field: {
                                      clearable: true,
                                      onClear: () => setDateCleared(true),
                                    },
                                  }}
                                  className="w-100"
                                />
                                <label
                                  className={`text-secondary ${styles.labelselected}`}
                                >
                                  {/* Date of Birth* */}
                                </label>
                              </>
                            )}
                          />
                        </div>
                        {errors.birth_date && (
                          <div className="error">
                            <div className="error">
                              <p>{errors.birth_date.message}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <input
                            type="text"
                            className="form-control"
                            placeholder=" "
                            value={addVolunteer.employee}
                            name="employee"
                            onBlur={handleInputBlur}
                            onChange={(e) => {
                              handleFormInput(e, 'employee');
                              handleInputBlur(e);
                            }}
                          />
                          <label>Employer</label>
                        </div>
                        {customErrors.employee && (
                          <div className="error">
                            <p>{customErrors.employee}</p>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <input
                            type="text"
                            className="form-control"
                            placeholder=" "
                            value={addVolunteer.title}
                            name="title"
                            onBlur={handleInputBlur}
                            onChange={(e) => {
                              handleFormInput(e, 'title');
                              handleInputBlur(e);
                            }}
                          />
                          <label>Title</label>
                        </div>
                        {customErrors.title && (
                          <div className="error">
                            <p>{customErrors.title}</p>
                          </div>
                        )}
                      </div>

                      {/* MAILING ADDRESS */}
                      <div className="form-field w-100">
                        <div className="field">
                          <Controller
                            name="mailing_address"
                            control={control}
                            defaultValue={addVolunteer.mailing_address}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  {...field}
                                  onBlur={(e) => {
                                    field.onBlur(e);
                                    handleInputBlur();
                                  }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFormInput(e, 'mailing_address');
                                    handleInputBlur(e);
                                  }}
                                  onKeyDown={handleKeyPress}
                                />
                                <label>Mailing Address*</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.mailing_address && (
                          <div className="error">
                            <p>{errors.mailing_address.message}</p>
                          </div>
                        )}
                        {customErrors.addressValidation && (
                          <div className="error">
                            <p>{customErrors.addressValidation}</p>
                          </div>
                        )}
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
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="zip_code"
                            control={control}
                            defaultValue={addVolunteer.zip_code}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  className="form-control"
                                  maxLength={20}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFormInput(e, 'zip_code');
                                    handleInputBlur(e);
                                  }}
                                />
                                <label>Zip Code</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.zip_code && (
                          <div className="error">
                            <p>{errors.zip_code.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="city"
                            control={control}
                            defaultValue={addVolunteer.city}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  className="form-control"
                                  maxLength={20}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFormInput(e, 'city');
                                    handleInputBlur(e);
                                  }}
                                />
                                <label>City</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.city && (
                          <div className="error">
                            <p>{errors.city.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="state"
                            control={control}
                            defaultValue={addVolunteer.state}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  className="form-control"
                                  maxLength={20}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFormInput(e, 'state');
                                    handleInputBlur(e);
                                  }}
                                />
                                <label>State</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.state && (
                          <div className="error">
                            <p>{errors.state.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="form-field">
                        <div className="field">
                          <Controller
                            name="county"
                            control={control}
                            defaultValue={addVolunteer.county}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  placeholder=" "
                                  className="form-control"
                                  maxLength={20}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleFormInput(e, 'county');
                                    handleInputBlur(e);
                                  }}
                                />
                                <label>County</label>
                              </>
                            )}
                          />
                        </div>
                        {errors.county && (
                          <div className="error">
                            <p>{errors.county.message}</p>
                          </div>
                        )}
                      </div>

                      {/* MAILING ADDRESS */}
                    </div>

                    <div className="formGroup w-auto border-0 p-3 ">
                      <h5 style={{ marginBottom: '5px' }}>Contact Info</h5>
                      <p className="w-100 mb-3" style={{ fontSize: '12px' }}>
                        At least one phone number and email required
                      </p>

                      <h5 className="contact-heading mb-3 w-100">Phone</h5>
                      <div className="form-field">
                        <FormInput
                          classes={{ root: 'w-100 mb-0' }}
                          label="Work Phone"
                          name="workPhone"
                          variant="phone"
                          displayName="Work Phone"
                          value={addVolunteer.workPhone}
                          onChange={(e) => {
                            handleContactInput(1, e.target.value, 'phone', 1);
                          }}
                          error={customErrors.workPhone}
                          required={false}
                          onBlur={handleInputBlur}
                        />
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="primary"
                            id="phone"
                            checked={primaryPhone === 1}
                            className="form-check-input contact-radio"
                            onChange={() => handlePrimaryChange('phone', 1)}
                          />{' '}
                          Primary
                        </p>
                      </div>

                      <div className="form-field">
                        <FormInput
                          classes={{ root: 'w-100 mb-0' }}
                          label="Mobile Phone"
                          name="mobPhone"
                          variant="phone"
                          displayName="Mobile Phone"
                          value={addVolunteer.mobPhone}
                          onChange={(e) => {
                            handleContactInput(2, e.target.value, 'phone', 2);
                          }}
                          error={customErrors.mobPhone}
                          required={false}
                          onBlur={handleInputBlur}
                        />
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="primary"
                            id="phone"
                            className="form-check-input contact-radio"
                            checked={primaryPhone === 2}
                            onChange={() => handlePrimaryChange('phone', 2)}
                          />{' '}
                          Primary
                        </p>
                      </div>

                      <div className="form-field">
                        <FormInput
                          classes={{ root: 'w-100 mb-0' }}
                          label="Other Phone"
                          name="otherPhone"
                          variant="phone"
                          displayName="Other Phone"
                          value={addVolunteer.otherPhone}
                          onChange={(e) => {
                            handleContactInput(3, e.target.value, 'phone', 3);
                          }}
                          error={customErrors.otherPhone}
                          required={false}
                          onBlur={handleInputBlur}
                        />
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="primary"
                            id="phone"
                            className="form-check-input contact-radio"
                            checked={primaryPhone === 3}
                            onChange={() => handlePrimaryChange('phone', 3)}
                          />{' '}
                          Primary
                        </p>
                        {customErrors.phone && (
                          <div className="error w-100">
                            <div className="error">
                              <p>{customErrors.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <h5 className="contact-heading mb-3 w-100">Email</h5>
                      <div className="form-field">
                        <div className="field">
                          <input
                            type="text"
                            className="form-control"
                            value={addVolunteer.workEmail}
                            name="workEmail"
                            maxLength={50}
                            onBlur={handleInputBlur}
                            placeholder=" "
                            onChange={(e) => {
                              handleContactInput(4, e.target.value, 'email', 1);
                            }}
                          />

                          <label>Work Email</label>
                        </div>
                        {customErrors.workEmail && (
                          <div className="error">
                            <div className="error">
                              <p>{customErrors.workEmail}</p>
                            </div>
                          </div>
                        )}
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="emailPrimary"
                            id="phone"
                            className="form-check-input contact-radio"
                            checked={primaryEmail === 1}
                            onChange={() => handlePrimaryChange('email', 1)}
                          />{' '}
                          Primary
                        </p>
                      </div>
                      <div className="form-field">
                        <div className="field">
                          <input
                            type="text"
                            className="form-control"
                            value={addVolunteer.homeEmail}
                            name="homeEmail"
                            onBlur={handleInputBlur}
                            placeholder=" "
                            onChange={(e) => {
                              handleContactInput(5, e.target.value, 'email', 2);
                            }}
                          />

                          <label>Home Email</label>
                        </div>
                        {customErrors.homeEmail && (
                          <div className="error">
                            <div className="error">
                              <p>{customErrors.homeEmail}</p>
                            </div>
                          </div>
                        )}
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="emailPrimary"
                            maxLength={50}
                            id="phone"
                            className="form-check-input contact-radio"
                            checked={primaryEmail === 2}
                            onChange={() => handlePrimaryChange('email', 2)}
                          />{' '}
                          Primary
                        </p>
                      </div>
                      <div className="form-field">
                        <div className="field">
                          <input
                            type="text"
                            className="form-control"
                            value={addVolunteer.otherEmail}
                            name="otherEmail"
                            onBlur={handleInputBlur}
                            placeholder=" "
                            onChange={(e) => {
                              handleContactInput(6, e.target.value, 'email', 3);
                            }}
                          />

                          <label>Other Email</label>
                        </div>
                        {customErrors.otherEmail && (
                          <div className="error">
                            <div className="error">
                              <p>{customErrors.otherEmail}</p>
                            </div>
                          </div>
                        )}
                        <p
                          className="radio-label"
                          style={{ color: '#2d2d2e', fontSize: '12px' }}
                        >
                          <input
                            type="radio"
                            name="emailPrimary"
                            maxLength={50}
                            id="phone"
                            className="form-check-input contact-radio"
                            checked={primaryEmail === 3}
                            onChange={() => handlePrimaryChange('email', 3)}
                          />{' '}
                          Primary
                        </p>

                        {customErrors.email && (
                          <div className="error w-100">
                            <div className="error">
                              <p>{customErrors.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'end',
                      padding: '20px',
                    }}
                  >
                    <button
                      className="btn btn-link"
                      onClick={() => setCreateContactsModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-md btn-primary"
                      onClick={(e) => {
                        closeAfterFinish.current = true;
                        handleSubmit(e);
                        validateContactFields();
                      }}
                    >
                      Submit
                    </button>
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
                      <p>
                        Unsaved changes will be lost. Do you want to continue?
                      </p>
                      <div className="buttons">
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleConfirmationResult(false)}
                          type="button"
                        >
                          No
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleConfirmationResult(true)}
                          type="button"
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
                <SuccessPopUpModal
                  title={'Success!'}
                  message={'Contact created.'}
                  modalPopUp={modalPopUp}
                  setModalPopUp={setModalPopUp}
                  showActionBtns={true}
                  onConfirm={() => {
                    if (closeAfterFinish.current) {
                      setCreateContactsModal(false);
                    }
                  }}
                />
                <ConfirmModal
                  showConfirmation={duplicateConfirmation !== null}
                  onCancel={() => resetForm}
                  onConfirm={() => {
                    onSubmit(getValues());
                    setCreateContactsModal(false);
                  }}
                  icon={WarningIcon}
                  classes={{
                    inner: styles.duplicatePopup,
                    btnGroup: 'gap-4',
                    btn: 'w-50',
                  }}
                  disabled={isSubmitting}
                  cancelBtnText="Cancel"
                  confirmBtnText="Proceed"
                  heading={'Warning!'}
                  description={duplicateConfirmationMessage()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateContactModal;
