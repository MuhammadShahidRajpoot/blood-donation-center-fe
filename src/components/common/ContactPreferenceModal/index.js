import React, { useEffect, useState } from 'react';
import Mystyles from './index.module.scss';
import DatePicker from 'react-datepicker';
import CancelModalPopUp from '../cancelModal';

const ContactPreferenceModal = ({
  nectCallDate = true,
  openModal,
  handleModalButtons,
  newContactPreference,
  setOpenModal,
}) => {
  const [closeModal, setCloseModal] = useState(false);
  const [changedContactPreferences, setChangedContactPreferences] = useState({
    contact_preferenceable_id: newContactPreference.volunteerId,
    contact_preferenceable_type:
      newContactPreference.contact_preferenceable_type,
    next_call_date: newContactPreference?.next_call_date
      ? new Date(newContactPreference.next_call_date)
      : new Date(),
    is_optout_email: newContactPreference.is_optout_email,
    is_optout_sms: newContactPreference.is_optout_sms,
    is_optout_push: newContactPreference.is_optout_push,
    is_optout_call: newContactPreference.is_optout_call,
  });

  useEffect(() => {
    setChangedContactPreferences({
      contact_preferenceable_id: newContactPreference.volunteerId,
      contact_preferenceable_type:
        newContactPreference.contact_preferenceable_type,
      next_call_date: newContactPreference?.next_call_date
        ? new Date(newContactPreference.next_call_date)
        : new Date(),
      is_optout_email: newContactPreference.is_optout_email,
      is_optout_sms: newContactPreference.is_optout_sms,
      is_optout_push: newContactPreference.is_optout_push,
      is_optout_call: newContactPreference.is_optout_call,
    });
  }, [newContactPreference]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setChangedContactPreferences((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = (date) => {
    setChangedContactPreferences((prevState) => ({
      ...prevState,
      next_call_date: new Date(date),
    }));
  };

  const handleCancel = () => {
    setChangedContactPreferences({
      contact_preferenceable_id: newContactPreference.volunteerId,
      contact_preferenceable_type:
        newContactPreference.contact_preferenceable_type,
      next_call_date: newContactPreference?.next_call_date
        ? new Date(newContactPreference.next_call_date)
        : new Date(),
      is_optout_email: newContactPreference.is_optout_email,
      is_optout_sms: newContactPreference.is_optout_sms,
      is_optout_push: newContactPreference.is_optout_push,
      is_optout_call: newContactPreference.is_optout_call,
    });
    setOpenModal(false);
  };

  return (
    <>
      <CancelModalPopUp
        title="Confirmation"
        message="Unsaved changes will be lost, do you wish to proceed?"
        modalPopUp={closeModal}
        isNavigate={false}
        setModalPopUp={setCloseModal}
        methodsToCall={true}
        methods={handleCancel}
      />
      <section
        className={`${Mystyles.CreateMessageModal} popup full-section ${
          openModal ? 'active' : ''
        }`}
      >
        <div className={`${Mystyles.MessageModalInner} popup-inner`}>
          <div className={`${Mystyles.MessageModalContent} content`}>
            <form>
              <div className="formGroup">
                <h3 className="w-100">Contact Preferences</h3>
                {nectCallDate ? (
                  <div className="form-field">
                    <div className={`field`}>
                      <label
                        style={{
                          fontSize: '12px',
                          top: '25%',
                          color: '#555555',
                          zIndex: 1,
                        }}
                      >
                        Next Recruit Date
                      </label>
                      <DatePicker
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={120}
                        dateFormat="MM/dd/yyyy"
                        name="next_call_date"
                        className="custom-datepicker effectiveDate"
                        minDate={new Date()}
                        selected={changedContactPreferences.next_call_date}
                        onChange={(date) => {
                          if (date === null) {
                            handleDateChange(new Date());
                          } else {
                            handleDateChange(date);
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <div className="form-field checkbox w-100">
                  <label htmlFor="toggle-1" className="switch">
                    <input
                      type="checkbox"
                      id="toggle-1"
                      className="toggle-input"
                      name="is_optout_email"
                      checked={changedContactPreferences.is_optout_email}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-text">
                    {changedContactPreferences.is_optout_email
                      ? 'Opt Out '
                      : 'Opt In '}
                    Email
                  </span>
                </div>
                <div className="form-field checkbox w-100">
                  <label htmlFor="toggle-2" className="switch">
                    <input
                      type="checkbox"
                      id="toggle-2"
                      className="toggle-input"
                      name="is_optout_sms"
                      checked={changedContactPreferences.is_optout_sms}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-text">
                    {' '}
                    {changedContactPreferences.is_optout_sms
                      ? 'Opt Out '
                      : 'Opt In '}
                    SMS
                  </span>
                </div>
                <div className="form-field checkbox w-100">
                  <label htmlFor="toggle-3" className="switch">
                    <input
                      type="checkbox"
                      id="toggle-3"
                      className="toggle-input"
                      name="is_optout_push"
                      checked={changedContactPreferences.is_optout_push}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-text">
                    {' '}
                    {changedContactPreferences.is_optout_push
                      ? 'Opt Out '
                      : 'Opt In '}
                    Push
                  </span>
                </div>
                <div className="form-field checkbox w-100">
                  <label htmlFor="toggle-4" className="switch">
                    <input
                      type="checkbox"
                      id="toggle-4"
                      className="toggle-input"
                      name="is_optout_call"
                      checked={changedContactPreferences.is_optout_call}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="toggle-text">
                    {' '}
                    {changedContactPreferences.is_optout_call
                      ? 'Opt Out '
                      : 'Opt In '}
                    Call
                  </span>
                </div>
              </div>
              <div className="buttons">
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setCloseModal(true);
                    //handleModalButtons(null)
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => handleModalButtons(changedContactPreferences)}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPreferenceModal;
