import React, { useState } from 'react';
import Layout from '../../../../../components/common/layout';
import TopBar from '../../../../../components/common/topbar/index';
import FormInput from '../../../../../components/common/form/FormInput';
import SelectDropdown from '../../../../../components/common/selectDropdown';
import TableList from '../../../../../components/common/tableListing';
import Pagination from '../../../../../components/common/pagination/index';
import CancelPopUpModal from '../../../../../components/common/cancelModal';
import ConfirmModal from '../../../../../components/common/confirmModal';
import ConfirmationIcon from '../../../../../assets/images/confirmationIcon.png';
import styles from './Certification.module.scss';
import { fetchData } from '../../../../../helpers/Api';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CertificationBreadCrumbsData } from './CertificationBreadCrumbsData';
import GlobalMultiSelect from '../../../../../components/common/GlobalMultiSelect';
import moment from 'moment';
import SvgComponent from '../../../../../components/common/SvgComponent';

const initialFilters = {
  keyword: '',
  team_id: '',
  role_id: '',
  co_id: '',
  certificate_id: '',
  start_date: new Date().toLocaleDateString('en-ca'),
};

const initialSearchParams = {
  ...initialFilters,
  page: 1,
  limit: 10,
  sortOrder: 'ASC',
  sortName: 'staff_name',
};

const Filters = ({ params, handleFilter }) => {
  const [filters, setFilters] = React.useState(initialFilters);
  const [teams, setTeams] = React.useState([]);
  const [certifications, setCertifications] = React.useState([]);
  const [collectionOperations, setCollectionOperations] = React.useState([]);
  const [roles, setRoles] = React.useState([]);

  React.useEffect(() => {
    const fetcher = async () => {
      let responses = await Promise.all([
        fetchData('/staff-admin/teams?sortName=name&sortOrder=ASC', 'GET'),
        fetchData('/staffing-admin/certification/list', 'GET'),
        fetchData(
          '/business_units/collection_operations/list?isFilter=true',
          'GET'
        ),
        fetchData('/contact-roles?function_id=3', 'GET'),
      ]);
      return [
        (responses[0]?.data || []).filter((obj) => obj.is_active),
        (responses[1]?.data?.records || []).filter((obj) => obj.is_active),
        responses[2]?.data || [],
        responses[3]?.data || [],
      ];
    };

    const filter = async (objs, key) => {
      const obj = objs.find(
        (obj) => obj.id.toString() === params[key].toString()
      );
      return obj ? { label: obj.name, value: obj.id } : null;
    };
    const multiFilter = async (objs, key) => {
      if (params[key]) {
        const filteredObjs = objs.filter((obj) =>
          params[key].toString().split(',').includes(obj.id.toString())
        );
        return filteredObjs.map((obj) => ({ id: obj.id, name: obj.name }));
      } else {
        return [];
      }
    };

    const setter = async (
      _teams,
      _certifications,
      _collectionOperations,
      _roles
    ) => {
      const [team_id, certificate_id, co_id, role_id] = await Promise.all([
        multiFilter(_teams, 'team_id'),
        filter(_certifications, 'certificate_id'),
        multiFilter(_collectionOperations, 'co_id'),
        multiFilter(_roles, 'role_id'),
      ]);

      setTimeout(() => {
        setTeams(_teams);
        setCertifications(_certifications);
        setCollectionOperations(_collectionOperations);
        setRoles(_roles);
        setFilters({
          ...filters,
          team_id,
          certificate_id,
          co_id,
          role_id,
          keyword: params?.keyword,
        });
      });
    };

    fetcher()
      .then(async (responses) => {
        await setter(...responses);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.team_id, params.certificate_id, params.co_id, params.role_id]);

  const onChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    handleFilter(name, value);
  };

  const onDropdownChange = (option, e) => {
    const { label, value = '' } = option || {};
    const { name } = e;
    handleFilter(name, value, label);
  };

  const onMultiDropdownChange = (data, name) => {
    let newIds = [];
    const ids = filters[name].map((obj) => obj.id);
    if (Array.isArray(data)) {
      newIds = data.map((option) => option.id);
    } else {
      if (ids.some((obj) => obj === data.id)) {
        newIds = ids.filter((obj) => obj !== data.id);
      } else {
        newIds = [...ids, data.id];
      }
    }
    handleFilter(name, newIds.join(','));
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const filterChange = () => {
    setFilterOpen(!filterOpen);
  };

  const isStartDateAndCertificateSelected =
    filters.start_date && filters.certificate_id;

  return (
    <form className="formGroup">
      <div className="filterBar">
        <div className="filterInner">
          <h2>Select Certificate and Start Date</h2>
          <div className="d-flex gap-4">
            <div className={styles.filter}>
              <FormInput
                name="start_date"
                displayName="Start Date"
                type="date"
                classes={{ root: 'position-relative' }}
                value={filters.start_date}
                handleChange={onChange}
                required={false}
              />
            </div>
            <div className={styles.filter}>
              <SelectDropdown
                name="certificate_id"
                placeholder={'Certificate'}
                selectedValue={filters.certificate_id}
                onChange={onDropdownChange}
                options={certifications.map((certif) => ({
                  label: certif.name,
                  value: certif.id,
                }))}
                removeDivider
                showLabel
              />
            </div>
          </div>
        </div>
      </div>
      <div className="filterBar pt-2">
        <div className="filterInner">
          <h2>Filters</h2>
          <div className="filterIcon" onClick={filterChange}>
            <SvgComponent
              name={`${filterOpen === true ? 'UpChevron' : 'DownChevron'}`}
            />
          </div>
          <div className={`filter ${filterOpen ? 'active' : 'close'}`}>
            <form className="d-flex flex-wrap gap-3 w-100">
              <div className={styles.filter}>
                <FormInput
                  name="keyword"
                  displayName="Staff Name"
                  type="text"
                  classes={{ root: 'position-relative' }}
                  value={filters.keyword}
                  handleChange={onChange}
                  required={false}
                  disabled={!isStartDateAndCertificateSelected}
                />
              </div>
              <div className="form-field">
                <GlobalMultiSelect
                  label="Team"
                  data={teams.map((team) => ({
                    name: team.name,
                    id: team.id,
                  }))}
                  styles={{
                    control: (state) => ({
                      backgroundColor:
                        state.isFocused || filters.role_id
                          ? 'white'
                          : '#f7f5f5',
                    }),
                  }}
                  selectedOptions={filters.team_id}
                  onChange={(data) => onMultiDropdownChange(data, 'team_id')}
                  onSelectAll={(data) => onMultiDropdownChange(data, 'team_id')}
                  disabled={!isStartDateAndCertificateSelected}
                />
              </div>
              <div className="form-field">
                <GlobalMultiSelect
                  label="Collection Operation"
                  data={collectionOperations.map((col) => ({
                    name: col.name,
                    id: col.id,
                  }))}
                  styles={{
                    control: (state) => ({
                      backgroundColor:
                        state.isFocused || filters.co_id ? 'white' : '#f7f5f5',
                    }),
                  }}
                  selectedOptions={filters.co_id}
                  onChange={(data) => onMultiDropdownChange(data, 'co_id')}
                  onSelectAll={(data) => onMultiDropdownChange(data, 'co_id')}
                  disabled={!isStartDateAndCertificateSelected}
                />
              </div>
              <div className="form-field">
                <GlobalMultiSelect
                  label="Role"
                  data={roles.map((role) => ({
                    name: role.name,
                    id: role.id,
                  }))}
                  styles={{
                    control: (state) => ({
                      backgroundColor:
                        state.isFocused || filters.role_id
                          ? 'white'
                          : '#f7f5f5',
                    }),
                  }}
                  selectedOptions={filters.role_id}
                  onChange={(data) => onMultiDropdownChange(data, 'role_id')}
                  onSelectAll={(data) => onMultiDropdownChange(data, 'role_id')}
                  disabled={!isStartDateAndCertificateSelected}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </form>
  );
};

export default function AssignCertification() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams(initialSearchParams);
  const [staffs, setStaffs] = React.useState([]);
  const [totalStaffs, setTotalStaffs] = React.useState(-1);
  const [assignedStaff, setAssignedStaff] = React.useState([]);
  const [page, setPage] = React.useState(
    searchParams.get('page') || initialSearchParams.page
  );
  const [limit, setLimit] = React.useState(
    searchParams.get('limit') || initialSearchParams.limit
  );
  const [isLoading, setLoading] = React.useState(false);
  const [staffLoading, setStaffLoading] = React.useState(false);
  const [cancel, setCancel] = React.useState(false);
  const [showConfirmation, setConfirmation] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState(
    initialSearchParams.sortOrder
  );
  const [sortName, setSortName] = React.useState(initialSearchParams.sortName);
  const [tableHeaders, setTableHeaders] = React.useState([
    {
      name: 'staff_name',
      label: 'Name',
      width: '10%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'roles',
      label: 'Role',
      width: '10%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'teams',
      label: 'Team',
      width: '10%',
      sortable: true,
      defaultHidden: false,
    },
    {
      name: 'collection_name',
      label: 'Collection Operation',
      width: '10%',
      sortable: true,
      defaultHidden: false,
    },
  ]);

  const isDisabled =
    isLoading ||
    !assignedStaff.length ||
    !searchParams.get('certificate_id') ||
    !searchParams.get('start_date');

  const BreadcrumbsData = [
    ...CertificationBreadCrumbsData,
    {
      label: 'Certifications',
      class: 'disable-label',
      link: '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification',
    },
    {
      label: 'Assign Certifications',
      class: 'disable-label',
      link: '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification/assign',
    },
  ];

  React.useEffect(() => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sortName,
      sortOrder,
      page,
      limit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortName, sortOrder, page, limit]);
  React.useEffect(() => {
    const certificateId = searchParams.get('certificate_id');
    const startDate = searchParams.get('start_date');
    if (certificateId && startDate) {
      fetchStaffs();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get('team_id'),
    searchParams.get('co_id'),
    searchParams.get('role_id'),
    searchParams.get('keyword'),
    searchParams.get('certificate_id'),
    sortName,
    sortOrder,
    page,
    limit,
  ]);

  const fetchStaffs = () => {
    setStaffLoading(true);
    fetchData(
      '/staffing-admin/certification/staff-certification/not-certified',
      'GET',
      { ...Object.fromEntries(searchParams), status: 'true' }
    )
      .then((res) => {
        let { records = [], count = 0 } = res?.data || {};
        setTimeout(() => {
          const newRecords = records.map((record) => ({
            ...record,
            collection_name: record.collection_operation_name,
          }));
          setStaffs(newRecords);
          setTotalStaffs(count);
          setStaffLoading(false);
        });
      })
      .catch((err) => {
        console.error(err);
        setStaffLoading(false);
      });
  };

  const handleFilter = (name, value, label = '') => {
    const searchObj = { ...Object.fromEntries(searchParams), [name]: value };
    if (label) searchObj[`${name}_label`] = label;

    setTimeout(() => {
      if (searchParams.get(name) !== value) setPage(1);
      setSearchParams(searchObj);
    });
  };

  const handleSort = (columnName) => {
    setTimeout(() => {
      setSortName(columnName);
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    });
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (assignedStaff.length) setCancel(true);
    else
      navigate(
        '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification'
      );
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchData(
        '/staffing-admin/certification/staff-certification/assign',
        'POST',
        {
          staff_ids: assignedStaff,
          certification_id: searchParams.get('certificate_id'),
          start_date: moment(new Date(searchParams.get('start_date'))),
        }
      );
      navigate(
        '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification'
      );
    } catch (err) {
      console.error(`APIError ${err.status_code}: ${err.response}`);
      toast.error('Failed to assign certificate.', { autoClose: 3000 });
    }
    setConfirmation(false);
    setLoading(false);
  };
  return (
    <Layout className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Assign Certifications'}
      />

      <Filters
        params={Object.fromEntries(searchParams)}
        handleFilter={handleFilter}
      />
      {console.log({ staffs })}
      <div className="mainContentInner">
        <TableList
          isLoading={staffLoading}
          data={staffs}
          headers={tableHeaders}
          handleSort={handleSort}
          checkboxValues={assignedStaff}
          handleCheckboxValue={(row) => row.id}
          handleCheckbox={setAssignedStaff}
          enableColumnHide={true}
          showActionsLabel={false}
          setTableHeaders={setTableHeaders}
        />

        <Pagination
          limit={limit}
          setLimit={setLimit}
          currentPage={page}
          setCurrentPage={setPage}
          totalRecords={totalStaffs}
        />

        <div className="form-footer">
          <button
            className="btn btn-md btn-secondary border-0"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-md btn-primary"
            disabled={isDisabled}
            onClick={() => setConfirmation(true)}
          >
            Assign
          </button>
        </div>
      </div>

      <CancelPopUpModal
        title="Confirmation"
        message="Unsaved changes will be lost. Do you want to continue?"
        modalPopUp={cancel}
        isNavigate={true}
        setModalPopUp={setCancel}
        redirectPath={
          '/system-configuration/tenant-admin/staffing-admin/certifications/assigned-certification'
        }
      />

      <ConfirmModal
        showConfirmation={showConfirmation}
        onCancel={() => {
          setConfirmation(false);
          toast.error('Failed to assign certificate.');
        }}
        onConfirm={handleAssign}
        icon={ConfirmationIcon}
        heading={'Confirmation'}
        disabled={isDisabled}
        description={
          <>
            <p className="mb-3">
              You are assigning the{' '}
              <span className="link-text">
                {searchParams.get('certificate_id_label')}
              </span>{' '}
              to <span className="link-text">{assignedStaff.length}</span>{' '}
              records, effective on{' '}
              <span className="link-text">
                {moment(searchParams.get('start_date')).format('MM-DD-YYYY')}
              </span>
              .
            </p>
            <p>Are you sure you want to continue?</p>
          </>
        }
      />
    </Layout>
  );
}
