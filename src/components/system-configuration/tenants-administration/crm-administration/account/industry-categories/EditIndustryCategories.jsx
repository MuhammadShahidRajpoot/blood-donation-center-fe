import React, { useState, useEffect } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CancelIconImage from '../../../../../../assets/images/ConfirmCancelIcon.png';
import ConfirmModal from '../../../../../common/confirmModal';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import SuccessPopUpModal from '../../../../../common/successModal';
import { AccountBreadCrumbsData } from '../AccountBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

const EditIndustryCategories = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minimumOef, setMinimumOef] = useState();
  const [maximumOef, setMaximumOef] = useState();
  const [isActive, setIsActive] = useState(false);
  useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);
  const { id } = useParams();
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    minimum_oef: null,
    maximum_oef: null,
  });

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmation(true);
    } else {
      navigate(
        '/system-configuration/tenant-admin/crm-admin/accounts/industry-categories'
      );
    }
  };

  const handleConfirmationResult = (confirmed) => {
    setShowConfirmation(false);
    if (confirmed) {
      navigate(
        '/system-configuration/tenant-admin/crm-admin/accounts/industry-categories'
      );
    }
  };

  const fieldDefinitions = {
    name: 'Name',
    description: 'Description',
    minimum_oef: 'Minimum OEF',
    maximum_oef: 'Maximum OEF',
  };

  const handleInputBlur = (e, altValue) => {
    setUnsavedChanges(true);
    const { name, value } = e.target;
    const val = altValue || value;
    let errorMessage = '';

    if (val.trim() === '') {
      errorMessage = `${fieldDefinitions[[name]]} is required.`;
    } else if (val.includes('-') || val.includes('+')) {
      errorMessage = 'Negative or positive values are not allowed';
    } else if (!/^\d*\.?\d+$/.test(val)) {
      errorMessage =
        'Invalid decimal format or value must be greater than or equal to zero';
    }

    const setError = (fieldName, errorMsg) => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: errorMsg,
      }));
    };
    switch (name) {
      case 'name':
        if (!value) {
          setError('name', errorMessage);
        } else if (value.length > 50) {
          setError(name, 'Maximum 50 characters are allowed');
        } else {
          setError('name', '');
        }
        break;

      case 'description':
        if (!value) {
          setError('description', errorMessage);
        } else {
          setError('description', '');
        }
        break;

      case 'minimum_oef':
        if (!val) {
          setError('minimum_oef', errorMessage);
        } else if (val < 0) {
          setError('minimum_oef', 'Minimum 0 is required');
        } else if (val > 5) {
          setError('minimum_oef', 'Maximum 5 is required');
        } else if (name === 'minimum_oef' && +val >= 0 && +val <= 5) {
          if (
            parseFloat(val) >= parseFloat(maximumOef) &&
            (maximumOef || parseFloat(maximumOef) === 0)
          ) {
            setError(
              'minimum_oef',
              'Minimum OEF should be less than  or equal to Maximum OEF'
            );
          }
          if (+val <= +maximumOef) {
            setError('minimum_oef', '');
            if (maximumOef || parseFloat(maximumOef) === 0)
              setError('maximum_oef', '');
          }
        } else {
          setError('minimum_oef', '');
        }
        break;

      case 'maximum_oef':
        if (!val) {
          setError('maximum_oef', errorMessage);
        } else if (val < 0) {
          setError('maximum_oef', 'Minimum 0 is required');
        } else if (val > 5) {
          setError('maximum_oef', 'Maximum 5 is required');
        } else if (name === 'maximum_oef' && +val >= 0 && +val <= 5) {
          if (+val <= +minimumOef && minimumOef) {
            setError(
              'maximum_oef',
              'Maximum OEF should be greater than  or equal to Minimum OEF'
            );
          }
          if (+val >= +minimumOef) {
            if (minimumOef || parseFloat(minimumOef) === 0)
              setError('minimum_oef', '');
            setError('maximum_oef', '');
          }
        } else {
          setError('maximum_oef', '');
        }
        break;

      default:
        setError(name, errorMessage);
        break;
    }
  };

  const handleNumberInputChange = (e, setValue) => {
    const input = e.target.value;

    // Allow only digits, one decimal point, and up to two digits after the decimal point
    const sanitizedInput = input.replace(/[^\d.]/g, '');
    const [beforeDecimal, afterDecimal] = sanitizedInput.split('.');

    // Ensure there are at most three digits before the decimal point
    const truncatedBeforeDecimal = beforeDecimal.substring(0, 3);

    let newValue = truncatedBeforeDecimal;

    if (afterDecimal !== undefined) {
      newValue += '.' + afterDecimal.slice(0, 2);
    }
    handleInputBlur(e, newValue);
    setValue(newValue);
  };

  const fetchFormData = async (id) => {
    if (id) {
      const bearerToken = localStorage.getItem('token');
      const result = await fetch(
        `${BASE_URL}/accounts/industry_categories/${id}`,
        { headers: { authorization: `Bearer ${bearerToken}` } }
      );
      let { data, status } = await result.json();
      if (status === 200 && data) {
        data.minimum_oef = Number(data?.minimum_oef).toFixed(2) ?? 0.0;
        data.maximum_oef = Number(data?.maximum_oef).toFixed(2) ?? 0.0;
        setName(data.name);
        setDescription(data.description);
        setIsActive(data.is_active);
        setMinimumOef(data.minimum_oef);
        setMaximumOef(data.maximum_oef);
        setCompareData({
          name: data?.name,
          description: data?.description,
          isActive: data?.is_active,
          minimumOef: data?.minimum_oef,
          maximumOef: data?.maximum_oef,
        });
      } else {
        toast.error('Error Fetching Industry Category Details', {
          autoClose: 3000,
        });
      }
    } else {
      toast.error('Error getting Industry Category Details', {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    setNewFormData({
      name,
      description,
      isActive,
      minimumOef: Number(minimumOef)?.toFixed(2),
      maximumOef: Number(maximumOef)?.toFixed(2),
    });
  }, [name, description, isActive, minimumOef, maximumOef]);

  useEffect(() => {
    compareAndSetCancel(
      newFormData,
      compareData,
      showCancelBtn,
      setShowCancelBtn
    );
  }, [newFormData, compareData]);

  useEffect(() => {
    if (id) {
      fetchFormData(id);
    }

    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const saveChanges = async (e) => {
    await handleSubmit(e);
  };

  const saveAndClose = async (e) => {
    await handleSubmit(e, true);
  };

  const handleSubmit = async (e, redirect = false) => {
    e.preventDefault();

    const errors = {};
    setErrors(errors);

    if (name === '') {
      errors.name = 'Name is required.';
    }
    if (description === '') {
      errors.description = 'Description is required.';
    }
    if (!minimumOef && !(parseFloat(minimumOef) === 0)) {
      errors.minimum_oef = 'Minimum OEF is required.';
    }
    if (!maximumOef && !(parseFloat(maximumOef) === 0)) {
      errors.maximum_oef = 'Maximum OEF is required.';
    }
    if (maximumOef < 0) {
      errors.maximum_oef = 'Minimum 0 is required.';
    }
    if (maximumOef > 5) {
      errors.maximum_oef = 'Maximum 5 is required.';
    }
    if (minimumOef < 0) {
      errors.minimum_oef = 'Minimum 0 is required.';
    }
    if (minimumOef > 5) {
      errors.minimum_oef = 'Maximum 5 is required.';
    }
    if (
      minimumOef &&
      maximumOef &&
      minimumOef <= 5 &&
      +minimumOef > +maximumOef
    ) {
      errors.minimum_oef =
        'Minimum OEF should be less than or equal to Maximum OEF.';
    }
    if (
      minimumOef &&
      maximumOef &&
      maximumOef <= 5 &&
      +maximumOef < +minimumOef
    ) {
      errors.maximum_oef =
        'Maximum OEF should be greater than or equal to Minimum OEF';
    }
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const body = {
        parent_id: null,
        name: name,
        description: description,
        minimum_oef: parseFloat(minimumOef), // Convert to number
        maximum_oef: parseFloat(maximumOef), // Convert to number
        is_active: isActive,
      };
      const bearerToken = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/accounts/industry_categories/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(body),
        }
      );
      let data = await response.json();
      if (data?.status === 204) {
        if (redirect) {
          setShowSuccessModal(true);
        } else {
          setShowSuccessDialog(true);
          compareAndSetCancel(
            newFormData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
        }
        fetchFormData(id);
      } else if (data?.status_code === 400) {
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

  const handleNameChange = (event) => {
    setUnsavedChanges(true);
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setUnsavedChanges(true);
    setDescription(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setUnsavedChanges(true);
    setIsActive(event.target.checked);
  };

  const BreadcrumbsData = [
    ...AccountBreadCrumbsData,
    {
      label: 'Edit Industry Category',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/crm-admin/accounts/industry-categories/${id}/edit`,
    },
  ];

  const archieveHandle = async () => {
    try {
      const res = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/accounts/industry_categories/${id}`
      );
      let { status } = await res.json();
      if (status === 204) {
        setArchiveModal(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
      }
    } catch (error) {
      toast.error(`${error?.data?.resopnse || 'Failed to archive'}`, {
        autoClose: 3000,
      });
    }
    setArchiveModal(false);
  };

  const handleKeyDown = (e, field, setValue) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = parseFloat(field !== '' ? field : 0);
      const step = 0.01;

      let newValue;

      if (e.key === 'ArrowUp') {
        newValue = currentValue + step;
      } else {
        newValue = currentValue - step;
      }

      // Round to 2 decimal places if needed
      newValue = parseFloat(newValue.toFixed(2));

      // Update the form data
      if (newValue >= 0 && newValue <= 5) {
        // Format the value to always have two decimal places
        const formattedValue = newValue.toFixed(2);
        setValue(formattedValue);
      }
    }
  };

  useEffect(() => {
    let firstErrorKey = Object.keys(errors).find((key) => errors[key] !== '');
    console.log({ firstErrorKey });
    if (firstErrorKey) {
      if (firstErrorKey === 'description') {
        firstErrorKey = 'new_description';
      }
      scrollToErrorField({ [firstErrorKey]: errors[firstErrorKey] });
    }
  }, [errors]);

  return (
    <div className={` mainContent`}>
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Industry Categories'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form className="formGroup">
          <div className="formGroup">
            <h5>Edit Industry Category</h5>
            <div className="form-field" name="name">
              <div className="field">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder=" "
                  value={name}
                  required
                  onChange={handleNameChange}
                  onBlur={handleInputBlur}
                  maxLength={50}
                />
                <label>Name*</label>
              </div>
              {errors.name && (
                <div className="error">
                  <p>{errors.name}</p>
                </div>
              )}
            </div>
            <div className="form-field w-100 textarea-new">
              <div className="field" name="new_description">
                <textarea
                  type="text"
                  className="form-control textarea"
                  placeholder=" "
                  name="description"
                  required
                  value={description}
                  onChange={handleDescriptionChange}
                  onBlur={handleInputBlur}
                  maxLength={500}
                />
                <label>Description*</label>
              </div>
              {errors.description && (
                <div className="error">
                  <p>{errors.description}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className="field" name="minimum_oef">
                <input
                  type="number"
                  className="form-control"
                  name="minimum_oef"
                  placeholder=" "
                  required
                  min={1}
                  value={minimumOef}
                  onChange={(e) => {
                    handleNumberInputChange(e, setMinimumOef);
                  }}
                  onBlur={handleInputBlur}
                  onKeyDown={(e) => handleKeyDown(e, minimumOef, setMinimumOef)}
                />

                <label>Minimum OEF*</label>
              </div>
              {errors.minimum_oef && (
                <div className="error">
                  <p>{errors.minimum_oef}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className="field" name="maximum_oef">
                <input
                  type="number"
                  className="form-control"
                  name="maximum_oef"
                  placeholder=" "
                  required
                  min={1}
                  value={maximumOef}
                  onBlur={handleInputBlur}
                  onChange={(e) => {
                    handleNumberInputChange(e, setMaximumOef);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, maximumOef, setMaximumOef)}
                />

                <label>Maximum OEF*</label>
              </div>
              {errors.maximum_oef && (
                <div className="error">
                  <p>{errors.maximum_oef}</p>
                </div>
              )}
            </div>
            <div className="form-field checkbox w-100">
              <span className="toggle-text">
                {isActive ? 'Active' : 'Inactive'}
              </span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  name="is_active"
                  onChange={handleIsActiveChange}
                  checked={isActive}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>
        <SuccessPopUpModal
          title="Confirmation"
          message={'Are you sure want to archive?'}
          modalPopUp={archiveModal}
          setModalPopUp={setArchiveModal}
          showActionBtns={false}
          isArchived={true}
          archived={archieveHandle}
        />
        <ConfirmModal
          showConfirmation={showConfirmation}
          onCancel={() => handleConfirmationResult(false)}
          onConfirm={() => handleConfirmationResult(true)}
          icon={CancelIconImage}
          heading={'Confirmation'}
          description={'Unsaved changes will be lost. Do you want to continue?'}
        />
        <SuccessPopUpModal
          title="Success!"
          message={`Industry Category updated.`}
          modalPopUp={showSuccessDialog}
          isNavigate={true}
          setModalPopUp={setShowSuccessDialog}
          showActionBtns={true}
        />
        <SuccessPopUpModal
          title="Success!"
          message={`Industry Category updated.`}
          modalPopUp={showSuccessModal}
          isNavigate={true}
          setModalPopUp={setShowSuccessModal}
          showActionBtns={true}
          redirectPath={`/system-configuration/tenant-admin/crm-admin/accounts/industry-categories/${id}/view`}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Industry Category is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/crm-admin/accounts/industry-categories'
          }
        />
        <div className="form-footer">
          {CheckPermission([
            Permissions.CRM_ADMINISTRATION.ACCOUNTS.INDUSTRY_CATEGORY.ARCHIVE,
          ]) && (
            <div
              onClick={() => {
                setArchiveModal(true);
              }}
              className="archived"
            >
              <span>Archive</span>
            </div>
          )}
          {showCancelBtn ? (
            <button className="btn simple-text" onClick={handleCancelClick}>
              Cancel
            </button>
          ) : (
            <Link className={`btn simple-text`} to={-1}>
              Close
            </Link>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={saveAndClose}
          >
            Save & Close
          </button>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={saveChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditIndustryCategories;
