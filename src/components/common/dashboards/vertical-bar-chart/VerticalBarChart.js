/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import {
  XAxis,
  YAxis,
  VerticalBarSeries,
  VerticalGridLines,
  HorizontalGridLines,
  LabelSeries,
  FlexibleXYPlot,
} from 'react-vis';
import 'react-vis/dist/style.css';

const VerticalBarChart = ({ data, yAxisAdditionalChar, height = '360px' }) => {
  const currentRef = useRef(null);
  useEffect(() => {
    const pageDiv = currentRef.current;
    if (!pageDiv) return;

    const chart = pageDiv.querySelector('.rv-xy-plot');
    chart.style.position = 'absolute';
    chart.style.overflow = 'hidden';

    const svg = pageDiv.querySelector('.rv-xy-plot__inner');
    const array = svg?.querySelectorAll('rect');
    const prevDefs = svg?.querySelector('defs');
    if (prevDefs) {
      svg.removeChild(prevDefs);
    }
    const rects = [];
    if (array && array.length > 0) {
      array.forEach((rect, index) => {
        rect.removeAttribute('clip-path');
      });
      array.forEach((e) => {
        const rect = {};
        rect.height = e.getAttribute('height');
        rect.width = e.getAttribute('width');
        rect.x = e.getAttribute('x');
        rect.y = e.getAttribute('y');
        rects.push(rect);
      });
      const defs = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'defs'
      );
      rects.forEach((oldRect, index) => {
        const clipPath = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'clipPath'
        );
        clipPath.setAttribute('id', `round-corner-${index}`);

        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );

        rect.setAttribute('x', oldRect.x);
        rect.setAttribute('y', oldRect.y);
        rect.setAttribute('width', oldRect.width);
        rect.setAttribute('height', Number(oldRect.height) + 15);
        rect.setAttribute('rx', 10);
        rect.setAttribute('ry', 10);

        clipPath.appendChild(rect);
        defs.appendChild(clipPath);
      });

      svg.appendChild(defs);

      array.forEach((rect, index) => {
        rect.setAttribute('clip-path', `url(#round-corner-${index})`);
      });
    }
  }, [data]);

  const calculateMaxYDecimal = (number) => {
    if (number === 0) {
      return 1;
    } else if (number % 1 === 0) {
      return number + 1;
    } else if (number % 1 < 0.5) {
      return Math.round(number * 2) / 2;
    } else {
      return Math.ceil(number);
    }
  };

  const highestY = data
    ? data.reduce((acc, val) => (val.y > acc ? val.y : acc), 0)
    : 0;

  const maxY =
    highestY >= 10
      ? Math.floor(highestY / 10) * 10 + 10
      : calculateMaxYDecimal(highestY);
  return (
    <div style={{ width: '100%', height: height, bottom: 0 }} ref={currentRef}>
      <FlexibleXYPlot
        xType="ordinal"
        colorType={'literal'}
        yDomain={[0, maxY]}
        animation={true}
      >
        <VerticalGridLines
          style={{ stroke: 'gray', strokeWidth: '1px', opacity: 0.1 }}
        />
        <HorizontalGridLines
          style={{ stroke: 'gray', strokeWidth: '1px', opacity: 0.1 }}
        />
        <VerticalBarSeries data={data} />

        <LabelSeries
          data={data.map((obj) => {
            return {
              ...obj,
              label: yAxisAdditionalChar
                ? `${obj.y.toString()}${yAxisAdditionalChar}`
                : obj.y.toString(),
              style: { fontSize: '12px', fill: obj.color },
              yOffset: -7,
            };
          })}
          labelAnchorX="middle"
          labelAnchorY="text-after-edge"
        />

        <XAxis />
        <YAxis
          tickFormat={(t) =>
            yAxisAdditionalChar ? `${t}${yAxisAdditionalChar}` : t
          }
        />
      </FlexibleXYPlot>
    </div>
  );
};

export default VerticalBarChart;
