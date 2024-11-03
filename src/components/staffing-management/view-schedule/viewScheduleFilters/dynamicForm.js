import React from 'react';
import FormInput from '../../../system-configuration/users-administration/users/FormInput';
import { Col } from 'react-bootstrap';
import SelectDropdown from '../../../common/selectDropdown';
import Styles from './index.scss';
import GlobalMultiSelect from '../../../common/GlobalMultiSelect';
import ReactDatePicker from 'react-datepicker';

const ViewScheduleDynamicForm = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  schedule_start_date,
  scheduleStatuses,
  teams,
  donorCenters,
  collectionOperations,
  staff,
}) => {
  const dropDownOptions = {
    schedule_start_date: schedule_start_date,
    collection_operation_ids: collectionOperations,
    team_ids: teams,
    donor_center_ids: donorCenters,
    staff_ids: staff,
    status: scheduleStatuses,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData({
      ...filterFormData,
      [name]: value,
    });
  };

  const handleSelectChange = (data, name) => {
    const dataValue = data ? data.value : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };

  const handleDataChange = (data, field) => {
    setFilterFormData((prevData) => ({
      ...prevData,
      [field.name]: (prevData[field.name] || []).some(
        (item) => item.id === data.id
      )
        ? (prevData[field.name] || []).filter((item) => item.id !== data.id)
        : [...prevData[field.name], data],
    }));
  };

  const handleDataChangeAll = (data, field) => {
    setFilterFormData((prevData) => ({
      ...prevData,
      [field.name]: data,
    }));
  };

  const handleDateChange = (date, fieldName) => {
    if (!date) {
      setFilterFormData((prevData) => ({
        ...prevData,
        [fieldName]: '',
      }));
    } else {
      const formattedDate = date instanceof Date ? date : new Date(date);

      setFilterFormData((prevData) => ({
        ...prevData,
        [fieldName]: formattedDate,
      }));
    }
  };

  const renderFormFields = () => {
    return filterCodeData
      .sort((a, b) => a.display_order - b.display_order)
      .map((field) => {
        if (field.criteria_type === 'Single_Value') {
          const options = dropDownOptions[field.name];
          let filter = filterFormData[field.name]
            ? filterFormData[field.name]
            : '';
          if (filter) {
            filter = {
              label: options.find(
                (option) => parseInt(option.value) === parseInt(filter)
              ).label,
              value: parseInt(filter),
            };
          }

          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <SelectDropdown
                styles={{ root: 'w-100' }}
                placeholder={field.display_name}
                name={field.name}
                selectedValue={filter}
                disabled={selectedOptions}
                required
                removeDivider
                showLabel={filterFormData[field.name]}
                onChange={(data) => handleSelectChange(data, field.name)}
                options={options}
              />
            </Col>
          );
        } else if (field.criteria_type === 'Free_Text') {
          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <FormInput
                label={field.display_name}
                name={field.name}
                required={false}
                isWidth={true}
                value={filterFormData[field.name]}
                onChange={handleInputChange}
                disabled={selectedOptions}
              />
            </Col>
          );
        } else if (field.criteria_type === 'Multi_Value') {
          const options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          const isSimpleArray = (arr) => {
            return arr.every((item) => typeof item !== 'object');
          };
          if (filterValue && isSimpleArray(filterValue)) {
            const selectedOptions = options.filter((option) =>
              filterValue.includes(option?.id?.toString())
            );
            filterValue = selectedOptions;
          }
          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <GlobalMultiSelect
                data={options}
                selectedOptions={filterValue || []}
                label={field.display_name}
                onChange={(data) => handleDataChange(data, field)}
                onSelectAll={(data) => handleDataChangeAll(data, field)}
                disabled={selectedOptions}
              />
            </Col>
          );
        } else if (field.criteria_type === 'Date_Range') {
          const selectedDate = filterFormData[field.name]
            ? filterFormData[field.name] instanceof Date
              ? filterFormData[field.name]
              : ''
            : '';
          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <ReactDatePicker
                className="custom-datepicker"
                label={field.display_name}
                name={field.name}
                placeholderText="Schedule Start Date"
                selected={selectedDate}
                onChange={(date) => handleDateChange(date, field.name)}
                isClearable={!selectedOptions && selectedDate}
                disabled={selectedOptions}
                onKeyDown={(e) => {
                  e.preventDefault();
                }}
              />
            </Col>
          );
        }
        return null;
      });
  };

  return (
    <form
      className={Styles.viewScheduleFiltersForm}
      style={{ paddingBottom: 'unset' }}
    >
      <div className="formGroup w-100 border-0 p-0 m-0">
        <div className="row row-gap-2 w-100">
          {filterCodeData ? renderFormFields() : 'Loading...'}
        </div>
      </div>
    </form>
  );
};

export default ViewScheduleDynamicForm;
