/* eslint-disable */
import React, { useEffect, useState } from 'react';
import SvgComponent from '../../../../../../../common/SvgComponent';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import './index.module.scss';
import '../../../../../../../../styles/Common/TableListing.scss';
import { DashDateFormat } from '../../../../../../../../helpers/formatDate';
import PolymorphicType from '../../../../../../../../enums/PolymorphicTypeEnum';
const ReAssignTableListing = ({
  resourceType,
  isLoading,
  data,
  handleSelect,
  headers,
  handleSort,
  setTableHeaders,
}) => {
  const [checkedRow, setcheckedRow] = useState();
  const [deletedTableHeader, setDeletedTableHeader] = useState(headers);

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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    // Use Intl.DateTimeFormat to get a locale-specific time string
    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: localStorage.getItem('timeZone'),
    });
    return timeString;
  };

  const calculateTotalHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Calculate the difference in milliseconds
    const timeDifference = end - start;

    // Calculate total hours
    const totalHours = timeDifference / (1000 * 60 * 60);

    return totalHours;
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
                    style={{ minWidth: `${header.minWidth}` }}
                    align="center"
                  >
                    <div className="inliner">
                      <div
                        className="title"
                        style={{
                          paddingLeft:
                            header.label === 'date' ? '40px' : '35px',
                        }}
                      >
                        {header?.splitlabel ? (
                          header?.label.split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <br />} {word}
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
            {!isLoading ? (
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
                        style={{
                          position: 'relative',
                          textAlign: 'center',
                          textAlign:
                            header.name !== 'location' ? 'center' : 'left',
                        }}
                      >
                        {header.name === 'checkbox' ? (
                          <div className="flex align-items-center gap-2 checkboxInput">
                            <input
                              type="radio"
                              checked={rowData.checked}
                              value={checkedRow}
                              style={{
                                height: '20px',
                                width: '20px',
                                borderRadius: '4px',
                              }}
                              onChange={(e) => {
                                handleSelect(e, rowData, index);
                                setcheckedRow(rowData.id);
                              }}
                            />
                          </div>
                        ) : header.name === 'date' ? (
                          <div style={{ paddingLeft: '15px' }}>
                            {resourceType === 'Staff'
                              ? DashDateFormat(
                                  rowData.date ??
                                    rowData.session_date ??
                                    rowData.nce_date
                                )
                              : ''}
                            {resourceType === 'Vehicles'
                              ? DashDateFormat(
                                  rowData.drive_date ??
                                    rowData.session_date ??
                                    rowData.nce_date
                                )
                              : ''}
                            {resourceType === 'Devices'
                              ? DashDateFormat(
                                  rowData.drive_date ??
                                    rowData.session_date ??
                                    rowData.nce_date
                                )
                              : ''}
                          </div>
                        ) : header.name === 'location' ? (
                          <div
                            style={{ paddingLeft: '25px', textAlign: 'left' }}
                          >
                            {resourceType === 'Staff'
                              ? rowData.shiftable_type ==
                                PolymorphicType.OC_OPERATIONS_SESSIONS
                                ? rowData?.donor_center?.name
                                : rowData?.location?.name
                              : resourceType === 'Vehicles'
                              ? rowData.location_name
                              : resourceType === 'Devices'
                              ? rowData.location_name
                              : ''}
                          </div>
                        ) : header.name === 'shift_hours' ? (
                          <div
                            style={{ paddingLeft: '45px', textAlign: 'left' }}
                          >
                            {`${formatTimestamp(
                              rowData.start_time
                            )} - ${formatTimestamp(rowData.end_time)}`}
                          </div>
                        ) : header.name === 'projection' ? (
                          <div
                            style={{ paddingLeft: '45px', textAlign: 'left' }}
                          >
                            {rowData.projections.procedureTypeQtySum}/
                            {rowData.projections.productYieldSum}
                          </div>
                        ) : header.name === 'schedule_fill_status' &&
                          resourceType !== 'Vehicles' ? (
                          <div
                            style={{ paddingLeft: '55px', textAlign: 'left' }}
                          >
                            {rowData.shiftable_type ==
                            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                              ? rowData.shiftRole.assignedStaff
                              : rowData.staffSetup.assignedStaff}{' '}
                            /
                            {rowData.shiftable_type ==
                            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                              ? rowData.shiftRole.requestedStaff
                              : rowData.staffSetup.requestedStaff}
                          </div>
                        ) : header.name === 'oef' ? (
                          <div
                            style={{ paddingLeft: '30px', textAlign: 'left' }}
                          >
                            {(rowData.oef_procedures + rowData.oef_products).toFixed(2)}
                          </div>
                        ) : header.name === 'clock_in' ? (
                          <div
                            style={{ paddingLeft: '35px', textAlign: 'left' }}
                          >
                            {formatTimestamp(rowData.start_time)}
                          </div>
                        ) : header.name === 'clock_out' ? (
                          <div
                            style={{ paddingLeft: '35px', textAlign: 'left' }}
                          >
                            {formatTimestamp(rowData.end_time)}
                          </div>
                        ) : header.name === 'total_hours' ? (
                          <div
                            style={{ paddingLeft: '75px', textAlign: 'left' }}
                          >
                            {calculateTotalHours(
                              rowData.start_time,
                              rowData.end_time
                            )}
                          </div>
                        ) : (
                          rowData?.header?.name || 'N/A'
                        )}
                      </td>
                    ))}
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
export default ReAssignTableListing;
