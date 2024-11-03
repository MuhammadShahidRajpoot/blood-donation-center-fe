import React from 'react';
import FormInput from '../../../../common/form/FormInput';
import SelectDropdown from '../../../../common/selectDropdown';

const FormField = ({
  name,
  type,
  min,
  displayName,
  disabled,
  value,
  onChange,
  onBlur,
  error,
  tooltip,
  optionsData,
  options,
  variant,
  showLabel = false,
}) => {
  const exceptThisSymbols = ['e', 'E', '+', '-', '.'];
  if (options) {
    return (
      <>
        <div name={name}></div>
        <SelectDropdown
          placeholder={`${displayName}*`}
          removeDivider
          disabled={disabled}
          required={true}
          selectedValue={value}
          options={optionsData}
          onChange={onChange}
          error={error}
          onBlur={onBlur}
          showLabel={showLabel}
        />
      </>
    );
  }

  return (
    <>
      <div name={name}></div>
      <FormInput
        name={name}
        type={type}
        id={name}
        min={min}
        displayName={displayName}
        onKeyDown={(e) =>
          exceptThisSymbols.includes(e.key) && e.preventDefault()
        }
        disabled={disabled}
        value={value}
        onChange={onChange}
        error={error}
        onBlur={onBlur}
        tooltip={tooltip}
        required={true}
        variant={variant}
      />
    </>
  );
};

export default FormField;
