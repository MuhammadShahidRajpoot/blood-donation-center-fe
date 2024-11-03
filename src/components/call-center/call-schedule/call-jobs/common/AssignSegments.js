import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import styles from './index.module.scss';

import TopBar from '../../../../common/topbar/index';
import axios from 'axios';
import { toast } from 'react-toastify';
import Pagination from '../../../../common/pagination';
import TableScrollList from '../../../../common/tableScrollList';
import SuccessPopUpModal from '../../../../common/successModal';
import CancelModalPopUp from '../../../../common/cancelModal';

let inputTimer = null;

const AssignSegmentsPopUpModal = ({
  title,
  modalPopUp,
  setModalPopUp,
  redirectPath,
  isNavigate,
  onConfirm = () => {},
  isReplace,
  setData,
  modalData,
  setShowDayPopup,
  showDayPopup,
  setIncludeSegmentsCount,
  setExcludeSegmentsCount,
  includeSegmentsData,
  excludeSegmentsData,
}) => {
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  };
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [checkedSegments, setCheckedSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [assignedSortBy, setAssignedSortBy] = useState('name');
  const [assignedSortOrder, setAssignedSortOrder] = useState('ASC');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  console.log(isLoading);

  const TableHeadersSearch = [
    {
      name: 'name',
      label: 'Segment Name',
      sortable: true,
      width: '35%',
      assigned: false,
    },
    {
      name: 'ds_segment_type',
      label: 'Type',
      sortable: true,
      width: '20%',
      assigned: false,
    },
    {
      name: 'total_members',
      label: 'Members',
      sortable: true,
      width: '20%',
      assigned: false,
    },
    {
      name: 'ds_date_last_modified',
      label: 'Last Update Date',
      sortable: true,
      width: '25%',
      assigned: false,
    },
  ];

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
    let sortedSegments = [...selectedSegments];

    sortedSegments.sort((a, b) => {
      let valueA, valueB;
      if (assignedSortBy === 'ds_date_last_modified') {
        valueA = new Date(a[assignedSortBy]);
        valueB = new Date(b[assignedSortBy]);
      } else {
        valueA = a[assignedSortBy];
        valueB = b[assignedSortBy];
      }

      if (valueA < valueB) {
        return assignedSortOrder === 'ASC' ? -1 : 1;
      }
      if (valueA > valueB) {
        return assignedSortOrder === 'ASC' ? 1 : -1;
      }
      return 0;
    });

    setSelectedSegments(sortedSegments);

    console.log({ sortedSegments });
  }, [assignedSortBy, assignedSortOrder]);

  const TableHeadersAssigned = [
    {
      name: 'name',
      label: 'Segment Name',
      sortable: true,
      assigned: true,
    },
    {
      name: 'ds_segment_type',
      label: 'Type',
      sortable: true,
      assigned: true,
    },
    {
      name: 'total_members',
      label: 'Members',
      sortable: true,
      assigned: true,
    },
    {
      name: 'ds_date_last_modified',
      label: 'Last Update Date',
      sortable: true,
      assigned: true,
    },
  ];

  const confirmAction = () => {
    //check confirm action
    setData(selectedSegments);

    if (title == 'Include Segment') {
      setIncludeSegmentsCount(totalPeople());
    } else {
      setExcludeSegmentsCount(totalPeople());
    }
    if (showDayPopup) {
      setShowDayPopup(false);
    }
    if (redirectPath) {
      if (isNavigate) {
        if (isReplace) navigate(redirectPath, { replace: true });
        else navigate(redirectPath);
      }
    } else {
      onConfirm(); //check
    }
    setShowCreateSuccessModal(true);
  };

  const selectSegment = (data) => {
    console.log(data);
    setCheckedSegments(data);
    let array = selectedSegments;

    rows
      .filter((row) => data.includes(row.id))
      .forEach((filtered) => {
        array.push(filtered);
      });

    setRows(rows.filter((row) => !data.includes(row.id)));

    setSelectedSegments(array);
  };

  const handleSelectedSegmentsCheckbox = (data) => {
    setSelectedSegments(
      selectedSegments.filter((row) => data.includes(row.id))
    );
  };

  useEffect(() => {
    const source = axios.CancelToken.source();
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      fetchAllData();
    }, 500);
    return () => {
      source.cancel();
    };
  }, [
    searchText,
    currentPage,
    limit,
    modalPopUp,
    sortBy,
    sortOrder,
    selectedSegments,
  ]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${BASE_URL}/call-center/segments?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchText && searchText.length ? '&keyword=' + searchText : ''
        }&status=true`,
        axiosConfig
      );

      setTotalRecords(response?.data?.record_count);

      console.log(response);

      const selectedData = selectedSegments.map((item) => item.id);
      let excludedData = [];
      if (title == 'Include Segment') {
        excludedData = excludeSegmentsData?.map((item) => item.id);
      } else {
        excludedData = includeSegmentsData?.map((item) => item.id);
      }
      setRows(
        response?.data?.data
          .map((item) => {
            const date = new Date(item.ds_date_last_modified);
            const formattedDate =
              `${date.getMonth() + 1}`.padStart(2, '0') +
              '/' +
              `${date.getDate()}`.padStart(2, '0') +
              '/' +
              `${date.getFullYear()}`.substring(2);
            return { ...item, ds_date_last_modified: formattedDate };
          })
          .filter((row) => !selectedData.includes(row.id))
          .filter((row) => !excludedData?.includes(row.id))
      );

      setCheckedSegments([]);

      setIsLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setIsLoading(false);
        toast.error(
          `Failed to fetch table data: ${error?.response?.data?.message}`,
          { autoClose: 3000 }
        );
      }
    }
  };

  const totalPeople = () => {
    let totalPeopleCount = 0;
    for (let i = 0; i < selectedSegments.length; i++) {
      totalPeopleCount += selectedSegments[i].total_members;
    }
    return totalPeopleCount;
  };

  return (
    <>
      <Modal
        dialogClassName={`w-60`}
        show={modalPopUp}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body className="p-5">
          <div className="d-flex justify-content-between align-items-center">
            <h6>
              <b>{title}</b>
            </h6>

            <h6>
              Summary: <span>{totalPeople()} People</span>
            </h6>
          </div>

          <div className="formGroup">
            <div className="w-100">
              <div className={styles.customTablesBorderss}>
                <TableScrollList
                  handleSort={handleSort}
                  sortName={sortBy}
                  sortOrder={sortOrder}
                  data={selectedSegments}
                  headers={TableHeadersAssigned}
                  handleCheckboxValue={(row) => row.id}
                  checkboxValues={selectedSegments.map((row) => row.id)}
                  handleCheckbox={handleSelectedSegmentsCheckbox}
                  showAllCheckBox={false}
                  noDataText={'No Segments Selected'}
                />
              </div>
            </div>

            <div className="pt-5">
              <TopBar
                BreadCrumbsData={[]}
                SearchValue={searchText}
                SearchOnChange={(e) => {
                  setCurrentPage(1);
                  setSearchText(e.target.value);
                }}
                SearchPlaceholder={'Search'}
                onlySearchField={true}
              />
            </div>

            <div className="w-100 mt-1">
              <div>
                <TableScrollList
                  data={rows}
                  handleSort={handleSort}
                  sortName={sortBy}
                  sortOrder={sortOrder}
                  headers={TableHeadersSearch}
                  handleCheckboxValue={(row) => row.id}
                  checkboxValues={checkedSegments}
                  handleCheckbox={selectSegment}
                  showAllCheckBox={true}
                />
              </div>
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
                    setSelectedSegments([]);
                    if (title == 'Include Segment') {
                      setIncludeSegmentsCount(0);
                    } else {
                      setExcludeSegmentsCount(0);
                    }
                    setData([]);
                    setModalPopUp(false);
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
              message={`Segments succesfully added.`}
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

export default AssignSegmentsPopUpModal;
