import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
// import jwt from 'jwt-decode';
import TopBar from '../../../../common/topbar/index';
import styles from './index.module.scss';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import FormInput from '../../../../common/form/FormInput';
import FormText from '../../../../common/form/FormText';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import { DonorAssertionsBreadCrumbsDataCreateEdit } from './DonorAssertionsBreadCrumbsData';
import { compareAndSetCancel } from '../../../../../helpers/compareAndSetCancel';

const EditDonorAssertions = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const params = useParams();
  const location = useLocation();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    expirationPeriod: '',
    description: '',
    isExpire: true,
    isActive: true,
  });

  const [modalPopUp, setModalPopUp] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState(false);
  const [compareData, setCompareData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
  });

  const BreadcrumbsData = [
    ...DonorAssertionsBreadCrumbsDataCreateEdit,
    {
      label: 'Edit Donor Assertions',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/call-center-admin/donor-assertions/:id/edit`,
    },
  ];

  const getAssertionData = async () => {
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/call-center/assertions/${params.id}`
    );
    const data = result.data;

    const addAssertionUpdates = {
      name: data?.data?.name,
      code: data?.data?.code.toString(),
      expirationPeriod: data?.data?.expiration_months,
      description: data?.data?.description,
      isExpire: data?.data?.is_expired,
      isActive: data?.data?.is_active,
    };
    setIsDefault(data?.data?.is_default);
    setFormData(addAssertionUpdates);
    setCompareData(addAssertionUpdates);
  };

  useEffect(() => {
    // const jwtToken = localStorage.getItem('token');
    // if (jwtToken) {
    //   // setToken(jwtToken);
    //   const decodeToken = jwt(jwtToken);
    //   if (decodeToken?.id) {
    //     //setId(decodeToken?.id);
    //   }
    // }
    getAssertionData();
  }, []);

  const handleSubmit = async (e) => {
    const isValid = validateForm();

    if (isValid) {
      const body = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        expiration_months: parseInt(formData.expirationPeriod, 10),
        is_active: formData.isActive,
        is_expired: formData.isExpire,
        is_archived: isArchived,
      };
      try {
        const res = await makeAuthorizedApiRequestAxios(
          'PUT',
          `${BASE_URL}/call-center/assertions/${params.id}`,
          JSON.stringify(body)
        );
        let { status_code, response } = res.data;

        if (status_code === 200) {
          setModalPopUp(true);
          getAssertionData();
          compareAndSetCancel(
            formData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
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

  const handleInputChange = (e) => {
    let { name, value, type } = e.target;
    let errorMessage = '';

    if (type == 'checkbox') {
      value = !formData[name];
    }

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

    const data = {
      ...formData,
      [name]: value,
    };
    setFormData(data);
    compareAndSetCancel(data, compareData, showCancelBtn, setShowCancelBtn);
  };

  const saveAndClose = async () => {
    setIsArchived(false);
    await handleSubmit();
    setIsNavigate(true);
  };
  const saveChanges = async () => {
    setIsArchived(false);
    await handleSubmit();
  };

  const archieveHandle = async () => {
    if (params.id) {
      setModalPopUp(false);
      const body = {
        is_archived: true,
      };
      try {
        const res = await makeAuthorizedApiRequestAxios(
          'PUT',
          //need to update
          `${BASE_URL}/call-center/assertions/${params.id}`,

          JSON.stringify(body)
        );
        const { status, response } = res.data;
        if (status === 'success') {
          setArchiveStatus(true);
        } else {
          toast.error(response, { autoClose: 3000 });
        }
      } catch (error) {
        console.log(error);
        toast.error('Failed to Archive Call Flow.', {
          autoClose: 3000,
        });
      }
    }
  };

  const redirectPath = () => {
    const url =
      '/system-configuration/tenant-admin/call-center-admin/donnor-assertions';
    const urlParams = new URLSearchParams(location.search);
    const page = urlParams.get('page');

    if (isArchived) {
      return `${url}/list`;
    } else {
      switch (page) {
        case 'listing': {
          return `${url}/list`;
        }
        // case 'view': {
        //   return params.id ? `${url}/${params.id}/view` : null;
        // }
        default:
          return null;
      }
    }
  };

  return (
    <div className={`position-relative ${styles.footerminheight}`}>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Donor Assertions'}
          SearchPlaceholder={null}
          SearchValue={null}
          SearchOnChange={null}
        />
        <div className="mainContentInner form-container">
          <form className={`adddevicetype ${styles.formcontainer}`}>
            <div className="formGroup pb-4">
              <h5>Edit Donor Assertions</h5>
              <FormInput
                label="Code"
                displayName="Code"
                name="code"
                error={errors?.code}
                value={formData?.code}
                onChange={handleInputChange}
                disabled={isDefault || formData?.code === 'SLVM'}
                required
              />
              <FormInput
                label="Name"
                displayName="Name"
                name="name"
                error={errors?.name}
                required
                value={formData?.name}
                onChange={handleInputChange}
                onBlur={handleInputChange}
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
              <div
                className="form-field checkbox"
                style={{ paddingTop: '20px' }}
              >
                <span className="toggle-text fw-500">Active/Inactive</span>
                <label htmlFor="toggle" className="switch">
                  <input
                    type="checkbox"
                    id="toggle"
                    className="toggle-input"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    disabled={isDefault || formData.code === 'SLVM'}
                  />

                  <span
                    className="slider round"
                    style={{
                      backgroundColor: isDefault ? 'grey' : '',
                      borderColor: isDefault ? 'grey' : '',
                    }}
                  ></span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="form-footer">
        <>
          {!isDefault && formData.code != 'SLVM' && (
            <div
              className="archived"
              onClick={(e) => {
                e.preventDefault();
                setIsArchived(true);
                setModalPopUp(true);
              }}
            >
              Archive
            </div>
          )}
          {showCancelBtn && (
            <button
              className={`btn simple-text`}
              onClick={(e) => {
                e.preventDefault();
                setCloseModal(true);
              }}
            >
              Cancel
            </button>
          )}
          <button
            className={`btn btn-md btn-secondary`}
            onClick={(e) => {
              e.preventDefault();
              saveAndClose();
            }}
          >
            Save & Close
          </button>
          <button
            type="button"
            className={` ${`btn btn-primary btn-md`}`}
            onClick={(e) => {
              e.preventDefault();
              saveChanges();
            }}
          >
            Save Changes
          </button>
        </>
      </div>
      <SuccessPopUpModal
        title={isArchived ? 'Confirmation' : 'Success!'}
        message={
          isArchived
            ? 'Are you sure you want to archive?'
            : 'Donor Assertion updated.'
        }
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={archieveHandle}
        isNavigate={isNavigate}
        redirectPath={
          !isArchived
            ? '/system-configuration/tenant-admin/call-center-admin/donnor-assertions/list'
            : redirectPath()
        }
      />

      <SuccessPopUpModal
        title="Success!"
        message="Donor Assertion archived."
        modalPopUp={archiveStatus}
        isNavigate={true}
        setModalPopUp={setArchiveStatus}
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
  );
};

export default EditDonorAssertions;
