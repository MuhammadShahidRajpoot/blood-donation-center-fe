import React, { useMemo, useState, useEffect } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { useLocation, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import Pagination from '../../../../../common/pagination';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../../../common/successModal';
import {
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import NavTabs from '../../../../../common/navTabs';
import { accountTabs } from '../tabs';
import SelectDropdown from '../../../../../common/selectDropdown';
import { AccountBreadCrumbsData } from '../AccountBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import TableList from '../../../../../common/tableListing';

const ListSources = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentLocation = location.pathname;
  const [sources, setSources] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [selectedStatus, setSelectedStatus] = useState({
    label: 'Active',
    value: 'true',
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [modalPopUp, setModalPopUp] = useState(false);
  const [sourceToArchive, setSourceToArchive] = useState(null);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'name',
      label: 'Name',
      width: '25%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'description',
      label: 'Description',
      width: '25%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'is_active',
      label: 'Status',
      width: '15%',
      sortable: true,
      defaultHidden: false,
    },
  ]);
  const handleOpenConfirmation = (id) => {
    setSourceToArchive(id);
    setModalPopUp(true);
  };

  const handleConfirmArchive = async () => {
    if (sourceToArchive) {
      const response = await fetchData(
        `/accounts/sources/${sourceToArchive}`,
        'PATCH'
      );
      if (response?.status === 'success') {
        setModalPopUp(false);
        setTimeout(() => {
          setArchiveSuccess(true);
        }, 600);
        fetchSources();
        sources?.length === 1 && currentPage > 1
          ? setCurrentPage(currentPage - 1)
          : fetchSources();
      } else {
        toast.error(`${response?.message?.[0] ?? response?.response}`, {
          autoClose: 3000,
        });
      }
    }
    setModalPopUp(false);
  };

  useEffect(() => {
    fetchSources();
  }, [currentPage, limit, selectedStatus, sortBy, sortOrder]);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/accounts/sources?limit=${limit}&page=${currentPage}&keyword=${
          searchText?.length > 1 ? searchText : ''
        }&status=${
          selectedStatus?.value || ''
        }&sortName=${sortBy}&sortOrder=${sortOrder}`
      );
      const data = await result.json();
      setSources(data?.data);
      if (currentPage > 1 && !(data?.data.length > 0)) {
        setCurrentPage(currentPage - 1);
      }
      setTotalRecords(data?.record_count);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to fetch Sources.', {
        autoClose: 3000,
      });
    }
  };
  useEffect(() => {
    if (searchText?.length > 1) {
      setSearched(true);
      setCurrentPage(1);
      fetchSources();
    }
    if (searchText?.length === 1 && searched) {
      setCurrentPage(1);
      fetchSources();
      setSearched(false);
    }
  }, [searchText]);

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

  const sortedSources = useMemo(() => {
    const sorted = [...sources];

    if (sortBy && sortOrder) {
      sorted.sort((a, b) => {
        // Extract the values for sorting, converting to lowercase for case-insensitive sorting
        const aValue = a[sortBy]?.toString()?.toLowerCase();
        const bValue = b[sortBy]?.toString()?.toLowerCase();
        console.log({ aValue }, { bValue });
        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sorted;
  }, [sources, sortBy, sortOrder]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const BreadcrumbsData = [
    ...AccountBreadCrumbsData,
    {
      label: 'Sources',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/sources',
    },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  const optionsConfig = [
    CheckPermission([Permissions.CRM_ADMINISTRATION.ACCOUNTS.SOURCES.READ]) && {
      label: 'View',
      path: (rowData) =>
        `/system-configuration/tenant-admin/crm-admin/accounts/sources/${rowData.id}/view`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.CRM_ADMINISTRATION.ACCOUNTS.SOURCES.WRITE,
    ]) && {
      label: 'Edit',
      path: (rowData) =>
        `/system-configuration/tenant-admin/crm-admin/accounts/sources/${rowData.id}/edit`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.CRM_ADMINISTRATION.ACCOUNTS.SOURCES.ARCHIVE,
    ]) && {
      label: 'Archive',
      action: (rowData) => handleOpenConfirmation(rowData),
    },
  ].filter(Boolean);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Sources'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <NavTabs tabs={accountTabs()} currentLocation={currentLocation} />
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex gap-3 w-100">
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={selectedStatus}
                selectedValue={selectedStatus}
                removeDivider
                showLabel
                onChange={setSelectedStatus}
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
        {CheckPermission([
          Permissions.CRM_ADMINISTRATION.ACCOUNTS.SOURCES.WRITE,
        ]) && (
          <div className="buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate(
                  '/system-configuration/tenant-admin/crm-admin/accounts/sources/create'
                );
              }}
            >
              Create Source
            </button>
          </div>
        )}

        <TableList
          isLoading={isLoading}
          data={sortedSources}
          headers={tableHeaders}
          handleSort={handleSort}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          enableColumnHide={true}
          showActionsLabel={false}
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
          isArchived={true}
          archived={handleConfirmArchive}
        />
        <SuccessPopUpModal
          title="Success!"
          message="Source is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
        />
      </div>
    </div>
  );
};

export default ListSources;
