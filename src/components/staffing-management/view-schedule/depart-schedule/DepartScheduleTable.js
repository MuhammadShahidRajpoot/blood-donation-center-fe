/* eslint-disable */

import React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';

const DepartScheduleTable = (props) => {
  const redDepartCard = '#ffe7e7';
  const yellowDepartCard = '#fff8ea';
  const greenDepartCard = '#def0d7';

  const setColorForDepartCard = (staff_assigned, staff_requested) => {
    const availability = staff_requested - staff_assigned;
    if (availability > 0)
      return yellowDepartCard; // more requested than assigned
    else if (availability < 0)
      return redDepartCard; // more assigned than requested
    else return greenDepartCard;
  };

  function extractTimeFromString(dateString) {
    const parts = dateString.split(' ');
    const timePart = parts[1] + ' ' + parts[2];
    return timePart;
  }
  const CustomProgressBar = ({ staffAssigned, staffRequested }) => {
    const progress = (staffAssigned / staffRequested) * 100;
    const progressBarColor =
      staffAssigned < staffRequested
        ? '#FFBF42'
        : staffAssigned > staffRequested
        ? '#FF0000'
        : '#5CA044';
    const remainingColor = '#D9D9D9';
    const progressBarStyle = {
      width: '100%',
      background: `linear-gradient(90deg, ${progressBarColor} 0%, ${progressBarColor} ${progress}%, ${remainingColor} ${progress}%, ${remainingColor} 100%)`,
      borderRadius: '5px',
      transition: 'width 0.5s ease',
      padding: '5px',
    };
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: '0', marginRight: '10px' }}>
          {staffAssigned} / {staffRequested}
        </p>
        <div style={progressBarStyle}></div>
      </div>
    );
  };

  const areDatesEqual = (dateString1, dateString2) => {
    function extractDatePart(dateString) {
      const [, datePart] = dateString.split(' ');
      return datePart;
    }

    const datePart1 = extractDatePart(dateString1);
    const datePart2 = new Date(dateString2).toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });

    return datePart1 === datePart2;
  };

  // Debounce function for scrolling - because onScroll is being called multiple times on one scroll
  function debounceScroll(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const handleScroll = debounceScroll((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPosition = Math.ceil(
      (scrollTop / (scrollHeight - clientHeight)) * 100
    );
    // Check if the user has scrolled to the end
    if (scrollPosition >= 100) {
      // scrolled to the end
      props.setCurrentPage((prevPage) => prevPage + 1);
    }
  }, 300);

  return (
    <div className="table-listing-main">
      <div
        className="table-responsive"
        onScroll={handleScroll}
        style={{ overflowY: 'auto', maxHeight: '60vh' }}
      >
        <table
          className={`${
            !props.departData || props.departData.length === 0
              ? ''
              : 'schedule-table-fixed'
          }`}
        >
          <thead>
            <tr className="schedule-table-headers-row">
              {_.compact(props.headers).map((header, index) => (
                <th key={index} style={{ minWidth: '12rem' }} align="center">
                  <div className="inliner">
                    <div className="title">
                      {header.split(' ').map((part, i) => (
                        <div key={i}>{part}</div>
                      ))}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="px-2">
            {props.isLoading ? (
              <tr>
                <td className="no-data" colSpan={props.headers.length + 1}>
                  Data Loading
                </td>
              </tr>
            ) : props.departData?.length ? (
              props.departData.map((rowData, index) => {
                return (
                  <tr key={`${index}`}>
                    {_.compact(props.headers).map((header, index) => (
                      <td
                        className={`${
                          areDatesEqual(header, rowData.date)
                            ? 'schedule-card-row'
                            : 'no-card-row'
                        }`}
                        key={`${rowData.id}-${index}`}
                      >
                        {areDatesEqual(header, rowData.date) && (
                          <div
                            className="depart-schedule-card"
                            style={{
                              backgroundColor: setColorForDepartCard(
                                rowData.staff_assigned,
                                rowData.staff_requested
                              ),
                            }}
                          >
                            <Link
                              className="tileParagraph"
                              to={`/operations-center/operations/${rowData.operation_type}/${rowData.operation_id}/view/about`}
                              target="_blank"
                            >
                              {rowData.account_name}
                            </Link>
                            <p>
                              {rowData.location_name.length < 15
                                ? rowData.location_name
                                : rowData.location_name.substring(0, 15) +
                                  '...'}
                            </p>
                            <p>{rowData.location_address}</p>
                            <p>
                              {rowData.sum_of_procedure_shifts} /{' '}
                              {rowData.sum_of_product_shifts}
                            </p>
                            <p>
                              {extractTimeFromString(
                                formatDateWithTZ(rowData.shift_start_time)
                              )}{' '}
                              -{' '}
                              {extractTimeFromString(
                                formatDateWithTZ(rowData.shift_end_time)
                              )}
                            </p>
                            <p>{rowData.vehicles}</p>
                            <p>Depart: {rowData.depart_time}</p>
                            <p>Return: {rowData.return_time}</p>
                            <div className="py-2">
                              {rowData.staff_names_with_roles &&
                                rowData.staff_names_with_roles
                                  .split(',')
                                  .map((data, index) => (
                                    <p key={index}>{data}</p>
                                  ))}
                            </div>
                            <div id="staffingStatus">
                              <p>Staffing status</p>
                              <p>OEF {rowData.oef}</p>
                            </div>
                            <CustomProgressBar
                              staffAssigned={rowData.staff_assigned}
                              staffRequested={rowData.staff_requested}
                            />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="no-data" colSpan={props.headers.length + 1}>
                  No Data Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartScheduleTable;
