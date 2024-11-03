import React from 'react';
import styles from '../index.module.scss';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

export default function StaffBreak({ shiftDetailsData }) {
  return (
    <table className="viewTables w-100 mt-3">
      <thead>
        <tr>
          <th colSpan="2" className={styles.projectionTableHeading}>
            Staff Break
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Start Time
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.break_start_time
              ? formatDateWithTZ(shiftDetailsData?.break_start_time, 'hh:mm a')
              : 'N/A'}
          </td>
        </tr>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            End Time
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.break_end_time
              ? formatDateWithTZ(shiftDetailsData?.break_end_time, 'hh:mm a')
              : 'N/A'}
          </td>
        </tr>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Reduce Slots
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {' '}
            {shiftDetailsData?.reduce_slots ? 'Yes' : 'No'}
          </td>
        </tr>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Appointment Reduction
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.reduction_percentage
              ? `${Math.round(shiftDetailsData?.reduction_percentage)}%`
              : 'N/A'}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
