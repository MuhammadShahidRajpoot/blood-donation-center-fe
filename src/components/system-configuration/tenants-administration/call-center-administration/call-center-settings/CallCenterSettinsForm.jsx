import React from 'react';
import { formFieldConfig } from './CallCenterObjectsData';
import FormField from './FormField';

const CallCenterForm = ({
  edit,
  formData,
  handleInputChange,
  formValidationErrors,
  handleBlur,
  callOutComeOptions,
  selectedCallOutCome,
  selectedNACallOutCome,
}) => {
  const renderFormField = (field, sectionCode) => {
    const sectionData = formData[sectionCode];
    const fieldValue =
      field.name === 'no_answer_call_outcome'
        ? selectedNACallOutCome
        : field.name === 'busy_call_outcome'
        ? selectedCallOutCome
        : sectionData[field.name];
    return (
      <FormField
        key={field.name}
        disabled={!edit}
        value={fieldValue !== undefined ? fieldValue : ''}
        onChange={(e) => {
          const value = field?.options ? e : e.target.value;
          handleInputChange(
            sectionCode,
            field.name,
            value,
            field.type,
            field?.maxLength
          );
        }}
        onBlur={(e) => {
          e?.preventDefault();
          const value = field?.options ? 'select' : e.target.value;
          handleBlur(sectionCode, field.name, value, field.displayName);
        }}
        error={formValidationErrors?.[sectionCode]?.[field.name]}
        tooltip={field.tooltip}
        options={field.options}
        optionsData={callOutComeOptions}
        variant={field?.variant === 'phone' ? 'phone' : ''}
        {...field}
      />
    );
  };

  return (
    <div className="formGroup">
      <form>
        {formFieldConfig.map((sectionConfig) => (
          <div key={sectionConfig.sectionName} className="formGroup">
            <h5>{sectionConfig.sectionName}</h5>
            {sectionConfig?.fields?.map((field) =>
              renderFormField(field, sectionConfig.sectionCode)
            )}
          </div>
        ))}
      </form>
    </div>
  );
};

export default CallCenterForm;
