import React, { useState } from 'react';
import './details.scss';

function RTDtable({ rolesTimes, roleSchedule, isLoading }) {
  const [rtdTabs, setRtdTabs] = useState('Time Setting');

  return (
    <>
      <tr className="bg-white position-sticky top-0 w-100 rtdTableStyles">
        <td
          className="pb-0 nav-tabs-container"
          colSpan={rtdTabs === 'Time Setting' ? '7' : '9'}
        >
          <div className="filterBar p-0">
            <div className="tabs border-0 mb-0 w-100 d-flex justify-between">
              <ul>
                <li>
                  <a
                    onClick={() => setRtdTabs('Time Setting')}
                    className={`rtd-nav-tabs
                            ${
                              rtdTabs === 'Time Setting'
                                ? 'active'
                                : 'fw-medium'
                            }
                        `}
                  >
                    Time Setting
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setRtdTabs('Role Schedule')}
                    className={`rtd-nav-tabs
                            ${
                              rtdTabs === 'Role Schedule'
                                ? 'active'
                                : 'fw-medium'
                            }
                        `}
                  >
                    Role Schedule
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </td>
      </tr>
      {rtdTabs === 'Time Setting' && (
        <>
          <tr className="bg-white">
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Role
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Lead
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Travel To
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Setup
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Breakdown
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Travel From
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Wrapup
            </td>
          </tr>
          {isLoading ? (
            <tr>
              <td className="no-data" colSpan="7">
                Data Loading
              </td>
            </tr>
          ) : rolesTimes?.length ? (
            rolesTimes.map((rowData, index) => {
              return (
                <tr key={`rt-${rowData.role}-${index}`}>
                  <td
                    className="tableTD col1 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.role}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.lead_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.travel_to_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.setup_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.breakdown_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.travel_from_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.wrapup_time}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="no-data" colSpan="7">
                No Data Found
              </td>
            </tr>
          )}
        </>
      )}
      {rtdTabs === 'Role Schedule' && (
        <>
          <tr className="bg-white">
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '15%' }}
            >
              Role
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Start
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Depart
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Arrive
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Shift Start
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Shift End
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Return
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              Arrive
            </td>
            <td
              className="tableTD tableHead rtd-table-header"
              style={{ width: '10%' }}
            >
              End
            </td>
          </tr>
          {isLoading ? (
            <tr>
              <td className="no-data" colSpan="9">
                Data Loading
              </td>
            </tr>
          ) : roleSchedule?.length ? (
            roleSchedule.map((rowData, index) => {
              return (
                <tr key={`rs-${rowData.role}-${index}`}>
                  <td
                    className="tableTD col1  tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '15%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.role}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.start_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.depart_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.arrive_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.shift_start_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.shift_end_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.return_time}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.arrive_time2}
                  </td>
                  <td
                    className="tableTD col2 tabel-cells-content  rtd-table-body-content-cell"
                    style={{
                      width: '10%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rowData.endTime}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="no-data" colSpan="9">
                No Data Found
              </td>
            </tr>
          )}
        </>
      )}
    </>
  );
}

export default RTDtable;
