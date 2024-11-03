import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import styles from './index.module.scss';
import { Link, useParams } from 'react-router-dom';
import SuccessPopUpModal from '../../../../../common/successModal';
import jwt from 'jwt-decode';
import { toast } from 'react-toastify';
import CancelModalPopUp from '../../../../../common/cancelModal';
import { BUSINESS_UNIT_PATH } from '../../../../../../routes/path';
import { BusinessBreadCrumbData } from '../breadCrumbsData';
import handleInputChange from '../../../../../../helpers/handleInputChange';
import validateForm from '../../../../../../helpers/formValidation';
import SelectDropdown from '../../../../../common/selectDropdown';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import axios from 'axios';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';
const EditBusinessUnit = () => {
  const { id } = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [businessData, setBusinessData] = useState({
    name: '',
    parent_level_id: null,
    organizational_level_id: null,
    is_active: true,
  });
  const [redirect, SetRedirect] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    organizational_level_id: '',
  });
  const [parentLevelData, setParentLevelData] = useState([]);
  const [tempParentLevelData, setTempParentLevelData] = useState([]);
  const [organizationalLevelData, setOrganizationalLevelData] = useState([]);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [createdById, setCreatedById] = useState('');
  const bearerToken = localStorage.getItem('token');
  const [parentLevelExists, setParentLevelExists] = useState(false);
  const [showCancelBtn, setShowCancelBtn] = useState(true);
  const [compareData, setCompareData] = useState({
    name: '',
    parent_level_id: null,
    organizational_level_id: null,
    is_active: true,
  });
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [archiveModalPopUp, setArchiveModalPopUp] = useState(false);

  const BreadcrumbsData = [
    ...BusinessBreadCrumbData,
    {
      label: 'Edit Business Unit',
      class: 'active-label',
      link: BUSINESS_UNIT_PATH.CREATE,
    },
  ];

  useEffect(() => {
    compareAndSetCancel(
      businessData,
      compareData,
      showCancelBtn,
      setShowCancelBtn
    );
  }, [businessData, compareData]);

  const getOrganizationalLevelData = async () => {
    const result = await fetch(`${BASE_URL}/organizational_levels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    const data = await result.json();
    setOrganizationalLevelData(data?.data);
  };
  const getBusinessUnits = async () => {
    const response = await axios.get(`${BASE_URL}/business_units?limit=1000`, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });

    const data = response.data;

    setParentLevelData(data?.data);
    setTempParentLevelData(data?.data);
  };

  const getBusinessUnitByID = async (id) => {
    if (!tempParentLevelData.length > 0) {
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/business_units/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });

      const data = response.data;
      let organizationId = data?.organizational_level_id?.id;
      data.organizational_level_id = {
        label: data?.organizational_level_id?.name,
        value: data?.organizational_level_id?.id,
      };
      data.parent_level = data?.parent_level?.id
        ? {
            label: data?.parent_level?.name,
            value: data?.parent_level?.id,
          }
        : null;
      //setBusinessUnit(data);

      setBusinessData((prevData) => ({
        ...prevData,
        name: data.name,
        is_active: data.is_active,
        parent_level_id: data?.parent_level,
        organizational_level_id: data.organizational_level_id,
      }));

      setCompareData((prevData) => ({
        ...prevData,
        name: data.name,
        is_active: data.is_active,
        parent_level_id: data?.parent_level,
        organizational_level_id: data.organizational_level_id,
      }));

      //setIsActive(data.is_active);

      let organization = organizationalLevelData?.find(
        (item) => item.id == +organizationId
      );

      let updatedParentList = tempParentLevelData?.filter(
        (item) =>
          item.organizational_level_id?.id == organization?.parent_level?.id
      );

      if (updatedParentList.length > 0) {
        setParentLevelExists(true);
      } else {
        setParentLevelExists(false);
      }
      setParentLevelData(
        [...updatedParentList]?.filter(
          (item) => item.is_active === true && item.is_archived === false
        )
      );
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setCreatedById(decodeToken?.id);
      }
    }
    getOrganizationalLevelData();
    getBusinessUnits();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getBusinessUnitByID(id);
  }, [tempParentLevelData]);

  useEffect(() => {
    scrollToErrorField(errors);
  }, [errors]);

  const handleFormInput = (event) => {
    const { value, name, checked } = event.target;
    const parsedValue =
      name === 'parent_level_id' || name === 'organizational_level_id'
        ? +value
        : value;
    if (name === 'is_active') {
      setBusinessData({ ...businessData, [name]: checked });
    } else {
      setBusinessData({ ...businessData, [name]: parsedValue });
    }
  };

  const fieldNames = [
    { label: 'Name', name: 'name', required: true, maxLength: 50 },
    {
      label: 'Organizational Level',
      name: 'organizational_level_id',
      required: true,
    },
    {
      label: 'Parent Level',
      name: 'parent_level_id',
      required: false,
    },
  ];

  function titleCase(valueArray) {
    const fieldValue = valueArray.map((value) => ({
      ...value,
      label: value.label[0].toUpperCase() + value.label.slice(1).toLowerCase(),
    }));
    return fieldValue;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value, setBusinessData, fieldNames, setErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm(
      businessData,
      titleCase(fieldNames),
      setErrors
    );

    if (isValid) {
      let body = {
        ...businessData,
        organizational_level_id: +businessData?.organizational_level_id?.value,
        parent_level_id: +businessData?.parent_level_id?.value,
        created_by: +createdById,
      };
      try {
        const response = await fetch(`${BASE_URL}/business_units/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify(body),
        });
        let data = await response.json();
        if (data.status === 'success') {
          setModalPopUp(true);
          getBusinessUnitByID(id);
          compareAndSetCancel(
            businessData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
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
  const handleArchive = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'PUT',
        `${BASE_URL}/business_units/archive/${id}`
      );
      const { status_code, status, response } = await result.json();

      if (status_code === 200 && status === 'success') {
        setArchiveModalPopUp(false);
        setTimeout(() => {
          setConfirmationModal(true);
        }, 600);
      } else {
        toast.error(response, { autoClose: 3000 });
      }
    } catch (error) {
      toast.error(error?.response, { autoClose: 3000 });
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Business Units'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form>
          <div className="formGroup">
            <h5>Edit Business Unit</h5>
            <div className="form-field">
              <div className="field ">
                <input
                  type="text"
                  className="form-control "
                  name="name"
                  placeholder=" "
                  value={businessData.name}
                  onChange={handleChange}
                  required
                />

                <label>Name*</label>
              </div>
              {errors.name && (
                <div className={`error ${styles.errorcolor}`}>
                  <p>{errors.name}</p>
                </div>
              )}
            </div>
            <div className={`form-field`}>
              <SelectDropdown
                disabled={!parentLevelExists}
                styles={{ root: 'w-100' }}
                placeholder={'Parent'}
                defaultValue={businessData.parent_level_id}
                selectedValue={businessData.parent_level_id}
                removeDivider
                showLabel
                onChange={(val) => {
                  let e = {
                    target: {
                      name: 'parent_level_id',
                      value: val ?? null,
                    },
                  };
                  handleChange(e);
                }}
                options={parentLevelData.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
              {businessData.organizational_level_id && !parentLevelExists && (
                <p style={{ fontSize: '14px' }}>
                  Note: Selected Organizational Level has no Parent.
                </p>
              )}
              {errors.parent_level_id && (
                <p className={styles.errorcolor}>{errors.parent_level_id}</p>
              )}
            </div>
            <div className={`form-field`}>
              <SelectDropdown
                styles={{ root: 'w-100 mb-0' }}
                placeholder={'Organizational Level*'}
                defaultValue={businessData.organizational_level_id}
                selectedValue={businessData.organizational_level_id}
                removeDivider
                showLabel
                onChange={(val) => {
                  let e = {
                    target: {
                      name: 'organizational_level_id',
                      value: val ?? null,
                    },
                  };

                  if (
                    val?.value != businessData?.organizational_level_id?.value
                  ) {
                    setBusinessData((prevData) => ({
                      ...prevData,
                      parent_level_id: null,
                    }));
                  }

                  let organization = organizationalLevelData?.find(
                    (item) => item.id == +val?.value
                  );

                  let updatedParentList = tempParentLevelData?.filter(
                    (item) =>
                      item.organizational_level_id?.id ==
                      organization?.parent_level?.id
                  );
                  if (updatedParentList.length > 0) {
                    setParentLevelExists(true);
                  } else {
                    setParentLevelExists(false);
                  }
                  setParentLevelData(
                    [...updatedParentList]?.filter(
                      (item) =>
                        item.is_active === true && item.is_archived === false
                    )
                  );
                  handleChange(e);
                }}
                options={organizationalLevelData.map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                })}
              />
            </div>
            {errors.organizational_level_id && (
              <p className={styles.errorcolor}>
                {errors.organizational_level_id}
              </p>
            )}
            <div className="form-field w-100 checkbox">
              <span className="toggle-text">
                {businessData?.is_active ? 'Active' : 'Inactive'}
              </span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  value={businessData.is_active}
                  name="is_active"
                  defaultChecked
                  onChange={(e) => {
                    handleFormInput(e);
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </form>
        <div className="form-footer-custom">
          {CheckPermission([
            Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY.BUSINESS_UNITS
              .ARCHIVE,
          ]) && (
            <div
              className={`archived`}
              onClick={(e) => {
                e.preventDefault();
                setArchiveModalPopUp(true);
              }}
            >
              Archive
            </div>
          )}
          {showCancelBtn ? (
            <p
              className={`btn simple-text`}
              onClick={(e) => {
                e.preventDefault();
                setCloseModal(true);
              }}
            >
              Cancel
            </p>
          ) : (
            <Link className={`btn simple-text`} to={-1}>
              Close
            </Link>
          )}

          <button
            type="button"
            className={`btn btn-md btn-secondary`}
            onClick={(e) => {
              SetRedirect(true);
              handleSubmit(e);
            }}
          >
            Save & Close
          </button>

          <button
            type="button"
            className={`btn btn-primary btn-md`}
            onClick={(e) => {
              SetRedirect(false);
              handleSubmit(e);
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
      {redirect ? (
        <SuccessPopUpModal
          title="Success!"
          message="Business Unit updated."
          modalPopUp={modalPopUp}
          isNavigate={true}
          setModalPopUp={setModalPopUp}
          showActionBtns={true}
          redirectPath={`/system-configuration/business-unit/view/${id}`}
        />
      ) : (
        <SuccessPopUpModal
          title="Success!"
          message="Business Unit updated."
          modalPopUp={modalPopUp}
          isNavigate={true}
          setModalPopUp={setModalPopUp}
          showActionBtns={true}
          onConfirm={() => {}}
        />
      )}
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={'/system-configuration/hierarchy/business-units'}
      />
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure you want to archive?'}
        modalPopUp={archiveModalPopUp}
        setModalPopUp={setArchiveModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Business Unit is archived.'}
        modalPopUp={confirmationModal}
        isNavigate={true}
        setModalPopUp={setConfirmationModal}
        showActionBtns={true}
        redirectPath={'/system-configuration/hierarchy/business-units'}
      />
    </div>
  );
};
export default EditBusinessUnit;
