import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../common/topbar/index';
import Pagination from '../../common/pagination/index';
import TableList from './tableListingSegmentList';
import SegmentListFilters from './segmentListFilters/segmentListFilter';
import { SegmentsBreadcrumbsData } from './segmentListBreadCrumbData';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';

let inputTimer = null;

function SegmentList() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [tableHeaders] = useState([
    {
      name: 'name',
      label: 'Segment Name',
      width: '22%',
      sortable: true,
      checked: true,
    },
    {
      name: 'ds_segment_type',
      label: 'Type',
      width: '5%',
      sortable: true,
      checked: true,
    },
    {
      name: 'total_members',
      label: 'Members',
      width: '20%',
      sortable: true,
      checked: true,
    },
    {
      name: 'ds_date_last_modified',
      label: 'Last Update Date',
      width: '25%',
      sortable: true,
      checked: true,
    },
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchAllData();
    }, 500);
  }, [searchText, limit, currentPage, sortBy, sortOrder, endDate]);

  const fetchAllData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/call-center/segments?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText && searchText.length ? '&keyword=' + searchText : ''
        }${
          startDate && endDate && endDate.length
            ? `&start_date=${startDate}&end_date=${endDate}`
            : ''
        }`
      );
      const data = await response.json();
      setRows(data.data);
      setTotalRecords(data?.record_count);
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortBy('');
        setSortOrder('');
      } else {
        setSortOrder('ASC');
      }
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={SegmentsBreadcrumbsData}
        BreadCrumbsTitle={'Manage Segments'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="mainContentInner">
        <SegmentListFilters
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          startDate={startDate}
          endDate={endDate}
        />

        <TableList
          isLoading={isLoading}
          data={rows}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
}

export default SegmentList;
