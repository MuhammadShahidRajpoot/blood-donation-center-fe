import React, { useState, useEffect } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import CancelIconImage from '../../../../../../assets/images/ConfirmCancelIcon.png';
import SelectDropdown from '../../../../../common/selectDropdown';
import SuccessPopUpModal from '../../../../../common/successModal';
import {
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import { AccountBreadCrumbsData } from '../AccountBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

let crmAdminType = 'accounts';
let crmAdminTypeLabel = 'Accounts';
let categoryTypeLabel = 'Note';
let categoryType = 'note';
let navigateToMainPageLink = `/system-configuration/tenant-admin/crm-admin/${crmAdminType}/${categoryType}-subcategories/list`;

const EditNotesSubCategory = () => {
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [redirectToMainScreen, setRedirectToMainScreen] = useState(false);
  const { id } = useParams();
  const [archiveModal, setArchiveModal] = useState(false);
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmationDialog(true);
    } else {
      navigate(navigateToMainPageLink);
    }
  };

  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(navigateToMainPageLink);
    }
  };

  const fetchFormData = async (id) => {
    if (id) {
      let url = `/${crmAdminType}/${categoryType}-subcategory/${id}`;

      const result = await fetchData(url, 'GET');

      let { data, status_code } = result;
      if (status_code === 200 && data) {
        setIsActive(data.is_active);

        setFormData({
          ...formData,
          category_name: data.name,
          category_description: data.description,
          parent_category_name: {
            label: data.parent_id.name,
            value: data.parent_id.id,
          },
        });
        setCompareData({
          category_name: data?.name,
          category_description: data?.description,
          isActive: data?.is_active,
          parent_category_name: {
            label: data?.parent_id?.name,
            value: data?.parent_id?.id,
          },
        });
      } else {
        toast.error(`Error Fetching ${categoryTypeLabel} Subcategory Details`, {
          autoClose: 3000,
        });
      }
    } else {
      toast.error(`Error Fetching ${categoryTypeLabel} Subcategory Details`, {
        autoClose: 3000,
      });
    }
  };
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

  const fetchNoteCategories = async () => {
    let url = `/${crmAdminType}/${categoryType}-category?is_active=true`;

    const result = await fetchData(url, 'GET');

    let { data, status_code } = result;

    if (result.ok || status_code === 200) {
      let noteCategories = data?.map((noteCategory) => ({
        label: noteCategory?.name,
        value: noteCategory?.id,
      }));

      setCategoriesData(noteCategories);
    } else {
      toast.error(`Error Fetching ${categoryType} Categories`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    fetchNoteCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      try {
        const body = {
          name: formData.category_name,
          description: formData.category_description,
          is_active: isActive,
          parent_id: +formData.parent_category_name.value,
        };

        let url = `/${crmAdminType}/${categoryType}-subcategory/${id}`;

        const result = await fetchData(url, 'PUT', body);

        let { data, status_code } = result;

        if ((status_code === 200 || status_code === 201) && data) {
          setShowSuccessDialog(true);
          fetchFormData(id);
          compareAndSetCancel(
            newFormData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
        } else {
          toast.error(`Error Fetching ${categoryTypeLabel} Category Details`, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
  };

  const [formData, setFormData] = useState({
    category_name: '',
    category_description: '',
    parent_category_name: null,
  });

  const [errors, setErrors] = useState({
    category_name: '',
    category_description: '',
    parent_category_name: '',
  });
  useEffect(() => {
    setNewFormData({
      category_name: formData?.category_name,
      category_description: formData?.category_description,
      isActive,
      parent_category_name: formData?.parent_category_name,
    });
  }, [formData, isActive]);

  useEffect(() => {
    setNewFormData({
      category_name: formData?.category_name,
      category_description: formData?.category_description,
      isActive,
      parent_category_name: formData?.parent_category_name,
    });
  }, [formData, isActive]);

  useEffect(() => {
    compareAndSetCancel(
      newFormData,
      compareData,
      showCancelBtn,
      setShowCancelBtn
    );
  }, [newFormData, compareData]);

  const fieldNames = [
    { label: 'Name', name: 'category_name', required: true, maxLength: 50 },
    {
      label: 'Description',
      name: 'category_description',
      required: true,
      maxLength: 500,
    },
    {
      label: `${categoryTypeLabel} Category`,
      name: 'parent_category_name',
      required: true,
    },
  ];

  function titleCase(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
  }

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    fieldNames.forEach((fieldName) => {
      let value = formData[fieldName.name];
      const fieldDefinition = fieldNames.find(
        (field) => field.name === fieldName.name
      );
      let errorMessage = '';

      if (value === undefined) {
        value = '';
      }

      if (
        (fieldDefinition?.required && value === null) ||
        (fieldDefinition?.required && value.toString().trim() === '')
      ) {
        errorMessage = `${titleCase(fieldDefinition.label)} is required.`;
      }

      if (
        fieldDefinition?.maxLength &&
        value.length > fieldDefinition?.maxLength
      ) {
        errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed`;
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
    const { name, value } = e.target;
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });

    let errorMessage = '';

    const fieldDefinition = fieldNames.find((field) => field.name === name);

    if (fieldDefinition?.required && value.toString().trim() === '') {
      errorMessage = `${titleCase(fieldDefinition.label)} is required.`;
    }

    if (
      fieldDefinition?.maxLength &&
      value.length > fieldDefinition?.maxLength
    ) {
      errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed`;
    }
    const setError = (fieldName, errorMsg) => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMsg,
      }));
    };
    setUnsavedChanges(true);
    setError(name, errorMessage);
  };

  const handleDropDownChange = async (name, theValue) => {
    setFormData({ ...formData, [name]: theValue });
    setErrors({ ...errors, [name]: '' });
  };

  const saveChanges = async (e) => {
    await handleSubmit(e, false);
  };

  const saveAndClose = async (e) => {
    await handleSubmit(e);
    setRedirectToMainScreen(true);
  };
  const confirmArchive = async () => {
    try {
      const responses = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/accounts/note-subcategory/${id}`
      );
      const { status_code } = await responses.json();

      if (status_code === 204) {
        setArchiveModal(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
      } else {
        toast.error('Error Archiving Industry Subcategory', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error archiving data:', error);
    }

    setArchiveModal(false);
  };

  const handleIsActiveChange = (event) => {
    setUnsavedChanges(true);
    setIsActive(event.target.checked);
  };

  const BreadcrumbsData = [
    ...AccountBreadCrumbsData,
    {
      label: `Edit ${categoryTypeLabel} Subcategory`,
      class: 'disable-label',
      link: `${navigateToMainPageLink}/edit`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={`${crmAdminTypeLabel} Subcategories`}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form>
          <div className="formGroup">
            <h5>{`Edit ${categoryTypeLabel} Subcategory`}</h5>

            <div className="form-field">
              <div className="field">
                <input
                  type="text"
                  className="form-control"
                  name="category_name"
                  placeholder=" "
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  value={formData.category_name}
                  required
                />

                <label>Name* </label>
              </div>
              {errors.category_name && (
                <div className="error">
                  <p>{errors.category_name}</p>
                </div>
              )}
            </div>

            <div className="form-field">
              <div className="note-field field select-field">
                <SelectDropdown
                  placeholder={'Note Category'}
                  defaultValue={''}
                  className="dropdown-selector"
                  removeDivider={true}
                  showLabel
                  selectedValue={formData.parent_category_name}
                  name="parent_category_name"
                  onBlur={handleInputChange}
                  onChange={(val) => {
                    handleDropDownChange('parent_category_name', val);
                  }}
                  options={categoriesData}
                  error={errors.parent_category_name}
                />
              </div>
            </div>

            <div className="form-field w-100 textarea-new">
              <div className={`field`}>
                <textarea
                  type="text"
                  className={`form-control textarea`}
                  placeholder=" "
                  name="category_description"
                  onChange={handleInputChange}
                  onBlur={handleInputChange}
                  value={formData.category_description}
                  required
                />
                <label>Description *</label>
              </div>
              {errors.category_description && (
                <div className={`error`}>
                  <p>{errors.category_description} </p>
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
                  checked={isActive}
                  className="toggle-input"
                  name="is_active"
                  onChange={handleIsActiveChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>

        {/* Confirmation Dialog */}
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
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleConfirmationResult(true)}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </section>

        <SuccessPopUpModal
          title="Success!"
          message={`${categoryTypeLabel} Subcategory updated.`}
          modalPopUp={showSuccessDialog}
          isNavigate={true}
          setModalPopUp={setShowSuccessDialog}
          showActionBtns={true}
          redirectPath={
            redirectToMainScreen
              ? `/system-configuration/tenant-admin/crm-admin/${crmAdminType}/${categoryType}-subcategories/${id}`
              : ''
          }
        />

        <div className="form-footer">
          {CheckPermission([
            Permissions.CRM_ADMINISTRATION.ACCOUNTS.NOTES_SUBCATEGORY.ARCHIVE,
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
            type="submit"
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
      <SuccessPopUpModal
        title="Confirmation"
        message={'Unsaved changes will be lost, do you wish to proceed?'}
        modalPopUp={showConfirmationDialog}
        setModalPopUp={setShowConfirmationDialog}
        showActionBtns={false}
        isArchived={true}
        archived={() => navigate(navigateToMainPageLink)}
      />
      <SuccessPopUpModal
        title="Success"
        message={'Note Subcategory updated.'}
        modalPopUp={showConfirmationDialog}
        isNavigate={true}
        redirectPath={-1}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowConfirmationDialog}
      />
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure want to archive?'}
        modalPopUp={archiveModal}
        setModalPopUp={setArchiveModal}
        showActionBtns={false}
        isArchived={true}
        archived={confirmArchive}
      />
      <SuccessPopUpModal
        title="Success"
        message={'Note Subcategory updated.'}
        modalPopUp={showConfirmationDialog}
        isNavigate={true}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowConfirmationDialog}
      />
      <SuccessPopUpModal
        title="Success!"
        message="Note Subcategory is archived."
        modalPopUp={archiveSuccess}
        isNavigate={true}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        redirectPath={
          '/system-configuration/tenant-admin/crm-admin/accounts/note-subcategories/list'
        }
      />
    </div>
  );
};

export default EditNotesSubCategory;
