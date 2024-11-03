import React, { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { VolunteersBreadCrumbsData } from '../VolunteersBreadCrumbsData';
import accountContact from '../../../../../assets/accountContact.svg';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import moment from 'moment';
import '../volunteer.module.scss';
import { Link } from 'react-router-dom';

const ServiceHistory = () => {
  const [serviceHistory, setServiceHistory] = useState([]);
  const params = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const context = useOutletContext();
  useEffect(() => {
    context.setBreadCrumbsState([
      ...VolunteersBreadCrumbsData,
      {
        label: 'View Volunteer',
        class: 'disable-label',
        link: `/crm/contacts/volunteers/${params?.id}/view`,
      },
      {
        label: 'Service History',
        class: 'active-label',
        link: `/crm/contacts/volunteers/${params?.volunteerId}/view/service`,
      },
    ]);
  }, []);
  useEffect(() => {
    const getServiceHistory = async () => {
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/contact-volunteer/${params?.volunteerId}/service-history`
        );
        const { data } = await response.json();
        // const datas = [
        //   {
        //     account_name: 'Shaheryar',
        //     role_name: 'Primary Chairperson',
        //     start_date: '2022-08-16',
        //     closeout_date: '2022-08-19',
        //     created_at: '2022-08-16 00:00:00',
        //   },
        //   {
        //     account_name: 'Qaiser',
        //     role_name: 'Chariman',
        //     start_date: '2022-08-20',
        //     closeout_date: null,
        //     created_at: '2022-08-20 00:00:00',
        //   },
        // ];
        setServiceHistory(data);
      } catch (error) {
        console.log(error);
      }
    };
    getServiceHistory();
  }, []);

  return (
    <div className="mainContentInner">
      <div className="serviceHistory">
        {serviceHistory?.map((item, index) => {
          return (
            <div className="single-service" key={index}>
              <div className="icon">
                <img src={accountContact} alt="accountContact" />
              </div>
              <div className="content">
                <div className="namendata">
                  <h4>
                    <Link
                      to={
                        item?.item_type === 'accounts'
                          ? '/crm/accounts/' + item?.item_id + '/view/about'
                          : '/crm/locations/' + item?.item_id + '/view'
                      }
                      target={'_blank'}
                    >
                      {item?.account_name}
                    </Link>{' '}
                    - <span>{item?.role_name}</span>
                  </h4>
                  <p>
                    {moment(item?.created_at).format('MM-DD-YYYY hh:mm:ss A')}
                  </p>
                </div>
                <div className="details">
                  <ul>
                    <li>
                      <span className="left">Start date</span>
                      <span className="right">
                        {moment(item?.start_date).format('MM-DD-YYYY')}
                      </span>
                    </li>
                    <li>
                      <span className="left">Closeout Date</span>
                      <span className="right">
                        {item?.closeout_date
                          ? moment(item?.closeout_date).format('MM-DD-YYYY')
                          : 'N/A'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceHistory;
