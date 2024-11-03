import React, { useEffect, useState } from 'react';
import TelerequirementsUpsert from './TelerequirementsUpsert';

import { useParams, useNavigate } from 'react-router-dom';
import SuccessPopUpModal from '../../../common/successModal';
let inputTimer = null;

const TelerecruitmentBulkCreate = () => {
  const navigate = useNavigate();
  const { ids } = useParams();
  const [isShowingCreate, setIsShowingCreate] = useState(true);
  const [remainingDrives, setRemainingDrives] = useState(ids.split(','));
  const [successMessage, setSuccessMessage] = useState(
    'Call Job created, Continue with next!'
  );
  const [isLastCreated, setIsLastCreated] = useState(false);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);

  const handleCreateClicked = () => {
    console.log('should enetervsdsdfdsfdsfds');
    if (isShowingCreate) {
      console.log('should satidf');

      const array = remainingDrives;
      array.shift();
      if (array.length === 0) {
        setSuccessMessage('Call Job created');
        setIsLastCreated(true);
      }
      setIsShowingCreate(false);
      setRemainingDrives(array);
      setShowCreateSuccessModal(true);
    }
  };

  const handleNextClicked = () => {
    if (isLastCreated) {
      navigate(-1);
    } else {
      setIsShowingCreate(true);
    }
  };

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsShowingCreate(true);
    }, 500);
  }, [remainingDrives]);
  return (
    <>
      {isShowingCreate === true && (
        <TelerequirementsUpsert
          ids={ids}
          hadleCreateClicked={handleCreateClicked}
          handleNextClicked={handleNextClicked}
          remainingDrives={remainingDrives}
        />
      )}

      {showCreateSuccessModal === true ? (
        <SuccessPopUpModal
          title="Success!"
          message={successMessage}
          modalPopUp={showCreateSuccessModal}
          //isNavigate={true}
          // redirectPath={'/call-center/schedule/call-jobs'}
          onConfirm={() => handleNextClicked()}
          setModalPopUp={setShowCreateSuccessModal}
          showActionBtns={true}
        />
      ) : null}
    </>
  );
};

export default TelerecruitmentBulkCreate;
