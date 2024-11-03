import React, { useEffect, useState } from 'react';
import Topbar from '../../../common/topbar/index';
import { USER_ROLES } from '../../../../routes/path';
import NavigationTabs from './navigationTabs';
import { UsersBreadCrumbsData } from '../../tenants-administration/user-administration/UsersBreadCrumbsData';
import { toast } from 'react-toastify';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { CSVLink } from 'react-csv';
import { Link } from 'react-router-dom';
import SvgComponent from '../../../common/SvgComponent';
import { formatUser } from '../../../../helpers/formatUser';
import { formatDateWithTZ } from '../../../../helpers/convertDateTimeToTimezone';
import GeneratePDF from './RolesPDF';
import { pdf } from '@react-pdf/renderer';
import style from './index.module.scss';

const ViewTenantUserRole = ({ roleId }) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [activeTab, setActiveTab] = useState(1);
  const [accordian, setAccordians] = useState({});

  const [tenantApplications, setTenantApplications] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfHeadings, setPdfHeadings] = useState([]);
  const [rolesData, setRolesData] = useState({
    name: '',
    description: '',
    is_recruiter: false,
    is_active: false,
  });

  const fetchTenantApplications = async () => {
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/application/tenant-permissions`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setActiveTab(data[0].name.replaceAll(' ', '_'));
      getUserRoleData(data);
      setAccordians({});
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
  };

  function addPermissionsAttribute(
    module,
    permissions,
    parentHasPermissions = false
  ) {
    if (module.permissions?.length > 0) {
      const hasPermissions = permissions?.some((permission) =>
        module.permissions?.some(
          (userPermission) => userPermission?.code == permission
        )
      );

      module.hasPermissions = hasPermissions || parentHasPermissions;
      module.childs = false;
    } else {
      module.hasPermissions = parentHasPermissions;
      module.childs = true;
    }

    if (module.child_modules?.length > 0) {
      module.child_modules.forEach((childModule) =>
        addPermissionsAttribute(childModule, permissions, module.hasPermissions)
      );

      // If any child module has 'hasPermissions' attribute set to true, update the parent
      const anyChildHasPermissions = module.child_modules.some(
        (child) => child.hasPermissions === true
      );
      module.hasPermissions = anyChildHasPermissions;
    }
  }

  const getUserRoleData = async (tenantApps) => {
    setIsLoading(true);
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/roles/tenant/${roleId}`
    );
    let { data } = await result.json();
    if (result.ok || result.status === 200) {
      setRolesData({
        ...rolesData,
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        is_recruiter: data.is_recruiter,
        is_auto_created: data.is_auto_created,
        created_at: data.created_at,
        created_by: data.created_by,
        modified_at: data?.modified_at,
        modified_by: data?.modified_by,
      });
      setPermissions(data.permission);

      let result = [];
      tenantApps.forEach((item) => {
        const { modules, ...others } = item;

        let resultModules = [];
        modules.forEach((topModule) => {
          addPermissionsAttribute(topModule, data.permission);
          resultModules.push(topModule);
        });
        let resultItem = {
          ...others,
          modules: resultModules,
        };
        result.push(resultItem);
      });

      setTenantApplications(result);
    } else {
      toast.error('Error Fetching Collection Operations', { autoClose: 3000 });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTenantApplications();
  }, []);

  const BreadcrumbsData = [
    ...UsersBreadCrumbsData,
    {
      label: 'About',
      class: 'disable-label',
      link: USER_ROLES.VIEW.replace(':id', roleId),
    },
  ];

  const headers = [
    { label: 'Application', key: 'application' },
    { label: 'Module & Sub module', key: 'module' },
    { label: 'Module & Sub module', key: 'sub_module' },
    { label: 'Module & Sub module', key: 'child_module' },
    { label: 'Read', key: 'read' },
    { label: 'Write', key: 'write' },
    { label: 'Archive', key: 'archive' },
  ];

  const [csvData, setCsvData] = useState([]);
  const [csvPDFData, setCsvPDFData] = useState([
    'Application,Module and Sub module,Module and Sub module,Module and Sub module,Read,Write,Archive',
  ]);

  const generatePDFHandler = async () => {
    try {
      // Generate PDF content
      const Component = await GeneratePDF(csvPDFData, pdfHeadings);
      const blob = await pdf(Component).toBlob();
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${rolesData?.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error opening PDF:', error);
      // Handle the error gracefully (e.g., display a message to the user)
    }
  };

  useEffect(() => {
    setCsvData([]);
    setCsvPDFData([]);
    tenantApplications?.map((item) => {
      setCsvData((prev) => [
        ...prev,
        {
          application: item.name,
          module: '',
          sub_module: '',
          child_module: '',
          read: '-',
          write: '-',
          archive: '-',
        },
      ]);
      if (pdfHeadings.indexOf(item.name) === -1)
        setPdfHeadings((prev) => [...prev, item.name]);

      setCsvPDFData((prev) => [...prev, `${item.name},-,-,-`]);
      item?.modules?.map((module) => {
        let permissionObj = {
          application: '',
          module: module.name,
          sub_module: '',
          child_module: '',
          read: '',
          write: '',
          archive: '',
        };
        module?.permissions?.forEach((obj) => {
          if (obj.name === 'Read') {
            permissions.includes(obj?.code)
              ? (permissionObj.read = 'Yes')
              : (permissionObj.read = 'No');
          } else if (obj.name === 'Write') {
            permissions.includes(obj?.code)
              ? (permissionObj.write = 'Yes')
              : (permissionObj.write = 'No');
          } else if (obj.name === 'Archive') {
            permissions.includes(obj?.code)
              ? (permissionObj.archive = 'Yes')
              : (permissionObj.archive = 'No');
          }
        });

        if (module?.child_modules && module?.child_modules.length > 0) {
          setCsvData((prev) => [
            ...prev,
            {
              application: '',
              module: module.name,
              sub_module: '',
              child_module: '',
              read: '-',
              write: '-',
              archive: '-',
            },
          ]);
          const { read, write, archive } = checkPermissions([module]);
          setCsvPDFData((prev) => [
            ...prev,
            ` ${module.name},${read === true ? 'Yes' : 'No'},${
              write === true ? 'Yes' : 'No'
            },${archive === true ? 'Yes' : 'No'}`,
          ]);
        } else {
          setCsvData((prev) => [
            ...prev,
            ...[
              {
                ...permissionObj,
              },
            ],
          ]);
          setCsvPDFData((prev) => [
            ...prev,
            ` ${permissionObj.module},${permissionObj.read},${permissionObj.write},${permissionObj.archive}`,
          ]);
        }
        module?.child_modules?.map((sub_module) => {
          if (
            sub_module?.child_modules &&
            sub_module?.child_modules.length > 0
          ) {
            setCsvData((prev) => [
              ...prev,
              {
                application: '',
                module: '',
                sub_module: sub_module.name,
                child_module: '',
                read: '-',
                write: '-',
                archive: '-',
              },
            ]);
            const { read, write, archive } = checkPermissions([module]);

            setCsvPDFData((prev) => [
              ...prev,
              `            ${sub_module.name},${read === true ? 'Yes' : 'No'},${
                write === true ? 'Yes' : 'No'
              },${archive === true ? 'Yes' : 'No'}`,
            ]);
          }
          let permissionObj = {
            application: '',
            module: '',
            sub_module: '',
            child_module: '',
            read: '',
            write: '',
            archive: '',
          };
          if (
            sub_module?.child_modules &&
            sub_module?.child_modules.length > 0
          ) {
            sub_module?.child_modules?.map((item) => {
              let permissionObj = {
                application: '',
                module: '',
                sub_module: '',
                child_module: '',
                read: '',
                write: '',
                archive: '',
              };
              permissionObj.child_module = item?.name;
              item.permissions.forEach((permissionItem) => {
                if (permissionItem.name === 'Read') {
                  permissions.includes(permissionItem?.code)
                    ? (permissionObj.read = 'Yes')
                    : (permissionObj.read = 'No');
                } else if (permissionItem.name === 'Write') {
                  permissions.includes(permissionItem?.code)
                    ? (permissionObj.write = 'Yes')
                    : (permissionObj.write = 'No');
                } else if (permissionItem.name === 'Archive') {
                  permissions.includes(permissionItem?.code)
                    ? (permissionObj.archive = 'Yes')
                    : (permissionObj.archive = 'No');
                }
              });
              setCsvData((prev) => [
                ...prev,
                ...[
                  {
                    application: '',
                    module: '',
                    sub_module: '',
                    child_module: item?.name,
                    read: permissionObj.read,
                    write: permissionObj.write,
                    archive: permissionObj.archive,
                  },
                ],
              ]);

              setCsvPDFData((prev) => [
                ...prev,
                `                        ${item?.name},${permissionObj.read},${permissionObj.write},${permissionObj.archive}`,
              ]);
            });
          } else {
            sub_module?.permissions?.forEach((permissionItem) => {
              if (permissionItem.name === 'Read') {
                permissions.includes(permissionItem?.code)
                  ? (permissionObj.read = 'Yes')
                  : (permissionObj.read = 'No');
              } else if (permissionItem.name === 'Write') {
                permissions.includes(permissionItem?.code)
                  ? (permissionObj.write = 'Yes')
                  : (permissionObj.write = 'No');
              } else if (permissionItem.name === 'Archive') {
                permissions.includes(permissionItem?.code)
                  ? (permissionObj.archive = 'Yes')
                  : (permissionObj.archive = 'No');
              }
            });
            if (
              sub_module?.child_modules &&
              sub_module?.child_modules.length === 0
            ) {
              setCsvData((prev) => [
                ...prev,
                {
                  application: '',
                  module: '',
                  sub_module: sub_module?.name,
                  child_module: '',
                  read: permissionObj.read,
                  write: permissionObj.write,
                  archive: permissionObj.archive,
                },
              ]);
              setCsvPDFData((prev) => [
                ...prev,
                `            ${sub_module.name},${permissionObj.read},${permissionObj.write},${permissionObj.archive}`,
              ]);
            } else {
              setCsvData((prev) => [
                ...prev,
                ...[
                  {
                    ...permissionObj,
                  },
                ],
              ]);
              setCsvPDFData((prev) => [
                ...prev,
                `                            ${permissionObj.read},${permissionObj.write},${permissionObj.archive}`,
              ]);
            }
          }
        });
      });
    });
  }, [permissions, tenantApplications]);

  function checkPermissions(modules) {
    let read = false;
    let write = false;
    let archive = false;

    modules.forEach((module) => {
      if (module.permissions.length > 0) {
        module.permissions.forEach((permission) => {
          if (permission.name === 'Read') {
            if (permissions.includes(permission?.code)) {
              read = true;
            }
          } else if (permission.name === 'Write') {
            if (permissions.includes(permission?.code)) {
              write = true;
            }
          } else if (permission.name === 'Archive') {
            if (permissions.includes(permission?.code)) {
              archive = true;
            }
          }
        });
      }

      if (module.child_modules.length > 0) {
        const childPermissions = checkPermissions(module.child_modules);

        if (childPermissions.read) {
          read = true;
        }
        if (childPermissions.write) {
          write = true;
        }
        if (childPermissions.archive) {
          archive = true;
        }
      }
    });
    return { read, write, archive };
  }
  return (
    <div className="mainContent">
      <Topbar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'About'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <div className="mainContentInner">
        <div className={`filterBar p-0 ${style.navigation_tabs_container}`}>
          <NavigationTabs
            roleId={roleId}
            showEdit={!rolesData?.is_auto_created}
          />
        </div>
        <div className="row">
          <div className="col-md-6">
            <table className="viewTables users_viewusertable__D3bIs users_tableBorder__43AWl">
              <thead>
                <tr>
                  <th colSpan="2">View User Role Details</th>
                </tr>
              </thead>
              {isLoading ? (
                <tbody>
                  <td className="col2 no-data text-center">Data Loading</td>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td className="col1">Role Name</td>
                    <td className="col2">
                      {' '}
                      {rolesData?.name ? rolesData.name : 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Role Details</td>
                    <td className="col2">
                      {' '}
                      {rolesData?.description
                        ? rolesData?.description
                        : 'N/A'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Recruiter</td>
                    <td className="col2">
                      {rolesData?.is_recruiter === true ? 'YES' : 'NO'}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
          <div className="col-md-6">
            <table className="viewTables users_viewusertable__D3bIs users_tableBorder__43AWl">
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
                    <td className="col1">Status</td>
                    <td className="col2">
                      {rolesData?.is_active ? (
                        <span className="badge active"> Active </span>
                      ) : (
                        <span className="badge inactive"> Inactive </span>
                      )}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Created</td>
                    <td className="col2">
                      {rolesData?.created_by
                        ? formatUser(rolesData?.created_by)
                        : 'N/A |'}{' '}
                      {rolesData?.created_at
                        ? formatDateWithTZ(
                            rolesData?.created_at,
                            'MM-dd-yyyy | hh:mm a'
                          )
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="col1">Modified</td>
                    <td className="col2">
                      {rolesData?.modified_by || rolesData?.created_by
                        ? formatUser(
                            rolesData?.modified_by ?? rolesData?.created_by
                          )
                        : 'N/A |'}{' '}
                      {rolesData?.modified_at || rolesData?.created_at
                        ? formatDateWithTZ(
                            rolesData?.modified_at ?? rolesData?.created_at,
                            'MM-dd-yyyy | hh:mm a'
                          )
                        : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
        <div className="col-md-12">
          <div
            className="tableView mt-5"
            style={{ marginRight: '2.2rem' }}
            id="report"
          >
            <div className="tableViewInner w-100 mw-100">
              <div className="group">
                <div className="group-head">
                  <h2 className="flex-grow-1">User Permissions</h2>
                  <div className="dropdown-center">
                    <div
                      className="optionsIcon"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <SvgComponent name={'DownloadIcon'} /> Export Data
                    </div>
                    <ul className="dropdown-menu">
                      <li>
                        <Link
                          onClick={generatePDFHandler}
                          className="dropdown-item"
                        >
                          PDF
                        </Link>
                      </li>
                      <li>
                        <CSVLink
                          className="dropdown-item"
                          filename={`${rolesData?.name}.csv`}
                          data={csvData}
                          headers={headers}
                        >
                          CSV
                        </CSVLink>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="tabs">
                  <div className="tabs-header">
                    <ul>
                      {tenantApplications?.map((item, key) => {
                        return (
                          <li
                            key={key}
                            onClick={() => {
                              setActiveTab(item.name.replaceAll(' ', '_'));
                            }}
                            className={`single-tab-header ${
                              activeTab === item.name.replaceAll(' ', '_')
                                ? 'tab-active'
                                : ''
                            }`}
                          >
                            {item.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {!isLoading && (
                    <div className="tabs-content">
                      {tenantApplications?.map((item, key) => {
                        return (
                          <div
                            key={key}
                            className={`single-tab-content ${
                              activeTab === item.name.replaceAll(' ', '_')
                                ? 'tab-active'
                                : ''
                            }`}
                          >
                            <div className="group-body user-group">
                              <ul>
                                <li className="bold">
                                  <span className="left-heading">
                                    Module and Submodules
                                  </span>
                                  <span className="">Read </span>
                                  <span className="">Write </span>
                                  <span className="">Archive</span>
                                  <span className=""></span>
                                </li>
                                {item?.modules?.map((module, keyModule) => {
                                  return (
                                    <li
                                      style={{ justifyContent: 'unset' }}
                                      key={keyModule}
                                      className={`${
                                        accordian[
                                          'module' +
                                            module.name.replaceAll(' ', '_')
                                        ] === true
                                          ? 'active'
                                          : ''
                                      }`}
                                    >
                                      <span className="">{module?.name}</span>
                                      {module?.permissions?.length > 0 ? (
                                        module?.permissions.map(
                                          (permission, key) => {
                                            if (permission.name === 'Read') {
                                              if (
                                                permissions.includes(
                                                  permission?.code
                                                )
                                              ) {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="yes"
                                                  >
                                                    Yes{' '}
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="no"
                                                  >
                                                    No{' '}
                                                  </span>
                                                );
                                              }
                                            }

                                            if (permission.name === 'Write') {
                                              if (
                                                permissions.includes(
                                                  permission?.code
                                                )
                                              ) {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="yes"
                                                  >
                                                    Yes{' '}
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="no"
                                                  >
                                                    No{' '}
                                                  </span>
                                                );
                                              }
                                            }
                                            if (permission.name === 'Archive') {
                                              if (
                                                permissions.includes(
                                                  permission?.code
                                                )
                                              ) {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="yes"
                                                  >
                                                    Yes{' '}
                                                  </span>
                                                );
                                              } else {
                                                return (
                                                  <span
                                                    key={key}
                                                    className="no"
                                                  >
                                                    No{' '}
                                                  </span>
                                                );
                                              }
                                            }
                                          }
                                        )
                                      ) : (
                                        <>
                                          <span
                                            className={
                                              checkPermissions([module]).read
                                                ? 'yes'
                                                : 'no'
                                            }
                                          >
                                            {checkPermissions([module]).read
                                              ? 'Yes'
                                              : 'No'}
                                          </span>
                                          <span
                                            className={
                                              checkPermissions([module]).write
                                                ? 'yes'
                                                : 'no'
                                            }
                                          >
                                            {checkPermissions([module]).write
                                              ? 'Yes'
                                              : 'No'}
                                          </span>
                                          <span
                                            className={
                                              checkPermissions([module]).archive
                                                ? 'yes'
                                                : 'no'
                                            }
                                          >
                                            {checkPermissions([module]).archive
                                              ? 'Yes'
                                              : 'No'}
                                          </span>
                                        </>
                                      )}

                                      {module?.childs === true ? (
                                        <span
                                          className="plus-icon"
                                          onClick={() => {
                                            const key =
                                              'module' +
                                              module.name.replaceAll(' ', '_');
                                            const currentState = accordian[key];
                                            setAccordians((prevStates) => ({
                                              ...prevStates,
                                              [key]:
                                                typeof currentState ===
                                                'undefined'
                                                  ? true
                                                  : !currentState,
                                            }));
                                          }}
                                        >
                                          {' '}
                                          {accordian[
                                            'module' +
                                              module.name.replaceAll(' ', '_')
                                          ] === true ? (
                                            <SvgComponent name={'UpChevron'} />
                                          ) : (
                                            <SvgComponent
                                              name={'DownChevron'}
                                            />
                                          )}{' '}
                                        </span>
                                      ) : (
                                        <span
                                          style={{
                                            marginLeft: 'auto',
                                            borderLeft: '1px solid #d9d9d9',
                                          }}
                                          className="plus-icon "
                                        >
                                          {' '}
                                        </span>
                                      )}
                                      <ul>
                                        {module?.child_modules?.map(
                                          (child_module, child_module_key) => {
                                            return child_module ? (
                                              <li
                                                key={child_module_key}
                                                className={`${
                                                  accordian[
                                                    'child_module' +
                                                      child_module.name.replaceAll(
                                                        ' ',
                                                        '_'
                                                      )
                                                  ] === true
                                                    ? 'active'
                                                    : ''
                                                }`}
                                              >
                                                <span className="">
                                                  {child_module?.name}
                                                </span>
                                                {child_module?.permissions
                                                  ?.length ? (
                                                  child_module?.permissions.map(
                                                    (permission, key) => {
                                                      if (
                                                        permission.name ===
                                                        'Read'
                                                      ) {
                                                        if (
                                                          permissions.includes(
                                                            permission?.code
                                                          )
                                                        ) {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="yes"
                                                            >
                                                              Yes{' '}
                                                            </span>
                                                          );
                                                        } else {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="no"
                                                            >
                                                              No{' '}
                                                            </span>
                                                          );
                                                        }
                                                      }

                                                      if (
                                                        permission.name ===
                                                        'Write'
                                                      ) {
                                                        if (
                                                          permissions.includes(
                                                            permission?.code
                                                          )
                                                        ) {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="yes"
                                                            >
                                                              Yes{' '}
                                                            </span>
                                                          );
                                                        } else {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="no"
                                                            >
                                                              No{' '}
                                                            </span>
                                                          );
                                                        }
                                                      }
                                                      if (
                                                        permission.name ===
                                                        'Archive'
                                                      ) {
                                                        if (
                                                          permissions.includes(
                                                            permission?.code
                                                          )
                                                        ) {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="yes"
                                                            >
                                                              Yes{' '}
                                                            </span>
                                                          );
                                                        } else {
                                                          return (
                                                            <span
                                                              key={key}
                                                              className="no"
                                                            >
                                                              No{' '}
                                                            </span>
                                                          );
                                                        }
                                                      }
                                                    }
                                                  )
                                                ) : (
                                                  <>
                                                    <span
                                                      className={
                                                        checkPermissions([
                                                          module,
                                                        ]).read
                                                          ? 'yes'
                                                          : 'no'
                                                      }
                                                    >
                                                      {checkPermissions([
                                                        module,
                                                      ]).read
                                                        ? 'Yes'
                                                        : 'No'}
                                                    </span>
                                                    <span
                                                      className={
                                                        checkPermissions([
                                                          module,
                                                        ]).write
                                                          ? 'yes'
                                                          : 'no'
                                                      }
                                                    >
                                                      {checkPermissions([
                                                        module,
                                                      ]).write
                                                        ? 'Yes'
                                                        : 'No'}
                                                    </span>
                                                    <span
                                                      className={
                                                        checkPermissions([
                                                          module,
                                                        ]).archive
                                                          ? 'yes'
                                                          : 'no'
                                                      }
                                                    >
                                                      {checkPermissions([
                                                        module,
                                                      ]).archive
                                                        ? 'Yes'
                                                        : 'No'}
                                                    </span>
                                                  </>
                                                )}
                                                {child_module?.childs ===
                                                  true &&
                                                child_module?.hasPermissions ===
                                                  true ? (
                                                  <span
                                                    className="plus-icon"
                                                    onClick={() => {
                                                      const key =
                                                        'child_module' +
                                                        child_module.name.replaceAll(
                                                          ' ',
                                                          '_'
                                                        );
                                                      const currentState =
                                                        accordian[key];
                                                      setAccordians(
                                                        (prevStates) => ({
                                                          ...prevStates,
                                                          [key]:
                                                            typeof currentState ===
                                                            'undefined'
                                                              ? true
                                                              : !currentState,
                                                        })
                                                      );
                                                    }}
                                                  >
                                                    {' '}
                                                    {accordian[
                                                      'child_module' +
                                                        child_module.name.replaceAll(
                                                          ' ',
                                                          '_'
                                                        )
                                                    ] === true ? (
                                                      <SvgComponent
                                                        name={'UpChevron'}
                                                      />
                                                    ) : (
                                                      <SvgComponent
                                                        name={'DownChevron'}
                                                      />
                                                    )}{' '}
                                                  </span>
                                                ) : (
                                                  <span className="plus-icon">
                                                    {' '}
                                                  </span>
                                                )}
                                                <ul>
                                                  {child_module?.child_modules?.map(
                                                    (
                                                      child_module_1,
                                                      child_module_key_1
                                                    ) => {
                                                      return child_module_1?.hasPermissions ===
                                                        true ? (
                                                        <li
                                                          key={
                                                            child_module_key_1
                                                          }
                                                          className={`active ${
                                                            accordian[
                                                              'child_module_1' +
                                                                child_module_1.name.replaceAll(
                                                                  ' ',
                                                                  '_'
                                                                )
                                                            ] === true
                                                              ? 'active'
                                                              : ''
                                                          }`}
                                                        >
                                                          <span className="">
                                                            {
                                                              child_module_1?.name
                                                            }
                                                          </span>
                                                          {child_module_1?.permissions?.map(
                                                            (
                                                              child_module_1_permission,
                                                              child_module_1_permission_key
                                                            ) => {
                                                              if (
                                                                child_module_1_permission.name ===
                                                                'Read'
                                                              ) {
                                                                if (
                                                                  permissions.includes(
                                                                    child_module_1_permission?.code
                                                                  )
                                                                ) {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="yes"
                                                                    >
                                                                      Yes{' '}
                                                                    </span>
                                                                  );
                                                                } else {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="no"
                                                                    >
                                                                      No{' '}
                                                                    </span>
                                                                  );
                                                                }
                                                              }

                                                              if (
                                                                child_module_1_permission.name ===
                                                                'Write'
                                                              ) {
                                                                if (
                                                                  permissions.includes(
                                                                    child_module_1_permission?.code
                                                                  )
                                                                ) {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="yes"
                                                                    >
                                                                      Yes{' '}
                                                                    </span>
                                                                  );
                                                                } else {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="no"
                                                                    >
                                                                      No{' '}
                                                                    </span>
                                                                  );
                                                                }
                                                              }
                                                              if (
                                                                child_module_1_permission.name ===
                                                                'Archive'
                                                              ) {
                                                                if (
                                                                  permissions.includes(
                                                                    child_module_1_permission?.code
                                                                  )
                                                                ) {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="yes"
                                                                    >
                                                                      Yes{' '}
                                                                    </span>
                                                                  );
                                                                } else {
                                                                  return (
                                                                    <span
                                                                      key={
                                                                        child_module_1_permission_key
                                                                      }
                                                                      className="no"
                                                                    >
                                                                      No{' '}
                                                                    </span>
                                                                  );
                                                                }
                                                              }
                                                            }
                                                          )}
                                                          {child_module_1?.childs ===
                                                            true &&
                                                          child_module_1?.hasPermissions ===
                                                            true ? (
                                                            <span
                                                              className="plus-icon"
                                                              onClick={() => {
                                                                const key =
                                                                  'child_module_1' +
                                                                  child_module_1.name.replaceAll(
                                                                    ' ',
                                                                    '_'
                                                                  );
                                                                const currentState =
                                                                  accordian[
                                                                    key
                                                                  ];
                                                                setAccordians(
                                                                  (
                                                                    prevStates
                                                                  ) => ({
                                                                    ...prevStates,
                                                                    [key]:
                                                                      typeof currentState ===
                                                                      'undefined'
                                                                        ? true
                                                                        : !currentState,
                                                                  })
                                                                );
                                                              }}
                                                            >
                                                              {' '}
                                                              {accordian[
                                                                'child_module_1' +
                                                                  child_module_1.name.replaceAll(
                                                                    ' ',
                                                                    '_'
                                                                  )
                                                              ] === true ? (
                                                                <SvgComponent
                                                                  name={
                                                                    'UpChevron'
                                                                  }
                                                                />
                                                              ) : (
                                                                <SvgComponent
                                                                  name={
                                                                    'DownChevron'
                                                                  }
                                                                />
                                                              )}{' '}
                                                            </span>
                                                          ) : (
                                                            <span className="plus-icon">
                                                              {''}
                                                            </span>
                                                          )}
                                                        </li>
                                                      ) : null;
                                                    }
                                                  )}
                                                </ul>
                                              </li>
                                            ) : null;
                                          }
                                        )}
                                      </ul>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ViewTenantUserRole;
