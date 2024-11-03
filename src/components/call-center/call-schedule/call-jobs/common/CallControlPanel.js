import React, { useEffect, useState, useContext } from 'react';
import Contact from '../../../../../assets/contact.svg';
import EndCall from '../../../../../assets/EndCall.svg';
import DragIndicator from '../../../../../assets/DragIndicator.svg';
import BackToTab from '../../../../../assets/BackToTab.svg';
import { useNavigate } from 'react-router-dom';
import styles from '../call-jobs.module.scss';
import { GlobalContext } from '../../../../../Context/Context';
// import HoldCall from '../../../../../assets/HoldCall.svg';
// import ForwardCall from '../../../../../assets/ForwardCall.svg';
import {
  firstName,
  lastName,
  phoneNo,
} from '../../../dialing-center/StartCalling';
import {
  // device,
  callConnection,
  // callResume,
  // callPause,
  callTime,
} from '../../../dialing-center/GetToken';

const CallControlPanel = () => {
  const [startCallId, setStartCallId] = useState();

  const [position, setPosition] = useState({
    x: window.innerWidth - 48,
    y: window.innerHeight - 30,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const { setCallControlPopup } = useContext(GlobalContext);

  const backToDialingCenter = () => {
    setCallControlPopup(false);
    navigate(`/call-center/dialing-center/call-jobs/${startCallId}/start`);
  };

  useEffect(() => {
    setStartCallId(localStorage.getItem('startCallId'));
  }, []);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    setDragOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      setPosition({
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <>
      <div
        style={{
          position: isDragging ? 'absolute' : 'fixed',
          right: window.innerWidth - position.x,
          bottom: window.innerHeight - position.y,
          zIndex: 1000,
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="d-flex justify-content-between p-3 row"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #D9D9D9',
          }}
        >
          <div
            style={{
              width: '491px',
              padding: '0px',
            }}
          >
            <div className="d-flex justify-content-between pb-2">
              <button className="px-2" style={{ background: 'transparent' }}>
                <img src={DragIndicator} alt="DragIndicator" />
              </button>
              <button
                className="p-0"
                style={{ background: 'transparent' }}
                onClick={backToDialingCenter}
              >
                <img src={BackToTab} alt="BackToTab" />
              </button>
            </div>
            <div className="d-flex justify-content-between py-2">
              <div className="d-flex pb-2">
                <div>
                  <img src={Contact} className="" alt="notebook" />
                </div>

                <div className="mx-2 ">
                  <p className="fs-5 fw-bold m-0">
                    {firstName + ' ' + lastName}
                  </p>
                  <p>{phoneNo}</p>
                </div>
              </div>
              <div className={`${styles.callControlPanel}`}>{callTime}</div>
            </div>
            {/*when we have to uncomment the ForwardCall & HoldCall Buttons 
            then we need to change from justify-content-end to justify-content-between*/}
            <div className="d-flex justify-content-end">
              {/* <button
                className="p-0"
                style={{ background: 'transparent' }}
                onClick={() => {
                  callPause();
                }}
              >
                <img src={HoldCall} alt="HoldCall" />
              </button>
              <button
                style={{ background: 'transparent' }}
                className="p-0"
                onClick={() => {
                  callResume();
                }}
              >
                <img src={ForwardCall} alt="ForwardCall" />
              </button> */}
              <button
                className="p-0"
                style={{ background: 'transparent' }}
                onClick={() => {
                  callConnection && callConnection.disconnect();
                }}
              >
                <img src={EndCall} alt="EndCall" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallControlPanel;
