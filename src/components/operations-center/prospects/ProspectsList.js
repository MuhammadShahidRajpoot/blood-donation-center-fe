import React, { useState, useEffect } from 'react';
import TopBar from '../../common/topbar/index';
import SelectDropdown from '../../common/selectDropdown';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
import TableList from '../../common/tableListing';
import Pagination from '../../common/pagination';
import SuccessPopUpModal from '../../common/successModal';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';
import DatePicker from '../../common/DatePicker';
import { fetchData } from '../../../helpers/Api';
import JsPDF from 'jspdf';
import exportImage from '../../../assets/images/exportImage.svg';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../helpers/constants';
import moment from 'moment';
import { formatDate } from '../../../helpers/formatDate';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import SvgComponent from '../../common/SvgComponent';
import { CSVLink } from 'react-csv';
import {
  covertDatetoTZDate,
  covertToTimeZone,
} from '../../../helpers/convertDateTimeToTimezone';
let inputTimer = null;
const ProspectsList = () => {
  const [searchText, setSearchText] = useState('');
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [prospectsData, setProspectsData] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModalText, setShowModalText] = useState(null);
  const [actionId, setActionID] = useState(null);
  const [showModel, setShowModel] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [downloadType, setDownloadType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [csvData, setCsvData] = useState([]);
  const [csvPDFData, setCsvPDFData] = useState([
    'Name,Description,Contact,Delivered,Read,Click Thought,Conversion,Create Date,Send Date,Status',
  ]);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'name',
      label: 'Prospect Name',
      minWidth: '15rem',
      width: '15rem',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'description',
      label: 'Description',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'contacts',
      label: 'Contacts',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'delivered',
      label: 'Delivered',
      sortable: false,
      defaultHidden: true,
    },
    { name: 'read', label: 'Read', sortable: false, defaultHidden: false },
    {
      name: 'click_throughts',
      label: 'Click Thoughts',
      sortable: false,
      defaultHidden: true,
    },
    {
      name: 'conversions',
      label: 'Conversions',
      sortable: false,
      defaultHidden: true,
    },
    {
      name: 'created_at',
      label: 'Create Date',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'communications.schedule_date',
      label: 'Send Date',
      sortable: true,
      defaultHidden: true,
    },
    {
      name: 'status',
      label: 'Status',
      width: '25%',
      sortable: true,
      defaultHidden: false,
    },
  ]);
  const bearerToken = localStorage.getItem('token');
  const generatePDF = async () => {
    // Initialize jsPDF
    const doc = new JsPDF();
    const tableData = csvPDFData.map((row) => row.split(','));
    // Add content to the PDF
    await doc.text('CSV to PDF Conversion', 10, 10);

    // Calculate the maximum column width for each column
    const columnWidths = tableData.reduce((acc, row) => {
      row.forEach(async (cell, columnIndex) => {
        acc[columnIndex] = Math.max(
          acc[columnIndex] || 0,
          (await doc.getStringUnitWidth(cell)) + 10
        );
      });
      return acc;
    }, []);

    // Calculate the total width required for the table
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Calculate scaling factor based on the page width
    const pageWidth = doc.internal.pageSize.width - 30; // Adjust for margin
    const scaleFactor = pageWidth / totalWidth;

    // Scale the column widths
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
    const timeStamp = moment().format('MM-DD-YYYY-HH-mm-ss');
    // Save the PDF
    setTimeout(() => doc.save(`Prospect_${timeStamp}.pdf`), 100);

    setShowExportDialogue(false);
  };

  const handleDownloadClick = () => {
    setShowExportDialogue(false);
  };
  const headers = [
    {
      key: 'name',
      label: 'Prospects Name',
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'contacts',
      label: 'Contacts',
    },
    {
      key: 'read',
      label: 'Read',
    },
    {
      key: 'delivered',
      label: 'Delivered',
    },
    {
      key: 'click_thoughts',
      label: 'Click Thoughts',
    },
    {
      key: 'conversions',
      label: 'Conversions',
    },
    {
      key: 'created_at',
      label: 'Created at',
    },
    {
      key: 'schedule_date',
      label: 'Send Date',
    },
    { key: 'status', label: 'Status' },
  ];
  useEffect(() => {
    setCsvData([]);
    setCsvPDFData([
      'Name,Description,Contact,Delivered,Read,Click Thought,Conversion,Create Date,Send Date,Status',
    ]);
    const allPdf = async () => {
      await getWithStatus(true);
      prospectsData.map((item) => {
        setCsvPDFData((prev) => [
          ...prev,
          `${item?.name},${item?.description},${
            item?.contactsCount
          },,,,,${formatDate(item?.created_at, 'MM-DD-YYYY')},${formatDate(
            item?.communications?.schedule_date,
            'MM-DD-YYYY'
          )},${item?.is_active ? 'Active' : 'Inactive'}`,
        ]);
        return item;
      });
    };
    const allCsv = async () => {
      await getWithStatus(true);

      prospectsData?.map((el) => {
        setCsvData((prev) => [
          ...prev,
          {
            name: el?.name,
            description: el?.description,
            contacts: el?.contactsCount,
            delivered: '',
            read: '',
            click_thoughts: '',
            conversions: '',
            created_at: formatDate(el?.created_at, 'MM-DD-YYYY'),
            schedule_date: formatDate(
              el?.communications?.schedule_date,
              'MM-DD-YYYY'
            ),
            status: el?.is_active ? 'Active' : 'Inactive',
          },
        ]);
        return el;
      });
    };
    if (downloadType === 'PDF') {
      allPdf();
    }
    if (downloadType === 'CSV') {
      allCsv();
    }
  }, [downloadType]);
  const handleDateChange = (dates) => {
    const [start, end] = dates;

    const value = { startDate: start, endDate: end };
    setDateRange(value);
    setCurrentPage(1);
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/operations-center/prospects/${actionId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let data = await response.json();
      if (data?.status === 'success') {
        setShowSuccessMessage(true);
        setShowModalText('Prospect is archived.');
        setIsArchived(false);
        setShowModel(false);
        getWithStatus();
      } else if (data?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWithStatus = async (all = false) => {
    setIsLoading(true);
    let search = searchText?.length > 1 ? searchText : '';
    const result = await fetchData(
      `/operations-center/prospects?limit=${limit}&page=${currentPage}&is_active=${
        isActive?.value ?? ''
      }&sortName=${sortBy}&sortOrder=${sortOrder}&name=${search}&start_date=${
        dateRange?.startDate && dateRange?.startDate !== ''
          ? covertToTimeZone(
              moment(dateRange?.startDate).startOf('day')
            ).format('YYYY-MM-DDTHH:mm:ss')
          : ''
      }&end_date=${
        dateRange?.endDate && dateRange?.endDate !== ''
          ? covertToTimeZone(moment(dateRange?.endDate).endOf('day')).format(
              'YYYY-MM-DDTHH:mm:ss'
            )
          : ''
      }&fetchAll=${all}`
    );
    if (result?.status === 'success') {
      setProspectsData(() => {
        return result?.data?.map((el) => ({
          ...el,
          name: el?.name,
          description: el?.description,
          contacts: el?.contactsCount,
          delivered: '',
          read: '',
          click_throughts: '',
          conversions: '',
          created_at: formatDate(
            covertDatetoTZDate(el?.created_at),
            'MM-DD-YYYY'
          ),
          'communications.schedule_date': formatDate(
            el?.communications?.schedule_date,
            'MM-DD-YYYY'
          ),
          status: el?.is_active,
          hideOption:
            formatDate(el?.communications?.schedule_date, 'MM-DD-YYYY') <
            getCurrentDateFormatted(),
        }));
      });
      setTotalRecords(result?.record_count);
      if (!(result?.data?.length > 0) && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      setIsLoading(false);
    } else {
      toast.error('Error Fetching Prospects ', { autoClose: 3000 });
      setIsLoading(false);
    }
  };
  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    return formatDate(currentDate, 'MM-DD-YYYY');
  };
  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      getWithStatus();
    }, 500);
  }, [
    isActive,
    sortBy,
    sortOrder,
    currentPage,
    dateRange?.startDate,
    dateRange?.endDate,
    searchText,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Prospect',
      class: 'disable-label',
      link: OS_PROSPECTS_PATH.LIST,
    },
  ];
  const optionsConfig = [
    CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.READ]) && {
      label: 'View',
      // path: (rowData) => {},
      path: (rowData) => `${rowData.id}/about`,
    },
    CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.WRITE]) && {
      label: 'Edit',
      path: (rowData) =>
        `${OS_PROSPECTS_PATH.EDIT.replace(':id', rowData?.id)}`,
    },
    CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.DUPLICATE]) && {
      label: 'Duplicate',
      path: (rowData) =>
        `${OS_PROSPECTS_PATH.DUPLICATE.replace(':id', rowData?.id)}`,
      action: (rowData) => {},
    },
    CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.CANCEL]) && {
      label: 'Cancel',
      path: (rowData) => {},
      action: (rowData) => {},
    },
    CheckPermission([OcPermissions.OPERATIONS_CENTER.PROSPECTS.ARCHIVE]) && {
      label: 'Archive',
      action: (rowData) => {
        setActionID(rowData?.id);
        setIsArchived(true);
        setShowModel(true);
      },
    },
  ].filter(Boolean);

  const handleAddClick = () => {
    navigate(OS_PROSPECTS_PATH.CREATE);
  };
  const handleIsActive = (value) => {
    setIsActive(value);
  };
  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };
  const handleSort = (column) => {
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
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Prospect'}
          SearchPlaceholder={'Search'}
          SearchValue={searchText}
          SearchOnChange={searchFieldChange}
        />
        <div className="filterBar">
          <div className="filterInner">
            <h2>Filters</h2>
            <div className="filterIcon" onClick={filterChange}>
              <SvgComponent
                name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
              />
            </div>
            <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
              <form className={`d-flex gap-3 w-100`}>
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={handleDateChange}
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  placeholderText="Date Range"
                  selectsRange
                />
                <SelectDropdown
                  placeholder={'Status'}
                  defaultValue={isActive}
                  selectedValue={isActive}
                  removeDivider
                  showLabel
                  onChange={handleIsActive}
                  options={[
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                  ]}
                />
              </form>
            </div>
          </div>
        </div>
        <div className="mainContentInner crm">
          <div className="buttons d-flex align-items-center gap-3">
            <div className="exportButton">
              <div className="dropdown-center">
                <div
                  className={`optionsIcon ${styles.pointer}`}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <SvgComponent name={'DownloadIcon'} />{' '}
                  <span>Export Data</span>
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
            </div>
            {CheckPermission([
              OcPermissions.OPERATIONS_CENTER.PROSPECTS.WRITE,
            ]) && (
              <button className="btn btn-primary" onClick={handleAddClick}>
                Create New Prospect
              </button>
            )}
          </div>

          <TableList
            isLoading={isLoading}
            data={prospectsData}
            headers={tableHeaders}
            handleSort={handleSort}
            sortOrder={sortOrder}
            optionsConfig={optionsConfig}
            showVerticalLabel={true}
            enableColumnHide={true}
            showActionsLabel={false}
            setTableHeaders={setTableHeaders}
          />
          <SuccessPopUpModal
            title={isArchived ? 'Confirmation' : 'Success!'}
            message={
              isArchived ? 'Are you sure want to archive?' : 'Prospect updated.'
            }
            modalPopUp={showModel}
            setModalPopUp={setShowModel}
            showActionBtns={isArchived ? false : true}
            isArchived={isArchived}
            archived={handleArchive}
            redirectPath={isArchived ? OS_PROSPECTS_PATH.LIST : -1}
          />
          <SuccessPopUpModal
            title="Success"
            message={showModalText}
            modalPopUp={showSuccessMessage}
            showActionBtns={true}
            isArchived={false}
            setModalPopUp={setShowSuccessMessage}
          />

          <Pagination
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalRecords={totalRecords}
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
              <div className={`content ${styles.hideScroll}`}>
                <h3>Export Data</h3>
                <div className="buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowExportDialogue(false)}
                  >
                    Cancel
                  </button>
                  {downloadType === 'PDF' && (
                    <button className="btn btn-primary" onClick={generatePDF}>
                      Download
                    </button>
                  )}

                  {downloadType === 'CSV' && (
                    <CSVLink
                      className="btn btn-primary"
                      filename={`Prospect_${moment().format(
                        'MM-DD-YYYY-HH-mm-ss'
                      )}.csv`}
                      data={csvData}
                      headers={headers}
                      onClick={handleDownloadClick}
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
    </>
  );
};

export default ProspectsList;
