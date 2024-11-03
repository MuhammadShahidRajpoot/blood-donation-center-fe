import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes';
import { CallJobsBreadCrumbsData } from './CallJobsBreadCrumbsData';
import CheckPermission from '../../../../helpers/CheckPermissions';
import Permissions from '../../../../enums/PermissionsEnum';
import SvgComponent from '../../../common/SvgComponent';
import SuccessPopUpModal from '../../../common/successModal';
import AssignAgentsPopUpModal from './assign-agents/AssignAgents';
import {
  JobDetailsTable,
  InsightsTable,
  AgentsAssignedTable,
  AssetsTable,
  SegmentsTable,
  DonationLocationsTable,
  SegmentModal,
} from './common/ViewSections';

import './call-jobs.module.scss';
import TopBar from '../../../common/topbar/index';
import moment from 'moment';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const CallJobsView = () => {
  const { id } = useParams();
  const [callJobDataDetail, setCallJobDataDetail] = useState({
    jobStartDate: '',
    jobEndDate: '',
    jobName: '',
    jobType: '',
    driveDate: '',
    created_at: '',
    created_by: '',
    modified_at: '',
    modified_by: '',
    status: '',
    script: '',
    callFlow: '',
    agents: [],
    jobSize: null,
    donorLocations: [],
  });
  const [includeSegmentsData, setIncludeSegmentData] = useState([]);
  const [excludeSegmentsData, setExcludeSegmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [sucessMessage, setSucessMessage] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [archiveObject, setArchiveObject] = useState(null);
  const [isAssignedModal, setIsAssignedModal] = useState(false);
  const [assignAgentsModalData, setAssignAgentsModalData] = useState(null);
  const [isIncludeModal, setIsIncludeModal] = useState(false);
  const [isExcludeModal, setIsExcludeModal] = useState(false);
  const [openSegmentModal, setOpenSegmentModal] = useState(false);
  const [summaryContacts, setSummaryContacts] = useState(0);
  const [includeSegmentContacts, setIncludeSegmentContacts] = useState(0);
  const [excludeSegmentContacts, setExludeSegmentContacts] = useState(0);
  const [segmentsToAdd, setSegmentsToAdd] = useState({
    include_segments: [],
    exclude_segments: [],
  });
  const [segmentLoading, setSegmentLoading] = useState(false);
  const Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await API.callCenter.callJobs.fetchCallJob(id);
        const { data } = res.data;
        const response = await fetch(
          data?.callScripts?.attachment_file?.attachment_path
        );
        const blob = await response.blob();
        setCallJobDataDetail({
          jobStartDate: data.start_date
            ? moment(data.start_date).format('MMM DD, YYYY')
            : '',
          jobEndDate: data.end_date,
          jobName: data.name,
          jobType: Capitalize(
            data?.associatedOperations?.operationable_type ==
              PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
              ? 'Other'
              : data?.associatedOperations?.operationable_type
          ),
          driveDate: data?.associatedOperations?.date,
          created_at: data?.created_at,
          created_by: data?.created_by,
          modified_at: data?.modified_at,
          modified_by: data?.modified_by,
          status: data.status,
          agents: data?.callAgents || [],
          script: data?.callScripts,
          callFlow: data.callFlows,
          scriptSrc: data?.callScripts?.attachment_file?.attachment_path,
          audio_blob: blob,
          jobSize: data?.jobSize,
          donorLocations: data?.donorLocations,
        });

        setAssignAgentsModalData(data);
        processSegments(data?.callSegments);
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

  const processSegments = (segments) => {
    let includeSegments = [];
    let excludeSegments = [];
    let includePeopleCount = 0;
    let excludePeopleCount = 0;
    if (Array.isArray(segments)) {
      segments.forEach((item) => {
        if (item.segment_type === 'include') {
          includeSegments.push({ ...item?.segment, callJobSegmentId: item.id });
          includePeopleCount += item?.segment?.total_members || 0;
        } else if (item.segment_type === 'exclude') {
          excludeSegments.push({ ...item?.segment, callJobSegmentId: item.id });
          excludePeopleCount += item?.segment?.total_members || 0;
        }
      });
      setIncludeSegmentData(includeSegments);
      setExcludeSegmentData(excludeSegments);
      setExludeSegmentContacts(excludePeopleCount);
      setIncludeSegmentContacts(includePeopleCount);
      setSummaryContacts(includePeopleCount - excludePeopleCount);
    }
  };

  const BreadcrumbsData = [
    ...CallJobsBreadCrumbsData,
    {
      label: 'View Call Job',
      class: 'active-label',
      link: `/call-center/schedule/call-job/${id}/view`,
    },
  ];

  const statusClassMapping = {
    inactive: 'inactive',
    'in-progress': 'Blue',
    'in-complete': 'Lavender',
    Pending: 'Yellow',
    complete: 'Gray',
    cancelled: 'inactive',
    scheduled: 'Green',
  };

  const colorLables = {
    'in-progress': 'In Progress',
    'in-complete': 'Incomplete',
    scheduled: 'Scheduled',
    cancelled: 'Cancelled',
    complete: 'Completed',
    pending: 'Pending',
  };

  const archivedObject = async () => {
    const apiEndpoints = {
      agent: async (agentId) =>
        await API.callCenter.callJobs.unAssignAgents({}, id, agentId),
      segment: async (segmentId) =>
        await API.callCenter.callJobs.removeSegments({}, id, segmentId),
    };
    try {
      setModalPopUp(false);
      if (archiveObject.name === 'agent') {
        const { data } = await apiEndpoints[archiveObject.name](
          archiveObject.id
        );
        if (data?.status_code === 200) {
          setSucessMessage('Agent Unassigned.');
          setTimeout(() => {
            setArchiveSuccess(true);
          }, 500);
          setCallJobDataDetail({
            ...callJobDataDetail,
            agents: data?.data || [],
          });
        }
      } else if (archiveObject.name === 'segment') {
        const { data } = await apiEndpoints[archiveObject.name](
          archiveObject.id
        );
        if (data?.status_code === 200) {
          setSucessMessage('Segment Removed.');
          setTimeout(() => {
            setArchiveSuccess(true);
          }, 200);
          setCallJobDataDetail((prevState) => ({
            ...prevState,
            jobSize: data.data?.jobSize,
          }));
          processSegments(data?.data?.callSegments);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(`${error?.message}`, { autoClose: 3000 });
    } finally {
      setArchiveObject(null);
      setModalPopUp(false);
    }
  };

  const saveSegments = async () => {
    setSegmentLoading(true);
    try {
      const { data } = await API.callCenter.callJobs.addSegments(
        segmentsToAdd,
        id
      );
      if (data?.status_code === 201) {
        setSucessMessage('Segments Added.');
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 200);
        setCallJobDataDetail((prevState) => ({
          ...prevState,
          jobSize: data.data?.jobSize,
        }));
        processSegments(data?.data?.callSegments);
        setSegmentsToAdd({
          include_segments: [],
          exclude_segments: [],
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    } finally {
      setSegmentLoading(false);
      setOpenSegmentModal(false);
    }
  };

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Call Job'}
          SearchPlaceholder={null}
          SearchValue={null}
          SearchOnChange={null}
        />
        <div className="mainContentInner viewForm">
          {CheckPermission([
            Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
          ]) && (
            <div className="editAnchor">
              <Link to={`/call-center/schedule/call-jobs/${id}/edit`}>
                <SvgComponent name="EditIcon" />
                <span>Edit</span>
              </Link>
            </div>
          )}
          <div className="mainContentInner viewForm crm-viewForm aboutAccountMain">
            <div className="left-section">
              <JobDetailsTable
                isLoading={isLoading}
                callJobDataDetail={callJobDataDetail}
              />
              <SegmentsTable
                isLoading={isLoading}
                includeSegmentsData={includeSegmentsData}
                excludeSegmentsData={excludeSegmentsData}
                setOpenSegmentModal={setOpenSegmentModal}
                setModalPopUp={setModalPopUp}
                setArchiveObject={setArchiveObject}
              />
              <InsightsTable
                isLoading={isLoading}
                callJobDataDetail={callJobDataDetail}
                statusClassMapping={statusClassMapping}
                colorLables={colorLables}
              />
            </div>
            <div className="right-section">
              <DonationLocationsTable
                isLoading={isLoading}
                donorLocations={callJobDataDetail.donorLocations}
              />
              <AgentsAssignedTable
                isLoading={isLoading}
                agents={callJobDataDetail?.agents}
                setIsAssignedModal={setIsAssignedModal}
                setModalPopUp={setModalPopUp}
                setArchiveObject={setArchiveObject}
              />
              <AssetsTable
                isLoading={isLoading}
                callFlow={callJobDataDetail?.callFlow}
                script={callJobDataDetail?.script}
                scriptSrc={callJobDataDetail?.scriptSrc}
                audioBlob={callJobDataDetail?.audio_blob}
              />
            </div>
          </div>
        </div>
      </div>
      {isAssignedModal && (
        <AssignAgentsPopUpModal
          modalData={assignAgentsModalData}
          modalPopUp={isAssignedModal}
          setModalPopUp={setIsAssignedModal}
          setAgentsData={(callAgents) =>
            setCallJobDataDetail((prevState) => ({
              ...prevState,
              agents: callAgents || [],
            }))
          }
        />
      )}
      <SegmentModal
        openSegmentModal={openSegmentModal}
        setOpenSegmentModal={setOpenSegmentModal}
        setSegmentsToAdd={setSegmentsToAdd}
        segmentsToAdd={segmentsToAdd}
        includeSegmentsData={includeSegmentsData}
        excludeSegmentsData={excludeSegmentsData}
        setIsIncludeModal={setIsIncludeModal}
        setIsExcludeModal={setIsExcludeModal}
        isIncludeModal={isIncludeModal}
        isExcludeModal={isExcludeModal}
        includeSegmentContacts={includeSegmentContacts}
        excludeSegmentContacts={excludeSegmentContacts}
        setIncludeSegmentContacts={setIncludeSegmentContacts}
        setExludeSegmentContacts={setExludeSegmentContacts}
        setSummaryContacts={setSummaryContacts}
        summaryContacts={summaryContacts}
        saveSegments={saveSegments}
        segmentLoading={segmentLoading}
      />
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure want to archive?'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={archivedObject}
      />
      <SuccessPopUpModal
        title="Success!"
        message={sucessMessage}
        modalPopUp={archiveSuccess}
        isNavigate={false}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
      />
    </>
  );
};

export default CallJobsView;
