import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, Modifier } from 'draft-js';
import styles from './index.module.scss';
import draftToHtml from 'draftjs-to-html';
import FileItem from '../../../../common/FileItem';
import { toast } from 'react-toastify';
import { ReactComponent as RecordIcon } from '../../../../../assets/record_vinyl.svg';
import CustomAudioPlayer from '../../../../common/CustomAudioPlayer';
import RecordMessageModalPopUp from '../../../../common/recordMessageModal';
import { API } from '../../../../../api/api-routes';
import SpinningLoader from '../../../../common/SpinningLoader';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';

const CallScriptPopUpModal = ({
  title,
  modalPopUp,
  defaultScriptType,
  setModalPopUp,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(true);
  const [voiceRecordingToggle, setVoiceRecordingToggle] = useState(false);
  const [editor, setEditor] = useState('');
  const [scriptRecording, setScriptRecording] = useState(null);
  const [scriptRecordingBlob, setScriptRecordingBlob] = useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [isVMChanged, setIsVMChanged] = React.useState(false);
  const [recordModalPopup, setRecordModalPopup] = useState(false);
  const fileInputRef = React.useRef();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [scriptName, setScriptName] = useState('');
  const [script, setScript] = useState('');
  const [errors, setErrors] = useState({});
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  console.log({ editor });

  const driveVariables = [
    { value: 'location_name', label: 'Location' },
    { value: 'account_name', label: 'Account' },
    { value: 'room', label: 'Room' },
    { value: 'drive_date', label: 'Drive Date' },
    { value: 'drive_hours', label: 'Drive Hours' },
    { value: 'promotional_item', label: 'Promotional item(s)' },
  ];

  const handleChange = (name, value) => {
    let tempErrors = { ...errors };
    if (name == 'script_name') {
      tempErrors.script_name = value ? '' : 'Script Name is required';
    } else {
      tempErrors.script = value ? '' : 'Script is required';
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
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

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.script_name = scriptName ? '' : 'Script Name is required';
    tempErrors.script = script ? '' : 'Script is required';

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (validateForm()) {
      console.log('validated succcesss');
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
      setIsLoading(true);
      try {
        const res =
          await API.callCenter.manageScripts.createCallScript(formData);
        setIsLoading(false);

        if (res?.data?.status === 'success') {
          setShowCreateSuccessModal(true);
          onSubmit(res.data.data.savedManageScript);
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
      {isLoading && <SpinningLoader />}
      <Modal
        dialogClassName={`w-60`}
        show={modalPopUp}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body className="p-5">
          <form>
            <div className={`formGroup ${styles.createScriptModal} w-100`}>
              <h5 className={`${styles.create_template_h5}`}>Create Script</h5>
              <div className={`form-field`}>
                <div className="field">
                  <input
                    type="text"
                    className="form-control"
                    name="script_name"
                    value={scriptName}
                    id="createscriptmodal_CC-007_scriptName"
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
                        id={`createscriptmodal_CC-00${index + 8}_${
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
                    id="createscriptmodal_CC-0014_scriptEditor"
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
                  htmlFor="createscriptmodal_CC-0015_voiceRecordingToggle"
                  className="switch m-0"
                >
                  <input
                    type="checkbox"
                    id="createscriptmodal_CC-0015_voiceRecordingToggle"
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
                    id="createscriptmodal_CC-0016_uploadFile"
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
                      id="createscriptmodal_CC-0017_recordMessage"
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
                        id="createscriptmodal_CC-0018_deleteRecording"
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

              <div className="form-field checkbox w-100 mt-4 opacity-50">
                <span className="toggle-text">
                  {status ? 'Active' : 'Inactive'}
                </span>
                <label
                  htmlFor="createscriptmodal_CC-0018_statusToggle"
                  className="switch"
                >
                  <input
                    disabled
                    type="checkbox"
                    id="createscriptmodal_CC-0018_statusToggle"
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
              <div className="d-flex justify-content-end align-items-center w-100">
                <p
                  onClick={() => {
                    setCloseModal(true);
                  }}
                  className={styles.btnCancel}
                >
                  Cancel
                </p>
                <p className={styles.btnSuccess} onClick={handleSubmit}>
                  Submit
                </p>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <RecordMessageModalPopUp
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

      {showCreateSuccessModal === true ? (
        <SuccessPopUpModal
          title="Success!"
          message={`Call script created.`}
          modalPopUp={showCreateSuccessModal}
          setModalPopUp={setShowCreateSuccessModal}
          onConfirm={() => setModalPopUp(false)}
          showActionBtns={true}
        />
      ) : null}

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={false}
        setModalPopUp={setCloseModal}
        methodsToCall={true}
        methods={() => setModalPopUp(false)}
      />
    </>
  );
};

export default CallScriptPopUpModal;
