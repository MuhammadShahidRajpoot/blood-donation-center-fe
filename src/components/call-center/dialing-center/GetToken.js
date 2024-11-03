import React, { useEffect, useState } from 'react';
import styles from './phone.module.scss';
import axios from 'axios';
import { Device } from '@twilio/voice-sdk';
// import TransferCall from '../../../assets/transfer_call.svg';
// import HoldCall from '../../../assets/hold_call.svg';
import EndSessionBtn from '../../../assets/EndSessionBtn.svg';
// import EndCall from '../../../assets/end_call.svg';
import NextCallBtn from '../../../assets/NextCallBtn.svg';
import ConfirmModal from '../../common/confirmModal';
import Vectorhold from '../../../assets/Vectorhold.svg';
import VectorTransfer from '../../../assets/vectorTransfer.svg';
import VectorPhone from '../../../assets/vectorPhone.svg';

import { ReactComponent as CrossIcon } from '../../../assets/modal_cross.svg';

import ToolTip from '../../common/tooltip';
import TransferExtension from './transfer-extension/TransferExtension.js';
import { Link, useLocation } from 'react-router-dom';
import SvgComponent from '../../common/SvgComponent.js';
import { toast } from 'react-toastify';
export let device, callConnection, callTime, callResume, callPause;

const StartCall = ({
  CallJobContactId,
  NumberOfRetries,
  CallJobId,
  maxCallCount,
  getCallJobDonorInfo,
  getCallJobAgent,
  CallJobAgent,
  getDialingCenterCallJob,
  DialingCenterCallJob,
}) => {
  const USER_STATE = {
    CONNECTING: 'Connecting',
    READY: 'Ready',
    ON_CALL: 'On call',
    OFFLINE: false,
  };

  const [token, setToken] = useState('');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [callCenterSettings, setCallCenterSettings] = useState('');
  const [callInitiated, setCallInitiated] = useState(false);
  const [childCall, setChildCall] = useState(null);
  const [callFlow, setCallFlow] = useState(null);
  const [callScript, setCallScript] = useState(null);
  const [playedVoiceMessage, setPlayedVoiceMessage] = useState(false);
  const jwtToken = localStorage.getItem('token');
  const [userState, setUserState] = useState(USER_STATE.OFFLINE);
  const [isConfirmationVisible, setConfirmationVisibility] = useState(false);
  const [dialer, setDialer] = useState('');
  const [connection, setConnection] = useState(null);
  const [callDevice, setDevice] = useState();
  const [transferCallModal, setTransferCallModal] = useState(false);
  const [nextCallModal, setNextCallModal] = useState(false);
  const [endCallStatus, setEndCallStatus] = useState(false);
  const [isFirstinitCalled, setIsFristInitCalled] = useState(false);
  const location = useLocation();
  const previousPath = location.state?.from;
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    init();
  }, [token]);
  useEffect(() => {
    if (callInitiated && connection) {
      setTimeout(() => {
        getCallInfo(connection?.parameters?.CallSid);
      }, 2000);
    }
  }, [callInitiated, connection, childCall]);
  const getTwilioToken = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/call-center/dialing-center/start-calling/token`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (response) {
        const { token } = response.data.data;
        setToken(token);
      }
    } catch (error) {
      console.error('Error fetching twilio token:', error);
    }
  };

  const updateCallJobContactRecord = async (updateRequest) => {
    try {
      const id = CallJobContactId;
      const bodyData = {
        call_outcome_id: updateRequest?.call_outcome_id,
        no_of_retry: updateRequest?.numberOfRetry,
        call_status: updateRequest?.call_status,
        max_call_count: updateRequest?.maxCallCount,
      };

      await axios.patch(
        `${BASE_URL}/call-center/call-jobs-segments-contacts/${id}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error while updating call job contacts data:', error);
    }
  };

  const updateCallJobAgentRecord = async () => {
    try {
      const id = CallJobAgent?.id;
      const bodyData = {
        actual_calls: parseInt(CallJobAgent.actual_calls) + 1,
      };

      await axios.patch(
        `${BASE_URL}/call-center/call-jobs/call-jobs-agents/${id}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error while updating call job contacts data:', error);
    }
  };

  const updateDialingCenterCallJobRecord = async () => {
    try {
      const id = DialingCenterCallJob?.id;
      const bodyData = {
        actual_calls: parseInt(DialingCenterCallJob.actual_calls) + 1,
        call_job_id: id,
      };

      await axios.patch(
        `${BASE_URL}/call-center/dialing-center/dialing-center-call-job/${id}`,
        bodyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
    } catch (error) {
      console.error(
        'Error while updating dialing center call job data:',
        error
      );
    }
  };

  const getCallCenterSettings = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center-administrations/call-center-settings`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response) {
        setCallCenterSettings(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching twilio token:', error);
    }
  };

  const getCallInfo = async (sid) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/dialing-center/start-calling/call-child?parent_call_sid=${sid}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (response) {
        setChildCall(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching call informations: ', error);
    }
  };

  const playVoiceMessage = async () => {
    try {
      const body = {
        voice_message_url: callScript?.file_attachment?.attachment_path, //voice message stored on s3
        child_call_sid: childCall.sid,
      };
      const response = await axios.put(
        `${BASE_URL}/call-center/dialing-center/start-calling/voice-message`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response) {
        setPlayedVoiceMessage(true);
        toast.success('Playing recorded voice message.');
      }
    } catch (error) {
      console.error('Error while playing recorded voice message', error);
    }
  };

  const getCallFlow = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/call-flows/call-job-id/${CallJobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      if (response?.data?.data) {
        setCallFlow(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching call flow: ', error);
    }
  };

  const getCallScript = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/scripts/call-job-id/${CallJobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response?.data?.data) {
        setCallScript(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching call script: ', error);
    }
  };

  useEffect(() => {
    getTwilioToken();
    getCallCenterSettings();
    getCallFlow();
    getCallScript();
  }, []);

  useEffect(() => {
    if (callFlow && callScript && callCenterSettings) {
      setIsDataLoaded(true);
    }
  }, [callFlow, callScript, callCenterSettings]);

  const Clock = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const updateTime = () => {
        setCurrentTime(new Date());
      };
      updateTime();
      const intervalId = setInterval(updateTime, 1000);
      return () => clearInterval(intervalId);
    }, []);
    const formattedTime = currentTime.toLocaleTimeString();
    return <p> Today’s time: {formattedTime}</p>;
  };

  const Timer = () => {
    const [timer, setTimer] = useState({ mins: 0, sec: 0 });
    const getTime = () => {
      setTimer((state) => ({
        mins: state.sec === 60 ? state.mins + 1 : state.mins,
        sec: state.sec === 60 ? 0 : state.sec + 1,
      }));
    };
    useEffect(() => {
      const interval = setInterval(() => getTime(), 1000);
      return () => clearInterval(interval);
    }, []);

    callTime = `${timer.mins < 9 ? '0' + timer.mins : timer.mins} : ${
      //Need to verify when call initiated
      timer.sec < 9 ? '0' + timer.sec : timer.sec
    }`;

    return (
      <p>
        {`${timer.mins < 9 ? '0' + timer.mins : timer.mins} : ${
          timer.sec < 9 ? '0' + timer.sec : timer.sec
        }`}
      </p>
    );
  };

  const handleNoAnswer = () => {
    const no_of_retry = parseInt(NumberOfRetries) + 1;
    const max_retries =
      callCenterSettings?.no_answer_call_treatment?.max_retries;
    if (max_retries == no_of_retry) {
      updateCallJobContactRecord({
        call_outcome_id: parseInt(
          callCenterSettings?.no_answer_call_treatment?.no_answer_call_outcome
        ),
        numberOfRetry: no_of_retry,
        call_status: '2', // status completed
      });
    } else {
      updateCallJobContactRecord({
        call_outcome_id: parseInt(
          callCenterSettings?.no_answer_call_treatment?.busy_call_outcome
        ),
        numberOfRetry: no_of_retry,
      });
    }
  };

  useEffect(() => {
    if (childCall && callInitiated) {
      if (childCall?.status === 'no-answer') {
        handleNoAnswer();
        setCallInitiated(false);
        setNextCallModal(false);
      } else if (childCall?.status === 'in-progress') {
        setNextCallModal(false);
        updateCallJobContactRecord({
          maxCallCount: parseInt(maxCallCount) + 1,
          call_status: '2', // status completed
        });
        updateCallJobAgentRecord();
        updateDialingCenterCallJobRecord();
        if (callFlow?.caller_answer_call === 'play voice message') {
          if (!playedVoiceMessage) playVoiceMessage();
        }
      } else if (childCall?.status === 'completed') {
        setNextCallModal(false);
        setCallInitiated(false);
      }
    }
  }, [childCall]);

  const init = async () => {
    if (token) {
      try {
        console.log('Token connected successfully!!', token);
        device = new Device(token, {
          logLevel: 1,
          edge: 'ashburn',
        });
        device.register();
        setDevice(device);
        device.addListener('connect', (device) => {
          console.log('Connect event listener added .....');
          return device;
        });
        device.on('registered', () => {
          console.log('Agent registered');
          setUserState(USER_STATE.READY);
        });
        device.on('connect', (connection) => {
          console.log('Call connect');
          setUserState(USER_STATE.ON_CALL);
        });
        device.on('disconnect', () => {
          console.log('Disconnect event');
          setUserState(USER_STATE.READY);
        });
        setIsFristInitCalled(true);
      } catch (error) {
        console.log('Error', error);
      }
    }
  };
  useEffect(() => {
    if (
      isFirstinitCalled &&
      token &&
      isDataLoaded &&
      previousPath === '/call-center/dialing-center/call-jobs'
    ) {
      handleCall();
    }
  }, [isFirstinitCalled, token, isDataLoaded]);

  const handleCall = async () => {
    const noCallAnswerTreatment = callCenterSettings?.no_answer_call_treatment;
    const params = {
      To: '+16176496457',
      numberOfRings: noCallAnswerTreatment?.max_no_of_rings,
      CallJobId: CallJobId,
    };
    setPlayedVoiceMessage(false);
    try {
      callDevice?.emit('connect');
      callDevice
        ?.connect({
          params: params,
          rtcConstraints: {
            audio: true,
          },
        })
        .then((call) => {
          setCallInitiated(true);
          call.on('accept', () => {
            setConnection(call);
            setNextCallModal(true);
            callConnection = call;
            setUserState(USER_STATE.ON_CALL);
            console.log('call accepted');
          });
          call.on('disconnect', () => {
            console.log('The call has been disconnected.');
            setNextCallModal(false);
            setUserState(USER_STATE.READY);
            setConnection(null);
          });
          call.on('reject', () => {
            console.log('The call was rejected.');
          });
        })
        .catch((error) => {
          toast.error('Error connecting the call', {
            autoClose: 3000,
          });
          // Handle the error here
        });
    } catch (error) {
      console.log('Error', error);
    }
  };
  const pauseCall = async () => {
    setConfirmationVisibility(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/dialing-center/start-calling/hold?callSid=${connection?.parameters?.CallSid}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('response', response);
    } catch (error) {
      console.error('Error fetching twilio token:', error);
    }
  };

  const resumeCall = async () => {
    setTransferCallModal(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/call-center/dialing-center/start-calling/resume?callSid=${connection?.parameters?.CallSid}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error('Error fetching twilio token:', error);
    }
  };
  callResume = resumeCall;
  callPause = pauseCall;
  const handleEndCall = () => {
    if (!connection) return;
    connection.disconnect();
    setEndCallStatus(true);
  };
  return (
    <div>
      <div style={{ textAlign: 'end' }} className="pb-3">
        <p className="fw-normal fs-5 fw-bold m-0">
          <Clock />
        </p>
        <span className="fw-normal">Call time: </span>
        <span className="fs-4 fw-bold">
          {userState === USER_STATE.ON_CALL && <Timer />}
        </span>
      </div>
      <div className="d-flex justify-content-end align-items-end">
        <div className="d-flex gap-3 ">
          <Link
            className="p-0 bg-transparent"
            to={'/call-center/dialing-center/call-jobs'}
          >
            <img src={EndSessionBtn} alt="EndSessionBtn" />{' '}
          </Link>

          {/* <ToolTip
              text="Hold"
              childeren={
                <button className="buttonSet" onClick={() => pauseCall()}>
                  <img src={HoldCall} alt="HoldCall" />
                </button>
              }
            />
            <ToolTip
              text="Transfer"
              childeren={
                <button className="buttonSet" onClick={() => resumeCall()}>
                  <img src={TransferCall} alt="TransferCall" />
                </button>
              }
            /> */}
          <ToolTip
            text="Hang up"
            childeren={
              <button
                className={styles.buttonSet}
                onClick={() => handleEndCall()}
              >
                <SvgComponent
                  name={endCallStatus ? 'EndCallDullIcon' : 'EndCallIcon'}
                />
              </button>
            }
          />
          <button
            className={styles.buttonSet}
            onClick={() => {
              getCallJobDonorInfo();
              getCallJobAgent();
              getDialingCenterCallJob();
              handleCall();
            }}
            style={{ cursor: 'pointer' }}
          >
            <img src={NextCallBtn} alt="NextCallBtn" />
          </button>
        </div>
      </div>
      <ConfirmModal
        classes={{
          // inner: styles.scheduleShiftPopup,
          // btnGroup: 'gap-4',
          btn: 'w-100',
        }}
        showConfirmation={isConfirmationVisible}
        onCancel={() => setConfirmationVisibility(false)}
        onConfirm={() => {
          setConfirmationVisibility(false);
        }}
        icon={Vectorhold}
        heading={'On Hold'}
        confirmBtnText="Resume Call"
        description={<h3>00: 23</h3>}
        isHoldCall={true}
      />
      <ConfirmModal
        classes={{
          btn: 'w-100',
        }}
        showConfirmation={nextCallModal}
        onCancel={() => setNextCallModal(false)}
        onConfirm={() => {
          setNextCallModal(false);
        }}
        icon={VectorPhone}
        heading={'Connecting to Next call'}
        description={<div className={styles.loader}></div>}
        confirmBtnText="End Session"
        isCallLoading={true}
      />
      <ConfirmModal
        classes={{
          inner: styles.popWidth,
          btnGroup: 'gap-4',
          btn: 'w-50',
        }}
        showConfirmation={transferCallModal}
        onCancel={() => setTransferCallModal(false)}
        onConfirm={() => {
          setTransferCallModal(false);
        }}
        icon={VectorTransfer}
        heading={''}
        confirmBtnText="Release Call"
        cancelBtnText="Conference Call"
        onCrossClick={() => {
          console.log('Cross click');
          setTransferCallModal(false);
          setDialer('');
        }}
        modalCrossIcon={<CrossIcon />}
        description={
          <TransferExtension dialer={dialer} setDialer={setDialer} />
        }
      />
    </div>
  );
};

export default StartCall;
