import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import '../../../styles/Global/Global.scss';
import '../../../styles/Global/Variable.scss';
import SvgComponent from '../../common/SvgComponent';

const AccountViewNavigationTabs = ({ editIcon }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, account_id, blueprintId } = useParams();
  const currentLocation = location.pathname;
  return (
    <div className="d-flex justify-content-between">
      <div className="filterBar ps-0 pb-0">
        <div className="flex justify-content-between tabs mb-0 position-relative border-0">
          <div className="tabs border-0 mb-0">
            <ul>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/view/about`}
                  className={
                    currentLocation ===
                    `/crm/accounts/${account_id ?? id}/view/about`
                      ? 'active'
                      : ''
                  }
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/blueprint`}
                  className={
                    currentLocation ===
                    `/crm/accounts/${account_id ?? id}/blueprints/${id}/about`
                      ? 'active'
                      : `/crm/accounts/${account_id ?? id}/blueprint` ===
                        currentLocation
                      ? 'active'
                      : currentLocation ===
                        `/crm/accounts/${
                          account_id ?? id
                        }/blueprint/${blueprintId}/shifts/view`
                      ? 'active'
                      : currentLocation ===
                        `/crm/accounts/${account_id}/blueprint/${id}/marketing-details`
                      ? 'active'
                      : ''
                  }
                >
                  Blueprints
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/tasks`}
                  className={
                    currentLocation ===
                      `/crm/accounts/${account_id ?? id}/tasks` ||
                    currentLocation ===
                      `/crm/accounts/${account_id ?? id}/tasks/${id}/view`
                      ? 'active'
                      : ''
                  }
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/view/documents/notes`}
                  className={
                    currentLocation.includes('documents') ? 'active' : ''
                  }
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/view/drive-history`}
                  className={
                    currentLocation ===
                    `/crm/accounts/${account_id ?? id}/view/drive-history`
                      ? 'active'
                      : ''
                  }
                >
                  Drive History
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/accounts/${account_id ?? id}/view/duplicates`}
                  className={
                    currentLocation ===
                    `/crm/accounts/${account_id ?? id}/view/duplicates`
                      ? 'active'
                      : ''
                  }
                >
                  Duplicates
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {editIcon ? (
        <div
          className="d-flex align-items-center"
          style={{ marginTop: '-15px' }}
        >
          <div className="buttons me-3">
            <Link
              to={`/operations-center/operations/drives/${id}/edit`}
              className="d-flex justify-content-center align-items-center"
            >
              <span className="icon">
                <SvgComponent name="EditIcon" />
              </span>
              <p
                className="text p-0 m-0"
                style={{
                  fontSize: '14px',
                  color: '#387de5',
                  fontWeight: 400,
                  transition: 'inherit',
                }}
              >
                Edit Blueprint
              </p>
            </Link>
          </div>

          <div className="buttons ms-1">
            <button
              onClick={() =>
                navigate('/operations-center/operations/drives/create')
              }
              className="btn btn-primary"
            >
              Schedule Drive
            </button>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default AccountViewNavigationTabs;
