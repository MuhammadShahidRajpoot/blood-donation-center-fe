import React, { useEffect, useState } from 'react';
import './about.scss';
import '../../../../../styles/Global/Global.scss';
import '../../../../../styles/Global/Variable.scss';
import EquipmentsSection from './equipments';
import CertificationsSection from './certifications';
import CustomFieldsSection from './custom_fields';
import PickupDetailsSection from './pickup_details';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import DriveContactsSection from './driveContacts';
import DriveInsightsSection from './insights';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';

function About({ driveData, isLoading, getDriveData, modifiedData }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [OEF, setOEF] = useState({
    procedure: 0,
    product: 0,
  });

  // const [boolSatisfyName, setBoolSatisfyName] = useState(true);
  const [driveContactData, setDriveContactData] = useState([]);
  const id = useParams();
  const getStartEndTime = () => {
    driveData?.shifts?.map((item) => {
      if (startTime > item.start_time || startTime == 0) {
        let start_time = formatDateWithTZ(item?.start_time, 'hh:mm a');
        setStartTime(start_time);
      }
      if (endTime < item.end_time || endTime == 0) {
        let end_time = formatDateWithTZ(item?.end_time, 'hh:mm a');
        setEndTime(end_time);
      }
    });
  };

  const getdriveContactData = async (id) => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/contacts/${id?.id}`
      );
      const { data } = await result.json();
      console.log({ data });
      const new_data = data?.drive_contacts?.filter(
        (item) => item.role != null
      );
      console.log({ new_data });
      new_data ? setDriveContactData(new_data[0]) : setDriveContactData([]);
    } catch (error) {
      toast.error('Error fetching drive ');
    }
  };

  useEffect(() => {
    getdriveContactData(id);
  }, [id]);
  useEffect(() => {
    if (driveData?.shifts?.length) {
      getStartEndTime();
    }
  }, [getStartEndTime, driveData, startTime, endTime]);

  useEffect(() => {
    let totalOEFProcedure = 0;
    let totalOEFProduct = 0;
    driveData?.shifts?.map((shift) => {
      return setOEF({
        ...OEF,
        procedure: (totalOEFProcedure += shift.oef_procedures),
        product: (totalOEFProduct += shift.oef_products),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveData]);

  if (isLoading) return <p className="text-center">Data Loading</p>;

  // useEffect(() => {
  //   if (driveData?.shifts?.length) {
  //     setEndTime(moment(driveData?.shifts[0]?.end_time).format('hh:mm a'));
  //     setStartTime(moment(driveData?.shifts[0]?.start_time).format('hh:mm a'));
  //   }
  // }, [getStartEndTime, driveData]);

  return (
    <div className="tablesContainer">
      <div className="leftTables">
        <table className="viewTables">
          <thead>
            <tr>
              <th colSpan="2">Drive Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tableTD col1">Operation Date</td>
              <td className="tableTD col2">
                {' '}
                {`${moment(driveData?.drive?.date).format(
                  'dddd, MMM DD, YYYY'
                )}` || '-'}{' '}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Account</td>
              <td className="tableTD col2">
                <a
                  href={
                    driveData?.account?.name
                      ? `/crm/accounts/${driveData?.account?.id}/view/about`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="linkText"
                >
                  {driveData?.account?.name || 'N/A'}
                </a>
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Location Name</td>
              <td className="tableTD col2">
                <a
                  href={
                    driveData?.crm_locations?.name
                      ? `/crm/locations/${driveData?.crm_locations?.id}/view`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="linkText"
                >
                  {driveData?.crm_locations?.name || 'N/A'}
                </a>
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Primary Chairperson</td>
              <td className="tableTD col2">
                {/* {driveContactData?.record_id?.map((items, contactIndex) => {
                  return ( */}
                <a
                  key={`${driveContactData?.record_id?.[0]?.id}`}
                  href={
                    driveData?.crm_locations?.name
                      ? `/crm/contacts/volunteers/${driveContactData?.record_id?.[0]?.id}/view`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="linkText"
                >
                  {driveContactData?.record_id?.[0]?.first_name
                    ? `${driveContactData?.record_id?.[0]?.first_name} ${
                        driveContactData?.record_id?.[0]?.last_name || ''
                      }`
                    : 'N/A'}
                </a>
                {/* );
                })} */}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Chairperson Phone</td>
              <td className="tableTD col2 linkText">
                {driveContactData?.account_contacts?.map(
                  (items, contactIndex) => {
                    return items?.contactable_data?.map(
                      (item, recordIndexs) => {
                        if (item?.is_primary) {
                          if (item?.data?.includes('@')) {
                            return null;
                          } else {
                            return (
                              <a
                                key={`${contactIndex}-${recordIndexs}`}
                                href={`tel:+${item?.data}`}
                                rel="noreferrer"
                                className="linkText"
                              >
                                {item?.data ? item?.data : 'N/A'}
                              </a>
                            );
                          }
                        }
                      }
                    );
                  }
                ) || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Chairperson SMS</td>
              <td className="tableTD col2 linkText">
                {driveContactData?.account_contacts?.map(
                  (items, contactIndex) => {
                    return items?.contactable_data?.map(
                      (itemss, recordIndex) => {
                        if (itemss?.is_primary) {
                          if (itemss?.data?.includes('@')) {
                            return null;
                          } else {
                            return (
                              <a
                                key={`${contactIndex}-${recordIndex}`}
                                href={`tel:+${itemss?.data}`}
                                rel="noreferrer"
                                className="linkText"
                              >
                                {itemss?.data ? itemss?.data : 'N/A'}
                              </a>
                            );
                          }
                        }
                      }
                    );
                  }
                ) || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Chairperson Email</td>
              <td className="tableTD col2 linkText">
                {driveContactData?.account_contacts?.map(
                  (items, contactIndex) => {
                    return items?.contactable_data?.map(
                      (item, recordIndexs) => {
                        if (item?.is_primary) {
                          if (item?.data?.includes('@')) {
                            return (
                              <a
                                key={`${contactIndex}-${recordIndexs}`}
                                href={`mailto:+${item?.data}`}
                                rel="noreferrer"
                                className="linkText"
                              >
                                {item?.data ? item?.data : 'N/A'}
                              </a>
                            );
                          }
                        }
                      }
                    );
                  }
                ) || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Draw Hours</td>
              <td className="tableTD col2">{`${startTime} - ${endTime}`}</td>
            </tr>
            <tr>
              <td className="tableTD col1">Projection</td>
              <td className="tableTD col2">
                {(() => {
                  let totalProcedureQty = 0;
                  let totalProductYield = 0;

                  driveData?.shifts?.forEach((item) => {
                    item?.shifts_projections_staff?.forEach((xx) => {
                      totalProcedureQty += xx?.procedure_type_qty || 0;
                      totalProductYield += xx?.product_yield || 0;
                    });
                  });

                  return `${totalProcedureQty} / ${totalProductYield} `;
                })() || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1 bg-white">Drive Details: OEF</td>
              <td className="tableTD col2"></td>
            </tr>
            <tr>
              <td className="tableTD col1">Procedures</td>
              <td className="tableTD col2">
                {driveData?.drive?.oef_procedures || '0'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Products</td>
              <td className="tableTD col2">
                {driveData?.drive?.oef_products || '0'}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="viewTables">
          <thead>
            <tr>
              <th colSpan="2">Attributes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tableTD col1">Industry Category</td>
              <td className="tableTD col2">
                {driveData?.account?.industry_category?.name
                  ? driveData?.account?.industry_category?.name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Industry Subcategory</td>
              <td className="tableTD col2">
                {driveData?.account?.industry_subcategory?.name
                  ? driveData?.account?.industry_subcategory?.name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Collection Operation</td>
              <td className="tableTD col2">
                {driveData?.account?.collection_operation?.name
                  ? driveData?.account?.collection_operation?.name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Recruiter </td>
              <td className="tableTD col2">
                {driveData?.account?.recruiter?.first_name
                  ? driveData?.account?.recruiter?.first_name +
                    ' ' +
                    driveData?.account?.recruiter?.last_name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Territory</td>
              <td className="tableTD col2">
                {driveData?.account?.territory?.territory_name
                  ? driveData?.account?.territory?.territory_name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Affiliation</td>
              <td className="tableTD col2">
                {driveData?.account?.affiliations
                  ? driveData?.account?.affiliations
                      .map((item) => item.affiliation_data.name)
                      .join(', ')
                  : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>

        <DriveInsightsSection
          driveData={driveData}
          getDriveData={getDriveData}
          modifiedData={modifiedData}
        />
      </div>
      <div className="rightTables">
        <DriveContactsSection
          driveData={driveData}
          getDriveData={getDriveData}
        />
        <EquipmentsSection driveData={driveData} getDriveData={getDriveData} />
        <CertificationsSection
          driveData={driveData}
          getDriveData={getDriveData}
        />
        <CustomFieldsSection id={id?.id} />
        <PickupDetailsSection
          driveData={driveData}
          getDriveData={getDriveData}
        />
      </div>
    </div>
  );
}

export default About;
