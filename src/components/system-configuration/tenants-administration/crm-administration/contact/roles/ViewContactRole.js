import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContactBreadCrumbsData } from '../ContactBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import ViewForm from '../../../../../common/ViewForm';
import { FunctionTypeEnum } from '../../../../../common/Enums';
import { covertDatetoTZDate } from '../../../../../../helpers/convertDateTimeToTimezone';

const ViewContactRole = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [contactRoleData, setContactRoleData] = useState([]);
  const bearerToken = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const getViewContactRole = async () => {
        setIsLoading(true);

        const response = await fetch(`${BASE_URL}/contact-roles/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        });
        let responseData = await response.json();
        setContactRoleData({
          ...responseData.data,
          is_active: responseData.data.status,
          created_at: covertDatetoTZDate(responseData?.data?.created_at),
          modified_at: covertDatetoTZDate(
            responseData?.data?.modified_at ?? responseData?.data?.created_at
          ),
        });

        setIsLoading(false);
      };
      if (id) {
        getViewContactRole(id);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [id, BASE_URL]);

  const BreadcrumbsData = [
    ...ContactBreadCrumbsData,
    {
      label: 'View Role',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/crm-admin/contacts/roles/${id}/view`,
    },
  ];
  const config = [
    {
      section: 'Role Details',
      fields: [
        {
          label: 'Name',
          field: 'name',
          isPrimaryChairPerson: contactRoleData?.is_primary_chairperson,
        },
        { label: 'Short Name', field: 'short_name' },
        { label: 'Description', field: 'description' },
        {
          label: 'Function',
          value: contactRoleData?.function_id
            ? parseInt(contactRoleData?.function_id) === FunctionTypeEnum.STAFF
              ? 'Staff'
              : parseInt(contactRoleData?.function_id) ===
                FunctionTypeEnum.DONOR
              ? 'Donor'
              : 'Volunteer'
            : 'N/A',
        },
        {
          label: 'OEF Contribution (%)',
          value: `${contactRoleData.oef_contribution}%`,
        },
        { label: 'Average Hourly Rate', field: 'average_hourly_rate' },
        {
          label: 'Staffable',
          value: `${contactRoleData.staffable ? 'Yes' : 'No'}`,
        },
        {
          label: 'Impacts OEF',
          value: `${contactRoleData.impacts_oef ? 'Yes' : 'No'}`,
        },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Status',
          field: 'is_active',
          format: (value) => (value ? 'Active' : 'Inactive'),
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
  return (
    <ViewForm
      breadcrumbsData={BreadcrumbsData}
      breadcrumbsTitle={'Roles'}
      editLink={
        CheckPermission([
          Permissions.CRM_ADMINISTRATION.CONTACTS.ROLES.WRITE,
        ]) &&
        `/system-configuration/tenant-admin/crm-admin/contacts/roles/${id}`
      }
      data={contactRoleData}
      config={config}
      isLoading={isLoading}
    />
  );
};

export default ViewContactRole;
