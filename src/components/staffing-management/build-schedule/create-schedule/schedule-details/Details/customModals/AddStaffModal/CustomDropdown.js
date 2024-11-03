import React, { useState } from 'react';
import Select, { components } from 'react-select';
import css from './index.module.scss';

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="8"
        viewBox="0 0 16 8"
        fill="none"
      >
        <path
          d="M15.25 0.999999L9.03095 6.33062C8.58156 6.7158 7.91844 6.7158 7.46905 6.33062L1.25 1"
          stroke="#2D2D2E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </components.DropdownIndicator>
  );
};

const SelectDropdown = ({
  placeholder,
  name,
  options,
  selectedValue,
  onChange,
  onBlur,
  error,
  isMulti,
  styles = {},
  required = false,
  disabled = false,
  removeDivider = false,
  removeTheClearCross = false,
  removeTheCursor = false,
  searchable = false,
  showLabel = false,
  onFocus,
  customHeight,
  ref,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { root = '' } = styles;
  return (
    <div
      className={`single-select form-field position-relative ${root} ${
        searchable ? 'searchable' : ''
      }`}
    >
      <div
        className={`field`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Select
          name={name}
          isMulti={isMulti}
          isSearchable={searchable}
          classNames={{
            singleValue: (_) => selectedValue && showLabel && css.value,
          }}
          components={
            removeDivider
              ? {
                  IndicatorSeparator: () => null,
                  DropdownIndicator,
                }
              : DropdownIndicator
          }
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? '#387de5' : '#e4e4e4',
              borderWidth: state.isFocused ? 1.5 : 1,
              height: customHeight ? customHeight : 56,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 8,
              transition: 'all 0.5s ease',
              fontSize: '16px',
              width: '100%',
              backgroundColor: disabled ? '#f5f5f5' : 'unset',
              outline: 'none',
              fontFamily: 'inter !important',
              boxShadow: 'unset',
              // zIndex: '99999',
              '&:hover': {
                borderColor: '#387de5',
              },
              ...(styles?.control && styles?.control(state)),
            }),
            valueContainer: (valuestyles, state) => ({
              ...valuestyles,
              height: 45,
              ...(showLabel &&
                isMulti &&
                selectedValue?.length > 0 && { height: 35, marginTop: 9 }),
              overflow: 'auto',
              ...(styles?.valueContainer && styles?.valueContainer(state)),
            }),
            option: (optionStyle, state) => ({
              ...optionStyle,
              color: state.isSelected ? 'white' : 'black',
              fontSize: 13,
              fontFamily: 'inter !important',
              borderBottom: '2px solid #f5f5f5',
              ...(styles?.option && styles?.option(state)),
            }),
            input: (stylesInput, state) => ({
              ...stylesInput,
              padding: 0,
              color: removeTheCursor ? 'transparent' : 'black',
              paddingLeft: 6,
              margin: 0,
              fontFamily: 'inter !important',
              ...(styles?.input && styles?.input(state)),
            }),
            placeholder: (placeStyles, state) => ({
              ...placeStyles,
              color: '#a3a3a3',
              paddingLeft: 6,
              ...(styles?.placeholder && styles?.placeholder(state)),
            }),
            singleValue: (placeStyles, state) => ({
              ...placeStyles,
              color: 'black',
              paddingLeft: 6,
              ...(styles?.singleValue && styles?.singleValue(state)),
            }),
            dropdownIndicator: (dropdownstyles, state) => ({
              ...dropdownstyles,
              color:
                (state.isFocused || isHovered) && !disabled
                  ? '#387de5'
                  : '#000',
            }),
            menu: (menuStyles, state) => ({
              ...menuStyles,
              maxHeight: '200px', // Set the maximum height of the dropdown menu
            }),
            menuList: (listStyles) => ({
              ...listStyles,
              maxHeight: '200px', // Set the maximum height of the dropdown menu list
              overflowY: 'auto', // Enable vertical scrolling if needed
            }),
          }}
          {...rest}
          isClearable={removeTheClearCross ? false : true}
          placeholder={
            (!selectedValue ||
              !showLabel ||
              (isMulti && selectedValue?.length <= 0)) &&
            placeholder
          }
          required={required}
          defaultValue={selectedValue}
          value={selectedValue}
          onChange={onChange}
          options={options}
          onBlur={(event) => {
            if (onBlur) onBlur(event);
          }}
          onFocus={(event) => {
            if (onFocus) onFocus(event);
          }}
          isDisabled={disabled}
          ref={ref}
        />

        {!isMulti && selectedValue !== null && showLabel && (
          <label className={css.label}>{placeholder}</label>
        )}
        {isMulti && selectedValue?.length > 0 && showLabel ? (
          <label className={css.label} style={{ paddingBottom: '10px' }}>
            {placeholder}
          </label>
        ) : null}

        {error && (
          <div className="error">
            <div className="error">
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
      {isMulti && selectedValue?.length > 0 ? (
        <div
          className={`d-flex justify-content-center align-items-center rounded-circle position-absolute ${css.selectedNumberContainer}`}
        >
          <p className={`p-0 m-0 ${css.selectedNumber}`}>
            {selectedValue?.length}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default SelectDropdown;
