import React, { useState, useEffect } from 'react';
import jwt from 'jwt-decode';
import TopBar from '../../../../../common/topbar/index';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../../common/successModal';
import CancelModalPopUp from '../../../../../common/cancelModal';
import validateForm from '../../../../../../helpers/formValidation';
import handleInputChange from '../../../../../../helpers/handleInputChange';
import SelectDropdown from '../../../../../common/selectDropdown';
import FormText from '../../../../../common/form/FormText';
import FormInput from '../../../../../common/form/FormInput';
import {
  SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../../routes/path';
import axios from 'axios';
// import { sortByLabel } from '../../../../../../helpers/utils';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';

const AddOrganizationalLevel = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    short_label: '',
    description: '',
    parent_level_id: null,
    is_active: true,
  });
  const bearerToken = localStorage.getItem('token');

  const [parentLevels, setParentLevels] = useState([]);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState('');
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  useEffect(() => {
    // Fetch parent levels from API
    fetchParentLevels();
    getLoginUserId();
  }, []);

  const getLoginUserId = () => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      // setToken(jwtToken);
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setUserId(decodeToken?.id);
      }
    }
  };

  const fetchParentLevels = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/organizational_levels?collectionOperation=${false}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const data = response.data;
      // setParentLevels(sortByLabel(data?.data)); // The response's data contains an array of parent levels
      setParentLevels(data?.data); // The response's data contains an array of parent levels
    } catch (error) {
      toast.error('Failed to fetch parent levels.', { autoClose: 3000 });
    }
  };

  const handleCheckboxChange = (e, name) => {
    const { checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };
  useEffect(() => {
    let firstErrorKey = Object.keys(errors).find((key) => errors[key] !== '');
    if (firstErrorKey) {
      if (firstErrorKey === 'description') {
        firstErrorKey = 'new_description';
      }
      scrollToErrorField({ [firstErrorKey]: errors[firstErrorKey] });
    }
  }, [errors]);

  let hasData =
    formData.name ||
    formData.short_label ||
    formData.description ||
    formData.parent_level_id;

  hasData = Boolean(hasData);

  const fieldNames = [
    { label: 'Name', name: 'name', required: true, maxLength: 50 },
    {
      label: 'Short Label',
      name: 'short_label',
      required: true,
      maxLength: 50,
    },
    {
      label: 'Description',
      name: 'description',
      required: true,
      maxLength: 500,
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value, setFormData, fieldNames, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData, fieldNames, setErrors);

    if (isValid) {
      const body = {
        name: formData.name,
        short_label: formData.short_label,
        description: formData.description,
        is_active: formData.is_active,
        parent_level_id: formData.parent_level_id
          ? +formData.parent_level_id.value
          : null,
        created_by: +userId,
      };

      try {
        const response = await axios.post(
          `${BASE_URL}/organizational_levels`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
          }
        );

        const data = response.data;
        if (data?.status === 'success') {
          setModalPopUp(true);
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
    }
  };

  const BreadcrumbsData = [
    {
      label: 'System Configurations',
      class: 'disable-label',
      link: SYSTEM_CONFIGURATION_PATH,
    },
    {
      label: 'Organizational Administration',
      class: 'disable-label',
      link: SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
    },
    {
      label: 'Hierarchy',
      class: 'disable-label',
      link: '/system-configuration/organizational-levels',
    },
    {
      label: 'Organizational Levels',
      class: 'disable-label',
      link: '/system-configuration/organizational-levels',
    },
    {
      label: 'Create',
      class: 'active-label',
      link: '/system-configuration/organizational-administration/hierarchy/organizational-levels/create',
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Create Organizational Level'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form>
          <div className="formGroup">
            <h5>Create Organizational Level</h5>
            <FormInput
              label="Level Name"
              displayName="Level Name"
              name="name"
              error={errors.name}
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={handleChange}
            />
            <FormInput
              label="Short Label"
              displayName="Short Label"
              name="short_label"
              error={errors.short_label}
              required
              value={formData.short_label}
              onChange={handleChange}
              onBlur={handleChange}
            />
            <div name="new_description"></div>
            <FormText
              name="description"
              displayName="Description"
              value={formData?.description}
              error={errors?.description}
              classes={{ root: 'w-100' }}
              required
              onChange={handleChange}
              onBlur={handleChange}
            />
            <div className="form-field w-100">
              <div className="field w-100">
                <SelectDropdown
                  placeholder={'Parent Level'}
                  defaultValue={formData.parent_level_id}
                  selectedValue={formData.parent_level_id}
                  removeDivider
                  showLabel
                  onChange={(val) => {
                    console.log(val);
                    let e = {
                      target: {
                        name: 'parent_level_id',
                        value: val ?? null,
                      },
                    };
                    handleChange(e);
                  }}
                  options={parentLevels.map((item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                />
                {/* <select
                  className={`form-select ${
                    !formData?.['parent_level_id']
                      ? 'select-placeholder-class'
                      : ''
                  }`}
                  name="parentLevel"
                  value={formData.parent_level_id}
                  onBlur={(val) => {
                    let e = {
                      target: {
                        name: 'parent_level_id',
                        value: val.target.value ?? '',
                      },
                    };
                    handleChange(e);
                  }}
                  onChange={(val) => {
                    let e = {
                      target: {
                        name: 'parent_level_id',
                        value: val.target.value ?? '',
                      },
                    };
                    handleChange(e);
                  }}
                >
                  <option value="" selected>
                    Parent Level
                  </option>

                  {parentLevels.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}
                    </option>
                  ))}
                </select> */}
                {errors.parent_level_id && (
                  <p className={styles.error}>{errors.parent_level_id}</p>
                )}
              </div>
            </div>
            <div className="form-field checkbox w-100">
              <span className="toggle-text">
                {formData?.is_active ? 'Active' : 'Inactive'}
              </span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  checked={formData.is_active}
                  value={formData.is_active}
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
            className={`btn simple-text`}
            onClick={(e) => {
              e.preventDefault();
              !hasData
                ? navigate('/system-configuration/organizational-levels')
                : setCloseModal(true);
            }}
          >
            Cancel
          </p>

          <button
            type="button"
            className={` btn btn-md me-4 btn-primary`}
            onClick={(e) => handleSubmit(e)}
          >
            Create
          </button>

          <SuccessPopUpModal
            title="Success!"
            message="Organizational Level created."
            modalPopUp={modalPopUp}
            isNavigate={true}
            setModalPopUp={setModalPopUp}
            showActionBtns={true}
            redirectPath={'/system-configuration/organizational-levels'}
          />
          <CancelModalPopUp
            title="Confirmation"
            message="Unsaved changes will be lost, do you wish to proceed?"
            modalPopUp={closeModal}
            isNavigate={true}
            setModalPopUp={setCloseModal}
            redirectPath={'/system-configuration/organizational-levels'}
          />
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationalLevel;
