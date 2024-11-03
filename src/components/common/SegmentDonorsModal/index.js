import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Mystyles from './index.module.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import DonorTableList from '../../call-center/manage-segments/tableListingDonorsList';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import Pagination from '../../common/pagination/index';
import CloseIcon from '../../../assets/closeIcon.svg';

const SegmentDonersModal = ({ openModal, setOpenModal, segmentdata }) => {
  let inputTimer = null;
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [searchValue, setSearchValue] = useState(null);
  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tableHeaders] = useState([
    {
      name: 'donor_name',
      label: 'Name',
      width: '20%',
      sortable: true,
      checked: true,
    },
    {
      name: 'last_outcome',
      label: 'Last Outcome',
      width: '25%',
      sortable: true,
      checked: true,
    },
    {
      name: 'segment_contact_created_at',
      label: 'Date/Time',
      width: '20%',
      sortable: true,
      checked: true,
    },
    {
      name: 'agent_name',
      label: 'Agent',
      width: '25%',
      sortable: true,
      checked: true,
    },
  ]);

  useEffect(() => {
    if (segmentdata && segmentdata.ds_segment_id && openModal) {
      clearTimeout(inputTimer);
      inputTimer = setTimeout(async () => {
        setIsLoading(true);
        fetchAllData();
      }, 500);
    }
  }, [segmentdata, searchValue, sortOrder, sortBy, currentPage, openModal]);

  const fetchAllData = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/call-center/segments/${
          segmentdata.ds_segment_id
        }/donor-information?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}${
          searchValue && searchValue.length ? '&keyword=' + searchValue : ''
        }`
      );
      const data = await response.json();
      setRows(data.data);
      setTotalRecords(data?.record_count);
    } catch (error) {
      toast.error(`Failed to fetch Donors table data ${error}`, {
        autoClose: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleSort = (column) => {
    console.log('=====??', column);
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
  if (!openModal) return null;
  const searchFieldChange = (e) => {
    setSearchValue(e.target.value);
  };
  return (
    <>
      <section
        className={`${Mystyles.CreateMessageModal} popup full-section active`}
      >
        <div className={`${Mystyles.MessageModalInner} popup-inner`}>
          <div className={`${Mystyles.MessageModalContent} content`}>
            <h5>{segmentdata && segmentdata.name}</h5>
            <div
              className="cursor-pointer"
              onClick={() => {
                setOpenModal(false);
                setRows([]);
              }}
            >
              <img src={CloseIcon} />
            </div>
          </div>
          <div className={Mystyles.Input}>
            <input
              className={Mystyles.InputField}
              type="text"
              placeholder={'Search'}
              value={searchValue}
              onChange={searchFieldChange}
            />
          </div>
          <DonorTableList
            isLoading={isLoading}
            data={rows}
            hideActionTitle={true}
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
      </section>
    </>
  );
};

export default SegmentDonersModal;
