import React from 'react';
import styles from './index.module.scss';
const SpinningLoader = () => {
  return (
    <div className={`${styles.loaderContainer}`}>
      <div className={`${styles.loader}`}></div>
    </div>
  );
};

export default SpinningLoader;
