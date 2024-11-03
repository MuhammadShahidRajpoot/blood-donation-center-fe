import React, { useEffect, useState } from 'react';
// import TopTabsNCP from '../topTabsNCP';
import { Link, useNavigate, useParams } from 'react-router-dom';
import // CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH,
// CRM_NON_COLLECTION_PROFILES_PATH,
'../../../../routes/path';
// import ViewForm from '../../../common/ViewForm';
import SvgComponent from '../../../common/SvgComponent';
import { toast } from 'react-toastify';
import { API } from '../../../../api/api-routes.js';
import TopTabsNce from './TopTabsNce';
import ViewForm from './ViewForm';
import { formatUser } from '../../../../helpers/formatUser';
import { formatDate } from '../../../../helpers/formatDate';
import CheckPermission from '../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../enums/OcPermissionsEnum.js';
import {
  covertDatetoTZDate,
  formatDateWithTZ,
} from '../../../../helpers/convertDateTimeToTimezone.js';

const NceView = () => {
  const { id } = useParams();
  const [singleNcBluePrint, setSingleNcBluePrint] = useState({});
  const navigate = useNavigate();
  const [customFieldsPresent, setCustomFieldsPresent] = useState(false);

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
      // link: CRM_NON_COLLECTION_PROFILES_PATH.VIEW.replace(
      //   ':id',
      //   nonCollectionProfileId
      // ),
    },
    {
      label: 'View Non-Collection Event',
      class: 'active-label',
      link: '#',
    },
    {
      label: 'About',
      class: 'active-label',
      link: '#',
    },
  ];

  const getCustomFields = async () => {
    let customFields = [];
    try {
      const response = await API.ocNonCollectionEvents.getCustomFieldData(id);
      customFields = response?.data?.data;
    } catch (error) {
      console.error(`Failed to fetch Locations data ${error}`, {
        autoClose: 3000,
      });
    }
    return customFields;
  };
  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  const handleTime = (startTime, endTime) => {
    let start_time = formatDateWithTZ(startTime, 'hh:mm a');
    let end_time = formatDateWithTZ(endTime, 'hh:mm a');
    if (start_time === 'Invalid date' && end_time === 'Invalid date')
      return 'N/A';
    else if (start_time === 'Invalid date') start_time = 'N/A';
    else if (end_time === 'Invalid date') end_time = 'N/A';
    return `${start_time} - ${end_time}`;
  };

  const getData = async () => {
    const token = localStorage.getItem('token');

    try {
      let customFields = await getCustomFields();
      const { data } = await API.ocNonCollectionEvents.getSingleData(token, id);
      if (data?.status_code === 200) {
        let body = {
          custom_fields: customFields?.map((item) => ({
            label: item.field_id.field_name,
            field: item.field_data,
          })),
          nceEvent_Name: data?.data?.event_name
            ? data?.data?.event_name
            : 'N/A',
          location_id: data?.data?.location_id?.name
            ? data?.data?.location_id?.name
            : 'N/A',
          owner: data?.data?.owner_id
            ? formatUser(data?.data?.owner_id, 1)
            : 'N/A',
          event_hours: handleTime(
            data?.data?.min_start_time,
            data?.data?.max_end_time
          ),
          Non_Collection_Profile: data?.data?.non_collection_profile_id
            ?.profile_name
            ? data?.data?.non_collection_profile_id?.profile_name
            : 'N/A',
          collection_operation_id: data?.data?.collection_operation_id?.length
            ? data?.data?.collection_operation_id
                ?.map((co) => co.name)
                .join(', ')
            : 'N/A',
          status: data?.data?.status_id?.name
            ? data?.data?.status_id?.name
            : 'N/A',
          className: data?.data?.status_id?.chip_color,
          created_by: data?.data?.created_by
            ? `${formatUser(data?.data?.created_by)} ${formatDate(
                covertDatetoTZDate(data?.data?.created_at)
              )}`
            : 'N/A',
          modified_by: data?.data?.modified_by
            ? `${formatUser(data?.data?.modified_by)} ${formatDate(
                covertDatetoTZDate(data?.data?.modified_at)
              )}`
            : `${formatUser(data?.data?.created_by)} ${formatDate(
                covertDatetoTZDate(data?.data?.created_at)
              )}`,
          writeable: data?.data?.writeable,
        };
        setSingleNcBluePrint(body);
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const config = [
    {
      section: 'NCE Details',
      fields: [
        { label: 'Event Name', field: 'nceEvent_Name' },
        { label: 'Location', field: 'location_id' },
        { label: 'Event Hours', field: 'event_hours' },
      ],
    },
    {
      section: 'Attributes',
      fields: [
        { label: 'Owner', field: 'owner' },
        { label: 'Non Collection Profile', field: 'Non_Collection_Profile' },
        { label: 'Collection Operation', field: 'collection_operation_id' },
      ],
    },
    {
      section: 'Custom Fields',
      fields: [
        { label: 'Lorem Epsem', field: 'Lorem Epsem' },
        { label: 'Lorem Epsem', field: 'Lorem Epsem' },
        { label: 'Lorem Epsem', field: 'Lorem Epsem' },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Status',
          field: 'status',
          format: (value) => (value ? 'Confirmed' : 'Not Confirmed'),
        },
        {
          label: 'Created',
          field: 'created_by',
        },

        {
          label: 'Modified',
          field: 'modified_by',
        },
      ],
    },
  ];

  useEffect(() => {
    const checkPresent = singleNcBluePrint?.custom_fields?.find(
      (cf) => cf?.field && cf?.field !== 'N/A'
    );
    setCustomFieldsPresent(checkPresent);
  }, [singleNcBluePrint]);

  return (
    <ViewForm
      breadcrumbsData={BreadcrumbsData}
      breadcrumbsTitle={'About'}
      customFieldsPresent={customFieldsPresent}
      data={singleNcBluePrint}
      config={config}
      customTopBar={
        <>
          <TopTabsNce
            NCEID={id}
            buttonRight={
              <div className="buttons d-flex align-items-center gap-3">
                {CheckPermission([
                  Permissions.OPERATIONS_CENTER.OPERATIONS.NON_COLLECTION_EVENTS
                    .WRITE,
                ]) &&
                  singleNcBluePrint?.writeable && (
                    <div className="editAnchor">
                      <Link
                        to={`/operations-center/operations/non-collection-events/${id}/edit`}
                        className="d-flex justify-content-center align-items-center"
                      >
                        <SvgComponent name="EditIcon" />
                        <span>Edit NCE</span>
                      </Link>
                    </div>
                  )}
                <button
                  className="btn btn-primary createButton"
                  onClick={() =>
                    navigate('/operations-center/operations/nce/create')
                  }
                >
                  Schedule Event
                </button>
              </div>
            }
            activePath={id}
          />
        </>
      }
    />
  );
};

export default NceView;
