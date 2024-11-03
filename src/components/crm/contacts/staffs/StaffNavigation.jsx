import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import StaffMember from './StaffMember';
import SvgComponent from '../../../common/SvgComponent';
import {
  CRM_STAFF_SCHEDULE_PATH,
  STAFF_TASKS_PATH,
} from '../../../../routes/path';

function StaffNavigation({
  children,
  editUrl = null,
  editLabel = null,
  fromView,
  refreshData,
  hideTabname = false,
  primaryRole = '',
}) {
  const { staffId, staff_id, id, noteId, attachId, schedule_id } = useParams();
  const params = useParams();
  const location = useLocation();

  const tabs = [
    {
      name: 'About',
      paths: [`/crm/contacts/staff/${staff_id ?? staffId ?? id}/view`],
    },

    {
      name: 'Communication',
      paths: [
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/communication`,
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/communication/${
          params?.secondID
        }/view`,
      ],
    },
    {
      name: 'Tasks',
      paths: [
        STAFF_TASKS_PATH.LIST.replace(`:staff_id`, staff_id ?? staffId ?? id),
        STAFF_TASKS_PATH.VIEW.replace(`:staff_id`, staff_id).replace(':id', id),
      ],
    },
    {
      name: 'Documents',
      paths: [
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/documents/notes`,
        `/crm/contacts/staff/${
          staff_id ?? staffId ?? id
        }/view/documents/attachments`,
        `/crm/contacts/staff/${id}/view/documents/attachments/${attachId}/view`,
        `/crm/contacts/staff/${id}/view/documents/notes/${noteId}/view`,
      ],
    },
    {
      name: 'Availability',
      paths: [
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/availability`,
      ],
    },
    {
      name: 'Schedule',
      paths: [
        CRM_STAFF_SCHEDULE_PATH.LIST.replace(
          ':staff_id',
          staff_id ?? staffId ?? id
        ),
        CRM_STAFF_SCHEDULE_PATH.VIEW.replace(
          ':staff_id',
          staff_id ?? staffId ?? id
        ).replace(':schedule_id', schedule_id ?? schedule_id ?? id),
      ],
    },
    {
      name: 'Leave',
      paths: [
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/leave`,
        `/crm/contacts/staff/${
          staff_id ?? staffId ?? id
        }/view/leave/${id}/view`,
      ],
    },
    // --- DISABLED DUE TO TICKET D37PD-3460 ---
    {
      name: 'Duplicates',
      paths: [
        `/crm/contacts/staff/${staff_id ?? staffId ?? id}/view/duplicates`,
      ],
    },
  ];

  const currentTab = tabs.find((tab) => tab.paths.includes(location.pathname));

  return (
    <>
      <div className="imageContentMain">
        <StaffMember primaryRole={primaryRole} refreshData={refreshData} />
        <div className="tabsnLink">
          <div className="filterBar">
            <div className="flex justify-content-between tabs mb-0 position-relative">
              <div className="tabs border-0 mb-0">
                <ul>
                  {tabs.map((tab, index) => (
                    <li key={`Tab-${index}`}>
                      <Link
                        to={!tab.disabled ? tab.paths[0] : '#'}
                        className={`${
                          currentTab?.name === tab.name ? 'active' : ''
                        }`}
                      >
                        {tab.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="buttons">
            {editUrl && (
              <div className="editAnchor">
                <Link to={editUrl} state={{ fromView }}>
                  <SvgComponent name={'EditIcon'} /> <span>Edit</span>{' '}
                  {!hideTabname ? editLabel || currentTab?.name : ''}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {children && (
        <div className="filterBar">
          <div className="filterInner">
            <h2>Filters</h2>
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default StaffNavigation;
