/* eslint-disable */

import React, { useState } from 'react';
import SvgComponent from '../../../common/SvgComponent';
import Lock from '../../../../assets/lock.svg';
import { Link, useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import '../../index.module.scss';
import { DashDateFormat, formatTime } from '../../../../helpers/formatDate';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';
const OperationListTable = ({
  isLoading,
  data,
  headers,
  handleSort,
  optionsConfig,
  setTableHeaders,
}) => {
  const navigate = useNavigate();
  const [deletedTableHeader, setDeletedTableHeader] = useState(headers);

  const getEarliestStartTime = (shifts) =>
    Array.isArray(shifts) && shifts.length > 0
      ? shifts.reduce(
          (earliestStartTime, { start_time }) =>
            new Date(start_time) < new Date(earliestStartTime)
              ? start_time
              : earliestStartTime,
          shifts[0].start_time
        )
      : null;

  const getLatestEndTime = (shifts) =>
    Array.isArray(shifts) && shifts.length > 0
      ? shifts.reduce(
          (latestEndTime, { end_time }) =>
            new Date(end_time) > new Date(latestEndTime)
              ? end_time
              : latestEndTime,
          shifts[0].end_time
        )
      : null;

  const sumProductAndProcedure = (shifts) => {
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return null;
    }
    const totalProductYieldSum = shifts.reduce(
      (total, { projections }) =>
        total + (projections ? projections.productYieldSum : 0),
      0
    );
    const totalProcedureTypeQtySum = shifts.reduce(
      (total, { projections }) =>
        total + (projections ? projections.procedureTypeQtySum : 0),
      0
    );
    return `${totalProcedureTypeQtySum}/${totalProductYieldSum}`;
  };

  const sumStaff = (shifts) => {
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return null;
    }
    const totalRequestedStaff = shifts.reduce(
      (total, { staffSetup }) =>
        total + (staffSetup ? staffSetup.requestedStaff : 0),
      0
    );
    const totalAssignedStaff = shifts.reduce(
      (total, { staffSetup }) =>
        total + (staffSetup ? staffSetup.assignedStaff : 0),
      0
    );
    return `${totalAssignedStaff}/${totalRequestedStaff}`;
  };

  const sumDevices = (shifts) => {
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return null;
    }
    const totalRequestedDevices = shifts.reduce(
      (total, { devices }) => total + (devices ? devices.requestedDevices : 0),
      0
    );
    const totalAssignedDevices = shifts.reduce(
      (total, { devices }) => total + (devices ? devices.assignedDevices : 0),
      0
    );
    return `${totalAssignedDevices}/${totalRequestedDevices}`;
  };

  const sumVehicles = (shifts) => {
    if (!Array.isArray(shifts) || shifts.length === 0) {
      return null;
    }
    const totalRequestedVehicles = shifts.reduce(
      (total, { vehicles }) =>
        total + (vehicles ? vehicles.requestedVehicles : 0),
      0
    );
    const totalAssignedVehicles = shifts.reduce(
      (total, { vehicles }) =>
        total + (vehicles ? vehicles.assignedVehicles : 0),
      0
    );
    return `${totalAssignedVehicles}/${totalRequestedVehicles}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    // Use Intl.DateTimeFormat to get a locale-specific time string
    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return timeString;
  };

  const renderOptions = (rowData) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        <ul className="dropdown-menu">
          {optionsConfig?.map((option) =>
            option ? (
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
                  href="javascript:void(0);"
                >
                  {option.label}
                </a>
              </li>
            ) : (
              ''
            )
          )}
        </ul>
      </div>
    );
  };
  const checkboxTableItems = [
    'Name',
    'Primary Phone',
    'Primary Email',
    'Roles',
    'Collection Operation',
    'Team',
    'Classification',
    'Status',
  ];
  const handleCheckbox = (e, label, i) => {
    const dupArr = [...headers];
    const index = dupArr.findIndex((data) => data.label === label);
    dupArr[index].checked = !dupArr[index].checked;
    setTableHeaders(dupArr);
    setDeletedTableHeader([...deletedTableHeader]);
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {_.compact(headers)
                .filter((item) => item.checked)
                .map((header) => (
                  <th
                    key={header.name}
                    width={header.width}
                    style={{
                      minWidth: `${header.minWidth}`,
                      textAlign: 'center',
                    }}
                    align="center"
                  >
                    <div
                      className={`inliner ${'edit-operation-list-table-header'}`}
                      style={{
                        justifyContent:
                          header.label !== ('Name' || 'Status') ? 'center' : '',
                      }}
                    >
                      <div
                        className="title"
                        style={{ display: 'flex', flexDirection: 'row' }}
                      >
                        <div className="title" style={{ textAlign: 'center' }}>
                          {header?.splitlabel ? (
                            header?.label.split(' ').map((word, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <br />} {word}
                              </React.Fragment>
                            ))
                          ) : (
                            <span
                              className="title"
                              style={{ textAlign: 'center' }}
                            >
                              {header.label}
                            </span>
                          )}
                        </div>
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
                      {header.label === 'Staff Setup' && (
                        <div className="">
                          <p className="table-header-subTitle">
                            (Assigned/Requested)
                          </p>
                        </div>
                      )}
                      {header.label === 'Vehicles' && (
                        <div className="">
                          <p className="table-header-subTitle">
                            (Assigned/Requested)
                          </p>
                        </div>
                      )}
                      {header.label === 'Devices' && (
                        <div className="">
                          <p className="table-header-subTitle">
                            (Assigned/Requested)
                          </p>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              <th align="center">
                <div className="flex align-items-center justify-content-center">
                  <div className="account-list-header dropdown-center ">
                    <ul className="dropdown-menu">
                      {checkboxTableItems.map((option, index) => (
                        <li key={option}>
                          <div className="flex align-items-center gap-2 checkboxInput">
                            <input
                              type="checkbox"
                              value={headers.some(
                                (item) => item?.label === option && item.checked
                              )}
                              checked={headers.some(
                                (item) => item?.label === option && item.checked
                              )}
                              style={{
                                height: '20px',
                                width: '20px',
                                borderRadius: '4px',
                              }}
                              onChange={(e) => handleCheckbox(e, option, index)}
                            />
                            <span style={{ fontSize: '14px' }}>{option}</span>
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
                    {_.compact(headers)
                      // .filter((item) => item.checked)
                      .map((header, index) => (
                        <td key={`${rowData.id}-${index}`}>
                          {header.name === 'operation_status' ? (
                            <span className="badge active">
                              {rowData[header.name]}
                            </span>
                          ) : header.name === 'date' ? (
                            rowData.schedule_is_locked ? (
                              <>
                                <img
                                  src={Lock}
                                  alt=""
                                  height={'20px'}
                                  width={'20px'}
                                  style={{
                                    marginRight: '20px',
                                    display: 'inline',
                                  }}
                                />
                                <span
                                  style={{
                                    marginLeft: '10px',
                                    textAlign: 'center',
                                  }}
                                >
                                  {DashDateFormat(
                                    new Date(rowData[header.name])
                                  )}
                                </span>
                              </>
                            ) : (
                              <div style={{ textAlign: 'center' }}>
                                {DashDateFormat(new Date(rowData[header.name]))}
                              </div>
                            )
                          ) : header.name === 'name' ? (
                            <Link
                              to={`/operations-center/operations/${rowData.operation_type}/${rowData.id}/view/about`}
                              className="title-name-link"
                              target="_blank"
                            >
                              {rowData[header.name]}
                            </Link>
                          ) : header.name === 'start_time' ? (
                            <div style={{ textAlign: 'center' }}>
                              {formatDateWithTZ(
                                getEarliestStartTime(rowData?.shifts),
                                'hh:mm a'
                              )}{' '}
                              -
                              {formatDateWithTZ(
                                getLatestEndTime(rowData?.shifts),
                                'hh:mm a'
                              )}
                            </div>
                          ) : header.name === 'projections' ? (
                            <div style={{ textAlign: 'center' }}>
                              {sumProductAndProcedure(rowData.shifts)}
                            </div>
                          ) : header.name === 'staffSetup' ? (
                            <div style={{ textAlign: 'center' }}>
                              {sumStaff(rowData.shifts)}
                            </div>
                          ) : header.name === 'vehicles' ? (
                            <div style={{ textAlign: 'center' }}>
                              {sumVehicles(rowData.shifts)}
                            </div>
                          ) : header.name === 'devices' ? (
                            <div style={{ textAlign: 'center' }}>
                              {sumDevices(rowData.shifts)}
                            </div>
                          ) : (
                            rowData[header.name] || 'N/A'
                          )}
                        </td>
                      ))}
                    {optionsConfig && (
                      <td className="options">{renderOptions(rowData)}</td>
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
export default OperationListTable;
