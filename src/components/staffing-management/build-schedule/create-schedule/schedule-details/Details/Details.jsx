/* eslint-disable */
import React, { useEffect, useState } from 'react';
import './details.scss';
import ShiftInformationSection from './ShiftInformation';
import '../../../../../../styles/Global/Global.scss';
import '../../../../../../styles/Global/Variable.scss';
import ResourceRequestedSection from './ResourceRequested';

function Details({
  shifts,
  currentShiftId,
  setCurrentShiftId,
  operationName,
  operationDate,
  filterFormData,
  setFilterFormData,
  categories,
}) {
  const [shiftStatus, setShiftStatus] = useState(null);
  const [staffAssignUnassignFlag, setStaffAssignUnassignFlag] = useState(null);

  const checkShiftStatus = (shiftStatus) => {
    switch (shiftStatus) {
      case 'Incomplete':
        return 'incomplete-shift';
      case 'Complete':
        return 'complete-shift';
      case 'Not Started':
        return 'not-started-shift';
      default:
        return;
    }
  };
  return (
    <div className="row row-gap-4 detailsMain detailsMainContentContainer">
      <div className="col-12">
        <div className="shift-status-container">
          <p className="shift-status-bar-title">Shifts</p>
          {shifts?.map((shift, index) => (
            <div
              key={index}
              onClick={() => setCurrentShiftId(shift.id)}
              className={`${
                shift.id === currentShiftId
                  ? `${checkShiftStatus(shift.status)} current-shift`
                  : checkShiftStatus(shift.status)
              }`}
            >
              <p className="mb-0 shift-status-content pointer">
                <span className="shift-status-circle">&nbsp;</span>
                {index + 1} :{' '}
                {shiftStatus !== null &&
                shiftStatus.shift_id == shift.id &&
                shift.id == currentShiftId
                  ? shiftStatus.shift_status
                  : shift.status}
              </p>
            </div>
          ))}
        </div>
        <ShiftInformationSection
          shift_id={currentShiftId}
          operationName={operationName}
          operationDate={operationDate}
          filterFormData={filterFormData}
          setFilterFormData={setFilterFormData}
          categories={categories}
          staffAssignUnassignFlag={staffAssignUnassignFlag}
        />
      </div>

      <div className="col-12">
        <ResourceRequestedSection
          shift_id={currentShiftId}
          operation_date={operationDate}
          setShiftStatus={setShiftStatus}
          setStaffAssignUnassignFlag={setStaffAssignUnassignFlag}
        />
      </div>
    </div>
  );
}

export default Details;
