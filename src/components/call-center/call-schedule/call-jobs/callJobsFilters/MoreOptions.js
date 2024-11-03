import React from 'react';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import { Col } from 'react-bootstrap';
import SelectDropdown from '../../../../common/selectDropdown';
import styles from './index.scss';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import DateRangeSelector from '../../../DateRangePicker/DateRangeSelector';

const MoreOptions = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  status,
  applyFilter,
  jobType,
  collectionOperationData,
  statusOptions,
  onSelectDate,
}) => {
  const dropDownOptions = {
    Assignation: status,
    job_type: jobType,
    collection_operation: collectionOperationData,
    status: statusOptions,
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

  const handleCollectionOperationChange = (collectionOperation, field) => {
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
  const handleCollectionOperationChangeAll = (data, field) => {
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
              label: options?.find((option) => option?.value == filterValue)
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
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <SelectDropdown
                styles={{ root: 'w-100' }}
                placeholder={field.display_name}
                name={field.name}
                selectedValue={filterValue}
                disabled={selectedOptions}
                required
                removeDivider
                searchable={true}
                options={options}
                showLabel={filterFormData[field.name]}
                onChange={(data) => handleSelectChange(data, field.name)}
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
            const selectedOptionss = options.filter((option) =>
              filterValue.includes(option.id.toString())
            );
            filterValue = selectedOptionss;
          }
          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <GlobalMultiSelect
                data={options}
                selectedOptions={filterValue || []}
                label={field.display_name}
                onChange={(data) =>
                  handleCollectionOperationChange(data, field)
                }
                onSelectAll={(data) =>
                  handleCollectionOperationChangeAll(data, field)
                }
              />
            </Col>
          );
        } else if (field.criteria_type === 'Date_Range') {
          return (
            <Col key={field.id} lg={3} sm={12} xs={12}>
              <DateRangeSelector
                onSelectDate={onSelectDate}
                dateValues={{
                  startDate: filterFormData?.start_date,
                  endDate: filterFormData?.end_date,
                }}
                selectedOptions={selectedOptions}
              />
            </Col>
          );
        }
        return null;
      });
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilter();
    }
  };
  return (
    <form
      className={styles.donors_centers}
      style={{ paddingBottom: 'unset' }}
      onKeyDown={handleKeyPress}
    >
      <div className="formGroup w-100 border-0 p-0 m-0">
        <div className="row row-gap-4 w-100">
          {filterCodeData ? renderFormFields() : 'Loading...'}
        </div>
      </div>
    </form>
  );
};

export default MoreOptions;
