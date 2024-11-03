import React, { useState } from 'react';
import styles from './shiftDetails.module.scss';
import SvgComponent from '../../common/SvgComponent';
import { Modal } from 'react-bootstrap';

// import moment from 'moment';

const ShiftDetailsModal = ({
  isLoading = false,
  data,
  headers,
  onRowClick,
  handleSort,
  setShiftModal,
}) => {
  const [showProcedure, setShowProcedure] = useState(false);

  const tableHeaders = [
    { name: 'date', label: 'Date', width: '10%', sortable: false },
    { name: 'procedure', label: 'Procedure', width: '5%', sortable: false },
    { name: 'appointment', label: 'Appts', width: '5%', sortable: true },
    { name: 'projection', label: 'Proj', width: '5%', sortable: true },
    { name: 'registered', label: 'Reg', width: '5%', sortable: true },
    { name: 'performed', label: 'Perf', width: '5%', sortable: true },
    { name: 'actual', label: 'Act', width: '5%', sortable: true },
    { name: 'pa', label: 'PA', width: '5%', sortable: true },
    { name: 'deferrals', label: 'Def', width: '5%', sortable: true },
    { name: 'qns', label: 'QNS', width: '5%', sortable: true },
    { name: 'ftd', label: 'FTD', width: '5%', sortable: true },
    { name: 'walkouts', label: 'WO', width: '5%', sortable: true },
    { name: 'voidd', label: 'Void', width: '5%', sortable: true },
  ];
  const donorFlowHeaders = [
    { name: 'H1', label: 'h1', width: '10%', sortable: true },
    { name: 'H2', label: 'h2', width: '5%', sortable: true },
    { name: 'H3', label: 'h3', width: '5%', sortable: true },
    { name: 'H4', label: 'h4', width: '5%', sortable: true },
    { name: 'H5', label: 'h5', width: '5%', sortable: true },
    { name: 'H6', label: 'h6', width: '5%', sortable: true },
    { name: 'H7', label: 'h7', width: '5%', sortable: true },
    { name: 'H8', label: 'h8', width: '5%', sortable: true },
    { name: 'H9', label: 'h9', width: '5%', sortable: true },
    { name: 'H10', label: 'h10', width: '5%', sortable: true },
    { name: 'H11', label: 'h11', width: '5%', sortable: true },
    { name: 'H12', label: 'h12', width: '5%', sortable: true },
  ];
  const donorFlowData = [
    {
      h1: '01',
      h2: '07',
      h3: '10',
      h4: '03',
      h5: '02',
      h6: '09',
      h7: '04',
      h8: '02',
      h9: '07',
      h10: '10',
      h11: '03',
      h12: '06',
    },
  ];
  const tableData = [
    {
      Date: 'Dec 21, 2022',
      Procedure: 'All',
      Appts: 45,
      Proj: 25,
      Reg: 30,
      Perf: 20,
      Act: 19,
      PA: '76%',
      Def: 1,
      QNS: 0,
      FTD: 15,
      WO: 3,
      Void: 4,
    },
    {
      Date: '',
      Procedure: 'WB',
      Appts: 45,
      Proj: 25,
      Reg: 30,
      Perf: 20,
      Act: 19,
      PA: '76%',
      Def: 1,
      QNS: 0,
      FTD: 15,
      WO: 3,
      Void: 4,
    },
    {
      Date: '',
      Procedure: 'DRBC',
      Appts: 45,
      Proj: 25,
      Reg: 30,
      Perf: 20,
      Act: 19,
      PA: '76%',
      Def: 1,
      QNS: 0,
      FTD: 15,
      WO: 3,
      Void: 4,
    },
  ];
  const handleToggle = () => {
    setShowProcedure((prevShowProcedure) => !prevShowProcedure);
  };

  return (
    <>
      <Modal
        show={true}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <section className="shift_details_modal">
            <div className={styles.shift_details_modal_wrapper}>
              <div className={styles.shift_details_content}>
                <h2>
                  {showProcedure
                    ? 'Shift Details (Procedure)'
                    : 'Shift Details 1 (Procedure)'}
                </h2>

                <button onClick={handleToggle}>
                  {showProcedure ? 'View As Procedure' : 'View As Products'}
                </button>
              </div>
              <div className={styles.shift_details_table_content}>
                <div className="table-listing-main w-100">
                  <div
                    className="table-responsive mh-auto"
                    style={{ minHeight: 'auto' }}
                  >
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          {tableHeaders?.map((header, index) => (
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
                                    <span className="title">
                                      {header.label}
                                    </span>
                                  )}
                                </div>
                                {header?.sortable && (
                                  <div className="sort-icon">
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
                            <td
                              className="no-data"
                              colSpan={tableHeaders?.length + 1}
                            >
                              Data Loading
                            </td>
                          </tr>
                        ) : tableData?.length ? (
                          tableData.map((rowData, indexX) => {
                            return (
                              <>
                                <tr key={rowData.id}>
                                  {tableHeaders.map((header, indexY) => {
                                    console.log('header', rowData[header.name]);
                                    return (
                                      <td
                                        key={`${rowData.id}-${header.name}-${header.label}-${indexY}`}
                                        className="text-center"
                                      >
                                        {rowData[header.label]}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              className="no-data"
                              colSpan={tableHeaders?.length + 1}
                            >
                              No Data Found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ==================================== Hourly Donor Flow ===================================== */}

              <div className="hourly_donor_flow">
                <div className={styles.shift_details_table_content}>
                  <h2>Hourly Donor Flow</h2>
                  <div className="table-listing-main w-100">
                    <div
                      className="table-responsive mh-auto"
                      style={{ minHeight: 'auto' }}
                    >
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            {donorFlowHeaders?.map((header, index) => (
                              <th
                                key={`${header?.name}-${header?.label}-${index}`}
                                align="center"
                              >
                                <div className="inliner">
                                  <div className="title">
                                    {header?.splitlabel ? (
                                      header?.label
                                        .split(' ')
                                        .map((word, i) => (
                                          <React.Fragment key={i}>
                                            {i > 0 && <br />} {word}
                                          </React.Fragment>
                                        ))
                                    ) : (
                                      <span className="title">
                                        {header.name}
                                      </span>
                                    )}
                                  </div>
                                  {header?.sortable && (
                                    <div className="sort-icon">
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
                              <td
                                className="no-data"
                                colSpan={tableHeaders?.length + 1}
                              >
                                Data Loading
                              </td>
                            </tr>
                          ) : donorFlowData?.length ? (
                            donorFlowData.map((rowData, indexX) => {
                              return (
                                <>
                                  <tr key={rowData.id}>
                                    {donorFlowHeaders.map((header, indexY) => {
                                      return (
                                        <td
                                          key={`${rowData.id}-${header.name}-${header.label}-${indexY}`}
                                          className="text-center"
                                        >
                                          {rowData[header.label]}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                </>
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                className="no-data"
                                colSpan={tableHeaders?.length + 1}
                              >
                                No Data Found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-end">
                <button
                  className="btn btn-primary text-end"
                  onClick={() => setShiftModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShiftDetailsModal;
