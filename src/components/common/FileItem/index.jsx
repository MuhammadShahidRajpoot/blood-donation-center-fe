import React from 'react';
import styles from './index.module.scss';
import CustomAudioPlayer from '../CustomAudioPlayer';
import { ReactComponent as PDFIcon } from '../../../assets/pdf_icon.svg';

const FileItem = ({ file, onRemove }) => {
  const audioSrc = file instanceof Blob ? URL.createObjectURL(file) : file;

  return (
    <div className={`d-flex ${styles.fileItem}`}>
      <div className={styles.fileContainer}>
        <div className={styles.fileDetails}>
          <PDFIcon className="ml-6" style={{ marginLeft: 20 }} />
          <span className={styles.fileName}>{file?.name ?? ''}</span>
        </div>
        <button className={styles.removeButton} onClick={onRemove}>
          ×
        </button>
      </div>
      <div style={{ marginLeft: '20px' }} className={styles.audioContainer}>
        <CustomAudioPlayer src={audioSrc} />
      </div>
    </div>
  );
};

export default FileItem;
