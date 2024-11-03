import {
  faMinus,
  faPlus,
  faTrashCan,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import './index.scss';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import Select, { components } from 'react-select';
import filterImage from '../../../../assets/images/filterImage.png';
import ConfirmationIcon from '../../../../assets/images/confirmation-image.png';
import { IsJson } from '../../../../helpers/IsJson';
import SuccessPopUpModal from '../../../common/successModal';
import ViewScheduleDynamicForm from './dynamicForm';
import { DropdownIndicator } from '../../../common/selectDropdown';
import { sortByLabel } from '../../../../helpers/utils';

const ScheduleStatusEnum = [
  { id: 1, name: 'Draft' },
  { id: 2, name: 'Published' },
];
// cannot put id = 0 here, because some IFs do not satisfy the condition: if(status), when status = 0

function ViewScheduleFilters({
  setIsLoading,
  fetchAllFilters,
  selectedOptions,
  setSelectedOptions,
  setCurrentPage,
  setFiltersApplied,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [optionsChange, setOptionsChange] = useState(false);
  const [donorCenters, setDonorCenters] = useState([]);
  const [schedule_start_date, setScheduleStartDate] = useState([]);
  const [staff, setStaffNames] = useState([]);
  const [scheduleStatuses, setScheduleStatuses] = useState([]);
  const [collectionOperations, setCollectionOperations] = useState([]);
  const [selectOptionsData, setSelectOptionsData] = useState([]);
  const [filterCodeData, setFilterCodeData] = useState();
  const [filterFormData, setFilterFormData] = useState();
  const [filterName, setFilterName] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [teams, setTeams] = useState([]);
  const [createdFilterMessage, setCreatedFilterMessage] = useState('');
  const [areFiltersPredefined, setAreFiltersPredefined] = useState(false);
  //TODO: LIMIT AND PAGE const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);

  useEffect(() => {
    getTeams();
    getCollectionOperations();
    getDonorCenters();
    getFiltersCode();
    getFilters();
    getStaffNames();
    getScheduleStatuses();
    getScheduleStartDate();
  }, []);

  const getTeams = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/staff-admin/teams?status=true`
    );
    const data = await result.json();
    if (result.ok || result.status === 200) {
      setTeams(
        data?.data?.map((item) => {
          return { value: item.id, label: item.name };
        }) || []
      );
    } else {
      toast.error('Error Fetching Teams', { autoClose: 3000 });
    }
  };

  const getScheduleStartDate = async () => {
    setScheduleStartDate(new Date());
  };

  const getCollectionOperations = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/business_units/collection_operations/list?isFilter=true`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setCollectionOperations(
        data?.map((item) => {
          return { value: item.id, label: item.name };
        }) || []
      );
    } else {
      toast.error('Error Fetching Collection Operations', {
        autoClose: 3000,
      });
    }
  };

  const getDonorCenters = async () => {
    const result = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/system-configuration/facilities/donor-centers/search`,
      JSON.stringify({
        fetch_all: true,
      })
    );
    const data = await result.json();
    if (result.ok || result.status === 200) {
      setDonorCenters(
        data?.data?.map((item) => {
          return { value: parseInt(item.id), label: item.name };
        }) || []
      );
    } else {
      toast.error('Error Fetching Donor Centers', {
        autoClose: 3000,
      });
    }
  };

  const getStaffNames = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/contact-staff/all`
    );
    const data = await result?.json();
    setStaffNames(
      data?.data?.map((item) => {
        return { value: item.id, label: item.name };
      }) || []
    );
  };

  const getScheduleStatuses = async () => {
    /* change the URL here */
    setScheduleStatuses(
      ScheduleStatusEnum?.map((item) => {
        return { value: item.id, label: item.name };
      }) || []
    );
  };

  const getFiltersCode = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/staff_schedule`
      );
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        const dataValues = Object.values(data);
        setFilterCodeData(dataValues);
        const initialFormData = {};
        dataValues?.forEach((item) => {
          initialFormData[item.name] = '';
        });
        setFilterFormData(initialFormData);
      } else {
        toast.error('Error Fetching Filters', { autoClose: 3000 });
      }
    } catch (error) {
      toast.error('Error Fetching Filters', { autoClose: 3000 });
    }
  };

  const getFilters = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/single/staff_schedule`
      );
      const data = await result.json();

      const predefinedFilters =
        Object.values(data.data)
          .filter((filter) => filter.is_predefined)
          .sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          })
          .map((item) => {
            return { ...item, value: item.id, label: item.name };
          }) || [];

      const customFilters =
        Object.values(data.data)
          .filter((filter) => !filter.is_predefined)
          .sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          })
          .map((item) => {
            return { ...item, value: item.id, label: item.name };
          }) || [];

      setSelectOptionsData(
        sortByLabel([...predefinedFilters, ...customFilters])
      );
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch View Schedule Filters', {
        autoClose: 3000,
      });
    }
  };

  const postSelectedFilter = async () => {
    try {
      const newFilterArray = [];
      for (const fieldName in filterFormData) {
        const arrayData =
          Array.isArray(filterFormData[fieldName]) &&
          filterFormData[fieldName]?.length > 0
            ? filterFormData[fieldName]?.map((item) => item.id)
            : filterFormData[fieldName];
        const selectedValue = filterFormData[fieldName]?.value
          ? filterFormData[fieldName]?.value
          : arrayData;
        if (selectedValue) {
          newFilterArray.push({
            name: fieldName,
            filter_saved_value: [selectedValue],
          });
        }
      }
      const apiPayload = {
        filter_Array: newFilterArray,
        application_code: 'staff_schedule',
        filter_name: filterName,
      };
      const data = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/filters`,
        JSON.stringify(apiPayload)
      );
      const result = await data.json();
      if (result.status_code === 201) {
        setCreatedFilterMessage(`New filter ${filterName} saved.`);
        setShowConfirmationDialog(false);
        getFilters();
        reinitializeState();
        setSelectedOptions('');
        setOptionsChange(false);
        setTimeout(() => {
          setModalPopUp(true);
        }, 600);
      } else {
        toast.error(result.response, { autoClose: 3000 });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // For deleting a custom filter
  const handleArchiveFilter = async () => {
    const result = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/filters/delete/${filterToDelete.id}/staff_schedule`
    );
    await result.json();
    if (result.ok || result.status === 200) {
      setDeleteConfirmationModal(false);
      setDeleteSuccess(true);
    } else {
      toast.error('Error Archiving View Schedule Filters', { autoClose: 3000 });
    }
    setDeleteConfirmationModal(false);
    getFilters();
    if (selectedOptions?.value === filterToDelete.id) {
      reinitializeState(true);
      setSelectedOptions('');
      setAppliedFilters([]);
      setShowAppliedFilters(false);
    }
  };

  const handleChange = (dropdownOptions) => {
    if (dropdownOptions?.name !== selectedOptions?.name) {
      setShowAppliedFilters(true);
      setAppliedFilters([]);
      setSelectedOptions(dropdownOptions);
      setAreFiltersPredefined(true);
    } else if (dropdownOptions?.name === selectedOptions?.name) {
      reinitializeState(true);
      setShowAppliedFilters(false);
      setAppliedFilters([]);
      setSelectedOptions('');
      setAreFiltersPredefined(false);
    }
  };

  const Option = ({
    getStyles,
    Icon,
    isDisabled,
    isFocused,
    isSelected,
    children,
    innerProps,
    data,
    ...rest
  }) => {
    const style = {
      alignItems: 'center',
      backgroundColor: 'transparent',
      color: '#2D2D2E',
      fontSize: '16px',
      display: 'flex',
      justifyContent: 'space-between',
    };

    // prop assignments
    const props = {
      ...innerProps,
      style,
    };

    return (
      <components.Option
        {...rest}
        isDisabled={isDisabled}
        isFocused={isFocused}
        isSelected={isSelected}
        getStyles={getStyles}
        innerProps={props}
      >
        {children}
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon
            width={15}
            height={15}
            icon={faSquareCheck}
            style={
              data?.value === selectedOptions?.value
                ? { color: '#5ca044', cursor: 'pointer' }
                : { color: '#D9D9D9', cursor: 'pointer' }
            }
          />
          <FontAwesomeIcon
            width={15}
            height={15}
            icon={faTrashCan}
            style={
              data.is_predefined
                ? { color: '#D9D9D9' }
                : { color: '#ff1e1e', cursor: 'pointer' }
            }
            onClick={(e) => {
              if (data.is_predefined) {
                return;
              } else {
                e.stopPropagation();
                setFilterToDelete({ id: data.id, name: data.name });
                setDeleteConfirmationModal(true);
              }
            }}
          />
        </div>
      </components.Option>
    );
  };

  const handleConfirmationResult = (confirmed) => {
    if (confirmed) {
      if (filterName) {
        postSelectedFilter();
      } else {
        toast.error(`Filter Name is mandatory!`, { autoClose: 3000 });
      }
    } else {
      setFilterName('');
      setShowConfirmationDialog(false);
    }
  };

  const reinitializeState = (makeApiCall = false) => {
    const dynamicProperties = {};
    for (const key in filterFormData) {
      dynamicProperties[key] = '';
    }
    setFilterName('');
    setFiltersApplied({});
    setFilterFormData(dynamicProperties);
    setCurrentPage(1);
    if (makeApiCall) {
      fetchAllFilters(dynamicProperties);
    }
  };

  const snakeCaseToTitleCase = (str) => {
    // remove underscores, remove the last word (ids) if exists, capitalize first character of each word
    let wordsArray = str.split('_');
    if (wordsArray.includes('ids')) {
      wordsArray.pop();
    }
    return wordsArray
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const fetchSubFilters = async () => {
    setIsLoading(true);
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/single-filters/${selectedOptions?.value}`
      );
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        let filters = [];
        let updatedFilterFormData = {};
        for (const value of Object.values(data)) {
          const filterCriteria = value.filter_criteria_id;
          const filterName = filterCriteria.name;
          const filterValue = value.filter_saved_value;
          const parsedValue = IsJson(filterValue)
            ? filterValue
                .replace(/[{}"]/g, '')
                .split(',')
                .map((item) => item.trim())
            : filterValue;
          if (
            [
              'team_ids',
              'donor_center_ids',
              'staff_ids',
              'status',
              'collection_operation_ids',
            ].includes(filterName)
          ) {
            updatedFilterFormData[filterName] = parseInt(parsedValue[0]);
          } else if (filterName === 'schedule_start_date') {
            updatedFilterFormData[filterName] = new Date(parsedValue);
          } else {
            updatedFilterFormData[filterName] = parsedValue[0];
          }

          filters.push({
            name: filterCriteria.display_name,
            identifier: filterName,
          });
        }
        setFilterFormData(updatedFilterFormData);
        setAppliedFilters(filters);
        fetchAllFilters(updatedFilterFormData);
      } else {
        toast.error('Error Fetching Filter', { autoClose: 3000 });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error('Error Fetching Filter', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    reinitializeState();
    if (!selectedOptions?.value) return;
    fetchSubFilters();
  }, [selectedOptions]);

  const handleFilterApply = () => {
    const dynamicProperties = {};
    for (const key in filterFormData) {
      const value = filterFormData[key];
      if (Array.isArray(value) && value.length === 0) {
        continue;
      } else if (value === '') {
        continue;
      }
      dynamicProperties[key] = value;
    }
    if (Object.keys(dynamicProperties).length > 0) {
      const appliedFiltersArray = Object.keys(dynamicProperties).map((key) => ({
        name: snakeCaseToTitleCase(key),
        identifier: key,
      }));

      setAppliedFilters(appliedFiltersArray);
      setOptionsChange(false);
      setShowAppliedFilters(true);
      fetchAllFilters(dynamicProperties);
      setAreFiltersPredefined(false);
    } else {
      toast.error(`Atleast one filter is manadatory!`, {
        autoClose: 3000,
      });
    }
  };

  const handleSingleFilterDelete = (ind) => {
    const updatedFilters = appliedFilters.filter(
      (filter) => filter.identifier !== ind
    );
    setAppliedFilters(updatedFilters);
    const updatedFormData = { ...filterFormData };
    updatedFormData[ind] = '';
    setFilterFormData(updatedFormData);
    fetchAllFilters(updatedFormData);
    if (updatedFilters.length <= 0) {
      setSelectedOptions('');
    }
  };

  return (
    <div className="mb-3 filterBar px-0 viewScheduleFilters">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filter">
          <form className="d-flex align-items-center gap-4 ">
            <div>
              <Select
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    width: '240px',
                    borderRadius: '8px',
                  }),
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                value={selectedOptions}
                options={selectOptionsData}
                components={{
                  IndicatorSeparator: () => null,
                  DropdownIndicator,
                  Option,
                }}
                onChange={handleChange}
                placeholder="Select Existing Filters"
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                isClearable={false}
                backspaceRemovesValue={false}
                removeDivider
              />
            </div>
            {optionsChange ? (
              <div
                onClick={() => {
                  setOptionsChange(false);
                }}
                className="cursor-pointer icon-container d-flex align-items-center gap-2"
              >
                <span className="more-options">Hide Options</span>
                <FontAwesomeIcon
                  width={15}
                  height={15}
                  icon={faMinus}
                  color="#005375"
                />
              </div>
            ) : (
              <div
                onClick={() => {
                  setOptionsChange(true);
                }}
                className="cursor-pointer icon-container flex align-items-center gap-2"
              >
                <span className="more-options">More Options</span>
                <FontAwesomeIcon
                  width={15}
                  height={15}
                  icon={faPlus}
                  color="#005375"
                />
              </div>
            )}
          </form>
        </div>
      </div>
      {optionsChange ? (
        <div className="selectFilters">
          <ViewScheduleDynamicForm
            teams={teams}
            staff={staff}
            schedule_start_date={schedule_start_date}
            scheduleStatuses={scheduleStatuses}
            collectionOperations={collectionOperations}
            donorCenters={donorCenters}
            filterCodeData={filterCodeData}
            filterFormData={filterFormData}
            setFilterFormData={setFilterFormData}
            selectedOptions={selectedOptions}
          />
          <div className="w-100 d-flex align-align-items-center justify-content-between mt-2">
            <button
              className={`outlineBtn btn btn-outline-primary py-3 rounded-3  `}
              onClick={() => {
                const hasAnyValue = Object.values(filterFormData).some(
                  (value) => value !== ''
                );
                if (hasAnyValue) {
                  setShowConfirmationDialog(true);
                } else {
                  toast.error(`Atleast one filter is manadatory!`, {
                    autoClose: 3000,
                  });
                }
              }}
              disabled={selectedOptions}
            >
              Save New Filter
            </button>
            <div className="d-flex align-items-center gap-3">
              <div
                className="clearFilterBtn"
                onClick={() => {
                  if (selectedOptions) return;
                  const isFilterApplied = appliedFilters.length > 0;
                  reinitializeState(isFilterApplied);
                  setAppliedFilters([]);
                }}
              >
                Clear
              </div>
              <button
                type="button"
                className={`btn btn-primary py-3 rounded-3  `}
                style={{ paddingLeft: '32px', paddingRight: '32px' }}
                onClick={() => {
                  handleFilterApply();
                }}
                disabled={selectedOptions}
              >
                Filter Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showAppliedFilters && appliedFilters.length > 0 && (
        <div className="selectFilters">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center gap-3">
              {appliedFilters.map((item, index) => (
                <div
                  key={index}
                  className="appliedFilterContainer d-flex align-items-center gap-2"
                >
                  <span className="appliedFilterSpan">{item.name}</span>
                  {!areFiltersPredefined && (
                    <FontAwesomeIcon
                      width={15}
                      height={15}
                      icon={faXmark}
                      style={{ color: '#A3A3A3', cursor: 'pointer' }}
                      onClick={() =>
                        handleSingleFilterDelete(item.identifier, index)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div
              className="clearAllFiltersTxt"
              onClick={() => {
                reinitializeState(true);
                setSelectedOptions('');
                setAppliedFilters([]);
                setShowAppliedFilters(false);
                setAreFiltersPredefined(false);
              }}
            >
              Clear All Filters
            </div>
          </div>
        </div>
      )}
      <section
        className={`popup full-section ${
          deleteConfirmationModal ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img src={ConfirmationIcon} className="bg-white" alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>Are you sure you want to delete this filter?</p>
            <div className="buttons">
              <button
                className="btn btn-md btn-secondary"
                style={{ color: '#387de5' }}
                onClick={() => setDeleteConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-primary"
                onClick={() => handleArchiveFilter()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>
      <SuccessPopUpModal
        title="Success!"
        message={`Filter ${filterToDelete?.name} deleted.`}
        modalPopUp={deleteSuccess}
        isNavigate={true}
        setModalPopUp={setDeleteSuccess}
        showActionBtns={true}
        onConfirm={() => {}}
      />
      <SuccessPopUpModal
        title="Success!"
        message={createdFilterMessage}
        modalPopUp={modalPopUp}
        onConfirm={() => {}}
        isNavigate={true}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
      />
      <section
        className={`popup full-section ${
          showConfirmationDialog ? 'active' : ''
        }`}
      >
        <div
          className="popup-inner"
          style={{ maxWidth: '475px', width: '475px' }}
        >
          <div className="icon">
            <img src={filterImage} className="bg-white" alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Save as New Filter</h3>
            <p>Enter a name for this filter.</p>
            <input
              type="text"
              className="nameInputField w-100 bg-white mt-5 rounded-3 "
              placeholder="Type Name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <div className="buttons">
              <button
                className="btn btn-secondary"
                style={{ width: '45%', color: '#387de5' }}
                onClick={() => handleConfirmationResult(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ width: '45%' }}
                onClick={() => handleConfirmationResult(true)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ViewScheduleFilters;
