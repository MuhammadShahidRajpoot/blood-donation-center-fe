import React from 'react';
import { Link } from 'react-router-dom';

function FormFooter({
  enableArchive,
  onClickArchive,
  enableCancel,
  onClickCancel,
  enableCreate,
  onCreateType = 'button',
  onClickCreate,
  enableSaveAndClose,
  saveAndCloseType = 'button',
  onClickSaveAndClose,
  onClickCaptureSaveAndClose,
  enableSaveChanges,
  saveChangesType = 'button',
  onClickSaveChanges,
  disabled = false,
  createButtonId = '',
  saveAndCloseButtonId = '',
  saveChangesButtonId = '',
}) {
  return (
    <div className="form-footer">
      {enableArchive ? (
        <div onClick={onClickArchive} className="archived" disabled={disabled}>
          <span>Archive</span>
        </div>
      ) : null}
      {enableCancel ? (
        <button
          className="btn simple-text"
          type="button"
          onClick={onClickCancel}
        >
          Cancel
        </button>
      ) : (
        <Link className={`btn simple-text`} to={-1}>
          Close
        </Link>
      )}
      {enableCreate ? (
        <button
          type={onCreateType}
          id={createButtonId}
          disabled={disabled}
          className={'btn btn-md btn-primary'}
          onClick={onClickCreate}
        >
          Create
        </button>
      ) : null}
      {enableSaveAndClose ? (
        <button
          name="Save & Close"
          className="btn btn-md btn-secondary"
          type={saveAndCloseType}
          id={saveAndCloseButtonId}
          onClick={onClickSaveAndClose}
          onClickCapture={() => {
            if (onClickCaptureSaveAndClose) {
              onClickCaptureSaveAndClose();
            }
          }}
          disabled={disabled}
        >
          Save & Close
        </button>
      ) : null}
      {enableSaveChanges ? (
        <button
          type={saveChangesType}
          id={saveChangesButtonId}
          className={'btn btn-md btn-primary'}
          onClick={(e) => {
            onClickSaveChanges(e);
          }}
          disabled={disabled}
        >
          Save Changes
        </button>
      ) : null}
    </div>
  );
}
export default FormFooter;
