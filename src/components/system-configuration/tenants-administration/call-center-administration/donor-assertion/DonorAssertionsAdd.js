import React, { useState, useEffect } from 'react';
import jwt from 'jwt-decode';
import TopBar from '../../../../common/topbar/index';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import FormInput from '../../../../common/form/FormInput';
import FormText from '../../../../common/form/FormText';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import './index.module.scss';
import { DonorAssertionsBreadCrumbsDataCreateEdit } from '../donor-assertion/DonorAssertionsBreadCrumbsData';

const AddDonorAssertions = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    expirationPeriod: '',
    description: '',
    isExpire: true,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState('');
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  useEffect(() => {
    getLoginUserId();
  }, []);

  const getLoginUserId = () => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setUserId(decodeToken?.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    console.log('isValid --', isValid);
    if (isValid) {
      const body = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        is_active: formData.isActive,
        is_expired: formData.isExpire,
        expiration_months: formData.isExpire
          ? parseInt(formData.expirationPeriod, 10)
          : null,
        is_archived: false,
        created_by: +userId,
      };

      try {
        const res = await makeAuthorizedApiRequestAxios(
          'POST',
          `${BASE_URL}/call-center/assertions`,
          JSON.stringify(body)
        );
        let { status_code, response } = res.data;

        if (status_code === 201) {
          setModalPopUp(true);
        } else {
          toast.error(response, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
  };

  const fieldNames = [
    {
      label: 'Name',
      name: 'name',
      required: true,
      maxLength: 50,
    },
    {
      label: 'Code',
      name: 'code',
      required: true,
      maxLength: 20,
    },
    {
      label: 'Expiration Period (Months)',
      name: 'expirationPeriod',
      required: false,
      maxLength: 20,
    },
    {
      label: 'Description',
      name: 'description',
      required: true,
      maxLength: 500,
    },
    {
      label: 'Expires',
      name: 'isExpire',
      required: false,
      maxLength: 20,
    },
    {
      label: 'Active/Inactive',
      name: 'isActive',
      required: false,
      maxLength: 20,
    },
  ];

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    fieldNames.forEach((fieldName) => {
      const value = formData[fieldName.name];
      const fieldDefinition = fieldNames.find(
        (field) => field.name === fieldName.name
      );
      let errorMessage = '';

      if (
        fieldDefinition?.required &&
        (value?.toString().trim() === '' || value === null)
      ) {
        errorMessage = `${fieldDefinition.label} is required.`;
      }

      if (
        fieldDefinition?.maxLength &&
        value?.length > fieldDefinition?.maxLength
      ) {
        errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed.`;
      }

      if (fieldName.name === 'code' && value && !/^[A-Z0-9]*$/.test(value)) {
        errorMessage =
          'Code should have all capital letters and numbers without special characters.';
      }

      if (
        fieldName.name === 'expirationPeriod' &&
        formData.isExpire &&
        (value < 1 || value > 240 || isNaN(value))
      ) {
        errorMessage =
          'Expiration Period must be Number and between 1 and 240.';
      }

      if (errorMessage === '') {
        newErrors[fieldName.name] = '';
      } else {
        newErrors[fieldName.name] = errorMessage;
        isValid = false;
      }
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...newErrors,
    }));

    return isValid;
  };

  const chekCodeExistence = () => {};

  const handleInputChange = (e) => {
    let { name, value, type } = e.target;

    if (type == 'checkbox') {
      value = !formData[name];
    }

    let errorMessage = '';

    const fieldDefinition = fieldNames.find((field) => field.name === name);

    if (fieldDefinition?.required && value.trim() === '') {
      errorMessage = `${fieldDefinition.label} is required.`;
    }

    if (
      fieldDefinition?.maxLength &&
      value.length > fieldDefinition.maxLength
    ) {
      errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed.`;
    }

    if (name === 'code') {
      const codeExist = chekCodeExistence();
      if (codeExist) {
        errorMessage = 'Code already exist.';
      }
    }

    if (name === 'code' && value && !/^[A-Z0-9]*$/.test(value)) {
      errorMessage =
        'Code should have all capital letters and numbers without special characters.';
    }

    if (
      name === 'expirationPeriod' &&
      (value < 1 || value > 240 || isNaN(value))
    ) {
      errorMessage = 'Expiration Period must be Number and between 1 and 240.';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const BreadcrumbsData = [
    ...DonorAssertionsBreadCrumbsDataCreateEdit,
    {
      label: 'Create Donor Assertion',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/call-center-admin/donor-assertions/create',
    },
  ];

  let canceFormData = {
    code: '',
    name: '',
    expirationPeriod: '',
    description: '',
    isExpire: true,
    isActive: true,
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Call Outcomes'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form className={styles.formcontainer}>
          <div className="formGroup pb-4">
            <h5>Create Donor Assertions</h5>
            <FormInput
              label="Name"
              displayName="Name"
              name="name"
              error={errors?.name}
              required
              value={formData?.name}
              onChange={handleInputChange}
            />
            <FormInput
              label="Code"
              displayName="Code"
              name="code"
              error={errors?.code}
              value={formData?.code}
              onChange={handleInputChange}
              required
            />
            <FormText
              name="description"
              displayName="Description"
              value={formData?.description}
              error={errors?.description}
              classes={{ root: 'w-100' }}
              required
              onChange={handleInputChange}
            />
            <div className={`${styles.testClass}`}>
              <FormCheckbox
                name="isExpire"
                displayName="Expires"
                checked={formData.isExpire}
                value={formData.isExpire}
                type="checkbox"
                required={false}
                classes={{
                  root: `mt-2 mb-4 ${styles.customCheckbox}`,
                }}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ width: '100%' }}>
              {formData.isExpire && (
                <FormInput
                  label="expiration-period"
                  displayName="Expiration Period (Months)"
                  name="expirationPeriod"
                  error={errors?.expirationPeriod}
                  required={false}
                  value={formData?.expirationPeriod}
                  onChange={handleInputChange}
                />
              )}
            </div>
            <div className="form-field checkbox" style={{ paddingTop: '20px' }}>
              <span className="toggle-text fw-500">Active/Inactive</span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>
        <div className="form-footer">
          <p
            className={`mb-0 simple-text btn`}
            onClick={(e) => {
              e.preventDefault();
              if (
                Object.keys(formData).some(
                  (key) => formData[key] !== canceFormData[key]
                )
              ) {
                setCloseModal(true);
              }
            }}
          >
            Cancel
          </p>

          <button
            type="button"
            className={`btn btn-md ${'btn-primary'}`}
            onClick={(e) => handleSubmit(e)}
          >
            Create
          </button>

          <SuccessPopUpModal
            title="Success!"
            message="Donor Assertion Created."
            modalPopUp={modalPopUp}
            isNavigate={true}
            setModalPopUp={setModalPopUp}
            showActionBtns={true}
            redirectPath={
              '/system-configuration/tenant-admin/call-center-admin/donnor-assertions/list'
            }
          />
          <CancelModalPopUp
            title="Confirmation"
            message="Unsaved changes will be lost. Do you want to continue?"
            modalPopUp={closeModal}
            isNavigate={true}
            setModalPopUp={setCloseModal}
            redirectPath={
              '/system-configuration/tenant-admin/call-center-admin/donnor-assertions/list'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AddDonorAssertions;
