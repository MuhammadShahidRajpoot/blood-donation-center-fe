import React, { useEffect, useState } from 'react';
import ToolTip from '../../tooltip';
import styles from './tooltip.module.scss';

export const ToolTipText = ({
  toolTipText,
  title,
  color,
  onChange,
  value,
  toolTipWidth,
}) => {
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    setSelected((prevVal) => {
      onChange && onChange(!prevVal);
      return !prevVal;
    });
  };

  useEffect(() => {
    setSelected(value);
  }, [value]);

  return (
    <ToolTip text={toolTipText} boxCss={{ width: toolTipWidth }}>
      <div
        className={`${styles.smallTextContainer} ${
          selected ? styles.smallTextSelected : ''
        }`}
        onClick={handleClick}
      >
        <div className={styles.circle} style={{ backgroundColor: color }}></div>
        <div className={styles.smallFont}>{title}</div>
      </div>
    </ToolTip>
  );
};
