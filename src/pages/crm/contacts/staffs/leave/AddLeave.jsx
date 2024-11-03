import React from 'react';
import Layout from '../../../../../components/common/layout';
import TopBar from '../../../../../components/common/topbar/index';
import FormInput from '../../../../../components/common/form/FormInput';
import FormText from '../../../../../components/common/form/FormText';
import SelectDropdown from '../../../../../components/common/selectDropdown';
import CancelModalPopUp from '../../../../../components/common/cancelModal';
import SuccessPopUpModal from '../../../../../components/common/successModal';
import styles from './index.module.scss';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../../../../../helpers/Api';
import { removeTZ } from '../../../../../helpers/convertDateTimeToTimezone';
import { toast } from 'react-toastify';
import { StaffBreadCrumbsData } from '../../../../../components/crm/contacts/staffs/StaffBreadCrumbsData';
import { useState, useEffect } from 'react';
import axios from 'axios';

const schema = yup
  .object({
    begin_date: yup.string().required('Begin Date is required.'),
    end_date: yup.string().required('End Date is required.'),
    type: yup.string().required('Type is required.'),
    hours: yup
      .number()
      .min(1)
      .max(999)
      .typeError('Hours must be a number')
      .required('Hours is required.'),
    note: yup.string().max(500).required('Note is required.'),
  })
  .required();

export default function CreateCertification() {
  const params = useParams();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [changesMade, setChangesMade] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [type, setType] = React.useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const {
    watch,
    setError,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      //add default form values here
    },
  });

  const beginDate = watch('begin_date');
  const endDate = watch('end_date');

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          BASE_URL + `/staffing-admin/leave-type/`,
          {
            params,
          }
        );
        const data = await response;
        const typeOptions = data.data.data
          .filter((item) => item.status === true)
          .map((item) => ({
            label: item.name,
            value: { id: item.id, name: item.name },
          }));
        setLeaveTypes(typeOptions);
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchData();
  }, []);

  const currentDate = new Date();

  const BreadcrumbsData = [
    ...StaffBreadCrumbsData,
    {
      label: 'View Staff',
      class: 'disable-label',
      link: `/crm/contacts/staff/${params?.staffId}/view`,
    },
    {
      label: 'Leave',
      class: 'disable-label',
      link: `/crm/contacts/staff/${params?.staffId}/view/leave`,
    },
    {
      label: 'Add Leave',
      class: 'active-label',
      link: `/crm/contacts/staff/${params?.staffId}/view/leave/create`,
    },
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const startDate = removeTZ(data.begin_date).toISOString();
      const endDate = removeTZ(data.end_date).toISOString();
      const selectedLeaveType = leaveTypes.find(
        (leaveType) => leaveType.label === data.type
      );
      const url = '/staff-leave/create';
      const payload = {
        ...data,
        staff_id: params?.staffId,
        begin_date: startDate,
        end_date: endDate,
        type_id: selectedLeaveType.value.id,
      };
      await fetchData(url, 'POST', payload);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error(error);
      toast.error(error?.response, { autoClose: 3000 });
    }
    setLoading(false);
  };

  const handleChange = (field, e) => {
    const { name, value } = e.target;
    field.onChange({ target: { name, value } });
    setChangesMade(true);
  };

  const handleCancel = () => {
    if (changesMade) setShowCancelModal(true);
    else navigate(`/crm/contacts/staff/${params?.staffId}/view/leave`);
  };

  return (
    <Layout>
      <div className="mainContent">
        <TopBar
          className={styles.topBar}
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Leave'}
        />
        <div className="mainContentInner form-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="formGroup">
              <h5>Add Leave</h5>

              <div className="d-flex w-100 gap-3">
                <Controller
                  name="begin_date"
                  control={control}
                  render={({ field }) => (
                    <div className="form-field w-100">
                      <div className={styles.fieldDate}>
                        <DatePicker
                          autoComplete="off"
                          name={field.name}
                          dateFormat="MM/dd/yyyy"
                          className="custom-datepicker form-control"
                          placeholderText="Begin Date"
                          selected={field.value}
                          minDate={currentDate}
                          maxDate={endDate}
                          onChange={(date) => {
                            field.onChange({ target: { value: date } });
                          }}
                        />
                        {field.value && <label>Begin Date</label>}
                      </div>
                      {errors?.begin_date?.message && (
                        <div className="error">
                          <p>{errors?.begin_date?.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <div className="form-field w-100">
                      <div className={styles.fieldDate}>
                        <DatePicker
                          autoComplete="off"
                          name={field.name}
                          dateFormat="MM/dd/yyyy"
                          className="custom-datepicker form-control"
                          placeholderText="End Date"
                          selected={field.value}
                          minDate={beginDate || currentDate}
                          onChange={(date) => {
                            field.onChange({ target: { value: date } });
                          }}
                        />
                        {field.value && <label>End Date</label>}
                      </div>
                      {errors?.end_date?.message && (
                        <div className="error">
                          <p>{errors?.end_date?.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className="d-flex w-100 gap-3">
                <SelectDropdown
                  placeholder="Type"
                  options={leaveTypes}
                  selectedValue={type}
                  onChange={(option) => {
                    setType(option);
                    setValue('type', option?.value.name || null);
                  }}
                  onBlur={() => setError('type')}
                  error={errors?.type?.message}
                  showLabel
                  removeDivider
                />
                <Controller
                  name="hours"
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      type="number"
                      placeholder="Hours"
                      className="pt-2"
                      classes={{ root: styles.field }}
                      name={field.name}
                      onChange={(e) => handleChange(field, e)}
                      value={field.value}
                      min={0}
                      step={0.0001}
                      required={false}
                      error={errors?.hours?.message}
                      icon={<FontAwesomeIcon icon={faClock} />}
                    />
                  )}
                />
              </div>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <FormText
                    name={field.name}
                    placeholder="Note"
                    classes={{ root: `w-100 ${styles.field}` }}
                    onChange={(e) => handleChange(field, e)}
                    value={field.value}
                    required={false}
                    error={errors?.note?.message}
                  />
                )}
              />
            </div>

            <div className="form-footer">
              <button
                className="btn simple-text"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-md btn-primary"
                disabled={isLoading}
              >
                Create
              </button>
            </div>
          </form>
        </div>

        <CancelModalPopUp
          title="Confirmation"
          message={'Unsaved changes will be lost. Do you want to continue?'}
          modalPopUp={showCancelModal}
          setModalPopUp={setShowCancelModal}
          showActionBtns={false}
          isNavigate={true}
          redirectPath={`/crm/contacts/staff/${params?.staffId}/view/leave`}
        />

        <SuccessPopUpModal
          title="Success!"
          message={'Staff Leave Defined'}
          modalPopUp={showSuccessMessage}
          isNavigate={true}
          redirectPath={`/crm/contacts/staff/${params?.staffId}/view/leave`}
          showActionBtns={true}
          isArchived={false}
          setModalPopUp={setShowSuccessMessage}
        />
      </div>
    </Layout>
  );
}
