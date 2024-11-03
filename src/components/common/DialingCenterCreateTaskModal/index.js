import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Controller } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import jwt from 'jwt-decode';
import styles from './index.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import FormText from '../form/FormText';
import SelectDropdown from '../../common/selectDropdown';
import CancelIconImage from '../../../assets/images/ConfirmCancelIcon.png';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import SuccessPopUpModal from '../successModal';

const DialingCenterCreateTaskModal = ({ openModal, setOpenModal, data }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [showConfirmationDialog, setShowConfirmationDialog] = useState('');
  const [tenantUser, setTenantUsers] = useState();
  const [modalPopUp, setModalPopUp] = useState(false);

  const statusOptions = [
    { label: 'Not Started', value: '1' },
    { label: 'In Progress', value: '2' },
    { label: 'Deferred', value: '3' },
    { label: 'Completed', value: '4' },
    { label: 'Cacelled', value: '5' },
  ];

  const schema = Yup.object().shape({
    taskName: Yup.string().required('Task Name is required.'),
    description: Yup.string().required('Description must be required'),
    status: Yup.object().required('Status is required.'),
    assignedTo: Yup.object().required('Assigned To is required.'),
    assignedBy: Yup.object().required('Assigned By is required.'),
    dueDate: Yup.date()
      .required('Due Date is required.')
      .min(new Date(), 'Due Date must be in the future'),
  });

  useEffect(() => {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const getAssigneeUsers = async () => {
      const accessToken = localStorage.getItem('token');
      const result = await fetch(`${BASE_URL}/user/all-users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await result.json();
      if (data?.data) {
        setTenantUsers([
          ...(data?.data.map((item) => {
            return {
              value: item.id,
              label: item?.first_name + ' ' + item?.last_name,
            };
          }) || []),
        ]);
      }
    };

    getAssigneeUsers();
  }, []);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    const decodeToken = jwt(jwtToken);
    const selectedAssignedBy =
      tenantUser &&
      tenantUser.find((item) => {
        return +item.value === +decodeToken.id;
      });
    if (selectedAssignedBy) {
      setValue('assignedBy', selectedAssignedBy);
    }
  }, [tenantUser]);

  const {
    setValue,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const onSubmit = async () => {
    setModalPopUp(true);
    const values = getValues();
    const taskableId = 1; //Need to Update Id
    const body = {
      assigned_to: parseInt(values?.assignedTo?.value),
      assigned_by: parseInt(values?.assignedBy?.value),
      task_name: values?.taskName,
      description: values?.description,
      due_date: moment(values?.dueDate).format('MM/DD/YYYY'),
      status: parseInt(values?.status?.value),
    };

    try {
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/tasks?taskable_id=${taskableId}&taskable_type=donors`,
        JSON.stringify(body)
      );
      if (response.status === 201) {
        setModalPopUp(true);
      }
      return;
    } catch (error) {
      console.error('Error making API request:', error);
      toast.error(`Failed to save task`, { autoClose: 3000 });
      return;
    }
  };

  const closeModelHandler = (e) => {
    const values = getValues();
    if (
      values?.assignedTo?.value ||
      values?.description ||
      values?.taskName ||
      values?.status ||
      values?.dueDate
    ) {
      setShowConfirmationDialog(true);
    } else {
      setShowConfirmationDialog(false);
      setOpenModal(false);
    }
    e.preventDefault();
  };

  const handleConfirmationResult = (show) => {
    if (!show) {
      setShowConfirmationDialog(show);
    } else {
      setShowConfirmationDialog(false);
      setOpenModal(false);
    }
  };

  if (!openModal) return null;
  return (
    <>
      {modalPopUp ? (
        <SuccessPopUpModal
          title={'Success!'}
          message={'Task created.'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          onConfirm={() => {
            setOpenModal(false);
          }}
          showActionBtns={true}
          isNavigate={false}
          redirectPath={false}
        />
      ) : (
        <section
          className={`${styles.CreateMessageModal} popup full-section active`}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={`formGroup ${styles.modal}`}>
              <h5>Create Task</h5>
              <div className="d-flex justify-content-between w-100">
                <Controller
                  name={`assignedTo`}
                  control={control}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'Assigned To*'}
                      name={'assignedTo'}
                      selectedValue={field.value}
                      removeDivider
                      options={tenantUser}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('assignedTo', e);
                      }}
                      error={errors?.assignedTo?.message}
                    />
                  )}
                />

                <Controller
                  name={`assignedBy`}
                  control={control}
                  render={({ field }) => (
                    <SelectDropdown
                      placeholder={'Assigned By*'}
                      name={'assignedBy'}
                      selectedValue={field.value}
                      removeDivider
                      options={tenantUser}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        field.onChange(e);
                        setValue('assignedBy', e);
                      }}
                      disabled
                      error={errors?.assignedBy?.message}
                    />
                  )}
                />
              </div>

              <div className="form-field">
                <div className="field">
                  <Controller
                    name="taskName"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          maxLength={50}
                          className="form-control"
                          onChange={(e) => {
                            field.onChange(e);
                            setValue('taskName', e.target.value);
                          }}
                        />
                        <label>Task Name*</label>
                      </>
                    )}
                  />
                </div>
                {errors.taskName && (
                  <div className={styles.error}>{errors.taskName.message}</div>
                )}
              </div>
              <div className=" w-100" style={{ root: 'w-100' }}>
                <div className="field">
                  <Controller
                    style={{
                      root: 'w-100',
                    }}
                    name={`description`}
                    control={control}
                    render={({ field }) => (
                      <FormText
                        style={{
                          root: 'w-204',
                          width: '204%',
                        }}
                        name="description"
                        type="text"
                        displayName="Description*"
                        value={field.value ? field.value : ''}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          const { value } = e.target;
                          field.onChange(e);

                          setValue('description', value);
                        }}
                        error={errors?.description?.message}
                      />
                    )}
                  />

                  <div className={styles.desError}></div>
                </div>
              </div>

              <div className={`form-field`}>
                <div className={`field`}>
                  <Controller
                    name="dueDate"
                    placeholder="Due Date*"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        className={`custom-datepicker ${
                          field.dueDate ? '' : 'effectiveDate'
                        }`}
                        dateFormat="MM-dd-yyyy"
                        placeholderText="Due Date*"
                        name="dueDate"
                        selected={field.value}
                        onChange={(date) => {
                          field.onChange(date);
                          setValue('dueDate', date);
                        }}
                        helperText={errors?.dueDate?.message}
                        error={errors?.dueDate?.message && field.value === null}
                      />
                    )}
                  />

                  {errors.dueDate && (
                    <div className={styles.error}>{errors.dueDate.message}</div>
                  )}
                </div>
              </div>

              <Controller
                name={`status`}
                control={control}
                render={({ field }) => (
                  <SelectDropdown
                    placeholder={'Select Status*'}
                    name={'status'}
                    selectedValue={field.value}
                    removeDivider
                    options={statusOptions}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('status', e);
                    }}
                    error={errors?.status?.message}
                  />
                )}
              />

              <div className={`buttons d-flex justify-content-end gap-3 w-100`}>
                <button
                  className="btn btn-md btn-secondary"
                  style={{ color: '#387de5' }}
                  onClick={closeModelHandler}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.buttonCancel} btn btn-md btn-primary`}
                  type="submit"
                >
                  Create
                </button>
              </div>
            </div>
          </form>

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
        </section>
      )}
    </>
  );
};

export default DialingCenterCreateTaskModal;
