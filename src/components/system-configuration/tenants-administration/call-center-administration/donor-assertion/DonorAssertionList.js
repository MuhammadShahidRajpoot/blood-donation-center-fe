import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../../../../common/pagination/index.js';
import TopBar from '../../../../common/topbar/index';

import TableList from '../../../../common/tableListing/index.js';
import SuccessPopUpModal from '../../../../common/successModal/index.js';
import SelectDropdown from '../../../../common/selectDropdown/index.js';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../../enums/PermissionsEnum.js';

import { DonorAssertionsBreadCrumbsData } from './DonorAssertionsBreadCrumbsData.js';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api.js';
import { toast } from 'react-toastify';
import SvgComponent from '../../../../common/SvgComponent.js';

const DonorAssertionsList = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [archiveSuccess, setArchiveSuccess] = useState();
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });

  const navigate = useNavigate();

  const handleIsActive = (value) => {
    setIsActive(value);
  };

  const tableHeaders = [
    {
      name: 'code',
      label: 'Code',
      width: '20%',
      sortable: true,
    },
    {
      name: 'name',
      label: 'Name',
      width: '20%',
      sortable: true,
    },
    {
      name: 'description',
      label: 'Description',
      width: '50%',
      sortable: true,
    },
    {
      name: 'expired',
      label: 'Expired',
      width: '30%',
      sortable: true,
    },
    {
      name: 'months',
      label: 'Expiration Period (Months)',
      width: '10%',
      sortable: true,
    },
    {
      name: 'is_active',
      label: 'Status',
      width: '15%',
      sortable: true,
    },
  ];

  const getAssertions = async () => {
    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/assertions?limit=${limit}&page=${currentPage}${
          isActive ? `&is_active=${isActive?.value ?? ''}` : ''
        }${searchText?.length > 2 ? `&keyword=${searchText}` : ''}${
          sortBy ? `&sortBy=${sortBy}` : ''
        }${sortOrder ? `&sortOrder=${sortOrder}` : ''}`
      );
      const data = result.data;
      setAssertions(data?.data || []);
      setIsLoading(false);
      setTotalRecords(data?.total_count);
    } catch (error) {
      toast.error('Failed to fetch Assertions', {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchText || searchText.length > 1) {
      getAssertions();
    }
  }, [limit, currentPage, isActive, searchText, sortBy, sortOrder]);

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/call-center-admin/donor-assertions/create'
    );
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

  const sortedAssertions = useMemo(() => {
    const sorted = [...assertions];
    if (sortBy && sortOrder) {
      sorted.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === 'string') aValue = aValue?.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue?.toLowerCase();

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
  }, [assertions, sortBy, sortOrder]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const optionsConfig = [
    CheckPermission([
      Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.READ,
    ]) && {
      label: 'View',
      path: (rowData) =>
        `/system-configuration/tenant-admin/call-center-admin/donor-assertions/${rowData.id}/view`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
    ]) && {
      label: 'Edit',
      path: (rowData) =>
        `/system-configuration/tenant-admin/call-center-admin/donor-assertions/${rowData.id}/edit?page=listing`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.GEO_ADMINISTRATION.TERRITORY_MANAGEMENT.ARCHIVE,
    ]) && {
      label: 'Archive',
      action: (rowData) => {},
    },
  ].filter(Boolean);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={DonorAssertionsBreadCrumbsData}
        BreadCrumbsTitle={'Donor Assertions'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="filterInner pe-3">
          <h2>Filters</h2>

          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 w-100`}>
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
      <div className="mainContentInner">
        {CheckPermission([
          Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create Donor Assertion
            </button>
          </div>
        )}

        <TableList
          isLoading={isLoading}
          data={sortedAssertions}
          headers={tableHeaders}
          handleSort={handleSort}
          sortOrder={sortOrder}
          listSectionName="Donor Assertions Data"
          optionsConfig={optionsConfig}
        />

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />

        <SuccessPopUpModal
          title="Success!"
          message="Territory is archived."
          modalPopUp={archiveSuccess}
          isNavigate={true}
          setModalPopUp={setArchiveSuccess}
          showActionBtns={true}
        />
      </div>
    </div>
  );
};

export default DonorAssertionsList;
