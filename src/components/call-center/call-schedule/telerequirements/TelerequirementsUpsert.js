import React, { useEffect, useState, useRef } from 'react';
import TopBar from '../../../common/topbar/index';
import CancelIconImage from '../../../../assets/images/ConfirmCancelIcon.png';
import styles from './telerecruitments.module.scss';
import SuccessPopUpModal from '../../../common/successModal';
import {
  CALL_CENTER_CALL_SCHEDULE_CALL_JOBS,
  CALL_CENTER,
  CALL_CENTER_CALL_SCHEDULE_TELLEREQUIREMENT,
} from '../../../../routes/path';
import SelectDropdown from '../../../common/selectDropdown';
import DatePicker from 'react-datepicker';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import TableList from '../../../common/tableListing';
import { useNavigate } from 'react-router-dom';
import AssignSegmentsPopUpModal from '../call-jobs/common/AssignSegments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import FormInput from '../../../common/form/FormInput';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes';
import moment from 'moment';
//import { useParams } from 'react-router-dom';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';
//import axios from 'axios';
import CancelModalPopUp from '../../../common/cancelModal';
import FormFooter from '../../../common/FormFooter';
import htmlToDraft from 'html-to-draftjs';
import CallScriptPopUpModal from '../call-jobs/common/CallScriptModal';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const TelerequirementsUpsert = ({
  ids,
  hadleCreateClicked,
  remainingDrives,
}) => {
  const navigate = useNavigate();
  /*
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
    */
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  //const { ids } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [editor, setEditor] = useState('');
  const [editorError, setEditorError] = useState('');
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [summaryContacts, setSummaryContacts] = useState('0');
  const [includeSegmentContacts, setIncludeSegmentContacts] = useState('0');
  const [excludeSegmentContacts, setExcludeSegmentContacts] = useState('0');
  const [isIncludeModal, setIsIncludeModal] = useState(false);
  const [isExcludeModal, setIsExcludeModal] = useState(false);
  const [callScripts, setCallScripts] = useState([]);
  const [callFlows, setCallFlows] = useState([]);
  const [callJobName, setCallJobName] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [associatedData, setAssociatedData] = useState([]);
  // const [allAssociatedData, setAllAssociatedData] = useState([]);
  const [includeSegmentsData, setIncludeSegmentData] = useState([]);
  // const [includeAllSegmentsData, setAllIncludeSegmentData] = useState([]);
  const [excludeSegmentsData, setExcludeSegmentData] = useState([]);
  const [selectedCallScript, setSelectedCallScript] = useState();
  const [selectedCallFlow, setSelectedCallFlow] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [close, setClose] = useState(false);
  // const [isNavigate, setIsNavigate] = useState(false);
  // const [showModel, setShowModel] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const hasEffectRun = useRef(false);
  const [isCreateScriptModal, setIsCreateScriptModal] = useState(false);

  const drive = remainingDrives[0];

  console.log(setAssociatedData);

  const tableHeaders = [
    {
      name: 'date',
      label: 'Date',
      width: '15%',
      sortable: true,
    },

    {
      name: 'location',
      label: 'Location',
      width: '15%',
      sortable: true,
    },

    {
      name: 'hours',
      label: 'Hours',
      width: '10%',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'status',
      width: '10%',
      sortable: true,
    },
  ];

  const statusClassMapping = {
    //Job statuses
    pending: 'Yellow',
    declined: 'Red',
    created: 'Green',
    cancelled: 'inactive',
    //Job statuses

    //Drive statuses
    confirmed: 'Green',
    tentative: 'Blue',
    //Drive statuses
  };

  const colorLables = {
    //Job statuses
    pending: 'Pending',
    declined: 'Decline',
    created: 'Created',
    cancelled: 'Cancelled',
    //Job statuses

    //Drive statuses
    confirmed: 'Confirmed',
    tentative: 'Tentative',
    //Drive statuses
  };

  const showRowData = (rowData, index) => {};

  const BreadcrumbsData = [
    {
      label: 'Call Center',
      class: 'disable-label',
      link: CALL_CENTER.DASHBOARD,
    },
    {
      label: 'Call Schedule',
      class: 'disable-label',
      link: CALL_CENTER_CALL_SCHEDULE_CALL_JOBS.LIST,
    },
    {
      label: 'Call Center Requests',
      class: 'disable-label',
      link: CALL_CENTER_CALL_SCHEDULE_TELLEREQUIREMENT.LIST,
    },
  ];

  const getCallScriptsDropDownData = async () => {
    setIsLoading(true);
    try {
      const currentPage = 1;
      const limit = 100;
      let query = `limit=${limit}&page=${currentPage}&is_active=true`;

      const result = await API.callCenter.manageScripts.getCallScripts(query);
      const modifiedCallScripts = result?.data?.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
          script: item.script,
        };
      });
      modifiedCallScripts.unshift({
        value: 'createNew',
        label: 'Create New Call Script',
        script: 'Your default script here',
      });
      setCallScripts(modifiedCallScripts);
      setSelectedCallScript(null);
    } catch (error) {
      toast.error(error?.response, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getCallFlowsDropDownData = async () => {
    setIsLoading(true);
    try {
      const currentPage = 1;
      const limit = 100;
      let query = `limit=${limit}&page=${currentPage}&is_active=true`;

      const result = await API.callCenter.callFlows.getCallFlows(query);
      const { data } = result;

      const defaultCallFlow = data?.data.find((flow) => flow.default);

      const modifiedCallFlows = data?.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });

      setCallFlows(modifiedCallFlows);

      if (defaultCallFlow) {
        setSelectedCallFlow({
          value: defaultCallFlow.id,
          label: defaultCallFlow.name,
        });
      }
    } catch (error) {
      toast.error(error?.response, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCallScriptsDropDownData();
    getCallFlowsDropDownData();
  }, []);

  const [errors, setErrors] = useState({});

  const handleConfirmationResult = (confirmed) => {
    if (confirmed) {
      navigate(-1);
    } else {
      setShowConfirmationDialog(false);
    }
  };

  console.log({ editor });
  console.log({ setEditorError });

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortBy('');
        setSortOrder('');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleChange = (name, value) => {
    //setUnsavedChanges(true);
    setUnsavedChanges(true);
    let tempErrors = { ...errors };

    if (name == 'associated_data') {
      tempErrors.associated_data =
        value.length > 0 ? '' : 'Associated data is required';
    }

    if (name == 'start_date') {
      tempErrors.start_date = value ? '' : 'Start Date is required';
    }

    if (name == 'end_date') {
      tempErrors.end_date = value ? '' : 'End Date is required';
    }

    if (name == 'call_job_name') {
      tempErrors.call_job_name = value ? '' : 'Call Job Name is required';
    }

    if (name == 'reccuring_type') {
      tempErrors.reccuring_type = value ? '' : 'Reccuring type is required';
    }

    if (name == 'recurring_frequency') {
      tempErrors.recurring_frequency = value
        ? ''
        : 'Reccuring Frequence is required';
    }

    if (name == 'reccurence_date') {
      tempErrors.reccurence_date = value ? '' : 'Reccurence date is required';
    }

    if (name == 'include_segments') {
      tempErrors.include_segments =
        value.length > 0 ? '' : 'Include segments is required';
    }

    if (name == 'call_script') {
      tempErrors.call_script = value ? '' : 'Call Script is required';
    }

    if (name == 'call_flow') {
      tempErrors.call_flow = value ? '' : 'Call Flow is required';
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const validateForm = () => {
    let tempErrors = {};

    tempErrors.associated_data =
      associatedData.length > 0 ? '' : 'Associated data is required';
    tempErrors.start_date = startDate ? '' : 'Start Date is required';
    tempErrors.end_date = endDate ? '' : 'End Date is required';

    tempErrors.call_job_name = callJobName ? '' : 'Call Job Name is required';

    tempErrors.include_segments =
      includeSegmentsData.length > 0 ? '' : 'Include segments is required';

    tempErrors.call_script = selectedCallScript
      ? ''
      : 'Call Script is required';
    tempErrors.call_flow = selectedCallFlow ? '' : 'Call Flow is required';

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };
  /*
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await API.callCenter.callJobs.fetchCallJob(id);
        const {
          data: { data },
        } = res;
        setCallJobName(data?.name);
        setStartDate(new Date(data?.start_date));
        setEndDate(new Date(data?.end_date));
        setIsRecurring(data?.is_recurring);
        setRecurringFrequency({
          label: data?.recurring_frequency,
          value: data?.recurring_frequency,
        });
        setReccuringType({
          label:
            data?.recurring_type?.charAt(0).toUpperCase() +
            data?.recurring_type?.slice(1),
          value: data?.recurring_type,
        });
        setReccurenceDateValue(new Date(data?.recurring_end_date));
        if (data?.callScripts.length > 0) {
          callScripts.map((item) => {
            if (item.value == data.callScripts[0].call_script_id) {
              setSelectedCallScript(item);
              const newEditorState = htmlToEditorState(item.script);
              setEditorState(newEditorState);
            }
          });
        }
        if (data?.callFlows.length > 0) {
          callFlows.map((item) => {
            if (item.value == data.callFlows[0].call_flow_id) {
              setSelectedCallFlow(item);
            }
          });
        }
        if (data?.callSegments.length > 0) {
          data?.callSegments.map((item) => {
            if (item.segment_type === 'include') {
              includeAllSegmentsData.map((allSegmentItem) => {
                if (allSegmentItem.id == item.segment_id) {
                  setIncludeSegmentData((prev) => {
                    return [...prev, allSegmentItem];
                  });
                }
              });
            } else if (item.segment_type === 'exclude') {
              includeAllSegmentsData.map((allSegmentItem) => {
                if (allSegmentItem.id == item.segment_id) {
                  setExcludeSegmentData((prev) => {
                    return [...prev, allSegmentItem];
                  });
                }
              });
            }
          });
        }

         // check is needed
        if (data?.associatedOperations.length > 0) {
          setDefaultScriptType(
            data?.associatedOperations[0].operationable_type ===
              'non_collection_events'
              ? 'other'
              : data?.associatedOperations[0].operationable_type
          );
          allAssociatedData.map((item) => {
            if (item.id == data?.associatedOperations[0].operationable_id) {
              console.log({ item });
              setAssociatedData([item]);
            }
          });
        }

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error(error?.response, { autoClose: 3000 });
      }
    };

    if (id) {
      getData();
    }
  }, [id, allAssociatedData, includeAllSegmentsData, callScripts]);

  useEffect(() => {
    if (id) {
      fetchSegmentsData();
      fetchAssociateData();
    }
  }, [id, callJobName]);
*/

  useEffect(() => {
    if (!hasEffectRun.current && includeSegmentsData.length > 0) {
      let includePeopleCount = 0;
      for (let i = 0; i < includeSegmentsData.length; i++) {
        includePeopleCount += includeSegmentsData[i].total_members;
      }
      setIncludeSegmentContacts(includePeopleCount);

      let excludetotalPeopleCount = 0;
      for (let i = 0; i < excludeSegmentsData.length; i++) {
        excludetotalPeopleCount += excludeSegmentsData[i].total_members;
      }
      setExcludeSegmentContacts(excludetotalPeopleCount);

      setSummaryContacts(includePeopleCount - excludetotalPeopleCount);

      hasEffectRun.current = true;
    }
  }, [includeSegmentsData, excludeSegmentsData]);

  function htmlToEditorState(html) {
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      return EditorState.createWithContent(contentState);
    }
  }

  const handleSubmit = async (e, redirect = true) => {
    e?.preventDefault();

    if (validateForm()) {
      const requestBody = {
        call_job_name: callJobName,
        status: 'scheduled',
        start_date: moment(startDate).utc(true).format('YYYY-MM-DD'),
        end_date: moment(endDate).utc(true).format('YYYY-MM-DD'),
        associated_data: associatedData,
        include_segments: includeSegmentsData,
        exclude_segments: excludeSegmentsData,
        call_script: selectedCallScript,
        call_flow: selectedCallFlow,
        is_recurring: false,
        associated_type: 'drives',
      };

      setIsSubmitting(true);

      //needs to be changed for bulkCreate
      await API.callCenter.callJobs.createCallJob(requestBody);
      hadleCreateClicked();
      //  handleNextClicked();
      //setShowCreateSuccessModal(true);

      setIsSubmitting(false);
    }
  };

  const handleSelectedIncludeSegmentsData = (data) => {
    handleChange('include_segments', data);
    setIncludeSegmentData(data);
  };

  const handleSelectedExcludeSegmentsData = (data) => {
    handleChange('exclude_segments', data);
    setExcludeSegmentData(data);
  };

  useEffect(() => {
    if (ids) {
      //  fetchSegmentsData();
      fetchAssociateData();
    }
  }, [ids]);

  // THIS needs to be changed
  const fetchAssociateData = async () => {
    console.log(drive);
    //should catch provided drive id's

    const queryParams = {
      page: 1,
      limit: 100,
      sort_by: 'id',
      sort_order: 'ASC',
      ids,
    };

    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/call-center/telerecruitment-requests?${new URLSearchParams(
        queryParams
      )}`
    );
    const data = await response.json();

    let rows = data?.data?.map((row) => {
      return {
        id: row.id,
        date: row.drive_date,
        account_name: row.account_name,
        location: row.location_name,
        hours: `${formatDateWithTZ(
          row.start_time,
          'hh:mm a'
        )} - ${formatDateWithTZ(row.end_time, 'hh:mm a')}`,
        status: row.drive_status,
      };
    });
    setAssociatedData(rows);
  };
  /*
  const fetchSegmentsData = async () => {
    try {
      setIsLoading(true);

      const sortOrder = 'ASC';
      const sortBy = 'name';
      const currentPage = 1;
      const limit = 10;

      const response = await axios.get(
        `${BASE_URL}/call-center/segments?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}&status=true`,
        axiosConfig
      );

      setAllIncludeSegmentData(response?.data?.data);

      setIsLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setIsLoading(false);
        toast.error(
          `Failed to fetch table data: ${error?.response?.data?.message}`,
          { autoClose: 3000 }
        );
      }
    }
  };
*/
  const handleCancelClick = () => {
    if (unsavedChanges) {
      setShowConfirmationDialog(true);
    } else {
      navigate(-1);
    }
  };

  const handleCreatedScript = (createdScript) => {
    const newCallScriptOption = {
      value: createdScript.id,
      label: createdScript.name,
      script: createdScript.script,
    };

    setCallScripts([...callScripts, newCallScriptOption]);
    setSelectedCallScript(newCallScriptOption);
    handleChange('call_script', newCallScriptOption);
    const newEditorState = htmlToEditorState(newCallScriptOption.script);
    setEditorState(newEditorState);
  };

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Call Schedule'}
          //  SearchPlaceholder={'Search'}
          //  SearchValue={searchText}
          //  SearchOnChange={searchFieldChange}
        />
        <div className="mainContentInner form-container">
          <form className={`formGroup ${styles.addAdminRoles}`}>
            <div className={`formGroup`}>
              <div>
                <h5>Associated Drive</h5>
              </div>

              <div className="w-100">
                <TableList
                  isLoading={isLoading}
                  data={associatedData?.filter(
                    (value) => value.id.toString() === drive
                  )}
                  colorLables={colorLables}
                  statusClassMapping={statusClassMapping}
                  headers={tableHeaders}
                  handleSort={handleSort}
                  onRowClick={showRowData}
                />

                <div className={`form-field`}>
                  {errors?.associated_data && (
                    <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                      <p>{errors.associated_data}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`formGroup `}>
              <h5>Call Job Details</h5>
              <div className={`form-field`}>
                <div className="field">
                  <input
                    type="text"
                    onChange={(e) => {
                      handleChange('call_job_name', e.target.value);
                      setCallJobName(e.target.value);
                    }}
                    className="form-control"
                    name="name"
                    placeholder=" "
                    required
                    value={callJobName}
                  />

                  <label>Name</label>
                </div>
                {errors.call_job_name && (
                  <div className="error">
                    <p>{errors.call_job_name}</p>
                  </div>
                )}
              </div>
              <div className="form-field"></div>
              <div className="form-field">
                <div className="field">
                  {startDate && (
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
                      !startDate ? ' custom-datepicker-placeholder' : ''
                    } ${styles.custom_value}`}
                    placeholderText="Start Date*"
                    selected={startDate}
                    minDate={new Date()}
                    // onBlur={(e) => handleOnBlur('start_date', e.target.value)}
                    onChange={(date) => {
                      //handleOnBlur('start_date', date);
                      handleChange('start_date', date);
                      setStartDate(date);
                    }}
                  />
                </div>
                {errors?.start_date && (
                  <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                    <p>{errors.start_date}</p>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  {endDate && (
                    <label
                      style={{
                        fontSize: '12px',
                        top: '25%',
                        color: '#555555',
                        zIndex: 1,
                      }}
                    >
                      End Date*
                    </label>
                  )}
                  <DatePicker
                    dateFormat="MM/dd/yyyy"
                    className={`custom-datepicker${
                      !endDate ? ' custom-datepicker-placeholder' : ''
                    } ${styles.custom_value}`}
                    placeholderText="End Date*"
                    selected={endDate}
                    minDate={new Date()}
                    // onBlur={(e) => handleOnBlur('end_date', e.target.value)}
                    onChange={(date) => {
                      //handleOnBlur('end_date', date);
                      handleChange('end_date', date);
                      setEndDate(date);
                    }}
                  />
                </div>
                {errors?.end_date && (
                  <div className={`error ${styles.errorcolor} ml-1 mt-1`}>
                    <p>{errors.end_date}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`formGroup `}>
              <div>
                <h5>Segment Details</h5>
              </div>
              <div>
                <h6>
                  Summary: <b>{summaryContacts} Contacts</b>
                </h6>
              </div>
              <FormInput
                fieldLabel="Include"
                displayName="Segments"
                autoComplete="off"
                icon={
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    onClick={() => setIsIncludeModal(true)}
                    icon={faAngleDown}
                    style={{ color: '#A3A3A3', cursor: 'pointer' }}
                  />
                }
                onClick={() => setIsIncludeModal(true)}
                onKeyPress={(e) => e.preventDefault()}
                //classes={{ root: 'w-100' }}
                value={includeSegmentsData.map((value) => value.name).join(',')}
                required={false}
                error={errors?.include_segments}
                //onBlur={field.onBlur}
              />
              <div className="pt-5">
                <span className="pt-5">{includeSegmentContacts} Contacts</span>
              </div>
              <AssignSegmentsPopUpModal
                title="Include Segment"
                //    modalData={includeSegmentsModalData}
                modalPopUp={isIncludeModal}
                excludeSegmentsData={excludeSegmentsData}
                setData={handleSelectedIncludeSegmentsData}
                setModalPopUp={setIsIncludeModal}
                setIncludeSegmentsCount={(val) => {
                  setIncludeSegmentContacts(val);
                  setSummaryContacts(val - excludeSegmentContacts);
                }}
              />

              <FormInput
                fieldLabel="Exclude"
                displayName="Segments"
                autoComplete="off"
                icon={
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    onClick={() => setIsExcludeModal(true)}
                    icon={faAngleDown}
                    style={{ color: '#A3A3A3', cursor: 'pointer' }}
                  />
                }
                onClick={() => setIsExcludeModal(true)}
                onKeyPress={(e) => e.preventDefault()}
                value={excludeSegmentsData.map((value) => value.name).join(',')}
                required={false}
                error={errors?.exclude_segments}
                //onBlur={field.onBlur}
              />
              <span className="pt-5">{excludeSegmentContacts} Contacts</span>

              <AssignSegmentsPopUpModal
                title="Exclude Segment"
                //   modalData={excludeSegmentsModalData}
                setData={handleSelectedExcludeSegmentsData}
                includeSegmentsData={includeSegmentsData}
                modalPopUp={isExcludeModal}
                setModalPopUp={setIsExcludeModal}
                setExcludeSegmentsCount={(val) => {
                  setExcludeSegmentContacts(val);
                  setSummaryContacts(includeSegmentContacts - val);
                }}
              />
            </div>

            <div className={`formGroup ${styles.form_group}`}>
              <h5 className={`${styles.create_template_h5}`}>Assets</h5>
              <SelectDropdown
                placeholder={'Call Script'}
                name="call_script"
                showLabel={true}
                searchable={true}
                selectedValue={selectedCallScript}
                options={callScripts}
                onChange={(selectedOption) => {
                  if (selectedOption?.value === 'createNew') {
                    console.log('should open modal');
                    setIsCreateScriptModal(true);
                    return;
                  } else {
                    handleChange('call_script', selectedOption);
                    setSelectedCallScript(selectedOption);
                    setEditorState('');

                    const newEditorState = htmlToEditorState(
                      selectedOption?.script ?? ''
                    );
                    setEditorState(newEditorState);
                  }
                }}
                removeDivider
                error={errors.call_script}
              />
              {isCreateScriptModal && (
                <CallScriptPopUpModal
                  defaultScriptType={PolymorphicType.OC_OPERATIONS_DRIVES}
                  modalPopUp={isCreateScriptModal}
                  setModalPopUp={setIsCreateScriptModal}
                  onSubmit={handleCreatedScript}
                />
              )}

              <SelectDropdown
                placeholder={'Call Flow'}
                name="call_flow"
                searchable={true}
                selectedValue={selectedCallFlow}
                options={callFlows}
                onChange={(selectedOption) => {
                  handleChange('call_flow', selectedOption);
                  setSelectedCallFlow(selectedOption);
                }}
                removeDivider
                error={errors.call_flow}
              />

              {
                <div className="form-field editor w-100 mt-3 mb-5">
                  <div className="field">
                    <Editor
                      readOnly={true}
                      editorState={editorState}
                      onEditorStateChange={setEditorState}
                      onChange={(state) => {
                        const contentAsHTML = draftToHtml(state);
                        setEditor(contentAsHTML);
                      }}
                      placeholder="Enter Script here"
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
                            8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60,
                            72, 96,
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
                            'Code',
                          ],
                        },
                        link: {
                          options: ['link'],
                        },
                      }}
                    />
                  </div>
                  {editorError && (
                    <div className="error">
                      <p className="error">{editorError}</p>
                    </div>
                  )}
                </div>
              }
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

          <FormFooter
            enableCancel={true}
            onClickCancel={handleCancelClick}
            enableCreate={true}
            onClickCreate={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {showCreateSuccessModal === true ? (
        <SuccessPopUpModal
          title="Success!"
          message={`Call Job created.`}
          modalPopUp={showCreateSuccessModal}
          //isNavigate={true}
          // redirectPath={'/call-center/schedule/call-jobs'}
          onConfirm={() => hadleCreateClicked()}
          setModalPopUp={setShowCreateSuccessModal}
          showActionBtns={true}
        />
      ) : null}

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={-1}
      />
    </>
  );
};

export default TelerequirementsUpsert;
