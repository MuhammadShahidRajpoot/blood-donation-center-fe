/* eslint-disable */
import React, { useState, useEffect } from 'react';
import TopBar from '../../../common/topbar/index';
import OperationListTable from './OperationListTable';
import { OperationListBreadCrumbData } from '../BuildScheduleBreadCrumbData';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../routes/path';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Pagination from '../../../common/pagination';
import NavTabs from '../../../common/navTabs';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../common/confirmModal';
import ConfirmDialogIcon from '../../../../assets/images/confirmation-image.png';

const OperationListCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paramter = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading] = useState(false);
  const currentLocation = location.pathname;
  const [searchText, setSearchText] = useState(null);
  const [showConfirmationDialog, setshowConfirmationDialog] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedRow, setselectedRow] = useState();
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const searchParams = new URLSearchParams(location.search);
  const collection_operation_id = searchParams.get('collection_operation_id');
  const inSync =
    currentLocation ===
    `${STAFFING_MANAGEMENT_BUILD_SCHEDULE.OPERATION_LIST}/${paramter?.schedule_id}`;
  const schedule_status = searchParams.get('schedule_status');
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'date',
      label: 'Date',
      width: '15%',
      sortable: true,
      checked: true,
    },
    {
      name: 'name',
      label: 'Name',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'start_time',
      label: 'Hours',
      width: '13%',
      sortable: false,
      checked: true,
    },
    {
      name: 'projections',
      label: 'Projection',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'staffSetup',
      label: 'Staff Setup',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'vehicles',
      label: 'Vehicles',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'devices',
      label: 'Devices',
      width: '13%',
      sortable: true,
      checked: true,
    },
    {
      name: 'operation_status',
      label: 'Status',
      width: '10%',
      sortable: true,
      icon: false,
      checked: true,
    },
  ]);

  const navigateWithQueryParam = (path, data) => {
    const queryParams = {
      schedule_id: paramter.schedule_id,
      operation_id: data?.id,
      operation_type: data?.operation_type,
      isCreated: true,
      schedule_status: schedule_status,
      collection_operation_id: collection_operation_id,
    };
    navigate({
      pathname: path,
      search: new URLSearchParams(queryParams).toString(),
    });
  };

  // Handles changes in Search Bar
  const searchFieldChange = (e) => {
    if (e.target.value.length >= 2) {
      setSearchText(e.target.value);
    } else {
      setSearchText(null);
    }
  };

  // Handles Sorting
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

  const optionsConfig = [
    {
      label: 'Edit',
      action: (rowData) => {
        navigateWithQueryParam(
          STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS,
          rowData
        );
      },
    },
    {
      label: 'Unassign',
      action: (rowData) => {
        setselectedRow(rowData);
        setshowConfirmationDialog(true);
      },
    },
  ];

  const Tabs = [
    {
      label: 'In Sync',
      link: `${STAFFING_MANAGEMENT_BUILD_SCHEDULE.OPERATION_LIST}/${paramter?.schedule_id}`,
    },
    {
      label: 'Flagged',
      link: `${STAFFING_MANAGEMENT_BUILD_SCHEDULE.OPERATION_LIST_FLAGGED}/${paramter?.schedule_id}`,
    },
  ];

  const unassignAllAssignments = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'DELETE',
        `${BASE_URL}/staffing-management/schedules/operations/${selectedRow.id}/unassign-all-assignments?operation_type=${selectedRow.operation_type}`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Unassign all Staff: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-management/schedules/operation-list/${paramter.schedule_id}?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}&in_sync=${inSync}`
      );
      return await response.json();
    } catch (error) {
      toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const result = fetchData();
    result
      .then((data) => {
        setRows(data.items);
        setTotalRecords(data.totalItems);
      })
      .catch((error) => {
        toast.error(`Failed to Fetch Schedule Operation List: ${error}`, {
          autoClose: 3000,
        });
      });
  }, [BASE_URL, paramter, currentPage, limit, sortOrder, sortBy]);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={[
          ...OperationListBreadCrumbData,
          {
            label: 'Operation List',
            class: 'disable-label',
            link: currentLocation,
          },
        ]}
        BreadCrumbsTitle={'Operation List'}
        SearchPlaceholder="Search"
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="mainContentInner">
        <div className="button-icon">
          <div className="buttons">
            <div className="buttons">
              <button
                style={{
                  minHeight: '0px',
                  padding: '12px 32px 12px 32px',
                  marginBottom: '-40px',
                  border: '1px solid #387DE5',
                }}
                className="btn btn-primary"
                onClick={() =>
                  rows.length > 0
                    ? navigateWithQueryParam(
                        STAFFING_MANAGEMENT_BUILD_SCHEDULE.DETAILS,
                        {
                          id: rows[0].id,
                          operation_type: rows[0].operation_type,
                        }
                      )
                    : null
                }
                disabled={rows && rows.length > 0 ? false : true}
              >
                Begin Scheduling
              </button>
            </div>
          </div>
        </div>
        <div className="filterBar px-0 py-0">
          <NavTabs tabs={Tabs} currentLocation={currentLocation} />
        </div>
        <OperationListTable
          isLoading={isLoading}
          data={rows}
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
        <ConfirmModal
          showConfirmation={showConfirmationDialog}
          onCancel={() => setshowConfirmationDialog(false)}
          onConfirm={() => {
            unassignAllAssignments().then((data) => {
              if (data.status_code === 200) {
                setshowConfirmationDialog(false);
              }
            });
          }}
          icon={ConfirmDialogIcon}
          heading={'Confirmation'}
          description={'Are you sure, you want to Unassign all assignments?'}
          confirmBtnText={'Unassign'}
        />
      </div>
    </div>
  );
};

export default OperationListCreate;
