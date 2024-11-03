import React from 'react';
import styles from '../Session.module.scss';

export default function Resources({ shiftDetailsData }) {
  return (
    <table className="viewTables w-100 ">
      <thead>
        <tr>
          <th colSpan="2" className={styles.projectionTableHeading}>
            Resources
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Staff Setup
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.projections?.length
              ? shiftDetailsData?.projections?.map((item, index) => (
                  <>
                    {item?.staff_setup?.[0]?.name}
                    {index !== shiftDetailsData?.staff_setup?.length - 1
                      ? ', '
                      : ''}
                  </>
                ))
              : 'N/A'}
          </td>
        </tr>

        <tr>
          <td className={styles.projectName} style={{ width: '40%' }}>
            Devices
          </td>
          <td className={`${styles.projectName} bg-white`}>
            {shiftDetailsData?.devices?.length
              ? shiftDetailsData?.devices?.map((item, index) => (
                  <>
                    {item?.name}
                    {index !== shiftDetailsData?.devices?.length - 1
                      ? ', '
                      : ''}
                  </>
                ))
              : 'N/A'}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
