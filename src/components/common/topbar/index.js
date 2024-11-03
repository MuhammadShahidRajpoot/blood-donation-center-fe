import React from 'react';
import BreadCrumbs from '../breadcrumbs';
import styles from './index.module.scss';
// import { Link } from 'react-router-dom';

const TopBar = ({
  BreadCrumbsData,
  BreadCrumbsTitle,
  SearchPlaceholder = null,
  SearchValue = null,
  SearchOnChange = null,
  className = '',
  icon = null,
  onlySearchField = false,
  removeSearch = false,
}) => {
  return (BreadCrumbsData && BreadCrumbsData.length) ||
    (BreadCrumbsTitle && BreadCrumbsTitle.length) ? (
    <div className={`${className} ${styles.topRow}`}>
      <BreadCrumbs data={BreadCrumbsData} title={BreadCrumbsTitle} />
      {/* <span style={{ fontSize: '14px' }}>
        <Link>Go to Override State Prototype 👉🏻</Link>
      </span> */}
      {(SearchValue !== null ||
        SearchOnChange !== null ||
        SearchPlaceholder !== null) &&
      !removeSearch ? (
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
  ) : onlySearchField ? (
    <div
      className={`${styles.topRow}`}
      style={{
        display: 'flex',
        justifyContent: 'end',
        boxShadow: 'none',
        padding: '0 5px',
        paddingBottom: '15px',
      }}
    >
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
