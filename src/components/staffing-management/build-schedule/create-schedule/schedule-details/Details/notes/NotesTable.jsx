import React from 'react';
import '../details.scss';
import { NotesRow } from './NotesRow';

function NotesTable({ isLoading, data, onModalChange }) {
  return (
    <>
      {data?.length > 0 ? (
        <tr className="bg-white">
          <td
            className="tableTD tableHead rtd-table-header"
            style={{ width: '20%' }}
          >
            Date
          </td>
          <td
            className="tableTD tableHead rtd-table-header"
            style={{ width: '20%' }}
          >
            User
          </td>
          <td
            className="tableTD tableHead rtd-table-header"
            style={{ width: '50%' }}
          >
            Note
          </td>
          <td
            className="tableTD tableHead rtd-table-header"
            style={{ width: '10%' }}
          ></td>
        </tr>
      ) : (
        <tr>
          <td className="no-data text-sm text-center">
            {isLoading ? 'Data loading' : 'No Data Found.'}
          </td>
        </tr>
      )}
      {data?.length > 0
        ? data?.map((note) => (
            <NotesRow
              key={note?.id}
              note={note}
              onViewClick={() => onModalChange(note)}
            />
          ))
        : null}
    </>
  );
}

export default NotesTable;
