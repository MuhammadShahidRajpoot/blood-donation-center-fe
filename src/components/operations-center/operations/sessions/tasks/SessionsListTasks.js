import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  OPERATIONS_CENTER_DRIVES_PATH,
  OPERATIONS_CENTER_MANAGE_FAVORITES_PATH,
  OPERATIONS_CENTER_SESSIONS_PATH,
  SESSION_TASKS_PATH,
} from '../../../../../routes/path';
import ListTask from '../../../../common/tasks/ListTask';
import SessionsNavigationTabs from '../navigationTabs';
import Session from '../Session';
import { API } from '../../../../../api/api-routes';
import { toast } from 'react-toastify';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';

const SessionsListTasks = () => {
  const params = useParams();
  const [donorCenterDetail, setDonorCenterDetail] = useState(null);

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    try {
      const { data } = await API.operationCenter.sessions.getSessionFindOne(
        params?.session_id
      );
      if (data?.data) {
        const modified = {
          donor_center: data?.data?.donor_center?.name,
          session_date: data?.data?.date,
        };
        setDonorCenterDetail(modified);
      }
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };
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
      label: 'Sessions',
      class: 'active-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: 'View Session',
      class: 'active-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.VIEW.replace(
        ':id',
        params?.session_id
      ).replace(':slug', 'about'),
    },
    {
      label: 'Tasks',
      class: 'active-label',
      link: SESSION_TASKS_PATH.LIST.replace(':session_id', params?.session_id),
    },
  ];

  return (
    <ListTask
      taskableType={PolymorphicType.OC_OPERATIONS_SESSIONS}
      customTopBar={
        <div className="imageContentMain">
          <Session data={donorCenterDetail} />
          <div className="tabsnLink">
            <SessionsNavigationTabs />
          </div>
        </div>
      }
      taskableId={params?.session_id}
      hideAssociatedWith
      calendarIconShowHeader
      tasksNotGeneric
      breadCrumbsData={BreadcrumbsData}
      createTaskUrl={SESSION_TASKS_PATH.CREATE.replace(
        ':session_id',
        params?.session_id
      )}
    />
  );
};

export default SessionsListTasks;
