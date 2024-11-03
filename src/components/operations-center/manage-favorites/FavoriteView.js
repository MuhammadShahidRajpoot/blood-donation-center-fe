import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_MANAGE_FAVORITES_PATH,
} from '../../../routes/path';
import { fetchData } from '../../../helpers/Api';
import ViewForm from '../../common/ViewForm';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';
import { covertDatetoTZDate } from '../../../helpers/convertDateTimeToTimezone';

const FavoriteView = () => {
  const { id } = useParams();
  const [favoriteData, setFavoriteData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getData = async (id) => {
      try {
        if (id) {
          setIsLoading(true);
          const favoriteDataRes = await fetchData(
            `/operations-center/manage-favorites/${id}`,
            'GET'
          );
          if (favoriteDataRes?.data) {
            favoriteDataRes.data = {
              ...favoriteDataRes.data,
              created_at: covertDatetoTZDate(favoriteDataRes?.data?.created_at),
              modified_at: favoriteDataRes?.data?.modified_at
                ? covertDatetoTZDate(favoriteDataRes?.data?.modified_at)
                : null,
              organization_level_names:
                favoriteDataRes.data?.organizational_levels
                  ?.map((ol) => ol.organization_level_id.name)
                  .join(', '),
              recruiter_names: favoriteDataRes.data?.recruiters
                ?.map(
                  (rec) =>
                    `${rec.recruiter_id.first_name} ${rec.recruiter_id.last_name}`
                )
                .join(', '),
              is_active: favoriteDataRes.data?.status,
              is_default: favoriteDataRes.data?.is_default ? 'Yes' : 'No',
              is_open_in_new_tab: favoriteDataRes.data?.is_open_in_new_tab
                ? 'Yes'
                : 'No',
            };
            setFavoriteData(favoriteDataRes.data);
          }
        } else {
          toast.error('Error Getting Favorite Details', { autoClose: 3000 });
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error Getting Favorite Details', { autoClose: 3000 });
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Manage Favorites',
      class: 'active-label',
      link: OPERATIONS_CENTER_MANAGE_FAVORITES_PATH.LIST,
    },
    {
      label: 'View Favorite',
      class: 'active-label',
      link: OPERATIONS_CENTER_MANAGE_FAVORITES_PATH.VIEW.replace(':id', id),
    },
  ];
  const config = [
    {
      section: 'Favorite Details',
      fields: [
        { label: 'Favorite Name', field: 'name' },
        { label: 'Alternate Name', field: 'alternate_name' },
        { label: 'Organization Level', field: 'organization_level_names' },
        { label: 'Recruiter', field: 'recruiter_names' },
        { label: 'Operation Type', field: 'operation_type' },
        { label: 'Location Type', field: 'location_type' },
        { label: 'Procedure Types', field: 'procedure_type_id.name' },
        { label: 'Products', field: 'product_id.name' },
        { label: 'Operation Status', field: 'operations_status_id.name' },
        { label: 'Other Settings', fullRow: true },
        { label: 'Open in New Tab', field: 'is_open_in_new_tab' },
        { label: 'Default', field: 'is_default' },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Status',
          field: 'is_active',
        },
        {
          label: 'Created',
          field: 'created_by',
        },
        {
          label: 'Modified',
          field: 'updated_by',
        },
      ],
    },
  ];

  return (
    <ViewForm
      breadcrumbsData={BreadcrumbsData}
      breadcrumbsTitle={'Favorite'}
      editLink={
        CheckPermission([
          OcPermissions.OPERATIONS_CENTER.MANAGE_FAVORITE.WRITE,
        ]) && OPERATIONS_CENTER_MANAGE_FAVORITES_PATH.EDIT.replace(':id', id)
      }
      data={favoriteData}
      config={config}
      fromView
      isLoading={isLoading}
    />
  );
};
export default FavoriteView;
