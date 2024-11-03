import React, { useEffect, useState } from 'react';
import ShiftForm from '../components/shiftForm';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import TopBar from '../../../../../common/topbar/index';
import FormInput from '../../../../../common/form/FormInput';
import bluePrintSchema from '../bluePrintSchema';
import BluePrintButton from '../components/bluePrintDayButton';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import CancelModalPopUp from '../../../../../common/cancelModal';
import SuccessPopUpModal from '../../../../../common/successModal';
import { isEmpty } from 'lodash';
import { API } from '../../../../../../api/api-routes';
import ConfirmArchiveIcon from '../../../../../../assets/images/ConfirmArchiveIcon.png';
import {
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../../../../helpers/convertDateTimeToTimezone';

function EditDonorCenterBluePrint() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id: facilityId, blueprintId } = useParams();
  const [weekdays, setWeekdays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [redirection, setRedirection] = useState(false);
  const [procedureProducts, setProcedureProducts] = useState({});
  const [devicesOptions, setDevicesOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [minimumOef, setMinimumOef] = useState(0);
  const [maximumOef, setMaximumOef] = useState(0);
  const [shiftSlots, setShiftSlots] = useState([]);
  const [closeModal, setCloseModal] = useState(false);
  const [createLocationModal, setCreateLocationModal] = useState(false);
  const [staffSetupShiftOptions, setStaffSetupShiftOptions] = useState([]);
  const [customErrors, setCustomErrors] = useState({});
  const [disable, setDisable] = useState(false);
  const [archiveId, setArchiveId] = useState(blueprintId);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [archivePopup, setArchivePopup] = useState(false);
  const [collectionOperationId, setCollectionOperationId] = useState(null);
  const [checkRedirection, setCheckRedirection] = useState(false);
  const [bookingRules, setBookingRules] = useState({});

  const [shifts, setShifts] = useState([
    {
      startTime: '',
      endTime: '',
      projections: [
        {
          projection: 0,
          procedure: '25',
          product: '25',
          staffSetup: [],
        },
      ],
      staffSetupOptions: [],
      additionalStaffOptions: [],
      vehicleOptions: [],
      resources: [],
      devices: [],
      staffBreak: false,
      breakStartTime: '',
      breakEndTime: '',
      reduceSlot: false,
      reduction: 0,
      minOEF: 0,
      maxOEF: 0,
      minStaff: [0],
      maxStaff: [0],
    },
  ]);

  const getDevices = async () => {
    const bearerToken = localStorage.getItem('token');
    try {
      const result = await fetch(
        `${BASE_URL}/devices/drives?collection_operation=${collectionOperationId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();
      setDevicesOptions(convertToOptionsArray(data?.data, 'id'));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function convertToOptionsArray(data, type) {
    if (!data) {
      return [];
    }
    if (type == 'id') {
      return data?.map((item) => ({
        name: item.name, // Assuming 'name' is the property you want to use as the label
        id: item.id, // Assuming 'id' is the property you want to use as the value
      }));
    }
    if (type == 'name') {
      return data?.map((item) => ({
        name: item.name, // Assuming 'name' is the property you want to use as the label
        value: item.id, // Assuming 'id' is the property you want to use as the value
      }));
    }
    return data?.map((item) => ({
      label: item.name, // Assuming 'name' is the property you want to use as the label
      value: item.id, // Assuming 'id' is the property you want to use as the value
    }));
  }

  const fetchProcedureTypes = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/procedure_types?goal_type=true&fetchAll=true`
      );
      const { data } = await response.json();

      const procedureOptions = data?.map((item) => {
        return {
          label: item.name,
          value: item.id,
          procedure_duration: item.procedure_duration,
        };
      });
      const productsMap = {};
      data?.map((item) => {
        productsMap[item.id] = {
          name: item?.procedure_types_products?.[0]?.products?.name,
          id: item?.procedure_types_products?.[0]?.products?.id,
          quantity: item?.procedure_types_products?.[0]?.quantity,
          yield: item?.procedure_types_products?.[0]?.quantity,
        };
      });

      setProcedureOptions(procedureOptions);
      setProcedureProducts(productsMap);
    } catch (error) {
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const onSubmit = async (data) => {
    setDisable(true);
    if (!Object.values(weekdays)?.filter((item) => item === true).length) {
      setCustomErrors((prev) => ({
        ...prev,
        weekdays: 'At least one day is required.',
      }));
      return;
    }

    let shiftErrors = [];
    // let shifts = [];
    const ShiftsBody = shifts?.map((item, index) => {
      let projection = [];
      let shiftItemErrors = {};
      if (isEmpty(item?.startTime))
        shiftItemErrors['startTime'] = 'Start time is required.';
      if (isEmpty(item?.endTime))
        shiftItemErrors['endTime'] = 'End time is required.';

      if (item?.devices?.length == 0)
        shiftItemErrors['devices'] = 'At least one device is required.';
      let projectionErrors = [];
      item?.projections?.forEach((element) => {
        let projItemErrors = {};
        if (element.projection == 0) {
          projItemErrors['projection'] = 'Projection is required.';
        }
        if (element.staffSetup.length == 0) {
          projItemErrors['staff_setup'] =
            'At least one Staff setup is required.';
        }
        if (Object.entries(projItemErrors)?.length)
          projectionErrors.push(projItemErrors);
      });
      if (Object.entries(projectionErrors)?.length) {
        shiftItemErrors['projections'] = projectionErrors;
        shiftErrors.push(shiftItemErrors);
      }

      for (let pro of item.projections) {
        let projection_id = pro.id;
        let procedure_type_id = +pro?.procedure?.value;
        let procedure_type_qty = +pro?.procedure?.quantity;
        let product_yield = +pro?.product?.quantity;
        let staff_setups = [];
        pro?.staffSetup?.map((staff) => {
          staff_setups.push(parseInt(staff.id));
        });

        projection.push({
          id: projection_id,
          procedure_type_id,
          procedure_type_qty,
          product_yield,
          staff_setups,
        });
      }

      let count_products = 0;
      let count_procedures = 0;
      const duration =
        item?.endTime && item?.startTime
          ? moment.duration(item?.endTime.diff(item?.startTime))
          : 0;
      const hour = duration != 0 ? duration?.hours() : 0;
      let sumofProducts = 0;
      let sumofProcedures = 0;
      let sumofStaff_Setups = 0;
      item?.projections?.map((pro, indexing) => {
        sumofProducts += pro?.product?.yield;
        sumofProcedures += +pro?.procedure?.quantity;
      });
      item?.projections.map((pro, indexing) => {
        let sumStaff = 0;
        pro?.staffSetup?.map((staff) => {
          sumStaff += +staff?.qty;
        });
        sumofStaff_Setups += sumStaff;
      });
      count_products = (sumofProducts / hour / sumofStaff_Setups).toFixed(2);
      count_procedures = (sumofProcedures / hour / sumofStaff_Setups).toFixed(
        2
      );

      const devices = item?.devices?.map((item) => item.id);
      let staffArayy = [];
      item?.projections.map((ip, ind) => {
        ip?.staffSetup.map((ips) => {
          staffArayy.push(ips.id);
        });
      });
      return {
        shift_id: item.shift_id,
        projections: projection,
        staff_setup: staffArayy ?? [0],
        start_time: covertToTimeZone(item?.startTime),
        end_time: covertToTimeZone(item?.endTime),
        break_start_time:
          item?.breakStartTime && item?.breakStartTime?.isValid()
            ? covertToTimeZone(item?.breakStartTime)
            : null,
        break_end_time:
          item?.breakEndTime && item?.breakEndTime?.isValid()
            ? covertToTimeZone(item?.breakEndTime)
            : null,
        reduce_slots: item?.reduction == 0 ? true : false,
        reduction_percentage: item?.reduction,
        oef_products: +count_products,
        oef_procedures: +count_procedures,
        devices,
      };
    });

    if (shiftErrors.length) {
      console.log({ shiftErrors });
      setCustomErrors((prev) => ({
        ...prev,
        shifts: shiftErrors,
      }));
      return;
    }
    const body = {
      name: data?.name,
      weekdays: weekdays,
      oef_products: ShiftsBody[0]?.oef_products ?? 0,
      oef_procedures: ShiftsBody[0]?.oef_procedures ?? 0,
      shifts: ShiftsBody,
      donorcenter_id: facilityId,
      // devices: devices,
      slots: Object.values(shiftSlots),
    };
    console.log({ body });

    try {
      // if (!duplicateChecked) {
      // SetDuplicateChecked(true);
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/facility/donor-center/bluePrints/edit/${blueprintId}`,
        JSON.stringify(body)
      );
      let data = await response.json();
      // if (data?.status_code === 409) {
      //   // SetDuplicateRecordId(data?.data?.id);
      //   // setExistingAccountModal(true);
      // } else {
      //   // await createAPI(body);
      // }
      // } else {
      //   // await createAPI(body);
      if (data.status == 'success') {
        if (checkRedirection) {
          setRedirection(true);
          setDisable(false);
        } else {
          setCreateLocationModal(true);
          setDisable(false);
        }
      } else if (data?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        setDisable(false);
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
        setDisable(false);
      }
    } catch (error) {
      toast.error(`${data?.response}`, { autoClose: 3000 });
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors /*isDirty*/ },
    setValue,
    // getValues,
    // watch,
  } = useForm({
    resolver: yupResolver(bluePrintSchema),
    defaultValues: {},
    mode: 'onChange',
  });

  const BreadcrumbsData = [
    {
      label: 'CRM',
      class: 'disable-label',
      link: '/crm/accounts',
    },
    {
      label: 'Donors Centers',
      class: 'disable-label',
      link: `/crm/donor_center`,
    },
    {
      label: 'View Donors Centers',
      class: 'disable-label',
      link: `/crm/donor_center/${facilityId}`,
    },
    {
      label: 'Blueprints',
      class: 'active-label',
      link: `/crm/donor-centers/${facilityId}/blueprints`,
    },
    {
      label: 'Edit Blueprint',
      class: 'active-label',
      link: '#',
    },
  ];
  const fetchBookingRules = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.bookingDrives.bookingRules.getBookingRules();
    setBookingRules(data?.data || {});
  };

  useEffect(() => {
    fetchFacility();
    fetchBluePrint();
    fetchBookingRules();
  }, []);

  const fetchFacility = async () => {
    try {
      const response =
        await API.systemConfiguration.organizationalAdministrations.facilities.getSingle(
          facilityId
        );
      const { data } = response;
      setMaximumOef(data?.[0]?.industry_category?.maximum_oef);
      setCollectionOperationId(data?.[0]?.collection_operation?.id);
      setMinimumOef(data?.[0]?.industry_category?.minimum_oef);
    } catch (err) {
      toast.error(err);
    }
  };

  const fetchBluePrint = async () => {
    try {
      const response = await API.crm.donorCenter.blueprint.getOne(blueprintId);
      const {
        data: {
          data: { data, projections },
        },
      } = response;

      const { donor_center_blueprint, shifts: blueprintShifts } =
        data?.[0] || {};
      const fetchedProjections = projections?.length > 0 ? projections : [];

      const {
        name,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      } = donor_center_blueprint;

      setValue('name', name || '');
      setWeekdays({
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday,
        sunday: sunday,
      });

      let blueprintShiftData = [];
      for (const blueprintShiftItem of blueprintShifts) {
        const shiftProjections = fetchedProjections?.filter(
          (item) => +item.shift_id === +blueprintShiftItem.id
        );
        let blueprintShiftItemData = {};
        blueprintShiftItemData.shift_id = blueprintShiftItem.id;
        blueprintShiftItemData.startTime = moment(
          covertDatetoTZDate(blueprintShiftItem.start_time)
        );
        blueprintShiftItemData.endTime = moment(
          covertDatetoTZDate(blueprintShiftItem.end_time)
        );
        let projectionData = [];
        for (const shiftProjectionsStaffItem of shiftProjections) {
          const procedureLabel =
            shiftProjectionsStaffItem?.procedure_type?.name;
          const procedureDuration =
            shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString();
          const procedureQuantity =
            shiftProjectionsStaffItem?.procedure_type_qty;
          const procedureId =
            shiftProjectionsStaffItem?.procedure_type?.id?.toString();
          const procedureItem = {
            label: procedureLabel,
            procedure_duration: procedureDuration,
            quantity: procedureQuantity,
            value: procedureId,
          };
          const productItem = {
            id: shiftProjectionsStaffItem?.procedure_type?.procedure_type_products?.[0]?.product_id?.toString(),
            name: shiftProjectionsStaffItem?.procedure_type
              .procedure_type_products?.[0]?.name,
            quantity: shiftProjectionsStaffItem?.product_yield,
            yield:
              shiftProjectionsStaffItem?.procedure_type
                ?.procedure_type_products?.[0]?.quantity,
          };

          const projectionItem = {
            label: shiftProjectionsStaffItem.procedure_type.name,
            procedure_duration:
              shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString(),
            value: shiftProjectionsStaffItem?.procedure_type?.id?.toString(),
          };

          const staffSetupItem = shiftProjectionsStaffItem?.staff_setups?.map(
            (item) => {
              return {
                beds: item?.beds,
                concurrent_beds: item?.concurrent_beds,
                id: item?.id?.toString(),
                name: item?.name,
                qty: item?.qty,
                stagger: item?.stagger_slots,
              };
            }
          );
          projectionData.push({
            id: projectionItem?.value?.toString(),
            procedure: procedureItem,
            product: productItem,
            projection: projectionItem,
            staffSetup: staffSetupItem,
          });
        }
        blueprintShiftItemData.projections = projectionData;
        blueprintShiftItemData.devices =
          blueprintShiftItem.shifts_devices?.map((item) => {
            return { id: item.id.toString(), name: item.name };
          }) || [];
        blueprintShiftItemData.staffBreak =
          typeof blueprintShiftItem.break_start_time == 'string' ||
          typeof blueprintShiftItem.break_end_time == 'string'
            ? true
            : false;
        blueprintShiftItemData.breakStartTime = moment(
          covertDatetoTZDate(blueprintShiftItem.break_start_time)
        );

        blueprintShiftItemData.breakEndTime = moment(
          covertDatetoTZDate(blueprintShiftItem.break_end_time)
        );
        blueprintShiftItemData.reduceSlot = blueprintShiftItem.reduce_slots;
        blueprintShiftItemData.reduction =
          blueprintShiftItem.reduction_percentage;

        blueprintShiftData.push(blueprintShiftItemData);
      }
      setShifts(blueprintShiftData);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDayClick = (day) => {
    setWeekdays((prevWeekdays) => ({
      ...prevWeekdays,
      [day]: !prevWeekdays[day],
    }));
    setCustomErrors((prev) => ({
      ...prev,
      weekdays: '',
    }));
  };

  useEffect(() => {
    fetchProcedureTypes();
    setFormErrors({}); // to remove
  }, []);

  useEffect(() => {
    if (collectionOperationId) getDevices();
  }, [collectionOperationId]);

  const handleArchive = async () => {
    try {
      const response = await API.crm.donorCenter.blueprint.archive(archiveId);
      const { data } = response;
      const { status_code: status } = data;
      console.log({ status });
      if (status === 204) {
        setArchiveSuccess(true);
        setArchivePopup(false);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  return (
    <div className="mainContent">
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={`/crm/donor-centers/${facilityId}/blueprints`}
      />
      <SuccessPopUpModal
        title="Success!"
        message="Blueprint archived."
        modalPopUp={archiveSuccess}
        setModalPopUp={setArchiveSuccess}
        isNavigate={true}
        redirectPath={-1}
        showActionBtns={true}
        onConfirm={() => {
          setArchiveSuccess(false);
        }}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Blueprint created.'}
        modalPopUp={createLocationModal}
        // isNavigate={true}
        setModalPopUp={setCreateLocationModal}
        showActionBtns={true}
        // redirectPath={-1}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Blueprint created.'}
        modalPopUp={redirection}
        isNavigate={true}
        setModalPopUp={setRedirection}
        showActionBtns={true}
        redirectPath={-1}
      />
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Blueprints'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />
      <div className="mainContentInner form-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="formGroup ">
            <h5>Edit Blueprint</h5>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <FormInput
                  name={field.name}
                  classes={{ root: '' }}
                  displayName="Blueprint Name"
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                  value={field?.value}
                  required={false}
                  error={errors?.name?.message}
                />
              )}
            />
            <div className="form-field">
              <p
                className="w-100 mb-0"
                style={{ fontSize: '14px', color: '#858688' }}
              >
                Select Weekdays*
              </p>
              <div className="form-field w-100">
                {[
                  { label: 'M', name: 'monday' },
                  { label: 'T', name: 'tuesday' },
                  { label: 'W', name: 'wednesday' },
                  { label: 'T', name: 'thursday' },
                  { label: 'F', name: 'friday' },
                  { label: 'S', name: 'saturday' },
                  { label: 'S', name: 'sunday' },
                ].map((weekDay) => (
                  <BluePrintButton
                    onClick={handleDayClick}
                    label={weekDay.label}
                    name={weekDay.name}
                    key={weekDay.name}
                    weekdays={weekdays}
                  />
                ))}
                <div className="error">
                  <p>{customErrors?.weekdays}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="">
            {shifts?.map((shift, index) => {
              return (
                <ShiftForm
                  key={index + 1}
                  shift={shift}
                  index={index}
                  shiftIndexesLength={shifts?.length || 0}
                  errors={customErrors?.shifts?.[index]}
                  control={control}
                  setShifts={setShifts}
                  shifts={shifts}
                  formErrors={formErrors}
                  shiftDevicesOptions={devicesOptions}
                  procedureProducts={procedureProducts}
                  procedureTypesList={procedureOptions}
                  maximumOef={maximumOef}
                  minimumOef={minimumOef}
                  shiftSlots={shiftSlots}
                  setShiftSlots={setShiftSlots}
                  staffSetupShiftOptions={staffSetupShiftOptions}
                  setStaffSetupShiftOptions={setStaffSetupShiftOptions}
                  allowAppointmentAtShiftEndTime={
                    bookingRules?.maximum_draw_hours_allow_appt || false
                  }
                />
              );
            })}
          </div>
          <div className={`form-footer`}>
            <div className="d-flex">
              <button
                className="btn btn-secondary border-0"
                onClick={(e) => {
                  e.preventDefault(); // Prevents the default form submission
                  setCloseModal(true);
                }}
                disabled={disable}
                type="button"
              >
                Cancel
              </button>
              {facilityId ? (
                <>
                  <div
                    onClick={() => {
                      setArchiveId(blueprintId);
                      setArchivePopup(true);
                    }}
                    className="archived"
                  >
                    <span>Archive</span>
                  </div>
                  <section
                    className={`popup full-section ${
                      archivePopup ? 'active' : ''
                    }`}
                  >
                    <div className="popup-inner">
                      <div className="icon">
                        <img src={ConfirmArchiveIcon} alt="CancelIcon" />
                      </div>
                      <div className="content">
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to archive?</p>
                        <div className="buttons">
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setArchivePopup(false);
                            }}
                          >
                            No
                          </button>
                          <button
                            className="btn btn-primary"
                            onClick={(e) => {
                              e.preventDefault();
                              handleArchive();
                            }}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                  <button
                    className="btn btn-secondary"
                    name="Save & Close"
                    onClick={(e) => {
                      setCheckRedirection(true);
                      handleSubmit(e, true);
                    }}
                    disabled={disable}
                  >
                    Save & Close
                  </button>
                </>
              ) : null}

              <button
                type="submit"
                name={'Save Changes'}
                className={` ${`btn btn-primary`}`}
                // onClick={setDisable(true)}
                disabled={disable}
              >
                {facilityId ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDonorCenterBluePrint;
