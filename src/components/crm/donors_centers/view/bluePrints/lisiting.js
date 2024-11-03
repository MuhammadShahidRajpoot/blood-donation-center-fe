import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResolveImage from '../../../../../assets/Resolve.svg';
import TopBar from '../../../../common/topbar/index';
import './index.scss';
import TableList from '../../../../common/tableListing';
import Pagination from '../../../../common/pagination';
import { toast } from 'react-toastify';
import SelectDropdown from '../../../../common/selectDropdown';
import TopTabsDonorCenters from '../../topTabsDonorCenters';
import SuccessPopUpModal from '../../../../common/successModal';
import ConfirmArchiveIcon from '../../../../../assets/images/ConfirmArchiveIcon.png';
import { API } from '../../../../../api/api-routes';
import {
  CRM_ACCOUNTS_PATH,
  CRM_PATH,
  OPERATIONS_CENTER_SESSIONS_PATH,
} from '../../../../../routes/path';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import SvgComponent from '../../../../common/SvgComponent';

export default function DonorBluePrintListing() {
  const [search, setSearch] = useState('');
  const { id } = useParams();
  const [sortName, setSortName] = useState('');
  const [archivePopup, setArchivePopup] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  const [archiveId, setArchiveId] = useState(false);
  const [order, setOrder] = useState();
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 5);
  const [totalRecords, setTotalRecords] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmationDialogResolve, setShowConfirmationDialogResolve] =
    useState(false);
  const [accountData, setAccountData] = useState(null);
  const [resolvedChecked, setResolvedChecked] = useState(false);
  const [statusDataText, setStatusDataText] = useState({
    label: 'Active',
    value: true,
  });
  const [searched, setSearched] = useState(false);

  const BreadcrumbsData = [
    {
      label: 'CRM',
      class: 'disable-label',
      link: CRM_PATH,
    },
    {
      label: 'Donors Centers',
      class: 'disable-label',
      link: CRM_ACCOUNTS_PATH,
    },
    {
      label: 'View Donors Centers',
      class: 'disable-label',
      link: `/crm/accounts/${id}/view/about`,
    },
    {
      label: 'Blueprints',
      class: 'active-label',
      link: `/crm/donor-centers/${24}/blueprints`,
    },
  ];

  const searchFieldChange = (e) => {
    setSearch(e.target.value);
  };
  // const [categories, setCategories] = useState([]);
  // const [subCategories, setSubCategories] = useState([]);
  // const [resloveId, setResolveId] = useState();

  const optionsConfig = [
    {
      label: 'View',
      path: (rowData) =>
        `/crm/donor-centers/${id}/blueprints/${rowData?.blueprintsId}/view`,
      action: (rowData) => {},
    },
    {
      label: 'Edit',
      path: (rowData) =>
        `/crm/donor-centers/${id}/blueprints/${rowData?.blueprintsId}/edit`,
      action: (rowData) => {},
    },
    {
      label: 'Build Schedule',
      path: (rowData) =>
        `${OPERATIONS_CENTER_SESSIONS_PATH.BLUEPRINT}?donor_center_id=${id}&blueprint_id=${rowData?.blueprintsId}`,
      action: (rowData) => {},
    },
    {
      label: 'Archive',
      action: (rowData) => {
        setArchiveId(rowData.blueprintsId);
        setArchivePopup(true);
      },
    },
    {
      label: 'Make Default',
      action: (rowData) => {
        // setArchiveId(rowData.blueprintsId);
        makeDefault(rowData.blueprintsId);
      },
    },
    {
      label: 'Duplicate',
      action: (rowData) => {
        // setArchiveId(rowData.blueprintsId);
        makeDuplicate(rowData.blueprintsId);
      },
    },
  ];

  const archive = async () => {
    try {
      const response = await API.crm.donorCenter.blueprint.archive(archiveId);
      const { data } = response;
      const { status_code: status } = data;
      console.log({ status });
      if (status === 204) {
        setArchiveSuccess(true);
        setArchivePopup(false);
      } else if (response?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  const tableHeaders = [
    {
      name: 'blueprint_name',
      label: 'Blueprint Name',
      width: '14%',
      sortable: true,
    },
    {
      name: 'hours',
      label: 'Session Hours',
      width: '16%',
      sortable: true,
    },
    {
      name: 'procedures',
      label: 'Procedures',
      width: '10%',
      sortable: true,
    },
    {
      name: 'products',
      label: 'Products',
      width: '16%',
      sortable: true,
    },
    {
      name: 'staff_setup',
      label: 'Staffing Setup',
      width: '10%',
      sortable: true,
    },
    {
      name: 'status',
      label: 'Status',
      width: '16%',
      sortable: true,
    },
  ];
  //   const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    fetchAccountData();
  }, [sortName, order, limit, currentPage, statusDataText]);

  useEffect(() => {
    if (search?.length > 1) {
      setSearched(true);
      setCurrentPage(1);
      fetchAccountData();
    }
    if (search?.length <= 1 && searched) {
      fetchAccountData();
      setSearched(false);
    }
  }, [search]);
  const fetchAccountData = async () => {
    try {
      let currentpage = currentPage;

      setIsLoading(true);
      let blueprint_name;
      let hours;
      let procedures;
      let products;
      let status;
      let blueprintsId;
      let is_default;
      let isSearched = search?.length > 1 ? search : '';
      if (isSearched) {
        currentpage = 1;
        setCurrentPage(1);
      }
      const response = await fetch(
        `${
          process.env.REACT_APP_BASE_URL
        }/facility/donor-center/bluePrints/${id}/get?page=${currentpage}&limit=${limit}&${
          order ? `sortOrder=${order}` : ''
        }&${sortName ? `sortName=${sortName}` : 'sortName='}&${
          statusDataText ? `status=${statusDataText.value}` : 'status='
        }${isSearched && `&keyword=${isSearched}`}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const responseDefault = await fetch(
        `${process.env.REACT_APP_BASE_URL}/facility/donor-center/bluePrints/${id}/get/default`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const res = await response.json();
      const resDefault = await responseDefault.json();
      let data2 = resDefault?.data?.map((item, index) => {
        blueprint_name = item?.donor_center_blueprints?.name;
        blueprintsId = item?.donor_center_blueprints?.id;
        const max = item?.shifts?.length;
        is_default = item?.donor_center_blueprints?.is_default;

        hours = `
        ${formatDateWithTZ(
          item?.shifts?.[0]?.start_time,
          'hh:mm a'
        )} - ${formatDateWithTZ(
          item?.shifts?.[max ? max - 1 : 0]?.end_time,
          'hh:mm a'
        )}`;

        if (item && item?.shifts) {
          const totalProceduresQty = item?.shifts.map((shift) => {
            if (shift.qty) {
              const sum = shift?.qty.reduce((acc, qtyObject) => {
                return acc + (qtyObject?.procedure_type_qty || 0);
              }, 0);
              return sum;
            }
            return 0;
          });

          const totalProductseQty = item?.shifts.map((shift) => {
            if (shift.qty) {
              const sumProducts = shift?.qty.reduce((acc, qtyObject) => {
                return acc + (qtyObject?.product_yield || 0);
              }, 0);
              return sumProducts;
            }
            return 0;
          });

          procedures = totalProceduresQty.reduce(
            (acc, value) => acc + value,
            0
          );
          products = totalProductseQty.reduce((acc, value) => acc + value, 0);
        }

        const staff_setup_array = item?.staff_setup?.map((items) => {
          return items.name;
        });
        status = item?.donor_center_blueprints?.is_active;
        return {
          blueprintsId,
          blueprint_name,
          hours,
          procedures,
          products,
          status,
          default: is_default,
          staff_setup: staff_setup_array ? staff_setup_array.join(',') : '',
        };
      });
      // if (res?.status === 'success') {
      let data = res?.data?.map((item, index) => {
        blueprint_name = item?.donor_center_blueprints?.name;
        blueprintsId = item?.donor_center_blueprints?.id;
        const max = item?.shifts?.length;

        is_default = item?.donor_center_blueprints?.is_default;
        const hours = `
        ${formatDateWithTZ(
          item?.shifts?.[0]?.start_time,
          'hh:mm a'
        )} - ${formatDateWithTZ(
          item?.shifts?.[max ? max - 1 : 0]?.end_time,
          'hh:mm a'
        )}`;

        if (item && item?.shifts) {
          const totalProceduresQty = item?.shifts?.map((shift) => {
            if (shift.qty) {
              const sum = shift?.qty?.reduce((acc, qtyObject) => {
                return acc + (qtyObject?.procedure_type_qty || 0);
              }, 0);
              return sum;
            }
            return 0;
          });

          const totalProductseQty = item?.shifts?.map((shift) => {
            if (shift.qty) {
              const sumProducts = shift?.qty.reduce((acc, qtyObject) => {
                return acc + (qtyObject?.product_yield || 0);
              }, 0);
              return sumProducts;
            }
            return 0;
          });

          procedures = totalProceduresQty.reduce(
            (acc, value) => acc + value,
            0
          );
          products = totalProductseQty.reduce((acc, value) => acc + value, 0);
        }

        // let staff_setup_qty = 0;
        const staff_setup_array = item?.staff_setup?.map((items) => {
          return items.name;
        });
        // staff_setup_qty = staff_setup_qty + '-Staff';
        status = item?.donor_center_blueprints?.is_active;
        return {
          blueprintsId,
          blueprint_name,
          hours,
          procedures,
          products,
          status,
          default: is_default,
          staff_setup: staff_setup_array ? staff_setup_array.join(',') : '',
        };
      });

      if (data2?.[0]) {
        data.splice(0, 0, data2?.[0]);
        setAccountData(data);
        setTotalRecords(res?.data?.count ? res?.data?.count + 1 : null);
      } else {
        setAccountData(data);
        setTotalRecords(res?.data?.count ? res?.data?.count + 1 : null);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching account data:', error);
    }
  };

  const handleConfirmationResolve = async () => {
    setShowConfirmationDialogResolve(false);

    let data = {};

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/accounts/${id}/duplicates/resolve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        }
      );
      const res = await response.json();
      if (res?.status === 'success') {
        setResolvedChecked(!resolvedChecked);
        toast.success('Duplicate resolved.');
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const makeDefault = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/facility/donor-center/makeDefault/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data?.status === 'success') {
        fetchAccountData();
        // toast.success('Duplicate resolved.');
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const makeDuplicate = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/facility/donor-center/duplicate/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      console.log('data', data);
      if (data?.status === 'success') {
        fetchAccountData();
        // toast.success('Duplicate resolved.');
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSort = (name) => {
    setSortName(name);
    setOrder(order === 'ASC' ? 'DESC' : 'ASC');
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Blueprints'}
        SearchValue={search}
        SearchOnChange={searchFieldChange}
        SearchPlaceholder={'Search'}
      />
      <TopTabsDonorCenters donorCenterId={id} hideSession={true} />
      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className={`d-flex gap-3 w-100`}>
              {/* {console.log(category_id)} */}
              {/* <div className="" style={{ width: '255px' }}>
                <div className="" style={{ width: '255px' }}>
                  <ReactDatePicker
                    dateFormat="MM/dd/yyyy"
                    className="custom-datepicker"
                    placeholderText="Date Range"
                    selected={effectiveDate}
                    onChange={(date) => {
                      setEffectiveDate(date);
                    }}
                  />
                </div>
              </div> */}
              <div className="" style={{ width: '255px' }}>
                <div className="" style={{ width: '255px' }}>
                  <SelectDropdown
                    placeholder={'Status'}
                    selectedValue={statusDataText}
                    defaultValue={statusDataText}
                    showLabel={statusDataText ? true : false}
                    name="Status"
                    removeDivider
                    onChange={(val) => {
                      setStatusDataText(val);
                    }}
                    options={[
                      {
                        label: 'Active',
                        value: true,
                      },
                      {
                        label: 'Inactive',
                        value: false,
                      },
                    ]}
                    // showLabel={true}
                    //   error={collectionOperationError}
                    //   onBlur={(e) => handleInputBlur(e, true)}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <div className="buttons">
          <Link to={`create`} className="btn btn-primary">
            Create Blueprint
          </Link>
        </div>
        <div className="mt-3">
          <TableList
            isLoading={isLoading}
            data={accountData}
            headers={tableHeaders}
            handleSort={handleSort}
            // sortName={sortName}
            optionsConfig={optionsConfig}
            showActionsLabel={true}
            // current={1}
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
      <SuccessPopUpModal
        title="Success!"
        message="Blueprint archived."
        modalPopUp={archiveSuccess}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        onConfirm={() => {
          setArchiveSuccess(false);
          fetchAccountData();
        }}
      />
      <section className={`popup full-section ${archivePopup ? 'active' : ''}`}>
        <div className="popup-inner">
          <div className="icon">
            <img src={ConfirmArchiveIcon} alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Confirmation</h3>
            <p>Are you sure you want to archive?</p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setArchivePopup(false);
                }}
              >
                No
              </button>
              <button className="btn btn-primary" onClick={() => archive()}>
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
      <section
        className={`popup full-section ${
          showConfirmationDialogResolve ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img src={ResolveImage} alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Resolve</h3>
            <p>Are you sure you want to merge?</p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmationDialogResolve(false)}
              >
                No
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleConfirmationResolve()}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
