import React from 'react';
import SvgComponent from '../../common/SvgComponent';
import moment from 'moment';

const DonorTableList = ({ isLoading, data, headers, handleSort }) => {
  const formatSegmentContactCreatedAt = (value) => {
    const parsedDate = moment(value);
    const pstDate = parsedDate.clone().tz('America/Los_Angeles');
    const formattedDate = pstDate
      .subtract(1, 'year')
      .format('MM-DD-YYYY / HH:mm [PST]');
    return formattedDate;
  };

  return (
    <div className="table-listing-main">
      <div
        className="table-responsive"
        style={{
          height: '515px',
          borderLeft: data?.length ? '1px solid #cfd8e5' : ' ',
        }}
      >
        <table className="table table-striped">
          <thead
            style={{
              position: 'sticky',
              top: '0',
            }}
          >
            <tr>
              {headers
                .filter((header) => header.checked)
                .map((header) => (
                  <th
                    key={header.name}
                    width={header.width}
                    style={{
                      minWidth: `${header.minWidth}`,
                    }}
                    align="center"
                  >
                    <div
                      className="inliner"
                      style={{
                        justifyContent:
                          header.label === 'Agent' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div className="title">
                        {<span className="title">{header.label}</span>}
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="no-data" colSpan={headers.length + 1}>
                  Data Loading
                </td>
              </tr>
            ) : data && data.length ? (
              data.map((rowData, index) => (
                <tr key={`donors-${index}`}>
                  {headers
                    .filter((header) => header.checked)
                    .map((header, index) => (
                      <td
                        key={`donor-${index}`}
                        style={{
                          textAlign:
                            header.name === 'agent_name' ? 'right' : 'left',
                        }}
                      >
                        {header.name === 'segment_contact_created_at'
                          ? formatSegmentContactCreatedAt(rowData[header.name])
                          : rowData[header.name]}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="no-data" colSpan={headers.length + 1}>
                  No Donors Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorTableList;
