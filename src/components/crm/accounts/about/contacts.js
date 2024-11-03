import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TableList from '../../../common/tableListing';
import CancelModalPopUp from '../../../common/cancelModal';
import CloseOutImage from '../../../../assets/images/CloseoutImage.png';
import moment from 'moment';
import { makeAuthorizedApiRequest } from '../../../../helpers/Api';
import { formatPhoneNumber } from '../../../../helpers/utils';
import { toast } from 'react-toastify';
import ReactDatePicker from 'react-datepicker';
import Closeout1 from '../../../../assets/images/closeout1.png';
import Closeout2 from '../../../../assets/images/closeout2.png';
import SuccessPopUpModal from '../../../common/successModal';
import accountStyles from '../accounts.module.scss';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';
import InfiniteScroll from 'react-infinite-scroll-component';
import SvgComponent from '../../../common/SvgComponent';
const TableHeaders = [
  {
    name: 'name',
    label: 'Name',
    width: '17%',
    sortable: false,
  },
  {
    name: 'role_name',
    type: 'select',
    label: 'Role',
    width: '25%',
    sortable: false,
  },
  {
    name: 'email',
    label: 'Email',
    width: '19%',
    type: 'noWrap',
    sortable: false,
  },
  {
    name: 'phone',
    label: 'Phone',
    width: '17%',
    type: 'noWrap',
    sortable: false,
  },
  {
    name: 'city',
    label: 'City',
    width: '15%',
    sortable: false,
  },
  {
    name: '',
    label: '',
    width: '20%',
    sortable: false,
  },
];

function ContactsSection() {
  const { account_id } = useParams();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [searchText, setSearchText] = useState('');
  const [addContactsModal, setAddContactsModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sortedContactRows, setsortedContactRows] = useState({});
  const [contactRoles, setContactRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [closeModal, setCloseModal] = useState(false);
  const [searched, setSearched] = useState(false);
  const [accountContactsList, setAccountContactsList] = useState([]);
  const [deletedContacts, setDeletedContacts] = useState([]);
  const [contactTabs, setContactTabs] = useState('Current');
  const [closeoutDateInput, setCloseoutDateInput] = useState(null);
  const [closeOutDateModal, setCloseOutDateModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const bearerToken = localStorage.getItem('token');
  const [allRoles, setAllRoles] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    if (Object.values(selectedRoles)?.length > 0) {
      if (
        Object.values(selectedRoles).some((item) => item?.isPrimaryChairPerson)
      ) {
        const dupArr = [...contactRoles];
        const findIndex = dupArr.findIndex(
          (item) => item?.isPrimaryChairPerson
        );
        if (findIndex !== -1) {
          dupArr.splice(findIndex, 1);
        }
        setContactRoles(dupArr);
      } else if (contactRoles.length !== allRoles.length) {
        setContactRoles(allRoles);
      }
    }
  }, [selectedRoles]);

  useEffect(() => {
    if (searchText?.length > 1) {
      setSearched(true);
      fetchAllVolunteerContacts(1);
    }
    if (searchText.length <= 1 && searched) {
      setSearched(false);
      fetchAllVolunteerContacts(1);
    }
  }, [searchText]);

  const fetchData = (page) => {
    setPageNumber(page);
    fetchAllVolunteerContacts(page);
  };

  useEffect(() => {
    fetchAllVolunteerContacts(1);
  }, []);

  const fetchAllVolunteerContacts = async (page) => {
    try {
      const isSearch = searchText && searchText?.length > 1 ? true : false;
      setIsLoading(true);

      const response = await makeAuthorizedApiRequest(
        'GET',
        `${BASE_URL}/contact-volunteer?page=${+page}&limit=3&status=true${
          isSearch ? '&name=' + searchText : `&onlyCurrentUser=true`
        }&sortBy=last_name&sortOrder=ASC`
      );
      const data = await response.json();
      if (data.status !== 500) {
        if (data?.data) {
          const contactData = data.data;
          let outputDataArray = [];
          for (const inputData of contactData) {
            const outputData = {
              ...inputData,
              id: inputData?.volunteer_id,
              name: inputData?.name,
              email: inputData?.primary_email,
              phone: inputData?.primary_phone,
              city: inputData?.address_city,
            };

            outputDataArray.push(outputData);
          }
          if (sortedContactRows?.length) {
            setsortedContactRows((prev) => [...prev, ...outputDataArray]);
          } else {
            setsortedContactRows(outputDataArray);
          }
        } else {
          setLoader(false);
        }
      }
    } catch (error) {
      toast.error(`Failed to fetch table data ${error}`, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getContactRoles();
  }, []);

  useEffect(() => {
    getAccountContacts(account_id);
  }, [account_id, contactTabs]);
  const getAccountContacts = async (id) => {
    setAccountContactsList([]);
    const result = await makeAuthorizedApiRequest(
      'GET',
      `${BASE_URL}/accounts/${id}/account-contacts?is_current=${
        contactTabs === 'Current'
      }`
    );
    const { data } = await result.json();
    if (data?.length > 0) {
      setAccountContactsList(data);
    }
  };
  const getContactRoles = async () => {
    const deviceTypeUrl = `${BASE_URL}/contact-roles/volunteer`;
    const result = await fetch(`${deviceTypeUrl}`, {
      headers: {
        method: 'GET',
        authorization: `Bearer ${bearerToken}`,
      },
    });
    const data = await result.json();
    const mappedData = data?.data.map((item) => {
      return {
        value: item?.id,
        label: item?.name,
        isPrimaryChairPerson: item?.is_primary_chairperson,
      };
    });

    setContactRoles(mappedData);
    setAllRoles(mappedData);
  };
  useEffect(() => {
    if (accountContactsList.length > 0) {
      setSelectedContacts(accountContactsList.map((item) => item.record.id));
      const dupObj = {};
      accountContactsList.forEach((item) => {
        dupObj[item.record.id] = {
          value: item.role_id.id,
          label: item.role_id.name,
          isPrimaryChairPerson: item.role_id.is_primary_chairperson,
        };
      });
      setSelectedRoles(dupObj);
    }
  }, [accountContactsList?.length, closeModal, addContactsModal === true]);

  useEffect(() => {
    if (selectedContacts.length > 0) {
      const dupArr = [];
      accountContactsList.forEach((item) => {
        if (!selectedContacts.includes(item.record?.id)) {
          dupArr.push(item.id);
        }
      });
      setDeletedContacts(dupArr);
    } else if (
      accountContactsList.length > 0 &&
      selectedContacts.length === 0
    ) {
      setDeletedContacts(accountContactsList.map((item) => item.id));
    }
  }, [selectedContacts.length]);

  const submitContacts = async () => {
    setButtonDisabled(true);
    if (selectedContacts.length > 0) {
      let condition = [];
      selectedContacts.forEach((sc) => {
        Object.keys(selectedRoles).forEach((sr) => {
          if (sc == sr) {
            condition.push(sc);
          }
        });
      });
      if (
        selectedContacts.length <= Object.keys(selectedRoles).length &&
        condition.length === selectedContacts.length
      ) {
        if (
          !selectedContacts.some(
            (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
          )
        ) {
          setButtonDisabled(false);
          return toast.error(
            'At least one contact with Primary chairperson role is required.'
          );
        }
        if (
          selectedContacts.filter(
            (roleCompare) => selectedRoles?.[roleCompare]?.isPrimaryChairPerson
          ).length > 1
        ) {
          setButtonDisabled(false);
          return toast.error(
            'There can only be one contact with Primary Chairperson role.'
          );
        }
        const dupArr = [...selectedContacts];
        const dupArrDelete = [...deletedContacts];
        if (selectedContacts.length > 0) {
          accountContactsList.forEach((item) => {
            if (
              selectedContacts.includes(item.record?.id) &&
              item?.role_id?.id === selectedRoles[item.record?.id]?.value
            ) {
              const indexToRemove = dupArr.findIndex(
                (record) => record === item.record?.id
              );
              dupArr.splice(indexToRemove, 1);
            } else {
              if (!dupArrDelete.includes(item.id)) {
                dupArrDelete.push(item.id);
              }
            }
          });
        }

        const body = {
          deleteContacts: dupArrDelete,
          contacts: dupArr.map((item) => {
            return {
              contactable_type: PolymorphicType.CRM_ACCOUNTS,
              contactable_id: account_id,
              record: item,
              role_id: selectedRoles[item]?.value,
            };
          }),
        };
        try {
          const response = await makeAuthorizedApiRequest(
            'POST',
            `${BASE_URL}/accounts/${account_id}/account-contacts`,
            JSON.stringify(body)
          );
          let data = await response.json();
          if (data?.status === 'success') {
            getAccountContacts(account_id);
            setAddContactsModal(false);
            setShowModel(true);
          } else if (data?.status === 'currently_in_use') {
            toast.error(
              `One or more contact/s can't be removed they are in use for drive.`,
              {
                autoClose: 3000,
              }
            );
          } else if (data?.status_code === 400) {
            const showMessage = Array.isArray(data?.message)
              ? data?.message[0]
              : data?.message;

            toast.error(`${showMessage}`, { autoClose: 3000 });
          } else {
            const showMessage = Array.isArray(data?.message)
              ? data?.message[0]
              : data?.message;
            toast.error(`${showMessage}`, { autoClose: 3000 });
          }
        } catch (error) {
          toast.error(`${error?.message}`, { autoClose: 3000 });
        }
      } else {
        toast.error('Roles for selected contacts are required.');
      }
    } else {
      toast.error('At least one contact is required.');
    }
    setButtonDisabled(false);
    setDeletedContacts([]);
  };
  const handleSubmitCloseoutDate = async () => {
    try {
      const body = {
        closeout_date: moment(closeoutDateInput).utc(true).format(),
      };
      const response = await makeAuthorizedApiRequest(
        'PUT',
        `${BASE_URL}/accounts/account-contacts/${selectedContactId}`,
        JSON.stringify(body)
      );
      let data = await response.json();
      if (data?.status === 'success') {
        toast.success(data?.response);
        getAccountContacts(account_id);
        setCloseOutDateModal(false);
      } else if (data?.status_code === 400) {
        const showMessage = Array.isArray(data?.message)
          ? data?.message[0]
          : data?.message;

        toast.error(`${showMessage}`, { autoClose: 3000 });
      } else {
        const showMessage = Array.isArray(data?.message)
          ? data?.message[0]
          : data?.message;
        toast.error(`${showMessage}`, { autoClose: 3000 });
      }
    } catch (error) {
      toast.error(`${error?.message}`, { autoClose: 3000 });
    }
  };
  return (
    <>
      <table className={`viewTables contactViewTable width-500`}>
        <thead>
          <tr>
            <th colSpan="5">
              <div className="d-flex align-items-center justify-between w-100">
                <span>Contacts</span>
                {contactTabs === 'Current' && (
                  <button
                    onClick={() => setAddContactsModal(true)}
                    className="btn btn-link btn-md bg-transparent"
                  >
                    Add Contacts
                  </button>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody
          className={`overflow-y-auto ${
            accountContactsList.length > 5 ? ' d-block' : ''
          }`}
          style={{ height: accountContactsList.length > 6 ? '418px' : 'auto' }}
        >
          <tr className="tabs">
            <td colSpan={contactTabs === 'Current' ? 5 : 4} className="pb-0">
              <div className="filterBar p-0">
                <div className="tabs border-0 mb-0">
                  <ul>
                    <li>
                      <Link
                        onClick={() => setContactTabs('Current')}
                        className={
                          contactTabs === 'Current' ? 'active' : 'fw-medium'
                        }
                      >
                        Current
                      </Link>
                    </li>
                    <li>
                      <Link
                        onClick={() => setContactTabs('Past')}
                        className={
                          contactTabs === 'Past' ? 'active' : 'fw-medium'
                        }
                      >
                        Past
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
          {accountContactsList.length > 0 ? (
            <tr className="headings">
              <td style={{ width: '35%' }}>Role</td>
              <td style={{ width: '20%' }}>Name</td>
              {contactTabs === 'Current' ? (
                <>
                  <td style={{ width: '20%' }}>Phone</td>
                  <td style={{ width: '20%' }}>Closeout</td>
                  <td></td>
                </>
              ) : (
                <>
                  <td style={{ width: '22%' }}>Start Date</td>
                  <td style={{ width: '23%' }}>End Date</td>
                </>
              )}
            </tr>
          ) : (
            <tr className="headings">
              <td className=" text-center">No contacts found</td>
            </tr>
          )}
          {accountContactsList?.length > 0 &&
            accountContactsList?.map((item) => {
              return (
                <tr key={item.id} className="data">
                  <td style={{ width: '35%' }}>{item?.role_id?.name || '-'}</td>
                  <td
                    style={{
                      width: '20%',
                    }}
                  >
                    <span
                      className={'externalLink'}
                      style={{ cursor: 'pointer' }}
                    >
                      <Link
                        to={`/crm/contacts/volunteers/${item.record.id}/view`}
                        target="_blank"
                      >
                        {item?.record?.first_name}{' '}
                        {item?.record?.last_name || ''}
                      </Link>
                    </span>
                  </td>
                  {contactTabs === 'Current' ? (
                    <>
                      <td
                        style={{
                          width: '20%',
                        }}
                      >
                        {formatPhoneNumber(
                          item?.record?.contact?.[0]?.data?.includes('@')
                            ? item?.record?.contact?.[1]?.data
                            : item?.record?.contact?.[0]?.data || '-'
                        )}
                      </td>
                      <td style={{ width: '20%' }}>
                        {item?.closeout_date
                          ? moment(item?.closeout_date).format('MM-DD-YYYY')
                          : ''}
                      </td>
                      <td style={{ width: '5%' }}>
                        {item.closeout_date ? (
                          <img
                            src={Closeout2}
                            style={{ width: '17px' }}
                            alt="closeout"
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedContactId(item?.id);
                              setCloseOutDateModal(true);
                              setCloseoutDateInput(
                                new Date(item.closeout_date)
                              );
                            }}
                          />
                        ) : (
                          <img
                            src={Closeout1}
                            style={{ width: '17px' }}
                            alt="closeout"
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedContactId(item?.id);
                              setCloseOutDateModal(true);
                              setCloseoutDateInput(null);
                            }}
                          />
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ width: '22%' }}>
                        {item?.created_at
                          ? moment(item?.created_at).format('MM-DD-YYYY')
                          : ''}
                      </td>
                      <td style={{ width: '23%' }}>
                        {item?.closeout_date
                          ? moment(item?.closeout_date).format('MM-DD-YYYY')
                          : ''}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>

      <section
        className={`popup contactPopup full-section ${
          addContactsModal ? 'active' : ''
        }`}
      >
        <div className={`popup-inner ${accountStyles.popupStyle}`}>
          <div className="content">
            <div className="d-flex align-items-center justify-between">
              <h3>Add Contacts</h3>
              <div className="search">
                <div className="formItem">
                  <input
                    type="text"
                    name="contact_name"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div
              className="overflow-y-auto mt-4"
              style={{ height: '50vh' }}
              id="scrollableDiv"
            >
              <TableList
                isLoading={isLoading}
                data={sortedContactRows}
                headers={TableHeaders}
                checkboxValues={selectedContacts}
                handleCheckboxValue={(row) => row.id}
                handleCheckbox={setSelectedContacts}
                selectOptions={contactRoles}
                selectValues={selectedRoles}
                setSelectValues={setSelectedRoles}
              />
              <InfiniteScroll
                dataLength={Object.values(sortedContactRows).length} //This is important field to render the next data
                next={() => {
                  fetchData(pageNumber + 1);
                }}
                hasMore={true}
                loader={
                  loader ? (
                    <div className="text-center">
                      <SvgComponent name={'Down'} />
                    </div>
                  ) : null
                }
                scrollableTarget="scrollableDiv"
              ></InfiniteScroll>
            </div>

            <div className="buttons d-flex align-items-center justify-content-between mt-4">
              <button
                className="btn btn-md btn-primary"
                onClick={fetchAllVolunteerContacts}
              >
                Refresh
              </button>
              <div>
                <button
                  className="btn btn-link"
                  onClick={() => {
                    if (
                      selectedContacts.length > 0 ||
                      Object.keys(selectedRoles).length > 0
                    ) {
                      setCloseModal(true);
                    } else {
                      setAddContactsModal(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-md btn-primary"
                  onClick={submitContacts}
                  disabled={buttonDisabled}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className={`popup full-section ${closeOutDateModal ? 'active' : ''}`}
      >
        <div className="popup-inner" style={{ maxWidth: '500px' }}>
          <div className="icon">
            <img
              style={{ width: '20%' }}
              src={CloseOutImage}
              alt="CancelIcon"
              className="bg-white"
            />
          </div>
          <div className="content">
            <h3>Close Out Contact</h3>
            <p>
              Contacts will move to the Past tab when the scheduled close out
              date has passed.
            </p>
            <ReactDatePicker
              minDate={new Date()}
              dateFormat="MM-dd-yyyy"
              className={`custom-datepicker mt-4 w-100`}
              placeholderText="Date"
              selected={closeoutDateInput}
              onChange={(date) => {
                setCloseoutDateInput(date);
              }}
            />
            <div className="buttons">
              <button
                className="btn btn-secondary"
                style={{ width: '47%' }}
                onClick={() => setCloseOutDateModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ width: '47%' }}
                className="btn btn-primary"
                onClick={(e) => {
                  if (closeoutDateInput === null) {
                    toast.error('Date cannot be empty!');
                  } else {
                    handleSubmitCloseoutDate();
                  }
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </section>
      {closeModal === true ? (
        <CancelModalPopUp
          title="Confirmation"
          message="Unsaved changes will be lost, do you wish to proceed?"
          modalPopUp={closeModal}
          isNavigate={false}
          setModalPopUp={setCloseModal}
          redirectPath={'/crm/accounts'}
          methodsToCall={true}
          methods={() => {
            setAddContactsModal(false);
          }}
        />
      ) : null}
      {showModel === true ? (
        <SuccessPopUpModal
          title="Success!"
          message="Account contacts added."
          modalPopUp={showModel}
          isNavigate={true}
          setModalPopUp={setShowModel}
          showActionBtns={true}
          onConfirm={() => setShowModel(false)}
        />
      ) : null}
    </>
  );
}

export default ContactsSection;
