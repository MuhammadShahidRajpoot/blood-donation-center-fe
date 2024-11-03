import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TopBar from '../../../../common/topbar/index';
import '../index.scss';
import Styles from './index.module.scss';
import { API } from '../../../../../api/api-routes';
import { toast } from 'react-toastify';
import { CRMAccountsBreadCrumbsData } from '../../AccountsBreadCrumbsData';
import AccountViewHeader from '../../header';
import LocationAboutNavigationTabs from '../../../accounts/navigationTabs';
import viewimage from '../../../../../assets/images/viewimage.png';
import { CRM_ACCOUNT_BLUEPRINT_PATH } from '../../../../../routes/path';
import Projection from '../../../../operations-center/operations/sessions/ShiftDetail/bluePrintProjection';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';

const ShiftDetailsView = () => {
  const { id, blueprintId } = useParams();
  const [selectedShift, setSelectedShift] = useState(1);
  const [shiftDetails, setShiftDetails] = useState([]);
  const [shiftDetailsData, setShiftDetailsData] = useState();
  const [oefToggle, setOefToggle] = useState(false);
  // const [wholeBloodToggle, setWholeBloodToggle] = useState(false);
  // const [doubleRbcToggle, setDoubleRbcToggle] = useState(false);
  const accessToken = localStorage.getItem('token');

  useEffect(() => {
    const getShiftDetails = async () => {
      const { data } = await API.crm.crmAccounts.getAccountShiftDetails(
        blueprintId,
        accessToken
      );
      if (data?.status_code === 201) {
        setShiftDetails(data?.data?.[0]?.shifts);
        console.log('setShiftDetails--------<>', data?.data?.[0]?.shifts);
      } else {
        toast.error(`Error in fetching`, { autoClose: 3000 });
      }
    };
    getShiftDetails();
  }, [blueprintId]);

  useEffect(() => {
    if (shiftDetails?.length) {
      let currentShift = selectedShift - 1;
      let dupselectedShiftDetail = shiftDetails[currentShift];
      console.log('dupselectedShiftDetail--------<>', dupselectedShiftDetail);

      let selectedShiftDetail = { ...dupselectedShiftDetail };
      let shiftId = selectedShiftDetail?.shift_id;
      let associatedProducts;
      let updatedShiftDetailData;
      console.log('selectedShiftDetail--------<>', selectedShiftDetail);

      if (selectedShiftDetail?.procedure_types) {
        const d = dupselectedShiftDetail?.procedure_types?.filter(
          (obj) => obj.shift_id === selectedShiftDetail?.shift_id
        );
        console.log('pt------->', d);
        selectedShiftDetail['procedure_types'] = [...d];
      }

      if (
        selectedShiftDetail?.products?.length > 0 &&
        selectedShiftDetail?.procedure_types?.length > 0
      ) {
        associatedProducts = selectedShiftDetail?.products?.map((prev) => {
          if (shiftId === prev?.shift_id) {
            const matchingProducts =
              selectedShiftDetail?.procedure_types?.filter(
                (curr) =>
                  curr.id === prev.procedure_type_id &&
                  curr.shift_id === prev.shift_id
              );
            if (matchingProducts?.length) {
              return { ...prev, procedure_type: { ...matchingProducts[0] } };
            } else {
              return { ...prev, procedure_type: {} };
            }
          }
        });

        associatedProducts = associatedProducts?.filter((n) => n);

        console.log('associatedProducts', associatedProducts);

        updatedShiftDetailData = {
          ...selectedShiftDetail,
          projection: associatedProducts,
        };

        // let updatedShiftDetailData = selectedShiftDetail?.products?.map(
        //   (item, index) => {
        //     return item?.procedure_type_id ===
        //       selectedShiftDetail?.procedure_types[0]?.id
        //       ? item
        //       : null;
        //   }
        // );
        // selectedShiftDetail['products'] = updatedShiftDetailData?.filter(
        //   (n) => n
        // );
      }
      console.log('selectedShiftDetail------->', updatedShiftDetailData);

      setShiftDetailsData(updatedShiftDetailData);
    }
  }, [selectedShift, shiftDetails]);

  const BreadcrumbsData = [
    ...CRMAccountsBreadCrumbsData,
    {
      label: 'View Account',
      class: 'disable-label',
      link: `/crm/accounts/${id}/view/about`,
    },
    {
      label: 'Blueprints',
      class: 'active-label',
      link: `/crm/accounts/${id}/blueprint`,
    },
    {
      label: 'Shift Details',
      class: 'active-label',
      link: `/crm/accounts/${id}/blueprint/${blueprintId}/shifts/view`,
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Shift Details'}
      />
      <div className="imageMainContent">
        <div className="d-flex align-items-center gap-3 ">
          <div style={{ width: '62px', height: '62px' }}>
            <img src={viewimage} style={{ width: '100%' }} alt="CancelIcon" />
          </div>
          <AccountViewHeader />
        </div>
        <LocationAboutNavigationTabs editIcon={true} />
      </div>
      <div className={`mainContentInner ${Styles.blueprintContainer}`}>
        <div className="filterBar p-0 mb-3">
          <div className="flex justify-content-between tabs mb-0 position-relative">
            <div className="border-0">
              <ul>
                <li>
                  <Link
                    to={CRM_ACCOUNT_BLUEPRINT_PATH.ABOUT.replace(
                      ':account_id',
                      id
                    ).replace(':id', blueprintId)}
                    className=""
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/crm/accounts/${id}/blueprint/${blueprintId}/shifts/view`}
                    className="active"
                  >
                    Shift Details
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/crm/accounts/${id}/blueprint/${blueprintId}/marketing-details`}
                    className=""
                  >
                    Marketing Details
                  </Link>
                </li>
              </ul>
            </div>
            <div className="d-flex justify-content-center align-items-center">
              <h5
                className="text m-0 p-0 me-1"
                style={{ fontWeight: '400', fontSize: 20 }}
              >
                Shift
              </h5>
              {shiftDetails?.map((entry, index) => (
                <button
                  key={index}
                  style={{ marginLeft: '0.5rem' }}
                  className={
                    index === selectedShift - 1
                      ? Styles.pageCardactive
                      : Styles.pageCard
                  }
                  onClick={() => {
                    if (index === selectedShift - 1) return;
                    setSelectedShift(index + 1);
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="tableView blueprintView">
          <div className="row">
            <div className="col-md-6">
              <div className="tableViewInner test">
                <div className="group">
                  <div className="group-head">
                    <h2>Shift Details</h2>
                  </div>
                  <div className="group-body">
                    <ul>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Start Time
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.start_time
                            ? formatDateWithTZ(
                                shiftDetailsData?.start_time,
                                'hh:mm a'
                              )
                            : 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          End Time
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.end_time
                            ? formatDateWithTZ(
                                shiftDetailsData?.end_time,
                                'hh:mm a'
                              )
                            : 'N/A'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mb-3">
                  <Projection shiftDetailsData={shiftDetailsData} />
                </div>
                <div className="group">
                  <div className="group-head">
                    <div className="d-flex align-items-center justify-between w-100">
                      <h2>Operational Efficiency Factor (OEF)</h2>
                      <button
                        onClick={() => setOefToggle(!oefToggle)}
                        className="btn btn-link btn-md bg-transparent"
                      >
                        {oefToggle ? 'View As Products' : 'View As Procedures'}
                      </button>
                    </div>
                  </div>
                  <div className="group-body">
                    <ul>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          {oefToggle ? 'OEF (Procedures)' : 'OEF (Products)'}
                        </span>
                        <span className="right-data">
                          {oefToggle
                            ? shiftDetailsData?.oef_procedures
                              ? shiftDetailsData?.oef_procedures
                              : 'N/A'
                            : shiftDetailsData?.oef_products
                            ? shiftDetailsData?.oef_products
                            : 'N/A'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="tableViewInner test">
                <div className="group">
                  <div className="group-head">
                    <h2>Resources</h2>
                  </div>
                  <div className="group-body">
                    <ul>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Staff Setup
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.staff_setup?.length
                            ? shiftDetailsData?.staff_setup?.map(
                                (item, index) => (
                                  <>
                                    {item?.name}
                                    {index !==
                                    shiftDetailsData?.staff_setup?.length - 1
                                      ? ', '
                                      : ''}
                                  </>
                                )
                              )
                            : 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Vehicles
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.vehicle?.length
                            ? shiftDetailsData?.vehicle?.map((item, index) => (
                                <>
                                  {item?.name}
                                  {index !==
                                  shiftDetailsData?.vehicle?.length - 1
                                    ? ', '
                                    : ''}
                                </>
                              ))
                            : 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Devices
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.device?.length
                            ? shiftDetailsData?.device?.map((item, index) => (
                                <>
                                  {item?.name}
                                  {index !==
                                  shiftDetailsData?.device?.length - 1
                                    ? ', '
                                    : ''}
                                </>
                              ))
                            : 'N/A'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="group">
                  <div className="group-head">
                    <h2>Staff Break</h2>
                  </div>
                  <div className="group-body">
                    <ul>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Start Time
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.break_start_time
                            ? formatDateWithTZ(
                                shiftDetailsData?.break_start_time,
                                'hh:mm a'
                              )
                            : 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          End Time
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.break_end_time
                            ? formatDateWithTZ(
                                shiftDetailsData?.break_end_time,
                                'hh:mm a'
                              )
                            : 'N/A'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Reduce Slots
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.reduce_slots ? 'Yes' : 'No'}
                        </span>
                      </li>
                      <li>
                        <span
                          className="left-heading"
                          style={{ alignItems: 'start' }}
                        >
                          Appointment Reduction
                        </span>
                        <span className="right-data">
                          {shiftDetailsData?.reduction_percentage
                            ? `${shiftDetailsData?.reduction_percentage}%`
                            : 'N/A'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShiftDetailsView;
