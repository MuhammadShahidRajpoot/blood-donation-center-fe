/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { RadialChart } from 'react-vis';
import 'react-vis/dist/style.css';
import Styles from './pieChart.module.scss';
import GlobalMultiSelect from '../../GlobalMultiSelect';
import ToolTip from '../../tooltip';

const PieChart = ({ groups, title, showFilter, chartData }) => {
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

  const handleDataChange = (field) => {
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

  useEffect(() => {
    // all blood types should be selected initially
    setSelectedBloodTypes(bloodTypes);
  }, []);
  return (
    <div className={Styles.pieChartContainer}>
      <div className={Styles.flexColumnCenterAlign}>
        <h5 className={Styles.containerTitle}> {title}</h5>
        {showFilter && (
          <div className="form-field">
            <GlobalMultiSelect
              label="Blood Type"
              data={bloodTypes}
              selectedOptions={selectedBloodTypes}
              onSelectLabel={false}
              onChange={(val) => handleDataChange(val)}
              onSelectAll={(data) => setSelectedBloodTypes(data)}
            />
          </div>
        )}
      </div>
      <div
        className={Styles.flexColumnCenterAlign}
        style={{ paddingTop: '20px' }}
      >
        <div className={Styles.chartGroups}>
          <ul>
            {groups.map((group, index) =>
              group.tooltip ? (
                <ToolTip
                  isOperationListTooltip={true}
                  key={index}
                  icon={
                    <li>
                      {' '}
                      <span
                        style={{
                          color: `${group.color}`,
                          marginRight: '10px',
                        }}
                      >
                        &#9632;
                      </span>
                      {group.title}
                    </li>
                  }
                  text={group.tooltip}
                ></ToolTip>
              ) : (
                <li key={index}>
                  {' '}
                  <span
                    style={{ color: `${group.color}`, marginRight: '10px' }}
                  >
                    &#9632;
                  </span>
                  {group.title}
                </li>
              )
            )}
          </ul>
        </div>
        <RadialChart
          data={chartData}
          innerRadius={60}
          radius={120}
          width={300}
          height={300}
          colorType="literal"
          showLabels={true}
          labelsRadiusMultiplier={1.2}
          margin={{ bottom: 40 }}
        />
      </div>
    </div>
  );
};

export default PieChart;
