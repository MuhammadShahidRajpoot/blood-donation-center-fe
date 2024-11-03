import moment from 'moment';
import { API } from '../../../../../../api/api-routes';
import { covertDatetoTZDate } from '../../../../../../helpers/convertDateTimeToTimezone';

const addRemoveDevices = (shifts, i, e, setShifts) => {
  const currentState = shifts[i].devices;
  if (currentState?.find((item) => item.id === e.id)) {
    const output = shifts.map((item, index) => {
      return i === index
        ? {
            ...item,
            devices: item.devices.filter((s) => s.id !== e.id),
          }
        : item;
    });
    setShifts([...output]);
  } else {
    const output = shifts.map((item, index) =>
      i === index
        ? {
            ...item,
            devices: [...shifts[i].devices, e],
          }
        : item
    );
    setShifts([...output]);
  }
};

const handleProjectionChange = (
  e,
  shiftIndex,
  projectionIndex,
  setShifts,
  product
) => {
  setShifts((prev) => {
    return prev?.map((item, index) =>
      index === shiftIndex
        ? {
            ...item,
            projections: prev[shiftIndex].projections?.map((pItem, pIndex) =>
              pIndex === projectionIndex
                ? {
                    ...pItem,
                    projection: e,
                    procedure: { ...e, quantity: 1 },
                    product: product,
                    staffSetup: [],
                  }
                : pItem
            ),
          }
        : item
    );
  });
};

const handleProjectionRemove = (shiftIndex, projectionIndex, setShifts) => {
  setShifts((prev) => {
    return prev?.map((item, index) => {
      return index === shiftIndex
        ? {
            ...item,
            projections:
              prev[index]?.projections &&
              prev[index]?.projections?.map((pItem, pIndex) => {
                return pIndex === projectionIndex
                  ? {
                      ...pItem,
                      projection: {},
                      procedure: {},
                      product: {},
                      staffSetup: [],
                    }
                  : pItem;
              }),
          }
        : item;
    });
  });
};

const handleChangeProcedureQty = (
  e,
  shiftIndex,
  projectionIndex,
  setShifts
) => {
  setShifts((prev) => {
    return prev?.map((item, index) =>
      shiftIndex === index
        ? {
            ...item,
            projections: prev[index].projections?.map((pItem, pIndex) =>
              projectionIndex === pIndex
                ? {
                    ...pItem,
                    procedure: {
                      ...pItem.procedure,
                      quantity: Math.round(e.target.value),
                    },
                    product: {
                      ...pItem['product'],
                      quantity:
                        Math.round(e.target.value) /
                        (1 / pItem['product'].yield),
                    },
                    staffSetup: [],
                  }
                : pItem
            ),
          }
        : item
    );
  });
};

const handleChangeProductQty = (e, shiftIndex, projectionIndex, setShifts) => {
  setShifts((prev) => {
    return prev.map((item, index) =>
      shiftIndex === index
        ? {
            ...item,
            projections: prev[index].projections?.map((pItem, pIndex) =>
              projectionIndex === pIndex
                ? {
                    ...pItem,
                    procedure: {
                      ...pItem.procedure,
                      quantity: Math.round(
                        Math.round(e.target.value) *
                          (1 / pItem['product'].yield)
                      ),
                    },
                    product: {
                      ...pItem['product'],
                      quantity: Math.round(e.target.value),
                    },
                    staffSetup: [],
                  }
                : pItem
            ),
          }
        : item
    );
  });
};

const handleRemoveStaffSetup = (
  e,
  shiftIndex,
  projectionIndex,
  setShifts,
  resourceShareData,
  setResourceShareData,
  shifts
) => {
  const output = shifts?.map((item, index) =>
    shiftIndex === index
      ? {
          ...item,
          projections: shifts[index]?.projections?.map((pItem, pIndex) =>
            pIndex === projectionIndex
              ? {
                  ...pItem,
                  staffSetup: shifts[shiftIndex]?.projections[
                    projectionIndex
                  ]?.staffSetup.filter((s) => s.id !== e.id),
                }
              : pItem
          ),
        }
      : item
  );
  const updatedStaffShareData = resourceShareData?.filter(
    (item) => item.staff_setup_id !== e?.id
  );
  setResourceShareData(updatedStaffShareData);
  setShifts([...output]);
};

const handleRemoveStaffSetupDonorCenter = (
  e,
  shiftIndex,
  projectionIndex,
  setShifts,
  shifts
) => {
  const output = shifts?.map((item, index) =>
    shiftIndex === index
      ? {
          ...item,
          projections: shifts[index]?.projections?.map((pItem, pIndex) =>
            pIndex === projectionIndex
              ? {
                  ...pItem,
                  staffSetup: shifts[shiftIndex]?.projections[
                    projectionIndex
                  ]?.staffSetup.filter((s) => s.id !== e.id),
                }
              : pItem
          ),
        }
      : item
  );
  setShifts([...output]);
};

const handleChangeStaffSetup = (
  e,
  shiftIndex,
  projectionIndex,
  setShifts,
  shifts
) => {
  const output = shifts?.map((item, index) =>
    shiftIndex === index
      ? {
          ...item,
          projections: shifts[index]?.projections?.map((pItem, pIndex) =>
            pIndex === projectionIndex
              ? {
                  ...pItem,
                  staffSetup: [
                    ...(shifts?.[shiftIndex]?.projections?.[projectionIndex]
                      ?.staffSetup || []),
                    e,
                  ],
                }
              : pItem
          ),
        }
      : item
  );
  setShifts([...output]);
};

const selectUnselectAllShiftSetup = (
  shiftIndex,
  projectionIndex,
  checked,
  data,
  setShifts
) => {
  setShifts((prev) => {
    return prev?.map((item, index) =>
      shiftIndex === index
        ? {
            ...item,
            projections: prev[shiftIndex].projections?.map((pItem, pIndex) =>
              projectionIndex === pIndex
                ? {
                    ...pItem,
                    staffSetup: checked ? [] : data,
                  }
                : pItem
            ),
          }
        : item
    );
  });
};

const resetProjections = (
  shiftIndex,
  projectionIndex,
  shifts,
  setShifts,
  setStaffSetupOptions
) => {
  setStaffSetupOptions((prev) => ({
    ...prev,
    staffSetupOptions: [],
    additionalStaffSetups: [],
  }));
  setShifts(() => {
    return shifts.map((shift, index) =>
      index === shiftIndex
        ? {
            ...shift,
            projections: shifts[index]?.projections?.map((pItem, pIndex) =>
              pIndex === projectionIndex
                ? {
                    projection: 0,
                    procedure: 25,
                    product: 25,
                    staffSetup: [],
                  }
                : pItem
            ),
          }
        : shift
    );
  });
};

const removeProjection = (shiftIndex, projectionIndex, shifts, setShifts) => {
  setShifts(() => {
    return shifts.map((shift, index) =>
      index === shiftIndex
        ? {
            ...shift,
            projections: shifts[index]?.projections?.filter(
              (pItem, pIndex) => projectionIndex !== pIndex
            ),
          }
        : shift
    );
  });
};

const addProjections = (shiftIndex, setShifts) => {
  setShifts((prev) => {
    return prev?.map((shift, index) =>
      index === shiftIndex
        ? {
            ...shift,
            projections: [
              ...prev[index].projections,
              { projection: 0, procedure: 25, product: 25, staffSetup: [] },
            ],
          }
        : shift
    );
  });
};

const getSingleDriveData = async (id) => {
  console.log('in get edit data drivelist', id);
  const data = await API.operationCenter.drives.getSingle(id);
  const fetchedData = data?.data?.data?.[0];
  const fetchedProjections = data?.data?.projections;
  let drive_id = fetchedData.drive.id;
  // console.log('driveA', { drive_id });
  let shiftsData = [];
  for (const shiftItem of fetchedData?.shifts || []) {
    let shiftItemData = {};

    shiftItemData.shift_id = shiftItem.id;
    shiftItemData.startTime = moment(
      covertDatetoTZDate(
        moment(shiftItem.start_time).format('ddd MMM DD YYYY HH:mm:ss')
      )
    );
    shiftItemData.endTime = moment(
      covertDatetoTZDate(
        moment(shiftItem.end_time).format('ddd MMM DD YYYY HH:mm:ss')
      )
    );
    let projectionData = [];
    const shiftProjections = fetchedProjections?.filter(
      (item) => item.shift_id == shiftItem.id
    );
    for (const shiftProjectionsStaffItem of shiftProjections) {
      const procedureLabel = shiftProjectionsStaffItem?.procedure_type?.name;
      const procedureDuration =
        shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString();
      const procedureQuantity = shiftProjectionsStaffItem?.procedure_type_qty;
      const procedureId =
        shiftProjectionsStaffItem?.procedure_type?.id?.toString();
      const procedureItem = {
        label: procedureLabel,
        procedure_duration: procedureDuration,
        quantity: procedureQuantity,
        value: procedureId,
      };
      const productItem = {
        id: shiftProjectionsStaffItem?.procedure_type?.procedure_type_products?.[0]?.product_id?.toString(),
        name: shiftProjectionsStaffItem?.procedure_type
          .procedure_type_products?.[0]?.name,
        quantity: shiftProjectionsStaffItem?.product_yield,
        yield:
          shiftProjectionsStaffItem?.procedure_type
            ?.procedure_type_products?.[0]?.quantity,
      };

      const projectionItem = {
        label: shiftProjectionsStaffItem.procedure_type.name,
        procedure_duration:
          shiftProjectionsStaffItem?.procedure_type?.procedure_duration?.toString(),
        value: shiftProjectionsStaffItem?.procedure_type?.id?.toString(),
      };

      const staffSetupItem = shiftProjectionsStaffItem?.staff_setups?.map(
        (item) => {
          return {
            beds: item.beds,
            concurrent_beds: item.concurrent_beds,
            id: item.id.toString(),
            name: item.name,
            qty: item.qty,
            stagger: item.stagger_slots,
          };
        }
      );
      projectionData.push({
        procedure: procedureItem,
        product: productItem,
        projection: projectionItem,
        staffSetup: staffSetupItem,
      });
    }
    shiftItemData.projections = projectionData;
    shiftItemData.devices =
      shiftItem.shifts_devices?.map((item) => {
        return { id: item.id.toString(), name: item.name };
      }) || [];
    shiftItemData.resources =
      shiftItem.shifts_vehicles?.map((item) => {
        return { id: item.id.toString(), name: item.name };
      }) || [];
    shiftItemData.staffBreak =
      typeof shiftItem.break_start_time == 'string' ||
      typeof shiftItem.break_end_time == 'string'
        ? true
        : false;
    if (shiftItemData.staffBreak) {
      shiftItemData.breakStartTime = moment(
        covertDatetoTZDate(shiftItem.break_start_time)
      );
      shiftItemData.breakEndTime = moment(
        covertDatetoTZDate(shiftItem.break_end_time)
      );
      shiftItemData.reduceSlot = shiftItem.reduce_slots;
      shiftItemData.reduction = shiftItem.reduction_percentage;
    } else {
      shiftItemData.breakStartTime = '';
      shiftItemData.breakEndTime = '';
      shiftItemData.reduceSlot = false;
      shiftItemData.reduction = 0.0;
    }

    shiftsData.push(shiftItemData);
  }
  const response = { drive_id, ...shiftsData };
  return response;
};

export {
  addRemoveDevices,
  handleProjectionChange,
  handleProjectionRemove,
  handleChangeProcedureQty,
  handleChangeProductQty,
  handleChangeStaffSetup,
  getSingleDriveData,
  handleRemoveStaffSetup,
  selectUnselectAllShiftSetup,
  resetProjections,
  removeProjection,
  addProjections,
  handleRemoveStaffSetupDonorCenter,
};
