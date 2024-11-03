import React, { useState } from 'react';
import { ToolTipText } from './ToolTipText';

export const ToolTipTextGroup = ({
  data,
  value,
  onChange,
  multiSelect = false,
}) => {
  const [selected, setSelected] = useState(value ?? []);

  const handleChange = (item) => (value) => {
    setSelected((oldVal) => {
      if (value) {
        if (multiSelect) {
          oldVal.push(item);
        } else {
          oldVal = [item];
        }
      } else {
        const index = oldVal.findIndex((val) => val.title === item.title);
        if (index > -1) {
          oldVal.splice(index, 1);
        }
      }
      onChange && onChange(oldVal);
      return oldVal;
    });
  };

  return (
    <>
      {data.map((item) => (
        <ToolTipText
          key={item.title}
          {...item}
          value={selected.findIndex((val) => val.title === item.title) !== -1}
          onChange={handleChange(item)}
        />
      ))}
    </>
  );
};
