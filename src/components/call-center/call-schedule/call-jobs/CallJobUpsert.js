import React, { useEffect, useState, useRef } from 'react';
import TopBar from '../../../common/topbar/index';
import styles from './call-jobs.module.scss';
import SuccessPopUpModal from '../../../common/successModal';
import {
  CALL_CENTER_CALL_SCHEDULE_CALL_JOBS,
  CALL_CENTER,
} from '../../../../routes/path';
import SelectDropdown from '../../../common/selectDropdown';
import WeekDayList from './common/WeekDayList';
import DatePicker from 'react-datepicker';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import TableList from '../../../common/tableListing';
import { Link, useNavigate } from 'react-router-dom';
import CallJobAssociate from './common/CallJobAssociate';
import AssignSegmentsPopUpModal from './common/AssignSegments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import FormInput from '../../../common/form/FormInput';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';
import axios from 'axios';
import CancelModalPopUp from '../../../common/cancelModal';
import FormFooter from '../../../common/FormFooter';
import htmlToDraft from 'html-to-draftjs';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import CallScriptPopUpModal from './common/CallScriptModal';
import { CallJobStatusEnum } from './common/CallJobEnum';

let inputTimer = null;

const CallJobUpsert = () => {
  const navigate = useNavigate();
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [editor, setEditor] = useState('');
  const [editorError, setEditorError] = useState('');
  const [defaultScriptType, setDefaultScriptType] = useState(
    PolymorphicType.OC_OPERATIONS_DRIVES
  );
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [summaryContacts, setSummaryContacts] = useState('0');
  const [includeSegmentContacts, setIncludeSegmentContacts] = useState('0');
  const [excludeSegmentContacts, setExcludeSegmentContacts] = useState('0');
  const [isIncludeModal, setIsIncludeModal] = useState(false);
  const [isExcludeModal, setIsExcludeModal] = useState(false);
  const [callScripts, setCallScripts] = useState([]);
  const [callFlows, setCallFlows] = useState([]);
  const [addAssociated, setAddAssociated] = useState('');
  const [callJobName, setCallJobName] = useState();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  //  const [frequency, setFrequency] = useState({ value: 1, label: '1' });
  // const [type, setType] = useState();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState();
  const [reccuringDays, setReccuringDays] = useState('');
  const [reccuringType, setReccuringType] = useState();
  const [reccurenceDateValue, setReccurenceDateValue] = useState();
  const [associatedData, setAssociatedData] = useState([]);
  const [allAssociatedData, setAllAssociatedData] = useState([]);
  const [includeSegmentsData, setIncludeSegmentData] = useState([]);
  const [includeAllSegmentsData, setAllIncludeSegmentData] = useState([]);
  const [excludeSegmentsData, setExcludeSegmentData] = useState([]);
  const [selectedCallScript, setSelectedCallScript] = useState();
  const [selectedCallFlow, setSelectedCallFlow] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);
  const [close, setClose] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [isCreateScriptModal, setIsCreateScriptModal] = useState(false);
  const hasEffectRun = useRef(false);

  const tableHeaders = [
    {
      name: 'date',
      label: 'Date',
      width: '15%',
      sortable: true,
    },
    {
      name: 'account_name',
      label: 'Account',
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
      name: 'location',
      label: 'Location',
      width: '15%',
      sortable: true,
    },

    {
      name: 'status',
      label: 'Status',
      width: '10%',
      sortable: true,
    },
  ];

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
      label: id ? 'Edit Call Jobs' : 'Create Call Jobs',
      class: 'disable-label',
      link: CALL_CENTER_CALL_SCHEDULE_CALL_JOBS.CREATE,
    },
  ];

  const getCallScriptsDropDownData = async () => {
    const scriptType =
      defaultScriptType === 'other'
        ? PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
        : defaultScriptType;

    setIsLoading(true);
    try {
      const currentPage = 1;
      const limit = 100;
      let query = `limit=${limit}&page=${currentPage}&is_active=true&script_type=${scriptType}`;

      const result = await API.callCenter.manageScripts.getCallScripts(query);
      let { data } = result;
      const modifiedCallScripts = data?.data?.map((item) => {
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

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    setSelectedCallScript(null);
    getCallScriptsDropDownData();
  }, [defaultScriptType]);

  useEffect(() => {
    getCallFlowsDropDownData();

    setAssociatedData([]);

    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchAllAssociatedData();
    }, 500);
  }, [defaultScriptType]);

  const fetchAllAssociatedData = async (filters = {}) => {
    setIsLoading(false);
  };

  const [errors, setErrors] = useState({});

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

    if (isRecurring) {
      tempErrors.recurring_frequency = recurringFrequency
        ? ''
        : 'Frequency is required';
      tempErrors.reccuring_type = reccuringType
        ? ''
        : 'Reccuring type is required';
      tempErrors.reccurence_date = reccurenceDateValue
        ? ''
        : 'Reccurence date is required';
    }

    tempErrors.include_segments =
      includeSegmentsData.length > 0 ? '' : 'Include segments is required';

    tempErrors.call_script = selectedCallScript
      ? ''
      : 'Call Script is required';
    tempErrors.call_flow = selectedCallFlow ? '' : 'Call Flow is required';

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

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
        if (data?.is_recurring) {
          setReccuringDays(data?.recurring_days);
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
        }
        if (data?.callScripts) {
          callScripts.map((item) => {
            if (item.value == data.callScripts?.call_script?.id) {
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
                    const itemExists = prev.some(
                      (segment) => segment.id === allSegmentItem.id
                    );
                    if (!itemExists) {
                      return [...prev, allSegmentItem];
                    }
                    return prev;
                  });
                }
              });
            } else if (item.segment_type === 'exclude') {
              includeAllSegmentsData.map((allSegmentItem) => {
                if (allSegmentItem.id == item.segment_id) {
                  setExcludeSegmentData((prev) => {
                    const itemExists = prev.some(
                      (segment) => segment.id === allSegmentItem.id
                    );
                    if (!itemExists) {
                      return [...prev, allSegmentItem];
                    }
                    return prev;
                  });
                }
              });
            }
          });
        }
        if (data?.associatedOperations) {
          setDefaultScriptType(data?.associatedOperations.operationable_type);
          allAssociatedData.map((item) => {
            if (item.id == data?.associatedOperations.operationable_id) {
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
  }, [id, defaultScriptType]);

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

  const archiveCallJob = async () => {
    try {
      await API.callCenter.callJobs.deactivateCallJob(id);
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

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
        status: CallJobStatusEnum.PENDING,
        start_date: moment(startDate).utc(true).format('YYYY-MM-DD'),
        end_date: moment(endDate).utc(true).format('YYYY-MM-DD'),
        associated_data: associatedData,
        include_segments: includeSegmentsData,
        exclude_segments: excludeSegmentsData,
        call_script: selectedCallScript,
        call_flow: selectedCallFlow,
        is_recurring: isRecurring,
        associated_type: defaultScriptType.toLocaleLowerCase(),
      };

      if (isRecurring) {
        requestBody.recurring_frequency = recurringFrequency.value;
        requestBody.recurring_type = reccuringType.value;
        requestBody.recurring_days = reccuringDays;
        requestBody.reccurence_date = moment(reccurenceDateValue)
          .utc(true)
          .format('YYYY-MM-DD');
      }

      setIsSubmitting(true);

      if (id) {
        await API.callCenter.callJobs.updateCallJob(requestBody, id);
        setIsNavigate(true);
        setShowModel(true);
      } else {
        await API.callCenter.callJobs.createCallJob(requestBody);
        setShowCreateSuccessModal(true);
      }

      setIsSubmitting(false);
    }
  };

  const handleSelectedAssociatedData = (data) => {
    handleChange('associated_data', data);
    setAssociatedData(data);
  };

  const handleSelectedIncludeSegmentsData = (data) => {
    handleChange('include_segments', data);
    setIncludeSegmentData(data);
  };

  const handleSelectedExcludeSegmentsData = (data) => {
    handleChange('exclude_segments', data);
    setExcludeSegmentData(data);
  };

  const fetchAssociateData = async () => {
    if (defaultScriptType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives?limit=1000`
      );
      const data = await response.json();

      let rows = data?.data?.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.account_name,
          location: row.location_name,
          hours: `${formatDateWithTZ(
            row.start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(row.end_time, 'hh:mm a')}`,
          recruiter: 'John Doe',
          status: 'InProgress',
        };
      });
      setAllAssociatedData(rows);
    } else if (defaultScriptType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations/sessions/list?limit=1000`
      );
      const data = await response.json();

      let rows = data?.data?.records.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.donor_center,
          location: 'Location test',
          hours: `${formatDateWithTZ(
            row.start_time,
            'hh:mm a'
          )} - ${formatDateWithTZ(row.end_time, 'hh:mm a')}`,
          recruiter: 'Recruiter test',
          status: row.status,
        };
      });
      setAllAssociatedData(rows);
    } else {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations/non-collection-events?limit=1000`
      );
      const data = await response.json();

      let rows = data?.data?.map((row) => {
        return {
          id: row.id,
          date: row.date,
          account_name: row.event_name,
          location: row.location_id.name,
          hours: row.shifts[0]
            ? `${formatDateWithTZ(
                row.shifts[0]?.start_time,
                'hh:mm a'
              )} - ${formatDateWithTZ(row.shifts[0]?.end_time, 'hh:mm a')}`
            : '08:00 AM - 12:00 PM',
          recruiter: row.owner_id.first_name + ' ' + row.owner_id.last_name,
          status: row.status_id.name,
        };
      });
      setAllAssociatedData(rows);
    }
  };

  const fetchSegmentsData = async () => {
    try {
      setIsLoading(true);

      const sortOrder = 'ASC';
      const sortBy = 'name';
      const currentPage = 1;
      const limit = 10000;

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

  const handleCancelClick = () => {
    if (unsavedChanges) {
      setCloseModal(true);
    } else {
      navigate('/call-center/schedule/call-jobs');
    }
  };

  const getDefaultScriptTypeLabel = () => {
    if (defaultScriptType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      return 'Drive';
    } else if (defaultScriptType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      return 'Session';
    } else {
      return 'Operation';
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
          BreadCrumbsTitle={
            addAssociated === '' ? 'Call Schedule' : 'Create Call Jobs'
          }
          SearchPlaceholder={'Search'}
          SearchValue={searchText}
          removeSearch={addAssociated ? false : true}
          SearchOnChange={searchFieldChange}
        />
        {addAssociated === '' ? (
          <div className="mainContentInner form-container">
            <form className={`formGroup ${styles.addAdminRoles}`}>
              <div className={`formGroup ${styles.form_group}`}>
                <h5 className={`${styles.create_template_h5}`}>
                  {`${id ? 'Edit Call Job' : 'Create Call Job'}`}
                </h5>
                <div className={`form-field w-100 d-flex gap-4 `}>
                  <p className="radio-label">
                    <input
                      type="radio"
                      name="script_type"
                      disabled={id != undefined}
                      id="createcalljobs_CC-004_drivesRadio"
                      className="form-check-input contact-radio"
                      checked={
                        defaultScriptType ===
                        PolymorphicType.OC_OPERATIONS_DRIVES
                      }
                      onChange={() =>
                        setDefaultScriptType(
                          PolymorphicType.OC_OPERATIONS_DRIVES
                        )
                      }
                    />{' '}
                    Drives
                  </p>
                  <p className="radio-label">
                    <input
                      type="radio"
                      name="script_type"
                      disabled={id != undefined}
                      id="createcalljobs_CC-005_sessionRadio"
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
                    Sessions
                  </p>
                  <p className="radio-label">
                    <input
                      type="radio"
                      name="script_type"
                      id="createcalljobs_CC-006_otherRadio"
                      disabled={id != undefined}
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
              </div>

              <div className={`formGroup`}>
                <div>
                  <h5>Associated {getDefaultScriptTypeLabel()}</h5>
                </div>
                {associatedData.length == 0 && (
                  <div>
                    <Link
                      onClick={() => setAddAssociated(`${defaultScriptType}`)}
                    >
                      <span className="fs-6">
                        {' '}
                        Add {`${getDefaultScriptTypeLabel()}s`}
                      </span>
                    </Link>
                  </div>
                )}

                <div className="w-100">
                  <TableList
                    noLoading={isLoading}
                    data={associatedData}
                    headers={tableHeaders}
                    minHeightTableListing={true}
                    handleSort={handleSort}
                    customNoDataFoundText={`No Associated ${getDefaultScriptTypeLabel()}s`}
                    onRowClick={showRowData}
                    showActionsLabel={false}
                    removeData={(val) => {
                      setAssociatedData(val);
                    }}
                    optionsConfig={[
                      {
                        label: 'RemoveSelectedRow',
                      },
                    ]}
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
                        if (endDate && date > endDate) {
                          setEndDate(date);
                        }
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
                        if (startDate && date < startDate) {
                          setStartDate(date);
                        }
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

                {defaultScriptType !== PolymorphicType.OC_OPERATIONS_DRIVES && (
                  <>
                    <div className="form-field checkbox">
                      <span className="toggle-text">Recurring</span>
                      <label htmlFor="toggle" className="switch">
                        <input
                          type="checkbox"
                          name="is_active"
                          id="toggle"
                          className="toggle-input"
                          checked={isRecurring}
                          onChange={() => setIsRecurring(!isRecurring)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="form-field"></div>
                    {isRecurring ? (
                      <>
                        <p>
                          <b>Repeat every</b>
                        </p>
                        <div className="form-field"></div>
                        <SelectDropdown
                          placeholder={'Frequency'}
                          name="recurring_frequency"
                          searchable={true}
                          selectedValue={recurringFrequency}
                          onChange={(selectOption) => {
                            handleChange('recurring_frequency', selectOption);
                            setRecurringFrequency(selectOption);
                          }}
                          options={[
                            { value: 1, label: '1' },
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                          ]}
                          removeDivider
                          error={errors.recurring_frequency}
                        />

                        <SelectDropdown
                          placeholder={'Type'}
                          name="reccuring_type"
                          defaultValue={reccuringType}
                          searchable={true}
                          selectedValue={reccuringType}
                          onChange={(selectOption) => {
                            handleChange('reccuring_type', selectOption);
                            setReccuringType(selectOption);
                          }}
                          options={[
                            { value: 'day', label: 'Day' },
                            { value: 'week', label: 'Week' },
                            { value: 'month', label: 'Month' },
                          ]}
                          removeDivider
                          error={errors.reccuring_type}
                        />
                        <WeekDayList
                          recurringDays={reccuringDays}
                          setData={setReccuringDays}
                        />
                        <div className="form-field"></div>

                        <div className="form-field mt-3">
                          <div className={`field`}>
                            <label
                              style={{
                                fontSize: '12px',
                                top: '25%',
                                color: '#555555',
                                zIndex: 1,
                              }}
                            >
                              Reccurence End Date
                            </label>
                            <DatePicker
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={120}
                              dateFormat="MM-dd-yyyy"
                              name="next_call_date"
                              className="custom-datepicker effectiveDate"
                              minDate={new Date()}
                              selected={reccurenceDateValue}
                              onChange={(date) => {
                                if (date === null) {
                                  handleChange('reccurence_date', '');
                                  setReccurenceDateValue(new Date());
                                } else {
                                  handleChange('reccurence_date', date);
                                  setReccurenceDateValue(date);
                                }
                              }}
                            />
                          </div>
                          {errors?.reccurence_date && (
                            <div
                              className={`error ${styles.errorcolor} ml-1 mt-1`}
                            >
                              <p>{errors.reccurence_date}</p>
                            </div>
                          )}
                          <div className="small">
                            <span>
                              Occurs Every <b>{reccuringDays}</b> until{' '}
                              <b>
                                {' '}
                                {reccurenceDateValue
                                  ?.toLocaleDateString()
                                  .replaceAll('/', '-')}{' '}
                              </b>
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      ''
                    )}
                  </>
                )}
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <FormInput
                    fieldLabel="Include"
                    displayName="Segments"
                    readOnly={true}
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
                    value={includeSegmentsData
                      .map((value) => value.name)
                      .join(',')}
                    required={false}
                    error={errors?.include_segments}
                    //onBlur={field.onBlur}
                  />
                  <span
                    className="pt-2"
                    style={{
                      marginLeft: '20px',
                    }}
                  >
                    {includeSegmentContacts} Contacts
                  </span>
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <FormInput
                    fieldLabel="Exclude"
                    displayName="Segments"
                    autoComplete="off"
                    readOnly={true}
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
                    value={excludeSegmentsData
                      .map((value) => value.name)
                      .join(',')}
                    required={false}
                    error={errors?.exclude_segments}
                    //onBlur={field.onBlur}
                  />
                  <span
                    className="pt-2"
                    style={{
                      marginLeft: '20px',
                    }}
                  >
                    {excludeSegmentContacts} Contacts
                  </span>
                </div>
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
                    defaultScriptType={defaultScriptType}
                    modalPopUp={isCreateScriptModal}
                    setModalPopUp={setIsCreateScriptModal}
                    onSubmit={handleCreatedScript}
                  />
                )}

                <SelectDropdown
                  placeholder={'Call Flow'}
                  showLabel={true}
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
                        editorClassName="editor-class p-2 pt-0"
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

            {id ? (
              <FormFooter
                onClickArchive={() => setArchiveModal(true)}
                enableCancel={true}
                onClickCancel={handleCancelClick}
                enableSaveAndClose={true}
                onClickSaveAndClose={handleSubmit}
                onClickCaptureSaveAndClose={(e) => setClose(true)}
                enableSaveChanges={true}
                onClickSaveChanges={handleSubmit}
                disabled={isSubmitting}
              />
            ) : (
              <FormFooter
                enableCancel={true}
                onClickCancel={handleCancelClick}
                enableCreate={true}
                onClickCreate={handleSubmit}
                disabled={isSubmitting}
              />
            )}
          </div>
        ) : (
          <>
            <CallJobAssociate
              associateType={defaultScriptType}
              setAssociateType={setAddAssociated}
              setSelectedData={handleSelectedAssociatedData}
              selectedData={associatedData}
              searchText={searchText}
            />
          </>
        )}
      </div>
      {archiveModal && (
        <SuccessPopUpModal
          title={'Confirmation'}
          message={'Are you sure you want to Archive?'}
          modalPopUp={archiveModal}
          setModalPopUp={setArchiveModal}
          showActionBtns={false}
          isArchived={archiveModal}
          archived={archiveCallJob}
          isNavigate={isNavigate}
          redirectPath={'/call-center/schedule/call-jobs'}
        />
      )}
      {showCreateSuccessModal === true ? (
        <SuccessPopUpModal
          title="Success!"
          message={`Call Job created.`}
          modalPopUp={showCreateSuccessModal}
          isNavigate={true}
          redirectPath={'/call-center/schedule/call-jobs'}
          setModalPopUp={setShowCreateSuccessModal}
          showActionBtns={true}
        />
      ) : null}

      {showModel === true && close === true ? (
        <SuccessPopUpModal
          title="Success!"
          message="Call Job Updated."
          modalPopUp={showModel}
          isNavigate={true}
          setModalPopUp={setShowModel}
          showActionBtns={true}
          onConfirm={() => {
            navigate(-1);
          }}
        />
      ) : null}
      {showModel === true && close === false ? (
        <SuccessPopUpModal
          title="Success!"
          message="Call Job Updated."
          modalPopUp={showModel}
          isNavigate={true}
          setModalPopUp={setShowModel}
          showActionBtns={true}
          onConfirm={() => {
            if (isNavigate) {
              navigate(-1);
            }
          }}
        />
      ) : null}

      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={'/call-center/schedule/call-jobs'}
      />
    </>
  );
};

export default CallJobUpsert;
