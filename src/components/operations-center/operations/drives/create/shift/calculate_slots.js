import moment from 'moment';
import { covertToTimeZone } from '../../../../../../helpers/convertDateTimeToTimezone';
import dayjs from 'dayjs';

export function CalculateSlots(
  shifts,
  currentShift,
  shiftIndex,
  setReductionStep,
  allowAppointmentAtShiftEndTime,
  setShiftSlots
) {
  // console.log(
  //   'Calculate Slots',
  //   currentShift.startTime,
  //   new Date(currentShift.startTime)
  // );

  let shiftTotalSlots = [];
  let sumOfReductions = 0;
  for (let i = 0; i < currentShift?.projections?.length; i++) {
    const projectionItem = currentShift.projections[i];
    const breakStartTime = currentShift.breakStartTime
      ? moment(
          dayjs.isDayjs(currentShift?.breakStartTime)
            ? currentShift?.breakStartTime?.toDate()
            : currentShift?.breakStartTime
        )
      : '';
    if (breakStartTime != '') {
      breakStartTime.seconds(0);
      breakStartTime.milliseconds(0);
    }
    const breakEndTime = currentShift.breakEndTime
      ? moment(
          dayjs.isDayjs(currentShift?.breakEndTime)
            ? currentShift?.breakEndTime?.toDate()
            : currentShift?.breakEndTime
        )
      : '';
    if (breakEndTime != '') {
      breakEndTime.seconds(0);
      breakEndTime.milliseconds(0);
    }
    const hasStaffBreak = currentShift.staffBreak;
    const reduceSlots = currentShift.reduceSlot;
    // Loop Over each staff Setup selected for procedure in Projection
    for (let j = 0; j < projectionItem?.staffSetup?.length; j++) {
      // Staff Setup Selected
      const staffSetupItem = projectionItem?.staffSetup[j];

      // No Of Beds in Staff Setup
      const noOfBeds = staffSetupItem.beds;

      // No Of Concurrent Beds in Staff Setup
      const concurrentBeds = staffSetupItem.concurrent_beds;

      // Stagger Minutes for Staff Setup
      const stagger = staffSetupItem.stagger;

      // Procedure Duration for Procedure Selected
      const procedureDuration = projectionItem?.procedure?.procedure_duration;

      // Start time of the currentShift
      // const shiftStartTimeM = moment(currentShift?.startTime);
      const shiftStartTimeM = moment(
        dayjs.isDayjs(currentShift?.startTime)
          ? currentShift?.startTime?.toDate()
          : currentShift?.startTime
      );
      shiftStartTimeM.seconds(0);
      shiftStartTimeM.milliseconds(0);

      // End time of the currentShift
      // const shiftEndTimeM = moment(currentShift?.endTime);
      const shiftEndTimeM = moment(
        dayjs.isDayjs(currentShift?.endTime)
          ? currentShift?.endTime?.toDate()
          : currentShift?.endTime
      );
      shiftEndTimeM.seconds(0);
      shiftEndTimeM.milliseconds(0);
      let noOfSlotsInBreak = 0;
      for (
        let start = moment(breakStartTime);
        start < breakEndTime;
        start.add(parseInt(procedureDuration), 'minutes')
      ) {
        noOfSlotsInBreak++;
      }
      const minNoOfReduceSlot = noOfSlotsInBreak - 1;
      const reductionValue = 100 - (minNoOfReduceSlot / noOfSlotsInBreak) * 100;
      sumOfReductions += reductionValue;
      const slotsToRemove = parseInt(
        Math.round(
          (parseFloat(currentShift.reduction) / 100) * noOfSlotsInBreak
        )
      );
      let bedsCovered = 0;
      for (let bed = 0; bed < noOfBeds; bed++) {
        let skippedSlots = 0;
        // Below will contain slots for bed in Staff Setup Projection
        if (noOfBeds > concurrentBeds && bedsCovered == concurrentBeds) {
          shiftStartTimeM.add(stagger, 'minutes');
          bedsCovered = 1;
        } else {
          bedsCovered++;
        }
        const slotsForBedInStaffSetupProjection = [];
        for (
          let start = moment(shiftStartTimeM);
          start <= shiftEndTimeM;
          start.add(procedureDuration, 'minutes')
        ) {
          const slotStartTime = moment(start);
          const slotEndTime = moment(start).add(
            parseInt(procedureDuration),
            'minutes'
          );
          if (breakStartTime != '' && breakEndTime != '' && hasStaffBreak) {
            // Handle Slots where currentShift has break
            if (reduceSlots && slotsToRemove > 0) {
              // Handle Reduce Slots
              if (
                !(
                  slotStartTime.isSameOrAfter(breakStartTime) &&
                  slotStartTime.isBefore(breakEndTime)
                )
              ) {
                if (allowAppointmentAtShiftEndTime) {
                  if (slotStartTime.isSameOrBefore(shiftEndTimeM))
                    slotsForBedInStaffSetupProjection.push({
                      startTime: covertToTimeZone(slotStartTime),
                      endTime: covertToTimeZone(slotEndTime),
                      bed: bed + 1,
                    });
                } else {
                  if (
                    slotStartTime.isBefore(shiftEndTimeM) &&
                    slotEndTime.isBefore(shiftEndTimeM)
                  )
                    slotsForBedInStaffSetupProjection.push({
                      startTime: covertToTimeZone(slotStartTime),
                      endTime: covertToTimeZone(slotEndTime),
                      bed: bed + 1,
                    });
                }
              } else {
                if (skippedSlots < slotsToRemove) {
                  if (allowAppointmentAtShiftEndTime) {
                    if (slotStartTime.isSameOrBefore(shiftEndTimeM))
                      slotsForBedInStaffSetupProjection.push({
                        startTime: covertToTimeZone(slotStartTime),
                        endTime: covertToTimeZone(slotEndTime),
                        bed: bed + 1,
                      });
                  } else {
                    if (
                      slotStartTime.isBefore(shiftEndTimeM) &&
                      slotEndTime.isBefore(shiftEndTimeM)
                    )
                      slotsForBedInStaffSetupProjection.push({
                        startTime: covertToTimeZone(slotStartTime),
                        endTime: covertToTimeZone(slotEndTime),
                        bed: bed + 1,
                      });
                  }
                  skippedSlots++;
                }
              }
            } else {
              // Fixed
              if (
                !(
                  slotStartTime.isSameOrAfter(breakStartTime) &&
                  slotStartTime.isBefore(breakEndTime)
                )
              ) {
                if (allowAppointmentAtShiftEndTime) {
                  if (slotStartTime.isSameOrBefore(shiftEndTimeM))
                    slotsForBedInStaffSetupProjection.push({
                      startTime: covertToTimeZone(slotStartTime),
                      endTime: covertToTimeZone(slotEndTime),
                      bed: bed + 1,
                    });
                } else {
                  if (
                    slotStartTime.isBefore(shiftEndTimeM) &&
                    slotEndTime.isBefore(shiftEndTimeM)
                  )
                    slotsForBedInStaffSetupProjection.push({
                      startTime: covertToTimeZone(slotStartTime),
                      endTime: covertToTimeZone(slotEndTime),
                      bed: bed + 1,
                    });
                }
              }
            }
          } else {
            if (allowAppointmentAtShiftEndTime) {
              if (slotStartTime.isSameOrBefore(shiftEndTimeM))
                slotsForBedInStaffSetupProjection.push({
                  startTime: covertToTimeZone(slotStartTime),
                  endTime: covertToTimeZone(slotEndTime),
                  bed: bed + 1,
                });
            } else {
              if (
                slotStartTime.isBefore(shiftEndTimeM) &&
                slotEndTime.isBefore(shiftEndTimeM)
              )
                slotsForBedInStaffSetupProjection.push({
                  startTime: covertToTimeZone(slotStartTime),
                  endTime: covertToTimeZone(slotEndTime),
                  bed: bed + 1,
                });
            }
          }
        }
        const tempSlotsItem = {
          bed: bed,
          items: slotsForBedInStaffSetupProjection,
          procedure_type_id:
            shifts[shiftIndex]?.projections?.[i]?.procedure?.value,
          staff_setup_id:
            shifts[shiftIndex]?.projections?.[i]?.staffSetup?.[j]?.id,
        };
        shiftTotalSlots.push(tempSlotsItem);
      }
    }
  }
  setReductionStep(parseInt(Math.floor(sumOfReductions)));
  setShiftSlots((prev) => ({
    ...prev,
    [shiftIndex]: shiftTotalSlots,
  }));
}
