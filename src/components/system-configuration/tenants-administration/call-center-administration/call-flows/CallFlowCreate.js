import React, { useState } from 'react';
import TopBar from '../../../../common/topbar/index';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import FormInput from '../../../../common/form/FormInput';
import { CallFlowsCreateCrumbsData } from './CallFlowsCrumbsData';

import { useForm, Controller } from 'react-hook-form';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import FormRadioButtons from './radioButtons';

const CallFlowCreate = () => {
  const { control } = useForm();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    call_flow_name: '',
    is_default: false,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [modalPopUp, setModalPopUp] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [isSetAsDefault, setAsDefault] = useState(false);
  const [
    callerAnswerCallTransferToAgentChecked,
    setCallerAnswerCallTransferToAgentChecked,
  ] = useState(true);
  const [
    VMBoxDetectedTransferToAgentChecked,
    setVMBoxDetectedTransferToAgentChecked,
  ] = useState(true);

  const handleCheckboxChange = (e, name) => {
    const { checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  let hasData = formData.call_flow_name;

  hasData = Boolean(hasData);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
          'POST',
          `${BASE_URL}/call-center/call-flows`,
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
    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });

    let errorMessage = '';

    const fieldDefinition = fieldNames.find((field) => field.name === name);

    if (fieldDefinition?.required && value.toString().trim() === '') {
      errorMessage = `${fieldDefinition.label} is required.`;
    }

    if (
      fieldDefinition?.maxLength &&
      value.length > fieldDefinition?.maxLength
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

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={CallFlowsCreateCrumbsData}
        BreadCrumbsTitle={'Call Flows'}
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
                  Create Call Flow
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
                      onChange={(e) => setAsDefault(!isSetAsDefault)}
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
                          }}
                          checked={VMBoxDetectedTransferToAgentChecked == false}
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
        <div className="form-footer">
          <p
            className={`mb-0 simple-text btn`}
            onClick={(e) => {
              e.preventDefault();
              !hasData
                ? navigate(
                    '/system-configuration/tenant-admin/call-center-admin/call-flows'
                  )
                : setCloseModal(true);
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
            message="Call Flow Created Successfully."
            modalPopUp={modalPopUp}
            isNavigate={true}
            setModalPopUp={setModalPopUp}
            showActionBtns={true}
            redirectPath={
              '/system-configuration/tenant-admin/call-center-admin/call-flows'
            }
          />
          <CancelModalPopUp
            title="Confirmation"
            message="Unsaved changes will be lost. Do you want to continue?"
            modalPopUp={closeModal}
            isNavigate={true}
            setModalPopUp={setCloseModal}
            redirectPath={
              '/system-configuration/tenant-admin/call-center-admin/call-flows'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CallFlowCreate;
