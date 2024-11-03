import React, { useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faCheck } from '@fortawesome/free-solid-svg-icons';
import {
  formatCustomDate,
  formatDate,
} from '../../../../../helpers/formatDate';
import CustomAudioPlayer from '../../../../common/CustomAudioPlayer';
import { Modal } from 'react-bootstrap';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import AssignSegmentsPopUpModal from './AssignSegments';
import FormInput from '../../../../common/form/FormInput';
import { formatUser } from '../../../../../helpers/formatUser';
import moment from 'moment';
import { Link } from 'react-router-dom';
import SvgComponent from '../../../../common/SvgComponent';
import PolymorphicType from '../../../../../enums/PolymorphicTypeEnum';
import { formatDateWithTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import { GlobalContext } from '../../../../../Context/Context';

export const JobDetailsTable = ({ isLoading, callJobDataDetail }) => {
  const getDefaultScriptTypeLabel = (scriptType) => {
    if (scriptType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      return 'Drive';
    } else if (scriptType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      return 'Session';
    } else {
      return 'Other';
    }
  };
  const jobDetails = [
    {
      label: 'Job Type',
      value: callJobDataDetail?.jobType,
    },
    {
      label: 'Name',
      value: callJobDataDetail?.jobName,
    },
    {
      label: 'Job Start Date',
      value: callJobDataDetail?.jobStartDate,
    },
    {
      label: `${getDefaultScriptTypeLabel(
        callJobDataDetail?.jobType?.toLowerCase()
      )} Date`,
      value: callJobDataDetail?.driveDate,
    },
    {
      label: 'Job Size',
      value: callJobDataDetail?.jobSize,
    },
  ];
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">Job Details</th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <td className="col2 no-data text-center">Data Loading</td>
        ) : (
          <>
            {jobDetails?.map((item, index) => (
              <tr key={index}>
                <td className="tableTD col1">{item.label}</td>
                <td className="tableTD col2"> {item.value || 'N/A'} </td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>
  );
};

export const OperationDetails = ({ isLoading, callJobDataDetail }) => {
  const { setCallControlPopup } = useContext(GlobalContext);

  const operationLink = () => {
    if (callJobDataDetail?.job_type === 'Drives') {
      return `/operations-center/operations/drives/${callJobDataDetail?.operationable_id}/view/about`;
    } else if (callJobDataDetail?.job_type === 'Sessions') {
      return `/operations-center/operations/sessions/${callJobDataDetail?.operationable_id}/view/about`;
    } else {
      return `/operations-center/operations/non-collection-events/${callJobDataDetail?.operationable_id}/view/about`;
    }
  };
  const getJobTypeName = () => {
    if (!callJobDataDetail?.job_type) return;
    if (callJobDataDetail?.job_type === 'Drives') {
      return 'Drive';
    } else if (callJobDataDetail?.job_type === 'Sessions') {
      return 'Session';
    } else {
      return 'Other';
    }
  };

  const extractIdFromUrl = (url) => {
    const parts = url.split('/');
    const index = parts.indexOf('call-jobs');
    const id = parts[index + 1];
    return id;
  };

  useEffect(() => {
    const url = window.location.href;
    const id = extractIdFromUrl(url);
    localStorage.setItem('startCallId', id);
  }, []);

  const jobDetails = [
    {
      label: 'Job Type',
      value: callJobDataDetail?.job_type,
    },
    {
      label: 'Location',
      value: callJobDataDetail?.location_name,
    },

    {
      label: `${getJobTypeName()} Date`,
      value: `${callJobDataDetail?.operation_date} - ${formatDateWithTZ(
        callJobDataDetail?.min_start_time,
        'hh:mm a'
      )} - ${formatDateWithTZ(callJobDataDetail?.max_end_time, 'hh:mm a')}`,
    },
    {
      label: 'Recruiter',
      value: callJobDataDetail?.recruiter,
    },
    {
      label: 'Status',
      value: (
        <span
          className={`badge ${callJobDataDetail?.operation_status?.chip_color}`}
        >
          {callJobDataDetail?.operation_status?.name}
        </span>
      ),
    },
    {
      label: 'Promotion',
      value: callJobDataDetail?.promotions?.map((e) => e?.name).join(', '),
    },
    {
      label: 'Promotional Items',
      value: callJobDataDetail?.drive_promotion_items
        ?.filter((e) => e !== null)
        .map((e) => e?.name)
        .join(', '),
    },
    {
      label: 'Donor Information',
      value: callJobDataDetail?.donor_info,
    },
  ];
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">
            <div className="d-flex align-items-center justify-between w-100">
              <span>Job Details</span>
              <Link
                to={operationLink()}
                className="btn btn-link btn-md bg-transparent"
                onClick={() => {
                  setCallControlPopup(true);
                }}
              >
                {getJobTypeName()} Details
              </Link>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <td className="col2 no-data text-center">Data Loading</td>
        ) : (
          <>
            {jobDetails?.map((item, index) => (
              <tr key={index}>
                <td className="tableTD col1">{item.label}</td>
                <td className="tableTD col2"> {item.value || 'N/A'} </td>
              </tr>
            ))}
          </>
        )}
      </tbody>
    </table>
  );
};

export const DonorInfo = ({ isLoading, callJobDataDetail, donorId }) => {
  const { setCallControlPopup } = useContext(GlobalContext);
  const jobDetails = [
    {
      label: 'Donor Name',
      value: callJobDataDetail?.name,
    },
    {
      label: 'Blood Type',
      value: callJobDataDetail?.blood_group,
    },

    {
      label: 'Nick Name',
      value: callJobDataDetail?.nick_name,
    },
    {
      label: 'Date of Birth',
      value: callJobDataDetail?.birth_date,
    },
    {
      label: 'Lifetime Donations',
      value: callJobDataDetail?.donation_ltd,
    },
    {
      label: 'Loyalty Points',
      value: callJobDataDetail?.points,
    },
    {
      label: 'CMV Status',
      value: callJobDataDetail?.cmv_status,
    },
  ];
  const donationDetails = [
    {
      label: 'Date',
      value: callJobDataDetail?.last_donation,
    },
    {
      label: 'Account - Location',
      value: callJobDataDetail?.donor_address,
    },
    {
      label: 'Procedure',
      value: callJobDataDetail?.donation_type_name,
    },
  ];
  const eligibilityDate = (date) => {
    if (date) {
      return moment(new Date()).startOf('day').format() >
        moment(date).startOf('day').format()
        ? moment(new Date()).format('MM-DD-YYYY')
        : moment(date).format('MM-DD-YYYY');
    } else {
      return 'N/A';
    }
  };
  const eligibilityCheck = (date) => {
    if (date) {
      return moment(new Date()).startOf('day').format() >=
        moment(date).startOf('day').format()
        ? true
        : false;
    } else {
      return true;
    }
  };

  const eligibilities = Array.isArray(callJobDataDetail?.eligibilities)
    ? callJobDataDetail.eligibilities.map((item) => {
        return {
          label: item.name,
          value: eligibilityDate(item?.next_eligibility_date),
          approved: eligibilityCheck(item?.next_eligibility_date),
          show_check: true,
        };
      })
    : [];
  return (
    <>
      <table className="viewTables">
        <thead>
          <tr>
            <th colSpan="2">
              <div className="d-flex align-items-center justify-between w-100">
                <span>Contact Details</span>
                <Link
                  // style={{ pointerEvents: !donorId ? 'none' : 'auto' }}
                  to={`/crm/contacts/donor/${donorId}/view`}
                  className="btn btn-link btn-md bg-transparent"
                  onClick={() => {
                    setCallControlPopup(true);
                  }}
                >
                  Donor Profile
                </Link>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <td className="col2 no-data text-center">Data Loading</td>
          ) : (
            <>
              {jobDetails?.map((item, index) => (
                <tr key={index}>
                  <td className="tableTD col1">{item.label}</td>
                  <td className="tableTD col2"> {item.value || 'N/A'} </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      <table className="viewTables">
        <thead>
          <tr>
            <th colSpan="2">Last Donation</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <td className="col2 no-data text-center">Data Loading</td>
          ) : (
            <>
              {donationDetails?.map((item, index) => (
                <tr key={index}>
                  <td className="tableTD col1">{item.label}</td>
                  <td className="tableTD col2">{item.value || 'N/A'} </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
      <table className="viewTables">
        <thead>
          <tr>
            <th colSpan="2">Eligibility</th>
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <td className="col2 no-data text-center">Data Loading</td>
          ) : (
            <>
              <tr>
                <td className="tableTD col1">Next Call Date</td>
                <td className="tableTD col2">
                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span> {callJobDataDetail?.next_call_date || 'N/A'}</span>
                    <span className="icon pe-auto" role="button">
                      <SvgComponent name="DateRange" color="#005375" />
                    </span>
                  </div>
                </td>
              </tr>
              {eligibilities?.map((item, index) => (
                <tr key={index}>
                  <td className="tableTD col1">{item.label}</td>
                  <td className="tableTD col2">
                    {' '}
                    <span>
                      {item.show_check ? (
                        item.approved ? (
                          <FontAwesomeIcon
                            width={15}
                            height={15}
                            className="faIconStyle"
                            icon={faCheck}
                            color="#5CA044"
                          />
                        ) : (
                          <FontAwesomeIcon
                            width={15}
                            height={15}
                            icon={faClose}
                            className="faIconStyle"
                            color="#FF1E1E"
                          />
                        )
                      ) : null}
                    </span>{' '}
                    {item.value || 'N/A'}{' '}
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </>
  );
};
export const SegmentsTable = ({
  isLoading,
  includeSegmentsData,
  excludeSegmentsData,
  setOpenSegmentModal,
  setModalPopUp,
  setArchiveObject,
}) => {
  return (
    <table className="viewTables w-100">
      <thead>
        <tr>
          <th colSpan="2">
            <div className="d-flex align-items-center justify-between w-100">
              <span>Segments</span>
              <button
                onClick={() => setOpenSegmentModal(true)}
                className="btn btn-link btn-md bg-transparent"
              >
                Edit Segments
              </button>
              {/* )} */}
            </div>
          </th>
        </tr>
      </thead>
      {isLoading ? (
        <tbody>
          <td className="col2 no-data text-center">Data Loading</td>
        </tbody>
      ) : (
        <tbody>
          {includeSegmentsData.length > 0 || excludeSegmentsData.length > 0 ? (
            <>
              {' '}
              {includeSegmentsData.length > 0 && (
                <tr style={{ backgroundColor: '#E4E4E4' }}>
                  <td
                    className="tableTD col1 rowtable"
                    style={{ backgroundColor: 'unset' }}
                  >
                    Include
                  </td>
                  <td
                    className="tableTD col1 rowtable"
                    style={{ backgroundColor: 'unset' }}
                  ></td>
                </tr>
              )}
              {includeSegmentsData?.map((item, index) => (
                <tr key={`${index}-include`}>
                  <td className="tableTD col1">{item?.name}</td>
                  <td className="tableTD col2">
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{item?.total_members || 0}</span>
                      <span className="icon pe-auto" role="button">
                        <FontAwesomeIcon
                          size="lg"
                          icon={faClose}
                          color="#a3a3a3"
                          onClick={() => {
                            setModalPopUp(true);
                            setArchiveObject({
                              name: 'segment',
                              id: item?.callJobSegmentId,
                            });
                          }}
                        />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {excludeSegmentsData.length > 0 && (
                <tr style={{ backgroundColor: '#E4E4E4' }}>
                  <td
                    className="tableTD col1"
                    style={{ backgroundColor: 'unset' }}
                  >
                    Exclude
                  </td>
                  <td
                    className="tableTD col1 rowtable"
                    style={{ backgroundColor: 'unset' }}
                  ></td>
                </tr>
              )}
              {excludeSegmentsData?.map((item) => (
                <tr key={`exclude-${item}`}>
                  <td className="tableTD col1">{item?.name}</td>
                  <td className="tableTD col2">
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{item?.total_members || 0}</span>
                      <span role="button">
                        <FontAwesomeIcon
                          size="lg"
                          icon={faClose}
                          color="#a3a3a3"
                          onClick={() => {
                            setModalPopUp(true);
                            setArchiveObject({
                              name: 'segment',
                              id: item?.callJobSegmentId,
                            });
                          }}
                        />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <td className="col2 no-data text-center">Segments not Found.</td>
          )}
        </tbody>
      )}
    </table>
  );
};

export const InsightsTable = ({
  isLoading,
  callJobDataDetail,
  statusClassMapping,
  colorLables,
}) => {
  return (
    <table className="viewTables w-100">
      <thead>
        <tr>
          <th colSpan="2">Insights</th>
        </tr>
      </thead>
      {isLoading ? (
        <tbody>
          <td className="col2 no-data text-center">Data Loading</td>
        </tbody>
      ) : (
        <tbody>
          <tr>
            <td className="tableTD col1">Status</td>
            <td className="tableTD col2">
              {callJobDataDetail?.status && (
                <span
                  className={`badge ${
                    statusClassMapping[callJobDataDetail?.status]
                  }`}
                >
                  {colorLables[callJobDataDetail?.status]}
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Created</td>
            <td className="tableTD col2">
              {callJobDataDetail?.created_at &&
              callJobDataDetail?.created_by ? (
                <>
                  {formatUser(callJobDataDetail?.created_by)}
                  {formatDate(callJobDataDetail?.created_at)}
                </>
              ) : null}
            </td>
          </tr>
          <tr>
            <td className="tableTD col1">Modified</td>
            <td className="tableTD col2">
              {formatUser(
                callJobDataDetail?.modified_by ?? callJobDataDetail?.created_by
              )}
              {formatCustomDate(
                callJobDataDetail?.modified_at ?? callJobDataDetail?.created_at
              )}
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

export const DonationLocationsTable = ({ isLoading, donorLocations }) => {
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">Donation Locations</th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <td className="col2 no-data text-center">Data Loading</td>
        ) : donorLocations.length > 0 ? (
          donorLocations.map((item, index) => (
            <tr key={index}>
              <td className="tableTD col1" style={{ backgroundColor: 'white' }}>
                {' '}
                {item?.location_name}
              </td>
            </tr>
          ))
        ) : (
          <td className="col2 no-data text-center">
            Donation Locations not Found.
          </td>
        )}
      </tbody>
    </table>
  );
};
const staffName = (staffObj) => {
  const staff = staffObj?.staff
    ? `${staffObj?.staff?.first_name} ${staffObj?.staff?.last_name} (${staffObj?.total_calls})`
    : `${staffObj?.staff_name} (${staffObj?.total_calls})`;
  return staff;
};
export const AgentsAssignedTable = ({
  isLoading,
  agents,
  setIsAssignedModal,
  setModalPopUp,
  setArchiveObject,
}) => {
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">
            <div className="d-flex align-items-center justify-between w-100">
              <span>Agents Assigned</span>
              <button
                className="btn btn-link btn-md bg-transparent"
                onClick={() => setIsAssignedModal(true)}
              >
                Assign Agents
              </button>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <td className="col2 no-data text-center">Data Loading</td>
        ) : agents?.length > 0 ? (
          agents?.map((item, index) => (
            <tr key={index}>
              <td className="tableTD col1">Agent {index + 1}</td>
              <td className="tableTD col2">
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{staffName(item)}</span>
                  <span className="icon pe-auto" role="button">
                    <FontAwesomeIcon
                      size="lg"
                      icon={faClose}
                      color="#a3a3a3"
                      onClick={() => {
                        setModalPopUp(true);
                        setArchiveObject({
                          name: 'agent',
                          id: item?.id,
                        });
                      }}
                    />
                  </span>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <td className="col2 no-data text-center">Agents Data not Found.</td>
        )}
      </tbody>
    </table>
  );
};

export const AssetsTable = ({
  isLoading,
  callFlow,
  script,
  scriptSrc,
  audioBlob,
}) => {
  return (
    <table className="viewTables">
      <thead>
        <tr>
          <th colSpan="2">Assets</th>
        </tr>
      </thead>

      <tbody>
        {isLoading ? (
          <td className="col2 no-data text-center">Data Loading</td>
        ) : callFlow && script ? (
          <>
            <tr>
              <td className="tableTD col1">Call Flow</td>
              <td className="tableTD col2">{callFlow[0].call_flow?.name}</td>
            </tr>
            <tr>
              <td className="tableTD col1">Call Script</td>
              <td className="tableTD col2">
                <div
                  dangerouslySetInnerHTML={{
                    __html: script?.call_script?.script,
                  }}
                />
                {script?.call_script?.is_voice_recording && (
                  <div>
                    <CustomAudioPlayer src={scriptSrc} audioBlob={audioBlob} />
                  </div>
                )}
              </td>
            </tr>
          </>
        ) : (
          <tbody>
            <td className="col2 no-data text-center">Assets not Found.</td>
          </tbody>
        )}
      </tbody>
    </table>
  );
};
export const SegmentModal = ({
  openSegmentModal,
  setOpenSegmentModal,
  setSegmentsToAdd,
  segmentsToAdd,
  includeSegmentsData,
  excludeSegmentsData,
  setIsIncludeModal,
  setIsExcludeModal,
  isIncludeModal,
  isExcludeModal,
  includeSegmentContacts,
  excludeSegmentContacts,
  setIncludeSegmentContacts,
  setExludeSegmentContacts,
  setSummaryContacts,
  summaryContacts,
  saveSegments,
  segmentLoading,
}) => {
  return (
    <Modal
      dialogClassName={`w-60`}
      show={openSegmentModal}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop={true}
    >
      <Modal.Body className="p-3">
        <form className={`formGroup`}>
          <div className={`formGroup border-0 `}>
            <div>
              <h5>Segment Details</h5>
            </div>
            <div>
              <h6>
                Summary: <b>{summaryContacts} Contacts</b>
              </h6>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {' '}
              <FormInput
                fieldLabel="Include"
                displayName="Segments"
                autoComplete="off"
                icon={
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    onClick={() => setIsIncludeModal(true)}
                    icon={faAngleDown}
                    style={{ color: '#A3A3A3', cursor: 'pointer' }}
                  />
                }
                onClick={() => setIsIncludeModal(true)}
                onKeyPress={(e) => e.preventDefault()}
                value={[
                  ...includeSegmentsData,
                  ...segmentsToAdd.include_segments,
                ]
                  .map((value) => value.name)
                  .join(',')}
                required={false}
              />
              <div className="pt-5">
                <span>{includeSegmentContacts} Contacts</span>
              </div>
            </div>
            <AssignSegmentsPopUpModal
              title="Include Segments"
              modalPopUp={isIncludeModal}
              setData={(data) => {
                setSegmentsToAdd((pre) => ({
                  ...pre,
                  include_segments: data,
                }));
              }}
              setModalPopUp={setIsIncludeModal}
              setIncludeSegmentsCount={(val) => {
                setIncludeSegmentContacts((prev) => {
                  const totalValue = val + prev;
                  setSummaryContacts(totalValue - excludeSegmentContacts);
                  return totalValue;
                });
              }}
            />
            <div style={{ display: 'flex', gap: '20px' }}>
              <FormInput
                fieldLabel="Exclude"
                displayName="Segments"
                autoComplete="off"
                icon={
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    onClick={() => setIsExcludeModal(true)}
                    icon={faAngleDown}
                    style={{ color: '#A3A3A3', cursor: 'pointer' }}
                  />
                }
                onClick={() => setIsExcludeModal(true)}
                onKeyPress={(e) => e.preventDefault()}
                value={[
                  ...excludeSegmentsData,
                  ...segmentsToAdd.exclude_segments,
                ]
                  .map((value) => value.name)
                  .join(',')}
                required={false}
              />
              <span className="pt-5">{excludeSegmentContacts} Contacts</span>
            </div>
            <AssignSegmentsPopUpModal
              title="Exclude Segments"
              modalPopUp={isExcludeModal}
              setData={(data) => {
                setSegmentsToAdd((pre) => ({
                  ...pre,
                  exclude_segments: data,
                }));
              }}
              setModalPopUp={setIsExcludeModal}
              setExcludeSegmentsCount={(val) => {
                setExludeSegmentContacts((prev) => {
                  const totalValue = val + prev;
                  setSummaryContacts(includeSegmentContacts - totalValue);
                  return totalValue;
                });
              }}
            />
            <div className="d-flex justify-content-end align-items-center w-100">
              <button
                onClick={() => {
                  setOpenSegmentModal(false);
                  setSegmentsToAdd({
                    include_segments: [],
                    exclude_segments: [],
                  });
                }}
                className="btn btn-link"
                disabled={segmentLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-primary"
                disabled={segmentLoading}
                onClick={saveSegments}
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
