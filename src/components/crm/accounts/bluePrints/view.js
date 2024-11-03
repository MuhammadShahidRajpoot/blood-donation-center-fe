import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TopBar from '../../../common/topbar/index';
import { toast } from 'react-toastify';
import { CRMAccountsBreadCrumbsData } from '../AccountsBreadCrumbsData';
import AccountViewHeader from '../header';
import LocationAboutNavigationTabs from '../../accounts/navigationTabs';
import viewimage from '../../../../assets/images/viewimage.png';
import DriveContactsSection from '../../../operations-center/operations/drives/about/driveContacts';
import EquipmentsSection from '../../../operations-center/operations/drives/about/equipments';
import CertificationsSection from '../../../operations-center/operations/drives/about/certifications';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { CRM_ACCOUNT_BLUEPRINT_PATH } from '../../../../routes/path';
import { formatUser } from '../../../../helpers/formatUser';
import moment from 'moment/moment';
import CustomFieldsSection from '../../../operations-center/operations/drives/about/custom_fields';
import LinkVehiclesmodel from './view/linkVehiclesmodel';
import {
  covertDatetoTZDate,
  formatDateWithTZ,
} from '../../../../helpers/convertDateTimeToTimezone';
import { formatDate } from '../../../../helpers/formatDate';
import styles from './view/index.module.scss';

const BluePrintView = () => {
  const [startTime, setStartTime] = useState(0);
  const [selectedlinkDrive, setSelectLinkDrive] = useState(null);
  const [showlinkDriveModel, setShowLinkDriveModel] = useState(false);
  const [linkableVehicles, setLinkAbleVehicles] = useState([]);
  const [endTime, setEndTime] = useState(0);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const { account_id, id } = useParams();
  const [driveData, setDriveData] = useState(null);
  const [linkData, setLinkData] = useState();
  const [linkedDriveId, setLinkedDriveId] = useState(null);

  useEffect(() => {
    if (selectedlinkDrive?.length == 1) {
      getLinkedShiftDetails(selectedlinkDrive[0]);
    }
  }, [selectedlinkDrive]);

  const getLinkedShiftDetails = async (id) => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles/${id}`
      );
      const data = await response.json();
      setLinkedDriveId(data && data?.data && data?.data?.drives?.id);
      const linked_id = data && data?.data && data?.data?.drives?.id;
      const vehicles = data && data?.data && data?.data?.vehicles;
      const staff = data && data?.data && data?.data?.staff;
      const projection = data && data?.data && data?.data?.projection;
      const product = data && data?.data && data?.data?.products;
      const start_time = data && data?.data && data?.data?.shift?.start_time;
      const shift_id = data && data?.data && data?.data?.shift?.id;
      const current_shift =
        driveData &&
        driveData?.shifts &&
        driveData?.shifts?.length > 0 &&
        driveData?.shifts?.[0]?.id;
      const end_time = data && data?.data && data?.data?.shift?.end_time;
      const oef_products =
        data && data?.data && data?.data?.shift?.oef_products;
      const oef_procedures =
        data && data?.data && data?.data?.shift?.oef_procedures;
      const break_start_time =
        data && data?.data && data?.data?.shift?.break_start_time;
      const break_end_time =
        data && data?.data && data?.data?.shift?.break_end_time;
      setLinkData({
        linked_id,
        vehicles,
        shift_id,
        current_shift,
        staff,
        projection,
        product,
        start_time,
        end_time,
        oef_products,
        oef_procedures,
        break_start_time,
        break_end_time,
      });
    } catch (err) {
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (linkData && linkedDriveId) {
      console.log({ linkData }, { linkedDriveId });
      submitLinkDrive();
    }
  }, [linkData, linkedDriveId]);

  console.log({ linkData }, { linkedDriveId });

  const submitLinkDrive = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'POST',
        `${BASE_URL}/drives/linkvehicles/view/${id}`,
        JSON.stringify(linkData)
      );
      const res = await response.json();
      if (res?.status == 'success') {
        console.log('edited');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };
  const getLinkableVehicles = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/linkvehicles`
      );
      let array = [];
      const data = await response.json();
      data?.data?.map((item, index) => {
        let date;
        let account;
        let location;
        let start_time;
        let end_time;
        let vehicles_name = null;
        let staffSetup;
        let total_time;
        let id;
        if (
          item?.drives?.shifts?.length &&
          item?.drives?.account?.name &&
          item?.drives?.location?.name &&
          item?.drives?.shifts?.[0]?.id
        ) {
          date = item?.drives?.date;
          id = item?.drives?.shifts?.[0]?.id;
          account = item?.drives?.account?.name;
          location = item?.drives?.location?.name;
          let long = item?.drives?.shifts?.length;
          start_time = moment(item?.drives?.shifts?.[0]?.start_time).format(
            'hh:mm a'
          );
          end_time = moment(item?.drives?.shifts?.[long - 1]?.end_time).format(
            'hh:mm a'
          )
            ? moment(item?.drives?.shifts?.[long - 1]?.end_time).format(
                'hh:mm a'
              )
            : moment(item?.drives?.shifts?.[0]?.end_time).format('hh:mm a');

          total_time = `${start_time} - ${end_time}`;
          let sum = 0;
          staffSetup = item?.drives?.staff_config?.map((ds, iii) => {
            return (sum += ds?.qty);
          });
          staffSetup = staffSetup + '-staff';
          for (let veh of item?.drives?.vehicles || []) {
            vehicles_name = vehicles_name
              ? vehicles_name +
                (veh && veh.name !== undefined ? ', ' + veh.name : '')
              : veh && veh.name !== undefined
              ? veh.name
              : null;
          }
          let data = {
            id,
            date,
            account,
            location,
            start_time,
            end_time,
            vehicles_name,
            staffSetup,
            total_time,
          };
          array.push(data);
        }
      });

      console.log('------------------------link drives', array);
      if (array?.length) {
        setLinkAbleVehicles(array);
      }
    } catch (err) {
      toast.error(`Error fetching data ${err}`, {
        autoClose: 3000,
      });
    }
  };
  const getStartEndTime = () => {
    let start_time = driveData?.shifts?.[0]?.start_time;
    let end_time = driveData?.shifts?.[0]?.end_time;
    for (let time of driveData?.shifts || []) {
      start_time = time.start_time < start_time ? time.start_time : start_time;
      end_time = time.end_time > end_time ? time.end_time : end_time;
    }
    start_time = formatDateWithTZ(start_time, 'hh:mm a');
    setStartTime(start_time);
    end_time = formatDateWithTZ(end_time, 'hh:mm a');
    setEndTime(end_time);
  };
  const getDriveData = async (blueprintId) => {
    try {
      const result = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/drives/${blueprintId}`
      );
      const { data } = await result.json();
      data[0] ? setDriveData(data[0]) : setDriveData(null);
      if (data[0] && data[0]?.linked_drive) {
        // let linkedDriveId =
        //   data[0]?.linked_drive?.prospective_drive_id == id
        //     ? data[0]?.linked_drive?.current_drive_id
        //     : data[0]?.linked_drive?.prospective_drive_id;
        // setLinkedDriveId(linkedDriveId);
      }
    } catch (error) {
      toast.error('Error fetching drive');
    } finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    getDriveData(id);
    getLinkableVehicles();
  }, []);
  useEffect(() => {
    if (driveData?.shifts?.length) {
      getStartEndTime();
    }
  }, [getStartEndTime, driveData, startTime, endTime]);
  const BreadcrumbsData = [
    ...CRMAccountsBreadCrumbsData,
    {
      label: 'View Account',
      class: 'disable-label',
      link: `/crm/accounts/${account_id}/view/about`,
    },
    {
      label: 'Blueprints',
      class: 'active-label',
      link: `/crm/accounts/${account_id}/blueprint`,
    },
    {
      label: 'About',
      class: 'active-label',
      link: `${CRM_ACCOUNT_BLUEPRINT_PATH.ABOUT.replace(
        ':account_id',
        account_id
      ).replace(':id', id)}`,
    },
  ];
  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={
          CRM_ACCOUNT_BLUEPRINT_PATH.ABOUT.replace(
            ':account_id',
            account_id
          ).replace(':id', id)
            ? 'About'
            : 'Blueprints'
        }
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
      <div className={`mainContentInner ${styles.blueprintContainer}`}>
        <div className="filterBar p-0 mb-3">
          <div className="flex justify-content-between tabs mb-0 position-relative">
            <div className="border-0">
              <ul>
                <li>
                  <Link
                    to={CRM_ACCOUNT_BLUEPRINT_PATH.ABOUT.replace(
                      ':account_id',
                      account_id
                    ).replace(':id', id)}
                    className="active"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/crm/accounts/${account_id}/blueprint/${id}/shifts/view`}
                    className=""
                  >
                    Shift Details
                  </Link>
                </li>
                <li>
                  <Link
                    to={CRM_ACCOUNT_BLUEPRINT_PATH.MARKETING_DETAILS.replace(
                      ':account_id',
                      account_id
                    ).replace(':id', id)}
                    className=""
                  >
                    Marketing Details
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bodyMainContent px-0">
          <div className="row row-gap-4 aboutAccountMain">
            <div className="col-12 col-md-6">
              <table className="viewTables w-100 mt-0">
                <thead>
                  <tr>
                    <th colSpan="2">Drive Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tableTD col1">Operation Date</td>
                    <td className="tableTD col2">
                      {' '}
                      {moment(driveData?.drive?.date).format('MM-DD-YYYY') ||
                        '-'}{' '}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Account</td>
                    <td className="tableTD col2">
                      <a
                        href={
                          driveData?.account?.name
                            ? `/crm/accounts/${driveData?.account?.id}/view/about`
                            : '#'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="linkText"
                      >
                        {driveData?.account?.name || 'N/A'}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Location Name</td>
                    <td className="tableTD col2">
                      <a
                        href={
                          driveData?.crm_locations?.name
                            ? `/crm/locations/${driveData?.crm_locations?.id}/view`
                            : '#'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="linkText"
                      >
                        {driveData?.crm_locations?.name || 'N/A'}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Primary Chairperson</td>
                    <td className="tableTD col2">
                      {driveData?.account?.account_contacts?.map(
                        (item, index) => {
                          if (
                            item?.role_id &&
                            item?.role_id?.name == 'Primary Chairperson'
                          ) {
                            return item?.record_id?.first_name ? (
                              <a
                                key={index}
                                href={
                                  item?.record_id?.id
                                    ? `/crm/contacts/volunteers/${item?.record_id?.id}/view`
                                    : '#'
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="linkText"
                              >
                                {item?.record_id?.first_name +
                                  ' ' +
                                  item?.record_id?.last_name}
                              </a>
                            ) : (
                              'N/A'
                            );
                          }
                        }
                      ) || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Chairperson Phone</td>
                    <td className="tableTD col2 linkText">
                      {driveData?.account?.account_contacts?.map(
                        (item, index) => {
                          if (
                            item?.role_id &&
                            item?.role_id?.name == 'Primary Chairperson'
                          ) {
                            if (
                              item?.record_id?.contactable_data &&
                              item?.record_id?.contactable_data?.length
                            ) {
                              return item?.record_id?.contactable_data[0]
                                .data ? (
                                <a
                                  key={index}
                                  href={`tel:+${item?.record_id?.contactable_data[0].data}`}
                                  rel="noreferrer"
                                  className="linkText"
                                >
                                  {item?.record_id?.contactable_data[0].data}
                                </a>
                              ) : (
                                'N/A'
                              );
                            }
                          }
                        }
                      ) || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Chairperson SMS</td>
                    <td className="tableTD col2 linkText">
                      {driveData?.account?.account_contacts?.map(
                        (item, index) => {
                          if (
                            item?.role_id &&
                            item?.role_id?.name == 'Primary Chairperson'
                          ) {
                            if (
                              item?.record_id?.contactable_data &&
                              item?.record_id?.contactable_data?.length
                            ) {
                              return item?.record_id?.contactable_data[0]
                                .data ? (
                                <a
                                  key={index}
                                  href={`tel:+${item?.record_id?.contactable_data[0].data}`}
                                  rel="noreferrer"
                                  className="linkText"
                                >
                                  {item?.record_id?.contactable_data[0].data}
                                </a>
                              ) : (
                                'N/A'
                              );
                            }
                          }
                        }
                      ) || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Chairperson Email</td>
                    <td className="tableTD col2 linkText">
                      {driveData?.account?.account_contacts?.map(
                        (item, index) => {
                          if (
                            item?.role_id &&
                            item?.role_id?.name == 'Primary Chairperson'
                          ) {
                            if (
                              item?.record_id?.contactable_data &&
                              item?.record_id?.contactable_data?.length
                            ) {
                              return item?.record_id?.contactable_data?.[1]
                                ?.data ? (
                                <a
                                  key={index}
                                  href={`mailto: ${item?.record_id?.contactable_data[1].data}`}
                                  rel="noreferrer"
                                  className="linkText"
                                >
                                  {item?.record_id?.contactable_data[1].data}
                                </a>
                              ) : (
                                'N/A'
                              );
                            }
                          }
                        }
                      ) || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Draw Hours</td>
                    <td className="tableTD col2">
                      {`${startTime} - ${endTime}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Projection</td>
                    <td className="tableTD col2">
                      {(() => {
                        let totalProcedureQty = 0;
                        let totalProductYield = 0;

                        driveData?.shifts?.forEach((item) => {
                          item?.shifts_projections_staff?.forEach((xx) => {
                            totalProcedureQty += xx?.procedure_type_qty || 0;
                            totalProductYield += xx?.product_yield || 0;
                          });
                        });

                        return `${totalProcedureQty} / ${totalProductYield} `;
                      })() || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1 bg-white">
                      Drive Details: OEF
                    </td>
                    <td className="tableTD col2"></td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Procedures</td>
                    <td className="tableTD col2">
                      {driveData?.shifts
                        ?.map((shift) => shift?.oef_procedures || 0)
                        .reduce((acc, value) => acc + value, 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Products</td>
                    <td className="tableTD col2">
                      {driveData?.shifts
                        ?.map((shift) => shift?.oef_products || 0)
                        .reduce((acc, value) => acc + value, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="viewTables w-100 mt-4">
                <thead>
                  <tr>
                    <th colSpan="2">Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tableTD col1">Industry Category</td>
                    <td className="tableTD col2">
                      {driveData?.account?.industry_category?.name
                        ? driveData?.account?.industry_category?.name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Industry Subcategory</td>
                    <td className="tableTD col2">
                      {driveData?.account?.industry_subcategory?.name
                        ? driveData?.account?.industry_subcategory?.name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Stage</td>
                    <td className="tableTD col2">
                      {driveData?.account?.stage?.name
                        ? driveData?.account?.stage?.name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Source</td>
                    <td className="tableTD col2">
                      {driveData?.account?.source?.name
                        ? driveData?.account?.source?.name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Collection Operation</td>
                    <td className="tableTD col2">
                      {driveData?.account?.collection_operation?.name
                        ? driveData?.account?.collection_operation?.name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Recruiter </td>
                    <td className="tableTD col2">
                      {driveData?.account?.recruiter?.first_name
                        ? driveData?.account?.recruiter?.first_name +
                          ' ' +
                          driveData?.account?.recruiter?.last_name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Territory</td>
                    <td className="tableTD col2">
                      {driveData?.account?.territory?.territory_name
                        ? driveData?.account?.territory?.territory_name
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Affiliation</td>
                    <td className="tableTD col2">
                      {driveData?.account?.affiliations
                        ? driveData?.account?.affiliations
                            .map((item) => item.affiliation_data.name)
                            .join(',')
                        : 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="viewTables w-100 mt-4">
                <thead>
                  <tr>
                    <th colSpan="2">Insights</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tableTD col1">Status</td>
                    <td className="tableTD col2">
                      {driveData?.drive?.operation_status_id ? (
                        <span className="badge active">
                          {driveData?.drive?.operation_status_id?.name}
                        </span>
                      ) : (
                        <span className="badge inactive">Inactive</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Default Blueprint</td>
                    <td className="tableTD col2">
                      {driveData?.drive?.is_default_blueprint ? 'Yes' : 'No'}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Created</td>
                    <td className="tableTD col2">
                      {formatUser(driveData?.drive?.created_by)}{' '}
                      {formatDate(
                        covertDatetoTZDate(driveData?.drive?.created_at)
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="tableTD col1">Modified</td>
                    <td className="tableTD col2">
                      {formatUser(driveData?.drive?.created_by)}{' '}
                      {formatDate(
                        covertDatetoTZDate(driveData?.drive?.created_at)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-12 col-md-6">
              <DriveContactsSection
                driveData={driveData}
                getDriveData={getDriveData}
              />
              <EquipmentsSection
                driveData={driveData}
                getDriveData={getDriveData}
              />
              <CertificationsSection
                driveData={driveData}
                getDriveData={getDriveData}
              />
              <CustomFieldsSection id={driveData?.drive?.id} />
              <LinkVehiclesmodel
                setModal={setShowLinkDriveModel}
                modal={showlinkDriveModel}
                staffShareRequired={0}
                shareStaffData={linkableVehicles}
                // selectedLinkDrive={selectedLinkDrive}
                setSelectedLinkDrive={setSelectLinkDrive}
              ></LinkVehiclesmodel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BluePrintView;
