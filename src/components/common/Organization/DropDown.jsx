import React from 'react';
import styles from './Dropdown.module.scss';
import DropdownArrow from '../../../assets/images/dropdown-arrow.svg';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ToolTip from '../tooltip';

const OrganizationalDropDown = ({
  handleClick,
  handleClear,
  labels = [],
  disabled = false,
  ...rest
}) => {
  const label = (() => {
    if (!labels.length) return '';

    const groups = Object.groupBy(
      [...labels].sort((a, b) => a.level - b.level),
      ({ level }) => level
    );
    const groupIds = groups?.[Object.keys(groups)?.[0]]?.map((gr) => gr?.id);

    for (const item of [...labels].reverse()) {
      if (groupIds.includes(item.id)) {
        return item.name + (labels.length > 1 ? '...' : '');
      }
    }
  })();

  return (
    <div className={styles.dropdown}>
      <ToolTip
        text={label ? labels.map((label) => label.name).join(', ') : ''}
        boxCss={
          label && labels.length > 1 ? { width: '100%' } : { display: 'none' }
        }
        showInBottom
      >
        <input
          type="text"
          placeholder="Organizational Level"
          value={label}
          onClick={handleClick}
          disabled={disabled}
          {...rest}
        />
      </ToolTip>
      {label ? (
        <span className={styles.clear} onClick={handleClear}>
          <FontAwesomeIcon icon={faTimes} />
        </span>
      ) : null}
      <img
        className="cursor-pointer"
        src={DropdownArrow}
        alt="arrow"
        onClick={handleClick}
      />
    </div>
  );
};

export default OrganizationalDropDown;
