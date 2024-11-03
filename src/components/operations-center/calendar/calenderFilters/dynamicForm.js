import React, { useEffect } from 'react';
import styles from './index.scss';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes';
import SelectDropdown from '../../../common/selectDropdown';
import OrganizationalDropDown from '../../../common/Organization/DropDown';
import { OrganizationalLevelsContext } from '../../../../Context/OrganizationalLevels';
import { OLPageNames } from '../../../common/Organization/Popup';

const DynamicComponent = ({
  organizationalLevelData,
  eventCategory,
  operationStatus,
  locationOption,
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  productsId,
  setProductsId,
  procedures,
  handleChange,
  setSelectedFilterValues,
  selectedFilterValues,
  setFavToggle,
  paramsFilter,
  setPopupVisible,
  OLLabels,
  setOLLabels,
  setClear,
}) => {
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);
  const bearerToken = localStorage.getItem('token');
  // const [organizationalPopUp, setOrganizationalPopUp] = useState(false);
  useEffect(() => {
    if (paramsFilter) {
      const procedureType = procedures?.find(
        (item) => +item?.value === +paramsFilter?.procedure_type_id
      );
      const product = productsId?.find(
        (item) => +item?.value === +paramsFilter?.product_id
      );

      const status = operationStatus?.find(
        (item) => +item?.value === +paramsFilter?.operation_status_id
      );

      if (
        procedureType ||
        product ||
        status ||
        paramsFilter?.organizational_levels
      ) {
        // Use a single setFilterFormData call to update all fields
        setFilterFormData({
          ...filterFormData,
          procedure_type_id: procedureType?.value || '',
          product_id: product?.value || '',
          operation_status_id: status?.value || '',
          organizational_levels: paramsFilter?.organizational_levels || '',
        });

        // Update selectedFilterValues for each field
        setSelectedFilterValues({
          ...selectedFilterValues,
          procedure_type_id: procedureType || '',
          product_id: product || '',
          operation_status_id: status || '',
          organizational_levels: paramsFilter?.organizational_levels || '',
        });
      }
    }
  }, [
    paramsFilter,
    operationStatus,
    productsId,
    procedures,
    organizationalLevelData,
  ]);

  const dropDownOptions = {
    organizational_levels: organizationalLevelData,
    event_category_id: eventCategory,
    status_id: operationStatus,
    location_id: locationOption,
    products: productsId?.length ? productsId : [],
  };

  const handleSelectChange = (data, name) => {
    const dataValue = data ? data?.value : '';
    if (name === 'procedure_type_id') {
      setFilterFormData({
        ...filterFormData,
        procedure_type_id: dataValue,
        product_id: '',
      });
      setSelectedFilterValues({
        ...selectedFilterValues,
        procedure_type_id: data,
        product_id: '',
      });
    } else {
      setFilterFormData({
        ...filterFormData,
        [name]: dataValue,
      });
      const selected = data ? data : '';
      setSelectedFilterValues({
        ...selectedFilterValues,
        [name]: selected,
      });
    }
    if (name === 'procedure_type_id' && !dataValue) {
      handleChange();
    }
  };

  const fetchProductsById = async (productsId) => {
    try {
      const { data } =
        await API.operationCenter.calender.filters.getProductsById(
          bearerToken,
          productsId
        );
      if (data?.data) {
        const byId = data?.data
          .filter((item) => item?.product_name && item?.product_id)
          .map((item) => ({
            label: item.product_name,
            value: item.product_id,
          }));

        setProductsId(byId?.length ? byId : []);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <form className={styles.donors_centers}>
      <div className="formGroup">
        {/* {filterCodeData ? renderFormFields() : 'Loading...'} */}
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Procedures"
          name="procedure_type_id"
          selectedValue={
            selectedFilterValues?.procedure_type_id
              ? selectedFilterValues?.procedure_type_id
              : null
          }
          disabled={selectedOptions}
          required
          removeDivider
          //   showLabel="Procedures"
          onChange={(data) => {
            fetchProductsById(data?.value);
            handleSelectChange(data, 'procedure_type_id');
          }}
          options={procedures}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Products"
          name="product_id"
          selectedValue={
            selectedFilterValues?.product_id
              ? selectedFilterValues?.product_id
              : ''
          }
          disabled={selectedOptions}
          required
          removeDivider
          //   showLabel="Procedures"
          onChange={(data) => {
            // setProductsId(data?.value);
            handleSelectChange(data, 'product_id');
          }}
          options={dropDownOptions?.products}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Operation Status"
          name="operation_status_id"
          selectedValue={
            selectedFilterValues?.operation_status_id
              ? selectedFilterValues?.operation_status_id
              : null
          }
          disabled={selectedOptions}
          required
          removeDivider
          //   showLabel="Procedures"
          onChange={(data) => {
            handleSelectChange(data, 'operation_status_id');
          }}
          options={operationStatus}
        />
        <OrganizationalDropDown
          labels={OLLabels}
          handleClick={() => setPopupVisible(true)}
          handleClear={() => {
            setFilterFormData({
              ...filterFormData,
              organizational_levels: '',
            });
            setOLLabels('');
            setClear(true);
            clearOLData(OLPageNames.OC_CALENDER);
          }}
        />
      </div>
    </form>
  );
};

export default DynamicComponent;
