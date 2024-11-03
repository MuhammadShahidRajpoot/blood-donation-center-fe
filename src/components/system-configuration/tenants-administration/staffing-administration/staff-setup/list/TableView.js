import React, { useEffect, useState } from 'react';
import { Link /* useNavigate */ } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import style from '../index.module.scss';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import CheckBoxFilterClosed from '../../../../../../assets/images/checkbox-filter-closed.png';
import CheckBoxFilterOpen from '../../../../../../assets/images/checkbox-filter-open.png';
import Dropdown from 'react-bootstrap/Dropdown';
import { truncateTo50 } from '../../../../../../helpers/utils';

const TableView = ({
  headers,
  listData,
  setModalState,
  setArchiveId,
  setCreatedBy,
  handleSort,
  isLoading,
  enableColumnHide,
  showActionsLabel,
}) => {
  //const navigate = useNavigate();
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
            <tr className="container">
              {headers?.map((item, index) => (
                <th
                  key={index}
                  // width={item.width}
                  // style={{ whiteSpace: 'nowrap' }}
                  className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(item.name) ? 'd-none' : ''
                }`}
                >
                  {item?.splitlabel
                    ? item?.label.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <br />} {word}
                        </React.Fragment>
                      ))
                    : item.label}
                  {/* {item.label} */}
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
                <td className="no-data" colSpan={headers.length + 1}>
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
                    {item?.short_name}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[2]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.opeartion_type_id}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[3]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.location_type_id}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[4]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.beds}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[5]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.concurrent_beds}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[6]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.stagger_slots}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[7]?.name) ? 'd-none' : ''
                }`}
                  >
                    {truncateTo50(item?.procedure_type_id?.name)}
                  </td>
                  <td
                    className={`
                ${item.headerclassName ? item.headerclassName : ''} ${
                  columnList.includes(headers[8]?.name) ? 'd-none' : ''
                }`}
                  >
                    {item?.is_active ? (
                      <span className={`${style.listBadge} ${style.active}`}>
                        Active
                      </span>
                    ) : (
                      <span className={`${style.listBadge} ${style.inactive}`}>
                        Inactive
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
                          Permissions.STAFF_ADMINISTRATION.STAFF_SETUPS.READ,
                        ]) && (
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/system-configuration/tenant-admin/staffing-admin/staff-setup/${item?.id}`}
                            >
                              View
                            </Link>
                          </li>
                        )}
                        {CheckPermission([
                          Permissions.STAFF_ADMINISTRATION.STAFF_SETUPS.WRITE,
                        ]) && (
                          <li>
                            <Link
                              className="dropdown-item"
                              to={`/system-configuration/tenant-admin/staffing-admin/staff-setup/${item?.id}/edit`}
                            >
                              Edit
                            </Link>
                          </li>
                        )}
                        {CheckPermission([
                          Permissions.STAFF_ADMINISTRATION.STAFF_SETUPS.ARCHIVE,
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
                <td className="no-data" colSpan="10">
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

export default TableView;
