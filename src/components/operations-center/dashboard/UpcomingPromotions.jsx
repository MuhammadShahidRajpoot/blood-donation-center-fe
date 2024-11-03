import React, { useEffect, useState } from 'react';
import { DashboardTable } from '../../common/dashboards/table/Table';
import moment from 'moment';
import styles from './DriveSchedule.module.scss';
import { Col } from 'react-bootstrap';
import SelectDropdown from '../../common/selectDropdown';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';

export const UpcomingPromotions = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState({
    value: 1,
    label: 'This Month',
  });

  const columns = [
    {
      title: 'Name',
      value: 'name',
      sort: true,
      link: '/operations-center/dashboard', // CHANGE THIS TO LINK IT SHOULD BE
    },
    {
      title: 'Start Date',
      value: 'start_date',
      sort: true,
    },
    {
      title: 'End Date',
      value: 'end_date',
      sort: true,
    },
    {
      title: 'Description',
      value: 'description',
      sort: true,
    },
  ];

  const handleDuration = (selectedOption) => {
    if (selectedOption) {
      setDuration(selectedOption);
    }
  };

  useEffect(() => {
    fetchData();
  }, [duration]);

  const fetchData = async (sortOrder, sortName) => {
    const params = new URLSearchParams();
    if (duration) {
      params.append('duration', duration.value);
    }
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    if (sortName) {
      params.append('sortName', sortName);
    }
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/operation-dashboard/promotions?${params.toString()}`
    );
    const res = await response.json();
    const data = res.data;
    if (data && data.length > 0) {
      const formattedArr = [];
      data.forEach((row) => {
        formattedArr.push({
          ...row,
          start_date: moment(row.start_date).format('MM-DD-YYYY'),
          end_date: moment(row.end_date).format('MM-DD-YYYY'),
        });
      });
      setData(formattedArr);
    } else {
      setData([]);
    }
  };

  return (
    <div className={styles.containerWithTable} style={{ marginLeft: '10px' }}>
      <div className={styles.titleAndFilters}>
        <div className={styles.title}>Upcoming Promotions</div>
        <form style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <Col>
            <SelectDropdown
              name="duration"
              placeholder={'Duration'}
              showLabel={duration && 'Duration'}
              selectedValue={duration}
              onChange={(selectedOption) => {
                handleDuration(selectedOption);
              }}
              options={[
                { value: 1, label: 'This Month' },
                { value: 2, label: 'Next Month' },
                { value: 3, label: 'This Quarter' },
                { value: 4, label: 'Next Quarter' },
              ]}
              removeDivider
              removeTheClearCross={true}
            />
          </Col>
        </form>
      </div>
      <DashboardTable columns={columns} data={data} getData={fetchData} />
    </div>
  );
};
