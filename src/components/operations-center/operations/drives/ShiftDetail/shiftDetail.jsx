import React from 'react';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

export default function shiftDetail({ shiftDetailsData }) {
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">Shift Details</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="col1">Start Time</td>
          <td className={`col2`}>
            {formatDateWithTZ(shiftDetailsData?.start_time, 'hh:mm a')}
          </td>
        </tr>
        <tr>
          <td className="col1">End Time</td>
          <td className={`col2`}>
            {formatDateWithTZ(shiftDetailsData?.end_time, 'hh:mm a')}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
