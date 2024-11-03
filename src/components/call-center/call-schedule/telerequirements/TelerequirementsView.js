import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
//import styles from './call-jobs.module.scss';
import { makeAuthorizedApiRequestAxios } from '../../../../helpers/Api';
import { CallJobsBreadCrumbsData } from './CallJobsBreadCrumbsData';
import TopBar from '../../../common/topbar/index';
//import AssignAgentsPopUpModal from './assign-agents/AssignAgents';
import SvgComponent from '../../../common/SvgComponent';
import { formatDate, formatCustomDate } from '../../../../helpers/formatDate';
import { formatUser } from '../../../../helpers/formatUser';
import CheckPermission from '../../../../helpers/CheckPermissions';

import Permissions from '../../../../enums/PermissionsEnum';

const CallJobsView = () => {
  const { id } = useParams();
  const [callJobData, setCallJobData] = useState({});
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);

  // const [isAssignedModal, setIsAssignedModal] = useState(false);
  // const [assignAgentsModalData] = useState(null);

  useEffect(() => {
    const getData = async (id) => {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/call-jobs/${id}`
      );
      let { data } = result.data;
      if (result.status === 200) {
        setCallJobData(data);
      } else {
        toast.error('Error Fetching Call Jobs Details', {
          autoClose: 3000,
        });
      }
      setIsLoading(false);
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  const BreadcrumbsData = [
    ...CallJobsBreadCrumbsData,
    {
      label: 'View Call Job',
      class: 'active-label',
      link: `/call-center/schedule/call-job/${id}/view`,
    },
  ];

  console.log('callJobData', callJobData);
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Call Job'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />

      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link to={`/call-center/schedule/call-jobs/${id}/edit`}>
              <SvgComponent name="EditIcon" />
              <span>Edit</span>
            </Link>
          </div>
        )}

        <div className="mainContentInner viewForm crm-viewForm aboutAccountMain">
          <div className="left-section">
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Job Details</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="tableTD col1">Job Type</td>
                  <td className="tableTD col2">
                    {' '}
                    {callJobData?.name || 'N/A'}{' '}
                  </td>
                </tr>
                <tr>
                  <td className="tableTD col1">Name</td>
                  <td className="tableTD col2">
                    {callJobData?.alternate_name || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="tableTD col1">Job Start Date</td>
                  <td className="tableTD col2">{callJobData?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="tableTD col1">Drive Date</td>
                  <td className="tableTD col2">{callJobData?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="tableTD col1">Job Size</td>
                  <td className="tableTD col2 linkText">
                    {callJobData?.name || 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="tableContainer">{/* <PreferencesSection /> */}</div>
            <table className="viewTables w-100">
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
                    <td className="tableTD col1">Status</td>
                    <td className="tableTD col2">
                      {callJobData?.is_active ? (
                        <span className="badge active">Active</span>
                      ) : (
                        <span className="badge inactive">Inactive</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Created</td>
                    <td className="tableTD col2">
                      {callJobData?.created_at && callJobData?.created_by ? (
                        <>
                          {formatUser(callJobData?.created_by)}
                          {formatDate(callJobData?.created_at)}
                        </>
                      ) : null}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Modified</td>
                    <td className="tableTD col2">
                      {formatUser(
                        callJobData?.modified_by ?? callJobData?.created_by
                      )}
                      {formatCustomDate(
                        callJobData?.modified_at ?? callJobData?.created_at
                      )}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="right-section">
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Donation Locations</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="tableTD col2">
                    {' '}
                    {callJobData?.name || 'N/A'}{' '}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="tableContainer">{/* <PreferencesSection /> */}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CallJobsView;
