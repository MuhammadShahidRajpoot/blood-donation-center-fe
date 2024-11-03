import React from 'react';
import styles from './index.module.scss';
import CancelIconImage from '../../../assets/images/ConfirmCancelIcon.png';
import { Link } from 'react-router-dom';

const ConfirmModal = ({
  showConfirmation,
  onCancel,
  onConfirm,
  icon,
  heading,
  description,
  extraDescription,
  classes,
  cancelBtnText = 'No',
  confirmBtnText = 'Yes',
  disabled = false,
  isHoldCall = false,
  modalCrossIcon = false,
  onCrossClick,
  isCallLoading = false,
}) => {
  return (
    <section
      className={`${styles.popup} ${showConfirmation && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        {modalCrossIcon && (
          <button
            aria-label="Close"
            className={styles.cross}
            onClick={onCrossClick}
          >
            <div>{modalCrossIcon}</div>
          </button>
        )}
        <div className={styles.icon}>
          <img src={icon ? icon : CancelIconImage} alt="CancelIcon" />
        </div>
        <div
          className={styles.content}
          style={
            isCallLoading
              ? {
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              : {}
          }
        >
          {heading ? <h3>{heading}</h3> : ''}
          {description ? <p>{description}</p> : ''}
          {extraDescription && (
            <ul>
              {extraDescription.map((desc, index) => (
                <li key={index}>
                  <p style={{ textAlign: 'left' }}>{desc}</p>
                </li>
              ))}
            </ul>
          )}
          <div
            className={`${styles.buttons} ${classes?.btnGroup ?? ''}${
              isCallLoading && 'w-100 '
            }`}
          >
            {isCallLoading ? (
              <Link
                to={'/call-center/dialing-center/call-jobs'}
                className={`btn btn-danger border-danger text-decoration-none   ${
                  classes?.btn ?? ''
                }`}
                onClick={onCancel}
              >
                {confirmBtnText}
              </Link>
            ) : (
              !isHoldCall && (
                <button
                  className={`btn btn-secondary ${classes?.btn ?? ''}`}
                  onClick={onCancel}
                >
                  {cancelBtnText}
                </button>
              )
            )}
            {!isCallLoading && (
              <button
                className={`btn btn-primary ${classes?.btn ?? ''}`}
                onClick={onConfirm}
                disabled={disabled}
              >
                {confirmBtnText}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConfirmModal;
