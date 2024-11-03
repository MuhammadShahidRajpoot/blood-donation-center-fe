import React, { useState, useEffect, useRef } from 'react';
import TopBar from '../../common/topbar/index';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, Modifier, ContentState } from 'draft-js';
import styles from './index.module.scss';
import SuccessPopUpModal from '../../common/successModal';
import { CALL_CENTER, CALL_CENTER_MANAGE_SCRIPTS } from '../../../routes/path';
import draftToHtml from 'draftjs-to-html';
import RecordMessageModalPopup from '../../common/recordMessageModal';
import { API } from '../../../api/api-routes';
import FileItem from '../../common/FileItem';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmModal from '../../common/confirmModal';
import FormFooter from '../../common/FormFooter';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import CheckPermission from '../../../helpers/CheckPermissions';
import CancelIconImage from '../../../assets/images/ConfirmCancelIcon.png';
import ConfirmArchiveIcon from '../../../assets/images/ConfirmArchiveIcon.png';
import WarningModalPopUp from '../../common/warningModal';
import { ReactComponent as RecordIcon } from '../../../assets/record_vinyl.svg';
import CustomAudioPlayer from '../../common/CustomAudioPlayer';
import SpinningLoader from '../../common/SpinningLoader';
import htmlToDraft from 'html-to-draftjs';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

const ScriptsUpsert = () => {
  const { id } = useParams();
  const [status, setStatus] = useState(true);
  const navigate = useNavigate();
  const closeAfterFinish = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [voiceRecordingToggle, setVoiceRecordingToggle] = useState(false);
  const [archiveModalPopUp, setArchiveModalPopUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editor, setEditor] = useState('');
  const [warningModal, setWarningModal] = useState(false);
  const [recordModalPopup, setRecordModalPopup] = useState(false);
  const [defaultScriptType, setDefaultScriptType] = useState(
    PolymorphicType.OC_OPERATIONS_DRIVES
  );
  const [scriptRecording, setScriptRecording] = useState(null);
  const [scriptRecordingBlob, setScriptRecordingBlob] = useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isVMChanged, setIsVMChanged] = React.useState(false);
  const fileInputRef = React.useRef();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [scriptName, setScriptName] = useState('');
  const [script, setScript] = useState('');
  const [errors, setErrors] = useState({});

  const BreadcrumbsData = [
    {
      label: 'Call Center',
      class: 'disable-label',
      link: CALL_CENTER.DASHBOARD,
    },
    {
      label: 'Manage Scripts',
      class: 'disable-label',
      link: CALL_CENTER_MANAGE_SCRIPTS.LIST,
    },
    {
      label: id ? 'Edit Script' : 'Create Script',
      class: 'disable-label',
      link: id
        ? CALL_CENTER_MANAGE_SCRIPTS.EDIT.replace(':script_id', id).replace(
            ':script_id',
            id
          )
        : CALL_CENTER_MANAGE_SCRIPTS.CREATE,
    },
  ];

  console.log({ editor });

  const handleArchive = () => {
    setShowConfirmation(true);
  };

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmationDialog(true);
    } else {
      navigate(-1);
    }
  };
  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(-1);
    }
  };

  const confirmArchive = async () => {
    if (id) {
      try {
        const result = await API.callCenter.manageScripts.archiveCallScript(id);
        const { data } = result;

        if (data?.status_code === 204) {
          closeAfterFinish.current = true;
          setArchiveModalPopUp(true);
        } else if (data?.status_code === 400) {
          toast.error('Script in use. It cannot be archived.', {
            autoClose: 3000,
          });
        } else {
          toast.error('Error archiving call script.', {
            autoClose: 3000,
          });
        }
      } catch (error) {
        console.error('Error archiving data:', error);
      }
      setShowConfirmation(false);
    }
  };

  const cancelArchive = () => {
    setShowConfirmation(false);
  };

  const driveVariables = [
    { value: 'location_name', label: 'Location' },
    { value: 'account_name', label: 'Account' },
    { value: 'room', label: 'Room' },
    { value: 'drive_date', label: 'Drive Date' },
    { value: 'drive_hours', label: 'Drive Hours' },
    { value: 'promotional_item', label: 'Promotional item(s)' },
  ];

  function htmlToEditorState(html) {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      return EditorState.createWithContent(contentState);
    }
  }

  async function createFileFromUrl(url, filename) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      const blob = await response.blob();
      const file = new File([blob], filename ?? '', { type: blob.type });

      return file;
    } catch (error) {
      console.error('Error creating file from URL:', error);
      return null;
    }
  }

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const result = await API.callCenter.manageScripts.getScript(id);
        const {
          data: {
            data: { call_script, file_attachment },
          },
        } = result;
        setScriptName(call_script?.name);
        setDefaultScriptType(call_script?.script_type);
        setStatus(call_script?.is_active);
        if (call_script?.is_voice_recording) {
          if (call_script?.is_recorded_message) {
            setScriptRecording(file_attachment?.attachment_path);
            const response = await fetch(file_attachment?.attachment_path);
            const blob = await response.blob();
            setScriptRecordingBlob(blob);
          } else {
            let url = file_attachment?.attachment_path;
            let filename = file_attachment?.attachment_name;
            createFileFromUrl(url, filename).then((file) => {
              setSelectedFile(file);
            });
          }
        }
        setVoiceRecordingToggle(call_script?.is_voice_recording);

        const newEditorState = htmlToEditorState(call_script?.script);
        setEditorState(newEditorState);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error(error?.response, { autoClose: 3000 });
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  const handleChange = (name, value) => {
    setUnsavedChanges(true);
    let tempErrors = { ...errors };
    if (name == 'script_name') {
      tempErrors.script_name = value ? '' : 'Script Name is required';
    } else {
      tempErrors.script = value ? '' : 'Script is required';
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.script_name = scriptName ? '' : 'Script Name is required';
    tempErrors.script = script ? '' : 'Script is required';

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const checkIfScriptContainsVariables = () => {
    if (defaultScriptType !== PolymorphicType.OC_OPERATIONS_DRIVES) {
      for (const variable of driveVariables) {
        if (script.includes(`{${variable.value}}`)) {
          return true;
        }
      }
    }
    return false;
  };

  const checkIfAllScriptContainsVariables = (scriptText) => {
    for (const variable of driveVariables) {
      if (
        script?.includes(`{${variable.value}}`) ||
        scriptText?.includes(`{${variable.value}}`)
      ) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e, redirect = true) => {
    e?.preventDefault();

    if (validateForm()) {
      let blob;

      if (scriptRecording) {
        const response = await fetch(scriptRecording);
        blob = await response.blob();
      }

      const formData = new FormData();
      if (selectedFile) {
        formData.append('is_recorded_message', false);
        formData.append('attachment_file', selectedFile);
      }
      if (scriptRecording) {
        formData.append('is_recorded_message', true);
        formData.append('attachment_file', blob);
      }

      formData.append('is_vm_changed', Boolean(isVMChanged));

      formData.append('is_active', Boolean(status));
      formData.append(
        'is_voice_recording',
        scriptRecording || selectedFile ? Boolean(true) : Boolean(false)
      );
      formData.append('name', scriptName);
      formData.append('script', editor);
      formData.append('script_type', defaultScriptType);
      setIsSubmitting(true);
      if (id) {
        setIsLoading(true);
        try {
          const res = await API.callCenter.manageScripts.updateCallScript(
            formData,
            id
          );
          setIsLoading(false);

          if (res?.data?.status === 'success') {
            setModalPopUp(true);
            if (redirect) {
              setIsNavigate(true);
            }
          } else if (res?.data?.status !== 'success') {
            const showMessage = Array.isArray(res?.data?.message)
              ? res?.data?.response[0]
              : res?.data?.response;
            toast.error(`${showMessage}`, { autoClose: 3000 });
          }
        } catch (error) {
          setIsLoading(false);
          console.error('API request error:', error);
          toast.error(`${error?.message}`, { autoClose: 3000 });
        }
      } else {
        setIsLoading(true);
        try {
          const res =
            await API.callCenter.manageScripts.createCallScript(formData);
          setIsLoading(false);

          if (res?.data?.status === 'success') {
            setModalPopUp(true);
            setIsNavigate(true);
          } else if (res?.data?.status !== 'success') {
            const showMessage = Array.isArray(res?.data?.message)
              ? res?.data?.response[0]
              : res?.data?.response;
            toast.error(`${showMessage}`, { autoClose: 3000 });
          }
        } catch (error) {
          setIsLoading(false);
          console.error('API request error:', error);
          toast.error(`${error?.message}`, { autoClose: 3000 });
        }
      }
    }
    setIsSubmitting(false);
  };

  const handleFileChange = (event) => {
    setIsVMChanged(true);
    setSelectedFile(event.target.files[0]);

    event.target.files = null;
    event.target.value = null;
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    setIsVMChanged(true);
    setSelectedFile(null);
  };

  function insertTextAtCursor(editorState, text) {
    const currentContent = editorState.getCurrentContent();
    const currentSelection = editorState.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'insert-characters'
    );

    return EditorState.forceSelection(
      newEditorState,
      newContent.getSelectionAfter()
    );
  }

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Manage Scripts'}
          SearchPlaceholder={null}
          SearchValue={null}
          SearchOnChange={null}
        />
        <div className="mainContentInner form-container">
          {isLoading && <SpinningLoader />}
          <form className={`formGroup ${styles.addAdminRoles}`}>
            <div className={`formGroup ${styles.form_group}`}>
              <h5 className={`${styles.create_template_h5}`}>
                {id ? 'Edit Script' : 'Create Script'}
              </h5>
              <div className={`form-field w-100 d-flex gap-4 `}>
                <p className="radio-label">
                  <input
                    type="radio"
                    name="script_type"
                    disabled={id !== undefined}
                    id="createmanagescripts_CC-004_drivesRadio"
                    className="form-check-input contact-radio"
                    checked={
                      defaultScriptType === PolymorphicType.OC_OPERATIONS_DRIVES
                    }
                    onChange={() =>
                      setDefaultScriptType(PolymorphicType.OC_OPERATIONS_DRIVES)
                    }
                  />{' '}
                  Drives
                </p>
                <p className="radio-label">
                  <input
                    type="radio"
                    name="script_type"
                    disabled={id !== undefined}
                    id="createmanagescripts_CC-005_sessionRadio"
                    className="form-check-input contact-radio"
                    checked={
                      defaultScriptType ===
                      PolymorphicType.OC_OPERATIONS_SESSIONS
                    }
                    onChange={() =>
                      setDefaultScriptType(
                        PolymorphicType.OC_OPERATIONS_SESSIONS
                      )
                    }
                  />{' '}
                  Session
                </p>
                <p className="radio-label">
                  <input
                    type="radio"
                    name="script_type"
                    id="createmanagescripts_CC-006_otherRadio"
                    disabled={id !== undefined}
                    className="form-check-input contact-radio"
                    checked={
                      defaultScriptType ===
                      PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                    }
                    onChange={() =>
                      setDefaultScriptType(
                        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                      )
                    }
                  />{' '}
                  Other
                </p>
              </div>
              <div className={`form-field`}>
                <div className="field">
                  <input
                    type="text"
                    className="form-control"
                    name="script_name"
                    value={scriptName}
                    id="createmanagescripts_CC-007_scriptName"
                    placeholder=" "
                    onChange={(e) => {
                      handleChange('script_name', e.target.value);
                      setScriptName(e.target.value);
                    }}
                    required
                  />
                  <label>Script Name *</label>
                </div>
                {errors.script_name && (
                  <div className="error">
                    <p>{errors.script_name}</p>
                  </div>
                )}
              </div>
              {defaultScriptType === PolymorphicType.OC_OPERATIONS_DRIVES && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {driveVariables?.map((item, index) => {
                    return (
                      <span
                        key={index}
                        id={`createmanagescripts_CC-00${index + 8}_${
                          item?.value
                        }`}
                        onClick={() => {
                          if (voiceRecordingToggle) {
                            toast.error(
                              'In order to insert a variable you should remove the recording'
                            );
                          } else {
                            const newState = insertTextAtCursor(
                              editorState,
                              `{${item?.value}}`
                            );
                            setEditorState(newState);
                          }
                        }}
                        style={{ cursor: 'default' }}
                        className={`${styles.secondary}`}
                      >
                        {item?.label}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="form-field editor w-100 mt-3 mb-5">
                <div className="field">
                  <Editor
                    className={`${styles.editor}`}
                    editorState={editorState}
                    id="createmanagescripts_CC-0014_scriptEditor"
                    onEditorStateChange={setEditorState}
                    onChange={(state) => {
                      const contentAsHTML = draftToHtml(state);
                      setEditor(contentAsHTML);
                      if (
                        checkIfAllScriptContainsVariables(state.blocks[0].text)
                      ) {
                        setVoiceRecordingToggle(false);
                      }
                      setScript(state.blocks[0].text);
                      handleChange('script', state?.blocks[0]?.text);
                    }}
                    placeholder="Enter Script here"
                    wrapperClassName="wrapper-class"
                    editorClassName="editor-class editorPadding"
                    toolbarClassName="toolbar-class"
                    toolbar={{
                      options: [
                        'inline',
                        'fontSize',
                        'textAlign',
                        'list',
                        'blockType',
                        'history',
                        'colorPicker',
                      ],
                      inline: {
                        options: ['bold', 'italic', 'underline'],
                      },
                      fontSize: {
                        options: [
                          8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72,
                          96,
                        ],
                      },
                      colorPicker: {
                        className: 'toolbar-color-picker',
                        component: undefined,
                        popupClassName: undefined,
                        colors: [
                          'black',
                          'red',
                          'blue',
                          'green',
                          'yellow',
                          'orange',
                          'purple',
                          '#f44336',
                          '#e91e63',
                          '#9c27b0',
                          '#673ab7',
                          '#3f51b5',
                          '#2196f3',
                          '#03a9f4',
                          '#00bcd4',
                          '#009688',
                          '#4caf50',
                          '#8bc34a',
                          '#cddc39',
                          '#ffeb3b',
                          '#ffc107',
                          '#ff9800',
                          '#ff5722',
                          '#795548',
                          '#607d8b',
                          '#000000',
                          '#ffffff',
                        ],
                      },
                      textAlign: {
                        options: ['left', 'center'],
                      },
                      list: {
                        options: ['unordered', 'ordered'],
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
                          'Code',
                        ],
                      },
                      link: {
                        options: ['link'],
                      },
                    }}
                  />
                </div>
                {errors.script && (
                  <div className="error">
                    <p>{errors.script}</p>
                  </div>
                )}
              </div>

              <div className="form-field checkbox w-100">
                <label
                  htmlFor="createmanagescripts_CC-0015_voiceRecordingToggle"
                  className="switch m-0"
                >
                  <input
                    type="checkbox"
                    id="createmanagescripts_CC-0015_voiceRecordingToggle"
                    className="toggle-input"
                    name="voice_recording"
                    checked={voiceRecordingToggle}
                    onChange={(e) => {
                      if (checkIfAllScriptContainsVariables()) {
                        toast.error(
                          'In order to record you should remove the variable'
                        );
                      } else {
                        setVoiceRecordingToggle(e.target.checked);
                      }
                    }}
                  />
                  <span className="slider round"></span>
                </label>
                <span style={{ marginLeft: '15px' }} className="toggle-text">
                  Voice Recording
                </span>
              </div>

              {voiceRecordingToggle && (
                <div style={{ display: 'flex' }} className="flex flex-column">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  <button
                    type="button"
                    id="createmanagescripts_CC-0016_uploadFile"
                    style={{ minHeight: 'auto', width: '200px' }}
                    disabled={scriptRecording}
                    className="btn btn-primary mb-4 p-3"
                    onClick={handleButtonClick}
                  >
                    Upload File
                  </button>

                  {selectedFile && (
                    <FileItem file={selectedFile} onRemove={handleRemoveFile} />
                  )}

                  {!scriptRecording && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={selectedFile}
                      id="createmanagescripts_CC-0017_recordMessage"
                      style={{ width: '280px' }}
                      onClick={() => {
                        setRecordModalPopup(true);
                      }}
                    >
                      <RecordIcon style={{ marginRight: '8px' }} />
                      Record Message
                    </button>
                  )}
                  {scriptRecording && scriptRecordingBlob && (
                    <div className="audio-container d-flex align-items-center">
                      <CustomAudioPlayer
                        src={scriptRecording}
                        audioBlob={scriptRecordingBlob}
                      />
                      <button
                        type="button"
                        id="createmanagescripts_CC-0018_deleteRecording"
                        style={{
                          width: 211,
                          minHeight: 43,
                          paddingLeft: 32,
                          paddingRight: 32,
                          paddingTop: 14,
                          paddingBottom: 14,
                          borderRadius: 8,
                          border: '1px #FF1E1E solid',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 10,
                          display: 'inline-flex',
                          marginLeft: '10px',
                        }}
                        className="btn p-2"
                        onClick={() => {
                          setIsVMChanged(true);
                          setScriptRecording(null);
                        }}
                      >
                        <div
                          style={{
                            textAlign: 'center',
                            color: '#FF1E1E',
                            fontSize: 18,
                            fontFamily: 'Inter',
                            fontWeight: '400',
                            wordWrap: 'break-word',
                          }}
                        >
                          Delete Recording
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="form-field checkbox w-100 mt-4">
                <span className="toggle-text">
                  {status ? 'Active' : 'Inactive'}
                </span>
                <label
                  htmlFor="createmanagescripts_CC-0018_statusToggle"
                  className="switch"
                >
                  <input
                    type="checkbox"
                    id="createmanagescripts_CC-0018_statusToggle"
                    className="toggle-input"
                    name="is_active"
                    checked={status}
                    onChange={(e) => {
                      setStatus(e.target.checked);
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </form>

          <div className="">
            {id ? (
              <FormFooter
                enableArchive={CheckPermission([
                  CrmPermissions.CRM.CONTACTS.VOLUNTEERS.ARCHIVE,
                ])}
                onClickArchive={() => handleArchive(true)}
                enableCancel={true}
                saveAndCloseButtonId="editmanagescripts_CC-001_saveAndCloseButton"
                saveChangesButtonId="editmanagescripts_CC-002_saveChangesButton"
                onClickCancel={handleCancelClick}
                enableSaveAndClose={true}
                saveAndCloseType={'submit'}
                onClickSaveAndClose={(e) => {
                  closeAfterFinish.current = true;
                  if (checkIfScriptContainsVariables()) {
                    setWarningModal(true);
                  } else {
                    handleSubmit(e);
                  }
                }}
                enableSaveChanges={true}
                saveChangesType={'submit'}
                onClickSaveChanges={(e) => {
                  closeAfterFinish.current = false;
                  if (checkIfScriptContainsVariables()) {
                    setWarningModal(true);
                  } else {
                    handleSubmit(e, false);
                  }
                }}
                disabled={isSubmitting}
              />
            ) : (
              <FormFooter
                enableCancel={true}
                onClickCancel={handleCancelClick}
                enableCreate={true}
                createButtonId="createmanagescripts_CC-003_createButton"
                onCreateType={'submit'}
                onClickCreate={(e) => {
                  closeAfterFinish.current = true;
                  if (checkIfScriptContainsVariables()) {
                    setWarningModal(true);
                  } else {
                    handleSubmit(e);
                  }
                }}
                disabled={isSubmitting}
              />
            )}
          </div>
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
                    type="button"
                  >
                    No
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleConfirmationResult(true)}
                    type="button"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SuccessPopUpModal
        title={'Success!'}
        message={id ? 'Script Updated.' : 'Script Created.'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        onConfirm={() => {
          if (closeAfterFinish.current) {
            navigate(-1);
          }
        }}
        isNavigate={isNavigate}
      />
      <SuccessPopUpModal
        title={'Success!'}
        message={'Call Script is Archived.'}
        modalPopUp={archiveModalPopUp}
        setModalPopUp={setArchiveModalPopUp}
        showActionBtns={true}
        onConfirm={() => {
          if (closeAfterFinish.current) {
            navigate('/call-center/scripts');
          }
        }}
        isNavigate={isNavigate}
      />
      <ConfirmModal
        showConfirmation={showConfirmation}
        onCancel={cancelArchive}
        onConfirm={confirmArchive}
        icon={ConfirmArchiveIcon}
        heading={'Confirmation'}
        description={'Are you sure you want to Archive?'}
      />

      <WarningModalPopUp
        title="Warning"
        message="You have a variable inserted do you want to continue?"
        modalPopUp={warningModal}
        isNavigate={true}
        setModalPopUp={setWarningModal}
        isInfo={true}
        methods={() => {
          handleSubmit();
        }}
        customIcon={
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_51387_174731"
              style={{ maskType: 'alpha' }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="40"
              height="40"
            >
              <rect width="39.2727" height="40" fill="#FFBF42" />
            </mask>
            <g mask="url(#mask0_51387_174731)">
              <path
                d="M2.80689 36C2.46702 36 2.16179 35.9176 1.8912 35.7528C1.62061 35.5881 1.41015 35.3709 1.25983 35.1014C1.10347 34.8337 1.01746 34.5437 1.00182 34.2314C0.986183 33.9192 1.07115 33.6099 1.25673 33.3036L18.4222 3.89921C18.6077 3.59293 18.84 3.3665 19.1189 3.21992C19.3978 3.07331 19.6915 3 20 3C20.3085 3 20.6022 3.07331 20.8811 3.21992C21.16 3.3665 21.3923 3.59293 21.5778 3.89921L38.7433 33.3036C38.9288 33.6099 39.0138 33.9192 38.9982 34.2314C38.9825 34.5437 38.8965 34.8337 38.7402 35.1014C38.5898 35.3709 38.3794 35.5881 38.1088 35.7528C37.8382 35.9176 37.533 36 37.1931 36H2.80689ZM4.86125 33.0174H35.1387L20 7.16793L4.86125 33.0174ZM20 30.6466C20.4589 30.6466 20.8435 30.4927 21.1539 30.1849C21.4643 29.8771 21.6195 29.4956 21.6195 29.0406C21.6195 28.5855 21.4643 28.2041 21.1539 27.8963C20.8435 27.5885 20.4589 27.4346 20 27.4346C19.5411 27.4346 19.1565 27.5885 18.8461 27.8963C18.5357 28.2041 18.3805 28.5855 18.3805 29.0406C18.3805 29.4956 18.5357 29.8771 18.8461 30.1849C19.1565 30.4927 19.5411 30.6466 20 30.6466ZM20.0007 25.4461C20.4269 25.4461 20.784 25.3032 21.0719 25.0174C21.3598 24.7316 21.5038 24.3774 21.5038 23.9549V16.9953C21.5038 16.5728 21.3596 16.2186 21.0713 15.9328C20.7829 15.647 20.4256 15.504 19.9993 15.504C19.5731 15.504 19.216 15.647 18.9281 15.9328C18.6402 16.2186 18.4962 16.5728 18.4962 16.9953V23.9549C18.4962 24.3774 18.6404 24.7316 18.9287 25.0174C19.2171 25.3032 19.5744 25.4461 20.0007 25.4461Z"
                fill="#FFBF42"
              />
            </g>
          </svg>
        }
      />

      <RecordMessageModalPopup
        title="Record Message"
        modalPopUp={recordModalPopup}
        isNavigate={true}
        setModalPopUp={setRecordModalPopup}
        isInfo={true}
        setScriptRecording={(audio) => {
          setIsVMChanged(true);
          setScriptRecording(audio);
        }}
        setScriptRecordingBlob={(audioBlob) => {
          setScriptRecordingBlob(audioBlob);
        }}
        customIcon={
          <svg
            width="46"
            height="46"
            viewBox="0 0 46 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_11757_55337)">
              <mask
                id="mask0_11757_55337"
                style={{ maskType: 'alpha' }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="46"
                height="46"
              >
                <rect width="46" height="46" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_11757_55337)">
                <path
                  d="M22.9948 26.8359C21.3976 26.8359 20.0399 26.2769 18.9219 25.1589C17.8038 24.0408 17.2448 22.6832 17.2448 21.0859V9.58594C17.2448 7.98872 17.8038 6.63108 18.9219 5.51302C20.0399 4.39497 21.3976 3.83594 22.9948 3.83594C24.592 3.83594 25.9497 4.39497 27.0677 5.51302C28.1858 6.63108 28.7448 7.98872 28.7448 9.58594V21.0859C28.7448 22.6832 28.1858 24.0408 27.0677 25.1589C25.9497 26.2769 24.592 26.8359 22.9948 26.8359ZM21.0781 40.2526V34.3589C17.7559 33.9116 15.0087 32.4262 12.8365 29.9026C10.6642 27.379 9.57812 24.4401 9.57812 21.0859H13.4115C13.4115 23.7373 14.3458 25.9974 16.2146 27.8661C18.0833 29.7349 20.3434 30.6693 22.9948 30.6693C25.6462 30.6693 27.9063 29.7349 29.775 27.8661C31.6438 25.9974 32.5781 23.7373 32.5781 21.0859H36.4115C36.4115 24.4401 35.3253 27.379 33.1531 29.9026C30.9809 32.4262 28.2337 33.9116 24.9115 34.3589V40.2526H21.0781ZM22.9948 23.0026C23.5378 23.0026 23.9931 22.8189 24.3604 22.4516C24.7278 22.0842 24.9115 21.629 24.9115 21.0859V9.58594C24.9115 9.04288 24.7278 8.58767 24.3604 8.22031C23.9931 7.85295 23.5378 7.66927 22.9948 7.66927C22.4517 7.66927 21.9965 7.85295 21.6292 8.22031C21.2618 8.58767 21.0781 9.04288 21.0781 9.58594V21.0859C21.0781 21.629 21.2618 22.0842 21.6292 22.4516C21.9965 22.8189 22.4517 23.0026 22.9948 23.0026Z"
                  fill="white"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0_11757_55337">
                <rect width="46" height="46" fill="white" />
              </clipPath>
            </defs>
          </svg>
        }
      />
    </>
  );
};

export default ScriptsUpsert;
