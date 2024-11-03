/* eslint-disable */

import React, { useEffect, useState } from 'react';
import styles from '../../index.module.scss';
import SelectDropdown from '../../../common/selectDropdown';
import ReactDatePicker from 'react-datepicker';
import SuccessPopUpModal from '../../../common/successModal';
import CancelModalPopUp from '../../../common/cancelModal';
import { toast } from 'react-toastify';
import FormFooter from '../../../common/FormFooter';
import Topbar from '../../../common/topbar/index';
import { CreateScheduleBreadCrumbData } from '../BuildScheduleBreadCrumbData';
import ScheduleStatusEnum from '../schedule.enum';
import { fetchData, makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { useNavigate } from 'react-router-dom';
import ToolTip from '../../../common/tooltip/index';
import GlobalMultiSelect from '../../../common/GlobalMultiSelect';

const ScheduleCreate = ({ formHeading, listUrl, cancelUrl }) => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [scheduleID, setScheduleID] = useState();
  const [collectionOperationId, setCollectionOperationId] = useState();
  const [collectionOperation, setCollectionOperation] = useState([]);
  const [operationStatusList, setOperationStatus] = useState([]);
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [operationStatusError, setOperationStatusError] = useState('');
  const [collectionOperationError, setCollectionOperationError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [error, setError] = useState('');
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [status, setStatus] = useState([]);
  const [collection, setCollection] = useState(null);
  const [errors, setErrors] = useState({
    operation_status: '',
    collection_operation: '',
    start_date: '',
  });
  const [CreateScheduleData, setCreateScheduleData] = useState({
    operation_status: null,
    collection_operation: null,
    start_date: null,
    end_date: null,
  });

  // Function to calculate end_date
  const calculateEndDate = (startDate) => {
    const startDateObject = new Date(startDate);
    const endDateObject = new Date(
      startDateObject.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    const endDateString = endDateObject.toISOString().split('T')[0];
    return new Date(endDateString);
  };

  // Check to see if the user selected any value for the dropdown or not
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'operation_status':
        if (!value) {
          setError(name, 'Operation Status is required.');
        } else if (value.length > 50) {
          setError(name, 'Maximum 50 characters are allowed.');
        } else {
          setError(name, '');
        }
        break;
      case 'collection_operation':
        if (!value) {
          setError(name, 'Collection Operation is required.');
        } else {
          setError(name, '');
        }
        break;
      case 'start_date':
        if (!CreateScheduleData.start_date) {
          setError(name, 'Start Date is required.');
        } else {
          setError(name, '');
        }
        break;
      default:
        break;
    }
  };

  // Check the collection Operation dropdown on focus
  const handleCollectionOperationDropdownFocus = () => {
    if (!CreateScheduleData.collection_operation) {
      setCollectionOperationError('Collection Operation is required.');
      setCollection(null);
    }
  };

  // ON change set Operation Status value
  const handleChangeSelectOperationStatus = (operationStatusTemp) => {
    let tempOpStatus = [...status];
    tempOpStatus = tempOpStatus.some(
      (item) => item.id === operationStatusTemp.id
    )
      ? tempOpStatus.filter((item) => item.id !== operationStatusTemp.id)
      : [...tempOpStatus, operationStatusTemp];
    if (!(tempOpStatus?.length > 0)) {
      setOperationStatusError('Operation Status is required.');
    } else {
      setOperationStatusError('');
    }
    setStatus(tempOpStatus);
  };

  // ON select All Operation Status
  const handleOperationStatusChangeAll = (data) => {
    if (!(data?.length > 0)) {
      setOperationStatusError('Operation Status is required.');
    } else {
      setOperationStatusError('');
    }
    setStatus(data);
  };

  //ON operation status blur
  const handleOperationStatusOnBlur = () => {};

  // ON change set Collection Operation value
  const handleChangeSelectCollectionOperation = (val) => {
    if (!val) {
      setCollectionOperationError('Collection Operation is required.');
      CreateScheduleData.collection_operation = null;
      setCollection('');
    } else {
      setCollectionOperationError('');
      CreateScheduleData.collection_operation = val;
      setCollection(val);
    }
  };

  // ON change set start date value
  const handleChangeSelectStartDate = (val) => {
    if (!val) {
      setStartDateError('Start Date is required.');
      CreateScheduleData.start_date = '';
    } else {
      setStartDateError('');
      CreateScheduleData.start_date = val;
    }
  };

  const fieldsEmptyOrNot = () => {
    if (
      CreateScheduleData.collection_operation !== null ||
      CreateScheduleData.start_date !== null ||
      status.length > 0
    ) {
      setCloseModal(true);
    } else {
      navigate(cancelUrl);
    }
  };

  const getStartDate = (date) => {
    return new Date(new Date(date).setDate(new Date(date).getDate() + 1));
  };

  // Handles Submit functionality
  const handleSubmit = async () => {
    setIsLoading(true);
    CreateScheduleData.operation_status = status.map((val) => Number(val.id));

    let isFormValid =
      CreateScheduleData.operation_status &&
      CreateScheduleData.collection_operation &&
      CreateScheduleData.start_date &&
      !operationStatusError &&
      !collectionOperationError &&
      !startDateError;

    isFormValid = Boolean(isFormValid);

    if (!CreateScheduleData.collection_operation) {
      setCollectionOperationError('Collection Operation is required.');
      setIsLoading(false);
    }
    if (CreateScheduleData.operation_status === null) {
      setOperationStatusError('Operation Status is required.');
      setIsLoading(false);
    } else if (CreateScheduleData.operation_status.length === 0) {
      setOperationStatusError('Operation Status is required.');
      setIsLoading(false);
    }

    if (!CreateScheduleData.start_date) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        start_date: 'Start Date is required.',
      }));
      setIsLoading(false);
    }
    if (isFormValid) {
      let body = {
        start_date: getStartDate(CreateScheduleData.start_date),
        end_date: new Date(CreateScheduleData.end_date),
        operation_status: CreateScheduleData?.operation_status,
        collection_operation_id: Number(
          CreateScheduleData?.collection_operation?.value
        ),
        schedule_status: ScheduleStatusEnum.DRAFT,
        is_archived: false,
        is_locked: false,
        is_flagged: false,
        is_paused: false,
        created_by: Number(user.id),
      };
      try {
        const scheduleExist = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/check-schedule/${body.start_date}/${body.end_date}/${body.collection_operation_id}`
        );
        const data = await scheduleExist.json();
        if (data) {
          if (data?.data > 0) {
            toast.error(`${data.message}`, {
              autoClose: 3000,
            });
          } else {
            const response = makeAuthorizedApiRequest(
              'POST',
              `${BASE_URL}/staffing-management/schedules`,
              JSON.stringify(body)
            );
            response.then(async (data) => {
              const val = await data.json();
              setScheduleID(val.result.scheduleData.id);
              setCollectionOperationId(body?.collection_operation_id);
              if (data?.status === 201) {
                body = {};
                setCreateScheduleData({
                  operation_status: [],
                  collection_operation: null,
                  start_date: null,
                  end_date: null,
                });
                setModalPopUp(true);
              } else if (data?.status === 400) {
                toast.error(`${data?.message?.[0] ?? data?.response}`, {
                  autoClose: 3000,
                });
              } else {
                toast.error(`${data?.message?.[0] ?? data?.response}`, {
                  autoClose: 3000,
                });
              }
            });
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const getCollectionOperation = async () => {
      try {
        setIsLoading(true);
        const userName = localStorage.getItem('user_name');
        const result = await fetchData(`/tenant-users/email/${userName}`);
        if (result?.data) {
          collectionOperation.length > 0 ?? setCollectionOperation([]);
          setUser({
            id: result?.data.id,
            name: `${result?.data.first_name} ${result?.data.last_name}`,
          });

          const units = await fetchData(
            `/staffing-management/schedules/collection_operations/list/${result?.data.id}`
          );
          if (units?.data) {
            setCollectionOperation(units.data);
            if (units?.data.length === 1) {
              CreateScheduleData.collection_operation = {
                label: units?.data[0].name,
                value: units?.data[0].id,
              };
              setCollection({
                label: units?.data[0].name,
                value: units?.data[0].id,
              });
            }
          }
          setIsLoading(false);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error(`Error fetching Collection Operations: ${error}`, {
          autoClose: 3000,
        });
      }
    };

    const getOperationStatus = async () => {
      try {
        const data = fetchData(
          '/booking-drive/operation-status?fetch_all=true'
        );
        if (data) {
          data.then((val) => setOperationStatus(val?.data));
        }
      } catch (error) {
        toast.error(`Error fetching Operation Status: ${error}`, {
          autoClose: 3000,
        });
      }
    };

    getOperationStatus();
    getCollectionOperation();
  }, [BASE_URL]);

  useEffect(() => {
    setIsLoading(false);
  }, [modalPopUp]);

  return (
    <>
      <Topbar
        BreadCrumbsData={CreateScheduleBreadCrumbData}
        BreadCrumbsTitle={'Create Schedule'}
      />
      <div
        className="mainContentInner"
        style={{
          position: 'relative',
          height: '70%',
        }}
      >
        <form
          className={styles.formcontainer}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        >
          <div className="formGroup">
            <h5
              className={styles.heading}
              style={{ display: 'flex', gap: '13px' }}
            >
              {formHeading}
              <ToolTip
                text={
                  'Select the operation status, collection operation and start date to begin scheduling. All new schedules will default to DRAFT schedule status.'
                }
                isDailyCapacity={true}
              />
            </h5>
            <div className="form-field">
              <GlobalMultiSelect
                label="Operation Status"
                data={operationStatusList?.map((operationStatusItem) => {
                  return {
                    id: operationStatusItem.id,
                    name: operationStatusItem.name,
                  };
                })}
                error={operationStatusError}
                selectedOptions={status}
                onChange={handleChangeSelectOperationStatus}
                onSelectAll={handleOperationStatusChangeAll}
                onBlur={handleOperationStatusOnBlur}
              />
            </div>
            <SelectDropdown
              label="Collection Operation*"
              options={collectionOperation?.map((item) => ({
                value: item?.id,
                label: item?.name,
              }))}
              defaultValue={CreateScheduleData.collection_operation}
              selectedValue={collection}
              onChange={handleChangeSelectCollectionOperation}
              removeDivider
              showLabel={
                CreateScheduleData.collection_operation === null ? false : true
              }
              error={collectionOperationError}
              onBlur={(e) => handleInputBlur(e, true)}
              onFocus={handleCollectionOperationDropdownFocus}
              placeholder="Collection Operation"
            />
            <div className="form-field">
              <div className="field">
                {CreateScheduleData?.start_date ? (
                  <label
                    style={{
                      fontSize: '12px',
                      top: '24%',
                      color: '#555555',
                      zIndex: 1,
                    }}
                  >
                    Start Date*
                  </label>
                ) : (
                  ''
                )}
                <ReactDatePicker
                  wrapperClassName={styles.secondDate}
                  minDate={new Date()}
                  dateFormat="MM-dd-yyyy"
                  className={`custom-datepicker ${styles.datepicker} ${
                    CreateScheduleData?.start_date ? '' : ''
                  }`}
                  placeholderText="Start Date*"
                  selected={CreateScheduleData.start_date}
                  onChange={(date) => {
                    handleChangeSelectStartDate(date);
                    let endDate = calculateEndDate(date);
                    CreateScheduleData.end_date = endDate;
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      start_date: '',
                    }));
                  }}
                  onBlur={(date) => {
                    handleInputBlur({
                      target: { value: date, name: 'start_date' },
                    });
                  }}
                />
              </div>
              {errors.start_date && (
                <div className={`error ml-1`}>
                  <p>{errors.start_date}</p>
                </div>
              )}
            </div>
            <div className="form-field">
              <ReactDatePicker
                wrapperClassName={styles.secondDate}
                label="Collection Operation*"
                minDate={new Date()}
                dateFormat="MM-dd-yyyy"
                className={`custom-datepicker ${styles.datepicker} ${
                  CreateScheduleData?.start_date ? '' : ''
                }`}
                placeholderText="End Date*"
                selected={CreateScheduleData.end_date}
                disabled
              />
            </div>
          </div>
        </form>
        <FormFooter
          enableCancel={true}
          onClickCancel={(e) => {
            e.preventDefault();
            fieldsEmptyOrNot();
          }}
          enableCreate={true}
          onCreateType={'submit'}
          onClickCreate={() => handleSubmit()}
          disabled={isLoading}
        />
      </div>
      <SuccessPopUpModal
        title={'Success!'}
        message={'Schedule Created.'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        isNavigate={true}
        redirectPath={`${listUrl}/${scheduleID}?collection_operation_id=${collectionOperationId}&schedule_status=${ScheduleStatusEnum.DRAFT}`}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost. Do you want to continue?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={cancelUrl}
      />
    </>
  );
};

export default ScheduleCreate;
