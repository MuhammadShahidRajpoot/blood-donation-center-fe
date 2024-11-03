import styles from './index.module.scss';
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import './TimePicker.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const CallLaterModalPopUp = ({
  title = '',
  modalPopUp,
  setModalPopUp,
  scId,
}) => {
  const [selectedTime, setSelectedTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const timePickerRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const callStatus = {
    PENDING: '1',
    COMPLETED: '2',
    QUEUE: '3',
  };

  const handleTimeChange = (event) => {
    const selectedTimeValue = event.target.value;
    setSelectedTime(selectedTimeValue);
    const validTime = isTimeValid(selectedTimeValue);
    if (!validTime) {
      setErrorMessage('Please select time above the current time.');
    } else {
      setErrorMessage('');
    }
  };

  const isTimeValid = (time) => {
    const currentTime = new Date();
    const [hours, minutes] = time.split(':');
    const selectedTime = new Date();
    selectedTime.setHours(parseInt(hours, 10));
    selectedTime.setMinutes(parseInt(minutes, 10));
    return selectedTime > currentTime;
  };

  const confirmAction = async () => {
    if (!errorMessage) {
      try {
        const bodyData = {
          call_status: callStatus.QUEUE,
          queue_time: selectedTime,
        };
        const response = await axios.patch(
          `${BASE_URL}/call-center/segments-contacts/${scId}`,
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
      } catch (error) {
        console.error('Error archiving data:', error);
      }
      setModalPopUp(false);
    }
  };

  const closeModal = () => {
    setModalPopUp(false);
  };
  const handleClick = () => {
    if (timePickerRef.current) {
      timePickerRef.current.click();
    }
  };

  useEffect(() => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 10);
    const defaultTime = currentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    setSelectedTime(defaultTime);
  }, []);
  return (
    <>
      <Modal
        className={`${styles.modalMain} d-flex align-items-center  justify-content-center `}
        show={modalPopUp}
        onHide={() => setModalPopUp(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body
          className={`d-flex flex-column justify-content-center align-items-center p-20  ${styles.modalbody}`}
          style={{ width: '350px' }}
        >
          <div className={styles.primary}>
            <svg
              width="111"
              height="110"
              viewBox="0 0 111 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="55.125" cy="55" r="55" fill="white" />
              <g clipPath="url(#clip0_4789_152118)">
                <circle cx="54.8967" cy="54.7717" r="47.7717" fill="#EDF4FF" />
                <mask
                  id="mask0_4789_152118"
                  style={{ maskType: 'alpha' }}
                  maskUnits="userSpaceOnUse"
                  x="30"
                  y="30"
                  width="51"
                  height="50"
                >
                  <rect
                    x="30.125"
                    y="30"
                    width="50"
                    height="50"
                    fill="#D9D9D9"
                  />
                </mask>
                <g mask="url(#mask0_4789_152118)">
                  <path
                    d="M69.584 72.7082C65.6578 72.7082 61.7135 71.7954 57.7511 69.9698C53.7888 68.1443 50.1484 65.5688 46.8297 62.2435C43.5111 58.9182 40.939 55.2777 39.1134 51.3221C37.2878 47.3664 36.375 43.4255 36.375 39.4992C36.375 38.8685 36.5833 38.3429 37 37.9224C37.4167 37.5019 37.9375 37.2917 38.5625 37.2917H45.3573C45.8835 37.2917 46.3476 37.4633 46.7495 37.8065C47.1515 38.1497 47.4072 38.5738 47.5167 39.0785L48.7106 45.2083C48.7934 45.7772 48.7761 46.266 48.6585 46.6746C48.541 47.0833 48.33 47.4265 48.0255 47.7043L43.2139 52.3878C43.9884 53.806 44.8732 55.1475 45.8681 56.4122C46.8631 57.6769 47.9401 58.8849 49.0993 60.036C50.2425 61.1792 51.4578 62.2409 52.7452 63.2211C54.0326 64.2014 55.4228 65.1135 56.9158 65.9575L61.5913 61.242C61.9172 60.9028 62.3118 60.6651 62.7752 60.5289C63.2386 60.3926 63.7201 60.3593 64.2195 60.4287L70.0047 61.6066C70.5309 61.7455 70.9602 62.0139 71.2928 62.4118C71.6253 62.8098 71.7916 63.2612 71.7916 63.766V70.5207C71.7916 71.1457 71.5813 71.6666 71.1608 72.0832C70.7403 72.4999 70.2147 72.7082 69.584 72.7082ZM41.7355 49.4311L45.4535 45.8734C45.5203 45.82 45.5637 45.7465 45.5837 45.653C45.6037 45.5595 45.6004 45.4727 45.5737 45.3926L44.6682 40.7371C44.6415 40.6303 44.5948 40.5502 44.528 40.4968C44.4613 40.4433 44.3744 40.4166 44.2676 40.4166H39.8124C39.7323 40.4166 39.6656 40.4433 39.6121 40.4968C39.5587 40.5502 39.532 40.6169 39.532 40.6971C39.6388 42.1207 39.8719 43.567 40.2311 45.036C40.5904 46.5051 41.0918 47.9701 41.7355 49.4311ZM59.8605 67.4358C61.2414 68.0795 62.6817 68.5717 64.1814 68.9122C65.6812 69.2528 67.0827 69.4551 68.3861 69.5192C68.4663 69.5192 68.5331 69.4925 68.5865 69.4391C68.6399 69.3856 68.6666 69.3188 68.6666 69.2387V64.8557C68.6666 64.7489 68.6399 64.6621 68.5865 64.5953C68.5331 64.5285 68.4529 64.4818 68.3461 64.4551L63.9711 63.5656C63.891 63.5389 63.8209 63.5356 63.7608 63.5556C63.7007 63.5757 63.6372 63.6191 63.5705 63.6858L59.8605 67.4358Z"
                    fill="#387DE5"
                  />
                  <path
                    d="M64.4957 36.25C65.6519 36.25 66.7363 36.4577 67.7489 36.873C68.7616 37.2883 69.6442 37.8544 70.3966 38.5711C71.1491 39.2879 71.7433 40.1272 72.1793 41.0891C72.6153 42.051 72.8333 43.0826 72.8333 44.184C72.8333 45.2853 72.6153 46.315 72.1793 47.2729C71.7433 48.2308 71.1456 49.0682 70.3861 49.785C69.6266 50.5017 68.7415 51.0678 67.7308 51.4831C66.7201 51.8984 65.6362 52.1061 64.4789 52.1061H64.3523L65.4705 53.1712L63.6139 55L59.2257 50.84L63.5717 46.7002L65.4705 48.4887L64.3312 49.574H64.4789C66.0598 49.574 67.4009 49.0514 68.5022 48.0062C69.6034 46.9611 70.154 45.6883 70.154 44.1879C70.154 42.6875 69.6054 41.4114 68.5082 40.3597C67.411 39.308 66.0749 38.7822 64.4998 38.7822C62.9247 38.7822 61.5851 39.3047 60.481 40.3498C59.3769 41.3949 58.8249 42.6677 58.8249 44.168L56.1667 44.168C56.1667 43.0828 56.3847 42.0579 56.8207 41.0932C57.2567 40.1286 57.8509 39.2879 58.6034 38.5711C59.3558 37.8544 60.2369 37.2883 61.2467 36.873C62.2565 36.4577 63.3394 36.25 64.4957 36.25Z"
                    fill="#387DE5"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_4789_152118">
                  <rect
                    width="95.5435"
                    height="95.5435"
                    fill="white"
                    transform="translate(7.125 7)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className={`${styles.text_width}`}>
            {title ? (
              <p className={`modal-title text-center ${styles.heading}`}>
                {title}
              </p>
            ) : (
              ''
            )}
          </div>

          <div className="form-field" style={{ width: '90%' }}>
            <div
              className="field"
              style={{ position: 'relative' }}
              onClick={handleClick}
            >
              <label htmlFor="timePicker" className={styles.inputLabel}>
                Due Time
              </label>
              <input
                type="time"
                id={`${styles.timePicker}`}
                ref={timePickerRef}
                className={`${styles.inpputField}`}
                name="timePicker"
                value={selectedTime}
                onChange={handleTimeChange}
                style={{ height: '50px', paddingRight: '5px' }}
              />
              {errorMessage && (
                <p style={{ color: 'red', fontSize: '14px', margin: '0px' }}>
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <div
            className={`d-flex justify-content-around w-100 ${styles.modalButtons}`}
          >
            <button
              type="button"
              className={`btn btn-secondary ${styles.nobtn} ${styles.nobtnhover} ${styles.submitbutton}`}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-primary ${styles.nobtn} ${styles.submitbutton}`}
              onClick={confirmAction}
            >
              Confirm
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CallLaterModalPopUp;
