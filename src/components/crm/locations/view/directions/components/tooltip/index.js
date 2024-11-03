import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import SvgComponent from '../../../../../../common/SvgComponent';

const ToolTip = ({
  text,
  onClick,
  isDailyCapacity = false,
  bottom = false,
  staffSetupTooltip = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [additionalStyles, setAdditionalStyles] = useState(false);
  const [additionalBottomStyles, setAdditionalBottomStyles] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('click', handleClickOutside);
    }
    setAdditionalStyles(isDailyCapacity);
    setAdditionalBottomStyles(bottom);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const tooltipTextClasses = classNames(
    staffSetupTooltip ? styles.staffSetupTooltipText : styles.tooltipText,

    {
      [styles.showTooltip]: additionalStyles,
      [styles.tooltipTextDown]: additionalBottomStyles,
    }
  );
  return (
    <div
      className={
        staffSetupTooltip
          ? styles.staffSetupTooltipContainer
          : styles.tooltipContainer
      }
    >
      <span>
        <span
          ref={tooltipRef}
          onMouseEnter={toggleTooltip}
          onMouseLeave={toggleTooltip}
          className={styles.icon}
        >
          <SvgComponent name={'RefreshIcon'} />
        </span>
        <span
          className="ps-2 pointer"
          style={{
            fontSize: '14px',
            color: '#387DE5',
            alignItems: 'center',
          }}
          onClick={onClick}
        >
          Refresh
        </span>
      </span>
      {showTooltip && (
        <span
          onMouseEnter={toggleTooltip}
          onMouseLeave={toggleTooltip}
          className={tooltipTextClasses}
        >
          {text}
          <span className={styles.before} />
        </span>
      )}
    </div>
  );
};

export default ToolTip;
