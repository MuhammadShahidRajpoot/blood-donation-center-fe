import React, { useEffect, useState } from 'react';
import { TableTab } from '../table-tab/TableTab';

export const TableTabGroup = ({
  tabs,
  defaultValue,
  onChange,
  tabExtraComponent,
}) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue ?? tabs[0].name);

  const onTabSelect = (tab) => {
    setSelectedTab(tab);
    onChange(tab);
  };

  useEffect(() => {
    setSelectedTab(defaultValue);
  }, [defaultValue]);

  return (
    <>
      {tabs.map((tab) => (
        <TableTab
          key={tab.name}
          title={tab.name}
          onChange={() => onTabSelect(tab.name)}
          defaultValue={selectedTab === tab.name}
          extraComponent={tab.extraComponent ?? undefined}
        />
      ))}
    </>
  );
};
