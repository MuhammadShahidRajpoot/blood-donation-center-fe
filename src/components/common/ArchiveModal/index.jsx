/* eslint-disable */
import React from 'react';
import styles from './index.module.scss';
import ArchiveImg from '../../../assets/archive.svg';

const ArchiveModal = ({
  showConfirmation,
  onCancel,
  onConfirm,
  icon,
  heading,
  description,
  classes,
  cancelBtnText = 'No',
  confirmBtnText = 'Yes',
  disabled = false,
}) => {
  return (
    <section
      className={`${styles.popup} ${showConfirmation && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        <div className={styles.icon}>
          <img src={icon ? icon : ArchiveImg} alt="Archive Icon" />
        </div>
        <div className={styles.content}>
          {heading ? <h3>{heading}</h3> : ''}
          {description ? <p>{description}</p> : ''}
          <div className={`${styles.buttons} ${classes?.btnGroup ?? ''}`}>
            <button
              className={`btn btn-secondary ${classes?.btn ?? ''}`}
              onClick={onCancel}
            >
              {cancelBtnText}
            </button>
            <button
              className={`btn btn-primary ${classes?.btn ?? ''}`}
              onClick={onConfirm}
              disabled={disabled}
            >
              {confirmBtnText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchiveModal;
