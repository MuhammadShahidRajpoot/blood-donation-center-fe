import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../topbar/index';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './index.module.scss';
import SuccessPopUpModal from '../successModal';
import CancelModalPopUp from '../cancelModal';
import { API } from '../../../api/api-routes';
import { toast } from 'react-toastify';

const EditResults = ({ operationable_type }) => {
  const [activeResult, setActiveResult] = useState(0);
  const [closeModal, setCloseModal] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const editResultsSchema = yup.object().shape({
    appointments: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Appointments cannot be a negative value.')
      .required('Appointments is required'),
    projection: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Projection cannot be a negative value.')
      .required('Projection is required'),
    registered: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Registered cannot be a negative value.')
      .required('Registered is required'),
    performed: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Performed cannot be a negative value.')
      .required('Performed is required'),
    actual: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Actual cannot be a negative value.')
      .required('Actual is required'),
    deferrals: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Deferrals cannot be a negative value.')
      .required('Deferrals is required'),
    qns: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'QNS cannot be a negative value.')
      .required('QNS is required'),
    ftd: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'First time donors cannot be a negative value.')
      .required('First time donors is required'),
    walk_out: yup
      .number()
      .transform((value, originalValue) =>
        originalValue === '' ? undefined : value
      )
      .min(0, 'Walkout cannot be a negative value.')
      .required('Walkout is required'),
    // void: yup
    //   .number()
    //   .transform((value, originalValue) =>
    //     originalValue === '' ? undefined : value
    //   )
    //   .min(1, 'Void cannot be a negative value.')
    //   .required('Void is required'),
  });

  const {
    register,
    handleSubmit,
    // watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(editResultsSchema),
  });
  const updateSessionResult = async (data, event) => {
    try {
      const params = {
        id: 338,
        shift_id: 602,
        procedure_type_id: 202,
      };

      const response = await API.operationCenter.drives.updateSessionResult(
        data,
        params,
        operationable_type
      );

      if (response?.data?.status === 'success') {
        setModalPopUp(true);
        if (event?.target?.name === 'Save & Close') {
          setRedirect(true);
        } else {
          setRedirect(false);
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch`, { autoClose: 3000 });
    }
  };

  const handleActive = (index) => {
    setActiveResult(index);
  };
  const BreadcrumbsData = [
    {
      label: 'Edit Results',
      class: 'active-label',
    },
  ];

  const resultTabs = [
    {
      id: 1,
      title: 'WB',
    },
    {
      id: 2,
      title: 'RBC',
    },
    {
      id: 3,
      title: 'DRBC',
    },
  ];

  const calculateProjectionAccuracy = (e) => {
    const { name, value } = e.target;
    setValue(name, value, { shouldValidate: true });

    if (name === 'actual' || name === 'projection') {
      const actualValue = parseFloat(getValues('actual') || 0);
      const projectionValue = parseFloat(getValues('projection') || 0);
      const projectionAccuracy =
        projectionValue !== 0 ? (actualValue / projectionValue) * 100 : 0;
      const formattedAccuracy = projectionAccuracy.toFixed(2) + '%';
      setValue('pa', formattedAccuracy, { shouldValidate: false });
    }
  };

  return (
    <div className="mainContent">
      <TopBar
        BreadCrumbsData={BreadcrumbsData}
        BreadCrumbsTitle={'Edit Results'}
        SearchPlaceholder={null}
        SearchValue={null}
        SearchOnChange={null}
      />

      <div className="mainContentInner form-container ">
        <form className="" onSubmit={handleSubmit(updateSessionResult)}>
          <div className={styles.result_container}>
            <h5>Edit Results</h5>
            <div className={styles.result_tabs}>
              <ul>
                {resultTabs.map((result, index) => {
                  return (
                    <>
                      <div
                        className={styles.result_tabs_wrapper}
                        key={result.id}
                      >
                        <li
                          className={
                            index === activeResult ? styles.active_result : ''
                          }
                          onClick={() => handleActive(index)}
                        >
                          {result.title}
                        </li>
                      </div>
                    </>
                  );
                })}
              </ul>
            </div>

            <div className="formGroup p-0 border-0 w-auto">
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('appointments')}
                    type="number"
                    className="form-control"
                    name="appointments"
                    placeholder=" "
                    required
                  />

                  <label>Appointments</label>
                </div>
                {errors?.appointments && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.appointments?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('projection')}
                    type="number"
                    className="form-control"
                    name="projection"
                    placeholder=" "
                    required
                    onChange={calculateProjectionAccuracy}
                  />

                  <label>Projection</label>
                </div>
                {errors?.projection && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.projection?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('registered')}
                    type="number"
                    className="form-control"
                    name="registered"
                    placeholder=" "
                    required
                  />

                  <label>Registered</label>
                </div>
                {errors?.registered && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.registered?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('performed')}
                    type="number"
                    className="form-control"
                    name="performed"
                    placeholder=" "
                    required
                  />

                  <label>Performed</label>
                </div>
                {errors?.performed && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.performed?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('actual')}
                    type="number"
                    className="form-control"
                    name="actual"
                    placeholder=" "
                    required
                    onChange={calculateProjectionAccuracy}
                  />

                  <label>Actual</label>
                </div>
                {errors?.actual && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.actual?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('pa')}
                    type="text"
                    className="form-control"
                    name="pa"
                    placeholder=" "
                    required
                    disabled
                    value={getValues('pa')}
                  />

                  <label>PA</label>
                </div>
                {errors?.pa && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.pa?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('deferrals')}
                    type="number"
                    className="form-control"
                    name="deferrals"
                    placeholder=" "
                    required
                  />

                  <label>Deferrals</label>
                </div>
                {errors?.deferrals && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.deferrals?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('qns')}
                    type="number"
                    className="form-control"
                    name="qns"
                    placeholder=" "
                    required
                  />

                  <label>QNS</label>
                </div>
                {errors?.qns && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.qns?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('ftd')}
                    type="number"
                    className="form-control"
                    name="ftd"
                    placeholder=" "
                    required
                  />

                  <label>First Time Donors</label>
                </div>
                {errors?.ftd && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.ftd?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('walk_out')}
                    type="number"
                    className="form-control"
                    name="walk_out"
                    placeholder=" "
                    required
                  />

                  <label>Walkout</label>
                </div>
                {errors?.walk_out && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.walk_out?.message}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-field">
                <div className="field">
                  <input
                    {...register('void')}
                    type="number"
                    className="form-control"
                    name="void"
                    placeholder=" "
                    required
                  />

                  <label>Void</label>
                </div>
                {errors?.void && (
                  <div className="error">
                    <div className="error">
                      <p>{errors?.void?.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-footer">
            <span
              className={`btn simple-text`}
              onClick={() => {
                setCloseModal(true);
              }}
            >
              Cancel
            </span>
            <button
              name="Save & Close"
              className={`btn-md btn btn-secondary`}
              type="submit"
              onClick={handleSubmit(updateSessionResult)}
            >
              Save & Close
            </button>
            <button
              name="Save Changes"
              type="submit"
              className={`btn-md btn btn-primary `}
              onClick={handleSubmit(updateSessionResult)}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <SuccessPopUpModal
        title={'Success!'}
        message={'Resource Share Updated.'}
        modalPopUp={modalPopUp}
        setModalPopUp={setModalPopUp}
        showActionBtns={true}
        isNavigate={redirect}
        redirectPath={-1}
      />
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={-1}
      />
    </div>
  );
};

export default EditResults;
