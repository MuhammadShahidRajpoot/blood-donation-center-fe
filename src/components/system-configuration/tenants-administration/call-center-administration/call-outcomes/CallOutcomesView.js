import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import styles from './index.module.scss';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import { CallOutcomesBreadCrumbsDataCreateEdit } from '../call-outcomes/CallOutcomesBreadCrumbsData';
import TopBar from '../../../../common/topbar/index';
import SvgComponent from '../../../../common/SvgComponent';
import { formatUser } from '../../../../../helpers/formatUser';
import CheckPermission from '../../../../../helpers/CheckPermissions';

import Permissions from '../../../../../enums/PermissionsEnum';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

const ViewCallOutcomes = () => {
  const { id } = useParams();
  const [callOutcomeData, setCallOutcomeData] = useState({});
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async (id) => {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/call-outcomes/${id}`
      );
      let { data } = result.data;
      if (result.status === 200) {
        setCallOutcomeData(data);
      } else {
        toast.error('Error Fetching Call Outcomes Details', {
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
    ...CallOutcomesBreadCrumbsDataCreateEdit,
    {
      label: 'View Call Outcome',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/call-center-admin/call-outcomes/${id}/view`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Call Outcome'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />

      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.CALL_CENTER_ADMINISTRATION.CALL_OUTCOMES.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link
              to={`/system-configuration/tenant-admin/call-center-admin/call-outcomes/${id}/edit?page=view`}
            >
              <SvgComponent name="EditIcon" />
              <span>Edit</span>
            </Link>
          </div>
        )}
        <div className="tableView">
          <div className="tableViewInner" style={{ marginTop: '40px' }}>
            <div className="group">
              <div className="group-head">
                <h2>Call Outcomes Details</h2>
              </div>

              <div className={`group-body ${styles.groupRound}`}>
                <ul>
                  {isLoading ? (
                    <li>
                      <span className="right-data d-flex justify-content-center align-items-center">
                        <p className="m-0">Data Loading </p>
                      </span>
                    </li>
                  ) : (
                    <>
                      <li>
                        <span className="left-heading">Name</span>
                        <span className="right-data">
                          {callOutcomeData?.name || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Code</span>
                        <span className="right-data">
                          {callOutcomeData?.code || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Next Call Interval</span>
                        <span className="right-data">
                          {callOutcomeData?.next_call_interval || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Selected Color</span>
                        <span className="right-data">
                          <div
                            className={styles.colorIndicator}
                            style={{
                              backgroundColor:
                                callOutcomeData?.color || 'transparent',
                            }}
                          />
                          {callOutcomeData?.color || 'N/A'}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            <div className="group">
              <div className="group-head">
                <h2>Insights</h2>
              </div>
              <div className={`group-body ${styles.groupRound}`}>
                <ul>
                  {isLoading ? (
                    <li>
                      <span className="right-data d-flex justify-content-center align-items-center">
                        <p className="m-0">Data Loading </p>
                      </span>
                    </li>
                  ) : (
                    <>
                      <li>
                        <span className="left-heading">Status</span>
                        <span className="right-data">
                          {callOutcomeData?.is_active ? (
                            <span className="badge active"> Active </span>
                          ) : (
                            <span className="badge inactive"> Inactive </span>
                          )}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Created</span>
                        <span className="right-data">
                          {formatUser(callOutcomeData?.created_by)}
                          {formatDateWithTZ(callOutcomeData?.created_at)}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Modified</span>
                        <span className="right-data">
                          {formatUser(
                            callOutcomeData?.modified_by !== null
                              ? callOutcomeData?.modified_by
                              : callOutcomeData?.created_by
                          )}
                          {formatDateWithTZ(
                            callOutcomeData?.modified_at !== null
                              ? callOutcomeData?.modified_at
                              : callOutcomeData?.created_at
                          )}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ViewCallOutcomes;
