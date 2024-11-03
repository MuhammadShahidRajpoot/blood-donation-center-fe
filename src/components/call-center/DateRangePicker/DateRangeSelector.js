import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-date-range';
import { defaultStaticRanges } from './defaultRanges';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './Datepicker.scss';
import PropTypes from 'prop-types';
import moment from 'moment';
import FormInput from '../../common/form/FormInput';
import { Backdrop, Box, Fade, Modal } from '@mui/material';
import SvgComponent from '../../common/SvgComponent';
import arrow from '../../../assets/arrow-white.svg';
const DateRangeSelector = ({
  ranges,
  onChange,
  onSelectDate,
  dateValues,
  selectedOptions,
  backgroundColor,
  ...rest
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: dateValues?.startDate || null,
    endDate: dateValues?.endDate || null,
    key: 'selection',
  });
  const [show, setShow] = useState(false);
  useEffect(() => {
    setSelectedDateRange({
      startDate: dateValues.startDate ? new Date(dateValues?.startDate) : null,
      endDate: dateValues.endDate ? new Date(dateValues?.endDate) : null,
      key: 'selection',
    });
  }, [dateValues]);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 24,
  };

  const handleStartSelect = (startDate) => {
    if (selectedDateRange.endDate && startDate > selectedDateRange.endDate) {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          startDate: selectedDateRange.endDate,
          endDate: startDate,
        };
      });
    } else if (!selectedDateRange.endDate) {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          startDate: startDate,
          endDate: startDate,
        };
      });
    } else {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          startDate: startDate,
        };
      });
    }
  };

  const handleEndSelect = (endDate) => {
    if (selectedDateRange.startDate && endDate < selectedDateRange.startDate) {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          startDate: endDate,
          endDate: selectedDateRange.startDate,
        };
      });
    } else if (!selectedDateRange.startDate) {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          startDate: endDate,
          endDate: endDate,
        };
      });
    } else {
      setSelectedDateRange((pre) => {
        return {
          ...pre,
          endDate: endDate,
        };
      });
    }
  };

  const onClickDone = () => {
    onSelectDate(selectedDateRange);
    setShow(false);
  };

  const onClickClear = () => {
    setSelectedDateRange({
      startDate: null,
      endDate: null,
      key: 'selection',
    });
    onSelectDate({
      startDate: null,
      endDate: null,
      key: 'selection',
    });
    setShow(false);
  };
  const formattedDate = () => {
    if (selectedDateRange.startDate && selectedDateRange.endDate) {
      const date = `${moment(selectedDateRange.startDate).format(
        'MMM DD YYYY'
      )}-${moment(selectedDateRange.endDate).format('MMM DD YYYY')}`;
      return date;
    }
  };

  const handlePreRangeClick = (data) => {
    const tempRange = defaultStaticRanges.filter((pre) => pre.label === data);

    setSelectedDateRange((pre) => {
      return {
        ...pre,
        startDate: tempRange[0].range.startDate,
        endDate: tempRange[0].range.endDate,
      };
    });
  };
  return (
    <React.Fragment>
      <Modal
        open={show}
        onClose={() => setShow(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        hideBackdrop={true}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={show}>
          <Box sx={style}>
            <>
              <div
                className="flex align-items-center text-white"
                style={{
                  fontSize: '18px',
                  padding: '15px 30px',
                  backgroundColor: '#387DE5',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <img
                  style={{ transform: 'rotate(90deg)', cursor: 'pointer' }}
                  src={arrow}
                  alt="arrow"
                  onClick={() => {}}
                />
                <span className="">
                  {selectedDateRange.startDate
                    ? moment(selectedDateRange.startDate).format('MMM DD YYYY')
                    : '-'}{' '}
                  -{' '}
                  {selectedDateRange.endDate
                    ? moment(selectedDateRange.endDate).format('MMM DD YYYY')
                    : '-'}
                </span>
                <img
                  style={{ transform: 'rotate(-90deg)', cursor: 'pointer' }}
                  src={arrow}
                  alt="arrow"
                  onClick={() => setShow(false)}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <div className="easyDataContainer">
                  {defaultStaticRanges.map((pre, index) => {
                    return (
                      <div
                        className="easyDateSelect"
                        onClick={() => handlePreRangeClick(pre.label)}
                        key={index}
                      >
                        {pre.label}
                      </div>
                    );
                  })}
                </div>
                <Calendar
                  showMonthArrow={false}
                  date={selectedDateRange.startDate}
                  onChange={handleStartSelect}
                />
                <div>
                  <Calendar
                    showMonthArrow={false}
                    date={selectedDateRange.endDate}
                    onChange={handleEndSelect}
                  />
                  <div
                    className="d-flex justify-content-end  align-items-center gap-4"
                    style={{
                      padding: '20px',
                    }}
                  >
                    <button
                      className="btn border-0 px-4"
                      onClick={onClickClear}
                      style={{
                        fontSize: '16px',
                        color: '#387DE5',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className=""
                      style={{
                        padding: '12px 35px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        backgroundColor: '#387DE5',
                      }}
                      onClick={onClickDone}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </>
          </Box>
        </Fade>
      </Modal>
      {/* {!show && ( */}
      <FormInput
        readOnly
        type="text"
        style={{ backgroundColor: backgroundColor ? 'transparent' : '' }}
        classes={{ root: 'w-100' }}
        className="form-control"
        name={'date_range'}
        value={formattedDate()}
        onClick={() => {
          setShow(true);
        }}
        onClickIcon={() => {
          setShow(true);
        }}
        icon={<SvgComponent name="DateRange" />}
        displayName={'Date Range'}
        required={false}
      />
      {/* )} */}
    </React.Fragment>
  );
};

DateRangeSelector.defaultProps = {
  ranges: defaultStaticRanges,
};

DateRangeSelector.propTypes = {
  /**
   * On Submit
   */
  onSelectDate: PropTypes.func,
  onClickClear: PropTypes.func,
  dateValue: PropTypes.object,
  selectedOptions: PropTypes.object,
};

export default DateRangeSelector;
