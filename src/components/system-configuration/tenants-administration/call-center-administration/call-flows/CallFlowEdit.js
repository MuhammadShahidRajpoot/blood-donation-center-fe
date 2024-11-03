import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../../../common/topbar/index';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import FormInput from '../../../../common/form/FormInput';
import { Controller, useForm } from 'react-hook-form';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import FormRadioButtons from './radioButtons';
import { CallFlowsEditCrumbsData } from './CallFlowsCrumbsData';
import { compareAndSetCancel } from '../../../../../helpers/compareAndSetCancel';

const CallFlowEdit = () => {
  const { control } = useForm();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const params = useParams();

  const [formData, setFormData] = useState({
    call_flow_name: '',
    is_default: false,
    is_active: true,
  });
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [archiveStatus, setArchiveStatus] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSetAsDefault, setAsDefault] = useState(false);
  const [
    callerAnswerCallTransferToAgentChecked,
    setCallerAnswerCallTransferToAgentChecked,
  ] = useState(true);
  const [
    VMBoxDetectedTransferToAgentChecked,
    setVMBoxDetectedTransferToAgentChecked,
  ] = useState(true);
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(false);

  const getCallFlowData = async () => {
    const result = await makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/call-center/call-flows/${params.id}`
    );
    const data = result.data;
    setCallerAnswerCallTransferToAgentChecked(
      data?.data?.caller_answer_call === 'transfer to agent' ? true : false
    );
    setVMBoxDetectedTransferToAgentChecked(
      data?.data?.vmbox_detected === 'transfer to agent' ? true : false
    );
    const actualCallFlowData = {
      call_flow_name: data?.data?.name,
      is_active: data?.data?.is_active,
    };
    setFormData(actualCallFlowData);
    setCompareData({
      ...actualCallFlowData,
      isSetAsDefault: data?.data?.is_default,
      callerAnswerCallTransferToAgentChecked:
        data?.data?.caller_answer_call === 'transfer to agent' ? true : false,
      VMBoxDetectedTransferToAgentChecked:
        data?.data?.vmbox_detected === 'transfer to agent' ? true : false,
    });
    setAsDefault(data?.data?.is_default);
  };

  useEffect(() => {
    getCallFlowData();
  }, []);

  useEffect(() => {
    setNewFormData({
      ...formData,
      isSetAsDefault,
      callerAnswerCallTransferToAgentChecked,
      VMBoxDetectedTransferToAgentChecked,
    });
  }, [
    formData,
    isSetAsDefault,
    VMBoxDetectedTransferToAgentChecked,
    callerAnswerCallTransferToAgentChecked,
  ]);

  const handleSubmit = async (e) => {
    const isValid = validateForm();

    if (isValid) {
      const body = {
        name: formData.call_flow_name,
        is_default: isSetAsDefault,
        caller_answer_call: callerAnswerCallTransferToAgentChecked
          ? 'transfer to agent'
          : 'play voice message',
        vmbox_detected: VMBoxDetectedTransferToAgentChecked
          ? 'transfer to agent'
          : 'play voice message',
        is_active: formData.is_active,
      };

      try {
        const res = await makeAuthorizedApiRequestAxios(
          'PUT',
          `${BASE_URL}/call-center/call-flows/${+params.id}`,
          JSON.stringify(body)
        );
        let { status_code, response } = res.data;

        if (status_code === 204) {
          setModalPopUp(true);
          compareAndSetCancel(
            newFormData,
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
    }
  };

  const fieldNames = [
    {
      label: 'Call Flow Name',
      name: 'call_flow_name',
      required: true,
      maxLength: 50,
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

      if (fieldDefinition?.required && value?.toString().trim() === '') {
        errorMessage = `${fieldDefinition.label} is required.`;
      }

      if (
        fieldDefinition?.maxLength &&
        value?.length > fieldDefinition?.maxLength
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

  const handleCheckboxChange = (e, name) => {
    const { checked } = e.target;
    const data = {
      ...formData,
      [name]: checked,
    };
    setFormData(data);
    compareAndSetCancel(data, compareData, showCancelBtn, setShowCancelBtn);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const data = {
      ...formData,
      [name]: value,
    };
    setFormData(data);
    compareAndSetCancel(data, compareData, showCancelBtn, setShowCancelBtn);

    let errorMessage = '';

    const fieldDefinition = fieldNames.find((field) => field.name === name);

    if (fieldDefinition?.required && value?.toString().trim() === '') {
      errorMessage = `${fieldDefinition.label} is required.`;
    }

    if (
      fieldDefinition?.maxLength &&
      value?.length > fieldDefinition?.maxLength
    ) {
      errorMessage = `Maximum ${fieldDefinition.maxLength} characters are allowed.`;
    }
    const setError = (fieldName, errorMsg) => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMsg,
      }));
    };
    setError(name, errorMessage);
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

  const handleArchive = async () => {
    if (params.id) {
      setModalPopUp(false);
      const body = {
        is_archived: true,
      };
      try {
        const res = await makeAuthorizedApiRequestAxios(
          'PATCH',
          `${BASE_URL}/call-center/call-flows/${params.id}`,
          JSON.stringify(body)
        );
        const { status, status_code } = res.data;
        if (status === 'success') {
          setArchiveStatus(true);
        } else if (status_code == 400) {
          toast.error('Call Flow in use. It cannot be archived.', {
            autoClose: 3000,
          });
        } else {
          toast.error('Failed to Archive Call Flow.', {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error('Failed to Archive Call Flow.', {
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className={`position-relative ${styles.footerminheight}`}>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={CallFlowsEditCrumbsData}
          BreadCrumbsTitle={'Edit Call Flows'}
        />
        <div className="mainContentInner form-container">
          <form className={styles.formcontainer}>
            <div className="formGroup">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '500' }}>
                    Edit Call Flow
                  </p>
                </div>
                <div>
                  <Controller
                    name="setasdefault"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormCheckbox
                        name={field.name}
                        displayName="Set as Default"
                        checked={isSetAsDefault}
                        classes={{
                          root: `mt-2 mb-4 ${styles.customCheckbox}`,
                        }}
                        onChange={(e) => {
                          setAsDefault(!isSetAsDefault);
                          setShowCancelBtn(true);
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              <FormInput
                label="Call Flow Name"
                displayName="Call Flow Name"
                name="call_flow_name"
                error={errors?.call_flow_name}
                required
                value={formData?.call_flow_name}
                onChange={handleInputChange}
              />
              <div
                className="form-field w-100"
                style={{ display: 'flex', gap: '2rem' }}
              >
                <div className="form-field w-50">
                  <h5>Caller Answers Call</h5>
                  <div className={`${styles.radioInputCont}`}>
                    <div
                      className={`${styles.radioBtnGap} form-field `}
                      style={{ flex: '1' }}
                    >
                      <Controller
                        name="Transfer"
                        control={control}
                        render={({ field }) => (
                          <FormRadioButtons
                            label={'Transfer to agent'}
                            value={field.value}
                            className=""
                            lableFontSize={'14px' || ''}
                            selected={field.value}
                            handleChange={() => {
                              setCallerAnswerCallTransferToAgentChecked(
                                !callerAnswerCallTransferToAgentChecked
                              );
                              setShowCancelBtn(true);
                            }}
                            checked={callerAnswerCallTransferToAgentChecked}
                          />
                        )}
                      />
                    </div>
                    <div
                      className={`${styles.radioBtnGap} form-field`}
                      style={{ flex: '1' }}
                    >
                      <Controller
                        name="Voice"
                        control={control}
                        render={({ field }) => (
                          <FormRadioButtons
                            label={'Play voice message'}
                            value={field.value}
                            className=""
                            lableFontSize={'14px' || ''}
                            selected={field.value}
                            disabled={false}
                            handleChange={() => {
                              setCallerAnswerCallTransferToAgentChecked(
                                !callerAnswerCallTransferToAgentChecked
                              );
                              setShowCancelBtn(true);
                            }}
                            checked={
                              callerAnswerCallTransferToAgentChecked == false
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-field w-50">
                  <h5>VMBox Detected</h5>
                  <div className={`${styles.radioInputCont}`}>
                    <div
                      className={`${styles.radioBtnGap} form-field `}
                      style={{ flex: '1' }}
                    >
                      <Controller
                        name="Transfer"
                        control={control}
                        render={({ field }) => (
                          <FormRadioButtons
                            label={'Transfer to agent'}
                            value={field.value}
                            className=""
                            lableFontSize={'14px' || ''}
                            selected={'product'}
                            disabled={false}
                            handleChange={() => {
                              setVMBoxDetectedTransferToAgentChecked(
                                !VMBoxDetectedTransferToAgentChecked
                              );
                              setShowCancelBtn(true);
                            }}
                            checked={VMBoxDetectedTransferToAgentChecked}
                          />
                        )}
                      />
                    </div>
                    <div
                      className={`${styles.radioBtnGap} form-field`}
                      style={{ flex: '1' }}
                    >
                      <Controller
                        name="Voice"
                        control={control}
                        render={({ field }) => (
                          <FormRadioButtons
                            label={'Play voice message'}
                            value={field.value}
                            className=""
                            lableFontSize={'14px' || ''}
                            selected={field.value}
                            disabled={false}
                            handleChange={() => {
                              setVMBoxDetectedTransferToAgentChecked(
                                !VMBoxDetectedTransferToAgentChecked
                              );
                              setShowCancelBtn(true);
                            }}
                            checked={
                              VMBoxDetectedTransferToAgentChecked == false
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                    name="status"
                    onChange={(e) => {
                      handleCheckboxChange(e, 'is_active');
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="form-footer">
        <>
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
            : 'Call Flow Updated.'
        }
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={handleArchive}
        isNavigate={isNavigate}
        redirectPath={
          '/system-configuration/tenant-admin/call-center-admin/call-flows'
        }
      />

      <SuccessPopUpModal
        title="Success!"
        message="Call Flow Archived Successfully."
        modalPopUp={archiveStatus}
        isNavigate={true}
        setModalPopUp={setArchiveStatus}
        showActionBtns={true}
        redirectPath={
          '/system-configuration/tenant-admin/call-center-admin/call-flows'
        }
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={
          '/system-configuration/tenant-admin/call-center-admin/call-flows'
        }
      />
    </div>
  );
};

export default CallFlowEdit;
