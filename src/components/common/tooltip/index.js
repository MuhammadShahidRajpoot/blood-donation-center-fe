import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import SvgComponent from '../SvgComponent';

const ToolTip = ({
  text,
  isDailyCapacity = false,
  bottom = false,
  staffSetupTooltip = false,
  icon = null,
  css = {},
  onTooltipClick = false,
  calendarIcon = false,
  text1 = null,
  text2 = null,
  text3 = null,
  nceTooltip = false,
  childeren = null,
  childerenButtonText = null,
  isOperationListTooltip = false,
  children = null,
  boxCss = {},
  showInBottom = false,
  // CalendarMoveDownIcon,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [additionalStyles, setAdditionalStyles] = useState(false);
  const [additionalBottomStyles, setAdditionalBottomStyles] = useState(false);
  const [operationListRightTooltipStyles, setOperationListRightTooltipStyles] =
    useState(false);
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
    setOperationListRightTooltipStyles(isOperationListTooltip);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  const tooltipTextClasses = classNames(
    staffSetupTooltip
      ? styles.staffSetupTooltipText
      : isOperationListTooltip
      ? styles.operationListTooltipText
      : styles.tooltipText,
    {
      [styles.showTooltip]: additionalStyles || operationListRightTooltipStyles,
      [styles.tooltipTextDown]: additionalBottomStyles,
    }
  );

  return (
    <>
      {children ? (
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={styles.tooltipContainer}
        >
          {showTooltip && (
            <div
              onClick={toggleTooltip}
              className={`${styles.tooltipText} ${
                showInBottom ? styles.tooltipTextDown : ''
              } ${styles.zindex1}`}
              style={boxCss}
            >
              <span>{text}</span>
              <span className={styles.before} />
            </div>
          )}
          {children}
        </div>
      ) : (
        <div
          className={
            staffSetupTooltip
              ? styles.staffSetupTooltipContainer
              : isOperationListTooltip
              ? styles.operationListTooltipContainer
              : styles.tooltipContainer
          }
          style={css.root}
        >
          <span
            ref={tooltipRef}
            onClick={() => {
              if (onTooltipClick) {
                onTooltipClick(true);
              }
            }}
            className={styles.icon}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {!icon && !calendarIcon && !childeren ? (
              <SvgComponent name={'ToolTipIcon'} />
            ) : (
              icon
            )}
            {!icon && calendarIcon && childerenButtonText
              ? childerenButtonText
              : null}
            {!icon && childeren && !childerenButtonText && (
              <span style={{ color: '#555555', marginLeft: '-3px' }}>
                {childeren}
              </span>
            )}
          </span>
          {showTooltip && (
            <span
              onClick={toggleTooltip}
              className={`${tooltipTextClasses} ${styles.zindex1} ${
                nceTooltip ? styles.nceTooltip : ''
              }`}
            >
              {text}
              <span className={styles.before} />
            </span>
          )}
          {showTooltip && text1 && text2 && !text3 && !text && (
            <span
              onClick={toggleTooltip}
              className={`${tooltipTextClasses} ${styles.zindex1} ${styles.toolipDescription}`}
            >
              <p>{text1}</p>
              {text2}
              <span className={styles.before} />
            </span>
          )}
          {showTooltip && text1 && text2 && text3 && !text && (
            <span
              onClick={toggleTooltip}
              className={`${tooltipTextClasses} ${styles.zindex1} ${styles.toolipDescription}`}
            >
              <p>{text1}</p>
              <p>{text2}</p>
              <p>{text3}</p>
              <span className={styles.before} />
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default ToolTip;
