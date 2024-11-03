import React from 'react';
import styles from './index.module.scss';
import SvgComponent from '../SvgComponent.js';
import FormInput from '../form/FormInput.jsx';

const TableScrollList = ({
  handleSort,
  headers,
  data,
  showAllCheckBox = false,
  handleCheckbox,
  checkboxValues = [],
  handleCheckboxValue,
  noDataText = 'No Data Found',
  handleFieldInputChange,
}) => {
  console.log(styles);

  const CheckboxInput = ({ value, ...otherProps }) => (
    <input
      type="checkbox"
      style={{
        height: '15px',
        width: '15px',
      }}
      value={value}
      {...otherProps}
    />
  );

  const renderTableData = () => {
    if (data.length > 0) {
      return data.map((item, rowIndex) => {
        const checkboxValue = handleCheckboxValue && handleCheckboxValue(item);
        return (
          <tr key={rowIndex}>
            {handleCheckbox && (
              <td style={{ width: '7%', paddingLeft: '3%' }} align="center">
                <CheckboxInput
                  name={item.id}
                  value={checkboxValue}
                  checked={checkboxValues?.includes(checkboxValue?.toString())}
                  onChange={handleChecked}
                />
              </td>
            )}

            {headers?.map((header, index) =>
              renderTableField(item, header, index)
            )}
          </tr>
        );
      });
    } else {
      return (
        <tr>
          <td className="no-data opacity-50" colSpan="9">
            {noDataText}
          </td>
        </tr>
      );
    }
  };

  const renderTableField = (item, header, index) => {
    return header.type === 'input_field' ? (
      <div className="mt-3 w-50">
        <FormInput
          value={item[header.name]}
          onChange={(e) => {
            console.log('changed' + e.target.value);
            handleFieldInputChange(item, header.name, e.target.value);
          }}
        />
      </div>
    ) : (
      <td title={item[header.name]} style={{ width: header.width }} key={index}>
        {item[header.name]}
      </td>
    );
  };

  const handleChecked = (e) => {
    // if (!showAllRadioButtonListing) e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case 'all':
        handleCheckbox(
          checkboxValues?.length
            ? []
            : data.map((rowData) => handleCheckboxValue(rowData))
        );
        break;

      default:
        if (checkboxValues?.indexOf(value) === -1) {
          handleCheckbox([...checkboxValues, value]);
        } else {
          handleCheckbox(checkboxValues.filter((row) => row !== value));
        }
        break;
    }
  };

  const renderHeader = () => {
    return (
      <tr>
        {handleCheckbox && (
          <th style={{ width: '7%', paddingLeft: '3%' }} align="center">
            <CheckboxInput
              name="all"
              checked={data?.length && checkboxValues?.length === data?.length}
              onChange={handleChecked}
              hidden={!showAllCheckBox}
            />
          </th>
        )}
        {headers.map((item, index) => {
          return (
            <th style={{ width: item.width }} key={index}>
              {item.label}
              {item.sortable && (
                <span
                  className={styles.sortIcon}
                  onClick={() => {
                    const name = item?.sortBy ? item?.sortBy : item?.name;
                    handleSort(name, item.assigned);
                  }}
                >
                  <SvgComponent name={'SortIcon'} />
                </span>
              )}
            </th>
          );
        })}
      </tr>
    );
  };

  return (
    <div className={styles.tableScrollableBody}>
      <table>
        <thead>{renderHeader()}</thead>
        <tbody>{renderTableData()}</tbody>
      </table>
    </div>
  );
};
export default TableScrollList;
