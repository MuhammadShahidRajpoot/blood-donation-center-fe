import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { API } from '../../../../../../api/api-routes';
import SuccessIcon from '../../../../../../assets/success.svg';
import FormInput from '../../../../../common/form/FormInput';
import SelectDropdown from '../../../../../common/selectDropdown';
import './index.scss';
import ConfirmationIcon from '../../../../../../assets/images/confirmation-image.png';
// import FormText from '../../../../../common/form/FormText';
import ConfirmModal from '../../../../../common/confirmModal';
import CancelModalPopUp from '../../../../../common/cancelModal';
// import ToolTip from './tooltip/index';
import handleInputChange from '../../../../../../helpers/handleInputChange';
import validateForm from '../../../../../../helpers/formValidation';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import parse from 'html-react-parser';
import ToolTip from './tooltip';
import { removeCountyWord } from '../../../../../../helpers/utils';

const initialErrors = {
  id: '',
  location: '',
  collection_operation: '',
  direction: '',
};
const BASE_URL = process.env.REACT_APP_BASE_URL;
export default function DirectionCreate({ directionsListPath }) {
  const { locationId } = useParams();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [createdDirection, setCreateDirection] = useState(false); //mod
  const [closeModal, setCloseModal] = useState(false);
  const [collectionOperationData, setCollectionOperationData] = useState([]);
  const [errors, setErrors] = useState(initialErrors);
  const [createButton, setCreateButton] = useState(false);
  const [cordinatesA, setCordinatesA] = useState(null);
  const [cordinatesB, setCordinatesB] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [changed, setChanged] = useState(false);

  const [addDirectionData, setAddDirectionData] = useState({
    id: '',
    location: '',
    collection_operation: null,
    direction: '',
    miles: null,
    minutes: null,
    is_archived: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollectionOperations();
    fetchLocation();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateForm(addDirectionData, fieldNames, setErrors);
    if (isValid) {
      setCreateButton(true);
      const body = {
        location_id: Number(locationId),
        collection_operation_id: Number(
          addDirectionData?.collection_operation?.value
        ),
        direction: addDirectionData.direction,
        miles: Number(addDirectionData.miles),
        minutes: Number(addDirectionData.minutes),
        is_active: isActive,
      };
      try {
        const res = await API.crm.location.directions.createDirection(body);
        if (res?.data?.status === 'success') {
          setCreateDirection(true);
        } else if (res?.data?.status !== 'success') {
          const showMessage = Array.isArray(res?.data?.message)
            ? res?.data?.response[0]
            : res?.data?.response;
          toast.error(`${showMessage}`, { autoClose: 3000 });
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
      setCreateButton(false);
      console.log('Form data submitted:', addDirectionData);
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

  const fetchCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/location/direction/collection_operations/list?location_id=${locationId}`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      data = data.filter(
        (item) => item?.organizational_level_id.is_collection_operation
      );
      let formatCollectionOperations = data?.map((operation) => ({
        label: operation?.name,
        value: operation?.id,
      }));
      setCollectionOperationData([...formatCollectionOperations]);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };
  useEffect(() => {
    if (addDirectionData?.collection_operation?.value) {
      fetch_collection_operation_facility(
        addDirectionData?.collection_operation?.value
      );
    } else {
      setAddDirectionData((prevValue) => ({
        ...prevValue,
        miles: null,
        minutes: null,
        direction: '',
      }));
    }
  }, [addDirectionData?.collection_operation]);

  useEffect(() => {
    if (cordinatesA) {
      milesApi(cordinatesA);
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

  const fetch_collection_operation_facility = async (id) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/system-configuration/facilities/collection_operation/${id}`
    );
    let data = await result.json();
    if (result.ok || result.status === 200) {
      console.log({ data });
      setCordinatesA(data[0]?.address);
    } else {
      toast.error('Error Fetching Collection Operations', {
        autoClose: 3000,
      });
    }
  };

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
    //Commented longlat for testing the address
    const request = {
      origin: formatAddress(direction),
      //  {
      //   lat: cordinatesB.coordinates.x,
      //   lng: cordinatesB.coordinates.y,
      // },
      destination: formatAddress(cordinatesB),
      // { lat: direction.x, lng: direction.y },
      travelMode: 'DRIVING',
    };
    await new Promise((resolve, reject) => {
      window.google.maps.event.addListener(geocoder, 'ready', resolve);
      geocoder.route(request, function (result, status) {
        if (status === window.google.maps.DirectionsStatus.OK) {
          console.log({ result });
          const distance = result?.routes?.map((item) => {
            return item?.legs?.map((legs) => {
              return {
                distance: legs?.distance?.value,
                time: legs?.duration?.value,
                step: legs?.steps,
              };
            });
          });

          console.log({
            distance,
            destination: formatAddress(cordinatesB),
            origin: formatAddress(direction),
          });
          const dist = convertIntoMiles(distance[0][0]?.distance);
          const mint = convertIntoMinutes(distance[0][0]?.time);
          const steps = distance[0][0]?.step
            ?.map((item) => item.instructions)
            .join('<br/>');
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
          console.error(status);
        }
      });
    });
  };
  const handleConfirmationResult = (confirmed) => {
    setShowConfirmationDialog(false);
  };

  const handleCancelClick = () => {
    if (changed) setCloseModal(true);
    else navigate(-1);
  };
  const fetchLocation = async () => {
    API.crm.location
      .getLocation(locationId)
      .then(({ data }) => {
        setAddDirectionData({ ...addDirectionData, location: data.data });
        setCordinatesB(data.data.address);
      })
      .catch((er) => toast.error('Failed to fetch location'));
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
  const calculateDistance = (name) => {
    let value = addDirectionData[name];
    if (addDirectionData.collection_operation?.value) {
      if (value) {
        return name === 'miles' ? Number(value).toFixed(2) : value;
      } else {
        return null;
      }
    }
  };

  return (
    <div className="mainContentInner form-container">
      <section
        className={`popup full-section ${createdDirection ? 'active' : ''}`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img className="bg-light" src={SuccessIcon} alt="SuccessIcon" />
          </div>
          <div className="content">
            <h3>Success!</h3>
            <p>Direction created.</p>
            <div className="buttons  ">
              <button
                className="btn btn-primary w-100"
                onClick={() => {
                  setCreateDirection(true);
                  navigate(`/crm/locations/${locationId}/directions`);
                }}
              >
                Ok
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
          'Are you sure you want to overwrite directions, miles and minutes for this location?'
        }
      />
      <form className="mt-5" onSubmit={handleSubmit}>
        <div className="formGroup">
          <h5>Create Direction</h5>
          <div className="w-100 form-field">
            <FormInput
              label="Location"
              name="location"
              displayName="Location"
              value={addDirectionData.location?.name || ''}
              onChange={handleChange}
              required
              disabled={true}
              error={errors.location}
              onBlur={handleChange}
            />
            <SelectDropdown
              placeholder={'Collection Operation*'}
              name="collection_operation"
              showLabel={true}
              selectedValue={addDirectionData?.collection_operation}
              onChange={(selectedOption) => {
                if (selectedOption === null) {
                  console.log('hello');
                  setAddDirectionData({
                    ...addDirectionData,
                    miles: '',
                    minutes: '',
                  });
                }

                setAddDirectionData({
                  ...addDirectionData,
                  collection_operation: selectedOption,
                });
                setChanged(true);
              }}
              removeDivider
              options={collectionOperationData}
              error={errors.collection_operation}
            />
          </div>
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
                    direction: 'Description is required.',
                  }));
                }
              }}
              config={editorConfiguration}
              name="direction"
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
            error={errors.minutes}
            onBlur={handleChange}
            required={true}
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

        <div className={`form-footer`}>
          <span className={`btn simple-text`} onClick={handleCancelClick}>
            Cancel
          </span>
          <button
            type="submit"
            className={`btn btn-primary btn-md`}
            disabled={createButton}
          >
            Create
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
      </form>
    </div>
  );
}

const formatAddress = (address) =>
  `${address?.address1} ${address?.address2} ${removeCountyWord(
    address?.city
  )}, ${address?.state} ${address?.zip_code}`;
