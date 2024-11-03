import React, { useEffect, useState } from 'react';
// import moment from 'moment/moment';
import './about.scss';
import '../../../../styles/Global/Global.scss';
import '../../../../styles/Global/Variable.scss';
import ContactsSection from './contacts';
import PreferencesSection from './preferences';
import AffiliationsSection from './affiliations';
import { formatCustomDate, formatDate } from '../../../../helpers/formatDate';
import { formatUser } from '../../../../helpers/formatUser';
import { removeCountyWord } from '../../../../helpers/utils';
import ViewPhysicalAddress from '../../../common/ViewPhysicalAddress/ViewPhysicalAddress';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../../helpers/Api';
import { toast } from 'react-toastify';
import moment from 'moment';
import CustomFieldsSection from '../../../operations-center/operations/drives/about/custom_fields';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

function About({ accountData, isLoading, customFields }) {
  const { account_id } = useParams();
  const [drive, setDrive] = useState([]);
  const [active, setActive] = useState(true);
  useEffect(() => {
    getDriveLocation();
  }, [account_id, active]);
  const getDriveLocation = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/accounts/drive/${account_id}?active=${active}`
      );
      const latestDrive = data?.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0];
      setDrive(latestDrive);
    } catch (err) {
      toast.error('error fetching account base Drives');
    }
  };
  return (
    <div className="mainContentInner viewForm crm-viewForm aboutAccountMain">
      <div className="left-section">
        <table className="viewTables">
          <thead>
            <tr>
              <th colSpan="2">Account Details</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              <td className="col2 no-data text-center">Data Loading</td>
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td className="tableTD col1">Name</td>
                <td className="tableTD col2"> {accountData?.name || 'N/A'} </td>
              </tr>
              <tr>
                <td className="tableTD col1">Alternate Name</td>
                <td className="tableTD col2">
                  {accountData?.alternate_name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Mailing Address</td>
                <td className="tableTD col2">
                  <ViewPhysicalAddress address={accountData?.address} />
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">County</td>
                <td className="tableTD col2">
                  {removeCountyWord(accountData?.address?.county || 'N/A')}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Website</td>
                <td
                  className={`tableTD col2 ${
                    accountData?.website ? 'linkText' : ''
                  }`}
                >
                  {accountData?.website ? (
                    <a
                      href={accountData?.website || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="linkText"
                    >
                      {accountData?.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Facebook</td>
                <td
                  className={`tableTD col2 ${
                    accountData?.facebook ? 'linkText' : ''
                  }`}
                >
                  {accountData?.facebook ? (
                    <a
                      href={accountData?.facebook || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="linkText"
                    >
                      {accountData?.facebook}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </table>
        <table className="viewTables w-100">
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
                <td className="tableTD col1">BECS code</td>
                <td className="tableTD col2">
                  {' '}
                  {accountData?.becs_code || 'N/A'}{' '}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Industry Category</td>
                <td className="tableTD col2">
                  {accountData?.industry_category?.name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Industry Subcategory</td>
                <td className="tableTD col2">
                  {accountData?.industry_subcategory?.name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Stage</td>
                <td className="tableTD col2">
                  {' '}
                  {accountData?.stage?.name || 'N/A'}{' '}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Source</td>
                <td className="tableTD col2">
                  {accountData?.source?.name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Recruiter </td>
                <td className="tableTD col2">
                  {accountData?.recruiter?.first_name
                    ? `${accountData?.recruiter?.first_name} ${
                        accountData?.recruiter?.last_name || ''
                      }`
                    : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Territory</td>
                <td className="tableTD col2">
                  {accountData?.territory?.territory_name || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Collection Operation</td>
                <td className="tableTD col2">
                  {accountData?.collection_operation?.name || 'N/A'}
                </td>
              </tr>
            </tbody>
          )}
        </table>
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
                  {accountData?.is_active ? (
                    <span className="badge active">Active</span>
                  ) : (
                    <span className="badge inactive">Inactive</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">RSMO</td>
                <td className="tableTD col2">
                  {accountData?.RSMO ? 'Yes' : 'No'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Population</td>
                <td className="tableTD col2">
                  {accountData?.population || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Created</td>
                <td className="tableTD col2">
                  {/* {`${accountData?.created_by?.first_name} ${
                  accountData?.created_by?.last_name || ''
                } | ${moment(accountData?.created_at).format(
                  'MMM DD, YYYY'
                )} | ${moment(accountData?.created_at).format('hh:mm')}`} */}
                  {accountData?.created_at && accountData?.created_by ? (
                    <>
                      {formatUser(accountData?.created_by)}
                      {formatDate(accountData?.created_at)}
                    </>
                  ) : null}
                </td>
              </tr>
              <tr>
                <td className="tableTD col1">Modified</td>
                <td className="tableTD col2">
                  {formatUser(
                    accountData?.modified_by ?? accountData?.created_by
                  )}
                  {formatCustomDate(
                    accountData?.modified_at ?? accountData?.created_at
                  )}
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <div className="right-section">
        <div className="tableContainer">
          <ContactsSection />
        </div>
        <div className="tableContainer">
          <AffiliationsSection
            collection_operation={accountData?.collection_operation.id}
          />
        </div>
        <div className="tableContainer">
          <table className="viewTables contactViewTable">
            <thead>
              <tr>
                <th colSpan="15">
                  <span>Locations</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="tabs">
                <td colSpan={active === true ? 15 : 14} className="pb-0">
                  <div className="filterBar p-0">
                    <div className="tabs border-0 mb-0">
                      <ul>
                        <li>
                          <Link
                            onClick={() => setActive(true)}
                            className={active === true ? 'active' : 'fw-medium'}
                          >
                            Active
                          </Link>
                        </li>
                        <li>
                          <Link
                            onClick={() => setActive(false)}
                            className={
                              active === false ? 'active' : 'fw-medium'
                            }
                          >
                            Inactive
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="headings">
                <td>
                  <span className="fw-500">Building-Room</span>
                </td>
                <td>
                  <span className="fw-500">Inspected</span>
                </td>
                <td>
                  <span className="fw-500">Last Drive</span>
                </td>
              </tr>
              {drive ? (
                <tr key={drive?.id} className="data">
                  <td>{drive?.location?.name}</td>
                  <td>
                    {drive?.location?.qualification_status === 'Qualified' ? (
                      <span
                        style={{
                          color: '#5CA044',
                          fontSize: '22px',
                          marginRight: '5px',
                        }}
                      >
                        &#x2022;
                      </span>
                    ) : drive?.location?.qualification_status === 'Expired' ? (
                      <span
                        style={{
                          color: '#FF0000',
                          fontSize: '22px',
                          marginRight: '5px',
                        }}
                      >
                        &#x2022;
                      </span>
                    ) : drive?.location?.qualification_status ===
                      'Not Qualified' ? (
                      <span
                        style={{
                          color: '#F4C2C2',
                          fontSize: '22px',
                          marginRight: '5px',
                        }}
                      >
                        &#x2022;
                      </span>
                    ) : null}
                    {drive?.location?.qualification_status}
                  </td>
                  <td>{moment(drive?.date).format('YYYY-MM-DD')}</td>
                </tr>
              ) : (
                <tr colSpan="15" className="headings">
                  <td colSpan="15" className="text-center">
                    No locations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="tableContainer">
          <PreferencesSection />
        </div>
        <CustomFieldsSection
          datableType={PolymorphicType.CRM_ACCOUNTS}
          id={account_id}
          noMargin={true}
        />
      </div>
    </div>
  );
}

export default About;
