import React, { useEffect, useState } from 'react';
import LineMarkChart from '../../common/dashboards/line-mark-chart/LineMarkChart';
import Styles from './styles.module.scss';

const DonorRetentionRate = ({ title, dataToDisplay }) => {
  const [newDonorRRdata, setNewDonorRRData] = useState([]);
  const [newDonorDashedData, setNewDonorDashedData] = useState([]);
  const [repeatDonorRRdata, setRepeatDonorRRdata] = useState([]);
  const [repeatDonorDashedData, setRepeatDonorDashedData] = useState([]);
  const [xAxisValuesNew, setXAxisValuesNew] = useState([]);
  const [xAxisValuesRepeat, setXAxisValuesRepeat] = useState([]);
  const [newHighlightData, setNewHighlightData] = useState([]);
  const [repeatHighlightData, setRepeatHighlightData] = useState([]);

  useEffect(() => {
    fetchNewDonorRR();
    fetchRepeatDonorRR();
  }, []);

  const fetchNewDonorRR = () => {
    const data = [
      {
        year: 2018,
        quantity_in_percentage: 19.0,
      },
      {
        year: 2019,
        quantity_in_percentage: 20.0,
      },
      {
        year: 2020,
        quantity_in_percentage: 30.0,
      },
      {
        year: 2021,
        quantity_in_percentage: 28.0,
      },
      {
        year: 2022,
        quantity_in_percentage: 52.0,
      },
    ];
    const formattedArray = [];
    const dashedData = [];
    const tickValues = [];
    const highlightDataArray = [];
    data.forEach((element) => {
      const obj = {
        x: `${element.year}`,
        y: element.quantity_in_percentage,
      };
      formattedArray.push(obj);
      const dashedObj = {
        x: `${element.year}`,
        y: 25, // check business logic for dashed line and implement here
      };
      const highlightObj = {
        x: `${element.year}`,
        y: 30, // check business logic for highlight and implement here
      };
      dashedData.push(dashedObj);
      tickValues.push(`${element.year}`);
      highlightDataArray.push(highlightObj);
    });
    setNewDonorRRData(formattedArray);
    setNewDonorDashedData(dashedData);
    setXAxisValuesNew(tickValues);
    setNewHighlightData(highlightDataArray);
  };

  const fetchRepeatDonorRR = () => {
    const data = [
      {
        year: 2018,
        quantity_in_percentage: 29.0,
      },
      {
        year: 2019,
        quantity_in_percentage: 11.7,
      },
      {
        year: 2020,
        quantity_in_percentage: 30.0,
      },
      {
        year: 2021,
        quantity_in_percentage: 21.0,
      },
      {
        year: 2022,
        quantity_in_percentage: 52.0,
      },
    ];
    const formattedArray = [];
    const dashedData = [];
    const tickValues = [];
    const highlightDataArray = [];
    data.forEach((element) => {
      const obj = {
        x: `${element.year}`,
        y: element.quantity_in_percentage,
      };
      formattedArray.push(obj);
      const dashedObj = {
        x: `${element.year}`,
        y: 20, // check business logic for dashed line and implement here
      };
      const highlightObj = {
        x: `${element.year}`,
        y: 30, // check business logic for highlight and implement here
      };
      dashedData.push(dashedObj);
      tickValues.push(`${element.year}`);
      highlightDataArray.push(highlightObj);
    });
    setRepeatDonorRRdata(formattedArray);
    setRepeatDonorDashedData(dashedData);
    setXAxisValuesRepeat(tickValues);
    setRepeatHighlightData(highlightDataArray);
  };

  console.log('newDonorRRdata :>> ', newDonorRRdata);
  return (
    <div className={Styles.container}>
      <h5 className={Styles.containerTitle}> {title} </h5>
      {/* we need this div relative wrapper so charts are responsive */}
      <div style={{ position: 'relative' }}>
        <LineMarkChart
          pgData={dataToDisplay === 'new' ? newDonorRRdata : repeatDonorRRdata}
          yAxisAdditionalChar={'%'}
          displayDataOnHover={false}
          dashedData={
            dataToDisplay === 'new' ? newDonorDashedData : repeatDonorDashedData
          }
          xAxisType={'linear'}
          tickValues={
            dataToDisplay === 'new' ? xAxisValuesNew : xAxisValuesRepeat
          }
          highligthedAreaValue={
            dataToDisplay === 'new' ? newHighlightData : repeatHighlightData
          }
        />
      </div>
    </div>
  );
};
export default DonorRetentionRate;
