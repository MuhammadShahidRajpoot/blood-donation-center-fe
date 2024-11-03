import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../../styles/Global/Global.scss';
import '../../../styles/Global/Global.scss';
import imageProfile from '../../../assets/clock.svg';
import { fetchData } from '../../../helpers/Api';
import { toast } from 'react-toastify';
import {
  CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH,
  CRM_NON_COLLECTION_PROFILES_PATH,
  CRM_NON_COLLECTION_PROFILES_TASKS_PATH,
  CRM_NON_COLLECTION_PROFILES_EVENT_HISTORY_PATH,
} from '../../../routes/path';
import SvgComponent from '../../common/SvgComponent';

const TopTabsNCP = ({
  NCPID,
  editLink,
  editName,
  endPath,
  activePath,
  buttonRight,
}) => {
  const location = useLocation();
  const currentLocation = location.pathname;
  const [ncpData, setNcpData] = useState({});

  const BASE_URL = process.env.REACT_APP_BASE_URL;
  useEffect(() => {
    const getData = async (NCPID) => {
      if (NCPID) {
        const result = await fetchData(`/non-collection-profiles/${NCPID}`);
        let { data, status, status_code } = result;
        if ((status === 'success') & (status_code === 200)) {
          const { owner_id } = data;
          owner_id.name = `${owner_id?.first_name ?? ''} ${
            owner_id?.last_name ?? ''
          }`;
          setNcpData(data);
        } else {
          toast.error('Error Fetching Non-Collection Profile Details', {
            autoClose: 3000,
          });
        }
      } else {
        toast.error('Error getting Non-Collection Profile Details', {
          autoClose: 3000,
        });
      }
    };
    if (NCPID) {
      getData(NCPID);
    }
  }, [NCPID, BASE_URL]);

  const NonCollectionTabs = [
    {
      label: 'About',
      link: CRM_NON_COLLECTION_PROFILES_PATH.VIEW.replace(':id', NCPID),
      className: 'p10',
    },
    {
      label: 'Blueprints',
      link: CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH.LIST.replace(
        ':id',
        NCPID
      ),
      relevantLinks: [
        CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH.VIEW.replace(
          ':nonCollectionProfileId',
          NCPID
        ).replace(':id', activePath),
        CRM_NON_COLLECTION_PROFILES_BLUEPRINTS_PATH.SHIFT_DETAILS.replace(
          ':nonCollectionProfileId',
          NCPID
        ).replace(':id', activePath),
      ],
      className: 'p10',
    },
    {
      label: 'Tasks',
      link: CRM_NON_COLLECTION_PROFILES_TASKS_PATH.LIST.replace(
        ':nonCollectionProfileId',
        NCPID
      ),
      className: 'p10',
    },
    {
      label: 'Documents',
      link: `/crm/non-collection-profiles/${NCPID}/documents/${
        endPath ? endPath : 'notes'
      }`,
      relevantLinks: [
        `/crm/non-collection-profiles/${NCPID}/documents/${
          activePath ? activePath : 'notes'
        }`,
      ],
      className: 'p10',
    },
    {
      label: 'Event History',
      link: CRM_NON_COLLECTION_PROFILES_EVENT_HISTORY_PATH.LIST.replace(
        ':id',
        NCPID
      ),
      className: 'p10',
    },
  ];
  return (
    <div className="imageContentMain">
      <div className="imageHeading">
        <img src={imageProfile} alt="ClockIcon" />
        <div className="d-flex flex-column">
          <h4>{ncpData?.profile_name}</h4>
          <span>
            {ncpData?.owner_id?.name}
            {', Owner'}
          </span>
        </div>
      </div>
      <div className="tabsnLink">
        <div className="filterBar">
          <div className="d-flex justify-content-between ">
            <div className="tabs border-0 mb-0">
              <ul>
                {NonCollectionTabs?.map((item, key) => (
                  <li key={key}>
                    <Link
                      to={`${item?.link}`}
                      className={
                        item?.relevantLinks?.find(
                          (rl) => rl === currentLocation
                        ) || currentLocation === `${item?.link}`
                          ? 'active'
                          : ''
                      }
                    >
                      {item?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {buttonRight && buttonRight}
        {editLink && (
          <div className="buttons">
            <div className="editAnchor">
              <Link to={editLink}>
                <SvgComponent name="EditIcon" />
                <span>{editName ? editName : 'Edit'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTabsNCP;
