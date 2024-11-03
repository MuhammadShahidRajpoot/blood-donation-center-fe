import React, { useEffect, useState } from 'react';
import TableList from '../../../../common/tableListing';
import { Modal } from 'react-bootstrap';
import TopBar from '../../../../common/topbar/index';
import styles from '../index.module.scss';
import { BASE_URL } from '../../../../../helpers/Api';
import axios from 'axios';
import moment from 'moment';
import { toast } from 'react-toastify';
import WarningIconImage from '../../../../../assets/images/warningIcon.png';
import {
  convertToMoment,
  // formatDateWithTZ,
} from '../../../../../helpers/convertDateTimeToTimezone';
import dayjs from 'dayjs';
import { getSingleDriveData } from './helpers';

function LinkVehiclesmodel({
  setModal,
  modal,
  contactRows,
  searchText,
  setlinkedDrive,
  linkedDrive,
  setSearchText,
  list,
  selectedItems,
  setSelectedItems,
  staffShareRequired,
  setCoordinatesB,
  setCoordinatesA,
  coordinatesA,
  coordinatesB,
  bookingRules,
  setcustomErrors,
  shift,
  shareStaffData,
  selectedLinkDrive,
  setSelectedLinkDrive,
  setDriveA,
  driveA,
  driveB,
  setDriveB,
}) {
  // eslint-disable-next-line

  // useEffect(() => {
  //   console.log({ driveA, driveB });
  // }, [driveA, driveB]);

  // const [setAddDirectionData] = useState([]);
  const [checkLinkWarning, setCheckLinkWarning] = useState(false);
  const [warningTitle, setWarnigTitle] = useState('');
  const [tempSelectedItems, setTempSelectedItems] = useState([]);
  const [minutes, setMinutes] = useState(null);
  // const [disable, setDisable] = useState(false);
  const showAllCheckBoxListing = false;
  // console.log({ bookingRules });
  useEffect(() => {
    setTempSelectedItems(selectedItems);
    setSelectedLinkDrive(selectedItems);
  }, [selectedItems]);
  // console.log({ linkedDrive });
  useEffect(() => {
    if (tempSelectedItems?.length > 0)
      getCordinatesDate(tempSelectedItems?.[0]);
  }, [tempSelectedItems]);

  const createDayjsObject = (momentObject, hour, minute) => {
    const year = momentObject.year();
    const month = momentObject.month(); // Note: Moment.js months are zero-indexed
    const day = momentObject.date();
    return dayjs()
      .year(year)
      .month(month)
      .date(day)
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);
  };

  const calculateTimeDifference = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    return endTimeInMinutes - startTimeInMinutes;
  };

  const calculateDiff = () => {
    const linkStart = moment(convertToMoment(linkedDrive?.shift?.start_time));
    let linkEnd = moment(convertToMoment(linkedDrive?.shift?.end_time));
    console.log(
      'calculaating difference link',
      createDayjsObject(
        linkStart,
        linkStart.hours(),
        linkStart.minutes()
      ).format('hh:mm a')
    );
    if (!shift?.endTime && !shift.startTime) {
      shift.endTime = moment(convertToMoment(shift.end_time));
      shift.startTime = moment(convertToMoment(shift.start_time));
      console.log('in naming convention if  shift.endTime', shift.endTime);
    }
    console.log(
      'calculaating difference shift',
      shift?.endTime.format('hh:mm a')
    );
    if (
      createDayjsObject(
        linkStart,
        linkStart.hours(),
        linkStart.minutes()
      ).format('HH:mm') >= shift?.endTime.format('HH:mm')
    ) {
      console.log('inside condition A');
      let breakDurationMinutes = 0;

      if (!linkedDrive?.breakDowns || !shift?.endTime || shift?.endTime == '') {
        return toast.error('no data ');
      }

      breakDurationMinutes = linkedDrive?.breakDowns;
      console.log(
        'Break down Duration in Minutes:',
        breakDurationMinutes,
        'minutes',
        minutes
      );

      // let shiftEndTime = new Date(shift?.endTime);
      // shiftEndTime = moment(shiftEndTime);
      // console.log({ shiftEndTime });
      let totalMinutesEnd = shift?.endTime.add(breakDurationMinutes, 'm');
      totalMinutesEnd = totalMinutesEnd.add(minutes, 'm');

      console.log(
        `totalMinutesEnd.format('hh:mm a')`,
        totalMinutesEnd.format('hh:mm a')
      );
      console.log(`linkStart.format('hh:mm a')`, linkStart.format('hh:mm a'));
      // modelShow(totalMinutesEnd, true);
      console.log(
        'totalMinutesEnd.format(hh:mm a) <= moment(new Date(linkStart)',
        totalMinutesEnd.format('hh:mm a'),
        moment(new Date(linkStart)).format('hh:mm a'),
        totalMinutesEnd.format('hh:mm a') <=
          moment(new Date(linkStart)).format('hh:mm a')
      );
      if (
        totalMinutesEnd.format('HH:mm') >
        moment(new Date(linkStart)).format('HH:mm')
      ) {
        console.log(
          moment(new Date(totalMinutesEnd)),
          '>',
          moment(new Date(linkedDrive?.shift?.start_time))
        );
        setWarnigTitle(
          `Can not link it will reach at ${totalMinutesEnd.format(
            'hh:mm a'
          )} which is greater than shift start time of linkable drive`
        );
        setCheckLinkWarning(true);
        setTempSelectedItems(null);
      } else {
        console.log('linked');

        const momentLinkStart = moment(linkStart, 'HH:mm');
        linkEnd = moment(convertToMoment(linkedDrive?.shift?.end_time));
        const momentLinkEnd = moment(linkEnd, 'HH:mm');

        // const totalDurationMinutes =
        //   momentLinkStart.diff(momentLinkEnd, 'minutes') +
        //   shift?.startTime.diff(shift?.endTime, 'minutes');

        // // Calculate total hours
        // const totalHours = -totalDurationMinutes / 60;
        // console.log(`Total hours: ${totalHours} hours`);

        const linkDiff = calculateTimeDifference(
          momentLinkStart.format('HH:mm'),
          momentLinkEnd.format('HH:mm')
        );
        const shiftDiff = calculateTimeDifference(
          shift.startTime.format('HH:mm'),
          shift.endTime.format('HH:mm')
        );
        console.log({ linkDiff, shiftDiff });
        const totalDurationMinutes = linkDiff + shiftDiff;

        // Calculate total hours
        const totalHours = totalDurationMinutes / 60;
        console.log(`Total hours: ${totalHours} hours`);
        if (
          bookingRules?.maximum_draw_hours &&
          totalHours > bookingRules?.maximum_draw_hours
        ) {
          setWarnigTitle(
            `Can not link it because the total time of linkable and prospective drive excedes maximum draw hours limit`
          );
          setCheckLinkWarning(true);
          setTempSelectedItems(null);
        } else {
          console.log('linked');
        }
      }
    } else if (
      createDayjsObject(linkEnd, linkEnd.hours(), linkEnd.minutes()).format(
        'HH:mm'
      ) <= shift?.startTime.format('HH:mm')
    ) {
      let breakDurationMinutes = 0;
      console.log('inside condition B');
      if (!linkedDrive?.breakDowns || !shift?.endTime || shift?.endTime == '') {
        return toast.error('Can not link this drive');
      }

      breakDurationMinutes = linkedDrive?.breakDowns;
      console.log('Break Duration in Minutes:', breakDurationMinutes);

      // let linkedshiftStartTime = new Date(linkedDrive?.shift?.end_time);
      // linkedshiftStartTime = moment(linkedshiftStartTime);
      // console.log({ linkedshiftStartTime });
      const tempLinkEnd = linkEnd;
      let totalMinutesStart = tempLinkEnd.add(breakDurationMinutes, 'm');
      totalMinutesStart = totalMinutesStart.add(minutes, 'm');
      console.log(
        'Total start in link start time:',
        totalMinutesStart.format('hh:mm a')
      );
      // console.log(
      //   'Total start in link start time:',
      //   moment(new Date(totalMinutesStart))
      // );
      // console.log(
      //   'Total start in link start time:',
      //   moment(new Date(shift?.startTime))
      // );
      // modelShow(totalMinutesStart, false);
      if (
        moment(new Date(totalMinutesStart)).format('hh:mm a') <
        moment(new Date(shift?.startTime)).format('hh:mm a')
      ) {
        setWarnigTitle(
          `Can not link it will reach at ${moment(totalMinutesStart).format(
            'hh:mm a'
          )} which is greater than shift start time of your drive`
        );
        setCheckLinkWarning(true);
        setTempSelectedItems(null);
      } else {
        console.log('linked');
        const momentLinkStart = moment(linkStart, 'HH:mm');
        linkEnd = moment(convertToMoment(linkedDrive?.shift?.end_time));
        const momentLinkEnd = moment(linkEnd, 'HH:mm');
        // const momentShiftStartTime = moment(shift?.startTime, 'HH:mm');
        // const momentShiftEndTime = moment(shift?.endTime, 'HH:mm');
        // const sample =
        //   new Date(linkEnd).getTime() - new Date(linkStart).getTime();

        // const minutes = Math.floor((sample % (1000 * 60 * 60)) / (1000 * 60));
        // console.log(
        //   'amomentLinkEnd',
        //   momentLinkStart.hour(),
        //   momentLinkEnd.hour()
        // );
        //   (momentShiftEndTime - momentShiftStartTime) / 60
        // );

        // console.log(
        //   'calculateTimeDifference params',
        //   momentLinkStart.format('HH:mm'),
        //   momentLinkEnd.format('hh:mm a')
        // );

        const linkDiff = calculateTimeDifference(
          momentLinkStart.format('HH:mm'),
          momentLinkEnd.format('HH:mm')
        );
        const shiftDiff = calculateTimeDifference(
          shift.startTime.format('HH:mm'),
          shift.endTime.format('HH:mm')
        );
        console.log({ linkDiff, shiftDiff });
        const totalDurationMinutes = linkDiff + shiftDiff;

        // Calculate total hours
        const totalHours = totalDurationMinutes / 60;
        console.log(`Total hours: ${totalHours} hours`);
        if (
          bookingRules?.maximum_draw_hours &&
          totalHours > bookingRules?.maximum_draw_hours
        ) {
          setWarnigTitle(
            `Can not link it because the total time of current and prospective drive excedes maximum draw hours limit`
          );
          setCheckLinkWarning(true);
          setTempSelectedItems(null);
        } else {
          console.log('linked');
        }
      }
    } else {
      console.log('can not link');
      console.log({ tempSelectedItems });
      setCheckLinkWarning(true);
      setWarnigTitle(
        'Can not link because linked drive does not satisfy the condition which states that it does not starts before main drive neither starts after main drive'
      );
      setTempSelectedItems(null);
    }
  };
  useEffect(() => {
    if (minutes > -1 && linkedDrive) calculateDiff();
  }, [minutes, linkedDrive]);

  const getCordinatesDate = async (selectedItems) => {
    try {
      setMinutes(null);
      const getDate = await axios.get(
        `${BASE_URL}/drives/shift/location/${selectedItems}`
      );
      console.log({ getDate });
      // if(getDate?.)
      if (getDate?.data?.data?.address?.coordinates) {
        setCoordinatesB(getDate?.data?.data?.address?.coordinates);
        setlinkedDrive(getDate?.data?.data);
        const DriveB = await getSingleDriveData(getDate?.data?.data?.drive.id);
        console.log({ DriveB });
        setDriveB(DriveB);
      } else {
        console.log('show model');
      }
    } catch (err) {
      console.log({ err });
    }
  };

  // -------------------------------------------//
  // console.log({ coordinatesA, coordinatesB });
  useEffect(() => {
    if (coordinatesA && coordinatesB) milesApi(coordinatesA);
  }, [coordinatesA, coordinatesB]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAP_API_KEY;
    if (!window?.google || !window?.google?.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const convertIntoMiles = (metersValue) => {
    const metersInMile = 1609.34;
    const miles = metersValue / metersInMile;
    return miles;
  };

  const convertIntoMinutes = (secondsValue) => {
    const time = Math.ceil(secondsValue / 60);
    return time;
  };

  const milesApi = async (direction) => {
    console.log(direction, 'directionsss');
    const geocoder = new window.google.maps.DirectionsService();

    const request = {
      origin: {
        lat: coordinatesB.x,
        lng: coordinatesB.y,
      },
      destination: { lat: direction.x, lng: direction.y },
      travelMode: 'DRIVING',
    };
    console.log('coordinatesA', request.destination);
    console.log('coordinatesB', request?.origin);
    await new Promise((resolve, reject) => {
      window?.google?.maps?.event?.addListener(geocoder, 'ready', resolve);
      geocoder.route(request, function (result, status) {
        if (status === window?.google?.maps?.DirectionsStatus.OK) {
          const distance = result?.routes?.map((item) => {
            return item?.legs?.map((legs) => {
              return {
                distance: legs?.distance?.value,
                time: legs?.duration?.value,
              };
            });
          });

          const dist = convertIntoMiles(distance[0][0]?.distance);
          const mint = convertIntoMinutes(distance[0][0]?.time);
          console.log('dist', dist, 'mint', mint);
          setMinutes(mint);
          // setAddDirectionData((prevValue) => ({
          //   ...prevValue,
          //   miles: dist,
          //   minutes: mint,
          // }));
        } else {
          console.error(status);
        }
      });
    });
  };

  // console.log({ addDirectionData });
  // --------------------------------------------//

  const cancelSelection = async () => {
    setSelectedLinkDrive(null);
    setTempSelectedItems([]);
    setModal(false);
  };

  const TableHeaders = [
    {
      name: 'date',
      label: 'Date',
      sortable: false,
    },
    {
      name: 'account',
      label: 'Account',
      sortable: false,
    },
    {
      name: 'location',
      label: 'Location',
      sortable: false,
    },
    {
      name: 'total_time',
      label: 'Start time - End time',
      sortable: false,
    },

    {
      name: 'vehicles_name',
      label: 'Vehicles',
      sortable: false,
    },
    {
      name: 'staffSetup',
      label: 'Staff Setup',
      sortable: false,
    },
  ];

  const submitSelection = async () => {
    // setSelectedLinkDrive(null);
    // setTempSelectedItems([]);
    console.log({ tempSelectedItems });
    setSelectedLinkDrive(tempSelectedItems);
    setModal(false);
  };

  return (
    <Modal
      show={modal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Body>
        <div className="formGroup">
          <TopBar
            BreadCrumbsData={[]}
            BreadCrumbsTitle={`Link Drive`}
            // SearchValue={searchText}
            // SearchOnChange={(e) => {
            //   setSearchText(e.target.value);
            // }}
            // SearchPlaceholder={'Search Staff'}
          />
          <div className="mt-4 overflow-y-auto" style={{ height: '50vh' }}>
            <TableList
              data={shareStaffData}
              headers={TableHeaders}
              checkboxValue={shareStaffData}
              checkboxValues={tempSelectedItems}
              handleCheckboxValue={(row) => row.id}
              handleCheckbox={setTempSelectedItems}
              showAllCheckBoxListing={showAllCheckBoxListing}
              showAllRadioButtonListing={true}
              selectSingle={true}
            />
          </div>
          <div className="d-flex justify-content-end align-items-center w-100">
            <p onClick={cancelSelection} className={styles.btncancel}>
              Cancel
            </p>
            <p className={styles.btnAddContact} onClick={submitSelection}>
              Save
            </p>
          </div>
        </div>
        <section
          className={`popup full-section ${checkLinkWarning ? 'active' : ''}`}
        >
          <div className="popup-inner" style={{ maxWidth: '500px' }}>
            <div className="icon">
              <img src={WarningIconImage} alt="CancelIcon" />
            </div>
            <div className="content">
              <h3>Warning!</h3>
              <p>{warningTitle}</p>
              <div className="buttons">
                <button
                  style={{ width: '100%' }}
                  className="btn btn-primary"
                  onClick={(e) => {
                    setCheckLinkWarning(false);
                  }}
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </section>
      </Modal.Body>
    </Modal>
  );
}

export default LinkVehiclesmodel;
