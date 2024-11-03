import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import { CALL_CENTER, CALL_CENTER_MANAGE_SCRIPTS } from '../../../routes/path';
import { API } from '../../../api/api-routes';
import styles from './index.module.scss';
import { formatUser } from '../../../helpers/formatUser';
import SvgComponent from '../../common/SvgComponent';
import TopBar from '../../common/topbar/index';
import { formatDate } from '../../../helpers/formatDate';
import CustomAudioPlayer from '../../common/CustomAudioPlayer';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

const ScriptsView = () => {
  const { id } = useParams();
  const [scriptData, setScriptData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await API.callCenter.manageScripts.getScript(id);
        let {
          data: { call_script, file_attachment },
          status,
          status_code,
        } = result.data;
        if ((status === 'success') & (status_code === 200)) {
          const response = await fetch(file_attachment?.attachment_path);
          const blob = await response.blob();
          setScriptData({
            script_name: call_script?.name,
            script: call_script?.script,
            script_type:
              call_script?.script_type ===
              PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                ? 'Other'
                : call_script?.script_type,
            is_voice_recording: call_script?.is_voice_recording,
            is_active: call_script?.is_active,
            created_at: call_script?.created_at,
            created_by: call_script?.created_by,
            modified_at: call_script?.modified_at,
            modified_by: call_script?.modified_by,
            file_attachment: file_attachment,
            audio_blob: blob,
          });
        } else {
          toast.error('Error Fetching Script Details', {
            autoClose: 3000,
          });
        }
      } catch (error) {
        toast.error('Error getting Script Details', {
          autoClose: 3000,
        });
        toast.error(error?.response, { autoClose: 3000 });
      }
    };

    if (id) {
      getData();
    }
  }, [id]);

  const BreadcrumbsData = [
    {
      label: 'Call Center',
      class: 'disable-label',
      link: CALL_CENTER.DASHBOARD,
    },
    {
      label: 'Manage Scripts',
      class: 'disable-label',
      link: CALL_CENTER_MANAGE_SCRIPTS.LIST,
    },
    {
      label: 'View Script',
      class: 'disable-label',
      link: CALL_CENTER_MANAGE_SCRIPTS.VIEW.replace(':script_id', id).replace(
        ':script_id',
        id
      ),
    },
  ];

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Manage Scripts'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner viewForm">
        <div className={`editAnchor ${styles.editAnchor}`}>
          <Link to={`/call-center/scripts/${id}/edit/`}>
            <SvgComponent name="EditIcon" />
            <span>Edit</span>
          </Link>
        </div>
        {scriptData && (
          <div className="tableView">
            <div className={`${styles.tableViewInner} w-100`}>
              <div className="row">
                <div className="col-md-6">
                  <table className="viewTables m-0">
                    <thead>
                      <tr>
                        <th colSpan="2">Script Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col1">Script Name</td>
                        <td className="col2">{scriptData?.script_name}</td>
                      </tr>
                      <tr>
                        <td className="col1">Script Type</td>
                        <td className="col2">{scriptData?.script_type}</td>
                      </tr>
                    </tbody>
                  </table>

                  <table className="viewTables">
                    <thead>
                      <tr>
                        <th colSpan="2">Insights</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col1">Status</td>
                        <td className="col2">
                          {scriptData?.is_active ? (
                            <span className={`badge active`}>Active</span>
                          ) : (
                            <span className={`badge inactive`}>Inactive</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="col1">Created</td>
                        <td className="col2">
                          {' '}
                          {scriptData &&
                          scriptData?.created_by &&
                          scriptData?.created_at ? (
                            <>
                              {formatUser(scriptData?.created_by)}
                              {formatDate(scriptData?.created_at)}
                            </>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="col1">Modified</td>
                        <td className="col2">
                          {' '}
                          {scriptData &&
                          scriptData?.modified_at &&
                          scriptData?.modified_by ? (
                            <>
                              {formatUser(scriptData?.modified_by)}
                              {formatDate(scriptData?.modified_at)}
                            </>
                          ) : (
                            <>
                              {formatUser(scriptData?.created_by)}
                              {formatDate(scriptData?.created_at)}
                            </>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={`col-md-6 ${styles.marginTop}`}>
                  <div className={`${styles.group}`}>
                    <div className={`${styles.group_head}`}>
                      <h2>Script</h2>
                    </div>
                    <div
                      style={{ backgroundColor: 'white' }}
                      className={`${styles.group_body} ${styles.message_border}`}
                    >
                      <div
                        className={`${styles.right_data} ck-content`}
                        style={{
                          marginTop: '20px',
                        }}
                        dangerouslySetInnerHTML={{ __html: scriptData?.script }}
                      ></div>
                      {scriptData.is_voice_recording &&
                        scriptData?.file_attachment?.attachment_path && (
                          <div
                            style={{
                              marginLeft: '20px',
                              marginBottom: '20px',
                            }}
                            className={styles.audioContainer}
                          >
                            <CustomAudioPlayer
                              src={scriptData?.file_attachment?.attachment_path}
                              audioBlob={scriptData?.audio_blob}
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptsView;
