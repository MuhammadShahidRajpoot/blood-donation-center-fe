import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import { useNavigate } from 'react-router';
import { API } from '../../../../api/api-routes.js';
import { toast } from 'react-toastify';
import SvgComponent from '../../../common/SvgComponent';
import exportImage from '../../../../assets/images/exportImage.svg';
import styles from './index.module.scss';
import ProfileTableListing from './ProfileTableListing';
import Pagination from '../../../common/pagination';
import SuccessPopUpModal from '../../../common/successModal';
import { Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SelectDropdown from '../../../common/selectDropdown';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import { NonCollectionProfilesBreadCrumbsData } from '../NonCollectionProfilesBreadCrumbsData';
import OrganizationalDropdown from '../../../common/Organization/DropDown.jsx';
import OrganizationalPopup, {
  OLPageNames,
} from '../../../common/Organization/Popup.jsx';
import { downloadFile } from '../../../../utils/index.js';
import { OrganizationalLevelsContext } from '../../../../Context/OrganizationalLevels.jsx';

const ProfileList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [exportType, setExportType] = useState('filtered');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('profile_name');
  const [modalPopUp, setModalPopUp] = useState(false);
  const [archiveID, setArchiveID] = useState('');
  const [profileListData, setProfileListData] = useState([]);
  const [statusText, setStatusText] = useState({
    label: 'Active',
    value: true,
  });
  const [isActive, setIsActive] = useState(true);
  const [downloadType, setDownloadType] = useState('');
  const [organizationalLevel, setOrganizationalLevel] = useState('');
  const [eventCategoryData, setEventCategoryData] = useState('');
  const [eventCategoryDataText, setEventCategoryDataText] = useState(null);
  const [eventCategoryOption, setEventCategoryOption] = useState([]);
  const [eventSubCategoryData, setEventSubCategoryData] = useState('');
  const [eventSubCategoryDataText, setEventSubCategoryDataText] =
    useState(null);
  const [isDisabledFilteredExporting, setIsDisabledFilteredExporting] =
    useState(false);
  const [eventSubCategoryOption, setEventSubCategoryOption] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [archiveToggle, setArchiveToggle] = useState(false);
  const [isPopupVisible, setPopupVisible] = React.useState();
  const [OLLabels, setOLLabels] = useState([]);
  const [OLClear, setOLClear] = useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'profile_name',
      label: 'Profile Name',
      width: '15%',
      sortable: true,
      checked: true,
    },
    {
      name: 'alternate_name',
      label: 'Alternate Name',
      width: '13%',
      sortable: true,
      checked: false,
    },
    {
      name: 'event_category_id',
      label: 'Event Category',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'event_subcategory_id',
      label: 'Event Subcategory',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'collection_operation_id',
      label: 'Collection Operation',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'owner_id',
      label: 'Owner',
      width: '10%',
      sortable: true,
      icon: false,
      checked: true,
    },
    {
      name: 'is_active',
      label: 'Status',
      width: '10%',
      sortable: true,
      checked: true,
    },
  ]);

  const handleIsActive = (value) => {
    if (value !== null) {
      setIsActive(value?.value);
      setStatusText(value);
    } else {
      setIsActive(null);
      setStatusText(null);
    }
  };

  const handleEventCategory = (value) => {
    if (value !== null) {
      setEventCategoryData(value?.value);
      setEventCategoryDataText(value);
      if (eventCategoryData) {
        if (eventCategoryData !== +value?.value) {
          setEventSubCategoryData(null);
          setEventSubCategoryDataText(null);
        }
      } else {
        const subCategoryId = eventSubCategoryOption.find(
          (item) => +item?.id === +eventSubCategoryData
        );
        if (subCategoryId && +value?.value !== +subCategoryId?.parent_id?.id) {
          setEventSubCategoryData(null);
          setEventSubCategoryDataText(null);
        }
      }
    } else {
      setEventCategoryData('');
      setEventSubCategoryData(null);
      setEventSubCategoryDataText(null);
      setEventCategoryDataText(value);
      setEventSubCategoryOption([]);
    }
  };

  const handleEventSubCategory = (value) => {
    if (value !== null) {
      setEventSubCategoryData(value?.value);
      setEventSubCategoryDataText(value);
    } else {
      setEventSubCategoryData('');
      setEventSubCategoryDataText(value);
    }
  };
  const accessToken = localStorage.getItem('token');
  const getData = async () => {
    setIsLoading(true);
    try {
      const { data } = await API.nonCollectionProfiles.list.getAll(
        accessToken,
        limit,
        currentPage,
        sortBy,
        sortOrder,
        organizationalLevel,
        eventCategoryData,
        eventSubCategoryData,
        searchText,
        isActive,
        exportType,
        downloadType,
        tableHeaders
      );

      setProfileListData(data?.data);
      setTotalRecords(data?.count);
      if (data?.url) {
        await downloadFile(data?.url);
      }
      setDownloadType('');
    } catch (e) {
      setDownloadType('');
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText) {
      getData(limit, currentPage);
    }

    if (searchText.length > 1) {
      getData(searchText);
    }

    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    limit,
    organizationalLevel,
    eventCategoryData,
    eventSubCategoryData,
    searchText,
    archiveToggle,
    isActive,
    sortBy,
    sortOrder,
  ]);

  const checkExportType = () => {
    if (isActive == null && !eventCategoryData) {
      setIsDisabledFilteredExporting(true);
      setExportType('all');
    } else {
      setIsDisabledFilteredExporting(false);
      setExportType('filtered');
    }
  };

  const getEventCategory = async () => {
    try {
      const { data } =
        await API.nonCollectionProfiles.eventCategory.getAll(accessToken);
      const categories = data?.data
        ?.filter((item) => item?.is_active === true)
        .map((category) => ({
          label: category?.name,
          value: category?.id,
        }));
      setEventCategoryOption(categories);
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };

  const getEventSubCategory = async (paramId) => {
    try {
      const { data } = await API.nonCollectionProfiles.eventSubCategory.getAll(
        accessToken,
        paramId
      );
      setEventSubCategoryOption(data?.data);
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    if (eventCategoryData) {
      getEventSubCategory(eventCategoryData);
    }
  }, [eventCategoryData]);

  useEffect(() => {
    getEventCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const optionsConfig = [
    CheckPermission([
      CrmPermissions.CRM.NON_COLLECTION_PROFILES.READ,
      CrmPermissions.CRM.NON_COLLECTION_PROFILES.WRITE,
    ])
      ? {
          label: 'View',
          path: (rowData) => `${rowData.id}/about`,
          action: (rowData) => {},
        }
      : null,
    CheckPermission([CrmPermissions.CRM.NON_COLLECTION_PROFILES.WRITE])
      ? {
          label: 'Edit',
          path: (rowData) => `${rowData.id}/edit`,
          action: (rowData) => {},
        }
      : null,
    {
      label: 'Schedule Event',
      path: (rowData) => `/operations-center/operations/drives/create`,
      action: (rowData) => {},
    },
    CheckPermission([CrmPermissions.CRM.NON_COLLECTION_PROFILES.ARCHIVE])
      ? {
          label: 'Archive',
          action: (rowData) => {
            setModalPopUp(true);
            setArchiveID(rowData.id);
          },
        }
      : null,
  ];

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortBy(columnName);
      setSortOrder('ASC');
    }
  };

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleArchive = async () => {
    if (archiveID) {
      const accessToken = localStorage.getItem('token');
      const { data } = await API.nonCollectionProfiles.archive.patch(
        accessToken,
        archiveID
      );
      if (data?.status === 'success') {
        setShowSuccessMessage(true);
        setArchiveToggle(!archiveToggle);
      }
      setModalPopUp(false);
    }
  };

  const handleOrganizationalLevel = (payload) => {
    setPopupVisible(false);
    setOrganizationalLevel(
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
        BreadCrumbsData={NonCollectionProfilesBreadCrumbsData}
        BreadCrumbsTitle={'Non-Collection Profiles'}
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
            <form className="d-flex gap-3">
              <div style={{ width: '270px' }}>
                <OrganizationalDropdown
                  labels={OLLabels}
                  handleClick={() => setPopupVisible(true)}
                  handleClear={() => {
                    handleOrganizationalLevel('');
                    setOLLabels('');
                    setOLClear(true);
                    clearOLData(OLPageNames.CRM_NCP);
                  }}
                />
              </div>

              <div style={{ width: '270px' }}>
                <SelectDropdown
                  label="Event Category"
                  options={eventCategoryOption}
                  selectedValue={eventCategoryDataText}
                  onChange={(val) => {
                    handleEventCategory(val);
                  }}
                  removeDivider
                  showLabel
                  placeholder="Event Category"
                />
              </div>
              <div style={{ width: '270px' }}>
                <SelectDropdown
                  label="Event Subcategory"
                  style={{ width: '250px' }}
                  options={eventSubCategoryOption?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  }))}
                  disabled={eventSubCategoryOption?.length ? false : true}
                  selectedValue={eventSubCategoryDataText}
                  onChange={(val) => {
                    handleEventSubCategory(val);
                  }}
                  removeDivider
                  showLabel
                  placeholder="Event Subcategory"
                />
              </div>
              <div style={{ width: '270px' }}>
                <SelectDropdown
                  label="Status"
                  options={[
                    { label: 'Active', value: true },
                    { label: 'Inactive', value: false },
                  ]}
                  selectedValue={statusText}
                  onChange={(val) => {
                    handleIsActive(val);
                  }}
                  removeDivider
                  showLabel
                  placeholder="Status"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner crm">
        <div className="buttons d-flex align-items-center">
          <div className="exportButton">
            <div
              className={`optionsIcon ${styles.pointer}`}
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
          {CheckPermission([
            CrmPermissions.CRM.NON_COLLECTION_PROFILES.WRITE,
          ]) && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/crm/non-collection-profiles/create')}
            >
              Create Profile
            </button>
          )}
        </div>
        <ProfileTableListing
          isLoading={isLoading}
          data={profileListData}
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
      </div>
      <SuccessPopUpModal
        title="Confirmation"
        message={'Are you sure want to Archive?'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={false}
        isArchived={true}
        archived={handleArchive}
      />
      <SuccessPopUpModal
        title="Success"
        message={'Non-Collection profile is archived.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
      />

      <OrganizationalPopup
        value={organizationalLevel}
        showConfirmation={isPopupVisible}
        onCancel={() => setPopupVisible(false)}
        onConfirm={handleOrganizationalLevel}
        heading={'Organization Level'}
        setLabels={setOLLabels}
        showRecruiters
        clear={OLClear}
        pageName={OLPageNames.CRM_NCP}
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
                className="radioChecks ms-5 "
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
                      getData();
                    } else {
                      getData();
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
                      getData();
                    } else {
                      getData();
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
  );
};

export default ProfileList;
