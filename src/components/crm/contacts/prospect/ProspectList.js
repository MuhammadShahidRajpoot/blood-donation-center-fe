import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import TopBar from '../../../common/topbar/index';
import NavTabs from '../../../common/navTabs';
import CheckPermission from '../../../../helpers/CheckPermissions';
import CrmPermissions from '../../../../enums/CrmPermissionsEnum';
import { StaffBreadCrumbsData } from '../staffs/StaffBreadCrumbsData';
import Pagination from '../../../common/pagination/index';
import ProspectFilters from '../prospects/ProspectFilters/prospectFilter';
import {
  findDonorBBCS,
  getUnsyncedDonors,
  // syncDonorsBBCS,
} from '../prospects/services/prospect.service';
import TableList from '../prospects/ProspectTableListing';
import ProspectModal from '../prospects/ProspectModal';

function ProspectList() {
  const Tabs = [
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.WRITE,
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.READ,
    ])
      ? {
          label: 'Volunteers',
          link: '/crm/contacts/volunteers',
        }
      : null,
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.DONOR.WRITE,
      CrmPermissions.CRM.CONTACTS.DONOR.READ,
    ])
      ? {
          label: 'Donor',
          link: '/crm/contacts/donor',
        }
      : null,
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.STAFF.WRITE,
      CrmPermissions.CRM.CONTACTS.STAFF.READ,
    ])
      ? {
          label: 'Staff',
          link: '/crm/contacts/staff',
        }
      : null,
    // CheckPermission([
    //   CrmPermissions.CRM.CONTACTS.PROSPECT.WRITE,
    //   CrmPermissions.CRM.CONTACTS.PROSPECT.READ,
    // ])
    //   ? {
    //       label: 'Prospects',
    //       link: '/crm/contacts/prospect',
    //     }
    //   : null,
  ];

  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'id',
      label: 'Donor Id',
      minWidth: '10rem',
      width: '10rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'nick_name',
      label: 'Name',
      minWidth: '10rem',
      width: '10rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'address',
      label: 'City',
      minWidth: '10rem',
      width: '10rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'state',
      label: 'State',
      minWidth: '10rem',
      width: '10rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'primary_phone',
      label: 'Primary Phone',
      minWidth: '13rem',
      width: '13rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'primary_email',
      label: 'Primary Email',
      minWidth: '13rem',
      width: '13rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'blood_type',
      label: 'Blood Type',
      minWidth: '13rem',
      width: '13rem',
      sortable: true,
      checked: true,
    },
    {
      name: 'last_donation_date',
      label: 'Last Donation',
      minWidth: '13rem',
      width: '13rem',
      sortable: false,
      checked: true,
    },
  ]);

  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('nick_name');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState();
  const [modal, setModal] = useState(false);
  const [bbcsDonors, setBbcDonors] = useState(null);
  const [donorId, setDonorId] = useState(null);
  const location = useLocation();

  const currentLocation = location.pathname;
  let inputTimer = null;

  const optionsConfig = [
    CheckPermission([
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.WRITE,
      CrmPermissions.CRM.CONTACTS.VOLUNTEERS.READ,
    ])
      ? {
          label: 'View',
          path: (rowData) => `${rowData.id}/view`,
        }
      : null,
    CheckPermission([CrmPermissions.CRM.CONTACTS.VOLUNTEERS.WRITE])
      ? {
          label: 'Resolve',
          action: (rowData) => {
            const data = {
              first_name: rowData.first_name || '',
              last_name: rowData.last_name || '',
              birth_date: rowData.birth_date || '',
              email: rowData?.created_by?.email || '',
              id: rowData?.id,
            };
            fetchDonorBBCS(data);
          },
        }
      : null,
  ];

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      const sort = {
        sortBy,
        sortOrder,
      };
      fetchAllFilters(sort);
    }, 500);
  }, [searchText, limit, currentPage, sortBy, sortOrder]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

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

  const fetchAllFilters = async (filters) => {
    try {
      const pagination = {
        page: currentPage,
        limit,
      };
      const response = await getUnsyncedDonors(filters, pagination);
      if (response.status !== 500) {
        setRows(response.data);
        setTotalRecords(response?.count || 10);
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  const fetchDonorBBCS = async (data) => {
    try {
      const donorId = data.id;
      delete data.id;
      const response = await findDonorBBCS(data);
      if (response.status_code === 500) {
        throw 'Failed to find a new donor via BBCS API';
      }

      const resp = response.data.data;
      setBbcDonors(resp);
      setDonorId(donorId);
      setModal(true);
    } catch (error) {
      toast.error(`${error}`, { autoClose: 3000 });
    }
  };

  const checkboxItems = [
    'Donor Id',
    'Name',
    'City',
    'Primary Phone',
    'Primary Email',
    'Blood Type',
    'Last Donation',
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={StaffBreadCrumbsData}
        BreadCrumbsTitle={'Contacts'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />

      <div className="filterBar">
        <NavTabs tabs={Tabs} currentLocation={currentLocation} />
      </div>

      <div className="mainContentInner">
        <ProspectFilters
          setIsLoading={setIsLoading}
          fetchAllFilters={fetchAllFilters}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
        <div className="button-icon">
          {/* {CheckPermission([CrmPermissions.CRM.CONTACTS.VOLUNTEERS.WRITE]) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="buttons donor-buttons"
            >
              <div
                style={{ flexGrow: 1, position: 'absolute', left: 30 }}
                className="text-container"
              >
                <p style={{ color: '#555', fontSize: '14px', fontWeight: 400 }}>
                  {exclamationMark} &nbsp; Resolve BBCS Donor syncing &nbsp;{' '}
                  <button
                    style={{
                      border: '1px solid #555',
                    }}
                    disabled={true}
                    className="btn btn-primary btn-sm"
                  >
                    {'Resolve (3)'}
                  </button>
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate('create')}
                disabled={true}
                style={{
                  border: '1px solid #555',
                }}
              >
                Resolve As Separate
              </button>
            </div>
          )} */}
        </div>
        <TableList
          isLoading={isLoading}
          data={rows}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortBy}
          sortOrder={sortOrder}
          optionsConfig={optionsConfig}
          base_path="/crm/contacts/donor"
          setTableHeaders={setTableHeaders}
          checkboxItems={checkboxItems}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        <ProspectModal
          showBBCSModal={modal}
          data={bbcsDonors}
          donorId={donorId}
          title="Multiple Matches Found"
          showActionBtns={true}
          setModalHide={() => setModal(false)}
        />
      </div>
    </div>
  );
}

export default ProspectList;
