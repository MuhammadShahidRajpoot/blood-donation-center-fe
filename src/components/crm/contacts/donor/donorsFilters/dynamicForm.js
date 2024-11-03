import React from 'react';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';
import styles from './index.scss';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import DatePicker from '../../../../common/DatePicker';
const DynamicComponent = ({
  bloodGroupData,
  groupCodeData,
  centerCodeData,
  assertionCodeData,
  filterCodeData,
  setFilterFormData,
  filterFormData,
  applyFilters,
  selectedOptions,
  citiesData,
  statesData,
  countiesData,
}) => {
  const dropDownOptions = {
    blood_group: bloodGroupData,
    group_code: groupCodeData,
    center_code: centerCodeData,
    assertions: assertionCodeData,
    city: citiesData,
    state: statesData,
    county: countiesData,
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({
      ...filterFormData,
      [name]: value,
    });
  };

  const handleDateChange = (data, name) => {
    const [start, end] = data;
    if (start === null && end === null) {
      setFilterFormData({
        ...filterFormData,
        [name]: '',
      });
    } else {
      const newDateRange = { startDate: start, endDate: end };
      setFilterFormData({
        ...filterFormData,
        [name]: newDateRange,
      });
    }
  };

  const handleSelectChange = (data, name) => {
    const dataValue = data ? data : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };

  const handleChange = (collectionOperation, field) => {
    setFilterFormData((prevData) => {
      const updatedArray = (prevData[field.name] || []).includes(
        collectionOperation?.id?.toString()
      )
        ? prevData[field.name].filter(
            (item) => item != collectionOperation?.id?.toString()
          )
        : [...prevData[field.name], collectionOperation?.id?.toString()];

      return {
        ...prevData,
        [field.name]: updatedArray,
      };
    });
  };
  const handleChangeAll = (data, field) => {
    setFilterFormData((prevData) => ({
      ...prevData,
      [field.name]: data.map((item) => item?.id?.toString()),
    }));
  };

  const renderFormFields = () => {
    return filterCodeData
      .sort((a, b) => a.display_order - b.display_order)
      .map((field) => {
        if (field.criteria_type === 'Single_Value') {
          const options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          if (filterValue && typeof filterValue !== 'object') {
            filterValue = {
              label: options.find((option) => option.value == filterValue)
                ?.label,
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
              required
              removeDivider
              showLabel={filterFormData[field.name]}
              onChange={(data) => handleSelectChange(data, field.name)}
              options={options}
            />
          );
        } else if (field.criteria_type === 'Free_Text') {
          return (
            <FormInput
              key={field.id}
              label={field.display_name}
              name={field.name}
              required={false}
              isWidth={true}
              value={filterFormData[field.name]}
              onChange={handleInputChange}
            />
          );
        } else if (field.criteria_type === 'Multi_Value') {
          const options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          const isSimpleArray = (arr) => {
            return arr.every((item) => typeof item !== 'object');
          };
          if (filterValue && isSimpleArray(filterValue)) {
            const selectedOptionss = options.filter((option) =>
              filterValue.includes(option?.id?.toString())
            );
            filterValue = selectedOptionss;
          }
          return (
            <GlobalMultiSelect
              key={field.id}
              searchable={
                field.name === 'group_code' ||
                field.name === 'center_code' ||
                field.name === 'assertions' ||
                field.name === 'blood_group' ||
                field.name === 'state' ||
                field.name === 'city' ||
                field.name === 'county'
                  ? true
                  : false
              }
              data={options}
              selectedOptions={filterValue || []}
              label={field.display_name}
              onChange={(data) => handleChange(data, field)}
              onSelectAll={(data) => handleChangeAll(data, field)}
            />
          );
        } else if (field.criteria_type === 'date') {
          const dateRange = filterFormData[field.name];
          const startDate = dateRange?.startDate
            ? new Date(dateRange?.startDate)
            : null;
          const endDate = dateRange?.endDate
            ? new Date(dateRange?.endDate)
            : null;
          return (
            <DatePicker
              key={field.id}
              placeholderText={field.display_name}
              selected={startDate}
              startDate={startDate}
              endDate={endDate}
              name={field.name}
              required={false}
              onChange={(data) => handleDateChange(data, field.name)}
              selectsRange={true}
            />
          );
        }
        return null;
      });
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilters();
    }
  };
  return (
    <form className={styles.donors_centers} onKeyDown={handleKeyPress}>
      <div className="formGroup">
        {filterCodeData ? renderFormFields() : 'Loading...'}
      </div>
    </form>
  );
};

export default DynamicComponent;
