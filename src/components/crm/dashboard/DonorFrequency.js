import React, { useEffect, useState } from 'react';
import VerticalBarChart from '../../common/dashboards/vertical-bar-chart/VerticalBarChart';
import SelectDropdown from '../../common/selectDropdown';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import { Col } from 'react-bootstrap';
import Styles from './styles.module.scss';

const DonorFrequency = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState([]);
  const [procedureType, setProcedureType] = useState();
  const [selectedBloodTypes, setSelectedBloodTypes] = useState([]);

  const bloodTypes = [
    { id: 1, name: 'A positive', value: 'a_positive' },
    { id: 2, name: 'A negative', value: 'a_negative' },
    { id: 3, name: 'B positive', value: 'b_positive' },
    { id: 4, name: 'B negative', value: 'b_negative' },
    { id: 5, name: 'O positive', value: 'o_positive' },
    { id: 6, name: 'O negative', value: 'o_negative' },
    { id: 7, name: 'AB positive', value: 'ab_positive' },
    { id: 8, name: 'AB negative', value: 'ab_negative' },
  ];

  useEffect(() => {
    fetchFilters();
    fetchData();
  }, []);

  useEffect(() => {
    setSelectedBloodTypes(bloodTypes);
  }, []);

  const handleBloodTypeChange = (field) => {
    setSelectedBloodTypes((oldVal) => {
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
        value: filter.id,
        label: filter.name,
      });
    });
    setFilters(formattedFilters);
  };

  const fetchData = async () => {
    const data = [
      {
        year: 2019,
        donor_frequency: 1.5,
      },
      {
        year: 2020,
        donor_frequency: 2.0,
      },
      {
        year: 2021,
        donor_frequency: 0.8,
      },
      {
        year: 2022,
        donor_frequency: 1.2,
      },
      {
        year: 2023,
        donor_frequency: 1.6,
      },
    ];
    composeDataForChart(data);
  };

  const handleProcedureType = (selectedOption) => {
    if (selectedOption) {
      setProcedureType(selectedOption);
    }
  };

  const composeDataForChart = (data) => {
    const restructured = [
      {
        x: `${data[0].year}`,
        y: data[0].donor_frequency,
        color: '#4389F3',
      },
      {
        x: `${data[1].year}`,
        y: data[1].donor_frequency,
        color: '#73A3D0',
      },
      {
        x: `${data[2].year}`,
        y: data[2].donor_frequency,
        color: '#387DE5',
      },
      {
        x: `${data[3].year}`,
        y: data[3].donor_frequency,
        color: '#72A3D0',
      },
      {
        x: `${data[4].year}`,
        y: data[4].donor_frequency,
        color: '#91BDE9',
      },
    ];
    setData(restructured);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.flexColumnCenterAlign}>
        <h5 className={Styles.containerTitle}> Donor Frequency </h5>
        <form style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <Col className={Styles.filterBox}>
            <GlobalMultiSelect
              label="Blood Type"
              data={bloodTypes}
              selectedOptions={selectedBloodTypes}
              onSelectLabel={false}
              onChange={(val) => handleBloodTypeChange(val)}
              onSelectAll={(data) => setSelectedBloodTypes(data)}
            />
          </Col>
          <Col className={Styles.filterBox}>
            <SelectDropdown
              name="procedure_type"
              placeholder={'Procedure'}
              selectedValue={procedureType}
              onChange={(selectedOption) => {
                handleProcedureType(selectedOption);
              }}
              options={filters}
              removeDivider
              removeTheClearCross={true}
            />
          </Col>
        </form>
      </div>
      {/* we need this div relative wrapper so charts are responsive */}
      <div style={{ position: 'relative' }}>
        <VerticalBarChart data={data} yAxisAdditionalChar={'%'} />
      </div>
    </div>
  );
};
export default DonorFrequency;
