/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import './index.scss';
import SvgComponent from '../../../../common/SvgComponent';
import moment from 'moment';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

const TableList = ({
  isLoading,
  data,
  headers,
  handleSort,
  optionsConfig,
  checkboxTableItems,
}) => {
  const navigate = useNavigate();
  const [tableHeaders, setTableHeaders] = useState(headers || []);
  const activeHeaders = tableHeaders.filter((header) => !header.hidden);
  const [toggleZindex, setToggleZindex] = useState(-1);

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
          {optionsConfig
            .filter((config) => {
              if (
                !rowData.writeable &&
                (config.label.toLowerCase() === 'edit' ||
                  config.label.toLowerCase() === 'archive')
              ) {
                return false;
              } else if (config.label.toLowerCase() === 'edit') {
                let sessionDate = new Date(rowData.date);
                const leastSessionTime = new Date(rowData.start_time);
                sessionDate.setHours(leastSessionTime.getHours());
                sessionDate.setMinutes(leastSessionTime.getMinutes());
                sessionDate.setSeconds(leastSessionTime.getSeconds());
                sessionDate.setMilliseconds(leastSessionTime.getMilliseconds());
                return sessionDate > new Date();
              }
              return true;
            })
            .map((option) => (
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
            ))}
        </ul>
      </div>
    );
  };

  const handleCheckbox = (e, label) => {
    setTableHeaders(
      tableHeaders.map((header) => {
        if (header.label === label) header.hidden = !e.target.checked;
        return header;
      })
    );
  };

  const handleTime = (rowData) => {
    let start_time = formatDateWithTZ(rowData['start_time'], 'hh:mm a');
    let end_time = formatDateWithTZ(rowData['end_time'], 'hh:mm a');
    if (start_time === 'Invalid date' && end_time === 'Invalid date')
      return 'N/A';
    else if (start_time === 'Invalid date') start_time = 'N/A';
    else if (end_time === 'Invalid date') end_time = 'N/A';
    return `${start_time} - ${end_time}`;
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped hasOptions">
          <thead>
            <tr>
              {_.compact(activeHeaders).map((header) => (
                <th
                  key={header.name}
                  // width={header.width}
                  // style={{ minWidth: `${header.minWidth}` }}
                  align="center"
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

              <th align="center" width="150px" style={{ zIndex: 11 }}>
                <div className="flex align-items-center justify-content-center">
                  <div className="sessions-list-header dropdown-center ">
                    <div
                      className="optionsIcon  cursor-pointer"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <SvgComponent name={'TableHeaderIcon'} />
                    </div>
                    <ul className="dropdown-menu">
                      {checkboxTableItems.map((option) => (
                        <li key={option}>
                          <div className="flex align-items-center gap-2 checkboxInput">
                            <input
                              type="checkbox"
                              checked={tableHeaders.some(
                                (item) => item.label === option && !item.hidden
                              )}
                              style={{
                                height: '20px',
                                width: '20px',
                                borderRadius: '4px',
                              }}
                              onChange={(e) => handleCheckbox(e, option)}
                            />
                            <span>{option}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                    {_.compact(activeHeaders).map((header, index) => {
                      return (
                        <td key={`${rowData.id}-${index}`}>
                          {header.name === 'date' ? (
                            <div>
                              {moment(rowData[header.name]).format(
                                'MM-DD-YYYY'
                              )}
                            </div>
                          ) : header.name === 'status' ? (
                            <span
                              className={`badge ${rowData.status_chip_color}`}
                            >
                              {rowData[header.name]}
                            </span>
                          ) : header.name === 'hours' ? (
                            <span>{handleTime(rowData)}</span>
                          ) : (
                            rowData[header.name]
                          )}
                        </td>
                      );
                    })}
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
