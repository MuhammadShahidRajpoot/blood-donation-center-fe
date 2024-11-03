import React, { useEffect, useState } from 'react';
import ViewForm from '../../common/ViewForm';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';
import TopBar from '../../common/topbar/index';
import NavTabs from '../../common/navTabs';
import { useLocation, useParams } from 'react-router-dom';
import { BASE_URL } from '../../../helpers/constants';
import { toast } from 'react-toastify';
import { formatDate } from '../../../helpers/formatDate';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import axios from 'axios';
import styles from './index.module.scss';
import jwt from 'jwt-decode';
import { covertDatetoTZDate } from '../../../helpers/convertDateTimeToTimezone';
const variablesKey = [
  {
    name: 'CP Title',
    value: 'cp_title',
  },
  {
    name: 'CP First',
    value: 'cp_first',
  },
  {
    name: 'CP Last',
    value: 'cp_last',
  },
  {
    name: 'Account Name',
    value: 'account_name',
  },
  {
    name: 'Next Drive Date',
    value: 'next_drive_date',
  },
  {
    name: 'Recruiter',
    value: 'recruiter',
  },
  {
    name: 'Last Eligible Date',
    value: 'last_eligible_date',
  },
];
const ProspectsAbout = () => {
  const { id } = useParams();
  const location = useLocation();
  const currentLocation = location.pathname;
  const [state, setState] = useState();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateTypeData, setTemplateTypeData] = useState([]);
  const bearerToken = localStorage.getItem('token');
  useEffect(() => {
    getAbout();
  }, [id]);
  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    const decodeToken = jwt(jwtToken);
    if (decodeToken?.tenantId) {
      fetchTenantData(decodeToken?.tenantId);
    }
  }, []);
  const fetchTenantData = async (tenantId) => {
    try {
      const token = localStorage.getItem('token');
      const data = await axios.get(`${BASE_URL}/tenants/${tenantId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (data?.data?.status_code === 200) {
        if (data?.data?.data?.daily_story_campaigns) {
          fetchTemplateData(data?.data?.data?.daily_story_campaigns);
        }
      }
    } catch (error) {
      console.error('Error templates:', error);
    }
  };
  const fetchTemplateData = async (campaign) => {
    try {
      const { data, status } = await axios.get(
        `${BASE_URL}/contacts/volunteers/communications/email-templates/${campaign}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      if (status === 200) {
        if (data?.Response?.emails)
          setTemplateTypeData(
            data?.Response?.emails?.map((templateTemp) => ({
              value: templateTemp?.emailId,
              label: templateTemp?.name,
              previewUrl: templateTemp?.previewUrl,
            }))
          );
      } else {
        setTemplateTypeData([]);
      }
    } catch (error) {
      console.error('Error templates:', error);
    }
  };
  const getAbout = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/operations-center/prospects/${id}`,
        {
          headers: {
            method: 'GET',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();
      if (data?.data) {
        const notes = data?.data;
        setState(notes);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

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
      link: OS_PROSPECTS_PATH.ABOUT.replace(':id', id),
    },
    {
      label: 'About',
      class: 'disable-label',
      link: OS_PROSPECTS_PATH.ABOUT,
    },
  ];

  useEffect(() => {
    if (templateTypeData?.length > 0) {
      const temp = templateTypeData.find(
        (x) => x.value === state?.communications?.template_id
      );
      setSelectedTemplate({
        value: temp?.value,
        label: temp?.label,
        previewUrl: temp?.previewUrl,
      });
    }
  }, [templateTypeData, state?.communications]);

  const data = {
    template: selectedTemplate?.label,
    message_type: 'Email',
    target_date: `${formatDate(
      state?.filters?.start_date,
      'MM-DD-YYYY'
    )}  - ${formatDate(state?.filters?.end_date, 'MM-DD-YYYY')}`,
    projection: `${
      state?.filters?.min_projection ? state?.filters?.min_projection : 'N/A'
    }-${
      state?.filters?.max_projection ? state?.filters?.max_projection : 'N/A'
    }`,
    location_type: `${
      state?.filters?.location_type ? state?.filters?.location_type : 'N/A'
    }`,
    eligibility: `${
      state?.filters?.eligibility >= 0
        ? `>${state?.filters?.eligibility} Days Before, After`
        : 'N/A'
    }`,
    distance: `${
      state?.filters?.distance ? `${state?.filters?.distance} Miles` : 'N/A'
    }`,
    organizational_level:
      state?.filters?.organizationLevels?.length > 0
        ? state?.filters?.organizationLevels.map((item) => item.name).join(', ')
        : 'N/A',
    schedule_send: `${formatDate(
      state?.communications?.schedule_date,
      'MM-DD-YYYY'
    )}`,
    created_by: state?.created_by,
    created_at: covertDatetoTZDate(state?.created_at),
    modified_at: state?.updated_at
      ? covertDatetoTZDate(state?.updated_at)
      : covertDatetoTZDate(state?.created_at),
  };

  const additionalMessage = {
    section: 'Email Message',
    message: state?.communications?.message,
  };

  const config = [
    {
      section: 'Email Details',
      fields: [
        { label: 'Template', field: 'template' },
        { label: 'Message Type', field: 'message_type' },
      ],
    },
    {
      section: 'Filters',
      fields: [
        { label: 'Target Date', field: 'target_date' },
        { label: 'Projection', field: 'projection' },
        { label: 'Location Type', field: 'location_type' },
        { label: 'Eligibility', field: 'eligibility' },
        { label: 'Distance', field: 'distance' },
        { label: 'Organizational Level', field: 'organizational_level' },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Schedule Send',
          field: 'schedule_send',
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

  const getCurrentDateFormatted = () => {
    const currentDate = new Date();
    return formatDate(currentDate, 'MM-DD-YYYY');
  };

  const isEditDisabled = data?.schedule_send < getCurrentDateFormatted();
  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Prospect'}
        />
        <div className="filterBar">
          <NavTabs
            tabs={Tabs}
            currentLocation={currentLocation}
            editLink={
              CheckPermission([
                OcPermissions.OPERATIONS_CENTER.PROSPECTS.WRITE,
              ]) && OS_PROSPECTS_PATH.EDIT_MESSAGE.replace(':id', id)
            }
            editLinkName={'Edit Message Email'}
            classLinkName={`editLink fs-6 text fw-normal ${
              isEditDisabled ? styles.editDisabled : ''
            }`}
            isEditDisabled={isEditDisabled}
          />
        </div>
        <ViewForm
          className="contact-view"
          data={data}
          config={config}
          // additional={additionalItems}
          variablesKey={variablesKey}
          additionalMessage={additionalMessage}
        />
      </div>
    </>
  );
};

export default ProspectsAbout;
