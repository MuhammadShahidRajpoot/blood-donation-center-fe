import React from 'react';
import { Controller } from 'react-hook-form';
import SelectDropdown from '../../../../../common/selectDropdown';
import styles from '../../Session.module.scss';
import ToolTip from '../../../../../common/tooltip';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { API } from '../../../../../../api/api-routes';
import { toast } from 'react-toastify';
import moment from 'moment';
import { staffSetupErrors } from '../enums';
import SvgComponent from '../../../../../common/SvgComponent';

const validateNumber = (num, outcome) => {
  if (outcome === 1) {
    return isNaN(num) ? 1 : num;
  } else {
    return isNaN(num) ? 0 : num;
  }
};

const Projection = ({
  addProjection,
  removeProjection,
  shiftFieldName,
  projectionIndex,
  watch,
  control,
  setValue,
  procedureTypesOptions,
  OEF,
  projectionIndexesLength,
  totalHoursOfShift,
  triggerOEF,
  formErrors,
  shiftIndex,
  collectionOperation,
  sessionDate,
  isOverrideUser,
  isValidEditableTime,
  bookingRules,
  setShareStaffModal,
  setStaffShareRequired,
  availableStaff,
  resourceShareData,
  setResourceShareData,
  setStaffShareValue,
  customErrors,
  setCustomErrors,
  sessionId,
  isCopy,
}) => {
  const [staffSetupOptions, setStaffSetupOptions] = React.useState([]);
  const [additionalStaffSetupOptions, setAdditionalStaffSetupOptions] =
    React.useState([]);

  const fieldName = `${shiftFieldName}.projections[${projectionIndex}]`;
  const isLoading = watch(`${fieldName}.loading`) || false;
  const staffSetup = watch(`${fieldName}.staff_setup`);
  const errorField =
    formErrors?.shifts?.[shiftIndex]?.projections?.[projectionIndex];
  const procedureType = watch(`${fieldName}.procedure`);
  const productYield = watch(`${fieldName}.product_yield`);
  const procedureTypeQty = watch(`${fieldName}.procedure_type_qty`) || 0;
  const p = parseInt(
    bookingRules?.oef_block_on_product ? productYield : procedureTypeQty
  );

  const minimumStaff = Math.floor(
    validateNumber(p, 0) /
      (totalHoursOfShift === 0 || isNaN(totalHoursOfShift)
        ? 1
        : totalHoursOfShift) /
      (OEF.maxOEF === 0 || isNaN(OEF.maxOEF) ? 1 : OEF.maxOEF)
  );

  const maximumStaff = Math.round(
    validateNumber(p, 0) /
      (totalHoursOfShift === 0 || isNaN(totalHoursOfShift)
        ? 1
        : totalHoursOfShift) /
      (OEF.minOEF === 0 || isNaN(OEF.minOEF) ? 1 : OEF.minOEF)
  );

  React.useEffect(() => {
    const fetchStaffSetupOptions = async () => {
      if (
        procedureType &&
        sessionDate &&
        collectionOperation &&
        !isNaN(minimumStaff) &&
        !isNaN(maximumStaff)
      ) {
        setCustomErrors((prevErrors) => ({
          ...prevErrors,
          [`${fieldName}.oef_range`]: '',
          [`${fieldName}.staff_setup`]: '',
        }));

        const {
          data: { data, response, status_code },
        } =
          await API.systemConfiguration.staffAdmininstration.staffSetup.getStaffSetupForSessions(
            {
              ...(sessionId && { sessions_id: sessionId }),
              sessions_date: moment(sessionDate).format('MM-DD-YYYY'),
              operation_type: 'SESSION',
              procedure_type_id: procedureType?.id,
              min_staff: minimumStaff,
              max_staff: maximumStaff,
              collection_operation_id: collectionOperation?.id,
            }
          );
        if (status_code !== 404) {
          if (!data) return;
          const { records, additionalRecords } = data;
          setAdditionalStaffSetupOptions(additionalRecords);
          setStaffSetupOptions(records);
        } else {
          if (Object.values(staffSetupErrors).includes(response)) {
            setCustomErrors((prevErrors) => ({
              ...prevErrors,
              [`${fieldName}.oef_range`]:
                response === staffSetupErrors.OEF_RANGE ? response : '',
              [`${fieldName}.staff_setup`]:
                response === staffSetupErrors.STAFF_CAPACITY ? response : '',
              collection_operation:
                response === staffSetupErrors.DAILY_CAPACITY ? response : '',
            }));
          } else {
            console.error(response);
            toast.error(response, { autoClose: 1000 });
          }
        }
      }
      setValue(`${fieldName}.staff_setup`, []);
    };

    fetchStaffSetupOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    procedureType,
    minimumStaff,
    maximumStaff,
    collectionOperation,
    sessionDate,
    setValue,
  ]);

  React.useEffect(() => {
    if (!procedureType) setValue(`${fieldName}.procedure_type_qty`, 0);
    else {
      setValue(
        `${fieldName}.product_yield`,
        procedureType?.procedure_types_products?.[0].quantity
      );
      setValue(`${fieldName}.procedure_type_qty`, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [procedureType, setValue]);

  const handleProjection = (parentName, fieldName, value, initialYield) => {
    const procedureTypeProductRatio = 1 / initialYield;
    if (fieldName === 'procedure_type_qty') {
      const newProductYield = value / procedureTypeProductRatio;
      setValue(`${parentName}.product_yield`, newProductYield);
    } else {
      const newProcedureQty = value * procedureTypeProductRatio;
      setValue(`${parentName}.procedure_type_qty`, newProcedureQty);
    }
  };

  const resetProjection = (fieldName) => {
    setValue(`${fieldName}.procedure`, null);
    setValue(`${fieldName}.procedure_type_qty`, 0);
    setValue(`${fieldName}.product_yield`, 0);
    setValue(`${fieldName}.staff_setup`, []);
  };

  const handleStaffSetupChange = (setup) => {
    let staffsetupsCopy = [...staffSetup];
    if (staffsetupsCopy.some((item) => item.id === setup.id)) {
      staffsetupsCopy = staffsetupsCopy.filter((item) => item.id !== setup.id);
      setResourceShareData(
        [...resourceShareData].filter(
          (item) => item.staff_setup_id !== setup.id
        )
      );
    } else {
      if (parseFloat(setup?.sum_staff_qty) > availableStaff) {
        setShareStaffModal(true);
        setStaffShareRequired(
          Math.round(parseFloat(setup?.sum_staff_qty) - availableStaff)
        );
        setStaffShareValue({
          value: setup,
          shiftIndex: shiftIndex,
          projectionIndex: projectionIndex,
        });
        return;
      }
      staffsetupsCopy = [...staffsetupsCopy, setup];
    }
    setValue(`${fieldName}.staff_setup`, staffsetupsCopy, {
      shouldDirty: true,
    });
    triggerOEF();
  };

  const handleStaffSetupChangeAll = (setups) => {
    if (Array.isArray(setups) && setups.length === 0) {
      const staffSetupIds = staffSetup.map((setup) => setup.id);
      setResourceShareData(
        [...resourceShareData].filter(
          (item) => !staffSetupIds.includes(item.staff_setup_id)
        )
      );
    }
    const utilization = (setups || []).reduce(
      (sum, setup) => sum + (parseFloat(setup?.sum_staff_qty) || 0),
      0
    );
    setValue(
      `${fieldName}.staff_setup`,
      utilization > availableStaff ? setups?.slice(0, 1) : setups,
      { shouldDirty: true }
    );
    triggerOEF();
  };

  return (
    <React.Fragment name={fieldName} key={fieldName}>
      <h4>Projection*</h4>
      <Controller
        name={`${fieldName}.procedure`}
        control={control}
        render={({ field }) => {
          return (
            <>
              <SelectDropdown
                disabled={
                  isValidEditableTime &&
                  (bookingRules?.third_rail_fields_projection ||
                    bookingRules?.third_rail_fields_staffing_setup)
                }
                searchable={true}
                placeholder={'Projection*'}
                showLabel={field?.value?.value}
                defaultValue={null}
                selectedValue={field?.value}
                removeDivider
                onChange={field.onChange}
                handleBlur={field.onChange}
                options={procedureTypesOptions}
                error={errorField && errorField?.procedure?.message}
              />
            </>
          );
        }}
      />
      <div className="form-field col-md-6 pro-sec">
        {!procedureType ? null : (
          <>
            <div className="row">
              <div className="col-md-6 d-flex">
                <span className="pro-label">{procedureType.label}</span>
                <Controller
                  name={`${fieldName}.procedure_type_qty`}
                  control={control}
                  render={({ field }) => (
                    <input
                      disabled={
                        isValidEditableTime &&
                        bookingRules?.third_rail_fields_staffing_setup
                      }
                      type="number"
                      min={0}
                      step={1}
                      className={styles.input}
                      defaultValue={1}
                      value={field?.value || 1}
                      onChange={(e) => {
                        handleProjection(
                          fieldName,
                          'procedure_type_qty',
                          e.target.value,
                          procedureType?.procedure_types_products?.[0].quantity
                        );
                        field?.onChange(e);
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-md-6 d-flex text-right">
                <span className="pro-label">
                  {procedureType?.procedure_types_products?.[0].products.name}
                </span>
                <Controller
                  name={`${fieldName}.product_yield`}
                  control={control}
                  render={({ field }) => (
                    <input
                      disabled={
                        isValidEditableTime &&
                        bookingRules?.third_rail_fields_staffing_setup
                      }
                      type="number"
                      className={styles.input}
                      min={0}
                      step={1}
                      defaultValue={productYield}
                      value={productYield}
                      onChange={(e) => {
                        handleProjection(
                          fieldName,
                          'product_yield',
                          e.target.value,
                          procedureType?.procedure_types_products[0].quantity
                        );
                        field?.onChange(e);
                      }}
                    />
                  )}
                />
              </div>
            </div>
            {customErrors?.[`${fieldName}.oef_range`] && (
              <div className="error">
                <p>{customErrors?.[`${fieldName}.oef_range`]}</p>
              </div>
            )}
          </>
        )}
      </div>
      <>
        <Controller
          name={`${fieldName}.staff_setup`}
          control={control}
          render={({ field }) => {
            return (
              <div className="form-field">
                <div className={`field`}>
                  <GlobalMultiSelect
                    label="Staff Setup*"
                    data={(() => {
                      const selectedSetupsIds = (staffSetup || []).map(
                        (setup) => setup.id
                      );
                      return [
                        ...staffSetupOptions.filter(
                          (option) =>
                            parseFloat(option?.sum_staff_qty) <=
                              availableStaff ||
                            selectedSetupsIds.includes(option.id)
                        ),
                        ...additionalStaffSetupOptions.filter(
                          (option) =>
                            parseFloat(option?.sum_staff_qty) >= minimumStaff &&
                            parseFloat(option?.sum_staff_qty) <= maximumStaff &&
                            parseFloat(option?.sum_staff_qty) <= availableStaff
                        ),
                      ];
                    })()}
                    selectedOptions={staffSetup || []}
                    error={
                      errorField?.staff_setup?.message ||
                      (!isLoading &&
                        procedureType &&
                        (customErrors?.[`${fieldName}.staff_setup`]
                          ? customErrors?.[`${fieldName}.staff_setup`]
                          : !availableStaff &&
                            (staffSetup || []).length === 0 &&
                            staffSetupErrors.STAFF_CAPACITY)) ||
                      ''
                    }
                    onChange={handleStaffSetupChange}
                    onSelectAll={handleStaffSetupChangeAll}
                    onBlur={() => {}}
                    isquantity={false}
                    quantity={0}
                    disabled={
                      isValidEditableTime &&
                      bookingRules?.third_rail_fields_staffing_setup
                    }
                    {...(isOverrideUser &&
                      (() => {
                        const selectedSSIds = (staffSetup || []).map(
                          (setup) => setup.id
                        );
                        const additionals = [
                          ...additionalStaffSetupOptions.filter(
                            (option) =>
                              parseFloat(option?.sum_staff_qty) <
                                minimumStaff ||
                              parseFloat(option?.sum_staff_qty) >
                                maximumStaff ||
                              selectedSSIds.includes(option.id)
                          ),
                          ...staffSetupOptions.filter(
                            (option) =>
                              parseFloat(option?.sum_staff_qty) >
                                availableStaff &&
                              !selectedSSIds.includes(option.id)
                          ),
                        ];

                        return {
                          additionlOptions: additionals.map((record) => {
                            if (
                              parseFloat(record?.sum_staff_qty) <=
                              availableStaff
                            )
                              return {
                                ...record,
                                name: record.name.replace('   (S)', ''),
                              };
                            else if (!record.name.includes('(S)'))
                              return {
                                ...record,
                                name: record.name + '   (S)',
                              };
                            return record;
                          }),
                          allowAdditionalOptions:
                            additionals?.length > 0 ? true : false,
                        };
                      })())}
                  />
                </div>
              </div>
            );
          }}
        />
        <div className="col-md-6">
          <p className="oef">
            <span className={`ms-2`}>
              <ToolTip
                text={
                  'OEF range (minimum and maximum OEF ) is fetched from industry category based on selected account from session section.'
                }
              />
            </span>
            <span className="ps-2">
              OEF requires {`${minimumStaff}-${maximumStaff}`} staff
            </span>
          </p>
          <p className="res-add-btn">
            <button onClick={() => resetProjection(fieldName)} type="button">
              <SvgComponent name={'ResetIcon'} />
            </button>
            {projectionIndexesLength > 1 && (
              <button onClick={removeProjection(projectionIndex)} type="button">
                <SvgComponent name={'TagsMinusIcon'} />
              </button>
            )}
            <button onClick={addProjection} type="button">
              <SvgComponent name={'PlusIcon'} />
            </button>
          </p>
        </div>
      </>
    </React.Fragment>
  );
};

export default Projection;
