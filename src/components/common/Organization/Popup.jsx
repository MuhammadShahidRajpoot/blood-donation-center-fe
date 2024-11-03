import React, { useEffect } from 'react';
import styles from './Popup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { API } from '../../../api/api-routes';
import { OrganizationalLevelsContext } from '../../../Context/OrganizationalLevels';

export const OLPageNames = {
  OC_NCE: 'nce',
  OC_SESSIONS: 'sessions',
  OC_DRIVES: 'drives',
  OC_CALENDER: 'calender',
  OC_APPROVALS: 'approvals',
  OC_DASHBOARD: 'oc_dashboard',
  CRM_ACCOUNTS: 'accounts',
  CRM_LOCATIONS: 'locations',
  CRM_VOLUNTEERS: 'volunteers',
  CRM_DONORS_CENTERS: 'donors_centers',
  CRM_NCP: 'ncp',
  SC_USERS: 'users',
};

const RecursiveComponent = ({
  items,
  parentId = null,
  onItemChecked,
  initialState,
  setInitialState,
  level = 1,
  clear = false,
}) => {
  React.useEffect(() => {
    if (
      initialState &&
      initialState[parentId] &&
      initialState[parentId]?.checked?.length
    ) {
      initialState[parentId]?.checked?.forEach((item_id) => {
        const item = items?.find(
          (item) => !item?.ignore && getItemId(item) === item_id
        );
        item && onItemCheckedRecursively(item, true, 1);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, parentId]);

  const getItemId = (item) => {
    return item?.bu_id
      ? item?.bu_id
      : item?.donor_center
      ? `${item?.id}-donor_center`
      : `${item?.user_id}-recruiter`;
  };

  const getItemName = (item) => {
    return item?.bu_name
      ? item.bu_name.trim()
      : item?.donor_center
      ? item?.name.trim()
      : `${item?.user_first_name} ${item?.user_last_name}`.trim();
  };

  const handleExpand = (item, isExpanded) => {
    const item_id = getItemId(item);
    setInitialState({
      ...initialState,
      [parentId]: {
        ...initialState?.[parentId],
        expand: isExpanded
          ? initialState?.[parentId]?.expand?.filter((val) => val !== item_id)
          : [...(initialState?.[parentId]?.expand || []), item_id],
      },
    });
  };

  const handleChecked = (item, isChecked) => {
    const item_id = getItemId(item);
    setInitialState({
      ...initialState,
      [parentId]: {
        ...initialState?.[parentId],
        checked: isChecked
          ? initialState?.[parentId]?.checked?.filter((val) => val !== item_id)
          : [...(initialState?.[parentId]?.checked || []), item_id],
      },
      ...onItemCheckedRecursively(item, !isChecked),
    });
  };

  const onItemCheckedRecursively = (
    item,
    isChecked,
    maxDepth = null,
    depth = 1
  ) => {
    const item_id = getItemId(item);
    let newIntitialState = {
      [item_id]: {
        ...initialState?.[item_id],
        checked: isChecked
          ? item?.children?.map((child) => getItemId(child))
          : [],
      },
    };
    if (!item?.ignore) {
      const is_collection_operation = !!item.ol_is_collection_operation;
      const is_donor_center = !!item.donor_center;
      const is_recruiter = !!item.role_is_recruiter;
      onItemChecked(
        {
          id:
            is_recruiter || is_donor_center
              ? `${item_id}-${item.logical_id}`
              : item_id,
          name: getItemName(item),
          is_collection_operation,
          is_donor_center,
          is_recruiter,
          parent_id: is_donor_center
            ? `${item?.collection_operation}`
            : is_recruiter
            ? `${item?.parent_id}`
            : item?.bu_parent_level,
          logical_id: item.logical_id,
          level: item.level,
        },
        isChecked
      );
    }
    if (maxDepth && depth > maxDepth) return;
    if (Array.isArray(item.children) && item.children) {
      item.children.forEach((child) => {
        newIntitialState = {
          ...newIntitialState,
          ...onItemCheckedRecursively(child, isChecked, maxDepth, depth + 1),
        };
      });
    }
    return newIntitialState;
  };

  return (
    <ul>
      {items?.map((item, index) => {
        const isExpanded =
          initialState?.[parentId]?.expand?.includes(getItemId(item)) || false;
        const isChecked =
          initialState?.[parentId]?.checked?.includes(getItemId(item)) || false;
        return (
          <li key={index}>
            {item.children?.length ? (
              <span onClick={() => handleExpand(item, isExpanded)}>
                {isExpanded ? (
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    icon={faMinus}
                    color="#005375"
                  />
                ) : (
                  <FontAwesomeIcon
                    width={15}
                    height={15}
                    icon={faPlus}
                    color="#005375"
                  />
                )}
              </span>
            ) : null}
            <input
              type="checkbox"
              checked={isChecked}
              onClick={() => handleChecked(item, isChecked)}
            />
            {getItemName(item)}
            <div
              className={
                isExpanded && Array.isArray(item.children) ? '' : 'd-none'
              }
            >
              <RecursiveComponent
                items={item.children}
                onItemChecked={onItemChecked}
                parentId={item.bu_id}
                initialState={initialState}
                setInitialState={setInitialState}
                level={level + 1}
                clear={clear}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const OrganizationalPopup = ({
  value,
  showConfirmation,
  onCancel,
  onConfirm,
  heading,
  description,
  classes,
  cancelBtnText = 'Cancel',
  confirmBtnText = 'Apply',
  disabled = false,
  showDonorCenters = false,
  showRecruiters = false,
  getSelectedItems = false,
  initialState = undefined,
  setInitialState = undefined,
  setLabels = undefined,
  clear = false,
  pageName = '',
}) => {
  const didMount = React.useRef(false);
  const [hierarchy, setHierarchy] = React.useState([]);
  const [checkedItems, setCheckedItems] = React.useState([]);
  const { OLData, setOLData, getOLData } = React.useContext(
    OrganizationalLevelsContext
  );

  React.useEffect(() => {
    const fetchOrganizationalLevels = async () => {
      const {
        data: { data },
      } =
        await API.systemConfiguration.organizationalAdministrations.organization.getBusinessUnits(
          showDonorCenters,
          showRecruiters
        );
      setCheckedItems([]);
      setHierarchy(convertToHierarchy(data));
    };

    if (!value || !hierarchy?.length) fetchOrganizationalLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, showDonorCenters, showRecruiters]);

  useEffect(() => {
    if (!didMount.current && checkedItems.length && !clear) {
      handleConfirm(true);
      didMount.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems.length]);

  /**
   * The function collects a specific resource from a record and its parent records
   * in all the hierarchy using a map.
   * @param {Map} map Its a map object represent all the record id against their data.
   * @param {object} record We collect resource out of record.
   * @param {string} recordKey It represents which resource you want to collect.
   * @param {string} resourceKey Its a resource key which is used to unique the results by default
   * its 'id'.
   * @returns The function `collectResource` returns an array of resources.
   */
  const collectResource = (map, record, recordKey, resourceKey = 'id') => {
    if (!record || !Object.keys(record).length) return [];

    const resources = (record[recordKey] || []).reduce(
      (acc, obj) => ({
        ...acc,
        [obj[resourceKey]]: { ...obj, parent_id: record.bu_id },
      }),
      {}
    );
    if (record.parent_id !== null) {
      const parent = map.get(record.parent_id);
      const parentResources = collectResource(
        map,
        parent,
        recordKey,
        resourceKey
      );
      parentResources.forEach((resource) => {
        resources[resource[resourceKey]] = resource;
      });
    }

    return Object.values(resources).map((resource) => ({
      ...resource,
      logical_id: record.bu_id,
    }));
  };

  /**
   * It recursively sorts a hierarchy of records based on the names of the
   * records and filter records which is not functional and childless
   * @param {Array} records
   * @param {number} level
   * @returns sorted and filtered records
   */
  const sortAndFilterHierarchy = (records, level = 1) => {
    for (const record of records) {
      if (!Array.isArray(record?.children)) continue;
      record.children =
        sortAndFilterHierarchy(record?.children, level + 1) || [];
    }

    return records
      .map((record) => ({ ...record, level }))
      .filter((record) => {
        if (
          // regions and divions level check.
          !record?.ol_is_collection_operation &&
          !record?.donor_center &&
          !record?.role_is_recruiter &&
          (!Array.isArray(record?.children) ||
            (Array.isArray(record?.children) && !record?.children?.length))
        )
          return false;
        return true;
      })
      .sort((first, second) => {
        const convert = (name) => name?.trim()?.toLowerCase();
        const firstName = convert(
          first.bu_name || first.user_last_name || first.name
        );
        const secondName = convert(
          second.bu_name || second.user_last_name || second.name
        );
        return secondName < firstName ? 1 : -1;
      });
  };

  const convertToHierarchy = (flatRecords) => {
    if (!flatRecords?.length) return [];

    const map = new Map();
    const items = [];
    const newOLData = getOLData(pageName) || {};

    // Create a map for quick access to each record by its ID
    flatRecords?.forEach((record) => {
      map?.set(record?.bu_id, { ...record, children: [] });
    });

    // Expand Parents on API
    if (
      !clear &&
      (!Object.keys(newOLData).length ||
        (Object.keys(newOLData).length === 1 && newOLData[null]))
    ) {
      const addRecordToParent = (record, expand, checked) => {
        newOLData[record?.parent_id || null] = {
          ...newOLData?.[record?.parent_id || null],
          ...(expand && {
            expand: [
              ...new Set([
                ...(newOLData?.[record?.parent_id || null]?.expand || []),
                record?.bu_id,
              ]),
            ],
          }),
          ...(checked && {
            checked: [
              ...new Set([
                ...(newOLData?.[record?.parent_id || null]?.checked || []),
                record?.bu_id,
              ]),
            ],
          }),
        };
      };

      flatRecords.forEach((record) => {
        if (!record.checked) return;
        addRecordToParent(record, false, true);
        let parentRecord = record;
        while (parentRecord && parentRecord?.parent_id !== null) {
          parentRecord = map?.get(parentRecord?.parent_id);
          parentRecord.expand = true;
          addRecordToParent(parentRecord, true, false);
          map.set(parentRecord?.bu_id, parentRecord);
        }
      });

      setOLData(pageName, newOLData);
    }

    // Build the hierarchy
    flatRecords?.forEach((record) => {
      const recruiters = collectResource(map, record, 'recruiters', 'user_id');
      const donor_centers = collectResource(map, record, 'donor_centers');
      const item = { ...map?.get(record.bu_id), recruiters, donor_centers };
      const parent = map?.get(record?.parent_id);

      if (item?.ol_is_collection_operation) {
        if (recruiters?.length)
          item?.children?.push({
            bu_id: `${item?.bu_id}-recruiter`,
            bu_name: 'Recruiters',
            children: recruiters,
            ignore: true,
          });
        if (donor_centers?.length)
          item?.children?.push({
            bu_id: `${item?.bu_id}-donor_center`,
            bu_name: 'Donor Centers',
            children: donor_centers,
            ignore: true,
          });
      }

      if (parent) {
        parent?.children?.push({ ...item, logical_id: parent.bu_id });
      } else {
        items.push(item);
      }
    });

    // sort and filter items
    return sortAndFilterHierarchy(items);
  };

  const handleItemChecked = (item, isChecked) => {
    setCheckedItems((prev) =>
      isChecked
        ? [...prev, item]
        : prev.filter((record) => record.id !== item.id)
    );
  };

  const handleLabels = (items) => {
    const map = new Map();

    // construct a map
    items.forEach((item) => {
      map.set(item.id, item);
    });

    // constructing hierarchy
    const labelItems = [];
    items.forEach((item) => {
      const parent = map.get(item.logical_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      } else labelItems.push(item);
    });

    setLabels(
      labelItems.map((item) => ({
        id: item.id,
        name: item.name,
        level: item.level,
      }))
    );
  };

  const handleConfirm = (apply = false) => {
    if (!checkedItems) return;

    const items = checkedItems.map((record) =>
      record.is_recruiter || record.is_donor_center
        ? { ...record, id: record.id.split('-')[0] }
        : record
    );
    const filterResource = (resource, parentId = null) => {
      const resources = items
        .filter((record) => {
          if (record[resource]) {
            return parentId ? record.parent_id === parentId : true;
          }
          return false;
        })
        .map((record) => record.id);
      return [...new Set(resources)];
    };

    const ignores = { recruiters: [], donor_centers: [] };
    const payload = {
      collection_operations: items
        ?.filter((item) => item.is_collection_operation)
        ?.reduce((acc, item) => {
          const obj = {
            recruiters: filterResource('is_recruiter', item.id),
            donor_centers: filterResource('is_donor_center', item.id),
          };
          ignores.recruiters = [
            ...new Set([...ignores.recruiters, ...obj.recruiters]),
          ];
          ignores.donor_centers = [
            ...new Set([...ignores.donor_centers, ...obj.donor_centers]),
          ];
          return { ...acc, [item.id]: obj };
        }, {}),
      recruiters: filterResource('is_recruiter'),
      donor_centers: filterResource('is_donor_center'),
    };

    payload.recruiters = payload.recruiters.filter(
      (record) => !ignores.recruiters.includes(record)
    );
    payload.donor_centers = payload.donor_centers.filter(
      (record) => !ignores.donor_centers.includes(record)
    );

    handleLabels(items);

    onConfirm(
      Object.keys(payload.collection_operations).length ||
        payload.recruiters.length ||
        payload.donor_centers.length
        ? getSelectedItems
          ? items
          : payload
        : '',
      Object.keys(payload.collection_operations).length ? items : '',
      apply
    );
  };

  return (
    <section
      className={`${styles.popup} ${showConfirmation && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div className={`${styles.popupInner} ${classes?.inner ?? ''}`}>
        <div className={styles.content}>
          {heading ? <h3>{heading}</h3> : ''}
          {description ? <p>{description}</p> : ''}
          <div className={styles.hierarchy}>
            <RecursiveComponent
              items={hierarchy}
              onItemChecked={handleItemChecked}
              initialState={OLData?.[pageName]}
              setInitialState={(data) => setOLData(pageName, data)}
              clear={clear}
            />
          </div>
        </div>
        <div className={`${styles.buttons} ${classes?.btnGroup ?? ''}`}>
          <button
            type="button"
            className={`btn btn-secondary ${classes?.btn ?? ''}`}
            onClick={onCancel}
          >
            {cancelBtnText}
          </button>
          <button
            type="button"
            className={`btn btn-primary ${classes?.btn ?? ''}`}
            onClick={() => handleConfirm()}
            disabled={disabled}
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrganizationalPopup;
