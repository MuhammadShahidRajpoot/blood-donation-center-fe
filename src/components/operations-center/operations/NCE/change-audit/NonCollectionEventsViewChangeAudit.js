import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../../../../common/topbar/index';
import TableList from '../../../../common/tableListing';
import Pagination from '../../../../common/pagination';
import { fetchData } from '../../../../../helpers/Api';
import {
  OPERATIONS_CENTER_DRIVES_PATH,
  OPERATIONS_CENTER_MANAGE_FAVORITES_PATH,
  OPERATIONS_CENTER_NCE,
  OPERATIONS_CENTER_NCE_CHANGE_AUDIT_PATH,
} from '../../../../../routes/path';
import TopTabsNce from '../TopTabsNce';
import SvgComponent from '../../../../common/SvgComponent';
import moment from 'moment';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

const NonCollectionEventsViewChangeAudit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [changeAuditData, setChangeAuditData] = useState([]);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const { id } = useParams();
  const getWithStatus = async () => {
    try {
      setIsLoading(true);
      const result = await fetchData(
        `/oc-non-collection-events/${id}/change-audit?limit=${limit}&page=${currentPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      );

      const { data, status, count } = result;
      if (status === 200) {
        setChangeAuditData(
          data.map((singleData) => {
            let changeTo = singleData?.changes_to;
            let changeFrom = singleData?.changes_from;
            let changeWhen = `${singleData?.changed_when} | ${moment(
              singleData?.created_at
            ).format('MM-DD-YYYY | h:mm A')}`;
            if (singleData?.changes_field === 'Event Date') {
              changeTo = moment(changeTo).format('MM-DD-yyyy');
              changeFrom = moment(changeFrom).format('MM-DD-yyyy');
            }
            if (singleData?.changes_field?.includes('Time')) {
              changeTo = moment(changeTo).isValid()
                ? formatDateWithTZ(
                    changeTo.split('.')[0] || changeTo,
                    'hh:mm a'
                  )
                : 'N/A';
              changeFrom = moment(changeFrom).isValid()
                ? formatDateWithTZ(
                    changeFrom.split('.')[0] || changeFrom,
                    'hh:mm a'
                  )
                : 'N/A';
            }
            return {
              changes_field: singleData?.changes_field || 'N/A',
              changes_from: changeFrom || '',
              changes_to: changeTo || 'N/A',
              changed_when: changeWhen || 'N/A',
            };
          })
        );
        setTotalRecords(count);
        if (!(data?.length > 0) && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error('Error Getting Change Audit ', { autoClose: 3000 });
      }
    } catch (error) {
      console.log(error);
      toast.error('Error Getting Change Audit ', { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getWithStatus();
  }, [sortBy, sortOrder, currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortOrder]);
  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'active-label',
      link: OPERATIONS_CENTER_MANAGE_FAVORITES_PATH.LIST,
    },
    {
      label: 'Operations',
      class: 'active-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'Non-Collection Events',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE.LIST.replace(':id', id),
    },
    {
      label: 'View Non-Collection Event',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE.VIEW.replace(':id', id),
    },
    {
      label: 'Change Audit',
      class: 'active-label',
      link: OPERATIONS_CENTER_NCE_CHANGE_AUDIT_PATH.LIST.replace(':id', id),
    },
  ];
  const tableHeaders = [
    {
      name: 'changes_field',
      label: 'Change What',
      sortable: true,
    },
    {
      name: 'changes_from',
      label: 'Change From',
      sortable: true,
      toolTip: true,
      maxCharacters: 40,
    },
    {
      name: 'changes_to',
      label: 'Change To',
      sortable: true,
      toolTip: true,
      maxCharacters: 40,
    },
    { name: 'changed_when', label: 'Changed When', sortable: true },
    { name: '', label: '', sortable: false },
  ];

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
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Change Audit'}
        />
        <TopTabsNce
          NCEID={id}
          buttonRight={
            <div className="buttons">
              <div className="editAnchor">
                <Link
                  to={`/operations-center/operations/non-collection-events/${id}/edit`}
                >
                  <SvgComponent name="EditIcon" />
                  <span>Edit NCE</span>
                </Link>
              </div>
            </div>
          }
        />
        <div className="mainContentInner">
          <TableList
            isLoading={isLoading}
            data={changeAuditData}
            headers={tableHeaders}
            handleSort={handleSort}
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
    </>
  );
};

export default NonCollectionEventsViewChangeAudit;
