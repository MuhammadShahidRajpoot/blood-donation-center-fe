import React, { useEffect, useState } from 'react';
import { DashboardTable } from '../../common/dashboards/table/Table';
import moment from 'moment';
import styles from './DriveSchedule.module.scss';
import { Col } from 'react-bootstrap';
import SelectDropdown from '../../common/selectDropdown';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import { ToolTipTextGroup } from '../../common/dashboards/tooltip/ToolTipTextGroup';

export const DriveSchedule = ({ orgLevels }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [data, setData] = useState([]);
  const [duration, setDuration] = useState({
    value: 1,
    label: 'This Month',
  });
  const [selectedStatusOptions, setSelectedStatusOptions] = useState([]);
  const [filters, setFilters] = useState([]);
  const [performance, setPerformance] = useState();

  const columns = [
    {
      title: 'Date',
      value: 'date',
      sort: true,
    },
    {
      title: 'Account',
      value: 'account',
      sort: true,
      link: '/operations-center/dashboard', // CHANGE THIS TO LINK IT SHOULD BE
    },
    {
      title: 'Location',
      value: 'location',
      sort: true,
    },
    {
      title: 'Hours',
      value: 'shift_start_time',
      sort: true,
    },
    {
      title: 'Projection',
      value: 'projection',
      sort: true,
    },
  ];

  const toolTipFilters = [
    {
      toolTipText: 'OEF below minimum for the industry category',
      title: 'Low OEF',
      color: '#387DE5',
      toolTipWidth: '130px',
    },
    {
      toolTipText: 'OEF above maximum for the industry category',
      title: 'High OEF',
      color: '#005375',
      toolTipWidth: '130px',
    },
    {
      toolTipText: 'Drive in top average quartile for this filter',
      title: 'High Projection',
      color: '#72A3D0',
    },
    {
      toolTipText: 'Drive in bottom average quartile for this filter',
      title: 'Low Projection',
      color: '#1384B2',
    },
    {
      toolTipText: 'Projection Accuracy 10% below minimum standard',
      title: 'Low P/A',
      color: '#91BDE9',
    },
  ];

  useEffect(() => {
    fetchData();
  }, [performance, duration, selectedStatusOptions, orgLevels]);

  useEffect(() => {
    fetchStatusesFilter();
  }, []);

  const fetchStatusesFilter = async () => {
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/booking-drive/operation-status?status=true&appliesTo=Drives`
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
    // set  Completed, Confirmed and Tentative statuses as default
    const defaults = [];
    formattedFilters.forEach((status) => {
      if (
        status.name.toLowerCase() === 'completed' ||
        status.name.toLowerCase() === 'confirmed' ||
        status.name.toLowerCase() === 'tentative'
      ) {
        defaults.push(status);
      }
    });
    setSelectedStatusOptions(defaults);
  };

  const fetchData = async (sortOrder, sortName) => {
    const params = new URLSearchParams();
    // organizational_level is required
    // initial value should be the org.level of the currently logged in user
    if (!orgLevels) return;
    if (duration) {
      params.append('duration', duration.value);
    }
    if (selectedStatusOptions) {
      const formatted = [];
      selectedStatusOptions.forEach((status) => {
        formatted.push(status.id);
      });
      params.append('status', formatted);
    }
    if (performance) {
      params.append('performance', performance);
    }
    if (sortOrder) {
      params.append('sortOrder', sortOrder);
    }
    if (sortName) {
      params.append('sortName', sortName);
    }
    params.append('organizational_level', orgLevels);
    const response = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/operation-dashboard/drive-schedule?${params.toString()}`
    );
    const res = await response.json();
    const data = res.data;
    if (data && data.length > 0) {
      const formattedArr = [];
      data.forEach((row) => {
        formattedArr.push({
          ...row,
          date: `${moment(row.date).format('ddd[, ]MM/DD/YYYY')}`,
          shift_start_time: `${moment(row.shift_start_time).format(
            'h:mm A'
          )} - ${moment(row.shift_end_time).format('h:mm A')}`,
        });
      });
      setData(formattedArr);
    } else {
      setData([]);
    }
  };

  const handleDuration = (selectedOption) => {
    if (selectedOption) {
      setDuration(selectedOption);
    }
  };

  const handleDataChange = (field) => {
    setSelectedStatusOptions((oldVal) => {
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
    <div className={styles.containerWithTable} style={{ marginRight: '10px' }}>
      <div className={styles.titleAndFilters}>
        <div className={styles.title}>Drive Schedule</div>
        <form className={styles.form}>
          <Col>
            <GlobalMultiSelect
              label="Status"
              data={filters}
              selectedOptions={selectedStatusOptions}
              onChange={(val) => handleDataChange(val)}
              onSelectAll={(data) => setSelectedStatusOptions(data)}
            />
          </Col>
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
      <div className={styles.smallTextWrapper}>
        <ToolTipTextGroup
          data={toolTipFilters}
          onChange={(val) =>
            setPerformance(
              (() => {
                if (val.length === 0) return;
                const index = toolTipFilters.findIndex(
                  (item) => item.title === val[0].title
                );
                return index !== -1 ? index + 1 : undefined;
              })()
            )
          }
        />
      </div>
      <DashboardTable columns={columns} data={data} getData={fetchData} />
    </div>
  );
};
