import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import DatePicker from '../../../../common/DatePicker';
import SelectDropdown from '../../../../common/selectDropdown';
import FormInput from '../../../../common/form/FormInput';
import GlobalMultiSelect from '../../../../common/GlobalMultiSelect';
import { API } from '../../../../../api/api-routes';
import WarningModalPopUp from '../../../../common/warningModal';
import { formEnum } from './enums';

export default function SessionForm({
  control,
  formErrors,
  donorCenterOptions,
  statusOptions,
  promotions,
  selectedPromotions,
  collectionOperation,
  sessionDate,
  startDate,
  endDate,
  setValue,
  isValidEditableTime,
  bookingRules,
  formValue,
  customErrors,
  setCustomErrors,
  isBlueprint,
  isEdit,
}) {
  const [closedDatePopup, setClosedDatePopup] = useState(false);

  useEffect(() => {
    const fetchClosedDates = async (sDate, eDate) => {
      const { data } =
        await API.systemConfiguration.operationAdministrations.calendar.closedDate.getIsClosedDate(
          {
            collection_operation_id: collectionOperation.id,
            date: sDate,
            ...(eDate && { end_date: eDate }),
          }
        );
      if (data?.closed) {
        setClosedDatePopup(true);
        isBlueprint ? setValue('end_date', '') : setValue('session_date', '');
      }
    };

    if (collectionOperation) {
      if (startDate && endDate) {
        fetchClosedDates(startDate, endDate);
      } else if (sessionDate && !startDate && !endDate) {
        fetchClosedDates(sessionDate);
      }
    }
  }, [
    sessionDate,
    collectionOperation,
    startDate,
    endDate,
    setValue,
    isBlueprint,
  ]);

  useEffect(() => {
    let error_msg = '';
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (sDate && eDate) {
      if (sDate > eDate) {
        error_msg = 'End date should be grater then start date';
      }
    }
    setCustomErrors((prevErrors) => ({
      ...prevErrors,
      end_date: error_msg,
    }));
  }, [startDate, endDate, setCustomErrors]);

  const handlePromotionChange = (promotionOption) => {
    let tempPo = [...selectedPromotions];
    tempPo = tempPo.some((item) => item.id === promotionOption.id)
      ? tempPo.filter((item) => item.id !== promotionOption.id)
      : [...tempPo, promotionOption];
    setValue('promotions', tempPo, { shouldDirty: true });
  };

  const handlePromotionChangeAll = (data) =>
    setValue('promotions', data, { shouldDirty: true });

  return (
    <div className="formGroup">
      <h5>{isEdit ? 'Edit Session' : 'Create Session'}</h5>
      {formValue !== formEnum.SESSION_BLUEPRINT ? (
        <>
          <Controller
            name="session_date"
            control={control}
            render={({ field }) => (
              <div className="form-field">
                <div className={`field position-relative`}>
                  <DatePicker
                    minDate={new Date()}
                    startDate={new Date()}
                    placeholderText="Session Date*"
                    className={'pt-3'}
                    selected={field?.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('promotions', []);
                    }}
                    handleBlur={field.onChange}
                    showLabel={field?.value}
                    isClearable={!!field?.value}
                    disabled={
                      isValidEditableTime &&
                      bookingRules?.third_rail_fields_date
                    }
                  />
                </div>
                {formErrors.session_date && (
                  <div className="error">
                    <p>{formErrors.session_date.message}</p>
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name="donor_center"
            control={control}
            render={({ field }) => {
              return (
                <SelectDropdown
                  styles={{
                    root: 'mb-0',
                    valueContainer: (_) => ({
                      height: 'unset',
                      overflow: 'unset',
                    }),
                  }}
                  searchable={true}
                  placeholder={'Donor Center*'}
                  showLabel
                  defaultValue={field?.value}
                  selectedValue={field?.value}
                  removeDivider
                  onChange={field.onChange}
                  handleBlur={field.onChange}
                  options={donorCenterOptions}
                  error={formErrors?.donor_center?.message}
                />
              );
            }}
          />
        </>
      ) : (
        <>
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <div className="form-field">
                <div className={`field position-relative`}>
                  <DatePicker
                    minDate={new Date()}
                    startDate={new Date()}
                    placeholderText="Start Date*"
                    className={'pt-3'}
                    selected={field?.value}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                    handleBlur={field.onChange}
                    showLabel={field?.value}
                    isClearable={!!field?.value}
                  />
                </div>
                {formErrors.start_date && (
                  <div className="error">
                    <div className="error">
                      <p>{formErrors.start_date.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <div className="form-field">
                <div className={`field position-relative`}>
                  <DatePicker
                    minDate={startDate}
                    startDate={new Date()}
                    placeholderText="End Date*"
                    className={'pt-3'}
                    selected={field?.value}
                    onChange={field.onChange}
                    handleBlur={field.onChange}
                    showLabel={field?.value}
                    isClearable={!!field?.value}
                  />
                </div>
                {(formErrors?.end_date || customErrors?.end_date) && (
                  <div className="error">
                    <div className="error">
                      <p>
                        {formErrors?.end_date?.message ||
                          customErrors?.end_date}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </>
      )}
      <h4>Attributes</h4>
      <div className="form-field">
        <GlobalMultiSelect
          label="Promotion"
          data={promotions}
          selectedOptions={selectedPromotions}
          error={formErrors?.promotions?.message}
          onChange={handlePromotionChange}
          onSelectAll={handlePromotionChangeAll}
          onBlur={() => {}}
        />
      </div>

      <div className="form-field">
        <div className="field">
          <FormInput
            classes={{ root: 'w-100' }}
            name={'collection_operation'}
            displayName="Collection Operation"
            value={collectionOperation?.name}
            required={false}
            disabled={true}
          />
        </div>
        {customErrors?.collection_operation && (
          <div className="error">
            <p>{customErrors?.collection_operation}</p>
          </div>
        )}
      </div>

      <Controller
        name="status"
        control={control}
        render={({ field }) => {
          return (
            <SelectDropdown
              disabled={isValidEditableTime && bookingRules?.third_rail_fields_}
              styles={{
                root: 'mb-0',
                valueContainer: (_) => ({
                  paddingTop: 0,
                  height: 'unset',
                  overflow: 'unset',
                }),
              }}
              searchable={true}
              placeholder={'Status*'}
              showLabel
              defaultValue={field?.value}
              selectedValue={field?.value}
              removeDivider
              onChange={field.onChange}
              handleBlur={field.onChange}
              options={statusOptions}
              error={formErrors?.status?.message}
              required
            />
          );
        }}
      />

      <WarningModalPopUp
        title="Warning"
        message={
          isBlueprint
            ? 'The selected date range has a closed date. Please try with another date range.'
            : `The selected date is closed. Please try with another date.`
        }
        modalPopUp={closedDatePopup}
        setModalPopUp={setClosedDatePopup}
        showActionBtns={true}
        confirmAction={() => setClosedDatePopup(false)}
      />
    </div>
  );
}
