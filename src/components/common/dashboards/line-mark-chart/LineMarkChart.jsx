import React, { useEffect, useState, useRef } from 'react';
import { FlexibleXYPlot, Hint, LineSeries } from 'react-vis';
import {
  XAxis,
  YAxis,
  LineMarkSeries,
  HorizontalGridLines,
  VerticalGridLines,
} from 'react-vis';
import 'react-vis/dist/style.css';
import { HintTextAndValue } from './HintTextAndValue';

const dotStyleFirst = {
  strokeWidth: 2,
  fill: 'white',
  stroke: '#387DE5',
};

const dotStyleSecond = {
  strokeWidth: 2,
  fill: 'white',
  stroke: '#005375',
};

const LineMarkChart = ({
  yAxisAdditionalChar,
  pgData,
  ptData,
  height = '360px',
  dashedData = null,
  xAxisType,
  hoverData = null,
  tickValues,
  highligthedAreaValue,
}) => {
  const [hoveredData, setHoveredData] = useState(null);

  const currentRef = useRef(null);

  useEffect(() => {
    const pageDiv = currentRef.current;
    if (!pageDiv) return;
    function adjustGraph() {
      const lines = pageDiv.querySelectorAll(
        '.rv-xy-plot__series.rv-xy-plot__series--linemark'
      );

      if (lines && lines.length > 0) {
        const circles1 = lines[0].querySelectorAll('circle');
        const circles2 = lines[1].querySelectorAll('circle');

        const eventListenerEnter = (circle, partnerCircle) => () => {
          circle.setAttribute('r', '6');
          partnerCircle.setAttribute('r', '6');
        };

        const eventListenerLeave = (circle, partnerCircle) => () => {
          circle.setAttribute('r', '5');
          partnerCircle.setAttribute('r', '5');
        };
        if (hoverData) {
          for (let i = 0; i < circles1.length; i++) {
            circles1[i].addEventListener(
              'mouseenter',
              eventListenerEnter(circles1[i], circles2[i])
            );
            circles1[i].addEventListener(
              'mouseleave',
              eventListenerLeave(circles1[i], circles2[i])
            );
            circles2[i].addEventListener(
              'mouseenter',
              eventListenerEnter(circles2[i], circles1[i])
            );
            circles2[i].addEventListener(
              'mouseleave',
              eventListenerLeave(circles2[i], circles1[i])
            );
          }
        }
      }
    }
    adjustGraph(); // Adjust on initial load
  }, [currentRef]);

  const handleValueMouseOver = (v, data) => {
    const matchingObj = data.find((d) => d.x === v.x);
    const hoveredData = {
      pg: matchingObj.pg,
      pt: matchingObj.pt,
      goal: matchingObj.goal,
      target: matchingObj.target,
      deficit: matchingObj.deficit,
      scheduled: matchingObj.scheduled,
      onHold: matchingObj.onHold,
      x: matchingObj.x,
      y: matchingObj.y,
    };
    setHoveredData(hoveredData);
  };

  const calculateMaxYDecimal = (number) => {
    if (number % 1 < 0.5) {
      return Math.round(number * 2) / 2;
    } else {
      return Math.ceil(number);
    }
  };

  const highestYFirst = pgData
    ? pgData.reduce((acc, val) => (val.y > acc ? val.y : acc), 0)
    : 0;

  const highestYSecond = ptData
    ? ptData.reduce((acc, val) => (val.y > acc ? val.y : acc), 0)
    : 0;

  const maxY =
    highestYFirst >= highestYSecond
      ? highestYFirst >= 10
        ? Math.floor(highestYFirst / 10) * 10 + 20
        : calculateMaxYDecimal(highestYFirst)
      : highestYSecond >= 10
      ? Math.floor(highestYSecond / 10) * 10 + 20
      : calculateMaxYDecimal(highestYSecond);

  const formatTickText = (t, index) => {
    const isFirst = index === 0;
    const isLast = index === tickValues.length - 1;

    const textStyle = {
      textAnchor: isLast ? 'end' : 'start',
    };

    // Apply the style to the first and last ticks only
    return <tspan style={isFirst || isLast ? textStyle : null}>{`${t}`}</tspan>;
  };

  return (
    <div
      style={{
        width: '100%',
        height: height,
        position: 'absolute',
        overflow: 'hidden',
      }}
      ref={currentRef}
    >
      <FlexibleXYPlot xType={xAxisType} yDomain={[0, maxY]}>
        <VerticalGridLines />
        <HorizontalGridLines />
        <XAxis
          tickFormat={(t, index) => formatTickText(t, index)}
          tickValues={tickValues}
          style={{
            text: { fontSize: '10px' },
          }}
        />
        <YAxis
          tickFormat={(t) =>
            yAxisAdditionalChar ? `${t}${yAxisAdditionalChar}` : t
          }
          style={{
            text: { fontSize: '10px' },
          }}
        />
        {highligthedAreaValue && (
          <LineSeries
            data={dashedData}
            color={'#D4EAFF'}
            strokeWidth={'100px'}
            opacity={0.5}
          />
        )}
        {dashedData && (
          <LineSeries
            data={dashedData}
            strokeStyle={'dashed'}
            color={'#CED8E5'}
          />
        )}

        {pgData && (
          <LineMarkSeries
            data={pgData}
            curve={'curveMonotoneX'}
            markStyle={dotStyleFirst}
            color={'#387DE5'}
            strokeWidth={'4px'}
            onValueMouseOver={(v) => {
              hoverData && handleValueMouseOver(v, hoverData);
            }}
            onValueMouseOut={() => {
              hoverData && setHoveredData(null);
            }}
          />
        )}

        {ptData && (
          <LineMarkSeries
            data={ptData}
            curve={'curveMonotoneX'}
            markStyle={dotStyleSecond}
            color={'#005375'}
            strokeWidth={'4px'}
            onValueMouseOver={(v) => {
              hoverData && handleValueMouseOver(v, hoverData);
            }}
            onValueMouseOut={() => {
              hoverData && setHoveredData(null);
            }}
          />
        )}

        {hoveredData && (
          <Hint
            value={{ x: hoveredData.x, y: hoveredData.y }}
            style={{ marginLeft: '10px' }}
          >
            <div
              style={{
                padding: '10px',
                border: '1px solid #80808040',
                borderRadius: '5px',
                backgroundColor: 'white',
              }}
            >
              <HintTextAndValue
                text={'P/G:'}
                value={`${hoveredData.pg}%`}
                circleColor={'#387DE5'}
              />
              <HintTextAndValue
                text={'P/T:'}
                value={`${hoveredData.pt}%`}
                circleColor={'#005375'}
              />
              <br />
              <HintTextAndValue text={'Goal:'} value={`${hoveredData.goal}`} />
              <HintTextAndValue
                text={'Target:'}
                value={`${hoveredData.target}`}
              />
              <HintTextAndValue
                text={'Scheduled:'}
                value={`${hoveredData.scheduled}`}
              />
              <HintTextAndValue
                text={'Deficit:'}
                value={`(${hoveredData.pt})`}
              />
              <HintTextAndValue text={'On Hold:'} value={`${hoveredData.pt}`} />
            </div>
          </Hint>
        )}
      </FlexibleXYPlot>
    </div>
  );
};

export default LineMarkChart;
