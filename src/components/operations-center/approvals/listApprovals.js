import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../common/topbar/index';
import Pagination from '../../common/pagination/index';
import { toast } from 'react-toastify';
import TableList from './tableListingApprovals';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import exportImage from '../../../assets/images/exportImage.svg';
import JsPDF from 'jspdf';
import { CSVLink } from 'react-csv';
import SvgComponent from '../../common/SvgComponent';
import SuccessPopUpModal from '../../common/successModal';
import ApprovalsFilters from './approvalsFilters/approvalsFilter';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import { ApprovalsBreadCrumbsData } from './ApprovalsBreadCrumbsData';
import ConfirmArchiveIcon from '../../../assets/images/ConfirmArchiveIcon.png';
import moment from 'moment';
import { API } from '../../../api/api-routes';
let inputTimer = null;
const initialDate = {
  startDate: null,
  endDate: null,
};

export default function ApprovalsListing() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem('token');

  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(true);
  const [approvalId, setApprovalId] = useState(null);
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [filterApplied, setFilterApplied] = useState({});
  const [downloadType, setDownloadType] = useState(null);
  const [exportType, setExportType] = useState('filtered');
  const [selectedOptions, setSelectedOptions] = useState();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToArchive, setItemToArchive] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [rows, setRows] = useState([]);
  const [dateRange, setDateRange] = useState(initialDate);
  const [operationDateRange, setOperationDateRange] = useState(initialDate);
  const [orgData, setOrgData] = useState('');
  const [opTypeData, setOpTypeData] = useState('');
  const [totalRecords, setTotalRecords] = useState(10);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'is_discussion_required',
      minWidth: '10rem',
      label: '',
      sortable: false,
      checked: true,
    },
    {
      name: 'request_date',
      label: 'Request Date',
      sortable: true,
      checked: true,
    },
    {
      name: 'requested_by',
      label: 'Requested By',
      sortable: true,
      checked: true,
    },
    {
      name: 'operation_date',
      label: 'Operation Date',
      minWidth: '14rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'name',
      label: 'Name',
      sortable: true,
      checked: true,
    },
    {
      name: 'collection_operation',
      label: 'Collection Op',
      sortable: true,
      checked: true,
    },
    {
      name: 'request_type',
      label: 'Request Type',
      sortable: true,
      checked: true,
    },
    {
      name: 'request_status',
      label: 'Request Status',
      sortable: true,
      checked: true,
    },
  ]);
  const updateOrgData = (value) => {
    setOrgData(value);
    setFilterApplied({
      ...filterApplied,
      organizational_levels: value,
    });
  };

  const updateOpTypeData = (value) => {
    setOpTypeData(value);
    setFilterApplied({
      ...filterApplied,
      operation_type: value,
    });
  };

  const UpdateOperationDateChange = (value) => {
    if (value.startDate && value.endDate) {
      setOperationDateRange(value);
      const newValue = `${moment(value.startDate).format(
        'YYYY-MM-DD'
      )},${moment(value.endDate).format('YYYY-MM-DD')}`;
      setFilterApplied({
        ...filterApplied,
        operation_date: newValue,
      });
    }
  };
  const UpdateDateChange = (value) => {
    if (value.startDate && value.endDate) {
      setDateRange(value);

      const newValue = `${moment(value.startDate).format(
        'YYYY-MM-DD'
      )},${moment(value.endDate).format('YYYY-MM-DD')}`;

      setFilterApplied({
        ...filterApplied,
        request_date: newValue,
      });
    }
  };
  const resetDateHandler = () => {
    setDateRange({ ...initialDate });
    setFilterApplied({
      ...filterApplied,
      request_date: '',
    });
  };
  const resetOperationDateHandler = () => {
    setOperationDateRange({ ...initialDate });
    setFilterApplied({
      ...filterApplied,
      operation_date: '',
    });
  };
  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };
  useEffect(() => {
    if (!(searchText.length && searchText.length < 2)) {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(async () => {
        setIsLoading(true);
        fetchAllStages(filterApplied);
      }, 500);
    }
  }, [
    searchText.length,
    limit,
    currentPage,
    refresh,
    sortBy,
    sortOrder,
    dateRange.startDate,
    dateRange.endDate,
    operationDateRange.startDate,
    operationDateRange.endDate,
    orgData,
    opTypeData,
    filterApplied,
  ]);

  const confirmArchive = async () => {
    try {
      const { data } = await API.ocApprovals.archive(token, id);
      if (data?.status_code == 200) {
        setShowConfirmation(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
        fetchAllStages({});
      } else if (data?.status_code == 404) {
        toast.error(data.response, {
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.log({ err });
    }

    setRefresh(true);
    setShowConfirmation(false);
    setItemToArchive(null);
  };

  const cancelArchive = () => {
    setShowConfirmation(false);
    setItemToArchive(null);
  };

  const fetchAllStages = async (filters) => {
    setIsLoading(true);
    setFilterApplied(filters);
    try {
      const getFilterValue = (filter) => {
        if (typeof filter === 'object' && 'value' in filter) {
          return filter.value.trim();
        } else if (Array.isArray(filter)) {
          return filter[0];
        } else {
          return filter;
        }
      };
      const filterProperties = [
        'request_date',
        'operation_date',
        'organizational_levels',
        'operation_type',
        'request_type',
        'requestor',
        'manager',
        'request_status',
        'requested_by',
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
        `${BASE_URL}/operations/approvals?page=${
          searchText?.length > 1 ? 1 : currentPage
        }&limit=${limit}${sortBy ? `&sortBy=${sortBy}` : ''}${
          sortOrder ? `&sortOrder=${sortOrder}` : ''
        }${
          searchText?.length >= 2 ? `&keyword=${searchText}` : ''
        }&${queryParams.trim()}${
          exportType ? `&exportType=${exportType}` : ''
        }${downloadType ? `&downloadType=${downloadType}` : ''}
        ${exportType === 'all' ? `&fetchAll=${'true'}` : ''}
        ${
          selectedOptions && exportType === 'filtered'
            ? `&selectedOptions=${selectedOptions?.label}`
            : ''
        }
        &tableHeaders=${JSON.stringify(tableHeaders.map((item) => item.name))}`
      );
      const data = await response.json();
      if (data) {
        setApprovalId(data?.data[0]?.id);
        const modifiedData = data?.data?.map((item) => ({
          ...item,
          request_date: moment(item?.request_date).format('MM-DD-YYYY'),
          operation_date: moment(item?.operation_date).format('MM-DD-YYYY'),
          requested_by: item?.requested_by,
          request_type: item?.request_type,
          request_status: item?.request_status,
          is_discussion_required: item?.is_discussion_required,
          collection_operation: item?.collection_operation,
        }));
        setDownloadType(null);
        if (data?.url) {
          const urlParts = data?.url.split('/');
          const filenameWithExtension = urlParts[urlParts.length - 1];
          const [filename, fileExtension] = filenameWithExtension.split('.');
          const response = await fetch(data?.url);
          const blob = await response.blob();
          const filenameToUse = `${filename}.${fileExtension}`;
          const a = document.createElement('a');
          a.style.display = 'none';
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = filenameToUse;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setRows(modifiedData);
        setTotalRecords(data?.count);
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };
  const generatePDF = async (csvPDFData) => {
    const doc = new JsPDF();

    const tableData = csvPDFData.map((row) => row.split(','));
    doc.text('Operation Center Approvals', 10, 10);

    const columnWidths = tableData.reduce((acc, row) => {
      row.forEach((cell, columnIndex) => {
        acc[columnIndex] = Math.max(
          acc[columnIndex] || 0,
          doc.getStringUnitWidth(cell)
        );
      });
      return acc;
    }, []);

    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const pageWidth = doc.internal.pageSize.width - 20;
    const scaleFactor = pageWidth / totalWidth;
    const scaledWidths = columnWidths.map((width) => width * scaleFactor);

    doc.autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: scaledWidths.map((width) => ({ columnWidth: width })),
      startY: 20,
    });

    // Save the PDF
    doc.save('Oc_Approvals.pdf');
  };
  const [csvData, setCsvData] = useState([]);
  const handleDownload = async () => {
    const csvPDFData = [
      'Request Date,Requested By,Operation Date,Name,Collection Op,Request Type,Request Status',
    ];

    if (exportType === 'filtered' && downloadType === 'PDF') {
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        csvPDFData.push(
          `${item.request_date},${item.requested_by},${item.operation_date},${item.name},${item.collection_operation},${item.request_type},${item.request_status}`
        );
      }
      generatePDF(csvPDFData);
    }

    if (exportType === 'all' && downloadType === 'PDF') {
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        csvPDFData.push(
          `${item.request_date},${item.requested_by},${item.operation_date},${item.name},${item.collection_operation},${item.request_type},${item.request_status}`
        );
      }
      generatePDF(csvPDFData);
    }

    setShowExportDialogue(false);
  };
  useEffect(() => {
    setCsvData([]);
    if (exportType === 'filtered' && downloadType === 'CSV') {
      rows?.map((item) => {
        setCsvData((prev) => [
          ...prev,
          {
            request_date: item.request_date,
            requested_by: item.requested_by,
            operation_date: item.operation_date,
            name: item.name,
            collection_operation: item.collection_operation,
            request_type: item.request_type.name,
            manager: item.manager,
            request_status: item.request_status,
          },
        ]);
      });
    }

    if (exportType === 'all' && downloadType === 'CSV') {
      setAllCSVData();
    }
  }, [exportType, downloadType]);

  const setAllCSVData = async () => {
    setCsvData([]);
    rows.map((item) => {
      setCsvData((prev) => [
        ...prev,
        {
          request_date: item.request_date,
          requested_by: item.requested_by,
          operation_date: item.operation_date,
          name: item.name,
          collection_operation: item.collection_operation,
          request_type: item.request_type.name,
          manager: item.manager,
          request_status: item.request_status,
        },
      ]);
    });
  };
  const headers = [
    { label: 'Request Date', key: 'request_date' },
    { label: 'Requested By', key: 'requested_by' },
    { label: 'Operation Date', key: 'operation_date' },
    { label: 'Name', key: 'name' },
    { label: 'Collection Op', key: 'collection_operation' },
    { label: 'Request Type', key: 'request_type' },
    { label: 'Request Status', key: 'request_status' },
  ];

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

  const optionsConfig = [
    {
      label: 'View',
      path: (rowData) => `${rowData.id}/view`,
      action: (rowData) => {},
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setId(rowData.id);
        handleArchive(rowData.id);
      },
    },
  ];
  const handleArchive = (rowData) => {
    setShowConfirmation(true);
    setItemToArchive(rowData?.id);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={ApprovalsBreadCrumbsData}
        BreadCrumbsTitle={'Approvals'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="mainContentInner crm">
        {/* <AccountFilters
          fetchAllStages={fetchAllStages}
          setIsLoading={setIsLoading}
        /> */}
        <ApprovalsFilters
          setIsLoading={setIsLoading}
          fetchAllStages={fetchAllStages}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          UpdateDateChange={UpdateDateChange}
          UpdateOperationDateChange={UpdateOperationDateChange}
          resetOperationDateHandler={resetOperationDateHandler}
          resetDateHandler={resetDateHandler}
          updateOrgData={updateOrgData}
          updateOpTypeData={updateOpTypeData}
          setFilterApplied={setFilterApplied}
          filterApplied={filterApplied}
        />
        <div className="buttons d-flex align-items-center gap-3">
          <div className="exportButton">
            <div
              className={`optionsIcon `}
              style={{
                cursor: 'pointer',
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
                  }}
                >
                  CSV
                </Link>
              </li>
            </ul>
          </div>
          {CheckPermission([OcPermissions.OPERATIONS_CENTER.APPROVAL.READ]) && (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (approvalId) {
                  navigate(
                    `/operations-center/approvals/ListApprovals/${approvalId}/view`
                  );
                } else {
                  toast.error(`There is no approval left`, {
                    autoClose: 3000,
                  });
                }
              }}
            >
              Begin Approvals
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
            handleArchive(itemToArchive);
          }}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Approval Archived."
          modalPopUp={archiveSuccess}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
        />
        <section
          className={`popup full-section ${showConfirmation ? 'active' : ''}`}
        >
          <div className="popup-inner">
            <div className="icon">
              <img src={ConfirmArchiveIcon} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Confirmation</h3>
              <p>Are you sure you want to archive?</p>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => cancelArchive()}
                >
                  No
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => confirmArchive()}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </section>
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
                    name="exportType"
                    checked={exportType === 'filtered'}
                    value={'filtered'}
                    onChange={(e) => {
                      setExportType(e.target.value);
                    }}
                    className="form-check-input"
                  />
                  <label className="form-check-label">
                    <span>Filtered Results</span>
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
                  <label className="form-check-label">
                    <span>All Data</span>
                  </label>
                </div>
              </div>
              <div className="buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExportDialogue(false)}
                >
                  Cancel
                </button>
                {downloadType === 'PDF' && (
                  <button className="btn btn-primary" onClick={handleDownload}>
                    Download
                  </button>
                )}

                {downloadType === 'CSV' && (
                  <CSVLink
                    className="btn btn-primary"
                    filename={'donor_Centers.csv'}
                    data={csvData}
                    headers={headers}
                    onClick={() => setShowExportDialogue(false)}
                  >
                    Download
                  </CSVLink>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
