import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import style from '../../../../../styles/Home.module.scss';
import { syncDonorsBBCS } from '../services/prospect.service';
import './index.scss';

function ProspectModal({
  showBBCSModal,
  data,
  donorId,
  title,
  showActionBtns,
  setModalHide,
}) {
  const [selection, setSelection] = useState(null);
  const [disable, setDisable] = useState(true);
  const syncDonor = async () => {
    try {
      const syncDonorPayload = {
        id: donorId,
        uuid: selection?.UUID,
      };
      setDisable(true);
      const syncDonorResponse = await syncDonorsBBCS(syncDonorPayload);
      if (syncDonorResponse.message === 'success') {
        toast.info(`Donor Synced Successfully`, { autoClose: 3000 });
        setDisable(true);
        setModalHide();
      }
    } catch (error) {
      setDisable(false);
      toast.error(`${error}`, { autoClose: 3000 });
    }
  };

  const handleSelection = (data) => {
    setDisable(false);
    setSelection(data);
  };

  const handleDisable = () => {
    if (disable || !selection) return true;
    else return false;
  };

  return (
    <Modal
      className={`d-flex align-items-center justify-content-center `}
      show={showBBCSModal}
      onHide={() => {
        setDisable(true);
        setModalHide();
      }}
      backdrop="static"
      keyboard={false}
      dialogClassName="modal-90w"
    >
      <Modal.Header
        closeButton
        className={`modal-header ${style.modalHeader}`}
      ></Modal.Header>
      <Modal.Body
        className={`d-flex flex-column justify-content-center align-items-center p-20 ${style.createAdModelStyle}`}
      >
        <div>
          {title && <p className="modal-title text-center">{title}</p>}
          {data && data.length > 0 && (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>UUID</th>
                  <th>City</th>
                  <th>donorNumber</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="radio"
                        name="address-email"
                        id={`address-email-${index}`}
                        value={item.UUID}
                        required
                        onChange={() => handleSelection(item)}
                      />
                    </td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.UUID}</td>
                    <td>{item.city}</td>
                    <td>{item.donorNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {showActionBtns && (
          <div className="d-flex">
            <button
              disabled={handleDisable()}
              type="button"
              className={`btn btn-primary`}
              onClick={syncDonor}
            >
              Sync Donors
            </button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ProspectModal;
