/* eslint-disable */

import React, { useEffect, useState, useRef } from 'react';
import SvgComponent from '../../../common/SvgComponent';
import Styles from '../../index.module.scss';
import ToolTip from '../../../common/tooltip';
import ConfirmModal from '../../../common/confirmModal';
import ConfirmationIcon from '../../../../assets/images/confirmation-image.png';
import { useLocation, useNavigate } from 'react-router';
import { fetchData, makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';

const ControlOptions = ({
  topDivRef,
  bottomDivRef,
  operations,
  selectedOperation,
  setSelectedOperation,
  selectedIndex,
  setSelectedIndex,
  scheduleId,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const schedule_status = searchParams.get('schedule_status');
  const schedule_id = searchParams.get('schedule_id');
  const operation_id = searchParams.get('operation_id');
  const navigate = useNavigate();
  const [showStopModal, setShowStopModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState('Draft');
  const [isSingleOperationFlagged, setIsSingleOperationFlagged] =
    useState(false);

  const operationName = selectedOperation.name;
  const resolve = searchParams.get('resolve');

  useEffect(() => {
    setScheduleStatus(schedule_status);
    if (resolve && resolve === '1') {
      setIsSingleOperationFlagged(true);
    }
  }, []);

  const actionButtonsRef = useRef(null);
  const schedulePublishedRef = useRef(null);
  useEffect(() => {
    const actionButtons = actionButtonsRef.current;
    const schedulePublished = schedulePublishedRef.current;
    const topDiv = topDivRef.current;
    const bottomDiv = bottomDivRef.current;
    if (!actionButtons || !schedulePublished) return;
    function adjustBottomDivHeight() {
      const topDivHeight = topDiv.getBoundingClientRect().height + 15;
      actionButtons.style.marginTop = `${topDivHeight - 150}px`;
      schedulePublished.style.marginTop = `${topDivHeight - 300}px`;
      bottomDiv.style.marginTop = `${topDivHeight}px`;
    }
    adjustBottomDivHeight(); // Adjust on initial load
    const handleResize = () => {
      adjustBottomDivHeight(); // Adjust on resize
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [actionButtonsRef, schedulePublishedRef, topDivRef, bottomDivRef]);

  const handleOperationChange = (state) => {
    const queryParams = new URLSearchParams();
    // // Set the new query parameters
    searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });

    if (state == 'next') {
      queryParams.set('operation_id', operations[selectedIndex + 1]?.id);
      queryParams.set(
        'operation_type',
        operations[selectedIndex + 1]?.operation_type
      );
      setSelectedIndex(selectedIndex + 1);
      setSelectedOperation(operations[selectedIndex + 1]);
    } else if (state === 'previous') {
      queryParams.set('operation_id', operations[selectedIndex - 1]?.id);
      queryParams.set(
        'operation_type',
        operations[selectedIndex - 1]?.operation_type
      );
      setSelectedIndex(selectedIndex - 1);
      setSelectedOperation(operations[selectedIndex - 1]);
    }

    const newUrl = `${
      resolve
        ? STAFFING_MANAGEMENT_BUILD_SCHEDULE.CHANGE_SUMMARY
        : STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS
    }?${queryParams.toString()}`;
    // navigate to update the URL without reloading the page
    navigate(newUrl, { replace: true });
  };

  const handleStop = async () => {
    // Stop session
    try {
      const response = await fetchData(
        `/staffing-management/schedules/stop/schedule/${scheduleId}/${operation_id}`,
        'PATCH'
      );
      if (response.status_code === 200) {
        navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST);
      } else {
        toast.error('Failed to Stop Schedule.', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to Stop Schedule: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const handlePause = async () => {
    // Pause session
    try {
      const response = await fetchData(
        `/staffing-management/schedules/pause/schedule/${scheduleId}/${operation_id}`,
        'PATCH'
      );
      if (response.status_code === 200) {
        navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST);
      } else {
        toast.error('Failed to Pause Schedule.', {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to Pause Schedule: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const handlePublish = async () => {
    // Publish schedule
    try {
      const response = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/staffing-management/schedules/publish/schedule/${scheduleId}`
      );
      if (response.status === 200) {
        if (scheduleStatus !== 'Published') {
          setScheduleStatus('Published');
          navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST);
        }
        setShowPublishModal(false);
      } else {
        toast.error(`Failed to Publish Schedule`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to Publish Schedule: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const handleNotify = async () => {
    const operationsMap = operations.map((row) => {
      return {
        operation_id: row.id,
        operation_type: row.operation_type,
      };
    });

    if (operationsMap) {
      try {
        // TODO: instead of window.location.href link will be /staffing-management/build-schedule/{build_schedule_id}/operation-list that will sent to staff
        const response = await makeAuthorizedApiRequest(
          'POST',
          `${BASE_URL}/staffing-management/schedules/operations/notify/staff`,
          JSON.stringify({
            subject: 'Your Schedule has changed',
            content: `Your hours have changed for the schedule beginning {Schedule Start Date}. Please click <a href="${window.location.href}" target="_blank">here</a> to review the schedule`,
            schedule_id: schedule_id,
            operations: operationsMap,
          })
        );
        const data = await response.json();
        if (data?.status_code === 200) {
          setShowNotifyModal(false);
          navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST);
        } else {
          toast.error(`Failed to Notify Staffs`, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error(`Failed to Notify Staffs: ${error}`, {
          autoClose: 3000,
        });
      }
    }
  };

  const handleFinish = () => {
    if (resolve) {
      navigate(STAFFING_MANAGEMENT_BUILD_SCHEDULE.LIST);
    } else {
      scheduleStatus === 'Published'
        ? setShowNotifyModal(true)
        : setShowPublishModal(true);
    }
  };

  const handleNotifyCancel = () => {
    setShowNotifyModal(false);
    const queryParams = new URLSearchParams();
    // Set the new query parameters
    searchParams.forEach((value, key) => {
      queryParams.set(key, value);
    });
    queryParams.delete('operation_id');
    queryParams.delete('operation_type');
    navigate(
      STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT + `?${queryParams.toString()}`
    );
  };

  return (
    <div>
      <div ref={schedulePublishedRef}>
        {scheduleStatus === 'Published' && (
          <div className={Styles.alertContainer}>
            <div className={Styles.alertBox} role="alert">
              <SvgComponent name="PreliminaryIcon" />
              <span className={Styles.alertTitle}>Schedule Published</span>
            </div>
          </div>
        )}
      </div>

      <div className={Styles.detailsActionBtnsContainer} ref={actionButtonsRef}>
        <div className="buttons d-flex gap-4">
          {!resolve && (
            <>
              <ToolTip text={`Stop ${operationName}`}>
                <button
                  onClick={() => setShowStopModal(true)}
                  className={`${Styles.detailsActionBtn} ${Styles.detailsActionStopBtn}`}
                >
                  Stop
                </button>
              </ToolTip>
              <ToolTip text={`Pause ${operationName}`}>
                <button
                  onClick={() => setShowPauseModal(true)}
                  className={`${Styles.detailsActionBtn} ${Styles.detailsPrimaryActionBtn}`}
                >
                  Pause
                </button>
              </ToolTip>
            </>
          )}
          <div className="d-flex align-items-center gap-4">
            {!isSingleOperationFlagged && (
              <>
                {selectedIndex > 0 ? (
                  <ToolTip text={operations?.[selectedIndex - 1]?.name}>
                    <button
                      onClick={() => handleOperationChange('previous')}
                      className={`${Styles.detailsActionBtn} ${Styles.detailsActionArrowBtns}`}
                    >
                      <SvgComponent name="ArrowLeft" />
                    </button>
                  </ToolTip>
                ) : (
                  <button
                    disabled="true"
                    className={`${Styles.detailsActionBtn} ${Styles.detailsActionArrowBtns}`}
                  >
                    <SvgComponent name="ArrowLeft" />
                  </button>
                )}
                <p className={`mb-0 ${Styles.detailsActionCounterView}`}>
                  {' '}
                  {selectedIndex + 1}/{operations?.length}{' '}
                </p>
                {selectedIndex < operations?.length - 1 ? (
                  <ToolTip text={operations?.[selectedIndex + 1]?.name}>
                    <button
                      onClick={() => handleOperationChange('next')}
                      className={`${Styles.detailsActionBtn} ${Styles.detailsActionArrowBtns}`}
                    >
                      <SvgComponent name="ArrowRight" />
                    </button>
                  </ToolTip>
                ) : (
                  <button
                    disabled="true"
                    className={`${Styles.detailsActionBtn} ${Styles.detailsActionArrowBtns}`}
                  >
                    <SvgComponent name="ArrowRight" />
                  </button>
                )}
              </>
            )}
            {(resolve || selectedIndex === operations?.length - 1) && (
              <button
                onClick={() => handleFinish()}
                className={`${Styles.detailsActionBtn} ${Styles.detailsPrimaryActionBtn}`}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        showConfirmation={showStopModal}
        onCancel={() => setShowStopModal(false)}
        onConfirm={() => handleStop()}
        icon={ConfirmationIcon}
        heading={'Continue?'}
        description={
          'This action will save your schedule progress, unlock this session, and return to the main screen.'
        }
      />

      <ConfirmModal
        showConfirmation={showPauseModal}
        onCancel={() => setShowPauseModal(false)}
        onConfirm={() => handlePause()}
        icon={ConfirmationIcon}
        heading={'Continue?'}
        description={
          'This action will save your scheduling progress and keep this session locked. If you want to unlock this session, please click the STOP button.'
        }
      />

      <ConfirmModal
        showConfirmation={showPublishModal}
        onCancel={() => handleStop()}
        onConfirm={() => handlePublish()}
        icon={ConfirmationIcon}
        heading={'Confirmation'}
        cancelBtnText="Keep in Draft"
        confirmBtnText="Publish"
        description={
          'This action will save your schedule progress, unlock this session, and return to the main screen.'
        }
      />

      <ConfirmModal
        showConfirmation={showNotifyModal}
        onCancel={() => handleNotifyCancel()}
        onConfirm={() => handleNotify()}
        icon={ConfirmationIcon}
        heading={'Confirmation'}
        confirmBtnText="Notify"
        description={'Notify Staff of this change?'}
      />
    </div>
  );
};

export default ControlOptions;
