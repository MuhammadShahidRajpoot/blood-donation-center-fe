import React from 'react';

function CustomFieldsSection({ customFields, checkPresent }) {
  return checkPresent ? (
    <>
      <table className="viewTables">
        <thead>
          <tr>
            <th colSpan="5">
              <div className="d-flex align-items-center justify-between w-100">
                <span>Custom Fields</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {customFields?.length ? (
            customFields?.map((item, index) => {
              return !item?.field_data || item?.field_data === 'N/A' ? null : (
                <>
                  <tr key={item?.id}>
                    <td className="col1">{item?.field_id?.field_name}</td>

                    <td className="col2">
                      {item?.field_data?.includes('"')
                        ? item?.field_data
                        : item?.field_data}
                    </td>
                  </tr>
                </>
              );
            })
          ) : (
            <tr>
              <td>No Data Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  ) : null;
}

export default CustomFieldsSection;
