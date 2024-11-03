import React, { useState } from 'react';
import NotesTable from './NotesTable.jsx';
import Pagination from '../../../../../../common/pagination/index.js';
import NoteTableFilters from './NoteTableFilters.js';
import { ViewModal } from './ViewModal.jsx';

function Notes({
  fetchNotesData,
  categories,
  rows,
  totalRecords,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  selectedOptions,
  setSelectedOptions,
  isLoading,
  setIsLoading,
}) {
  const [showViewModalData, setShowViewModalData] = useState({
    show: false,
  });

  const handleModalPopup = (row) => {
    setShowViewModalData({ show: true, title: 'Note', body: row.details });
  };

  return (
    <>
      <div style={{ position: 'absolute', top: '8px', right: '30px' }}>
        <NoteTableFilters
          fetchAllFilters={fetchNotesData}
          setIsLoading={setIsLoading}
          setSelectedOptions={setSelectedOptions}
          selectedOptions={selectedOptions}
          categories={categories}
          currentPage={currentPage}
          limit={limit}
        />
      </div>

      <NotesTable
        data={rows}
        isLoading={isLoading}
        onModalChange={handleModalPopup}
      />

      <tr>
        <td style={{ backgroundColor: '#ffffff' }} colSpan={4}>
          <Pagination
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalRecords={totalRecords}
            customWrapperStyle={{ flexDirection: 'row-reverse' }}
            showListSize={false}
          />
        </td>
      </tr>

      <ViewModal
        {...showViewModalData}
        closeButtonText={'Cancel'}
        handleClose={() => setShowViewModalData({ show: false })}
      />
    </>
  );
}

export default Notes;
