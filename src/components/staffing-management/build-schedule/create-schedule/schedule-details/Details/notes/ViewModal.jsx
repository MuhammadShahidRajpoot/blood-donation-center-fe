import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import './viewModal.scss';

export const ViewModal = ({
  show,
  handleClose,
  title,
  body,
  closeButtonText,
}) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      animation={false}
      size={'lg'}
    >
      <Modal.Header className="viewModalHeader">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="viewModalBody"
        // dangerouslySetInnerHTML={{ __html: body }}
      >
        {body}
      </Modal.Body>
      <Modal.Footer className="viewModalFooter">
        <Button variant="secondary" onClick={handleClose}>
          {closeButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
