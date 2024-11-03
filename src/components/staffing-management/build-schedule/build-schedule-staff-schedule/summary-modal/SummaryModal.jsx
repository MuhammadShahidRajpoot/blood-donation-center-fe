import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import './modal.scss';
import SvgComponent from '../../../../common/SvgComponent';
import Pagination from '../../../../common/pagination';
import { formatDate } from '../../../../../helpers/formatDate';

export const SummaryModal = ({
  columns = [],
  data = [],
  title = 'Modal Header',
  getData,
  onClose,
  show = false,
  totalRecords,
}) => {
  const [opened, setOpened] = useState(show);
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumn, setSelectedColumn] = useState();
  const [sortOrder, setSortOrder] = useState();

  useEffect(() => {
    setOpened(show);
  }, [show]);

  useEffect(() => {
    if (!opened) {
      setLimit(5);
      setCurrentPage(1);
      setSelectedColumn();
      setSortOrder();
    }
  }, [opened]);

  const handleSort = (column) => {
    if (selectedColumn === column) {
      sortOrder === 'ASC' ? setSortOrder('DESC') : setSortOrder('ASC');
    } else {
      setSelectedColumn(column);
      setSortOrder('ASC');
    }
  };

  useEffect(() => {
    show && getData(limit, currentPage, sortOrder, selectedColumn);
  }, [sortOrder, selectedColumn, limit, currentPage, columns]);

  return (
    <Modal
      show={opened}
      onHide={() => {
        setOpened(false);
        onClose && onClose();
      }}
      size={'lg'}
      className={`d-flex align-items-center  justify-content-center`}
    >
      <ModalHeader closeButton className="modalTitle">
        {title}
      </ModalHeader>
      <ModalBody>
        <div style={{ height: '400px', overflowY: 'scroll' }}>
          <table
            style={{
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
              width: '100%',
            }}
          >
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr style={{ backgroundColor: '#cfd8e5' }}>
                {columns.map((column) => (
                  <>
                    <th className="th" key={column.value}>
                      <div className="th-wrapper">
                        <div>{column.title}</div>
                        <div
                          onClick={() => {
                            handleSort(column.value);
                          }}
                        >
                          <SvgComponent name={'SortIcon'} />
                        </div>
                      </div>
                    </th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                <>
                  {data.map((rowData, rowIndex) => (
                    <tr
                      key={`${rowData?.id ?? 'row'}-${rowIndex}`}
                      className="tbRow"
                    >
                      {columns.map((column, columnIndex) => (
                        <>
                          {column.highlighted ? (
                            <td
                              key={`${
                                rowData[column.value] ?? `row${rowIndex}`
                              }x${columnIndex}`}
                              className="tableCell"
                              style={{ backgroundColor: 'unset' }}
                            >
                              <div className="highlightedCell">
                                {rowData[column.value]}
                              </div>
                            </td>
                          ) : (
                            <td
                              key={`${
                                rowData[column.value] ?? `row${rowIndex}`
                              }x${columnIndex}`}
                              className="tableCell"
                              style={{ backgroundColor: 'unset' }}
                            >
                              {column.value === 'date'
                                ? formatDate(
                                    rowData[column.value],
                                    'MM-DD-YYYY'
                                  )
                                : rowData[column.value]}
                            </td>
                          )}
                        </>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td className="no-data" colSpan={columns.length}>
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
          customWrapperStyle={{ display: 'flex', flexDirection: 'row-reverse' }}
        />
      </ModalBody>
    </Modal>
  );
};
