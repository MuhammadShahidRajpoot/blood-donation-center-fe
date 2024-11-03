import React, { useEffect, useMemo, useRef, useState } from 'react';
import FormInput from '../../../../../common/form/FormInput';
import SvgComponent from '../../../../../common/SvgComponent';
import { Controller } from 'react-hook-form';
import GlobalMultiSelect from '../../../../../common/GlobalMultiSelect';
import SelectDropdown from '../../../../../common/selectDropdown';
import 'rc-time-picker/assets/index.css';
import ToolTip from '../../../../../common/tooltip';
import {
  addProjections,
  handleChangeProcedureQty,
  handleChangeProductQty,
  handleChangeStaffSetup,
  handleProjectionChange,
  handleProjectionRemove,
  handleRemoveStaffSetupDonorCenter,
  removeProjection,
  resetProjections,
  selectUnselectAllShiftSetup,
} from '../../../../../operations-center/operations/drives/create/helpers/index';
import { makeAuthorizedApiRequest } from '../../../../../../helpers/Api';

const ProjectionForm = ({
  projection,
  projectionIndex,
  control,
  procedureTypesList,
  errors,
  shiftProjections,
  shiftIndex,
  setShifts,
  procedureProducts,
  minOef,
  maxOef,
  shiftHours,
  shifts,
}) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const debouncedFetch = useRef(null);
  const [staffSetupOptions, setStaffSetupOptions] = useState([]);
  const [minStaff, setMinStaff] = useState(0);
  const [maxStaff, setMaxStaff] = useState(0);
  const [selectedStaffSetups, setSelectedStaffSetups] = useState([]);

  useEffect(() => {
    const selectedItems = projection.staffSetup.map((item) => item.id);
    const selected = staffSetupOptions?.additionalStaffSetups?.filter(
      (item) => {
        if (selectedItems.includes(item.id)) {
          return {
            ...selectedItems?.filter((fItem) => fItem.id == item.id),
            ...item,
          };
        }
      }
    );
    let filtered = projection?.staffSetup;
    if (selected?.length) {
      const updatedItems = selected?.map((item) => item.id);
      filtered = projection.staffSetup.filter(
        (item) => !updatedItems.includes(item.id)
      );
    }

    const updated = [...(filtered || []), ...(selected || [])];
    setSelectedStaffSetups(updated);
  }, [projection.staffSetup, staffSetupOptions]);

  useEffect(() => {
    setMinStaff(
      Math.floor(projection?.procedure?.quantity / shiftHours / maxOef)
    );
    setMaxStaff(
      Math.round(projection?.procedure?.quantity / shiftHours / minOef)
    );
  }, [projection.procedure]);

  useMemo(() => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }
    debouncedFetch.current = setTimeout(() => {
      if (projection?.procedure?.value && minStaff != 0 && maxStaff != 0)
        fetchStaffSetups();
    }, 1000);

    return () => {
      clearTimeout(debouncedFetch.current);
    };
  }, [minStaff, maxStaff]);

  // Fetch the Staff setup based on the procedure type and Location type of selected location
  const fetchStaffSetups = async () => {
    try {
      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/staffing-admin/staff-setup/blueprint/donor_center?operation_type=SESSION&procedure_type_id=${projection?.procedure?.value}&minStaff=${minStaff}&maxStaff=${maxStaff}`
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
      setStaffSetupOptions((prev) => ({
        ...prev,
        staffSetupOptions: staffOptions,
      }));
    } catch (error) {
      console.error(`Error fetching data ${error}`, {
        autoClose: 3000,
      });
    }
  };

  return (
    <React.Fragment key={'project' + projectionIndex}>
      <div className="w-100">
        <p>Projection*</p>
      </div>
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

      <Controller
        name="Staff_setup"
        control={control}
        render={({ field }) => {
          return (
            <div className="form-field">
              <div className={`field`}>
                <GlobalMultiSelect
                  data={staffSetupOptions?.staffSetupOptions || []}
                  selectedOptions={selectedStaffSetups}
                  onChange={(e) => {
                    const currentState = projection?.staffSetup;
                    const exists = currentState?.filter(
                      (item) => item.id === e.id
                    );
                    if (exists.length) {
                      handleRemoveStaffSetupDonorCenter(
                        e,
                        shiftIndex,
                        projectionIndex,
                        setShifts,
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
                  error={errors?.projection?.[projectionIndex]?.staff_setup}
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
