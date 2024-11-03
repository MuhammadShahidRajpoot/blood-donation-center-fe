import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { components } from 'react-select';
import jwt from 'jwt-decode';
import TopBar from '../../../../common/topbar/index';
import styles from './index.module.scss';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import SelectDropdown from '../../../../common/selectDropdown';
import FormInput from '../../../../common/form/FormInput';
import { CallOutcomesBreadCrumbsDataCreateEdit } from './CallOutcomesBreadCrumbsData';
import ToolTip from '../../../../common/tooltip';
import { compareAndSetCancel } from '../../../../../helpers/compareAndSetCancel';

const colorOption = [
  {
    label: 'Red',
    value: 'Red',
  },
  {
    label: 'Blue',
    value: 'Blue',
  },
  {
    label: 'Pink',
    value: 'Pink',
  },
  {
    label: 'Purple',
    value: 'Purple',
  },
  {
    label: 'Orange',
    value: 'Orange',
  },
];

const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            marginRight: '8px',
            backgroundColor: props.data.value.toLowerCase(),
          }}
        />
        {props.data.label}
      </div>
    </components.Option>
  );
};
const EditCallOutcomes = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const params = useParams();
  const location = useLocation();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color: '',
    is_active: false,
    next_call_interval: null,
  });
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [compareData, setCompareData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(false);

  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
  });
  //const [id, setId] = useState("");
  //const [recruiters, setRecruiters] = useState([]);

  const BreadcrumbsData = [
    ...CallOutcomesBreadCrumbsDataCreateEdit,
    {
      label: 'Edit Call Outcome',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/call-center-admin/call-outcomes/${+params.id}/edit`,
    },
  ];

  const getCallOutcomeData = async () => {
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/call-center/call-outcomes/${params.id}`
    );
    const data = result.data;

    const addCallOutcomeUpdates = {
      name: data?.data?.name,
      code: data?.data?.code,
      color: {
        label: data?.data?.color,
        value: data?.data?.color,
      },
      next_call_interval: data?.data?.next_call_interval,
      is_active: data?.data?.is_active,
    };
    setIsDefault(data?.data?.is_default);
    setFormData(addCallOutcomeUpdates);
    setCompareData(addCallOutcomeUpdates);
    setIsActive(addCallOutcomeUpdates.is_active);
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      // setToken(jwtToken);
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        //setId(decodeToken?.id);
      }
    }
    getCallOutcomeData();
  }, []);

  const handleSubmit = async (e) => {
    const isValid = validateForm();

    if (isValid) {
      const body = {
        name: formData.name,
        code: formData.code,
        color: formData?.color?.label,
        next_call_interval: parseInt(formData.next_call_interval, 10),
        is_active: formData.is_active,
      };

      try {
        try {
          const res = await makeAuthorizedApiRequestAxios(
            'PUT',
            `${BASE_URL}/call-center/call-outcomes/${+params.id}`,
            JSON.stringify(body)
          );
          let { status_code, response } = res.data;

          if (status_code === 204) {
            setModalPopUp(true);
            getCallOutcomeData();
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
      label: 'Next Call Interval',
      name: 'next_call_interval',
      required: true,
    },
    {
      label: 'Color',
      name: 'color',
      required: true,
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

      if (fieldName.name === 'code' && value && !/^[a-zA-Z0-9]*$/.test(value)) {
        errorMessage = 'Code can only contain alphanumeric characters.';
      }

      if (
        fieldName.name === 'next_call_interval' &&
        (value < 0 || value > 1440 || isNaN(value))
      ) {
        errorMessage = 'Next Call Interval must be between 0 and 1440.';
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

  const handleIsActiveChange = (event) => {
    const isChecked = event.target.checked;
    const data = {
      ...formData,
      is_active: isChecked,
    };
    setFormData(data);
    compareAndSetCancel(data, compareData, showCancelBtn, setShowCancelBtn);
    setIsActive(isChecked);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    if (name === 'code' && value && !/^[a-zA-Z0-9]*$/.test(value)) {
      errorMessage = 'Code can only contain alphanumeric characters.';
    }

    if (
      name === 'next_call_interval' &&
      (value < 0 || value > 1440 || isNaN(value))
    ) {
      errorMessage = 'Next Call Interval must be between 0 and 1440.';
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

  const handleDropdownChange = (val) => {
    const data = {
      ...formData,
      color: val ? val : '',
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
          'PATCH',
          `${BASE_URL}/call-center/call-outcomes/${+params.id}`,
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
      '/system-configuration/tenant-admin/call-center-admin/call-outcomes';
    const urlParams = new URLSearchParams(location.search);
    const page = urlParams.get('page');
    switch (page) {
      case 'listing': {
        return `${url}/list`;
      }
      case 'view': {
        return params.id ? `${url}/${params.id}/view` : null;
      }
      default:
        return null;
    }
  };

  return (
    <div className={`position-relative ${styles.footerminheight}`}>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Call Outcomes'}
          SearchPlaceholder={null}
          SearchValue={null}
          SearchOnChange={null}
        />
        <div className="mainContentInner form-container">
          <form className={`adddevicetype ${styles.formcontainer}`}>
            <div className="formGroup">
              <h5>Edit Call Outcome</h5>
              <FormInput
                label="Name"
                displayName="Name"
                name="name"
                error={errors?.name}
                required={false}
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
                disabled={isDefault || formData?.code === 'SLVM'}
                required={false}
              />
              <FormInput
                //label="Next Call Interval"
                displayName="Next Call Interval"
                name="next_call_interval"
                error={errors?.next_call_interval}
                type="number"
                min={1}
                value={formData?.next_call_interval}
                onChange={handleInputChange}
                icon={
                  <ToolTip
                    text={`Number of days before next call can be made to the donor`}
                    css={{ root: { marginTop: '-5px' } }}
                  />
                }
                required={false}
              />
              <SelectDropdown
                placeholder="Select Color *"
                name="color"
                options={colorOption}
                removeDivider
                //showLabel
                selectedValue={formData?.color}
                onChange={(val) => {
                  handleDropdownChange(val);
                }}
                error={errors.color}
                required
                components={{ Option: CustomOption }}
              />

              <div className="form-field checkbox">
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
            : 'Call Outcome updated.'
        }
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={archieveHandle}
        isNavigate={isNavigate}
        redirectPath={
          isArchived
            ? '/system-configuration/tenant-admin/call-center-admin/call-outcomes/list'
            : redirectPath()
        }
      />

      <SuccessPopUpModal
        title="Success!"
        message="Call Outcome archived."
        modalPopUp={archiveStatus}
        isNavigate={true}
        setModalPopUp={setArchiveStatus}
        showActionBtns={true}
        redirectPath={
          '/system-configuration/tenant-admin/call-center-admin/call-outcomes/list'
        }
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost. Do you want to continue?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={
          '/system-configuration/tenant-admin/call-center-admin/call-outcomes/list'
        }
      />
    </div>
  );
};

export default EditCallOutcomes;
