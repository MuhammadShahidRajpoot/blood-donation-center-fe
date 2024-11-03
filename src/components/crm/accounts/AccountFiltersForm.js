import React, { useEffect } from 'react';
import FormInput from '../../system-configuration/users-administration/users/FormInput';
import SelectDropdown from '../../common/selectDropdown';
import styles from './accountView.scss';
import OrganizationalDropdown from '../../common/Organization/DropDown';
import OrganizationalPopup, {
  OLPageNames,
} from '../../common/Organization/Popup';
import { OrganizationalLevelsContext } from '../../../Context/OrganizationalLevels';

import GlobalMultiSelect from '../../common/GlobalMultiSelect';
const AccountFiltersForm = ({
  industryCategoriesData,
  stagesData,
  sourcesData,
  recruitersData,
  territoryData,
  citiesData,
  statesData,
  collectionOperation,
  organizationalLevelData,
  subIndustryCategoriesData,
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  status,
  countyData,
  OLLabels,
  setOLLabels,
  handleFilterApply,
  clear,
  setClear,
}) => {
  const [subIndustryCategories, setsubIndustryCategories] = React.useState([]);
  const [categoryChanged, setCategoryChanged] = React.useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const dropDownOptions = {
    industry_category: industryCategoriesData,
    industry_subcategory: subIndustryCategoriesData,
    stage: stagesData,
    source: sourcesData,
    territory: territoryData,
    organizational_levels: organizationalLevelData,
    staging_facility: organizationalLevelData,
    status: status,
    recruiter: recruitersData,
    city: citiesData,
    state: statesData,
    county: countyData,
  };
  const [isPopupVisible, setPopupVisible] = React.useState();

  const handleOrganizationalLevel = (payload, _, apply) => {
    const jsonStr =
      typeof payload === 'string' ? payload : JSON.stringify(payload);

    setPopupVisible(false);
    setFilterFormData({
      ...filterFormData,
      organizational_levels: jsonStr,
    });
    if (apply && !clear && payload !== '') {
      handleFilterApply({
        organizational_levels: jsonStr,
      });
    }
  };

  const handleClickSubCategories = () => {
    if (
      filterFormData?.['industry_category'] &&
      filterFormData?.['industry_category']?.length > 0
    ) {
      let industry_subcategories = [];
      if (Array.isArray(filterFormData['industry_category'])) {
        industry_subcategories = filterFormData['industry_category']?.map(
          (ele) => {
            let item = dropDownOptions['industry_subcategory'][ele];
            if (item) {
              return item?.map((item) => {
                return { id: parseInt(item.id), name: item.name };
              });
            } else {
              return null;
            }
          }
        );
      }

      let result = industry_subcategories?.flat();
      if (industry_subcategories?.flat()?.includes(null)) {
        result = industry_subcategories?.flat()?.filter((n) => n);
      }
      if (result && filterFormData['industry_subcategory']) {
        let isCheck = result?.map((ele) => {
          return filterFormData['industry_subcategory'].find(
            (sub_cat) => sub_cat?.id === ele
          );
        });
        setFilterFormData((prevData) => ({
          ...prevData,
          industry_subcategory: isCheck.flat()?.filter((n) => n),
        }));
      }
      if (result && result?.length > 0) {
        setsubIndustryCategories(result);
      }
    } else {
      setsubIndustryCategories([]);
    }
    if (
      filterFormData?.['industry_category']?.length === 0 &&
      filterFormData?.['industry_subcategory']
    ) {
      setFilterFormData((prevData) => ({
        ...prevData,
        industry_subcategory: [],
      }));
    }
  };
  const handleMultiSelectChange = (multiSelect, field) => {
    setFilterFormData((prevData) => {
      const updatedArray = (prevData[field.name] || []).includes(
        multiSelect?.id?.toString()
      )
        ? prevData[field.name].filter(
            (item) => item != multiSelect?.id?.toString()
          )
        : [...prevData[field.name], multiSelect?.id?.toString()];

      return {
        ...prevData,
        [field.name]: updatedArray,
      };
    });

    if (field.name == 'industry_category') {
      setCategoryChanged((prev) => !prev);
    }
  };

  useEffect(() => {
    handleClickSubCategories();
  }, [categoryChanged]);

  const handleMultiSelectChangeAll = (data, field) => {
    setFilterFormData((prevData) => ({
      ...prevData,
      [field.name]: data?.map((item) => item?.id?.toString()),
    }));
    if (field.name == 'industry_category') {
      setCategoryChanged((prev) => !prev);
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
    setFilterFormData({
      ...filterFormData,
      [name]: data,
    });
  };

  const renderFormFields = () => {
    return filterCodeData
      .sort((a, b) => a.display_order - b.display_order)
      ?.map((field) => {
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
              styles={{ root: 'w-100' }}
              placeholder={field.display_name}
              name={field.name}
              selectedValue={filterValue}
              searchable={true}
              required
              removeDivider
              showLabel={filterFormData[field.name]}
              onChange={(data) => handleSelectChange(data, field.name)}
              options={options}
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
                clearOLData(OLPageNames.CRM_ACCOUNTS);
              }}
            />
          );
        } else if (field.criteria_type === 'Free_Text') {
          return (
            <FormInput
              key={field.id}
              label={field.display_name}
              name={field.name}
              isWidth={true}
              value={filterFormData[field.name]}
              onChange={handleInputChange}
            />
          );
        } else if (field.criteria_type === 'Multi_Value') {
          let options = dropDownOptions[field.name];
          let filterValue = filterFormData[field.name];
          if (filterValue && Array.isArray(filterValue)) {
            const selectedOptionss =
              field.name === 'industry_subcategory'
                ? subIndustryCategories.filter((option) =>
                    filterValue.includes(option?.id?.toString())
                  )
                : options.filter((option) =>
                    filterValue.includes(option?.id?.toString())
                  );
            filterValue = selectedOptionss;
          }
          if (filterValue?.includes('NULL')) {
            filterValue = '';
          }
          return (
            <GlobalMultiSelect
              key={field.id}
              data={
                field.name === 'industry_subcategory'
                  ? subIndustryCategories
                  : options
              }
              searchable={
                field.name === 'county' ||
                field.name === 'state' ||
                field.name === 'city'
              }
              selectedOptions={filterValue || []}
              label={field.display_name}
              onChange={(data) => handleMultiSelectChange(data, field)}
              onSelectAll={(data) => handleMultiSelectChangeAll(data, field)}
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
        pageName={OLPageNames.CRM_ACCOUNTS}
      />
    </form>
  );
};

export default AccountFiltersForm;
