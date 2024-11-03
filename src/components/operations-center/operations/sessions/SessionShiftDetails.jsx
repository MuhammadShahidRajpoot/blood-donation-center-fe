import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
// import SvgComponent from '../../../common/SvgComponent';
import Styles from './Session.module.scss';
// import ViewForm from '../../../common/ViewForm/index.js';
// import viewimage from '../../../../assets/images/viewimage.png';
import ShiftDetail from './ShiftDetail/shiftDetail.jsx';
import Projection from './ShiftDetail/projection.jsx';
import OperationalEfficiencyFactor from './ShiftDetail/OEF.jsx';
import Resources from './ShiftDetail/resources.jsx';
import StaffBreak from './ShiftDetail/staffBreak.jsx';
import { SessionBreadCrumbs } from './SessionBreadCrumbs';
// import SessionTopTabs from './SessionTopTabs';
// import { SESSION_TASKS_PATH } from '../../../../routes/path.js';
import CheckPermission from '../../../../helpers/CheckPermissions.js';
import Permissions from '../../../../enums/OcPermissionsEnum';
import { API } from '../../../../api/api-routes.js';
import { toast } from 'react-toastify';
import TopBar from '../../../common/topbar/index.js';
// import NavigationTopBar from '../../../common/NavigationTopBar.jsx';
import SessionsNavigationTabs from './navigationTabs.jsx';
import Session from './Session.jsx';
import SvgComponent from '../../../common/SvgComponent.js';

const NceShiftDetails = () => {
  const { id: session_id } = useParams();
  const [selectedShift, setSelectedShift] = useState(1);
  const [shiftDetails, setShiftDetails] = useState([]);
  const [donorCenterDetail, setDonorCenterDetail] = useState(null);
  const [shiftDetailsData, setShiftDetailsData] = useState();
  const [totalProcedureQty, setTotalProcedureQty] = useState(0);
  const [totalProductQty, setTotalProductQty] = useState(0);
  const [sessionData, setSessionData] = useState([]);

  const getShiftDetails = async (id) => {
    const { data } = await API.operationCenter.sessions.getShiftDetails(id);
    if (data?.status_code === 201) {
      setDonorCenterDetail(data?.data[0]);
      setShiftDetails(data?.data[0]?.shifts);
    } else {
      toast.error(`Error in fetching`, { autoClose: 3000 });
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } =
          await API.operationCenter.sessions.getSessionFindOne(session_id);
        if (data?.data) {
          setSessionData(data?.data);
        }
      } catch (error) {
        toast.error(`Failed to fetch`, { autoClose: 3000 });
      }
    };

    getShiftDetails(session_id);
    getData();
  }, [session_id]);

  useEffect(() => {
    let currentShift = selectedShift - 1;
    setShiftDetailsData(sessionData?.shifts?.[currentShift]);
  }, [selectedShift, sessionData?.shifts]);

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
    <div className={Styles.DriveViewMain}>
      <div className="mainContent ">
        <TopBar
          BreadCrumbsData={SessionBreadCrumbs}
          BreadCrumbsTitle={'Shift Details'}
          SearchValue={null}
          SearchOnChange={null}
          SearchPlaceholder={null}
        />
        <div className="imageContentMain">
          <Session data={donorCenterDetail} />
          <div className="tabsnLink">
            <SessionsNavigationTabs />
            {CheckPermission([
              Permissions.OPERATIONS_CENTER.OPERATIONS.SESSIONS.WRITE,
            ]) &&
              sessionData?.writeable && (
                <div className="buttons">
                  <div className="editAnchor">
                    <Link
                      to={`/operations-center/operations/sessions/${session_id}/edit`}
                    >
                      <SvgComponent name={'EditIcon'} />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              )}
          </div>
        </div>
        <div className="mainContentInner viewForm">
          <div className="topPagination">
            <h5>Shift</h5>
            {shiftDetails?.map((entry, index) => (
              <button
                key={index}
                className={index === selectedShift - 1 ? 'active' : ''}
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
            <div className="tablesContainer">
              <div className="leftTables">
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
              <div className="rightTables">
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
