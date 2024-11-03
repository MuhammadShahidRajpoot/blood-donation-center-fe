import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { DRIVES_RESULT_PATH } from '../../../../routes/path';
import { DRIVES_CHANGE_AUDIT_PATH } from '../../../../routes/path';

const DriveNavigationTabs = () => {
  const params = useParams();
  const id = params?.id || params?.drive_id;
  const slug = params?.slug;
  const location = useLocation();
  const currentLocation = location.pathname;

  return (
    <div className="filterBar">
      <div className="flex justify-content-between tabs mb-0 position-relative">
        <div className="tabs border-0 mb-0">
          <ul>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/view/about`}
                className={slug === `about` ? 'active' : ''}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/view/shift-details`}
                className={
                  currentLocation ===
                  `/operations-center/operations/drives/${id}/view/shift-details`
                    ? 'active'
                    : ''
                }
              >
                Shift Details
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/view/marketing-details`}
                className={
                  currentLocation ===
                  `/operations-center/operations/drives/${id}/view/marketing-details`
                    ? 'active'
                    : ''
                }
              >
                Marketing Details
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/tasks`}
                className={location.pathname.includes('tasks') ? 'active' : ''}
              >
                Tasks
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/view/documents/notes`}
                className={
                  location.pathname.includes('documents') ? 'active' : ''
                }
              >
                Documents
              </Link>
            </li>
            <li>
              <Link
                to={DRIVES_CHANGE_AUDIT_PATH.LIST.replace(':drive_id', id)}
                className={
                  DRIVES_CHANGE_AUDIT_PATH.LIST.replace(':drive_id', id) ===
                  location.pathname
                    ? 'active'
                    : ''
                }
              >
                Change Audit
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/view/donor-schedules`}
                className={
                  location.pathname.includes('donor-schedules') ? 'active' : ''
                }
              >
                Donor Schedules
              </Link>
            </li>
            <li>
              <Link
                to={`/operations-center/operations/drives/${id}/staffing`}
                className={
                  location.pathname.includes('staffing') ? 'active' : ''
                }
              >
                Staffing
              </Link>
            </li>
            <li>
              <Link
                to={DRIVES_RESULT_PATH.LIST.replace(':drive_id', id)}
                className={
                  location.pathname.includes('results') ? 'active' : ''
                }
              >
                Results
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DriveNavigationTabs;
