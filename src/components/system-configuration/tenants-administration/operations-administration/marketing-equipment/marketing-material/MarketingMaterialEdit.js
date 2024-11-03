import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import SuccessPopUpModal from '../../../../../common/successModal';
import CancelModalPopUp from '../../../../../common/cancelModal';
import { toast } from 'react-toastify';
import jwt from 'jwt-decode';
import { Link, useParams } from 'react-router-dom';
import DatePicker from '../../../../../common/DatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { MarketingEquipmentBreadCrumbsData } from '../MarketingEquipmentBreadCrumbsData';
import { urlRegex } from '../../../../../../helpers/Validation';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

const MarketingMaterialEdit = () => {
  const { id } = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [CreatedById, setCreatedById] = useState('');
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [collectionOperationError, setCollectionOperationError] = useState('');
  const [collectionOperations, setCollectionOperations] = useState([]);
  const [isArchived, setIsArchived] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const [marketingData, setMarketingData] = useState({
    name: '',
    short_name: '',
    description: '',
    collection_operation: [],
    retire_on: '',
    status: true,
  });
  const [errors, setErrors] = useState({
    name: '',
    short_name: '',
    description: '',
    collection_operation: '',
  });
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);

  const getCollectionOperation = async (existingCollectionOperations) => {
    const response = await fetch(
      `${BASE_URL}/business_units/collection_operations/list`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    let { data } = await response.json();
    if (response.ok || response.status === 200) {
      const dataIds = data.map((item) => item.id);
      const filteredCollectionOperations = existingCollectionOperations.filter(
        (operation) => !dataIds.includes(operation.id)
      );
      setCollectionOperationData([...data, ...filteredCollectionOperations]);
    } else {
      toast.error('Error Fetching Device type Details', {
        autoClose: 3000,
      });
    }
  };

  const getMarketById = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/marketing-equipment/marketing-material/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let { data } = await response.json();
      if (response.ok || response.status === 200) {
        let parsedDate = moment(data?.retire_on, 'YYYY-MM-DD').toDate();
        if (parsedDate == 'Invalid Date') {
          parsedDate = null;
        }
        setMarketingData({ ...data, retire_on: parsedDate });
        setCollectionOperations(data?.collection_operation);
        setCompareData({
          name: data?.name,
          short_name: data?.short_name,
          description: data?.description,
          retire_on: data?.retire_on,
          status: data?.status,
          collection_operation: data?.collection_operation
            ?.map((co) => {
              return {
                name: co?.name,
                id: co?.id,
              };
            })
            ?.filter((co) => co.id !== undefined)
            ?.sort((a, b) => a.id - b.id),
        });
        getCollectionOperation(data?.collection_operation);
      } else {
        toast.error('Error Fetching Device type Details', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setNewFormData({
      name: marketingData?.name,
      short_name: marketingData?.short_name,
      description: marketingData?.description,
      retire_on: moment(marketingData?.retire_on).format('YYYY-MM-DD'),
      status: marketingData?.status,
      collection_operation: collectionOperations
        ?.map((co) => {
          return {
            name: co?.name,
            id: co?.id,
          };
        })
        ?.filter((co) => co.id !== undefined)
        ?.sort((a, b) => a.id - b.id),
    });
  }, [collectionOperations, marketingData]);

  useEffect(() => {
    compareAndSetCancel(
      newFormData,
      compareData,
      showCancelBtn,
      setShowCancelBtn
    );
  }, [newFormData, compareData]);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setCreatedById(decodeToken?.id);
      }
    }

    if (id) {
      getMarketById();
    }
    // eslint-disable-next-line
  }, [BASE_URL, bearerToken]);
  const archieveHandle = async () => {
    const response = await fetch(
      `${BASE_URL}/marketing-equipment/marketing-material/archive/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    let data = await response.json();
    if (data.status === 'success') {
      setModalPopUp(false);
      setTimeout(() => {
        setArchivedStatus(true);
      }, 600);
    }
    setModalPopUp(false);
  };

  const saveAndClose = async () => {
    setIsArchived(false);
    setIsNavigate(true);
    await handleSubmit();
  };
  const saveChanges = async () => {
    setIsArchived(false);
    await handleSubmit();
  };
  const BreadcrumbsData = [
    ...MarketingEquipmentBreadCrumbsData,
    {
      label: 'Edit Marketing Material',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/${id}/edit`,
    },
  ];

  const handleInputBlur = (e, config_name = null, state_name = null) => {
    // setUnsavedChanges(true);
    const { name, value } = e.target;
    let errorMessage = '';
    if (value.trim() === '') {
      errorMessage = 'Required';
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
        } else if (value?.length > 50) {
          setError(name, 'Maximum 50 characters are allowed');
        } else {
          setError('name', '');
        }
        break;
      case 'short_name':
        if (!value) {
          setError('short_name', errorMessage);
        } else if (value?.length > 50) {
          setError(name, 'Maximum 50 characters are allowed');
        } else {
          setError('short_name', '');
        }
        break;
      case 'description':
        if (!value) {
          setError('description', errorMessage);
        } else {
          setError('description', '');
        }
        break;
      case 'collection_operation':
        if (collectionOperations?.length === 0) {
          setError('collection_operation', 'Required');
        } else {
          setError('collection_operation', '');
        }
        break;
      default:
        if (config_name) {
          if (name === 'end_point_url') {
            if (!value || !urlRegex.test(value)) {
              errorMessage =
                'Please provide a correct endpoint URL, e.g: www.example.com';
            } else {
              errorMessage = '';
            }
          }

          setError(config_name, {
            ...errors[config_name],
            [name]: errorMessage,
          });
        } else if (state_name) {
          setError(state_name, errorMessage);
        } else {
          setError(name, errorMessage);
        }
        break;
    }
  };

  const handleFormInput = (event) => {
    const { value, name, checked } = event.target;
    const parsedValue = name === 'display_order' ? +value : value;
    if (name === 'status') {
      setMarketingData({ ...marketingData, [name]: checked });
    } else if (name === 'retire_on') {
      setMarketingData({ ...marketingData, [name]: value });
      setErrors((prevErrors) => ({
        ...prevErrors,
        retire_on: '',
      }));
    } else {
      setMarketingData({ ...marketingData, [name]: parsedValue });
    }
  };

  const checkError = (key, value) => {
    switch (key) {
      case 'name':
        if (!value) {
          return 'Name is required.';
        } else if (value?.length > 50) {
          return 'Maximum 50 characters are allowed.';
        } else {
          return '';
        }
      case 'short_name':
        if (!value) {
          return 'Short name is required.';
        } else if (value?.length > 50) {
          return 'Maximum 50 characters are allowed.';
        } else {
          return '';
        }
      case 'description':
        if (!value) {
          return 'Description is required.';
        } else {
          return '';
        }
      case 'collection_operation':
        if (collectionOperations?.length === 0) {
          return 'Collection operation is required.';
        } else {
          return '';
        }
      default:
        return '';
    }
  };
  const validateForm = () => {
    let copy = {
      ...errors,
      name: checkError('name', marketingData.name),
      short_name: checkError('short_name', marketingData.short_name),
      description: checkError('description', marketingData.description),
      collection_operation: checkError(
        'collection_operation',
        marketingData.collection_operation
      ),
    };
    setErrors({ ...copy });
    return copy;
  };

  const handleCollectionOperationChangeAll = (data) => {
    if (!(data?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    setCollectionOperations(data);
  };

  const handleCollectionOperationChange = (collectionOperation) => {
    let operationData = [...collectionOperations];
    operationData = operationData.some(
      (item) => item.id === collectionOperation.id
    )
      ? operationData.filter((item) => item.id !== collectionOperation.id)
      : [...operationData, collectionOperation];
    if (!(operationData?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    setCollectionOperations(operationData);
  };

  const collectionOperationOnBlur = () => {
    if (!(collectionOperations?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else {
      setCollectionOperationError('');
    }
  };

  const handleSubmit = async (e) => {
    const idMultiple =
      collectionOperations &&
      collectionOperations?.map((item) => {
        return +item.id;
      });
    const errObject = validateForm();
    if (!(collectionOperations?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    if (Object.values(errObject).every((value) => value === '')) {
      const parsedDate = moment(marketingData.retire_on).toDate();
      const formattedDate = moment(parsedDate).format('DD-MM-yyyy');
      let body = {
        ...marketingData,
        collection_operation: idMultiple,
        retire_on: formattedDate == 'Invalid date' ? null : formattedDate,
        created_by: +CreatedById,
      };
      try {
        const response = await fetch(
          `${BASE_URL}/marketing-equipment/marketing-material/${id}`,
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
        if (data.status === 'success') {
          setModalPopUp(true);
          compareAndSetCancel(
            newFormData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
          getMarketById();
        } else if (response?.status === 400) {
          toast.error(`${data?.message ?? data?.response}`, {
            autoClose: 3000,
          });
        } else {
          toast.error(`${data?.message ?? data?.response}`, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
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

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Marketing Materials'}
      />
      <div className="mainContentInner mt-2">
        <form>
          <div className={`formGroup`}>
            <h5>Edit Marketing Material</h5>
            <div className="form-field">
              <div className={`field`}>
                <input
                  type="text"
                  className={`form-control`}
                  value={marketingData?.name}
                  name="name"
                  onBlur={handleInputBlur}
                  placeholder=""
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleFormInput(e);
                    handleInputBlur(e);
                  }}
                  required
                />
                <label>Name*</label>
              </div>
              {errors.name && (
                <div className={`error`}>
                  <p>{errors.name}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className={`field`}>
                <input
                  type="text"
                  className={`form-control`}
                  value={marketingData?.short_name}
                  name="short_name"
                  onBlur={handleInputBlur}
                  placeholder=""
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleFormInput(e);
                    handleInputBlur(e);
                  }}
                  required
                />
                <label>Short Name*</label>
              </div>
              {errors.short_name && (
                <div className={`error`}>
                  <p>{errors.short_name}</p>
                </div>
              )}
            </div>
            <div name="new_description"></div>
            <div className="form-field w-100 textarea-new">
              <div className={`field`}>
                <textarea
                  type="text"
                  className={`form-control textarea`}
                  placeholder=" "
                  name="description"
                  required
                  value={marketingData?.description}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleFormInput(e);
                    handleInputBlur(e);
                  }}
                  onBlur={handleInputBlur}
                />
                <label>Description*</label>
              </div>
              {errors.description && (
                <div className={`error`}>
                  <p className="mb-0">{errors.description}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className={`field`}>
                <DatePicker
                  dateFormat="MM/dd/yyyy"
                  className="custom-datepicker"
                  placeholderText="Retire On"
                  selected={marketingData.retire_on}
                  minDate={new Date()}
                  onChange={(date) => {
                    handleFormInput({
                      target: { value: date, name: 'retire_on' },
                    });
                  }}
                />
              </div>
              {errors.retire_on && (
                <div className={`error`}>
                  <p>{errors.retire_on}</p>
                </div>
              )}
            </div>
            <div className="form-field" name="collection_operation">
              <GlobalMultiSelect
                label="Collection Operation*"
                data={collectionOperationData}
                selectedOptions={collectionOperations}
                onChange={handleCollectionOperationChange}
                onSelectAll={handleCollectionOperationChangeAll}
                error={collectionOperationError}
                onBlur={collectionOperationOnBlur}
              />
            </div>

            <div className={`form-field checkbox w-100`}>
              <span className="toggle-text">
                {marketingData?.status ? 'Active' : 'Inactive'}
              </span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  checked={marketingData?.status}
                  name="status"
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
        <div className="form-footer">
          <>
            {CheckPermission([
              Permissions.OPERATIONS_ADMINISTRATION.MARKETING_EQUIPMENTS
                .MARKETING_MATERIAL.ARCHIVE,
            ]) && (
              <span
                className="archived"
                onClick={(e) => {
                  e.preventDefault();
                  setIsArchived(true);
                  setModalPopUp(true);
                }}
              >
                Archive
              </span>
            )}
            {showCancelBtn ? (
              <button
                className={`btn simple-text`}
                onClick={(e) => {
                  e.preventDefault();
                  setCloseModal(true);
                }}
              >
                Cancel
              </button>
            ) : (
              <Link className={`btn simple-text`} to={-1}>
                Close
              </Link>
            )}
            <button
              className={`btn btn-md btn-secondary`}
              onClick={saveAndClose}
            >
              Save & Close
            </button>
            <button
              type="button"
              className={'btn btn-primary btn-md'}
              onClick={saveChanges}
            >
              Save Changes
            </button>
          </>
        </div>
      </div>
      <SuccessPopUpModal
        title={isArchived ? 'Confirmation' : 'Success!'}
        message={
          isArchived
            ? 'Are you sure you want to archive?'
            : 'Marketing Material updated.'
        }
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={archieveHandle}
        isNavigate={isNavigate}
        redirectPath={`/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/${id}/view`}
      />
      <SuccessPopUpModal
        title="Success!"
        message="Marketing Material is archived."
        modalPopUp={archivedStatus}
        isNavigate={true}
        setModalPopUp={setArchivedStatus}
        showActionBtns={true}
        redirectPath={
          '/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/list'
        }
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={
          '/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/list'
        }
      />
    </div>
  );
};

export default MarketingMaterialEdit;
