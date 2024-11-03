import React, { useState } from 'react';
import SvgComponent from '../../../../common/SvgComponent';
import ScheduleShiftModalIcon from '../../../../../assets/images/sessions/schedule-shift-modal.svg';
import { OperationStatus } from '../../../../crm/donors_centers/sessionHistory/SessionHistoryUtils';
import styles from './index.module.scss';
import ConfirmModal from '../../../../common/confirmModal';
import moment from 'moment';
import { Link } from 'react-router-dom';
import ShiftDetailsModal from '../../../../common/shiftDetailsModal/ShiftDetailsModal';
export default function SessionsHistoryTableList({
  isLoading,
  data,
  headers,
  onRowClick,
  handleSort,
  session_id,
}) {
  const [shiftModal, setShiftModal] = useState(false);
  const openShiftModal = () => {
    setShiftModal(!shiftModal);
  };
  const handleRowClick = (index, headerName, rowData) => {
    if (onRowClick && headerName !== 'tooltip') {
      onRowClick(rowData, index);
    }
  };
  const [isConfirmationVisible, setConfirmationVisibility] =
    React.useState(false);
  const propertyValues = {};
  const averageValues = {};
  data.forEach((shift) => {
    Object.keys(shift).forEach((property) => {
      if (!propertyValues[property]) {
        propertyValues[property] = [];
      }
      propertyValues[property].push(Number(shift[property]) || 0);
    });
  });
  const sumOfData = {};
  Object.keys(propertyValues).forEach((property) => {
    sumOfData[property] = propertyValues[property].reduce(
      (sum, value) => sum + value,
      0
    );
    if (property === 'pa') {
      const paValues = propertyValues[property];
      const paAverage =
        paValues.length > 0
          ? (
              paValues.reduce((sum, value) => sum + value, 0) / paValues.length
            ).toFixed(2)
          : 0;

      averageValues[property] = `${paAverage}%`;
    }
  });
  const [toggleZindex, setToggleZindex] = useState(-1);

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {headers?.map((header, index) => (
                <th
                  key={`${header?.name}-${header?.label}-${index}`}
                  align="center"
                >
                  <div className="inliner">
                    <div className="title">
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
                    {header?.sortable && (
                      <div
                        className="sort-icon"
                        onClick={() => handleSort(header.name)}
                      >
                        {header.name !== 'tooltip' && (
                          <SvgComponent name={'SortIcon'} />
                        )}
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
                <td className="no-data" colSpan={headers?.length + 1}>
                  Data Loading
                </td>
              </tr>
            ) : data?.length ? (
              data.map((rowData, indexX) => {
                return (
                  <>
                    <tr key={rowData.id}>
                      {headers.map((header, indexY) => {
                        console.log('header', rowData[header.name]);
                        return (
                          <td
                            key={`${rowData.id}-${header.name}-${header.label}-${indexY}`}
                            style={{
                              zIndex: toggleZindex === indexX ? 10 : 1,
                            }}
                          >
                            {header.name === 'status' ? (
                              <span
                                className={`badge ${
                                  OperationStatus[
                                    rowData?.status?.toLowerCase()
                                  ]
                                }`}
                              >
                                {rowData?.status}
                              </span>
                            ) : header.name === 'date' ? (
                              <div
                                className="d-flex gap-5"
                                style={{
                                  color: '#387de5',
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  handleRowClick(indexX, header.name, rowData);
                                }}
                              >
                                {moment(rowData[header.name]).format(
                                  'DD MMM, YYYY'
                                )}
                              </div>
                            ) : header.name === 'noofshifts' ? (
                              <div
                                className="d-flex gap-5"
                                onClick={() => {
                                  handleRowClick(indexX, header.name, rowData);
                                }}
                              >
                                <div
                                  style={{
                                    color: '#387de5',
                                    cursor: 'pointer',
                                  }}
                                  onClick={openShiftModal}
                                >
                                  Shift {rowData[header.name]}
                                </div>
                              </div>
                            ) : header.name === 'tooltip' ? (
                              <div className="dropdown-center">
                                <div
                                  className="optionsIcon"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  onClick={() => {
                                    setToggleZindex(indexX);
                                  }}
                                >
                                  <SvgComponent name={'ThreeDots'} />
                                </div>
                                <ul className="dropdown-menu custom-translate p-0">
                                  <li>
                                    <Link
                                      className="dropdown-item"
                                      to={`/operations-center/operations/sessions/${session_id}/results/edit`}
                                    >
                                      Edit
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            ) : (
                              rowData[header.name]
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })
            ) : (
              <tr>
                <td className="no-data" colSpan={headers?.length + 1}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 600 }}>
              <td>Total</td>
              <td>&nbsp;</td>
              <td>{sumOfData?.appointment || 'N/A'}</td>
              <td>{sumOfData?.projection || 'N/A'}</td>
              <td>{sumOfData?.registered || 'N/A'}</td>
              <td>{sumOfData?.performed || 'N/A'}</td>
              <td>{sumOfData?.actual || 'N/A'}</td>
              <td>{averageValues?.pa || 'N/A'}</td>
              <td>{sumOfData?.deferrals || 'N/A'}</td>
              <td>{sumOfData?.qns || 'N/A'}</td>
              <td>{sumOfData?.ftd || 'N/A'}</td>
              <td>{sumOfData?.walkouts || 'N/A'}</td>
              <td>{sumOfData?.void || 'N/A'}</td>
              <td>&nbsp;</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {shiftModal && (
        <ShiftDetailsModal
          shiftModal={shiftModal}
          setShiftModal={setShiftModal}
        />
      )}
      <ConfirmModal
        classes={{
          inner: styles.scheduleShiftPopup,
          btnGroup: 'gap-4',
          btn: 'w-50',
        }}
        showConfirmation={isConfirmationVisible}
        onCancel={() => setConfirmationVisibility(false)}
        onConfirm={() => setConfirmationVisibility(false)}
        icon={ScheduleShiftModalIcon}
        heading={'Confirmation'}
        description={
          <>
            <p>
              This will copy all drive parameters to a newly scheduled drive.
              You will be redirected to the create drive process.
            </p>
            <p className="mt-2">Are you sure you want to continue?`</p>
          </>
        }
      />
    </div>
  );
}
