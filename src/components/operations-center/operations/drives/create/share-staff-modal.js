import React, { useEffect, useState } from 'react';
import styles from '../index.module.scss';
import { Modal } from 'react-bootstrap';
import TableList from '../../../../common/tableListing';
import TopBar from '../../../../common/topbar/index';
import { toast } from 'react-toastify';

export default function ShareStaffModal({
  setModal,
  modal,
  searchText,
  setSearchText,
  setShareStaffSearch,
  selectedItems,
  staffShareRequired,
  shareStaffData,
  resourceShareData,
  setResourceShareData,
  staffShareValue,
  setShifts,
  shifts,
  driveDate,
  collectionOperationId,
  shareStaffSearch,
}) {
  const [tempSelectedItems, setTempSelectedItems] = useState([]);
  const showAllCheckBoxListing = false;
  const [filterData, setFilterData] = useState([]);
  useEffect(() => {
    setTempSelectedItems(selectedItems);
    setFilterData(shareStaffData);
  }, [selectedItems, shareStaffData]);

  const TableHeaders = [
    {
      name: 'collection_operation_name',
      label: 'Collection Operation',
      sortable: false,
    },
    {
      name: 'availableStaff',
      label: 'Available Staff',
      sortable: false,
    },
    {
      name: 'type',
      label: 'Type',
      sortable: false,
    },
  ];

  const submitSelection = async () => {
    const selected = shareStaffData?.filter(
      (item) => item.collection_operation.id == tempSelectedItems?.[0]
    );
    if (selected?.length > 0) {
      const resourceShare = {
        start_date: driveDate,
        end_date: driveDate,
        share_type: 'staff',
        quantity: staffShareRequired,
        description: `Staff sharing transaction for ${staffShareRequired} staff from ${selected?.[0]?.collection_operation?.name} will be recorded.`,
        from_collection_operation_id: selected?.[0]?.collection_operation?.id,
        to_collection_operation_id: collectionOperationId,
        staff_setup_id: staffShareValue?.value?.id,
      };
      setResourceShareData([...resourceShareData, resourceShare]);
      const output = shifts?.map((item, index) =>
        staffShareValue.shiftIndex === index
          ? {
              ...item,
              projections: shifts[index]?.projections?.map((x, y) =>
                staffShareValue.peorjectionIndex === y
                  ? {
                      ...x,
                      staffSetup: [
                        ...(shifts?.[staffShareValue.shiftIndex]?.projections?.[
                          staffShareValue.peorjectionIndex
                        ]?.staffSetup || []),
                        staffShareValue?.value,
                      ],
                    }
                  : x
              ),
            }
          : item
      );
      setShifts([...output]);
      setModal(false);
    } else {
      toast.error(`At least one staff member is required.`, {
        autoClose: 3000,
      });
      setModal(false);
    }
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
            BreadCrumbsTitle={`Share Staff (${staffShareRequired} Required)`}
            SearchValue={shareStaffSearch}
            SearchOnChange={(e) => {
              // setSearchText(e.target.value);
              setShareStaffSearch(e.target.value);
            }}
            SearchPlaceholder={'Search Staff'}
          />

          <div className="mt-4 overflow-y-auto" style={{ height: '50vh' }}>
            <TableList
              data={filterData}
              headers={TableHeaders}
              checkboxValues={tempSelectedItems}
              handleCheckboxValue={(row) => row.collection_operation.id}
              handleCheckbox={setTempSelectedItems}
              showAllCheckBoxListing={showAllCheckBoxListing}
              selectSingle={true}
            />
          </div>
          <div className="d-flex justify-content-end align-items-center w-100">
            <p
              onClick={() => {
                setModal(false);
                setTempSelectedItems([]);
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
