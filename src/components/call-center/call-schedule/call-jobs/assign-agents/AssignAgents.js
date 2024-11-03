import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';

import styles from './index.module.scss';

import TableList from '../../../../common/tableListing';
import TopBar from '../../../../common/topbar/index';
import ToolTip from '../../../../common/tooltip';
import WeekDateList from '../common/WeekDateList';
import axios from 'axios';
import { API } from '../../../../../api/api-routes';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';
import Pagination from '../../../../common/pagination';
import TableScrollList from '../../../../common/tableScrollList';

let inputTimer = null;

const AssignAgentsPopUpModal = ({
  modalPopUp,
  setModalPopUp,
  modalData,
  setAgentsData = () => {},
}) => {
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const options = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const dateFormatter = new Intl.DateTimeFormat('en-US', options);

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [checkedAgents, setCheckedAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [callJob, setCallJob] = useState();
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [assignedSortBy, setAssignedSortBy] = useState('name');
  const [assignedSortOrder, setAssignedSortOrder] = useState('ASC');
  const [recEndDate, setRecEndDate] = useState(null);

  const TableHeadersSearch = [
    {
      name: 'name',
      label: 'Agent Name',
      sortable: true,
    },
    {
      name: 'total_calls',
      label: 'Total Call for the Day',
      sortable: true,
    },
    {
      name: 'collection_operation_name',
      label: 'Collection Operation',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Assignment Status',
      sortable: true,
    },
  ];

  const TableHeadersAssigned = [
    {
      name: 'name',
      label: 'Agent Name',
      sortable: true,
    },
    {
      name: 'assignments',
      label: 'Assignments',
      sortable: true,
      type: 'input_field',
    },
    {
      name: 'total_calls',
      label: 'Total Call for the Day',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Assignment Status',
      sortable: true,
    },
  ];

  useEffect(() => {
    fetchCallJobData();
  }, [modalData]);

  const fetchCallJobData = async () => {
    const response = await API.callCenter.callJobs.fetchCallJob(modalData.id);
    const callJobData = response?.data?.data;

    if (callJobData?.recurring_end_date) {
      setRecEndDate(new Date(callJobData.recurring_end_date));
    }
    if (callJobData) {
      setCallJob(callJobData);
      setAssignedCallJobAgents(callJobData.callAgents);
    }
  };

  const setAssignedCallJobAgents = (assignedAgents) => {
    if (assignedAgents) {
      let array = [];

      assignedAgents.forEach((item) => {
        array.push({
          id: item.user_id,
          name: item.staff_name,
          total_calls: item.total_calls,
          status: 'Active',
          date: dateFormatter.format(new Date(item.date)),
          dateValue: item.date,
          assignments: item.assigned_calls,
          new: false,
        });
      });

      setSelectedAgents(array);
    }
  };

  const confirmAction = async () => {
    let body = [];

    selectedAgents.forEach((item) => {
      body.push({
        call_job_id: callJob.id,
        user_id: item.id,
        assigned_calls: item.assignments,
        is_archived: false,
        date: item.dateValue,
      });
    });

    const { data: callAgents } = await API.callCenter.callJobs.assignAgents(
      body,
      modalData.id
    );
    setShowCreateSuccessModal(true);
    //  setModalPopUp(false);
    setAgentsData(callAgents?.data);
  };

  const selectAgent = (data) => {
    setCheckedAgents(data);
    let array = selectedAgents;

    rows
      .filter((row) => data.includes(row.id))
      .forEach((filtered) => {
        array.push({
          id: filtered.id,
          name: filtered.name,
          total_calls: filtered.total_call,
          assignments: 50, // initial value
          status: 'Active',
          date: selectedDate?.label,
          dateValue: selectedDate.value,
          new: true,
        });
      });

    setRows(rows.filter((row) => !data.includes(row.id)));

    setSelectedAgents(array);
  };

  const handleSelectedAgentCheckbox = (data) => {
    setSelectedAgents(selectedAgents.filter((row) => data.includes(row.id)));
  };

  const totalByDate = () => {
    return selectedAgents
      .filter((item) => item.date === selectedDate?.label)
      .reduce((sum, item) => sum + Number(item.assignments), 0);
  };

  const totalAssigned = () => {
    return selectedAgents.reduce(
      (sum, item) => sum + Number(item.assignments),
      0
    );
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchAllData();
    }, 500);

    return () => {
      // Cancel the request when the component unmounts
      source.cancel();
    };
  }, [
    searchText,
    selectedAgents,
    selectedDate,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${BASE_URL}/tenant-users/agents?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText && searchText.length > 2 ? '&keyword=' + searchText : ''
        }&status=true&assignedAgentDate=${selectedDate.value}`,
        axiosConfig
      );

      const alreadySelectedDataByDate = selectedAgents
        .filter((item) => item.date === selectedDate?.label)
        .map((item) => item.id);

      setTotalRecords(response?.data?.count);
      setRows(
        response?.data?.data
          .map((item) => ({
            id: item.id,
            name: item.first_name + ' ' + item.last_name,
            total_calls: item.total_calls ?? 0,
            collection_operation_name: item.hierarchy_level,
            status: item.status ? 'Active' : 'Inactive',
          }))
          .filter((row) => !alreadySelectedDataByDate.includes(row.id))
      );

      setCheckedAgents([]);

      setIsLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setIsLoading(false);
      }
    }
  };

  const handleFieldInputChange = (rowData, headerName, newValue) => {
    if (isNaN(Number(newValue))) {
      return;
    }

    let changed = selectedAgents.map((obj) => {
      if (obj.id === rowData.id) {
        return { ...obj, [headerName]: newValue };
      }
      return obj;
    });

    setSelectedAgents(changed);
  };

  const handleSort = (name, assigned) => {
    if (!assigned) {
      if (sortBy === name) {
        setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
      } else {
        setSortBy(name);
        setSortOrder('ASC');
      }
    } else {
      if (assignedSortBy === name) {
        setAssignedSortOrder(assignedSortOrder === 'ASC' ? 'DESC' : 'ASC');
      } else {
        setAssignedSortBy(name);
        setAssignedSortOrder('ASC');
      }
    }
  };

  useEffect(() => {
    const temp = [...selectedAgents];
    const test = temp.sort(function (a, b) {
      if (
        typeof a[assignedSortBy] === 'string' &&
        typeof b[assignedSortBy] === 'string'
      ) {
        if (assignedSortOrder === 'ASC') {
          return a[assignedSortBy].localeCompare(b[assignedSortBy]);
        } else {
          return b[assignedSortBy].localeCompare(a[assignedSortBy]);
        }
      } else {
        if (assignedSortOrder === 'ASC') {
          return a[assignedSortBy] - b[assignedSortBy];
        } else {
          return b[assignedSortBy] - a[assignedSortBy];
        }
      }
    });
    setSelectedAgents(test);
  }, [assignedSortOrder]);

  return (
    <>
      <Modal
        dialogClassName={`${styles.modalMain}`}
        show={modalPopUp}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body className="p-5">
          <h5 className="pb-1">Assign Agents</h5>

          <h6>
            Name: <span>{modalData.name}</span>
          </h6>
          <h6>
            Date: <span>{selectedDate?.label}</span>
          </h6>
          <h6>
            Total Calls: <span>{callJob?.jobSize}</span> Remaining Total:{' '}
            <span>{callJob?.jobSize - totalAssigned()}</span>
          </h6>

          <WeekDateList
            recurringDays={callJob?.recurring_days}
            recurringEndDate={recEndDate}
            startDate={callJob ? new Date(callJob.start_date) : null}
            endDate={callJob ? new Date(callJob.end_date) : null}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <h6 className="mt-3">
            Total:
            <span>{totalByDate()}</span>
          </h6>

          <div className="formGroup">
            <div className="overflow-y-auto">
              <div className={styles.customTablesBorderss}>
                <TableScrollList
                  data={selectedAgents.filter(
                    (item) => item.date === selectedDate?.label
                  )}
                  headers={TableHeadersAssigned}
                  checkboxValues={selectedAgents.map((row) => row.id)}
                  handleCheckboxValue={(row) => row.id}
                  handleCheckbox={handleSelectedAgentCheckbox}
                  handleFieldInputChange={handleFieldInputChange}
                  handleSort={(name) => handleSort(name, true)}
                  sortName={assignedSortBy}
                  sortOrder={assignedSortOrder}
                />
              </div>
            </div>
            <div className="pt-2">
              <TopBar
                BreadCrumbsData={[]}
                BreadCrumbsTitle={' '}
                SearchValue={searchText}
                SearchOnChange={(e) => {
                  setSearchText(e.target.value);
                }}
                SearchPlaceholder={'Search'}
                icon={<ToolTip text={`Search by name.`} />}
              />

              {rows.length > 0 ? (
                <div className="overflow-y-auto">
                  <div className={styles.customTablesBorderss}>
                    <TableScrollList
                      isLoading={isLoading}
                      data={rows}
                      headers={TableHeadersSearch}
                      checkboxValues={checkedAgents}
                      handleCheckboxValue={(row) => row.id}
                      handleCheckbox={selectAgent}
                      handleSort={handleSort}
                      sortName={sortBy}
                      sortOrder={sortOrder}
                      //    showAllCheckBoxListing={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto" style={{ height: '50vh' }}>
                  <div className={styles.customTablesBorderss}>
                    <TableList headers={TableHeadersSearch} />
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center w-100 mt-3">
              <div className="flex-grow-1">
                <Pagination
                  limit={limit}
                  setLimit={setLimit}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalRecords={totalRecords}
                  showListSize={false}
                />
              </div>

              <div>
                <a
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => {
                    setCloseModal(true);
                  }}
                >
                  Cancel
                </a>
                <a
                  type="button"
                  className={styles.btnSuccess}
                  onClick={confirmAction}
                >
                  Submit
                </a>
              </div>
            </div>
          </div>
          {showCreateSuccessModal === true ? (
            <SuccessPopUpModal
              title="Success!"
              message={`Agents succesfully assigned.`}
              modalPopUp={showCreateSuccessModal}
              setModalPopUp={setShowCreateSuccessModal}
              onConfirm={() => setModalPopUp(false)}
              showActionBtns={true}
            />
          ) : null}

          <CancelModalPopUp
            title="Confirmation"
            message="Unsaved changes will be lost, do you wish to proceed?"
            modalPopUp={closeModal}
            isNavigate={false}
            setModalPopUp={setCloseModal}
            methodsToCall={true}
            methods={() => setModalPopUp(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AssignAgentsPopUpModal;
