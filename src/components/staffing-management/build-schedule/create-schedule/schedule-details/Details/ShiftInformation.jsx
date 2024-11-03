/* eslint-disable */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './details.scss';
import SvgComponent from '../../../../../common/SvgComponent';
import RTDtable from './RTDtable';
import Notes from './notes/Notes';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import { getAppBaseUrl } from '../../../../../../helpers/GetAppBaseUrl';
import { STAFFING_MANAGEMENT_BUILD_SCHEDULE } from '../../../../../../routes/path';
import { formatTime } from '../../../../../../helpers/formatDate';
import { fetchData } from '../../../../../../helpers/Api';
import PolymorphicType from '../../../../../../enums/PolymorphicTypeEnum';
import { formatDateWithTZ } from '../../../../../../helpers/convertDateTimeToTimezone';

let inputTimer = null;

function ShiftInformationSection({
  shift_id,
  filterFormData,
  setFilterFormData,
  categories,
  staffAssignUnassignFlag,
}) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();

  const [shiftInfoTabs, setShiftInfoTabs] = useState('About');
  const [isLoading, setIsLoading] = useState(true);
  const [rolesTimes, setRolesTimes] = useState([]);
  const [roleSchedule, setRoleSchedule] = useState([]);
  const baseAppUrl = getAppBaseUrl();
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState([]);
  const [notesRows, setNotesRows] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(4);
  const [selectedOptions, setSelectedOptions] = useState();

  // These values are needed for URL navigation, for URL query params
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const schedule_id = searchParams.get('schedule_id');
  const schedule_status = searchParams.get('schedule_status');
  const isCreated = searchParams.get('isCreated');
  const collection_operation_id = searchParams.get('collection_operation_id');

  const queryParams = {
    operation_id: operation_id,
    operation_type: operation_type,
    schedule_id: schedule_id,
    shift_id: shift_id,
    schedule_status: schedule_status,
    isCreated: isCreated,
    collection_operation_id: collection_operation_id,
  };
  const appendToLink = new URLSearchParams(queryParams).toString();

  const onModifyRtdButton =
    STAFFING_MANAGEMENT_BUILD_SCHEDULE.MODIFY_RTD.concat('?').concat(
      appendToLink
    );

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchDataAboutTab();
      getDataRTDtab();
      fetchNotesData();
    }, 500);
  }, [shift_id]);

  useEffect(() => {
    getDataRTDtab();
  }, [staffAssignUnassignFlag]);

  useEffect(() => {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      setIsLoading(true);
      fetchNotesData();
    }, 500);
  }, [selectedOptions, currentPage, limit]);

  const fetchNotesData = async () => {
    try {
      const urlParams = new URLSearchParams();
      urlParams.append('page', currentPage);
      urlParams.append('limit', limit);
      urlParams.append('noteable_id', operation_id);
      urlParams.append('noteable_type', operation_type);
      urlParams.append('sortBy', 'created_at');
      urlParams.append('sortOrder', 'DESC');
      if (selectedOptions) {
        if (selectedOptions?.category_id)
          urlParams.append('category_id', selectedOptions.category_id);
        if (selectedOptions?.subcategory_id)
          urlParams.append('sub_category_id', selectedOptions.subcategory_id);
      }

      let url = `${BASE_URL}/notes?${urlParams.toString()}`;
      const result = await makeAuthorizedApiRequest('GET', url);
      if (result.ok || result.status === 200) {
        const { data, count } = await result.json();
        setTotalRecords(count);
        setNotesRows(data);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  const fetchDataAboutTab = async () => {
    try {
      if (operation_id && operation_type && shift_id) {
        const response = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/staffing-management/schedules/create/details/about?operation_id=${operation_id}&operation_type=${operation_type}&shift_id=${shift_id}`
        );
        const data = await response.json();
        setRows(data.data[0]);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error(
        `Failed to fetch data for buildSchedule-create-details-shiftInforamation-aboutTab ${error}`,
        { autoClose: 3000 }
      );
    }
  };

  const getDataRTDtab = async () => {
    try {
      setRolesTimes([]);
      setRoleSchedule([]);
      setIsLoading(true);
      if (schedule_id && operation_id && shift_id && operation_type) {
        const params = new URLSearchParams();
        params.append('schedule_id', schedule_id);
        params.append('operation_id', operation_id);
        params.append('shift_id', shift_id);
        params.append('operation_type', operation_type);

        const result = await fetchData(
          `/staffing-management/schedules/shifts/roles_times/all?${params.toString()}`
        );
        const data = result?.data;
        if (data) {
          setRolesTimes(data.rtd);
          // Calculate Role Schedule
          calculateRoleSchedule(
            data.rtd,
            new Date(data.start_time),
            new Date(data.end_time)
          );
        }
      }
    } catch (error) {
      toast.error(`Error fetching roles times: ${error}`, {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  function extractTimeFromString(dateString) {
    const parts = dateString.split(' ');
    const timePart = parts[1] + ' ' + parts[2];
    return timePart;
  }

  const calculateRoleSchedule = (data, shiftStartTime, shiftEndTime) => {
    if (data) {
      const result = data.map((roleTime) => {
        const result = {};
        result['role'] = roleTime.role;
        const startTime = new Date(
          shiftStartTime.getTime() -
            (roleTime.lead_time +
              roleTime.setup_time +
              roleTime.travel_to_time) *
              60000
        );
        result['start_time'] = formatTime(startTime, 'hh:mm AM/PM');
        const departTime = new Date(
          startTime.getTime() + roleTime.lead_time * 60000
        );
        result['depart_time'] = formatTime(departTime, 'hh:mm AM/PM');
        const arriveTime = new Date(
          departTime.getTime() + roleTime.travel_to_time * 60000
        );
        result['arrive_time'] = formatTime(arriveTime, 'hh:mm AM/PM');
        result['shift_start_time'] = formatTime(shiftStartTime, 'hh:mm AM/PM');
        result['shift_end_time'] = formatTime(shiftEndTime, 'hh:mm AM/PM');
        const returnTime = new Date(
          shiftEndTime.getTime() + roleTime.breakdown_time * 60000
        );
        result['return_time'] = formatTime(returnTime, 'hh:mm AM/PM');
        const arriveTime2 = new Date(
          returnTime.getTime() + roleTime.travel_from_time * 60000
        );
        result['arrive_time2'] = formatTime(arriveTime2, 'hh:mm AM/PM');
        const endTime = new Date(
          arriveTime2.getTime() + roleTime.wrapup_time * 60000
        );
        result['endTime'] = formatTime(endTime, 'hh:mm AM/PM');

        return result;
      });

      setRoleSchedule(result);
    }
  };

  return (
    <>
      <table
        className="viewTables w-100 mt-4 detailsMain shiftInformation"
        style={{ overflow: 'unset' }}
      >
        <thead>
          <tr>
            <th colSpan={shiftInfoTabs === 'RTD' ? '9' : '5'}>
              <div className="d-flex align-items-center justify-between w-100">
                <p className="table-header-title">Shift Information</p>
              </div>
            </th>
          </tr>
        </thead>
        <tbody
          className={`overflow-y-auto w-100`}
          style={{ position: 'relative' }}
        >
          <tr className="bg-white top-0 w-100">
            <td
              className="pb-0 nav-tabs-container"
              colSpan={shiftInfoTabs === 'RTD' ? '9' : '5'}
            >
              <div className="filterBar p-0">
                <div className="tabs border-0 mb-0 w-100 d-flex justify-between">
                  <ul>
                    <li>
                      <a
                        to={{
                          pathname: location.pathname,
                          search: location.search, // Preserve existing query parameters
                        }}
                        onClick={() => setShiftInfoTabs('About')}
                        className={`nav-tab-item
                            ${
                              shiftInfoTabs === 'About' ? 'active' : 'fw-medium'
                            }
                        `}
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        to={{
                          pathname: location.pathname,
                          search: location.search, // Preserve existing query parameters
                        }}
                        onClick={() => setShiftInfoTabs('RTD')}
                        className={`nav-tab-item
                            ${shiftInfoTabs === 'RTD' ? 'active' : 'fw-medium'}
                        `}
                      >
                        RTD
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={() => setShiftInfoTabs('Notes')}
                        className={`nav-tab-item
                            ${
                              shiftInfoTabs === 'Notes' ? 'active' : 'fw-medium'
                            }
                        `}
                      >
                        Notes
                      </a>
                    </li>
                  </ul>
                  {shiftInfoTabs === 'RTD' && (
                    <Link to={onModifyRtdButton} className="modify-rtd-btn">
                      Modify RTD
                    </Link>
                  )}
                </div>
              </div>
            </td>
          </tr>
          {shiftInfoTabs === 'About' && (
            <>
              <tr>
                <td
                  className="tableTD col1 tabel-cells-content"
                  style={{
                    width: '10%',
                    wordBreak: 'break-word',
                  }}
                >
                  Operation Details
                </td>
                {rows && (
                  <td className="tableTD col2 ">
                    {operation_type ===
                      PolymorphicType.OC_OPERATIONS_DRIVES && (
                      <Link
                        to={`/crm/accounts/${rows.account_id}/view/about`}
                        target="_blank"
                        className="mb-0 shift-info-table-cell-value text-blue"
                      >
                        {rows.account_name && (
                          <span>{rows.account_name} | </span>
                        )}
                      </Link>
                    )}
                    {operation_type ===
                      PolymorphicType.OC_OPERATIONS_SESSIONS && (
                      <Link
                        to={`/crm/donor_center/${rows.account_id}`}
                        target="_blank"
                        className="mb-0 shift-info-table-cell-value text-blue"
                      >
                        {rows.account_name && (
                          <span>{rows.account_name} | </span>
                        )}
                      </Link>
                    )}
                    {operation_type ===
                      PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS && (
                      <Link
                        to={`/crm/non-collection-profiles/${row.account_id}/about`}
                        target="_blank"
                        className="mb-0 shift-info-table-cell-value text-blue"
                      >
                        {rows.account_name && (
                          <span>{rows.account_name} | </span>
                        )}
                      </Link>
                    )}
                    <Link
                      to={`${baseAppUrl}/crm/locations/${rows.location_id}/view`}
                      target="_blank"
                      className="mb-0 shift-info-table-cell-value text-blue"
                    >
                      {rows.location_name && (
                        <span>
                          {rows.location_name} | {rows.location_address}
                        </span>
                      )}
                    </Link>
                  </td>
                )}
              </tr>
              <tr>
                <td className="tableTD col1 tabel-cells-content">
                  Shift Details
                </td>
                {rows && (
                  <td className="tableTD col2">
                    <p className="mb-0  shift-info-table-cell-value text-black">
                      <span>
                        {rows.shift_start_time && (
                          <span>
                            {extractTimeFromString(
                              formatDateWithTZ(rows.shift_start_time)
                            )}{' '}
                            -{' '}
                          </span>
                        )}{' '}
                        {extractTimeFromString(
                          formatDateWithTZ(
                            rows.shift_end_time,
                            'yyyy-MM-dd hh:mm a'
                          )
                        )}
                        {rows.sum_of_procedure_shifts && (
                          <span>
                            {' '}
                            | {rows.sum_of_procedure_shifts} Procedures |{' '}
                          </span>
                        )}
                        {rows.oef && <span> {rows.oef} OEF</span>}
                      </span>
                    </p>
                  </td>
                )}
              </tr>
              <tr>
                <td className="tableTD col1 tabel-cells-content">Insights</td>

                {rows && (
                  <td className="tableTD col2">
                    <div className="d-flex gap-2 align-items-center">
                      {rows.prospective_drive_name && (
                        <div>
                          <Link
                            to={`${baseAppUrl}/crm/accounts/${rows.prospective_drive_id}/view/about`}
                            target="_blank"
                          >
                            <SvgComponent name="LinkIcon" />{' '}
                          </Link>
                          <span>{rows.prospective_drive_name} | </span>{' '}
                        </div>
                      )}
                      <span className="mb-0 shift-info-table-cell-value text-black">
                        {rows.user_name && <span>{rows.user_name} | </span>}
                        {rows.collection_operation_status && (
                          <span>{rows.collection_operation_status}</span>
                        )}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            </>
          )}
          {shiftInfoTabs === 'RTD' && (
            <RTDtable
              rolesTimes={rolesTimes}
              roleSchedule={roleSchedule}
              isLoading={isLoading}
            />
          )}
          {shiftInfoTabs === 'Notes' && (
            <Notes
              filterFormData={filterFormData}
              setFilterFormData={setFilterFormData}
              categories={categories}
              fetchNotesData={fetchNotesData}
              totalRecords={totalRecords}
              rows={notesRows}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </tbody>
      </table>
    </>
  );
}

export default ShiftInformationSection;
