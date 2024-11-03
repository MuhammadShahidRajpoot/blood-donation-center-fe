import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import style from './index.module.scss';
import TopBar from '../../../../common/topbar/index';
import Pagination from '../../../../common/pagination';
import SuccessPopUpModal from '../../../../common/successModal';
import UpdateManager from '../../../../../assets/images/infoIcon.png';
import unlock from '../../../../../assets/unlock.svg';
import SelectDropdown from '../../../../common/selectDropdown';
import { UsersBreadCrumbsData } from '../UsersBreadCrumbsData';
import TableList from './TableListingUser';
import OrganizationalDropdown from '../../../../common/Organization/DropDown';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../../common/Organization/Popup';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../enums/PermissionsEnum.js';
import axios from 'axios';
import SvgComponent from '../../../../common/SvgComponent.js';
import { OrganizationalLevelsContext } from '../../../../../Context/OrganizationalLevels.jsx';

const BreadcrumbsData = [
  ...UsersBreadCrumbsData,
  {
    label: 'Users',
    class: 'active-label',
    link: '/system-configuration/tenant-admin/user-admin/users',
  },
];

const UsersList = () => {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [updatedmanager, setUpdatedManager] = useState();
  const [firstName, setFirstName] = useState();
  const [assignedManagers, setAssignedManagers] = useState();
  const [roles, setRoles] = useState();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showupdateManagerDialog, setShowpdateManagerDialog] = useState(false);
  const [sort, setSort] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [status, setStatus] = useState({ label: 'Active', value: 'true' });
  const [assignedManagerFilter, setAssignedManagerFilter] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);
  const [currentUserId, setcurrentUserId] = useState(null);
  const [organizationalLevelFilter, setOrganizationalLevelFilter] =
    useState('');
  const [archiveID, setArchiveID] = useState('');
  const [isPopupVisible, setPopupVisible] = React.useState();
  const [OLLabels, setOLLabels] = useState([]);
  const [OLClear, setOLClear] = useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'first_name',
      label: 'First Name',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'last_name',
      label: 'Last Name',
      sortable: true,
      defaultHidden: false,
    },
    {
      maxWidth: '160px',
      name: 'role',
      label: 'Role',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'is_manager',
      label: 'Manager',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'assigned_manager',
      label: 'Assigned Manager',
      maxWidth: '120px',
      sortable: true,
      defaultHidden: true,
    },
    {
      maxWidth: '160px',
      name: 'hierarchy_level',
      label: 'Organizational Level',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'business_unit',
      label: 'Business Unit',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'account_state',
      label: 'Account State',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'work_phone_number',
      label: 'Work Phone',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'mobile_number',
      label: 'Mobile Phone',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'is_active',
      label: 'Status',
      sortable: true,
      defaultHidden: false,
    },
  ]);

  const optionsConfig = [
    CheckPermission([Permissions.USER_ADMINISTRATIONS.USERS.READ]) && {
      label: 'View',
      path: (rowData) => `${rowData.id}/view`,
    },
    CheckPermission([Permissions.USER_ADMINISTRATIONS.USERS.WRITE]) && {
      label: 'Edit',
      path: (rowData) => `${rowData.id}/edit`,
    },

    {
      label: 'Update Manager',
      action: (rowData) => {
        handleUpdateManagerClick();
        setFirstName(rowData);
        setUpdatedManager({
          id: rowData?.id,
          assigned_manager: assignedManagers?.[0]?.id,
        });
      },
    },
    {
      label: 'Reset Password',
      path: (rowData) => `${rowData.id}/reset-password`,
    },
    currentUserId !== users?.id &&
      CheckPermission([Permissions.USER_ADMINISTRATIONS.USERS.ARCHIVE]) && {
        label: 'Archive',
        action: (rowData) => {
          setModalPopUp(true);
          setArchiveID(rowData.id);
        },
        disabled: (rowData) => currentUserId === rowData.id,
      },
  ].filter(Boolean);

  const handleSort = (columnName) => {
    if (sort === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSort(columnName);
      setSortOrder('ASC');
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    const currentUser = jwtDecode(jwtToken);
    setcurrentUserId(currentUser?.id);

    const getManagersData = async () => {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tenant-users/managers`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
      if (data?.data) {
        setAssignedManagers(data?.data);
      }
    };
    getManagersData();
    const getRoles = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/roles?fetchAll=true`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = response.data;
        if (data?.status === 'success') {
          setRoles(data?.data);
        }
      } catch (error) {
        toast.error(error);
      }
    };
    getRoles();
  }, []);

  useEffect(() => {
    getData();
  }, [currentPage, limit, sort, sortOrder]);

  const handleAddClick = () => {
    navigate('/system-configuration/tenant-admin/user-admin/users/create');
  };
  const getData = async () => {
    const accessToken = localStorage.getItem('token');
    const params = new URLSearchParams();
    try {
      setIsLoading(true);
      const result = await axios.get(
        `${BASE_URL}/tenant-users?${
          params.size > 0 ? params.toString() : 'business_units='
        }&limit=${limit}&page=${currentPage}${
          searchText && searchText.length > 1 ? `&keyword=${searchText}` : ''
        }${status ? `&status=${status?.value ?? ''}` : ''}${
          roleFilter !== null ? `&roleId=${roleFilter?.value || ''}` : ''
        }${
          organizationalLevelFilter !== ''
            ? `&organizational_levels=${organizationalLevelFilter || ''}`
            : ''
        }${
          assignedManagerFilter !== null
            ? `&assignedManager=${assignedManagerFilter?.value || ''}`
            : ''
        }${sort ? `&sortBy=${sort}` : ''}${
          sortOrder ? `&sortOrder=${sortOrder}` : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = result.data;
      if (data?.data) {
        setUsers(data?.data);
        setTotalRecords(data?.total_records);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {
    setCurrentPage(1);
    getData();
  }, [
    searchText,
    status,
    roleFilter,
    assignedManagerFilter,
    organizationalLevelFilter,
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleConfirmArchive = async () => {
    setModalPopUp(false);
    if (archiveID) {
      try {
        const bearerToken = localStorage.getItem('token');
        const response = await axios.patch(
          `${BASE_URL}/tenant-users/archive/${archiveID}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        if (response?.status === 200) {
          getData();
          setShowSuccessMessage(true);
        } else {
          const { message } = await response.json();
          toast.error(message, {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error('An error occurred while fetching user details', {
          autoClose: 3000,
        });
      }
    }
  };

  // const handleOpenConfirmation = (id) => {
  //   setUserToArchive(id);
  //   setModalPopUp(true);
  // };

  const handleAccount = async (confirmed) => {
    setShowAccountDialog(false);
    if (confirmed) {
      try {
        const bearerToken = localStorage.getItem('token');
        const response = await axios.patch(
          `${BASE_URL}/tenant-users/${firstName?.id}`,
          { account_state: !firstName?.account_state },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        const data = response.data;
        if (data) {
          getData();
          navigate(`/system-configuration/tenant-admin/user-admin/users`);
        }
      } catch (error) {
        toast.error('An error occurred while fetching user details', {
          autoClose: 3000,
        });
      }
    }
  };
  const handleUpdateManagerClick = () => {
    setShowpdateManagerDialog(true);
  };
  const handleUpdateManager = async (confirmed) => {
    const accessToken = localStorage.getItem('token');
    setShowpdateManagerDialog(false);
    if (confirmed) {
      const parsedassigned_manager = parseInt(
        updatedmanager?.assigned_manager,
        10
      );
      const parsedId = parseInt(updatedmanager?.id, 10);
      const body = {
        id: +parsedId,
        assigned_manager: +parsedassigned_manager,
      };
      try {
        // const accessToken = localStorage.getItem('token');
        const response = await axios.patch(
          `${BASE_URL}/tenant-users/manager`,
          body,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        let data = response.data;
        if (data?.status === 'success') {
          getData();
        } else if (data?.status_code === 400) {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message;
          toast.error(`${showMessage}`, { autoClose: 3000 });
        } else {
          const showMessage = Array.isArray(data?.message)
            ? data?.message[0]
            : data?.message;
          toast.error(`${showMessage}`, { autoClose: 3000 });
        }
      } catch (error) {
        toast.error(`${error?.message}`, { autoClose: 3000 });
      }
      navigate('/system-configuration/tenant-admin/user-admin/users');
    }
  };

  const handleOrganizationalLevel = (payload) => {
    setPopupVisible(false);
    setOrganizationalLevelFilter(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Users'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <section
        className={`popup full-section ${showAccountDialog ? 'active' : ''}`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img src={unlock} alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>
              Are you sure you want to{' '}
              {firstName?.account_state ? 'lock' : 'unlock'}{' '}
              {firstName?.first_name} account?
            </p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => handleAccount(false)}
              >
                No
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleAccount(true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
      <section
        className={`popup full-section ${
          showupdateManagerDialog ? 'active' : ''
        }`}
      >
        <div className="popup-inner" style={{ maxWidth: '530px' }}>
          <div className="icon">
            <img src={UpdateManager} alt="Update Manager" />
          </div>
          <div className="content">
            <h3>Update Manager</h3>
            <p>
              Select and update manager for {firstName?.first_name}{' '}
              {firstName?.last_name}
            </p>
            <div className="form-field mt-4">
              <div className={`field d-flex ${style.select_hover}`}>
                <label
                  className={`${style.label}`}
                  style={
                    users?.assigned_manager !== ''
                      ? { display: 'none' }
                      : { display: '' }
                  }
                >
                  Assigned Manager
                </label>
                <select
                  name="assigned_manager"
                  className="form-select bg-white "
                  value={users?.assigned_manager}
                  onChange={(e) => {
                    setUpdatedManager({
                      id: firstName?.id,
                      assigned_manager: e.target.value,
                    });
                  }}
                  required
                >
                  {assignedManagers?.length > 0 &&
                    assignedManagers?.map((user, index) => (
                      <option
                        value={user?.id}
                        key={index}
                        selected={firstName?.id === user?.id}
                      >
                        {user?.first_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="buttons">
              <button
                className={`btn btn-secondary`}
                style={{ width: '48%' }}
                onClick={() => handleUpdateManager(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ width: '48%' }}
                onClick={() => handleUpdateManager(true)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="filterBar">
        <div className={`filterInner ${style.filterInner}`}>
          <h2 className="mt-3 mt-lg-0 me-4">Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex gap-3">
              <OrganizationalDropdown
                labels={OLLabels}
                handleClick={() => setPopupVisible(true)}
                handleClear={() => {
                  handleOrganizationalLevel('');
                  setOLLabels('');
                  setOLClear(true);
                  clearOLData(OLPageNames.SC_USERS);
                }}
              />
              <SelectDropdown
                placeholder={'Role'}
                defaultValue={roleFilter}
                selectedValue={roleFilter}
                removeDivider
                showLabel
                onChange={(value) => setRoleFilter(value)}
                options={
                  roles?.length > 0
                    ? roles
                        .map((item) => {
                          return {
                            value: item.id,
                            label: item?.name,
                          };
                        })
                        .sort((a, b) => a.label.localeCompare(b.label))
                    : []
                }
              />
              <SelectDropdown
                placeholder={'Assigned Manager'}
                defaultValue={assignedManagerFilter}
                selectedValue={assignedManagerFilter}
                removeDivider
                showLabel
                onChange={(value) => setAssignedManagerFilter(value)}
                options={
                  assignedManagers?.length > 0
                    ? assignedManagers
                        .map((item) => {
                          return {
                            value: item.id,
                            label: item?.first_name,
                          };
                        })
                        .sort((a, b) => a.label.localeCompare(b.label))
                    : []
                }
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={status}
                selectedValue={status}
                removeDivider
                showLabel
                onChange={(value) => {
                  setStatus(value);
                }}
                options={[
                  { label: 'Active', value: 'true' },
                  { label: 'Inactive', value: 'false' },
                ]}
              />
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        {CheckPermission([Permissions.USER_ADMINISTRATIONS.USERS.WRITE]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create User
            </button>
          </div>
        )}
        <TableList
          isLoading={isLoading}
          data={users}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sort}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          setTableHeaders={setTableHeaders}
          enableColumnHide={true}
          showActionsLabel={false}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure want to Archive?'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleConfirmArchive}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'User is archived.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
      />
      <OrganizationalPopup
        value={organizationalLevelFilter}
        showConfirmation={isPopupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        showRecruiters
        clear={OLClear}
        pageName={OLPageNames.SC_USERS}
      />
    </div>
  );
};

export default UsersList;
