import React, { useState } from 'react';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './summary.scss';

function AccordionItem({ data }) {
  const [isActive, setIsActive] = useState(true);

  const toggleAccordion = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <tr>
        <td colSpan="4" className="bgFadeBlue headingText">
          {data?.change_in}
        </td>
        <td className="bgFadeBlue">
          <FontAwesomeIcon
            width={15}
            height={15}
            icon={isActive ? faChevronUp : faChevronDown}
            className="mr-3"
            role="button"
            onClick={toggleAccordion}
          />
        </td>
      </tr>
      {isActive &&
        data?.changes?.map((item, key) => (
          <tr key={key}>
            <td className="bgFadeBlue headingText">{item.change_what}</td>
            <td>{item.change_from}</td>
            <td>{item.change_to}</td>
            <td>{item.changed_when}</td>
            <td></td>
          </tr>
        ))}
    </>
  );
}

export default AccordionItem;
