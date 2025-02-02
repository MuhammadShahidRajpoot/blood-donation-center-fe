import React from 'react';

import TableList from '../../../../common/tableListing';
import Pagination from '../../../../common/pagination/index';

import ConfirmModal from '../../../../../components/common/confirmModal';
import ResolveIcon from '../../../../../assets/Resolve.svg';
import { useSearchParams, useParams, useOutletContext } from 'react-router-dom';
import { fetchData } from '../../../../../helpers/Api';
import { DonorBreadCrumbsData } from '../../donor/DonorBreadCrumbsData';
import { useEffect } from 'react';

const initialSearchParams = {
  page: 1,
  limit: 10,
  sortOrder: 'ASC',
  sortName: 'name',
};

export default function DonorListDuplicates() {
  const params = useParams();
  const context = useOutletContext();
  useEffect(() => {
    context.setBreadCrumbsState([
      ...DonorBreadCrumbsData,
      {
        label: 'View Donor',
        class: 'disable-label',
        link: `/crm/contacts/donor/${params?.donerId}/view`,
      },
      {
        label: 'Duplicates',
        class: 'disable-label',
        link: `/crm/contacts/donor/${params?.donerId}/view/duplicates`,
      },
    ]);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams(initialSearchParams);
  const [donor, setDonor] = React.useState(null);
  const [duplicates, setDuplicates] = React.useState([]);
  const [totalDuplicates, setTotalDuplicates] = React.useState(-1);
  const [page, setPage] = React.useState(initialSearchParams.page);
  const [isLoading, setIsLoading] = React.useState(true);
  const [limit, setLimit] = React.useState(
    process.env.REACT_APP_PAGE_LIMIT || initialSearchParams.limit
  );
  const [sortOrder, setSortOrder] = React.useState(
    initialSearchParams.sortOrder
  );
  const [sortName, setSortName] = React.useState(initialSearchParams.sortName);
  const [showConfirmation, setConfirmation] = React.useState(null);

  // const BreadcrumbsData = [
  //   ...DonorBreadCrumbsData,
  //   {
  //     label: 'View Donor',
  //     class: 'disable-label',
  //     link: `/crm/contacts/donor/${params?.donerId}/view`,
  //   },
  //   {
  //     label: 'Duplicates',
  //     class: 'disable-label',
  //     link: `/crm/contacts/donor/${params?.donerId}/view/duplicates`,
  //   },
  // ];

  const TableHeaders = [
    { name: 'id', label: 'Donor ID', width: '10%', sortable: true },
    { name: 'name', label: 'Name', width: '10%', sortable: true },
    { name: 'address', label: 'Street Address', width: '10%', sortable: true },
    { name: 'city', label: 'City', width: '10%', sortable: true },
    {
      name: 'primary_email',
      label: 'Email',
      width: '10%',
      sortable: true,
    },
    { name: 'primary_phone', label: 'Phone', width: '10%', sortable: true },
  ];

  const OptionsConfig = [
    {
      label: 'View',
      path: (rowData) => `/crm/contacts/donor/${rowData?.id}/view`,
    },
    {
      label: 'Resolve',
      action: (rowData) => setConfirmation(rowData),
    },
  ];

  React.useEffect(() => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sortName,
      sortOrder,
      page,
      limit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortName, sortOrder, page, limit]);

  React.useEffect(() => {
    async function fetchDonor() {
      const { data: donorData } = await fetchData(
        `/contact-donors/${params?.donorId}`
      );
      if (donorData) {
        return setDonor({
          id: donorData?.id,
          name: `${donorData?.first_name} ${donorData?.last_name}`,
          address: `${donorData?.address.address1}${
            donorData?.address.address2 && ` ${donorData?.address.address2}`
          }`,
          city: donorData?.address?.city,
          primary_phone: donorData?.contact?.find(
            (contact) =>
              contact?.is_primary === true &&
              contact?.contact_type >= 1 &&
              contact?.contact_type <= 3
          )?.data,
          primary_email: donorData?.contact?.find(
            (contact) =>
              contact?.is_primary === true &&
              contact?.contact_type >= 4 &&
              contact?.contact_type <= 6
          )?.data,
        });
      }
    }
    if (params?.donorId) {
      fetchDonor();
    }
  }, [params?.donorId]);

  React.useEffect(() => {
    setIsLoading(true);
    const fetchDuplicates = async () => {
      const {
        data: { records = [], count = 0 },
      } = await fetchData(
        `/contact-donors/${donor.id}/duplicates/list`,
        'GET',
        {
          ...Object.fromEntries(searchParams),
          is_resolved: false,
        }
      );

      if (count) records.unshift(donor);
      setTimeout(() => {
        setDuplicates(records);
        setTotalDuplicates(count ? count + 1 : 0);
      });
    };

    if (donor && showConfirmation === null) fetchDuplicates();
    setIsLoading(false);
  }, [donor, searchParams, showConfirmation]);

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   const { value } = e.target;
  //   const searchObj = { ...Object.fromEntries(searchParams), keyword: value };

  //   if (searchParams.get('keyword') !== value)
  //     setTimeout(() => {
  //       setPage(1);
  //       setSearchParams(searchObj);
  //     });
  //   else setSearchParams(searchObj);
  // };

  const handleSort = (columnName) => {
    setTimeout(() => {
      setSortName(columnName);
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    });
  };

  const handleResolve = async (obj) => {
    const payload = {};
    if (params?.donorId !== obj.id) payload['record_id'] = obj.id;
    await fetchData(
      `/contact-donors/${params?.donorId}/duplicates/resolve`,
      'PATCH',
      payload
    );
    setConfirmation(null);
  };

  return (
    <>
      {/* <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Duplicates'}
        SearchPlaceholder={'Search'}
        SearchValue={searchParams.get('keyword')}
        SearchOnChange={handleSearch}
      />
      <DonorNavigation /> */}
      <div className="mainContentInner">
        <p className="d-flex align-items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <path
              d="M8 16C6.41775 16 4.87103 15.5308 3.55544 14.6518C2.23985 13.7727 1.21447 12.5233 0.608967 11.0615C0.00346629 9.59966 -0.15496 7.99113 0.153721 6.43928C0.462403 4.88743 1.22433 3.46197 2.34315 2.34315C3.46197 1.22433 4.88743 0.462403 6.43928 0.153721C7.99113 -0.15496 9.59966 0.00346629 11.0615 0.608967C12.5233 1.21447 13.7727 2.23985 14.6518 3.55544C15.5308 4.87103 16 6.41775 16 8C15.9977 10.121 15.1541 12.1545 13.6543 13.6543C12.1545 15.1541 10.121 15.9977 8 16ZM8 1.33334C6.68146 1.33334 5.39253 1.72433 4.2962 2.45687C3.19987 3.18941 2.34539 4.23061 1.84081 5.44878C1.33622 6.66695 1.2042 8.0074 1.46143 9.3006C1.71867 10.5938 2.35361 11.7817 3.28596 12.714C4.21831 13.6464 5.40619 14.2813 6.6994 14.5386C7.99261 14.7958 9.33305 14.6638 10.5512 14.1592C11.7694 13.6546 12.8106 12.8001 13.5431 11.7038C14.2757 10.6075 14.6667 9.31854 14.6667 8C14.6647 6.23249 13.9617 4.53792 12.7119 3.2881C11.4621 2.03828 9.76752 1.33528 8 1.33334Z"
              fill="#005375"
            />
            <path
              d="M9.33268 12.6641H7.99935V7.9974H6.66602V6.66406H7.99935C8.35297 6.66406 8.69211 6.80454 8.94215 7.05459C9.1922 7.30464 9.33268 7.64377 9.33268 7.9974V12.6641Z"
              fill="#005375"
            />
            <path
              d="M8 5.33594C8.55228 5.33594 9 4.88822 9 4.33594C9 3.78365 8.55228 3.33594 8 3.33594C7.44772 3.33594 7 3.78365 7 4.33594C7 4.88822 7.44772 5.33594 8 5.33594Z"
              fill="#005375"
            />
          </svg>
          <span className="text-sm">
            Donor duplicates can be merged in the BECS
          </span>
        </p>

        <TableList
          isLoading={isLoading}
          data={duplicates}
          headers={TableHeaders}
          handleSort={handleSort}
          optionsConfig={OptionsConfig}
          current={params?.donorId}
          showActionsLabel={false}
        />
        <Pagination
          limit={limit}
          setLimit={(value) => setLimit(value)}
          currentPage={page}
          setCurrentPage={(value) => setPage(value)}
          totalRecords={totalDuplicates}
        />
      </div>
      <ConfirmModal
        showConfirmation={showConfirmation !== null}
        onCancel={() => setConfirmation(null)}
        onConfirm={() => handleResolve(showConfirmation)}
        icon={ResolveIcon}
        heading={'Resolve'}
        description={
          'Are you sure you want to resolve this possible duplicate? It will no longer appear on this listing.'
        }
      />
    </>
  );
}
