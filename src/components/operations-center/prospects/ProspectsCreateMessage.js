import React, { useEffect, useState } from 'react';
import TopBar from '../../common/topbar/index';
import axios from 'axios';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../common/successModal';
import CancelModalPopUp from '../../common/cancelModal';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';
import { Editor } from 'react-draft-wysiwyg';
import { ContentState, EditorState, Modifier, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import SelectDropdown from '../../common/selectDropdown';
import DatePicker from '../../common/DatePicker';
import styles from './index.module.scss';
import htmlToDraft from 'html-to-draftjs';
import FormFooter from '../../common/FormFooter/index.jsx';
import moment from 'moment';
import { covertToTimeZone } from '../../../helpers/convertDateTimeToTimezone.js';
import jwt from 'jwt-decode';

const variablesKey = [
  {
    name: 'CP Title',
    value: 'cp_title',
  },
  {
    name: 'CP First',
    value: 'cp_first',
  },
  {
    name: 'CP Last',
    value: 'cp_last',
  },
  {
    name: 'Account Name',
    value: 'account_name',
  },
  {
    name: 'Next Drive Date',
    value: 'next_drive_date',
  },
  {
    name: 'Recruiter',
    value: 'recruiter',
  },
  {
    name: 'Last Eligible Date',
    value: 'last_eligible_date',
  },
];

const ProspectsCreateMessage = () => {
  const { id } = useParams();
  const bearerToken = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const location = useLocation();
  const targetId = id ?? location?.state?.id;
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [emailData, setEmailData] = useState('<p></p>/n');
  const [templateTypeData, setTemplateTypeData] = useState([]);
  const [changesMadeMessage, setChangesMadeMessage] = useState(false);
  const [errors, setErrors] = useState({ template_name: '' });
  const [IsLoading, setIsLoading] = useState(false);

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Prospect',
      class: 'active-label',
      link: OS_PROSPECTS_PATH.LIST,
    },
    ...(id
      ? [
          {
            label: 'View Prospect',
            class: 'active-label',
            link: OS_PROSPECTS_PATH.ABOUT.replace(':id', id),
          },
          {
            label: 'Edit Message',
            class: 'active-label',
            link: OS_PROSPECTS_PATH.EDIT_MESSAGE,
          },
        ]
      : [
          {
            label: 'Build Segment',
            class: 'active-label',
            link: OS_PROSPECTS_PATH.BUILD_SEGMENTS,
          },
          {
            label: 'Create Message',
            class: 'active-label',
            link: OS_PROSPECTS_PATH.CREATE_MESSAGE,
          },
        ]),
  ].filter(Boolean);
  const validateErrors = () => {
    let errorsTemp = {};
    let isError = false;
    if (!emailData || emailData === '<p></p>/n') {
      errorsTemp = { ...errors, emailData: 'Message is required.' };
      isError = true;
    }
    if (!scheduleDate) {
      errorsTemp = {
        ...errorsTemp,
        scheduleDate: 'Schedule send is required.',
      };
      isError = true;
    }
    if (!selectedTemplate) {
      errorsTemp = { ...errorsTemp, template_name: 'Template is required.' };
      isError = true;
    }
    setErrors({ ...errorsTemp });
    return isError;
  };

  useEffect(() => {
    if (id || location?.state?.id) {
      getMessageDetails();
    }
  }, [id, location?.state?.id]);
  useEffect(() => {
    if (
      scheduleDate &&
      removeTimeFromDate(new Date(scheduleDate)) < getCurrentDateFormatted() &&
      id
    ) {
      navigate(OS_PROSPECTS_PATH.LIST);
    }
  }, [scheduleDate]);

  function removeTimeFromDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  const getMessageDetails = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/operations-center/prospects/${targetId}/communication`,
        {
          headers: {
            method: 'GET',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();
      if (data?.data) {
        const notes = data?.data;
        setScheduleDate(new Date(notes.schedule_date));
        setSelectedTemplate(notes.template_id);
        const replacedMessage = notes?.message?.replace(
          /<([^>]+)>/g,
          (match, p1) => {
            const variable = variablesKey.find((item) => item.value === p1);
            return variable ? `&lt;${variable.value}&gt;` : match;
          }
        );

        const contentBlock = htmlToDraft(replacedMessage);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(
            contentBlock.contentBlocks
          );
          const editorState = EditorState.createWithContent(contentState);
          setEditorState(editorState);
          setEmailData(notes.message);
        }
      }
      if (data?.status !== 'success' && data?.status_code === 404) {
        toast.error(`${data?.response}`, { autoClose: 3000 });
        setTimeout(() => {
          navigate(OS_PROSPECTS_PATH.LIST);
        }, 1000);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  const getCurrentDateFormatted = () => {
    const currentDate = removeTimeFromDate(new Date());
    return currentDate;
  };

  const submitHandler = async (close) => {
    if (validateErrors()) return;
    if (
      errors?.scheduleDate ||
      errors?.emailData ||
      errors?.template_name ||
      emailData === '<p></p>/n'
    ) {
      return;
    }

    if (id) {
      try {
        setIsLoading(true);
        const res = await axios.put(
          `${BASE_URL}/operations-center/prospects/${id}/communication`,
          {
            template_id: selectedTemplate?.value,
            message: emailData.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            schedule_date: covertToTimeZone(moment(scheduleDate)),
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        setIsLoading(false);
        if (res?.data?.status_code === 201 || res?.data?.status_code === 200) {
          if (close) setShowSuccessMessage(true);
        }
      } catch (error) {
        console.log(error);
        toast.error('Failed to save');
      }
    } else {
      if (
        !location?.state?.name ||
        !location?.state?.description ||
        !location?.state?.blueprints
      ) {
        toast.dismiss();
        return toast.error(
          'One or more prospect details missing please start from create prospect screen.'
        );
      }
      try {
        setIsLoading(true);
        const res = await axios.post(
          `${BASE_URL}/operations-center/prospects`,
          {
            name: location?.state?.name,
            description: location?.state?.description,
            status: location?.state?.is_active,
            blueprints_ids: location?.state?.blueprints,
            template_id: selectedTemplate?.value ?? 1,
            message: emailData.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            schedule_date: covertToTimeZone(moment(scheduleDate)),
            start_date: covertToTimeZone(moment(location?.state?.start_date)),
            end_date: covertToTimeZone(moment(location?.state?.end_date)),
            min_projection: Number(location?.state?.min_projection) ?? null,
            max_projection: Number(location?.state?.max_projection) ?? null,
            eligibility: Number(location?.state?.eligibility) ?? null,
            distance: Number(location?.state?.distance) ?? null,
            location_type: location?.state?.location_type,
            organizational_level_id: location?.state?.organizational_level_id,
          },
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        setIsLoading(false);
        if (res?.data?.response === 'Name already exists.') {
          toast.error('Prospect with this name already exists.');
        }

        if (res?.data?.status_code === 201) {
          setShowSuccessMessage(true);
        }
      } catch (error) {
        toast.error('Error while creating prospect');
        console.log({ error });
        setIsLoading(false);
      }
    }
  };
  const handleCancel = () => {
    if (emailData !== '<p></p>/n' || scheduleDate || selectedTemplate)
      setShowCancelModal(true);
    else navigate(-1);
  };

  useEffect(() => {
    if (templateTypeData?.length > 0 && targetId) {
      const temp = templateTypeData.find((x) => x.value === selectedTemplate);
      setSelectedTemplate({
        value: temp?.value,
        label: temp?.label,
        previewUrl: temp?.previewUrl,
      });
    }
  }, [templateTypeData]);
  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    const decodeToken = jwt(jwtToken);
    if (decodeToken?.tenantId) {
      fetchTenantData(decodeToken?.tenantId);
    }
  }, []);
  const fetchTenantData = async (tenantId) => {
    try {
      const token = localStorage.getItem('token');
      const data = await axios.get(`${BASE_URL}/tenants/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (data?.data?.status_code === 200) {
        if (data?.data?.data?.daily_story_campaigns) {
          fetchTemplateData(data?.data?.data?.daily_story_campaigns);
        }
      }
    } catch (error) {
      console.error('Error templates:', error);
    }
  };
  const fetchTemplateData = async (campaign) => {
    try {
      const { data, status } = await axios.get(
        `${BASE_URL}/contacts/volunteers/communications/email-templates/${campaign}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (status === 200) {
        if (data?.Response?.emails) {
          const templateData = data?.Response?.emails?.map((templateTemp) => ({
            value: templateTemp?.emailId,
            label: templateTemp?.name,
            previewUrl: templateTemp?.previewUrl,
          }));
          setTemplateTypeData(templateData);
        }
      } else {
        setTemplateTypeData([]);
      }
    } catch (error) {
      console.error('Error templates:', error);
    }
  };
  const handleTemplateChange = (value) => {
    if (!value) {
      setErrors({ ...errors, template_name: 'Template is required.' });
    } else setErrors({ ...errors, template_name: '' });
    setSelectedTemplate(value);
  };
  const token = localStorage.getItem('token');

  const handleVariableClick = (value) => {
    const currentContentState = editorState.getCurrentContent();
    const currentSelectionState = editorState.getSelection();

    const contentWithEntity = currentContentState.createEntity(
      'VARIABLE',
      'IMMUTABLE',
      { value }
    );
    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    const text = `<${value}>`;
    const newContentState = Modifier.replaceText(
      currentContentState,
      currentSelectionState,
      text,
      null,
      entityKey
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'insert-characters'
    );
    setEditorState(newEditorState);
    const contentState = newEditorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const contentAsHtml = draftToHtml(rawContentState);
    setEmailData(contentAsHtml);
  };
  const showTemplateWarning = () => {
    toast.warn('Select template to preview.');
  };
  return (
    <div className="mainContent ">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Prospect'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form>
          <div className="formGroup">
            <div className="d-flex w-100">
              <h5>{id ? 'Edit Message' : 'Create Message'}</h5>
              {selectedTemplate?.previewUrl ? (
                <Link
                  className={styles.linkPreview}
                  target="_blank"
                  to={selectedTemplate?.previewUrl}
                >
                  Preview
                </Link>
              ) : (
                <Link
                  className={styles.linkPreview}
                  onClick={showTemplateWarning}
                >
                  Preview
                </Link>
              )}
            </div>
            <div className="d-flex">
              {variablesKey?.map((item) => {
                return (
                  <p
                    onClick={() => handleVariableClick(item.value)}
                    className={`${styles.badge}`}
                    key={item.name}
                  >
                    {item.name}
                  </p>
                );
              })}
            </div>
            <div
              style={{
                overflow: 'auto',
                height: '300px',
                border: '1px solid #F1F1F1',
                borderRadius: '8px',
              }}
              className="w-100 form-field"
            >
              <Editor
                editorState={editorState}
                onBlur={() => {
                  if (emailData === '<p></p>\n' || !emailData)
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      emailData: 'Message is required.',
                    }));
                  else
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      emailData: '',
                    }));
                }}
                onEditorStateChange={setEditorState}
                onChange={(state) => {
                  const contentAsHTML = draftToHtml(state);
                  setEmailData(contentAsHTML);
                  if (
                    (contentAsHTML === '<p></p>\n' || !contentAsHTML) &&
                    changesMadeMessage
                  )
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      emailData: 'Message is required.',
                    }));
                  else {
                    setChangesMadeMessage(true);
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      emailData: '',
                    }));
                  }
                }}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
                toolbar={{
                  options: [
                    'inline',
                    'fontSize',
                    'textAlign',
                    'list',
                    'blockType',
                    'link',
                    'history',
                  ],
                  inline: {
                    options: ['bold', 'italic', 'underline'],
                  },
                  fontSize: {
                    options: [
                      8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96,
                    ],
                  },
                  textAlign: {
                    options: ['left', 'center'],
                  },
                  list: {
                    options: ['ordered'],
                  },

                  blockType: {
                    inDropdown: true,
                    options: [
                      'Normal',
                      'H1',
                      'H2',
                      'H3',
                      'H4',
                      'H5',
                      'H6',
                      'BlockType',
                      'Code',
                      { label: 'My Custom Block', style: 'my-custom-block' },
                    ],
                  },
                  link: {
                    options: ['link'],
                  },
                }}
              />
            </div>
            {errors?.emailData && (
              <div>
                <p className={styles.error}>{errors.emailData}</p>
              </div>
            )}
            <div className="mt-2 w-100" />
            <SelectDropdown
              placeholder={'Select Template*'}
              defaultValue={selectedTemplate}
              selectedValue={selectedTemplate}
              removeDivider
              showLabel
              onBlur={() => {
                selectedTemplate?.value
                  ? setErrors((prevErrors) => ({
                      ...prevErrors,
                      template_name: '',
                    }))
                  : setErrors((prevErrors) => ({
                      ...prevErrors,
                      template_name: 'Template is required.',
                    }));
              }}
              error={errors?.template_name}
              onChange={handleTemplateChange}
              options={templateTypeData}
            />

            <div className={`form-field position-relative`}>
              <DatePicker
                selected={scheduleDate}
                showLabel={true}
                onBlur={() =>
                  scheduleDate
                    ? setErrors({ ...errors, scheduleDate: '' })
                    : setErrors({
                        ...errors,
                        scheduleDate: 'Schedule send is required.',
                      })
                }
                onChange={(value) => {
                  value
                    ? setErrors({ ...errors, scheduleDate: '' })
                    : setErrors({
                        ...errors,
                        scheduleDate: 'Schedule send is required.',
                      });
                  setScheduleDate(new Date(value));
                }}
                minDate={new Date()}
                isClearable={true}
                placeholderText="Schedule Send*"
              />
              {errors?.scheduleDate && (
                <div>
                  <p className={styles.error}>{errors.scheduleDate}</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
      <FormFooter
        enableCreate={!id}
        enableSaveAndClose={id}
        enableSaveChanges={id}
        onClickCreate={() => submitHandler(true)}
        onClickSaveAndClose={() => submitHandler(true)}
        onClickSaveChanges={() => submitHandler()}
        onClickCancel={() => handleCancel()}
        enableCancel={true}
        disabled={IsLoading}
      />

      <SuccessPopUpModal
        title="Success!"
        message={id ? 'Prospect Updated' : 'Prospect created.'}
        modalPopUp={showSuccessMessage}
        redirectPath={id ? -1 : OS_PROSPECTS_PATH.LIST}
        isNavigate={true}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={showCancelModal}
        isNavigate={true}
        setModalPopUp={setShowCancelModal}
        redirectPath={OS_PROSPECTS_PATH.LIST}
      />
    </div>
  );
};

export default ProspectsCreateMessage;
