import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import styles from './lock-date.module.scss';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
// import SuccessPopUpModal from '../../../common/successModal';
import CancelModalPopUp from '../../../common/cancelModal';
import GlobalMultiSelect from '../../../common/GlobalMultiSelect';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';
import { covertToTimeZone } from '../../../../helpers/convertDateTimeToTimezone';

const LockDateUpsert = ({
  lockDateId,
  setShowLockDayPopup,
  showLockDayPopup,
  updateDate,
  endDates,
  setEndDates,
  startDates,
  setStartDates,
  setUpdateDate,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionOperations, setCollectionOperations] = useState([]);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [cancelModal, setCancelModal] = useState(false);
  const [isStateDirty, setIsStateDirty] = useState(false);
  const [collectionOperationError, setCollectionOperationError] = useState('');

  const [errors, setErrors] = useState({
    title: '',
    start_date: '',
    end_date: '',
    description: '',
    collection_operations: '',
  });

  useEffect(() => {
    getCollectionOperations();
  }, []);

  function compareNames(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  const getCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list?status=true`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      const sortedData = data.sort(compareNames);
      // const sortedData = cdata.sort(compareNames);
      setCollectionOperationData(sortedData);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
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

  const checkError = async (key, value, obj) => {
    if (!value) {
      obj[key] = `${(key.charAt(0).toUpperCase() + key.slice(1)).replace(
        /_/g,
        ' '
      )} is required.`;
    } else {
      obj[key] = '';
    }
  };
  const validateForm = () => {
    const copy = { ...errors };
    checkError('title', title, copy);
    checkError('end_date', endDates, copy);
    checkError('start_date', startDates, copy);
    checkError('description', description, copy);
    checkError('collection_operations', collectionOperations.length, copy);
    setErrors({ ...copy });
    return copy;
  };
  const handleSubmit = async (e, redirect = true) => {
    const err = validateForm();
    if (!(collectionOperations?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    if (!Object.values(err).some((value) => value !== '')) {
      try {
        const body = {
          title: title,
          start_date: covertToTimeZone(moment(startDates)).format('YYYY-MM-DD'),
          end_date: covertToTimeZone(moment(endDates)).format('YYYY-MM-DD'),
          description: description,
          collection_operations: collectionOperations.map(
            (collectionOperation) => collectionOperation.id
          ),
        };
        // setIsSubmitting(true);
        const res = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/lock-dates`,
          JSON.stringify(body)
        );
        let { status, response } = await res.json();
        if (status === 'success') {
          // Handle successful response
          setShowLockDayPopup(false);
          // setSuccessModal(true);
          setUpdateDate(!updateDate);
        } else if (response?.status === 400) {
          toast.error('Failed to create lock date.', { autoClose: 3000 });
          // Handle bad request
        } else {
          toast.error('Failed to create lock date.', { autoClose: 3000 });
        }
        // setIsSubmitting(false);
      } catch (error) {
        // setIsSubmitting(false);
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
  };

  const handleCollectionOperationChange = (collectionOperationTemp) => {
    let tempCo = [...collectionOperations];
    tempCo = tempCo.some((item) => item.id === collectionOperationTemp.id)
      ? tempCo.filter((item) => item.id !== collectionOperationTemp.id)
      : [...tempCo, collectionOperationTemp];
    if (!(tempCo?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    setCollectionOperations(tempCo);
  };
  const handleCollectionOperationChangeAll = (data) => {
    if (!(data?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
    setCollectionOperations(data);
  };
  const collectionOperationOnBlur = () => {
    if (!(collectionOperations?.length > 0)) {
      setCollectionOperationError('Collection Operation is required.');
    } else setCollectionOperationError('');
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <form className={styles.lockDate}>
        <div className="formGroup mt-5">
          <h5>{lockDateId ? 'Edit Lock Date' : 'Create Lock Date'}</h5>

          <div className="form-field w-100">
            <div className="field w-50">
              <input
                type="text"
                className="form-control"
                name="Title"
                placeholder=" "
                onBlur={(e) => handleOnBlur('title', e.target.value)}
                onChange={(e) => {
                  const filteredValue = e.target.value.replace(/^\s+/g, '');
                  setTitle(filteredValue);
                  setIsStateDirty(true);
                  handleOnBlur('title', filteredValue);
                }}
                value={title}
                required
              />
              <label>Title*</label>
            </div>
            {errors?.title && (
              <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                <p>{errors.title}</p>
              </div>
            )}
          </div>

          <div className="form-field">
            <div className="field">
              {startDates && (
                <label
                  style={{
                    fontSize: '12px',
                    top: '25%',
                    color: '#555555',
                    zIndex: 1,
                  }}
                >
                  Start Date*
                </label>
              )}
              <DatePicker
                dateFormat="MM/dd/yyyy"
                className={`custom-datepicker${
                  !startDates ? ' custom-datepicker-placeholder' : ''
                } ${styles.custom_value}`}
                placeholderText="Start Date*"
                selected={startDates}
                minDate={new Date()}
                onBlur={(e) => handleOnBlur('start_date', e.target.value)}
                onChange={(date) => {
                  handleOnBlur('start_date', date);
                  setIsStateDirty(true);
                  setStartDates(date);
                }}
              />
            </div>
            {errors?.start_date && (
              <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                <p>{errors.start_date}</p>
              </div>
            )}
          </div>

          <div className="form-field w-50">
            <div className="field">
              {endDates && (
                <label
                  style={{
                    fontSize: '12px',
                    top: '24%',
                    color: '#555555',
                    zIndex: 1,
                  }}
                >
                  End Date*
                </label>
              )}
              <DatePicker
                minDate={startDates}
                dateFormat="MM/dd/yyyy"
                className={`custom-datepicker${
                  !endDates ? ' custom-datepicker-placeholder' : ''
                } ${styles.custom_value}`}
                placeholderText="End Date*"
                selected={endDates}
                onBlur={(e) => handleOnBlur('end_date', e.target.value)}
                onChange={(date) => {
                  handleOnBlur('end_date', date);
                  setIsStateDirty(true);
                  setEndDates(date);
                }}
              />
            </div>
            {errors?.end_date && (
              <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                <p>{errors.end_date}</p>
              </div>
            )}
          </div>

          <div className="form-field w-100">
            <div className="field">
              {description && (
                <label
                  style={{ fontSize: '12px', top: '10%', color: '#555555' }}
                >
                  Description*
                </label>
              )}
              <textarea
                type="text"
                className="form-control"
                placeholder="Description*"
                name="description"
                onBlur={(e) => handleOnBlur('description', e.target.value)}
                onChange={(e) => {
                  const filteredValue = e.target.value.replace(/^\s+/g, '');
                  setDescription(filteredValue);
                  setIsStateDirty(true);
                  handleOnBlur('description', filteredValue);
                }}
                value={description}
              />
            </div>
            {errors?.description && (
              <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                <p>{errors.description}</p>
              </div>
            )}
          </div>
          <div className="w-100 ">
            <div className="w-50">
              <GlobalMultiSelect
                cLockDate={true}
                label="Collection Operation*"
                data={collectionOperationData?.map(
                  (collectionOperationItem) => {
                    return {
                      id: collectionOperationItem.id,
                      name: collectionOperationItem.name,
                    };
                  }
                )}
                selectedOptions={collectionOperations}
                error={collectionOperationError}
                onChange={handleCollectionOperationChange}
                onSelectAll={handleCollectionOperationChangeAll}
                onBlur={collectionOperationOnBlur}
              />
            </div>
          </div>
          <div className="w-100 d-flex justify-content-end">
            <button
              type="button"
              className={`btn btn-secondary py-1 mt-4 ${styles.nobtn} ${styles.nobtnhover} ${styles.submitbutton}`}
              style={{ marginRight: '10px' }}
              onClick={() =>
                (isStateDirty || !isStateDirty) && setCancelModal(true)
              }
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-primary py-1 mt-4 ${styles.nobtn} ${styles.submitbutton}`}
              onClick={handleSubmit}
            >
              Create
            </button>
          </div>
        </div>
      </form>

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={cancelModal}
        isNavigate={true}
        setModalPopUp={setCancelModal}
        showDayPopup={showLockDayPopup}
        setShowDayPopup={setShowLockDayPopup}
      />
    </div>
  );
};

export default LockDateUpsert;
