import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import SvgComponent from '../../../../common/SvgComponent';
import moment from 'moment';

export default function SessionsHistoryListModal({
  modalOpen,
  setModalOpen,
  setExpandedRow,
  expandedRow,
  selectedRow,
}) {
  const [viewAs, setViewAs] = React.useState('Product');
  const [shiftData, setShiftData] = React.useState(selectedRow.shiftData);

  useEffect(() => {
    setShiftData(selectedRow.shiftData);
  }, [selectedRow]);

  const [sortBy, setSortBy] = React.useState({
    name: null,
    order: 'ASC',
  });

  React.useEffect(() => {
    const sortedShiftData = [...shiftData].sort((obj1, obj2) => {
      if (sortBy.order === 'DESC') {
        return obj1[sortBy.name] - obj2[sortBy.name];
      }
      return obj2[sortBy.name] - obj1[sortBy.name];
    });

    setTimeout(() => {
      setShiftData(sortedShiftData);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const handleSort = (name) => {
    setSortBy({
      name,
      order: sortBy.order === 'ASC' ? 'DESC' : 'ASC',
    });
  };

  const handleViewAs = () => {
    if (viewAs === 'Product') {
      setViewAs('Procedure');
    } else {
      setViewAs('Product');
    }
  };

  const handleNaN = (value) => {
    return isNaN(value) ? 'N/A' : value;
  };

  const tableHeaders = [
    { name: 'date', label: 'Date', width: '10%', sortable: true },
    {
      name: 'procedure',
      label: viewAs === 'Product' ? 'Procedure' : 'Product',
      width: '10%',
      sortable: false,
    },
    { name: 'projProd', label: 'Proj', width: '5%', sortable: true },
    { name: 'reg', label: 'Reg', width: '5%', sortable: true },
    { name: 'perf', label: 'Perf', width: '5%', sortable: true },
    { name: 'actual', label: 'Actual', width: '5%', sortable: true },
    { name: 'pa', label: 'PA', width: '5%', sortable: false },
    { name: 'def', label: 'Def', width: '5%', sortable: true },
    { name: 'qns', label: 'QNS', width: '5%', sortable: true },
    { name: 'ftd', label: 'FTD', width: '5%', sortable: true },
    { name: 'wo', label: 'WO', width: '5%', sortable: true },
    { name: 'void', label: 'Void', width: '5%', sortable: true },
  ];

  const sessionProj =
    viewAs === 'Product' ? selectedRow?.projProd : selectedRow?.projProc;
  const sumOfData = {
    sumReg: 0,
    sumPerf: 0,
    sumAct: 0,
    sumDef: 0,
    sumQns: 0,
    sumFtd: 0,
    sumWo: 0,
  };

  shiftData.forEach((shift) => {
    sumOfData.sumReg += shift.reg;
    sumOfData.sumPerf += shift.perf;
    sumOfData.sumAct += shift.actual;
    sumOfData.sumDef += shift.def;
    sumOfData.sumQns += shift.qns;
    sumOfData.sumFtd += shift.ftd;
    sumOfData.sumWo += shift.wo;
  });
  return (
    <div className="mainContent list-modal">
      <Modal
        size={'xl'}
        centered={true}
        show={modalOpen}
        onHide={() => {
          setModalOpen(false);
          setExpandedRow(-1);
        }}
      >
        <Modal.Header>
          <Modal.Title>
            Shift Details ( {viewAs === 'Product' ? 'Procedure' : 'Product'}){' '}
            <span>
              <button
                className="btn btn-md btn-link p-0 editBtn"
                color="primary"
                onClick={handleViewAs}
              >
                View as {viewAs}
              </button>
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="list-modal">
          <div className="table-listing-main">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    {tableHeaders.map((header) => (
                      <th key={header.name}>
                        {header.label}
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
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontWeight: 600 }}>
                    <td>{moment(shiftData[0].date).format('DD MMM, YYYY')}</td>

                    <td>All</td>
                    <td>{handleNaN(sessionProj)}</td>
                    <td>{handleNaN(sumOfData?.sumReg)}</td>
                    <td>{handleNaN(sumOfData?.sumPerf)}</td>
                    <td>{handleNaN(sumOfData?.sumAct)}</td>
                    <td>
                      {handleNaN(
                        (
                          (parseFloat(sumOfData?.sumAct) / sessionProj) *
                          100
                        ).toFixed(2)
                      )}
                      {isNaN(parseFloat(sumOfData?.sumAct) / sessionProj)
                        ? ''
                        : '%'}
                    </td>
                    <td>{handleNaN(sumOfData?.sumDef)}</td>
                    <td>{handleNaN(sumOfData?.sumQns)}</td>
                    <td>{handleNaN(sumOfData?.sumFtd)}</td>
                    <td>{handleNaN(sumOfData?.sumWo)}</td>
                    <td>0</td>
                  </tr>
                  {shiftData.map((shift, index) => {
                    const shiftProj =
                      viewAs === 'Product' ? shift.projProd : shift.projProc;
                    return (
                      <>
                        <tr key={'shifts-' + index}>
                          <td>&nbsp;</td>
                          <td>All</td>
                          <td>{handleNaN(shiftProj)}</td>
                          <td>{handleNaN(shift.reg)}</td>
                          <td>{handleNaN(shift.perf)}</td>
                          <td>{handleNaN(shift.actual)}</td>
                          <td>
                            {handleNaN(
                              (
                                (parseFloat(shift.actual) / shiftProj) *
                                100
                              ).toFixed(2)
                            )}
                            {isNaN(parseFloat(shift.actual) / shiftProj)
                              ? ''
                              : '%'}
                          </td>
                          <td>{handleNaN(shift.def)}</td>
                          <td>{handleNaN(shift.qns)}</td>
                          <td>{handleNaN(shift.ftd) || '-'}</td>
                          <td>{handleNaN(shift.wo) || '-'}</td>
                          <td>{shift.void || '-'}</td>
                        </tr>
                        {shift.projectionData.map((item, j) => {
                          const proj =
                            viewAs === 'Product'
                              ? item.projProd
                              : item.projProc;
                          return (
                            <tr
                              key={'shifts-expanded-row' + j}
                              style={{
                                display: expandedRow === index ? '' : 'none',
                              }}
                            >
                              <td></td>
                              <td></td>
                              <td>{item.procedure}</td>
                              <td>{proj}</td>
                              <td>{handleNaN(item.reg)}</td>
                              <td>{handleNaN(item.perf)}</td>
                              <td>{handleNaN(item.actual)}</td>
                              <td>
                                {handleNaN(
                                  (
                                    (parseFloat(item.actual) / proj) *
                                    100
                                  ).toFixed(2)
                                )}
                                {isNaN(parseFloat(item.actual) / proj)
                                  ? ''
                                  : '%'}
                              </td>
                              <td>{handleNaN(item.def)}</td>
                              <td>{handleNaN(item.qns)}</td>
                              <td>{handleNaN(item.ftd)}</td>
                              <td>{handleNaN(item.wo)}</td>
                              <td>{handleNaN(item.void)}</td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
        <Modal.Header>
          <Modal.Title>Hourly Donor Flow</Modal.Title>
        </Modal.Header>
        <Modal.Body className="list-modal">
          <div className="table-listing-main">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    {selectedRow?.donorFlow?.map((flow, indexY) => {
                      return <th key={indexY}>H{flow.hour + 1}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {selectedRow?.donorFlow?.map((flow, indexZ) => {
                      return <td key={indexZ}>{flow.value}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="buttons d-flex align-items-center justify-content-end mt-4">
            <button
              className="btn btn-primary scheduleBtn"
              onClick={() => {
                setModalOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
