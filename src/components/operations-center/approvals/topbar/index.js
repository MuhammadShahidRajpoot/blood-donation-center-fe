import React from 'react';
import BreadCrumbs from '../../../common/breadcrumbs/index';
import styles from './index.module.scss';
import { Link } from 'react-router-dom';

const TopBar = ({
  BreadCrumbsData,
  BreadCrumbsTitle,
  SearchPlaceholder = null,
  SearchValue = null,
  SearchOnChange = null,
  className = '',
  icon = null,
  setOverRideState,
  overRideState,
}) => {
  return (BreadCrumbsData && BreadCrumbsData.length) ||
    (BreadCrumbsTitle && BreadCrumbsTitle.length) ? (
    <div className={`${className} ${styles.topRow}`}>
      <BreadCrumbs data={BreadCrumbsData} title={BreadCrumbsTitle} />
      {!overRideState ? (
        <span
          style={{ fontSize: '14px' }}
          onClick={() => setOverRideState(true)}
        >
          <Link>Go to Override State Prototype 👉🏻</Link>
        </span>
      ) : (
        <span
          style={{ fontSize: '14px' }}
          onClick={() => setOverRideState(false)}
        >
          <Link>👈🏻 Go back to Normal State Prototype</Link>
        </span>
      )}
      {SearchValue !== null ||
      SearchOnChange !== null ||
      SearchPlaceholder !== null ? (
        <div className={styles.search}>
          <div className={styles.formItem}>
            <input
              type="text"
              placeholder={SearchPlaceholder}
              value={SearchValue}
              onChange={SearchOnChange}
            />
            {icon && <span className={styles.fieldIcon}>{icon}</span>}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};

export default TopBar;
