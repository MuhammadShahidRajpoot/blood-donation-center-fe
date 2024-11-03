import React, { useEffect, useState } from 'react';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';
import TopBar from '../../common/topbar/index';
import NavTabs from '../../common/navTabs';
import { useLocation, useParams } from 'react-router-dom';
import TableList from '../../common/tableListing';
import { toast } from 'react-toastify';
import {
  BASE_URL,
  makeAuthorizedApiRequestAxios,
} from '../../../helpers/Api.js';
import { covertDatetoTZDate } from '../../../helpers/convertDateTimeToTimezone.js';

let inputTimer = null;
const ProspectsContact = () => {
  const location = useLocation();
  const { id } = useParams();

  const currentLocation = location.pathname;
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [sortBy, setSortBy] = useState('contact_name');
  const [prospectsData, setProspectsData] = useState([]);
  const [search, setSearch] = useState('');
  const Tabs = [
    {
      label: 'About',
      link: `/operations-center/prospects/${id}/about`,
    },
    {
      label: 'Contacts',
      link: `/operations-center/prospects/${id}/contacts`,
    },
  ];

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Prospect',
      class: 'disable-label',
      link: OS_PROSPECTS_PATH.LIST,
    },
    {
      label: 'View Prospect',
      class: 'disable-label',
      link: OS_PROSPECTS_PATH.ABOUT,
    },
    {
      label: 'Contacts',
      class: 'disable-label',
      link: OS_PROSPECTS_PATH.CONTACTS,
    },
  ];

  const tableHeaders = [
    {
      name: 'contact_name',
      label: 'Contact Name',
      width: '25%',
      sortable: true,
    },
    {
      name: 'account',
      label: 'Account',
      sortable: true,
      width: '25%',
    },
    {
      name: 'email_status',
      label: 'Email Status',
      sortable: true,
      width: '25%',
      innerClassName: 'badge active',
    },
    {
      name: 'date',
      label: 'Updated',
      sortable: true,
      width: '25%',
      className: 'text-left',
    },
  ];

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

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchContactData();
    }, 500);
  }, [search, sortBy, sortOrder]);

  const fetchContactData = () =>
    makeAuthorizedApiRequestAxios(
      'GET',
      `${BASE_URL}/operations-center/prospects/${id}/blueprints?keywords=${search}&sortName=${sortBy}&sortOrder=${sortOrder}`
    )
      .then((response) => {
        setProspectsData(
          response.data?.data?.map((el) => ({
            contact_name: el.chairperson_name,
            account: el.account_name,
            email_status: '-',
            date: covertDatetoTZDate(el.updated_at),
          }))
        );
        setIsLoading(false);
      })
      .catch((er) => {
        console.log(er);
        setIsLoading(false);
        toast.error('Failed to fetch');
      });

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Prospect'}
          SearchPlaceholder={'Search Contact Name'}
          SearchValue={search}
          SearchOnChange={(e) => setSearch(e.target.value)}
        />
        <div className="filterBar">
          <NavTabs tabs={Tabs} currentLocation={currentLocation} />
        </div>
        <div className="mainContentInner">
          <TableList
            isLoading={isLoading}
            data={prospectsData}
            headers={tableHeaders}
            handleSort={handleSort}
            sortOrder={sortOrder}
            optionsConfig={null}
            showVerticalLabel={null}
          />
        </div>
      </div>
    </>
  );
};

export default ProspectsContact;
