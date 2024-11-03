import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import SvgComponent from '../../../../../common/SvgComponent';
import TopBar from '../../../../../common/topbar/index';
import styles from './index.module.scss';
import { fetchData } from '../../../../../../helpers/Api';
import { formatUser } from '../../../../../../helpers/formatUser';
import { AccountBreadCrumbsData } from '../AccountBreadCrumbsData';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';
const ViewSources = () => {
  const { id } = useParams();
  const [sourceData, setSourceData] = useState({});
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, BASE_URL]);

  const loadData = async (id) => {
    setIsLoading(true);
    const result = await fetchData(`/accounts/sources/${id}`, 'GET');

    if (result.status_code === 201) {
      setSourceData(result?.data);
    } else {
      toast.error('Error Fetching Sources Details', { autoClose: 3000 });
    }
    setIsLoading(false);
  };
  const BreadcrumbsData = [
    ...AccountBreadCrumbsData,
    {
      label: 'View Source',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/crm-admin/accounts/sources/${id}/view`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Sources'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.CRM_ADMINISTRATION.ACCOUNTS.SOURCES.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link
              to={`/system-configuration/tenant-admin/crm-admin/accounts/sources/${id}/edit`}
            >
              {' '}
              <SvgComponent name={'EditIcon'} />{' '}
              <span className={styles.editsize}>Edit</span>
            </Link>
          </div>
        )}

        <div className="tablesContainer">
          <div className="leftTables">
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Details</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <td className="col2 no-data text-center">Data Loading</td>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td className="col1">Name</td>
                    <td className="col2">{sourceData?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="col1">Description</td>
                    <td className="col2">{sourceData?.description || 'N/A'}</td>
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
                      {' '}
                      {sourceData && (
                        <span
                          className={`${
                            sourceData?.is_active
                              ? styles.active
                              : styles.inactive
                          } ${styles.badge}`}
                        >
                          {sourceData?.is_active ? 'Active' : 'InActive'}
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="col1">Created</td>
                    <td className="col2">
                      {formatUser(sourceData?.created_by)}
                      {formatDateWithTZ(
                        sourceData?.created_at,
                        'MM-dd-yyyy | hh:mm a'
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="col1">Modified</td>
                    <td className="col2">
                      {formatUser(
                        sourceData?.modified_by !== null
                          ? sourceData?.modified_by
                          : sourceData?.created_by
                      )}
                      {formatDateWithTZ(
                        sourceData?.modified_at !== null
                          ? sourceData?.modified_at
                          : sourceData?.created_at,
                        'MM-dd-yyyy | hh:mm a'
                      )}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSources;
