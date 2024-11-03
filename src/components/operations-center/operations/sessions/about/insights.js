import React, { useState } from 'react';
import { formatUser } from '../../../../../helpers/formatUser';
import { formatDate } from '../../../../../helpers/formatDate';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import './about.scss';
import { covertDatetoTZDate } from '../../../../../helpers/convertDateTimeToTimezone';

function DriveInsightsSection({ sessionData }) {
  const { id } = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    getFillRateAndFilled();
  }, [id]);

  const getFillRateAndFilled = async () => {
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/operations/sessions/shifts/about/${id}`
    );
    const data = await response?.json();
    setFilled(data?.data);
  };

  return (
    <>
      <table className="viewTables">
        <thead>
          <tr>
            <th colSpan="2">Insights</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="tableTD col1">Status</td>
            <td className="tableTD col2">
              {sessionData?.operation_status_id ? (
                <span
                  className={`badge ${sessionData?.operation_status?.chip_color}`}
                >
                  {sessionData?.operation_status?.name}
                </span>
              ) : (
                'N/A'
              )}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Slots (Filled/Capacity)</td>
            <td className="tableTD col2">
              {filled?.filled_slots} / {filled?.total_slots}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Fill Rate</td>
            <td className="tableTD col2">
              {`${((filled?.filled_slots / filled?.total_slots) * 100).toFixed(
                2
              )}%`}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Created</td>
            <td className="tableTD col2">
              {formatUser(sessionData.created_by)}{' '}
              {formatDate(covertDatetoTZDate(sessionData.created_at))}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Modified</td>
            <td className="tableTD col2">
              {formatUser(sessionData?.modified_by)}{' '}
              {formatDate(covertDatetoTZDate(sessionData?.modified_at))}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default DriveInsightsSection;
