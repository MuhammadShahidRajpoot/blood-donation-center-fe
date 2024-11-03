import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../../../../common/SvgComponent';
import style from '../index.module.scss';
import CheckPermission from '../../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../../enums/PermissionsEnum';
import CheckBoxFilterClosed from '../../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../../assets/images/checkbox-filter-open.png';
import Dropdown from 'react-bootstrap/Dropdown';
import { truncateTo50 } from '../../../../../../../helpers/utils';

const TableListing = ({
  headers,
  listData,
  setModalState,
  setArchiveId,
  handleSort,
  isLoading,
  setCreatedBy,
  enableColumnHide,
  showActionsLabel,
}) => {
  const navigate = useNavigate();
  const [columnList, setColumnList] = useState([]);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [toggleZindex, setToggleZindex] = useState(-1);
  const handleOnClick = (id, user) => {
    setArchiveId(id);
    setCreatedBy(user);
    setModalState(true);
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
  const setDropdown = () => {
    setShowColumnToggle(!showColumnToggle);
  };
  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped hasOptions">
          <thead>
            <tr>
              {headers?.map((item, index) => (
                <th
                  key={index}
                  // width={item.width}
                  className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(item.name) ? 'd-none' : ''
                }`}
                >
                  {item.label}
                  {item?.sortable ? (
                    <div className="sort-icon" onClick={() => handleSort(item)}>
                      <SvgComponent name={'SortIcon'} />
                    </div>
                  ) : null}
                </th>
              ))}
              <th width="150px" align="center" style={{ zIndex: 11 }}>
                {showActionsLabel ? (
                  <div className="inliner justify-content-center">
                    <span className="title">Actions</span>
                  </div>
                ) : null}
                {enableColumnHide ? (
                  <div className="flex align-items-center justify-content-center">
                    <div className="account-list-header dropdown-center ">
                      <Dropdown show={showColumnToggle} onToggle={setDropdown}>
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
                        <Dropdown.Menu style={{ width: '140px' }} align={'end'}>
                          {headers.map((option, index) => (
                            <li key={index}>
                              <div className="flex align-items-center gap-2 checkboxInput">
                                <input
                                  type="checkbox"
                                  value={option.name}
                                  checked={!columnList.includes(option.name)}
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="no-data" colSpan="10">
                  Data Loading
                </td>
              </tr>
            ) : listData?.length > 0 ? (
              listData?.map((item, index) => (
                <tr key={index}>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[0]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.name}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[1]?.name) ? 'd-none' : ''
                }`}
                  >
                    {truncateTo50(item?.description)}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[2]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.is_active ? (
                      <span className={`${style.listBadge} ${style.active}`}>
                        Active
                      </span>
                    ) : (
                      <span className={`${style.listBadge} ${style.inactive}`}>
                        InActive
                      </span>
                    )}
                  </td>
                  <td
                    className="options"
                    style={{ zIndex: toggleZindex === index ? 10 : 1 }}
                  >
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
                      <ul className="dropdown-menu p-0">
                        {CheckPermission([
                          Permissions.CRM_ADMINISTRATION.LOCATIONS.ROOM_SIZES
                            .READ,
                        ]) && (
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/system-configuration/tenant-admin/crm-admin/locations/room-size/${item?.id}`}
                            >
                              View
                            </Link>
                          </li>
                        )}
                        {CheckPermission([
                          Permissions.CRM_ADMINISTRATION.LOCATIONS.ROOM_SIZES
                            .WRITE,
                        ]) && (
                          <li>
                            <a
                              className="dropdown-item"
                              onClick={() =>
                                navigate(
                                  `/system-configuration/tenant-admin/crm-admin/locations/${item?.id}/edit`,
                                  { state: { room: item } }
                                )
                              }
                            >
                              Edit
                            </a>
                          </li>
                        )}
                        {CheckPermission([
                          Permissions.CRM_ADMINISTRATION.LOCATIONS.ROOM_SIZES
                            .ARCHIVE,
                        ]) && (
                          <li>
                            <Link
                              className="dropdown-item"
                              to="#"
                              onClick={() =>
                                handleOnClick(item?.id, item?.created_by?.id)
                              }
                            >
                              Archive
                            </Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="no-data" colSpan="9">
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

export default TableListing;
