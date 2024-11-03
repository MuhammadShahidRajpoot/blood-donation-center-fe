import React, { useEffect, useState } from 'react';
// import { toast } from "react-toastify";
import { useParams } from 'react-router-dom';
import TopBar from '../../../../../common/topbar/index';
import { formatUser } from '../../../../../../helpers/formatUser';
import {
  SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
  SYSTEM_CONFIGURATION_PATH,
} from '../../../../../../routes/path';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import axios from 'axios';
import SvgComponent from '../../../../../common/SvgComponent';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

const ViewBusinessUnit = () => {
  const { id } = useParams();
  // eslint-disable-next-line
  const [orgData, setOrgData] = useState({});
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate();
  const bearerToken = localStorage.getItem('token');
  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, BASE_URL]);

  const loadData = async (id) => {
    setIsLoading(true);
    const response = await axios.get(`${BASE_URL}/business_units/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${bearerToken}`,
      },
    });

    const statusCode = response.status;
    const data = response.data;
    if (statusCode === 200) {
      setOrgData(data);
    }
    setIsLoading(false);
  };

  // const handleRedirect = () => {
  //   navigate(`${BUSINESS_UNIT_PATH.EDIT.replace(':id',id)}`)
  // }

  const BreadcrumbsData = [
    {
      label: 'System Configurations',
      class: 'disable-label',
      link: SYSTEM_CONFIGURATION_PATH,
    },
    {
      label: 'Organizational Administration',
      class: 'disable-label',
      link: SC_ORGANIZATIONAL_ADMINISTRATION_PATH,
    },
    {
      label: 'Hierarchy',
      class: 'disable-label',
      link: '/system-configuration/organizational-levels',
    },
    {
      label: 'Business Units',
      class: 'disable-label',
      link: '/system-configuration/hierarchy/business-units',
    },
    {
      label: 'View',
      class: 'active-label',
      link: `/system-configuration/hierarchy/business-units/view/${id}`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Business Units'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.HIERARCHY.BUSINESS_UNITS
            .WRITE,
        ]) && (
          <div className="editAnchor">
            <a href={`/system-configuration/business-unit/edit/${id}`}>
              <SvgComponent name={'EditIcon'} />
              <span>Edit</span>
            </a>
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
                    <td className="col2">{orgData?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="col1">Parent</td>
                    <td className="col2">
                      {orgData?.parent_level?.name || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Organizational Level</td>
                    <td className="col2">
                      {orgData?.organizational_level_id?.name || 'N/A'}
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
                      {' '}
                      {orgData?.is_active ? (
                        <span className="badge active"> Active </span>
                      ) : (
                        <span className="badge inactive"> Inactive </span>
                      )}{' '}
                    </td>
                  </tr>

                  <tr>
                    <td className="col1">Created</td>
                    <td className="col2">
                      {' '}
                      {orgData && orgData?.created_by && orgData?.created_at ? (
                        <>
                          {formatUser(orgData?.created_by)}
                          {formatDateWithTZ(
                            orgData?.created_at,
                            'MM-dd-yyyy | hh:mm a'
                          )}
                        </>
                      ) : (
                        ''
                      )}{' '}
                    </td>
                  </tr>

                  <tr>
                    <td className="col1">Modified</td>
                    <td className="col2">
                      {' '}
                      <>
                        {formatUser(
                          orgData?.modified_by
                            ? orgData?.modified_by
                            : orgData?.created_by
                        )}
                        {formatDateWithTZ(
                          orgData?.modified_at
                            ? orgData?.modified_at
                            : orgData?.created_at,
                          'MM-dd-yyyy | hh:mm a'
                        )}
                      </>
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

export default ViewBusinessUnit;
