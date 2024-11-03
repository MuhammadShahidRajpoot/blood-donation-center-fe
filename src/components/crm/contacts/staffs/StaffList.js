import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import Pagination from '../../../common/pagination/index';
import { toast } from 'react-toastify';
import TableList from '../../../staffTableListing';
// import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import NavTabs from '../../../common/navTabs';
// import { Tabs } from '../ContactTabs';
import ConfirmModal from '../../../common/confirmModal';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import SuccessPopUpModal from '../../../common/successModal';
import ContactStaffFilters from './staffFilters/staffFilter';
import exportImage from '../../../../assets/images/exportImage.svg';
import SvgComponent from '../../../common/SvgComponent';
import { downloadFile } from '../../../../utils';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import { StaffBreadCrumbsData } from './StaffBreadCrumbsData';
import CommunicationModal from '../../../common/CommunicationModal';
import axios from 'axios';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

let inputTimer = null;

function AccountList() {
  const Tabs = [
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.WRITE,
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.READ,
    ])
      ? {
          label: 'Volunteers',
          link: '/crm/contacts/volunteers',
        }
      : null,
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.DONOR.WRITE,
      CrmPermissions.CRM.CONTACTS.DONOR.READ,
    ])
      ? {
          label: 'Donor',
          link: '/crm/contacts/donor',
        }
      : null,
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.STAFF.WRITE,
      CrmPermissions.CRM.CONTACTS.STAFF.READ,
    ])
      ? {
          label: 'Staff',
          link: '/crm/contacts/staff',
        }
      : null,
    // CheckPermission([
    //   CrmPermissions.CRM.CONTACTS.PROSPECT.WRITE,
    //   CrmPermissions.CRM.CONTACTS.PROSPECT.READ,
    // ])
    //   ? {
    //       label: 'Prospects',
    //       link: '/crm/contacts/prospect',
    //     }
    //   : null,
  ];
  const location = useLocation();
  const currentLocation = location.pathname;
  const navigate = useNavigate();
  const [archiveModalPopUp, setArchiveModalPopUp] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [rows, setRows] = useState([]);
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [exportType, setExportType] = useState('filtered');
  const [downloadType, setDownloadType] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterApplied, setFilterApplied] = useState({});
  const [selectedOptions, setSelectedOptions] = useState();
  const [openCommunication, setOpenCommunication] = useState(false);
  const [defaultMessageType, setDefaultMessageType] = useState('sms');
  const [communicationable_id, setCommunicationableId] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [filterApiData, setFilterApiData] = useState(null);
  const communicationable_type = PolymorphicType.CRM_CONTACTS_STAFF;
  const [isDisabledFilteredExporting, setIsDisabledFilteredExporting] =
    useState(false);

  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'name',
      label: 'Name',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'primary_phone',
      label: 'Primary Phone',
      minWidth: '12rem',
      width: '12rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'primary_email',
      label: 'Primary Email',
      minWidth: '12rem',
      width: '12rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'roles',
      label: 'Roles',
      minWidth: '10rem',
      width: '10rem',
      sortable: true,
      checked: false,
    },
    {
      name: 'collection_operation_name',
      label: 'Collection Operation',
      width: '12rem',
      sortable: true,
      checked: true,
      splitlabel: true,
    },
    {
      name: 'teams',
      label: 'Team',
      width: '120px',
      sortable: true,
      checked: true,
    },
    {
      name: 'classification_name',
      label: 'Classification',
      width: '100px',
      sortable: true,
      checked: true,
    },
    {
      name: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      checked: true,
    },
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const source = axios.CancelToken.source();

    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      if (filterApiData) {
        fetchAllData(filterApiData, source);
      } else {
        fetchAllData({}, source);
      }
    }, 500);

    return () => {
      // Cancel the request when the component unmounts
      source.cancel();
    };
  }, [
    searchText,
    limit,
    currentPage,
    sortBy,
    sortOrder,
    refresh,
    refreshData,
    filterApiData,
  ]);

  const fetchAllData = async (filters, source) => {
    setFilterApplied(filters);
    try {
      setIsLoading(true);
      const getStatusValue = (status) => {
        if (typeof status === 'string') {
          return status === 'active'
            ? true
            : status === 'inactive'
            ? false
            : '';
        } else if (typeof status === 'object' && 'value' in status) {
          return status.value === 'active'
            ? true
            : status.value === 'inactive'
            ? false
            : '';
        } else {
          return true;
        }
      };
      const getFilterValue = (filter, propertyName) => {
        if (typeof filter === 'object' && 'value' in filter) {
          return propertyName + '=' + filter.value;
        } else if (
          Array?.isArray(filter) &&
          (propertyName === 'city' ||
            propertyName === 'state' ||
            propertyName === 'county')
        ) {
          if (filter.length >= 1) {
            const arr = filter
              .map((item) => (item?.id ? item.id : item))
              .join(',');
            return propertyName + '=' + arr;
          }
        } else if (
          Array.isArray(filter) &&
          propertyName !== 'collection_operation_id'
        ) {
          if (typeof filter[0] === 'object' && 'id' in filter[0]) {
            return filter.map((e) => propertyName + '=' + e.id).join('&');
          } else {
            return filter.map((id) => propertyName + '=' + id).join('&');
          }
        } else if (
          Array.isArray(filter) &&
          propertyName === 'collection_operation_id'
        ) {
          if (filter.length >= 1) {
            return (
              propertyName +
              '=' +
              filter.map((item) => (item?.id ? item.id : item)).join(',')
            );
          }
        } else {
          return propertyName + '=' + (filter ?? '');
        }
      };
      const filterProperties = [
        'city',
        'state',
        'role_ids',
        'collection_operation_id',
        'team_ids',
        'email',
        'phone',
        'county',
      ];
      const queryParams = filterProperties
        .map((property) => {
          const filterValue = getFilterValue(filters[property], property);
          return filterValue ? filterValue : '';
        })
        .filter(
          (param) =>
            param !== '' && !(param.startsWith('email=') && param === 'email=')
        )
        .join('&');

      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Conditionally set cancelToken based on the existence of source
      if (source) {
        axiosConfig.cancelToken = source.token;
      }

      const response = await axios.get(
        `${BASE_URL}/contact-staff/filtered?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText && searchText.length ? '&name=' + searchText : ''
        }&status=${getStatusValue(filters?.status)}&${queryParams}${
          exportType ? `&exportType=${exportType}` : ''
        }${downloadType ? `&downloadType=${downloadType}` : ''}
        ${exportType === 'all' ? `&fetchAll=${'true'}` : ''}
        ${
          selectedOptions && exportType === 'filtered'
            ? `&selectedOptions=${selectedOptions?.label}`
            : ''
        }
        &tableHeaders=${tableHeaders
          .filter((item) => item.checked === true)
          .map((item) => item.name)}`,
        axiosConfig
      );

      setRows(
        response?.data?.data.map((item) => ({ ...item, id: item.staff_id }))
      );
      setTotalRecords(response?.data?.count);
      if (response?.data?.url) {
        await downloadFile(response.data.url);
      }
      setDownloadType(null);
      setIsLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setIsLoading(false);
        toast.error(
          `Failed to fetch table data: ${error?.response?.data?.message}`,
          { autoClose: 3000 }
        );
      }
    }
  };

  const getStatusValue = (status) => {
    if (typeof status === 'string') {
      return status === 'active' ? true : status === 'inactive' ? false : '';
    } else if (typeof status === 'object' && 'value' in status) {
      return status.value === 'active'
        ? true
        : status.value === 'inactive'
        ? false
        : '';
    } else {
      return true;
    }
  };
  const getFilterValue = (filter, propertyName) => {
    if (typeof filter === 'object' && 'value' in filter) {
      return propertyName + '=' + filter.value;
    } else if (
      Array.isArray(filter) &&
      propertyName !== 'collection_operation_id'
    ) {
      if (typeof filter[0] === 'object' && 'id' in filter[0]) {
        return filter.map((e) => propertyName + '=' + e.id).join('&');
      } else {
        return filter.map((id) => propertyName + '=' + id).join('&');
      }
    } else if (
      Array.isArray(filter) &&
      propertyName === 'collection_operation_id'
    ) {
      if (filter.length >= 1) {
        return (
          propertyName +
          '=' +
          filter.map((item) => (item?.id ? item.id : item)).join(',')
        );
      }
    } else {
      return propertyName + '=' + (filter ?? '');
    }
  };
  const checkExportType = () => {
    const filterProperties = [
      'city',
      'state',
      'role_ids',
      'collection_operation_id',
      'team_ids',
      'email',
      'phone',
    ];
    const queryParams = filterProperties
      .map((property) => {
        const filterValue = getFilterValue(filterApplied[property], property);
        return filterValue ? filterValue : '';
      })
      .filter(
        (param) =>
          param !== '' && !(param.startsWith('email=') && param === 'email=')
      )
      .join('&');
    const valuesArray = queryParams
      .split('&')
      .map((param) => {
        const value = param.split('=')[1];
        return value !== '' ? value : null; // Filter out empty values
      })
      .filter((value) => value !== null);
    if (!valuesArray.length > 0 && !getStatusValue(filterApplied?.status)) {
      setIsDisabledFilteredExporting(true);
      setExportType('all');
    } else {
      setIsDisabledFilteredExporting(false);
      setExportType('filtered');
    }
  };
  const handleSort = (column) => {
    if (
      (sortBy === 'first_name' || sortBy === 'last_name') &&
      (column === 'first_name' || column === 'last_name')
    ) {
      if (sortBy === 'last_name') {
        setSortBy('first_name');
      }
      if (sortBy === 'first_name') {
        setSortBy('last_name');
      }
    } else {
      if (sortBy === column) {
        if (sortOrder === 'ASC') {
          setSortOrder('DESC');
        } else {
          setSortOrder('ASC');
        }
      } else {
        setSortBy(column);
        setSortOrder('ASC');
      }
    }
  };

  const optionsConfig = [
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.STAFF.WRITE,
      CrmPermissions.CRM.CONTACTS.STAFF.READ,
    ])
      ? {
          label: 'View',
          path: (rowData) => `${rowData.id}/view`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.STAFF.WRITE])
      ? {
          label: 'Edit',
          path: (rowData) => `${rowData.id}/edit`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.STAFF.ARCHIVE])
      ? {
          label: 'Archive',
          action: (rowData) => {
            // setModalPopUp(true);
            handleArchive(rowData);
          },
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.STAFF.SEND_EMAIL_OR_SMS])
      ? {
          label: 'Send Email/SMS',
          // path: (rowData) => `#`,
          action: (rowData) => {
            setCommunicationableId(rowData?.id);
            setOpenCommunication(true);
          },
        }
      : null,
  ];

  // const transformData = (data) => {
  //   return data?.map((item) => {
  //     let id = item.staff_id;
  //     return {
  //       ...item,
  //       id: id,
  //     };
  //   });
  // };

  const handleArchive = (rowData) => {
    setShowConfirmation(true);
    setItemToArchive(rowData);
    setRefresh(false);
  };

  const confirmArchive = async () => {
    if (itemToArchive) {
      try {
        const contactVolunteerID = itemToArchive.id;
        const response = await fetch(
          `${BASE_URL}/contact-staff/${contactVolunteerID}`,
          {
            method: 'PATCH',
          }
        );
        const { status } = await response.json();

        if (status === 204) {
          setArchiveModalPopUp(true);
          // toast.success(message, { autoClose: 3000 });
          setRefresh(true);
        } else {
          toast.error('Error Archiving Staff', { autoClose: 3000 });
        }
      } catch (error) {
        console.error('Error archiving data:', error);
      }

      setShowConfirmation(false);
      setItemToArchive(null);
    }
  };

  const cancelArchive = () => {
    setShowConfirmation(false);
    setItemToArchive(null);
  };

  const handleCommunicationButtons = (confirmed) => {
    setOpenCommunication(confirmed);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={StaffBreadCrumbsData}
        BreadCrumbsTitle={'Contacts'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="filterBar">
        <NavTabs tabs={Tabs} currentLocation={currentLocation} />
      </div>
      <div className="mainContentInner crm">
        <ContactStaffFilters
          fetchAllFilters={setFilterApiData}
          setIsLoading={setIsLoading}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
        />
        <div className="buttons d-flex align-items-center gap-3">
          <div className="exportButton">
            <div
              className="optionsIcon"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <SvgComponent name={'DownloadIcon'} />
              <span>Export Data</span>
            </div>
            <ul className="dropdown-menu">
              <li>
                <Link
                  onClick={(e) => {
                    e.preventDefault();
                    setShowExportDialogue(true);
                    setDownloadType('PDF');
                    checkExportType();
                  }}
                  className="dropdown-item"
                >
                  PDF
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowExportDialogue(true);
                    setDownloadType('CSV');
                    checkExportType();
                  }}
                >
                  CSV
                </Link>
              </li>
            </ul>
          </div>
          {CheckPermission([CrmPermissions.CRM.CONTACTS.STAFF.WRITE]) && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('create')}
            >
              Create Staff
            </button>
          )}
        </div>
        <TableList
          isLoading={isLoading}
          data={rows}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          setTableHeaders={setTableHeaders}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        <SuccessPopUpModal
          title={'Success!'}
          message={'Staff is archieved.'}
          modalPopUp={archiveModalPopUp}
          setModalPopUp={setArchiveModalPopUp}
          onConfirm={() => {
            setArchiveModalPopUp(false);
          }}
          showActionBtns={true}
        />
        <ConfirmModal
          showConfirmation={showConfirmation}
          onCancel={cancelArchive}
          onConfirm={confirmArchive}
          icon={ConfirmArchiveIcon}
          heading={'Confirmation'}
          description={'Are you sure you want to archive?'}
        />
        <CommunicationModal
          openModal={openCommunication}
          setOpenModal={setOpenCommunication}
          defaultMessageType={defaultMessageType}
          setDefaultMessageType={setDefaultMessageType}
          communicationable_id={communicationable_id}
          communicationable_type={communicationable_type}
          handleModalButtons={handleCommunicationButtons}
          refreshData={refreshData} // Pass the state as a prop
          setRefreshData={setRefreshData}
        />
        <section
          className={`exportData popup full-section exportData ${
            showExportDialogue ? 'active' : ''
          }`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={exportImage} className="bg-white" alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Export Data</h3>
              <p>
                Select one of the following option to download the{' '}
                {downloadType}
              </p>
              <div className="content-inner">
                <div className="radioChecks form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="exportType"
                    checked={exportType === 'filtered'}
                    value={'filtered'}
                    disabled={isDisabledFilteredExporting}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                  />
                  <label
                    onClick={() => {
                      if (!isDisabledFilteredExporting)
                        setExportType('filtered');
                    }}
                    className="form-check-label"
                  >
                    <span className="radio">Filtered Results</span>
                  </label>
                </div>
                <div className="radioChecks form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="exportType"
                    checked={exportType === 'all'}
                    value={'all'}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                  />
                  <label
                    onClick={() => {
                      setExportType('all');
                    }}
                    className="form-check-label"
                  >
                    <span className="radio">All Data</span>
                  </label>
                </div>
              </div>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setDownloadType(null);
                    setShowExportDialogue(false);
                  }}
                >
                  Cancel
                </button>
                {downloadType === 'PDF' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIsLoading(true);
                      if (exportType === 'filtered') {
                        fetchAllData(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllData(isFilterApplied);
                      }
                      setShowExportDialogue(false);
                    }}
                  >
                    Download
                  </button>
                )}

                {downloadType === 'CSV' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIsLoading(true);
                      if (exportType === 'filtered') {
                        fetchAllData(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllData(isFilterApplied);
                      }
                      setShowExportDialogue(false);
                    }}
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AccountList;
