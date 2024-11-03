import React, { useEffect, useState } from 'react';
import TopBar from './topbar/index';
import { OPERATIONS_CENTER } from '../../../routes/path';
import SvgComponent from '../../common/SvgComponent';
import { Link, useParams } from 'react-router-dom';
import moment from 'moment';
import ToolTip from '../../common/tooltip';
import SuccessPopUpModal from '../../common/successModal';
import styles from './index.module.scss';
import { API } from '../../../api/api-routes';
import { toast } from 'react-toastify';
import { formatDateWithTZ } from '../../../helpers/convertDateTimeToTimezone';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';
import handleSendNotification from '../../../helpers/notification';

export default function BeginApprovals() {
  const token = localStorage.getItem('token');
  const { id } = useParams();
  const [expandedRow, setExpandedRow] = useState(-1);
  const [underDiscussionModalPopUp, setUnderDiscussionModalPopUp] =
    useState(false);
  const [underDiscussion, setUnderDiscussion] = useState(false);
  const [resolveDiscussionPopUp, setResolveDiscussionPopUp] = useState(false);
  const [overRideState, setOverRideState] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(+id);
  const [totalObjects, setTotalObjects] = useState(0);
  const [approval, setApproval] = useState([]);
  const [detailResolved, setDetailResolved] = useState(false);
  const [approvalResolved, setApprovalResolved] = useState(false);
  const [leftApprovalId, setLeftApprovalId] = useState(null);
  const [rightApprovalId, setRightApprovalId] = useState(null);
  const [sortOrderCw, setSortOrderCw] = useState('asc');
  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Approvals',
      class: 'disable-label',
      link: '/',
    },
    {
      label: 'View Approval',
      class: 'disable-label',
      link: '/',
    },
  ];

  useEffect(() => {
    getApprovalData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await API.ocApprovals.getSingleData(
          token,
          currentIndex || id
        );

        const approvalData = data?.data;
        setApproval(approvalData);
        setLeftApprovalId(+approvalData?.left_approval?.id);
        setRightApprovalId(+approvalData?.right_approval?.id);
      } catch (e) {
        toast.error(`${e?.message}`, { autoClose: 3000 });
      } finally {
        // setIsLoading(false);
      }
    };
    getData();
  }, [currentIndex, detailResolved, underDiscussion, approvalResolved]);

  const getApprovalData = async () => {
    try {
      const { data } = await API.ocApprovals.approvalList(token);
      setTotalObjects(data?.lastRecordId);
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const approveOrRejectAll = async (handleType) => {
    try {
      let updateApprovalDetailbody = {};
      let details = [];
      if (handleType == 'approve-all') {
        details = approval?.details?.map((approvalDetail) => {
          return {
            id: approvalDetail.id,
            field_approval_status: 'Approved',
          };
        });
      } else if (handleType == 'reject-all') {
        details = approval?.details?.map((approvalDetail) => {
          return {
            id: approvalDetail.id,
            field_approval_status: 'Rejected',
          };
        });
      }

      updateApprovalDetailbody = {
        ...updateApprovalDetailbody,
        request_status: 'Resolved',
        details,
      };

      const { data } = await API.ocApprovals.updateApprovalDetail(
        token,
        id,
        updateApprovalDetailbody
      );

      if (data?.status_code == 200) {
        setApprovalResolved(true);
        const notification = await handleSendNotification(
          'Approval',
          handleType == 'approve-all'
            ? 'Approval Approved'
            : 'Approval Rejected',
          [1, 2, 3],
          [201],
          'https://example.com',
          null,
          456,
          'users'
        );
        if (notification?.status_code !== 201) {
          toast.error('Error in sending notification', { autoClose: 3000 });
        }
      } else if (data?.status_code == 404) {
        toast.error(data.response, {
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const approveOrRejectOne = async (shift, fieldApprovalStatus) => {
    try {
      const approvalDetail = organizedData[shift][0];
      let updateApprovalDetailbody = {};
      let details = [];
      if (approvalDetail?.shift_id) {
        const filteredDetails = approval?.details.filter((detail) => {
          return detail.shift_id === approvalDetail?.shift_id;
        });

        details = filteredDetails?.map((filteredDetail) => {
          return {
            id: filteredDetail.id,
            field_approval_status: fieldApprovalStatus,
          };
        });

        updateApprovalDetailbody = {
          ...updateApprovalDetailbody,
          details,
        };
      } else {
        const filteredDetails = approval?.details?.filter((detail) => {
          return detail.shift_id === null;
        });
        details = filteredDetails?.map((filteredDetail) => {
          return {
            id: filteredDetail.id,
            field_approval_status: fieldApprovalStatus,
          };
        });

        updateApprovalDetailbody = {
          ...updateApprovalDetailbody,
          details,
        };
      }

      const { data } = await API.ocApprovals.updateApprovalDetail(
        token,
        id,
        updateApprovalDetailbody
      );

      if (data?.status_code == 200) {
        setDetailResolved(true);
        const notification = await handleSendNotification(
          'Approval',
          `Approval ${fieldApprovalStatus}`,
          [1, 2, 3],
          [201],
          'https://example.com',
          null,
          456,
          'users'
        );
        if (notification?.status_code !== 201) {
          toast.error('Error in sending notification', { autoClose: 3000 });
        }
      } else if (data?.status_code == 404) {
        toast.error(data.response, {
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const approveOrRejectSpecificOne = async (detailId, fieldApprovalStatus) => {
    try {
      const details = [
        {
          id: detailId,
          field_approval_status: fieldApprovalStatus,
        },
      ];

      const updateApprovalDetailbody = {
        details,
      };

      const { data } = await API.ocApprovals.updateApprovalDetail(
        token,
        id,
        updateApprovalDetailbody
      );

      if (data?.status_code === 200) {
        setDetailResolved(true);
        const notification = await handleSendNotification(
          'Approval',
          `Approval Override ${fieldApprovalStatus}`,
          [1, 2, 3],
          [201],
          'https://example.com',
          null,
          456,
          'users'
        );
        if (notification?.status_code !== 201) {
          toast.error('Error in sending notification', { autoClose: 3000 });
        }
      } else if (data?.status_code == 404) {
        toast.error(data.response, {
          autoClose: 3000,
        });
      }
    } catch (e) {
      toast.error(`${e?.message}`, { autoClose: 3000 });
    } finally {
      // setIsLoading(false);
    }
  };

  const discussionRequired = async (isUnderDiscussion) => {
    const updateApprovalbody = {
      is_discussion_required: isUnderDiscussion,
    };

    const { data } = await API.ocApprovals.updateApprovalDetail(
      token,
      id,
      updateApprovalbody
    );

    if (data?.status_code === 200) {
      setUnderDiscussion(isUnderDiscussion);
      const notification = await handleSendNotification(
        'Approval',
        'Approval Discussion Required',
        [1, 2, 3],
        [201],
        'https://example.com',
        null,
        456,
        'users'
      );
      console.log('under discussion');
      if (notification?.status_code !== 201) {
        toast.error('Error in sending notification', { autoClose: 3000 });
      }
    } else if (data?.status_code == 404) {
      toast.error(data.response, {
        autoClose: 3000,
      });
    }
  };

  const overrideExist = (field) => {
    const overrideStateData = approval.details.filter(
      (detail) => detail.is_override === true && detail.field === field
    );

    if (overrideStateData.length === 0) {
      return null;
    }

    const highestIdDetail = overrideStateData.reduce((prev, current) => {
      return prev.id > current.id ? prev : current;
    });

    return highestIdDetail;
  };

  const handleLeftArrowClick = () => {
    if (currentIndex > 1 && leftApprovalId) {
      setCurrentIndex(leftApprovalId);
    }
  };

  const handleRightArrowClick = () => {
    if (currentIndex < totalObjects && rightApprovalId) {
      setCurrentIndex(rightApprovalId);
    }
  };

  const formatField = (field) => {
    const words = field.replace(/_/g, ' ').split(' ');
    const formattedWords = words?.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

    return formattedWords.join(' ');
  };
  const organizeData = () => {
    const organizedData = {};

    approval?.details?.forEach((el) => {
      const shiftId =
        el.shift_id === null ? approval?.operationable_type : el.shift_id;

      if (!organizedData[shiftId]) {
        organizedData[shiftId] = [];
      }
      organizedData[shiftId].push(el);
    });

    return organizedData;
  };

  const organizedData = organizeData();

  const handleSortToggleCw = () => {
    setSortOrderCw((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const getLinkBasedOnType = () => {
    const id = approval?.operationable_id;
    const type = approval?.operationable_type;
    switch (type) {
      case PolymorphicType.OC_OPERATIONS_DRIVES:
        return `/operations-center/operations/drives/${id}/view/about`;
      case PolymorphicType.OC_OPERATIONS_SESSIONS:
        return `/operations-center/operations/sessions/${id}/view/about`;
      case PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS:
        return `/operations-center/operations/non-collection-events/${id}/view/about`;
      default:
        return `/operations-center/approvals/ListApprovals/${id}/view`;
    }
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Approvals'}
        overRideState={overRideState}
        setOverRideState={setOverRideState}
      />
      <div className="imageContentWithPagination">
        <div className="about-data">
          <div className="image">
            <figure>
              <SvgComponent name={'ApprovalViewIcon'} />
            </figure>
          </div>
          <div className="data">
            <h4>{approval?.name}</h4>
            <span>{approval?.location_name ?? approval?.address_name}</span>
            <p>
              {moment(approval?.created_at).format('ddd, MMM D, YYYY')}
              <br />
              {`${formatDateWithTZ(
                approval?.shifts_data?.min_start_time,
                'hh:mm a'
              )} - ${formatDateWithTZ(
                approval?.shifts_data?.max_end_time,
                'hh:mm a'
              )}`}{' '}
              {approval?.projection && (
                <>
                  <br /> Projection:{' '}
                  {approval.projection.sum_procedure_type_qty} /{' '}
                  {approval.projection.sum_product_yield}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="right-sec">
          <Link to={getLinkBasedOnType()} className="view-link clearfix">
            View Details
          </Link>
          <div className="pagination">
            <button className="left-arrow" onClick={handleLeftArrowClick}>
              <SvgComponent name={'ArrowLeft'} />
            </button>
            <span>{`${currentIndex}/${totalObjects}`}</span>
            <button className="right-arrow" onClick={handleRightArrowClick}>
              <SvgComponent name={'ArrowRight'} />
            </button>
          </div>
        </div>
      </div>
      <div className="mainContentInner">
        <div className="table-listing-main approve-table">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th width="15%" align="center">
                    <div className="inliner">
                      <span className="title">Change What</span>
                      <div className="sort-icon" onClick={handleSortToggleCw}>
                        <SvgComponent name={'SortIcon'} />
                      </div>
                    </div>
                  </th>
                  <th width="22%" align="center">
                    <div className="inliner">
                      <span className="title">Original</span>
                    </div>
                  </th>
                  <th width="20%" align="center">
                    <div className="inliner">
                      <span className="title">Requested</span>
                    </div>
                  </th>
                  <th width="20%" align="center">
                    <div className="inliner">
                      <span className="title">Change Log</span>
                    </div>
                  </th>
                  <th width="23%" align="center">
                    <div className="inliner justify-content-center">
                      <span className="title">Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="heading-td bold" colSpan={4}>
                    Perform Action
                  </td>
                  <td className="heading-td">
                    {approval?.request_status === 'Pending' ? (
                      !approval?.is_discussion_required ? (
                        <button
                          style={{ backgroundColor: 'transparent', padding: 0 }}
                          onClick={() => {
                            setUnderDiscussion(false);
                            setUnderDiscussionModalPopUp(true);
                            discussionRequired(true);
                          }}
                        >
                          <ToolTip
                            text={'Discussion Needed'}
                            icon={<SvgComponent name={'MarkChatUnread'} />}
                          />
                        </button>
                      ) : (
                        <button
                          style={{
                            backgroundColor: 'transparent',
                            padding: 0,
                          }}
                          onClick={() => {
                            setResolveDiscussionPopUp(true);
                          }}
                        >
                          <ToolTip
                            text={'Under Discussion'}
                            icon={<SvgComponent name={'RedMarkChatUnread'} />}
                          />
                        </button>
                      )
                    ) : null}

                    <button
                      onClick={() => {
                        setApprovalResolved(false);
                        approveOrRejectAll('approve-all');
                      }}
                      className={`approve-btn ${
                        approval?.is_discussion_required ||
                        approval?.request_status == 'Resolved' ||
                        overRideState
                          ? styles.disabledBtn
                          : ''
                      }`}
                    >
                      Approve All
                    </button>
                    <button
                      onClick={() => {
                        setApprovalResolved(false);
                        approveOrRejectAll('reject-all');
                      }}
                      className={`reject-btn ${
                        approval?.is_discussion_required ||
                        approval?.request_status == 'Resolved' ||
                        overRideState
                          ? styles.disabledBtn
                          : ''
                      }`}
                    >
                      Reject All
                    </button>
                  </td>
                </tr>
                {Object.keys(organizedData)?.map((shift, i) => {
                  return (
                    <React.Fragment key={shift}>
                      <tr>
                        <td className="heading-td bold" colSpan={4}>
                          {shift != PolymorphicType.OC_OPERATIONS_SESSIONS &&
                          shift !=
                            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS &&
                          shift != PolymorphicType.OC_OPERATIONS_DRIVES ? (
                            <span>
                              Shift {organizedData[shift][0]?.shift_number}
                            </span>
                          ) : (
                            <span>{formatField(shift)}</span>
                          )}
                        </td>
                        {/* )} */}
                        <td className="heading-td">
                          {approval?.is_discussion_required ||
                          approval?.request_status == 'Resolved' ? (
                            <React.Fragment>
                              <SvgComponent name={'DisabledCheckIcon'} />
                              <SvgComponent name={'DisabledCross'} />
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <button
                                className={styles.acceptBtn}
                                onClick={() => {
                                  setDetailResolved(false);
                                  approveOrRejectOne(shift, 'Approved');
                                }}
                              >
                                <SvgComponent name={'CheckIcon'} />
                              </button>
                              <button
                                className={styles.acceptBtn}
                                onClick={() => {
                                  setDetailResolved(false);
                                  approveOrRejectOne(shift, 'Rejected');
                                }}
                              >
                                <SvgComponent name={'CrossRed'} />
                              </button>
                            </React.Fragment>
                          )}
                          <button
                            className="positionIcon"
                            onClick={() => {
                              setExpandedRow(i === expandedRow ? -1 : i);
                            }}
                          >
                            <SvgComponent
                              name={expandedRow === i ? 'UpArrow' : 'DownArrow'}
                            />
                          </button>
                        </td>
                      </tr>
                      {organizedData[shift]
                        ?.sort((a, b) => {
                          const comparison = a.field.localeCompare(b.field);
                          return sortOrderCw === 'asc'
                            ? comparison
                            : -comparison;
                        })
                        ?.map((el, index) => {
                          if (!el.is_override) {
                            return (
                              <tr
                                className={`${
                                  expandedRow === i ? '' : 'd-none'
                                } ${
                                  overRideState && overrideExist(el?.field)
                                    ? styles.overRide
                                    : ''
                                }`}
                                key={index}
                              >
                                {/* {shift?.original?.shift_start_time && ( */}
                                <td className="heading-td">
                                  <span>{formatField(el?.field)}</span>
                                </td>

                                <td>
                                  {[
                                    'vehicles',
                                    'devices',
                                    'staff_setups',
                                    'certifications',
                                    'projections',
                                    'marketing_items',
                                    'promotional_items',
                                  ].includes(el?.field)
                                    ? Array.isArray(el?.original[el?.field])
                                      ? el?.original[el?.field]?.map(
                                          (item, index) =>
                                            typeof item === 'object' ? (
                                              <span key={index}>
                                                {`${item?.name} ${
                                                  [
                                                    'promotional_items',
                                                    'marketing_items',
                                                  ].includes(el?.field)
                                                    ? `(${item?.quantity})`
                                                    : ''
                                                }${
                                                  el.original[el?.field]
                                                    .length - 1
                                                    ? ''
                                                    : ', '
                                                }`}
                                              </span>
                                            ) : null
                                        )
                                      : typeof el?.original[el?.field] ===
                                        'object'
                                      ? null
                                      : el?.original[el?.field]
                                    : [
                                        'shift_start_time',
                                        'shift_end_time',
                                        'shift_break_start_time',
                                        'shift_break_end_time',
                                      ].includes(el?.field) &&
                                      el?.original[el?.field] != 'N/A'
                                    ? formatDateWithTZ(
                                        el?.original[el?.field],
                                        'hh:mm a'
                                      )
                                    : el?.original[el?.field]}
                                </td>

                                <td>
                                  {[
                                    'vehicles',
                                    'devices',
                                    'staff_setups',
                                    'certifications',
                                    'projections',
                                    'marketing_items',
                                    'promotional_items',
                                  ].includes(el?.field)
                                    ? Array.isArray(el?.requested[el?.field])
                                      ? el?.requested[el?.field]?.map(
                                          (item, index) => {
                                            console.log(item);
                                            return typeof item === 'object' ? (
                                              <span key={index}>
                                                {`${item?.name} ${
                                                  [
                                                    'promotional_items',
                                                    'marketing_items',
                                                  ].includes(el?.field)
                                                    ? `${item?.quantity})`
                                                    : ''
                                                }${
                                                  el.requested[el?.field]
                                                    .length - 1
                                                    ? ''
                                                    : ', '
                                                }`}
                                              </span>
                                            ) : null;
                                          }
                                        )
                                      : typeof el?.requested[el?.field] ===
                                        'object'
                                      ? null
                                      : el?.requested[el?.field]
                                    : [
                                        'shift_start_time',
                                        'shift_end_time',
                                        'shift_break_start_time',
                                        'shift_break_end_time',
                                      ].includes(el?.field) &&
                                      el?.requested[el?.field] != 'N/A'
                                    ? formatDateWithTZ(
                                        el?.requested[el?.field],
                                        'hh:mm a'
                                      )
                                    : el?.requested[el?.field]}

                                  {overRideState &&
                                    (() => {
                                      const highestIdDetail = overrideExist(
                                        el?.field
                                      );
                                      if (highestIdDetail !== null) {
                                        return (
                                          <span style={{ color: 'red' }}>
                                            {`  ${
                                              [
                                                'shift_start_time',
                                                'shift_end_time',
                                                'shift_break_start_time',
                                                'shift_break_end_time',
                                              ].includes(el?.field) &&
                                              highestIdDetail.requested[
                                                el?.field
                                              ] != 'N/A'
                                                ? formatDateWithTZ(
                                                    highestIdDetail.requested[
                                                      el?.field
                                                    ],
                                                    'hh:mm a'
                                                  )
                                                : highestIdDetail.requested[
                                                    el?.field
                                                  ]
                                            }
                                              
                                              
                                            }  `}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                </td>

                                <td
                                  style={{
                                    color:
                                      overRideState && overrideExist(el?.field)
                                        ? 'red'
                                        : 'inherit',
                                  }}
                                >
                                  {formatDateWithTZ(
                                    approval?.created_at,
                                    'dd-mm-yyyy | hh:mm a |'
                                  )}{' '}
                                  {approval?.requested_by}
                                </td>
                                <td>
                                  {approval?.is_discussion_required ||
                                  (overRideState &&
                                    !overrideExist(el?.field)) ? (
                                    <React.Fragment>
                                      <SvgComponent
                                        name={'DisabledCheckIcon'}
                                      />
                                      <SvgComponent name={'DisabledCross'} />
                                    </React.Fragment>
                                  ) : (
                                    <React.Fragment>
                                      {el.is_override == false ? (
                                        <>
                                          {!overrideExist(el?.field) &&
                                            el?.field_approval_status ===
                                              'Approved' && (
                                              <span
                                                className={`${styles.badge} ${styles.green}`}
                                              >
                                                {el?.field_approval_status}
                                              </span>
                                            )}

                                          {el?.field_approval_status ===
                                            'Rejected' && (
                                            <span
                                              className={`${styles.badge} ${styles.red}`}
                                            >
                                              {el?.field_approval_status}
                                            </span>
                                          )}

                                          {el?.field_approval_status ===
                                            'Pending' && (
                                            <>
                                              <button
                                                className={styles.acceptBtn}
                                                onClick={() => {
                                                  setDetailResolved(false);
                                                  approveOrRejectSpecificOne(
                                                    el?.id,
                                                    'Approved'
                                                  );
                                                }}
                                              >
                                                <ToolTip
                                                  className={styles.toolTip}
                                                  text={'Accept Override'}
                                                  icon={
                                                    <SvgComponent
                                                      name={'CheckIcon'}
                                                    />
                                                  }
                                                />
                                              </button>
                                              <button
                                                className={styles.acceptBtn}
                                                onClick={() => {
                                                  setDetailResolved(false);
                                                  approveOrRejectSpecificOne(
                                                    el?.id,
                                                    'Rejected'
                                                  );
                                                }}
                                              >
                                                <ToolTip
                                                  className={styles.toolTip}
                                                  text={'Reject Override'}
                                                  icon={
                                                    <SvgComponent
                                                      name={'CrossRed'}
                                                    />
                                                  }
                                                />
                                              </button>
                                            </>
                                          )}

                                          {overrideExist(el?.field) &&
                                            el?.field_approval_status ===
                                              'Approved' && (
                                              <span
                                                className={`${styles.badge} ${styles.red}`}
                                              >
                                                Override
                                              </span>
                                            )}
                                        </>
                                      ) : null}
                                    </React.Fragment>
                                  )}
                                </td>
                              </tr>
                            );
                          } else {
                            return null;
                          }
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SuccessPopUpModal
        title="Discussion Requested!"
        message="The requestor has been notified. The operation will remain in pending status."
        modalPopUp={underDiscussionModalPopUp}
        isNavigate={false}
        setModalPopUp={setUnderDiscussionModalPopUp}
        showActionBtns={true}
        customSVGIcon={<SvgComponent name={'DiscussionRequested'} />}
        DiscussionRequested={true}
      />
      <section
        className={`popup full-section ${
          resolveDiscussionPopUp ? 'active' : ''
        }`}
      >
        <div className="popup-inner" style={{ maxWidth: '420px' }}>
          <div className="icon">
            <SvgComponent name={'ResolveDiscussion'} />
          </div>
          <div className="content">
            <h3>Resolve Discussion!</h3>
            <p>Would you like to resolve the discussion?</p>
            <div className="buttons">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setUnderDiscussion(true);
                  setResolveDiscussionPopUp(false);
                }}
                style={{ minWidth: '170px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setUnderDiscussion(true);
                  setResolveDiscussionPopUp(false);
                  discussionRequired(false);
                }}
                style={{ minWidth: '170px' }}
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
