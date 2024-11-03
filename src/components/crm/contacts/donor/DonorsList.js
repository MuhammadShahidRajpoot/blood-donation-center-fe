import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../common/topbar/index';
import Pagination from '../../../common/pagination/index';
import { toast } from 'react-toastify';
import TableList from '../../../donorsTableListing';
// import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import NavTabs from '../../../common/navTabs';
// import { Tabs } from '../ContactTabs';
import ConfirmModal from '../../../common/confirmModal';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import CommunicationModal from '../../../common/CommunicationModal';
import SuccessPopUpModal from '../../../common/successModal';
import { dateFormat } from '../../../../helpers/formatDate';
import ContactDonorsFilters from './donorsFilters/donorsFilter';
import SvgComponent from '../../../common/SvgComponent';
import exportImage from '../../../../assets/images/exportImage.svg';
import { downloadFile } from '../../../../utils';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import { DonorBreadCrumbsData } from './DonorBreadCrumbsData';
import styles from './donor.module.scss';
import faFileLinesAlt from '../../../../assets/faFileLinesAlt.svg';
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
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openCommunication, setOpenCommunication] = useState(false);
  // const [messageType, setMessageType] = useState('sms');
  const [refresh, setRefresh] = useState(false);
  const [rows, setRows] = useState([]);
  const [archiveModalPopUp, setArchiveModalPopUp] = useState(false);
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [exportType, setExportType] = useState('filtered');
  const [downloadType, setDownloadType] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState();
  const [filterApplied, setFilterApplied] = useState({});
  const [defaultMessageType, setDefaultMessageType] = useState('sms');
  const [refreshData, setRefreshData] = useState(false);
  const [communicationable_id, setCommunicationableId] = useState(null);
  const [filterApiData, setFilterApiData] = useState(null);
  const communicationable_type = PolymorphicType.CRM_CONTACTS_DONORS;
  const [isDisabledFilteredExporting, setIsDisabledFilteredExporting] =
    useState(false);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'donor_number',
      label: 'Donor ID',
      minWidth: '5rem',
      width: '5rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'name',
      label: 'Donor Name',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'address_city',
      label: 'City',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },

    {
      name: 'address_county',
      label: 'County',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'address_state',
      label: 'State',
      minWidth: '10rem',
      width: '10rem',
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
      minWidth: '14rem',
      width: '14rem',
      sortable: true,
      checked: false,
    },
    {
      name: 'blood_group',
      label: 'Blood Group',
      width: '5rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'last_donation',
      label: 'Last Donation',
      width: '10rem',
      sortable: true,
      checked: true,
    },
  ]);
  const token = localStorage.getItem('token');

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    // Adding debouncer just so we won't call api on every search click
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      if (filterApiData) {
        fetchAllData(filterApiData, source);
      } else if (Object.keys(filterApplied)?.length) {
        fetchAllData(filterApplied, source);
      } else if (searchText) {
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
  function isFilterApplied(filters) {
    return Object.values(filters)?.every((x) => x === null || x === '');
  }
  const fetchAllData = async (filters, source) => {
    let isFiltersCheck = Object.keys(filters)?.length > 0;
    if (isFiltersCheck && isFilterApplied(filters) && !searchText) {
      setFilterApplied({});
      setRows([]);
      return;
    }
    setFilterApplied(filters);
    try {
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
          return '';
        }
      };

      const getFilterValue = (filter) => {
        if (typeof filter === 'object' && 'value' in filter) {
          return filter.value;
        } else if (filter && Array.isArray(filter)) {
          if (filter.length >= 1) {
            return filter.map((item) => (item?.id ? item.id : item)).join(',');
          }
        } else {
          return filter;
        }
      };

      const filterProperties = [
        'city',
        'state',
        'county',
        'name',
        'blood_group',
        'last_donation',
        'group_code',
        'center_code',
        'assertions',
      ];
      let validation = false;
      validation = filterProperties.some((property) => {
        const filterValue = getFilterValue(filters[property]);

        if (property === 'last_donation') {
          // For "last_donation," check both "startDate" and "endDate" existence
          const bothMissing = !filterValue?.startDate && !filterValue?.endDate;
          const bothPresent = filterValue?.startDate && filterValue?.endDate;

          if (bothMissing || bothPresent) {
            return false;
          } else {
            toast.error(
              'Please select a valid date range for "Last Donation" filter.',
              {
                autoClose: 3000,
              }
            );
            return true;
          }
        }
      });

      if (validation) {
        setIsLoading(false);
        setRows([]);
        setTotalRecords(0);
        return;
      }

      const queryParams = filterProperties
        .map((property) => {
          const filterValue = getFilterValue(filters[property]);
          return filterValue
            ? `${property}=${
                property === 'blood_group'
                  ? encodeURIComponent(filterValue)
                  : property === 'last_donation'
                  ? JSON.stringify(filterValue)
                  : filterValue
              }`
            : '';
        })
        .filter((param) => param !== '')
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
        `${BASE_URL}/contact-donors?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText && searchText.length ? '&keyword=' + searchText : ''
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
        response?.data?.data?.map((item) => ({
          ...item,
          last_donation: dateFormat(item.last_donation, 2),
        }))
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
        toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
      }
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
      CrmPermissions.CRM.CONTACTS.DONOR.WRITE,
      CrmPermissions.CRM.CONTACTS.DONOR.READ,
    ])
      ? {
          label: 'View',
          // path: (rowData) => `${rowData.id}`,
          path: (rowData) => `${rowData.id}/view`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.DONOR.WRITE])
      ? {
          label: 'Edit',
          path: (rowData) => `${rowData.id}/edit`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.DONOR.ARCHIVE])
      ? {
          label: 'Archive',
          action: (rowData) => {
            // setModalPopUp(true);
            handleArchive(rowData);
          },
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.DONOR.SEND_EMAIL_OR_SMS])
      ? {
          label: 'Send Email/SMS',
          // path: (rowData) => `#`,
          action: (rowData) => {
            setCommunicationableId(rowData?.id);
            setOpenCommunication(true);
          },
        }
      : null,
  ].filter(Boolean);

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
          `${BASE_URL}/contact-donors/${contactVolunteerID}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { status } = await response.json();

        if (status === 204) {
          setArchiveModalPopUp(true);
          // toast.success(message, { autoClose: 3000 });
          setRefresh(true);
        } else {
          toast.error('Error Archiving Donor', { autoClose: 3000 });
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

  const checkExportType = () => {
    const isObjectEmpty = Object.keys(filterApplied).length === 0;
    if (isObjectEmpty) {
      setIsDisabledFilteredExporting(true);
      setExportType('all');
    } else {
      setIsDisabledFilteredExporting(false);
      setExportType('filtered');
    }
  };

  const transformData = (data) => {
    return data?.map((item) => {
      let id = item.donor_id;

      if (item.primary_phone) {
        item.primary_phone = item.primary_phone.replace(
          /(\d{3})(\d{3})(\d{4})/,
          '($1) $2-$3'
        );
      }
      return {
        ...item,
        donor_number: `${id ? item?.donor_number || 'Prospect' : 'N/A'}`,
        id: id,
      };
    });
  };

  function MediaCard() {
    return (
      <div className={styles.donorFilterCard}>
        <img
          src={faFileLinesAlt}
          alt="faFileLinesAlt"
          className={styles.faFileLinesAlt}
        />

        <h2 className={styles.donorFilterHeader}>
          Apply Search or Filter to view Donor Records.{' '}
        </h2>
        <p className={styles.donorFilterPara}>
          Please apply search or filter(s) to view Donor <br /> Records.
        </p>
      </div>
    );
  }
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={DonorBreadCrumbsData}
        BreadCrumbsTitle={'Contacts'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="filterBar">
        <NavTabs tabs={Tabs} currentLocation={currentLocation} />
      </div>
      <div className="mainContentInner crm">
        <ContactDonorsFilters
          fetchAllFilters={setFilterApiData}
          setIsLoading={setIsLoading}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
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
          {CheckPermission([CrmPermissions.CRM.CONTACTS.DONOR.WRITE]) && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('create')}
            >
              Create Donor
            </button>
          )}
        </div>
        {searchText || Object.keys(filterApplied)?.length > 0 ? (
          <>
            <TableList
              isLoading={isLoading}
              data={transformData(rows)}
              hideActionTitle={true}
              headers={tableHeaders}
              handleSort={handleSort}
              sortBy={sortBy}
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
          </>
        ) : (
          MediaCard()
        )}
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
                    name="exportType"
                    checked={exportType === 'filtered'}
                    value={'filtered'}
                    disabled={isDisabledFilteredExporting}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                    className="form-check-input"
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
                    name="exportType"
                    checked={exportType === 'all'}
                    value={'all'}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                    className="form-check-input"
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
        <SuccessPopUpModal
          title={'Success!'}
          message={'Donor is archived.'}
          modalPopUp={archiveModalPopUp}
          setModalPopUp={setArchiveModalPopUp}
          onConfirm={() => {
            setArchiveModalPopUp(false);
          }}
          showActionBtns={true}
        />
      </div>
    </div>
  );
}

export default AccountList;
