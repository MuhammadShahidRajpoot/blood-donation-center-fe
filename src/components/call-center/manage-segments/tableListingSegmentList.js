import React, { useState } from 'react';
import SvgComponent from '../../common/SvgComponent';
import SegmentDonorsModal from '../../common/SegmentDonorsModal';

const TableList = ({ isLoading, data, headers, handleSort }) => {
  const [openCommunication, setOpenCommunication] = useState(false);
  const [modalData, setModalData] = useState({});

  console.log({ data, openCommunication });

  const formatDateString = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
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
                          header.label === 'Members' ||
                          header.label === 'Last Update Date'
                            ? 'flex-end'
                            : 'flex-start',
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
            ) : data?.length ? (
              data.map((rowData, index) => (
                <tr key={`seg-${index}`}>
                  {headers
                    .filter((header) => header.checked)
                    .map((header, index) => (
                      <td
                        key={`segment-${index}`}
                        style={{
                          textAlign:
                            header.name === 'total_members' ||
                            header.name === 'ds_date_last_modified'
                              ? 'right'
                              : 'left',
                        }}
                      >
                        {header.name === 'name' ? (
                          <span
                            className="cursor-pointer update-content"
                            onClick={(e) => {
                              setModalData(rowData);
                              console.log('nameeee', rowData);
                              setOpenCommunication(true);
                            }}
                          >
                            {rowData[header.name]}
                          </span>
                        ) : header.name === 'ds_date_last_modified' ? (
                          formatDateString(rowData[header.name])
                        ) : (
                          rowData[header.name]
                        )}
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="no-data" colSpan={headers.length + 1}>
                  No Segment Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <SegmentDonorsModal
        openModal={openCommunication}
        setOpenModal={setOpenCommunication}
        segmentdata={modalData}
      />
    </div>
  );
};

export default TableList;
