import React, { useState, useEffect } from 'react';
import jwt from 'jwt-decode';
import TopBar from '../../../../common/topbar/index';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import SelectDropdown from '../../../../common/selectDropdown';
import FormInput from '../../../../common/form/FormInput';
import { CallOutcomesBreadCrumbsDataCreateEdit } from './CallOutcomesBreadCrumbsData';
import ToolTip from '../../../../common/tooltip';
import { components } from 'react-select';

const colorOption = [
  {
    label: 'Red',
    value: '1',
  },
  {
    label: 'Blue',
    value: '2',
  },
  {
    label: 'Pink',
    value: '3',
  },
  {
    label: 'Purple',
    value: '4',
  },
  {
    label: 'Orange',
    value: '5',
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
            backgroundColor: props.data.label.toLowerCase(),
          }}
        />
        {props.data.label}
      </div>
    </components.Option>
  );
};

const AddCallOutcomes = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    color: '',
    is_active: true,
    next_call_interval: null,
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

  const handleCheckboxChange = (e, name) => {
    const { checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (isValid) {
      const body = {
        name: formData.name,
        code: formData.code,
        next_call_interval: parseInt(formData.next_call_interval, 10),
        is_active: formData.is_active,
        color: formData.color,
        created_by: +userId,
      };

      try {
        const res = await makeAuthorizedApiRequestAxios(
          'POST',
          `${BASE_URL}/call-center/call-outcomes`,
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

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDropdownChange = (val) => {
    setFormData((prevData) => ({
      ...prevData,
      color: val ? val.value : '',
    }));

    let e = {
      target: {
        name: 'color',
        value: val ? val.label : '',
      },
    };

    handleInputChange(e);
  };

  const BreadcrumbsData = [
    ...CallOutcomesBreadCrumbsDataCreateEdit,
    {
      label: 'Create Call Outcome',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/call-center-admin/call-outcomes/create',
    },
  ];
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
          <div className="formGroup">
            <h5>Create Call Outcome</h5>
            <FormInput
              label="Name"
              displayName="Name"
              name="name"
              error={errors?.name}
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
            />
            <SelectDropdown
              placeholder="Select Color*"
              name="color"
              options={colorOption}
              removeDivider
              //showLabel
              selectedValue={formData?.color?.label}
              onChange={(val) => {
                handleDropdownChange(val);
              }}
              error={errors.color}
              required
              components={{ Option: CustomOption }}
            />

            <div className="form-field checkbox w-100">
              <span className="toggle-text">
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  value={formData.is_active}
                  checked={formData.is_active}
                  name="is_active"
                  onChange={(e) => {
                    handleCheckboxChange(e, 'is_active');
                  }}
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
              setCloseModal(true);
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
            message="Call outcome created."
            modalPopUp={modalPopUp}
            isNavigate={true}
            setModalPopUp={setModalPopUp}
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
      </div>
    </div>
  );
};

export default AddCallOutcomes;
