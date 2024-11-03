import React from 'react';
import styles from './Popup.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { API } from '../../../../api/api-routes';
import Styles from '../index.module.scss';
import { keys, uniq, has } from 'lodash';

const RecursiveComponent = ({
  organizational_levels,
  items,
  parentChecked = false,
  onItemChecked,
  setCheckedItems,
  itemsToCheck,
}) => {
  const [expand, setExpand] = React.useState([]);
  const [checked, setChecked] = React.useState([]);

  React.useEffect(() => {
    setChecked(parentChecked ? items.map((item) => getItemId(item)) : []);
  }, [items, parentChecked]);

  const getPlainItemId = (item) => {
    return has(item, 'user_id')
      ? item.user_id.toString()
      : item.bu_id.split('-')[0];
  };

  React.useEffect(() => {
    const checkItems = itemsToCheck ? JSON.parse(itemsToCheck) : '';
    if (Array.isArray(checkItems) && checkItems?.length) {
      setCheckedItems(checkItems);
      const itemIds = checkItems.map((item) => item.id);
      const checkedItems = items.filter((item) =>
        itemIds.includes(getPlainItemId(item))
      );
      const checkedItemIds = checkedItems.map((item) => getItemId(item));
      if (checkedItemIds.length) {
        setChecked(uniq([...checked, ...checkedItemIds]));
      }
    }
  }, [itemsToCheck]);

  React.useEffect(() => {
    setExpand([]);
  }, [items]);

  React.useEffect(() => {
    if (organizational_levels === '') {
      setChecked([]);
      setCheckedItems([]);
    }
  }, [organizational_levels]);

  const getItemId = (item) =>
    item.bu_id
      ? item.bu_id
      : item?.donor_center
      ? `${item.id}-donor_center`
      : `${item.user_id}-recruiter`;

  const getItemName = (item) =>
    item?.bu_name
      ? item.bu_name.trim()
      : item?.donor_center
      ? item?.name.trim()
      : `${item?.user_first_name} ${item?.user_last_name}`.trim();

  const handleExpand = (item, isExpanded) => {
    const item_id = getItemId(item);
    setExpand(
      isExpanded
        ? expand.filter((val) => val !== item_id)
        : [...expand, item_id]
    );
  };

  const handleChecked = (item, isChecked) => {
    const item_id = getItemId(item);
    setChecked(
      isChecked
        ? checked.filter((val) => val !== item_id)
        : [...checked, item_id]
    );

    onItemCheckedRecursively(item, !isChecked);
  };

  const onItemCheckedRecursively = (item, isChecked) => {
    const item_id = getItemId(item);
    if (!item?.ignore) {
      const is_collection_operation = !!item.ol_is_collection_operation;
      const is_donor_center = !!item.donor_center;
      const is_recruiter = !!item.role_is_recruiter;
      onItemChecked(
        {
          id: item_id,
          name: getItemName(item),
          is_collection_operation,
          is_donor_center,
          is_recruiter,
          parent_id: is_donor_center
            ? `${item?.collection_operation}`
            : is_recruiter
            ? `${item?.business_unit_id}`
            : null,
        },
        isChecked
      );
    }
    if (Array.isArray(item.children) && item.children) {
      item.children.forEach((child) => {
        onItemCheckedRecursively(child, isChecked);
      });
    }
  };

  return (
    <ul style={{ marginTop: '15px', marginBottom: '15px' }}>
      {items.map((item, index) => {
        const isExpanded = expand.includes(getItemId(item));
        const isChecked = checked.includes(getItemId(item));
        return (
          <li key={index} style={{ marginBottom: '15px', marginTop: '15px' }}>
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
            {isExpanded && Array.isArray(item.children) ? (
              <RecursiveComponent
                items={item.children}
                parentChecked={isChecked}
                onItemChecked={onItemChecked}
                setCheckedItems={setCheckedItems}
                itemsToCheck={itemsToCheck}
              />
            ) : null}
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
  getHierarchy = false,
  showDonorCenters = false,
  showRecruiters = false,
  organizational_levels,
}) => {
  const [hierarchy, setHierarchy] = React.useState([]);
  const [checkedItems, setCheckedItems] = React.useState([]);

  React.useEffect(() => {
    const fetchOrganizationalLevels = async () => {
      const {
        data: { data },
      } =
        await API.systemConfiguration.organizationalAdministrations.organization.getBusinessUnits(
          showDonorCenters,
          showRecruiters
        );
      setHierarchy(convertToHierarchy(data));
    };

    if (!value || !hierarchy?.length) fetchOrganizationalLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, showDonorCenters, showRecruiters]);
  const convertToHierarchy = (flatRecords) => {
    const map = new Map();
    const items = [];
    // Create a map for quick access to each record by its ID
    flatRecords?.length &&
      flatRecords?.forEach((record) => {
        map?.set(record?.bu_id, {
          ...record,
          children: [],
        });
      });

    // Build the hierarchy
    flatRecords?.length &&
      flatRecords?.forEach((record) => {
        const parent = map?.get(record?.parent_id);
        const item = map?.get(record.bu_id);

        if (item?.ol_is_collection_operation) {
          item?.recruiters?.length &&
            item?.children?.push({
              bu_id: `${item?.bu_id}-recruiter`,
              bu_name: 'Recruiters',
              children: item?.recruiters,
              ignore: true,
            });
          item?.donor_centers?.length &&
            item?.children?.push({
              bu_id: `${item?.bu_id}-donor_center`,
              bu_name: 'Donor Centers',
              children: item?.donor_centers,
              ignore: true,
            });
        }
        if (parent) {
          parent?.children?.push(item);
        } else {
          items.push(item);
        }
      });

    return items.filter(
      (record) => record?.children?.length || record?.parent_id
    );
  };

  const handleItemChecked = (item, isChecked) => {
    setCheckedItems((prev) =>
      isChecked
        ? [...prev, item]
        : prev.filter((record) => record.id !== item.id)
    );
  };

  const handleConfirm = () => {
    const items = checkedItems?.map((record) =>
      record.is_recruiter || record.is_donor_center
        ? { ...record, id: record.id.split('-')[0] }
        : record
    );

    let collection_operations = {};
    items
      ?.filter((item) => item.is_collection_operation)
      ?.forEach((item) => {
        collection_operations[item.id] = {
          recruiters: [
            ...new Set(
              items
                ?.filter(
                  (record) =>
                    record.is_recruiter && record.parent_id === item.id
                )
                .map((record) => record.id)
            ),
          ],

          // donor_centers: [
          //   ...new Set(
          //     items
          //       .filter(
          //         (record) =>
          //           record.is_donor_center && record.parent_id === item.id
          //       )
          //       .map((record) => record.id)
          //   ),
          // ],
        };
      });
    let hierarchy = {};
    if (getHierarchy) {
      let nodes = { ...collection_operations };
      let nodeIds = keys(nodes);
      /* eslint-disable */
      while (true) {
        /* eslint-enable */
        for (const nodeId of nodeIds) {
          const item = items.find((record) => record.id === nodeId);
          const parentItem = items.find(
            (record) => record.id === item.parent_id
          );
          if (parentItem) {
            if (hierarchy[item.parent_id]) {
              hierarchy[item.parent_id].push({
                [nodeId]: nodes[nodeId],
              });
            } else {
              hierarchy[item.parent_id] = [
                {
                  [nodeId]: nodes[nodeId],
                },
              ];
            }
          } else {
            hierarchy[nodeId] = nodes[nodeId];
          }
        }
        nodes = { ...hierarchy };
        nodeIds = keys(hierarchy);
        const item = items.find((record) => record.id === nodeIds[0]);
        const parentItem = items.find((record) => record.id === item.parent_id);
        if (!item.parent_id || !parentItem) break;
      }
    }
    onConfirm(
      Object.keys(collection_operations).length ? collection_operations : '',
      Object.keys(collection_operations).length ? items : ''
    );
    collection_operations = {};
  };

  return (
    <section
      className={`${styles.popup} ${showConfirmation && styles.active} ${
        classes?.root ?? ''
      }`}
    >
      <div
        className={`${styles.popupInner} ${classes?.inner ?? ''}`}
        style={{ borderRadius: '20px' }}
      >
        <div className={styles.content}>
          {heading ? <h3>{heading}</h3> : ''}
          {description ? <p>{description}</p> : ''}
          <div className={styles.hierarchy}>
            <RecursiveComponent
              organizational_levels={organizational_levels}
              items={hierarchy}
              onItemChecked={handleItemChecked}
              setCheckedItems={(items) =>
                setCheckedItems([...checkedItems, ...items])
              }
              itemsToCheck={value}
            />
          </div>
        </div>
        <div
          className="d-flex justify-content-end"
          // style={{ position: 'absolute', bottom: '30px', right: '30px' }}
          style={{ marginTop: '5px' }}
        >
          <div
            className={Styles.cancelBtn}
            onClick={() => {
              setCheckedItems([]);
              onCancel();
            }}
          >
            {cancelBtnText}
          </div>
          <div onClick={handleConfirm} className={Styles.applyBtn}>
            {confirmBtnText}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizationalPopup;
