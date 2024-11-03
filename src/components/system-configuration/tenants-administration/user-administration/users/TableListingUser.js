import React, { useEffect, useState } from 'react';
// import SvgComponent from '../common/SvgComponent';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import SvgComponent from '../../../../common/SvgComponent';
// import './index.scss';
import CheckBoxFilterClosed from '../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../assets/images/checkbox-filter-open.png';
import Dropdown from 'react-bootstrap/Dropdown';
import { truncateTo50 } from '../../../../../helpers/utils';
const TableList = ({
  isLoading,
  data,
  headers,
  handleSort,
  optionsConfig,
  setTableHeaders,
  enableColumnHide,
  showActionsLabel,
}) => {
  const navigate = useNavigate();
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);

  useEffect(() => {
    if (enableColumnHide && headers && headers.length) {
      const defaultHidden = headers
        .map((h) => (h.defaultHidden ? h.name : null))
        .filter((h) => h);
      setColumnList(defaultHidden);
    }
  }, [enableColumnHide, headers]);

  const handleColumnCheckbox = (e, label) => {
    let defaultHidden = columnList;
    if (e.target.checked) {
      defaultHidden = defaultHidden.filter((h) => h !== label);
    } else {
      defaultHidden = [...defaultHidden, label];
    }
    setColumnList(defaultHidden);
  };

  const setDropdown = () => {
    setShowColumnToggle(!showColumnToggle);
  };

  const renderOptions = (rowData, index) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          onClick={() => {
            setToggleZindex(index);
          }}
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        <ul className="dropdown-menu">
          {optionsConfig.map((option) => {
            if (option?.disabled && option.disabled(rowData)) return null;
            return (
              <li key={option.label}>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    if (option.path) {
                      const path = option.path(rowData);
                      navigate(path);
                    } else if (option.action) {
                      option.action(rowData);
                    }
                  }}
                  href="#"
                >
                  {option.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped hasOptions">
          <thead>
            <tr>
              {_.compact(headers).map((header) => (
                <th
                  key={header.name}
                  // width={header.width}
                  // style={{ minWidth: '20px', maxWidth: header.maxWidth }}
                  align="center"
                  className={`
                ${header.headerclassName ? header.headerclassName : ''} ${
                  columnList.includes(header.name) ? 'd-none' : ''
                }`}
                >
                  <div className="inliner">
                    <span className="title">{header.label}</span>
                    {header.sortable && (
                      <div
                        className="sort-icon"
                        onClick={() => {
                          handleSort(header.name);
                        }}
                      >
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              <th width="150px" align="center" style={{ zIndex: 11 }}>
                {showActionsLabel ? (
                  <div className="inliner justify-content-center">
                    <span className="title">Actions</span>
                  </div>
                ) : null}
                {enableColumnHide ? (
                  <div className="flex align-items-center justify-content-center">
                    <div className="account-list-header dropdown-center ">
                      <Dropdown show={showColumnToggle} onToggle={setDropdown}>
                        <Dropdown.Toggle
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 'unset',
                            margin: 'unset',
                          }}
                          onClick={setDropdown}
                        >
                          {showColumnToggle ? (
                            <img
                              src={CheckBoxFilterOpen}
                              style={{ width: '18px', height: '16px' }}
                            />
                          ) : (
                            <img
                              src={CheckBoxFilterClosed}
                              style={{ width: '18px', height: '16px' }}
                            />
                          )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: '140px' }} align={'end'}>
                          {headers.map((option, index) => (
                            <li key={index}>
                              <div className="flex align-items-center gap-2 checkboxInput">
                                <input
                                  type="checkbox"
                                  value={option.name}
                                  checked={!columnList.includes(option.name)}
                                  style={{
                                    height: '20px',
                                    width: '20px',
                                    borderRadius: '4px',
                                  }}
                                  id={'columnHideHeader' + index}
                                  onChange={(e) =>
                                    handleColumnCheckbox(e, option.name)
                                  }
                                />
                                <label htmlFor={'columnHideHeader' + index}>
                                  {option.label}
                                </label>
                              </div>
                            </li>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="no-data" colSpan={headers.length + 1}>
                  Data Loading
                </td>
              </tr>
            ) : data?.length ? (
              data.map((rowData, index) => {
                return (
                  <tr key={`${rowData.id}-${index}`}>
                    {_.compact(headers).map((header, index) => (
                      <td
                        key={`${rowData.id}-${index}`}
                        className={`
                        ${
                          header.headerclassName ? header.headerclassName : ''
                        } ${columnList.includes(header.name) ? 'd-none' : ''}`}
                      >
                        {header.name === 'is_active' ? (
                          rowData[header.name] ? (
                            <span className="badge active">Active</span>
                          ) : (
                            <span className="badge inactive">Inactive</span>
                          )
                        ) : header.name === 'account_state' ? (
                          <div
                            className={
                              rowData[header.name] === 'Locked'
                                ? 'custom-text-danger'
                                : ''
                            }
                          >
                            {rowData[header.name]}
                          </div>
                        ) : header.name === 'collection_operation' ? (
                          <div>{rowData[header.name]?.name}</div>
                        ) : header.name === 'city' ? (
                          <div>{rowData[header.name]}</div>
                        ) : header.name === 'state' ? (
                          <div>{rowData[header.name]}</div>
                        ) : header.name === 'industry_category' ? (
                          <div>{rowData[header.name]?.name}</div>
                        ) : header.name === 'industry_subcategory' ? (
                          <div>{rowData[header.name]?.name}</div>
                        ) : header.name === 'recruiter' ? (
                          <div>
                            {rowData[header.name]?.first_name}
                            {rowData[header.name]?.last_name}
                          </div>
                        ) : (
                          truncateTo50(rowData[header.name])
                        )}
                      </td>
                    ))}
                    {optionsConfig && (
                      <td
                        className="options"
                        style={{ zIndex: toggleZindex === index ? 10 : 1 }}
                      >
                        {renderOptions(rowData, index)}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="no-data" colSpan={headers.length + 1}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableList;
