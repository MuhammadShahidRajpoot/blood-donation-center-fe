import React, { useEffect, useState } from 'react';
import TableList from '../../../../common/tableListing';
import { Modal } from 'react-bootstrap';
import TopBar from '../../../../common/topbar/index';
import styles from './link.module.scss';
// import stylesIn from './index.module.scss';

function LinkVehiclesmodel({
  setModal,
  modal,
  selectedItems,
  shareStaffData,
  selectedLinkDrive,
  setSelectedLinkDrive,
}) {
  console.log({ shareStaffData });
  const [tempSelectedItems, setTempSelectedItems] = useState([]);
  const showAllCheckBoxListing = false;
  useEffect(() => {
    setTempSelectedItems(selectedItems);
    setSelectedLinkDrive(selectedItems);
  }, [selectedItems]);

  console.log({ selectedLinkDrive });
  const TableHeaders = [
    {
      name: 'date',
      label: 'Date',
      sortable: false,
    },
    {
      name: 'account',
      label: 'Account',
      sortable: false,
    },
    {
      name: 'location',
      label: 'Location',
      sortable: false,
    },
    {
      name: 'total_time',
      label: 'Start time - End time',
      sortable: false,
    },

    {
      name: 'vehicles_name',
      label: 'Vehicles',
      sortable: false,
    },
    {
      name: 'staffSetup',
      label: 'Staff Setup',
      sortable: false,
    },
  ];

  const submitSelection = async () => {
    setSelectedLinkDrive(null);
    setTempSelectedItems([]);
    setSelectedLinkDrive(tempSelectedItems);
    setModal(false);
  };

  return (
    <Modal
      show={modal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        <div className="formGroup">
          <TopBar
            BreadCrumbsData={[]}
            BreadCrumbsTitle={`Link Drive`}
            // SearchValue={searchText}
            // SearchOnChange={(e) => {
            //   setSearchText(e.target.value);
            // }}
            // SearchPlaceholder={'Search Staff'}
          />

          <div className="mt-4 overflow-y-auto" style={{ height: '50vh' }}>
            <TableList
              data={shareStaffData}
              headers={TableHeaders}
              checkboxValue={shareStaffData}
              checkboxValues={tempSelectedItems}
              handleCheckboxValue={(row) => row.id}
              handleCheckbox={setTempSelectedItems}
              showAllCheckBoxListing={showAllCheckBoxListing}
              showAllRadioButtonListing={true}
              selectSingle={true}
            />
          </div>
          <div className="d-flex justify-content-end align-items-center w-100">
            <p
              onClick={() => {
                setModal(false);
              }}
              className={styles.btncancel}
            >
              Cancel
            </p>
            <p className={styles.btnAddContact} onClick={submitSelection}>
              Save
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default LinkVehiclesmodel;
