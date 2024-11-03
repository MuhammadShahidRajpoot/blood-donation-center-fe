import React, { useEffect, useState } from 'react';
import styles from '../volunteer.module.scss';
import { useOutletContext, useParams } from 'react-router-dom';
import TableList from '../../../../common/tableListing/index';
import Pagination from '../../../../common/pagination';
import CommunicationModal from '../../../../common/CommunicationModal';
import { VolunteersBreadCrumbsData } from '../VolunteersBreadCrumbsData';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import { toast } from 'react-toastify';
import SelectDropdown from '../../../../common/selectDropdown';
import VolunteerNavigation from '../VolunteerNavigation';
import DatePicker from '../../../../common/DatePicker';
// import moment from 'moment';
import SvgComponent from '../../../../common/SvgComponent';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';

let inputTimer = null;

const CommunicationList = () => {
  const params = useParams();
  const communicationable_type = PolymorphicType.CRM_CONTACTS_VOLUNTEERS;
  const communicationable_id = params.volunteerId;
  const [openModal, setOpenModal] = useState(false);
  const context = useOutletContext();
  useEffect(() => {
    context.setBreadCrumbsState([
      ...VolunteersBreadCrumbsData,
      {
        label: 'View Volunteer',
        class: 'disable-label',
        link: `/crm/contacts/volunteers/${params?.id}/view`,
      },
      {
        label: 'Communication',
        class: 'active-label',
        link: `/crm/contacts/volunteers/${params?.volunteerId}/view/communication`,
      },
    ]);
  }, []);
  const [messageType, setMessageType] = useState(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [status, setStatus] = useState('');
  // const [statusData, setStatusData] = useState([]);
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [defaultMessageType, setDefaultMessageType] = useState('');
  const [refreshData, setRefreshData] = useState(false);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'date',
      label: 'Date',
      minWidth: '20rem',
      width: '12rem',
      sortable: true,
    },
    {
      name: 'message_type',
      label: 'Message Type',
      minWidth: '15rem',
      width: '12rem',
      sortable: true,
    },
    {
      name: 'communications_subject',
      label: 'Subject',
      minWidth: '15rem',
      width: '12rem',
      sortable: true,
    },
    {
      name: 'communications_listing_message',
      label: 'Message',
      minWidth: '20rem',
      width: '12rem',
      sortable: true,
    },
    {
      name: 'communications_status',
      label: 'Status',
      minWidth: '12rem',
      width: '12rem',
      sortable: true,
    },
  ]);

  const fetchAll = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contacts/volunteers/communications?page=${currentPage}&limit=${limit}${
          sortBy ? `&sortBy=${sortBy}` : ''
        }${sortOrder ? `&sortOrder=${sortOrder}` : ''}${
          context?.search ? `&keyword=${context?.search}` : ''
        }${status ? `&status=${status?.value}` : ''}${
          messageType && messageType !== 'undefined' && messageType
            ? `&message_type=${messageType?.value}`
            : ''
        }${
          startDate && !endDate
            ? `&date=${startDate}`
            : startDate && endDate
            ? `&date=${startDate},${endDate}`
            : ''
        }&communicationable_type=${communicationable_type}&communicationable_id=${communicationable_id}`
      );
      const data = await response.json();
      if (data.status !== 500) {
        setRows(data.data);
        setTotalRecords(data?.count);
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  // const BreadcrumbsData = [
  //   ...VolunteersBreadCrumbsData,
  //   {
  //     label: 'View Volunteer',
  //     class: 'disable-label',
  //     link: `/crm/contacts/volunteers/${params?.volunteerId}/view`,
  //   },
  //   {
  //     label: 'Communication',
  //     class: 'active-label',
  //     link: `/crm/contacts/volunteers/${params?.volunteerId}/view/communication`,
  //   },
  // ];

  const optionsConfig = [
    {
      label: 'View',
      path: (rowData) => `${rowData.id}/view`,
      action: (rowData) => {},
    },
  ];

  const handleModalButtons = (confirmed) => {
    setOpenModal(confirmed);
    setDefaultMessageType(confirmed ? 'email' : 'sms');
  };

  const handleSort = (column) => {
    let customColumn;
    if (column === 'communications_status') {
      customColumn = 'status_detail';
    } else if (column === 'communications_listing_message') {
      customColumn = 'message_text';
    } else if (column === 'communications_subject') {
      customColumn = 'subject';
    } else {
      customColumn = column;
    }
    if (sortBy === customColumn) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortBy('');
        setSortOrder('');
      } else {
        setSortOrder('ASC');
      }
    } else {
      setSortBy(customColumn);
      setSortOrder('ASC');
    }
  };

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchAll();
    }, 500);
  }, [
    limit,
    currentPage,
    sortBy,
    sortOrder,
    status,
    messageType,
    context?.search,
    startDate,
    endDate,
    refreshData,
  ]);

  const handleStatus = (value) => {
    setStatus(value);
  };

  const handleMessageType = (value) => {
    setMessageType(value);
  };

  const transformData = (data) => {
    return data?.map((item) => {
      let communications_status = item.status;
      let communications_message = item.message_text;
      let communications_listing_message = item.message_text;
      let communications_subject = item.subject;
      let message_type = item.message_type === 'email' ? 'Email' : 'SMS';

      return {
        ...item,
        communications_status: communications_status,
        communications_message: communications_message,
        communications_subject: communications_subject,
        communications_listing_message: communications_listing_message,
        message_type: message_type,
      };
    });
  };
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className={styles.accountViewMain}>
      <VolunteerNavigation volunteer={context?.volunteer}>
        <div className="filterIcon" onClick={filterChange}>
          <SvgComponent
            name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
          />
        </div>
        <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
          <form className={`d-flex gap-3 w-100`}>
            <div className="position-relative">
              <DatePicker
                dateFormat="MM/dd/yy"
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                showLabel={true}
                endDate={endDate}
                placeholderText="Date Range"
                selectsRange
              />
            </div>
            <SelectDropdown
              placeholder={'Message Type'}
              defaultValue={messageType}
              selectedValue={messageType}
              removeDivider
              showLabel
              onChange={handleMessageType}
              options={[
                { label: 'SMS', value: 'sms' },
                { label: 'Email', value: 'email' },
              ]}
            />

            <SelectDropdown
              placeholder={'Status'}
              defaultValue={status}
              selectedValue={status}
              removeDivider
              onChange={handleStatus}
              options={[
                { label: 'New', value: 'new' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Bounced', value: 'bounced' },
                { label: 'Blocked', value: 'blocked' },
                { label: 'Deffered', value: 'deffered' },
                { label: 'Failed', value: 'failed' },
                { label: 'Sent', value: 'sent' },
                { label: 'Undelivered', value: 'undelivered' },
              ]}
            />
          </form>
        </div>
      </VolunteerNavigation>

      <div className="mainContentInner">
        <div className="buttons">
          <button
            className="btn btn-primary btn-md"
            onClick={() => setOpenModal(true)}
          >
            Communicate
          </button>
        </div>
        <TableList
          isLoading={isLoading}
          data={transformData(rows)}
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
      <CommunicationModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        defaultMessageType={defaultMessageType}
        setDefaultMessageType={setDefaultMessageType}
        handleModalButtons={handleModalButtons}
        communicationable_id={communicationable_id}
        communicationable_type={communicationable_type}
        refreshData={refreshData} // Pass the state as a prop
        setRefreshData={setRefreshData}
      />
    </div>
  );
};

export default CommunicationList;
