import React, { useState } from 'react';
import SvgComponent from '../../../../../../common/SvgComponent';
import { formatDate } from '../../../../../../../helpers/formatDate';

export const NotesRow = ({ note, onViewClick }) => {
  const [showView, setShowView] = useState(false);

  return (
    <tr
      onMouseOver={() => setShowView(true)}
      onMouseLeave={() => setShowView(false)}
    >
      <td
        className="tableTD col1 tabel-cells-content rtd-table-body-content-cell"
        style={{
          width: '20%',
          wordBreak: 'break-word',
        }}
      >
        {formatDate(note?.created_at, null, ',')}
      </td>
      <td
        className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
        style={{
          width: '20%',
          wordBreak: 'break-word',
        }}
      >
        {note?.created_by?.first_name + ' ' + note?.created_by?.last_name}
      </td>
      <td
        className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
        style={{
          width: '50%',
          wordBreak: 'break-word',
        }}
      >
        {note?.details.length > 50
          ? note.details.substring(0, 50) + ' ...'
          : note.details}
      </td>
      <td
        className="tableTD col2 tabel-cells-content rtd-table-body-content-cell"
        style={{
          width: '10%',
          wordBreak: 'break-word',
        }}
      >
        {showView ? (
          <span onClick={onViewClick}>
            <SvgComponent name="ViewViewIcon" />
          </span>
        ) : null}
      </td>
    </tr>
  );
};
