/* eslint-disable */
import React, { useEffect, useState } from 'react';
import SvgComponent from '../../../common/SvgComponent';
import Bell from '../../../../assets/Bell.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import '../../index.module.scss';
import './operationlist.edit.scss';
import { DashDateFormat, formatTime } from '../../../../helpers/formatDate';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';

const OperationListEditTable = ({
  isLoading,
  data,
  headers,
  handleSort,
  optionsConfig,
  onCheckboxClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentLocation = location.pathname;
  const [isChecked, setIsChecked] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const schedule_status = searchParams.get('schedule_status');
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState([]);
  const disableEdit = searchParams.get('disableEdit'); // manages if user clicked on 'View' of a schedule which was locked atm
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    setIsAllChecked(false);
    data?.forEach((row) => {
      row.checked = false;
    });
    onCheckboxClick();
  }, [isLoading]);

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

  const handleFormInput = (e, type, operation_id, index) => {
    if (type === 'select_all') {
      if (e.target.checked) {
        setIsAllChecked(true);
      } else {
        setIsAllChecked(false);
      }
      data?.forEach((row) => {
        row.checked = e.target.checked ? true : false;
      });
    } else if (type === 'individual') {
      if (e.target.checked) {
        setCheckboxChecked((prevArray) => [...prevArray, index]);
      } else {
        setCheckboxChecked((prevArray) =>
          prevArray.filter((number) => number !== index)
        );
      }
    }
  };

  const isDisable = () => {
    return (
      data?.find((row) => {
        return !row.is_notify;
      }) === (null || undefined)
    );
  };

  const renderOptions = (rowData) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle={disableEdit === 'true' ? '' : 'dropdown'}
          aria-expanded="false"
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        <ul className="dropdown-menu">
          {optionsConfig?.map((option) =>
            currentLocation === STAFFING_MANAGEMENT_BUILD_SCHEDULE.EDIT &&
            option?.label !== 'Resolve' &&
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
                >
                  {option.label}
                </a>
              </li>
            ) : currentLocation ===
                STAFFING_MANAGEMENT_BUILD_SCHEDULE.FLAGGED &&
              option?.label !== 'Edit' &&
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
                >
                  {option.label}
                </a>
              </li>
            ) : null
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {schedule_status !== 'Draft' && (
                <th>
                  <input
                    disabled={disableEdit === 'true' || isDisable()}
                    type="checkbox"
                    checked={isAllChecked}
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '1px',
                      borderRadius: '4px',
                    }}
                    onChange={(e) => {
                      handleFormInput(e, 'select_all', null);
                      data?.forEach((row) => {
                        if (!row.is_notify) {
                          row.checked = e.target.checked ? true : false;
                        }
                      });
                      onCheckboxClick();
                    }}
                  />{' '}
                </th>
              )}
              {_.compact(headers)
                .filter((item) => item.checked)
                .map((header) => (
                  <th key={header.name} width={header.width} align="center">
                    <div className={`inliner`}>
                      <div className="title">
                        {header?.splitLabel ? (
                          header?.label.split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />}{' '}
                              <span
                                style={{
                                  fontSize: i > 0 ? '12px' : '16px',
                                  fontWeight: i > 0 ? '400' : '500',
                                }}
                              >
                                {word}
                              </span>
                            </React.Fragment>
                          ))
                        ) : (
                          <span className="title">{header.label}</span>
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
                  </th>
                ))}
              <th></th>
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
                    {schedule_status !== 'Draft' && (
                      <td>
                        <input
                          type="checkbox"
                          checked={rowData.checked}
                          disabled={disableEdit === 'true' || rowData.is_notify}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: '1px',
                            borderRadius: '4px',
                          }}
                          onChange={(e) => {
                            handleFormInput(e, 'individual', rowData.id, index);
                            rowData.checked = e.target.checked ? true : false;
                            onCheckboxClick();
                          }}
                        />
                        {!rowData.is_notify && (
                          <img
                            src={Bell}
                            alt=""
                            height={'20px'}
                            width={'20px'}
                            style={{
                              marginBottom: '11px',
                              marginLeft: '10px',
                              display: 'inline',
                            }}
                          />
                        )}
                      </td>
                    )}
                    {_.compact(headers).map((header, index) => (
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
                                  textAlign: 'left',
                                  fontSize: '16px',
                                }}
                              >
                                {DashDateFormat(new Date(rowData[header.name]))}
                              </span>
                            </>
                          ) : (
                            <div
                              style={{ textAlign: 'left', fontSize: '16px' }}
                            >
                              {DashDateFormat(new Date(rowData[header.name]))}
                            </div>
                          )
                        ) : header.name === 'name' ? (
                          <Link
                            to={`/operations-center/operations/${rowData.operation_type}/${rowData.id}/view/about`}
                            className="title-name-link"
                            target="_blank"
                          >
                            {rowData.pending_assignment
                              ? 'Pending Assignment'
                              : rowData[header.name]}
                          </Link>
                        ) : header.name === 'start_time' ? (
                          <div style={{ textAlign: 'left', fontSize: '16px' }}>
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
                          <div style={{ textAlign: 'left', fontSize: '16px' }}>
                            {sumProductAndProcedure(rowData.shifts)}
                          </div>
                        ) : header.name === 'staffSetup' ? (
                          <div style={{ textAlign: 'left', fontSize: '16px' }}>
                            {sumStaff(rowData.shifts)}
                          </div>
                        ) : header.name === 'vehicles' ? (
                          <div style={{ textAlign: 'left', fontSize: '16px' }}>
                            {sumVehicles(rowData.shifts)}
                          </div>
                        ) : header.name === 'devices' ? (
                          <div style={{ textAlign: 'left', fontSize: '16px' }}>
                            {sumDevices(rowData.shifts)}
                          </div>
                        ) : (
                          rowData[header.name] || 'N/A'
                        )}
                      </td>
                    ))}
                    {optionsConfig && (
                      <td
                        className="options"
                        style={{
                          zIndex: selected === index ? 1 : 0,
                        }}
                        onClick={() => setSelected(index)}
                      >
                        {renderOptions(rowData)}
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
export default OperationListEditTable;
