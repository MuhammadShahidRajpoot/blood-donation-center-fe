import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import FormInput from '../../../common/form/FormInput';
import FormText from '../../../common/form/FormText';
import { useParams } from 'react-router-dom';
import 'rc-time-picker/assets/index.css';
import * as yup from 'yup';

import {
  CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH,
  CRM_NON_COLLECTION_PROFILES_PATH,
} from '../../../../routes/path';

import NCPShiftForm from './NCPShiftForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import CancelModalPopUp from '../../../common/cancelModal';
import SuccessPopUpModal from '../../../common/successModal';
import { API } from '../../../../api/api-routes';
import { toast } from 'react-toastify';
import moment from 'moment';
import {
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../../helpers/convertDateTimeToTimezone';

const initialShift = {
  generatedId: Math.random().toString(36).substring(2),
  startTime: null,
  endTime: '',
  roles: [{ role: null, qty: null }],
  staffBreak: false,
  breakStartTime: '',
  breakEndTime: '',
  vehicles_ids: [],
  device_ids: [],
  shiftBreakStartTime: null,
  shiftBreakEndTime: null,
  showBreakTime: null,
};
const NonCollectionProfilesEditBlueprints = () => {
  const [shifts, setShifts] = useState([]);
  const [closeModal, setCloseModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isNavigate, setIsNavigate] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [showModalText, setShowModalText] = useState(null);
  const [showSuccessMessageArchived, setShowSuccessMessageArchived] =
    useState(false);
  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  const { append, remove } = useFieldArray({
    control,
    name: 'shifts',
  });

  const { nonCollectionProfileId, id } = useParams();

  const BreadcrumbsData = [
    { label: 'CRM', class: 'disable-label', link: '/crm/accounts' },
    {
      label: 'Non-Collection Profiles',
      class: 'active-label',
      link: CRM_NON_COLLECTION_PROFILES_PATH.LIST,
    },
    {
      label: 'View Non-Collection Profiles',
      class: 'active-label',
      link: CRM_NON_COLLECTION_PROFILES_PATH.VIEW.replace(
        ':id',
        nonCollectionProfileId
      ),
    },
    {
      label: 'Blueprints',
      class: 'active-label',
      link: CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH.LIST.replace(
        ':id',
        nonCollectionProfileId
      ),
    },
    {
      label: 'Edit Blueprint',
      class: 'active-label',
      link: CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH.EDIT.replace(
        ':nonCollectionProfileId',
        nonCollectionProfileId
      ).replace(':id', id),
    },
  ];

  useEffect(() => {
    getData();
  }, [id, nonCollectionProfileId]);

  const getData = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.nonCollectionProfiles.getViewAboutBlueprint(
        id,
        token
      );

      if (data) {
        setValue('blueprint_name', data?.data?.blueprint_name);
        setValue('location', data?.data?.location);
        setValue('additional_information', data?.data?.additional_info);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    getData();
    getShifts();
  }, [id, nonCollectionProfileId]);

  const getShifts = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } =
        await API.nonCollectionProfiles.getViewShiftDetailsBlueprint(id, token);

      if (data) {
        const modified = data?.data?.map((item) => {
          const showBreakTime =
            item?.break_start_time !== null && item?.break_end_time !== null;
          const startTime = moment(covertDatetoTZDate(item?.start_time));
          const endTime = moment(covertDatetoTZDate(item?.end_time));
          const shiftBreakStartTime = moment(
            covertDatetoTZDate(item?.break_start_time)
          );
          const shiftBreakEndTime = moment(
            covertDatetoTZDate(item?.break_end_time)
          );
          return {
            id: item?.id,
            startTime: startTime,
            endTime: endTime,
            roles: item?.shiftRoles?.map((e) => {
              return {
                role: { label: e?.role?.name, value: e?.role?.id },
                qty: e?.quantity,
              };
            }),
            vehicles_ids: item?.shiftVehicles?.map((e) => {
              return {
                name: e?.vehicle?.name,
                id: e?.vehicle?.id,
              };
            }),
            device_ids: item?.shiftDevices.map((e) => {
              return {
                name: e?.device?.name,
                id: e?.device?.id,
              };
            }),
            showBreakTime: showBreakTime,
            shiftBreakStartTime:
              item?.break_start_time !== null ? shiftBreakStartTime : '',
            shiftBreakEndTime:
              item?.break_end_time !== null ? shiftBreakEndTime : '',
          };
        });
        setShifts(modified);
        setValue('shifts', modified);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };

  const onSubmit = async (data, event) => {
    const shiftScheduleUpdate = data?.shifts.map((item) => {
      return {
        start_time: covertToTimeZone(moment(item?.startTime)),
        end_time: covertToTimeZone(moment(item?.endTime)),
        break_start_time: item?.showBreakTime
          ? covertToTimeZone(moment(item?.breakStartTime))
          : null,
        break_end_time: item?.showBreakTime
          ? covertToTimeZone(moment(item?.breakEndTime))
          : null,
        vehicles_ids: item?.vehicles_ids?.map((item) => parseInt(item.id, 10)),
        devices_ids: item?.device_ids?.map((item) => parseInt(item.id, 10)),
        shift_roles: item?.roles?.map((item) => ({
          role_id: parseInt(item.role.value, 10),
          qty: parseInt(item.qty, 10),
        })),
      };
    });
    let body = {
      blueprint_name: data?.blueprint_name,
      location: data?.location,
      additional_info: data?.additional_information,
      is_active: true,
      shift_schedule: shiftScheduleUpdate,
    };
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.nonCollectionProfiles.putblueprint(
        id,
        token,
        body
      );

      if (data?.status === 'success') {
        if (event?.target?.name === 'Save & Close') {
          // setIsArchived(false);
          setIsNavigate(true);
          setShowSuccessMessage(true);
        } else {
          // setIsArchived(false);
          setIsNavigate(false);
          setShowSuccessMessage(true);
        }
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };
  const handleRemoveShift = (index) => {
    if (shifts.length > 1) {
      const updatedShifts = [...shifts];
      updatedShifts.splice(index, 1);
      setShifts(updatedShifts);
    }
  };

  const handleArchive = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.nonCollectionProfiles.patchArchive(id, token);
      if (data?.status === 'success') {
        setModalPopUp(false);
        setShowSuccessMessageArchived(true);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="mainContent ">
      <SuccessPopUpModal
        title="Confirmation"
        message={showModalText}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Blueprint is archived.'}
        modalPopUp={showSuccessMessageArchived}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessageArchived}
        isNavigate={true}
        redirectPath={`/crm/non-collection-profiles/${nonCollectionProfileId}/blueprints`}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Blueprint updated.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
        isNavigate={isNavigate}
        redirectPath={-1}
      />
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Blueprints'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner form-container">
        <form>
          {shifts?.length ? (
            <div className="formGroup">
              <h5>Edit Blueprint</h5>

              <Controller
                name={`blueprint_name`}
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <FormInput
                    name="blueprint_name"
                    displayName="Blueprint Name"
                    value={field.value}
                    onChange={(e) => field.onChange(e)}
                    required
                    error={errors?.blueprint_name?.message}
                    handleBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                name={`location`}
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <FormInput
                    name="location"
                    displayName="Location"
                    value={field.value}
                    onChange={(e) => field.onChange(e)}
                    required={false}
                    error={errors?.location?.message}
                    handleBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                name={`additional_information`}
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <FormText
                    name="additional_information"
                    displayName="Additional Information"
                    classes={{ root: 'w-100' }}
                    value={field.value}
                    handleBlur={field.onBlur}
                    onChange={(e) => field.onChange(e)}
                    error={errors?.additional_information?.message}
                  />
                )}
              />
            </div>
          ) : (
            ''
          )}

          {shifts?.map((shift, index) => {
            return (
              <NCPShiftForm
                control={control}
                key={shift?.generatedId ? shift?.generatedId : shift?.id}
                shift={shift}
                removeShift={() => remove(index)}
                setShift={(updatedShift) => {
                  const updatedShifts = [...shifts];
                  updatedShifts[index] = updatedShift;
                  setShifts(updatedShifts);
                }}
                errors={errors}
                initialShift={initialShift}
                handleRemoveShift={handleRemoveShift}
                append={append}
                setShifts={setShifts}
                currentNumber={index}
                shifts={shifts}
                getValues={getValues}
                setValue={setValue}
              />
            );
          })}
        </form>
      </div>
      <div className={`form-footer`}>
        <CancelModalPopUp
          title="Confirmation"
          message="Unsaved changes will be lost, do you wish to proceed?"
          modalPopUp={closeModal}
          isNavigate={true}
          setModalPopUp={setCloseModal}
          redirectPath={-1}
        />
        <span
          className="archived"
          onClick={() => {
            setShowModalText('Are you sure you want to archive?');
            setModalPopUp(true);
          }}
        >
          Archive
        </span>
        <div>
          <span
            className={`btn simple-text`}
            onClick={() => {
              setCloseModal(true);
            }}
          >
            Cancel
          </span>
          <button
            name="Save & Close"
            className={`btn btn-md btn-secondary`}
            onClick={handleSubmit(onSubmit)}
          >
            Save & Close
          </button>
          <button
            name="Save Changes"
            type="button"
            className={`btn btn-md btn-primary`}
            onClick={handleSubmit(onSubmit)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const schema = yup.object().shape({
  blueprint_name: yup.string().required('Blueprint name is required.'),
  location: yup
    .string()
    .nullable()
    .test(
      'len',
      'Min characters allowed for location are 2.',
      (val) => val.length !== 1
    )
    .max(250, 'Max characters allowed for location are 250.'),
  shifts: yup.array().of(
    yup.object().shape({
      startTime: yup.string().required('Start Time is required.'),
      endTime: yup
        .string()
        .when('startTime', (startTime, schema) => {
          return schema.test(
            'is-greater',
            'End Time must be greater than Start Time',
            function (endTime) {
              if (!startTime || !endTime) {
                return true;
              }
              const startTimeDate = new Date(`${startTime}`);
              const endTimeDate = new Date(`${endTime}`);
              const momentStartTime = moment(startTimeDate).format('HH:mm');
              const momentEndTime = moment(endTimeDate).format('HH:mm');
              const [hour1, minute1] = momentStartTime.split(':').map(Number);
              const [hour2, minute2] = momentEndTime.split(':').map(Number);
              if (hour1 < hour2) {
                return true;
              } else if (hour1 === hour2 && minute1 < minute2) {
                return true;
              }

              return false;
            }
          );
        })
        .required('End Time is required.'),
      roles: yup.array().of(
        yup.object().shape({
          role: yup
            .object({
              label: yup.string().required(),
              value: yup.string().required(),
            })
            .required('Role is required.'),
          qty: yup
            .number()
            .typeError('Quantity must be a number.')
            .required('Quantity is required.')
            .min(1, 'Quantity must be at least 1.'),
        })
      ),
      vehicles_ids: yup.array().optional().nullable(),
      // device_ids: yup
      //   .array()
      //   .required('Device is required.')
      //   .min(1, 'Device is required.'),
      staffBreak: yup.boolean(),
      breakStartTime: yup.string().when('showBreakTime', {
        is: true,
        then: () => yup.string().required('Start Time is required.'),
        otherwise: () => yup.string().nullable(),
      }),
      breakEndTime: yup.string().when('showBreakTime', {
        is: true,
        then: () =>
          yup
            .string()
            .when('breakStartTime', (breakStartTime, schema) => {
              return schema.test(
                'is-greater',
                'End Time must be greater than Start Time',
                function (breakEndTime) {
                  if (!breakStartTime || !breakEndTime) {
                    return true; // Let other validators handle empty values
                  }
                  const startTimeDate = new Date(`${breakStartTime}`);
                  const endTimeDate = new Date(`${breakEndTime}`);
                  const momentStartTime = moment(startTimeDate).format('HH:mm');
                  const momentEndTime = moment(endTimeDate).format('HH:mm');
                  const [hour1, minute1] = momentStartTime
                    .split(':')
                    .map(Number);
                  const [hour2, minute2] = momentEndTime.split(':').map(Number);
                  if (hour1 < hour2) {
                    return true;
                  } else if (hour1 === hour2 && minute1 < minute2) {
                    return true;
                  }

                  return false;
                }
              );
            })
            .required('End Time is required.'),
        otherwise: () => yup.string().nullable(),
      }),
    })
  ),
});
export default NonCollectionProfilesEditBlueprints;
