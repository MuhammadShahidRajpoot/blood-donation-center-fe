import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../index.module.scss';
import '../driveView.scss';
import TopBar from '../../../../common/topbar/index';
import viewimage from '../../../../../assets/images/viewimage.png';
import NavigationTopBar from '../../../../common/NavigationTopBar';
import {
  OPERATIONS_CENTER,
  OPERATIONS_CENTER_DRIVES_PATH,
} from '../../../../../routes/path';
// import NavigationTopBar from '../../../../common/NavigationTopBar';
import CheckPermission from '../../../../../helpers/CheckPermissions';
import Permissions from '../../../../../enums/OcPermissionsEnum';
import { toast } from 'react-toastify';
import DriveViewNavigationTabs from '../navigationTabs';
// import viewimage from '../../../../../assets/images/viewimage.png';
// import { ShiftDetails } from '../../sessions/SessionBreadCrumbs';
// import ViewForm from './ViewForm';
import ShiftDetail from './shiftDetail';
import Projection from './projection';
import Resources from './resources';
import StaffBreak from './staffBreak';
import OperationalEfficiencyFactor from './OEF';
import { API } from '../../../../../api/api-routes';
import SvgComponent from '../../../../common/SvgComponent';
const NceShiftDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [driveData, setDriveData] = useState(null);

  const [selectedShift, setSelectedShift] = useState(1);
  const [shiftDetails, setShiftDetails] = useState([]);
  const [shiftDetailsData, setShiftDetailsData] = useState();
  const [totalProcedureQty, setTotalProcedureQty] = useState(0);
  const [totalProductQty, setTotalProductQty] = useState(0);
  const [isWriteable, setWriteable] = useState(false);

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
      label: 'Shift Details',
      class: 'active-label',
      link: `/operations-center/operations/drives/${id}/view/shift-details`,
    },
    // {
    //   label: breadCrumbsTitle,
    //   class: 'disable-label',
    //   link: '#',
    // },
  ];
  const getShiftDetails = async (id) => {
    const { data } = await API.operationCenter.drives.getShiftDetails(id);
    if (data?.status_code === 201) {
      setShiftDetails(data?.data[0]?.shifts);
    } else {
      toast.error(`Error in fetching`, { autoClose: 3000 });
    }
  };
  const getDriveData = async (id) => {
    const { data } = await API.operationCenter.drives.getDriveData(id);
    let drive =
      Array.isArray(data?.data) && data?.data[0] ? data?.data[0] : null;
    setDriveData(drive);
    setWriteable(data?.data?.writeable);
  };

  useEffect(() => {
    getDriveData(id);
    getShiftDetails(id);
  }, [id]);
  useEffect(() => {
    if (shiftDetails?.length) {
      setShiftDetailsData(shiftDetails[selectedShift - 1]);
    }
  }, [selectedShift, shiftDetails]);
  useEffect(() => {
    let procedureQtyTotal = 0;
    let productQtyTotal = 0;

    if (shiftDetailsData && shiftDetailsData.shifts_projections_staff) {
      shiftDetailsData.shifts_projections_staff.forEach((staffItem, index) => {
        if (staffItem && index < shiftDetailsData.products.length) {
          procedureQtyTotal += staffItem.procedure_type_qty || 0;
          productQtyTotal += staffItem.product_qty || 0;
        }
      });
    }

    setTotalProcedureQty(procedureQtyTotal);
    setTotalProductQty(productQtyTotal);
  }, [shiftDetailsData]);
  return (
    <div className={styles.DriveViewMain}>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Shift Details'}
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
                      color="primary"
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
        <div className="mainContentInner viewForm">
          <div className={`topPagination`}>
            <h5>Shift</h5>
            {shiftDetails?.map((entry, index) => (
              <button
                key={index}
                className={index === selectedShift - 1 ? 'active' : null}
                onClick={() => {
                  if (index === selectedShift - 1) return;
                  setSelectedShift(index + 1);
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div>
            <div className="row row-gap-4 ">
              <div className="col-lg-6 col-md-12">
                <ShiftDetail shiftDetailsData={shiftDetailsData} />
                <Projection
                  shiftDetailsData={shiftDetailsData}
                  totalProcedureQty={totalProcedureQty}
                  totalProductQty={totalProductQty}
                />
                <OperationalEfficiencyFactor
                  shiftDetailsData={shiftDetailsData}
                />
              </div>
              <div className="col-lg-6 col-md-12">
                <Resources shiftDetailsData={shiftDetailsData} />
                <StaffBreak shiftDetailsData={shiftDetailsData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NceShiftDetails;
