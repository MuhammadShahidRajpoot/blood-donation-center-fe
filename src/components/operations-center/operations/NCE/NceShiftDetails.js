import React, { useEffect, useState } from 'react';
// import TopTabsNCP from '../topTabsNCP';
import { Link, useParams } from 'react-router-dom';
import // CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH,
// CRM_NON_COLLECTION_PROFILES_PATH,
'../../../../routes/path';
import ViewForm from './ViewForm/index';
import SvgComponent from '../../../common/SvgComponent';
import { toast } from 'react-toastify';
import TopTabsNce from './TopTabsNce';
import { API } from '../../../../api/api-routes.js';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone.js';

const NceShiftDetails = () => {
  const { id } = useParams();
  const [selectedShift, setSelectedShift] = useState(1);
  const [shiftDetails, setShiftDetails] = useState([]);
  const [isWriteable, setWriteable] = useState([]);
  const BreadcrumbsData = [
    {
      label: 'Operation Center',
      class: 'disable-label',
      link: '#',
    },
    {
      label: 'Operations',
      class: 'active-label',
      link: '#',
    },
    {
      label: 'Non-Collection Event',
      class: 'active-label',
      link: '/operations-center/operations/non-collection-events',
    },
    {
      label: 'View Non-Collection Event',
      class: 'active-label',
      link: `/operations-center/operations/non-collection-events/${id}/view/about`,
    },
    {
      label: 'Shift Details',
      class: 'active-label',
      link: '#',
    },
  ];

  useEffect(() => {
    if (id) {
      getData();
      getWriteable();
    }
  }, [id]);

  const getWriteable = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await API.ocNonCollectionEvents.getSingleData(token, id);
      setWriteable(data?.data?.writeable);
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    }
  };

  const getData = async () => {
    const token = localStorage.getItem('token');

    try {
      const { data } = await API.ocNonCollectionEvents.getSingleShiftData(
        token,
        id
      );
      if (data.status_code === 200) {
        let modified;
        if (data?.data?.length) {
          modified = data?.data?.map((item) => {
            return {
              devices: item?.shiftDevices?.length
                ? item?.shiftDevices?.map(
                    (el, index) =>
                      `${el?.device?.name}${
                        index === item?.shiftDevices?.length - 1 ? '' : ', '
                      }`
                  )
                : 'N/A',
              vehicles: item?.shiftVehicles?.length
                ? item?.shiftVehicles?.map(
                    (el, index) =>
                      `${el?.vehicle?.name}${
                        index === item?.shiftVehicles?.length - 1 ? '' : ', '
                      }`
                  )
                : 'N/A',
              staff: item?.shiftRoles?.length
                ? item?.shiftRoles?.map(
                    (el, index) =>
                      `${el?.role?.name}${
                        index === item?.shiftRoles?.length - 1 ? '' : ', '
                      }`
                  )
                : 'N/A',
              start_time: formatDateWithTZ(item?.start_time, 'hh:mm a'),
              end_time: formatDateWithTZ(item?.end_time, 'hh:mm a'),
              staff_break: {
                start_time: formatDateWithTZ(item?.break_start_time, 'hh:mm a'),
                end_time: formatDateWithTZ(item?.break_end_time, 'hh:mm a'),
              },
              status: item?.is_active ? item?.is_active : 'N/A',
              writeable: item?.writeable,
            };
          });
        } else {
          modified = [
            {
              devices: 'N/A',
              vehicles: 'N/A',
              staff: 'N/A',
              start_time: 'N/A',
              end_time: 'N/A',
              staff_break: {
                start_time: 'N/A',
                end_time: 'N/A',
              },
              status: 'N/A',
            },
          ];
        }

        setShiftDetails(modified);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const config = [
    {
      section: 'Shift Details',
      fields: [
        { label: 'Start Time', field: 'start_time' },
        { label: 'End Time', field: 'end_time' },
      ],
    },
    {
      section: 'Resources',
      fields: [
        {
          label: 'Staff Setup',
          field: 'staff',
        },
        {
          label: 'Vehicles',
          field: 'vehicles',
        },
        {
          label: 'Devices',
          field: 'devices',
        },
      ],
    },
    {
      section: 'Staff Break',
      fields: [
        { label: 'Start Time', field: 'staff_break.start_time' },
        { label: 'End Time', field: 'staff_break.end_time' },
      ],
    },
  ];
  useEffect(() => {
    setSelectedShift(1);
  }, []);
  return (
    <ViewForm
      breadcrumbsData={BreadcrumbsData}
      breadcrumbsTitle={'Shift Details'}
      data={shiftDetails[selectedShift - 1]}
      config={config}
      customTopBar={
        <>
          <TopTabsNce
            // id={id}
            buttonRight={
              isWriteable && (
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
              )
            }
            // activePath={id}
          />
          <div className="mainContentInner pb-0">
            <div className="topPagination">
              <h5>Shift</h5>
              {shiftDetails?.map((entry, index) => (
                <button
                  key={index}
                  className={index === selectedShift - 1 ? 'active' : ''}
                  onClick={() => {
                    if (index === selectedShift - 1) return;
                    setSelectedShift(index + 1);
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      }
    />
  );
};

export default NceShiftDetails;
