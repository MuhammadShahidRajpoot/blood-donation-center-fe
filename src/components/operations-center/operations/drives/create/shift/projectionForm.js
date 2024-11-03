import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import SelectDropdown from '../../../../../common/selectDropdown';
import {
  addProjections,
  handleChangeProcedureQty,
  handleChangeProductQty,
  handleChangeStaffSetup,
  handleProjectionChange,
  handleProjectionRemove,
  handleRemoveStaffSetup,
  removeProjection,
  resetProjections,
  selectUnselectAllShiftSetup,
} from '../helpers';
import FormInput from '../../../../../common/form/FormInput';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';
import SvgComponent from '../../../../../common/SvgComponent';
import ToolTip from '../../../../../common/tooltip';

const ProjectionForm = ({
  shiftIndex,
  projection,
  projectionIndex,
  control,
  procedureTypesList,
  errors,
  shiftProjections,
  setShifts,
  procedureProducts,
  isOverrideUser,
  minOef,
  maxOef,
  shiftHours,
  location_type,
  collectionOperationId,
  driveDate,
  availableStaff,
  resourceShareData,
  setResourceShareData,
  setStaffShareValue,
  setShareStaffModal,
  setStaffShareRequired,
  shifts,
  utilizedStaff,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const debouncedFetch = useRef(null);
  const [staffSetupOptions, setStaffSetupOptions] = useState([]);
  const [minStaff, setMinStaff] = useState(0);
  const [maxStaff, setMaxStaff] = useState(0);
  const [selectedStaffSetups, setSelectedStaffSetups] = useState([]);

  useEffect(() => {
    // console.log(projection.staffSetup);
    const selectedItems = projection.staffSetup.map((item) => item.id);
    // console.log({ selectedItems });
    // console.log(staffSetupOptions);
    const selected = staffSetupOptions?.additionalStaffSetups?.filter(
      (item) => {
        // console.log({ item });
        if (selectedItems.includes(item.id)) {
          return {
            ...selectedItems?.filter((fItem) => fItem.id == item.id),
            ...item,
          };
        }
      }
    );
    let filtered = projection.staffSetup;
    if (selected?.length) {
      const updatedItems = selected?.map((item) => item.id);
      filtered = projection.staffSetup.filter(
        (item) => !updatedItems.includes(item.id)
      );
    }
    // console.log({
    //   selected,
    // });
    const updated = [...(filtered || []), ...(selected || [])];
    // console.log({ updated });
    setSelectedStaffSetups(updated);
  }, [projection.staffSetup, staffSetupOptions]);

  useEffect(() => {
    const isZero = (value) => {
      return value === 0 ? 1 : value;
    };

    setMinStaff(
      Math.floor(
        projection?.procedure?.quantity / isZero(shiftHours) / isZero(maxOef)
      )
    );
    setMaxStaff(
      Math.round(
        projection?.procedure?.quantity / isZero(shiftHours) / isZero(minOef)
      )
    );
  }, [projection.procedure]);

  useMemo(() => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }
    debouncedFetch.current = setTimeout(() => {
      if (
        location_type &&
        projection?.procedure?.value &&
        minStaff != 0 &&
        maxStaff != 0 &&
        collectionOperationId &&
        driveDate
      )
        fetchStaffSetups();
    }, 1000);

    return () => {
      clearTimeout(debouncedFetch.current);
    };
  }, [minStaff, maxStaff, driveDate, collectionOperationId, location_type]);

  // Fetch the Staff setup based on the procedure type and Location type of selected location
  const fetchStaffSetups = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-admin/staff-setup/drive?location_type=${location_type}&operation_type=DRIVE&procedure_type_id=${projection?.procedure?.value}&minStaff=${minStaff}&maxStaff=${maxStaff}&collectionOperation=${collectionOperationId}&drive_date=${driveDate}`
      );
      const data = await response.json();

      const staffOptions = data?.data?.map((item) => {
        return {
          name: item.name,
          id: item.id,
          qty: item.sumstaffqty,
          beds: item.beds,
          concurrent_beds: item.concurrent_beds,
          stagger: item.stagger_slots,
        };
      });
      const additionalStaffSetups = data?.additionalStaffSetups?.map((item) => {
        return {
          name:
            parseInt(item.sumstaffqty) > availableStaff ||
            parseInt(item.sumstaffqty) < minStaff
              ? item.name + '   (S)'
              : item.name,
          id: item.id,
          qty: item.sumstaffqty,
          beds: item.beds,
          concurrent_beds: item.concurrent_beds,
          stagger: item.stagger_slots,
        };
      });
      setStaffSetupOptions((prev) => ({
        ...prev,
        staffSetupOptions: staffOptions,
        additionalStaffSetups: additionalStaffSetups,
      }));
    } catch (error) {
      console.error(`Error fetching data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  return (
    <React.Fragment key={'project' + projectionIndex}>
      <h4>Projection*</h4>
      <Controller
        name="Projection"
        control={control}
        render={({ field }) => {
          return (
            <SelectDropdown
              placeholder={'Projection*'}
              displa
              showLabel={projection?.projection?.value || false}
              defaultValue={projection.projection}
              selectedValue={
                Object.values(projection.projection).length > 0
                  ? projection.projection
                  : null
              }
              removeDivider
              onChange={(e) => {
                e?.value
                  ? handleProjectionChange(
                      e,
                      shiftIndex,
                      projectionIndex,
                      setShifts,
                      procedureProducts[e.value]
                    )
                  : handleProjectionRemove(
                      shiftIndex,
                      projectionIndex,
                      setShifts
                    );
              }}
              handleBlur={(e) => {
                field.onChange(e);
              }}
              options={procedureTypesList?.filter((item) => {
                const exitingItems = [];
                shiftProjections?.map((pItem) => {
                  if (pItem?.procedure?.value)
                    exitingItems.push(pItem?.procedure?.value);
                });
                return !exitingItems.includes(item.value);
              })}
              error={errors?.projections?.[projectionIndex]?.projection}
            />
          );
        }}
      />
      <div className="col-md-6 pro-sec">
        {projection?.projection?.label && (
          <div className="row">
            <div className="col-md-6 d-flex">
              <span className="pro-label">{projection.procedure.label}</span>
              <Controller
                name={`shift_projections_procedure_${projectionIndex}`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    value={projection.procedure.quantity}
                    name={field.name}
                    classes={{ root: '' }}
                    required={false}
                    onChange={(e) => {
                      handleChangeProcedureQty(
                        e,
                        shiftIndex,
                        projectionIndex,
                        setShifts
                      );
                    }}
                  />
                )}
              />
            </div>
            <div className="col-md-6 d-flex text-right">
              <span className="pro-label">{projection.product.name}</span>
              <Controller
                name={`shift_projections_product_${projectionIndex}`}
                control={control}
                render={({ field }) => (
                  <FormInput
                    value={projection.product.quantity}
                    name={field.name}
                    classes={{ root: '' }}
                    required={false}
                    onChange={(e) => {
                      handleChangeProductQty(
                        e,
                        shiftIndex,
                        projectionIndex,
                        setShifts
                      );
                    }}
                  />
                )}
              />
            </div>
          </div>
        )}
      </div>
      {isOverrideUser && (
        <Controller
          name="Staff_setup"
          control={control}
          render={({ field }) => {
            return (
              <div className="form-field">
                <div className={`field`}>
                  <GlobalMultiSelect
                    data={staffSetupOptions?.staffSetupOptions}
                    selectedOptions={selectedStaffSetups}
                    // error={''}
                    onChange={(e) => {
                      const currentState = projection?.staffSetup;
                      const exists = currentState?.filter(
                        (item) => item.id === e.id
                      );
                      if (exists?.length) {
                        handleRemoveStaffSetup(
                          e,
                          shiftIndex,
                          projectionIndex,
                          setShifts,
                          resourceShareData,
                          setResourceShareData,
                          shifts
                        );
                      } else {
                        if (
                          parseInt(e.qty) > availableStaff ||
                          parseInt(e.qty) < minStaff
                        ) {
                          setStaffShareValue({
                            value: e,
                            shiftIndex: shiftIndex,
                            peorjectionIndex: projectionIndex,
                          });
                          console.log({ e });
                          setShareStaffModal(true);
                          setStaffShareRequired(
                            Math.round(parseInt(e.qty) - availableStaff)
                          );
                        } else {
                          handleChangeStaffSetup(
                            e,
                            shiftIndex,
                            projectionIndex,
                            setShifts,
                            shifts
                          );
                        }
                      }
                    }}
                    onSelectAll={(e) => {
                      selectUnselectAllShiftSetup(
                        shiftIndex,
                        projectionIndex,
                        projection?.staffSetup?.length ===
                          staffSetupOptions?.staffSetupOptions.length,
                        staffSetupOptions?.staffSetupOptions || [],
                        setShifts
                      );
                    }}
                    additionlOptions={
                      staffSetupOptions?.additionalStaffSetups || []
                    }
                    allowAdditionalOptions={
                      staffSetupOptions?.additionalStaffSetups?.length > 0
                        ? true
                        : false
                    }
                    additionlOptionsToggleOnText={'Show All'} // optional, default value: Show All
                    additionlOptionsToggleOffText={'Hide'} // optional, default value: Hide
                    label={'Staff Setup*'}
                    isquantity={false}
                    quantity={0}
                    disabled={false}
                    error={errors?.projections?.[projectionIndex]?.staff_setup}
                  />
                </div>
              </div>
            );
          }}
        />
      )}
      {!isOverrideUser && (
        <Controller
          name="Staff_setup"
          control={control}
          render={({ field }) => {
            return (
              <div className="form-field">
                <div className={`field`}>
                  <GlobalMultiSelect
                    data={staffSetupOptions?.staffSetupOptions || []}
                    selectedOptions={projection.staffSetup}
                    error={errors?.projections?.[projectionIndex]?.staff_setup}
                    onChange={(e) => {
                      const currentState = projection?.staffSetup;
                      const exists = currentState?.filter(
                        (item) => item.id === e.id
                      );
                      if (exists.length) {
                        handleRemoveStaffSetup(
                          e,
                          shiftIndex,
                          projectionIndex,
                          setShifts,
                          resourceShareData,
                          setResourceShareData,
                          shifts
                        );
                      } else {
                        handleChangeStaffSetup(
                          e,
                          shiftIndex,
                          projectionIndex,
                          setShifts,
                          shifts
                        );
                      }
                    }}
                    onSelectAll={(e) => {
                      selectUnselectAllShiftSetup(
                        shiftIndex,
                        projectionIndex,
                        projection?.staffSetup?.length ===
                          staffSetupOptions?.staffSetupOptions.length,
                        staffSetupOptions?.staffSetupOptions || [],
                        setShifts
                      );
                    }}
                    label={'Staff Setup*'}
                    isquantity={false}
                    quantity={0}
                    disabled={false}
                  />
                </div>
              </div>
            );
          }}
        />
      )}
      <div className="col-md-6">
        <p className="oef">
          <span className={`ms-2`}>
            <ToolTip
              text={
                'OEF range (minimum and maximum OEF ) is fetched from industry category based on selected account from drive section.'
              }
            />
          </span>
          <span className="ps-2">
            OEF requires {!isNaN(minStaff) ? minStaff : 0}-{' '}
            {!isNaN(maxStaff) ? maxStaff : 0} staff
          </span>
        </p>
        <p className="res-add-btn">
          <button
            onClick={() => {
              resetProjections(
                shiftIndex,
                projectionIndex,
                shifts,
                setShifts,
                setStaffSetupOptions
              );
            }}
            type="button"
          >
            <SvgComponent name={'ResetIcon'} />
          </button>
          {shiftProjections?.length > 1 && (
            <button
              onClick={() => {
                removeProjection(
                  shiftIndex,
                  projectionIndex,
                  shifts,
                  setShifts
                );
              }}
              type="button"
            >
              <SvgComponent name={'TagsMinusIcon'} />
            </button>
          )}
          <button
            onClick={() => {
              addProjections(shiftIndex, setShifts);
            }}
            type="button"
          >
            <SvgComponent name={'PlusIcon'} />
          </button>
        </p>
      </div>
    </React.Fragment>
  );
};

export default ProjectionForm;
