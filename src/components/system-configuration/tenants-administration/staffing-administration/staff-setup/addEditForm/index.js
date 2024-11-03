import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import TopBar from '../../../../../common/topbar/index';
import SuccessPopUpModal from '../../../../../common/successModal';
import {
  staffError,
  staffSetupFieldError,
  BreadcrumbsData,
  BreadcrumbsDataEditStaffSetup,
  label,
} from '../data';
import StaffSetupForm from './StaffSetupForm';
import StafConfigForm from './StafConfigForm';
import { STAFF_SETUP } from '../../../../../../routes/path';
import Loader from '../../../../../common/Loader/Loader';
import ConfirmModal from '../../../../../common/confirmModal';
import CancelIconImage from '../../../../../../assets/images/ConfirmCancelIcon.png';
import { FunctionTypeEnum } from '../../../../../common/Enums';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { scrollToErrorField } from '../../../../../../helpers/scrollToError';
import { compareAndSetCancel } from '../../../../../../helpers/compareAndSetCancel';

const initialConfigState = {
  row_id: 1,
  role: null,
  qty: null,
  leadTime: null,
  setupTime: null,
  breakdownTime: null,
  wrapupTime: null,
  id: null,
};

const initialStaffSetupState = {
  operation: null,
  name: null,
  shortName: null,
  procedure: null,
  location: null,
  beds: null,
  concurrentBeds: 1,
  staggerSlots: 0,
};

const AddEditForm = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const { id } = useParams();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModalWitoutNavigate, setShowModalWitoutNavigate] = useState(false);
  const [showCancelConfirmationDialog, setShowCancelConfirmationDialog] =
    useState(false);
  const [staffSetup, setStaffSetup] = useState(initialStaffSetupState);
  const [check, setCheck] = useState(true);
  const [errors, setErrors] = useState({});
  const [procedureOptions, setProcedureOptions] = useState([]);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdby, setCreatedBy] = useState();
  const [modalPopUp, setModalPopUp] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [archiveStatus, setArchivedStatus] = useState(false);
  const [compareData, setCompareData] = useState({});
  const [newFormData, setNewFormData] = useState({});
  const [showCancelBtn, setShowCancelBtn] = useState(true);

  const handleErrorStateStaffSetup = (data, name) => {
    if (Object?.keys(errors)?.length > 0) {
      if (Object?.prototype?.hasOwnProperty?.call(errors, name))
        delete errors[name];
    }
    const validate = staffSetupFieldError(data);
    setErrors({ ...errors, ...validate });
  };
  /* staff config */
  const [staffConfig, setStaffConfig] = useState([initialConfigState]);
  const [staffConfigErrors, setStaffConfigErrorS] = useState([]);
  const handleAppend = (e, idToAppend) => {
    if (e?.keyCode !== undefined && e?.keyCode !== 13) {
      //allowing only append on Enter and Click
      return;
    }
    const obj = {
      ...staffConfig[idToAppend - 1],
      row_id: staffConfig.length + 1,
    };

    setStaffConfig([...staffConfig, obj]);
  };
  const handleRemove = (e, idToRemove) => {
    if (e?.keyCode !== undefined && e?.keyCode !== 13) {
      //allowing only append on Enter and Click
      return;
    }
    if (staffConfig?.length === 1) {
      toast.error('At least one configuration is required.', {
        autoClose: 3000,
      });
      return;
    } else {
      let temp = staffConfig?.filter((item) => item?.row_id !== idToRemove);
      let tempError = staffConfigErrors?.filter(
        (item) => item?.row_id !== idToRemove
      );
      setStaffConfig(temp);
      setStaffConfigErrorS(tempError);
    }
  };
  const handleErrorStateConfigSetup = (name, index) => {
    if (staffConfigErrors?.length > 0) {
      let temp = staffConfigErrors[index];
      if (Object?.keys(temp)?.length > 0) {
        if (Object?.prototype?.hasOwnProperty?.call(temp, name))
          delete temp[name];
      }
    }
  };
  /* procedure options */
  const getProcedureData = async () => {
    const result = await fetch(
      `${BASE_URL}/procedure_types?status=true&fetchAll=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        method: 'GET',
      }
    );
    const data = await result.json();
    let options = data?.data?.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
      };
    });
    setProcedureOptions(options);
  };
  /* roles options */
  const getRoles = async () => {
    const result = await fetch(
      `${BASE_URL}/contact-roles?status=true&fetchAll=true&&function_id=${FunctionTypeEnum.STAFF}&staffable=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        method: 'GET',
      }
    );
    const data = await result.json();
    let options = data?.data?.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
      };
    });
    setRolesOptions(options);
  };
  const handleCancel = (e) => {
    e.preventDefault();
    if (
      staffSetup?.name ||
      staffSetup?.shortName ||
      staffSetup?.beds ||
      staffSetup?.concurrentBeds ||
      staffSetup?.staggerSlots ||
      staffSetup?.procedure ||
      staffSetup?.operation ||
      staffSetup?.location
    ) {
      setShowCancelConfirmationDialog(true);
    } else navigate(STAFF_SETUP.LIST);
  };
  /* post data */
  const postData = async (e, withoutNavigation) => {
    e.preventDefault();
    const staffData = {
      name: staffSetup?.name,
      short_name: staffSetup?.shortName,
      beds: parseInt(staffSetup?.beds),
      concurrent_beds: parseInt(staffSetup?.concurrentBeds),
      stagger_slots: parseInt(staffSetup?.staggerSlots),
      procedure_type_id: staffSetup?.procedure?.value,
      opeartion_type_id: staffSetup?.operation?.value,
    };
    if (staffSetup?.operation?.value === 'DRIVE') {
      staffData['location_type_id'] = staffSetup?.location?.value;
    }
    let staffConfigData = [];
    if (id) {
      staffConfigData = staffConfig?.map((item) => {
        return {
          qty: parseInt(item?.qty),
          lead_time: parseInt(item?.leadTime),
          setup_time: parseInt(item?.setupTime),
          breakdown_time: parseInt(item?.breakdownTime),
          wrapup_time: parseInt(item?.wrapupTime),
          role_id: parseInt(item?.role?.value),
          id: parseInt(item?.id),
        };
      });
    } else {
      staffConfigData = staffConfig?.map((item) => {
        return {
          qty: parseInt(item?.qty),
          lead_time: parseInt(item?.leadTime),
          setup_time: parseInt(item?.setupTime),
          breakdown_time: parseInt(item?.breakdownTime),
          wrapup_time: parseInt(item?.wrapupTime),
          role_id: parseInt(item?.role?.value),
        };
      });
    }

    let body = id
      ? {
          staff: staffData,
          staff_configuration: staffConfigData,
          is_active: check,
          created_by: createdby,
        }
      : {
          staff: staffData,
          staff_configuration: staffConfigData,
          is_active: check,
        };
    const result = await fetch(
      `${BASE_URL}/${
        id
          ? `staffing-admin/staff-setup/edit/${id}`
          : 'staffing-admin/staff-setup'
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...body }),
      }
    );
    const data = await result.json();

    if (data?.status === 201 || data?.status === 'success') {
      if (id) {
        getStaffSetup();
        if (withoutNavigation) {
          setShowSuccessMessage(true);
        } else {
          compareAndSetCancel(
            newFormData,
            compareData,
            showCancelBtn,
            setShowCancelBtn,
            true
          );
          setShowModalWitoutNavigate(true);
        }
      } else {
        setShowSuccessMessage(true);
      }
    } else
      toast.error(
        `Error: ${data?.error || data?.statusCode} ${
          typeof data?.message === 'string'
            ? data?.message
            : data?.message?.length > 0 && data?.message?.map((data) => data)
        }`,
        {
          autoClose: 3000,
        }
      );
    setIsButtonClicked(false);
  };

  function areAllObjectsEmpty(arr) {
    return arr.every((obj) => Object.keys(obj).length === 0);
  }

  /* handle submit */
  const handleSubmit = (e, withoutNavigation) => {
    e.preventDefault();
    const validate = staffError(staffSetup, staffConfig);
    if (
      Object?.keys(validate?.staffSetup)?.length > 0 ||
      (validate?.config?.length > 0 && !areAllObjectsEmpty(validate?.config))
    ) {
      setIsButtonClicked(false);
      setErrors(validate?.staffSetup);
      setStaffConfigErrorS(validate?.config);
    } else {
      if (!id) {
        setIsButtonClicked(true);
      }
      postData(e, withoutNavigation);
    }
  };

  const archiveRoom = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/staffing-admin/staff-setup/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ created_by: +createdby }),
        }
      );
      const data = await result.json();
      if (data?.status_code === 204) {
        setModalPopUp(false);
        setTimeout(() => {
          setArchivedStatus(true);
        }, 600);
      } else {
        toast.error(`Error while archiving`, data?.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Error while archiving: ${error}`);
    }
    setModalPopUp(false);
  };

  const getStaffSetup = async () => {
    setLoading(true);
    try {
      const result = await fetch(
        `${BASE_URL}/staffing-admin/staff-setup/${id}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          method: 'GET',
        }
      );
      const data = await result.json();
      setCreatedBy(data?.created_by?.id);
      setCheck(data?.status);
      setStaffSetup({
        operation: {
          value: data?.staff?.opeartion_type_id,
          label: data?.staff?.opeartion_type_id,
        },
        name: data?.staff?.name,
        shortName: data?.staff?.short_name,
        procedure: {
          label: data?.staff?.procedure_type_id?.name,
          value: data?.staff?.procedure_type_id?.id,
        },
        location: {
          value: data?.staff?.location_type_id,
          label: data?.staff?.location_type_id,
        },
        beds: data?.staff?.beds,
        concurrentBeds: data?.staff?.concurrent_beds,
        staggerSlots: data?.staff?.stagger_slots,
      });
      let row_id = 0;
      let temp = data?.staff_configuration?.map((item) => {
        return {
          row_id: ++row_id,
          role: {
            label: item?.contact_role_id?.name,
            value: item?.contact_role_id?.id,
          },
          qty: item?.qty,
          leadTime: item?.lead_time,
          setupTime: item?.setup_time,
          breakdownTime: item?.breakdown_time,
          wrapupTime: item?.wrapup_time,
          id: item?.id,
        };
      });
      setStaffConfig(temp);
      let new_row_id = 0;
      setCompareData({
        setup: {
          operation: {
            value: data?.staff?.opeartion_type_id,
            label: data?.staff?.opeartion_type_id,
          },
          name: data?.staff?.name,
          shortName: data?.staff?.short_name,
          procedure: {
            label: data?.staff?.procedure_type_id?.name,
            value: data?.staff?.procedure_type_id?.id,
          },
          location: {
            value: data?.staff?.location_type_id,
            label: data?.staff?.location_type_id,
          },
          beds: Number(data?.staff?.beds),
          concurrentBeds: Number(data?.staff?.concurrent_beds),
          staggerSlots: Number(data?.staff?.stagger_slots),
          check: data?.status,
        },
        config: data?.staff_configuration?.map((item) => {
          return {
            row_id: ++new_row_id,
            role: {
              label: item?.contact_role_id?.name,
              value: item?.contact_role_id?.id,
            },
            qty: item?.qty?.toString(),
            leadTime: item?.lead_time?.toString(),
            setupTime: item?.setup_time?.toString(),
            breakdownTime: item?.breakdown_time?.toString(),
            wrapupTime: item?.wrapup_time?.toString(),
            id: item?.id?.toString(),
          };
        }),
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Error fetching data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // if (
    //   Object.values(staffSetup).some((value) => value !== null) &&
    //   staffSetup.staggerSlots !== 0 &&
    //   Object.values(staffConfig).some(
    //     (value, key) => key !== 'row_id' && value !== null
    //   )
    // ) {
    setNewFormData({
      setup: {
        operation: {
          value: staffSetup?.operation?.value,
          label: staffSetup?.operation?.label?.toUpperCase(),
        },
        name: staffSetup?.name,
        shortName: staffSetup?.shortName,
        procedure: {
          label: staffSetup?.procedure?.label,
          value: staffSetup?.procedure?.value,
        },
        location: {
          value: staffSetup?.location?.value,
          label: staffSetup?.location?.label
            ? staffSetup?.location?.label?.toUpperCase()
            : null,
        },
        beds: Number(staffSetup?.beds),
        concurrentBeds: Number(staffSetup?.concurrentBeds),
        staggerSlots: Number(staffSetup?.staggerSlots),
        check: check,
      },
      config: staffConfig.map((config) => ({
        ...config,
        role: {
          label: config?.role?.label,
          value: config?.role?.value,
        },
        qty: config?.qty?.toString(),
        leadTime: config?.leadTime?.toString(),
        setupTime: config?.setupTime?.toString(),
        breakdownTime: config?.breakdownTime?.toString(),
        wrapupTime: config?.wrapupTime?.toString(),
        id: config?.id?.toString(),
      })),
    });
    // }
  }, [staffSetup, staffConfig, check, compareData]);

  useEffect(() => {
    if (Object.keys(newFormData)?.length && Object.keys(compareData)?.length) {
      compareAndSetCancel(
        newFormData,
        compareData,
        showCancelBtn,
        setShowCancelBtn
      );
    }
  }, [newFormData, compareData, check]);

  useEffect(() => {
    if (id) {
      getStaffSetup();
    }
  }, [id]);

  useEffect(() => {
    getProcedureData();
    getRoles();
  }, []);
  useEffect(() => {
    let firstErrorKey = Object?.keys(errors)?.find((key) => errors[key] !== '');
    if (firstErrorKey) {
      scrollToErrorField({ [firstErrorKey]: errors[firstErrorKey] });
    }
  }, [errors]);

  useEffect(() => {
    if (staffConfigErrors?.length) {
      for (let Staff of staffConfigErrors) {
        let firstErrorKey = Object?.keys(Staff)?.find(
          (key) => Staff[key] !== ''
        );
        if (firstErrorKey) {
          scrollToErrorField({
            [firstErrorKey]: Staff[firstErrorKey],
          });
        }
      }
    }
  }, [staffConfigErrors]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={id ? BreadcrumbsDataEditStaffSetup : BreadcrumbsData}
          BreadCrumbsTitle={label}
        />
        <div className="mainContentInner form-container">
          <div>
            <form>
              <StaffSetupForm
                id={id}
                setStaffSetup={setStaffSetup}
                staffSetup={staffSetup}
                errors={errors}
                handleErrorState={handleErrorStateStaffSetup}
                procedureOptions={procedureOptions}
              />
              <StafConfigForm
                id={id}
                staffConfig={staffConfig}
                setStaffConfig={setStaffConfig}
                errors={staffConfigErrors}
                handleErrorState={handleErrorStateConfigSetup}
                handleAppend={handleAppend}
                handleRemove={handleRemove}
                setCheck={setCheck}
                check={check}
                rolesOptions={rolesOptions}
              />
            </form>
          </div>
          <div className={`form-footer`}>
            {id &&
            CheckPermission([
              Permissions.STAFF_ADMINISTRATION.STAFF_SETUPS.ARCHIVE,
            ]) ? (
              <div className="archived" onClick={() => setModalPopUp(true)}>
                Archive
              </div>
            ) : null}

            {!id && (
              <button
                className="btn simple-text"
                onClick={(e) => handleCancel(e)}
              >
                Cancel
              </button>
            )}
            {id && showCancelBtn && (
              <button
                className="btn simple-text"
                onClick={(e) => handleCancel(e)}
              >
                Cancel
              </button>
            )}
            {id && !showCancelBtn && (
              <Link className={`btn simple-text`} to={-1}>
                Close
              </Link>
            )}
            {id ? (
              <button
                className="btn btn-secondary btn-md"
                onClick={(e) => handleSubmit(e, true)}
              >
                Save & Close
              </button>
            ) : null}
            <button
              type="button"
              className={`btn btn-primary btn-md`}
              disabled={!id ? isButtonClicked : false}
              onClick={(e) => {
                if (!isButtonClicked) {
                  handleSubmit(e);
                }
              }}
            >
              {id ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      </div>
      <SuccessPopUpModal
        title="Success!"
        message={`Staff Setup ${id ? 'updated' : 'created'}.`}
        modalPopUp={showSuccessMessage}
        isNavigate={true}
        redirectPath={
          id
            ? `/system-configuration/tenant-admin/staffing-admin/staff-setup/${id}`
            : -1
        }
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
      />
      <SuccessPopUpModal
        title="Success!"
        message={`Staff Setup is archived.`}
        modalPopUp={archiveStatus}
        isNavigate={true}
        redirectPath={STAFF_SETUP.LIST}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setArchivedStatus}
      />
      <SuccessPopUpModal
        title="Success!"
        message={`Staff Setup ${id ? 'updated' : 'created'}.`}
        modalPopUp={showModalWitoutNavigate}
        showActionBtns={true}
        isNavigate={true}
        isArchived={false}
        setModalPopUp={setShowModalWitoutNavigate}
      />
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure you want to srchive?'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={archiveRoom}
      />

      <ConfirmModal
        showConfirmation={showCancelConfirmationDialog}
        onCancel={() => setShowCancelConfirmationDialog(false)}
        onConfirm={() => navigate(STAFF_SETUP.LIST)}
        icon={CancelIconImage}
        heading={'Confirmation'}
        description={
          'You have some unsaved data? Are you sure you want to leave?'
        }
      />
    </>
  );
};

export default AddEditForm;
