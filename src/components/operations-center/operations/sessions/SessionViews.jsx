import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Session from './Session.jsx';
import TopBar from '../../../common/topbar/index.js';
import SessionsNavigationTabs from './navigationTabs.jsx';
import SessionAboutView from './about/index.js';
import { API } from '../../../../api/api-routes.js';
import { toast } from 'react-toastify';
import CheckPermission from '../../../../helpers/CheckPermissions.js';
import OcPermissions from '../../../../enums/OcPermissionsEnum.js';
import { OPERATIONS_CENTER_SESSIONS_PATH } from '../../../../routes/path.js';
import SvgComponent from '../../../common/SvgComponent.js';
export default function SessionView() {
  const { id, slug } = useParams();
  const [sessionData, setSessionData] = useState([]);
  const [donorCenterDetail, setDonorCenterDetail] = useState(null);

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    try {
      const { data } = await API.operationCenter.sessions.getSessionFindOne(id);
      if (data?.data) {
        const modified = {
          donor_center: data?.data?.donor_center?.name,
          session_date: data?.data?.date,
        };
        setDonorCenterDetail(modified);
        setSessionData(data?.data);
      }
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };
  const SessionBreadCrumbs = [
    { label: 'Operations Center', class: 'disable-label', link: '/' },
    {
      label: 'Operations',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: 'Sessions',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.LIST,
    },
    {
      label: 'View Session',
      class: 'disable-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.VIEW.replace(':id', id).replace(
        ':slug',
        slug
      ),
    },
    {
      label: 'About',
      class: 'active-label',
      link: OPERATIONS_CENTER_SESSIONS_PATH.VIEW.replace(':id', id).replace(
        ':slug',
        slug
      ),
    },
  ];
  return (
    <div>
      <div className="mainContent ">
        <TopBar
          BreadCrumbsData={SessionBreadCrumbs}
          BreadCrumbsTitle={'About'}
          SearchValue={null}
          SearchOnChange={null}
          SearchPlaceholder={null}
        />
        <div className="imageContentMain">
          <Session data={donorCenterDetail} />
          <div className="tabsnLink">
            <SessionsNavigationTabs />
            {CheckPermission([
              OcPermissions.OPERATIONS_CENTER.OPERATIONS.SESSIONS.WRITE,
            ]) &&
              sessionData?.writeable && (
                <div className="buttons">
                  <div className="editAnchor">
                    <Link
                      to={`/operations-center/operations/sessions/${id}/edit`}
                    >
                      <SvgComponent name={'EditIcon'} /> <span>Edit</span>{' '}
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
      <div className="bodyMainContent">
        <SessionAboutView sessionData={sessionData} />
      </div>
    </div>
  );
}
