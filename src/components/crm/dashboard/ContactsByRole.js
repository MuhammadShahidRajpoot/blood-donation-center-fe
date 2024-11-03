import React, { useEffect, useState } from 'react';
import Styles from './styles.module.scss';
import { RadialChart } from 'react-vis';

const ContactsByRole = () => {
  const [contactsByRoleChartData, setContactsByRoleChartData] = useState([]);
  const [contactsByRoleGroups, setContactsByRoleGroups] = useState([]);

  const fetchContactsByRole = () => {
    const data = [
      {
        role: 'Primary Chairperson',
        contact_count: 26,
      },
      {
        role: 'Secondary Chairperson',
        contact_count: 11,
      },
      {
        role: 'Organizational Leader',
        contact_count: 3,
      },
      {
        role: 'Contact',
        contact_count: 60,
      },
    ];
    const groups = [];
    let totalCount = 0;
    data.forEach((element) => {
      groups.push({ title: element.role, color: '#387DE5' });
      totalCount = totalCount + element.contact_count;
    });
    setContactsByRoleGroups(groups);

    const formattedData = [];
    groups.forEach((group) => {
      const matchingRole = data.find((gr) => gr.role === group.title);
      if (matchingRole) {
        formattedData.push({
          angle: matchingRole.contact_count * (360 / totalCount),
          label: `${matchingRole.contact_count}`,
          color: group.color,
        });
      }
    });
    setContactsByRoleChartData(formattedData);
  };

  useEffect(() => {
    fetchContactsByRole();
  }, []);

  return (
    <div className={Styles.container}>
      <div className={Styles.flexColumnCenterAlign}>
        <h5 className={Styles.containerTitle}> Contacts By Role </h5>
      </div>
      <div
        className={Styles.flexColumnCenterAlign}
        style={{ paddingTop: '20px' }}
      >
        <div className={Styles.chartGroups}>
          <ul>
            {contactsByRoleGroups.map((group, index) => (
              <li key={index}>
                {' '}
                <span style={{ color: `${group.color}`, marginRight: '10px' }}>
                  &#9632;
                </span>
                {group.title}
              </li>
            ))}
          </ul>
        </div>
        <RadialChart
          data={contactsByRoleChartData}
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
export default ContactsByRole;
