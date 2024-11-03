import React, { useEffect, useState } from 'react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './MonthPicker.scss';
import moment from 'moment';
import { Backdrop, Box, Fade, Modal } from '@mui/material';
import SvgComponent from '../../../../common/SvgComponent';
import FormInput from '../../../../common/form/FormInput';
import { MonthRangePicker } from './MonthRangePicker';
import { Preset } from './presets/Presets';
import arrow from '../../../../../assets/arrow-white.svg';

const MonthRangeSelector = ({
  ranges,
  onChange,
  onSelectDate,
  dateValues,
  selectedOptions,
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
  }, [dateValues, show]);

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
  const formattedDate = () => {
    if (selectedDateRange.startDate && selectedDateRange.endDate) {
      const date = `${moment(selectedDateRange.startDate).format(
        'MMM YYYY'
      )} - ${moment(selectedDateRange.endDate).format('MMM YYYY')}`;
      return date;
    }
  };

  const getToDate = (month, year) => {
    return new Date(year, month + 1, 0, 23, 59, 59, 999);
  };

  const handleApply = (from, to) => {
    if (!to) {
      // if 'to' was not selected, set to = FROM month (ex. jan 1st 00:00:00 to jan 31st 23:59:59)
      to = getToDate(from.getMonth(), from.getFullYear());
    }
    onSelectDate({ startDate: from, endDate: to });
    setShow(false);
  };

  const handleOnChange = (onChange) => {
    setSelectedDateRange({
      startDate: onChange.from ? new Date(onChange.from) : null,
      endDate: onChange.to ? new Date(onChange.to) : null,
      key: 'selection',
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
                  {selectedDateRange && selectedDateRange.startDate
                    ? moment(selectedDateRange.startDate).format('MMM[,] YYYY')
                    : '-'}{' '}
                  -{' '}
                  {selectedDateRange.endDate
                    ? moment(selectedDateRange.endDate).format('MMM[,] YYYY')
                    : '-'}
                </span>
                <img
                  style={{ transform: 'rotate(-90deg)', cursor: 'pointer' }}
                  src={arrow}
                  alt="arrow"
                  onClick={() => {}}
                />
              </div>
              <div style={{ display: 'flex' }}>
                <MonthRangePicker
                  presetComponent={<Preset />}
                  onCancel={() => setShow(false)}
                  onApply={handleApply}
                  onChange={handleOnChange}
                  value={dateValues}
                />
              </div>
            </>
          </Box>
        </Fade>
      </Modal>
      {/* {!show && ( */}
      <FormInput
        readOnly
        type="text"
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

export default MonthRangeSelector;
