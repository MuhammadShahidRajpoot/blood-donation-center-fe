import React, { useState, useEffect } from 'react';
import TopBar from '../../../../../../components/common/topbar/index';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styles from './note-category.module.scss';
import { toast } from 'react-toastify';
import CancelIconImage from '../../../../../../assets/images/ConfirmCancelIcon.png';
import SuccessPopUpModal from '../../../../../../components/common/successModal/index';
import Layout from '../../../../../../components/common/layout';
import { fetchData } from '../../../../../../helpers/Api';
import { ContactBreadCrumbsData } from '../../../../../../components/system-configuration/tenants-administration/crm-administration/contact/ContactBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import NotFoundPage from '../../../../../not-found/NotFoundPage';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

let crmAdminType = 'contacts';
// let crmAdminTypeLabel = 'Contact';
let categoryTypeLabel = 'Attachment';
let categoryType = 'attachment';
let navigateToMainPageLink = `/system-configuration/tenant-admin/crm-admin/${crmAdminType}/${categoryType}-categories`;

const EditAttachmentCategory = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [redirectToMainScreen, setRedirectToMainScreen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    category_name: '',
    category_description: '',
  });
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);

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
      let url = `/${crmAdminType}/${categoryType}-category/${id}`;

      const result = await fetchData(url, 'GET');

      let { data, status_code } = result;

      if (status_code === 200 && data) {
        setIsActive(data.is_active);
        setFormData({
          ...formData,
          category_name: data.name,
          category_description: data.description,
        });
        setCompareData({
          category_name: data?.name,
          category_description: data?.description,
          isActive: data?.is_active,
        });
        // toast.success(message, { autoClose: 3000 });
      } else {
        toast.error(`Error Fetching ${categoryTypeLabel} Category Details`, {
          autoClose: 3000,
        });
      }
    } else {
      toast.error(`Error Fetching ${categoryTypeLabel} Category Details`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    setNewFormData({
      category_name: formData?.category_name,
      category_description: formData?.category_description,
      isActive,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      try {
        const body = {
          name: formData.category_name,
          description: formData.category_description,
          is_active: isActive,
        };

        let url = `/${crmAdminType}/${categoryType}-category/${id}`;

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

  const saveChanges = async (e) => {
    await handleSubmit(e, false);
  };

  const saveAndClose = async (e) => {
    await handleSubmit(e);
    setRedirectToMainScreen(true);
  };

  const handleIsActiveChange = (event) => {
    setUnsavedChanges(true);
    setIsActive(event.target.checked);
  };

  const [errors, setErrors] = useState({
    category_name: '',
    category_description: '',
  });

  const fieldNames = [
    { label: 'Name', name: 'category_name', required: true, maxLength: 50 },
    {
      label: 'Description',
      name: 'category_description',
      required: true,
      maxLength: 500,
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

      if (fieldDefinition?.required && value.toString().trim() === '') {
        errorMessage = `${fieldDefinition.label} is required.`;
      }

      if (
        fieldDefinition?.maxLength &&
        value.length > fieldDefinition?.maxLength
      ) {
        errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed.`;
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
      errorMessage = `${fieldDefinition.label} is required.`;
    }

    if (
      fieldDefinition?.maxLength &&
      value.length > fieldDefinition?.maxLength
    ) {
      errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed.`;
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

  const BreadcrumbsData = [
    ...ContactBreadCrumbsData,
    {
      label: `Edit ${categoryTypeLabel} Category`,
      class: 'disable-label',
      link: `${navigateToMainPageLink}/edit`,
    },
  ];
  const confirmArchive = () => {
    fetchData(`/contacts/attachment-category/${id}`, 'PATCH')
      .then((res) => {
        if (res.status_code === 204) {
          setModalPopUp(null);
          setTimeout(() => {
            setArchiveSuccess(true);
          }, 600);
        } else {
          toast.error(res.response, { autoClose: 3000 });
          setModalPopUp(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setModalPopUp(null);
      });
  };
  const hasPermission = CheckPermission([
    Permissions.CRM_ADMINISTRATION.CONTACTS.ATTACHMENTS_CATEGORY.WRITE,
  ]);
  if (hasPermission) {
    return (
      <Layout>
        <div className="mainContent">
          <TopBar
            BreadCrumbsData={BreadcrumbsData}
            BreadCrumbsTitle={`${categoryTypeLabel} Categoriesss`}
            SearchPlaceholder={null}
            SearchValue={null}
            SearchOnChange={null}
          />
          <div className="mainContentInner form-container">
            <form className={styles.addAdminRoles}>
              <div className="formGroup">
                <h5>{`Edit ${categoryTypeLabel} Category`}</h5>
                <div className="col">
                  <div className="form-field">
                    <div className="field ">
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

                      <label>Name*</label>
                    </div>
                    {errors.category_name && (
                      <div className="error">
                        <p>{errors.category_name}</p>
                      </div>
                    )}
                  </div>

                  <div className="form-field textarea-new w-100">
                    <div className={`field`}>
                      <textarea
                        type="text"
                        className={`form-control textarea`}
                        placeholder=" "
                        name="category_description"
                        value={formData.category_description}
                        onChange={handleInputChange}
                        onBlur={handleInputChange}
                        required
                      />
                      <label>Description *</label>
                    </div>
                    <br />
                    {errors.category_description && (
                      <div className="error">
                        <p>{errors.category_description}</p>
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
                        checked={isActive}
                        onChange={handleIsActiveChange}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
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
              message={`${categoryTypeLabel} Category updated.`}
              modalPopUp={showSuccessDialog}
              isNavigate={true}
              setModalPopUp={setShowSuccessDialog}
              showActionBtns={true}
              redirectPath={
                redirectToMainScreen
                  ? `/system-configuration/tenant-admin/crm-admin/${crmAdminType}/${categoryType}-categories/${id}/view`
                  : ''
              }
            />
            <SuccessPopUpModal
              title="Confirmation"
              message={'Are you sure want to archive?'}
              modalPopUp={modalPopUp}
              setModalPopUp={setModalPopUp}
              showActionBtns={false}
              isArchived={true}
              archived={confirmArchive}
            />
            <SuccessPopUpModal
              title="Success!"
              message="Attachment Category is archived."
              modalPopUp={archiveSuccess}
              isNavigate={true}
              setModalPopUp={setArchiveSuccess}
              showActionBtns={true}
              redirectPath={
                '/system-configuration/tenant-admin/crm-admin/contacts/attachment-categories'
              }
            />
            <div className="form-footer">
              {CheckPermission([
                Permissions.CRM_ADMINISTRATION.CONTACTS.ATTACHMENTS_CATEGORY
                  .ARCHIVE,
              ]) && (
                <span
                  className="archived"
                  onClick={() => {
                    setModalPopUp(true);
                  }}
                >
                  Archive
                </span>
              )}
              {showCancelBtn ? (
                <button
                  type="button"
                  className="btn simple-text"
                  onClick={handleCancelClick}
                >
                  Cancel
                </button>
              ) : (
                <Link className={`btn simple-text`} to={-1}>
                  Close
                </Link>
              )}

              <button
                type="submit"
                className="btn btn-md btn-secondary"
                onClick={saveAndClose}
              >
                Save & Close
              </button>

              <button
                type="button"
                className="btn btn-md btn-primary"
                onClick={saveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  } else {
    return <NotFoundPage />;
  }
};

export default EditAttachmentCategory;
