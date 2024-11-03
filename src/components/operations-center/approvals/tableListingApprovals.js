import React, { useState } from 'react';
// import SvgComponent from '../common/SvgComponent';
import SvgComponent from '../../common/SvgComponent';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
// import './index.scss';
import styles from './index.module.scss';
import ToolTip from '../../common/tooltip';
const TableList = ({
  isLoading,
  data,
  headers,
  handleSort,
  optionsConfig,
  // setTableHeaders,
}) => {
  const navigate = useNavigate();
  const [toggleZindex, setToggleZindex] = useState(-1);

  const renderOptions = (rowData, index) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          onClick={() => {
            setToggleZindex(index);
          }}
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        <ul className="dropdown-menu">
          {optionsConfig.map((option) =>
            option ? (
              <li key={option.label}>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    if (option.path) {
                      const path = option.path(rowData);
                      navigate(path);
                    } else if (option.action) {
                      option.action(rowData);
                    }
                  }}
                  href="javascript:void(0);"
                >
                  {option.label}
                </a>
              </li>
            ) : (
              ''
            )
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped hasOptions">
          <thead>
            <tr>
              {_.compact(headers)
                // .filter((item) => item.checked)
                .map((header) => (
                  <th
                    key={header.name}
                    // width={header.width}
                    style={
                      {
                        // width: 'fit-content',
                        // minWidth: `${header.minWidth}`,
                      }
                    }
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

              <th align="center" width="150px" style={{ zIndex: 11 }}>
                <div className="flex align-items-center justify-content-center">
                  <div className="account-list-header dropdown-center "></div>
                </div>
              </th>
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
              data.map((rowData, index) => {
                return (
                  <tr key={`${rowData.id}-${index}`}>
                    {_.compact(headers)
                      // .filter((item) => item.checked)
                      .map((header, index) => (
                        <td key={`${rowData.id}-${index}`}>
                          {header.name === 'is_active' ? (
                            rowData[header.name] ? (
                              <span className="badge active">Active</span>
                            ) : (
                              <span className="badge inactive">Inactive</span>
                            )
                          ) : header.name === 'qualification_status' ? (
                            <div>
                              {rowData[header.name] === 'Qualified' ? (
                                <span
                                  style={{
                                    color: '#5CA044',
                                    fontSize: '22px',
                                    marginRight: '5px',
                                  }}
                                >
                                  &#x2022;
                                </span>
                              ) : rowData[header.name] === 'Expired' ? (
                                <span
                                  style={{
                                    color: '#FF0000',
                                    fontSize: '22px',
                                    marginRight: '5px',
                                  }}
                                >
                                  &#x2022;
                                </span>
                              ) : rowData[header.name] === 'Not Qualified' ? (
                                <span
                                  style={{
                                    color: '#F4C2C2',
                                    fontSize: '22px',
                                    marginRight: '5px',
                                  }}
                                >
                                  &#x2022;
                                </span>
                              ) : null}

                              {rowData[header.name]}
                            </div>
                          ) : header.name === 'request_status' ? (
                            <div>
                              {rowData[header.name] === 'Resolved' ? (
                                <span
                                  className={`${styles.badge} ${styles.blue}`}
                                >
                                  {rowData[header.name]}
                                </span>
                              ) : rowData[header.name] === 'Pending' ? (
                                <span
                                  className={`${styles.badge} ${styles.yellow}`}
                                >
                                  {rowData[header.name]}
                                </span>
                              ) : null}
                            </div>
                          ) : header.name === 'name' ? (
                            <div>{rowData[header.name]}</div>
                          ) : header.name === 'city' ? (
                            <div>{rowData[header.name]}</div>
                          ) : header.name === 'state' ? (
                            <div>{rowData[header.name]}</div>
                          ) : header.name === 'industry_category' ? (
                            <div>{rowData[header.name]?.name}</div>
                          ) : header.name === 'industry_subcategory' ? (
                            <div>{rowData[header.name]?.name}</div>
                          ) : header.name === 'is_discussion_required' ? (
                            <div>
                              {rowData?.is_discussion_required ? (
                                <ToolTip
                                  className={styles.toolTip}
                                  text={'John Doe | Aug 25, 2023 | 18:10'}
                                  icon={
                                    <SvgComponent name={'MarkChatUnread'} />
                                  }
                                />
                              ) : (
                                ''
                              )}
                            </div>
                          ) : header.name === 'recruiter' ? (
                            <div>
                              {rowData[header.name]?.first_name}
                              {rowData[header.name]?.last_name}
                            </div>
                          ) : (
                            rowData[header.name]
                          )}
                        </td>
                      ))}
                    {optionsConfig && (
                      <td
                        className="options"
                        style={{ zIndex: toggleZindex === index ? 10 : 1 }}
                      >
                        {renderOptions(rowData, index)}
                      </td>
                    )}
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

export default TableList;
