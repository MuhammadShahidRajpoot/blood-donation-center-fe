import React, { useEffect, useState } from 'react';
import styles from '../index.module.scss';
import { Modal } from 'react-bootstrap';
import TableList from '../../../../common/tableListing';
import { BASE_URL, makeAuthorizedApiRequest } from '../../../../../helpers/Api';
import WarningModalPopUp from '../../../../common/warningModal';

export default function BluePrintSelectAccountsModal({
  blueprintSelectAccountModal,
  setBlueprintSelectAccountModal,
  selectedAccount,
  setSelectedAccount,
  accountRows,
  accountsSearchText,
  setAccountsSearchText,
  RSMO,
}) {
  const [tempSelectedAccount, setTempSelectedAccount] = useState([]);
  const [scheduleAnywayPopup, setScheduleAnywayPopup] = useState(false);

  useEffect(() => {
    if (selectedAccount && tempSelectedAccount.length === 0) {
      setTempSelectedAccount([selectedAccount.id]);
    }
  }, [selectedAccount, blueprintSelectAccountModal]);

  function daysDifference(dateToCompare) {
    const currentDate = new Date();
    const comparedDate = new Date(dateToCompare);
    const timeDifference = currentDate - comparedDate;
    const daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));

    return daysDifference;
  }
  useEffect(() => {
    if (tempSelectedAccount?.length === 0) {
      setScheduleAnywayPopup(false);
    }
    handleChangeAccount();
  }, [tempSelectedAccount]);

  const handleChangeAccount = async () => {
    try {
      if (tempSelectedAccount?.length > 0) {
        const lastDriveResponse = await makeAuthorizedApiRequest(
          'GET',
          `${BASE_URL}/drives/last/${tempSelectedAccount[0]}`
        );
        const data = await lastDriveResponse.json();
        if (daysDifference(data?.data?.date) < 56) {
          if (!RSMO?.[tempSelectedAccount?.[0]]) {
            setScheduleAnywayPopup(true);
          }
        }
      }
    } catch (error) {
      console.log(`Failed to fetch Account ${error}`);
    }
  };
  const TableHeaders = [
    {
      name: 'label',
      label: 'Account',
      sortable: false,
    },
    {
      name: 'alternate_name',
      label: 'Alternate Name',
      sortable: false,
    },
    {
      name: 'street_address',
      label: 'Street Address',
      sortable: false,
    },
    {
      name: 'city',
      label: 'City',
      sortable: false,
    },
    {
      name: 'state',
      label: 'State',
      sortable: false,
    },
  ];

  const submitAccounts = async () => {
    console.log({ tempSelectedAccount });
    const account = accountRows?.filter(
      (item) => item.id === tempSelectedAccount?.[0]
    )?.[0];

    setSelectedAccount(account);
    setBlueprintSelectAccountModal(false);
    setScheduleAnywayPopup(false);
  };

  return (
    <Modal
      show={blueprintSelectAccountModal}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="contactPopup"
    >
      <Modal.Body>
        <div className="formGroup">
          <div className="content d-flex align-items-center justify-between">
            <h3>Add Accounts</h3>
            <div className="search">
              <div className="formItem">
                <input
                  name="Contact_name"
                  type="text"
                  placeholder="Search Account"
                  value={accountsSearchText}
                  onChange={(e) => setAccountsSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ height: '50vh', overflow: 'auto' }}>
            <TableList
              selectSingle={true}
              showAllCheckBoxListing={false}
              data={accountRows}
              headers={TableHeaders}
              checkboxValues={tempSelectedAccount}
              handleCheckboxValue={(row) => row.id}
              handleCheckbox={setTempSelectedAccount}
            />
          </div>
        </div>
        <div className="d-flex justify-content-end align-items-center w-100">
          <p
            onClick={() => {
              setTempSelectedAccount([]);
              setBlueprintSelectAccountModal(false);
              setScheduleAnywayPopup(false);
            }}
            className={styles.btncancel}
          >
            Cancel
          </p>
          <p className={styles.btnAddContact} onClick={submitAccounts}>
            Submit
          </p>
        </div>
        <WarningModalPopUp
          title="Alert !"
          message={`It has not been 56 days, schedule anyway?`}
          modalPopUp={scheduleAnywayPopup}
          setModalPopUp={setScheduleAnywayPopup}
          showActionBtns={true}
          confirmAction={() => {
            // setClearInfo(false);
            setScheduleAnywayPopup(false);
          }}
          cancelAction={() => {
            // setClearInfo(true);
            setScheduleAnywayPopup(false);
            setTempSelectedAccount([]);
          }}
          cancelText={'No'}
          confirmText={'Yes'}
        />
      </Modal.Body>
    </Modal>
  );
}
