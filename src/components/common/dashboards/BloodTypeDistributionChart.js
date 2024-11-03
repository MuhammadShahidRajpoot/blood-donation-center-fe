import React, { useEffect, useState } from 'react';
import VerticalBarChart from './vertical-bar-chart/VerticalBarChart';
import GlobalMultiSelect from '../GlobalMultiSelect';
import Styles from './styles.module.scss';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';

export const BloodTypeDistributionChart = ({
  orgLevels,
  dates,
  viewAs,
  totalDonors,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [procedureOptions, setProcedureOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, [procedureOptions, orgLevels, dates, viewAs, totalDonors]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/procedure_types`
    );
    const res = await response.json();
    const data = res.data;
    const formattedFilters = [];
    data?.forEach((filter) => {
      formattedFilters.push({
        id: filter.id,
        name: filter.name,
      });
    });
    setFilters(formattedFilters);
  };

  const fetchData = async () => {
    // const data = {
    //   total_donors: 133,
    //   o_positive: 25,
    //   o_negative: 12,
    //   b_positive: 22,
    //   b_negative: 9,
    //   a_positive: 15,
    //   a_negative: 22,
    //   ab_positive: 10,
    //   ab_negative: 18,
    // };
    // composeDataForChart(data);

    // UNCOMMENT THIS WHEN be ENDPOINT IS CREATED

    const params = new URLSearchParams();
    if (procedureOptions.length > 0) {
      const formatted = [];
      procedureOptions.forEach((procedure) => {
        formatted.push(procedure.id);
      });
      params.append('procedures', formatted);
    }
    if (dates) {
      const startDate = dates.start_date;
      const endDate = dates.end_date;
      const tzOffset = startDate.getTimezoneOffset(); // Get the time zone offset in minutes
      startDate.setMinutes(startDate.getMinutes() - tzOffset);
      params.append('start_date', startDate.toISOString());
      params.append('end_date', endDate.toISOString());
    } else {
      const today = new Date();
      const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      const tzOffset = firstDayOfMonth.getTimezoneOffset();
      firstDayOfMonth.setMinutes(firstDayOfMonth.getMinutes() - tzOffset);
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );
      lastDayOfMonth.setMinutes(lastDayOfMonth.getMinutes() - tzOffset);
      params.append('start_date', firstDayOfMonth.toISOString());
      params.append('end_date', lastDayOfMonth.toISOString());
    }
    // organizational_levels should also be required
    // initial value should be the org.level of the currently logged in user - TO BE IMPLEMENTED
    if (orgLevels) {
      params.append('organizational_level', orgLevels);
    }
    if (viewAs) {
      params.append('view_as', viewAs.value);
    }
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/operation-dashboard/blood-type?${params.toString()}`
    );
    const data = await response.json();
    composeDataForChart(data.data);
  };

  const composeDataForChart = (data) => {
    const restructured = [
      {
        x: 'O-',
        y:
          data && data.o_negative && totalDonors
            ? Math.floor((data.o_negative / totalDonors) * 100)
            : 0,
        color: '#4389F3',
      },
      {
        x: 'O+',
        y:
          data && data.o_positive && totalDonors
            ? Math.floor((data.o_positive / totalDonors) * 100)
            : 0,
        color: '#73A3D0',
      },
      {
        x: 'B-',
        y:
          data && data.b_negative && totalDonors
            ? Math.floor((data.b_negative / totalDonors) * 100)
            : 0,
        color: '#91BDE9',
      },
      {
        x: 'B+',
        y:
          data && data.b_positive && totalDonors
            ? Math.floor((data.b_positive / totalDonors) * 100)
            : 0,
        color: '#25A4D8',
      },
      {
        x: 'A-',
        y:
          data && data.a_negative && totalDonors
            ? Math.floor((data.a_negative / totalDonors) * 100)
            : 0,
        color: '#56BDE7',
      },
      {
        x: 'A+',
        y:
          data && data.a_positive && totalDonors
            ? Math.floor((data.a_positive / totalDonors) * 100)
            : 0,
        color: '#BACFEC',
      },
      {
        x: 'AB+',
        y:
          data && data.ab_positive && totalDonors
            ? Math.floor((data.ab_positive / totalDonors) * 100)
            : 0,
        color: '#5D8AE1',
      },
      {
        x: 'AB-',
        y:
          data && data.ab_negative && totalDonors
            ? Math.floor((data.ab_negative / totalDonors) * 100)
            : 0,
        color: '#8F9BFF',
      },
    ];
    setData(restructured);
  };

  const handleDataChange = (field) => {
    setProcedureOptions((oldVal) => {
      const exists =
        oldVal.findIndex((c) => {
          return c.id === field.id;
        }) !== -1;

      if (exists) {
        return oldVal.filter((c) => {
          return c.id !== field.id;
        });
      } else {
        const result = [...oldVal];
        result.push(field);
        return result;
      }
    });
  };

  return (
    <div className={Styles.bloodTypeDistributionWrapper}>
      <div className={Styles.flexColumnCenterAlign}>
        <h5 className={Styles.bloodTypeDistributionTitle}>
          Blood Type Distribution
        </h5>
        <div className="form-field">
          <GlobalMultiSelect
            label="Procedure"
            data={filters}
            selectedOptions={procedureOptions}
            onSelectLabel={false}
            onChange={(val) => handleDataChange(val)}
            onSelectAll={(data) => setProcedureOptions(data)}
          />
        </div>
      </div>
      {/* we need this div relative wrapper so charts are responsive */}
      <div style={{ position: 'relative' }}>
        <VerticalBarChart
          data={data}
          yAxisAdditionalChar={'%'}
          height={'300px'}
        />
      </div>
    </div>
  );
};
