import React, { useEffect, useState } from 'react';
import { SummaryModal } from './summary-modal/SummaryModal';
import styles from './index.module.scss';
import SvgComponent from '../../../common/SvgComponent';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';

// const overStaffedData = [
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     projection: '45',
//     requested_staff: '8',
//     fulfilled_staff: '10',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     projection: '45',
//     requested_staff: '8',
//     fulfilled_staff: '10',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     projection: '45',
//     requested_staff: '8',
//     fulfilled_staff: '10',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     projection: '45',
//     requested_staff: '8',
//     fulfilled_staff: '10',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     projection: '45',
//     requested_staff: '8',
//     fulfilled_staff: '10',
//   },
// ];

// const exclusionsData = [
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     recruiter: 'John Doe',
//     projection: '45',
//     status: 'Tentative',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     recruiter: 'John Doe',
//     projection: '45',
//     status: 'Tentative',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     recruiter: 'John Doe',
//     projection: '45',
//     status: 'Tentative',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     recruiter: 'John Doe',
//     projection: '45',
//     status: 'Tentative',
//   },
//   {
//     date: '11-27-2023',
//     location: 'Metro High School',
//     recruiter: 'John Doe',
//     projection: '45',
//     status: 'Tentative',
//   },
// ];

// const underMinData = [
//   {
//     name: 'John Doe',
//     primary_role: 'Salesman',
//     total_hours: '45',
//   },
//   {
//     name: 'John Doe',
//     primary_role: 'Salesman',
//     total_hours: '45',
//   },
//   {
//     name: 'John Doe',
//     primary_role: 'Salesman',
//     total_hours: '45',
//   },
//   {
//     name: 'John Doe',
//     primary_role: 'Salesman',
//     total_hours: '45',
//   },
//   {
//     name: 'John Doe',
//     primary_role: 'Salesman',
//     total_hours: '45',
//   },
// ];

// Hard Coded values until we get the backend running
const SummaryComponent = ({ data, scheduleId, isPublished }) => {
  const [showProducts, setShowProducts] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedModalOpened, setSelectedModalOpened] = useState();
  const [modalColumns, setModalColumns] = useState();
  const [modalTitle, setModalTitle] = useState();
  const [modalData, setModalData] = useState();
  const [totalRecords, setModalTotalRecords] = useState();

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const columns = {
    overstaffed: [
      {
        title: 'Date',
        value: 'date',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Location',
        value: 'location',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Projection',
        value: 'projection',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Requested Staff',
        value: 'requested',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Fulfilled Staff',
        value: 'fulfilled',
        sort: true,
        highlighted: false,
      },
    ],
    exclusions: [
      {
        title: 'Date',
        value: 'date',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Location',
        value: 'location',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Recruiter',
        value: 'recruiter',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Projection',
        value: 'projection',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Status',
        value: 'status',
        sort: true,
        highlighted: true,
      },
    ],
    under_minimum_hours: [
      {
        title: 'Name',
        value: 'name',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Primary Role',
        value: 'primary_role',
        sort: true,
        highlighted: false,
      },
      {
        title: 'Total hours',
        value: 'total_hours',
        sort: true,
        highlighted: false,
      },
    ],
  };

  const handleModalOpen = (type, title, totalRecords) => {
    setModalColumns(columns[type]);
    setSelectedModalOpened(type);
    setModalTitle(title);
    setShowSummaryModal(true);
    setModalTotalRecords(totalRecords);
  };

  const getFilteredData = async (limit, page, sort, sortBy) => {
    switch (selectedModalOpened) {
      case 'overstaffed': {
        //API FOR OVERSTAFFED
        const urlParams = new URLSearchParams();
        urlParams.append('schedule_id', scheduleId);
        urlParams.append(
          'is_published',
          isPublished === 'Draft' ? false : true
        );
        if (limit) {
          urlParams.append('limit', limit);
        }
        if (page) {
          urlParams.append('page', page);
        }
        if (sort) {
          urlParams.append('sortOrder', sort);
        }
        if (sortBy) {
          urlParams.append('sortName', sortBy);
        }
        let url = `${BASE_URL}/view-schedules/staff-schedules/overstaffed-drives?${urlParams.toString()}`;
        const result = await makeAuthorizedApiRequest('GET', url);
        let { data } = await result.json();
        setModalData(data);
        break;
      }
      case 'exclusions': {
        //API FOR EXCLUSIONS
        const urlParams = new URLSearchParams();
        urlParams.append('schedule_id', scheduleId);
        urlParams.append(
          'is_published',
          isPublished === 'Draft' ? false : true
        );
        if (limit) {
          urlParams.append('limit', limit);
        }
        if (page) {
          urlParams.append('page', page);
        }
        if (sort) {
          urlParams.append('sortOrder', sort);
        }
        if (sortBy) {
          urlParams.append('sortName', sortBy);
        }
        let url = `${BASE_URL}/view-schedules/staff-schedules/status-exclusions?${urlParams.toString()}`;
        const result = await makeAuthorizedApiRequest('GET', url);
        let { data } = await result.json();
        setModalData(data);
        break;
      }
      case 'under_minimum_hours': {
        //API FOR UNDER MINIMUM
        const urlParams = new URLSearchParams();
        urlParams.append('schedule_id', scheduleId);
        urlParams.append(
          'is_published',
          isPublished === 'Draft' ? false : true
        );
        if (limit) {
          urlParams.append('limit', limit);
        }
        if (page) {
          urlParams.append('page', page);
        }
        if (sort) {
          urlParams.append('sortOrder', sort);
        }
        if (sortBy) {
          urlParams.append('sortName', sortBy);
        }
        let url = `${BASE_URL}/view-schedules/staff-schedules/staff-under-minimum-hours?${urlParams.toString()}`;
        const result = await makeAuthorizedApiRequest('GET', url);
        let { data } = await result.json();
        setModalData(data);
        break;
      }
      default: {
        //API FOR OVERSTAFFED
        const urlParams = new URLSearchParams();
        urlParams.append('schedule_id', scheduleId);
        urlParams.append(
          'is_published',
          isPublished === 'Draft' ? false : true
        );
        if (limit) {
          urlParams.append('limit', limit);
        }
        if (page) {
          urlParams.append('page', page);
        }
        if (sort) {
          urlParams.append('sortOrder', sort);
        }
        if (sortBy) {
          urlParams.append('sortName', sortBy);
        }
        let url = `${BASE_URL}/view-schedules/staff-schedules/overstaffed-drives?${urlParams.toString()}`;
        const result = await makeAuthorizedApiRequest('GET', url);
        let { data } = await result.json();
        setModalData(data);
      }
    }
  };

  useEffect(() => {}, [showProducts]);

  const changeView = () => {
    setShowProducts((prevOption) => (prevOption === true ? false : true));
  };
  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryTitle}>
        <h5>Summary</h5>
        {data && (
          <div>
            {!showProducts && (
              <button onClick={changeView} className={styles.viewProductsBtn}>
                View as Products
              </button>
            )}
            {showProducts && (
              <button onClick={changeView} className={styles.viewProductsBtn}>
                View as Procedures
              </button>
            )}{' '}
          </div>
        )}
      </div>
      <>
        {data ? (
          <div className={styles.summaryContent}>
            <div className={styles.summaryCategory}>
              <div className={styles.svgIcon}>
                <SvgComponent name={'CalendarIconForBuildScheduleSummary'} />{' '}
              </div>
              <div className={styles.titleWithText}>
                <h6>Operations</h6>
                <ul>
                  <div className={styles.listItem}>
                    <li>
                      {' '}
                      <span>Total Operations:</span>
                      <strong>{data?.operations?.total_operations}</strong>
                    </li>
                  </div>
                  <div className={styles.listItem}>
                    <li>
                      {' '}
                      <span>Fully Staffed:</span>
                      <strong>{data?.operations?.fully_staffed}</strong>
                    </li>
                  </div>
                  <div
                    className={styles.listItem}
                    onClick={() =>
                      handleModalOpen(
                        'exclusions',
                        'Status Exclusions',
                        data?.operations?.status_exclutions
                      )
                    }
                  >
                    <li>
                      {' '}
                      <span>Status Exclusions: </span>
                      <strong style={{ color: '#1384b2' }}>
                        {data?.operations?.status_exclutions}
                      </strong>
                    </li>{' '}
                  </div>
                  <div
                    className={styles.listItem}
                    onClick={() =>
                      handleModalOpen(
                        'overstaffed',
                        'Overstaffed Drives',
                        data?.operations?.overstaffed
                      )
                    }
                  >
                    <li>
                      {' '}
                      <span>Overstaffed:</span>
                      <strong style={{ color: '#1384b2' }}>
                        {data?.operations?.overstaffed}
                      </strong>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
            <div className={styles.summaryCategory}>
              <div className={styles.svgIcon}>
                <SvgComponent name={'StaffIconForBuildScheduleSummary'} />
              </div>
              <div className={styles.titleWithText}>
                <h6>Staff</h6>
                <ul style={{ listStyleType: 'disc' }}>
                  <div className={styles.listItem}>
                    <li>
                      {' '}
                      <span>Total Staff:</span>
                      <strong>{data?.staff?.total_staff}</strong>
                    </li>
                  </div>
                  <div
                    className={styles.listItem}
                    onClick={() =>
                      handleModalOpen(
                        'under_minimum_hours',
                        'Staff Under Minimum Hours',
                        data?.staff?.under_minimum_hours
                      )
                    }
                  >
                    <li>
                      {' '}
                      <span>Under Minimum Hours:</span>
                      <strong style={{ color: '#1384b2' }}>
                        {data?.staff?.under_minimum_hours}
                      </strong>
                    </li>
                  </div>
                  <div className={styles.listItem}>
                    <li>
                      {' '}
                      <span>Staff In Overtime:</span>
                      <strong>{data?.staff?.staff_in_overtime}</strong>
                    </li>
                  </div>
                  <div className={styles.listItem}>
                    <li>
                      {' '}
                      <span>Average Overtime:</span>
                      <strong>{data?.staff?.average_overtime}</strong>
                    </li>
                  </div>
                </ul>
              </div>
            </div>
            <div className={styles.summaryCategory}>
              <div className={styles.svgIcon}>
                <SvgComponent name={'EfficiencyIconForBuildScheduleSummary'} />{' '}
              </div>
              <div className={styles.titleWithText}>
                <h6>Efficiency</h6>
                {!showProducts && (
                  <ul>
                    <div className={styles.listItem}>
                      <li>
                        <span>Procedures Per Hour:</span>{' '}
                        <strong>
                          {data?.efficiency?.include_travel_procedures_per_hour}{' '}
                          (includes travel)
                        </strong>
                      </li>
                    </div>
                    <div className={styles.listItem}>
                      <li>
                        <span>Procedures Per Hour:</span>{' '}
                        <strong>
                          {data?.efficiency?.exclude_travel_procedures_per_hour}{' '}
                          (excludes travel)
                        </strong>
                      </li>
                    </div>
                  </ul>
                )}
                {showProducts && (
                  <ul>
                    <div className={styles.listItem}>
                      <li>
                        <span>Products Per Hour:</span>{' '}
                        <strong>
                          {data?.efficiency?.include_travel_products_per_hour}{' '}
                          (includes travel)
                        </strong>
                      </li>
                    </div>
                    <div className={styles.listItem}>
                      <li>
                        <span>Products Per Hour:</span>{' '}
                        <strong>
                          {data?.efficiency?.exclude_travel_products_per_hour}{' '}
                          (excludes travel)
                        </strong>
                      </li>
                    </div>
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.summaryContent}>
            <p>No Data Found.</p>
          </div>
        )}
      </>
      <SummaryModal
        show={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        data={modalData}
        getData={getFilteredData}
        columns={modalColumns}
        title={modalTitle}
        totalRecords={totalRecords}
      />
    </div>
  );
};

export default SummaryComponent;
