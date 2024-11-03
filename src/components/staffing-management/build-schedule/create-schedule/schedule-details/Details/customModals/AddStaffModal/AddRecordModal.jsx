/* eslint-disable */
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import createDynamicSchema from './roleSchema';
import {
  BASE_URL,
  makeAuthorizedApiRequest,
} from '../../../../../../../../helpers/Api';
import { toast } from 'react-toastify';
import { capitalize, toUpper } from 'lodash';
import AddForm from './add-form';

const AddRecordModal = ({
  showConfirmation,
  onCancel,
  onConfirm,
  resourceType,
  classes,
  cancelBtnText = 'Cancel',
  confirmBtnText = 'Submit',
  disabled = false,
}) => {
  const [customErrors, setcustomErrors] = useState({});
  const [record, setRecord] = useState([{ value: null, quantity: '' }]);
  const [options, setOptions] = useState([]);
  const [customFileds, setCustomFields] = useState();
  const [disableButton, setDisableButton] = useState(false);

  useEffect(() => {
    if (!showConfirmation) {
      setcustomErrors();
      setRecord([{ value: null, quantity: '', record: null }]);
      setOptions();
      setCustomFields();
      setDisableButton(false);
      reset({
        value: null,
        quantity: '',
      });
    } else {
      if (resourceType === 'staff') {
        const staff = fetchRolesData();
        staff
          .then((data) => {
            const options = data?.data?.map((item) => {
              return { label: item.name, value: item.id };
            });
            setOptions(options);
            setCustomFields([]);
          })
          .catch((error) => {
            toast.error(`Failed to Fetch Roles List: ${error}`, {
              autoClose: 3000,
            });
          });
      }
      if (resourceType === 'vehicles') {
        const vehicles = fetchVehiclesData();
        vehicles
          .then((data) => {
            const options = data?.data?.map((item) => {
              return { label: item.name, value: item.id };
            });
            setOptions(options);
            setCustomFields([]);
          })
          .catch((error) => {
            toast.error(`Failed to Fetch Vehicles List: ${error}`, {
              autoClose: 3000,
            });
          });
      }
      if (resourceType === 'devices') {
        const devices = fetchDevicesData();
        devices
          .then((data) => {
            const options = data?.data?.map((item) => {
              return { label: item.name, value: item.id };
            });
            setOptions(options);
            setCustomFields([]);
          })
          .catch((error) => {
            toast.error(`Failed to Fetch Devices List: ${error}`, {
              autoClose: 3000,
            });
          });
      }
    }
  }, [showConfirmation]);

  const fetchRolesData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contact-roles?fetchAll=true&staffable=true&status=true`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Roles: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchVehiclesData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/vehicle-types`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Vehicles: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchDevicesData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/system-configuration/device-type`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Vehicles: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const validationSchema = createDynamicSchema(customFileds);
  const {
    handleSubmit: onSubmit,
    control,
    formState: { errors: formErrors /*isDirty*/ },
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      value: null,
      quantity: '',
    },
    mode: 'onChange',
  });

  const handleRolesSubmit = async () => {
    //  ====== Custom Fields Form Data =======
    setDisableButton(true);

    const fieldsData = [];
    const rolesArr = record.map((val) => {
      return {
        role_id: val.record.value,
        role_name: val.record.label,
        qty: val.quantity,
      };
    });
    const newArray = rolesArr.flatMap((item) => {
      const repetitions = parseInt(item.qty, 10); // Parse qty to an integer, default to 1 if NaN
      return repetitions !== 0
        ? Array.from({ length: repetitions }, () => ({
            home_base: null,
            role_id: item.role_id,
            role_name: item.role_name,
            staff_id: null,
            staff_name: null,
            type: 'staff',
            isAdded: true,
            is_additional: true,
          }))
        : [];
    });

    onConfirm(newArray);
    setDisableButton(false);
    setRecord([{ value: null, quantity: '', record: null }]);
    return;
  };

  const handleVehicleTypeSubmit = async () => {
    //  ====== Custom Fields Form Data =======
    setDisableButton(true);

    const fieldsData = [];
    const updatedRecords = record.map((val) => {
      return {
        type_id: val.record.value,
        type_name: val.record.label,
        qty: val.quantity,
      };
    });
    const newArray = updatedRecords.flatMap((item) => {
      const repetitions = parseInt(item.qty, 10); // Parse qty to an integer, default to 1 if NaN
      return repetitions !== 0
        ? Array.from({ length: repetitions }, () => ({
            assigned_vehicle: null,
            assigned_vehicle_id: null,
            requested_vehicle_type: item.type_name,
            requested_vehicle_id: item.type_id,
            type: 'vehicles',
            isAdded: true,
            is_additional: true,
          }))
        : [];
    });

    onConfirm(newArray);
    setDisableButton(false);
    setRecord([{ record: null, quantity: '', value: null }]);
    return;
  };

  const handleDevicesTypeSubmit = async () => {
    //  ====== Custom Fields Form Data =======
    setDisableButton(true);

    const fieldsData = [];
    const updatedRecords = record.map((val) => {
      return {
        type_id: val.record.value,
        type_name: val.record.label,
        qty: val.quantity,
      };
    });
    const newArray = updatedRecords.flatMap((item) => {
      const repetitions = parseInt(item.qty, 10); // Parse qty to an integer, default to 1 if NaN
      return repetitions !== 0
        ? Array.from({ length: repetitions }, () => ({
            assigned_device: null,
            assigned_device_id: null,
            requested_device_type: item.type_name,
            requested_device_id: item.type_id,
            type: 'devices',
            isAdded: true,
            is_additional: true,
          }))
        : [];
    });

    onConfirm(newArray);
    setDisableButton(false);
    setRecord([{ record: null, quantity: '', value: null }]);
    return;
  };

  const onSubmitMap = {
    staff: handleRolesSubmit,
    vehicles: handleVehicleTypeSubmit,
    devices: handleDevicesTypeSubmit,
  };

  return (
    <section
      className={`${styles.popup} ${showConfirmation && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        <div className={styles.content}>
          <h5>Add {capitalize(resourceType)}</h5>
          <section className={styles.addStaffFormContainer}>
            <AddForm
              control={control}
              formErrors={formErrors}
              customErrors={customErrors}
              setcustomErrors={setcustomErrors}
              getValues={getValues}
              resourceType={resourceType}
              record={record}
              setRecord={setRecord}
              singleOption={options}
            />
          </section>
          <div className={`${styles.buttons} ${classes?.btnGroup ?? ''}`}>
            <button
              className={`btn btn-secondary ${classes?.btn ?? ''}`}
              onClick={onCancel}
            >
              {cancelBtnText}
            </button>
            <button
              className={`btn btn-primary ${classes?.btn ?? ''}`}
              onClick={resourceType ? onSubmitMap[resourceType] : () => {}}
              disabled={disableButton}
            >
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddRecordModal;
