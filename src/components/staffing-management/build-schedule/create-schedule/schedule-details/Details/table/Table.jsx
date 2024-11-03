import React, { useEffect, useState } from 'react';
import './table.scss';
import { TableTabGroup } from './table-tab-group/TableTabGroup';

export const Table = ({
  data,
  title,
  tabs,
  defaultTab,
  columns,
  onTabChange,
  extraHeaderComponent,
  extraTabsComponent,
}) => {
  const [selectedTab, setSelectedTab] = useState(
    defaultTab ?? tabs[0]?.name ?? ''
  );

  const [selectedRow, setSelectedRow] = useState();

  const onSelectedTabChange = (tab) => {
    onTabChange(tab);
    setSelectedTab(tab);
    setSelectedRow(undefined);
  };

  useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="tableWrapper">
      <div className="tableHeader">{title}</div>
      <div className="tabsWrapper">
        <div className="tabsContainer">
          <TableTabGroup
            tabs={tabs}
            onChange={onSelectedTabChange}
            defaultValue={selectedTab}
          />
        </div>
        {extraTabsComponent ? (
          <div className="extraTabsComponentWrapper">
            {extraTabsComponent()}
          </div>
        ) : (
          <></>
        )}
      </div>
      {extraHeaderComponent ? (
        <div className="extraHeaderComponentWrapper">
          {extraHeaderComponent()}
        </div>
      ) : (
        <></>
      )}
      <table className="table">
        <tr className="tableRow">
          {columns[selectedTab]?.map((column) => (
            <th key={column.value}>{column.title}</th>
          ))}
        </tr>
        {data?.map((row, rowIndex) => {
          return (
            <tr
              key={rowIndex}
              className="tableRow"
              onClick={() => setSelectedRow(rowIndex)}
            >
              {columns[selectedTab]?.map((column, columnIndex) => {
                return (
                  <td
                    key={`${rowIndex}x${columnIndex}`}
                    style={
                      selectedRow === rowIndex
                        ? { backgroundColor: '#d7ebfe' }
                        : {}
                    }
                  >
                    {column.renderComponent
                      ? column.renderComponent(row, selectedRow)
                      : row[column.value] + ' '}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </table>
    </div>
  );
};
