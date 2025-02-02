import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import TopBar from '../../../../../../common/topbar/index';
import AliasForm from '../components/AliasForm';
import NavTabs from '../../../../../../common/navTabs/index';
import { accountTabs } from '../../tabs';
import SuccessPopUpModal from '../../../../../../common/successModal';
import CancelModalPopUp from '../../../../../../common/cancelModal';

function HandleError(text) {
  if (!text || text === '') {
    return 'Alias name is required';
  }
  if (text?.length < 3) {
    return 'Alias name should be atleast 3 characters longer';
  }
  if (text?.length > 50) {
    return 'Maximum 50 characters are allowed';
  }
  return null;
}

const AliasEditCreate = () => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const bearerToken = localStorage.getItem('token');
  const location = useLocation();
  const currentLocation = location.pathname;
  const { state } = useLocation();
  const [searchText, setSearchText] = useState('');
  const [showModel, setShowModel] = useState(false);
  const [error, setError] = useState();
  const [alias, setAlias] = useState();
  const [closeModal, setCloseModal] = useState(false);
  const BreadcrumbsData = [
    {
      label: 'System Configurations',
      class: 'disable-label',
      link: '#',
    },
    {
      label: 'CRM Administration',
      class: 'disable-label',
      link: '#',
    },
    {
      label: 'Account',
      class: 'disable-label',
      link: '#',
    },
    {
      label: 'Set Alias',
      class: 'active-label',
      link: '/system-configuration/tenant-admin/crm-admin/accounts/alias/edit',
    },
  ];

  const searchFieldChange = (e) => {
    setSearchText(e.target.value);
  };

  if (searchText) {
    console.log(searchText);
  }

  const handleChange = (e) => {
    setError();
    setAlias({
      ...alias,
      text: e.target.value,
    });
  };

  const postData = async () => {
    try {
      const body = {
        text: alias?.text,
        type: 'ACCOUNT',
      };
      let response = await fetch(`${BASE_URL}/crm-admin/alias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(body),
      });
      response = await response.json();
      if (response?.status_code === 201) {
        setShowModel(true);
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };

  const handleSubmit = () => {
    const errorMessage = HandleError(alias?.text);
    if (errorMessage) {
      setError(errorMessage);
    } else {
      postData();
    }
  };

  useEffect(() => {
    if (state && state?.alias) {
      setAlias(state?.alias);
    }
  }, [state]);

  return (
    <>
      <div className="mainContent">
        <TopBar
          BreadCrumbsData={BreadcrumbsData}
          BreadCrumbsTitle={'Alias'}
          SearchPlaceholder={'Search'}
          SearchValue={null}
          SearchOnChange={searchFieldChange}
        />
        <div className="filterBar">
          <NavTabs tabs={accountTabs()} currentLocation={currentLocation} />
        </div>
        <AliasForm
          isEdit={true}
          value={alias?.text}
          handleChange={handleChange}
          error={error}
        />
        <div className="form-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setCloseModal(true)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit()}
          >
            Save
          </button>
        </div>
      </div>
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={true}
        setModalPopUp={setCloseModal}
        redirectPath={
          '/system-configuration/tenant-admin/crm-admin/accounts/alias'
        }
      />
      <SuccessPopUpModal
        title="Success!"
        message="Alias set."
        modalPopUp={showModel}
        isNavigate={true}
        setModalPopUp={setShowModel}
        showActionBtns={true}
        redirectPath={
          '/system-configuration/tenant-admin/crm-admin/accounts/alias'
        }
      />
    </>
  );
};

export default AliasEditCreate;
