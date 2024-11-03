import React from 'react';
import { Controller } from 'react-hook-form';
import SelectDropdown from '../../../../common/selectDropdown';
import FormRadioButtons from '../../../../common/form/FormRadioButtons';
import styles from '../../drives/index.module.scss';
import sessionStyles from '../Session.module.scss';
import { formEnum } from './enums';

export default function SelectSessionForm({
  control,
  formValue,
  setFormValue,
  donorCenterOptions,
  dateOptions,
  copyDate,
  copyDonorCenter,
  setCopyDate,
  setCopyDonorCenter,
  blueprints,
  activeDays,
  setActiveDays,
  setValue,
  formFields = [
    {
      label: 'Session Blueprint',
      value: formEnum.SESSION_BLUEPRINT,
      disabled: false,
    },
    { label: 'Copy Session', value: formEnum.COPY_SESSION, disabled: false },
    { label: 'Clean Slate', value: formEnum.CLEAN_SLATE, disabled: false },
  ],
}) {
  const weekDays = [
    { label: 'M', value: 'monday' },
    { label: 'T', value: 'tuesday' },
    { label: 'W', value: 'wednesday' },
    { label: 'T', value: 'thursday' },
    { label: 'F', value: 'friday' },
    { label: 'S', value: 'saturday' },
    { label: 'S', value: 'sunday' },
  ];

  const toggleActiveDay = (day) => {
    const newActiveDays = [...activeDays];
    const dayIndex = weekDays.findIndex((weekday) => weekday.value === day);
    newActiveDays[dayIndex] = newActiveDays[dayIndex] === day ? false : day;
    setActiveDays(newActiveDays);
  };

  return (
    <div className="formGroup">
      <h5>Select Session Form</h5>
      <div className={styles.CheckboxGroup}>
        {formFields?.map((formField, index) => (
          <FormRadioButtons
            label={formField.label}
            value={formField.value}
            key={index}
            className={`${styles.formCheckBoxes} gap-2`}
            selected={formValue}
            handleChange={(e) => setFormValue(e.target.value)}
            disabled={formField.disabled}
          />
        ))}
      </div>
      <div className="w-100 d-flex justify-between flex-wrap">
        {formValue === formEnum.COPY_SESSION ? (
          <>
            <SelectDropdown
              styles={{ root: 'mb-0' }}
              searchable={true}
              placeholder={'Donor Center Name'}
              showLabel={copyDonorCenter}
              selectedValue={copyDonorCenter}
              removeDivider
              onChange={(e) => {
                setCopyDonorCenter(e);
                setCopyDate(null);
              }}
              options={donorCenterOptions}
              removeTheClearCross={true}
            />
            <SelectDropdown
              styles={{ root: 'mb-0' }}
              searchable={false}
              placeholder={'Date'}
              showLabel={copyDate}
              selectedValue={copyDate}
              removeDivider
              onChange={setCopyDate}
              options={dateOptions}
              removeTheClearCross={true}
            />
          </>
        ) : formValue === formEnum.SESSION_BLUEPRINT ? (
          <>
            <Controller
              name="donor_center"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    searchable={true}
                    placeholder={'Donor Center Name'}
                    showLabel={field?.value?.value}
                    removeTheClearCross={true}
                    defaultValue={field?.value}
                    selectedValue={field?.value}
                    removeDivider
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('blueprint_name', null);
                      setActiveDays([]);
                    }}
                    handleBlur={field.onChange}
                    options={donorCenterOptions}
                  />
                );
              }}
            />
            <Controller
              name="blueprint_name"
              control={control}
              render={({ field }) => {
                return (
                  <SelectDropdown
                    searchable={true}
                    placeholder={'Blueprint Name'}
                    showLabel={field?.value?.value}
                    removeTheClearCross={true}
                    defaultValue={field?.value}
                    selectedValue={field?.value}
                    removeDivider
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('blueprint_id', e.value);
                    }}
                    handleBlur={field.onChange}
                    options={blueprints}
                  />
                );
              }}
            />
            <div className={styles.sessionDays}>
              <p>Blueprint Applies To*</p>
              <div className="d-flex gap-2">
                {weekDays.map((day) => (
                  <div
                    className={`${sessionStyles.weekBadge} ${
                      activeDays.includes(day.value) && sessionStyles.active
                    }`}
                    onClick={() => toggleActiveDay(day.value)}
                    id={day.value}
                    key={day.value}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
