import React, { useEffect, useState } from 'react';
import styles from '../accounts.module.scss';
import { Modal } from 'react-bootstrap';
import TableList from '../../../common/tableListing/index';

export default function AddAffiliationsModal({
  setAddAffiliationsModal,
  addAffiliationsModal,
  dataRows,
  searchText,
  setSearchText,
  selectedItems,
  setSelectedItems,
  onSubmit,
}) {
  const [tempSelectedItems, setTempSelectedItems] = useState([]);

  useEffect(() => {
    setTempSelectedItems(selectedItems);
  }, [selectedItems]);

  const TableHeaders = [
    {
      name: 'name',
      label: 'Affiliation Name',
      sortable: false,
      width: '30%',
    },
    {
      name: '',
      label: '',
      width: '34%',
      sortable: false,
    },
    {
      name: '',
      label: '',
      sortable: false,
    },
  ];

  const submit = async () => {
    onSubmit(tempSelectedItems);
    setAddAffiliationsModal(false);
  };

  return (
    <Modal
      show={addAffiliationsModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="contactPopup"
    >
      <Modal.Body>
        <div className="formGroup">
          <div className="content d-flex align-items-center justify-between">
            <h3>Add Preferences</h3>
            <div className="search">
              <div className="formItem">
                <input
                  name="affiliation_name"
                  type="text"
                  placeholder="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="" style={{ height: '50vh' }}>
          <TableList
            data={dataRows}
            headers={TableHeaders}
            checkboxValues={tempSelectedItems}
            handleCheckboxValue={(row) => row.id}
            handleCheckbox={setTempSelectedItems}
          />
        </div>
        <div className="d-flex justify-content-end align-items-center w-100">
          <p
            onClick={() => {
              setAddAffiliationsModal(false);
            }}
            className={styles.btncancel}
          >
            Cancel
          </p>
          <p className={styles.btnAddContact} onClick={submit}>
            Submit
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}
