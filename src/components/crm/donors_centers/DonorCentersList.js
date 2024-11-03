import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import jwt from 'jwt-decode';
import TopBar from '../../common/topbar/index';
import Pagination from '../../common/pagination/index';
import { toast } from 'react-toastify';
import TableList from './DonorsCenterTableListing';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import DonorCentersFilters from './DonorsCentersFilters';
import SvgComponent from '../../common/SvgComponent';
import { Link } from 'react-router-dom';
import styles from './index.module.scss';
import exportImage from '../../../assets/images/exportImage.svg';
import { Form } from 'react-bootstrap';
import { CRM_DONORS_CENTERS } from '../../../routes/path';
import SuccessPopUpModal from '../../common/successModal';
import CheckPermission from '../../../helpers/CheckPermissions';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import { DonorCentersBreadCrumbsData } from './DonorCentersBreadCrumbsData';
import axios from 'axios';
import { downloadFile } from '../../../utils';

let inputTimer = null;

function DonorCentersList() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [downloadType, setDownloadType] = useState(null);
  const [exportType, setExportType] = useState('filtered');
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState();
  const [filterObject, setFilterObject] = useState([]);
  const [isDisabledFilteredExporting, setIsDisabledFilteredExporting] =
    useState(false);
  const [archivePopup, setArchivePopup] = useState(false);
  const [filterApplied, setFilterApplied] = useState({});
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'code',
      label: 'BECS Code',
      sortable: true,
      checked: true,
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
      name: 'city',
      label: 'City',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'state',
      label: 'State',
      sortable: true,
      checked: true,
    },
    {
      name: 'staging_site',
      label: 'Staging Facility',
      sortable: true,
      checked: true,
      splitlabel: true,
    },
    {
      name: 'collection_operation',
      label: 'Collection Operation',
      sortable: true,
      checked: true,
      splitlabel: true,
    },
    {
      name: 'alternate_name',
      label: 'Alternate Name',
      sortable: true,
      checked: false,
    },
    {
      name: 'physical_address',
      label: 'Physical Address',
      sortable: true,
      checked: false,
    },
    {
      name: 'zip_code',
      label: 'Zip Code',
      sortable: true,
      checked: false,
    },
    {
      name: 'county',
      label: 'County',
      sortable: true,
      checked: false,
    },
    {
      name: 'phone',
      label: 'Phone',
      sortable: true,
      checked: false,
    },
    {
      name: 'industry_category',
      label: 'Industry Category',
      sortable: true,
      checked: false,
    },
    {
      name: 'industry_sub_category',
      label: 'Industry Subcategory',
      sortable: true,
      checked: false,
    },
    {
      name: 'donor_center',
      label: 'Donor Center',
      sortable: true,
      checked: false,
    },
    {
      name: 'status',
      label: 'Status',
      sortable: true,
      checked: true,
    },
  ]);
  const [userId, setUserId] = useState(null);
  const [facilitityId, setFacilitityId] = useState('');

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };
  useEffect(() => {
    if (!sortOrder && !sortBy) {
      setSortOrder('asc');
      setSortBy('name');
    }
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchAllDonorCenters({});
    }, 500);
  }, [searchText, limit, currentPage, sortBy, refresh, sortOrder]);

  const fetchAllDonorCenters = async (filters) => {
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

      let params = {
        sortOrder: sortOrder,
        sortBy: sortBy,
        page: currentPage,
        limit: +limit,
        keyword: searchText,
        city:
          typeof filters?.city !== 'string'
            ? filters?.city
                ?.map((item) => (item?.id ? item.id : item))
                .join(',') || ''
            : '',
        county:
          typeof filters?.county !== 'string'
            ? filters?.county
                ?.map((item) => (item?.id ? item.id : item))
                .join(',') || ''
            : '',
        organizational_levels: filters?.organizational_levels || '',
        state:
          typeof filters?.state !== 'string'
            ? filters?.state
                ?.map((item) => (item?.id ? item.id : item))
                .join(',') || ''
            : '',
        collection_operation:
          filters?.collection_operation &&
          filters?.collection_operation.length > 0
            ? filters?.collection_operation
                .map((item) => (item?.id ? item.id : item))
                .join(',')
            : '',
        staging_site:
          filters?.staging_facility == ''
            ? null
            : filters?.staging_facility == 'Yes'
            ? true
            : filters?.staging_facility == 'No'
            ? false
            : null,
        is_active: getStatusValue(filters?.status),
        downloadType: downloadType ?? '',
        exportType: exportType ?? '',
        selectedOptions: selectedOptions?.label ?? '',
        tableHeaders:
          tableHeaders
            ?.filter((item) => item.checked === true)
            ?.map((item) => item.name)
            ?.join(',') ?? '',
      };

      const cleanedFilters = Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== '' && value != undefined
        )
      );
      setFilterObject(cleanedFilters);
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/system-configuration/facilities/donor-centers/search`,
        JSON.stringify(cleanedFilters)
      );
      const data = await response.json();
      if (data) {
        setRows(data?.data);
        setTotalRecords(data?.total_records);
        setRefresh(false);
        if (data?.url) {
          await downloadFile(data?.url);
        }
      }
      setDownloadType(null);
    } catch (error) {
      setDownloadType(null);
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      const decodeToken = jwt(jwtToken);
      if (decodeToken?.id) {
        setUserId(decodeToken?.id);
      }
    }
  }, [userId]);
  const optionsConfig = [
    CheckPermission([CrmPermissions.CRM.DONOR_CENTERS.READ]) && {
      label: 'View',
      path: (rowData) => CRM_DONORS_CENTERS.VIEW.replace(':id', rowData.id),
      action: (rowData) => {},
    },
    CheckPermission([CrmPermissions.CRM.DONOR_CENTERS.WRITE]) && {
      label: 'Edit',
      path: (rowData) =>
        '/system-configuration/resource-management/facilities/:id'.replace(
          ':id',
          rowData.id
        ),
      action: (rowData) => {},
    },
    CheckPermission([CrmPermissions.CRM.DONOR_CENTERS.ARCHIVE]) && {
      label: 'Archive',
      action: (rowData) => {
        setFacilitityId(rowData.id);
        setArchivePopup(true);
      },
    },
  ].filter(Boolean);

  const handleArchive = async () => {
    try {
      const bearerToken = localStorage.getItem('token');
      const address = {
        ...rows.find((x) => x?.id === facilitityId)?.address,
        latitude: rows.find((x) => x?.id === facilitityId)?.address?.coordinates
          ?.x,
        longitude: rows.find((x) => x?.id === facilitityId)?.address
          ?.coordinates?.y,
      };
      const body = {
        ...rows.find((x) => x?.id === facilitityId),
        address: address,
        is_archived: true,
        created_by: parseInt(userId),
      };
      const _URL = `${BASE_URL}/system-configuration/facilities/${facilitityId}`;

      const response = await axios.put(
        _URL,
        {
          ...body,
          industry_category: rows.find((x) => x?.id === facilitityId)
            ?.industry_category?.id,
          industry_sub_category: rows
            .filter((x) => x?.id === facilitityId)
            .flatMap((x) =>
              x?.industry_sub_category?.map((subCat) => subCat.id)
            ),

          collection_operation: rows.find((x) => x?.id === facilitityId)
            ?.collection_operation?.id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      const result = response.data;
      if (result?.status === 'success') {
        setArchivePopup(false);
        setArchiveSuccess(true);
        fetchAllDonorCenters({});
      } else if (response?.status === 400) {
        toast.error(`${result?.message?.[0] ?? result?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${result?.message?.[0] ?? result?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const checkExportType = () => {
    const objectKeys = Object.keys(filterObject);
    const filters = [
      'keyword',
      'is_active',
      'city',
      'state',
      'collection_operation',
      'staging_site',
      'county',
    ];
    const hasMatchingFilterKey = objectKeys.some((key) =>
      filters.includes(key)
    );
    if (!hasMatchingFilterKey) {
      setIsDisabledFilteredExporting(true);
      setExportType('all');
    } else {
      setIsDisabledFilteredExporting(false);
      setExportType('filtered');
    }
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={DonorCentersBreadCrumbsData}
        BreadCrumbsTitle={'Donors Centers'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="mainContentInner crm">
        <DonorCentersFilters
          fetchAllStages={fetchAllDonorCenters}
          setIsLoading={setIsLoading}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
        <div className="d-flex flex-direction-row justify-content-between sm-wrap">
          <div className="w-100">
            <div
              className={`optionsIcon ${styles.neutral}`}
              aria-expanded="false"
              style={{ color: '#555555', fontSize: '14px' }}
            >
              <SvgComponent name={'Info'} /> Donor Centers are created in System
              Configurations.
            </div>
          </div>
          <div className="buttons d-flex align-items-center justify-content-between">
            <div className="exportButton">
              <div
                className={`optionsIcon ${styles.pointer}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <SvgComponent name={'DownloadIcon'} />
                <span>Export Data</span>
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
          </div>
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
          title={'Confirmation'}
          message={'Are you sure want to archive?'}
          modalPopUp={archivePopup}
          isNavigate={true}
          setModalPopUp={setArchivePopup}
          showActionBtns={archivePopup ? false : true}
          isArchived={archivePopup}
          archived={handleArchive}
        />

        <SuccessPopUpModal
          title="Success!"
          message="Donor Center is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
          redirectPath="/crm/donor_center"
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
                Select one of the following option to <br />
                download the {downloadType}.
              </p>
              <div className="content-inner">
                <Form.Check
                  value="filtered"
                  type="radio"
                  aria-label="radio 1"
                  label="Filtered Results"
                  disabled={isDisabledFilteredExporting}
                  onChange={(e) => setExportType(e.target.value)}
                  checked={exportType === 'filtered'}
                  id="filteredRadio"
                  className="radioChecks"
                />
                <Form.Check
                  value="all"
                  type="radio"
                  aria-label="radio 2"
                  label="All Data"
                  onChange={(e) => setExportType(e.target.value)}
                  checked={exportType === 'all'}
                  id="allRadio"
                  className="radioChecks "
                />
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
                        fetchAllDonorCenters(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllDonorCenters(isFilterApplied);
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
                        fetchAllDonorCenters(filterApplied);
                      } else {
                        const isFilterApplied = Object.values(filterApplied)
                          ? filterApplied
                          : {};
                        fetchAllDonorCenters(isFilterApplied);
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

export default DonorCentersList;
