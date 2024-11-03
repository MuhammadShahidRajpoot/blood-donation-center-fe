import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../../../../common/pagination';
import TopBar from '../../../../common/topbar/index';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import TableList from '../../../../common/tableListing';
import SelectDropdown from '../../../../common/selectDropdown';
import { CallFlowsListCrumbsData } from './CallFlowsCrumbsData.js';
import CheckPermission from '../../../../../helpers/CheckPermissions.js';
import SvgComponent from '../../../../common/SvgComponent.js';
import Permissions from '../../../../../enums/PermissionsEnum.js';

const CallFlowsList = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [callFlows, setCallFlows] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchText, setSearchText] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const isFirstRender = useRef(true);
  const navigate = useNavigate();

  const handleIsActive = (value) => {
    setIsActive(value);
  };

  const handleAddClick = () => {
    navigate(
      '/system-configuration/tenant-admin/call-center-admin/call-flows/create'
    );
  };

  const getCallFlows = async () => {
    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/call-flows?limit=${limit}&page=${currentPage}${
          isActive ? `&status=${isActive?.value ?? ''}` : ''
        }${searchText ? `&name=${searchText}` : ''}${
          sortBy ? `&sortBy=${sortBy}` : ''
        }${sortOrder ? `&sortOrder=${sortOrder}` : ''}`
      );
      const data = result.data;
      setCallFlows(data?.data || []);
      setIsLoading(false);
      setTotalRecords(data?.call_flows_count);
    } catch (error) {
      toast.error('Failed to fetch Call Flows', {
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCallFlows();
  }, [limit, currentPage, isActive, sortBy, sortOrder]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!searchText || searchText.length > 1) {
      getCallFlows();
    }
  }, [searchText]);

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

  const handleMakeDefault = async (callFlowId) => {
    if (callFlowId) {
      setIsLoading(true);
      const body = {
        is_default: true,
      };
      try {
        const res = await makeAuthorizedApiRequestAxios(
          'PATCH',
          `${BASE_URL}/call-center/call-flows/${callFlowId}`,
          JSON.stringify(body)
        );
        const { status, response } = res.data;
        if (status === 'success') {
          setIsLoading(false);
          await getCallFlows();
        } else {
          toast.error(response, { autoClose: 3000 });
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error);
        toast.error('Failed to set Call Flow as default', {
          autoClose: 3000,
        });
      }
    }
  };

  const tableHeaders = [
    {
      name: 'name',
      label: 'Name',
      width: '35%',
      sortable: true,
    },
    {
      name: 'date',
      label: 'Last Update',
      width: '35%',
      sortable: true,
    },
    { name: 'status', label: 'Status', width: '15%', sortable: true },
  ];

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const optionsConfig = [
    CheckPermission([
      Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.WRITE,
    ]) && {
      label: 'Edit',
      path: (rowData) =>
        `/system-configuration/tenant-admin/call-center-admin/call-flows/${rowData.id}/edit`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.WRITE,
    ]) && {
      label: 'Set as Default',
      action: (rowData) => {
        handleMakeDefault(rowData.id);
      },
    },
  ].filter(Boolean);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={CallFlowsListCrumbsData}
        BreadCrumbsTitle={'Call Flows'}
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
          Permissions.CALL_CENTER_ADMINISTRATION.CALL_FLOWS.WRITE,
        ]) && (
          <div className="buttons">
            <button className="btn btn-primary" onClick={handleAddClick}>
              Create New Call Flow
            </button>
          </div>
        )}

        <TableList
          isLoading={isLoading}
          data={callFlows}
          headers={tableHeaders}
          handleSort={handleSort}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          listSectionName={callFlows.length < 1 ? 'Call Flows Data' : 'Data'}
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
};

export default CallFlowsList;
