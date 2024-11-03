import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '../../../../../common/pagination';
import TableList from '../../../../../common/tableListing';
import SelectDropdown from '../../../../../common/selectDropdown';
import { ProductsProceduresBreadCrumbsData } from '../ProductsProceduresBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import SvgComponent from '../../../../../common/SvgComponent';
// import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';

const ListProducts = () => {
  const bearerToken = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const currentLocation = location.pathname;
  const [products, setProducts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [sortName, setSortName] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [isLoading, setIsLoading] = useState(true);
  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'name',
      label: 'Name',
      width: '15%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'description',
      label: 'Description',
      width: '30%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'short_description',
      label: 'Short Description',
      width: '30%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'is_active',
      label: 'Status',
      width: '20%',
      sortable: true,
      defaultHidden: false,
    },
  ]);
  // const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const result = await fetch(
          `${BASE_URL}/products?limit=${limit}&page=${currentPage}&status=${
            isActive?.value ?? ''
          }&sortOrder=${sortOrder}&sortName=${sortName}`,
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        const data = await result.json();
        setProducts(data?.data);
        setTotalRecords(data?.count);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSearchChange = async (e) => {
      setIsLoading(true);

      try {
        const result = await fetch(
          `${BASE_URL}/products?limit=${limit}&page=${currentPage}&name=${searchText}&status=${
            isActive?.value ?? ''
          }&sortOrder=${sortOrder}&sortName=${sortName}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        const data = await result.json();
        setProducts(data.data);
        setTotalRecords(data?.count);
      } catch (error) {
        console.error('Error searching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchText) {
      getData(limit, currentPage);
    }
    if (searchText.length > 1) {
      handleSearchChange(searchText);
    }
    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [currentPage, limit, searchText, BASE_URL, isActive, sortOrder, sortName]);

  const handleSort = (columnName) => {
    if (sortName === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortName(columnName);
      setSortOrder('ASC');
    }
  };
  const sortedProducts = products;

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const BreadcrumbsData = [
    ...ProductsProceduresBreadCrumbsData,
    {
      label: 'Products',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/organization-admin/products',
    },
  ];

  const optionsConfig = [
    // CheckPermission([
    //   Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES.PRODUCTS
    //     .READ,
    // ]) && {
    //   label: 'View',
    //   action: (rowData) => {},
    // },
    // CheckPermission([
    //   Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES.PRODUCTS
    //     .WRITE,
    // ]) && {
    //   label: 'Edit',
    //   action: (rowData) => {},
    // },
    // CheckPermission([
    //   Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES.PRODUCTS
    //     .ARCHIVE,
    // ]) && {
    //   label: 'Archive',
    //   action: (rowData) => {},
    // },
  ];

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Products'}
        SearchPlaceholder={'Search'}
        SearchValue={null}
        SearchOnChange={searchFieldChange}
      />
      <div className="filterBar">
        <div className="tabs">
          <ul>
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES
                .PRODUCTS.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={
                    '/system-configuration/tenant-admin/organization-admin/products'
                  }
                  className={
                    currentLocation ===
                    '/system-configuration/tenant-admin/organization-admin/products'
                      ? 'active'
                      : ''
                  }
                >
                  Products
                </Link>
              </li>
            )}
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES
                .PROCEDURES.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={
                    '/system-configuration/tenant-admin/organization-admin/procedures'
                  }
                  className={
                    currentLocation ===
                    '/system-configuration/tenant-admin/organization-admin/procedures'
                      ? 'active'
                      : ''
                  }
                >
                  Procedures
                </Link>
              </li>
            )}
            {CheckPermission(null, [
              Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES
                .PROCEDURE_TYPES.MODULE_CODE,
            ]) && (
              <li>
                <Link
                  to={
                    '/system-configuration/tenant-admin/organization-admin/procedures-types'
                  }
                  className={
                    currentLocation ===
                    '/system-configuration/tenant-admin/organization-admin/procedures-types'
                      ? 'active'
                      : ''
                  }
                >
                  Procedure Types
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="filterInner">
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
                onChange={(value) => {
                  setIsActive(value);
                }}
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
          Permissions.ORGANIZATIONAL_ADMINISTRATION.PRODUCTS_AND_PROCEDURES
            .PRODUCTS.WRITE,
        ]) && (
          <div className="buttons">
            {/* <button
              className="btn btn-primary"
              onClick={() => {
                navigate('#');
              }}
            >
              Create Products
            </button> */}
          </div>
        )}
        <TableList
          isLoading={isLoading}
          data={sortedProducts}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortName}
          sortOrder={sortOrder}
          handleArchive={null}
          optionsConfig={optionsConfig}
          enableColumnHide={true}
          showActionsLabel={false}
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
    </div>
  );
};

export default ListProducts;
