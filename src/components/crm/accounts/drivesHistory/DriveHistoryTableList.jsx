import React, { useEffect, useState } from 'react';
import SvgComponent from '../../../common/SvgComponent';
import { formatDate } from '../../../../helpers/formatDate';
import ScheduleShiftIcon from '../../../../assets/images/sessions/schedule-shift.svg';
import ScheduleShiftModalIcon from '../../../../assets/images/sessions/schedule-shift-modal.svg';
import ToolTip from '../../../common/tooltip';
import ConfirmModal from '../../../common/confirmModal';
import { OperationStatus } from '../../donors_centers/sessionHistory/SessionHistoryUtils';
import styles from './index.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { OPERATIONS_CENTER_DRIVES_PATH } from '../../../../routes/path';
import { API } from '../../../../api/api-routes';
import jwt from 'jwt-decode';
import { toast } from 'react-toastify';
import SuccessPopUpModal from '../../../common/successModal';

export default function DriveHistoryTableList({
  isLoading,
  data,
  headers,
  onRowClick,
  handleSort,
}) {
  const navigate = useNavigate();
  const handleRowClick = (index, headerName, rowData) => {
    if (onRowClick && headerName !== 'tooltip') {
      onRowClick(rowData, index);
    }
  };
  const [isConfirmationVisible, setConfirmationVisibility] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [driveDate, setDriveDate] = useState(null);
  const [warningModalPopUp, setWarningModalPopUp] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [userData, setUserData] = useState({});
  const jwtToken = localStorage.getItem('token');

  const getUSerData = async () => {
    const decodeToken = jwt(jwtToken);
    const id = decodeToken?.id;
    if (id) {
      const result = await API.operationCenter.drives.getUserData(id);
      if (result?.status === 404) {
        return toast.error('User with this id does not exist', {
          autoClose: 3000,
        });
      }
      if (result?.status === 200) {
        let { data } = result;
        setUserData({
          id: data?.data?.id,
          is_recruiter: data?.data?.role?.is_recruiter,
        });
      } else {
        toast.error('Error Fetching User Details', { autoClose: 3000 });
      }
    } else {
      toast.error('Error getting user Details', { autoClose: 3000 });
    }
  };
  useEffect(() => {
    getUSerData();
  }, []);

  const handleTooltipClick = (rowData) => {
    if (rowData?.account_status === false) {
      setWarningModalPopUp(true);
      setWarningMessage(`This is not an active account`);
    } else if (userData?.is_recruiter === true) {
      if (rowData?.recruiter_id == userData?.id) {
        setAccountId(rowData?.account_id);
        setDriveDate(rowData?.date);
        setConfirmationVisibility(true);
      } else {
        setWarningModalPopUp(true);
        setWarningMessage(
          'You are not a recruiter for this drive. Unfortunately, You cannot copy it.'
        );
      }
    } else {
      setAccountId(rowData?.account_id);
      setDriveDate(rowData?.date);
      setConfirmationVisibility(true);
    }
  };

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {headers?.map((header, index) => (
                <th
                  key={`${header?.name}-${header?.label}-${index}`}
                  align="center"
                >
                  <div className="inliner">
                    <div className="title">
                      {header?.splitlabel ? (
                        header?.label.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <br />} {word}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="title">{header.label}</span>
                      )}
                    </div>
                    {header?.sortable && (
                      <div
                        className="sort-icon"
                        onClick={() => handleSort(header.name)}
                      >
                        {header.name !== 'tooltip' && (
                          <SvgComponent name={'SortIcon'} />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="no-data" colSpan={headers?.length + 1}>
                  Data Loading
                </td>
              </tr>
            ) : data?.length ? (
              data.map((rowData, indexX) => {
                return (
                  <tr key={rowData.id}>
                    {headers.map((header, indexY) => (
                      <td
                        key={`${rowData.id}-${header.name}-${header.label}-${indexY}`}
                      >
                        {header.name === 'status' ? (
                          <span
                            className={`badge ${
                              OperationStatus[rowData?.status?.toLowerCase()]
                            }`}
                          >
                            {rowData?.status}
                          </span>
                        ) : header.name === 'date' ? (
                          <Link
                            to={`/operations-center/operations/drives/${rowData?.driveid}/view/about`}
                            style={{ color: '#005375' }}
                            target="_blank"
                          >
                            {formatDate(rowData[header.name], 'MM-DD-YYYY')}
                          </Link>
                        ) : header.name === 'noofshifts' ? (
                          <div
                            className="d-flex gap-5"
                            onClick={() => {
                              handleRowClick(indexX, header.name, rowData);
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: '#72A3D0',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: 'white',
                                width: 'fit-content',
                                cursor: 'pointer',
                              }}
                            >
                              {rowData[header.name]}
                            </div>
                          </div>
                        ) : header.name === 'tooltip' ? (
                          <ToolTip
                            icon={
                              <img
                                src={ScheduleShiftIcon}
                                alt="Schedule Shift"
                              />
                            }
                            text={'Copy Drive'}
                            css={{
                              root: {
                                width: '30px',
                              },
                            }}
                            onTooltipClick={() => {
                              handleTooltipClick(rowData);
                            }}
                          />
                        ) : (
                          rowData[header.name]
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="no-data" colSpan={headers?.length + 1}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <SuccessPopUpModal
        title={'Warning'}
        message={warningMessage}
        modalPopUp={warningModalPopUp}
        setModalPopUp={setWarningModalPopUp}
        showActionBtns={true}
        onConfirm={() => {
          setWarningModalPopUp(false);
          setWarningMessage('');
        }}
        driveWarningIconStyle={true}
        customSVGIcon={<SvgComponent name={'warningCross'} />}
      />
      <ConfirmModal
        classes={{
          inner: styles.scheduleShiftPopup,
          btnGroup: 'gap-4',
          btn: 'w-50',
        }}
        showConfirmation={isConfirmationVisible}
        onCancel={() => setConfirmationVisibility(false)}
        onConfirm={() => {
          navigate(
            `${OPERATIONS_CENTER_DRIVES_PATH.CREATE}?accountId=${accountId}&date=${driveDate}`
          );
          setConfirmationVisibility(false);
        }}
        icon={ScheduleShiftModalIcon}
        heading={'Confirmation'}
        description={
          <>
            <p>
              This will copy all drive parameters to a newly scheduled drive.
              You will be redirected to the create drive process.
            </p>
            <p className="mt-2">Are you sure you want to continue?`</p>
          </>
        }
      />
    </div>
  );
}
