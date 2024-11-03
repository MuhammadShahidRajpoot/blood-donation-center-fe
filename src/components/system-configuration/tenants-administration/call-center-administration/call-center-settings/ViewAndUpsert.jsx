import React, { useEffect, useState } from 'react';
import TopBar from '../../../../common/topbar/index';
import SvgComponent from '../../../../common/SvgComponent';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelIconImage from '../../../../../assets/images/ConfirmCancelIcon.png';
import CallCenterForm from './CallCenterSettinsForm';
import { BreadcrumbsData, formFieldConfig } from './CallCenterObjectsData';
import axios from 'axios';
import { toast } from 'react-toastify';

const CallCenterSetting = () => {
  const [edit, setEdit] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [formData, setFormData] = useState({
    agent_standards: {
      calls_per_hour: null,
      appointments_per_hour: null,
      donors_per_hour: null,
    },
    call_settings: {
      caller_id_name: '',
      caller_id_number: '',
      callback_number: '',
      max_calls_per_rolling_30_days: null,
      max_calls: null,
    },
    no_answer_call_treatment: {
      busy_call_outcome: '',
      max_retries: null,
      no_answer_call_outcome: '',
      max_no_of_rings: null,
    },
  });
  const [validationErrors, setValidationErrors] = useState({
    agent_standards: {
      calls_per_hour: '',
      appointments_per_hour: '',
      donors_per_hour: '',
    },
    call_settings: {
      caller_id_name: '',
      caller_id_number: '',
      callback_number: '',
      max_calls_per_rolling_30_days: '',
      max_calls: '',
    },
    no_answer_call_treatment: {
      busy_call_outcome: '',
      max_retries: '',
      no_answer_call_outcome: '',
      max_no_of_rings: '',
    },
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const [selectedCallOutCome, setSelectedCallOutCome] = useState(null);
  const [selectedNACallOutCome, setSelectedNACallOutCome] = useState(null);
  const [callOutComeOptions, setCallOutComeOptions] = useState([]);
  const [id, setId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [initialCallOutCome, setInitialCallOutCome] = useState({});
  const [initialNACallOutCome, setInitialNACallOutCome] = useState({});

  const getCallCenterSettings = async (options) => {
    const outComeOptions = await options;
    setCallOutComeOptions(outComeOptions);
    try {
      let url = `${BASE_URL}/call-center-administrations/call-center-settings`;
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const { data } = response.data;
      if (data && data.id) {
        setId(data.id);
        const callOutComeOptions = outComeOptions?.find(
          (e) => e.value === data.no_answer_call_treatment.busy_call_outcome
        );
        const NACallOutComeOption = outComeOptions?.find(
          (e) =>
            e.value === data.no_answer_call_treatment.no_answer_call_outcome
        );
        setSelectedCallOutCome(callOutComeOptions);
        setSelectedNACallOutCome(NACallOutComeOption);
        setFormData({
          agent_standards: { ...data.agent_standards },
          call_settings: { ...data.call_settings },
          no_answer_call_treatment: { ...data.no_answer_call_treatment },
        });
        setInitialData({
          agent_standards: { ...data.agent_standards },
          call_settings: { ...data.call_settings },
          no_answer_call_treatment: { ...data.no_answer_call_treatment },
        });
        setInitialCallOutCome(callOutComeOptions);
        setInitialNACallOutCome(NACallOutComeOption);
      } else {
        setFormData(
          Object.fromEntries(
            formFieldConfig.map((sectionConfig) => [
              sectionConfig.sectionCode,
              Object.fromEntries(
                sectionConfig.fields.map((field) => [field.name, ''])
              ),
            ])
          )
        );
        setSelectedCallOutCome(null);
        setSelectedNACallOutCome(null);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to get Call center settings', { autoClose: 3000 });
    }
  };
  useEffect(() => {
    const getCallOutComeOptions = async () => {
      try {
        let url = `${BASE_URL}/call-center/call-outcomes?is_active=true`;
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        });
        const { data } = response.data;

        if (data && data.length) {
          return data.map((e) => ({ value: e.id, label: e.name }));
        }
      } catch (error) {
        console.log(error);
        toast.error('Failed to get Call Outcomes', { autoClose: 3000 });
      }
    };
    const options = getCallOutComeOptions();
    getCallCenterSettings(options);
  }, []);
  const handleInputChange = (
    sectionName,
    fieldName,
    value,
    fieldType,
    maxLength
  ) => {
    if (maxLength && value && value?.length > maxLength) {
      setValidationErrors((prevState) => ({
        ...prevState,
        [sectionName]: {
          ...prevState[sectionName],
          [fieldName]: `Maximum ${maxLength} characters are allowed.`,
        },
      }));
      return;
    }
    const newFormData = { ...formData };
    if (fieldName === 'busy_call_outcome') {
      setSelectedCallOutCome(value);
      value = value?.value;
    } else if (fieldName === 'no_answer_call_outcome') {
      setSelectedNACallOutCome(value);
      value = value?.value;
    }
    if (
      typeof value === 'string' &&
      value.startsWith('0') &&
      value.length > 1
    ) {
      value = value.slice(1);
    }

    newFormData[sectionName][fieldName] =
      fieldType === 'number' ? value && parseInt(value, 10) : value;
    setFormData(newFormData);
    setValidationErrors((prevState) => ({
      ...prevState,
      [sectionName]: {
        ...prevState[sectionName],
        [fieldName]: '',
      },
    }));
    setDirty(true);
  };
  const handleBlur = (
    sectionName,
    fieldName,
    value,
    displayName,
    fieldType
  ) => {
    const newValidationErrors = { ...validationErrors };
    const fieldConfig = getFieldConfig(sectionName, fieldName);
    const isRequired = fieldConfig.required;
    if (value === 'select') {
      value = formData[sectionName][fieldName] && value;
    }
    if (isRequired && (value === null || value === '' || value === undefined)) {
      newValidationErrors[sectionName][
        fieldName
      ] = `${displayName} is required`;
    } else {
      delete newValidationErrors[sectionName][fieldName];
    }
    setValidationErrors(newValidationErrors);
  };

  const getFieldConfig = (sectionName, fieldName) => {
    const sectionConfig = formFieldConfig.find(
      (config) => config.sectionCode === sectionName
    );
    return sectionConfig.fields.find((field) => field.name === fieldName);
  };

  const validateForm = () => {
    const newValidationErrors = {};
    formFieldConfig.forEach((sectionConfig) => {
      const sectionName = sectionConfig.sectionCode;
      newValidationErrors[sectionName] = {};
      sectionConfig.fields.forEach((fieldConfig) => {
        const fieldName = fieldConfig.name;
        const fieldValue = formData[sectionName][fieldName];
        const isRequired = fieldConfig.required;
        if (
          isRequired &&
          (fieldValue === null || fieldValue === '' || fieldValue === undefined)
        ) {
          newValidationErrors[sectionName][
            fieldName
          ] = `${fieldConfig.displayName} is required`;
        }
      });
    });

    setValidationErrors(newValidationErrors);
    return Object.keys(newValidationErrors).every(
      (section) => Object.keys(newValidationErrors[section]).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      let url = `${BASE_URL}/call-center-administrations/call-center-settings/${
        id ? id : ''
      }`;
      const requestMethod = id ? 'put' : 'post';
      const res = await axios[requestMethod](url, formData, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${bearerToken}`,
        },
      });
      const { data, response } = res.data;
      if (data && data.id) {
        id ? setShowSuccessDialog(true) : setShowModal(true);
        setEdit(false);
        getCallCenterSettings(callOutComeOptions);
      } else {
        setEdit(true);
        toast.error(response || 'Failed to Post Call center settings', {
          autoClose: 3000,
        });
      }
      setIsLoading(false);
      setDirty(false);
    } catch (error) {
      console.log(error);
      setEdit(true);
      toast.error(error?.response?.data?.message?.map((e) => e).join(', '), {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={`Call Center Settings`}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      {!edit && (
        <div
          className="buttons"
          style={{
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'end',
            padding: '0 20px',
          }}
          onClick={() => setEdit(true)}
        >
          <div style={{ marginTop: '9px', color: '#387de5' }}>
            <span className="icon">
              <SvgComponent name="EditIcon" />
            </span>
            <span className="text" style={{ fontSize: '16px' }}>
              Edit
            </span>
          </div>
        </div>
      )}
      <div
        className="mainContentInner"
        style={{ paddingTop: `${edit ? '45px' : ''}` }}
      >
        <CallCenterForm
          edit={edit}
          formData={formData}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
          formValidationErrors={validationErrors}
          callOutComeOptions={callOutComeOptions}
          selectedCallOutCome={selectedCallOutCome}
          selectedNACallOutCome={selectedNACallOutCome}
        />

        <section
          className={`popup full-section ${
            showConfirmationDialog ? 'active' : ''
          }`}
          onClick={(e) => e.preventDefault()}
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
                  id="persistCallCenterSettings_CC"
                  onClick={() => {
                    setShowConfirmationDialog(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  id="discardCallCenterSettings_CC"
                  onClick={() => {
                    setEdit(false);
                    setFormData({
                      agent_standards: { ...initialData.agent_standards },
                      call_settings: { ...initialData.call_settings },
                      no_answer_call_treatment: {
                        ...initialData.no_answer_call_treatment,
                      },
                    });
                    setSelectedCallOutCome(initialCallOutCome);
                    setSelectedNACallOutCome(initialNACallOutCome);
                    setValidationErrors(
                      formFieldConfig.reduce((acc, sectionConfig) => {
                        acc[sectionConfig.sectionCode] = {};
                        return acc;
                      }, {})
                    );
                    setDirty(false);
                    setShowConfirmationDialog(false);
                  }}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </section>

        <SuccessPopUpModal
          title="Success!"
          message={`Call Center Settings updated.`}
          modalPopUp={showSuccessDialog}
          isNavigate={false}
          setModalPopUp={setShowSuccessDialog}
          showActionBtns={true}
        />
        <SuccessPopUpModal
          title="Success!"
          message={`Call Center Settings created.`}
          modalPopUp={showModal}
          isNavigate={false}
          setModalPopUp={setShowModal}
          showActionBtns={true}
        />
        {edit && (
          <div className="form-footer">
            <button
              className="btn btn-secondary border-0 btn-md"
              id="cancelCallCenterSettings_CC"
              onClick={() => {
                dirty ? setShowConfirmationDialog(true) : setEdit(false);
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isloading}
              id="saveCallCenterSettings_CC"
              className={`btn btn-primary btn-md`}
              onClick={() => {
                handleSubmit();
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallCenterSetting;
