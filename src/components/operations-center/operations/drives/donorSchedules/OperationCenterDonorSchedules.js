import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './index.scss';
import Styles from './index.module.scss';
import { toast } from 'react-toastify';
import moment from 'moment';
import AddSlotModal from './AddSlot';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import SvgComponent from '../../../../common/SvgComponent';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import AddAccountsModal from './AddContactModal';
import { CSVLink } from 'react-csv';
import exportImage from '../../../../../assets/images/exportImage.svg';
import JsPDF from 'jspdf';
import SuccessPopUpModal from '../../../../common/successModal';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import ClockIcon from '../../../../../assets/clock.svg';

// import { API } from '../../../../api/api-routes.js';
// import { API } from '../../../../../api/api-routes.js';

export default function OperationCenterDonorSchedules() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [donorSchedules, setDonorSchedules] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [startTimeOption, setStartTimeOption] = useState(null);
  const [endTimeOption, setEndTimeOption] = useState(null);
  const [shiftSlots, setShiftSlots] = useState(null);
  const [shifts, setShifts] = useState(null);
  const [newDonorSchedules, setNewDonorSchedule] = useState(null);
  const [indexId, setIndexId] = useState(0);
  const [donorPortalCheck, setDonorPortalCheck] = useState(false);
  const [addAccountsModal, setAddAccountsModal] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [showExportDialogue, setShowExportDialogue] = useState(false);
  const [csvData, setCsvData] = useState([]);
  // const [isFetching] = useState(false);
  const [csvPDFData, setCsvPDFData] = useState([
    'Slot Start Time,First Name,Last Name,Donor Id',
  ]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [accountsSearchText, setAccountsSearchText] = useState('');
  const [accountRows, setAccountRows] = useState([]);
  const [dataItem, setdataItem] = useState();
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showModel, setShowModel] = useState(false);

  const headers = [
    {
      key: 'slot_start_time',
      label: 'Slot Start Time',
    },
    {
      key: 'first_name',
      label: 'First Name',
    },
    {
      key: 'last_name',
      label: 'Last Name',
    },
    {
      key: 'donor_id',
      label: 'Donor Id',
    },
  ];

  useEffect(() => {
    // const accessToken = localStorage.getItem('token');
    setCsvData([]);
    setCsvPDFData(['Slot Start Time,First Name,Last Name,Donor Id']);
    const allPdf = () => {
      newDonorSchedules?.shift_slots?.map((item, index, array) => {
        if (index === array?.length - 1) {
          // Skip rendering for the last index
          return null;
        }
        setCsvPDFData((prev) => [
          ...prev,
          `${formatDateWithTZ(item.start_time, 'hh:mm a')},${
            item?.donors?.length > 0
              ? `${item?.donors[0]?.first_name},${item?.donors[0]?.last_name},${item?.donors[0]?.id}`
              : ''
          }`,
        ]);
        return item;
      });
    };
    const allCsv = () => {
      newDonorSchedules?.shift_slots?.map((item, index, array) => {
        if (index === array?.length - 1) {
          // Skip rendering for the last index
          return null;
        }
        setCsvData((prev) => [
          ...prev,
          {
            slot_start_time: formatDateWithTZ(item.start_time, 'hh:mm a'),
            first_name:
              item?.donors?.length > 0 ? `${item?.donors[0]?.first_name}` : '',
            last_name:
              item?.donors?.length > 0 ? `${item?.donors[0]?.last_name}` : '',
            donor_id: item?.donors?.length > 0 ? `${item?.donors[0]?.id}` : '',
          },
        ]);

        return item;
      });
    };
    if (downloadType === 'PDF') {
      allPdf();
    }
    if (downloadType === 'CSV') {
      allCsv();
    }
  }, [newDonorSchedules, downloadType]);

  const generatePDF = async () => {
    // Initialize jsPDF
    const doc = new JsPDF();
    const tableData = csvPDFData.map((row) => row.split(','));
    // Add content to the PDF
    await doc.text('CSV to PDF Conversion', 10, 10);

    // Calculate the maximum column width for each column
    const columnWidths = tableData.reduce((acc, row) => {
      row.forEach(async (cell, columnIndex) => {
        acc[columnIndex] = Math.max(
          acc[columnIndex] || 0,
          (await doc.getStringUnitWidth(cell)) + 10
        );
      });
      return acc;
    }, []);

    // Calculate the total width required for the table
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Calculate scaling factor based on the page width
    const pageWidth = doc.internal.pageSize.width - 30; // Adjust for margin
    const scaleFactor = pageWidth / totalWidth;

    // Scale the column widths
    const scaledWidths = columnWidths.map((width) => width * scaleFactor);

    doc.autoTable({
      head: [tableData[0]],
      body: tableData.slice(1),
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: scaledWidths.map((width) => ({ columnWidth: width })),
      startY: 20,
    });

    // Save the PDF
    setTimeout(() => doc.save(`DonorSchedule_${currentDateTime}.pdf`), 100);

    setShowExportDialogue(false);
  };
  const handleDownloadClick = () => {
    setShowExportDialogue(false);
  };
  const currentDateTime = moment().format('MM-DD-YYYY-HH-mm-ss');

  const cancelModal = () => {
    setShowConfirmation(false);
  };

  const submitModal = () => {};

  useEffect(() => {
    getDonorSchedules();
    getDonors();
  }, [id]);

  useEffect(() => {
    getDonors();
  }, [accountsSearchText, sortBy, sortOrder]);
  const handleSort = (name) => {
    if (sortBy === name) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortBy(name);
      setSortOrder('ASC');
    }
  };

  const getDonors = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/donors?fetchAll=true&keyword=${accountsSearchText}${
          sortBy ? `&sortBy=${sortBy}` : ''
        }${sortOrder ? `&sortOrder=${sortOrder}` : ''}`
      );
      const data = await result.json();
      if (data?.data) {
        const updatedData = data?.data?.map((item) => ({
          ...item,
          address: `${item.address1} ${item.address2}`,
        }));

        setAccountRows(updatedData);
      }
    } catch (error) {
      toast.error('Error fetching donor schedules:', error);
    }
  };

  const getDonorSchedules = async () => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/shifts/donors-schedules/${id}`
      );
      const data = await result.json();
      if (data?.data) {
        // const counts = {};

        // Count occurrences of each start_time
        // const counts = {};
        // data?.data?.shift_slots?.forEach((obj) => {
        //   const startTime = obj.start_time;
        //   counts[startTime] = (counts[startTime] || 0) + 1;
        // });

        // // Create a Set to keep track of processed start_times
        // const processedStartTimes = new Set();

        // // Combine shift_slots with the same start_time and add count property
        // const combinedShiftSlots = data?.data?.shift_slots?.reduce(
        //   (acc, obj) => {
        //     const startTime = obj.start_time;
        //     if (!processedStartTimes.has(startTime)) {
        //       acc.push({
        //         ...obj,
        //         count: counts[startTime] || 0,
        //       });
        //       processedStartTimes.add(startTime);
        //     }
        //     return acc;
        //   },
        //   []
        // );

        // const updatedResponse = {
        //   ...data?.data,
        //   shift_slots: combinedShiftSlots,
        // };
        // console.log(updatedResponse, 'ssssssssssssssss');
        const procedureTypesArray = data?.data?.shift_slots
          ?.filter((item, index, array) => {
            // Filter items based on whether their procedure_type.id is unique in the array
            return (
              array.findIndex(
                (el) => el.procedure_type.id === item.procedure_type.id
              ) === index
            );
          })
          ?.map((item) => {
            // Map the filtered items to the desired format
            return {
              procedure_type: item.procedure_type,
            };
          });
        setShiftSlots(procedureTypesArray);
        setDonorSchedules(data?.data);
        setShifts(data?.data?.shifts);
        handleShiftSlots(
          procedureTypesArray[0]?.procedure_type?.id,
          data?.data?.shifts
        );
        handleDonorPortal(
          procedureTypesArray[0]?.procedure_type?.id,
          data?.data?.shifts
        );
      }
    } catch (error) {
      toast.error('Error fetching donor schedules:', error);
    }
  };

  const handleShiftSlots = async (id, firstSlots) => {
    const body = {
      procedure_type_id: +id,
      shift_ids: firstSlots
        ? firstSlots?.map((item) => {
            return +item.id;
          })
        : shifts?.map((item) => {
            return +item.id;
          }),
    };
    try {
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/drives/shifts/procedure-type/slots`,
        JSON.stringify(body)
      );
      const data = await response.json();

      if (data.status === 'success') {
        // to get procedure type id or shift id
        const shiftSlotsData = data?.data || [];
        const shiftableSlotId =
          shiftSlotsData?.length > 0
            ? {
                procedure_type_id: shiftSlotsData[0].procedure_type_id,
                shift_id: shiftSlotsData[0].shift_id,
              }
            : null;
        setShiftId(shiftableSlotId);

        const counts = {};

        // Count occurrences for each start_time
        data?.data?.forEach((obj) => {
          const startTime = obj.start_time;
          counts[startTime] = (counts[startTime] || 0) + 1;
        });

        // Create a Set to keep track of processed start_times
        // const processedStartTimes = new Set();

        // Combine shift_slots with the same start_time and add count property
        const combinedShiftSlots = data?.data;

        const updatedResponse = {
          ...data?.data,
          shift_slots: combinedShiftSlots,
        };
        // start time option
        const startTimeOptionData = updatedResponse?.shift_slots
          ?.slice(0, -1)
          ?.map((item) => {
            return {
              label: formatDateWithTZ(item?.start_time, 'hh:mm a'),
              value: item.start_time,
            };
          });
        setStartTimeOption(startTimeOptionData);

        // end time option
        const endTimeOptionData = updatedResponse?.shift_slots
          ?.slice(0, -1)
          ?.map((item) => {
            return {
              label: formatDateWithTZ(item?.end_time, 'hh:mm a'),
              value: item.end_time,
              id: item?.id,
            };
          });
        setEndTimeOption(endTimeOptionData);
        setNewDonorSchedule(updatedResponse);
      }
    } catch (error) {
      toast.error('Error fetching donor schedules:', error);
    }
  };

  const handleDonorPortal = async (id, firstSlots) => {
    const body = {
      procedure_type_id: +id,
      shift_ids: firstSlots
        ? firstSlots?.map((item) => {
            return +item.id;
          })
        : shifts?.map((item) => {
            return +item.id;
          }),
    };

    try {
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/drives/shifts/procedure-type/projection-staff`,
        JSON.stringify(body)
      );
      const data = await response.json();
      if (data.status === 'success') {
        setDonorPortalCheck(data?.data[0]?.is_donor_portal_enabled);
      }
    } catch (error) {
      toast.error('Error fetching donor schedules:', error);
    }
  };

  const handleIsActiveChange = async (e) => {
    const id = shiftSlots[indexId]?.procedure_type?.id;
    const body = {
      procedure_type_id: +id,
      shift_ids: shifts?.map((item) => {
        return +item.id;
      }),
      is_donor_portal_enabled: e?.target?.checked,
    };
    try {
      const response = await makeAuthorizedApiRequest(
        'PATCH',
        `${BASE_URL}/drives/shifts/projection/staff`,
        JSON.stringify(body)
      );
      const data = await response.json();
      if (data.status === 'success') {
        handleDonorPortal(id);
      }
    } catch (error) {
      toast.error('Error fetching donor schedules:', error);
    }
  };
  return (
    <div className="mainContent">
      <div className="plasmaButtons">
        {shiftSlots?.map((item, index) => {
          return (
            <button
              onClick={() => {
                handleShiftSlots(item?.procedure_type?.id);
                setIndexId(index);
                handleDonorPortal(item?.procedure_type?.id);
              }}
              key={index}
              style={{ fontSize: '16px' }}
              className={`sche-btn 
                    ${
                      item?.procedure_type?.is_generate_online_appointments
                        ? 'green-dot'
                        : 'gray-dot'
                    }
                    ${index === indexId ? 'active-btn ' : ''}`}
            >
              {item.procedure_type.name}
            </button>
          );
        })}
      </div>
      <div className="kpis">
        <div className="kpis-inner">
          <div className="single-kpi">
            <div className="Image">
              <img src={ClockIcon} alt="Loss rate" />
            </div>
            <ul>
              <li>
                <span className="left">Draw Hours</span>
              </li>
              <li>
                <span className="left">
                  {formatDateWithTZ(
                    donorSchedules?.draw_hours?.start_time,
                    'hh:mm a'
                  )}
                  -
                  {formatDateWithTZ(
                    donorSchedules?.draw_hours?.end_time,
                    'hh:mm a'
                  )}
                </span>
              </li>
            </ul>
          </div>
          <div className="single-kpi">
            <div className="Image">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="Group 1707479414">
                  <g id="Rectangle 27813" filter="url(#filter0_d_15577_86664)">
                    <rect
                      x="15"
                      y="7"
                      width="50"
                      height="50"
                      rx="6"
                      fill="#1384B3"
                    />
                  </g>
                  <g id="bloodtype">
                    <mask
                      id="mask0_15577_86664"
                      style={{ maskType: 'alpha' }}
                      maskUnits="userSpaceOnUse"
                      x="23"
                      y="14"
                      width="35"
                      height="35"
                    >
                      <rect
                        id="Bounding box"
                        x="23"
                        y="14"
                        width="35"
                        height="35"
                        fill="#D9D9D9"
                      />
                    </mask>
                    <g mask="url(#mask0_15577_86664)">
                      <path
                        id="bloodtype_2"
                        d="M40.4974 45.3538C37.3749 45.3538 34.7718 44.2813 32.6881 42.1362C30.6044 39.9912 29.5625 37.3213 29.5625 34.1266C29.5625 32.7118 29.8832 31.2924 30.5245 29.8682C31.1657 28.4441 31.9673 27.0774 32.9293 25.7681C33.8912 24.4588 34.9317 23.2272 36.0507 22.0734C37.1696 20.9195 38.2087 19.9157 39.1678 19.0618C39.3529 18.8861 39.5608 18.7556 39.7915 18.6706C40.0222 18.5855 40.2583 18.543 40.5 18.543C40.7416 18.543 40.9778 18.5855 41.2085 18.6706C41.4391 18.7556 41.647 18.8861 41.8321 19.0618C42.7912 19.9157 43.8303 20.9195 44.9493 22.0734C46.0682 23.2272 47.1087 24.4588 48.0706 25.7681C49.0326 27.0774 49.8342 28.4441 50.4755 29.8682C51.1168 31.2924 51.4374 32.7118 51.4374 34.1266C51.4374 37.3213 50.3947 39.9912 48.3093 42.1362C46.2238 44.2813 43.6198 45.3538 40.4974 45.3538ZM40.5 43.1663C43.0277 43.1663 45.118 42.3095 46.7708 40.596C48.4236 38.8825 49.25 36.7253 49.25 34.1246C49.25 32.3503 48.5147 30.3451 47.0442 28.109C45.5737 25.8729 43.3923 23.4302 40.5 20.7809C37.6076 23.4302 35.4262 25.8729 33.9557 28.109C32.4852 30.3451 31.75 32.3503 31.75 34.1246C31.75 36.7253 32.5764 38.8825 34.2291 40.596C35.8819 42.3095 37.9722 43.1663 40.5 43.1663ZM37.5833 39.885H43.4166C43.7265 39.885 43.9863 39.7802 44.1959 39.5705C44.4055 39.3607 44.5103 39.1009 44.5103 38.7908C44.5103 38.4808 44.4055 38.2211 44.1959 38.0117C43.9863 37.8023 43.7265 37.6976 43.4166 37.6976H37.5833C37.2734 37.6976 37.0136 37.8024 36.804 38.0122C36.5944 38.2219 36.4896 38.4818 36.4896 38.7918C36.4896 39.1018 36.5944 39.3615 36.804 39.5709C37.0136 39.7803 37.2734 39.885 37.5833 39.885ZM39.4062 32.5934V34.4163C39.4062 34.7262 39.5111 34.986 39.7208 35.1956C39.9305 35.4052 40.1904 35.51 40.5004 35.51C40.8105 35.51 41.0702 35.4052 41.2796 35.1956C41.489 34.986 41.5937 34.7262 41.5937 34.4163V32.5934H43.4166C43.7265 32.5934 43.9863 32.4885 44.1959 32.2788C44.4055 32.0691 44.5103 31.8092 44.5103 31.4992C44.5103 31.1891 44.4055 30.9294 44.1959 30.72C43.9863 30.5106 43.7265 30.4059 43.4166 30.4059H41.5937V28.583C41.5937 28.2731 41.4888 28.0133 41.2791 27.8037C41.0694 27.5941 40.8095 27.4893 40.4995 27.4893C40.1894 27.4893 39.9297 27.5941 39.7203 27.8037C39.5109 28.0133 39.4062 28.2731 39.4062 28.583V30.4059H37.5833C37.2734 30.4059 37.0136 30.5108 36.804 30.7205C36.5944 30.9302 36.4896 31.1901 36.4896 31.5001C36.4896 31.8102 36.5944 32.0699 36.804 32.2793C37.0136 32.4887 37.2734 32.5934 37.5833 32.5934H39.4062Z"
                        fill="white"
                      />
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_d_15577_86664"
                    x="0"
                    y="0"
                    width="80"
                    height="80"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="7.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.0196078 0 0 0 0 0.0627451 0 0 0 0 0.215686 0 0 0 0.08 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_15577_86664"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_15577_86664"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
            <ul>
              <li>
                <span className="left">Procedures</span>
              </li>
              <li>
                <span className="left">{donorSchedules?.total_procedures}</span>
              </li>
            </ul>
          </div>
          <div className="single-kpi">
            <div className="Image">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
              >
                <g filter="url(#filter0_d_15577_86710)">
                  <rect
                    x="15"
                    y="7"
                    width="50"
                    height="50"
                    rx="6"
                    fill="#1384B3"
                  />
                </g>
                <mask
                  id="mask0_15577_86710"
                  style={{ maskType: 'alpha' }}
                  maskUnits="userSpaceOnUse"
                  x="23"
                  y="14"
                  width="35"
                  height="35"
                >
                  <rect x="23" y="14" width="35" height="35" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_15577_86710)">
                  <path
                    d="M38.97 37.0631L44.3322 31.7009C44.5491 31.484 44.8104 31.3732 45.1161 31.3686C45.4217 31.3639 45.6877 31.4747 45.9139 31.7009C46.1401 31.9271 46.2533 32.1907 46.2533 32.4917C46.2533 32.7927 46.1401 33.0564 45.9139 33.2826L39.8927 39.3038C39.6291 39.5674 39.3215 39.6992 38.97 39.6992C38.6185 39.6992 38.311 39.5674 38.0474 39.3038L35.0886 36.3451C34.8717 36.1282 34.761 35.8669 34.7563 35.5612C34.7516 35.2556 34.8624 34.9896 35.0886 34.7634C35.3148 34.5372 35.5785 34.424 35.8795 34.424C36.1805 34.424 36.4441 34.5372 36.6703 34.7634L38.97 37.0631ZM30.7417 45.3531C30.005 45.3531 29.3815 45.0979 28.8711 44.5875C28.3607 44.077 28.1055 43.4535 28.1055 42.7168V23.1977C28.1055 22.4611 28.3607 21.8375 28.8711 21.3271C29.3815 20.8167 30.005 20.5615 30.7417 20.5615H32.7609V18.5983C32.7609 18.2786 32.868 18.0117 33.0821 17.7977C33.2961 17.5836 33.563 17.4766 33.8827 17.4766C34.2024 17.4766 34.4693 17.5836 34.6834 17.7977C34.8975 18.0117 35.0045 18.2786 35.0045 18.5983V20.5615H46.0541V18.5703C46.0541 18.2599 46.1588 18 46.3682 17.7907C46.5776 17.5813 46.8375 17.4766 47.1478 17.4766C47.4582 17.4766 47.7181 17.5813 47.9275 17.7907C48.1369 18 48.2416 18.2599 48.2416 18.5703V20.5615H50.2608C50.9975 20.5615 51.621 20.8167 52.1314 21.3271C52.6419 21.8375 52.8971 22.4611 52.8971 23.1977V42.7168C52.8971 43.4535 52.6419 44.077 52.1314 44.5875C51.621 45.0979 50.9975 45.3531 50.2608 45.3531H30.7417ZM30.7417 43.1656H50.2608C50.373 43.1656 50.4759 43.1189 50.5694 43.0254C50.6629 42.9319 50.7096 42.829 50.7096 42.7168V29.031H30.2929V42.7168C30.2929 42.829 30.3397 42.9319 30.4332 43.0254C30.5267 43.1189 30.6295 43.1656 30.7417 43.1656ZM30.2929 26.8436H50.7096V23.1977C50.7096 23.0855 50.6629 22.9827 50.5694 22.8892C50.4759 22.7957 50.373 22.7489 50.2608 22.7489H30.7417C30.6295 22.7489 30.5267 22.7957 30.4332 22.8892C30.3397 22.9827 30.2929 23.0855 30.2929 23.1977V26.8436Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <filter
                    id="filter0_d_15577_86710"
                    x="0"
                    y="0"
                    width="80"
                    height="80"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="8" />
                    <feGaussianBlur stdDeviation="7.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0.0196078 0 0 0 0 0.0627451 0 0 0 0 0.215686 0 0 0 0.08 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_15577_86710"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_15577_86710"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </div>
            <ul>
              <li>
                <span className="left">
                  {newDonorSchedules?.shift_slots[
                    newDonorSchedules?.shift_slots.length - 1
                  ]?.filled_slots == 0
                    ? 'Appointment Slots'
                    : 'Filled Slots'}
                </span>
              </li>
              <li>
                <span className="left">
                  {newDonorSchedules?.shift_slots?.length > 0
                    ? `${
                        newDonorSchedules.shift_slots[
                          newDonorSchedules.shift_slots.length - 1
                        ]?.filled_slots == 0
                          ? ''
                          : `${
                              newDonorSchedules.shift_slots[
                                newDonorSchedules.shift_slots.length - 1
                              ]?.filled_slots
                            } / `
                      }${
                        newDonorSchedules.shift_slots[
                          newDonorSchedules.shift_slots.length - 1
                        ]?.total_slots
                      }`
                    : ''}
                </span>
              </li>
            </ul>
          </div>
          <div className="single-kpi input">
            <div
              className="form-field checkbox"
              style={{ alignItems: 'center', display: 'flex' }}
            >
              <span className={Styles.toggleText}>Donor Portal</span>
              <label htmlFor="toggle" className="switch">
                <input
                  type="checkbox"
                  id="toggle"
                  className="toggle-input"
                  name="is_active"
                  checked={donorPortalCheck}
                  onChange={handleIsActiveChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="button-icon">
        <div className="dropdown-center">
          <div
            className={`optionsIcon`}
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{
              cursor: 'pointer',
              marginRight: '30px !important',
              color: '#387DE5',
            }}
          >
            <SvgComponent name={'DownloadIcon'} /> Export Data
          </div>
          <ul className="dropdown-menu">
            <li>
              <Link
                onClick={() => {
                  setShowExportDialogue(true);
                  setDownloadType('PDF');
                }}
                className="dropdown-item"
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
      </div>
      <div className="mainContentInner viewForm">
        <div className="tableView blueprintView">
          <div className="row">
            <div className="col-md-6">
              <div className="tableViewInner test">
                <div className="group">
                  <div className="group-head">
                    <div className="d-flex align-items-center justify-between w-100">
                      <h2>
                        {shiftSlots && shiftSlots[indexId]?.procedure_type.name}
                      </h2>
                      <button
                        onClick={() => setShowConfirmation(true)}
                        className="btn btn-link btn-md bg-transparent px-0"
                      >
                        Add Slot
                      </button>
                    </div>
                  </div>
                  <div className="group-body">
                    <ul>
                      {newDonorSchedules?.shift_slots?.map(
                        (item, index, array) => {
                          if (index === array?.length - 1) {
                            // Skip rendering for the last index
                            return null;
                          }
                          return (
                            <li key={index}>
                              <span
                                className="left-heading"
                                style={{ alignItems: 'start' }}
                              >
                                {formatDateWithTZ(item?.start_time, 'hh:mm a')}
                              </span>
                              <span className="right-data d-flex align-items-center justify-content-between">
                                <span>
                                  {item?.donors?.length > 0
                                    ? `${item?.donors[0]?.first_name} ${
                                        item?.donors[0]?.last_name
                                      } ${
                                        item?.donors[0]?.donor_number
                                          ? item?.donors[0]?.donor_number
                                          : 'New'
                                      }`
                                    : ''}
                                </span>
                                {item?.donors?.length > 0 ? (
                                  <OverlayTrigger
                                    placement="right"
                                    overlay={(props) => (
                                      <Tooltip {...props}>
                                        Change Appointment
                                      </Tooltip>
                                    )}
                                  >
                                    <Link
                                      to={`/crm/contacts/donor/${item?.donors[0].id}/view/update-schedule/${item?.appointments?.[0].id}`}
                                    >
                                      <span className="pe-auto">
                                        <SvgComponent name={'CircleCheck'} />
                                      </span>
                                    </Link>
                                  </OverlayTrigger>
                                ) : (
                                  <OverlayTrigger
                                    placement="right"
                                    overlay={(props) => (
                                      <Tooltip {...props}>Schedule</Tooltip>
                                    )}
                                  >
                                    <span
                                      onClick={() => {
                                        setAddAccountsModal(true);
                                        setdataItem(item);
                                      }}
                                    >
                                      <SvgComponent name={'DummyWithCheck'} />
                                    </span>
                                  </OverlayTrigger>
                                )}
                              </span>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddSlotModal
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        onCancel={cancelModal}
        onSubmits={submitModal}
        shiftId={shiftId}
        startTimeOption={startTimeOption}
        endTimeOption={endTimeOption}
        handleShiftSlots={handleShiftSlots}
        heading={
          shiftSlots && shiftSlots[indexId]?.procedure_type.name + ' Slots'
        }
      />
      <AddAccountsModal
        setAddAccountsModal={setAddAccountsModal}
        addAccountsModal={addAccountsModal}
        selectedAccounts={selectedAccounts}
        setSelectedAccounts={setSelectedAccounts}
        accountRows={accountRows}
        accountsSearchText={accountsSearchText}
        setAccountsSearchText={setAccountsSearchText}
        handleSort={handleSort}
        dataItem={dataItem}
        setShowModel={setShowModel}
        handleShiftSlots={handleShiftSlots}
        shiftId={shiftId}
      />
      <SuccessPopUpModal
        title={'Success!'}
        message={'Donor Appointments Created.'}
        modalPopUp={showModel}
        setModalPopUp={setShowModel}
        showActionBtns={true}
      />
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
                  onClick={generatePDF}
                  // disabled={isFetching}
                >
                  Download
                </button>
              )}

              {downloadType === 'CSV' && (
                <CSVLink
                  className="btn btn-primary"
                  filename={`DonorSchedule_${currentDateTime}.csv`}
                  data={csvData}
                  headers={headers}
                  onClick={handleDownloadClick}
                  // disabled={isFetching}
                >
                  Download
                </CSVLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
