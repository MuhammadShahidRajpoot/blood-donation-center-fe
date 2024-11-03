import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import { Link, useNavigate } from 'react-router-dom';
import SvgComponent from '../../../common/SvgComponent';
import TableList from './TableListing';
import Pagination from '../../../common/pagination';
import {
  makeAuthorizedApiRequest,
  makeAuthorizedApiRequestAxios,
} from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_DRIVES_PATH,
} from '../../../../routes/path';
import Permissions from '../../../../enums/OcPermissionsEnum.js';
import CheckPermission from '../../../../helpers/CheckPermissions';
import moment from 'moment';
import { API } from '../../../../api/api-routes.js';
import ConfirmArchiveIcon from '../../../../assets/images/ConfirmArchiveIcon.png';
import SuccessPopUpModal from '../../../common/successModal/index.js';
import DrivesFilter from './filters/DrivesFilter.jsx';
import exportImage from '../../../../assets/images/exportImage.svg';
import { downloadFile } from '../../../../utils/index.js';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone.js';
import jwt from 'jwt-decode';
import axios from 'axios';
import LinkVehiclesmodel from './create/linkVehiclesmodel.js';
import { getSingleDriveData } from './create/helpers/index.js';
import { CalculateSlots } from './create/shift/calculate_slots.js';

function DriveList() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [sortBy, setSortBy] = useState('account');
  const [childSortBy, setChildSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [archivePopup, setArchivePopup] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);
  // const [filterApplied, setFilterApplied] = useState({});
  const [filterApplied, setFilterApplied] = useState({});
  const [archiveId, setArchiveId] = useState(false);
  const [reductionStep, setReductionStep] = useState('0.5');
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [exportType, setExportType] = useState('filtered');
  // const [operationStatus, setOperationStatus] = React.useState([]);
  const [userData, setUserData] = useState({});
  const [warningModalPopUp, setWarningModalPopUp] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [vehiclesModel, setVehiclesModel] = useState(false);
  const [linkedDrive, setlinkedDrive] = useState(null);
  const [linkableVehicles, setLinkAbleVehicles] = useState(null);
  const [coordinatesA, setCoordinatesA] = useState(0);
  const [coordinatesB, setCoordinatesB] = useState(0);
  const [bookingRules, setBookingRules] = useState({});
  const [updatedLinkData, setUpdatedLinkData] = useState([]);
  const [shiftSlots, setShiftSlots] = useState();
  // const [accountId, setAccountId] = useState(null);
  const [selectedLinkDrive, setSelectedLinkDrive] = useState(null);
  const initialShift = [
    {
      id: '',
      startTime: '',
      endTime: '',
      projections: [
        { projection: 0, procedure: '25', product: '25', staffSetup: [] },
      ],
      staffSetupOptions: [],
      additionalStaffOptions: [],
      vehicleOptions: [],
      resources: [],
      devices: [],
      staffBreak: false,
      breakStartTime: '',
      breakEndTime: '',
      reduceSlot: false,
      reduction: 0,
      minOEF: 0,
      maxOEF: 0,
      minStaff: [0],
      maxStaff: [0],
    },
  ];

  const [driveA, setDriveA] = useState(initialShift);
  const [driveB, setDriveB] = useState(initialShift);

  // useEffect(() => {
  //   if (currentDrive?.drive_id && linkedDriveDetails?.drive_id) {
  //     setLinkedShiftDetails();
  //   }
  // }, [linkedDriveDetails, currentDrive]);

  useEffect(() => {
    if (selectedLinkDrive?.length == 1) {
      if (driveA?.drive_id && driveB?.drive_id) {
        setLinkedShiftDetails();
      }
      // getLinkedShiftDetails(selectedLinkDrive[0]);
    }
  }, [selectedLinkDrive]);

  // useEffect(() => {}, [updatedLinkData]);
  // useMemo(() => {
  //   // Loop Over Each Projection
  //   console.log('inside useMemo');

  // }, [
  //   updatedLinkData?.[0]?.startTime,
  //   updatedLinkData?.[0]?.endTime,
  //   updatedLinkData?.[0]?.reduceSlot,
  //   updatedLinkData?.[0]?.breakStartTime,
  //   updatedLinkData?.[0]?.breakEndTime,
  //   updatedLinkData?.[0]?.reduction,
  //   updatedLinkData?.[0]?.projections,
  //   updatedLinkData?.[0]?.staffBreak,
  // ]);

  // console.log({ shiftSlots });

  const setLinkedShiftDetails = async () => {
    try {
      // console.log('driveB?.drive_id', driveB?.drive_id);
      const responseA = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles/${driveA?.drive_id}`
      );
      const dataA = await responseA.json();

      const responseB = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles/${driveB?.drive_id}`
      );
      const dataB = await responseB.json();
      console.log({ dataA, dataB });
      // setLinkedDriveId(data && data?.data && data?.data?.drives?.id);

      let procedureItem = {
        label: dataB?.data?.projection?.procedure_type?.name,
        procedure_duration:
          dataB?.data?.projection?.procedure_type?.procedure_duration,
        quantity: dataB?.data?.projection?.procedure_type_qty,
        value: dataB?.data?.projection?.procedure_type?.id,
      };
      // let productItem = {};
      let productItem = {
        id: dataB?.data?.products.id?.toString(),
        name: dataB?.data?.products?.name,
        quantity: dataB?.data?.projection?.product_yield,
        yield: dataB?.data?.projection?.product_yield,
      };
      // // let projectionItem = {};
      let projectionItem = {
        label: dataB?.data?.projection?.procedure_type?.name,
        procedure_duration:
          dataB?.data?.projection?.procedure_type?.procedure_duration.toString(),
        value: dataB?.data?.projection?.procedure_type?.id.toString(),
      };

      let staffSetupItem = dataB?.data?.staff?.map((item) => {
        return {
          beds: item?.beds,
          concurrent_beds: item?.concurrent_beds,
          id: item?.id.toString(),
          name: item?.name,
          qty: item?.staff_configuration[0]?.qty,
          stagger: item?.stagger_slots,
        };
      });
      let projectionData = [];

      projectionData.push({
        procedure: procedureItem,
        product: productItem,
        projection: projectionItem,
        staffSetup: staffSetupItem,
      });

      // // const newshifts = shifts
      const newShift = shift;
      newShift.projections = projectionData;

      newShift.devices =
        dataB?.data?.devices?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];

      newShift.resources =
        dataB?.data?.vehicles?.map((item) => {
          return { id: item.id.toString(), name: item.name };
        }) || [];

      // shift = newShift;
      // const newShifts = [];
      // newShifts.push(newShift);
      setUpdatedLinkData(newShift);
      console.log({ newShift });
      const array = [];
      array.push(newShift);
      console.log(reductionStep);
      CalculateSlots(
        array,
        newShift,
        1,
        setReductionStep,
        bookingRules.maximum_draw_hours_allow_appt,
        setShiftSlots
      );

      // console.log({ newShift });
      // setShifts(newShifts);
      // setLinkedSettings(newShifts);
    } catch (err) {
      console.log(err);
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };
  console.log({ updatedLinkData });
  useEffect(() => {
    console.log({ shiftSlots });
    if (shiftSlots) {
      const data = {
        ...updatedLinkData,
        slots: shiftSlots,
        driveA: driveA?.drive_id,
        driveB: driveB?.drive_id,
      };
      submitLinkData(data);
    }
  }, [shiftSlots]);

  const submitLinkData = async (data) => {
    try {
      console.log({ data });
      const res = await makeAuthorizedApiRequestAxios(
        'POST',
        `${BASE_URL}/drives/linkvehicles`,
        data
      );
      if (res?.data?.status_code === 201) {
        fetchAll(filterApplied);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err);
    }
  };

  console.log({ updatedLinkData });
  // const [driveDate, setDriveDate] = useState(new Date());
  const [shift, setShift] = useState();
  const [locationId, setLocationId] = useState();
  const navigate = useNavigate();
  const jwtToken = localStorage.getItem('token');

  const getUSerData = async () => {
    const decodeToken = jwt(jwtToken);
    const id = decodeToken?.id;
    if (id) {
      const result = await API.operationCenter.drives.getUserData(id);
      if (result?.status === 404) {
        return toast.error('User with this id does not exist', {
          autoClose: 3000,
        });
      }
      if (result?.status === 200) {
        let { data } = result;
        setUserData({
          id: data?.data?.id,
          is_recruiter: data?.data?.role?.is_recruiter,
        });
      } else {
        toast.error('Error Fetching User Details', { autoClose: 3000 });
      }
    } else {
      toast.error('Error getting user Details', { autoClose: 3000 });
    }
  };
  useEffect(() => {
    getUSerData();
    fetchBookingRules();
  }, []);

  const fetchBookingRules = async () => {
    const { data } =
      await API.systemConfiguration.operationAdministrations.bookingDrives.bookingRules.getBookingRules();
    setBookingRules(data?.data || {});
  };

  // useEffect(() => {
  //   if (driveDate) getLinkableVehicles();
  // }, [accountId, driveDate]);
  const getLinkableVehicles = async (date, id) => {
    try {
      setLinkAbleVehicles(null);
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles?date=${moment(date).format(
          'YYYY-MM-DD'
        )}&id=${id}`
      );
      let array = [];
      const data = await response.json();
      console.log('api returned data', data);
      data?.data?.map((item, index) => {
        let date;
        let account;
        let location;
        let locationId;
        let start_time;
        let end_time;
        let vehicles_name = null;
        let staffSetup;
        let total_time;
        let id;

        if (
          item?.drives?.shifts?.length &&
          item?.drives?.account?.name &&
          item?.drives?.location?.name &&
          item?.drives?.shifts?.[0]?.id
        ) {
          console.log('i am in if', item.location_id);
          setLocationId(item?.location_id);
          date = item?.date;
          id = item?.drives?.shifts?.[0]?.id;
          account = item?.drives?.account?.name;
          locationId = item?.drives?.location?.id;
          location = item?.drives?.location.name;
          // let long = item?.drives?.shifts?.length;
          start_time = formatDateWithTZ(
            item?.drives?.shifts?.[0]?.start_time,
            'hh:mm a'
          );
          end_time = formatDateWithTZ(
            item?.drives?.shifts?.[0]?.end_time,
            'hh:mm a'
          )
            ? formatDateWithTZ(item?.drives?.shifts?.[0]?.end_time, 'hh:mm a')
            : formatDateWithTZ(item?.drives?.shifts?.[0]?.end_time, 'hh:mm a');

          total_time = `${start_time} - ${end_time}`;
          let sum = 0;
          staffSetup = item?.drives?.staff_config?.map((ds, iii) => {
            return (sum += ds?.qty);
          });
          staffSetup = staffSetup + '-staff';
          for (let veh of item?.drives?.vehicles || []) {
            vehicles_name = vehicles_name
              ? vehicles_name +
                (veh && veh.name !== undefined ? ', ' + veh.name : '')
              : veh && veh.name !== undefined
              ? veh.name
              : null;
          }
          let data = {
            id,
            date,
            account,
            location,
            locationId,
            start_time,
            end_time,
            vehicles_name,
            staffSetup,
            total_time,
          };
          array.push(data);
        }
      });

      console.log('checking ', array);
      if (array?.length) {
        setLinkAbleVehicles(array);
      }
    } catch (err) {
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };

  const getAddressCoordinate = async (id) => {
    try {
      console.log('id 00000000000000000  ', id);
      console.log('getDate', id);
      const getDate = await axios.get(`${BASE_URL}/drives/location/${id}`);
      console.log('now cordinate in func ', getDate);
      const data = getDate?.data?.data?.coordinates;
      setCoordinatesA(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLink = async (rowData) => {
    // console.log({ rowData });
    if (rowData?.start_time && rowData?.end_time) {
      // if (driveDate) {
      // console.log('in');
      console.log({ rowData });
      await getLinkableVehicles(rowData.date, rowData?.id);
      const DriveA = await getSingleDriveData(rowData?.id);
      console.log({ DriveA });
      setDriveA(DriveA);
      // }
      console.log('in handle Link:::::::', rowData, locationId);
      // setAccountId(rowData.account.id);
      // if (locationId) {
      await getAddressCoordinate(rowData?.location_id);
      // }
      // console.log('cordinate A=========----------- ', coordinatesA);
      // setDriveDate(rowData.drive.date);
      setShift({
        start_time: rowData?.start_time,
        end_time: rowData?.end_time,
      });
      // console.log('drive date 1', driveDate);
      setVehiclesModel(true);

      // console.log('drive date:    ', linkableVehicles);
    }
  };
  console.log({ shift });

  const handleFilters = (filters) => {
    setFilterApplied(filters);
    Object.keys(filters).forEach((key) => {
      if (!filters[key]) delete filters[key];
      else if (key.includes('date')) filters[key] = filters[key].toISOString();
    });
    // setFilterApplied(filters);
  };

  const archive = async () => {
    try {
      const response = await API.operationCenter.drives.archive(archiveId);
      const { data } = response;
      const { status_code: status } = data;
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

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Operations',
      class: 'disable-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'Drive',
      class: 'active-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
  ];

  const [tableHeaders, setTableHeaders] = useState([
    {
      name: 'link_my',
      sortable: false,
    },
    {
      name: 'date',
      label: 'Operation Date',
      sortable: true,
    },
    {
      name: 'account_name',
      label: 'Account',
      sortable: true,
    },
    {
      name: 'location_name',
      label: 'Location',
      sortable: true,
    },
    {
      name: 'projection',
      label: 'Projection',
      sortable: true,
    },
    {
      name: 'hours',
      label: 'Hours',
      sortable: true,
    },
    {
      name: 'cp_name',
      label: 'Primary CP',
      sortable: true,
    },
    {
      name: 'cp_phone',
      label: 'CP Phone',
      sortable: false,
    },
    {
      name: 'cp_email',
      label: 'CP Email',
      minWidth: '15rem',
      width: '15rem',
      sortable: false,
    },
    {
      label: 'Status',
      name: 'status',
      sortable: true,
    },
  ]);

  const checkboxTableItems = [
    'Operation Date',
    'Account',
    'Location',
    'Projection',
    'Hours',
    'Primary CP',
    'CP Phone',
    'CP Email',
    'Status',
  ];
  const handleAction = (rowData) => {
    if (rowData?.account_is_archived === true) {
      setWarningModalPopUp(true);
      setWarningMessage('You cannot copy it. Account has been archived');
    } else if (rowData?.account_is_active === false) {
      setWarningModalPopUp(true);
      setWarningMessage(`${rowData?.account_name} is not an active account`);
    } else if (userData?.is_recruiter === true) {
      if (rowData?.account_recruiter_id == userData?.id) {
        navigate(
          `/operations-center/operations/drives/create?accountId=${
            rowData?.account_id
          }&date=${moment(rowData?.date).format('MM-DD-YYYY')}`
        );
      } else {
        setWarningModalPopUp(true);
        setWarningMessage(
          'You are not a recruiter for this drive. Unfortunately, You cannot copy it.'
        );
      }
    } else {
      navigate(
        `/operations-center/operations/drives/create?accountId=${
          rowData?.account_id
        }&date=${moment(rowData?.date).format('MM-DD-YYYY')}`
      );
    }
  };
  const optionsConfig = [
    CheckPermission([Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.READ]) && {
      label: 'View',
      path: (rowData) => `${rowData?.id}/view/about`,
    },
    CheckPermission([
      Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.WRITE,
    ]) && {
      label: 'Edit',
      path: (rowData) => `${rowData?.id}/edit`,
      action: (rowData) => {},
    },
    CheckPermission([
      Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.COPY_DRIVE,
    ]) && {
      label: 'Copy Drive',
      action: (rowData) => handleAction(rowData),
    },
    CheckPermission([
      Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.LINK_DRIVE,
    ]) && {
      label: 'Link Drive',
      // path: (rowData) => `#`,
      action: (rowData) => handleLink(rowData),
    },
    CheckPermission([
      Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.ARCHIVE,
    ]) && {
      label: 'Archive',
      action: (rowData) => {
        setArchiveId(rowData?.id);
        setArchivePopup(true);
      },
    },
  ].filter(Boolean);

  useEffect(() => {
    fetchAll(filterApplied);
  }, [sortBy, sortOrder, currentPage, limit, searchText, filterApplied]);
  const handleSort = (column, child) => {
    if (sortBy === column) {
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        setSortOrder('ASC');
      } else {
        setSortOrder('ASC');
        setSortBy('');
        setChildSortBy(null);
      }
    } else {
      setSortBy(column);
      child ? setChildSortBy(child) : setChildSortBy(null);
      setSortOrder('ASC');
    }
  };
  const sortDataByPrimaryCp = () => {
    const sortedArray = [...rows].sort((a, b) => {
      const comparison = a.primaryCP.localeCompare(b.primaryCP);
      return sortOrder === 'DESC' ? comparison * -1 : comparison;
    });
    return sortedArray;
  };

  const fetchAll = async (filterApplied) => {
    try {
      const {
        account,
        location,
        min_projection,
        max_projection,
        start_time,
        end_time,
        end_date,
        start_date,
        status,
        promotion,
        organizational_levels,
        day,
      } = filterApplied || {};
      if (sortBy == 'primaryCP') {
        return setRows(sortDataByPrimaryCp);
      }
      let start;
      if (start_time) {
        start = moment(start_time?.label ?? start_time, 'h:mmA').format(
          'HH:mm:ss'
        );
      }
      let end;
      if (end_time) {
        end = moment(end_time?.label ?? end_time, 'h:mmA').format('HH:mm:ss');
      }
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}&keyword=${searchText}&childSortBy=${childSortBy}${
          account ? `&account=${account?.value ?? account}` : ''
        }
        ${location ? `&location=${location?.value ?? location}` : ''}${
          min_projection ? `&min_projection=${min_projection}` : ''
        }${max_projection ? `&max_projection=${max_projection}` : ''}${
          start_time ? `&shiftStart=${start}` : ''
        }${end_time ? `&shiftEnd=${end}` : ''}${
          status ? `&status=${JSON.stringify(status)}` : ''
        }${promotion ? `&promotion=${JSON.stringify(promotion)}` : ''}${
          organizational_levels
            ? `&organizational_levels=${organizational_levels}`
            : ''
        }${start_date ? `&startDate=${start_date}` : ''}${
          end_date ? `&endDate=${end_date}` : ''
        }${day ? `&day=${JSON.stringify(day)}` : ''}${
          exportType ? `&exportType=${exportType}` : ''
        }${downloadType ? `&downloadType=${downloadType}` : ''}`
      );
      setDownloadType(null);
      const data = await response.json();
      setRows(data?.data || []);
      setTotalRecords(data?.count);
      const responseURLExport = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/export/url?sortOrder=${sortOrder}&sortBy=${sortBy}&page=${currentPage}&limit=${limit}&keyword=${searchText}&childSortBy=${childSortBy}${
          account ? `&account=${account?.value ?? account}` : ''
        }
        ${location ? `&location=${location?.value ?? location}` : ''}${
          min_projection ? `&min_projection=${min_projection}` : ''
        }${max_projection ? `&max_projection=${max_projection}` : ''}${
          start_time ? `&shiftStart=${start}` : ''
        }${end_time ? `&shiftEnd=${end}` : ''}${
          status ? `&status=${JSON.stringify(status)}` : ''
        }${promotion ? `&promotion=${JSON.stringify(promotion)}` : ''}${
          organizational_levels
            ? `&organizational_levels=${organizational_levels}`
            : ''
        }${start_date ? `&startDate=${start_date}` : ''}${
          end_date ? `&endDate=${end_date}` : ''
        }${day ? `&day=${JSON.stringify(day)}` : ''}${
          exportType ? `&exportType=${exportType}` : ''
        }${downloadType ? `&downloadType=${downloadType}` : ''}`
      );
      const dataExport = await responseURLExport.json();
      if (dataExport?.url) {
        await downloadFile(dataExport?.url);
      }
    } catch (error) {
      console.log({ error });
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Drives'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
      />
      <div className="mainContentInner crm">
        <DrivesFilter
          setLoading={setIsLoading}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          fetchAllFilters={handleFilters}
          // account={accounts}
          // status={operationStatus}
          // promotions={promotions}
        />
        <div className="buttons d-flex align-items-center gap-3">
          <div className="exportButton">
            <div
              className="optionsIcon"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <SvgComponent name={'DownloadIcon'} /> <span>Export Data</span>
            </div>
            <ul className="dropdown-menu">
              <li>
                <Link
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowExportDialogue(true);
                    setDownloadType('PDF');
                  }}
                >
                  PDF
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowExportDialogue(true);
                    setDownloadType('CSV');
                  }}
                >
                  CSV
                </Link>
              </li>
            </ul>
          </div>
          {CheckPermission([
            Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.WRITE,
          ]) && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('create')}
            >
              Create Drive
            </button>
          )}
        </div>
        <TableList
          isLoading={isLoading}
          data={rows}
          hideActionTitle={true}
          headers={tableHeaders}
          handleSort={handleSort}
          optionsConfig={optionsConfig}
          setTableHeaders={setTableHeaders}
          checkboxTableItems={checkboxTableItems}
        />
        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
      <SuccessPopUpModal
        title="Success!"
        message="Drive archived."
        modalPopUp={archiveSuccess}
        setModalPopUp={setArchiveSuccess}
        showActionBtns={true}
        onConfirm={() => {
          setArchiveSuccess(false);
          fetchAll();
        }}
      />
      <SuccessPopUpModal
        title={'Warning'}
        message={warningMessage}
        modalPopUp={warningModalPopUp}
        setModalPopUp={setWarningModalPopUp}
        showActionBtns={true}
        onConfirm={() => {
          setWarningModalPopUp(false);
          setWarningMessage('');
        }}
        driveWarningIconStyle={true}
        customSVGIcon={<SvgComponent name={'warningCross'} />}
      />
      <LinkVehiclesmodel
        setModal={setVehiclesModel}
        modal={vehiclesModel}
        shift={shift}
        setCoordinatesB={setCoordinatesB}
        coordinatesB={coordinatesB}
        coordinatesA={coordinatesA}
        bookingRules={bookingRules}
        setCoordinatesA={setCoordinatesA}
        setlinkedDrive={setlinkedDrive}
        linkedDrive={linkedDrive}
        staffShareRequired={0}
        // selectedItems={setSelectedLinkDrive}
        shareStaffData={linkableVehicles}
        selectedLinkDrive={selectedLinkDrive}
        setSelectedLinkDrive={setSelectedLinkDrive}
        setDriveA={setDriveA}
        driveA={driveA}
        driveB={driveB}
        setDriveB={setDriveB}
      />
      ;
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
        className={`exportData popup full-section ${
          showExportDialogue ? 'active' : ''
        }`}
      >
        <div className="popup-inner">
          <div className="icon">
            <img src={exportImage} className="bg-white" alt="CancelIcon" />
          </div>
          <div className="content">
            <h3>Export Data</h3>
            <p>
              Select one of the following option to download the {downloadType}
            </p>
            <div className="content-inner">
              <div className="radioChecks form-check">
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'filtered'}
                  value={'filtered'}
                  onChange={(e) => {
                    setExportType(e.target.value);
                  }}
                  className="form-check-input"
                />
                <label
                  className="form-check-label"
                  style={{ marginLeft: '4px' }}
                >
                  <span>Filtered Results</span>
                </label>
              </div>
              <div className="radioChecks form-check">
                <input
                  type="radio"
                  name="exportType"
                  checked={exportType === 'all'}
                  value={'all'}
                  onChange={(e) => {
                    setExportType(e.target.value);
                  }}
                  className="form-check-input"
                />
                <label className="form-check-label">
                  <span>All Data</span>
                </label>
              </div>
            </div>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setShowExportDialogue(false)}
              >
                Cancel
              </button>
              {downloadType === 'PDF' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsLoading(true);
                    if (exportType === 'filtered') {
                      fetchAll(filterApplied);
                    } else {
                      const isFilterApplied = Object.values(filterApplied)
                        ? filterApplied
                        : {};
                      fetchAll(isFilterApplied);
                    }
                    setShowExportDialogue(false);
                  }}
                >
                  Download
                </button>
              )}

              {downloadType === 'CSV' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsLoading(true);
                    if (exportType === 'filtered') {
                      fetchAll(filterApplied);
                    } else {
                      const isFilterApplied = Object.values(filterApplied)
                        ? filterApplied
                        : {};
                      fetchAll(isFilterApplied);
                    }
                    setShowExportDialogue(false);
                  }}
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DriveList;
