import React from 'react';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';
import styles from './index.scss';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../../common/Organization/Popup';
import OrganizationalDropdown from '../../../../common/Organization/DropDown';
import { OrganizationalLevelsContext } from '../../../../../Context/OrganizationalLevels';

const DynamicComponent = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  status,
  applyFilter,
  accounts,
  citiesData,
  statesData,
  countyData,
  OLLabels,
  setOLLabels,
  handleFilterApply,
  clear,
  setClear,
}) => {
  const [isPopupVisible, setPopupVisible] = React.useState();
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const dropDownOptions = {
    status: status,
    account: accounts,
    city: citiesData,
    state: statesData,
    county: countyData,
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
        if (
          field.criteria_type === 'Single_Value' &&
          field.name !== 'organizational_levels'
        ) {
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
              options={options}
              styles={{ root: 'w-100' }}
              placeholder={field.display_name}
              name={field.name}
              selectedValue={filterValue}
              disabled={selectedOptions}
              required
              removeDivider
              searchable={true}
              showLabel={filterFormData[field.name]}
              onChange={(data) => handleSelectChange(data, field.name)}
            />
          );
        } else if (
          field.criteria_type === 'Single_Value' &&
          field.name === 'organizational_levels'
        ) {
          return (
            <OrganizationalDropdown
              labels={OLLabels}
              key={field.id}
              handleClick={() => setPopupVisible(true)}
              handleClear={() => {
                handleOrganizationalLevel('');
                setOLLabels('');
                setClear(true);
                clearOLData(OLPageNames.CRM_VOLUNTEERS);
              }}
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
              filterValue.includes(option.id.toString())
            );
            filterValue = selectedOptionss;
          }
          return (
            <GlobalMultiSelect
              key={field.id}
              data={options}
              searchable={
                field.name === 'county' ||
                field.name === 'state' ||
                field.name === 'city'
              }
              selectedOptions={filterValue || []}
              label={field.display_name}
              onChange={(data) => handleCollectionOperationChange(data, field)}
              onSelectAll={(data) =>
                handleCollectionOperationChangeAll(data, field)
              }
            />
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
    <form className={styles.donors_centers} onKeyDown={handleKeyPress}>
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
        pageName={OLPageNames.CRM_VOLUNTEERS}
      />
    </form>
  );
};

export default DynamicComponent;
