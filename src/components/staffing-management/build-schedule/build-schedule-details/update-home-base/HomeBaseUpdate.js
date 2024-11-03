/* eslint-disable */
import IndividualUpdate from './IndividualUpdate';
import React, { useState, useEffect } from 'react';
import Styles from './index.module.scss';
import Form from '../../../../common/form/Form';
import { toast } from 'react-toastify';
import ByRoleUpdate from './ByRoleUpdate';
import ApplyToAllUpdate from './ApplyToAllUpdate';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import { useLocation } from 'react-router-dom';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import SvgComponent from '../../../../common/SvgComponent';
import { styled } from '@mui/material/styles';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../../routes/path';
import { BuildScheduleDetailsBreadCrumbData } from '../../BuildScheduleBreadCrumbData';
import TopBar from '../../../../common/topbar/index';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';

const HomeBaseUpdate = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
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
  const [rolesList, setRolesList] = useState([]);
  const [byRoleData, setByRoleData] = useState();
  const [initialData, setInitialData] = useState();
  const [restructuredInitialData, setRestructuredInitialData] = useState();
  const [individualData, setIndividualData] = useState();
  const [applyToAllData, setApplyToAllData] = useState();
  const [noData, setNoData] = useState(false);
  const [disabledFields, setDisabledFields] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [eventName, setEventName] = useState();
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const onConfirmNavigate =
    STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS.concat('?').concat(appendToLink);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup function to be executed on unmount (optional)
      const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
      if (!mapsLoaded) {
        loadGoogleMapsScript(apiKey, mapsLoaded).then(() =>
          setMapsLoaded(true)
        );
      }
    };
  }, []);

  const handleModificationTypeChange = (event) => {
    setModificationType(event.target.value);
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      let url = `${BASE_URL}/staffing-management/schedules/operations/${operation_id}/${operation_type}/shifts/${shift_id}/update-home-base/${schedule_status}`;
      const result = await makeAuthorizedApiRequest('GET', url);
      let dataobj = await result.json();
      // Convert the numerical indices into an array of objects
      let data = Object.keys(dataobj)
        .filter((key) => !isNaN(key)) // Filter out non-numerical keys
        .map((key) => dataobj[key]); // Map numerical keys to their corresponding objects
      if (!data || data?.length === 0) {
        setNoData(true);
        setIsLoading(false);
        return;
      }
      setInitialData(data);
      structureInitialDataForIndividual(data);
      structureRoles(data);
      setIsLoading(false);
    } catch (error) {
      toast.error(`Failed to fetch data ${error}`, { autoClose: 3000 });
      setIsLoading(false);
    }
  };
  const loadGoogleMapsScript = (apiKey, mapsLoaded) => {
    if (!mapsLoaded) {
      return new Promise((resolve) => {
        if (!window.google || !window.google.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/directions/?key=${apiKey}`;
          script.defer = true;
          script.async = true;
          document.head.appendChild(script);
          window.initGoogleMaps = resolve; // Assign the resolve function to the global scope
        } else {
          resolve();
        }
      });
    } else {
      return Promise.resolve(); // Already loaded, resolve immediately
    }
  };

  const structureRoles = (data) => {
    const roles = [...new Set(data?.map((obj) => obj.role_name))];
    setRolesList(roles);
  };
  const structureInitialDataForIndividual = (data) => {
    const restructuredData = data.map((obj) => {
      const selectedHB = obj.home_base_enum;
      if (selectedHB === 1) {
        const homeBaseRestructured = {
          value: obj.home_base_enum,
          label: obj.staff_collection_operation,
        };
        return { ...obj, home_base: homeBaseRestructured };
      } else if (selectedHB === 2) {
        const homeBaseRestructured = {
          value: obj.home_base_enum,
          label: obj.operation_collection_operation,
        };
        return { ...obj, home_base: homeBaseRestructured };
      } else if (selectedHB === 3) {
        const homeBaseRestructured = {
          value: obj.home_base_enum,
          label: 'Staff Home Address',
        };
        return { ...obj, home_base: homeBaseRestructured };
      }
      return { ...obj };
    });

    setRestructuredInitialData(restructuredData);
  };

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const convertIntoMinutes = (secondsValue) => {
    const time = Math.ceil(secondsValue / 60);
    return time;
  };

  const calculateMinutes = async (origin, destination) => {
    const geocoder = new window.google.maps.DirectionsService();

    const request = {
      origin: {
        lat: origin.x,
        lng: origin.y,
      },
      destination: { lat: destination.x, lng: destination.y },
      travelMode: 'DRIVING',
    };
    return new Promise((resolve, reject) => {
      window.google.maps.event.addListener(geocoder, 'ready', resolve);
      geocoder.route(request, function (result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const distance = result?.routes?.map((item) => {
            return item?.legs?.map((legs) => {
              return {
                distance: legs?.distance?.value,
                time: legs?.duration?.value,
              };
            });
          });
          const minutes = convertIntoMinutes(distance[0][0]?.time);
          resolve(minutes);
        } else if (
          status === window.google.maps.DirectionsStatus.ZERO_RESULTS
        ) {
          // Handle the "ZERO_RESULTS" error
          toast.error(
            'No route available between the origin and destination points.'
          );
          resolve(0); // Return 0 minutes as fallback
        } else {
          // Handle the error
          console.error(status);
          reject(status);
        }
      });
    });
  };

  const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: 14,
      fontWeight: 400,
      backgroundColor: '#72a3d0',
      borderRadius: 8,
      padding: 12,
      fontFamily: 'Inter',
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: '#72a3d0',
    },
  });

  const setFieldDisabled = (
    fieldName,
    value,
    disabledFrom,
    disabledForRole
  ) => {
    if (disabledFields?.length === 0) {
      // add the field
      const newArr = [];
      newArr.push({
        fieldName: fieldName,
        disabledFrom: disabledFrom,
        value: value,
        disabledForRole: disabledForRole,
      });
      setDisabledFields(newArr);
    } else {
      // find the field and modify the value
      const index = disabledFields.findIndex(
        (field) => field.fieldName === fieldName
      );
      if (index !== -1) {
        setDisabledFields((prevData) => {
          if (!prevData) {
            prevData = [];
          }
          const updatedData = [...prevData];
          updatedData[index] = {
            ...updatedData[index],
            value: value,
            disabledFrom: disabledFrom,
            disabledForRole: disabledForRole,
          };
          return updatedData;
        });
      }
    }
  };
  const isFieldDisabled = (fieldName, disabledFrom, roleName) => {
    return disabledFields?.some((field) =>
      field.disabledForRole
        ? field.fieldName === fieldName &&
          field.disabledForRole === roleName &&
          field.disabledFrom !== disabledFrom &&
          field.value
        : field.fieldName === fieldName &&
          field.disabledFrom !== disabledFrom &&
          field.value
    );
  };

  const handleSubmit = async (e, eventName) => {
    e.preventDefault();
    if (!individualData && !byRoleData && !applyToAllData) {
      return;
    }
    let dataToUpdate = [...initialData];
    if (applyToAllData) {
      if (applyToAllData.is_travel_time_included) {
        // if it's false, this means no change happened
        dataToUpdate = dataToUpdate.map((obj) => {
          return {
            ...obj,
            is_travel_time_included: applyToAllData.is_travel_time_included,
          };
        });
      }
      if (applyToAllData.home_base) {
        dataToUpdate = dataToUpdate.map((obj) => {
          return {
            ...obj,
            home_base_enum: applyToAllData.home_base.value,
          };
        });
      }
    }
    if (byRoleData) {
      if (byRoleData.home_base) {
        dataToUpdate = dataToUpdate.map((obj) => {
          if (obj.role_name === byRoleData.role_name.label) {
            return {
              ...obj,
              home_base_enum: byRoleData.home_base.value,
            };
          } else {
            return obj;
          }
        });
      }
      if (byRoleData.is_travel_time_included) {
        // if false - checkbox is unchecked - means no change
        dataToUpdate = dataToUpdate.map((obj) => {
          if (obj.role_name === byRoleData.role_name.label) {
            return {
              ...obj,
              is_travel_time_included: byRoleData.is_travel_time_included,
            };
          } else {
            return obj;
          }
        });
      }
    }
    if (individualData) {
      dataToUpdate = dataToUpdate.map((obj) => {
        const matchingObject = individualData.find((individual) =>
          obj?.staff_assignment_id === null
            ? obj?.staff_assignment_draft_id ===
              individual?.staff_assignment_draft_id
            : obj?.staff_assignment_id === individual?.staff_assignment_id
        );
        if (matchingObject) {
          return { ...obj, ...matchingObject };
        } else {
          return obj;
        }
      });
    }
    try {
      const promises = (dataToUpdate = dataToUpdate.map((obj) => {
        if (
          [
            PolymorphicType.OC_OPERATIONS_DRIVES,
            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
          ].includes(operation_type)
        ) {
          // destination is operation_collection_operation
          // only if home_base === 3 (staff home address), calculate minutes
          if (obj.home_base_enum === 3) {
            return calculateMinutes(
              obj.sha_coordinates,
              obj.oco_coordinates
            ).then((minutes) => {
              return { ...obj, minutes: minutes };
            });
          } else {
            return { ...obj };
          }
        } else if (operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS) {
          // destination is operation_collection_operation
          // if staff home address selected, calculate minutes
          if (obj.home_base_enum === 3) {
            return calculateMinutes(
              obj.sha_coordinates,
              obj.oco_coordinates
            ).then((minutes) => {
              return { ...obj, minutes: minutes };
            });
          } else if (obj.home_base_enum === 2) {
            // if operation_collection_operation selected (option 2), minutes is 0
            // because travel time OCO -> OCO = 0
            const minutes = 0;
            return { ...obj, minutes: minutes };
          } else {
            return { ...obj };
          }
        }
      }));

      dataToUpdate = await Promise.all(promises);
      const response = await fetch(
        `${BASE_URL}/staffing-management/schedules/operations/${operation_id}/${operation_type}/shifts/${shift_id}/update-home-base`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(dataToUpdate),
        }
      );
      const data = await response.json();
      if (data?.status === 'success') {
        setShowSuccessDialog(true);
        setEventName(eventName);
        setDisabledFields([]);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
      setTimeout(() => {}, 1000);
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const areFieldsChanged = () => {
    return individualData || applyToAllData || byRoleData;
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
            label: 'Home Base',
            class: 'active-label',
            link: location.pathname
              .concat('?')
              .concat(appendToLink)
              .concat(`&shift_id=${shift_id}`),
          },
        ]}
        BreadCrumbsTitle={'Home Base'}
      />
      <div className={Styles.overlay}>
        <div className={Styles.selectModType}>
          <h5>
            Select Modification Type{' '}
            <StyledTooltip
              title="This will adjust role time details for the selected records."
              arrow
              placement="right"
            >
              <span>
                <SvgComponent name={'Info'} />
              </span>
            </StyledTooltip>
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
        {isLoading && (
          <h5 className={Styles.dataLoading}> Data Loading ... </h5>
        )}
        {!isLoading && noData ? (
          <h5 className={Styles.dataLoading}> No Data Found. </h5>
        ) : (
          <div>
            {' '}
            {modificationType === 'individual' && !isLoading && (
              <IndividualUpdate
                setIndividualData={setIndividualData}
                initialData={restructuredInitialData}
                byRoleData={byRoleData}
                applyToAllData={applyToAllData}
                setFieldDisabled={setFieldDisabled}
                isFieldDisabled={isFieldDisabled}
              />
            )}
            {modificationType === 'byRole' && !isLoading && (
              <ByRoleUpdate
                byRoleData={byRoleData}
                setByRoleData={setByRoleData}
                applyToAllData={applyToAllData}
                roles={rolesList}
                initialData={initialData}
                setFieldDisabled={setFieldDisabled}
                isFieldDisabled={isFieldDisabled}
              />
            )}
            {modificationType === 'applyToAll' && !isLoading && (
              <ApplyToAllUpdate
                applyToAllData={applyToAllData}
                setApplyToAllData={setApplyToAllData}
                initialData={initialData}
                setFieldDisabled={setFieldDisabled}
                isFieldDisabled={isFieldDisabled}
              />
            )}
          </div>
        )}

        <Form
          editScreen={true}
          showArchiveButton={false}
          showConfirmationDialog={showConfirmationDialog}
          setShowConfirmationDialog={setShowConfirmationDialog}
          showSuccessDialog={showSuccessDialog}
          setShowSuccessDialog={setShowSuccessDialog}
          eventName={eventName}
          isDisabled={areFieldsChanged()}
          handleSubmit={handleSubmit}
          onConfirmNavigate={onConfirmNavigate}
          successModalMessage={'Changes saved successfully.'}
        />
      </div>
    </div>
  );
};

export default HomeBaseUpdate;
