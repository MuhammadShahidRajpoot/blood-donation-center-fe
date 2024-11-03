import React, { useEffect, useState } from 'react';
import './TableStyles.module.scss';
import SvgComponent from '../../SvgComponent';
import { Link } from 'react-router-dom';

export const DashboardTable = ({ data, columns, getData }) => {
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const handleSort = (column) => {
    if (selectedColumn === column) {
      sortOrder === 'ASC' ? setSortOrder('DESC') : setSortOrder('ASC');
    } else {
      setSelectedColumn(column);
      setSortOrder('ASC');
    }
  };

  useEffect(() => {
    if (sortOrder && selectedColumn) {
      getData(sortOrder, selectedColumn);
    }
  }, [sortOrder, selectedColumn]);

  return (
    <div>
      <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
        <table
          style={{
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr style={{ backgroundColor: '#cfd8e5' }}>
              {columns.map((column, index) => (
                <th className="th" key={index}>
                  <div className="th-wrapper">
                    <div>{column.title}</div>
                    <div
                      onClick={() => {
                        handleSort(column.value);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  </div>
                </th>
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
                        {column.link ? (
                          <td
                            key={`${
                              rowData[column.value] ?? `row${rowIndex}`
                            }x${columnIndex}`}
                            className="tableCell"
                            style={{ backgroundColor: 'unset' }}
                          >
                            <Link
                              to={`/crm/accounts/${rowData.account_id}/view/about`}
                              className="title-name-link"
                              target="_blank"
                            >
                              {rowData[column.value]}
                            </Link>
                          </td>
                        ) : (
                          <td
                            key={`${
                              rowData[column.value] ?? `row${rowIndex}`
                            }x${columnIndex}`}
                            className="tableCell"
                            style={{ backgroundColor: 'unset' }}
                          >
                            {rowData[column.value]}
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
    </div>
  );
};
