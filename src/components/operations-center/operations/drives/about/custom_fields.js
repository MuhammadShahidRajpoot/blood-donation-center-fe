import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import moment from 'moment';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';

function CustomFieldsSection({
  id,
  datableType = PolymorphicType.OC_OPERATIONS_DRIVES,
  noMargin = false,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [customFields, setCustomFields] = useState();
  const fetchDatafun = async () => {
    const data = await axios.get(
      `${BASE_URL}/system-configuration/organization-administration/custom-fields/data?custom_field_datable_id=${id}&custom_field_datable_type=${datableType}`
    );
    if (data?.data?.data?.length) {
      setCustomFields(data?.data?.data);
    }
  };
  useEffect(() => {
    if (id) {
      fetchDatafun();
    }
  }, [id]);
  const checkPresent = customFields?.find(
    (cf) => cf?.field_data && cf?.field_data !== 'N/A'
  );
  return checkPresent ? (
    <>
      {customFields?.length && (
        <table
          className={`viewTables w-100 ${noMargin ? '' : 'mt-5'} shadow-0`}
        >
          <thead>
            <tr>
              <th colSpan="2">
                <div className="d-flex align-items-center justify-between w-100">
                  <span>Custom Fields</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {customFields?.length &&
              customFields?.map((item, index) => {
                return !item?.field_data ? null : (
                  <>
                    {item?.field_data !== 'null' && (
                      <tr key={item?.id}>
                        <td className="col1">{item?.field_id?.field_name}</td>

                        <td className="col2">
                          {item?.field_id?.field_data_type === '1'
                            ? moment(item?.field_data).format('MM-DD-YYYY')
                            : item?.field_data}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
          </tbody>
        </table>
      )}
    </>
  ) : null;
}

export default CustomFieldsSection;
