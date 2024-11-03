/* eslint-disable */
import React from 'react';
import { Controller } from 'react-hook-form';
import SelectDropdown from './CustomDropdown';
import FormInput from './CustomFormInput';
import SvgComponent from '../../../../../../../common/SvgComponent';
import './index.module.scss';

export default function AddForm({
  control,
  formErrors,
  customErrors,
  setcustomErrors,
  getValues,
  resourceType,
  record,
  setRecord,
  singleOption,
}) {
  return (
    <div className="formGroup details addStaff">
      {record?.map((eq, i) => {
        const eqOptions = [
          ...(singleOption?.filter((item) => {
            const exitingItems = [];
            record?.map((eItem) => {
              if (eItem?.value) exitingItems.push(eItem?.value);
            });
            return !exitingItems.includes(item.value);
          }) || []),
          eq.value && eq.value,
        ].filter(Boolean);
        return (
          <React.Fragment key={'record' + i}>
            <div>
              <div className="row w-100 mb-3">
                <div className="col-6">
                  <Controller
                    name="record"
                    control={control}
                    render={({ field }) => {
                      return (
                        <SelectDropdown
                          placeholder={
                            resourceType === 'staff' ? 'Role' : 'Type'
                          }
                          // showLabel={}
                          selectedValue={eq.record}
                          removeDivider
                          removeTheClearCross
                          onChange={(e) => {
                            setcustomErrors((prev) => {
                              return {
                                ...prev,
                                record: '',
                              };
                            });
                            setRecord((prev) => {
                              return prev.map((a, index) =>
                                index === i ? { ...a, record: e } : a
                              );
                            });
                          }}
                          handleBlur={(e) => {
                            setRecord((prev) => {
                              return prev.map((a, index) =>
                                index === i ? { ...a, record: e } : a
                              );
                            });
                          }}
                          options={eqOptions}
                          error={!eq.record && customErrors?.record}
                        />
                      );
                    }}
                  />
                </div>
                <div className="col-5">
                  <Controller
                    name={'quantity'}
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        name={'quantity'}
                        classes={{
                          root: 'w-100',
                        }}
                        displayName="Quantity"
                        showLabel={'Quantity'}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value?.length > 0) {
                            field.onBlur();
                          }
                        }}
                        type="number"
                        min={0}
                        max={9999}
                        value={eq.quantity}
                        required={false}
                        error={eq.quantity == '' && customErrors?.quantity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const parsedValue = parseInt(inputValue, 10);
                          if (isNaN(parsedValue)) {
                            setRecord((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, quantity: '' } : a
                              )
                            );
                          } else if (parsedValue <= 9999) {
                            setcustomErrors((prev) => ({
                              ...prev,
                              quantity: '',
                            }));

                            setRecord((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, quantity: inputValue } : a
                              )
                            );
                          } else {
                            setcustomErrors((prev) => ({
                              ...prev,
                              quantity:
                                'Quantity should be less than or equal to 9999',
                            }));
                          }
                        }}
                        style={{
                          minHeight: '56px',
                        }}
                      />
                    )}
                  />
                </div>
                <div className="col-1">
                  <p className="det-add-btn">
                    {i !== 0 ? (
                      <button
                        onClick={() => {
                          setRecord((prev) => {
                            return prev.filter((item, ind) => ind !== i);
                          });
                        }}
                        type="button"
                      >
                        <SvgComponent name={'TagsMinusIcon'} />
                      </button>
                    ) : null}
                    {i === 0 ? (
                      <button
                        onClick={() => {
                          setRecord((prev) => {
                            return [...prev, { value: null, quantity: '' }];
                          });
                        }}
                        type="button"
                      >
                        <SvgComponent name={'PlusIcon'} />
                      </button>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
