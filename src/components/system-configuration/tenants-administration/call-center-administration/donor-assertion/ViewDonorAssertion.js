import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, Link } from 'react-router-dom';
import styles from './index.module.scss';
import { makeAuthorizedApiRequestAxios } from '../../../../../helpers/Api';
import TopBar from '../../../../common/topbar/index';
import SvgComponent from '../../../../common/SvgComponent';
import { formatUser } from '../../../../../helpers/formatUser';
import CheckPermission from '../../../../../helpers/CheckPermissions';

import Permissions from '../../../../../enums/PermissionsEnum';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import { DonorAssertionsBreadCrumbsDataCreateEdit } from './DonorAssertionsBreadCrumbsData';

const ViewDonorAssertion = () => {
  const { id } = useParams();
  const [assertionsData, setAssertionsData] = useState({});
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async (id) => {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequestAxios(
        'GET',
        `${BASE_URL}/call-center/assertions/${id}`
      );
      let { data } = result.data;
      if (result.status === 200) {
        setAssertionsData(data);
      } else {
        toast.error('Error Fetching Assertion Details', {
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
    ...DonorAssertionsBreadCrumbsDataCreateEdit,
    {
      label: 'View Donor Assertion',
      class: 'active-label',
      link: `/system-configuration/tenant-admin/call-center-admin/donor-assertions/${id}/view`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Assertion'}
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
              to={`/system-configuration/tenant-admin/call-center-admin/donor-assertions/${id}/edit?page=view`}
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
                <h2>Donor Assertion Details</h2>
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
                        <span className="left-heading">Code</span>
                        <span className="right-data">
                          {assertionsData?.code || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Name</span>
                        <span className="right-data">
                          {assertionsData?.name || 'N/A'}
                        </span>
                      </li>

                      <li>
                        <span className="left-heading">Description</span>
                        <span className="right-data">
                          {assertionsData?.description || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Expires</span>
                        <span className="right-data">
                          {assertionsData?.is_expired ? 'Yes' : 'No' || 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">
                          Expiration Period (Months)
                        </span>
                        <span className="right-data">
                          {assertionsData?.expiration_months || 'N/A'}
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
                          {assertionsData?.is_active ? (
                            <span className="badge active"> Active </span>
                          ) : (
                            <span className="badge inactive"> Inactive </span>
                          )}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Created</span>
                        <span className="right-data">
                          {formatUser(assertionsData?.created_by)}
                          {formatDateWithTZ(assertionsData?.created_at)}
                        </span>
                      </li>
                      <li>
                        <span className="left-heading">Modified</span>
                        <span className="right-data">
                          {formatUser(
                            assertionsData?.modified_by !== null
                              ? assertionsData?.modified_by
                              : assertionsData?.created_by
                          )}
                          {formatDateWithTZ(
                            assertionsData?.modified_at !== null
                              ? assertionsData?.modified_at
                              : assertionsData?.created_at
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
export default ViewDonorAssertion;
