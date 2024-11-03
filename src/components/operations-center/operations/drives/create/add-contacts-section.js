import React from 'react';
import styles from '../index.module.scss';
import SvgComponent from '../../../../common/SvgComponent';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function AddContactsSection({
  setAddContactsModal,
  selectedContacts,
  setSelectedContacts,
  selectedRoles,
  setSelectedRoles,
  contactRoles,
  contactRows,
  customErrors,
  allInitialContacts,
}) {
  const filterContact = (id) => {
    return Object.values(allInitialContacts)?.filter(
      (item) => item.id === id
    )[0];
  };
  const filterRole = (id) => {
    return contactRoles?.filter((item) => item.value === id)[0];
  };

  const handleContactRemove = (contactId) => {
    setSelectedContacts(selectedContacts.filter((item) => item !== contactId));
    const tempRoles = selectedRoles;
    delete tempRoles[contactId];
    setSelectedRoles(tempRoles);
  };

  return (
    <div className={`formGroup ${styles.contacts}`}>
      <div className="heading-group " name="contacts">
        <h5>Add Contacts</h5>
        <span>
          <OverlayTrigger
            placement="right"
            id="contactTooltip"
            // show={true}
            overlay={(props) => (
              <Tooltip id="addContactsSectionDrivesTooltip" {...props}>
                At least one primary chairperson is required during <br />{' '}
                account creation.
              </Tooltip>
            )}
          >
            <div className={`me-0`}>
              <SvgComponent name={'ToolTipIcon'} />
            </div>
          </OverlayTrigger>
        </span>
      </div>
      <div className={`tableContainer ${styles.contactTable}`}>
        <table className="viewTables w-100 mt-2 mb-4 rounded-0">
          <thead>
            <tr>
              <td style={{ whiteSpace: 'nowrap' }}>Name</td>
              <td style={{ whiteSpace: 'nowrap' }}>Role</td>
              <td style={{ whiteSpace: 'nowrap' }}>Email</td>
              <td style={{ whiteSpace: 'nowrap' }}>Phone</td>
              <td style={{ whiteSpace: 'nowrap' }}></td>
            </tr>
          </thead>
          <tbody>
            {selectedRoles &&
            selectedContacts &&
            selectedContacts?.length != 0 ? (
              selectedContacts.map((item, index) => {
                const contact = filterContact(item);
                const contactRole = filterRole(selectedRoles?.[item]?.value);
                return (
                  <tr key={index}>
                    <td style={{ wordBreak: 'normal' }}>{contact?.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {contactRole?.label}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{contact?.email}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{contact?.phone}</td>
                    <td
                      style={{ width: '10%', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        handleContactRemove(item);
                      }}
                    >
                      <SvgComponent name={'DrivesCrossIcon'} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data text-sm text-center">
                  No contacts selected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`d-flex ${
          customErrors?.contacts
            ? 'justify-content-between'
            : 'justify-content-end'
        } w-100`}
      >
        {customErrors?.contacts && (
          <p className={styles.error}>{customErrors?.contacts}</p>
        )}
        <p
          onClick={() => {
            setAddContactsModal(true);
          }}
          className={styles.btnAddContact}
        >
          Add Contacts
        </p>
      </div>
    </div>
  );
}
