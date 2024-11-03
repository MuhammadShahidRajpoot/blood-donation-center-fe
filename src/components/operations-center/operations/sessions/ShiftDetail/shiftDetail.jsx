import React from 'react';
import styles from '../Session.module.scss';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

export default function shiftDetail({ shiftDetailsData }) {
  return (
    <table className="viewTables w-100 ">
      <thead>
        <tr>
          <th colSpan="2" className={styles.projectionTableHeading}>
            Shift Details
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Start Time
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.start_time
              ? formatDateWithTZ(shiftDetailsData?.start_time, 'hh:mm a')
              : 'N/A'}
          </td>
        </tr>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            End Time
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.end_time
              ? formatDateWithTZ(shiftDetailsData?.end_time, 'hh:mm a')
              : 'N/A'}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
