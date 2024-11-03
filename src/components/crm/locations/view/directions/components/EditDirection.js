import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API } from '../../../../../../api/api-routes';
import SuccessPopUpModal from '../../../../../common/successModal';
import SuccessIcon from '../../../../../../assets/success.svg';
import FormInput from '../../../../../common/form/FormInput';
import ArchiveImage from '../../../../../../assets/archive.svg';
import SelectDropdown from '../../../../../common/selectDropdown';
// import FormText from '../../../../../common/form/FormText';
import ConfirmModal from '../../../../../common/confirmModal';
import ConfirmationIcon from '../../../../../../assets/images/confirmation-image.png';
import CancelModalPopUp from '../../../../../common/cancelModal';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import handleInputChange from '../../../../../../helpers/handleInputChange';
import validateForm from '../../../../../../helpers/formValidation';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import ToolTip from './tooltip';

const initialErrors = {
  note_name: '',
  category_id: '',
  sub_category_id: '',
  details: '',
  miles: '',
  minutes: '',
  collection_operation: '',
  direction: '',
};
const BASE_URL = process.env.REACT_APP_BASE_URL;
const bearerToken = localStorage.getItem('token');
export default function EditDirection({ directionsListPath }) {
  const { locationId, directionId } = useParams();
  const [addDirectionData, setAddDirectionData] = useState({
    id: directionId,
    location: null,
    collection_operation: null,
    direction: '',
    miles: null,
    minutes: null,
  });
  const [cordinatesA, setCordinatesA] = useState(null);
  const [cordinatesB, setCordinatesB] = useState(null);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [errors, setErrors] = useState(initialErrors);
  const [redirectPath, setRedirectPath] = useState(false);
  const navigate = useNavigate();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showUpdatedNote, setShowUpdatedNote] = useState(false);
  const [location, setLocation] = useState({});
  const [closeModal, setCloseModal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [archivePopup, setArchivePopup] = useState(false);
  const [showConfirmationDialogArchive, setShowConfirmationDialogArchive] =
    useState(false);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    if (cordinatesA?.coordinates) {
      milesApi(cordinatesA.coordinates);
    }
  }, [cordinatesA]);

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

  const convertIntoMiles = (metersValue) => {
    const metersInMile = 1609.34;
    const miles = metersValue / metersInMile;
    return miles;
  };

  const convertIntoMinutes = (secondsValue) => {
    const time = Math.ceil(secondsValue / 60);
    return time;
  };

  const milesApi = async (direction) => {
    const geocoder = new window.google.maps.DirectionsService();

    const request = {
      origin: {
        lat: cordinatesB.coordinates.x,
        lng: cordinatesB.coordinates.y,
      },
      destination: { lat: direction.x, lng: direction.y },
      travelMode: 'DRIVING',
    };
    await new Promise((resolve, reject) => {
      window.google.maps.event.addListener(geocoder, 'ready', resolve);
      geocoder.route(request, function (result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          const distance = result?.routes?.map((item) => {
            return item?.legs?.map((legs) => {
              return {
                distance: legs?.distance?.value,
                time: legs?.duration?.value,
                step: legs?.steps,
              };
            });
          });
          const dist = convertIntoMiles(distance[0][0]?.distance);
          const mint = convertIntoMinutes(distance[0][0]?.time);
          const steps = distance[0][0]?.step
            ?.map((item) => item.instructions)
            .join('');
          setAddDirectionData((prevValue) => ({
            ...prevValue,
            miles: dist,
            minutes: mint,
            direction: steps,
          }));
          setErrors((prevErrors) => ({
            ...prevErrors,
            miles: '',
            minutes: '',
            direction: '',
          }));
        } else {
          // Handle the error
          console.error(status);
        }
      });
    });
  };

  useEffect(() => {
    startFetch();
  }, []);

  const fetch_collection_operation_facility = async (id) => {
    try {
      console.log(id);
      const result = await fetch(
        `${BASE_URL}/system-configuration/facilities/collection_operation/${id}`,
        {
          headers: {
            method: 'GET',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let data = await result.json();
      if (result.ok || result.status === 200) {
        setCordinatesA(data[0]?.address);
      } else {
        toast.error('Error Fetching Collection Operations', {
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const startFetch = async () => {
    await fetchLocation();
    await fetchCollectionOperations();
    await getEdit();
  };
  const fetchLocation = async () => {
    return API.crm.location
      .getLocation(locationId)
      .then(({ data }) => {
        setCordinatesB(data.data.address);
        setLocation(data.data);
      })
      .catch((er) => toast.error('Failed to fetch location'));
  };

  const getEdit = async () => {
    try {
      const response =
        await API.crm.location.directions.getDirectionByID(directionId);

      const direction = response?.data?.data;
      const collectionOperationAssigned = {
        label: direction?.collection_operation_id?.name,
        value: direction?.collection_operation_id?.id,
      };
      setAddDirectionData({
        ...direction,
        collection_operation: collectionOperationAssigned,
        direction: direction?.direction,
      });
      setIsActive(direction.is_active);
      setCollectionOperationData((prevCollectionData) => [
        ...prevCollectionData,
        collectionOperationAssigned,
      ]);
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleConfirmArchive = async () => {
    const body = {
      is_archived: true,
    };
    const response = await makeAuthorizedApiRequest(
      'PATCH',
      `${BASE_URL}/location/direction/archive/${directionId}`,
      JSON.stringify(body)
    );
    let data = await response.json();
    if (data?.status === 'success') {
      toast.success(`Direction is archived.`, {
        autoClose: 3000,
      });
      navigate(`/crm/locations/${locationId}/directions/`);
    } else {
      toast.error(`${data?.message?.[0] ?? data?.response}`, {
        autoClose: 3000,
      });
    }
    setArchivePopup(false);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateForm(addDirectionData, fieldNames, setErrors);
    if (isValid) {
      const body = {
        location_id: Number(locationId),
        direction: addDirectionData.direction,
        collection_operation_id: Number(
          addDirectionData?.collection_operation?.value
        ),
        miles: Number(addDirectionData.miles),
        minutes: Number(addDirectionData.minutes),
        is_active: isActive,
      };
      try {
        await API.crm.location.directions.updateDirection(directionId, body);

        if (event.target.name === 'Save & Close') {
          setShowUpdatedNote(true);
          setRedirectPath(-1);
        }
        if (event.target.name === 'Save Changes') {
          setShowUpdatedNote(true);
          setRedirectPath(false);
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
    }
  };

  const fieldNames = [
    {
      label: 'Collection Operation',
      name: 'collection_operation',
      required: true,
    },
    {
      label: 'Directions',
      name: 'direction',
      required: true,
    },
    {
      label: 'Miles',
      name: 'miles',
      required: true,
      shouldBeAPositiveInteger: true,
    },
    {
      label: 'Minutes',
      name: 'minutes',
      required: true,
      shouldBeAPositiveInteger: true,
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value, setAddDirectionData, fieldNames, setErrors);
    setChanged(true);
  };

  const handleDropDownChange = async (name, val) => {
    setAddDirectionData({
      ...addDirectionData,
      [name]: val === null ? val : { label: val?.label, value: val?.value },
    });
    setChanged(true);
    if (val?.value) {
      fetch_collection_operation_facility(val?.value);
      setErrors({ ...errors, [name]: '' });
    } else {
      setAddDirectionData((prevValue) => ({
        ...prevValue,
        miles: null,
        minutes: null,
        direction: '',
      }));
    }
  };

  const fetchCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/location/direction/collection_operations/list?location_id=${locationId}`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      let formatCollectionOperations = data?.map((operation) => ({
        label: operation?.name,
        value: operation?.id,
      }));
      setCollectionOperationData([...formatCollectionOperations]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  const handleConfirmationResultArchive = async (confirmed) => {
    setShowConfirmationDialogArchive(false);

    if (confirmed) {
      try {
        const response =
          await API.crm.location.directions.archiveDirection(directionId);
        if (response?.status) {
          setShowSuccessDialog(true);
        } else {
          toast.error('Unable to add in archive.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching user details', {
          autoClose: 3000,
        });
      }
    }
  };
  const handleCancelClick = () => {
    if (changed) setCloseModal(true);
    else navigate(-1);
  };
  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
  };
  const calculateDistance = (name) => {
    let value = addDirectionData[name];
    if (addDirectionData.collection_operation?.value) {
      console.log(typeof value);
      if (value !== null) {
        return name === 'miles' ? Number(value).toFixed(2) : value;
      } else {
        return null;
      }
    }
  };
  const editorConfiguration = {
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        '|',
        'link',
        'imageUpload',
        '|',
        'bulletedList',
        'numberedList',
        'strikethrough',
        'subscript',
        'superscript',
        'blockQuote',
      ],
    },
  };
  return (
    <div className="mainContentInner form-container">
      <section
        className={`popup full-section ${
          showConfirmationDialogArchive ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img src={ArchiveImage} alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>Are you sure you want to archive?</p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => handleConfirmationResultArchive(false)}
              >
                No
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleConfirmationResultArchive(true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
      <ConfirmModal
        showConfirmation={showConfirmationDialog}
        onCancel={() => handleConfirmationResult(false)}
        onConfirm={() => {
          fetch_collection_operation_facility(
            addDirectionData?.collection_operation?.value
          );
          handleConfirmationResult(false);
        }}
        icon={ConfirmationIcon}
        heading={'Confirmation'}
        description={
          'Are you sure you want to overwrite directions, miles and minutes for the location ?'
        }
      />
      <section
        className={`popup full-section ${showUpdatedNote ? 'active' : ''}`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img className="bg-light" src={SuccessIcon} alt="SuccessIcon" />
          </div>
          <div className="content">
            <h3>Success!</h3>
            <p>Direction updated.</p>
            <div className="buttons  ">
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  setShowUpdatedNote(false);
                  if (redirectPath) {
                    navigate(-1);
                  }
                }}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      </section>
      <form className="mt-5" onSubmit={handleSubmit}>
        <div className="formGroup">
          <h5>Edit Direction</h5>
          <div className="w-100 form-field">
            <FormInput
              label="Location"
              name="location"
              displayName="Location"
              value={location?.name || ''}
              onChange={handleChange}
              required={true}
              disabled={true}
              error={errors.location}
              onBlur={handleChange}
            />
          </div>

          <SelectDropdown
            placeholder="Collection Operation*"
            name="collection_operation"
            selectedValue={addDirectionData?.collection_operation}
            defaultValue={addDirectionData?.collection_operation}
            required={false}
            removeDivider
            showLabel={true}
            onChange={(val) => {
              handleDropDownChange('collection_operation', val);
            }}
            options={collectionOperationData}
            error={errors.collection_operation}
          />
          <div className="w-100 form-field">
            <CKEditor
              editor={ClassicEditor}
              data={addDirectionData?.direction}
              onChange={(event, editor) => {
                const data = editor.getData();
                setAddDirectionData((pre) => ({ ...pre, direction: data }));
                if (!data == '') {
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    direction: '',
                  }));
                } else {
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    direction: 'Direction is required.',
                  }));
                }
              }}
              config={editorConfiguration}
            />
          </div>

          <FormInput
            label="Miles"
            name="miles"
            displayName="Miles"
            value={calculateDistance('miles')}
            onChange={handleChange}
            required
            type="number"
            error={errors.miles}
            onBlur={handleChange}
          />
          <FormInput
            label="Minutes"
            name="minutes"
            type="number"
            displayName="Minutes"
            value={calculateDistance('minutes')}
            onChange={handleChange}
            required={true}
            error={errors.minutes}
            onBlur={handleChange}
          />
          <div className="form-field checkbox">
            <span className="toggle-text">
              {isActive ? 'Active' : 'Inactive'}
            </span>
            <label htmlFor="toggle" className="switch">
              <input
                type="checkbox"
                id="toggle"
                className="toggle-input"
                name="is_active"
                checked={isActive}
                onChange={(event) => {
                  setIsActive(event.target.checked);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="form-field d-flex justify-content-end">
            <div className="field">
              <ToolTip
                text={
                  'Expiration internal determines the number of months from start date that certification expires'
                }
                onClick={() => {
                  addDirectionData.collection_operation?.value &&
                    setShowConfirmationDialog(true);
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-footer">
          <span
            className="archived"
            onClick={() => {
              setArchivePopup(true);
            }}
          >
            Archive
          </span>

          <span className={`btn simple-text`} onClick={handleCancelClick}>
            Cancel
          </span>
          <button
            name="Save & Close"
            className={`btn btn-secondary btn-md`}
            onClick={handleSubmit}
          >
            Save & Close
          </button>
          <button
            name="Save Changes"
            type="button"
            className={`btn btn-primary btn-md`}
            onClick={handleSubmit}
            // disabled={!isDisabled}
          >
            Save Changes
          </button>
        </div>
        <CancelModalPopUp
          title="Confirmation"
          message="Unsaved changes will be lost, do you wish to proceed?"
          modalPopUp={closeModal}
          isNavigate={true}
          setModalPopUp={setCloseModal}
          redirectPath={-1}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Direction is archived."
          modalPopUp={showSuccessDialog}
          isNavigate={true}
          setModalPopUp={setShowSuccessDialog}
          showActionBtns={true}
          redirectPath={directionsListPath}
        />
        <SuccessPopUpModal
          title="Confirmation"
          message={'Are you sure you want to archive?'}
          modalPopUp={archivePopup}
          setModalPopUp={setArchivePopup}
          showActionBtns={false}
          isArchived={true}
          archived={handleConfirmArchive}
        />
      </form>
    </div>
  );
}
