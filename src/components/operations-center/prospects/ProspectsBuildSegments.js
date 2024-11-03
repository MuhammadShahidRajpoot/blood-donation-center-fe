import React, { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import styles from './index.module.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import SuccessPopUpModal from '../../common/successModal';
import Pagination from '../../common/pagination';
import TableList from '../../common/tableListing';
import SelectDropdown from '../../common/selectDropdown';
import TopBar from '../../common/topbar/index';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';

import moment from 'moment';
import DatePicker from '../../common/DatePicker';
import FormInput from '../../system-configuration/users-administration/users/FormInput';
import OrganizationalDropDown from '../../common/Organization/DropDown';
import OrganizationalPopup from '../../common/Organization/Popup';
import axios from 'axios';
import { Col } from 'react-bootstrap';

const initialDate = {
  startDate: null,
  endDate: null,
};

const ProspectsBuildSegments = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [limit, setLimit] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [driveBluePrint, setDriveBlueprint] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState('account_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [collectionOperation, setCollectionOperation] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const [selectedRows, setSelectedRows] = useState([]);
  const [role, setRole] = useState(null);
  // eslint-disable-next-line
  const [rolesData, setRolesData] = useState([]);
  //   const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState(initialDate);
  const location = useLocation();
  const [locationType, setLocationType] = useState(null);
  const [organizational_level_ids, setOrganizational_levels_ids] = useState([]);
  const [OLLabels, setOLLabels] = useState([]);
  const [state, setState] = useState({
    min_projection: null,
    max_projection: null,
    eligibility: null,
    distance: null,
    organizational_levels: null,
  });
  const navigate = useNavigate();
  function extractKeys(jsonObject) {
    return Object.keys(jsonObject).map((key) => parseInt(key));
  }
  const handleOrganizationalLevel = (payload) => {
    const organization_level_ids = extractKeys(payload);
    setOrganizational_levels_ids(organization_level_ids);
    setPopupVisible(false);
    setState({
      ...state,
      organizational_levels:
        typeof payload === 'string' ? payload : JSON.stringify(payload),
    });
  };
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    const value = { startDate: start, endDate: end };
    setDateRange(value);
  };
  const [isPopupVisible, setPopupVisible] = React.useState();
  const getStaffData = async () => {
    setIsLoading(true);
    const { data } = await axios.get(
      `${BASE_URL}/operations-center/prospects/build-segments?limit=${limit}&page=${currentPage}&${
        role?.value ? `&role=${role.value}` : ''
      }${
        collectionOperation?.value
          ? `&collection_operation=${collectionOperation.value}`
          : ''
      }&sortBy=${
        sortBy === 'collection_operations' ? 'collection_operation' : sortBy
      }&sortOrder=${sortOrder}&start_date=${
        dateRange?.startDate && dateRange?.startDate !== ''
          ? moment(dateRange?.startDate).startOf('day').toISOString()
          : ''
      }&end_date=${
        dateRange?.endDate && dateRange?.endDate !== ''
          ? moment(dateRange?.endDate).endOf('day').toISOString()
          : ''
      }&min_projection=${
        state?.min_projection && state?.min_projection !== ''
          ? state?.min_projection
          : ''
      }&max_projection=${
        state?.max_projection && state?.max_projection !== ''
          ? state?.max_projection
          : ''
      }&eligibility=${
        state?.eligibility && state?.eligibility !== ''
          ? state?.eligibility
          : ''
      }&distance=${
        state?.distance && state?.distance !== '' ? state?.distance : ''
      }&location_type=${
        locationType?.value && locationType?.value !== ''
          ? locationType?.value
          : ''
      }&organizational_levels=${
        state?.organizational_levels && state?.organizational_levels !== ''
          ? state?.organizational_levels
          : ''
      }`,
      {
        headers: {
          method: 'GET',
          authorization: `Bearer ${bearerToken}`,
        },
      }
    );
    setIsLoading(false);
    setDriveBlueprint(
      data?.data?.map((x) => ({
        ...x,
        projection: `${x?.procedure_type_qty ?? 0} / ${x?.product_yield ?? 0}`,
        last_eligibility: x?.last_eligibility
          ? moment(x?.last_eligibility).format('MM-DD-YYYY')
          : '-',
      }))
    );
    setTotalRecords(data?.count);
  };
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      getStaffData();
    } else {
      setDriveBlueprint([]);
      setState({
        min_projection: null,
        max_projection: null,
        eligibility: null,
        distance: null,
        organizational_levels: '',
      });
    }
  }, [
    currentPage,
    limit,
    BASE_URL,
    role,
    collectionOperation,
    sortBy,
    sortOrder,
    dateRange.startDate,
    dateRange.endDate,
    state.max_projection,
    state.min_projection,
    state.eligibility,
    locationType?.label,
    state.organizational_levels,
    organizational_level_ids,
    state.distance,
  ]);
  const getRolesDropdown = async () => {
    try {
      const result = await fetch(`${BASE_URL}/contact-roles`, {
        method: 'GET',
        headers: { authorization: `Bearer ${bearerToken}` },
      });
      const data = await result.json();
      let formatRoles = data?.data?.map((role) => ({
        label: role?.name,
        value: role?.id,
      }));
      setRolesData([...formatRoles]);
    } catch (error) {
      console.error('Error searching data:', error);
    }
  };

  useEffect(() => {
    getRolesDropdown();
  }, []);
  const handleSort = (column) => {
    if (sortBy === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortBy('');
        setSortOrder('');
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleShowConfirmation = () => {
    if (!selectedRows?.length > 0) {
      toast.dismiss();
      return toast.warn(
        'Please apply filters and select blueprints for creating a message'
      );
    }
    if (!location?.state?.name || !location?.state?.description) {
      toast.dismiss();
      return toast.error(
        'One or more prospect details missing please start from create prospect screen.'
      );
    }
    navigate(OS_PROSPECTS_PATH.CREATE_MESSAGE, {
      state: {
        name: location?.state?.name,
        description: location?.state?.description,
        is_active: location?.state?.is_active,
        id: location?.state?.id || null,
        blueprints: selectedRows,
        start_date: dateRange?.startDate,
        end_date: dateRange?.endDate,
        min_projection: state?.min_projection ?? null,
        max_projection: state?.max_projection ?? null,
        eligibility: state?.eligibility ?? null,
        distance: state?.distance ?? null,
        location_type: locationType?.length > 0 ? locationType[0]?.value : null,
        organizational_level_id: organizational_level_ids,
      },
    });
  };
  useEffect(() => {
    if (!role?.value) setRole(null);
    if (!collectionOperation?.value) setCollectionOperation(null);
  }, [role, collectionOperation]);

  useEffect(() => {
    if (location?.state?.id) {
      getSingleProspectFilters();
    }
  }, [location?.state?.id]);

  const getSingleProspectFilters = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/operations-center/prospects/prospects-filters/${location?.state?.id}`,
        {
          method: 'GET',
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      );
      const data = await result.json();
      setState({
        max_projection: data?.data?.max_projection,
        min_projection: data?.data?.min_projection,
        eligibility: data?.data?.eligibility,
        distance: data?.data?.distance,
      });
      setDateRange({
        startDate: new Date(data?.data?.start_date),
        endDate: new Date(data?.data?.end_date),
      });

      const LocationsType = [
        { value: 'Inside / Outside', label: 'Combination' },
        { value: 'Inside', label: 'Inside' },
        { value: 'Outside', label: 'Outside' },
      ];
      const actualLocation = LocationsType.filter(
        (x, i) => x.value === data?.data?.location_type
      );
      if (actualLocation && actualLocation.length > 0) {
        setLocationType(actualLocation);
      }
    } catch (error) {
      console.error('Error searching data:', error);
    }
  };
  const tableHeaders = [
    { name: 'account_name', label: 'Account', width: '15%', sortable: true },
    {
      name: 'location_name',
      label: 'Location',
      width: '15%',
      sortable: true,
    },
    {
      name: 'projection',
      label: 'Projection',
      width: '6%',
      sortable: false,
    },
    {
      name: 'last_drive',
      label: 'Last Drive',
      width: '7%',
      sortable: true,
    },
    {
      name: 'next_drive',
      label: 'Next Drive',
      width: '7%',
      sortable: true,
    },
    {
      name: 'last_eligibility',
      label: 'Last Eligibility',
      width: '7%',
      sortable: true,
    },
    {
      name: 'cp_name',
      label: 'CP Name',
      width: '10%',
      sortable: true,
    },
    {
      name: 'cp_email',
      label: 'CP Email',
      width: '20%',
      sortable: true,
    },
    {
      name: 'cp_mobile',
      label: 'CP Mobile',
      width: '20%',
      sortable: true,
    },
    {},
  ];
  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Prospect',
      class: 'active-label',
      link: OS_PROSPECTS_PATH.LIST,
    },
    {
      label: `${location.state.id ? 'Duplicate Prospects' : 'Create Prospect'}`,
      class: 'active-label',
      link: `${
        location.state.id
          ? OS_PROSPECTS_PATH.DUPLICATE
          : OS_PROSPECTS_PATH.CREATE
      }`,
    },
    {
      label: 'Build Segment',
      class: 'active-label',
      link: OS_PROSPECTS_PATH.BUILD_SEGMENTS,
    },
  ];

  const handleLocationType = (value) => {
    setLocationType(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  return (
    <div className="mainContent">
      <TopBar BreadCrumbsData={BreadcrumbsData} BreadCrumbsTitle={'Prospect'} />
      <div className="filterBar">
        <div className="filterInner flex-column">
          <div className="w-100 d-flex justify-content-between align-items-baseline">
            <h2>Filters</h2>
            <div className={`filter ${styles.w80} py-3 mt-2`}>
              <form
                className={styles.prospects}
                style={{ paddingBottom: 'unset' }}
              >
                <div className="formGroup w-100 border-0 p-0 m-0">
                  <div className="row justify-content-end row-gap-2 w-100">
                    <Col lg={3} sm={12} xs={12}>
                      <DatePicker
                        selected={dateRange.startDate}
                        onChange={handleDateChange}
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        placeholderText="Target Date"
                        selectsRange
                        isClearable
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <FormInput
                        type="number"
                        label={'Min Projection'}
                        name={'min_projection'}
                        required={false}
                        isWidth={true}
                        value={state?.min_projection}
                        onChange={handleInputChange}
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <FormInput
                        type="number"
                        label={'Max Projection'}
                        name={'max_projection'}
                        required={false}
                        isWidth={true}
                        value={state.max_projection}
                        onChange={handleInputChange}
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <FormInput
                        className={'mb-0'}
                        type="number"
                        label={'Eligibility'}
                        name={'eligibility'}
                        required={false}
                        isWidth={true}
                        value={state.eligibility}
                        onChange={handleInputChange}
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <FormInput
                        className={'mb-0'}
                        type="number"
                        label={'Distance'}
                        name={'distance'}
                        required={false}
                        isWidth={true}
                        value={state.distance}
                        onChange={handleInputChange}
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <SelectDropdown
                        styles={{ root: `w-100 ${styles.unset_min_width}` }}
                        placeholder={'Location Type'}
                        defaultValue={locationType}
                        selectedValue={locationType}
                        removeDivider
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                        showLabel
                        onChange={handleLocationType}
                        options={[
                          { value: 'Inside / Outside', label: 'Combination' },
                          { value: 'Inside', label: 'Inside' },
                          { value: 'Outside', label: 'Outside' },
                        ]}
                      />
                    </Col>
                    <Col lg={3} sm={12} xs={12}>
                      <OrganizationalDropDown
                        labels={OLLabels}
                        handleClick={() => setPopupVisible(true)}
                        handleClear={() => {
                          setState({
                            ...state,
                            organizational_levels: '',
                          });
                          setOLLabels('');
                        }}
                        disabled={!dateRange?.startDate || !dateRange.endDate}
                      />
                    </Col>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <TableList
          isLoading={isLoading}
          data={driveBluePrint}
          headers={tableHeaders}
          handleSort={handleSort}
          sortOrder={sortOrder}
          checkboxValues={selectedRows}
          handleCheckboxValue={(row) => row.id}
          handleCheckbox={setSelectedRows}
        />

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
        <div className="form-footer">
          <button
            type="button"
            className={` ${`btn btn-primary`}`}
            onClick={handleShowConfirmation}
            //   disabled={loading}
          >
            Create Message
          </button>
        </div>

        <SuccessPopUpModal
          title="Success!"
          message={'Members assigned.'}
          modalPopUp={showSuccessMessage}
          isNavigate={false}
          // redirectPath={-1}
          showActionBtns={true}
          isArchived={false}
          setModalPopUp={setShowSuccessMessage}
        />
        <SuccessPopUpModal
          title="Confirmation"
          message={'Unsaved changes will be lost. Do you want to continue?'}
          modalPopUp={showCancelModal}
          setModalPopUp={setShowCancelModal}
          showActionBtns={false}
          isArchived={true}
          archived={() => navigate(-1)}
          acceptBtnTitle="Ok"
          rejectBtnTitle="Cancel"
        />
        <OrganizationalPopup
          value={state.organizational_levels}
          showConfirmation={isPopupVisible}
          onCancel={() => setPopupVisible(false)}
          onConfirm={handleOrganizationalLevel}
          heading={'Organization Level'}
          setLabels={setOLLabels}
          showDonorCenters
        />
      </div>
    </div>
  );
};
export default ProspectsBuildSegments;
