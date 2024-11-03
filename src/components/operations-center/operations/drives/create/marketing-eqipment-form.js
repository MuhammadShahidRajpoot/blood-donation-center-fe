import React, { useEffect, useState } from 'react';
import styles from '../index.module.scss';
import SvgComponent from '../../../../common/SvgComponent';
import FormInput from '../../../../common/form/FormInput';
import { Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import SelectDropdown from '../../../../common/selectDropdown';
import FormCheckbox from '../../../../common/form/FormCheckBox';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MyTimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import dayjs from 'dayjs';
import ToolTip from '../../../../common/tooltip';

export default function MarketingEquipmentForm({
  control,
  formErrors,
  marketing,
  setMarketing,
  promotional,
  setPromotional,
  singleItemOption,
  promotionalOptions,
  setValue,
  approvals,
  customErrors,
  setCustomErrors,
  getValues,
  watch,
  editable,
}) {
  const [marketingMaxDate, setMarketingMaxDate] = useState(null);
  const [endTimeDisabled, setEndTimeDisabled] = useState(true);
  const [hasNonNullMArketing, setHasNonNullMArketing] = useState(false);
  const [hasNonNullpromotional, setHasNonNullpromotional] = useState(false);
  const marketing_start_date = watch('marketing_start_date');
  // const marketing_end_date = watch('marketing_end_date');
  const start_date = getValues()?.start_date;
  const maxDate =
    start_date && moment(start_date).isValid()
      ? moment(start_date).subtract(60, 'days').toDate()
      : null;
  useEffect(() => {
    const hasNonNullvalue = marketing.some(
      (obj) => obj.item !== null && obj.item !== ''
    );
    setHasNonNullMArketing(hasNonNullvalue);
    if (hasNonNullvalue) {
      if (approvals?.marketing_materials) {
        setValue('marketing_order_status', 'Pending Approval');
      } else if (!approvals?.marketing_materials) {
        setValue('marketing_order_status', 'Approved');
      }
    } else {
      setValue('marketing_order_status', null);
    }
  }, [marketing]);
  useEffect(() => {
    const hasNonNullvalue = promotional.some(
      (obj) => obj.item !== null && obj.item !== ''
    );
    setHasNonNullpromotional(hasNonNullvalue);
    if (hasNonNullvalue) {
      if (approvals?.promotional_items) {
        setValue('promotioanal_order_status', 'Pending Approval');
      } else if (!approvals?.promotional_items) {
        setValue('promotioanal_order_status', 'Approved');
      }
    } else {
      setValue('promotioanal_order_status', null);
    }
  }, [promotional]);
  useEffect(() => {
    setMarketingMaxDate(moment(start_date).toDate());
  }, [approvals, marketing_start_date, start_date, endTimeDisabled]);

  // useEffect(() => {
  //   if (
  //     marketing_end_date &&
  //     marketing_start_date &&
  //     moment(marketing_end_date) < moment(marketing_start_date)
  //   ) {
  //     setValue('marketing_end_date', '');
  //   }
  // }, [marketing_start_date]);

  return (
    <div className="formGroup marketing">
      <h5>Marketing</h5>
      <div className="w-100">
        <Controller
          name="online_scheduling_allowed"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormCheckbox
              labelClass={styles.bold}
              name={field.name}
              displayName="Online Scheduling"
              checked={field.value}
              classes={{ root: 'mt-2 mb-4' }}
              onChange={(e) => {
                field.onChange(e.target.checked);
                if (e.target.checked) {
                  const date = getValues('start_date');
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setDate(newDate.getDate() - 60);
                    setValue(
                      'marketing_start_date',
                      newDate < new Date() ? new Date() : newDate
                    );
                    const endDateTime = new Date();
                    endDateTime.setHours(6, 0, 0, 0);
                    setValue('marketing_end_date', date);
                    setValue('marketing_start_time', endDateTime);
                    setValue('marketing_end_time', endDateTime);
                  }
                }
              }}
            />
          )}
        />
      </div>
      <Controller
        name="marketing_start_date"
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field`}>
              <DatePicker
                dateFormat="MM-dd-yyyy"
                className="custom-datepicker effectiveDate"
                placeholderText="Start Date*"
                selected={field.value}
                error={formErrors?.marketing_start_date?.message}
                maxDate={maxDate}
                onChange={(e) => {
                  field.onChange(e);
                }}
                handleBlur={(e) => {
                  field.onChange(e);
                }}
              />
              {field?.value && (
                <label
                  className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                >
                  Start Date*
                </label>
              )}
            </div>
            {formErrors.marketing_start_date && (
              <div className="error">
                <div className="error">
                  <p>{formErrors.marketing_start_date.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name="marketing_end_date"
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field`}>
              <DatePicker
                dateFormat="MM-dd-yyyy"
                className="custom-datepicker effectiveDate"
                placeholderText="End Date*"
                selected={field?.value}
                minDate={marketing_start_date}
                disabled={!marketing_start_date}
                maxDate={marketingMaxDate}
                error={formErrors?.marketing_end_date?.message}
                onChange={(e) => {
                  field.onChange(e);
                }}
                handleBlur={(e) => {
                  field.onChange(e);
                }}
              />
              {field?.value && (
                <label
                  className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                >
                  End Date*
                </label>
              )}
            </div>
            {formErrors.marketing_end_date && (
              <div className="error">
                <div className="error">
                  <p>{formErrors.marketing_end_date.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name={`marketing_start_time`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field shiftTime`}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(field?.value)}
                  onChange={(e) => {
                    setEndTimeDisabled(false);
                    const newDate = new Date(e);
                    field.onChange(newDate);
                  }}
                  className="w-100 shift"
                  label="Start Time*"
                />
              </LocalizationProvider>
            </div>
            {formErrors?.marketing_start_time && (
              <div className="error">
                <div className="error">
                  <p>{formErrors?.marketing_start_time.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <Controller
        name={`marketing_end_time`}
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field shiftTime`}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MyTimePicker
                  classes={{ root: 'dsd' }}
                  valueType="time"
                  value={dayjs(field?.value)}
                  // disabled={!editable && endTimeDisabled}
                  onChange={(e) => {
                    const newDate = new Date(e);
                    field.onChange(newDate);
                  }}
                  handleBlur={(e) => {
                    field.onChange(e);
                  }}
                  className="w-100 shift"
                  label="End Time*"
                />
              </LocalizationProvider>
            </div>
            {formErrors?.marketing_end_time && (
              <div className="error">
                <div className="error">
                  <p>{formErrors?.marketing_end_time.message}</p>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <h4 className={styles.bold}>Marketing Materials</h4>
      <div className="col-md-12">
        <div className="row">
          <div className="col-md-6">
            <Controller
              name="instructional_information"
              control={control}
              render={({ field }) => (
                <div className="form-field w-100 mb-4">
                  <div className={`field`}>
                    <div className="form-field textarea w-100">
                      <div className="field">
                        <textarea
                          type="text"
                          className="form-control textarea pt-3"
                          placeholder="Instructional Information"
                          name="description"
                          value={field?.value}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </div>
                    </div>
                    {field?.value && (
                      <label
                        className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                      >
                        Instructional Information
                      </label>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
          <div className="col-md-6">
            <Controller
              name="donor_information"
              control={control}
              render={({ field }) => (
                <div className="form-field w-100">
                  <div className={`field`}>
                    <div className="form-field textarea w-100">
                      <div className="field">
                        <textarea
                          type="text"
                          className="form-control textarea pt-3"
                          placeholder="Donor Information"
                          name="description"
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                          value={field?.value}
                        />
                      </div>
                    </div>
                    {field?.value && (
                      <label
                        className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                      >
                        Donor Information
                      </label>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
      {/* <div className="w-100">
        <ToolTip
          text={`Please select the Marketing Materials for this blood drive.`}
          css={{ root: { marginTop: '-5px' } }}
        />
      </div> */}
      <div className="heading-group">
        <h4>Select Marketing Materials</h4>
        <ToolTip
          text={`Please select the Marketing Materials for this blood drive.`}
          css={{ root: { marginLeft: '5px', marginTop: '-4px' } }}
        />
      </div>
      {marketing?.map((mq, i) => {
        let marketingOptions = [
          ...(singleItemOption?.filter((item) => {
            const exitingItems = [];
            marketing?.map((mItem) => {
              if (mItem?.item?.value) exitingItems.push(mItem?.item?.value);
            });
            return !exitingItems.includes(item.value);
          }) || []),
          mq.item && mq.item,
        ].filter(Boolean);
        return (
          <React.Fragment key={'marketing' + i}>
            <div name="marketingItem"></div>
            <Controller
              name="Item"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    // searchable={true}
                    placeholder={'Item'}
                    showLabel={mq.item}
                    selectedValue={mq.item}
                    removeDivider
                    onChange={(e) => {
                      setCustomErrors((prev) => {
                        const { marketingItem, ...rest } = prev;
                        return rest;
                      });
                      setMarketing((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, item: e } : a
                        );
                      });
                    }}
                    handleBlur={(e) => {
                      setMarketing((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, item: e } : a
                        );
                      });
                    }}
                    options={marketingOptions}
                    error={!mq.item && customErrors?.marketingItem}
                  />
                );
              }}
            />
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-7" name="mquantity">
                  <Controller
                    name="mquantity"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        name={'mquantity'}
                        classes={{ root: 'w-100' }}
                        displayName="Quantity"
                        min={0}
                        max={9999}
                        value={mq.mquantity}
                        type="text"
                        required={false}
                        error={mq.mquantity === '' && customErrors?.mquantity}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const parsedValue = parseInt(inputValue, 10);
                          if (isNaN(parsedValue)) {
                            setMarketing((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, mquantity: '' } : a
                              )
                            );
                          } else if (parsedValue <= 9999) {
                            setCustomErrors((prev) => ({
                              ...prev,
                              mquantity: '',
                            }));

                            setMarketing((prev) =>
                              prev.map((a, index) =>
                                index === i
                                  ? { ...a, mquantity: inputValue }
                                  : a
                              )
                            );
                          } else {
                            setCustomErrors((prev) => ({
                              ...prev,
                              mquantity:
                                'Quantity should be less than or equal to 9999',
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
                        if (i === 0 && marketing?.length === 1) {
                          setMarketing((prev) => {
                            return prev.map((item) => ({
                              ...item,
                              item: null,
                              mquantity: '',
                            }));
                          });
                        } else {
                          setMarketing((prev) => {
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
                        setMarketing((prev) => {
                          return [...prev, { item: null, mquantity: '' }];
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
      <Controller
        name="order_due_date"
        control={control}
        render={({ field }) => (
          <div className="form-field">
            <div className={`field`}>
              <DatePicker
                dateFormat="MM-dd-yyyy"
                minDate={new Date()}
                className="custom-datepicker effectiveDate"
                placeholderText="Date"
                selected={field?.value}
                // error={formErrors?.order_due_date?.message}
                onChange={(e) => {
                  field.onChange(e);
                }}
                handleBlur={(e) => {
                  field.onChange(e);
                }}
              />
              {field?.value && (
                <label
                  className={`text-secondary ${styles.labelselected} ml-1 mt-1 pb-2`}
                >
                  Order Due
                </label>
              )}
            </div>
            {/* {formErrors.order_due_date && (
                <div className="error">
                  <div className="error">
                    <p>{formErrors.order_due_date.message}</p>
                  </div>
                </div>
              )} */}
          </div>
        )}
      />
      <Controller
        name="marketing_order_status"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            showLabel={true}
            displayName="Order Status"
            value={hasNonNullMArketing ? field?.value : ''}
            required={false}
            disabled={true}
          />
        )}
      />
      <div className="heading-group">
        <h4>Promotional Items</h4>
        <ToolTip
          text={`Please select the Promotional Items for this blood drive.`}
          css={{ root: { marginLeft: '5px', marginTop: '-4px' } }}
        />
      </div>
      {/* <div>
       
      </div> */}
      {promotional?.map((pq, i) => {
        let promotionalItemOptions = [
          ...(promotionalOptions?.filter((item) => {
            const exitingItems = [];
            promotional?.map((mItem) => {
              if (mItem?.item?.value) exitingItems.push(mItem?.item?.value);
            });
            return !exitingItems.includes(item.value);
          }) || []),
          pq.item && pq.item,
        ].filter(Boolean);
        return (
          <React.Fragment key={'promotional' + i}>
            <div name="promotionalItem"></div>
            <Controller
              name="Item"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    // searchable={true}
                    placeholder={'Item'}
                    showLabel={pq.item}
                    selectedValue={pq.item}
                    removeDivider
                    onChange={(e) => {
                      setCustomErrors((prev) => {
                        const { promotionalItem, ...rest } = prev;
                        return rest;
                      });
                      setPromotional((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, item: e } : a
                        );
                      });
                    }}
                    handleBlur={(e) => {
                      setPromotional((prev) => {
                        return prev.map((a, index) =>
                          index === i ? { ...a, item: e } : a
                        );
                      });
                    }}
                    options={promotionalItemOptions}
                    error={!pq.item && customErrors.promotionalItem}
                  />
                );
              }}
            />
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-7">
                  <div name="promotionalQuantity"></div>
                  <Controller
                    name="pquantity"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        name={'pquantity'}
                        min={0}
                        max={9999}
                        classes={{ root: 'w-100' }}
                        displayName="Quantity"
                        type="text"
                        value={pq.pquantity}
                        required={false}
                        error={
                          pq.pquantity === '' &&
                          customErrors.promotionalQuantity
                        }
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const parsedValue = parseInt(inputValue, 10);
                          if (isNaN(parsedValue)) {
                            setPromotional((prev) =>
                              prev.map((a, index) =>
                                index === i ? { ...a, pquantity: '' } : a
                              )
                            );
                          } else if (parsedValue <= 9999) {
                            setCustomErrors((prev) => ({
                              ...prev,
                              promotionalQuantity: '',
                            }));

                            setPromotional((prev) =>
                              prev.map((a, index) =>
                                index === i
                                  ? { ...a, pquantity: inputValue }
                                  : a
                              )
                            );
                          } else {
                            setCustomErrors((prev) => ({
                              ...prev,
                              promotionalQuantity:
                                'Quantity should be less than or equal to 9999',
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
                        if (i === 0 && promotional?.length === 1) {
                          setPromotional((prev) => {
                            return prev.map((item) => ({
                              ...item,
                              item: null,
                              pquantity: '',
                            }));
                          });
                        } else {
                          setPromotional((prev) => {
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
                        setPromotional((prev) => {
                          return [...prev, { item: null, pquantity: '' }];
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
      <Controller
        name="promotioanal_order_status"
        control={control}
        render={({ field }) => (
          <FormInput
            name={field.name}
            classes={{ root: '' }}
            displayName="Order Status"
            value={hasNonNullpromotional ? field?.value : ''}
            required={false}
            disabled={true}
          />
        )}
      />
    </div>
  );
}
