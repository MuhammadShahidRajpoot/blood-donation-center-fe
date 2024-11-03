import axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { StartCallingCrumbsData } from './StartCallingCrumbsData';
import { makeAuthorizedApiRequestAxios } from '../../../helpers/Api';
import 'react-toastify/dist/ReactToastify.css';
import Contact from '../../../assets/contact.svg';
// import TransferCall from '../../../assets/transfer_call.svg';
// import HoldCall from '../../../assets/hold_call.svg';
// import EndSessionBtn from '../../../assets/EndSessionBtn.svg';
// import EndCall from '../../../assets/end_call.svg';
// import NextCallBtn from '../../../assets/NextCallBtn.svg';
import SvgComponent from '../../common/SvgComponent';
import SelectDropdown from '../../common/selectDropdown';
import Layout from '../../common/layout';
import TopBar from '../../common/topbar/index';
import DialingCenterCreateTaskModal from '../../common/DialingCenterCreateTaskModal';
import CallLaterModalPopUp from '../../common//CallLaterModal';
import DailingCenterDetails from './dailing-center-details/DailingCenterDetails';
import StartCall from './GetToken';
import { GlobalContext } from '../../../Context/Context';
import DialingCenterFilter from './DialingCenterFilter';

export let firstName, lastName, phoneNo;

const StartCalling = () => {
  const { id } = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const { isLocationChanged } = useContext(GlobalContext);
  const { isAppointment } = useContext(GlobalContext);
  const [isActive, setIsActive] = useState([]);
  const [donorsInfo, setDonorsInfo] = useState([]);
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  //const [callSid, setCallSid] = useState();
  const [callOutcomesNames, setCallOutcomesNames] = useState([]);
  const [callOutcomes, setCallOutcomes] = useState([]);
  const [createdAt, setCreatedAt] = useState('');
  const [callOutComeId, setCallOutComeId] = useState('');
  const [setIsCallableDonor] = useState(false);
  const [callJobAgent, setCallJobAgent] = useState(null);
  const [dialingCenterCallJob, setDialingCenterCallJob] = useState(null);
  const navigate = useNavigate();

  const fetchCallOutcomes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/call-center/call-outcomes`);

      if (response) {
        const callOutcomes = response.data.data;
        setCallOutcomes(callOutcomes);
        const callOutcomesNames = callOutcomes.map((item) => {
          return {
            name: item.name,
            call_outcome_id: item.id,
            is_default: item.is_default,
          };
        });
        setCallOutcomesNames(callOutcomesNames);
      }
    } catch (error) {
      toast.error(
        `Failed to fetch table data: ${error?.response?.data?.message}`,
        { autoClose: 3000 }
      );
    }
  };

  const checkValidityOfCallInterval = async () => {
    const callOutComeRecord = callOutcomes.find(
      (item) => item.id == callOutComeId
    );

    if (!callOutComeRecord) {
      console.error('Call outcome record not found');
      return;
    }

    const { next_call_interval } = callOutComeRecord;
    const createdAtMoment = moment(createdAt);
    const newDate = createdAtMoment.add(next_call_interval, 'days');
    const currentDate = moment();
    const isGreaterOrEqual = newDate.isSameOrAfter(currentDate);
    setIsCallableDonor(isGreaterOrEqual);
  };

  const updateSegmentContactdHandler = async (val) => {
    try {
      const bodyData = {
        call_outcome_id: parseInt(val.value),
      };

      const response = await axios.patch(
        `${BASE_URL}/call-center/segments-contacts/${donorsInfo?.sc_id}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response && response.data.status === 'error') {
        toast.error(response.data.response);
      } else {
        toast.success(response.data.response);
      }
      if (response) {
        setCreatedAt(response.data?.data?.created_at);
        setCallOutComeId(response.data?.data?.call_outcome_id);
      }
    } catch (error) {
      console.error('Error archiving data:', error);
    }
  };

  const options = callOutcomesNames.map((item) => ({
    label: item.name,
    value: item.call_outcome_id,
    isDefault: item.is_default,
  }));

  options.sort((a, b) => {
    if (a.isDefault && !b.isDefault) {
      return -1;
    } else if (!a.isDefault && b.isDefault) {
      return 1;
    } else {
      return 0;
    }
  });

  const callLaterHandler = () => {
    setCloseModal(true);
  };

  const fetchCallJobAndUpdateStatusToInProgress = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/call-jobs/${id}`
      );

      if (response) {
        const callJob = response?.data?.data;
        if (callJob?.status === 'assigned') {
          updateCallJobStatus('in-progress');
        }
      }
    } catch (error) {
      toast.error(
        `Failed to fetch call job table data: ${error?.response?.data?.message}`,
        { autoClose: 3000 }
      );
    }
  };

  const updateCallJobStatus = async (status) => {
    try {
      const bodyData = {
        status: status,
      };

      await axios.patch(
        `${BASE_URL}/call-center/call-jobs/call-job-status/${id}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error while updating status of the call job:', error);
    }
  };

  //useEffect(() => {}, [callSid]);
  /* 
  const initCall = async () => {
    try {
      const body = {
        donor_phone_number: '6176496457',
        max_rings: 5,
        playVoiceMessage: false,
      };
      const data = await makeAuthorizedApiRequestAxios(
        'POST',
        `${BASE_URL}/call-center/dialing-center/start-calling/init`,
        body
      );
      if (data?.data) {
        setCallSid(data?.data);
      }
    } catch (error) {
      console.error(error);
    }
  }; */
  const getCallJobDonorInfo = async () => {
    try {
      const { data } = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/dialing-center/donors-info?call_job_id=${id}`
      );
      setDonorsInfo(data?.data);
      if (data?.data?.message) {
        toast.error(data?.data?.message, 3000);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getCallJobAgent = async () => {
    try {
      const { data } = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/call-jobs/agent/${id}`
      );

      if (data.status === 'success') {
        setCallJobAgent(data?.data);
      } else {
        toast.error(data?.message, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message, 3000);
    }
  };

  const getDialingCenterCallJob = async () => {
    try {
      const { data } = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/dialing-center/${id}`
      );

      if (data.status === 'success') {
        setDialingCenterCallJob(data?.data);
      } else {
        toast.error(data?.message, 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message, 3000);
    }
  };

  const handleScheduleAppointment = () => {
    navigate(
      `/call-center/dialing-center/appointment/${donorsInfo?.id}/create/${donorsInfo?.typeid}/${donorsInfo?.type}`
    );
  };

  useEffect(() => {
    if (createdAt !== null && callOutComeId !== null) {
      checkValidityOfCallInterval();
    }
  }, [callOutComeId]);

  useEffect(() => {
    fetchCallOutcomes();
    getCallJobDonorInfo();
    getCallJobAgent();
    getDialingCenterCallJob();
    fetchCallJobAndUpdateStatusToInProgress(); // update call job status to in-progress when start calling button is clicked for the first time
    //initCall(); //there will be call initiation
  }, []);

  firstName = donorsInfo?.first_name ? donorsInfo.first_name : '';
  lastName = donorsInfo?.last_name ? donorsInfo?.last_name : '';
  phoneNo = donorsInfo?.phonenumber ? donorsInfo?.phonenumber : '';

  return (
    <Layout>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={StartCallingCrumbsData}
          BreadCrumbsTitle={'Dialing Center'}
        />
        <div
          className="d-flex justify-content-between p-4 row"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="left col-lg-6">
            <div className="d-flex pb-2">
              <div>
                <img src={Contact} className="" alt="notebook" />
              </div>
              <div className="mx-2 ">
                <p className="fs-5 fw-bold m-0">
                  {donorsInfo?.first_name} {donorsInfo?.last_name}
                </p>
                <p>{donorsInfo?.phonenumber}</p>
              </div>
            </div>
            {!isLocationChanged && (
              <div className="d-flex gap-3 align-items-center pt-2">
                <SelectDropdown
                  placeholder={'Call Outcome'}
                  defaultValue={isActive}
                  selectedValue={isActive}
                  removeDivider
                  onChange={(val) => {
                    setIsActive(val);
                    updateSegmentContactdHandler(val);
                    if (val && val.value && val.value === '67') {
                      handleScheduleAppointment(
                        donorsInfo?.id,
                        donorsInfo?.type
                      );
                    }
                  }}
                  options={options}
                  id={''} //needs to add
                />
                <div
                  className="optionsIcon d-flex align-items-center"
                  aria-expanded="false"
                  onClick={() => {
                    setOpenCreateTask(true);
                  }}
                >
                  <SvgComponent name={'Assignment'} />
                  <span style={{ color: '#387DE5', marginLeft: '0.5rem' }}>
                    Assign Task
                  </span>
                </div>
                <div>
                  <div>
                    <div
                      className="optionsIcon d-flex align-items-center"
                      aria-expanded="false"
                      onClick={callLaterHandler}
                    >
                      <SvgComponent name={'NewCall'} />
                      <span style={{ color: '#387DE5', marginLeft: '0.5rem' }}>
                        Call Later
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {donorsInfo && (
            <div className="right d-flex flex-column col-lg-6 justify-content-end">
              <StartCall
                CallJobContactId={donorsInfo?.cjc_id}
                NumberOfRetries={donorsInfo?.no_of_retry}
                CallJobId={id}
                maxCallCount={donorsInfo?.max_call_count}
                getCallJobDonorInfo={getCallJobDonorInfo}
                getCallJobAgent={getCallJobAgent}
                CallJobAgent={callJobAgent}
                getDialingCenterCallJob={getDialingCenterCallJob}
                DialingCenterCallJob={dialingCenterCallJob}
              />
            </div>
          )}
        </div>
        <CallLaterModalPopUp
          title="Call Later"
          modalPopUp={closeModal}
          setModalPopUp={setCloseModal}
          scId={donorsInfo?.sc_id}
        />

        {/* <DailingCenterDetails callJobId={id} donorId={donorsInfo?.id} /> */}
        {isLocationChanged ? (
          <DialingCenterFilter donorId={donorsInfo?.id} />
        ) : (
          <DailingCenterDetails
            callJobId={id}
            donorId={donorsInfo?.id}
            isAppointment={isAppointment}
          />
        )}
      </div>
      {openCreateTask && (
        <DialingCenterCreateTaskModal
          openModal={openCreateTask}
          setOpenModal={setOpenCreateTask}
          data={{}}
        />
      )}
    </Layout>
  );
};

export default StartCalling;
