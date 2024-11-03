import styles from './index.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { ReactComponent as CrossIcon } from '../../../assets/modal_cross.svg';
import CustomAudioPlayer from '../CustomAudioPlayer';

const mimeType = 'audio/wav';

const RecordMessageModalPopUp = ({
  title = '',
  modalPopUp,
  setModalPopUp,
  additionalStyles = {},
  customIcon,
  width = '485px',
  setScriptRecording,
  setScriptRecordingBlob,
}) => {
  const [time, setTime] = useState(0);
  const [isRecording, setRecording] = useState(false);
  const [isPaused, setPaused] = useState(false);
  const [showPauseStop, setShowPauseStop] = useState(false);
  const [showReRecordDone, setShowReRecordDone] = useState(false);
  const [showRecord, setShowRecord] = useState(true);
  const mediaRecorder = useRef(null);
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const [modalHeight, setModalHeight] = useState(290);
  const [audioBlob, setAudioBlob] = useState(null);

  useEffect(() => {
    let timer;

    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    let localStream = null;

    const getMicrophonePermission = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setStream(localStream);
      } catch (err) {
        console.error(err.message);
      }
    };

    if ('MediaRecorder' in window) {
      getMicrophonePermission();
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return formattedTime;
  };

  const handleRecordClick = () => {
    const media = new MediaRecorder(stream, { type: mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);

    setRecording(true);
    setShowRecord(false);
    setShowPauseStop(true);
    setShowReRecordDone(false);
  };

  const handlePauseClick = () => {
    setPaused((prev) => !prev);
    if (mediaRecorder.current) {
      if (mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.pause();
      } else if (mediaRecorder.current.state === 'paused') {
        mediaRecorder.current.resume();
      }
    }
  };

  const handleStopClick = () => {
    setModalHeight(376);
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioBlob(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };

    setRecording(false);
    setPaused(false);
    setShowPauseStop(false);
    setShowReRecordDone(true);
    setTime(0);
  };

  const handleReRecordClick = () => {
    setModalHeight(290);
    setAudio(null);
    handleRecordClick();
  };

  const handleDoneClick = () => {
    setScriptRecording(audio);
    setScriptRecordingBlob(audioBlob);
    resetState();
    setModalPopUp(false);
  };

  const resetState = () => {
    setTime(0);
    setRecording(false);
    setPaused(false);
    setShowPauseStop(false);
    setShowReRecordDone(false);
    setShowRecord(true);
    setAudioChunks([]);
    setAudio(null);
  };

  return (
    <>
      <Modal
        className={`d-flex align-items-center  justify-content-center `}
        show={modalPopUp}
        onHide={() => setModalPopUp(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body
          className={`d-flex flex-column justify-content-center align-items-center   ${styles.modalbody}`}
          style={{
            width: 485,
            height: modalHeight,
            background: 'white',
            borderRadius: 10,
          }}
        >
          {customIcon ? (
            <div className={styles.customWarning}>{customIcon}</div>
          ) : (
            <div className={styles.warning}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="58"
                height="57"
                viewBox="0 0 58 57"
                fill="none"
              >
                <g clipPath="url(#clip0_5138_192906)">
                  <path
                    d="M45.3896 41.9803L45.7471 41.6307L45.3896 41.2811L32.4889 28.6671L45.3896 16.053L45.7471 15.7035L45.3896 15.3539L42.979 12.9969L42.6215 12.6473L42.264 12.9969L29.3633 25.6109L16.4625 12.9969L16.105 12.6473L15.7475 12.9969L13.3369 15.3539L12.9794 15.7035L13.3369 16.053L26.2377 28.6671L13.3369 41.2811L12.9794 41.6307L13.3369 41.9803L15.7475 44.3373L16.105 44.6868L16.4625 44.3373L29.3633 31.7232L42.264 44.3373L42.6215 44.6868L42.979 44.3373L45.3896 41.9803Z"
                    fill="white"
                    stroke="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_5138_192906">
                    <rect
                      width="40.4571"
                      height="40.4571"
                      fill="white"
                      transform="matrix(0.715007 0.699118 -0.715007 0.699118 29.3633 0.382812)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
          )}

          <div className={`${styles.text_width}`}>
            {title ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#2D2D2E',
                  fontSize: 32,
                  marginTop: showReRecordDone ? '20px' : '10px',
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                }}
              >
                Record Message
              </p>
            ) : (
              ''
            )}
          </div>

          <button
            className={`${styles.closeButton}`}
            onClick={() => {
              setModalPopUp(false);
            }}
            aria-label="Close"
          >
            <CrossIcon />
          </button>

          <div
            style={{
              width: 385,
              textAlign: 'center',
              color: '#2D2D2E',
              fontSize: 40,
              fontFamily: 'Inter',
              fontWeight: '700',
              wordWrap: 'break-word',
            }}
          >
            {formatTime(time)}
          </div>

          {audio ? (
            <div
              style={{ marginTop: '15px', marginBottom: '15px' }}
              className="audio-container"
            >
              <CustomAudioPlayer src={audio} audioBlob={audioBlob} />
            </div>
          ) : null}

          {showRecord && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRecordClick}
              style={{
                width: 203,
                height: 56,
                paddingLeft: 32,
                paddingRight: 32,
                paddingTop: 16,
                paddingBottom: 16,
                background: '#387DE5',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                marginTop: '20px',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 18,
                  fontFamily: 'Inter',
                  fontWeight: '400',
                  lineHeight: 24,
                  wordWrap: 'break-word',
                }}
              >
                Record
              </div>
            </button>
          )}
          {showReRecordDone && (
            <div className="d-flex justify-content-around w-100">
              <button
                type="button"
                className={`btn btn-secondary py-1 mt-4 ${styles.nobtn} ${styles.nobtnhover} ${styles.submitbutton}`}
                onClick={handleReRecordClick}
              >
                Re-record
              </button>
              <button
                type="button"
                className={`btn btn-primary py-1 mt-4 ${styles.nobtn} ${styles.submitbutton}`}
                onClick={handleDoneClick}
              >
                Done
              </button>
            </div>
          )}
          {showPauseStop && (
            <div className="d-flex justify-content-around w-100">
              <button
                type="button"
                className={`btn btn-secondary py-1 mt-4 ${styles.nobtn} ${styles.nobtnhover} ${styles.submitbutton}`}
                onClick={handlePauseClick}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                className={`btn btn-primary py-1 mt-4 ${styles.nobtn} ${styles.submitbutton}`}
                onClick={handleStopClick}
              >
                Stop
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default RecordMessageModalPopUp;
