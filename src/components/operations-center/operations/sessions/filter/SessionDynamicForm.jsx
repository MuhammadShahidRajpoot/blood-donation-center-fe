import React from 'react';
import FormInput from '../../../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';
import styles from './index.scss';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../../common/Organization/Popup';
import OrganizationalDropdown from '../../../../common/Organization/DropDown';
import DatePicker from '../../../../common/DatePicker';
import { OrganizationalLevelsContext } from '../../../../../Context/OrganizationalLevels';

const DynamicForm = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  status,
  promotions,
  OLLabels,
  setOLLabels,
  handleFilterApply,
  clear,
  setClear,
}) => {
  const [isPopupVisible, setPopupVisible] = React.useState();
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const options = {
    status_id: status,
    promotion_id: promotions,
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
        if (field.name === 'organizational_levels') {
          return (
            <OrganizationalDropdown
              key={field.id}
              labels={OLLabels}
              handleClick={() => setPopupVisible(true)}
              handleClear={() => {
                handleOrganizationalLevel('');
                setClear(true);
                setOLLabels('');
                clearOLData(OLPageNames.OC_SESSIONS);
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
              enableTabLoop={false}
            />
          );
        } else if (field.criteria_type === 'Multi_Value') {
          const objs = options[field.name].map((opt) => ({
            label: opt.name,
            value: opt.id,
          }));
          return (
            <SelectDropdown
              key={field.id}
              styles={{ root: 'w-100' }}
              placeholder={field.display_name}
              name={field.name}
              selectedValue={objs.filter(
                (opt) =>
                  opt.value === filterFormData[field.name]?.value ||
                  opt.value === filterFormData[field.name]
              )}
              options={objs}
              disabled={selectedOptions}
              removeDivider
              showLabel={filterFormData[field.name]}
              onChange={(data) => handleSelectChange(data, field.name)}
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
        value={filterFormData?.['organizational_levels']}
        showConfirmation={isPopupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        showDonorCenters
        clear={clear}
        pageName={OLPageNames.OC_SESSIONS}
      />
    </form>
  );
};

export default DynamicForm;
