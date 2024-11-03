import React, { useEffect, useState } from 'react';
import styles from '../index.module.scss';
import { Modal } from 'react-bootstrap';
import TableList from '../../../../common/tableListing';
import InfiniteScroll from 'react-infinite-scroll-component';
import SvgComponent from '../../../../common/SvgComponent';
import { sortByLastName } from '../../../../../helpers/utils';

export default function AddContactsModal({
  setAddContactsModal,
  addContactsModal,
  contactRows,
  contactsSearchText,
  setContactsSearchText,
  accountContactsList,
  selectedContacts,
  setSelectedContacts,
  selectedRoles,
  setSelectedRoles,
  contactRoles,
  setcustomErrors,
  setPrimaryChairPersonModal,
  setPrimaryChairPersonModalContent,
  fetchData,
  loader,
  setContactsCloseModal,
  setPageNumber,
  pageNumber,
}) {
  const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
  const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
  useEffect(() => {
    setTempSelectedContacts(selectedContacts);
  }, [selectedContacts]);

  useEffect(() => {
    setTempSelectedRoles(selectedRoles);
  }, [selectedRoles]);

  const TableHeaders = [
    {
      name: 'name',
      label: 'Name',
      sortable: false,
    },
    {
      name: 'role_name',
      type: 'select',
      label: 'Role',
      sortable: false,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'noWrap',
      sortable: false,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'noWrap',
      sortable: false,
    },
    {
      name: 'city',
      label: 'City',
      sortable: false,
    },
    {
      name: '',
      label: '',
      sortable: false,
    },
  ];

  useEffect(() => {
    if (tempSelectedContacts.length > 0) {
      const dupArr = [];
      accountContactsList.forEach((item) => {
        if (!tempSelectedContacts.includes(item.record_id?.id)) {
          dupArr.push(item.id);
        }
      });
    }
  }, [tempSelectedContacts.length]);

  const submitContacts = async () => {
    if (tempSelectedContacts.length > 0) {
      let condition = [];
      tempSelectedContacts.forEach((sc) => {
        Object.keys(tempSelectedRoles).forEach((sr) => {
          if (sc == sr) {
            condition.push(sc);
          }
        });
      });
      // Filter keys from tempSelectedRoles based on tempSelectedContacts
      const filteredTempSelectedRoles = Object.fromEntries(
        Object.entries(tempSelectedRoles).filter(([key]) =>
          tempSelectedContacts.includes(key)
        )
      );

      setTempSelectedRoles(filteredTempSelectedRoles);

      if (
        tempSelectedContacts.length ===
          Object.keys(filteredTempSelectedRoles).length &&
        condition.length === tempSelectedContacts.length
      ) {
        if (
          !tempSelectedContacts.some(
            (roleCompare) =>
              tempSelectedRoles?.[roleCompare]?.is_primary_chairperson
          )
        ) {
          setSelectedContacts([]);
          setSelectedRoles([]);
          setPrimaryChairPersonModalContent(
            'Drive creation failed! At least one role of primary chairperson is required to create a drive.'
          );
          setPrimaryChairPersonModal(true);
          return;
        }
        if (
          selectedContacts.filter(
            (roleCompare) =>
              tempSelectedRoles?.[roleCompare]?.is_primary_chairperson
          ).length > 1
        ) {
          setPrimaryChairPersonModalContent(
            'There can only be one contact with Primary Chairperson role.'
          );
          setPrimaryChairPersonModal(true);
          return;
        }
        const dupArr = [...selectedContacts];
        if (selectedContacts.length > 0) {
          accountContactsList.forEach((item) => {
            if (
              selectedContacts.includes(item.record_id?.id) &&
              item?.role_id?.id === selectedRoles[item.record_id?.id]?.value
            ) {
              const indexToRemove = dupArr.findIndex(
                (record) => record === item.record_id?.id
              );
              dupArr.splice(indexToRemove, 1);
            }
          });
        }
        setSelectedContacts(tempSelectedContacts);
        setSelectedRoles(tempSelectedRoles);
        setAddContactsModal(false);
        setcustomErrors((prev) => {
          const { contacts, ...rest } = prev;
          return rest;
        });
      } else {
        setPrimaryChairPersonModalContent(
          'Roles for selected contacts are required.'
        );
        setPrimaryChairPersonModal(true);
      }
    } else {
      setPrimaryChairPersonModalContent('At least one contact is required.');
      setPrimaryChairPersonModal(true);
    }
  };
  return (
    <Modal
      show={addContactsModal}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="contactPopup"
    >
      <Modal.Body>
        <div className="formGroup">
          <div className="content d-flex align-items-center justify-between">
            <h3>Add Contacts</h3>
            <div className="search">
              <div className="formItem">
                <input
                  name="Contact_name"
                  type="text"
                  placeholder="Search Contact"
                  value={contactsSearchText}
                  onChange={(e) => setContactsSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            id="scrollableDiv"
            className="mt-4 overflow-y-auto"
            style={{ height: '50vh', overflow: 'auto' }}
          >
            <TableList
              data={sortByLastName(Object.values(contactRows) || [])}
              headers={TableHeaders}
              checkboxValues={tempSelectedContacts}
              handleCheckboxValue={(row) => row.id}
              handleCheckbox={setTempSelectedContacts}
              selectOptions={contactRoles}
              selectValues={tempSelectedRoles}
              setSelectValues={setTempSelectedRoles}
              drive={true}
            />
            <InfiniteScroll
              dataLength={Object.values(contactRows).length} //This is important field to render the next data
              next={() => {
                fetchData(pageNumber + 1);
              }}
              hasMore={true}
              loader={
                loader ? (
                  <div className="text-center">
                    <SvgComponent name={'Down'} />
                  </div>
                ) : null
              }
              scrollableTarget="scrollableDiv"
            ></InfiniteScroll>
          </div>
        </div>
        <div className="d-flex justify-content-end align-items-center w-100">
          <p
            onClick={() => {
              setContactsCloseModal(true);
            }}
            className={styles.btncancel}
          >
            Cancel
          </p>
          <p className={styles.btnAddContact} onClick={submitContacts}>
            Submit
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
}
