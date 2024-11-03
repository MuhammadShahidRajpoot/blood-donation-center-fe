import React from 'react';
import ListTask from '../../../common/tasks/ListTask';
import { LOCATIONS_TASKS_PATH } from '../../../../routes/path';
import { useParams } from 'react-router-dom';
import viewimage from '../../../../assets/images/LocationNotes.png';

import LocationAboutNavigationTabs from '../navigationTabs';
import { useState } from 'react';
import { useEffect } from 'react';
import { fetchData } from '../../../../helpers/Api';
import { LocationsBreadCrumbsData } from '../LocationsBreadCrumbsData';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const LocationsListTasks = () => {
  const [viewAddress, setViewAddress] = useState('');
  const [locations, setLocations] = useState('');
  const params = useParams();
  const BreadcrumbsData = [
    ...LocationsBreadCrumbsData,
    {
      label: 'View Location',
      class: 'active-label',
      link: LOCATIONS_TASKS_PATH.LIST.replace(
        ':crm_location_id',
        params?.crm_location_id
      ),
    },
    {
      label: 'Tasks',
      class: 'active-label',
      link: LOCATIONS_TASKS_PATH.LIST.replace(
        ':crm_location_id',
        params?.crm_location_id
      ),
    },
  ];

  useEffect(() => {
    fetchData(`/crm/locations/${params?.crm_location_id}`, 'GET')
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
    <ListTask
      taskableType={PolymorphicType.CRM_LOCATIONS}
      taskableId={params?.crm_location_id}
      breadCrumbsData={BreadcrumbsData}
      customTopBar={
        <div className="imageContentMain">
          <div className="imageHeading">
            <img src={viewimage} alt="CancelIcon" />

            <div className="d-flex flex-column">
              <h4 className="">{locations}</h4>
              <span>{viewAddress}</span>
            </div>
          </div>
          <div className="tabsnLink">
            <LocationAboutNavigationTabs />
          </div>
        </div>
      }
      createTaskUrl={LOCATIONS_TASKS_PATH.CREATE.replace(
        ':crm_location_id',
        params?.crm_location_id
      )}
    />
  );
};
export default LocationsListTasks;
