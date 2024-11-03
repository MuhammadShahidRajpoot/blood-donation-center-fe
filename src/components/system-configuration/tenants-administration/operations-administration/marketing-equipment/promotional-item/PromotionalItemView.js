import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { toast } from 'react-toastify';
import SvgComponent from '../../../../../common/SvgComponent';
import { Link } from 'react-router-dom';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import styles from './index.module.scss';
import { formatUser } from '../../../../../../helpers/formatUser';
import { formatDate } from '../../../../../../helpers/formatDate';
import { MarketingEquipmentBreadCrumbsData } from '../MarketingEquipmentBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

const PromotionalItemView = ({ promotionId }) => {
  const [promotionalData, setpromotionalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const BreadcrumbsData = [
    ...MarketingEquipmentBreadCrumbsData,
    {
      label: 'View Promotional Item',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${promotionId}/view`,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    const getData = async (promotionId) => {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/marketing-equipment/promotional-items/${promotionId}`
      );
      let { data } = await result.json();
      if (result.ok || result.status === 200) {
        const promotionalData = data;
        promotionalData.collection_operations = data.collectionOperations
          .map((bco) => bco.collection_operation.name)
          .join(', ');
        setpromotionalData(promotionalData);
      } else {
        toast.error('Error Fetching Promotional Item Details', {
          autoClose: 3000,
        });
      }
    };
    if (promotionId) {
      getData(promotionId);
    }
    setIsLoading(false);
  }, [promotionId]);

  if (isLoading) {
    return;
  }
  if (!promotionalData || !Object.keys(promotionalData).length > 0) {
    return;
  }
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Promotional Item'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.OPERATIONS_ADMINISTRATION.MARKETING_EQUIPMENTS
            .PROMOTIONAL_ITEMS.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link
              to={`/system-configuration/tenant-admin/operations-admin/marketing-equipment/promotional-items/${promotionId}/edit`}
            >
              <SvgComponent name={'EditIcon'} />
              <span>Edit</span>
            </Link>
          </div>
        )}
        <div className="col-md-6">
          <table className="viewTables mt-0">
            <thead>
              <tr>
                <th colSpan="2">Promotional Item Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col1">Name</td>
                <td className="col2"> {promotionalData?.name} </td>
              </tr>
              <tr>
                <td className="col1">Short Name</td>
                <td className="col2"> {promotionalData?.short_name} </td>
              </tr>
              <tr>
                <td className="col1">Description</td>
                <td className="col2"> {promotionalData?.description} </td>
              </tr>
              <tr>
                <td className="col1">Promotion</td>
                <td className="col2">
                  {' '}
                  {promotionalData?.promotion_id?.name}{' '}
                </td>
              </tr>
              <tr>
                <td className="col1">Retire On</td>
                <td className="col2">
                  {formatDate(promotionalData?.retire_on, 'MM-DD-YYYY')}
                </td>
              </tr>
              <tr>
                <td className="col1">Collection Operation</td>
                <td className="col2">
                  {' '}
                  {promotionalData?.collection_operations}{' '}
                </td>
              </tr>
            </tbody>
          </table>

          <table className="viewTables">
            <thead>
              <tr>
                <th colSpan="2">Insights</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col1">Status</td>
                <td className="col2">
                  {' '}
                  {promotionalData && (
                    <span
                      className={`${
                        promotionalData?.status
                          ? styles.active
                          : styles.inactive
                      } ${styles.badge}`}
                    >
                      {' '}
                      {promotionalData?.status === true
                        ? 'Active'
                        : 'InActive'}{' '}
                    </span>
                  )}{' '}
                </td>
              </tr>
              <tr>
                <td className="col1">Created</td>
                <td className="col2">
                  {formatUser(promotionalData?.created_by)}
                  {formatDateWithTZ(
                    promotionalData?.created_at,
                    'MM-dd-yyyy | hh:mm a'
                  )}
                </td>
              </tr>
              <tr>
                <td className="col1">Modified</td>
                <td className="col2">
                  {formatUser(promotionalData?.modified_by)}
                  {formatDateWithTZ(
                    promotionalData?.modified_at !== null
                      ? promotionalData?.modified_at
                      : promotionalData?.created_at,
                    'MM-dd-yyyy | hh:mm a'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromotionalItemView;
