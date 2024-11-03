import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import '../../../styles/Global/Global.scss';
import '../../../styles/Global/Variable.scss';
import {
  CRM_DONORS_CENTERS,
  DONOR_CENTERS_SESSION_HISTORY_PATH,
  DONOR_CENTERS_TASKS_PATH,
} from '../../../routes/path';
import bloodType from '../../../assets/images/bloodType.svg';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import SvgComponent from '../../common/SvgComponent';

const TopTabsDonorCenters = ({
  donorCenterId,
  bluePrintId,
  typeFilter,
  kindFilter,
  hideSession,
  hideSessionHistoryOptions = true,
  onTypeFilter = null,
  onKindFilter = null,
  editIcon = false,
}) => {
  const location = useLocation();
  const currentLocation = location.pathname;
  const [data, setData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonorCenter = async () => {
      try {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/system-configuration/facilities/${donorCenterId}`
        );
        const data = await response.json();
        setData(data);
      } catch (error) {
        toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
      }
    };

    const BASE_URL = process.env.REACT_APP_BASE_URL;
    fetchDonorCenter();
  }, [donorCenterId]);

  const handleTypeFilter = () => {
    const option = typeFilter === 'Percentage' ? 'Numbers' : 'Percentage';
    onTypeFilter && onTypeFilter(option);
  };

  const handleKindFilter = () => {
    const option = kindFilter === 'Procedures' ? 'Products' : 'Procedures';
    onKindFilter && onKindFilter(option);
  };

  return (
    <div className="imageContentMain">
      <div className="imageHeading">
        <img src={bloodType} alt="ClockIcon" />
        <div className="d-flex flex-column">
          <h4>{data[0]?.name || ''}</h4>
          <span>
            {data[0]?.address?.city || ''}, {data[0]?.address?.state || ''}
          </span>
        </div>
      </div>
      <div className="tabsnLink">
        <div className="filterBar">
          <div className="tabs border-0 mb-0">
            <ul>
              <li>
                <Link
                  to={CRM_DONORS_CENTERS.VIEW.replace(':id', donorCenterId)}
                  className={
                    currentLocation ===
                    CRM_DONORS_CENTERS.VIEW.replace(':id', donorCenterId)
                      ? 'active'
                      : ''
                  }
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to={CRM_DONORS_CENTERS.BLUEPRINT.replace(
                    ':id',
                    donorCenterId
                  )}
                  className={
                    currentLocation ===
                    CRM_DONORS_CENTERS.BLUEPRINT.replace(':id', donorCenterId)
                      ? 'active'
                      : currentLocation ===
                        CRM_DONORS_CENTERS.BLUEPRINT_VIEW.replace(
                          ':id',
                          donorCenterId
                        ).replace(':blueprintId', bluePrintId)
                      ? 'active'
                      : currentLocation ===
                        CRM_DONORS_CENTERS.BLUEPRINT_VIEW_DETAILS.replace(
                          ':id',
                          donorCenterId
                        ).replace(':blueprintId', bluePrintId)
                      ? 'active'
                      : currentLocation ===
                        CRM_DONORS_CENTERS.BLUEPRINT_VIEW_SCHEDULE.replace(
                          ':id',
                          donorCenterId
                        ).replace(':blueprintId', bluePrintId)
                      ? 'active'
                      : ''
                  }
                >
                  Blueprints
                </Link>
              </li>
              <li>
                <Link
                  to={DONOR_CENTERS_TASKS_PATH.LIST.replace(
                    ':donor_center_id',
                    donorCenterId
                  )}
                  className={
                    currentLocation ===
                    DONOR_CENTERS_TASKS_PATH.LIST.replace(
                      ':donor_center_id',
                      donorCenterId
                    )
                      ? 'active'
                      : ''
                  }
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  to={`/crm/donor-center/${donorCenterId}/view/documents/notes`}
                  className={
                    currentLocation?.includes(
                      `/crm/donor-center/${donorCenterId}/view/documents/notes`
                    ) ||
                    currentLocation?.includes(
                      `/crm/donor-center/${donorCenterId}/view/documents/attachments`
                    )
                      ? 'active'
                      : ''
                  }
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link
                  to={DONOR_CENTERS_SESSION_HISTORY_PATH.LIST.replace(
                    ':donor_center_id',
                    donorCenterId
                  )}
                  className={
                    currentLocation?.includes(
                      DONOR_CENTERS_SESSION_HISTORY_PATH.LIST.replace(
                        ':donor_center_id',
                        donorCenterId
                      )
                    )
                      ? 'active'
                      : ''
                  }
                >
                  Session History
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {editIcon ? (
          <div className="buttons">
            <div className="editAnchor">
              <Link
                to={`/crm/donor-centers/${donorCenterId}/blueprints/${bluePrintId}/edit`}
              >
                <SvgComponent name="EditIcon" />
                <span>Edit Blueprint</span>
              </Link>
            </div>
          </div>
        ) : (
          !hideSession && (
            <div className="buttons">
              <button
                onClick={() =>
                  navigate('/operations-center/operations/sessions/create')
                }
                className="btn btn-primary"
              >
                Schedule Session
              </button>
            </div>
          )
        )}

        {!hideSessionHistoryOptions && (
          <div className={`buttons`}>
            <button className="btn simple-text" onClick={handleTypeFilter}>
              View as {typeFilter}
            </button>
            <button className="btn simple-text" onClick={handleKindFilter}>
              View as {kindFilter}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTabsDonorCenters;
