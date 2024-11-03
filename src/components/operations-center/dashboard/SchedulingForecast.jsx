import React, { useEffect, useState } from 'react';
import LineMarkChart from '../../common/dashboards/line-mark-chart/LineMarkChart';
import styles from './SchedulingForecast.module.css';
import Styles from './styles.module.scss';
import moment from 'moment';
import SelectDropdown from '../../common/selectDropdown';
import { Col } from 'react-bootstrap';
import FormInput from '../../common/form/FormInput';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';

const dummyData = {
  total_goal: 19250,
  total_target: 21175,
  total_scheduled: 24750,
  total_deficit: 5500,
  total_onhold: 325,
  total_pg: 128.6,
  total_pt: 116.9,
  monthly_data: [
    {
      month: 'January',
      date: '2024-01-02 12:38:58.802057',
      goal: 60,
      target: 59,
      scheduled: 59,
      deficit: 59,
      onhold: 59,
      pg: 112,
      pt: 101.8,
    },
    {
      month: 'Februray',
      date: '2024-02-02 12:38:58.802057',
      goal: 60,
      target: 59,
      scheduled: 59,
      deficit: 59,
      onhold: 59,
      pg: 91.7,
      pt: 83.3,
    },
    {
      month: 'March',
      date: '2024-03-03 12:38:58.802057',
      goal: 60,
      target: 59,
      scheduled: 59,
      deficit: 59,
      onhold: 59,
      pg: 110,
      pt: 90,
    },
  ],
};

export const SchedulingForecast = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [data, setData] = useState(dummyData);
  const [pgData, setPgData] = useState([]);
  const [ptData, setPtData] = useState([]);
  const [dataForHover, setDataForHover] = useState([]);
  const [xAxisValues, setXAxisValues] = useState([]);
  const [viewAs, setViewAs] = useState({
    value: 'procedure',
    label: 'Procedure',
  });
  const [procedureType, setProcedureType] = useState();
  const [cushion, setCushion] = useState();
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    fetchData();
  }, [viewAs, procedureType, cushion]);

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
        value: filter.id,
        label: filter.name,
      });
    });
    setFilters(formattedFilters);
  };

  const fetchData = async () => {
    // UNCOMMENT THIS WHEN be ENDPOINT IS CREATED
    // const params = new URLSearchParams();
    // if (viewAs) {
    //   params.append('view', viewAs.value);
    // }
    // if(procedureType){
    //   params.append('procedure', procedureType.value);
    // }
    // if(cushion) {
    //   params.append('cushion', cushion);
    // }
    // params.append('current_date', new Date().toISOString());
    // const response = await makeAuthorizedApiRequest(
    //   'GET',
    //   `${BASE_URL}/operation-dashboard/forecast?${params.toString()}`
    // );
    // const res = await response.json();
    // const data = res.data;
    if (data) {
      const pgArray = [];
      const ptArray = [];
      const hoverArray = [];
      const tickValues = [];
      data.monthly_data.forEach((data) => {
        const pg = {
          x: moment(data.date).format('MMM[-]YY'),
          y: data.pg,
        };
        const pt = {
          x: moment(data.date).format('MMM[-]YY'),
          y: data.pt,
        };
        const hover = {
          x: moment(data.date).format('MMM[-]YY'),
          pg: data.pg,
          pt: data.pt,
          goal: data.goal,
          target: data.target,
          scheduled: data.scheduled,
          deficit: data.deficit,
          onHold: data.onhold,
        };
        pgArray.push(pg);
        ptArray.push(pt);
        hoverArray.push(hover);
        tickValues.push(moment(data.date).format('MMM[-]YY'));
      });
      setPgData(pgArray);
      setPtData(ptArray);
      setDataForHover(hoverArray);
      setXAxisValues(tickValues);
      setData(data);
    }
  };

  const handleViewAs = (selectedOption) => {
    if (selectedOption) {
      setViewAs(selectedOption);
    }
  };

  const handleProcedureType = (selectedOption) => {
    if (selectedOption) {
      setProcedureType(selectedOption);
    }
  };

  const handleInputChange = (e) => {
    setCushion(e.target.value);
  };
  return (
    <div className={styles.schedulingForecastContainer}>
      <div className={styles.titleAndFilters}>
        <div className={styles.title}>Scheduling Forecast</div>
        <form style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <FormInput
            name="cushion"
            displayName="Required Cushion {%}"
            type={'number'}
            value={cushion}
            classes={{ root: 'w-100' }}
            required={false}
            onChange={handleInputChange}
            min="0"
          />
          <Col className={Styles.filterBox}>
            <SelectDropdown
              name="procedure_type"
              placeholder={'Procedure Type'}
              showLabel={procedureType && 'Procedure Type'}
              selectedValue={procedureType}
              onChange={(selectedOption) => {
                handleProcedureType(selectedOption);
              }}
              options={filters}
              removeDivider
              removeTheClearCross={true}
            />
          </Col>
          <Col className={Styles.filterBox}>
            <SelectDropdown
              name="view_as"
              placeholder={'View As'}
              showLabel={viewAs && 'View As'}
              selectedValue={viewAs}
              onChange={(selectedOption) => {
                handleViewAs(selectedOption);
              }}
              options={[
                { value: 'procedure', label: 'Procedure' },
                { value: 'products', label: 'Product' },
              ]}
              removeDivider
              removeTheClearCross={true}
            />
          </Col>
        </form>
      </div>
      <div className={styles.totalsContainer}>
        <div className={styles.flexRowGap10}>
          <div className={styles.normalFont}>Goal:</div>
          <div className={styles.blueFont}>{data && data.total_goal}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div className={styles.normalFont}>Target:</div>
          <div className={styles.blueFont}>{data && data.total_target}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div className={styles.normalFont}>Schedule:</div>
          <div className={styles.blueFont}>{data && data.total_scheduled}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div className={styles.normalFont}>Deficit:</div>
          <div className={styles.blueFont}>{data && data.total_deficit}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div className={styles.normalFont}>On Hold:</div>
          <div className={styles.blueFont}>{data && data.total_onhold}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div
            style={{
              width: '16px',
              height: '8px',
              backgroundColor: '#005375',
              borderRadius: '10px',
            }}
          ></div>
          <div className={styles.normalFont}>P/G:</div>
          <div className={styles.blueFont}>{`${data && data.total_pg}%`}</div>
        </div>
        <div className={styles.flexRowGap10}>
          <div
            style={{
              width: '16px',
              height: '8px',
              backgroundColor: '#387DE5',
              borderRadius: '10px',
            }}
          ></div>
          <div className={styles.normalFont}>P/T:</div>
          <div className={styles.blueFont}>{`${data && data.total_pt}%`}</div>
        </div>
      </div>
      {/* we need this div relative wrapper so charts are responsive */}
      <div style={{ position: 'relative' }}>
        <LineMarkChart
          yAxisAdditionalChar={'%'}
          pgData={pgData}
          ptData={ptData}
          displayDataOnHover={true}
          xAxisType={'ordinal'}
          hoverData={dataForHover}
          tickValues={xAxisValues}
        />
      </div>
    </div>
  );
};
