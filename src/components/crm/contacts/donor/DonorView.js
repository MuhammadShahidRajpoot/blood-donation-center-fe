import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { fetchData } from '../../../../helpers/Api';
import ViewForm from '../../../common/ViewForm';
import styles from './donor.module.scss';
import { DashDateFormat } from '../../../../helpers/formatDate';
import CommunicationModal from '../../../common/CommunicationModal';
import ContactPreferenceModal from '../../../common/ContactPreferenceModal';
import { toast } from 'react-toastify';

import { DonorBreadCrumbsData } from './DonorBreadCrumbsData';
import ArchivePopUpModal from '../../../common/successModal';
import SuccessPopUpModal from '../../../common/successModal';
import moment from 'moment';
import DonorEnum from './donor.enum';
import GroupCodeModal from '../../../common/GroupCodeModal';
import CenterCodeModal from '../../../common/CenterCodeModal';
import AssertionCodeModal from '../../../common/AssertionCodeModal';
import { removeCountyWord } from '../../../../helpers/utils';
import CustomFieldsSection from '../../../operations-center/operations/drives/about/custom_fields';
import PolymorphicType from '../../../../enums/PolymorphicTypeEnum';

const DonorView = () => {
  const params = useParams();
  const context = useOutletContext();
  useEffect(() => {
    context.setBreadCrumbsState([
      ...DonorBreadCrumbsData,
      {
        label: 'View Donor',
        class: 'disable-label',
        link: `/crm/contacts/donor/${params?.donorId}/view`,
      },
      {
        label: 'About',
        class: 'active-label',
        link: `/crm/contacts/donor/${params?.donorId}/view`,
      },
    ]);
  }, []);
  const [loading, setLoading] = useState(true);
  const [openCommunication, setOpenCommunication] = useState(false);
  const [openContactPreference, setOpenContactPreference] = useState(false);
  const communicationable_type = PolymorphicType.CRM_CONTACTS_DONORS;
  const communicationable_id = params.donorId;
  const [messageType, setMessageType] = useState('sms');
  const [refreshData, setRefreshData] = useState(false);
  const [contactPreference, setContactPreference] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [newContactPreference, setNewContactPreference] = useState({
    contact_preferenceable_id: +params?.donorId,
    contact_preferenceable_type: PolymorphicType.CRM_CONTACTS_DONORS,
    next_call_date: null,
    is_optout_email: false,
    is_optout_sms: false,
    is_optout_push: false,
    is_optout_call: false,
  });

  const [showArchiveSuccessModal, setShowArchiveSuccessModal] = useState(false);
  const [modalPopUp, setModalPopUp] = useState(false);
  const [donorGroupCodes, setDonorGroupCodes] = useState([]);
  const [selectedGroupCodes, setSelectedGroupCodes] = useState([]);
  const [addGroupCodesModal, setAddGroupCodesModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groupCodeRows, setGroupCodeRows] = useState({});
  const [filteredGroupCodeRows, setFilteredGroupCodeRows] = useState({});
  const [deleteGroupCodeRow, setDeleteGroupCodeRow] = useState({});
  const [dateValues, setDateValues] = useState([]);
  /* Donor Center Codes */
  const [addCenterCodesModal, setAddCenterCodesModal] = useState(false);
  const [donorCenterCodes, setDonorCenterCodes] = useState([]);
  const [groupCenterRows, setGroupCenterRows] = useState({});
  const [filteredCenterCodeRows, setFilteredCenterRows] = useState({});
  const [centerDateValues, setCenterDateValues] = useState([]);
  const [selectedCenterCodes, setSelectedCenterCodes] = useState([]);

  /* Donor Assertion Codes */
  const [addAssertionCodesModal, setAddAssertionCodesModal] = useState(false);
  const [donorAssertionCodes, setDonorAssertionCodes] = useState([]);
  const [groupAssertionRows, setGroupAssertionRows] = useState({});
  const [filteredAssertionCodeRows, setFilteredAssertionCodeRows] = useState(
    {}
  );
  const [assertionDateValues, setAssertionDateValues] = useState([]);
  const [selectedAssertionCodes, setSelectedAssertionCodes] = useState([]);
  const [eligibilityFields, setEligibilityFields] = useState([]);
  const [aboutType, setAboutType] = useState(DonorEnum.GROUP_CODE);

  const [sortOrder, setSortOrder] = useState('ASC');
  const [sortBy, setSortBy] = useState('');

  // const getAllDonorCenterCodes = async () => {
  //   try {
  //     setIsLoading(true);
  //     const allDonorCenterCodesResponse = await fetchData(
  //       `/contacts/donors/center_codes/${
  //         params?.donorId
  //       }?sortName=${'name'}&sortOrder=${'ASC'}`,
  //       'GET'
  //     );
  //     allDonorCenterCodesResponse.data =
  //       allDonorCenterCodesResponse.data.sort(compareNames);
  //     setDonorCenterCodes([...allDonorCenterCodesResponse.data]);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const getAllDonorAssertionCodes = async () => {
  //   try {
  //     setIsLoading(true);
  //     const allDonorAssertionCodesResponse = await fetchData(
  //       `/contacts/donors/assertion_codes/${
  //         params?.donorId
  //       }?sortName=${'name'}&sortOrder=${'ASC'}`,
  //       'GET'
  //     );
  //     allDonorAssertionCodesResponse.data =
  //       allDonorAssertionCodesResponse.data.sort(compareNames);
  //     setDonorAssertionCodes([...allDonorAssertionCodesResponse.data]);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getAllFacilities = async () => {
    try {
      setIsLoading(true);
      const facilitiesResponse = await fetchData(
        `/system-configuration/facilities?fetchAll=true&status=true&isdonor=true`,
        'GET'
      );
      const donorCenterCodesResponse = await fetchData(
        `/contacts/donors/center_codes/${
          params?.donorId
        }?sortName=${'name'}&sortOrder=${'ASC'}`,
        'GET'
      );
      setDonorCenterCodes([...donorCenterCodesResponse.data]);

      const donorCenterCodesIds = donorCenterCodesResponse?.data?.map(
        (item) => item.center_code_id
      );
      let facilities = [];
      facilitiesResponse?.data?.forEach((facility) => {
        const found = donorCenterCodesIds.find((id) => id == facility.id);
        if (!found) {
          facilities.push(facility);
        }
      });
      let dates = [];
      facilities = facilities.sort(compareNames);
      facilities?.map((item) => {
        dates.push({
          id: item.id,
          date: new Date(),
        });
      });
      setGroupCenterRows({
        ...facilities,
      });
      setFilteredCenterRows({
        ...facilities,
      });
      setCenterDateValues(dates);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllAssertionCodes = async () => {
    try {
      setIsLoading(true);
      const assertionCodesResponse = await fetchData(`/assertion_codes`, 'GET');
      const donorAssertionCodesResponse = await fetchData(
        `/contacts/donors/assertion_codes/${
          params?.donorId
        }?sortName=${'name'}&sortOrder=${'ASC'}`,
        'GET'
      );
      donorAssertionCodesResponse.data.sort(compareNames);
      setDonorAssertionCodes([...donorAssertionCodesResponse.data]);
      const donorAssertionCodesIds = donorAssertionCodesResponse?.data?.map(
        (item) => item.assertion_code_id
      );
      let assertions = [];
      assertionCodesResponse.data.forEach((assertion) => {
        const found = donorAssertionCodesIds.find((id) => id == assertion.id);
        if (!found) {
          assertions.push(assertion);
        }
      });
      let dates = [];
      assertions = assertions.sort(compareNames);
      assertions?.map((item) => {
        dates.push({
          id: item.id,
          date: new Date(),
        });
      });
      setGroupAssertionRows({
        ...assertions,
      });
      setFilteredAssertionCodeRows({
        ...assertions,
      });
      setAssertionDateValues(dates);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // const getAllDonorGroupCodes = async () => {
  //   try {
  //     setIsLoading(true);
  //     const allDonorGroupCodesResponse = await fetchData(
  //       `/contacts/donors/group_codes/${
  //         params?.donorId
  //       }?sortName=${'name'}&sortOrder=${'ASC'}`,
  //       'GET'
  //     );
  //     setDonorGroupCodes([...allDonorGroupCodesResponse.data]);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  function compareNames(a, b) {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }
  const getAllAccounts = async () => {
    try {
      setIsLoading(true);
      const accountsResponse = await fetchData(
        `/accounts?fetchAll=true&status=true`,
        'GET'
      );

      const donorGroupCodesResponse = await fetchData(
        `/contacts/donors/group_codes/${
          params?.donorId
        }?sortName=${'name'}&sortOrder=${'ASC'}`,
        'GET'
      );
      setDonorGroupCodes([...donorGroupCodesResponse.data]);

      const donorGroupCodesIds = donorGroupCodesResponse?.data?.map(
        (item) => item.group_code_id
      );
      let accounts = [];
      accountsResponse.data.forEach((account) => {
        const found = donorGroupCodesIds.find((id) => id == account.id);
        if (!found) {
          accounts.push(account);
        }
      });
      accounts = accounts.sort(compareNames);
      setGroupCodeRows({
        ...accounts,
      });
      setFilteredGroupCodeRows({
        ...accounts,
      });
      let dates = [];
      accounts?.map((item) => {
        dates.push({
          id: item.id,
          date: new Date(),
        });
      });
      setDateValues(dates);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // getAllDonorCenterCodes();
    getAllFacilities();
    // getAllDonorAssertionCodes();
    getAllAssertionCodes();
  }, []);

  useEffect(() => {
    // getAllDonorGroupCodes();
    getAllAccounts();
  }, [sortBy, sortOrder]);

  const handleGroupCodeSearch = (query) => {
    setSearchText(query);
    setFilteredGroupCodeRows(
      Object.values(groupCodeRows).filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleAssertionCodeSearch = (query) => {
    setSearchText(query);
    setFilteredAssertionCodeRows(
      Object.values(groupAssertionRows).filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleCenterCodeSearch = (query) => {
    setSearchText(query);
    setFilteredCenterRows(
      Object.values(groupCenterRows).filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const getStatus = (date = moment()) => {
    if (!context?.donor?.external_id) {
      return 'Prospect';
    }
    const lastDonationMoment = moment(date);
    const currentDate = moment();
    const monthsDifference = currentDate.diff(lastDonationMoment, 'months');
    if (monthsDifference <= 18) {
      return 'Current';
    } else if (monthsDifference > 18 && monthsDifference <= 36) {
      return 'Lapsed';
    } else if (monthsDifference > 36 && monthsDifference <= 60) {
      return 'Super Lapsed';
    } else {
      return 'Missing';
    }
  };

  React.useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        // let donorCenterData = context?.donor;
        setLoading(true);
        // if (!donorCenterData) {
        //   console.log('donorCenterDataAA', donorCenterData, context);
        //   const donorResponse = await fetchData(
        //     `/contact-donors/${params?.donorId}`,
        //     'GET'
        //   );
        //   donorCenterData = donorResponse.data;
        // }
        const preferencesResponse = await fetchData(
          `/contact-preferences?preference_id=${+params?.donorId}&type_name=${
            PolymorphicType.CRM_CONTACTS_DONORS
          }`,
          'GET'
        );
        if (preferencesResponse?.data?.next_call_date !== null) {
          preferencesResponse.data.next_call_date = new Date(
            preferencesResponse.data.next_call_date
          );
        }
        setContactPreference(preferencesResponse.data);
        setNewContactPreference(preferencesResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (params?.donorId) {
      fetchDataAsync();
      fetchEligibilies();
    }
  }, [params?.donorId, refreshData]);

  const fetchEligibilies = async () => {
    const eligibilitiesResponse = await fetchData(
      `/contact-donors/eligibilities/details/${params?.donorId}`,
      'GET'
    );
    const eligibilities =
      eligibilitiesResponse?.data?.eligibilities?.map((item) => {
        return {
          label: item.name,
          value: eligibilityDate(item?.next_eligibility_date),
          approved: eligibilityCheck(item?.next_eligibility_date),
          show_check: false,
        };
      }) || [];
    setEligibilityFields(eligibilities);
  };

  const eligibilityDate = (date) => {
    if (date) {
      return moment(new Date()).startOf('day').format() >
        moment(date).startOf('day').format()
        ? moment(new Date()).format('MM-DD-YYYY')
        : moment(date).format('MM-DD-YYYY');
    } else {
      return 'N/A';
    }
  };
  const eligibilityCheck = (date) => {
    if (date) {
      return moment(new Date()).startOf('day').format() >=
        moment(date).startOf('day').format()
        ? true
        : false;
    } else {
      return true;
    }
  };

  const config = [
    {
      section: 'Donor Details',
      fields: [
        {
          label: 'Donor ID',
          value: `${
            context.donor?.id
              ? context.donor?.donor_number || 'Prospect'
              : 'N/A'
          }`,
        },
        { label: 'Donor Name', field: 'full_name' },
        { label: 'Nick Name', field: 'nick_name' },
        { label: 'Mailing Address', field: 'mailing_address' },
        { label: 'County', field: 'address.county' },
        { label: 'Date of Birth', field: 'birth_date' },
      ],
    },
    {
      section: 'Contact Info',
      hasAction: true,
      actionUrl: '#',
      actionText: 'Communicate',
      onClick: () => setOpenCommunication(true),
      fields: [
        { label: 'Work Phone', field: 'work_phone' },
        { label: 'Mobile Phone', field: 'mobile_phone' },
        { label: 'Other Phone', field: 'other_phone' },
        { label: 'Work Email', field: 'work_email' },
        { label: 'Home Email', field: 'home_email' },
        { label: 'Other Email', field: 'other_email' },
      ],
    },
    {
      section: 'Attributes',
      fields: [
        { label: 'Blood Group', field: 'blood_group_id.name' },
        { label: 'CMV', field: 'cmv' },
        { label: 'Gender', field: 'gender' },
        { label: 'Race', field: 'race_id.name' },
        {
          label: 'Lifetime Donations',
          field: 'lifetime_donations',
        },
        {
          label: 'Last Donation Date',
          value:
            context?.donor?.last_donation_date != null
              ? moment(context?.donor?.last_donation_date).format('MM-DD-YYYY')
              : 'N/A',
        },
        { label: 'Loyalty Points', field: 'loyalty_points' },
      ],
    },
    {
      section: 'Eligibility',
      fields: eligibilityFields,
    },
    {
      section: 'Contact Preferences',
      hasAction: true,
      actionUrl: '#',
      actionText: 'Update Preferences',
      onClick: () => setOpenContactPreference(true),
      fields: [
        { label: 'Next Recruit Date', field: 'next_call_date' },
        {
          label: 'Email',
          field: 'is_optout_email',
          value: contactPreference?.is_optout_email ? 'Opt Out' : 'OK',
          approved: !contactPreference?.is_optout_email,
          show_check: true,
        },
        {
          label: 'SMS',
          field: 'is_optout_sms',
          value: contactPreference?.is_optout_sms ? 'Opt Out' : 'OK',
          approved: !contactPreference?.is_optout_sms,
          show_check: true,
        },
        {
          label: 'Push',
          field: 'is_optout_push',
          value: contactPreference?.is_optout_push ? 'Opt Out' : 'OK',
          approved: !contactPreference?.is_optout_push,
          show_check: true,
        },
        {
          label: 'Call',
          field: 'is_optout_call',
          value: contactPreference?.is_optout_call ? 'Opt Out' : 'OK',
          approved: !contactPreference?.is_optout_call,
          show_check: true,
        },
      ],
    },
    {
      section: 'Insights',
      fields: [
        {
          label: 'Status',
          value: getStatus(context?.donor?.last_donation_date),
        },
        {
          label: 'Created',
          field: 'created_by',
        },
        {
          label: 'Modified',
          field: 'modified_by',
        },
      ],
    },
  ];
  const additionalItems = [
    {
      section: 'Tags',
      fields: [],
    },
  ];

  const additionalItemsWithoutIcon = [
    {
      section: 'Campaigns',
      fields: [
        {
          label: 'No campaigns found',
          field: '',
        },
      ],
    },
    {
      section: 'Segment',
      fields: [
        {
          label: 'No segment found',
          field: '',
        },
      ],
    },
    {
      section: 'Automations',
      fields: [
        {
          label: 'No automations found',
          field: '',
        },
      ],
    },
  ];

  const additionalItemsWithGroupData = [
    {
      section: 'Group Codes',
      hasAction: true,
      actionUrl: '#',
      actionText: 'Add Group Code',
      onClick: () => setAddGroupCodesModal(true),
      fields: [
        {
          code: 'Code',
          name: 'Name',
          sDate: 'Start Date',
          applied: 'Applied by',
          last: 'Last Donation',
          icon: false,
        },
        ...donorGroupCodes.map(
          ({ id, code, name, start_date, applied_by }) => ({
            id,
            code,
            name,
            sDate: moment(start_date).format('MM-DD-YYYY'),
            applied: applied_by,
            last: '12-29-2023',
            icon: true,
            type: DonorEnum.GROUP_CODE,
          })
        ),
      ],
    },
    {
      section: 'Center Codes',
      hasAction: true,
      actionUrl: '#',
      actionText: 'Add Center Code',
      onClick: () => setAddCenterCodesModal(true),
      fields: [
        {
          code: 'Code',
          name: 'Name',
          sDate: 'Start Date',
          applied: 'Applied by',
          last: 'Last Donation',
          icon: false,
        },
        ...donorCenterCodes.map(
          ({ id, code, name, start_date, applied_by }) => ({
            id,
            code,
            name,
            sDate: moment(start_date).format('MM-DD-YYYY'),
            applied: applied_by,
            last: '12-29-2023',
            icon: true,
            type: DonorEnum.CENTER_CODE,
          })
        ),
      ],
    },
    {
      section: 'Assertions',
      hasAction: true,
      actionUrl: '#',
      actionText: 'Add Assertion',
      onClick: () => setAddAssertionCodesModal(true),
      fields: [
        {
          code: 'Code',
          name: 'Name',
          sDate: 'Start Date',
          applied: 'Applied by',
          last: 'End Date',
          icon: false,
        },
        ...donorAssertionCodes.map(
          ({ id, code, name, start_date, applied_by }) => ({
            id,
            code,
            name,
            sDate: moment(start_date).format('MM-DD-YYYY'),
            applied: applied_by,
            last: '12-29-2023',
            icon: true,
            type: DonorEnum.ASSERTION_CODE,
          })
        ),
      ],
    },
  ];
  const submitGroupCodes = async () => {
    let donorGroupCodes = [];
    if (selectedGroupCodes?.length > 0) {
      selectedGroupCodes.forEach((item) => {
        let groupCode = Object.values(filteredGroupCodeRows).find(
          (item1) => +item1.id == +item
        );
        const dateFound = dateValues.find((dateItem) => +dateItem.id == +item);
        if (dateFound && groupCode) {
          donorGroupCodes.push({
            donor_id: parseInt(params?.donorId),
            group_code_id: parseInt(groupCode.id),
            start_date: dateFound.date,
          });
        }
      });
      createDonorGroupCodes(donorGroupCodes);
    } else {
      toast.error('You have to select one.');
    }
    setAddGroupCodesModal(false);
  };

  const submitAssertionCodes = async () => {
    let donorAssertionCodes = [];
    if (selectedAssertionCodes?.length > 0) {
      selectedAssertionCodes.forEach((item) => {
        let assertionCode = Object.values(filteredAssertionCodeRows).find(
          (item1) => +item1.id == +item
        );
        const dateFound = assertionDateValues.find(
          (dateItem) => +dateItem.id == +item
        );
        if (dateFound && assertionCode) {
          donorAssertionCodes.push({
            donor_id: parseInt(params?.donorId),
            assertion_code_id: parseInt(assertionCode.id),
            start_date: dateFound.date,
          });
        }
      });
      createDonorAssertionCodes(donorAssertionCodes);
    } else {
      toast.error('You have to select one.');
    }
    setAddAssertionCodesModal(false);
  };

  const submitCenterCodes = async () => {
    let centerCodes = [];
    if (selectedCenterCodes?.length > 0) {
      selectedCenterCodes.forEach((item) => {
        let centerCode = Object.values(filteredCenterCodeRows).find(
          (item1) => +item1.id == +item
        );
        const dateFound = centerDateValues.find(
          (dateItem) => +dateItem.id == +item
        );
        if (dateFound && centerCode) {
          centerCodes.push({
            donor_id: parseInt(params?.donorId),
            center_code_id: parseInt(centerCode.id),
            start_date: dateFound.date,
          });
        }
      });
      createDonorCenterCodes(centerCodes);
    } else {
      toast.error('You have to select one.');
    }
    setAddCenterCodesModal(false);
  };

  const createDonorGroupCodes = async (donorGroupCodes) => {
    try {
      setIsLoading(true);
      setSelectedGroupCodes([]);
      setSearchText('');
      const createGroupCodesPromise = donorGroupCodes.map((item) => {
        return fetchData('/contacts/donors/group_codes', 'POST', item);
      });
      setSuccessMessage('Group Code added.');
      setShowSuccessMessage(true);
      await Promise.all(createGroupCodesPromise).then(async (res) => {
        // await getAllDonorGroupCodes();
        await getAllAccounts();
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const createDonorAssertionCodes = async (donorAssertionCodes) => {
    try {
      setIsLoading(true);
      setSelectedAssertionCodes([]);
      setSearchText('');
      const createAssertionCodesPromise = donorAssertionCodes.map((item) => {
        return fetchData('/contacts/donors/assertion_codes', 'POST', item);
      });
      setSuccessMessage('Assertion added.');
      setShowSuccessMessage(true);
      await Promise.all(createAssertionCodesPromise).then(async (res) => {
        // await getAllDonorAssertionCodes();
        await getAllAssertionCodes();
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDonorCenterCodes = async (centerCodes) => {
    try {
      setIsLoading(true);
      setSelectedCenterCodes([]);
      setSearchText('');
      const createCenterCodesPromise = centerCodes.map((item) => {
        return fetchData('/contacts/donors/center_codes', 'POST', item);
      });
      setSuccessMessage('Center Code added.');
      setShowSuccessMessage(true);
      await Promise.all(createCenterCodesPromise).then(async (res) => {
        // await getAllDonorCenterCodes();
        await getAllFacilities();
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const GroupCodesTableHeaders = [
    {
      name: 'BECS_code',
      label: 'Group Code',
      width: '25%',
      sortable: false,
    },
    {
      name: 'name',
      label: 'Name',
      width: '25%',
      sortable: false,
    },
    {
      name: 'start_date',
      label: 'Start Date',
      width: '20%',
      type: 'date-picker',
      sortable: false,
    },
    {
      name: '',
      label: '',
      width: '20%',
      sortable: false,
    },
  ];

  const CenterCodesTableHeaders = [
    {
      name: 'code',
      label: 'Center Code',
      width: '25%',
      sortable: false,
    },
    {
      name: 'name',
      label: 'Name',
      width: '25%',
      sortable: false,
    },
    {
      name: 'start_date',
      label: 'Start Date',
      width: '20%',
      type: 'date-picker',
      sortable: false,
    },
    {
      name: '',
      label: '',
      width: '20%',
      sortable: false,
    },
  ];

  const AssertionCodesTableHeaders = [
    {
      name: 'bbcs_uuid',
      label: 'Assertion Code',
      width: '25%',
      sortable: false,
    },
    {
      name: 'name',
      label: 'Name',
      width: '25%',
      sortable: false,
    },
    {
      name: 'start_date',
      label: 'Start Date',
      width: '20%',
      type: 'date-picker',
      sortable: false,
    },
    {
      name: '',
      label: '',
      width: '20%',
      sortable: false,
    },
  ];

  const handleDeleteGroupCode = async () => {
    try {
      if (deleteGroupCodeRow.type === DonorEnum.GROUP_CODE) {
        setAboutType(DonorEnum.GROUP_CODE);
        await fetchData(
          `/contacts/donors/group_codes/${deleteGroupCodeRow.id}`,
          'PATCH'
        ).then(async (res) => {
          // await getAllDonorGroupCodes();
          await getAllAccounts();
        });
      } else if (deleteGroupCodeRow.type === DonorEnum.CENTER_CODE) {
        setAboutType(DonorEnum.CENTER_CODE);
        await fetchData(
          `/contacts/donors/center_codes/${deleteGroupCodeRow.id}`,
          'PATCH'
        ).then(async (res) => {
          // await getAllDonorCenterCodes();
          await getAllFacilities();
        });
      } else if (deleteGroupCodeRow.type === DonorEnum.ASSERTION_CODE) {
        setAboutType(DonorEnum.ASSERTION_CODE);
        await fetchData(
          `/contacts/donors/assertion_codes/${deleteGroupCodeRow.id}`,
          'PATCH'
        ).then(async (res) => {
          // await getAllDonorAssertionCodes();
          await getAllAssertionCodes();
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setModalPopUp(false);
      setShowArchiveSuccessModal(true);
    }
  };

  const transformData = (data) => {
    let full_name = data.first_name + ' ' + data.last_name;
    let mailing_address = data?.address;
    let birth_date = moment(data.birth_date).utc().format('MM-DD-YYYY');
    let work_phone = '';
    let mobile_phone = '';
    let other_phone = '';
    let work_email = '';
    let home_email = '';
    let other_email = '';
    let primary_email_field = '';
    let primary_phone_field = '';

    if (data.contact && Array.isArray(data.contact)) {
      data.contact = data.contact.map((contact) => {
        if ([1, 2, 3].includes(contact.contact_type)) {
          contact.data = contact.data.replace(
            /(\d{3})(\d{3})(\d{4})/,
            '($1) $2-$3'
          );
        }
        return contact;
      });
      // Find the contact with contact_type 1 and assign its data to work_phone
      const contactWithType1 = data.contact.find(
        (contact) => contact.contact_type === 1
      );
      if (contactWithType1) {
        work_phone = contactWithType1.data;
        if (contactWithType1.is_primary) {
          primary_phone_field = 'work_phone';
        }
      }
      const contactWithType2 = data.contact.find(
        (contact) => contact.contact_type === 2
      );
      if (contactWithType2) {
        mobile_phone = contactWithType2.data;
        if (contactWithType2.is_primary) {
          primary_phone_field = 'mobile_phone';
        }
      }
      const contactWithType3 = data.contact.find(
        (contact) => contact.contact_type === 3
      );
      if (contactWithType3) {
        other_phone = contactWithType3.data;
        if (contactWithType3.is_primary) {
          primary_phone_field = 'other_phone';
        }
      }
      const contactWithType4 = data.contact.find(
        (contact) => contact.contact_type === 4
      );
      if (contactWithType4) {
        work_email = contactWithType4.data;
        if (contactWithType4.is_primary) {
          primary_email_field = 'work_email';
        }
      }
      const contactWithType5 = data.contact.find(
        (contact) => contact.contact_type === 5
      );
      if (contactWithType5) {
        home_email = contactWithType5.data;
        if (contactWithType5.is_primary) {
          primary_email_field = 'home_email';
        }
      }
      const contactWithType6 = data.contact.find(
        (contact) => contact.contact_type === 6
      );
      if (contactWithType6) {
        other_email = contactWithType6.data;
        if (contactWithType6.is_primary) {
          primary_email_field = 'other_email';
        }
      }
    }
    const is_optout_email =
      contactPreference?.is_optout_email === true
        ? 'Yes'
        : contactPreference?.is_optout_email === false
        ? 'No'
        : 'No';
    const is_optout_sms =
      contactPreference?.is_optout_sms === true
        ? 'Yes'
        : contactPreference?.is_optout_sms === false
        ? 'No'
        : 'No';
    const is_optout_call =
      contactPreference?.is_optout_call === true
        ? 'Yes'
        : contactPreference?.is_optout_call === false
        ? 'No'
        : 'No';
    const is_optout_push =
      contactPreference?.is_optout_push === true
        ? 'Yes'
        : contactPreference?.is_optout_push === false
        ? 'No'
        : 'No';
    const next_call_date = !contactPreference?.next_call_date
      ? DashDateFormat(new Date())
      : DashDateFormat(contactPreference?.next_call_date, 2);
    return {
      ...data,
      full_name: full_name,
      birth_date: birth_date,
      work_phone: work_phone,
      mobile_phone: mobile_phone,
      other_phone: other_phone,
      work_email: work_email,
      address: {
        ...data.address,
        county: removeCountyWord(data.address?.county),
      },
      home_email: home_email,
      other_email: other_email,
      mailing_address: mailing_address,
      primary_phone_field: primary_phone_field,
      primary_email_field: primary_email_field,
      next_call_date: next_call_date,
      is_optout_email: is_optout_email,
      is_optout_sms: is_optout_sms,
      is_optout_call: is_optout_call,
      is_optout_push: is_optout_push,
    };
  };
  const handleCommunicationButtons = (confirmed) => {
    setOpenCommunication(confirmed);
    setOpenContactPreference(confirmed);
  };

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setSortBy(columnName);
      setSortOrder('ASC');
    }
  };

  const handleContactPreferencesButtons = async (data) => {
    if (data !== null) {
      const preferencesResponse = await fetchData(
        `/contact-preferences/${contactPreference?.id ?? ''}`,
        contactPreference?.id ? 'PUT' : 'POST',
        { ...data, contact_preferenceable_id: +params?.donorId }
      );
      if (
        preferencesResponse.status === 'success' ||
        preferencesResponse.status_code === 200
      ) {
        if (preferencesResponse?.data?.next_call_date !== null) {
          preferencesResponse.data.next_call_date = new Date(
            preferencesResponse.data.next_call_date
          );
        }
        setContactPreference(preferencesResponse?.data);
        setNewContactPreference(preferencesResponse?.data);
        setOpenContactPreference(false);
        setSuccessMessage("Updated donor's contact preferences.");
        setShowSuccessMessage(true);
      } else {
        toast.error(preferencesResponse.response);
      }
    } else {
      setNewContactPreference({ ...contactPreference });
      setOpenContactPreference(false);
    }
  };

  return (
    <>
      <SuccessPopUpModal
        title="Success!"
        message={successMessage}
        modalPopUp={showSuccessMessage}
        showActionBtns={true}
        setModalPopUp={setShowSuccessMessage}
      />

      <div className={styles.accountViewMain}>
        <div className="mainContent">
          {!loading && context?.donor && (
            <ViewForm
              className="contact-view"
              data={transformData(context?.donor)}
              config={config}
              additional={additionalItems}
              additionalWithoutIcon={additionalItemsWithoutIcon}
              additionalWithGroupData={additionalItemsWithGroupData}
              onDeleteCode={(item) => {
                setDeleteGroupCodeRow(item);
                setModalPopUp(true);
              }}
              customfieldsComponent={
                <CustomFieldsSection
                  datableType={PolymorphicType.CRM_CONTACTS_DONORS}
                  id={params?.donorId}
                  noMargin={true}
                />
              }
            />
          )}
          <CommunicationModal
            openModal={openCommunication}
            setOpenModal={setOpenCommunication}
            defaultMessageType={messageType}
            setDefaultMessageType={setMessageType}
            communicationable_id={communicationable_id}
            communicationable_type={communicationable_type}
            handleModalButtons={handleCommunicationButtons}
            refreshData={refreshData} // Pass the state as a prop
            setRefreshData={setRefreshData}
          />
          <ContactPreferenceModal
            openModal={openContactPreference}
            setOpenModal={setOpenContactPreference}
            contactPreference={contactPreference}
            newContactPreference={newContactPreference}
            handleModalButtons={handleContactPreferencesButtons}
            setNewContactPreference={setNewContactPreference}
          />

          <GroupCodeModal
            isLoading={isLoading}
            filteredGroupCodeRows={filteredGroupCodeRows}
            GroupCodesTableHeaders={GroupCodesTableHeaders}
            addGroupCodesModal={addGroupCodesModal}
            handleGroupCodeSearch={handleGroupCodeSearch}
            setSearchText={setSearchText}
            setSortBy={setSortBy}
            handleSort={handleSort}
            setSortOrder={setSortOrder}
            setSelectedGroupCodes={setSelectedGroupCodes}
            setAddGroupCodesModal={setAddGroupCodesModal}
            submitGroupCodes={submitGroupCodes}
            selectedGroupCodes={selectedGroupCodes}
            dateValues={dateValues}
            setDateValues={setDateValues}
            searchText={searchText}
          />

          <CenterCodeModal
            isLoading={isLoading}
            filteredCenterCodeRows={filteredCenterCodeRows}
            CenterCodesTableHeaders={CenterCodesTableHeaders}
            addCenterCodesModal={addCenterCodesModal}
            handleCenterCodeSearch={handleCenterCodeSearch}
            setSearchText={setSearchText}
            setSelectedCenterCodes={setSelectedCenterCodes}
            setAddCenterCodesModal={setAddCenterCodesModal}
            submitCenterCodes={submitCenterCodes}
            selectedCenterCodes={selectedCenterCodes}
            centerDateValues={centerDateValues}
            setCenterDateValues={setCenterDateValues}
            searchText={searchText}
            setSortBy={setSortBy}
            handleSort={handleSort}
            setSortOrder={setSortOrder}
          />

          <AssertionCodeModal
            isLoading={isLoading}
            filteredCenterCodeRows={filteredAssertionCodeRows}
            CenterCodesTableHeaders={AssertionCodesTableHeaders}
            addCenterCodesModal={addAssertionCodesModal}
            handleCenterCodeSearch={handleAssertionCodeSearch}
            setSearchText={setSearchText}
            setSelectedCenterCodes={setSelectedAssertionCodes}
            setAddCenterCodesModal={setAddAssertionCodesModal}
            submitCenterCodes={submitAssertionCodes}
            selectedCenterCodes={selectedAssertionCodes}
            centerDateValues={assertionDateValues}
            setCenterDateValues={setAssertionDateValues}
            searchText={searchText}
            setSortBy={setSortBy}
            handleSort={handleSort}
            setSortOrder={setSortOrder}
          />

          <ArchivePopUpModal
            title={'Confirmation'}
            message={'Are you sure you want to Archive?'}
            modalPopUp={modalPopUp}
            setModalPopUp={setModalPopUp}
            showActionBtns={false}
            isArchived={modalPopUp}
            archived={handleDeleteGroupCode}
            isNavigate={false}
          />

          {showArchiveSuccessModal === true ? (
            <SuccessPopUpModal
              title="Success!"
              message={`${aboutType} is Archived.`}
              modalPopUp={showArchiveSuccessModal}
              isNavigate={false}
              setModalPopUp={setShowArchiveSuccessModal}
              showActionBtns={true}
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DonorView;
