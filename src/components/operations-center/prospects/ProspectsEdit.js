import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { makeAuthorizedApiRequest } from '../../../helpers/Api';
import { BASE_URL } from '../../../helpers/constants';
import { OPERATIONS_CENTER, OS_PROSPECTS_PATH } from '../../../routes/path';
import FormFooter from '../../common/FormFooter';
import CancelModalPopUp from '../../common/cancelModal';
import FormInput from '../../common/form/FormInput';
import FormText from '../../common/form/FormText';
import FormToggle from '../../common/form/FormToggle';
import SuccessPopUpModal from '../../common/successModal';
import TopBar from '../../common/topbar/index';
import CheckPermission from '../../../helpers/CheckPermissions';
import OcPermissions from '../../../enums/OcPermissionsEnum';

const ProspectsEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const {
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'all',
  });

  useEffect(() => {
    getEditProspect();
  }, [id]);

  const getEditProspect = async () => {
    try {
      const result = await fetch(
        `${BASE_URL}/operations-center/prospects/${id}`,
        {
          headers: {
            method: 'GET',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      const data = await result.json();
      if (data?.status !== 'success' && data?.status_code === 404) {
        toast.error(`${data?.response}`, { autoClose: 3000 });
        navigate(OS_PROSPECTS_PATH.LIST);
      }
      // const response = await axios.get(`/operations-center/prospects/${id}`);
      if (data?.data) {
        setValue('name', data?.data?.name);
        setValue('description', data?.data?.description);
        setValue('is_active', data?.data?.is_active);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const BreadcrumbsData = [
    {
      label: 'Operations Center',
      class: 'disable-label',
      link: OPERATIONS_CENTER.DASHBOARD,
    },
    {
      label: 'Prospect',
      class: 'active-label',
      link: OS_PROSPECTS_PATH.LIST,
    },
    {
      label: `${
        location.pathname.includes('duplicate')
          ? 'Duplicate Prospects'
          : 'Edit Prospect'
      }`,
      class: 'active-label',
      link: `${
        location.pathname.includes('duplicate')
          ? OS_PROSPECTS_PATH.DUPLICATE
          : OS_PROSPECTS_PATH.EDIT
      }`,
    },
  ];

  const submitHandler = async (saveAndClose) => {
    try {
      if (location.pathname.includes('duplicate')) {
        setIsLoading(true);
        navigate(OS_PROSPECTS_PATH.BUILD_SEGMENTS, {
          state: {
            name: getValues('name'),
            description: getValues('description'),
            is_active: getValues('is_active'),
            id: id,
          },
        });
        setIsLoading(false);
      } else {
        let body = {
          name: getValues('name'),
          description: getValues('description'),
          status: getValues('is_active'),
        };
        setIsLoading(true);
        const response = await makeAuthorizedApiRequest(
          'PUT',
          `${BASE_URL}/operations-center/prospects/${id}`,
          JSON.stringify(body)
        );
        let data = await response.json();
        if (data?.status === 'success') {
          if (saveAndClose) {
            setShowModel(true);
          }
        } else if (response?.status === 400) {
          toast.error(`${data?.message?.[0] ?? data?.response}`, {
            autoClose: 3000,
          });
        } else {
          toast.error(`${data?.message?.[0] ?? data?.response}`, {
            autoClose: 3000,
          });
        }

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log({ error });
      toast.error(error?.response?.data?.message?.[0]);
    }
  };

  const archieveHandle = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/operations-center/prospects/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${bearerToken}`,
          },
        }
      );
      let data = await response.json();
      if (data?.status === 'success') {
        setShowSuccessMessage(true);
      } else if (data?.status === 400) {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      } else {
        toast.error(`${data?.message?.[0] ?? data?.response}`, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mainContent ">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Prospect'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />
      <SuccessPopUpModal
        title="Success!"
        message={'Prospect is archived.'}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        isArchived={false}
        setModalPopUp={setShowSuccessMessage}
        isNavigate={true}
        redirectPath={OS_PROSPECTS_PATH.LIST}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={-1}
      />
      <SuccessPopUpModal
        title={isArchived ? 'Confirmation' : 'Success!'}
        message={
          isArchived ? 'Are you sure want to archive?' : 'Prospect updated.'
        }
        modalPopUp={showModel}
        setModalPopUp={setShowModel}
        showActionBtns={isArchived ? false : true}
        isArchived={isArchived}
        archived={archieveHandle}
        isNavigate={true}
        redirectPath={isArchived ? OS_PROSPECTS_PATH.LIST : -1}
      />
      <div className="mainContentInner form-container">
        <form>
          <div className="formGroup">
            <h5>
              {location.pathname.includes('duplicate')
                ? 'Create Prospect'
                : 'Edit Prospect'}
            </h5>

            <Controller
              name={`name`}
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <FormInput
                  name="name"
                  displayName="Prospect Name"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                  required
                  error={errors?.name?.message}
                  handleBlur={field.onBlur}
                />
              )}
            />
            <div className="w-50" />

            <Controller
              name={`description`}
              control={control}
              defaultValue={''}
              render={({ field }) => (
                <FormText
                  name="description"
                  classes={{ root: 'w-100' }}
                  displayName="Description"
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                  required
                  error={errors?.description?.message}
                  handleBlur={field.onBlur}
                />
              )}
            />
            <div className="mt-3 w-100 bg-primary" />
            <Controller
              name={`is_active`}
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <FormToggle
                  name={'is_active'}
                  displayName={`${field.value ? 'Active' : 'Inactive'}`}
                  checked={field.value}
                  classes={{ root: 'w-50' }}
                  handleChange={(e) => {
                    field.onChange(e.target.checked);
                  }}
                />
              )}
            />
          </div>
        </form>
      </div>
      {location.pathname.includes('duplicate') ? (
        <div className="form-footer">
          <button
            className="btn simple-text"
            onClick={() => setCloseModal(true)}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            className={` ${`btn btn-md btn-primary`}`}
            onClick={handleSubmit((e) => submitHandler(false))}
          >
            Build Segment
          </button>
        </div>
      ) : (
        <FormFooter
          enableArchive={CheckPermission([
            OcPermissions.OPERATIONS_CENTER.PROSPECTS.ARCHIVE,
          ])}
          enableCancel={true}
          onClickCancel={() => setCloseModal(true)}
          enableSaveChanges={true}
          enableSaveAndClose={true}
          onClickSaveChanges={handleSubmit((e) => submitHandler(false))}
          onClickSaveAndClose={handleSubmit((e) => submitHandler(true))}
          disabled={isLoading}
          onClickArchive={() => {
            setIsArchived(true);
            setShowModel(true);
          }}
        />
      )}
    </div>
  );
};

export default ProspectsEdit;

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Prospect name is required.')
    .min(2, 'Min characters allowed for Name are 2')
    .max(50, 'Max characters allowed for Name are 50'),
  description: yup
    .string()
    .required('Description is required.')
    .max(500, 'Max characters allowed for Description are 500')
    .test(
      'min-length',
      'Min characters allowed for Alternate Name are 2',
      function (value) {
        if (value && value?.length === 1) {
          return false;
        }
        return true;
      }
    ),
  is_active: yup.bool().default(true),
});
