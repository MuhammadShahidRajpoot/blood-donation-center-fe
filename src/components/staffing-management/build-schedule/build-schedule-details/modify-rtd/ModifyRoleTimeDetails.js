import IndividualModification from './IndividualModification';
import React, { useState, useEffect } from 'react';
import Styles from './index.module.scss';
import { toast } from 'react-toastify';
import ByRoleModification from './ByRoleModification';
import ApplyToAllModification from './ApplyToAllModification';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../../routes/path';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import { useLocation, useNavigate } from 'react-router-dom';
import ToolTip from '../../../../common/tooltip';
import FormFooter from '../../../../common/FormFooter';
import SuccessPopUpModal from '../../../../common/successModal';
import ConfirmModal from '../../../../common/confirmModal';
import { BuildScheduleDetailsBreadCrumbData } from '../../BuildScheduleBreadCrumbData';
import TopBar from '../../../../common/topbar/index';
import {
  recalculateClockInForObject,
  recalculateClockOutForObject,
  recalculateTotalHours,
  timeToMinutes,
} from './helper-functions';

const ModifyRoleTimeDetails = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const schedule_id = searchParams.get('schedule_id');
  const shift_id = searchParams.get('shift_id');
  const schedule_status = searchParams.get('schedule_status');
  const isCreated = searchParams.get('isCreated');
  const collection_operation_id = searchParams.get('collection_operation_id');

  const queryParams = {
    operation_id: operation_id,
    operation_type: operation_type,
    schedule_id: schedule_id,
    schedule_status: schedule_status,
    isCreated: isCreated,
    collection_operation_id: collection_operation_id,
    shift_id: shift_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();

  const [isLoading, setIsLoading] = useState(true);
  const [modificationType, setModificationType] = useState('individual');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  const [initialData, setInitialData] = useState();
  const [byRoleInitialData, setByRoleInitialData] = useState();
  const [individualData, setIndividualData] = useState();
  const [byRoleData, setByRoleData] = useState();
  const [applyToAllData, setApplyToAllData] = useState();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [fieldsChanged, setFieldsChanged] = useState();
  const [eventName, setEventName] = useState();
  const [refresh, setRefresh] = useState(false);
  const [noData, setNoData] = useState(false);

  const onConfirmNavigate =
    STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS.concat('?').concat(appendToLink);

  useEffect(() => {
    fetchAllData();
    setApplyToAllData({});
  }, [refresh]);

  useEffect(() => {
    areFieldsChanged();
  }, [fieldsChanged]);

  const handleModificationTypeChange = (event) => {
    setModificationType(event.target.value);
  };

  const fetchAllData = async () => {
    try {
      let url = `${BASE_URL}/staffing-management/schedules/details/rtd/${operation_id}/${operation_type}/shifts/${shift_id}/modify-rtd/${schedule_status}`;
      const result = await makeAuthorizedApiRequest('GET', url);
      let { data } = await result.json();
      setIsLoading(false);
      if (!data || data?.individual_values?.length === 0) {
        setNoData(true);
        return;
      }
      if (data.individual_values.length > 0) {
        setInitialData(data.individual_values);
        setIndividualData(data.individual_values);
        const roles = structureDataForByRole(data.by_role_values);
        structureFieldsChanged(roles);
      }
    } catch (error) {
      toast.error(`Failed to fetch data ${error}`, { autoClose: 3000 });
    }
  };

  const structureFieldsChanged = (roles) => {
    // create an array of objects, every object for one role
    const fieldsChangedInit = roles.map((role) => ({
      role_name: role,
      shift_start_time: { value: false, modified_from: 0 },
      shift_end_time: { value: false, modified_from: 0 },
      lead_time: { value: false, modified_from: 0 },
      travel_to_time: { value: false, modified_from: 0 },
      setup_time: { value: false, modified_from: 0 },
      breakdown_time: { value: false, modified_from: 0 },
      travel_from_time: { value: false, modified_from: 0 },
      wrapup_time: { value: false, modified_from: 0 },
    }));
    setFieldsChanged(fieldsChangedInit);
  };

  const structureDataForByRole = (data) => {
    /* By Role screen: display one object with corresponding fields, for every role.
    Objects will be in an array, one object for every role.
    */
    const roles = [...new Set(data?.map((obj) => obj.role_name))];
    setRolesList(roles);
    const formattedArray = data.map((roleValuesObject) => {
      const clockIn = recalculateClockInForObject(roleValuesObject);
      const clockOut = recalculateClockOutForObject(roleValuesObject);
      return {
        ...roleValuesObject,
        clock_in_time: clockIn,
        clock_out_time: clockOut,
        total_hours: recalculateTotalHours(clockIn, clockOut),
      };
    });
    setByRoleData(formattedArray);
    setByRoleInitialData(formattedArray);
    return roles;
  };

  const areFieldsChanged = () => {
    return fieldsChanged?.some((obj) => {
      for (const key of Object.keys(obj)) {
        if (obj[key].value && key !== 'role_name') {
          return true;
        }
      }
      return false;
    });
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    // check if there is updated data from any of the modification types
    if (!areFieldsChanged()) {
      return;
    }
    /* individualData array is being updated automatically on every change in any of the pages.
    It containts all individual staff with the respective values.
     */
    for (let obj of individualData) {
      if (!obj) continue;
      if (
        obj.lead_time > 1440 ||
        obj.travel_to_time > 1440 ||
        obj.setup_time > 1440 ||
        obj.breakdown_time > 1440 ||
        obj.travel_from_time > 1440 ||
        obj.wrapup_time > 1440
      ) {
        toast.error('Maximum allowed value for minutes is 1440!', {
          autoClose: 3000,
        });
        return;
      }
      if (
        obj.lead_time < 0 ||
        obj.travel_to_time < 0 ||
        obj.setup_time < 0 ||
        obj.breakdown_time < 0 ||
        obj.travel_from_time < 0 ||
        obj.wrapup_time < 0
      ) {
        toast.error('No negative values allowed!', {
          autoClose: 3000,
        });
        return;
      }
      if (
        isNaN(obj.total_hours) ||
        obj.total_hours < 0 ||
        obj.clock_in_time?.includes('-') ||
        obj.clock_out_time?.includes('-')
      ) {
        toast.error('Invalid time values!', {
          autoClose: 3000,
        });
        return;
      }
      if (
        timeToMinutes(obj.shift_start_time) > timeToMinutes(obj.shift_end_time)
      ) {
        toast.error('Shift start time cannot be bigger than shift end time!', {
          autoClose: 3000,
        });
        return;
      }
      if (
        timeToMinutes(obj.shift_start_time) == timeToMinutes(obj.shift_end_time)
      ) {
        toast.error('Shift start time cannot be equal to shift end time!', {
          autoClose: 3000,
        });
        return;
      }
    }
    let url = `${BASE_URL}/staffing-management/schedules/operations/shifts/modify-rtd`;
    try {
      const body = individualData;
      const response = makeAuthorizedApiRequest(
        'PATCH',
        url,
        JSON.stringify(body)
      );
      let res = await response;
      if (res?.status === 200) {
        setShowSuccessDialog(true);
        setEventName(event.target.innerText);
        if (event.target.innerText === 'Save Changes') {
          setRefresh(true);
        }
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
    if (confirmed) {
      navigate(onConfirmNavigate);
    }
  };

  const onClickCancel = () => {
    if (areFieldsChanged()) {
      setShowConfirmationDialog(true);
    } else {
      navigate(onConfirmNavigate);
    }
  };
  return (
    <div>
      <TopBar
        BreadCrumbsData={[
          ...BuildScheduleDetailsBreadCrumbData,
          {
            label: 'Create Schedule',
            class: 'disable-label',
            link: STAFFING_MANAGEMENT_BUILD_SCHEDULE.CREATE,
          },
          {
            label: 'Details',
            class: 'disable-label',
            link: onConfirmNavigate,
          },
          {
            label: 'RTD',
            class: 'active-label',
            link: location.pathname
              .concat('?')
              .concat(appendToLink)
              .concat(`&shift_id=${shift_id}`),
          },
        ]}
        BreadCrumbsTitle={'Update Role Time Details'}
      />
      <div className={Styles.selectModType}>
        <h5>
          Select Modification Type{' '}
          <ToolTip
            text={
              'This will adjust role time details for the selected records.'
            }
            isOperationListTooltip={true}
          />
        </h5>
        <input
          type="radio"
          value="individual"
          checked={modificationType === 'individual'}
          onChange={handleModificationTypeChange}
        />
        <label className={Styles.radioButtonLabel} htmlFor="individual">
          Individual
        </label>
        <input
          type="radio"
          value="byRole"
          checked={modificationType === 'byRole'}
          onChange={handleModificationTypeChange}
        />
        <label className={Styles.radioButtonLabel} htmlFor="byRole">
          By Role
        </label>
        <input
          type="radio"
          value="applyToAll"
          checked={modificationType === 'applyToAll'}
          onChange={handleModificationTypeChange}
        />
        <label className={Styles.radioButtonLabel} htmlFor="applyToAll">
          Apply To All
        </label>
      </div>
      {isLoading && <h6 className={Styles.dataLoading}> Data Loading ... </h6>}
      {!isLoading && noData && (
        <h6 className={Styles.dataLoading}> No Data Found. </h6>
      )}
      {modificationType === 'individual' && !isLoading && !noData && (
        <IndividualModification
          setIndividualData={setIndividualData}
          individualData={individualData}
          setFieldsChanged={setFieldsChanged}
          fieldsChanged={fieldsChanged}
          initialData={initialData}
        />
      )}
      {modificationType === 'byRole' && !isLoading && !noData && (
        <ByRoleModification
          rolesList={rolesList}
          setByRoleData={setByRoleData}
          byRoleData={byRoleData}
          setFieldsChanged={setFieldsChanged}
          fieldsChanged={fieldsChanged}
          initialData={byRoleInitialData}
          applyToAllData={applyToAllData}
          setIndividualData={setIndividualData}
        />
      )}
      {modificationType === 'applyToAll' && !isLoading && !noData && (
        <ApplyToAllModification
          setApplyToAllData={setApplyToAllData}
          applyToAllData={applyToAllData}
          setFieldsChanged={setFieldsChanged}
          fieldsChanged={fieldsChanged}
          initialData={initialData}
          setIndividualData={setIndividualData}
        />
      )}

      <FormFooter
        enableArchive={false}
        enableCancel={true}
        onClickCancel={onClickCancel}
        enableCreate={false}
        enableSaveAndClose={true}
        saveAndCloseType="button"
        onClickSaveAndClose={handleSubmit}
        enableSaveChanges={true}
        saveChangesType="button"
        onClickSaveChanges={handleSubmit}
        disabled={!areFieldsChanged()}
      />

      <ConfirmModal
        showConfirmation={showConfirmationDialog}
        onCancel={() => handleConfirmationResult(false)}
        onConfirm={() => handleConfirmationResult(true)}
        heading={'Confirmation'}
        description={'Unsaved changes will be lost. Do you want to continue?'}
      />

      <SuccessPopUpModal
        title="Success!"
        message={'Changes saved successfully.'}
        modalPopUp={showSuccessDialog}
        isNavigate={eventName === 'Save Changes' ? false : true}
        setModalPopUp={setShowSuccessDialog}
        showActionBtns={true}
        redirectPath={-1}
      />
    </div>
  );
};

export default ModifyRoleTimeDetails;
