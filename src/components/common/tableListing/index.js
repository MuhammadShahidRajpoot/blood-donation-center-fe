import React, { useContext, useEffect, useState } from 'react';
import SvgComponent from '../SvgComponent';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import CalendarCheck from '../../../assets/calendar-check.svg';
import CalendarCheckAlt from '../../../assets/calendar-check-alt.svg';
import Error from '../../../assets/error.svg';
import ToolTip from '../tooltip';
import { OverlayTrigger, Tooltip as BSTooltip } from 'react-bootstrap';
import { formatUser } from '../../../helpers/formatUser';
import styles from './index.module.scss';
import SelectDropdown from '../selectDropdown';
import DatePicker from 'react-datepicker';
import { OperationStatus } from '../../crm/donors_centers/sessionHistory/SessionHistoryUtils';
import './index.module.scss';
import CheckBoxFilterClosed from '../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../assets/images/checkbox-filter-open.png';
import Dropdown from 'react-bootstrap/Dropdown';
import CustomAudioPlayer from '../CustomAudioPlayer';
import FormInput from '../form/FormInput';
import { truncateTo50 } from '../../../helpers/utils';
import { GlobalContext } from '../../../Context/Context';

const DESCRIPTION_TRUNCATE_LENGTH = 50;

const TableList = ({
  isLoading,
  data,
  removeData,
  headers,
  handleSort,
  optionsConfig,
  checkboxValues = [],
  handleCheckboxValue,
  handleCheckbox,
  current,
  selectOptions,
  selectValues,
  setSelectValues,
  showVerticalLabel = false,
  showActionsLabel = true,
  favorite,
  dateValues,
  setDateValues,
  showAllCheckBoxListing = true,
  selectSingle = false,
  showAllRadioButtonListing = false,
  showExpiredFilterStatus = false,
  drive = false,
  enableColumnHide = false,
  noDataFoundText = null,
  listSectionName = 'Data',
  statusClassMapping = null,
  handleFieldInputChange,
  colorLables = null,
  customNoDataFoundText = null,
  minHeightTableListing = false,
  isFromDailingCenter = false,
}) => {
  const navigate = useNavigate();
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);
  const { handleLocationClick } = useContext(GlobalContext);

  const renderOptions = (rowData, index) => {
    if (
      optionsConfig.length === 1 &&
      optionsConfig[0].label === 'RemoveSelectedRow'
    ) {
      return (
        <div className="dropdown-center">
          <div
            className="optionsIcon"
            aria-expanded="false"
            onClick={() => {
              removeData([]);
            }}
          >
            <SvgComponent name={'DrivesCrossIcon'} />
          </div>
        </div>
      );
    }
    if (
      optionsConfig.length === 1 &&
      optionsConfig[0].label === 'Start Calling'
    ) {
      const isDisabledStartCallingBtn =
        rowData.status === 'cancelled' ||
        rowData.status === 'complete' ||
        rowData.disable_call_initiation;
      return (
        <button
          disabled={isDisabledStartCallingBtn}
          className={`${styles.startCallingBtn} ${
            isDisabledStartCallingBtn ? styles.disabledStartCallingBtn : ''
          }`}
          onClick={() => handleStartCallingBtnClick(rowData?.id)}
        >
          Start Calling
        </button>
      );
    }
    var filteredOptions;
    if (rowData.default) {
      filteredOptions = optionsConfig?.filter(
        (option) => !(option.label === 'Set as Default')
      );
    } else {
      filteredOptions = optionsConfig?.filter(
        (option) => !(rowData?.hideOption && option.label === 'Cancel')
      );
    }
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
          {filteredOptions.map((option) => (
            <li key={option?.label}>
              <a
                id={option.id}
                style={
                  option?.disabled
                    ? option.disabled(rowData)
                      ? { pointerEvents: 'none', color: '#ccc' }
                      : {}
                    : {}
                }
                className="dropdown-item"
                onClick={(e) => {
                  if (option?.openNewTab?.(rowData)) {
                    return;
                  }
                  if (!(e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (option?.disabled) {
                      const disable = option.disabled(rowData);
                      if (disable) return;
                    }
                    if (option.path) {
                      const path = option.path(rowData);
                      navigate(path);
                    } else if (option.action) {
                      option.action(rowData);
                    }
                  }
                }}
                href={option.path ? option.path(rowData) : '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {option.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  useEffect(() => {
    if (enableColumnHide && headers && headers.length) {
      const defaultHidden = headers
        .map((h) => (h.defaultHidden ? h.name : null))
        .filter((h) => h);
      setColumnList(defaultHidden);
    }
  }, [enableColumnHide, headers]);

  const handleColumnCheckbox = (e, label) => {
    let defaultHidden = columnList;
    if (e.target.checked) {
      defaultHidden = defaultHidden.filter((h) => h !== label);
    } else {
      defaultHidden = [...defaultHidden, label];
    }
    setColumnList(defaultHidden);
  };

  const handleStartCallingBtnClick = (rowData) => {
    handleLocationClick(false);
    navigate(`/call-center/dialing-center/call-jobs/${rowData}/start`, {
      state: { from: '/call-center/dialing-center/call-jobs' },
    });
  };

  const setDropdown = () => {
    setShowColumnToggle(!showColumnToggle);
  };

  const truncateDescription = (description, maxLength) => {
    if (description?.length > maxLength) {
      return description?.substring(0, maxLength) + '...';
    }
    return description;
  };

  const handleDateChange = (val, rowId) => {
    const updatedDateValues = dateValues.map((item) => {
      if (item.id === rowId) {
        return { ...item, date: val };
      }
      return item;
    });
    setDateValues(updatedDateValues);
  };

  const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleChecked = (e) => {
    if (!showAllRadioButtonListing) e.preventDefault();
    const { name, value } = e.target;

    switch (name) {
      case 'all':
        handleCheckbox(
          checkboxValues?.length
            ? []
            : data.map((rowData) => handleCheckboxValue(rowData).toString())
        );
        break;

      default:
        if (showAllRadioButtonListing) {
          handleCheckbox([value]);
        } else if (checkboxValues?.indexOf(value) === -1) {
          handleCheckbox([...checkboxValues, value]);
        } else {
          handleCheckbox(checkboxValues.filter((row) => row !== value));
        }
        break;
    }
  };

  // const handleCheckedRadioButton = (e) => {
  //   e.preventDefault();
  //   const { name, value } = e.target;
  //   console.log({ name }, { value });
  //   // switch (name) {
  //   //   case 'all':
  //   //     handleCheckbox(
  //   //       checkboxValues?.length
  //   //         ? []
  //   //         : data.map((rowData) => handleCheckboxValue(rowData))
  //   //     );
  //   //     break;

  //   //   default:
  //   //     if (checkboxValues?.indexOf(value) === -1) {
  //   //       handleCheckbox([...checkboxValues, value]);
  //   //     } else {
  //   //       handleCheckbox(checkboxValues.filter((row) => row !== value));
  //   //     }
  //   //     break;
  //   // }
  // };
  const CheckboxInput = ({ value, ...otherProps }) => (
    <input
      type="checkbox"
      value={value}
      style={{
        height: '15px',
        width: '15px',
      }}
      {...otherProps}
    />
  );

  const renderCommunicationSubjectColumn = (rowData) => {
    const message = rowData;
    return (
      <span onClick={() => openPopup(message)} className="linkable">
        {truncateTo50(message?.communications_subject)}
      </span>
    );
  };

  const renderNoteNameColumn = (rowData) => {
    const note = {
      note_name: rowData?.note_name,
      details: rowData?.details,
    };
    return (
      <span onClick={() => openNotePopup(note)} className="linkable">
        {rowData?.note_name}
      </span>
    );
  };

  const [communicationPopup, setCommunicationPopup] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState('');
  const [notePopup, setNotePopup] = useState(false);
  const [noteMessage, setNoteMessage] = useState({});

  // Function to open the popup and set the message details
  const openPopup = (message) => {
    setCommunicationMessage(message);
    setCommunicationPopup(true);
  };

  const openNotePopup = (message) => {
    setNoteMessage(message);
    setNotePopup(true);
  };

  const convertHTMLToPlainText = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return truncateDescription(doc?.body?.textContent, 30);
  };
  const setDefault = (id, label) => {
    if (drive) {
      const dupArr = { ...selectValues };
      dupArr[id] = label;
      setSelectValues(dupArr);
    }
  };
  return (
    <>
      <div className="table-listing-main">
        <div
          className="table-responsive"
          style={{ minHeight: minHeightTableListing && '160px' }}
        >
          <table
            className={`table table-striped ${optionsConfig && 'hasOptions'}`}
          >
            <thead>
              <tr>
                {showAllCheckBoxListing && handleCheckboxValue && (
                  <th width={'1%'} align="center">
                    <CheckboxInput
                      name="all"
                      checked={
                        data?.length && checkboxValues?.length === data?.length
                      }
                      onChange={handleChecked}
                    />
                  </th>
                )}
                {/* {showAllRadioButtonListing && showAllRadioButtonListing && (
                  <th width={'1%'} align="center">
                    <FormRadioButtons
                      name="all"
                      checked={
                        data?.length && checkboxValues?.length === data?.length
                      }
                      onChange={handleChecked}
                    />
                  </th>
                )} */}
                {!showAllCheckBoxListing && (
                  <th width={'1%'} align="center">
                    <p></p>
                  </th>
                )}
                {headers?.map((header, index) => (
                  <>
                    {header.type === 'custom-component' &&
                    header.showInHeader ? (
                      <th>{header.component()}</th>
                    ) : (
                      <th
                        key={`${header?.name}-${header?.label}-${index}`}
                        // width={
                        //   header.label === 'Status'
                        //     ? '5%'
                        //     : header.label === 'status'
                        //     ? '5%'
                        //     : header.name === 'Status'
                        //     ? '5%'
                        //     : header.name === 'status'
                        //     ? '5%'
                        //     : header.name === 'type'
                        //     ? '15%'
                        //     : index === headers?.length - 1
                        //     ? '5%'
                        //     : header.width
                        // }
                        align="center"
                        className={`
                      ${header.headerclassName ? header.headerclassName : ''} ${
                        columnList.includes(header.name) ? 'd-none' : ''
                      }`}
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
                          {header?.sortable &&
                            header?.label !== 'Attachments' && (
                              <div
                                className="sort-icon"
                                onClick={() => {
                                  const name = header?.sortBy
                                    ? header?.sortBy
                                    : header?.name;
                                  handleSort(name);
                                }}
                              >
                                <SvgComponent
                                  id={header?.id}
                                  name={'SortIcon'}
                                />
                              </div>
                            )}
                          {header?.tooltip && header.tooltipText && (
                            <div className="ms-2">
                              <ToolTip
                                bottom={true}
                                text={header.tooltipText}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    )}
                  </>
                ))}
                {optionsConfig && (
                  <th width="150px" align="center" style={{ zIndex: 10 }}>
                    {showActionsLabel ? (
                      <div className="inliner justify-content-center">
                        <span className="title">Actions</span>
                      </div>
                    ) : null}
                    {enableColumnHide ? (
                      <div className="flex align-items-center justify-content-center">
                        <div className="account-list-header dropdown-center ">
                          <Dropdown
                            show={showColumnToggle}
                            onToggle={setDropdown}
                          >
                            <Dropdown.Toggle
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 'unset',
                                margin: 'unset',
                              }}
                              onClick={setDropdown}
                            >
                              {showColumnToggle ? (
                                <img
                                  src={CheckBoxFilterOpen}
                                  style={{ width: '18px', height: '16px' }}
                                />
                              ) : (
                                <img
                                  src={CheckBoxFilterClosed}
                                  style={{ width: '18px', height: '16px' }}
                                />
                              )}
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              style={{ width: '140px' }}
                              align={'center'}
                            >
                              {headers.map((option, index) => (
                                <li key={index}>
                                  <div className="flex align-items-center gap-2 checkboxInput">
                                    <input
                                      type="checkbox"
                                      value={option.name}
                                      checked={
                                        !columnList.includes(option.name)
                                      }
                                      style={{
                                        height: '20px',
                                        width: '20px',
                                        borderRadius: '4px',
                                      }}
                                      id={'columnHideHeader' + index}
                                      onChange={(e) =>
                                        handleColumnCheckbox(e, option.name)
                                      }
                                    />
                                    <label htmlFor={'columnHideHeader' + index}>
                                      {option.label}
                                    </label>
                                  </div>
                                </li>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    ) : null}
                  </th>
                )}
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
                data.map((rowData, rowIndex) => {
                  const checkboxValue =
                    handleCheckboxValue && handleCheckboxValue(rowData);
                  return (
                    <tr
                      className={`${
                        current && current === rowData.id && styles.current
                      } ${rowData.default ? 'defaultRow' : ''}`}
                      key={rowData.id}
                      style={
                        isFromDailingCenter ? { borderBottom: 'none' } : {}
                      }
                    >
                      {handleCheckboxValue &&
                        showAllRadioButtonListing === false && (
                          <td width={'1%'}>
                            <CheckboxInput
                              name={rowData.id}
                              value={checkboxValue}
                              checked={checkboxValues?.includes(
                                checkboxValue?.toString()
                              )}
                              onChange={handleChecked}
                              disabled={
                                selectSingle &&
                                checkboxValues.length &&
                                !checkboxValues?.includes(checkboxValue)
                              }
                              className="mt-1"
                            />
                          </td>
                        )}
                      {handleCheckboxValue && showAllRadioButtonListing && (
                        <td>
                          <input
                            type="radio"
                            name={rowData.id}
                            value={checkboxValue}
                            checked={checkboxValues?.includes(
                              checkboxValue?.toString()
                            )}
                            onChange={handleChecked}
                          />
                        </td>
                      )}

                      {headers.map((header, index) => (
                        <td
                          style={
                            (header.type
                              ? header.type === 'noWrap'
                                ? {
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                    minWidth:
                                      header.type === 'select'
                                        ? '230px'
                                        : 'auto',
                                  }
                                : {
                                    position: 'relative',
                                    wordBreak: 'keep-all',
                                    minWidth:
                                      header.type === 'select'
                                        ? '230px'
                                        : 'auto',
                                  }
                              : { backgroundClip: 'padding-box' },
                            header.name === 'event_status' ||
                            header.name === 'total_hours'
                              ? {
                                  textAlign: 'left',
                                }
                              : {})
                          }
                          className={`
                            ${
                              favorite
                                ? 'position-relative'
                                : header.className
                                ? header.className
                                : ''
                            } ${
                              columnList.includes(header.name) ? 'd-none' : ''
                            }`}
                          key={`${rowData.id}-${header.name}-${header.label}-${index}`}
                        >
                          {index === 0 &&
                            showVerticalLabel &&
                            rowData?.verticalLabel && (
                              <div
                                className={`position-absolute top-0 d-flex justify-content-center align-items-center ${styles.verticalLabelContainer}`}
                              >
                                <span
                                  className={`p-0 m-0 ${styles.verticalLabelText}`}
                                >
                                  {rowData?.verticalLabel}
                                </span>
                              </div>
                            )}
                          {[
                            'is_generate_online_appointments',
                            'expires',
                          ]?.includes(header.name) ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : (header.name === 'status' ||
                              header.type === 'status') &&
                            statusClassMapping ? (
                            <span
                              className={`badge ${
                                statusClassMapping[rowData[header.name]]
                              }`}
                            >
                              {colorLables[rowData[header.name]]}
                            </span>
                          ) : ['is_active', 'status']?.includes(header.name) &&
                            !statusClassMapping ? (
                            rowData?.className ? (
                              <span className={rowData?.className}>
                                {rowData?.status}
                              </span>
                            ) : rowData[header.name] ? (
                              <span className="badge active">Active</span>
                            ) : (
                              <span className="badge inactive">
                                {showExpiredFilterStatus
                                  ? 'Expired'
                                  : 'Inactive'}
                              </span>
                            )
                          ) : header.name === 'communications_subject' ? (
                            renderCommunicationSubjectColumn(rowData)
                          ) : header.name === 'communications_status' ? (
                            rowData?.className ? (
                              <span className={rowData?.className}>
                                {rowData?.status}
                              </span>
                            ) : rowData[header.name] === 'sent' ? (
                              <span className="badge active">Sent</span>
                            ) : rowData[header.name] === 'delivered' ? (
                              <span className="badge active">Delivered</span>
                            ) : (
                              <span className="badge inactive">
                                Already Sent
                              </span>
                            )
                          ) : header.name === 'event_status' ? (
                            <span
                              className={`badge ${
                                OperationStatus[
                                  rowData?.event_status?.toLowerCase()
                                ]
                              }`}
                            >
                              {rowData?.event_status}
                            </span>
                          ) : header.name ===
                            'communications_listing_message' ? (
                            <span>
                              {convertHTMLToPlainText(
                                rowData?.communications_listing_message
                              )}
                            </span>
                          ) : header.name === 'assigned_by' ? (
                            <span>
                              {truncateTo50(
                                formatUser(rowData?.assigned_by, 1)
                              )}
                            </span>
                          ) : header.name === 'expired' ? (
                            rowData[header.name] ? (
                              <span>Yes</span>
                            ) : (
                              <span>No</span>
                            )
                          ) : header.name === 'date' &&
                            header?.link &&
                            header.link === true ? (
                            <a
                              rel="noreferrer"
                              target="_blank"
                              href={`/operations-center/operations/non-collection-events/${rowData?.eventid}/view/about`}
                            >
                              {moment(rowData.date).format('YYYY-MM-DD')}
                            </a>
                          ) : header.name === 'date' ? (
                            <span>
                              {moment(rowData.date).format('MM-DD-YYYY')}
                            </span>
                          ) : header.name === 'job_start_date' ? (
                            <span>{formatDate(rowData.job_start_date)}</span>
                          ) : header.name === 'operation_date' ? (
                            <span>{formatDate(rowData.operation_date)}</span>
                          ) : header.name === 'job_progress' ? (
                            <span style={{ display: 'inline-block' }}>
                              <progress
                                style={{
                                  width: '95px',
                                  height: '30px',
                                  verticalAlign: 'middle',
                                  marginRight: '5px',
                                }}
                                value={rowData.actual_calls}
                                max={rowData.planned_calls}
                              ></progress>{' '}
                              <span style={{ fontSize: '14px' }}>
                                {rowData.actual_calls}/{rowData.planned_calls} (
                                {rowData.job_progress}
                                %)
                              </span>
                            </span>
                          ) : header.name === 'donor_number' ? (
                            <span>
                              {rowData[header.name]
                                ? rowData[header.name]
                                : 'N/A'}
                            </span>
                          ) : header.name === 'assigned_to' ? (
                            <span>
                              {truncateTo50(
                                formatUser(rowData?.assigned_to, 1)
                              )}
                            </span>
                          ) : header.name === 'attachment_files' ? (
                            header.icon ? (
                              <span className="d-flex align-items-center">
                                {!rowData[header.name] && 'N/A'}
                                {rowData[header.name]?.includes('.pdf') ? (
                                  <>
                                    <span className="flex-shrink-0">
                                      <SvgComponent name="PdfIcon" />
                                    </span>
                                    <p className="mb-0 ms-1">
                                      {rowData[header.name]}
                                    </p>
                                  </>
                                ) : rowData[header.name]?.includes('.jpg') ||
                                  rowData[header.name]?.includes('.jpeg') ||
                                  rowData[header.name]?.includes('.png') ? (
                                  <>
                                    <span className="flex-shrink-0">
                                      <SvgComponent name="image" />
                                    </span>
                                    <p className="mb-0 ms-1">
                                      {rowData[header.name]}
                                    </p>
                                  </>
                                ) : (
                                  rowData[header.name]?.includes('.docx') && (
                                    <>
                                      <span className="flex-shrink-0">
                                        <SvgComponent name="WordIcon" />
                                      </span>
                                      <p className="mb-0 ms-1">
                                        {rowData[header.name]}
                                      </p>
                                    </>
                                  )
                                )}
                              </span>
                            ) : (
                              ''
                            )
                          ) : header.name === 'due_date' ? (
                            header.icon ? (
                              <div
                                className="d-flex"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                <img
                                  className="me-2"
                                  src={
                                    moment(rowData.due_date).isBefore(
                                      new Date().toISOString().split('T')[0]
                                    )
                                      ? CalendarCheckAlt
                                      : CalendarCheck
                                  }
                                  alt=""
                                />
                                {moment(rowData.due_date).format('MM-DD-YYYY')}
                              </div>
                            ) : (
                              <div
                                className="d-flex"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                {moment(rowData.due_date).format('MM-DD-YYYY')}
                                <img
                                  className="ms-2"
                                  src={
                                    moment(rowData.due_date).isBefore(
                                      new Date().toISOString().split('T')[0]
                                    )
                                      ? Error
                                      : ''
                                  }
                                  alt=""
                                />
                              </div>
                            )
                          ) : [
                              'description',
                              'short_description',
                              'direction',
                              'note',
                            ].includes(header.name) ? (
                            <div>
                              {truncateDescription(
                                rowData[header.name],
                                DESCRIPTION_TRUNCATE_LENGTH
                              )}
                            </div>
                          ) : header.name === 'is_goal_type' ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : header.name === 'donation_status' ? (
                            rowData[header.name] == 1 ? (
                              'Donation'
                            ) : (
                              'Deferral'
                            )
                          ) : header.name === 'schedulable' ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : header.name === 'hold_resources' ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : header.name === 'contribute_to_scheduled' ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : header.name === 'parent_id' ? (
                            <span>{rowData?.parent_id?.name}</span>
                          ) : header.name === 'requires_approval' ? (
                            rowData[header.name] ? (
                              'Yes'
                            ) : (
                              'No'
                            )
                          ) : header.name === 'applies_to' ? (
                            rowData?.applies_to?.length ? (
                              rowData?.applies_to.map((appliesToData, key) => (
                                <span key={key}>
                                  {key === 0
                                    ? appliesToData
                                    : ',' + appliesToData}
                                </span>
                              ))
                            ) : (
                              ''
                            )
                          ) : header.name === 'procedure_types_products' ? (
                            rowData?.procedure_types_products?.length ? (
                              rowData?.procedure_types_products?.map(
                                (procedureTypesProduct, key) => (
                                  <span className="badge" key={key}>
                                    {procedureTypesProduct?.products?.name}
                                  </span>
                                )
                              )
                            ) : (
                              ''
                            )
                          ) : header.name === 'procedure_type_id' ? (
                            typeof rowData?.procedure_type_id === 'string' ? (
                              truncateTo50(rowData?.procedure_type_id)
                            ) : (
                              truncateTo50(rowData?.procedure_type_id?.name)
                            )
                          ) : header.name === 'procedure_products' ? (
                            rowData?.procedure_products?.length ? (
                              rowData?.procedure_products?.map(
                                (procedureTypesProduct, key) => (
                                  <span className="badge" key={key}>
                                    {procedureTypesProduct?.products?.name}
                                  </span>
                                )
                              )
                            ) : (
                              ''
                            )
                          ) : header.name === 'collection_operation' ? (
                            rowData?.collectionOperations?.length ? (
                              truncateTo50(
                                rowData?.collectionOperations
                                  ?.map((co) => co?.collection_operation_name)
                                  ?.join(', ')
                              )
                            ) : (
                              ''
                            )
                          ) : header.name === 'collection_operation_name' ? (
                            rowData?.collection_operation_name ? (
                              truncateTo50(rowData?.collection_operation_name)
                            ) : (
                              truncateTo50(
                                rowData?.collection_operation?.name || ''
                              )
                            )
                          ) : header.name === 'organization_level_names' ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={(props) => (
                                <BSTooltip {...props}>
                                  {rowData?.organization_level_names_tooltip}
                                </BSTooltip>
                              )}
                            >
                              <div>{rowData?.organization_level_names}</div>
                            </OverlayTrigger>
                          ) : header.name === 'parentCategory' ? (
                            <span>
                              {rowData.parentCategoryName
                                ? rowData.parentCategoryName
                                : rowData.name}
                            </span>
                          ) : header.name === 'task_applies_to' ? (
                            <span>{rowData.applies_to}</span>
                          ) : header.name === 'city' ? (
                            <span>
                              {rowData?.address?.city ?? rowData?.city}
                            </span>
                          ) : header.name === 'state' ? (
                            <span>
                              {rowData?.address?.state ?? rowData?.state}
                            </span>
                          ) : header.name === 'task_collection_operation' ? (
                            <span>{rowData.collection_operation}</span>
                          ) : header.type === 'date-picker' ? (
                            <div className="form-field">
                              <div className="field position-relative">
                                <label
                                  style={{
                                    fontSize: '12px',
                                    top: '10%',
                                    color: '#555555',
                                    zIndex: 1,
                                    position: 'absolute',
                                    left: '8%',
                                  }}
                                >
                                  Start Date*
                                </label>
                                <DatePicker
                                  dateFormat="MM/dd/yyyy"
                                  className={styles.datePickerHelper}
                                  placeholderText="Start Date*"
                                  selected={
                                    dateValues.find(
                                      (item) => item.id == rowData.id
                                    )?.date || null
                                  }
                                  maxDate={new Date()}
                                  onChange={(val) => {
                                    handleDateChange(val, rowData.id);
                                  }}
                                />
                              </div>
                            </div>
                          ) : header.name === 'retire_on' ? (
                            rowData.retire_on ? (
                              <div
                                className="d-flex"
                                style={{ whiteSpace: 'nowrap' }}
                              >
                                <img
                                  className="me-2"
                                  src={
                                    moment(
                                      rowData.retire_on,
                                      'MM-DD-YYYY'
                                    ).isBefore(moment().startOf('day'))
                                      ? CalendarCheckAlt
                                      : CalendarCheck
                                  }
                                  alt=""
                                />
                                {moment(rowData.retire_on, 'MM-DD-YYYY').format(
                                  'MM-DD-YYYY'
                                )}
                              </div>
                            ) : (
                              '-'
                            )
                          ) : header.type === 'select' ? (
                            <SelectDropdown
                              selectedValue={
                                drive
                                  ? selectValues[rowData?.id] ??
                                    setDefault(rowData?.id, {
                                      is_primary_chairperson:
                                        rowData?.is_primary_chairperson,
                                      label: rowData?.role_name,
                                      value: rowData?.role_id,
                                    })
                                  : selectValues[rowData?.id] || ''
                              }
                              removeDivider
                              removeTheClearCross
                              placeholder={header.label}
                              name={header.label}
                              options={selectOptions}
                              onChange={(e) => {
                                const dupArr = { ...selectValues };
                                dupArr[rowData?.id] = e;
                                setSelectValues(dupArr);
                              }}
                            />
                          ) : header.type === 'voice_recording' &&
                            rowData.is_voice_recording &&
                            rowData?.file_attachment?.attachment_path ? (
                            <CustomAudioPlayer
                              src={rowData?.file_attachment?.attachment_path}
                              audioBlob={rowData?.audio_blob}
                            />
                          ) : header.type === 'input_field' ? (
                            <div className="mt-3 w-50">
                              <FormInput
                                value={rowData[header.name]}
                                onChange={(e) => {
                                  console.log('changed' + e.target.value);
                                  handleFieldInputChange(
                                    rowData,
                                    header.name,
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          ) : header.type === 'custom-component' ? (
                            header.component(rowData)
                          ) : header.name === 'attachment_name' ? (
                            rowData.attachment_files?.length > 0 ? (
                              <Link
                                to={
                                  rowData.attachment_files?.[0].attachment_path
                                }
                                target="_blank"
                              >
                                {rowData.name} (
                                {rowData.attachment_files?.length})
                              </Link>
                            ) : (
                              `${rowData.name}`
                            )
                          ) : header.name === 'note_name' ? (
                            renderNoteNameColumn(rowData)
                          ) : header?.toolTip === true &&
                            header?.maxCharacters ? (
                            rowData[header.name]?.length >
                            header.maxCharacters ? (
                              <ToolTip
                                nceTooltip={true}
                                bottom={
                                  data.length < 4 ||
                                  (rowIndex + 1 !== data.length &&
                                    ((rowIndex + 2 === data.length &&
                                      rowData[header.name]?.length < 120) ||
                                      rowIndex + 2 !== data.length))
                                }
                                icon={`${rowData[header.name]?.substring(
                                  0,
                                  header.maxCharacters
                                )}...`}
                                text={rowData[header.name]}
                              />
                            ) : (
                              rowData[header.name]
                            )
                          ) : (
                            <span
                              className={`d-inline-block text-truncate ${
                                header.innerClassName
                                  ? header.innerClassName
                                  : ''
                              }`}
                              style={{ maxWidth: header?.maxWidth ?? '' }}
                            >
                              {truncateTo50(rowData[header.name])}
                            </span>
                          )}
                        </td>
                      ))}

                      {optionsConfig && (
                        <td
                          className="options"
                          style={{ zIndex: toggleZindex === rowIndex ? 10 : 1 }}
                        >
                          {renderOptions(rowData, rowIndex)}
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="no-data" colSpan={headers?.length + 1}>
                    {customNoDataFoundText
                      ? customNoDataFoundText
                      : `No ${listSectionName} ${
                          showAllCheckBoxListing ? 'Found' : 'Selected'
                        }`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <section
        className={`popup ${styles.communicationMessagePopup} full-section ${
          communicationPopup ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <div className="content">
            <h3>Message</h3>
            <div className="subject">
              <span>
                Subject: {communicationMessage?.communications_subject}
              </span>
            </div>
            <div
              className="content"
              dangerouslySetInnerHTML={{
                __html: communicationMessage?.communications_message,
              }}
            />
            <div className="close" onClick={() => setCommunicationPopup(false)}>
              Close
            </div>
          </div>
        </div>
      </section>

      <section
        className={`popup ${styles.communicationMessagePopup} full-section ${
          notePopup ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <h3>{noteMessage?.note_name}</h3>
          <div className="content">
            <div
              style={{
                maxHeight: '8rem',
                overflow: 'auto',
              }}
              className="content"
              dangerouslySetInnerHTML={{
                __html: noteMessage?.details,
              }}
            />
          </div>

          <div
            className={`${styles.close_btn}`}
            onClick={() => setNotePopup(false)}
          >
            Close
          </div>
        </div>
      </section>
    </>
  );
};

export default TableList;
