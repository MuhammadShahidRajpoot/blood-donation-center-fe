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
import { toast } from 'react-toastify';
import Select, { components } from 'react-select';
import filterImage from '../../../../assets/images/filterImage.png';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import DynamicComponent from './dynamicForm';
import moment from 'moment';
import SuccessPopUpModal from '../../../common/successModal';
import { API } from '../../../../api/api-routes';
import styles from '../index.module.scss';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import OrganizationalDropDown from '../../../common/Organization/DropDown';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../common/Organization/Popup';
import { OrganizationalLevelsContext } from '../../../../Context/OrganizationalLevels';

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

function CalenderFilters({
  setIsLoading,
  setSelectedOptions,
  selectedOptions,
  fetchAllStages,
  clearFilters,
  setClearFilters,
}) {
  // const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [optionsChange, setOptionsChange] = useState(false);
  const [organizationalLevelData] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [operationStatus, setOperationStatus] = useState([]);
  const [selectOptionsData, setSelectOptionsData] = useState([]);
  const [filterFormData, setFilterFormData] = useState();
  const [filterName, setFilterName] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [organizationalPopUp, setOrganizationalPopUp] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [favToggle, setFavToggle] = useState('');
  const [locationOption] = useState([]);
  const [productsId, setProductsId] = useState([]);
  const [checkedIds, setCheckedIds] = useState([]);
  const [paramsFilter, setParamsFilter] = useState();

  // eslint-disable-next-line no-unused-vars
  const [selectedFilterValues, setSelectedFilterValues] = useState(null);
  const [isPopupVisible, setPopupVisible] = React.useState();
  const [OLLabels, setOLLabels] = useState([]);
  const [OLClear, setOLClear] = useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);
  // let moduleUrl = 'oc_non_collection_events';
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const data = params.get('organization_level');
      const formData = {
        procedure_type_id: params.get('procedure_types'),
        product_id: params.get('product'),
        operation_status_id: params.get('operation_status'),
        organizational_levels: data ? transformObject(data) : '',
      };
      setParamsFilter(formData);
    }
  }, [window.location.search]);

  useEffect(() => {
    if (paramsFilter) {
      setOptionsChange(true);
    }
  }, [paramsFilter]);

  let inputTimer = null;
  useEffect(() => {
    getProcedures();
    fetchOperationStatus();
    getFiltersCode();
    getFilters();
    fetchAllProducts();
    // getSingleFilters();
  }, []);

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

  const handleOrganizationalLevel = (payload, items, apply) => {
    setPopupVisible(false);
    const formData = {
      ...filterFormData,
      organizational_levels:
        typeof payload === 'string' ? payload : JSON.stringify(payload),
    };
    setFilterFormData(formData);
    if (apply && !OLClear && payload !== '') handleFilterApply(formData);
    setFavToggle(JSON.stringify(items));
  };

  const handleOrganizationalPopUpChange = (value) => {
    setOrganizationalPopUp(value);
  };

  const fetchOperationStatus = async () => {
    try {
      const { data } =
        await API.operationCenter.calender.filters.getOperationStatus(
          bearerToken
        );
      if (data?.data) {
        const statusOptionData = data?.data?.map((item) => {
          return {
            label: item?.name,
            value: item?.id,
          };
        });
        setOperationStatus(statusOptionData);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const getProcedures = async () => {
    try {
      const { data } =
        await API.operationCenter.calender.filters.getProcedure(bearerToken);
      const eventCategory = data?.data?.map((item) => {
        return {
          label: item?.name,
          value: item?.id,
        };
      });
      setProcedures(eventCategory);
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };

  const fetchAllProducts = async () => {
    try {
      const { data } =
        await API.operationCenter.calender.filters.getAllProducts(bearerToken);
      if (data?.data) {
        const products = data?.data?.map((item) => {
          return {
            label: item?.name,
            value: item?.id,
          };
        });
        setProductsId(products);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const getFiltersCode = async () => {};

  const getFilters = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/operations-center/manage-favorites?page=1&limit=5000&is_active=true&sortName=name&sortOrder=ASC`
      );
      const data = await result.json();
      setSelectOptionsData(
        Object.values(data?.data).map((item) => {
          return { ...item, value: item.id, label: item.name };
        }) || []
      );
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch', {
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
        filter_name: filterName,
      };
      const transformedObject = {};
      apiPayload?.filter_Array?.forEach((item) => {
        const key = item.name;
        let value = item.filter_saved_value[0];

        transformedObject[key] = value;
      });
      let payload = {
        ...transformedObject,
        operations_status_id: transformedObject?.operation_status_id,
        organization_level_id: favToggle ? favToggle : '',
        // location_type: 'Inside',
        // is_active: false,
        // is_default: false,
        // is_open_in_new_tab: false,
        // procedure_id: transformedObject?.procedure_type_id,
        name: filterName,
        alternate_name: filterName,
      };
      // delete payload?.procedure_type_id;
      delete payload?.operation_status_id;
      delete payload?.organizational_levels;
      const { data } =
        await API.operationCenter.calender.filters.createFavorite(
          bearerToken,
          payload
        );
      if (data?.status_code === 201) {
        setShowConfirmationDialog(false);
        getFilters();
        reinitializeState();
        setSelectedOptions('');
        setSelectedFilterValues({});
        setOptionsChange(false);
        setTimeout(() => {
          setModalPopUp(true);
        }, 600);
      } else {
        toast.error(data?.response, { autoClose: 3000 });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleArchiveFilter = async () => {
    const { data } =
      await API.operationCenter.calender.filters.deleteFavoriteFilter(
        bearerToken,
        deleteId
      );
    if (data?.status_code === 204) {
      setDeleteConfirmationModal(false);
      setTimeout(() => {
        setArchiveSuccess(true);
      }, 600);
      // getFilters();
      // getSingleFilters();
      if (selectedOptions?.value === deleteId) {
        reinitializeState(true);
        setSelectedOptions('');
        setAppliedFilters([]);
        setShowAppliedFilters(false);
      }
    } else {
      toast.error('Error in archiving Filter', {
        autoClose: 3000,
      });
    }
  };
  const handleChange = (dropdownOptions) => {
    const modifiedObject = {
      procedure_type_id: +dropdownOptions?.procedure_type_idd,
      operation_status_id: +dropdownOptions?.operations_status_idd,
      product_id: +dropdownOptions?.product_idd,
      organizational_levels: dropdownOptions?.bu_metadata,
      name: dropdownOptions?.name,
      id: dropdownOptions?.id,
      value: dropdownOptions?.value,
      alternate_name: dropdownOptions?.alternate_name,
      label: dropdownOptions?.label,
    };
    if (Array.isArray(modifiedObject)) {
      let obj = {
        value: modifiedObject,
        name: 'organizational_levels',
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
      if (modifiedObject?.name !== selectedOptions?.name) {
        setShowAppliedFilters(true);
        setAppliedFilters([]);
        setSelectedOptions(modifiedObject);
      } else if (modifiedObject?.name === selectedOptions?.name) {
        reinitializeState(true);
        setShowAppliedFilters(false);
        setAppliedFilters([]);
        setSelectedOptions('');
      }
    }
    setOrganizationalPopUp(false);
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
              setDeleteId(rest?.data?.id);
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

  const snakeCaseToTitleCase = (str) => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  function transformObject(input) {
    const output = {};
    let buMetadatas = input;
    if (typeof buMetadatas === 'string') {
      buMetadatas = JSON.parse(input);
    }
    const buMetadata =
      buMetadatas?.length &&
      buMetadatas?.map((record) =>
        record.is_recruiter || record.is_donor_center
          ? { ...record, id: record.id.split('-')[0] }
          : record
      );

    buMetadatas?.map((record) =>
      record.is_recruiter || record.is_donor_center
        ? { ...record, id: record.id.split('-')[0] }
        : record
    );

    buMetadata
      ?.filter((item) => item?.is_collection_operation)
      ?.forEach((item) => {
        output[item.id] = {
          recruiters: [
            ...new Set(
              buMetadata
                ?.filter(
                  (record) =>
                    record.is_recruiter && record.parent_id === item.id
                )
                .map((record) => record.id)
            ),
          ],
          // donor_centers: [
          //   ...new Set(
          //     buMetadata
          //       .filter(
          //         (record) =>
          //           record.is_donor_center && record.parent_id === item.id
          //       )
          //       .map((record) => record.id)
          //   ),
          // ],
        };
      });

    return JSON.stringify({ collection_operations: output });
  }
  useEffect(() => {
    reinitializeState();
    const fetchSubFilters = async () => {
      setAppliedFilters(selectedOptions);
      try {
        const result = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/operations-center/manage-favorites/${selectedOptions?.value}`
        );
        let { data } = await result.json();
        if (data) {
          const result = data?.bu_metadata
            ? transformObject(data?.bu_metadata)
            : '';
          delete data?.organizational_levels;
          let obj = {
            ...data,
            organizational_levels: result,
          };
          const keysToExtract = [
            'organizational_levels',
            'product_id',
            'procedure_type_id',
            'operations_status_id',
          ];
          const resultArray = keysToExtract
            .map((key) => {
              if (obj[key]) {
                return {
                  name: key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (firstChar) => firstChar.toUpperCase()),
                  identifier: key,
                };
              }
              return null; // To handle cases where the condition isn't met
            })
            .filter(Boolean);
          let dataD = {
            product_id: obj?.product_id ? obj?.product_id?.id : '',
            operation_status_id: obj?.operations_status_id
              ? obj?.operations_status_id?.id
              : '',
            // organizational_levels: data?.organization_level_id
            //   ? JSON.stringify([data?.organization_level_id?.id])
            //   : '',
            organizational_levels: obj?.organizational_levels
              ? obj?.organizational_levels
              : '',
            procedure_type_id: obj?.procedure_type_id
              ? obj?.procedure_type_id?.id
              : '',
          };
          setFilterFormData(dataD);
          setAppliedFilters(resultArray);
          fetchAllStages(dataD);
        } else {
          toast.error('Error Fetching State', { autoClose: 3000 });
        }
      } catch (error) {
        toast.error('Error Fetching State', { autoClose: 3000 });
      }
    };
    if (!selectedOptions?.value) return;
    // setIsLoading(true);
    if (selectedOptions) {
      fetchSubFilters();
    }
  }, [selectedOptions]);

  const handleFilterApply = (formData = null) => {
    const dynamicProperties = {};
    const data = formData || filterFormData;
    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value) && value.length === 0) {
        continue;
      } else if (value === '') {
        continue;
      }
      if (key == 'date') {
        const formattedDate = moment(value).format('YYYY-MM-DD').trim();
        dynamicProperties[key] = formattedDate;
      } else {
        dynamicProperties[key] = value;
      }
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
        // setIsLoading(true);
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
    // setIsLoading(true);
    fetchAllStages(updatedFormData);
    if (updatedFilters.length <= 0) {
      setSelectedOptions('');
    }
    if (ind === 'organizational_levels') {
      setOLLabels('');
      setOLClear(true);
      clearOLData(OLPageNames.OC_CALENDER);
    }
  };

  const handleCheckboxChange = (id) => {
    const isChecked = checkedIds.includes(id);
    let updatedIds;

    if (isChecked) {
      updatedIds = checkedIds.filter((checkedId) => checkedId !== id);
    } else {
      updatedIds = [...checkedIds, id];
    }

    setCheckedIds(updatedIds);
  };

  useEffect(() => {
    if (clearFilters) {
      setSelectedOptions('');
      setAppliedFilters([]);
      setSelectedFilterValues(null);
      setShowAppliedFilters(false);
      setClearFilters(false);
      setFilterFormData({});
    }
  }, [clearFilters]);

  return (
    <div className="filterBar crm-filters">
      <div className="filterInner">
        <h2>Filters</h2>
        <div className="filter">
          <form>
            <div className="mar-right">
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
                placeholder="Favorite"
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                isClearable={false}
                backspaceRemovesValue={false}
              />
            </div>
            <div className={!optionsChange ? '' : 'd-none'}>
              <OrganizationalDropDown
                labels={OLLabels}
                handleClick={() => setPopupVisible(true)}
                handleClear={() => {
                  setFilterFormData({
                    ...filterFormData,
                    organizational_levels: '',
                  });
                  handleSingleFilterDelete('organizational_levels');
                  setOLLabels('');
                  setOLClear(true);
                  clearOLData(OLPageNames.OC_CALENDER);
                }}
              />
            </div>
            {optionsChange ? (
              <div
                onClick={() => {
                  setOptionsChange(false);
                  setSelectedFilterValues(null);
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
      <div className={`${optionsChange ? '' : 'd-none'} selectFilters`}>
        <DynamicComponent
          procedures={procedures}
          setSelectedFilterValues={setSelectedFilterValues}
          selectedFilterValues={selectedFilterValues}
          onOrganizationalPopUpChange={handleOrganizationalPopUpChange}
          organizationalLevelData={organizationalLevelData}
          setOrganizationalPopUp={setOrganizationalPopUp}
          operationStatus={operationStatus}
          handleChange={fetchAllProducts}
          locationOption={locationOption}
          productsId={productsId}
          setProductsId={setProductsId}
          paramsFilter={paramsFilter}
          status={[
            {
              value: 'active',
              label: 'Active',
            },
            {
              value: 'inactive',
              label: 'Inactive',
            },
          ]}
          // filterCodeData={filterCodeData}
          filterFormData={filterFormData}
          setFilterFormData={setFilterFormData}
          selectedOptions={selectedOptions}
          favToggle={favToggle}
          setFavToggle={setFavToggle}
          setPopupVisible={setPopupVisible}
          OLLabels={OLLabels}
          setOLLabels={setOLLabels}
          setClear={setOLClear}
        />
        <div className="buttons">
          <button
            className={`btn btn-outlined`}
            onClick={() => {
              // const hasAnyValue = Object?.values(filterFormData)?.some(
              //   (value) => value !== ''
              // );
              // if (hasAnyValue) {
              setShowConfirmationDialog(true);
              // }
            }}
            disabled={selectedOptions}
          >
            Save as New Favorite
          </button>
          <div className="d-flex align-items-center gap-3">
            <div
              className="clearFilterBtn"
              onClick={() => {
                if (selectedOptions) return;
                const isFilterApplied = appliedFilters.length > 0;
                reinitializeState(isFilterApplied);
                setAppliedFilters([]);
                setSelectedFilterValues(null);
                fetchAllProducts();
                setOLLabels('');
                setOLClear(true);
                clearOLData(OLPageNames.OC_CALENDER);
              }}
            >
              Clear
            </div>
            <button
              type="button"
              className={`btn btn-primary`}
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
      {showAppliedFilters &&
        (appliedFilters.length > 0 || appliedFilters?.value?.length) &&
        !optionsChange && (
          <div className="selectFilters">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {Array.isArray(appliedFilters) ? (
                  appliedFilters.map((item, index) => (
                    <div
                      key={index}
                      className="appliedFilterContainer d-flex align-items-center gap-2"
                    >
                      <span className="appliedFilterSpan">
                        {item.name === 'Procedure Type Id'
                          ? 'Procedure Type'
                          : item.name === 'Product Id'
                          ? 'Product'
                          : item.name === 'Operations Status Id' ||
                            item.name === 'Operation Status Id'
                          ? 'Operation Status'
                          : item.name === 'Organization Level Id'
                          ? 'Organization Level'
                          : item.name}
                      </span>
                      <FontAwesomeIcon
                        width={15}
                        height={15}
                        icon={faXmark}
                        style={{ color: '#A3A3A3', cursor: 'pointer' }}
                        onClick={() =>
                          handleSingleFilterDelete(item?.identifier, index)
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="appliedFilterContainer d-flex align-items-center gap-2">
                    <span className="appliedFilterSpan">
                      Organization Level
                    </span>
                    <FontAwesomeIcon
                      width={15}
                      height={15}
                      icon={faXmark}
                      style={{ color: '#A3A3A3', cursor: 'pointer' }}
                      //   onClick={() =>
                      //     handleSingleFilterDelete(item.identifier, index)
                      //   }
                    />
                  </div>
                )}
              </div>
              <div
                className="clearAllFiltersTxt"
                onClick={() => {
                  reinitializeState(true);
                  setSelectedOptions('');
                  setAppliedFilters([]);
                  setSelectedFilterValues(null);
                  setShowAppliedFilters(false);
                  setClearFilters(!clearFilters);
                  fetchAllProducts();
                  setOLLabels('');
                  setOLClear(true);
                  clearOLData(OLPageNames.OC_CALENDER);
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
      {organizationalPopUp ? (
        <section
          className={`calendarPoup full-section ${
            organizationalPopUp ? 'show-info' : 'hide-info'
          } popup ${organizationalPopUp ? 'active' : ''}`}
        >
          <div
            className="popup-inner"
            style={{ maxWidth: '850px', padding: '30px', position: 'relative' }}
          >
            <div className="content">
              <div className={styles.popupHeader}>
                <span className={styles.orgTitle}>Organization Level</span>
              </div>
              <div>
                {organizationalLevelData?.map((item) => (
                  <>
                    <div
                      key={item?.id}
                      className={`form-field mb-3 pb-2 w-100 ${styles.checkbox} ${styles.formFeild}`}
                    >
                      <span
                        data-bs-toggle="collapse"
                        href="#collapseExample"
                        aria-expanded="false"
                        aria-controls="collapseExample"
                        style={{ marginRight: '10px' }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            id="Union"
                            d="M10.6641 5.20004H6.66406V0.836404C6.66406 0.643519 6.59382 0.458534 6.4688 0.322144C6.34378 0.185754 6.17421 0.109131 5.9974 0.109131C5.82058 0.109131 5.65102 0.185754 5.52599 0.322144C5.40097 0.458534 5.33073 0.643519 5.33073 0.836404V5.20004H1.33073C1.15392 5.20004 0.984349 5.27666 0.859325 5.41305C0.734301 5.54944 0.664063 5.73443 0.664062 5.92731C0.664063 6.1202 0.734301 6.30518 0.859325 6.44157C0.984349 6.57796 1.15392 6.65459 1.33073 6.65459H5.33073V11.0182C5.33073 11.2111 5.40097 11.3961 5.52599 11.5325C5.65102 11.6689 5.82058 11.7455 5.9974 11.7455C6.17421 11.7455 6.34378 11.6689 6.4688 11.5325C6.59382 11.3961 6.66406 11.2111 6.66406 11.0182V6.65459H10.6641C10.8409 6.65459 11.0104 6.57796 11.1355 6.44157C11.2605 6.30518 11.3307 6.1202 11.3307 5.92731C11.3307 5.73443 11.2605 5.54944 11.1355 5.41305C11.0104 5.27666 10.8409 5.20004 10.6641 5.20004Z"
                            fill="#005375"
                          />
                        </svg>
                      </span>
                      <input
                        className="form-check-input mt-0 "
                        type="checkbox"
                        onChange={() => handleCheckboxChange(item?.id)}
                        checked={checkedIds.includes(item?.id)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexCheckDefault"
                      >
                        {item?.name}
                      </label>
                    </div>
                    {item?.parent_level ? (
                      <div
                        style={{ marginLeft: '50px' }}
                        key={item?.parent_level?.id}
                        id="collapseExample"
                        className={`form-field mb-3 pb-2 w-100 collapse ${styles.checkbox} ${styles.formFeild}`}
                      >
                        <span style={{ marginRight: '10px' }}>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              id="Union"
                              d="M10.6641 5.20004H6.66406V0.836404C6.66406 0.643519 6.59382 0.458534 6.4688 0.322144C6.34378 0.185754 6.17421 0.109131 5.9974 0.109131C5.82058 0.109131 5.65102 0.185754 5.52599 0.322144C5.40097 0.458534 5.33073 0.643519 5.33073 0.836404V5.20004H1.33073C1.15392 5.20004 0.984349 5.27666 0.859325 5.41305C0.734301 5.54944 0.664063 5.73443 0.664062 5.92731C0.664063 6.1202 0.734301 6.30518 0.859325 6.44157C0.984349 6.57796 1.15392 6.65459 1.33073 6.65459H5.33073V11.0182C5.33073 11.2111 5.40097 11.3961 5.52599 11.5325C5.65102 11.6689 5.82058 11.7455 5.9974 11.7455C6.17421 11.7455 6.34378 11.6689 6.4688 11.5325C6.59382 11.3961 6.66406 11.2111 6.66406 11.0182V6.65459H10.6641C10.8409 6.65459 11.0104 6.57796 11.1355 6.44157C11.2605 6.30518 11.3307 6.1202 11.3307 5.92731C11.3307 5.73443 11.2605 5.54944 11.1355 5.41305C11.0104 5.27666 10.8409 5.20004 10.6641 5.20004Z"
                              fill="#005375"
                            />
                          </svg>
                        </span>
                        <input
                          className="form-check-input mt-0 "
                          type="checkbox"
                          onChange={() => handleCheckboxChange(item?.id)}
                          checked={checkedIds.includes(item?.id)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="flexCheckDefault"
                        >
                          {item?.parent_level?.name}
                        </label>
                      </div>
                    ) : (
                      ''
                    )}
                  </>
                ))}
              </div>
            </div>
            <div
              className="d-flex justify-content-end"
              style={{ position: 'absolute', bottom: '30px', right: '30px' }}
            >
              <div
                className={styles.cancelBtn}
                onClick={() => setOrganizationalPopUp(false)}
              >
                Cancel
              </div>
              <div
                // onClick={() => handleChange(checkedIds)}
                className={styles.applyBtn}
              >
                Apply
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <SuccessPopUpModal
        title="Success!"
        message="Calender Filters is archived."
        modalPopUp={archiveSuccess}
        isNavigate={true}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        redirectPath=""
      />
      <SuccessPopUpModal
        title="Success!"
        message="Calender Filter saved."
        modalPopUp={modalPopUp}
        redirectPath=""
        // onConfirm={() => {}}
        isNavigate={true}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        // onConfirm={() => {}}
      />
      <OrganizationalPopup
        showConfirmation={isPopupVisible}
        value={filterFormData?.organizational_levels}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        favToggle={favToggle}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        showRecruiters
        showDonorCenters
        clear={OLClear}
        pageName={OLPageNames.OC_CALENDER}
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
            <h3>Save as New Favorite</h3>
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

export default CalenderFilters;
