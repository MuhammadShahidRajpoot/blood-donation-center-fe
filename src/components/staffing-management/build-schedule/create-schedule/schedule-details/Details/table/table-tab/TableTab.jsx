import React, { useEffect, useState } from 'react';
import './tableTab.scss';

export const TableTab = ({
  title,
  onChange,
  defaultValue = false,
  extraComponent,
}) => {
  const [selected, setSelected] = useState(defaultValue);

  const onSelect = () => {
    onChange && onChange(true);
    setSelected(true);
  };

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  return (
    <div
      className={`tableTabWarpper ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      <div>{title}</div>
      {extraComponent ? extraComponent : undefined}
    </div>
  );
};
