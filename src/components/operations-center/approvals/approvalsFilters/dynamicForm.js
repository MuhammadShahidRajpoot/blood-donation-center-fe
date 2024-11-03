import React, { useState } from 'react';
import SelectDropdown from '../../../common/selectDropdown';
import styles from './index.scss';
import Styles from './index.module.scss';
import OrganizationalDropDown from '../../../common/Organization/DropDown';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import { OrganizationalLevelsContext } from '../../../../Context/OrganizationalLevels';
import { OLPageNames } from '../../../common/Organization/Popup';
const initialDate = {
  startDate: null,
  endDate: null,
};

const DynamicComponent = ({
  filterCodeData,
  setFilterFormData,
  filterFormData,
  selectedOptions,
  managersData,
  requestersData,
  dateRange,
  setDateRange,
  operationDateRange,
  setOperationDateRange,
  setPopupVisible,
  OLLabels,
  setOLLabels,
  setClear,
}) => {
  const [dateCrossColor, setDateCrossColor] = useState('#cccccc');
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const operationTypeEnum = [
    {
      label: PolymorphicType.OC_OPERATIONS_DRIVES,
      value: '1',
    },
    {
      label: PolymorphicType.OC_OPERATIONS_SESSIONS,
      value: '2',
    },
    {
      label: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
      value: '3',
    },
  ];
  const requestTypeEnum = [
    {
      label: 'Marketing Update',
      value: '2',
    },
    {
      label: 'Third Rail Field',
      value: '1',
    },
  ];
  const requestStatusEnum = [
    {
      label: 'Pending',
      value: '1',
    },
    {
      label: 'Resolved',
      value: '2',
    },
  ];
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
    const startDateFormatted = value.startDate
      ? `${moment(value.startDate).format('YYYY-MM-DD')},`
      : '';
    const endDateFormatted = value.endDate
      ? moment(value.endDate).format('YYYY-MM-DD')
      : '';

    const newValue = `${startDateFormatted}${endDateFormatted}`;

    setFilterFormData({
      ...filterFormData,
      request_date: newValue,
    });
  };
  const handleOperationDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setOperationDateRange(value);

    const startDateFormatted = value.startDate
      ? `${moment(value.startDate).format('YYYY-MM-DD')},`
      : '';
    const endDateFormatted = value.endDate
      ? moment(value.endDate).format('YYYY-MM-DD')
      : '';

    const newValue = `${startDateFormatted}${endDateFormatted}`;

    setFilterFormData({
      ...filterFormData,
      operation_date: newValue,
    });
  };

  const handleSelectChange = (data, name) => {
    const dataValue = data ? data : '';
    setFilterFormData({
      ...filterFormData,
      [name]: dataValue,
    });
  };
  const handleOrganizationalLevel = (payload) => {
    setPopupVisible(false);
    setFilterFormData({
      ...filterFormData,
      organizational_levels:
        typeof payload === 'string' ? payload : JSON.stringify(payload),
    });
  };

  return (
    <form className={styles.donors_centers}>
      <div className="formGroup">
        <div className={`${Styles.FieldDate}`}>
          <DatePicker
            dateFormat="MM/dd/yyyy"
            className=" custom-datepicker "
            selected={dateRange.startDate}
            onChange={handleDateChange}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            selectsRange
            placeholderText="Request Date Range"
            disabled={selectedOptions}
          />
          {(dateRange?.startDate || dateRange?.endDate) && (
            <span
              className={`position-absolute ${Styles.dateCross}`}
              onClick={() => {
                setDateRange(initialDate);
              }}
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 20 20"
                aria-hidden="true"
                focusable="false"
                className="css-tj5bde-Svg"
                onMouseEnter={() => setDateCrossColor('#999999')}
                onMouseLeave={() => setDateCrossColor('#cccccc')}
              >
                <path
                  fill={dateCrossColor}
                  d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                ></path>
              </svg>
            </span>
          )}
          {(dateRange?.startDate || dateRange?.endDate) && (
            <label>Request Date Range</label>
          )}
        </div>

        <div className={`${Styles.FieldDate}`}>
          <DatePicker
            dateFormat="MM/dd/yyyy"
            className=" custom-datepicker "
            selected={operationDateRange.startDate}
            onChange={handleOperationDateChange}
            startDate={operationDateRange.startDate}
            endDate={operationDateRange.endDate}
            selectsRange
            placeholderText="Operation Date Range"
            disabled={selectedOptions}
          />
          {(operationDateRange?.startDate || operationDateRange?.endDate) && (
            <span
              className={`position-absolute ${Styles.dateCross}`}
              onClick={() => {
                setOperationDateRange(initialDate);
              }}
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 20 20"
                aria-hidden="true"
                focusable="false"
                className="css-tj5bde-Svg"
                onMouseEnter={() => setDateCrossColor('#999999')}
                onMouseLeave={() => setDateCrossColor('#cccccc')}
              >
                <path
                  fill={dateCrossColor}
                  d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                ></path>
              </svg>
            </span>
          )}
          {(operationDateRange?.startDate || operationDateRange?.endDate) && (
            <label>Operation Date Range</label>
          )}
        </div>
        <OrganizationalDropDown
          labels={OLLabels}
          handleClick={() => setPopupVisible(true)}
          handleClear={() => {
            handleOrganizationalLevel('');
            setFilterFormData({
              ...filterFormData,
              organizational_levels: '',
            });
            setPopupVisible(false);
            setOLLabels('');
            setClear(true);
            clearOLData(OLPageNames.OC_APPROVALS);
          }}
          disabled={selectedOptions}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Operation Type"
          name="operation_type"
          selectedValue={
            filterFormData.operation_type.value
              ? filterFormData.operation_type
              : null
          }
          disabled={selectedOptions}
          // required
          removeDivider
          showLabel
          onChange={(data) => {
            // fetchProductsById(data);
            handleSelectChange(data, 'operation_type');
          }}
          options={operationTypeEnum.map((option) => ({
            label: option.label,
            value: option.label,
          }))}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Request Type"
          name="request_type"
          selectedValue={
            filterFormData.request_type.value
              ? filterFormData.request_type
              : null
          }
          disabled={selectedOptions}
          required
          removeDivider
          showLabel
          onChange={(data) => {
            // setProductsId(data?.value);
            handleSelectChange(data, 'request_type');
          }}
          options={requestTypeEnum.map((option) => ({
            label: option.label,
            value: option.label,
          }))}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Requestor"
          // defaultValue={null}
          selectedValue={
            filterFormData.requestor?.value ? filterFormData.requestor : null
          }
          removeDivider
          name="requestor"
          showLabel
          //   selectedValue={filterValue}
          disabled={selectedOptions}
          // required
          onChange={(data) => {
            handleSelectChange(data, 'requestor');
          }}
          options={requestersData}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Manager"
          name="manager"
          selectedValue={
            filterFormData.manager?.value ? filterFormData.manager : null
          }
          disabled={selectedOptions}
          // required
          removeDivider
          showLabel
          onChange={(data) => {
            handleSelectChange(data, 'manager');
          }}
          options={managersData}
        />
        <SelectDropdown
          styles={{ root: 'w-100' }}
          placeholder="Request Status"
          name="request_status"
          selectedValue={
            filterFormData.request_status.value
              ? filterFormData.request_status
              : null
          }
          disabled={selectedOptions}
          // required
          removeDivider
          showLabel
          onChange={(data) => {
            handleSelectChange(data, 'request_status');
          }}
          options={requestStatusEnum.map((option) => ({
            label: option.label,
            value: option.label,
          }))}
        />
      </div>
    </form>
  );
};

export default DynamicComponent;
