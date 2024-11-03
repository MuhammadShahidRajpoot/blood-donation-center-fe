import React from 'react';
const FormRadioButtons = (props) => {
  const {
    label,
    value,
    name,
    handleChange = (e) => {},
    colorfull,
    className,
    lableFontSize,
    disabled = false,
    checked,
  } = props;
  return (
    <div className={`form-field checkbox cc ${className}`}>
      <input
        type="radio"
        name={name}
        className="form-check-input"
        value={value}
        checked={checked}
        required
        onChange={handleChange}
        disabled={disabled}
      />
      <label
        style={{
          marginLeft: '5px',
          fontSize: lableFontSize ? lableFontSize : '16px',
        }}
        htmlFor={name}
      >
        {colorfull ? (
          <span className={`badge ${label.toLowerCase()}`}> {label} </span>
        ) : (
          <span>{label}</span>
        )}
      </label>
    </div>
  );
};
export default FormRadioButtons;
