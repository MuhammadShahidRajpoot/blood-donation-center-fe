import React, { useEffect, useState } from 'react';
import Styles from './styles.module.scss';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import ToolTip from '../../common/tooltip';
import { RadialChart } from 'react-vis';

const DonorsByStatus = () => {
  // this is hard coded and it should stay that way
  const donorsByStatusGroups = [
    { title: 'Prospect', tooltip: 'No history', color: '#387DE5' },
    { title: 'Current', tooltip: '18 months or less', color: '#1384B2' },
    { title: 'Lapsed', tooltip: '18 - 36 months', color: '#72A3D0' },
    { title: 'Super Lapsed', tooltip: '36 - 60 months', color: '#005375' },
    { title: 'Missing', tooltip: '60 months or more', color: '#91BDE9' },
    { title: 'Permanent Deferrals', color: '#CED8E5' },
  ];

  const [selectedBloodTypes, setSelectedBloodTypes] = useState([]);
  const [donorsByStatusChartData, setDonorsByStatusChartData] = useState([]);

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

  const fetchDonorsByStatus = () => {
    const data = [
      {
        donor_status: 'Prospect',
        quantity_in_percentage: 17,
      },
      {
        donor_status: 'Current',
        quantity_in_percentage: 39,
      },
      {
        donor_status: 'Lapsed',
        quantity_in_percentage: 7,
      },
      {
        donor_status: 'Super Lapsed',
        quantity_in_percentage: 10,
      },
      {
        donor_status: 'Missing',
        quantity_in_percentage: 20,
      },
      {
        donor_status: 'Permanent Deferrals',
        quantity_in_percentage: 7,
      },
    ];
    const formattedData = [];
    donorsByStatusGroups.forEach((group) => {
      const matchingDonor = data.find((gr) => gr.donor_status === group.title);
      if (matchingDonor) {
        formattedData.push({
          angle: matchingDonor.quantity_in_percentage * 3.6,
          label: matchingDonor.quantity_in_percentage + '%',
          color: group.color,
        });
      }
    });
    setDonorsByStatusChartData(formattedData);
  };

  useEffect(() => {
    fetchDonorsByStatus();
    // all blood types should be selected initially
    setSelectedBloodTypes(bloodTypes);
  }, []);
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

  return (
    <div className={Styles.container}>
      <div className={Styles.flexColumnCenterAlign}>
        <h5 className={Styles.containerTitle}> Donors By Status </h5>

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
      </div>
      <div
        className={Styles.flexColumnCenterAlign}
        style={{ paddingTop: '20px' }}
      >
        <div className={Styles.chartGroups}>
          <ul>
            {donorsByStatusGroups.map((group, index) =>
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
        <div className={Styles.pieChart}>
          <RadialChart
            data={donorsByStatusChartData}
            innerRadius={60}
            radius={120}
            width={340}
            height={340}
            colorType="literal"
            showLabels={true}
            labelsRadiusMultiplier={1.3}
            margin={{ top: 60 }}
          />
        </div>
      </div>
    </div>
  );
};
export default DonorsByStatus;
