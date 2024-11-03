import React from 'react';
import styles from '../Session.module.scss';

export default function Projection({ shiftDetailsData }) {
  return (
    <table className="viewTables w-100">
      <thead>
        <tr>
          <th colSpan="5" className={styles.projectionTableHeading}>
            <span>Projection(s)</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <table>
          <thead></thead>
          <tbody>
            <div className="d-flex mobile-wrap">
              <div className="flex-grow-1">
                <table className="">
                  <thead>
                    <tr>
                      <th className={styles.projectionHeading}>
                        <span>Procedure Type</span>
                      </th>
                      <th className={styles.projectionHeading}>Qty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shiftDetailsData?.projections?.length &&
                      shiftDetailsData?.projections?.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className={styles.projectName}>
                              {' '}
                              {item?.procedure_type?.name}
                            </td>
                            <td className={styles.projectQty}>
                              {item?.procedure_type_qty}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="flex-grow-1">
                <table className="">
                  <thead>
                    <tr>
                      <th className={styles.projectionHeading}>Product Type</th>
                      <th className={styles.projectionHeading}>Qty</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shiftDetailsData?.projections?.length &&
                      shiftDetailsData?.projections?.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className={styles.projectName}>
                              {' '}
                              {
                                item?.procedure_type
                                  ?.procedure_types_products?.[0]?.products
                                  ?.name
                              }
                            </td>
                            <td className={styles.projectQty}>
                              {item?.product_yield}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </tbody>
        </table>
      </tbody>
    </table>
  );
}
