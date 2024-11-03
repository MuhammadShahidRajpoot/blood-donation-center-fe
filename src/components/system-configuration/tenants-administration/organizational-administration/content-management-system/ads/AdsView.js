import React, { useEffect, useState } from 'react';
import TopBar from '../../../../../common/topbar/index';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatUser } from '../../../../../../helpers/formatUser';
import { ContentManagementSystemBreadCrumbsData } from '../ContentManagementSystemBreadCrumbsData';
import SvgComponent from '../../../../../common/SvgComponent';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

const AdsView = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id } = useParams();
  const [adsViewData, setAdsViewData] = useState({});
  const bearerToken = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const getAdById = async (id) => {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/ad/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        });
        let { data } = await response.json();
        if (response.ok || response.status === 200) {
          setIsLoading(false);
          setAdsViewData(data);
        } else {
          toast.error('Error Fetching Device type Details', {
            autoClose: 3000,
          });
          setIsLoading(false);
        }
      };
      if (id) {
        getAdById(id);
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, BASE_URL]);

  const BreadcrumbsData = [
    ...ContentManagementSystemBreadCrumbsData,
    {
      label: 'View Ad',
      class: 'disable-label',
      link: `/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/${id}/view`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar BreadCrumbsData={BreadcrumbsData} BreadCrumbsTitle={'Ads'} />
      <div className="mainContentInner viewForm">
        <div className="editAnchor">
          <Link
            to={`/system-configuration/tenant-admin/organizational-admin/content-management-system/ads/${id}/edit`}
          >
            <SvgComponent name={'EditIcon'} />
            <span>Edit</span>
          </Link>
        </div>

        <div className="col-md-6">
          <table className="viewTables">
            <thead>
              <tr>
                <th colSpan="2">View Ad Details</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <td className="col2 no-data text-center">Data Loading</td>
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td className="col1">Ad Type</td>
                  <td className="col2">
                    {' '}
                    {adsViewData?.ad_type ? adsViewData?.ad_type : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="col1">Display Order</td>
                  <td className="col2">
                    {adsViewData?.display_order
                      ? adsViewData?.display_order
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="col1">Image Name</td>
                  <td className="col2">
                    {adsViewData?.image_name ? adsViewData?.image_name : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="col1">Redirect URL</td>
                  <td className="col2">
                    {adsViewData?.redirect_url
                      ? adsViewData?.redirect_url
                      : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="col1">Description</td>
                  <td className="col2">
                    {adsViewData?.details ? adsViewData?.details : 'N/A'}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
          <table className="viewTables">
            <thead>
              <tr>
                <th colSpan="2">Insights</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <td className="col2 no-data text-center">Data Loading</td>
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td className="col1">Status</td>
                  <td className="col2">
                    <span className="badge active"> Active </span>
                  </td>
                </tr>
                <tr>
                  <td className="col1">Created</td>
                  <td className="col2">
                    {' '}
                    {adsViewData &&
                    adsViewData?.created_by &&
                    adsViewData?.created_at ? (
                      <>
                        {formatUser(adsViewData?.created_by)}
                        {formatDateWithTZ(
                          adsViewData?.created_at,
                          'MM-dd-yyyy | hh:mm a'
                        )}
                      </>
                    ) : (
                      ''
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="col1">Modified</td>
                  <td className="col2">
                    {' '}
                    {adsViewData &&
                    adsViewData?.modified_at &&
                    adsViewData?.modified_by ? (
                      <>
                        {formatUser(adsViewData?.modified_by)}
                        {formatDateWithTZ(
                          adsViewData?.modified_at,
                          'MM-dd-yyyy | hh:mm a'
                        )}
                      </>
                    ) : (
                      <>
                        {formatUser(adsViewData?.created_by)}
                        {formatDateWithTZ(
                          adsViewData?.created_at,
                          'MM-dd-yyyy | hh:mm a'
                        )}
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdsView;
