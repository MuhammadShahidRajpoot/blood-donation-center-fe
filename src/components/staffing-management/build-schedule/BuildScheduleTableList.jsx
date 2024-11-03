/* eslint-disable */
import React, { useState } from 'react';
import SvgComponent from '../../common/SvgComponent';
import Flag from '../../../assets/flag.svg';
import Lock from '../../../assets/lock.svg';
import { useNavigate } from 'react-router-dom';
import * as _ from 'lodash';
import '../index.module.scss';
import { DashDateFormat } from '../../../helpers/formatDate';
import styles from './styles.module.scss';
const BuildScheduleTableList = ({
  isLoading,
  data,
  userData,
  headers,
  handleSort,
  optionsForLockedSchedule,
  optionsForDraftStatus,
  optionsForFlaggedDraftStatus,
  optionsForPublishedStatus,
  setTableHeaders,
}) => {
  const navigate = useNavigate();
  const [deletedTableHeader, setDeletedTableHeader] = useState(headers);
  const [selected, setSelected] = useState(0);

  const renderOptions = (rowData) => {
    return (
      <div className="dropdown-center">
        <div
          className="optionsIcon"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          id="dropdownMenuButton"
        >
          <SvgComponent name={'ThreeDots'} />
        </div>
        {/* schedule is locked */}
        {rowData.schedule.schedule_is_locked ? (
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {optionsForLockedSchedule?.map((option) =>
              rowData.schedule.created_by === userData?.id &&
              option.label === 'Edit' ? (
                <React.Fragment key={option.label}>
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
                    >
                      {rowData.schedule.schedule_is_locked && option.label}
                    </a>
                  </li>
                </React.Fragment>
              ) : option.label === 'View' ? (
                <React.Fragment key={option.label}>
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
                    >
                      {rowData.schedule.schedule_is_locked && option.label}
                    </a>
                  </li>
                </React.Fragment>
              ) : (
                ''
              )
            )}
          </ul>
        ) : (
          <>
            {/* schedule is not locked */}
            {/*  status published */}
            {rowData.schedule['schedule_schedule_status'] === 'Published' && (
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                {optionsForPublishedStatus?.map((option) => (
                  <React.Fragment key={option.label}>
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
                      >
                        {option.label}
                      </a>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            )}
            {/* status draft - not flagged */}
            {!rowData.schedule.schedule_is_flagged &&
              rowData.schedule['schedule_schedule_status'] === 'Draft' && (
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  {optionsForDraftStatus?.map((option) => (
                    <React.Fragment key={option.label}>
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
                        >
                          {option.label}
                        </a>
                      </li>
                    </React.Fragment>
                  ))}
                </ul>
              )}
            {/* status draft - flagged */}
            {rowData.schedule.schedule_is_flagged &&
              rowData.schedule['schedule_schedule_status'] === 'Draft' && (
                <ul
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  {optionsForFlaggedDraftStatus?.map((option) => (
                    <React.Fragment key={option.label}>
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
                        >
                          {option.label}
                        </a>
                      </li>
                    </React.Fragment>
                  ))}
                </ul>
              )}
          </>
        )}
      </div>
    );
  };
  const checkboxTableItems = [
    'Name',
    'Primary Phone',
    'Primary Email',
    'Roles',
    'Collection Operation',
    'Team',
    'Classification',
    'Status',
  ];
  const handleCheckbox = (e, label, i) => {
    const dupArr = [...headers];
    const index = dupArr.findIndex((data) => data.label === label);
    dupArr[index].checked = !dupArr[index].checked;
    setTableHeaders(dupArr);
    setDeletedTableHeader([...deletedTableHeader]);
  };
  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {_.compact(headers)
                .filter((item) => item.checked)
                .map((header) => (
                  <th
                    key={header.name}
                    width={header.width}
                    style={{ minWidth: `${header.minWidth}` }}
                    align="center"
                  >
                    <div className="inliner">
                      <div
                        className="title"
                        style={{
                          paddingLeft:
                            header.label === 'Operation Status'
                              ? '40px'
                              : '35px',
                        }}
                      >
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
              <th align="center">
                <div className="flex align-items-center justify-content-center">
                  <div className="account-list-header dropdown-center ">
                    <ul className="dropdown-menu">
                      {checkboxTableItems.map((option, index) => (
                        <li key={option}>
                          <div className="flex align-items-center gap-2 checkboxInput">
                            <input
                              type="checkbox"
                              value={headers.some(
                                (item) => item?.label === option && item.checked
                              )}
                              checked={headers.some(
                                (item) => item?.label === option && item.checked
                              )}
                              style={{
                                height: '20px',
                                width: '20px',
                                borderRadius: '4px',
                              }}
                              onChange={(e) => handleCheckbox(e, option, index)}
                            />
                            <span style={{ fontSize: '14px' }}>{option}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                  <tr
                    key={`${rowData.schedule.schedule_id}-${index}-${rowData.schedule['schedule_schedule_status']}`}
                  >
                    {_.compact(headers)
                      // .filter((item) => item.checked)
                      .map((header, index) => (
                        <td
                          key={`${rowData.schedule.schedule_id}-${index}`}
                          style={{
                            position: 'relative',
                            textAlign: 'center',
                            textAlign:
                              header.name !== 'businessUnit_name'
                                ? 'center'
                                : 'left',
                          }}
                        >
                          {header.name === 'schedule_schedule_status' ? (
                            rowData.schedule[header.name] === 'Published' ? (
                              <div
                                style={{
                                  paddingLeft: '28px',
                                  textAlign: 'left',
                                }}
                              >
                                <span className="badge active">Published</span>
                              </div>
                            ) : (
                              <div
                                style={{
                                  paddingLeft: '28px',
                                  textAlign: 'left',
                                }}
                              >
                                <span className="badge inactive">Draft</span>
                              </div>
                            )
                          ) : header.name === 'businessUnit_name' ? (
                            <div>
                              {rowData.schedule.schedule_is_flagged &&
                              rowData.schedule.schedule_is_locked ? (
                                <div>
                                  <div className={styles.tooltip}>
                                    <img
                                      src={Flag}
                                      alt=""
                                      height={'20px'}
                                      width={'20px'}
                                      style={{
                                        position: 'absolute',
                                        left: '-22px',
                                      }}
                                    />
                                    <span className={styles.tooltiptext}>
                                      Requires Updates
                                    </span>
                                  </div>
                                  <div className={styles.tooltip}>
                                    <img
                                      src={Lock}
                                      alt=""
                                      height={'20px'}
                                      width={'20px'}
                                      style={{
                                        position: 'absolute',
                                        left: '0px',
                                      }}
                                    />
                                    <span className={styles.tooltiptext}>
                                      Locked by {rowData.locked_by?.first_name}{' '}
                                      {rowData.locked_by?.last_name}
                                    </span>
                                  </div>
                                  <div style={{ paddingLeft: '35px' }}>
                                    {rowData.schedule[header.name]}
                                  </div>
                                </div>
                              ) : rowData.schedule.schedule_is_flagged ? (
                                <div>
                                  <div className={styles.tooltip}>
                                    <img
                                      src={Flag}
                                      alt=""
                                      height={'20px'}
                                      width={'20px'}
                                      style={{
                                        position: 'absolute',
                                        left: '0px',
                                      }}
                                    />
                                    <span className={styles.tooltiptext}>
                                      Requires Updates
                                    </span>
                                  </div>
                                  <div style={{ paddingLeft: '35px' }}>
                                    {rowData.schedule[header.name]}
                                  </div>
                                </div>
                              ) : rowData.schedule.schedule_is_locked ? (
                                <div>
                                  <div className={styles.tooltip}>
                                    <img
                                      src={Lock}
                                      alt=""
                                      height={'20px'}
                                      width={'20px'}
                                      style={{
                                        position: 'absolute',
                                        left: '0px',
                                      }}
                                    />
                                    <span className={styles.tooltiptext}>
                                      Locked by {rowData.locked_by?.first_name}{' '}
                                      {rowData.locked_by?.last_name}
                                    </span>
                                  </div>
                                  <div style={{ paddingLeft: '35px' }}>
                                    {rowData.schedule[header.name]}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ paddingLeft: '35px' }}>
                                    {rowData.schedule[header.name]}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : header.name === 'schedule_start_date' ? (
                            <div
                              style={{ paddingLeft: '35px', textAlign: 'left' }}
                            >
                              {DashDateFormat(rowData.schedule[header.name])}
                            </div>
                          ) : header.name === 'schedule_end_date' ? (
                            <div
                              style={{ paddingLeft: '35px', textAlign: 'left' }}
                            >
                              {DashDateFormat(rowData.schedule[header.name])}
                            </div>
                          ) : header.name === 'totalOperations' ? (
                            <div
                              style={{ paddingLeft: '75px', textAlign: 'left' }}
                            >
                              {rowData[header.name]}
                            </div>
                          ) : header.name === 'fullyStaffed' ? (
                            <div
                              style={{ paddingLeft: '75px', textAlign: 'left' }}
                            >
                              {rowData[header.name]}
                            </div>
                          ) : (
                            rowData.schedule[header.name] || 'N/A'
                          )}
                        </td>
                      ))}
                    {optionsForDraftStatus &&
                      optionsForLockedSchedule &&
                      optionsForPublishedStatus && (
                        <td
                          className="options"
                          style={{
                            zIndex: selected === index ? 1 : 0,
                          }}
                          onClick={() => setSelected(index)}
                        >
                          {renderOptions(rowData)}
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
export default BuildScheduleTableList;
