import React, { useState, useEffect } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './index.module.scss';
import CancelIconImage from '../../../../../../assets/images/ConfirmCancelIcon.png';
import SuccessPopUpModal from '../../../../../common/successModal';
import SelectDropdown from '../../../../../common/selectDropdown';
import {
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import DatePicker from '../../../../../common/DatePicker';
import moment from 'moment';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { MarketingEquipmentBreadCrumbsData } from '../MarketingEquipmentBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

const PromotionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [promotionName, setPromotionName] = useState('');
  const [promotionShortName, setPromotionShortName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [retireOnDate, setRetireOnDate] = useState('');
  const [collectionOperations, setCollectionOperations] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [promotionsData, setPromotionsData] = useState([]);
  const [redirectToMainScreen, setRedirectToMainScreen] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [archivedStatus, setArchivedStatus] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [errors, setErrors] = useState({
    promotion_description: '',
    name: '',
    short_name: '',
    promotion_item: '',
    status: '',
  });
  const getData = async (id) => {
    if (id) {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/marketing-equipment/promotional-items/${id}`
      );
      let { data } = await result.json();
      if (result.ok || (result.status_code === 200 && data)) {
        setPromotionName(data.name);
        setPromotionShortName(data.short_name);
        setDescription(data.description);
        setIsActive(data.status);
        if (data?.retire_on) {
          setRetireOnDate(new Date(data.retire_on));
        }

        setCollectionOperations(
          data.collectionOperations.map((item) => {
            return {
              name: item.collection_operation.name,
              id: item.collection_operation.id,
            };
          })
        );
        getCollectionOperations(
          data?.collectionOperations?.map((item) => item.collection_operation)
        );
        setSelectedPromotion({
          label: data.promotion_id.name,
          value: data.promotion_id.id,
        });
        setCompareData({
          promotionName: data?.name,
          promotionShortName: data?.short_name,
          description: data?.description,
          retireOnDate: data?.retire_on,
          isActive: data?.status,
          selectedPromotion: {
            label: data?.promotion_id?.name,
            value: data?.promotion_id?.id,
          },
          collectionOperations: data?.collectionOperations
            ?.map((co) => {
              return {
                name: co?.collection_operation?.name,
                id: co?.collection_operation?.id,
              };
            })
            ?.filter((co) => co.id !== undefined)
            ?.sort((a, b) => a.id - b.id),
        });
        //toast.success(message, { autoClose: 3000 })
      } else {
        toast.error('Error Fetching Promotional Item Details', {
          autoClose: 3000,
        });
      }
    } else {
      toast.error('Error getting Promotional Item Details', {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    setNewFormData({
      promotionName: promotionName,
      promotionShortName: promotionShortName,
      description: description,
      retireOnDate: moment(retireOnDate).format('YYYY-MM-DD'),
      isActive: isActive,
      selectedPromotion: {
        label: selectedPromotion?.label,
        value: selectedPromotion?.value,
      },
      collectionOperations: collectionOperations
        .map((co) => {
          return {
            name: co?.name,
            id: co?.id,
          };
        })
        ?.filter((co) => co.id !== undefined)
        ?.sort((a, b) => a.id - b.id),
    });
  }, [
    promotionShortName,
    promotionName,
    description,
    retireOnDate,
    collectionOperations,
    isActive,
    selectedPromotion,
  ]);

  useEffect(() => {
    compareAndSetCancel(
      newFormData,
      compareData,
      showCancelBtn,
      setShowCancelBtn
    );
  }, [newFormData, compareData]);

  useEffect(() => {
    fetchPromotions();

    if (id) {
      getData(id);
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
  }, [id, BASE_URL, isEdit]);

  const getCollectionOperations = async (existingCollectionOperations) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      const dataIds = data.map((item) => item.id);
      const filteredCollectionOperations = existingCollectionOperations?.filter(
        (operation) => !dataIds.includes(operation?.id)
      );
      setCollectionOperationData([...data, ...filteredCollectionOperations]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  const fetchPromotions = async () => {
    const result = await fetchData(
      '/marketing-equipment/promotions?limit=10000&sort_name=name&sort_order=ASC'
    );
    let { data, status } = result;
    if (status === 200) {
      const formatPromotions = data
        ?.filter((promotion) => promotion.status === true)
        .map((promotion) => ({
          label: promotion.name,
          value: promotion.id,
        }));
      setPromotionsData(formatPromotions);
    } else {
      toast.error('Error Fetching Promotions ', { autoClose: 3000 });
    }
  };

  const handleOnBlur = async (key, value) => {
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: `${(key.charAt(0).toUpperCase() + key.slice(1)).replace(
          /_/g,
          ' '
        )} is required.`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: '',
      }));
    }
  };

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmationDialog(true);
    } else {
      navigate(
        '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items'
      );
    }
  };

  const archivePromotionalItem = async () => {
    try {
      const res = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/marketing-equipment/promotional-items/${id}`
      );
      let { data, status, response } = await res.json();
      if (status === 'success') {
        // Handle successful response
        setArchiveModal(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        // Handle bad request
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    } finally {
      setArchiveModal(false);
    }
  };

  const handleConfirmationResult = (confirmed) => {
    setArchiveModal(false);
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(
        '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items'
      );
    }
  };

  const handleCollectionOperationChange = (collectionOperation) => {
    setCollectionOperations((prevSelected) =>
      prevSelected.some((item) => item.id === collectionOperation.id)
        ? prevSelected.filter((item) => item.id !== collectionOperation.id)
        : [...prevSelected, collectionOperation]
    );
  };
  const handleCollectionOperationChangeAll = (data) => {
    setCollectionOperations(data);
  };

  // Function to handle form submission
  const handleSubmit = async (e, stay) => {
    if (Object.values(errors).every((value) => value == '')) {
      const parsedDate = moment(retireOnDate).toDate();
      const formattedDate = moment(parsedDate).format('MM-DD-YYYYThh:mm:ss');

      e.preventDefault();
      try {
        const body = {
          name: promotionName,
          description: description,
          short_name: promotionShortName,
          status: isActive,
          promotion_id: selectedPromotion.value,
          retire_on: formattedDate == 'Invalid date' ? null : formattedDate,
          collection_operation: collectionOperations.map((item) =>
            Number(item.id)
          ),
        };

        const response = await makeAuthorizedApiRequest(
          'PUT',
          `${BASE_URL}/marketing-equipment/promotional-items/${id}`,
          JSON.stringify(body)
        );

        let data = await response.json();

        if (data?.response === 'success') {
          setSuccessModal(true);
          if (stay) {
            compareAndSetCancel(
              newFormData,
              compareData,
              showCancelBtn,
              setShowCancelBtn,
              true
            );
            setIsEdit(true);
          }
          getData(id);
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

  const handleNameChange = (event) => {
    setUnsavedChanges(true);
    setPromotionName(event.target.value);
  };

  const handleShortNameChange = (event) => {
    setUnsavedChanges(true);
    setPromotionShortName(event.target.value);
  };

  const saveChanges = async (e) => {
    setArchiveModal(false);
    await handleSubmit(e, false);
    setRedirectToMainScreen(true);
  };

  const saveAndStay = async (e) => {
    setArchiveModal(false);
    await handleSubmit(e, true);
  };

  const handleDescriptionChange = (event) => {
    const { value, name } = event.target;
    if (name === 'description' && value?.length > 500) {
      toast.dismiss();
      toast.warn('Max Characters allowed for Description are 500');
      return;
    }
    setUnsavedChanges(true);
    setDescription(value);
  };

  const handleIsActiveChange = (event) => {
    setUnsavedChanges(true);
    setIsActive(event.target.checked);
  };

  const handleInputBlur = (e, config_name = null, state_name = null) => {
    setUnsavedChanges(true);
    const { name, value } = e.target;
    let errorMessage = '';

    if (value.trim() === '') {
      errorMessage = `${(name.charAt(0).toUpperCase() + name.slice(1)).replace(
        /_/g,
        ' '
      )} is required.`;
    }
    const setError = (fieldName, errorMsg) => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: errorMsg,
      }));
    };

    switch (name) {
      case 'description':
        if (!value) {
          setError('promotion_description', errorMessage);
        } else {
          setError('promotion_description', '');
        }
        break;

      default:
        setError(name, errorMessage);
        break;
    }
  };

  const BreadcrumbsData = [
    ...MarketingEquipmentBreadCrumbsData,
    {
      label: 'Edit Promotional item',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${id}/edit`,
    },
  ];

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
        BreadCrumbsTitle={'Promotional Items'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form className={styles.addAdminRoles}>
          <div className="formGroup">
            <h5>Edit Promotional Item</h5>

            <div className="form-field">
              <div className="field">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder=" "
                  value={promotionName}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleNameChange(e);
                    handleInputBlur(e);
                  }}
                  onBlur={handleInputBlur}
                  required
                />

                <label>Name *</label>
              </div>
              {errors.name && (
                <div className="error">
                  <p>{errors.name}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className="field">
                <input
                  type="text"
                  className="form-control"
                  name="short_name"
                  placeholder=" "
                  value={promotionShortName}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleShortNameChange(e);
                    handleInputBlur(e);
                  }}
                  onBlur={handleInputBlur}
                  required
                />

                <label>Short Name *</label>
              </div>
              {errors.short_name && (
                <div className="error">
                  <p>{errors.short_name}</p>
                </div>
              )}
            </div>
            <div name="promotion_description"></div>
            <div className="form-field textarea-new w-100">
              <div className="field ">
                <textarea
                  type="text"
                  className="form-control textarea"
                  placeholder=" "
                  name="description"
                  value={description}
                  onBlur={handleInputBlur}
                  onChange={(e) => {
                    const filteredValue = e.target.value.replace(/^\s+/g, '');
                    e.target.value = filteredValue;
                    handleDescriptionChange(e);
                    handleInputBlur(e);
                  }}
                  required
                />
                <label>Description *</label>
              </div>
              {errors.promotion_description && (
                <div className="error">
                  <p>{errors.promotion_description}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <SelectDropdown
                placeholder="Promotion *"
                defaultValue={''}
                className="dropdown-selector full_height"
                removeDivider={true}
                showLabel
                selectedValue={selectedPromotion}
                onBlur={(e) =>
                  handleOnBlur('promotion_item', selectedPromotion)
                }
                name="promotion"
                onChange={(val) => {
                  setSelectedPromotion(val);
                  handleOnBlur('promotion_item', selectedPromotion);
                }}
                options={promotionsData}
              />

              {errors?.promotion_item && (
                <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                  <p>{errors.promotion_item}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <div className="field">
                <DatePicker
                  dateFormat="MM/dd/yyyy"
                  className="custom-datepicker"
                  placeholderText="Retire On"
                  selected={retireOnDate}
                  minDate={new Date()}
                  onChange={(date) => {
                    setRetireOnDate(date);
                  }}
                />
              </div>
            </div>
            <div className="form-field">
              <div className="field">
                <GlobalMultiSelect
                  label="Collection Operation*"
                  data={collectionOperationData}
                  selectedOptions={collectionOperations}
                  error={errors?.collection_operations}
                  onChange={handleCollectionOperationChange}
                  onSelectAll={handleCollectionOperationChangeAll}
                />
              </div>
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
                  name="status"
                  checked={isActive}
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
          title={archiveModal ? 'Confirmation' : 'Success!'}
          message={
            archiveModal
              ? 'Are you sure you want to archive?'
              : 'Promotional Item updated.'
          }
          modalPopUp={successModal || archiveModal}
          setModalPopUp={archiveModal ? setArchiveModal : setSuccessModal}
          showActionBtns={archiveModal ? false : true}
          isArchived={archiveModal}
          archived={archivePromotionalItem}
          isNavigate={redirectToMainScreen}
          redirectPath={
            redirectToMainScreen
              ? `/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${id}/view`
              : ''
          }
        />
        <SuccessPopUpModal
          title="Success!"
          message="PromotionalItem is archived."
          modalPopUp={archivedStatus}
          isNavigate={true}
          setModalPopUp={setArchivedStatus}
          showActionBtns={true}
          redirectPath={
            '/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items'
          }
        />
        <div className={`form-footer`}>
          {CheckPermission([
            Permissions.OPERATIONS_ADMINISTRATION.MARKETING_EQUIPMENTS
              .PROMOTIONAL_ITEMS.ARCHIVE,
          ]) && (
            <span
              type="button"
              className={'archived'}
              onClick={() => {
                setArchiveModal(true);
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
            onClick={saveChanges}
          >
            Save & Close
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-md"
            onClick={saveAndStay}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionEdit;
