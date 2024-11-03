import React, { useEffect, useState } from 'react';
import { EditorState } from 'draft-js';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { Editor } from 'react-draft-wysiwyg';
import styles from '../../call-schedule/call-jobs/call-jobs.module.scss';
import draftToHtml from 'draftjs-to-html';
import { API } from '../../../../api/api-routes';
import { toast } from 'react-toastify';
import {
  DonorInfo,
  OperationDetails,
} from '../../call-schedule/call-jobs/common/ViewSections';
import moment from 'moment';
import CustomAudioPlayer from '../../../common/CustomAudioPlayer';

import DonorListSchedule from '../../../crm/contacts/donors/schedule/DonorListSchedule';
const DailingCenterDetails = ({
  callJobId,
  donorId,
  //isAppointment = false,
}) => {
  const [editor, setEditor] = useState('');
  const [allNotes, setAllNotes] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [editorModal, setEditorModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [leftActiveTab, setLeftActiveTab] = useState(
  //   isAppointment ? 'appointments' : 'callInfo'
  // );
  const [leftActiveTab, setLeftActiveTab] = useState('callInfo');
  const [donorDetails, setDonorDetails] = useState({});
  const [jobLoading, setJobLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const callRelatedDetails = async () => {
      try {
        if (donorId) {
          await getNotes();
          await getDonorDetails();
        }
        setIsLoading(false);
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    };

    callRelatedDetails();
  }, [donorId]);

  useEffect(() => {
    setJobLoading(true);
    const callRelatedDetails = async () => {
      try {
        await getJobDetails();
        setJobLoading(false);
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    };
    callRelatedDetails();
  }, [callJobId]);

  const createNote = async () => {
    try {
      const { data } = await API.callCenter.callJobs.createNote({
        donor_id: donorId,
        text: editor,
      });
      if (data.status === 'success') {
        setAllNotes((prevState) => [...prevState, data.data]);
        setEditorState(() => EditorState.createEmpty());
        setEditorModal(false);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  const getNotes = async () => {
    try {
      const { data } = await API.callCenter.callJobs.getNotes(donorId);
      if (Array.isArray(data.data) && data.data.length > 0) {
        setAllNotes(data.data);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  const getJobDetails = async () => {
    try {
      const { data } =
        await API.callCenter.callJobs.getOperationsDetails(callJobId);
      const stringReplaceValue = data.data?.script?.script
        .replace('{location_name}', data?.data?.location_name)
        .replace(
          '{drive_hours}',
          `${data?.data?.min_start_time} - ${data?.data?.max_end_time}`
        )
        .replace('{drive_date}', data?.data?.operation_date)
        .replace(
          '{promotional_items}',
          data?.data?.drive_promotion_items
            ?.map((item) => item?.name)
            .join(', ')
        );
      const response = await fetch(
        data?.data?.genericAttachment?.attachment_path
      );
      const blob = await response.blob();
      const details = {
        ...data.data,
        script: {
          ...data.data?.script,
          script: stringReplaceValue,
        },
        scriptSrc: data.data?.genericAttachment?.attachment_path,
        audio_blob: blob,
      };
      setJobDetails(details);
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const getDonorDetails = async () => {
    try {
      const { data } = await API.callCenter.callJobs.getDonorDetails(donorId);
      setDonorDetails(data.data);
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  return (
    <>
      <div className="mainContentInner viewForm crm-viewForm aboutAccountMain">
        <div className="left-section">
          <div
            style={{
              maxHeight: '700px',
              overflowX: 'scroll',
              scrollbarWidth: 'none',
            }}
          >
            <div className="filterBar p-0">
              <div className="tabs">
                <ul>
                  <li>
                    <Link
                      className={
                        leftActiveTab === 'callInfo' ? 'active' : 'fw-medium'
                      }
                      onClick={() => setLeftActiveTab('callInfo')}
                    >
                      Call Info
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={
                        leftActiveTab === 'appointments'
                          ? 'active'
                          : 'fw-medium'
                      }
                      onClick={() => setLeftActiveTab('appointments')}
                    >
                      Appointments
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {leftActiveTab === 'callInfo' && (
              <DonorInfo
                isLoading={isLoading}
                callJobDataDetail={donorDetails}
                donorId={donorId}
              />
            )}
            {leftActiveTab === 'appointments' && (
              <DonorListSchedule
                isFromDailingCenter={true}
                donor_id={donorId}
              />
            )}
          </div>
        </div>
        <div className="right-section">
          <div className="filterBar p-0">
            <div className="tabs">
              <ul>
                <li>
                  <Link
                    className={activeTab === 'details' ? 'active' : 'fw-medium'}
                    onClick={() => setActiveTab('details')}
                  >
                    Details
                  </Link>
                </li>
                <li>
                  <Link
                    className={activeTab === 'script' ? 'active' : 'fw-medium'}
                    onClick={() => setActiveTab('script')}
                  >
                    Scripts
                  </Link>
                </li>
                <li>
                  <Link
                    className={activeTab === 'notes' ? 'active' : 'fw-medium'}
                    onClick={() => setActiveTab('notes')}
                  >
                    Notes{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        height: '8px',
                        width: '8px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        marginLeft: '5px',
                      }}
                    ></span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {activeTab === 'details' && (
            <OperationDetails
              isLoading={jobLoading}
              callJobDataDetail={jobDetails}
            />
          )}
          {activeTab === 'script' && (
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Script</th>
                </tr>
              </thead>

              <tbody>
                {jobLoading ? (
                  <td className="col2 no-data text-center">Data Loading</td>
                ) : jobDetails?.script ? (
                  <>
                    <tr>
                      <td
                        className="tableTD col1"
                        style={{ backgroundColor: 'white' }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: jobDetails?.script?.script,
                          }}
                        />
                        {jobDetails?.script?.is_voice_recording && (
                          <div>
                            <CustomAudioPlayer
                              src={jobDetails.scriptSrc}
                              audioBlob={jobDetails?.audio_blob}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tbody>
                    <td className="col2 no-data text-center">
                      Script not Found.
                    </td>
                  </tbody>
                )}
              </tbody>
            </table>
          )}
          {activeTab === 'notes' && (
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">
                    <div className="d-flex align-items-center justify-between w-100">
                      <span>Notes</span>
                      <button
                        className="btn btn-link btn-md bg-transparent"
                        onClick={() => setEditorModal(true)}
                      >
                        Create Note
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {jobLoading ? (
                  <td className="col2 no-data text-center">Data Loading</td>
                ) : allNotes.length > 0 ? (
                  <tr>
                    <td className="tableTD col2">
                      <div
                        style={{
                          height: '400px',
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                        }}
                      >
                        {allNotes?.map((note) => (
                          <>
                            <div
                              className={`p-2 d-flex align-items-center justify-content-between ${styles.font13}`}
                            >
                              <div className={styles.note}>
                                <span>Date: </span>
                                <span>
                                  {moment(note.created_at).format('MM/DD/YYYY')}
                                </span>
                              </div>
                              <div className={styles.note}>
                                <span>Time: </span>
                                <span>
                                  {moment(note?.created_at).format('hh:mm A')}
                                </span>
                              </div>
                              <div>
                                <span>
                                  {`${note?.first_name} ${note?.last_name}`}
                                </span>
                              </div>
                            </div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: note.text,
                              }}
                            />
                          </>
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <td className="col2 no-data text-center">Notes Not found.</td>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal
        dialogClassName={`w-50`}
        show={editorModal}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <form className={`formGroup`}>
            <h5>Create Note</h5>
            <div className="form-field editor w-100 mt-3 mb-2 ">
              <div className="field">
                <Editor
                  className={`editor`}
                  editorState={editorState}
                  id="createNote_CC-0014_NoteEditor"
                  onEditorStateChange={setEditorState}
                  onChange={(state) => {
                    const contentAsHTML = draftToHtml(state);
                    setEditor(contentAsHTML);

                    // setScript(state.blocks[0].text);
                  }}
                  placeholder=""
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
            </div>
            <div className="d-flex justify-content-end align-items-center w-100">
              <p
                onClick={() => {
                  setEditorModal(false);
                }}
                className="btn btn-link"
              >
                Cancel
              </p>
              <p className="btn btn-md btn-primary" onClick={createNote}>
                Submit
              </p>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DailingCenterDetails;
