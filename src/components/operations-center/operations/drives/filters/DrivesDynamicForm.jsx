import React from 'react';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';
import styles from './index.scss';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../../common/Organization/Popup';
import OrganizationalDropdown from '../../../../common/Organization/DropDown';
import DatePicker from '../../../../common/DatePicker';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import { OrganizationalLevelsContext } from '../../../../../Context/OrganizationalLevels';

const DynamicForm = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  status,
  promotions,
  accounts,
  locations,
  operationStatus,
  OLLabels,
  setOLLabels,
  handleFilterApply,
  clear,
  setClear,
}) => {
  // const [IsRefresh, setIsRefresh] = React.useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);
  const days = [
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
    { id: 7, name: 'Sunday' },
  ];

  const startBefore = Array.from({ length: 24 }, (_, i) => {
    const hour = (i % 12 || 12).toString();
    const ampm = i < 12 ? 'AM' : 'PM';
    const time = `${hour}:00 ${ampm}`;

    return { value: i + 1, label: time };
  });
  const dropDownOptions = {
    collection_operation: [],
    business_unit: [],
    location: locations,
    organizational_levels: [],
    day: days,
    status: [],
    account: accounts,
    recruiter: [],
    start_time: startBefore,
    end_time: startBefore,
    site_type: [],
  };
  const [isPopupVisible, setPopupVisible] = React.useState();

  const options = {
    status: operationStatus,
    promotion: promotions,
    day: days,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({
      ...filterFormData,
      [name]: value,
    });
  };

  const handleSelectChange = (data, name) => {
    const dataValue = data ? data : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };

  const handleCollectionOperationChangeAll = (data, name) => {
    // setCollectionOperations(data);

    setFilterFormData({
      ...filterFormData,
      [name]: data,
    });
    // setIsRefresh((prev) => !prev);
  };
  const handleCollectionOperationChange = (collectionOperation, field) => {
    setFilterFormData((prevData) => {
      const currentArray = Array.isArray(prevData[field.name])
        ? prevData[field.name]
        : [];

      const updatedArray = currentArray.some(
        (item) => item.id === collectionOperation.id
      )
        ? currentArray.filter((item) => item.id !== collectionOperation.id)
        : [...currentArray, collectionOperation];

      return {
        ...prevData,
        [field.name]: updatedArray,
      };
    });
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

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilterFormData((prevData) => ({
      ...prevData,
      start_date: start,
      end_date: end,
    }));
  };

  const renderFormFields = () => {
    return filterCodeData
      .sort((a, b) => a.display_order - b.display_order)
      .map((field) => {
        if (
          field.criteria_type === 'Single_Value' &&
          field.name !== 'organizational_levels'
        ) {
          const options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          if (filterValue && typeof filterValue !== 'object') {
            filterValue = {
              label: options.find((option) => option.value == filterValue)
                .label,
              value: filterValue,
            };
          }
          if (filterValue && Array.isArray(filterValue)) {
            filterValue = {
              label: options.find((option) => option.value == filterValue[0])
                .label,
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
              searchable={true}
              required
              removeDivider
              showLabel={filterFormData[field.name]}
              onChange={(data) => handleSelectChange(data, field.name)}
              options={options}
            />
          );
        } else if (field.name === 'organizational_levels') {
          return (
            <OrganizationalDropdown
              key={field.id}
              labels={OLLabels}
              handleClick={() => setPopupVisible(true)}
              handleClear={() => {
                handleOrganizationalLevel('');
                setOLLabels('');
                setClear(true);
                clearOLData(OLPageNames.OC_DRIVES);
              }}
              disabled={selectedOptions}
            />
          );
        } else if (field.name === 'start_date') {
          return (
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
              isClearable={!selectedOptions}
            />
          );
        } else if (field.criteria_type === 'Multi_Value') {
          let opt = options[field.name];
          let filterValue = filterFormData[field.name];
          const isSimpleArray = (arr) => {
            return arr.every((item) => typeof item !== 'object');
          };
          if (
            filterValue &&
            isSimpleArray(filterValue) &&
            field.name !== 'industry_subcategory'
          ) {
            const selectedOptionss = opt.filter((option) =>
              filterValue.includes(option?.id?.toString())
            );
            filterValue = selectedOptionss;
          }
          return (
            <GlobalMultiSelect
              key={field.id}
              data={opt}
              selectedOptions={filterValue || []}
              label={field.display_name}
              name={field.name}
              onChange={(data) => handleCollectionOperationChange(data, field)}
              onSelectAll={(data) =>
                handleCollectionOperationChangeAll(data, field?.name)
              }
              // disabled={
              //   field.name === 'industry_subcategory' &&
              //   !filterFormData['industry_category']
              //     ? true
              //     : false
              // }
            />
          );
        } else if (field.criteria_type === 'Free_Text') {
          return (
            <FormInput
              key={field.id}
              type="number"
              label={field.display_name}
              name={field.name}
              required={false}
              isWidth={true}
              value={filterFormData[field.name]}
              onChange={handleInputChange}
              disabled={selectedOptions}
            />
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
        showRecruiters
        clear={clear}
        pageName={OLPageNames.OC_DRIVES}
      />
    </form>
  );
};

export default DynamicForm;
