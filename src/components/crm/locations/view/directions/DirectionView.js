import React from 'react';
import TopBar from '../../../../common/topbar/index';
import LocationNotes from '../../../../../assets/images/LocationNotes.png';
import AccountViewNavigationTabs from '../../navigationTabs';
import ViewDirection from './components/ViewDirection';
import { Link, useParams } from 'react-router-dom';
import SvgComponent from '../../../../common/SvgComponent';
import { useEffect } from 'react';
import { fetchData } from '../../../../../helpers/Api';
import { useState } from 'react';
import { LocationsBreadCrumbsData } from '../../LocationsBreadCrumbsData';

export default function DirectionView() {
  const { locationId, directionId } = useParams();
  const [viewAddress, setViewAddress] = useState('');
  const [locations, setLocations] = useState('');
  const BreadcrumbsData = [
    ...LocationsBreadCrumbsData,
    {
      label: 'View Location',
      class: 'disable-label',
      link: `/crm/locations/${locationId}/view`,
    },
    {
      label: 'Directions',
      class: 'active-label',
      link: `/crm/locations/${locationId}/directions`,
    },
  ];

  useEffect(() => {
    fetchData(`/crm/locations/${locationId}`, 'GET')
      .then((res) => {
        if (res?.data) {
          let edit = res?.data;
          setViewAddress(`${edit?.address?.city}, ${edit?.address?.state}`);
          setLocations(edit?.name);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Directions'}
        SearchValue={null}
        SearchOnChange={null}
        SearchPlaceholder={null}
      />
      <div className="imageContentMain">
        <div className="imageHeading">
          <img src={LocationNotes} alt="CancelIcon" />
          <div className="d-flex flex-column">
            <h4>{locations}</h4>
            <span>{viewAddress}</span>
          </div>
        </div>
        <div className="tabsnLink">
          <AccountViewNavigationTabs />
          <div className="buttons">
            <div className="editAnchor">
              <Link
                to={`/crm/locations/${locationId}/directions/${directionId}/edit`}
              >
                <SvgComponent name="EditIcon" />
                <span>Edit Direction</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ViewDirection
        editLink={`/crm/locations/${locationId}/directions/${directionId}/edit`}
      />
    </div>
  );
}
