import React, { useEffect, useState } from 'react';
import './about.scss';
import CustomFieldsSection from './custom_fields';
import PickupDetailsSection from './pickup_details';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import DriveInsightsSection from './insights';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

function SessionAboutView({ sessionData, isLoading }) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [customFieldsPresent, setCustomFieldsPresent] = useState(false);
  const id = useParams();
  console.log({ id });
  const getStartEndTime = () => {
    sessionData?.shifts?.map((item) => {
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
  useEffect(() => {
    if (sessionData?.shifts?.length) {
      getStartEndTime();
    }
  }, [getStartEndTime, sessionData, startTime, endTime]);

  useEffect(() => {
    const checkPresent = sessionData?.customFields?.find(
      (cf) => cf?.field_data && cf?.field_data !== 'N/A'
    );
    setCustomFieldsPresent(checkPresent);
  }, [sessionData]);
  if (isLoading) return <p className="text-center">Data Loading</p>;

  return (
    <div className="tablesContainer">
      <div className="leftTables">
        <table className="viewTables">
          <thead>
            <tr>
              <th colSpan="2">Session Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tableTD col1">Donor Center Name</td>
              <td className="tableTD col2 linkText">
                {sessionData?.donor_center?.name || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Session Date</td>
              <td className="tableTD col2">
                {moment(sessionData?.date).format('ddd, MMM DD, YYYY') || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Draw Hours</td>
              <td className="tableTD col2 linkText">{`${startTime} - ${endTime}`}</td>
            </tr>
            <tr>
              <td className="tableTD col1">Projection</td>
              <td className="tableTD col2 linkText">
                {(() => {
                  let totalProcedureQty = 0;
                  let totalProductYield = 0;

                  sessionData?.shifts?.forEach((item) => {
                    item?.projections?.forEach((xx) => {
                      totalProcedureQty += xx?.procedure_type_qty || 0;
                      totalProductYield += xx?.product_yield || 0;
                    });
                  });

                  return `${totalProcedureQty} / ${totalProductYield} `;
                })() || 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1 bg-white fw-500">
                Session Details: OEF
              </td>
              <td className="tableTD col2"></td>
            </tr>
            <tr>
              <td className="tableTD col1">Procedures</td>
              <td className="tableTD col2">
                {sessionData.oef_procedures || '0'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Products</td>
              <td className="tableTD col2">
                {sessionData.oef_products || '0'}
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
              <td className="tableTD col1">Promotion</td>
              <td className="tableTD col2">
                {sessionData?.promotions?.length
                  ? sessionData?.promotions?.map((item, index, array) => (
                      <React.Fragment key={item?.name}>
                        {item?.name}
                        {index !== array?.length - 1 && '\u00A0'}
                      </React.Fragment>
                    ))
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Collection Operation</td>
              <td className="tableTD col2">
                {sessionData?.collection_operation
                  ? sessionData?.collection_operation?.name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Industry Category</td>
              <td className="tableTD col2">
                {sessionData?.donor_center?.industry_category?.name
                  ? sessionData?.donor_center?.industry_category?.name
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="tableTD col1">Industry Subcategory</td>
              <td className="tableTD col2">
                {sessionData?.donor_center?.industry_sub_category.length
                  ? sessionData?.donor_center?.industry_sub_category?.map(
                      (item, index, array) => (
                        <React.Fragment key={item?.name}>
                          {item?.name}
                          {index !== array?.length - 1 && '\u00A0'}
                        </React.Fragment>
                      )
                    )
                  : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>

        <DriveInsightsSection sessionData={sessionData} />
      </div>
      <div className="rightTables">
        <CustomFieldsSection
          checkPresent={customFieldsPresent}
          customFields={sessionData?.customFields}
        />
        <PickupDetailsSection
          sessionData={sessionData}
          customFieldsPresent={customFieldsPresent}
        />
      </div>
    </div>
  );
}

export default SessionAboutView;
