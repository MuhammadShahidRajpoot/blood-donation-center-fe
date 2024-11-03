import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../../../../../common/topbar/index';
import { formatUser } from '../../../../../../helpers/formatUser';
import { ResourcesManagementBreadCrumbsData } from '../ResourcesManagementBreadCrumbsData';
import { FACILITIES_PATH } from '../../../../../../routes/path';
import CheckPermission from '../../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../../enums/PermissionsEnum';
import {
  formatPhoneNumber,
  removeCountyWord,
} from '../../../../../../helpers/utils';
import ViewPhysicalAddress from '../../../../../common/ViewPhysicalAddress/ViewPhysicalAddress';
import SvgComponent from '../../../../../common/SvgComponent';
import CustomFieldsSection from '../../../../../operations-center/operations/drives/about/custom_fields';
import PolymorphicType from '../../../../../../enums/PolymorphicTypeEnum';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

const FacilityView = () => {
  const bearerToken = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [facility, setFacility] = useState({});
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDataById = async () => {
      setIsLoading(true);
      const result = await fetch(
        `${BASE_URL}/system-configuration/facilities/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();
      // data.created_at = formatDate(data.created_at);
      // data.updated_at = formatDate(data.updated_at);
      // setFacility({
      //   ...data[0],
      //   modified_by: data.modified_by,
      //   modified_at: data.modified_at,
      // });
      setFacility(data[0]);
      setIsLoading(false);
    };
    getDataById();
  }, []);

  const BreadCrumbsData = [
    ...ResourcesManagementBreadCrumbsData,
    {
      label: 'View Facility',
      class: 'active-label',
      link: FACILITIES_PATH.VIEW.replace(':id', id),
    },
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadCrumbsData}
        BreadCrumbsTitle={'Facilities'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        {CheckPermission([
          Permissions.ORGANIZATIONAL_ADMINISTRATION.RESOURCES.FACILITIES.WRITE,
        ]) && (
          <div className="editAnchor">
            <Link
              to={`/system-configuration/resource-management/facilities/${facility.id}`}
            >
              <SvgComponent name={'EditIcon'} />
              <span>Edit</span>
            </Link>
          </div>
        )}
        <div className="tablesContainer">
          <div className="leftTables">
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Facility Details</th>
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
                    <td className="col2"> {facility?.name || 'N/A'} </td>
                  </tr>
                  <tr>
                    <td className="col1">Alternate Name</td>
                    <td className="col2">
                      {' '}
                      {facility?.alternate_name || 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Physical Address</td>
                    <td className="col2">
                      <ViewPhysicalAddress address={facility?.address} />
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">County</td>
                    <td className="col2">
                      {removeCountyWord(facility?.address?.county) || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Phone</td>
                    <td className="col2">
                      {(facility?.phone &&
                        formatPhoneNumber(facility?.phone)) ||
                        'N/A'}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
            <table className="viewTables">
              <thead>
                <tr>
                  <th colSpan="2">Attributes</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <td className="col2 no-data text-center">Data Loading</td>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td className="col1">BECS Code</td>
                    <td className="col2"> {facility?.code || 'N/A'} </td>
                  </tr>
                  <tr>
                    <td className="col1">Collection Operation</td>
                    <td className="col2">
                      {' '}
                      {facility?.collection_operation?.name || 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Industry Category</td>
                    <td className="col2">
                      {' '}
                      {facility?.industry_category?.name || 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Industry SubCategory</td>
                    <td className="col2">
                      {' '}
                      {facility?.industry_sub_category[0]?.name || 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Donor Center</td>
                    <td className="col2">
                      {' '}
                      {facility?.donor_center ? 'Yes' : 'No'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Staging Site</td>
                    <td className="col2">
                      {facility.staging_site ? 'Yes' : 'No'}
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
                      {facility?.status ? (
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
                      {facility?.created_by
                        ? formatUser(facility?.created_by)
                        : 'N/A |'}{' '}
                      {facility?.created_at
                        ? formatDateWithTZ(
                            facility?.created_at,
                            'MM-dd-yyyy | hh:mm a'
                          )
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Modified</td>
                    <td className="col2">
                      {' '}
                      {facility?.modified_by
                        ? formatUser(facility?.modified_by)
                        : 'N/A |'}{' '}
                      {facility?.modified_at || facility?.created_at
                        ? formatDateWithTZ(
                            facility?.modified_at
                              ? facility?.modified_at
                              : facility?.created_at,
                            'MM-dd-yyyy | hh:mm a'
                          )
                        : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="rightTables">
            <CustomFieldsSection
              datableType={PolymorphicType.CRM_DONOR_CENTERS}
              id={id}
              noMargin={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityView;
