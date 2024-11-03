import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../common/topbar/index';
import Pagination from '../../common/pagination/index';
import { toast } from 'react-toastify';
import TableList from './tableListingLocations';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import exportImage from '../../../assets/images/exportImage.svg';
import SvgComponent from '../../common/SvgComponent';
import SuccessPopUpModal from '../../common/successModal';
import LocationCentersFilters from './locationsFilters/locationFilter';
import CheckPermission from '../../../helpers/CheckPermissions';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import { LocationsBreadCrumbsData } from './LocationsBreadCrumbsData';
import { downloadFile } from '../../../utils';

let inputTimer = null;

export default function StaffListSchedule() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(true);
  // const [selectedStatus, setSelectedStatus] = useState('');
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [filterApplied, setFilterApplied] = useState({});
  const [downloadType, setDownloadType] = useState(null);
  const [exportType, setExportType] = useState('filtered');
  const [selectedOptions, setSelectedOptions] = useState();
  const [isDisabledFilteredExporting, setIsDisabledFilteredExporting] =
    useState(false);

  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(10);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'becs_code',
      minWidth: '10rem',
      width: '10rem',
      label: 'BECS Code',
      sortable: true,
      checked: true,
      splitlabel: true,
    },
    {
      name: 'name',
      label: 'Name',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'room',
      label: 'Room',
      minWidth: '14rem',
      width: '14rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'address',
      label: 'Address',
      width: '20%',
      sortable: true,
      checked: false,
    },
    {
      name: 'site_type',
      label: 'Site Type',
      minWidth: '10rem',
      width: '10rem',
      sortable: true,
      splitlabel: true,
      checked: true,
    },
    {
      name: 'cross_street',
      label: 'Cross Street',
      sortable: true,
      splitlabel: true,
      checked: false,
    },
    {
      name: 'floor',
      label: 'Floor',
      sortable: true,
      checked: false,
    },
    {
      name: 'qualification_status',
      label: 'Qualification Status',
      sortable: true,
      splitlabel: true,
      checked: true,
    },
    {
      name: 'county',
      label: 'County',
      sortable: true,
      checked: false,
    },
    {
      name: 'room_phone',
      label: 'Room Phone',
      sortable: true,
      checked: false,
    },
    {
      name: 'site_contact_id',
      label: 'Site Contact',
      sortable: true,
      checked: true,
    },
    {
      name: 'is_active',
      label: 'Status',
      sortable: true,
      checked: true,
    },
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };
  useEffect(() => {
    if (!sortBy) {
      setSortBy('name');
      setSortOrder('asc');
    }
    if (!(searchText.length && searchText.length < 2)) {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(async () => {
        setIsLoading(true);
        fetchAllStages(filterApplied);
      }, 500);
    }
  }, [searchText.length, limit, currentPage, sortBy, sortOrder]);

  const fetchAllStages = async (filters) => {
    setIsLoading(true);
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
          return true;
        }
      };
      const getFilterValue = (filter) => {
        if (typeof filter === 'object' && 'value' in filter) {
          return filter.value.trim();
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
        'filter_id',
        'collection_operation',
        'recruiter',
        'territory',
        'organizational_levels',
        'qualification_status',
        'site_type',
        'account',
        'business_unit',
        'country',
        'county',
      ];
      const queryParams = filterProperties
        .map((property) => {
          const filterValue = getFilterValue(filters[property.trim()]);
          return filterValue ? `${property}=${filterValue.trim()}` : '';
        })
        .filter((param) => param !== '')
        .join('&');
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/crm/locations?page=${
          searchText?.length > 1 ? 1 : currentPage
        }&limit=${limit}${sortBy ? `&sortName=${sortBy}` : ''}${
          sortOrder ? `&sortOrder=${sortOrder}` : ''
        }${
          searchText?.length >= 2 ? `&keyword=${searchText}` : ''
        }&status=${getStatusValue(filters?.status)}&${queryParams.trim()}${
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
          .map((item) => item.name)}`
      );
      const data = await response.json();
      if (data) {
        const modifiedData = data?.data?.map((item) => ({
          ...item,
          qualification_statuss: item.qualification_status,
          site_contact_id: `${
            item?.site_contact_id?.first_name
              ? item?.site_contact_id?.first_name + ' '
              : ''
          }${item?.site_contact_id?.last_name || ''}`,
          address: `${item?.address?.address1} ${item?.address?.address2} ${item?.address?.city} ${item?.address?.state} ${item?.address?.zip_code}`,
        }));
        setDownloadType(null);
        if (data?.url) {
          await downloadFile(data?.url);
        }
        setRows(modifiedData);
        setTotalRecords(data?.count);
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  const handleArchive = async (id) => {
    try {
      const response = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/crm/locations/archive/${id}`
      );
      const data = await response.json();
      if (data.status_code == 201) {
        setModalPopUp(false);
        fetchAllStages({});
      }
    } catch (err) {
      console.log({ err });
    }
  };
  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
      } else {
        setSortOrder('desc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
  const checkExportType = () => {
    const filterProperties = [
      'city',
      'state',
      'filter_id',
      'collection_operation',
      'recruiter',
      'territory',
      'organizational_levels',
      'qualification_status',
      'site_type',
      'account',
      'business_unit',
      'country',
      'county',
    ];
    const queryParams = filterProperties
      .map((property) => {
        const filterValue = getFilterValue(filterApplied[property.trim()]);
        return filterValue ? `${property}=${filterValue.trim()}` : '';
      })
      .filter((param) => param !== '')
      .join('&');
    if (!queryParams && !getStatusValue(filterApplied?.status)) {
      setIsDisabledFilteredExporting(true);
      setExportType('all');
    } else {
      setIsDisabledFilteredExporting(false);
      setExportType('filtered');
    }
  };

  const optionsConfig = [
    CheckPermission([
      CrmPermissions.CRM.LOCATIONS.READ,
      CrmPermissions.CRM.LOCATIONS.WRITE,
    ])
      ? {
          label: 'View',
          path: (rowData) => `${rowData.id}/view`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.LOCATIONS.WRITE])
      ? {
          label: 'Edit',
          path: (rowData) => `${rowData.id}/edit`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.LOCATIONS.ARCHIVE])
      ? {
          label: 'Archive',
          action: (rowData) => {
            setModalPopUp(true);
            setId(rowData.id);
            // handleArchive(rowData.id);
            // setArchiveID(rowData.id);
          },
        }
      : null,
  ].filter(Boolean);
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={LocationsBreadCrumbsData}
        BreadCrumbsTitle={'Location'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="mainContentInner crm">
        {/* <AccountFilters
          fetchAllStages={fetchAllStages}
          setIsLoading={setIsLoading}
        /> */}
        <LocationCentersFilters
          setIsLoading={setIsLoading}
          fetchAllStages={fetchAllStages}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
        />
        <div className="buttons d-flex align-items-center">
          <div className="exportButton">
            <div
              className={`optionsIcon `}
              style={{
                marginRight: '30px',
                cursor: 'pointer',
                color: '#387DE5',
              }}
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <SvgComponent name={'DownloadIcon'} /> <span>Export Data</span>
            </div>
            <ul className="dropdown-menu">
              <li>
                <Link
                  onClick={() => {
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
          {CheckPermission([CrmPermissions.CRM.LOCATIONS.WRITE]) && (
            <button
              style={{
                minHeight: '0px',
                padding: '12px 32px 12px 32px',
              }}
              className="btn btn-primary"
              onClick={() => navigate('/crm/locations/create')}
            >
              Create Location
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
          title="Confirmation"
          message={'Are you sure you want to archive?'}
          modalPopUp={modalPopUp}
          setModalPopUp={setModalPopUp}
          showActionBtns={false}
          // loading={archiveLoading}
          isArchived={true}
          archived={() => {
            handleArchive(id);
          }}
        />
        <section
          className={`exportData popup full-section ${
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
                    <span>Filtered Results</span>
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
                    <span>All Data</span>
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
                        fetchAllStages(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllStages(isFilterApplied);
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
                        fetchAllStages(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllStages(isFilterApplied);
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
