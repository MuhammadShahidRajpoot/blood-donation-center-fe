import React, { useState } from 'react';
import SvgComponent from '../../../common/SvgComponent';
import Styles from './card.module.scss';

const Card = ({
  iconName,
  text,
  number,
  isGradientCard = false,
  backgroundColor1,
  backgroundColor2,
  toolTipData,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {toolTipData && showTooltip && (
        <div className={Styles.toolTipWrapper}>
          <div className={Styles.flexColumnGap4}>
            <div className={Styles.toolTipHeaderText}>{text}</div>
            <div className={Styles.toolTipNumber}>{number}</div>
            {toolTipData.map((tooltip, index) => (
              <div className={Styles.toolTipDataWrapper} key={index}>
                {' '}
                <div className={Styles.toolTipNormalText} style={{ flex: 1 }}>
                  {tooltip.title}
                </div>
                <div className={Styles.toolTipNormalText}>
                  {`${tooltip.value}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={isGradientCard ? Styles.gradientCard : Styles.rateCard}
        style={{
          background: isGradientCard
            ? `linear-gradient(135deg, ${backgroundColor1} 0%, ${backgroundColor2} 100%)`
            : '#EFEFEF',
        }}
      >
        <div className={Styles.content}>
          <div className={Styles.text}>
            <h6>{text}</h6>
          </div>
          <div className={Styles.number}>
            {isGradientCard ? <h3>{number}</h3> : <h1>{number}</h1>}
          </div>
        </div>
        <div className={Styles.icon}>
          <SvgComponent name={`${iconName}`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
