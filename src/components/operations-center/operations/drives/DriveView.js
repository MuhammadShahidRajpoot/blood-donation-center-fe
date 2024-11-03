import React, { useEffect, useState } from 'react';
import TopBar from '../../../common/topbar/index';
import viewimage from '../../../../assets/images/viewimage.png';
import styles from './index.module.scss';
import './driveView.scss';
import DriveViewNavigationTabs from './navigationTabs';
import { useNavigate, useParams } from 'react-router-dom';
import About from './about';
import MarketingDetails from './marketingDetails';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_DRIVES_PATH,
} from '../../../../routes/path';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import NavigationTopBar from '../../../common/NavigationTopBar';
import CheckPermission from '../../../../helpers/CheckPermissions';
import Permissions from '../../../../enums/OcPermissionsEnum';
import { toast } from 'react-toastify';
import SvgComponent from '../../../common/SvgComponent';

function DriveView() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { id, slug } = useParams();
  const [driveData, setDriveData] = useState(null);
  const [isWriteable, setWriteable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modifiedData, setModifiedData] = useState(null);

  const breadCrumbsTitle =
    slug === 'about'
      ? 'About'
      : slug === 'shift_details'
      ? 'Shift Details'
      : slug === 'marketing-details'
      ? 'Marketing Details'
      : slug === 'tasks'
      ? 'Tasks'
      : slug === 'documents'
      ? 'Documents'
      : slug === 'change_audit'
      ? 'Change Audit'
      : slug === 'donor_schedules'
      ? 'Donor Schedules'
      : slug === 'staffing'
      ? 'Staffing'
      : slug === 'results'
      ? 'Results'
      : null;
  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Operations',
      class: 'disable-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'Drives',
      class: 'disable-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.LIST,
    },
    {
      label: 'View Drive',
      class: 'active-label',
      link: `/operations-center/operations/drives/${id}/view/about`,
    },
    {
      label: 'Results',
      class: 'active-label',
      link: OPERATIONS_CENTER_DRIVES_PATH.RESULT.replace(':id', id),
    },
    // {
    //   label: breadCrumbsTitle,
    //   class: 'disable-label',
    //   link: '#',
    // },
  ];

  const getDriveData = async (id) => {
    try {
      setIsLoading(true);
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/${id}`
      );
      // const { data, modifiedData: md } = await result.json();
      const { data } = await result.json();
      data[0] ? setDriveData(data[0]) : setDriveData(null);
      setWriteable(data?.writeable);
      // setModifiedData(md);
      setModifiedData({
        modified_at: data[0]?.drive?.modified_at,
        modified_by: data[0]?.drive?.modified_by,
      });
    } catch (error) {
      toast.error('Error fetching drive');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDriveData(id);
  }, []);

  return (
    <div className={styles.DriveViewMain}>
      <div className="mainContent ">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={breadCrumbsTitle}
          SearchValue={null}
          SearchOnChange={null}
          SearchPlaceholder={null}
        />
        <div className="imageContentMain">
          <NavigationTopBar img={viewimage} data={driveData} />
          <div className="tabsnLink">
            <DriveViewNavigationTabs />
            <div className="buttons">
              {CheckPermission([
                Permissions.OPERATIONS_CENTER.OPERATIONS.DRIVES.WRITE,
              ]) &&
                new Date(driveData?.drive?.date) > new Date() &&
                isWriteable && (
                  <div className="editAnchor">
                    <a
                      onClick={() => {
                        navigate(
                          `/operations-center/operations/drives/${id}/edit`
                        );
                      }}
                    >
                      <SvgComponent name={'EditIcon'} /> <span>Edit Drive</span>
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className={`mainContentInner viewForm`}>
          {slug === 'about' && (
            <About
              driveData={driveData}
              isLoading={isLoading}
              getDriveData={getDriveData}
              modifiedData={modifiedData}
            />
          )}
          {slug === 'marketing-details' && (
            <MarketingDetails
              driveData={driveData}
              isLoading={isLoading}
              getDriveData={getDriveData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DriveView;
