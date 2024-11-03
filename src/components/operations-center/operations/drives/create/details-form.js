import React from 'react';
import { Controller } from 'react-hook-form';
import SelectDropdown from '../../../../common/selectDropdown';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import FormInput from '../../../../common/form/FormInput';
import SvgComponent from '../../../../common/SvgComponent';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';

export default function DetailsForm({
  control,
  formErrors,
  customErrors,
  setcustomErrors,
  equipment,
  setEquipment,
  singleEquipmentOption,
  certificationOptions,
  getValues,
}) {
  return (
    <div className="formGroup details">
      <h5 className="col-12 col-md-12">Details</h5>
      <div className="w-100">
        <Controller
          name="open_public"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormCheckbox
              name={field.name}
              displayName="Open to Public"
              checked={field.value}
              classes={{ root: 'mt-2 mb-4' }}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </div>
      {equipment?.map((eq, i) => {
        const eqOptions = [
          ...(singleEquipmentOption?.filter((item) => {
            const exitingItems = [];
            equipment?.map((eItem) => {
              if (eItem?.equipment?.value)
                exitingItems.push(eItem?.equipment?.value);
            });
            return !exitingItems.includes(item.value);
          }) || []),
          eq.equipment && eq.equipment,
        ].filter(Boolean);
        return (
          <React.Fragment key={'equipment' + i}>
            <div className="w-100">
              <p>Equipment</p>
            </div>
            <Controller
              name="Equipment"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    // searchable={true}
                    placeholder={'Equipment'}
                    showLabel={eq.equipment}
                    selectedValue={eq.equipment}
                    removeDivider
                    removeTheClearCross
                    onChange={(e) => {
                      // setcustomErrors((prev) => {
                      //   return {
                      //     ...prev,
                      //     equipment: '',
                      //   };
                      // });
                      setEquipment((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, equipment: e } : a
                        );
                      });
                    }}
                    handleBlur={(e) => {
                      setEquipment((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, equipment: e } : a
                        );
                      });
                    }}
                    options={eqOptions}
                    error={!eq.equipment && customErrors?.equipment}
                  />
                );
              }}
            />
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col-md-7" name="quantity">
                  <Controller
                    name={'quantity' + i}
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        name={'quantity'}
                        classes={{ root: 'w-100' }}
                        type="text"
                        displayName="Quantity"
                        min={1}
                        max={9999}
                        value={eq.quantity}
                        required={false}
                        error={
                          eq.quantity == '' &&
                          eq?.equipment?.label !== '' &&
                          customErrors?.[`quantity${i}`]
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          console.log({ inputValue });
                          const parsedValue = parseInt(inputValue, 10);
                          console.log({ parsedValue });
                          if (isNaN(parsedValue)) {
                            setEquipment((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, quantity: '' } : a
                              )
                            );
                          } else if (parsedValue <= 9999 && parsedValue > 0) {
                            setcustomErrors((prev) => ({
                              ...prev,
                              [`quantity${i}`]: '',
                            }));

                            setEquipment((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, quantity: inputValue } : a
                              )
                            );
                          } else if (parsedValue > 9999 || parsedValue < 1) {
                            setcustomErrors((prev) => ({
                              ...prev,
                              [`quantity${i}`]:
                                'Quantity should be greater than 0',
                            }));
                          }
                        }}
                      />
                    )}
                  />
                </div>
                <div className="col-md-5">
                  <p className="det-add-btn">
                    {/* {i !== 0 ? ( */}
                    <button
                      onClick={() => {
                        if (i === 0 && equipment?.length === 1) {
                          setEquipment((prev) => {
                            return prev.map((item) => ({
                              ...item,
                              equipment: {
                                ...item.equipment,
                                label: '',
                                value: '',
                              },
                              quantity: '',
                            }));
                          });
                        } else {
                          setEquipment((prev) => {
                            return prev.filter((item, ind) => ind !== i);
                          });
                        }
                      }}
                      type="button"
                    >
                      <SvgComponent name={'TagsMinusIcon'} />
                    </button>
                    {/* ) : null} */}
                    <button
                      onClick={() => {
                        setEquipment((prev) => {
                          return [...prev, { equipment: null, quantity: '' }];
                        });
                      }}
                      type="button"
                    >
                      <SvgComponent name={'PlusIcon'} />
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div className="w-100 mt-4">
        <p>Certifications</p>
      </div>
      <div className="col-12 col-md-6">
        <Controller
          name="certifications"
          control={control}
          classes={{ root: 'w-100' }}
          render={({ field }) => (
            <GlobalMultiSelect
              label="Certifications"
              data={certificationOptions || []}
              selectedOptions={field?.value || []}
              // error={formErrors?.certifications?.message}
              onChange={(e) => {
                field.onChange({
                  target: {
                    value: getValues('certifications').some(
                      (item) => item.id === e.id
                    )
                      ? getValues('certifications').filter(
                          (item) => item.id !== e.id
                        )
                      : [...getValues('certifications'), e],
                  },
                });
              }}
              onSelectAll={(data) => {
                field.onChange({
                  target: {
                    value: data,
                  },
                });
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
