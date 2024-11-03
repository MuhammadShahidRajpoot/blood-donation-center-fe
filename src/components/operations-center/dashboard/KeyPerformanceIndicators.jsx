import React, { useEffect, useState } from 'react';
import Card from './reusable-components/Card.js';
import Styles from './styles.module.scss';
import SvgComponent from '../../common/SvgComponent.js';
import SelectDropdown from '../../common/selectDropdown/index.js';
import { Col } from 'react-bootstrap';
import { BloodTypeDistributionChart } from '../../common/dashboards/BloodTypeDistributionChart.js';
import MonthRangeSelector from './reusable-components/month-range-picker/MonthRangeSelector.jsx';
import { makeAuthorizedApiRequest } from '../../../helpers/Api.js';

function KeyPerformanceIndicators({ orgLevels }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [gradientCards, setGradientCards] = useState([]);
  const [rateCards, setRateCards] = useState([]);
  const [dates, setDates] = useState();
  const [viewAs, setViewAs] = useState({
    value: 'product',
    label: 'Product',
  });
  const [totalDonors, setTotalDonors] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    fetchData();
  }, [orgLevels, viewAs, dates]);

  const fetchData = async () => {
    // organizational_levels is required
    // initial value should be the org.level of the currently logged in user
    if (!orgLevels) return;
    const params = new URLSearchParams();
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
    if (viewAs) {
      params.append('view_as', viewAs.value);
    }
    params.append('organizational_level', orgLevels);
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/operation-dashboard/kpi?${params.toString()}`
    );
    const data = await response.json();
    setTotalDonors(data.data.total_donors ?? undefined);
    setData(data.data);
    composeGradientCards(data.data);
    composeRateCards(data.data);
  };

  const composeGradientCards = (data) => {
    // do not change the order of objects inside the array
    const cardsArray = [
      [
        {
          title: 'Goal',
          number: data && data.goal ? data.goal : 0,
          iconName: 'Target',
          backgroundColor1: '#387DE5',
          backgroundColor2: '#194B96',
        },
        {
          title: 'Scheduled',
          number: `${data.scheduled ?? 0} (${
            data && data.scheduled && data.goal && data.goal > 0
              ? ((data.scheduled / data.goal) * 100).toFixed(2)
              : 0
          }%)`,
          iconName: 'CalendarToday',
          backgroundColor1: '#1384B2',
          backgroundColor2: '#095777',
        },
        {
          title: 'Actual (MTD)',
          number: `${data.actual ?? 0} (${
            data && data.actual && data.scheduled
              ? ((data.actual / data.scheduled) * 100).toFixed(2)
              : 0
          })%`,
          iconName: 'CalendarToday',
          backgroundColor1: '#55C2EE',
          backgroundColor2: '#2A8FB8',
        },
      ],
      [
        {
          title: 'Forecast',
          number: '1870 (101.1%)', // hard code for now
          iconName: 'Chart',
          backgroundColor1: '#72A3D0',
          backgroundColor2: '#5481A9',
        },
        {
          title: 'Required',
          number: `${data.goal - data.actual} (${
            data && data.goal && data.goal > 0 && data.actual
              ? (((data.goal - data.actual) / data.goal) * 100).toFixed(2)
              : 0
          }%)`,
          iconName: 'DataUsage',
          backgroundColor1: '#3C6BB1',
          backgroundColor2: '#22477D',
        },
        {
          title: 'OEF',
          number: data && data.oef ? data.oef : 0,
          iconName: 'AvgPace',
          backgroundColor1: '#2E99B0',
          backgroundColor2: '#156677',
        },
      ],
    ];
    setGradientCards(cardsArray);
  };

  const composeRateCards = (data) => {
    // total_appointments are the slots filled in this case
    const cardsArray = [
      {
        title: 'Loss Rate',
        number: `${
          data && data.deferrals && data.qns && data.walkout
            ? ((data.deferrals + data.qns + data.walkout) / data.total_donors) *
              100
            : 0
        }%`,
        iconName: 'TrendingDownArrow',
        backgroundColor1: '#2E99B0',
        backgroundColor2: '#156677',
        tooltipData: [
          {
            title: 'Deferrals',
            value: data.deferrals ?? 0,
          },
          {
            title: 'QNS',
            value: data.qns ?? 0,
          },
          {
            title: 'Walkouts',
            value: data.walkout ?? 0,
          },
        ],
      },
      {
        title: 'Schedule Fill Rate',
        number: `${
          data && data.total_appointments && data.slots_available
            ? (data.total_appointments / data.slots_available).toFixed(1) * 100
            : 0
        }%`,
        iconName: 'CalendarClock',
        backgroundColor1: '#2E99B0',
        backgroundColor2: '#156677',
        tooltipData: [
          {
            title: 'Appointment Slots Available',
            value: data.slots_available ?? 0,
          },
          {
            title: 'Appointment Slots Filled',
            value: data.total_appointments ?? 0,
          },
        ],
      },
      {
        title: 'Show Rate',
        number: `${
          data && data.total_donors && data.total_appointments
            ? (data.total_donors / data.total_appointments).toFixed(1) * 100
            : 0
        }%`,
        iconName: 'Percent',
        backgroundColor1: '#2E99B0',
        backgroundColor2: '#156677',
        tooltipData: [
          {
            title: 'Number of Appointments',
            value: data.total_appointments ?? 0,
          },
          { title: 'Number of Donors', value: data.total_donors ?? 0 },
        ],
      },
      {
        title: 'First-Time Donor Rate',
        number: `${
          data && data.first_time_donor && data.total_donors
            ? (data.first_time_donor / data.total_donors).toFixed(1) * 100
            : 0
        }%`,
        iconName: 'BloodPressure',
        backgroundColor1: '#2E99B0',
        backgroundColor2: '#156677',
        tooltipData: [
          { title: 'Total Donors', value: data.total_donors ?? 0 },
          { title: 'First-Time Donors', value: data.first_time_donor ?? 0 },
        ],
      },
    ];
    setRateCards(cardsArray);
  };
  const onSelectDate = (date) => {
    setDates({
      start_date: date.startDate,
      end_date: date.endDate,
    });
  };

  const handleViewAs = (selectedOption) => {
    if (selectedOption) {
      setViewAs(selectedOption);
    }
  };
  return (
    <div className={Styles.kpiContainer}>
      <div className={Styles.titleAndFilters}>
        <div className={Styles.title}>Key Performance Indicators</div>
        <form>
          <div className="row row-gap-2">
            <Col className={Styles.filterBox}>
              <MonthRangeSelector
                style={{ width: '400px' }}
                onSelectDate={onSelectDate}
                dateValues={{
                  startDate: dates?.start_date
                    ? dates?.start_date
                    : new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                      ),
                  endDate: dates?.end_date
                    ? dates?.end_date
                    : new Date(
                        new Date().getFullYear(),
                        new Date().getMonth() + 1,
                        0
                      ),
                }}
              />
            </Col>
            <Col className={Styles.filterBox}>
              <SelectDropdown
                style={{ width: '100px' }}
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
          </div>
        </form>
      </div>

      <div className={Styles.gradientCardsFlexbox} style={{ gap: '20px' }}>
        <div className={Styles.drivesSessionsColumn}>
          {/* first card with drives & sessions */}
          <div className={Styles.drivesSessionsCard}>
            <div className={Styles.background}>
              <SvgComponent name="Bloodtype" />
            </div>
            <div className={Styles.text}>
              <h6>Drives</h6>
              <h1>{data && data.drives ? data.drives : 0}</h1>
            </div>
            <div className={Styles.text}>
              <h6>Sessions</h6>
              <h1>{data && data.sessions ? data.sessions : 0}</h1>
            </div>
          </div>
        </div>
        {/* gradient cards below */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {gradientCards.map((row, index) => (
            <div
              key={`${index + 1}-row`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
                flex: 1,
              }}
            >
              {row.map((data, colIndex) => (
                <div
                  key={`${index}x${colIndex}`}
                  style={{ display: 'flex', flex: 1 }}
                >
                  <Card
                    iconName={data.iconName}
                    text={data.title}
                    number={data.number}
                    isGradientCard={true}
                    backgroundColor1={data.backgroundColor1}
                    backgroundColor2={data.backgroundColor2}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={Styles.grayCardsFlexbox}>
        {rateCards.map(
          (_, index) =>
            index % 2 === 0 && (
              <div className={Styles.column} key={index}>
                <Card
                  iconName={rateCards[index].iconName}
                  text={rateCards[index].title}
                  number={rateCards[index].number}
                  toolTipData={rateCards[index].tooltipData}
                />
                {rateCards[index + 1] && (
                  <Card
                    iconName={rateCards[index + 1].iconName}
                    text={rateCards[index + 1].title}
                    number={rateCards[index + 1].number}
                    toolTipData={rateCards[index + 1].tooltipData}
                  />
                )}
              </div>
            )
        )}
        <BloodTypeDistributionChart
          orgLevels={orgLevels}
          dates={dates}
          viewAs={viewAs}
          totalDonors={totalDonors}
        />
      </div>
    </div>
  );
}

export default KeyPerformanceIndicators;
