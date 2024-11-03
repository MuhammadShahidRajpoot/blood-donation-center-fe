import React, { useEffect, useState } from 'react';
import ListTask from '../../../../common/tasks/ListTask';
import {
  DRIVES_TASKS_PATH,
  OPERATIONS_CENTER_DRIVES_PATH,
  OPERATIONS_CENTER_MANAGE_FAVORITES_PATH,
} from '../../../../../routes/path';
import { useParams } from 'react-router-dom';
import DriveNavigationTabs from '../navigationTabs';
import { makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import viewimage from '../../../../../assets/images/viewimage.png';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';

const DrivesListTasks = () => {
  const params = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [driveData, setDriveData] = useState(null);

  const getDriveData = async (id) => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/drives/${id}`
    );
    const { data } = await result.json();
    data?.[0] ? setDriveData(data[0]) : setDriveData(null);
  };

  useEffect(() => {
    getDriveData(params?.drive_id);
  }, []);

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'active-label',
      link: OPERATIONS_CENTER_MANAGE_FAVORITES_PATH.LIST,
    },
    {
      label: 'Operations',
      class: 'active-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'Drives',
      class: 'active-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'View Drive',
      class: 'active-label',
      link: `/operations-center/operations/drives/${params?.drive_id}/view/about`,
    },
    {
      label: 'Tasks',
      class: 'active-label',
      link: DRIVES_TASKS_PATH.LIST,
    },
  ];

  return (
    <ListTask
      customTopBar={
        <div className="imageContentMain ">
          <div className="imageHeading">
            <img src={viewimage} alt="CancelIcon" />
            <div className="d-flex flex-column">
              <h4 className="">{driveData?.account?.name || ''}</h4>
              <span>{driveData?.crm_locations?.name || ''}</span>
            </div>
          </div>
          <div className="tabsnLink">
            <DriveNavigationTabs />
          </div>
        </div>
      }
      calendarIconShowHeader
      hideAssociatedWith
      taskableType={PolymorphicType.OC_OPERATIONS_DRIVES}
      taskableId={params?.drive_id}
      breadCrumbsData={BreadcrumbsData}
      createTaskUrl={DRIVES_TASKS_PATH.CREATE.replace(
        ':drive_id',
        params?.drive_id
      )}
    />
  );
};

export default DrivesListTasks;
