import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import styles from './index.module.scss';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dateFormat } from '../../../../../../helpers/formatDate';
import { formatUser } from '../../../../../../helpers/formatUser';
import { MarketingEquipmentBreadCrumbsData } from '../MarketingEquipmentBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import SvgComponent from '../../../../../common/SvgComponent';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

const MarketingMaterialView = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [marketingData, setMarketingData] = useState({});
  const bearerToken = localStorage.getItem('token');

  useEffect(() => {
    try {
      const getMarketById = async (id) => {
        const response = await fetch(
          `${BASE_URL}/marketing-equipment/marketing-material/${id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${bearerToken}`,
            },
          }
        );
        let { data } = await response.json();
        if (response.ok || response.status === 200) {
          setMarketingData(data);
        } else {
          toast.error('Error Fetching Device type Details', {
            autoClose: 3000,
          });
        }
      };
      if (id) {
        getMarketById(id);
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, BASE_URL, bearerToken]);

  const BreadcrumbsData = [
    ...MarketingEquipmentBreadCrumbsData,
    {
      label: 'View Marketing Material',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/${id}/view`,
    },
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Marketing Materials'}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.OPERATIONS_ADMINISTRATION.MARKETING_EQUIPMENTS
            .MARKETING_MATERIAL.WRITE,
        ]) && (
          <div className={'editAnchor'}>
            <Link
              to={`/system-configuration/tenant-admin/operations-admin/marketing-equipment/marketing-material/${id}/edit`}
            >
              <SvgComponent name={'EditIcon'} />
              <span>Edit</span>{' '}
            </Link>
          </div>
        )}
        <div className="col-md-6">
          <table className="viewTables mt-0">
            <thead>
              <tr>
                <th colSpan="2">Marketing Material Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col1">Name</td>
                <td className="col2">{marketingData?.name}</td>
              </tr>
              <tr>
                <td className="col1">Short Name</td>
                <td className="col2">{marketingData?.short_name}</td>
              </tr>
              <tr>
                <td className="col1">Description</td>
                <td className="col2">{marketingData?.description}</td>
              </tr>
              <tr>
                <td className="col1">Retire On</td>
                <td className="col2">
                  {dateFormat(marketingData?.retire_on, 1)}
                </td>
              </tr>
              <tr>
                <td className="col1">Collection Operation</td>
                <td className="col2">
                  {marketingData &&
                    marketingData?.collection_operation?.length &&
                    marketingData?.collection_operation.map((item, index) => {
                      return (
                        <span key={item?.id}>{`${item?.name} ${
                          marketingData?.collection_operation?.length - 1 ===
                          index
                            ? ''
                            : ',\u00A0'
                        }`}</span>
                      );
                    })}
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
                  <span
                    className={`${
                      marketingData?.status ? styles.active : styles.inactive
                    } ${styles.badge}`}
                  >
                    {marketingData?.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="col1">Created</td>
                <td className="col2">
                  {formatUser(marketingData?.created_by)}
                  {formatDateWithTZ(
                    marketingData?.created_at,
                    'MM-dd-yyyy | hh:mm a'
                  )}
                </td>
              </tr>
              <tr>
                <td className="col1">Modified</td>
                <td className="col2">
                  {formatUser(
                    marketingData?.modified_by
                      ? marketingData?.modified_by
                      : marketingData?.created_by
                  )}
                  {formatDateWithTZ(
                    marketingData?.modified_at !== null
                      ? marketingData?.modified_at
                      : marketingData?.created_at,
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

export default MarketingMaterialView;
