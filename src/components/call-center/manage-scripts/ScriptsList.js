import React, { useState, useEffect } from 'react';
import { CALL_CENTER, CALL_CENTER_MANAGE_SCRIPTS } from '../../../routes/path';
import TopBar from '../../common/topbar/index';
import CheckPermission from '../../../helpers/CheckPermissions';
import CrmPermissions from '../../../enums/CrmPermissionsEnum';
import { useNavigate } from 'react-router-dom';
import SelectDropdown from '../../common/selectDropdown';
import { API } from '../../../api/api-routes';
import TableList from '../../common/tableListing';
import { toast } from 'react-toastify';
import GlobalMultiSelect from '../../common/GlobalMultiSelect';
import Pagination from '../../common/pagination';
import CallCenterPermissions from '../../../enums/CallCenterPermissionsEnum';
import PolymorphicType from '../../../enums/PolymorphicTypeEnum';

const ScriptsList = () => {
  const navigate = useNavigate();
  const [callScripts, setCallScripts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [limit, setLimit] = useState(process.env.REACT_APP_PAGE_LIMIT ?? 10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isActive, setIsActive] = useState({ label: 'Active', value: 'true' });
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState('ASC');
  const [sortName, setSortName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [scriptTypes, setScriptTypes] = useState([]);

  const [hasVM, setHasVM] = useState(null);

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
  ];

  const formatJustDate = (modified_date) => {
    const date = new Date(modified_date);
    const formattedDate =
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      date.getDate().toString().padStart(2, '0') +
      '-' +
      date.getFullYear();
    return formattedDate;
  };

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        let query = `limit=${limit}&page=${currentPage}&name=${searchText}&is_active=${
          isActive?.value ?? ''
        }&hasVM=${hasVM?.value ?? ''}&script_type=${
          scriptTypes.map((item) => item.id) ?? null
        }`;
        if (sortOrder.length > 0) {
          query += `&sortOrder=${sortOrder}`;
        }

        if (sortName.length > 0) {
          query += `&sortName=${sortName}`;
        }

        const result = await API.callCenter.manageScripts.getCallScripts(query);
        const { data } = result;
        const modifiedCallScripts = await Promise.all(
          data?.data?.map(async (item) => {
            const response = await fetch(
              item?.file_attachment?.attachment_path
            );
            const blob = await response.blob();
            item.script_type =
              item.script_type ===
              PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                ? 'Other'
                : item.script_type.charAt(0).toUpperCase() +
                  item.script_type.slice(1).toLowerCase();
            if (item.last_update === null) {
              return {
                ...item,
                audio_blob: blob,
                last_update: formatJustDate(item.created_at),
                script_type: item.script_type,
              };
            }
            return {
              ...item,
              audio_blob: blob,
              last_update: formatJustDate(item.last_update),
              script_type:
                item.script_type ===
                PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                  ? 'Other'
                  : item.script_type,
            };
          })
        );

        setCallScripts(modifiedCallScripts);
        setTotalRecords(data?.data?.count);
      } catch (error) {
        toast.error(error?.response, { autoClose: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    const handleSearchChange = async (e) => {
      setIsLoading(true);
      try {
        let query = `limit=${limit}&page=${currentPage}&name=${searchText}&is_active=${
          isActive?.value ?? ''
        }&hasVM=${hasVM?.value ?? ''}&script_type=${
          scriptTypes.map((item) => item.id) ?? null
        }`;
        if (sortOrder.length > 0) {
          query += `&sortOrder=${sortOrder}`;
        }

        if (sortName.length > 0) {
          query += `&sortName=${sortName}`;
        }

        const result = await API.callCenter.manageScripts.getCallScripts(query);
        const { data } = result;
        const modifiedCallScripts = data?.data?.map((item) => {
          item.script_type =
            item.script_type.charAt(0).toUpperCase() +
            item.script_type.slice(1).toLowerCase();
          if (item.last_update === null) {
            return {
              ...item,
              last_update: formatJustDate(item.created_at),
              script_type:
                item.script_type ===
                PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                  ? 'Other'
                  : item.script_type,
            };
          }
          return {
            ...item,
            last_update: formatJustDate(item.last_update),
            script_type:
              item.script_type ===
              PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                ? 'Other'
                : item.script_type,
          };
        });
        setCallScripts(modifiedCallScripts);
        setTotalRecords(data?.data?.count);
      } catch (error) {
        toast.error(error?.response, { autoClose: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchText) {
      getData();
    } else {
      if (searchText.length > 1) {
        handleSearchChange(searchText);
      }
    }

    if (searchText.length === 1) {
      setCurrentPage(1);
    }
  }, [
    currentPage,
    API,
    limit,
    searchText,
    isActive,
    sortOrder,
    sortName,
    hasVM,
    scriptTypes,
  ]);

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSort = (columnName) => {
    setCurrentPage(1);
    setSortName(columnName);
    setSortOrder((prevSortOrder) => (prevSortOrder === 'ASC' ? 'DESC' : 'ASC'));
  };

  const tableHeaders = [
    {
      name: 'name',
      label: 'Name',
      width: '20%',
      sortable: true,
      id: 'listmanagescripts_CC-004_sortScriptName',
    },
    {
      name: 'is_voice_recording',
      label: 'Voice Message',
      width: '30%',
      sortable: false,
      type: 'voice_recording',
    },
    {
      name: 'script_type',
      label: 'Type',
      width: '20%',
      sortable: true,
      id: 'listmanagescripts_CC-005_sortScriptType',
    },
    {
      name: 'last_update',
      label: 'Last Update',
      width: '20%',
      sortable: true,
      id: 'listmanagescripts_CC-006_sortScriptLastUpdate',
    },
    {
      name: 'is_active',
      label: 'Status',
      width: '20%',
      sortable: true,
      id: 'listmanagescripts_CC-007_sortScriptStatus',
    },
  ];

  const optionsConfig = [
    CheckPermission([CallCenterPermissions.CALLCENTER.MANAGE_SCRIPTS.READ]) && {
      label: 'View',
      path: (rowData) => `/call-center/scripts/${rowData.id}/view`,
      action: (rowData) => {},
      id: 'listmanagescripts_CC-010_viewScript',
    },
    CheckPermission([
      CallCenterPermissions.CALLCENTER.MANAGE_SCRIPTS.WRITE,
    ]) && {
      label: 'Edit',
      path: (rowData) => `/call-center/scripts/${rowData.id}/edit`,
      action: (rowData) => {},
      id: 'listmanagescripts_CC-011_editScript',
    },
  ].filter(Boolean);

  const handleScriptType = (scriptType) => {
    setScriptTypes((prevSelected) =>
      prevSelected.some((item) => item.id === scriptType.id)
        ? prevSelected.filter((item) => item.id !== scriptType.id)
        : [...prevSelected, scriptType]
    );
  };
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Manage Scripts'}
        SearchPlaceholder={'Search'}
        SearchValue={searchText}
        SearchOnChange={searchFieldChange}
        searchID="listmanagescripts_CC-008_searchScriptName"
      />

      <div className="filterBar">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className={`filter`}>
            <form className="d-flex gap-3 w-100">
              <GlobalMultiSelect
                label="Type"
                data={[
                  {
                    name: 'Drives',
                    id: PolymorphicType.OC_OPERATIONS_DRIVES,
                  },
                  {
                    name: 'Sessions',
                    id: PolymorphicType.OC_OPERATIONS_SESSIONS,
                  },
                  {
                    name: 'Other',
                    id: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
                  },
                ]}
                selectedOptions={scriptTypes}
                onChange={handleScriptType}
                onSelectAll={(data) => setScriptTypes(data)}
                id={'listmanagescripts_CC-001_changeScriptType'}
              />
              <SelectDropdown
                placeholder={'Has VM'}
                defaultValue={hasVM}
                selectedValue={hasVM}
                removeDivider
                showLabel
                onChange={(val) => {
                  setHasVM(val);
                }}
                options={[
                  { label: 'True', value: true },
                  { label: 'False', value: false },
                ]}
                id={'listmanagescripts_CC-002_changeHasVM'}
              />
              <SelectDropdown
                placeholder={'Status'}
                defaultValue={isActive}
                selectedValue={isActive}
                removeDivider
                showLabel
                onChange={(val) => {
                  setIsActive(val);
                }}
                options={[
                  { label: 'Active', value: 'true' },
                  { label: 'Inactive', value: 'false' },
                ]}
                id={'listmanagescripts_CC-003_changeScriptStatus'}
              />
            </form>
          </div>
        </div>
      </div>

      <div className="mainContentInner">
        <div className="buttons d-flex align-items-center gap-3 ">
          {CheckPermission([CrmPermissions.CRM.ACCOUNTS.WRITE]) && (
            <button
              id="listmanagescripts_CC-009_createScript"
              className="btn btn-primary"
              onClick={() => navigate('create')}
            >
              Create New Script
            </button>
          )}
        </div>

        <TableList
          isLoading={isLoading}
          data={callScripts}
          headers={tableHeaders}
          handleSort={handleSort}
          sortName={sortName}
          sortOrder={sortOrder}
          listSectionName="Manage Scripts Data"
          optionsConfig={optionsConfig}
        />

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalRecords={totalRecords}
        />
      </div>
    </div>
  );
};

export default ScriptsList;
