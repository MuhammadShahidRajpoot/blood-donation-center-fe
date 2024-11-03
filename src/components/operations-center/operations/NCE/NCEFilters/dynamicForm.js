import React from 'react';
import styles from './index.scss';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';
import DatePicker from '../../../../common/DatePicker';
import { API } from '../../../../../api/api-routes';
import { toast } from 'react-toastify';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../../common/Organization/Popup';
import OrganizationalDropdown from '../../../../common/Organization/DropDown';
import { OrganizationalLevelsContext } from '../../../../../Context/OrganizationalLevels';

const DynamicComponent = ({
  organizationalLevelData,
  eventCategory,
  operationStatus,
  locationOption,
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  eventSubCategory,
  setEventSubCategory,
  OLLabels,
  setOLLabels,
  handleFilterApply,
  clear,
  setClear,
  initialState,
  setInitialState,
}) => {
  const [isPopupVisible, setPopupVisible] = React.useState();
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const bearerToken = localStorage.getItem('token');
  const dropDownOptions = {
    organizational_levels: organizationalLevelData,
    event_category_id: eventCategory,
    status_id: operationStatus,
    location_id: locationOption,
    event_subcategory_id: eventSubCategory,
  };

  const handleOrganizationalLevel = (payload, _, apply) => {
    const jsonStr =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    setPopupVisible(false);
    setFilterFormData({
      ...filterFormData,
      organizational_levels: jsonStr,
    });
    if (apply && !clear && payload !== '') {
      handleFilterApply({ organizational_levels: jsonStr });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({
      ...filterFormData,
      [name]: value,
    });
  };
  const handleSelectChange = (data, name) => {
    const dataValue = data ? data?.value : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilterFormData((prevData) => ({
      ...prevData,
      start_date: start,
      end_date: end,
    }));
  };

  const getEventSubCategory = async (eventCategory) => {
    try {
      const { data } = await API.nonCollectionProfiles.eventSubCategory.getAll(
        bearerToken,
        eventCategory,
        true
      );
      const eventSubCategoryData = data?.data?.map((item) => {
        return {
          label: item?.name,
          value: item?.id,
        };
      });
      setEventSubCategory(eventSubCategoryData);
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };
  const renderFormFields = () => {
    return filterCodeData
      .sort((a, b) => a.display_order - b.display_order)
      .map((field, item) => {
        if (
          field.criteria_type === 'Single_Value' &&
          field.name !== 'organizational_levels'
        ) {
          let options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          if (filterValue && typeof filterValue !== 'object') {
            filterValue = {
              label:
                options?.find((option) => option.value == filterValue)?.label ??
                '',
              value: filterValue,
            };
          }
          if (filterValue && Array.isArray(filterValue)) {
            filterValue = {
              label: options.find((option) => option.value == filterValue[0])
                ?.label,
              value: filterValue,
            };
          }
          return (
            <SelectDropdown
              key={field.id}
              styles={{ root: 'w-100' }}
              placeholder={field.display_name}
              name={field.name}
              selectedValue={filterValue}
              disabled={selectedOptions}
              required
              removeDivider
              showLabel={filterFormData[field.name]}
              onChange={(data) => {
                if (field.name == 'event_category_id') {
                  getEventSubCategory(data?.value);
                  handleSelectChange(data, field.name);
                } else {
                  handleSelectChange(data, field.name);
                }
              }}
              options={options}
            />
          );
        } else if (
          field.criteria_type === 'Single_Value' &&
          field.name === 'organizational_levels'
        ) {
          return (
            <OrganizationalDropdown
              key={field.id}
              labels={OLLabels}
              handleClick={() => setPopupVisible(true)}
              handleClear={() => {
                handleOrganizationalLevel('');
                setOLLabels('');
                setClear(true);
                clearOLData(OLPageNames.OC_NCE);
              }}
            />
          );
        } else if (field.criteria_type === 'Free_Text') {
          return (
            <FormInput
              key={field.id}
              label={field.display_name}
              name={field.name}
              required
              isWidth={true}
              value={filterFormData[field.name]}
              onChange={handleInputChange}
              disabled={selectedOptions}
            />
          );
        } else if (field?.name === 'start_date') {
          return (
            <div key={item} className="form-field">
              <div className={`field`}>
                <DatePicker
                  key={field.id}
                  name={field.name}
                  placeholderText={'Date Range'}
                  selected={filterFormData['start_date']}
                  startDate={filterFormData['start_date']}
                  endDate={filterFormData['end_date']}
                  onChange={handleDateChange}
                  selectsRange
                  disabled={selectedOptions}
                  isClearable={filterFormData['start_date'] ? true : false}
                />
              </div>
            </div>
          );
        }
        return null;
      });
  };
  return (
    <form className={styles.donors_centers}>
      <div className="formGroup">
        {filterCodeData ? renderFormFields() : 'Loading...'}
      </div>
      <OrganizationalPopup
        value={filterFormData?.organizational_levels}
        showConfirmation={isPopupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        clear={clear}
        pageName={OLPageNames.OC_NCE}
        initialState={initialState}
        setInitialState={setInitialState}
      />
    </form>
  );
};

export default DynamicComponent;
