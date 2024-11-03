import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Volunteer from './Volunteer';
import SvgComponent from '../../../common/SvgComponent';

function VolunteerNavigation({
  children,
  editUrl = null,
  editLabel = null,
  volunteer = null,
  hideTabName = false,
}) {
  const params = useParams();
  const location = useLocation();

  const tabs = [
    {
      name: 'About',
      paths: [`/crm/contacts/volunteers/${params?.volunteerId}/view`],
    },
    {
      name: 'Communication',
      paths: [
        `/crm/contacts/volunteers/${params?.volunteerId}/view/communication`,
        `/crm/contacts/volunteers/${params?.volunteerId}/view/communication/${params?.id}/view`,
      ],
    },
    {
      name: 'Tasks',
      paths: [
        `/crm/contacts/volunteers/${params?.volunteerId}/view/tasks`,
        `/crm/contacts/volunteers/${params?.volunteerId}/view/tasks/${params?.id}/view`,
      ],
    },
    {
      name: 'Documents',
      paths: [
        `/crm/contacts/volunteer/${params?.volunteerId}/view/documents/notes`,
        `/crm/contacts/volunteer/${params?.volunteerId}/view/documents/notes/${params?.noteId}/view`,
        `/crm/contacts/volunteer/${params?.volunteerId}/view/documents/attachments/${params?.attachId}/view`,
        `/crm/contacts/volunteer/${params?.volunteerId}/view/documents/attachments`,
      ],
    },
    {
      name: 'Service History',
      paths: [`/crm/contacts/volunteers/${params?.volunteerId}/view/service`],
    },
    {
      name: 'Activity Log',
      paths: [`/crm/contacts/volunteers/${params?.volunteerId}/view/activity`],
    },
    {
      name: 'Duplicates',
      paths: [
        `/crm/contacts/volunteers/${params?.volunteerId}/view/duplicates`,
      ],
    },
  ];

  const currentTab = tabs.find((tab) => tab.paths.includes(location.pathname));

  return (
    <>
      <div className="imageContentMain">
        <Volunteer volunteer={volunteer} />
        <div className="tabsnLink">
          <div className="filterBar">
            <div className="flex justify-content-between tabs mb-0 position-relative">
              <div className="tabs border-0 mb-0">
                <ul>
                  {tabs.map((tab, index) => (
                    <li key={`Tab-${index}`}>
                      <Link
                        to={tab.paths[0]}
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
                <a href={editUrl}>
                  <SvgComponent name={'EditIcon'} /> <span>Edit</span>{' '}
                  {!hideTabName ? editLabel || currentTab?.name : ''}
                </a>
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

export default React.memo(VolunteerNavigation);
