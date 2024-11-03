import React, { useEffect, useState } from 'react';
import './summary.scss';
import '../../../../../../styles/Global/Global.scss';
import '../../../../../../styles/Global/Variable.scss';
import * as _ from 'lodash';
import AccordionItem from './AccordionItem';
import { useLocation } from 'react-router-dom';
import {
  fetchData,
  makeAuthorizedApiRequest,
} from '../../../../../../helpers/Api';
import { formatDate, formatTime } from '../../../../../../helpers/formatDate';
import SvgComponent from '../../../../../common/SvgComponent';
import ConfirmModal from '../../../../../common/confirmModal';
import ConfirmationIcon from '../../../../../../assets/images/confirmation-image.png';
import { toast } from 'react-toastify';

function ChangeSummary({ updateSync }) {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const operation_type = searchParams.get('operation_type');
  const operation_id = searchParams.get('operation_id');
  const [inSync, setInSync] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [extraDescription, setExtraDescription] = useState([]);
  const [changes, setChanges] = useState([]);
  const [tableHeaders] = useState([
    {
      name: 'change_what',
      label: 'Change What',
      minWidth: '7rem',
      width: '7rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'original',
      label: 'Original',
      minWidth: '10rem',
      width: '10rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'requested',
      label: 'Requested',
      minWidth: '10rem',
      width: '10rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'change_log',
      label: 'Change Log',
      minWidth: '17rem',
      width: '17rem',
      sortable: false,
      checked: true,
    },
    {
      name: 'action',
      label: 'Action',
      minWidth: '100px',
      width: '100px',
      sortable: false,
      checked: true,
    },
  ]);

  useEffect(() => {
    populateData();
  }, []);

  useEffect(() => {
    populateData();
  }, [operation_id]);

  const populateData = async () => {
    const result = await fetchData(
      `/staffing-management/schedules/operations/${operation_id}/${operation_type}/change_summary`
    );
    setInSync(result.inSync);
    updateSync(result.inSync);
    const transformedData = transformData(result);
    setChanges(transformedData);
    setExtraDescription(generateDescriptions(transformedData));
  };

  const handleSort = (name) => {};

  const handleSync = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'PUT',
        `${BASE_URL}/staffing-management/schedules/operations/${operation_id}/${operation_type}/sync`
      );
      await response.json();
      setInSync(true);
      updateSync(true);
      setShowSyncModal(false);
    } catch (error) {
      toast.error(`Failed to synchronize - ${error}`, { autoClose: 3000 });
    }
  };

  function generateDescriptions(data) {
    const descriptions = data.flatMap((item) => {
      return item.changes.map((change) => {
        if (change.change_what === 'Date') {
          return `The ${operation_type} will be changed to "Pending Assignment"`;
        } else if (change.change_what === 'Start Time') {
          return `All Staff starting time will change to ${change.change_to}. Any manually adjusted role time details will be overwritten with this change.`;
        } else if (change.change_what === 'End Time') {
          return `All Staff ending time will change to ${change.change_to}. Any manually adjusted role time details will be overwritten with this change.`;
        } else if (change.change_what === 'Location Type') {
          return `All vehicles will be unassigned and user can replace the vehicles from the main details screen.`;
        }
      });
    });

    return descriptions;
  }

  function transformData(data) {
    return data.changes
      .filter((item) => item.rows.length > 0)
      .map((item) => {
        return {
          change_in: item.header,
          changes: item.rows
            .filter((row) => row.what !== 'Net Staff Setup')
            .map((row) => {
              let changeTo = row.requested;
              let changeFrom = row.original;
              if (row.what === 'Date') {
                changeTo = formatDate(
                  new Date(row.requested),
                  'Day, MM-DD-YYYY'
                );
                changeFrom = formatDate(
                  new Date(row.original),
                  'Day, MM-DD-YYYY'
                );
              } else if (row.what === 'Start Time' || row.what === 'End Time') {
                changeTo = formatTime(new Date(row.requested), 'hh:mm AM/PM');
                changeFrom = formatTime(new Date(row.original), 'hh:mm AM/PM');
              }
              let changeAt = new Date(row.changeAt);
              return {
                change_what: row.what,
                change_from: changeFrom,
                change_to: changeTo,
                changed_when: `${formatDate(changeAt)} | ${row.changeBy}`,
              };
            }),
        };
      });
  }

  return (
    <div className="table-listing-main">
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              {_.compact(tableHeaders)
                .filter((item) => item.checked)
                .map((header) => (
                  <th
                    key={header.name}
                    width={header.width}
                    style={{ minWidth: `${header.minWidth}` }}
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
                      {header.sortable && (
                        <div
                          className="sort-icon"
                          onClick={() => {
                            handleSort(header.name);
                          }}
                        >
                          <SvgComponent name={'SortIcon'} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="4" className="bgFadeBlue headingText">
                Perform Action
              </td>
              <td className="bgFadeBlue">
                {inSync ? (
                  <div className="statusChip">
                    <div>Synced</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary py-3 rounded-3"
                    style={{ padding: '12px 23px', height: '40px' }}
                    onClick={() => setShowSyncModal(true)}
                  >
                    Synchronize All
                  </button>
                )}
              </td>
            </tr>
            {changes.map((item, index) => (
              <AccordionItem key={index} data={item} />
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        showConfirmation={showSyncModal}
        onCancel={() => setShowSyncModal(false)}
        onConfirm={() => handleSync()}
        icon={ConfirmationIcon}
        heading={'Continue?'}
        description={
          'By confirming this action, the following changes will be applied: '
        }
        extraDescription={extraDescription}
        confirmBtnText="Confirm"
      />
    </div>
  );
}

export default ChangeSummary;
