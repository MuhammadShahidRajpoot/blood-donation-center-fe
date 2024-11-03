// import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SvgComponent from '../../../../../../common/SvgComponent';
import TopBar from '../../../../../../common/topbar/index';
import { getStageApi } from '../api.js';
import { formatUser } from '../../../../../../../helpers/formatUser';
import { AccountBreadCrumbsData } from '../../AccountBreadCrumbsData';
import CheckPermission from '../../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../../enums/PermissionsEnum';
import { formatDateWithTZ } from '../../../../../../../helpers/convertDateTimeToTimezone.js';

const ViewStage = () => {
  const { id } = useParams();
  const [view_tenant, setView_tenant] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const BreadcrumbsData = [
    ...AccountBreadCrumbsData,
    {
      label: 'View Stage',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/crm-admin/accounts/stages/${id}/view`,
    },
  ];
  useEffect(() => {
    fetchAllStages();
  }, [id]);

  const fetchAllStages = async () => {
    try {
      setIsLoading(true);
      const { data } = await getStageApi({ id });
      setView_tenant(data.data);
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: false });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Stage'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.CRM_ADMINISTRATION.ACCOUNTS.STAGES.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link
              className="dropdown-item"
              to={`/system-configuration/tenant-admin/crm-admin/accounts/stages/${id}/edit`}
              state={{
                edit: true,
              }}
            >
              <SvgComponent name="EditIcon" /> <span>Edit</span>
            </Link>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Stage Details</th>
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
                    <td className="col2"> {view_tenant?.name || 'N/A'} </td>
                  </tr>
                  <tr>
                    <td className="col1">Description</td>
                    <td className="col2">
                      {' '}
                      {view_tenant?.description || 'N/A'}{' '}
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
                      {view_tenant.is_active ? (
                        <span className="badge active">Active</span>
                      ) : (
                        <span className="badge inactive">InActive</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Created</td>
                    <td className="col2">
                      {formatUser(
                        view_tenant?.created_by ?? view_tenant?.created_by
                      )}
                      {formatDateWithTZ(
                        view_tenant?.created_at ?? view_tenant?.created_at,
                        'MM-dd-yyyy | hh:mm a'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Modified</td>
                    <td className="col2">
                      {formatUser(
                        view_tenant?.modified_by
                          ? view_tenant?.modified_by
                          : view_tenant?.created_by
                      )}{' '}
                      {formatDateWithTZ(
                        view_tenant?.modified_at
                          ? view_tenant?.modified_at
                          : view_tenant?.created_at,
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

export default ViewStage;
