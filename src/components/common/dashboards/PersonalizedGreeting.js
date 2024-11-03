import React, { useState } from 'react';
import Styles from './styles.module.scss';
import OrganizationalPopup, { OLPageNames } from '../Organization/Popup';
import OrganizationalDropdown from '../Organization/DropDown';
import { formatDateWithTZ } from '../../../helpers/convertDateTimeToTimezone';
import { OrganizationalLevelsContext } from '../../../Context/OrganizationalLevels';

const PersonalizedGreeting = ({ setOrgLevels, showOrgLevelFilter = true }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [organizationalLevels, setOrganizationalLevels] = useState();
  const [OLLabels, setOLLabels] = useState([]);
  const [OLClear, setOLClear] = useState(false);
  const { clearOLData } = React.useContext(OrganizationalLevelsContext);

  const greeting = () => {
    // first convert Date object to ISO String for the formatting method
    const currentDate = formatDateWithTZ(new Date().toISOString());
    // then convert back to Date obj and get hours
    const currentHour = new Date(currentDate).getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning,';
    } else if (currentHour >= 12 && currentHour < 17) {
      return 'Good Afternoon,';
    } else {
      return 'Good Evening,';
    }
  };

  const handleApply = async (itemsSelected) => {
    setIsPopupVisible(false);
    const orgLevels =
      typeof itemsSelected === 'string'
        ? itemsSelected
        : JSON.stringify(itemsSelected);
    setOrganizationalLevels(orgLevels);
    setOrgLevels(orgLevels);
  };
  return (
    <React.Fragment>
      <div className={Styles.personalizedGreetingContainer}>
        <div>
          <h5 className={Styles.greeting}>{greeting()}</h5>
          <h2 className={Styles.name}>
            {localStorage.getItem('userFullName')}
          </h2>
        </div>

        {showOrgLevelFilter && (
          <div>
            <div className={`${Styles.organizationalLevelDropdown}`}>
              <OrganizationalDropdown
                labels={OLLabels}
                handleClear={() => {
                  setOrganizationalLevels(null);
                  setOLLabels('');
                  handleApply('');
                  setOLClear(true);
                  clearOLData(OLPageNames.OC_DASHBOARD);
                }}
                handleClick={() => setIsPopupVisible(true)}
              />
            </div>

            <OrganizationalPopup
              value={organizationalLevels}
              showConfirmation={isPopupVisible}
              onCancel={() => setIsPopupVisible(false)}
              onConfirm={handleApply}
              setLabels={setOLLabels}
              heading={'Organization Level'}
              showRecruiters
              clear={OLClear}
              pageName={OLPageNames.OC_DASHBOARD}
            />
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default PersonalizedGreeting;
