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
import DynamicComponent from './dynamicForm';
import SuccessPopUpModal from '../../../common/successModal';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import DatePicker from 'react-datepicker';
import styles from './index.module.scss';
import SelectDropdown from '../../../common/selectDropdown';
import OrganizationalDropDown from '../../../common/Organization/DropDown';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../common/Organization/Popup';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import { OrganizationalLevelsContext } from '../../../../Context/OrganizationalLevels';
const initialDate = {
  startDate: null,
  endDate: null,
};

export const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="8"
        viewBox="0 0 16 8"
        fill="none"
      >
        <path
          d="M15.25 0.999999L9.03095 6.33062C8.58156 6.7158 7.91844 6.7158 7.46905 6.33062L1.25 1"
          stroke="#2D2D2E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
};

function ApprovalsFilters({
  setIsLoading,
  fetchAllStages,
  selectedOptions,
  setSelectedOptions,
  UpdateOperationDateChange,
  UpdateDateChange,
  resetDateHandler,
  resetOperationDateHandler,
  updateOpTypeData,
  updateOrgData,
  setFilterApplied,
  filterApplied,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [dateCrossColor, setDateCrossColor] = useState('#cccccc');
  const [optionsChange, setOptionsChange] = useState(false);
  const [organizationalLevelData, setOrganizationalLevelData] = useState([]);
  const [selectOptionsData, setSelectOptionsData] = useState([]);
  const [filterCodeData, setFilterCodeData] = useState();
  const [filterFormData, setFilterFormData] = useState();
  const [filterName, setFilterName] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteFilterName, setDeleteFilterName] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [managersData, setManagersData] = useState([]);
  const [requestersData, setRequestersData] = useState([]);
  const [dateRange, setDateRange] = useState(initialDate);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [operationDateRange, setOperationDateRange] = useState(initialDate);
  const [orgData, setOrgData] = useState('');
  const [opTypeData, setOpTypeData] = useState('');
  const [accountsData, setAccountsData] = useState([]);
  const [OLLabels, setOLLabels] = useState([]);
  const [OLClear, setOLClear] = useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const operationTypeEnum = [
    {
      label: PolymorphicType.OC_OPERATIONS_DRIVES,
      value: '1',
    },
    {
      label: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
      value: '3',
    },
    {
      label: PolymorphicType.OC_OPERATIONS_SESSIONS,
      value: '2',
    },
  ];
  let inputTimer = null;
  const handleSelectChange = (data, name) => {
    const dataValue = data ? data : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
    setOpTypeData(dataValue);
    updateOpTypeData(dataValue);
  };
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
    UpdateDateChange(value);
  };
  const handleOperationDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setOperationDateRange(value);
    UpdateOperationDateChange(value);
  };
  const handleOrganizationalLevel = (payload, _, apply) => {
    setPopupVisible(false);
    const cleanedPayload =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    setFilterFormData({
      ...filterFormData,
      organizational_levels: cleanedPayload,
    });
    setOrgData(cleanedPayload);
    updateOrgData(cleanedPayload);
    if (apply && !OLClear && payload !== '') {
      handleFilterApply({ organizational_levels: cleanedPayload });
    }
  };
  console.log(
    'dateRange',
    dateRange,
    'orgData',
    orgData,
    'opTypeData',
    opTypeData,
    'filterFormData',
    filterFormData
  );
  useEffect(() => {
    getOrganizationalLevelData();
    getFiltersCode();
    getFilters();
    fetchManagers();
    fetchRequesters();
    fetchAccounts();
  }, []);
  const getOrganizationalLevelData = async () => {
    const result = await fetch(`${BASE_URL}/organizational_levels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    const data = await result.json();
    setOrganizationalLevelData([
      ...(data?.data.map((item) => {
        return { value: item.id, label: item.name };
      }) || []),
    ]);
  };

  const getFiltersCode = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/oc_approvals`
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
        toast.error('Error Fetching State', { autoClose: 3000 });
      }
    } catch (error) {
      toast.error('Error Fetching State', { autoClose: 3000 });
    }
  };
  const fetchManagers = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/tenant-users`
      );
      const data = await response.json();
      setManagersData([
        ...(data?.data.map((item) => {
          if (item.is_manager) {
            return {
              value: item.id,
              label: item?.first_name + ' ' + item?.last_name,
            };
          }
        }) || []),
      ]);
    } catch (error) {
      console.error('Error While fetching Recruiters:', error);
    }
  };
  const fetchRequesters = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations/approvals`
      );
      const data = await response.json();
      const uniqueRequestersData = (data?.data || [])
        .map((item) => ({
          value: item.requestor,
          label: item.requested_by,
        }))
        .filter(
          (item, index, array) =>
            array.findIndex(
              (uniqueItem) =>
                uniqueItem.value === item.value &&
                uniqueItem.label === item.label
            ) === index
        );

      setRequestersData(uniqueRequestersData);
    } catch (error) {
      console.error('Error While fetching Recruiters:', error);
    }
  };
  const fetchAccounts = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/accounts/?fetch_all=true&is_active=true`
      );
      const data = await response.json();
      setAccountsData([
        ...(data?.data.map((item) => {
          return {
            value: item.id,
            label: item?.name,
          };
        }) || []),
      ]);
    } catch (error) {
      console.error('Error While fetching Accounts:', error);
    }
  };

  const getFilters = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/filters/single/oc_approvals`
      );
      const data = await result.json();
      setSelectOptionsData(
        Object.values(data?.data).map((item) => {
          return { ...item, value: item.id, label: item.name };
        }) || []
      );
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch Territory Management', {
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
        application_code: 'oc_approvals',
        filter_name: filterName,
      };
      const result = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/filters`,
        JSON.stringify(apiPayload)
      );
      const apiResult = await result.json();
      if (apiResult.status === 'success' || apiResult.status_code === 201) {
        setShowConfirmationDialog(false);
        getFilters();
        reinitializeState();
        setSelectedOptions('');
        setOptionsChange(false);
        setTimeout(() => {
          setModalPopUp(true);
        }, 600);
      } else if (apiResult.status_code === 400) {
        toast.error(
          `Filter ${filterName} is already used. Please enter a different name.`,
          { autoClose: 3000 }
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleArchiveFilter = async (name) => {
    const result = await makeAuthorizedApiRequest(
      'POST',
      `${BASE_URL}/filters/delete/${deleteId}/oc_approvals`
    );
    await result.json();
    if (result.ok || result.status === 200) {
      setDeleteConfirmationModal(false);
      setTimeout(() => {
        setArchiveSuccess(true);
      }, 600);
    } else {
      toast.error('Error Archiving Crm Locations Filters', { autoClose: 3000 });
    }
    setDeleteConfirmationModal(false);
    getFilters();
    if (selectedOptions?.value === deleteId) {
      reinitializeState(true);
      setSelectedOptions('');
      setAppliedFilters([]);
      setShowAppliedFilters(false);
    }
  };
  const handleChange = (dropdownOptions) => {
    if (Array.isArray(dropdownOptions)) {
      let obj = {
        value: dropdownOptions,
        name: 'organization_levels',
      };
      if (obj?.name !== selectedOptions?.name) {
        setShowAppliedFilters(true);
        setAppliedFilters([]);
        setSelectedOptions(obj);
      } else if (obj?.name === selectedOptions?.name) {
        reinitializeState(true);
        setShowAppliedFilters(false);
        setAppliedFilters([]);
        setSelectedOptions('');
      }
    } else {
      if (dropdownOptions?.name !== selectedOptions?.name) {
        setShowAppliedFilters(true);
        setAppliedFilters([]);
        setSelectedOptions(dropdownOptions);
      } else if (dropdownOptions?.name === selectedOptions?.name) {
        reinitializeState(true);
        setShowAppliedFilters(false);
        setAppliedFilters([]);
        setSelectedOptions('');
      }
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
              rest.data?.value === selectedOptions?.value
                ? { color: '#5ca044', cursor: 'pointer' }
                : { color: '#D9D9D9', cursor: 'pointer' }
            }
          />
          <FontAwesomeIcon
            width={15}
            height={15}
            icon={faTrashCan}
            style={{ color: '#ff1e1e', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteId(rest.data.id);
              setDeleteFilterName(rest.data.name);
              setDeleteConfirmationModal(true);
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
      setShowConfirmationDialog(false);
    }
  };

  const reinitializeState = (makeApiCall = false) => {
    const dynamicProperties = {};
    for (const key in filterFormData) {
      dynamicProperties[key] = '';
    }
    setFilterName('');
    setFilterFormData(dynamicProperties);
    if (makeApiCall) {
      fetchAllStages(dynamicProperties);
    }
  };
  const snakeCaseToTitleCase = (str) => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  useEffect(() => {
    reinitializeState();
    const fetchSubFilters = async () => {
      try {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/filters/single-filters/${selectedOptions?.value}`
        );
        let { data } = await result.json();
        if (result.ok || result.status === 200) {
          let filter = [];
          let updatedFilterFormData = { ...filterFormData };

          for (const value of Object.values(data)) {
            const filterCriteria = value.filter_criteria_id;
            const filterName = filterCriteria.name;
            const filterValue = value.filter_saved_value;
            filterFormData[filterName] = filterValue;
            updatedFilterFormData[filterName] = filterValue;
            filter.push({
              name: filterCriteria.display_name,
              identifier: filterName,
            });
          }
          setFilterFormData(updatedFilterFormData);
          setAppliedFilters(filter);
          fetchAllStages(filterFormData);
        } else {
          toast.error('Error Fetching State', { autoClose: 3000 });
        }
      } catch (error) {
        toast.error('Error Fetching State', { autoClose: 3000 });
      }
    };
    if (!selectedOptions?.value) return;
    setIsLoading(true);
    fetchSubFilters();
  }, [selectedOptions]);

  const handleFilterApply = (initialFilterFormData) => {
    const dynamicProperties = {};
    const ffd = {
      ...filterFormData,
      ...initialFilterFormData,
    };
    for (const key in ffd) {
      const value = ffd[key];
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
      clearTimeout(inputTimer);
      inputTimer = setTimeout(async () => {
        setIsLoading(true);
        fetchAllStages(dynamicProperties);
      }, 500);
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
    setIsLoading(true);
    fetchAllStages(updatedFormData);
    if (updatedFilters.length <= 0) {
      setSelectedOptions('');
    }
    if (ind === 'organizational_levels') {
      setOLClear(true);
      setOLLabels('');
      clearOLData(OLPageNames.OC_APPROVALS);
    }
  };

  return (
    <div className="filterBar crm-filters approval-filters">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filter">
          <form>
            {!optionsChange ? (
              <React.Fragment>
                <div className={`${styles.fieldDate}`}>
                  <DatePicker
                    dateFormat="MM/dd/yyyy"
                    className=" custom-datepicker "
                    selected={dateRange.startDate}
                    onChange={handleDateChange}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    selectsRange
                    placeholderText="Request Date Range"
                  />
                  {(dateRange?.startDate || dateRange?.endDate) && (
                    <span
                      className={`position-absolute ${styles.dateCross}`}
                      onClick={() => {
                        setDateRange(initialDate);
                        resetDateHandler();
                      }}
                    >
                      <svg
                        height="20"
                        width="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                        className="css-tj5bde-Svg"
                        onMouseEnter={() => setDateCrossColor('#999999')}
                        onMouseLeave={() => setDateCrossColor('#cccccc')}
                      >
                        <path
                          fill={dateCrossColor}
                          d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                        ></path>
                      </svg>
                    </span>
                  )}
                  {(dateRange?.startDate || dateRange?.endDate) && (
                    <label>Request Date Range</label>
                  )}
                </div>
                {/* )}
            {!optionsChange && ( */}
                <div className={`${styles.fieldDate}`}>
                  <DatePicker
                    dateFormat="MM/dd/yyyy"
                    className=" custom-datepicker "
                    selected={operationDateRange.startDate}
                    onChange={handleOperationDateChange}
                    startDate={operationDateRange.startDate}
                    endDate={operationDateRange.endDate}
                    selectsRange
                    placeholderText="Operation Date Range"
                  />
                  {(operationDateRange?.startDate ||
                    operationDateRange?.endDate) && (
                    <span
                      className={`position-absolute ${styles.dateCross}`}
                      onClick={() => {
                        setOperationDateRange(initialDate);
                        resetOperationDateHandler();
                      }}
                    >
                      <svg
                        height="20"
                        width="20"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        focusable="false"
                        className="css-tj5bde-Svg"
                        onMouseEnter={() => setDateCrossColor('#999999')}
                        onMouseLeave={() => setDateCrossColor('#cccccc')}
                      >
                        <path
                          fill={dateCrossColor}
                          d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                        ></path>
                      </svg>
                    </span>
                  )}
                  {(operationDateRange?.startDate ||
                    operationDateRange?.endDate) && (
                    <label>Operation Date Range</label>
                  )}
                </div>
                <OrganizationalDropDown
                  labels={OLLabels}
                  handleClick={() => setPopupVisible(true)}
                  handleClear={() => {
                    handleSingleFilterDelete('organizational_levels');
                    setOrgData('');
                    updateOrgData('');
                    setPopupVisible(false);
                    setOLLabels('');
                  }}
                  disabled={selectedOptions}
                />
                <SelectDropdown
                  placeholder="Operation Type"
                  name="operation_type"
                  selectedValue={opTypeData ? opTypeData : null}
                  // required
                  removeDivider
                  showLabel
                  onChange={(data) => {
                    // fetchProductsById(data);
                    handleSelectChange(data, 'operation_type');
                  }}
                  options={operationTypeEnum.map((option) => ({
                    label: option.label,
                    value: option.label,
                  }))}
                />
              </React.Fragment>
            ) : (
              <div>
                <Select
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                    }),
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  value={selectedOptions}
                  options={selectOptionsData}
                  components={{
                    Option,
                    DropdownIndicator,
                  }}
                  onChange={handleChange}
                  placeholder="Select Existing Filters"
                  closeMenuOnSelect={true}
                  hideSelectedOptions={false}
                  isClearable={false}
                  backspaceRemovesValue={false}
                />
              </div>
            )}

            {optionsChange ? (
              <div
                onClick={() => {
                  setOptionsChange(false);
                  OLClear && handleSingleFilterDelete('organizational_levels');
                }}
                className="button"
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
                className="button"
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
          <DynamicComponent
            organizationalLevelData={organizationalLevelData}
            setFilterApplied={setFilterApplied}
            filterApplied={filterApplied}
            dateRange={dateRange}
            setDateRange={setDateRange}
            operationDateRange={operationDateRange}
            setOperationDateRange={setOperationDateRange}
            filterCodeData={filterCodeData}
            filterFormData={filterFormData}
            setFilterFormData={setFilterFormData}
            selectedOptions={selectedOptions}
            managersData={managersData}
            requestersData={requestersData}
            accountsData={accountsData}
            setPopupVisible={setPopupVisible}
            OLLabels={OLLabels}
            setOLLabels={setOLLabels}
            setClear={setOLClear}
          />
          <div className="buttons">
            <button
              className={`btn btn-outlined`}
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
              Save as New Filter
            </button>
            <div className="d-flex align-items-center gap-3">
              <div
                className="clearFilterBtn"
                onClick={() => {
                  if (selectedOptions) return;
                  const isFilterApplied = appliedFilters.length > 0;
                  reinitializeState(isFilterApplied);
                  setAppliedFilters([]);
                  setDateRange(initialDate);
                  resetDateHandler();
                  setOperationDateRange(initialDate);
                  resetOperationDateHandler();
                  setOLLabels('');
                  setOLClear(true);
                  clearOLData(OLPageNames.OC_APPROVALS);
                }}
              >
                Clear
              </div>
              <button
                type="button"
                className={`btn btn-primary`}
                onClick={(e) => handleFilterApply()}
                disabled={selectedOptions}
              >
                Filter Data
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showAppliedFilters && appliedFilters.length > 0 && !optionsChange && (
        <div className="selectFilters">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex flex-wrap align-items-center gap-3">
              {appliedFilters.map((item, index) => (
                <div
                  key={index}
                  className="appliedFilterContainer d-flex align-items-center gap-2"
                >
                  <span className="appliedFilterSpan">{item.name}</span>
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    icon={faXmark}
                    style={{ color: '#A3A3A3', cursor: 'pointer' }}
                    onClick={() =>
                      handleSingleFilterDelete(item.identifier, index)
                    }
                  />
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
                setDateRange(initialDate);
                resetDateHandler();
                setOperationDateRange(initialDate);
                resetOperationDateHandler();
                setOLLabels('');
                setOLClear(true);
                clearOLData(OLPageNames.OC_APPROVALS);
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
            <img src={ConfirmArchiveIcon} alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>Are you sure you want to archive?</p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmationModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
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
        message={`Filter ${deleteFilterName} is archived.`}
        modalPopUp={archiveSuccess}
        isNavigate={true}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        onConfirm={() => {}}
        // redirectPath="/crm/locations"
      />
      <SuccessPopUpModal
        title="Success!"
        message="Filter saved."
        modalPopUp={modalPopUp}
        // onConfirm={() => {}}
        isNavigate={true}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        // redirectPath="/crm/locations"
        // onConfirm={() => {}}
      />
      <OrganizationalPopup
        showConfirmation={isPopupVisible}
        value={filterFormData?.organizational_levels}
        onCancel={() => {
          setPopupVisible(false);
        }}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        showRecruiters
        showDonorCenters
        setLabels={setOLLabels}
        clear={OLClear}
        pageName={OLPageNames.OC_APPROVALS}
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

export default ApprovalsFilters;
